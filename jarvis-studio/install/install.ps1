<#
  Jarvis Studio installer (Windows / PowerShell).

  What it does, in order:
    1. Checks prerequisites (Node >= 22, ffmpeg/ffprobe, git, Claude Code CLI) and tells you how to fix any gap.
    2. Installs the jarvis-studio plugin (director, brand-system, fact-lock, motion-review, studio-retro, motion-critic).
    3. Installs the free production stack as user-level skills: HyperFrames, Charlie Hills' motion-graphics
       skills, Emil Kowalski's animation craft skills, auto-editor's skills.
    4. Copies the studio workspace (brands, learnings, library, the proof project) to -StudioPath,
       WITHOUT overwriting anything that already exists there.
    5. Verifies the install.

  Usage (from the jarvis-studio folder):
    powershell -ExecutionPolicy Bypass -File install\install.ps1
    powershell -ExecutionPolicy Bypass -File install\install.ps1 -StudioPath "D:\Studio" -Extras
    powershell -ExecutionPolicy Bypass -File install\install.ps1 -HyperFramesPlugin   # HeyGen's plugin route (~1.9 GB cache)

  Nothing here spends money, and nothing publishes anywhere.
#>
param(
  [string]$StudioPath = "$env:USERPROFILE\Desktop\Jarvis\Jarvis Brain\03 Projects\Studio",
  [switch]$Extras,             # + Lottie skill, clipify (long-form -> shorts)
  [switch]$HyperFramesPlugin,  # use HeyGen's Claude Code plugin instead of user-level skills
  [switch]$SkipThirdParty,
  [switch]$SkipPlugin
)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot           # ...\jarvis-studio
$env:DISABLE_TELEMETRY = '1'                        # skills CLI
$env:HYPERFRAMES_NO_TELEMETRY = '1'
$env:HYPERFRAMES_SKIP_SKILLS = '1'                  # stop `hyperframes init` re-installing skills on every run

function Say($m)  { Write-Host "  $m" }
function Ok($m)   { Write-Host "  [ok] $m" -ForegroundColor Green }
function Warn($m) { Write-Host "  [!]  $m" -ForegroundColor Yellow }
function Has($c)  { [bool](Get-Command $c -ErrorAction SilentlyContinue) }

Write-Host "`nJarvis Studio installer`n" -ForegroundColor Cyan

# 1 · prerequisites -------------------------------------------------------------------------------
$missing = @()
if (Has node) {
  $v = [int]((node -v).TrimStart('v').Split('.')[0])
  if ($v -ge 22) { Ok "Node $(node -v)" } else { $missing += "Node 22+ (you have $(node -v)):  winget install OpenJS.NodeJS.LTS" }
} else { $missing += "Node 22+:  winget install OpenJS.NodeJS.LTS" }
if ((Has ffmpeg) -and (Has ffprobe)) { Ok "ffmpeg + ffprobe" } else { $missing += "ffmpeg:  winget install Gyan.FFmpeg" }
if (Has git) { Ok "git" } else { $missing += "git:  winget install Git.Git" }
if (Has claude) { Ok "Claude Code CLI" } else { Warn "Claude Code CLI not on PATH: the plugin will be copied into ~/.claude instead" }
if ($missing.Count) {
  Warn "Install these, restart the terminal, then run this script again:"
  $missing | ForEach-Object { Say "    $_" }
  exit 1
}

# 2 · the jarvis-studio plugin --------------------------------------------------------------------
if (-not $SkipPlugin) {
  if (Has claude) {
    claude plugin marketplace add "$Root" | Out-Host
    claude plugin install jarvis-studio@jarvis-studio | Out-Host
    Ok "plugin jarvis-studio installed (skills are invoked as /jarvis-studio:studio etc.)"
  } else {
    $skills = "$env:USERPROFILE\.claude\skills"; $agents = "$env:USERPROFILE\.claude\agents"
    New-Item -ItemType Directory -Force -Path $skills, $agents | Out-Null
    Get-ChildItem "$Root\skills" -Directory | ForEach-Object { Copy-Item $_.FullName "$skills\$($_.Name)" -Recurse -Force }
    Copy-Item "$Root\agents\*.md" $agents -Force
    Ok "skills copied to $skills (invoke as /studio etc.)"
  }
}

# 3 · the free production stack -------------------------------------------------------------------
function SkillsAdd([string]$repo, [string[]]$pick) {
  $npxArgs = @('-y', 'skills@latest', 'add', $repo, '--skill') + $pick + @('-a', 'claude-code', '-g', '-y')
  & npx @npxArgs | Out-Host
  if ($LASTEXITCODE -eq 0) { Ok "skills: $repo" } else { Warn "skills install failed for $repo (re-run later: npx skills add $repo)" }
}
if (-not $SkipThirdParty) {
  if ($HyperFramesPlugin -and (Has claude)) {
    claude plugin marketplace add heygen-com/hyperframes | Out-Host
    claude plugin install hyperframes@hyperframes | Out-Host
    Ok "HyperFrames plugin (run its CLI through the plugin's scripts/plugin-cli.mjs launcher)"
  } else {
    SkillsAdd 'heygen-com/hyperframes' @('*')
  }
  SkillsAdd 'charlie947/motion-graphics-skills' @('*')
  SkillsAdd 'emilkowalski/skills' @('apple-design','animate','animation-vocabulary','find-animation-opportunities','improve-animations','review-animations','prototype','emil-design-eng')
  SkillsAdd 'WyattBlue/auto-editor' @('*')
  if ($Extras) {
    SkillsAdd 'diffusionstudio/lottie' @('*')
    $clip = "$env:USERPROFILE\.claude\skills\clipify"
    if (-not (Test-Path $clip)) { git clone --depth 1 https://github.com/louisedesadeleer/clipify.git $clip | Out-Host; Warn "clipify also needs: pip install openai-whisper (and it was built on macOS: remove VideoToolbox flags)" }
  }
  # HyperFrames renders with a pinned Chrome Headless Shell
  npx -y hyperframes@latest browser ensure | Out-Host
  $chrome = (npx -y hyperframes@latest browser path 2>$null | Select-Object -Last 1)
  if ($chrome -and (Test-Path $chrome)) {
    [Environment]::SetEnvironmentVariable('HYPERFRAMES_BROWSER_PATH', $chrome, 'User')
    Ok "Chrome Headless Shell: $chrome (HYPERFRAMES_BROWSER_PATH set for seek-render too)"
  } else { Warn "could not resolve Chrome path: run 'npx hyperframes doctor'" }
}

# 4 · the studio workspace (never overwrites) ------------------------------------------------------
New-Item -ItemType Directory -Force -Path $StudioPath | Out-Null
$src = "$Root\workspace"; $copied = 0; $kept = 0
Get-ChildItem $src -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($src.Length).TrimStart('\')
  $dst = Join-Path $StudioPath $rel
  if (Test-Path $dst) { $kept++ } else {
    New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
    Copy-Item $_.FullName $dst; $copied++
  }
}
Ok "studio workspace at $StudioPath ($copied new files, $kept existing files left untouched)"

# 5 · verify ----------------------------------------------------------------------------------------
node "$Root\skills\brand-system\scripts\activate-brand.mjs" --list --studio "$StudioPath" | Out-Host
Write-Host "`nDone. Next:" -ForegroundColor Cyan
Say "cd `"$StudioPath`"; claude"
Say "then:  /jarvis-studio:studio make a 10s UnifyMind reel for Book 2"
Say "Paid, optional (only when you decide): ElevenLabs skills + video-use. See README > Optional paid tools."
