# OSS Radar — verified scan, 21 Sep 2026

> Bianno's ask: best free open-source voiceover, avatar, video, and dashboard/tracking
> repos "for free credits for life on top of Higgsfield." Every row below was verified
> against the live repo/announcement on 21 Sep — stars, license, EU-fitness, and fit on
> the actual rig (RTX 5060, 8GB VRAM). Doctrine filters applied: free-first, no agent
> sprawl (ARCHITECTURE v2), no fourth cockpit (GROWTH-OS correction 2), EU license check
> (Hunyuan precedent).

## Verdicts

| Repo | What | License | Verdict | Why |
|---|---|---|---|---|
| **heygen-com/hyperframes** | HTML → deterministic MP4 (headless Chrome + FFmpeg). 52.1K★, Node 22+, fully local, no HeyGen account. | Apache 2.0 | **INSTALL — biggest win of the batch** | Jarvis already writes world-class HTML (the bridge proves it). Typography/motion-graphic video — quote cards, stat reveals, carousel-to-reel, book promos — needs NO diffusion model and NO credits. Slots above Wan in the router. |
| **QwenLM/Qwen3-TTS** | TTS 0.6B/1.7B: voice DESIGN from a text description + 3-sec cloning, streaming, 10 languages incl. **Portuguese** + English. Beats ElevenLabs/MiniMax on WER (1.835%) & speaker similarity. | Apache 2.0 | **INSTALL — replaces Kokoro-82M in the queue** | Fits the 5060 easily (1.7B). Voice design = the bespoke "Jarvis voice" (British-butler archetype described in text — no real-person cloning, ever) AND PT-PT voiceovers for the dental market. Kokoro can't design or clone; this can. |
| **NVIDIA/personaplex** (7B full-duplex speech) | Real-time interruptible voice conversation. MIT code / NVIDIA Open Model weights. | permissive | **SKIP (hardware-gated)** | Needs 16–24GB VRAM; the 5060 has 8. Watchlist: revisit on quantized release or when revenue justifies a cloud GPU. World-class, wrong rig. |
| **xai-org/x-algorithm** | X's live For You ranking system (Grok-based), updated every 4 weeks since Jan 2026. | open | **READ, don't run** | Not a tool — intelligence. One Fable study session distills its ranking signals into the market graph. Low priority: Bianno's arena is IG, not X. |
| **openai/openai-agents-js** & other orchestrators | Multi-agent frameworks. | MIT | **SKIP — doctrine** | ARCHITECTURE v2, line one: the upgrade path is NOT more agents/frameworks. Fable/Hermes/workers exist; a second orchestration brain is sprawl. |
| **Plane / Huly / AppFlowy** (dashboards & tracking) | Self-hosted PM suites. | AGPL/EPL etc. | **SKIP — no fourth cockpit** | Canonical state = HQ db; view = Notion; memory = Obsidian. GROWTH-OS correction 2: slice 1 adds Kit + Calendly, nothing else. A PM suite before the first paying client is production-engine disease. |
| **MuseTalk (Tencent)** | Photo/video lip-sync, MIT, runs on ~4GB GPU. | MIT | **WATCHLIST** | Avatar Studio (Wav2Lip) is proven and free. Trial MuseTalk only if avatar quality becomes the binding constraint on a proven winner — router rule, not shiny-object rule. |
| Claude Code multi-provider router | Route Claude Code to other model providers. | — | **SKIP** | Bianno runs on a Claude subscription; a router adds config surface and zero income this month. |

## Router impact (applied in content-engine.md)
NEW Tier A0: **HyperFrames** for anything typographic/graphic in motion — deterministic,
brand-perfect (renders the actual brand CSS), zero credits, zero failure-rate roulette.
Wan2.2 stays Tier A for photoreal b-roll; Avatar Studio for talking head; Higgsfield
untouched as premium-on-winners. Voice: Qwen3-TTS becomes the planned local voiceover
tier (design + clone), Kokoro-82M demoted to fallback-only.

## Higgsfield for the dashboards — honest answer
Yes, bounded: use Higgsfield IMAGE credits once to generate a small brand-asset pack
(2–3 dark neural/nebula ambient backgrounds, node glyphs, one hero frame), embed them as
data: URIs in the bridge (its CSP blocks external image hosts) and freely in desktop
v3.5. That's a one-time ~zero-cost polish, not a burn. What stays doctrine: motion and
decoration must COMMUNICATE STATE (ARCHITECTURE v2) — no credit spend on chrome that
tells you nothing. The truly "exclusive world-class" move is HyperFrames rendering the
bridge itself into a daily 15s cinematic sitrep clip — free, and it's real telemetry.
(Note: the Higgsfield MCP connection failed in this session — asset generation runs
next session or from desktop.)

## Sources (verified 21 Sep 2026)
- https://github.com/heygen-com/hyperframes (52.1K★, Apache 2.0, Node 22+/FFmpeg/Chrome, local)
- https://github.com/QwenLM/Qwen3-TTS + https://qwen.ai/blog?id=qwen3tts-0115 (Apache 2.0, released 22 Jan 2026)
- https://github.com/NVIDIA/personaplex + DataCamp/collabnix VRAM guidance (16GB min, 24GB rec)
- https://github.com/xai-org/x-algorithm (published 20 Jan 2026, 4-weekly updates)
- https://github.com/hcengineering/platform, plane.so/open-source (evaluated, skipped)

## Council round — commander-approved verdicts (22 Sep)
Approved "all A, confirm all D". Full doctrine: LEARNING-LOOP.md.
| Tool | Verdict | Note |
|---|---|---|
| Promptfoo | **ADOPT** | MIT, local; the one eval harness (A1) |
| Inspect AI / DeepEval / Ragas | WATCHLIST | one-harness rule |
| AVTR-1 (avatar, 153M, 25fps on 8GB) | **QUEUED** | verified real; community license OK <$10M revenue, but InsightFace parts non-commercial → MediaPipe swap required before client work |
| Chrome MCP / Browser Use / Stagehand | **SKIP** | real-profile control = security anti-pattern; AGPL dep risk; official Playwright MCP only |
| DSPy / TextGrad | QUEUED | real, but need outcome volume the funnel doesn't have yet; A/B-the-prompt principle folded into experiment ledger |
| PostHog / Plausible / Infinite OS | SKIP | no analytics infra before first paying client (GROWTH-OS corr. 2) |
| WebArena-Verified / BrowserGym | SKIP | lab benchmark infra; A9 canaries cover it |
| OmniParser | SKIP | AGPL detector deps |
| Breeze TTS | SKIP | ~7.7GB VRAM + non-commercial weights |
| Self-Harness (arXiv:2606.09498) | mechanism ADOPTED via A3 weekly bounded harness edit | paper verified real (Shanghai AI Lab); council's quoted numbers were inflated — actual: up to 132% relative gains |
