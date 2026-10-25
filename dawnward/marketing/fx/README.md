# The Dawnward FX library

One place for every reusable piece of the film and advert pipeline. Everything here is original or owner-generated; nothing needs clearance.

## Sound (`sfx/`, built by `make-sfx.sh`)

| File | Use | Mix level |
| --- | --- | --- |
| whoosh.wav | streak wipes, hard cuts | -16 dB |
| riser.wav + riser-air.wav | the 3 s build into a reveal | -18 dB |
| boom.wav | a soft landing after a reveal, never a trailer slam | -14 dB |
| shimmer.wav | a sky or constellation appearing | -18 dB |
| star-chime.wav | one star is born | -16 dB |
| tick.wav | interface cues on screen changes | -20 dB |
| breath.wav | low swell under scene openings | -20 dB |

## Voice (`vo/`)

The founder narration, generated in Bianno's own cloned voice (Higgsfield reference element "Bianno Voice", ElevenLabs engine). Nine lines matching the launch-film scenes; filenames carry the line numbers. Regenerate any line with `generate_audio` using voice element `fb325aae-153f-4544-a7a4-ce7c39cfc896`.

## Cinematic b-roll (`broll/`)

Seedance 2.5, 9:16, 1080p, 6 s, silent (score carries sound):
1. `ocean-dawn` — slow dolly over a dark ocean at first light.
2. `nebula-flight` — drifting through slate-blue nebula toward warm light.
3. `hand-star` — a hand releases one gold point of light into the night.

## Motion presets (the timeline recipes, source: `../launch-film/film.html`)

All anime.js v3, deterministic, seekable. Copy the `tl.add` blocks:

- **Word blur-in**: per-word `opacity 0→1, translateY 26→0, blur 14→0`, 700 ms, stagger 130-150 ms.
- **Streak wipe**: rotated gold gradient bar, blur 34 px, `translateX -2200→2400` in 750 ms easeInQuart, opacity capped .65.
- **Card cascade**: `translateY 44→0 + fade`, 650 ms, stagger 240 ms, easeOutQuart.
- **Star-seed (the kept-card moment)**: gold edge `scaleY 0→1` 450 ms, corner star `scale .5→1.4→1` with glow, task text dims to `#9AA0A9`.
- **Typing**: per-char opacity stagger 56 ms with a gold caret that dies at the last char.
- **Listening EQ**: five bars, `scaleY` keyframe walks (340 ms steps), stagger 60 ms, easeInOutSine; dot opacity breathes 400 ms cycles.
- **Dolly travel (scale 1→2)**: whole layer `scale 1→2.1..2.6, translate toward target`, 1600-3400 ms easeInOutCubic.
- **Orbit/arc draw**: SVG `stroke-dashoffset full→0`, ~1000 ms easeInOutSine.
- **Panel arrival**: children `translateY 22→0 + fade`, 520 ms, stagger 130 ms, easeOutQuart (canon moment III).
- **Ken Burns**: `scale 1→1.05` linear over the shot's full hold.
- **Glow breath**: radial gold div opacity keyframes `.38→.22→.38` over ~7 s.

## Score

`../launch-film/compose-score.py` is the in-house composer (note-list driven). For external music, ElevenLabs Music via the account key once `api.elevenlabs.io` is on the environment's allowed domains; drop the track in as `audio/music.wav` and re-run `encode.sh`.
