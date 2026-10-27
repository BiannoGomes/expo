#!/usr/bin/env bash
# Becoming build: one composition folder in, one checked MP4 out (foundation spec, "tools/build.sh").
#
#   tools/build.sh <composition-dir> [--draft]
#
# The composition folder holds index.html and cue.json (and usually data.json). The library's tokens.css, fonts/,
# vendor/ and lib/ are staged beside it in a build copy (HyperFrames rejects "../" asset paths); anything the folder
# already has of its own wins. The repo working tree is never written to unless BECOMING_OUT points into it.
#
# Gates, in order (one PASS/FAIL line each). The first six make the file; a failure there stops the build.
# The last four judge it; they all run and all count.
#   lint          HyperFrames lint                                (0 errors)
#   check         HyperFrames check: runtime, layout, motion, WCAG contrast   (exit 0; runs in --draft too)
#   render        silent H.264 1080x1920, 30 fps                  (--quality looks; --draft: --quality draft)
#   score         tools/night-watch-render.mjs <dir>/cue.json -> score.wav
#   mix           tools/mix.sh [--voice] score.wav -> mix.wav (house mix and master: -14 LUFS, <= -1 dBTP)
#   mux           ffmpeg -c:v copy + AAC 256k 48 kHz, faststart -> <out>/<name>.mp4
#   review-frames motion-review review-frames.mjs --platform becoming -> <out>/review/   (contact sheets to READ)
#   spec-check    motion-review spec-check.mjs --platform reels
#   brand-lint    motion-review brand-lint.mjs --brand/--motion = the repo's becoming-project files, on the staged build
#                 and on the copy the piece loads from JSON at runtime (brand-lint itself reads .html/.css/.js only)
#   audio-qa      tools/audio-qa.mjs (LUFS, true peak, sub-60 gap; duck depth when a voice is mixed in)
#
# Environment (documented defaults; nothing machine-specific is hard-coded):
#   BECOMING_OUT            output dir                 (default <composition-dir>/renders, gitignored)
#   HF_CMD                  HyperFrames command        (default "npx --offline hyperframes@0.8.97")
#   HYPERFRAMES_BROWSER_PATH  Chromium for HyperFrames (HyperFrames' own default if unset)
#   PLAYWRIGHT_MODULE, CHROMIUM_PATH   for night-watch-render.mjs (see its header)
#   MOTION_REVIEW_SCRIPTS   motion-review scripts      (default <repo>/jarvis-studio/skills/motion-review/scripts,
#                                                       found relative to this file)
#   BECOMING_BRAND_DIR      brand.md + MOTION.md       (default <repo>/jarvis-studio/workspace/brands/becoming-project)
#   BECOMING_VOICE          a voice WAV: switches mix.sh to the voice path and audio-qa to the duck gate
#   BECOMING_VOICE_AT       where the voice starts, seconds (default 0)
#   FFMPEG, FFPROBE, NODE   tools                       (default ffmpeg, ffprobe, node)
# Outputs in <out>: <name>.mp4 (final), silent.mp4, score.wav, mix.wav (+ mix.stems/ with a voice), stage/ (the build
#   copy), copy-lint/ (JSON copy as HTML for brand-lint), logs/<gate>.txt, review/ (contact sheets, index.md, spec-check.json, brand-lint.json, brand-lint-copy.json, audio-qa.json,
#   gates.txt).
# Exit codes: 0 every gate passed, 1 a gate failed, 2 usage error.
set -uo pipefail

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
LIB=$(cd "$HERE/.." && pwd)
STUDIO=$(cd "$LIB/../../.." && pwd)           # .../jarvis-studio
HF_CMD=${HF_CMD:-npx --offline hyperframes@0.8.97}
MR=${MOTION_REVIEW_SCRIPTS:-$STUDIO/skills/motion-review/scripts}
BRAND_DIR=${BECOMING_BRAND_DIR:-$STUDIO/workspace/brands/becoming-project}
FFMPEG=${FFMPEG:-ffmpeg}; FFPROBE=${FFPROBE:-ffprobe}; NODE=${NODE:-node}

usage() { [ -n "${1:-}" ] && echo "build.sh: $1" >&2; echo "usage: tools/build.sh <composition-dir> [--draft]" >&2; exit 2; }
DRAFT=0; COMP=""
for a in "$@"; do
  case "$a" in
    --draft) DRAFT=1 ;;
    -h|--help) usage ;;
    --*) usage "unknown option $a" ;;
    *) [ -z "$COMP" ] || usage "one composition dir only"; COMP=$a ;;
  esac
done
[ -n "$COMP" ] || usage "need a composition dir"
[ -d "$COMP" ] || usage "no such dir $COMP"
COMP=$(cd "$COMP" && pwd)
[ -f "$COMP/index.html" ] || usage "$COMP has no index.html"
[ -f "$COMP/cue.json" ] || usage "$COMP has no cue.json (every piece carries the Night Watch score)"
[ -d "$MR" ] || usage "motion-review scripts not found at $MR (set MOTION_REVIEW_SCRIPTS)"
[ -f "$BRAND_DIR/MOTION.md" ] && [ -f "$BRAND_DIR/brand.md" ] || usage "brand files not found in $BRAND_DIR (set BECOMING_BRAND_DIR)"
if [ -n "${BECOMING_VOICE:-}" ]; then [ -f "$BECOMING_VOICE" ] || usage "BECOMING_VOICE: no such file $BECOMING_VOICE"; BECOMING_VOICE=$(cd "$(dirname "$BECOMING_VOICE")" && pwd)/$(basename "$BECOMING_VOICE"); fi
command -v "$FFMPEG" >/dev/null || usage "ffmpeg not found (set FFMPEG)"
command -v "$NODE" >/dev/null || usage "node not found (set NODE)"

NAME=$(basename "$COMP")
OUT=${BECOMING_OUT:-$COMP/renders}
mkdir -p "$OUT" || usage "can't create $OUT"
OUT=$(cd "$OUT" && pwd)
STAGE=$OUT/stage; LOGS=$OUT/logs; REVIEW=$OUT/review
FINAL=$OUT/$NAME.mp4
rm -rf "${OUT:?}/stage" "${OUT:?}/review" "${OUT:?}/logs" "${OUT:?}/copy-lint"; mkdir -p "$STAGE" "$LOGS" "$REVIEW"
rm -f "${OUT:?}/silent.mp4" "${OUT:?}/score.wav" "${OUT:?}/mix.wav" "${OUT:?}/$NAME.mp4"; rm -rf "${OUT:?}/mix.stems"

GATES=(); FAILED=0
line() { printf '%-4s  %-13s %s\n' "$1" "$2" "$3"; GATES+=("$(printf '%-4s  %-13s %s' "$1" "$2" "$3")"); }
pass() { line PASS "$1" "$2"; }
fail() { line FAIL "$1" "$2 (log: $LOGS/$1.txt)"; FAILED=1; }
summary() {
  {
    echo "build.sh $NAME $( [ $DRAFT = 1 ] && echo '(draft)' )"
    printf '%s\n' "${GATES[@]}"
  } > "$REVIEW/gates.txt"
  if [ $FAILED = 0 ] && [ -f "$FINAL" ]; then echo "RESULT: PASS  $FINAL"; echo "MP4: $FINAL"; exit 0; fi
  [ -f "$FINAL" ] && echo "MP4: $FINAL"
  echo "RESULT: FAIL  (see $REVIEW/gates.txt and $LOGS/)"; exit 1
}
stop() { summary; }   # a making gate failed: report what ran and stop
# run a gate command with stdout+stderr to its log; returns the command's exit code
run() { local g=$1; shift; "$@" > "$LOGS/$g.txt" 2>&1; }

echo "build.sh: $NAME -> $OUT$( [ $DRAFT = 1 ] && echo ' (draft)' )"

# ---- stage: the composition plus the library's runtime files, root-relative ----
cp -R "$COMP"/. "$STAGE"/
rm -rf "${STAGE:?}/renders" "${STAGE:?}/review" "${STAGE:?}/snapshots"
for f in tokens.css fonts vendor lib; do [ -e "$STAGE/$f" ] || cp -R "$LIB/$f" "$STAGE/$f"; done
[ -f "$STAGE/meta.json" ] || printf '{ "id": "%s", "name": "%s" }\n' "$NAME" "$NAME" > "$STAGE/meta.json"
[ -f "$STAGE/hyperframes.json" ] || printf '{\n  "paths": { "blocks": "compositions", "components": "compositions/components", "assets": "assets" },\n  "media": { "autoProxy": true }\n}\n' > "$STAGE/hyperframes.json"
DUR=$(sed -n 's/.*data-composition-id="main"[^>]*data-duration="\([0-9.]*\)".*/\1/p' "$STAGE/index.html" | head -1)
[ -n "$DUR" ] || DUR=$(sed -n 's/.*data-duration="\([0-9.]*\)"[^>]*data-composition-id="main".*/\1/p' "$STAGE/index.html" | head -1)

# ---- 1. lint ----
lint_sum() { sed 's/\x1b\[[0-9;]*m//g' "$LOGS/lint.txt" | grep -Eo '[0-9]+ error(s|\(s\))?, [0-9]+ warning(s|\(s\))?' | tail -1; }
lint_rules() { sed 's/\x1b\[[0-9;]*m//g' "$LOGS/lint.txt" | grep -Eo '\] [a-z_]+:' | tr -d ']: ' | sort -u | paste -sd ',' -; }
if (cd "$STAGE" && run lint $HF_CMD lint . --verbose); then
  s=$(lint_sum)
  case "$s" in "0 error"*) pass lint "$s" ;; *) fail lint "${s:-no summary line} $(lint_rules)" ;; esac
else fail lint "$(lint_sum): $(lint_rules)"; fi
[ $FAILED = 0 ] || stop

# ---- 2. check ----
if (cd "$STAGE" && run check $HF_CMD check .); then
  pass check "$(sed 's/\x1b\[[0-9;]*m//g' "$LOGS/check.txt" | awk '/^(Lint|Runtime|Layout|Motion|Contrast)$/{k=$1; next} k && /◇/{sub(/^ *◇ */,""); printf "%s%s %s", (n++?" · ":""), k, $0; k=""}')"
else fail check "exit code non-zero"; fi
[ $FAILED = 0 ] || stop

# ---- 3. render (silent) ----
Q=looks; [ $DRAFT = 1 ] && Q=draft
if (cd "$STAGE" && run render $HF_CMD render . -o "$OUT/silent.mp4" --fps 30 --quality $Q) && [ -s "$OUT/silent.mp4" ]; then
  v=$("$FFPROBE" -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -of csv=p=0 "$OUT/silent.mp4")
  case "$v" in h264,1080,1920,30/1,*) pass render "silent.mp4 $v (quality $Q)" ;; *) fail render "unexpected stream: $v" ;; esac
else fail render "no silent.mp4"; fi
[ $FAILED = 0 ] || stop

# ---- 4. score ----
CUE=$STAGE/cue.json
if run score "$NODE" "$LIB/tools/night-watch-render.mjs" "$CUE" "$OUT/score.wav" --json && [ -s "$OUT/score.wav" ]; then
  cdur=$("$NODE" -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).duration)' "$CUE")
  if [ -n "$DUR" ] && ! awk -v a="$cdur" -v b="$DUR" 'BEGIN{exit !(a-b<0.001 && b-a<0.001)}'; then
    fail score "cue duration $cdur s != composition data-duration $DUR s"
  else pass score "$("$NODE" -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n").pop());console.log("score.wav "+j.seconds+" s · "+j.sampleRate/1000+" kHz "+j.channels+" ch "+j.bits+"-bit · sample peak "+j.samplePeakDbfs+" dBFS · turns "+JSON.stringify(j.cue.turns)+" · stingAt "+j.cue.stingAt+" · land "+j.cue.land)' "$LOGS/score.txt" 2>/dev/null || echo "score.wav ($cdur s)")"; fi
else fail score "night-watch-render failed"; fi
[ $FAILED = 0 ] || stop

# ---- 5. mix ----
MIXARGS=()
[ -n "${BECOMING_VOICE:-}" ] && MIXARGS=(--voice "$BECOMING_VOICE" --voice-at "${BECOMING_VOICE_AT:-0}" --stems "$OUT/mix.stems")
if run mix "$LIB/tools/mix.sh" "${MIXARGS[@]}" "$OUT/score.wav" "$OUT/mix.wav" && [ -s "$OUT/mix.wav" ]; then
  pass mix "$(grep -E '^mix.sh: OK' "$LOGS/mix.txt" | tail -1 | sed "s|$OUT/||")$( [ -n "${BECOMING_VOICE:-}" ] && echo ' (voice path)' || echo ' (score-only path)')"
else fail mix "$(grep -E 'FAILED|usage' "$LOGS/mix.txt" | tail -1)"; fi
[ $FAILED = 0 ] || stop

# ---- 6. mux ----
if run mux "$FFMPEG" -hide_banner -nostats -y -i "$OUT/silent.mp4" -i "$OUT/mix.wav" -map 0:v:0 -map 1:a:0 -c:v copy \
     -c:a aac -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart "$FINAL" && [ -s "$FINAL" ]; then
  d=$("$FFPROBE" -v error -show_entries format=duration -of csv=p=0 "$FINAL")
  ac=$("$FFPROBE" -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of csv=p=0 "$FINAL")
  pass mux "$(basename "$FINAL") ${d} s · audio $ac · video copied"
else fail mux "ffmpeg mux failed"; fi
[ $FAILED = 0 ] || stop

# ---- 7. review-frames (contact sheets: a human or Claude must READ them; the gate is that they were made) ----
if run review-frames "$NODE" "$MR/review-frames.mjs" "$FINAL" --platform becoming --out "$REVIEW" && [ -f "$REVIEW/index.md" ]; then
  pass review-frames "$(ls "$REVIEW" | grep -Ec '\.(jpg|png)$') images + index.md in review/ (read them)"
else fail review-frames "review-frames failed"; fi

# ---- 8. spec-check ----
if run spec-check "$NODE" "$MR/spec-check.mjs" "$FINAL" --platform reels; then
  w=$(grep -c '⚠' "$LOGS/spec-check.txt"); pass spec-check "reels preset: no FAIL, $w warning(s)"
else fail spec-check "$(grep '✖' "$LOGS/spec-check.txt" | tr -s ' ' | paste -sd ';' - | cut -c1-110)"; fi
"$NODE" "$MR/spec-check.mjs" "$FINAL" --platform reels --json > "$REVIEW/spec-check.json" 2>/dev/null || true

# ---- 9. brand-lint ----
# brand-lint reads .html/.css/.js only, so copy that a composition loads at runtime from JSON (data.json: hook, captions)
# would escape its name, banned-word and exclamation laws. Every JSON string value (keys starting "$" are comments and
# are skipped; cue/meta/hyperframes.json carry no copy) is written as visible text into <out>/copy-lint/index.html,
# with each array's strings also joined, and linted with the same brand files. Both runs must pass.
COPYLINT=$OUT/copy-lint; rm -rf "${OUT:?}/copy-lint"; mkdir -p "$COPYLINT"
"$NODE" -e '
const fs=require("fs"),path=require("path");const dir=process.argv[1],out=process.argv[2];const skip=new Set(["cue.json","meta.json","hyperframes.json"]);
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");const lines=[];
function walk(v,where){ if(typeof v==="string"){lines.push([where,v]);return [v];} if(Array.isArray(v)){const all=[];v.forEach((x,i)=>all.push(...walk(x,where+"["+i+"]")));if(all.length>1)lines.push([where+" (joined)",all.join(" ")]);return all;}
  if(v&&typeof v==="object"){const all=[];for(const k of Object.keys(v)){if(k.startsWith("$"))continue;all.push(...walk(v[k],where+"."+k));}return all;} return []; }
for(const f of fs.readdirSync(dir)){ if(!f.endsWith(".json")||skip.has(f))continue; try{walk(JSON.parse(fs.readFileSync(path.join(dir,f),"utf8")),f);}catch(e){console.error("copy-lint: "+f+": "+e.message);process.exit(1);} }
fs.writeFileSync(path.join(out,"index.html"),"<!doctype html><html><head><meta charset=\"utf-8\"></head><body>\n"+lines.map(([w,t])=>"<p data-src=\""+esc(w)+"\">"+esc(t)+"</p>").join("\n")+"\n</body></html>\n");
console.log(lines.length+" copy strings");' "$STAGE" "$COPYLINT" > "$LOGS/copy-lint-extract.txt" 2>&1
BL_OK=1
run brand-lint "$NODE" "$MR/brand-lint.mjs" "$STAGE" --brand "$BRAND_DIR/brand.md" --motion "$BRAND_DIR/MOTION.md" || BL_OK=0
{ echo; echo "== runtime copy from JSON ($(cat "$LOGS/copy-lint-extract.txt")): $COPYLINT/index.html"; } >> "$LOGS/brand-lint.txt"
"$NODE" "$MR/brand-lint.mjs" "$COPYLINT" --brand "$BRAND_DIR/brand.md" --motion "$BRAND_DIR/MOTION.md" >> "$LOGS/brand-lint.txt" 2>&1 || BL_OK=0
grep -q 'copy strings' "$LOGS/copy-lint-extract.txt" || BL_OK=0
if [ $BL_OK = 1 ]; then
  pass brand-lint "composition + $(cat "$LOGS/copy-lint-extract.txt") from JSON: no house-rule or brand violations"
else fail brand-lint "$(grep -c '^✖' "$LOGS/brand-lint.txt") violation(s): $(grep -Eo '^✖ \[[a-z-]+\]' "$LOGS/brand-lint.txt" | tr -d '✖[] ' | sort -u | paste -sd ',' -)"; fi
"$NODE" "$MR/brand-lint.mjs" "$STAGE" --brand "$BRAND_DIR/brand.md" --motion "$BRAND_DIR/MOTION.md" --json > "$REVIEW/brand-lint.json" 2>/dev/null || true
"$NODE" "$MR/brand-lint.mjs" "$COPYLINT" --brand "$BRAND_DIR/brand.md" --motion "$BRAND_DIR/MOTION.md" --json > "$REVIEW/brand-lint-copy.json" 2>/dev/null || true

# ---- 10. audio-qa ----
qa_line() { "$NODE" -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log(j.checks.map(c=>c.id+" "+(c.value===null?"n/a":c.value+" "+c.unit)+(c.pass?"":" FAIL")).join(" · "))' "$REVIEW/audio-qa.json" 2>/dev/null || grep -E 'FAIL|ERROR' "$LOGS/audio-qa.txt" | head -3 | paste -sd ';' -; }
QAARGS=(--json "$REVIEW/audio-qa.json")
[ -n "${BECOMING_VOICE:-}" ] && QAARGS+=(--stems "$OUT/mix.stems")
if run audio-qa "$NODE" "$LIB/tools/audio-qa.mjs" "$FINAL" "${QAARGS[@]}"; then
  pass audio-qa "$(qa_line)"
else fail audio-qa "$(qa_line)"; fi

summary
