#!/usr/bin/env python3
"""transcribe: give Claude "ears". Word-level transcript of a take, with the exact start and end
of every word, via faster-whisper (the Creator Stack method). Stdlib + faster-whisper only.

usage:
  python transcribe.py take.mp4 [--names names.txt] [--model small.en] [--device auto] [--language en]
  python transcribe.py --from-words take.words.json      # rebuild .srt/.transcript.md after hand fixes

writes, next to the input (same basename):
  <take>.words.json       every word: text, start, end, probability, filler flag  (what the edit tools read)
  <take>.srt              segment captions (for YouTube / LinkedIn uploads)
  <take>.transcript.md    readable, timestamped, for Bianno and for the story register

names.txt: one entry per line. A plain name ("Bianno") is fed to Whisper as a spelling hint. A mapping
("Bianca -> Bianno") is also applied to the output, and every change is logged in words.json.
Nothing else in the transcript is ever changed: it stays verbatim (fillers are flagged, not removed).
"""
import argparse, json, os, re, sys, time

FILLERS = {"um", "uh", "erm", "er", "ah", "uhm", "hmm", "mm"}


def fmt_srt(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def load_names(path):
    hints, fixes = [], []
    if not path:
        return hints, fixes
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.split("#", 1)[0].strip()
            if not line:
                continue
            if "->" in line:
                wrong, right = [x.strip() for x in line.split("->", 1)]
                fixes.append((wrong, right)); hints.append(right)
            else:
                hints.append(line)
    return list(dict.fromkeys(hints)), fixes


def apply_fixes(words, fixes):
    """Case-insensitive whole-token replacement, logged. Multi-word wrongs ("Bian No") match across words."""
    log = []
    for wrong, right in fixes:
        parts = wrong.lower().split()
        n = len(parts)
        i = 0
        while i <= len(words) - n:
            window = [re.sub(r"[^\w']", "", words[i + k]["w"]).lower() for k in range(n)]
            if window == parts:
                trail = re.sub(r"^[\w']+", "", words[i + n - 1]["w"].strip())  # keep trailing punctuation
                before = " ".join(words[i + k]["w"] for k in range(n))
                words[i]["w"] = right + trail
                words[i]["e"] = words[i + n - 1]["e"]
                del words[i + 1:i + n]
                log.append({"at": words[i]["s"], "from": before, "to": words[i]["w"]})
            i += 1
    return log


def write_outputs(base, doc):
    words, segs = doc["words"], doc["segments"]
    with open(base + ".words.json", "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
    with open(base + ".srt", "w", encoding="utf-8") as f:
        for n, sg in enumerate(segs, 1):
            f.write(f"{n}\n{fmt_srt(sg['s'])} --> {fmt_srt(sg['e'])}\n{sg['text'].strip()}\n\n")
    lines = [f"# Transcript · {os.path.basename(doc['source'])}", "",
             f"{doc.get('model', '?')} · {doc.get('language', '?')} · {doc.get('duration', 0):.1f} s · {len(words)} words", ""]
    if doc.get("corrections"):
        lines += ["**Name corrections applied:** " + "; ".join(f"{c['from']} → {c['to']} ({c['at']:.2f}s)" for c in doc["corrections"]), ""]
    low = [w for w in words if w.get("p", 1) < 0.5]
    if low:
        lines += ["**Check these (low confidence):** " + ", ".join(f"\"{w['w'].strip()}\" {w['s']:.2f}s" for w in low[:40]), ""]
    fill = [w for w in words if w.get("filler")]
    if fill:
        lines += [f"**Fillers flagged:** {len(fill)} (kept verbatim; the rough cut can drop them)", ""]
    lines += ["| Time | Words |", "|---|---|"]
    for sg in segs:
        lines.append(f"| {sg['s']:6.2f}–{sg['e']:6.2f} | {sg['text'].strip()} |")
    with open(base + ".transcript.md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def segments_from_words(words, gap=0.7):
    segs, cur = [], []
    for w in words:
        if cur and (w["s"] - cur[-1]["e"] > gap or re.search(r"[.!?]$", cur[-1]["w"].strip())):
            segs.append(cur); cur = []
        cur.append(w)
    if cur:
        segs.append(cur)
    return [{"s": c[0]["s"], "e": c[-1]["e"], "text": " ".join(x["w"].strip() for x in c)} for c in segs]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("media", nargs="?")
    ap.add_argument("--names")
    ap.add_argument("--model", default="small.en", help="tiny.en | base.en | small.en | medium.en | large-v3 (or a local model folder)")
    ap.add_argument("--device", default="auto", help="auto | cpu | cuda")
    ap.add_argument("--compute-type", default="auto", help="auto = int8 on CPU, float16 on an NVIDIA GPU")
    ap.add_argument("--language", default="en")
    ap.add_argument("--download-root", help="where models are cached (pre-download here for offline use)")
    ap.add_argument("--from-words", help="rebuild .srt and .transcript.md from an edited .words.json")
    a = ap.parse_args()

    if a.from_words:
        with open(a.from_words, encoding="utf-8") as f:
            doc = json.load(f)
        doc["segments"] = segments_from_words(doc["words"])
        write_outputs(re.sub(r"\.words\.json$", "", a.from_words), doc)
        print(f"rebuilt from {a.from_words}: {len(doc['words'])} words, {len(doc['segments'])} segments")
        return
    if not a.media or not os.path.exists(a.media):
        ap.error("give a media file (video or audio)")

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("faster-whisper is not installed:  python -m pip install faster-whisper")

    hints, fixes = load_names(a.names)
    compute = a.compute_type
    if compute == "auto":
        try:
            import ctranslate2
            gpu = ctranslate2.get_cuda_device_count() > 0
        except Exception:
            gpu = False
        compute = "float16" if a.device == "cuda" or (a.device == "auto" and gpu) else "int8"
    t0 = time.time()
    try:
        model = WhisperModel(a.model, device=a.device, compute_type=compute, download_root=a.download_root)
    except Exception as e:  # most often: first run offline, or a blocked model host
        sys.exit(f"Could not load Whisper model '{a.model}': {e}\n"
                 "The model downloads from huggingface.co on first use. If that's blocked, download it once on a "
                 "connected machine and pass --model <folder> (or --download-root).")
    prompt = ("Names: " + ", ".join(hints) + ".") if hints else None
    segments, info = model.transcribe(a.media, language=a.language, word_timestamps=True, vad_filter=True,
                                      initial_prompt=prompt, hotwords=" ".join(hints) if hints else None,
                                      condition_on_previous_text=False)
    words = []
    for sg in segments:
        for w in (sg.words or []):
            txt = w.word.strip()
            bare = re.sub(r"[^\w']", "", txt).lower()
            words.append({"i": len(words), "w": txt, "s": round(w.start, 3), "e": round(w.end, 3),
                          "p": round(w.probability, 3), "filler": bare in FILLERS})
    corrections = apply_fixes(words, fixes)
    for i, w in enumerate(words):
        w["i"] = i
    doc = {"source": os.path.abspath(a.media), "model": a.model, "language": info.language,
           "duration": round(info.duration, 3), "names": hints, "corrections": corrections,
           "words": words, "segments": segments_from_words(words)}
    base = os.path.splitext(a.media)[0]
    write_outputs(base, doc)
    print(f"transcribed {os.path.basename(a.media)} · {len(words)} words · {info.duration:.1f}s audio in {time.time() - t0:.1f}s\n"
          f"  → {base}.words.json · .srt · .transcript.md"
          + (f"\n  name corrections: {len(corrections)}" if corrections else ""))


if __name__ == "__main__":
    main()
