// Explore: the Discovery Galaxy as a list, and the quest player. The rules come
// from @dawnward/core, the same engine the server runs; without an account the
// state is kept on this device, with an account it goes through the API.
// Progress is discoveries only (owner decision): no XP, levels or scores.
import {
  MISSIONS,
  SYSTEMS,
  answerStep,
  beginAttempt,
  completeAttempt,
  describeDiscovery,
  discoveriesFrom,
  missionById,
  plannedAction,
  validateAnswer,
} from "../../packages/core/src/expeditions/index.ts";

const KEY = "dw-expeditions-v1";

/** The same calls, kept on this device. Every write is read back before it counts. */
export function localStore(device) {
  const empty = () => ({ attempts: {}, experiments: [], events: [], discoveries: [], gameLayer: true });
  let s = Object.assign(empty(), device.read(KEY, {}));
  const id = (p) => `${p}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  const keep = () => device.write(KEY, s);
  const progress = (events) => {
    const fresh = [];
    for (const e of events) if (!s.events.some((x) => x.kind === e.kind && x.ref === e.ref)) s.events.push({ ...e, at: new Date().toISOString() });
    for (const d of discoveriesFrom(s.events)) if (!s.discoveries.some((x) => x.key === d.key)) { const full = { ...d, discoveredAt: new Date().toISOString() }; s.discoveries.push(full); fresh.push({ ...full, ...describeDiscovery(full) }); }
    return fresh;
  };
  const tx = (fn) => { const before = JSON.stringify(s); const out = fn(); if (!keep()) { s = JSON.parse(before); return { error: "I couldn't keep that on this device. Your words are still here." }; } return out; };
  return {
    local: true,
    async load() {
      return { attempts: Object.values(s.attempts), experiments: s.experiments, discoveries: s.discoveries.map((d) => ({ ...d, ...describeDiscovery(d) })), gameLayer: s.gameLayer };
    },
    async begin(missionId) {
      const m = missionById(missionId);
      const open = s.attempts[missionId];
      if (open && (open.status === "in_progress" || open.status === "paused")) return tx(() => { open.status = "in_progress"; return { ...open }; });
      return tx(() => { const a = beginAttempt(m, id("att")); s.attempts[missionId] = a; return { ...a }; });
    },
    async answer(attempt, stepIndex, answer) {
      const m = missionById(attempt.missionId);
      const r = answerStep(m, s.attempts[attempt.missionId] ?? attempt, stepIndex, answer);
      if ("error" in r) return r;
      return tx(() => { s.attempts[attempt.missionId] = r.attempt; return { attempt: { ...r.attempt } }; });
    },
    async complete(attempt) {
      const m = missionById(attempt.missionId);
      const current = s.attempts[attempt.missionId] ?? attempt;
      if (current.status === "completed") return { attempt: current, discoveries: [], experiment: null };
      const r = completeAttempt(m, current);
      if ("error" in r) return r;
      return tx(() => {
        s.attempts[attempt.missionId] = r.attempt;
        const events = [...r.events];
        const plan = plannedAction(m, r.attempt);
        let experiment = null;
        if (plan) {
          experiment = { id: id("exp"), attempt_id: r.attempt.id, world: m.world, action: plan.action, when_text: plan.when, status: "planned", outcome: null, created_at: new Date().toISOString() };
          s.experiments.unshift(experiment);
          events.push({ kind: "experiment_planned", ref: `experiment:${m.world}:${experiment.id}:planned` });
        }
        return { attempt: r.attempt, discoveries: progress(events), experiment };
      });
    },
    async exit(attempt) { return tx(() => { const a = s.attempts[attempt.missionId]; if (a && a.status === "in_progress") a.status = "paused"; return a; }); },
    async review(experimentId, outcome, text) {
      const ex = s.experiments.find((x) => x.id === experimentId);
      if (!ex) return { error: "I can't find that action." };
      if (ex.status === "reviewed") return { reviewed: true, discoveries: [] };
      return tx(() => {
        Object.assign(ex, { status: "reviewed", outcome, review: text, reviewed_at: new Date().toISOString() });
        return { reviewed: true, discoveries: progress([{ kind: "experiment_reviewed", ref: `experiment:${ex.world}:${ex.id}:reviewed` }]) };
      });
    },
    async setGameLayer(on) { return tx(() => { s.gameLayer = on; return { gameLayer: on }; }); },
    noteReflection(recordId) { return tx(() => ({ discoveries: progress([{ kind: "reflection_saved", ref: `record:${recordId}` }]) })); },
    wipe() { s = empty(); return device.remove(KEY); },
    snapshot() { return JSON.parse(JSON.stringify(s)); },
  };
}

/** The same calls, through the Dawnward API. */
export function remoteStore(call) {
  const post = (url, body) => call(url, { method: "POST", body: JSON.stringify(body ?? {}) });
  const wrap = async (p) => { try { return await p; } catch (e) { return { error: e.status === 403 ? "Dawnward needs your consent first. Open the app to give it." : "I couldn't save that just now. Your words are still here; try again.", status: e.status }; } };
  return {
    local: false,
    async load() {
      const r = await call("/expeditions");
      return { attempts: r.attempts, experiments: r.experiments, discoveries: r.discoveries, gameLayer: r.gameLayer };
    },
    begin: (missionId) => wrap(post("/attempts", { missionId })),
    answer: async (attempt, stepIndex, answer) => { const r = await wrap(post(`/attempts/${attempt.id}/answer`, { stepIndex, answer })); return r.error || r.crisis ? r : { attempt: r }; },
    complete: (attempt) => wrap(post(`/attempts/${attempt.id}/complete`)),
    exit: (attempt) => wrap(post(`/attempts/${attempt.id}/exit`)),
    review: (experimentId, outcome, text) => wrap(post(`/experiments/${experimentId}/review`, { outcome, text })),
    setGameLayer: (on) => wrap(call("/preferences/game-layer", { method: "PUT", body: JSON.stringify({ on }) })),
    noteReflection() { return { discoveries: [] }; },
    wipe() { return true; },
  };
}

/**
 * The Explore view and quest player. `h` holds the page's helpers:
 * { $, el, svg, ICON, META, announce, quiet, longDate, sound, distress, crisisText, showPlace, onDiscoveries, goHomeWith }
 */
export function createExplore(store, h) {
  const { $, el, svg, ICON, META } = h;
  let data = { attempts: [], experiments: [], discoveries: [], gameLayer: true };
  const body = () => $("x-body");
  const attemptFor = (missionId) => data.attempts.find((a) => a.missionId === missionId && a.status !== "abandoned");
  const DRAFT = (a, step) => `dw-qdraft-${a.id}-${step}`;

  async function refresh() { try { data = await store.load(); } catch { /* keep what we had */ } return data; }

  function head(title, sub, back) {
    return [
      back ? el("button", { class: "text-btn back", onclick: back }, el("span", { html: svg(ICON.back, 16) }), " Explore") : null,
      el("h2", { class: "s-title", id: "x-title", tabindex: "-1" }, title),
      sub ? el("p", { class: "quiet" }, sub) : null,
    ].filter(Boolean);
  }

  // ----- the Discovery Galaxy, as a list that works without any 3D -----
  async function open() {
    h.showPlace("explore");
    await refresh();
    draw();
    $("x-title")?.focus();
  }
  function draw() {
    const kids = [...head("Explore", "The Discovery Galaxy: short practices for real life. Reflect stays one tap away.")];
    const going = data.attempts.filter((a) => a.status === "in_progress" || a.status === "paused");
    if (going.length) {
      kids.push(el("section", { class: "group", "aria-labelledby": "x-cont" }, el("h3", { id: "x-cont" }, "Continue"),
        ...going.map((a) => { const m = missionById(a.missionId); return el("button", { class: "row", onclick: () => play(m.id) },
          el("span", { class: "ricon", html: svg(ICON[m.world], 22) }),
          el("span", { class: "rtext" }, el("span", { class: "rtitle" }, `${m.title}, ${m.part}`), el("span", { class: "rsub" }, `Step ${Math.min(a.step + 1, m.steps.length)} of ${m.steps.length}`)),
          el("span", { class: "rgo", html: svg(ICON.arrow, 16) })); })));
    }
    const waiting = data.experiments.filter((x) => x.status === "planned");
    if (waiting.length) {
      kids.push(el("section", { class: "group", "aria-labelledby": "x-wait" }, el("h3", { id: "x-wait" }, "Waiting to hear how it went"),
        ...waiting.map((x) => el("button", { class: "row", onclick: () => review(x.id) },
          el("span", { class: "ricon", html: svg(ICON[x.world] ?? ICON.soul, 22) }),
          el("span", { class: "rtext" }, el("span", { class: "rtitle" }, x.action), el("span", { class: "rsub" }, `You planned: ${x.when_text}`)),
          el("span", { class: "rgo", html: svg(ICON.arrow, 16) })))));
    }
    for (const sys of SYSTEMS) {
      const ms = sys.missionIds.map(missionById);
      kids.push(el("section", { class: "group system", "aria-labelledby": `x-${sys.id}` },
        el("p", { class: "kicker" }, `${META[sys.world].name} · solar system`),
        el("h3", { id: `x-${sys.id}`, class: "sys-title" }, sys.title),
        el("p", { class: "quiet" }, sys.objective),
        el("ul", { class: "missions" }, ms.map((m) => {
          const a = attemptFor(m.id), done = a?.status === "completed" || data.attempts.some((x) => x.missionId === m.id && x.status === "completed");
          const state = done ? "Done" : a ? "In progress" : `${m.minutes} min`;
          return el("li", {}, el("button", { class: `mission${done ? " done" : ""}`, onclick: () => play(m.id), "aria-label": `${m.title}, ${m.part}. ${m.objective} ${state}.` },
            el("span", { class: "mstate", "aria-hidden": "true" }, done ? "✦" : ""),
            el("span", { class: "rtext" }, el("span", { class: "rtitle" }, m.part), el("span", { class: "rsub" }, m.objective)),
            el("span", { class: "mmeta" }, state)));
        }))));
    }
    kids.push(el("p", { class: "quiet" }, "More solar systems will arrive in each world, one at a time and carefully written."));
    body().replaceChildren(...kids);
  }

  // ----- the quest player: one step at a time, saved before it moves on -----
  let current = null; // { mission, attempt }
  async function play(missionId) {
    const m = missionById(missionId);
    h.showPlace("explore");
    body().replaceChildren(el("p", { class: "quiet", role: "status" }, "Opening…"));
    const r = await store.begin(m.id);
    if (r.error) { body().replaceChildren(...head(m.title, null, back), el("p", { class: "error", role: "alert" }, r.error)); return; }
    current = { mission: m, attempt: r };
    await refresh();
    show(Math.min(r.step, m.steps.length - 1));
  }
  async function back() { if (current && current.attempt.status === "in_progress") { const r = await store.exit(current.attempt); if (r && !r.error) h.announce("Your place is kept."); } current = null; h.quiet(false); await refresh(); draw(); $("x-title")?.focus(); }

  function frame(m, i, ...kids) {
    body().replaceChildren(
      el("div", { class: "qhead" },
        el("button", { class: "text-btn back", onclick: back }, el("span", { html: svg(ICON.back, 16) }), " Explore"),
        el("p", { class: "kicker" }, `${META[m.world].name} · ${m.title} · ${m.part}`),
        el("p", { class: "qpos", role: "img", "aria-label": `Step ${i + 1} of ${m.steps.length}` }, ...m.steps.map((_, k) => el("span", { class: k < i ? "on" : k === i ? "here" : "" })))),
      ...kids.filter(Boolean));
    body().querySelector(".s-title")?.focus();
    $("explore").scrollTop = 0;
  }

  function show(i) {
    const { mission: m, attempt: a } = current;
    const step = m.steps[i];
    const prev = a.answers[step.id];
    const err = el("p", { class: "error", role: "alert" });
    const next = async (answer) => {
      err.textContent = "";
      if (answer && ("text" in answer || "action" in answer) && h.distress(Object.values(answer).join(" ")) && store.local) { crisis(h.crisisText); return; }
      const problem = answer ? validateAnswer(step, answer) : null;
      if (problem) { err.textContent = problem; return; }
      const r = await store.answer(a, i, answer);
      if (r.crisis) { crisis(r.reply); return; }
      if (r.error) { err.textContent = r.error; return; }
      try { localStorage.removeItem(DRAFT(a, step.id)); } catch {}
      current.attempt = r.attempt;
      if (i + 1 < m.steps.length) show(i + 1); else finish();
    };
    const title = el("h2", { class: "s-title", tabindex: "-1" }, step.title);
    if (step.type === "intro") {
      h.quiet(false);
      frame(m, i, title, el("p", { class: "lead" }, step.body),
        el("p", { class: "quiet" }, `What you'll practise: ${m.objective} About ${m.minutes} minutes. You can leave at any step and keep your place.`),
        m.safetyNote ? el("p", { class: "quiet safety" }, m.safetyNote) : null,
        err, el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => next({ ack: true }) }, "Begin")));
      return;
    }
    if (step.type === "choice") {
      h.quiet(false);
      const list = el("div", { class: "choices", role: "group", "aria-label": step.title });
      const explain = el("div", { class: "explain", "aria-live": "polite" });
      let chosen = prev && "choice" in prev ? prev.choice : null;
      const go = el("button", { class: "primary", disabled: !chosen, onclick: () => next({ choice: chosen }) }, "Continue");
      const pick = (o) => {
        chosen = o.id; go.disabled = false;
        list.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === o.id)));
        explain.replaceChildren(el("p", { class: "outcome" }, o.outcome), el("p", { class: "quiet" }, o.why), el("p", { class: "quiet small" }, "You can tap the others to see what tends to happen with them too."));
      };
      for (const o of step.options) list.append(el("button", { class: "choice", "data-id": o.id, "aria-pressed": "false", onclick: () => pick(o) }, o.text));
      frame(m, i, title, step.body ? el("p", { class: "lead" }, step.body) : null, list, explain, err, el("div", { class: "actions" }, go));
      if (chosen) pick(step.options.find((o) => o.id === chosen));
      return;
    }
    if (step.type === "rehearse" || step.type === "reflect") {
      const ta = el("textarea", { id: "q-words", rows: "5", maxlength: "2000", "aria-labelledby": "q-prompt" });
      let draft = ""; try { draft = localStorage.getItem(DRAFT(a, step.id)) ?? ""; } catch {}
      ta.value = prev && "text" in prev ? prev.text : draft;
      ta.addEventListener("input", () => { try { localStorage.setItem(DRAFT(a, step.id), ta.value); } catch {} });
      h.quiet(true);
      frame(m, i, title, el("p", { class: "lead", id: "q-prompt" }, step.prompt), ta,
        step.examples?.length ? el("p", { class: "quiet" }, `For example: “${step.examples[0]}”`) : null,
        el("p", { class: "quiet" }, store.local ? "Kept on this device, in your words." : "Kept in your Dawnward, in your words."),
        err, el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => next({ text: ta.value }) }, "Save and continue")));
      ta.focus({ preventScroll: true });
      return;
    }
    if (step.type === "plan") {
      const action = el("input", { id: "q-action", class: "field", maxlength: "200", autocomplete: "off" });
      const when = el("input", { id: "q-when", class: "field", maxlength: "60", autocomplete: "off" });
      if (prev && "action" in prev) { action.value = prev.action; when.value = prev.when; }
      h.quiet(true);
      frame(m, i, title, el("p", { class: "lead" }, step.prompt),
        el("label", { for: "q-action", class: "label" }, "One small action"), action,
        el("label", { for: "q-when", class: "label" }, "Roughly when"), when,
        step.examples?.length ? el("p", { class: "quiet" }, `For example: “${step.examples[0]}”`) : null,
        el("p", { class: "quiet" }, "Small, safe and in your control. Whatever happens when you try it, coming back to say how it went counts."),
        err, el("div", { class: "actions" },
          el("button", { class: "primary", onclick: () => next({ action: action.value, when: when.value }) }, "Save and continue"),
          step.required ? null : el("button", { class: "ghost", onclick: () => next({ skip: true }) }, "Not this time")));
      action.focus({ preventScroll: true });
      return;
    }
    if (step.type === "close") { h.quiet(false); finish(); }
  }

  async function finish() {
    const { mission: m } = current;
    const closeStep = m.steps[m.steps.length - 1];
    frame(m, m.steps.length - 1, el("h2", { class: "s-title", tabindex: "-1" }, closeStep.title), el("p", { class: "quiet", role: "status" }, "Keeping it…"));
    const r = await store.complete(current.attempt);
    if (r.error) {
      frame(m, m.steps.length - 1, el("h2", { class: "s-title", tabindex: "-1" }, closeStep.title), el("p", { class: "error", role: "alert" }, r.error),
        el("div", { class: "actions" }, el("button", { class: "primary", onclick: finish }, "Try again")));
      return;
    }
    current.attempt = r.attempt;
    await refresh();
    h.onDiscoveries(data, r.discoveries ?? []);
    const plan = r.experiment;
    const found = (r.discoveries ?? [])[0];
    frame(m, m.steps.length - 1,
      el("h2", { class: "s-title", tabindex: "-1" }, closeStep.title),
      el("p", { class: "lead" }, closeStep.body),
      el("div", { class: "card" }, el("p", { class: "kicker" }, "You practised"), el("p", {}, m.objective)),
      plan ? el("div", { class: "card" }, el("p", { class: "kicker" }, "Your real action"), el("p", { class: "statement" }, plan.action), el("p", { class: "why" }, plan.when_text)) : null,
      found && data.gameLayer ? el("div", { class: "card found" }, el("p", { class: "kicker" }, "Discovered"), el("p", { class: "statement" }, found.title), el("p", { class: "why" }, found.why)) : null,
      el("div", { class: "actions" },
        el("button", { class: "primary", onclick: () => { current = null; h.goHomeWith(found?.key ?? null); } }, "Return to Earth"),
        el("button", { class: "ghost", onclick: () => { current = null; draw(); $("x-title")?.focus(); } }, "Back to Explore")));
    h.announce(found ? `Done. ${found.title} appeared.` : "Done.");
  }

  function crisis(text) {
    h.quiet(false);
    if (current?.attempt?.status === "in_progress") store.exit(current.attempt);
    body().replaceChildren(el("h2", { class: "s-title", tabindex: "-1" }, "You matter more than any practice"),
      ...String(text).split("\n").map((l) => el("p", { class: "crisis" }, l)),
      el("p", { class: "quiet" }, "This practice is paused. Nothing more is needed from you right now."),
      el("div", { class: "actions" }, el("button", { class: "ghost", onclick: () => { current = null; draw(); } }, "Back to Explore")));
    body().querySelector(".s-title").focus();
  }

  // ----- coming back: how did the real action go? Any outcome counts -----
  function review(experimentId) {
    const x = data.experiments.find((e) => e.id === experimentId);
    if (!x) return;
    const outcomes = [["did", "I did it"], ["partly", "Partly"], ["didnt", "I didn't, this time"]];
    let outcome = null;
    const group = el("div", { class: "seg", role: "radiogroup", "aria-label": "How did it go?" },
      outcomes.map(([v, label]) => el("button", { role: "radio", "aria-checked": "false", onclick: (e) => { outcome = v; group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b === e.currentTarget))); } }, label)));
    const ta = el("textarea", { id: "x-review", rows: "5", maxlength: "2000", "aria-labelledby": "x-review-q" });
    const err = el("p", { class: "error", role: "alert" });
    h.showPlace("explore");
    body().replaceChildren(...head("How did it go?", null, () => { draw(); $("x-title")?.focus(); }),
      el("div", { class: "card" }, el("p", { class: "kicker" }, "You planned"), el("p", { class: "statement" }, x.action), el("p", { class: "why" }, x.when_text)),
      group,
      el("p", { class: "lead", id: "x-review-q" }, "What happened? What surprised you?"), ta,
      el("p", { class: "quiet" }, "Whatever happened, saying how it went is what counts."),
      err,
      el("div", { class: "actions" }, el("button", { class: "primary", onclick: async () => {
        if (!outcome) { err.textContent = "Choose how it went."; return; }
        if (!ta.value.trim()) { err.textContent = "Write a few words first."; ta.focus(); return; }
        if (store.local && h.distress(ta.value)) { crisis(h.crisisText); return; }
        const r = await store.review(x.id, outcome, ta.value.trim());
        if (r.crisis) { crisis(r.reply); return; }
        if (r.error) { err.textContent = r.error; return; }
        await refresh();
        h.onDiscoveries(data, r.discoveries ?? []);
        const found = (r.discoveries ?? [])[0];
        body().replaceChildren(...head("Thank you for coming back", null, () => { draw(); $("x-title")?.focus(); }),
          el("p", { class: "lead" }, outcome === "didnt" ? "Not doing it is information too. Next time, notice what got in the way." : "You tried something real. That's the part that changes things."),
          found && data.gameLayer ? el("div", { class: "card found" }, el("p", { class: "kicker" }, "Discovered"), el("p", { class: "statement" }, found.title), el("p", { class: "why" }, found.why)) : null,
          el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => h.goHomeWith(found?.key ?? null) }, "Return to Earth"), el("button", { class: "ghost", onclick: () => { draw(); $("x-title")?.focus(); } }, "Back to Explore")));
        $("x-title")?.focus();
      } }, "Save")));
    $("x-title")?.focus();
  }

  return {
    store, open, refresh, play, review,
    get data() { return data; },
    get missions() { return MISSIONS; },
    textSummary() {
      return SYSTEMS.map((sys) => ({ sys, missions: sys.missionIds.map((id) => ({ m: missionById(id), done: data.attempts.some((a) => a.missionId === id && a.status === "completed") })) }));
    },
  };
}
