# Medium router: which tool makes each shot

Decide per **shot**, not per project. Code first where code is strongest. Free before paid.
**Paid and outward actions always get proposed first and run only on Bianno's explicit yes.**

## 1. Pick the medium

| The shot needs… | Medium | Tool (first choice → fallback) | Cost |
|---|---|---|---|
| Kinetic type, UI, charts, diagrams, data, abstract geometry, structured transitions | **Code** | HyperFrames composition → Charlie's specialist skill + the bridge (`hyperframes-bridge.md`) | Free |
| Photoreal people, lifelike places, organic cinematic imagery | **Generative image/video** | Higgsfield `generate_image` / `generate_video` (the connector `content-wave` already uses for hook photos) → OpenArt | **Credits: approval** |
| Real product on screen | **Real capture** | Screenshots or a screen recording of the actual product. Never a mock presented as real. | Free |
| Cutting raw talking-head footage (fillers, dead air, best take) | **Edit** | `auto-editor` (free, local) → `video-use` (needs an ElevenLabs key) | Free / paid |
| Long video → shorts with a speaker-tracking crop | **Edit** | `clipify` | Free |
| Captions | **Code** | HyperFrames captions (local whisper) → `auto-editor` SRT | Free |
| Voice cleanup (a noisy phone recording) | **Audio** | Adobe `media_enhance_speech` → ElevenLabs voice isolation | Adobe plan / **credits** |
| Voiceover | **Audio** | Bianno's own voice (always best for a personal brand) → HyperFrames TTS (Kokoro, local) → ElevenLabs | Free / **credits** |
| Music | **Audio** | Pixabay (commercial use OK, no attribution, per HyperFrames CREDITS.md) → ElevenLabs Music (paid plan) → Lyria (needs a Gemini key) | Free / **credits** |
| SFX | **Audio** | HyperFrames Pixabay SFX → ElevenLabs SFX | Free / **credits** |
| Static social graphics, carousels, thumbnails | **Design** | The `content-wave` skill (UnifyMind carousels) → Canva connector → `canvas-design` | Free |
| Background removal, upscale, reframe | **Image ops** | Adobe for creativity → Higgsfield `remove_background` / `upscale_*` / `reframe` | Plan / **credits** |
| Vector animation for web (logo sting, Lottie JSON) | **Code** | `diffusionstudio/lottie` | Free |
| Math-style explainer | **Code** | `manim-video` (ships inside `video-use`) | Free |

## 2. Licence traps (hard rules)

- **Never use HyperFrames' MusicGen fallback (`facebook/musicgen-small`) in anything that
  promotes a product, book or service.** Its weights are CC-BY-NC 4.0 (non-commercial). It
  is only used when no `GEMINI_API_KEY` is set. Use Pixabay or a licensed track instead.
- ElevenLabs free-tier output: commercial rights and attribution rules are UNVERIFIED as of
  2026-09-30, so check the current plan terms before using it in a monetised piece.
- Every generated image, video or track gets a row in `asset-manifest.md`: model, prompt, date, licence.
- Generated imagery never depicts a real, identifiable person other than Bianno, and never
  fakes a testimonial, a customer, a crowd at an event, or a product that doesn't exist.

## 3. The approval gate (constitution §28)

Before any call that **spends credits or money** (Higgsfield, OpenArt, ElevenLabs, fal,
paid Adobe ops) or **publishes or sends** (Higgsfield `tiktok_publish`, any social post,
email, upload to a public place), stop and propose:

> **Proposed:** generate 2 hook images with Higgsfield `nano_banana_pro`, 4:5, about N credits
> (check `balance` first). Prompt: "…". Reason: shot 1 needs a photoreal diver, which code
> can't do honestly. **Yes / no?**

Run it only after an explicit yes for *that* action. A yes doesn't carry over to the next
generation, and neither does a batch approval unless Bianno says "approve the batch".

## 4. Sea / NDA check (UnifyMind, Becoming Project)

Before using **any** footage or photo shot on or around a vessel: *"Does this show the vessel,
guests or location?"* If yes or unclear, don't use it. See the brand's `brand.md`.
