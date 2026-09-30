#!/usr/bin/env python3
"""JARVIS judge primitive — typed decisions, never prose. (two-speed.md, armed 30 Sep 2026)

ask_judge(name, state) -> {choice, probabilities, confidence, judge, decision_id}
Primary: Jev (typesafe/jev-1.13) via OpenRouter.  Fallback: any OpenAI-compatible
model named in JUDGE_FALLBACK_MODEL.  Mock: JUDGE_MOCK=1 (deterministic, for tests).

Rules enforced here, matching doctrine:
- A judge SCORES; it never acts. Nothing in this module touches the outside world
  beyond the one model API call.
- Confidence lanes: >= registry threshold -> proceed; 0.5..threshold -> review;
  < 0.5 -> blocked. publish/send/pay is NEVER a judge question.
- Every call appends a decision row to decisions.jsonl; record_outcome() closes it;
  calibrate() reports predicted-vs-actual per judge so overconfident judges surface.
- Key from OPENROUTER_API_KEY env only (.env on desktop) — never hardcoded (secrets-001).

First live call: verify the response shape against Jev's current API docs; the parser
below expects OpenAI-style chat completions returning JSON in message content and
tolerates a plain choice string. Adjust once against reality, then add eval cases.
"""
import json, os, sys, time, uuid, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REGISTRY = os.path.join(HERE, "registry.json")
LEDGER = os.environ.get("JUDGE_LEDGER", os.path.join(HERE, "decisions.jsonl"))
API = "https://openrouter.ai/api/v1/chat/completions"
JEV = os.environ.get("JUDGE_MODEL", "typesafe/jev-1.13")


def _registry(name):
    with open(REGISTRY, encoding="utf-8") as f:
        reg = json.load(f)["judges"]
    if name not in reg:
        raise KeyError("unknown judge '%s' — add it to registry.json first" % name)
    return reg[name]


def _call_model(model, question, options, state, timeout=20):
    key = os.environ.get("OPENROUTER_API_KEY")
    if not key:
        raise RuntimeError("OPENROUTER_API_KEY not set — put it in .env, never in code or docs")
    prompt = (
        "You are a decision function. Answer with JSON only: "
        '{"choice": <one of the options>, "probabilities": {<option>: <0..1>, ...}}\n'
        "QUESTION: %s\nOPTIONS: %s\nSTATE:\n%s" % (question, options, json.dumps(state, ensure_ascii=False))
    )
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0,
    }).encode()
    req = urllib.request.Request(API, data=body, headers={
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/BiannoGomes",
        "X-Title": "Jarvis judge",
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        out = json.load(r)
    content = out["choices"][0]["message"]["content"].strip()
    try:
        data = json.loads(content[content.index("{"): content.rindex("}") + 1])
    except Exception:
        data = {"choice": content.split()[0] if content else "UNKNOWN", "probabilities": {}}
    return data


def ask_judge(name, state):
    j = _registry(name)
    options = j["options"]
    dec = {
        "decision_id": "dec_" + uuid.uuid4().hex[:12],
        "ts": int(time.time() * 1000),
        "judge": name,
        "question": j["question"],
        "options": options,
        "state": state,
        "threshold": j.get("threshold", 0.9),
        "result": None,  # closed later by record_outcome()
    }
    t0 = time.time()
    if os.environ.get("JUDGE_MOCK") == "1":
        choice = options[0]
        data = {"choice": choice, "probabilities": {o: (0.9 if o == choice else 0.1 / max(1, len(options) - 1)) for o in options}}
        dec["model"] = "mock"
    else:
        try:
            data = _call_model(JEV, j["question"], options, state)
            dec["model"] = JEV
        except Exception as e:
            fb = os.environ.get("JUDGE_FALLBACK_MODEL")
            if not fb:
                raise
            data = _call_model(fb, j["question"], options, state)
            dec["model"] = fb
            dec["fallback_reason"] = str(e)[:200]
    dec["latency_ms"] = int((time.time() - t0) * 1000)
    choice = data.get("choice", "UNKNOWN")
    probs = data.get("probabilities") or {}
    conf = float(probs.get(choice, 0.0))
    if choice not in options:
        choice, conf = "UNKNOWN", 0.0
    dec.update(choice=choice, probabilities=probs, confidence=conf,
               lane=("proceed" if conf >= dec["threshold"] else "review" if conf >= 0.5 else "blocked"))
    with open(LEDGER, "a", encoding="utf-8") as f:
        f.write(json.dumps(dec, ensure_ascii=False) + "\n")
    return dec


def record_outcome(decision_id, outcome):
    """Close the loop: outcome is the observed truth (e.g. 'BOOKED', 'NO_REPLY')."""
    with open(LEDGER, "a", encoding="utf-8") as f:
        f.write(json.dumps({"outcome_for": decision_id, "ts": int(time.time() * 1000),
                            "result": outcome}) + "\n")


def calibrate():
    """Predicted confidence vs actual correctness, per judge. Overconfidence surfaces here."""
    rows, outcomes = [], {}
    if not os.path.exists(LEDGER):
        return {}
    with open(LEDGER, encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            if "outcome_for" in r:
                outcomes[r["outcome_for"]] = r["result"]
            else:
                rows.append(r)
    stats = {}
    for r in rows:
        if r["decision_id"] not in outcomes:
            continue
        s = stats.setdefault(r["judge"], {"n": 0, "conf_sum": 0.0, "correct": 0})
        s["n"] += 1
        s["conf_sum"] += r["confidence"]
        # convention: outcome recorded as the option that turned out true
        if outcomes[r["decision_id"]] == r["choice"]:
            s["correct"] += 1
    for j, s in stats.items():
        s["predicted"] = round(s["conf_sum"] / s["n"], 3) if s["n"] else None
        s["actual"] = round(s["correct"] / s["n"], 3) if s["n"] else None
        s["verdict"] = ("OVERCONFIDENT" if s["n"] >= 20 and s["actual"] is not None
                        and s["predicted"] - s["actual"] > 0.1 else "ok" if s["n"] >= 20 else "insufficient_data")
    return stats


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "test"
    if cmd == "test":
        os.environ["JUDGE_MOCK"] = "1"
        d = ask_judge("lead_readiness", {"visits": 3, "replies": 1, "asked_for": "implementation details"})
        print(json.dumps(d, indent=1))
    elif cmd == "live":
        d = ask_judge(sys.argv[2], json.loads(sys.argv[3]))
        print(json.dumps(d, indent=1))
    elif cmd == "outcome":
        record_outcome(sys.argv[2], sys.argv[3]); print("recorded")
    elif cmd == "calibrate":
        print(json.dumps(calibrate(), indent=1))
