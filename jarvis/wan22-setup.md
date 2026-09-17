# Wan2.2 local video tier — install & routing runbook (2026-09-17)

> Goal: Wan2.2 TI2V-5B running in Bianno's existing ComfyUI (RTX 5060, torch cu130 already
> working — Avatar Studio proved the rig on 9 Sep) as video Tier A: free volume + fallback
> when Higgsfield credits run dry. Filenames/screens drift between ComfyUI releases — adapt
> where reality differs; the shape holds. License: Wan2.2 is Apache 2.0 (full commercial
> use). HunyuanVideo stays SKIP — its community license excludes the EU.

## A · Manual install (Bianno, ~30 min mostly downloads)
0. ≥25GB free disk. ComfyUI Manager → Update ComfyUI → restart (needs a recent build for
   Wan2.2 templates).
1. From Hugging Face `Comfy-Org/Wan_2.2_ComfyUI_Repackaged` (split_files/):
   - `wan2.2_ti2v_5B_fp16.safetensors` → `ComfyUI/models/diffusion_models/`
   - `wan2.2_vae.safetensors` → `ComfyUI/models/vae/`  (NOT the old Wan2.1 VAE)
   - `umt5_xxl_fp8_e4m3fn_scaled.safetensors` → `ComfyUI/models/text_encoders/`
2. Restart → Workflow → Browse Templates → Video → "Wan 2.2 5B video generation".
3. First render: 704×1280 (9:16), 121 frames @ 24fps (5s), ~20–30 steps. TIME IT —
   the benchmark goes to the HQ heartbeat/ledger, never guessed.
4. OOM on 8GB: relaunch `--lowvram`; still OOM → ComfyUI-GGUF custom node + Q5/Q4 GGUF
   quant of TI2V-5B (city96 repackage) via the GGUF loader.
5. Speech-to-video: do NOT install Wan S2V-14B (too heavy for the 5060). Talking-head
   stays on the existing Avatar Studio (Wav2Lip) — proven, free.

## B · Desktop Jarvis wiring
1. Drive ComfyUI via its local API (default `127.0.0.1:8188`, POST /prompt): build
   queue → render → verify (open the file, check duration/format) → store → log event.
2. Create `vault/brand/BRAND-KIT.md`: palette, fonts, tone rules, visual motifs, banned
   clichés, standing negative prompts. Create `vault/brand/stills/` with ~15 approved
   start-frames (KDP portrait, best Higgsfield frames, UnifyMind visual world).
3. HARD RULE — brand alignment on the free tier: every Wan generation uses (a) the
   brand-kit prompt block and (b) an approved start-frame (TI2V start image). No naked
   prompts. Critic checks output against BRAND-KIT.md before anything queues for a human.
4. Log the benchmark (seconds per 5s clip, VRAM mode used) to hq/heartbeat and the
   experiment ledger.

## C · Routing rules (Jarvis applies automatically)
| Content | Engine |
|---|---|
| Carousels / statics | No video model — carousel pipeline (typography, not diffusion) |
| B-roll, hook visuals, tests, volume shorts | Wan2.2 TI2V-5B local (brand start-frame + kit) |
| Talking-head / avatar | Avatar Studio (Wav2Lip) |
| Hero content on a PROVEN winner | Higgsfield router — credits earn their keep here only |
| Higgsfield credits exhausted | Wan best-effort ships now; hero re-render queued for credit refresh |

Discovery is always local. Premium is never for experiments. Real cost of "free" includes
GPU time, failure rate, and correction time — the benchmark keeps that honest.

## D · Definition of done
One 5s vertical clip rendered from an approved brand still, verified by opening the file,
benchmark logged to the HQ db, routing rules live in the desktop CLAUDE.md. Then this tier
is ARMED on the Neural Index.
