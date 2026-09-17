# install-wan22.ps1 — Wan2.2 TI2V-5B into Bianno's portable ComfyUI
# Does runbook Steps 0-1 automatically: disk check, ComfyUI update, downloads
# with resume, size verification. Steps 2-5 (template, first render) stay in-app.
# Run:  powershell -ExecutionPolicy Bypass -File .\install-wan22.ps1

$ErrorActionPreference = "Stop"
$Base  = "C:\Users\biann\Tools\ComfyUI_windows_portable"
$Comfy = Join-Path $Base "ComfyUI"

$Files = @(
  @{ Url  = "https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/diffusion_models/wan2.2_ti2v_5B_fp16.safetensors"
     Dir  = "models\diffusion_models"; Name = "wan2.2_ti2v_5B_fp16.safetensors"; MinGB = 9 },
  @{ Url  = "https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/vae/wan2.2_vae.safetensors"
     Dir  = "models\vae"; Name = "wan2.2_vae.safetensors"; MinGB = 1 },
  @{ Url  = "https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors"
     Dir  = "models\text_encoders"; Name = "umt5_xxl_fp8_e4m3fn_scaled.safetensors"; MinGB = 6 }
)

Write-Host "`n== JARVIS · Wan2.2 installer ==" -ForegroundColor Cyan

# Step 0a — sanity: the portable install exists
if (-not (Test-Path $Comfy)) { throw "ComfyUI not found at $Comfy — edit `$Base at the top of this script." }

# Step 0b — disk space (need ~19GB of downloads; require 25GB headroom)
$drive = (Get-Item $Base).PSDrive
$freeGB = [math]::Round($drive.Free / 1GB, 1)
Write-Host "Free on $($drive.Name): $freeGB GB"
if ($freeGB -lt 25) { throw "Only $freeGB GB free — need >= 25 GB. Clear space, run again." }

# Step 0c — update ComfyUI via its own portable updater (Wan2.2 template needs a recent build)
$updater = Join-Path $Base "update\update_comfyui.bat"
if (Test-Path $updater) {
  Write-Host "Updating ComfyUI (official portable updater)..." -ForegroundColor Cyan
  & cmd.exe /c "`"$updater`""
} else {
  Write-Host "Updater not found at $updater — update via Manager inside ComfyUI instead." -ForegroundColor Yellow
}

# Step 1 — download the three model files (resumable; skips ones already complete)
foreach ($f in $Files) {
  $dir = Join-Path $Comfy $f.Dir
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $target = Join-Path $dir $f.Name
  $minBytes = $f.MinGB * 1GB
  if ((Test-Path $target) -and ((Get-Item $target).Length -ge $minBytes)) {
    Write-Host "SKIP (already complete): $($f.Name)" -ForegroundColor Green
    continue
  }
  Write-Host "Downloading $($f.Name) ..." -ForegroundColor Cyan
  # curl.exe ships with Windows 10+; -C - resumes a partial file if you rerun the script
  & curl.exe -L -C - --retry 5 --retry-delay 5 -o $target $f.Url
  if ($LASTEXITCODE -ne 0) { throw "Download failed for $($f.Name) — rerun the script; it resumes." }
}

# Verify
Write-Host "`n== Verification ==" -ForegroundColor Cyan
$ok = $true
foreach ($f in $Files) {
  $target = Join-Path (Join-Path $Comfy $f.Dir) $f.Name
  if ((Test-Path $target) -and ((Get-Item $target).Length -ge ($f.MinGB * 1GB))) {
    Write-Host ("OK   {0}  ({1:N1} GB)" -f $f.Name, ((Get-Item $target).Length / 1GB)) -ForegroundColor Green
  } else {
    Write-Host "FAIL $($f.Name) — missing or truncated; rerun the script to resume." -ForegroundColor Red
    $ok = $false
  }
}
if (-not $ok) { exit 1 }

Write-Host @"

== DONE — your next moves (in ComfyUI) ==
1. Start ComfyUI -> Workflow -> Browse Templates -> Video -> 'Wan 2.2 5B video generation'
2. Set 704x1280 (9:16), length 121 frames @ 24fps, ~20-30 steps. Queue. TIME IT.
3. OOM? Relaunch with --lowvram. Still OOM? ComfyUI-GGUF node + Q5/Q4 TI2V-5B quant.
4. Brand trick: always load an approved brand still as the start image.
Log the benchmark to the HQ ledger. Tier goes ARMED after one verified brand clip.
"@ -ForegroundColor Cyan
