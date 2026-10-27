# The Becoming Project · MOTION.md

> **Status:** the full visual system exists and is CONFIRMED, but it lives in the vault:
> `BIANNO  THE BECOMING PROJECT/brand/2026-09-30-brand-visual-system.md` and `brand-tokens.css`.
> This copy only records what the handover stated directly. For every other field: **read the vault
> file; don't guess and don't copy stale values here.** Inside that folder, the `becoming-video` pipeline
> imports the tokens CSS itself, so this file matters only outside it.

| # | Field | Value | State |
|---|---|---|---|
| 1 | Colour palette | The vault tokens CSS is canonical, but its hex values were never handed over. Until it's read, use the values from Reel 01 v5, the build Bianno liked (06.10.2026): night `#04070B` · abyss `#05080C` · ocean `#13283D` · line gold `#D8A45F` · pale gold `#E8C99B` · lit cream `#F2E3C4` · ink `#F2EDE4` · stone `#EFE9DF` · dim `#D9D2C6` · mist `#9AA1A9` · passivity grey `#808891` · wall `#D6E4F5` · teal `#6E9C98`. One accent per frame: the gold. | PROPOSED: de facto values from Reel 01 v5 `build_v5.py` (Bianno liked its gold line, 06.10.2026). Confirm, or replace with the vault CSS |
| 2 | Colour hierarchy | See vault §. | CONFIRMED in vault |
| 3 | Typography | Cinzel (caps titles and keywords), Cormorant Garamond with italic (hook, lines, word-by-word captions), Inter (tracked labels and the mark). All SIL OFL 1.1. Local copies: `workspace/library/becoming/fonts/`. | CONFIRMED in vault (families); local files added 27.10.2026 |
| 4 | Font sizes | See vault. | CONFIRMED in vault |
| 5 | Weight hierarchy | See vault. | CONFIRMED in vault |
| 6 | Tracking | The mark **"THE BECOMING PROJECT"** in Inter, tracked about .5em. **Never his name on a frame**, spaced or not. Cinzel keywords about .12–.18em. Never tween letter-spacing. | CONFIRMED (Bianno, 06.10.2026, Cowork handover: "Never put 'Bianno' on slides or frames"; replaces the 30.09 spaced wordmark) |
| 7 | Leading | See vault. | CONFIRMED in vault |
| 8 | Spacing / safe zone | Text and captions inside **x 80–940, y 250–1500**. Covers: the centre 1080×1440. | CONFIRMED (handover) |
| 9 | Frame rate | 30 fps | CONFIRMED (handover) |
| 10 | Timing language | **Text-ins 0.6–0.9 s**, slow eases | CONFIRMED (visual system §6, via becoming-video) |
| 11 | Entrance behaviour | Slow eased text-ins; see vault §6 | CONFIRMED in vault |
| 12 | Exit behaviour | See vault §6. | CONFIRMED in vault |
| 13 | Transition language | See vault §6. | CONFIRMED in vault |
| 14 | Easing | **Slow eases, no bounce** | CONFIRMED (visual system §6) |
| 15 | Camera | **Gentle push-ins** | CONFIRMED (visual system §6) |
| 16 | Depth | See vault. | CONFIRMED in vault |
| 17 | Texture | See vault + `brand/reference/2026-09-30-moodboard-notes.md` | CONFIRMED in vault |
| 18 | Grain | See vault. | CONFIRMED in vault |
| 19 | Lighting | See vault. | CONFIRMED in vault |
| 20 | Material | See vault. | CONFIRMED in vault |
| 21 | Shadows | See vault. | CONFIRMED in vault |
| 22 | Borders | See vault. | CONFIRMED in vault |
| 23 | Shapes / motifs | **Gold compass star** · "THE BECOMING PROJECT" mark. **Never "Bianno" on a slide or frame** (06.10.2026); sources and credits go in the caption. | CONFIRMED (handover 06.10.2026) |
| 24 | Image treatment | Real footage first. AI only for backgrounds, textures, abstract b-roll and diagrams; photoreal AI gets flagged for the AI label. **Never an AI person.** | CONFIRMED (handover) |
| 25 | UI treatment | Jarvis Experiments (format C) show real screens only. | CONFIRMED (real-numbers + no-fake-UI rules) |
| 26 | Audio | His real voice, or his **labelled AI twin** (Suno makes the voice only). **Music on every post:** the Night Watch tension score (watch tick, a hit on every turn, stings A-E-D / E-D-A, nothing below 60 Hz). **No piano.** Mix rules: brand.md rule 10. | CONFIRMED (handover 06.10.2026) |
| 27 | Accessibility | Burned-in captions inside the safe zone | CONFIRMED (becoming-video §2) |
| 28 | Reduced motion | – (video only) | n/a |
| 29 | Never | 1. An AI face or body of Bianno. 2. Unverified stories. 3. Fake numbers or badges. 4. Bounce. 5. Generic quote cards, hype words, exclamation marks. 6. His name on a frame. 7. A piano bed. | CONFIRMED (handover) |

## 30. Shot-by-shot example

The first real piece is planned in START HERE: **Format A Story Reel** from his 60–90 s Matroosberg telling,
once it's recorded and verified. The end-card template (gold compass star, "THE BECOMING PROJECT", dark earth, slow fade-in; never his name) is
the setup test in START HERE §4.

## Frame tokens (HyperFrames)

Not filled on purpose: inside the Becoming folder, compositions import `brand/2026-09-30-brand-tokens.css`
directly (the `becoming-video` pipeline requires it). Outside that folder, copy the tokens into this block
from the vault file, never from memory.

```yaml
# intentionally empty: use brand/2026-09-30-brand-tokens.css
```
