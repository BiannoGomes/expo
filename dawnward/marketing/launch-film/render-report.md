# Launch film · render report (2026-10-24)

## Output

- `dawnward-launch-film-60s.mp4`: 1080x1920, 30 fps, 1800 frames, 60.000 s, H.264 (crf 18, yuv420p), AAC 192k stereo 44.1 kHz, faststart. Plays start to finish (verified by full decode during contact-sheet extraction).
- Rendered deterministically: `film.html` seeked frame by frame (`window.SEEK(i/30*1000)`) in headless Chromium via `render60.mjs` (1800 frames in 158 s), muxed by `encode.sh`.

## Pipeline

anime.js v3 timeline (single source of truth for all motion) → Playwright frame capture → ffmpeg. Audio: `make-audio.sh` synthesizes the score from expressions (deterministic, seeded), mixed and limited in ffmpeg. No wall-clock dependence anywhere; identical input renders identical frames.

## Verification performed

- Stream specs probed (resolution, rate, frame count, audio codec) and matched the brief exactly.
- 16-point probe sheet before the first render; full 15-tile contact sheet from the actual MP4 after each encode; both inspected visually.
- Audio waveform rendered and inspected against the intended dynamic arc.
- One full QC round: three weaknesses identified on the rendered output (faint opening spark, spark crowding the headline, late CTA), fixed, fully re-rendered and re-encoded.

## Known limitations (honest)

1. The score is original in-pipeline synthesis (drones, filtered noise, synthesized notes). It is clean, restrained and rights-free, but it is not a composed orchestral track; swapping in a licensed or commissioned piece is a drop-in replacement in `encode.sh`.
2. Audio was verified by waveform and construction, not by ear; this environment has no audio output. Listen once before publishing.
3. Today, Debrief and Personal Model sequences use demonstration data rendered from the design-canon screens (pixel-faithful to the implemented UI); the Universe sequences are live app captures. Provenance is detailed in `storyboard-timing.md`.
4. The end-card CTA is a documented placeholder pending the approved store destination.

## Critique (scored on the rendered output, not the code)

1. Opening hook: 8. Dark, one light, one sentence; legible at phone size. Evidence: tiles 1 and the 1.5 s probe.
2. Emotional storytelling: 8. The lost-to-direction arc lands scene by scene; the pace drop at the payoff is real.
3. Visual originality: 8. The escape of the universe from the phone and the travel to Mind are the film's own; no template look.
4. Product clarity: 8. Five real surfaces are shown long enough to read; the viewer sees an actual app, not a concept.
5. Motion design: 7. Purposeful and restrained; the travel move is the only large gesture. The phone recede-and-return at 34.6/41.3 could be one continuous move with more engineering time.
6. Typography: 8. Cormorant carries every line; per-word blur entrances; nothing clipped at any probed frame; captions clear of platform overlay zones.
7. Sound design: 6. The arc is right and synchronized, but synthesis is not composition; this is the film's weakest layer by design honesty.
8. Brand coherence: 9. Every pixel is the Dawnward system: night, ivory, one gold, three faces, the real celestial assets.
9. Mobile readability: 8. Verified at 1080x1920 tiles; captions top-anchored, end card centered with safe margins.
10. Technical execution: 9. Exact spec, deterministic, two full renders, zero broken frames observed across both contact sheets.

Average 7.9. The single highest-leverage improvement remains a composed score.
