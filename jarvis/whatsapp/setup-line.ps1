# Jarvis line — one-shot setup on Bianno's Windows laptop.
# Run in PowerShell:
#   iwr https://raw.githubusercontent.com/BiannoGomes/expo/claude/ai-vault-portal-replica-jutqvp/jarvis/whatsapp/setup-line.ps1 -OutFile setup-line.ps1; powershell -ExecutionPolicy Bypass -File .\setup-line.ps1
# It deploys the function, creates the signed webhook, generates two random secrets,
# and prints exactly what to paste into the function's secrets. Nothing is sent to anyone.

$ProjectId = '83cdc453-f34d-4bac-b0f0-82193dbc8f8e'
$Base = 'https://raw.githubusercontent.com/BiannoGomes/expo/claude/ai-vault-portal-replica-jutqvp/jarvis/whatsapp'
$Dir = Join-Path $HOME 'jarvis-line'

function Step($n, $t) { Write-Host "`n[$n] $t" -ForegroundColor Cyan }
function Need($ok, $msg) { if (-not $ok) { Write-Host "STOPPED: $msg" -ForegroundColor Red; exit 1 } }
function NewSecret { ([guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')) }

Step 1 'Checking Node.js'
Need (Get-Command node -ErrorAction SilentlyContinue) 'Node.js is missing — install the LTS from nodejs.org, then rerun.'
if (-not (Get-Command kapso -ErrorAction SilentlyContinue)) { npm install -g @kapso/cli; Need ($LASTEXITCODE -eq 0) 'npm install -g @kapso/cli failed.' }

Step 2 "Downloading the Jarvis line into $Dir"
New-Item -ItemType Directory -Force -Path (Join-Path $Dir 'functions\jarvis-line') | Out-Null
Set-Location $Dir
iwr "$Base/kapso.yaml" -OutFile 'kapso.yaml'
iwr "$Base/functions/jarvis-line/function.yaml" -OutFile 'functions\jarvis-line\function.yaml'
iwr "$Base/functions/jarvis-line/index.js" -OutFile 'functions\jarvis-line\index.js'
Need ((Get-Content 'functions\jarvis-line\index.js' -TotalCount 1) -like 'async function handler*') 'Download looks wrong.'

Step 3 'Logging in to Kapso (a browser tab opens — approve it)'
kapso login; Need ($LASTEXITCODE -eq 0) 'kapso login failed.'
kapso projects use $ProjectId; Need ($LASTEXITCODE -eq 0) 'Could not select the WHATSAPP + JARVIS project.'

Step 4 'WhatsApp number'
kapso whatsapp numbers list
$has = Read-Host 'Do you see a number above? (y/n)'
if ($has -ne 'y') {
  Write-Host 'Starting Kapso setup — accept the free number it offers.' -ForegroundColor Yellow
  kapso setup --project $ProjectId; Need ($LASTEXITCODE -eq 0) 'kapso setup failed.'
  kapso whatsapp numbers list
}
$PhoneNumberId = Read-Host 'Paste the phone_number_id shown above (digits)'
Need ($PhoneNumberId -match '^\d+$') 'That is not a phone_number_id.'

Step 5 'Deploying the function'
kapso link --project $ProjectId; Need ($LASTEXITCODE -eq 0) 'kapso link failed.'
kapso push function jarvis-line --project $ProjectId; Need ($LASTEXITCODE -eq 0) 'kapso push failed.'
$map = Get-Content '.kapso\remote-map.json' -Raw | ConvertFrom-Json
$FnId = $map.functions.'jarvis-line'.id
Need $FnId 'Could not read the function id from .kapso\remote-map.json.'
$Endpoint = "https://api.kapso.ai/platform/v1/functions/$FnId/invoke"

Step 6 'Creating the signed webhook'
$WebhookSecret = NewSecret
$SyncKey = NewSecret
kapso whatsapp webhooks new --phone-number-id $PhoneNumberId --url $Endpoint --event whatsapp.message.received --buffer-enabled --buffer-window-seconds 3 --secret-key $WebhookSecret --active --output json | Out-Null
Need ($LASTEXITCODE -eq 0) 'Webhook creation failed.'

Step 7 'Saving desktop sync settings'
"JARVIS_LINE_URL=$Endpoint`nSYNC_KEY=$SyncKey" | Set-Content -Path (Join-Path $Dir '.env') -Encoding utf8
$health = try { (iwr $Endpoint -UseBasicParsing).Content } catch { $_.Exception.Message }
Write-Host "Endpoint check: $health"

Step 8 'Paste these into the function secrets (dashboard -> Functions -> jarvis-line -> secrets)'
$Owner = Read-Host 'Your personal WhatsApp number with country code (e.g. 34600111222)'
Write-Host ''
Write-Host "OWNER_WA            $($Owner -replace '\D','')"
Write-Host "WEBHOOK_SECRET      $WebhookSecret"
Write-Host "PHONE_NUMBER_ID     $PhoneNumberId"
Write-Host "SYNC_KEY            $SyncKey"
Write-Host 'KAPSO_API_KEY       (dashboard -> Project -> API keys -> create one, paste it)'
Write-Host 'OPENROUTER_API_KEY  (openrouter.ai -> Keys -> create; optional for now)'
Write-Host 'BRAIN_MODEL         (openrouter.ai/models -> pick a model, copy its id; optional for now)'
Write-Host ''
Write-Host 'Paste ALL secrets first (Kapso pauses a webhook that keeps failing), then WhatsApp your Jarvis number: /help' -ForegroundColor Green
Write-Host 'Before OpenRouter is set, "idea ..." and "research ..." already work; chat answers need the brain.'
