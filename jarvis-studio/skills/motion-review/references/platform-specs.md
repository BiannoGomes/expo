# Platform specs (sourced · researched 2026-09-30)

Machine-readable version: `platforms.json`. **OFF** = official platform page · **3P** =
reputable third party · **DERIVED** = computed from sourced numbers. The research proxy
blocked direct page fetches, so values were confirmed from search extracts of the cited pages.
Re-verify every 6 months.

## The export master (DERIVED, uploads cleanly everywhere)

- **1080×1920 (9:16) · 1080×1350 (4:5) · 1920×1080 (16:9)**, square pixels
- **MP4** (never MOV: LinkedIn no longer accepts it [L1]) with `+faststart` and no edit lists [Y1][M5]
- **H.264 High, yuv420p, BT.709 tags, progressive, constant 30 fps** (X organic caps at 40 fps [X1])
- Video 8–12 Mbps for 1080p [Y1], never over 25 Mbps [M5][X1]
- **AAC-LC 48 kHz stereo**, 128–384 kbps [Y1][M5]
- **3–140 s and ≤300 MB** passes Reels, TikTok, Shorts, LinkedIn and X free [M5][L1][X1]

```bash
ffmpeg -i in.mp4 -c:v libx264 -profile:v high -pix_fmt yuv420p -r 30 -g 15 -bf 2 \
  -b:v 12M -maxrate 20M -bufsize 24M -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -af loudnorm=I=-14:TP=-1 -c:a aac -ar 48000 -ac 2 -b:a 256k -movflags +faststart out.mp4
```

## 9:16 safe zones at 1080×1920

| Zone | Top | Bottom | Left | Right | Source |
|---|---|---|---|---|---|
| Meta Reels ads | 269 (14%) | 672 (35%) | 65 (6%) | 65 (6%) | OFF [M1][M2] |
| IG Reels organic | 220 | 420 | – | – | 3P [M11] |
| TikTok | 130 | 484 | 44 | 140 | 3P [T6]. The OFF zone shrinks as the caption grows [T1]. |
| YouTube Shorts | 180 | 390 | 60 | 120 | 3P [Y9]. OFF publishes templates only [Y7]. |
| **Universal strict** | **269** | **672** | **65** | **140** | DERIVED: the max of each side above |
| Universal relaxed | 220 | 484 | 60 | 140 | DERIVED: organic 3P maxima |

- **Strict safe rectangle: x 65–940, y 269–1248 (875×979).** Captions, the CTA, faces
  and logos belong here.
- **Relaxed: x 60–940, y 220–1436.** Supporting type may reach here on organic posts.
- **Covers:** anything that must survive the 3:4 grid, 4:5 and the 1:1 crops lives in
  **the centre 1080×1080 (y 420–1500)**. Shorts ads can compress to 1:1 [Y6].

## Per platform

| Platform | Duration | fps | Size | Notes |
|---|---|---|---|---|
| Instagram Reels | 3 s–15 min (API); over 3 min isn't shown to new audiences | 23–60 (API); Help Center says ≥30 | 300 MB (API) | Cover 420×654 recommended (OFF); the grid crops to 3:4 (3P) [M4][M5][M10] |
| Instagram 4:5 | Posts as a Reel when under 15 min | as Reels | as Reels | 1080×1350 organic [M6][M9] |
| TikTok | Up to 10 min (API) | 23–60 | 4 GB (API) | Safe zone depends on caption length [T1][T3] |
| YouTube Shorts | Up to 3 min | recorded rate | – | Thumbnail 9:16, 2160×3840 recommended [Y4][Y5] |
| YouTube | 15 min unverified, up to 12 h | 24–60 | 256 GB | H.264 High, closed GOP fps/2, BT.709 [Y1][Y3] |
| LinkedIn | 3 s–15 min desktop (10 min mobile) | 10–60 | 5 GB | **MP4 only**. SRT captions on desktop only [L1][L3] |
| X | 140 s (non-Premium) | **≤40** | 512 MB | Max 1200×1900 vertical, so 1080×1920 gets downscaled [X1] |

## Loudness

| Target | Value | Status |
|---|---|---|
| **Studio default** | **−14 LUFS integrated ±1 LU, true peak ≤ −1 dBTP**. Speech-only pieces may sit at −16. | DERIVED |
| YouTube | −14 LUFS, turn-down only | 3P measured [L-3P]. YouTube publishes "stable volume" only [Y8]. |
| Instagram / Facebook | Normalised with xHE-AAC metadata; the number isn't published | OFF [M8] |
| Spotify (closest official analogue) | −14 LUFS, TP ≤ −1 dBTP | OFF [S1] |
| AES TD1008 | Speech −18 LUFS, music ≤ −16 LUFS | OFF [A1] |

## Accessibility

- **Flashes (WCAG 2.3.1, Level A):** no more than 3 flashes in any 1 s, where a flash is an
  opposing luminance change of 10% or more and covers more than 25% of a 10° field. Any
  saturated-red transition counts [W1][W3]. For full-screen vertical video, use the
  broadcast rule: **more than 25% of the frame at more than 3 per second fails** [I1][O1].
- **Captions:** prerecorded video with speech needs captions (WCAG 1.2.2) [W2].
  - Netflix: 42 characters per line, 2 lines, ≤20 characters per second, on screen 5/6 s to 7 s [N1].
  - BBC 9:16: about 25 characters per line within 90% of the width, ≤3 lines, kept in the central 75% of the height, line height 4.5% of the frame height (about 86 px) [B1].
  - **Inside the strict safe width, plan for about 22 characters per line** (DERIVED).
- **Motion:** web or UI loops over 5 s need a pause control (WCAG 2.2.2). Honour
  `prefers-reduced-motion`.

## Known conflicts (verify before relying on them)

1. Instagram fps: the Help Center says ≥30, the API says 23–60. **Export 30.**
2. X fps: organic caps at 40, ads allow 60. **Export 30.**
3. YouTube thumbnail: now 3840×2160 / 50 MB (it used to be 1280×720 / 2 MB).
4. Reels cover: the official size is 420×654, but common practice is 1080×1920.
5. LinkedIn and X publish no safe zones or loudness targets.
6. The TikTok and Shorts pixel margins are 3P only.

## Sources

[Y1] support.google.com/youtube/answer/1722171 · [Y3] …/71673 · [Y4] …/72431 · [Y5] …/15424877 ·
[Y6] support.google.com/google-ads/answer/16041697 · [Y7] …/13547298 + services.google.com/fh/files/misc/universalsafezones-youtube.pdf ·
[Y8] support.google.com/youtube/answer/14106294 · [Y9] postplanify.com/tools/youtube-shorts-safe-zone-checker ·
[M1] facebook.com/business/ads-guide/update/video/instagram-reels · [M2] …/image/instagram-reels ·
[M4] help.instagram.com/1038071743007909 · [M5] developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/ ·
[M6] help.instagram.com/1631821640426723 · [M8] engineering.fb.com/2023/04/11/video-engineering/high-quality-audio-xhe-aac-codec-meta/ ·
[M9] techcrunch.com/2022/07/21/instagram-video-posts-shorter-than-15-minutes-now-shared-reels/ · [M10] routenote.com (IG grid 3:4) ·
[M11] ignitesocialmedia.com/content-creation/what-are-the-safe-zones-for-tiktoks-and-instagram-reels/ ·
[T1] ads.tiktok.com/help/article/tiktok-auction-in-feed-ads · [T3] developers.tiktok.com/doc/content-posting-api-media-transfer-guide ·
[T6] cadenus.io/resources/blog/tiktok-safe-zone/ · [L1] linkedin.com/help/linkedin/answer/a1311816 · [L3] …/a552177 ·
[X1] help.x.com/en/using-x/x-videos · [S1] support.spotify.com/us/artists/article/loudness-normalization/ ·
[A1] aes.org TD1008 v3.13 · [L-3P] criticallisteninglab.com/en/learn/loudness/youtube ·
[W1] w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html · [W2] w3.org/TR/WCAG22/ · [W3] w3.org/WAI/WCAG22/Techniques/general/G176 ·
[I1] ITU-R BT.1702-3 · [O1] ofcom.org.uk gn_flash.pdf · [N1] partnerhelp.netflixstudios.com/hc/en-us/articles/217350977 · [B1] bbc.github.io/subtitle-guidelines/
