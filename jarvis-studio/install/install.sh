#!/usr/bin/env bash
# Jarvis Studio installer (macOS / Linux / cloud sessions). Mirrors install.ps1.
#   ./install/install.sh [--studio PATH] [--extras] [--hyperframes-skills] [--skip-third-party] [--skip-plugin]
# Nothing here spends money, and nothing publishes anywhere.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STUDIO="${HOME}/Jarvis Studio"; EXTRAS=0; HFSKILLS=0; SKIP3P=0; SKIPPLUGIN=0
while [ $# -gt 0 ]; do case "$1" in
  --studio) STUDIO="$2"; shift 2;; --extras) EXTRAS=1; shift;; --hyperframes-skills) HFSKILLS=1; shift;;
  --skip-third-party) SKIP3P=1; shift;; --skip-plugin) SKIPPLUGIN=1; shift;; *) echo "unknown flag $1"; exit 2;; esac; done
export DISABLE_TELEMETRY=1 HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_SKIP_SKILLS=1
ok(){ printf '  \033[32m[ok]\033[0m %s\n' "$*"; }; warn(){ printf '  \033[33m[!]\033[0m  %s\n' "$*"; }; has(){ command -v "$1" >/dev/null 2>&1; }

printf '\nJarvis Studio installer\n\n'
miss=()
if has node && [ "$(node -v | sed 's/v//; s/\..*//')" -ge 22 ]; then ok "Node $(node -v)"; else miss+=("Node 22+ (https://nodejs.org or: brew install node)"); fi
if has ffmpeg && has ffprobe; then ok "ffmpeg + ffprobe"; else miss+=("ffmpeg (brew install ffmpeg / apt-get install ffmpeg)"); fi
if has git; then ok git; else miss+=("git"); fi
PY=$(command -v python3 || command -v python || true)
if [ -n "$PY" ]; then ok "$($PY --version 2>&1)"
  if "$PY" -c "import faster_whisper" 2>/dev/null; then ok "faster-whisper (Claude's ears)"
  elif "$PY" -m pip install --upgrade faster-whisper >/dev/null 2>&1 || "$PY" -m pip install --user --upgrade faster-whisper >/dev/null 2>&1; then ok "faster-whisper installed"
  else warn "faster-whisper not installed: run  $PY -m pip install faster-whisper  (a venv may be needed)"; fi
else miss+=("Python 3 (brew install python / apt-get install python3)"); fi
if has claude; then ok "Claude Code CLI"; else warn "Claude Code CLI not on PATH: the plugin will be copied into ~/.claude instead"; fi
if [ ${#miss[@]} -gt 0 ]; then warn "Install these, then re-run:"; printf '      %s\n' "${miss[@]}"; exit 1; fi

if [ $SKIPPLUGIN -eq 0 ]; then
  if has claude; then
    claude plugin marketplace add "$ROOT" && claude plugin install jarvis-studio@jarvis-studio && ok "plugin jarvis-studio installed (/jarvis-studio:studio …)"
  else
    mkdir -p ~/.claude/skills ~/.claude/agents
    for d in "$ROOT"/skills/*/; do cp -R "$d" ~/.claude/skills/; done; cp "$ROOT"/agents/*.md ~/.claude/agents/
    ok "skills copied to ~/.claude/skills (/studio …)"
  fi
fi

skills_add(){ local repo="$1"; shift
  if npx -y skills@latest add "$repo" --skill "$@" -a claude-code -g -y; then ok "skills: $repo"; else warn "skills install failed for $repo"; fi; }
if [ $SKIP3P -eq 0 ]; then
  if [ $HFSKILLS -eq 0 ] && has claude; then
    if claude plugin list 2>/dev/null | grep -q hyperframes; then ok "HyperFrames plugin already installed"
    else claude plugin marketplace add heygen-com/hyperframes && claude plugin install hyperframes@hyperframes && ok "HyperFrames plugin"; fi
  else skills_add heygen-com/hyperframes '*'; fi
  skills_add charlie947/motion-graphics-skills '*'
  skills_add emilkowalski/skills apple-design animate animation-vocabulary find-animation-opportunities improve-animations review-animations prototype emil-design-eng
  skills_add WyattBlue/auto-editor '*'
  if [ $EXTRAS -eq 1 ]; then
    skills_add diffusionstudio/lottie '*'
    [ -d ~/.claude/skills/clipify ] || { git clone --depth 1 https://github.com/louisedesadeleer/clipify.git ~/.claude/skills/clipify; warn "clipify also needs: pip install openai-whisper"; }
  fi
  npx -y hyperframes@latest browser ensure || warn "run 'npx hyperframes doctor'"
  CHROME="$(npx -y hyperframes@latest browser path 2>/dev/null | tail -1 || true)"
  [ -n "$CHROME" ] && [ -e "$CHROME" ] && ok "Chrome Headless Shell: $CHROME  →  add to your shell profile: export HYPERFRAMES_BROWSER_PATH=\"$CHROME\""
fi

mkdir -p "$STUDIO"; copied=0; kept=0
while IFS= read -r -d '' f; do rel="${f#"$ROOT/workspace/"}"; dst="$STUDIO/$rel"
  if [ -e "$dst" ]; then kept=$((kept+1)); else mkdir -p "$(dirname "$dst")"; cp "$f" "$dst"; copied=$((copied+1)); fi
done < <(find "$ROOT/workspace" -type f -print0)
ok "studio workspace at $STUDIO ($copied new files, $kept existing files left untouched)"
node "$ROOT/skills/brand-system/scripts/activate-brand.mjs" --list --studio "$STUDIO"
npx -y hyperframes@latest doctor || true
printf '\nDone. Next:\n  cd "%s" && claude\n  then: /jarvis-studio:studio <what you want>   (Becoming Project: work inside its own folder with becoming-video)\n' "$STUDIO"
