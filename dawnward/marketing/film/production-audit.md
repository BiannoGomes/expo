# Dawnward film v4 · Phase 0 production audit

Date: 2026-10-26. Read-only inspection of the repository, tools and assets before any v4 production edit. Branch: `claude/becoming-product-brief-45v3ua`, clean tree at `9f287a7c`.

## Verified capabilities

| Claim from the handover | Verified | Evidence |
| --- | --- | --- |
| Deterministic HTML film with `window.SEEK(ms)` | Yes | `marketing/launch-film/film.html`, anime.js v3 timeline, autoplay off; v3 master rendered from it on 2026-10-25 |
| 1800-frame Playwright render pipeline | Yes | `render60.mjs` rendered 1800 frames in 331 s yesterday; per-frame video seeking waits for paint (double rAF) |
| ffmpeg assembly | Yes | ffmpeg 6.1.1 at `/usr/bin/ffmpeg`; `encode.sh` produced the 60.000 s master, H.264 + AAC |
| Chromium for capture | Yes | `/opt/pw-browsers/chromium` → chromium-1243; **no H.264 decode** in this build, so all b-roll must be VP9 WebM (already transcoded) |
| Cloned founder voice | Yes | 9 lines in `marketing/fx/vo/vo1-9.mp3`; regenerable via Higgsfield voice element "Bianno Voice" |
| Three Seedance clips | Yes | ocean-dawn, hand-star, nebula-flight; mp4 masters in `marketing/fx/broll/`, VP9 copies in `launch-film/broll/` |
| SFX pack | Yes | 8 synthesized assets in `marketing/fx/sfx/` plus recipes in `make-sfx.sh` |
| Celestial artwork | Yes | 7 artworks in `launch-film/assets/` and (alpha-baked variants) in `apps/mobile/assets/universe/` |
| Real app screens | Yes | `assets/universe-app.png`, `world-mind.png` are live captures of the running app; `today/debrief/you.png` are canon demonstration boards mirroring shipped screens (documented in `storyboard-timing.md`) |
| Motion presets | Yes | documented in `marketing/fx/README.md`, implemented in `film.html` |
| Fonts | Yes | Cormorant Garamond, Albert Sans, IBM Plex Mono self-hosted in `launch-film/fonts/` |
| Prior QA | Yes | `render-report.md` v1 (7.9), v2 (8.2), v3 (9.0 self-score) with contact sheets |

## Missing or broken components

- **ElevenLabs API**: the environment now allows `api.elevenlabs.io` (requests reach the real API), but the stored `ELEVENLABS_API_KEY` is a restricted-scope key with **no permissions**: `models_read`, `sound_generation`, `music_generation` and `voices_read` all return `missing_permissions`. External music and SFX are blocked until the owner regenerates the key with those scopes (ElevenLabs dashboard → API keys → permissions). Flagged to the owner; v4 proceeds with the upgraded in-house score as the working fallback and swaps the moment the key works.
- **No live campaign destination**: `dawnward/site/` exists in the repo only; nothing is deployed. No store listing, no waitlist URL. The end card must keep an honest placeholder; the final CTA is a flagged dependency, not inventable.
- **Live app re-capture**: the committed captures are faithful, but the dev container must re-export the Expo web build to capture any new screen states; the API/CORS limitation that forced canon boards for Today/Debrief/You still applies.

## Reusable unchanged

Render pipeline (render60.mjs + encode.sh pattern), fonts, celestial artwork, app captures, FX pack, the three Seedance clips, cloned voice for new lines, probe/contact-sheet QC method.

## Needs improvement (the v4 work)

1. Depth: single-plane composition; no perspective, parallax, light wrap or grounding shadows. Build a 2.5D layer system (CSS `perspective` + translateZ layer stacks, deterministic camera paths).
2. Edit: wall-to-wall narration, cuts on a schedule not on the music; whoosh-only transitions.
3. Score: no dynamics, no motif; rebuild cue-by-cue against the locked edit.
4. Captions duplicate the voice; rewrite to layer.
5. The universe reveal lacks resistance before it.
6. End card destination unresolved (owner dependency).

## Risks and constraints

- Chromium H.264 gap: every video asset must ship as VP9 WebM for render; keep mp4 masters for delivery reuse.
- Container restarts wipe `/tmp` frames and node_modules; everything durable must be committed (node_modules reinstalls from the committed package.json).
- Higgsfield provides TTS (the cloned voice) and video/image generation; it has no music model, so music is in-house or ElevenLabs-after-rescope.
- Rate limits: Higgsfield batch tools occasionally 429; retry solo.

## Decisions required from the owner

1. Regenerate the ElevenLabs key with music + sound-effects + TTS scopes (unlocks the external score).
2. Name the real CTA destination when one exists (site deploy or waitlist).

No production files were changed during this audit.
