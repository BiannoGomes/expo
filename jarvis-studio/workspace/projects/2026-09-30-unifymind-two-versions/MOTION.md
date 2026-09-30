<!-- studio: activated from brands/unifymind/MOTION.md · sha c3ccc1f70204 · 2026-09-30. Edit the SOURCE, then re-activate. -->
# UnifyMind · MOTION.md

> **Status.** Static values are CONFIRMED from the published carousel system (the
> `content-wave` skill). Every motion value is **PROPOSED**: derived from that static system and
> the brief's principle, *"motion should make an idea feel inevitable"*. PROPOSED values can
> be used for drafts. Bianno confirms or overrides them after watching the first piece, and
> the retro records his call.

| # | Field | Value | State |
|---|---|---|---|
| 1 | Colour palette | `#0B0E14` ink (bg top) · `#05070B` void (bg bottom) · `#EEE9DC` bone (text) · `#E0A83E` gold (accent) · `#787E8A` grey (meta) | CONFIRMED |
| 2 | Colour hierarchy | Dark field dominates, about 85% of the frame. Bone carries meaning. Gold marks **one** phrase per frame, never two. Grey is metadata only. | CONFIRMED (one gold phrase) + PROPOSED (ratio) |
| 3 | Typography | Inter SemiBold for everything. One family. | CONFIRMED |
| 4 | Font sizes | 4:5 → body 60–80 px, wordmark 40 px (CONFIRMED). 9:16 → PROPOSED hero 96–120 px, body 64–84 px, meta 32 px. 16:9 → PROPOSED hero 88–104 px, body 52–64 px. | mixed |
| 5 | Weight hierarchy | SemiBold only. Hierarchy comes from size, colour and space, never weight. | CONFIRMED (single weight in use) |
| 6 | Tracking | PROPOSED: hero −0.02 em · body −0.01 em · wordmark and labels +0.08 em uppercase | PROPOSED |
| 7 | Leading | 1.28× body (CONFIRMED). PROPOSED 1.12× for hero lines of 96 px and up. | mixed |
| 8 | Spacing | 4:5 left margin 80 px (CONFIRMED). 9:16 PROPOSED: 96 px side margins, with text inside the universal safe zone (see `platform-specs.md`). | mixed |
| 9 | Frame rate | PROPOSED 30 fps for social | PROPOSED |
| 10 | Timing language | PROPOSED: micro 200 ms · standard 450 ms · hero 800 ms. Line stagger 110 ms. A line holds long enough to read aloud once, plus 400 ms. Nothing idles for more than 1.5 s without a reason. | PROPOSED |
| 11 | Entrance | PROPOSED: lines **rise into place** 32 px with opacity 0 → 1 over 800 ms (hero) or 450 ms (body), staggered top to bottom. The gold phrase arrives **last**, like a conclusion landing. No scale-from-zero, no blur-in. | PROPOSED |
| 12 | Exit | PROPOSED: faster than the entrance: 300 ms, opacity to 0 with a 16 px upward drift. Or a clean cut on the beat. | PROPOSED |
| 13 | Transitions | PROPOSED: (a) hard cut on the beat, the default; (b) **the gold underline bar as the only wipe**: the 95×5 bar stretches across the frame and becomes the transition. It's a real brand element, so it's allowed as a motif. No other wipes, zooms or whips. | PROPOSED |
| 14 | Easing | PROPOSED (matches Emil Kowalski's standard curves): entrances `cubic-bezier(0.23, 1, 0.32, 1)`, which is GSAP `power4.out` · on-screen moves, the gold-bar wipe and exits `cubic-bezier(0.77, 0, 0.175, 1)`, which is GSAP `power3.inOut` · camera drift `none` (linear) · **no back, elastic or bounce eases, ever** | PROPOSED |
| 15 | Camera | PROPOSED: static on type-only frames. Hook photos get a slow push-in, scale 1.00 → 1.04 over the shot, linear. No shake, no whip-pans. | PROPOSED |
| 16 | Depth | PROPOSED: two planes at most (photo, then type). Parallax 1 : 1.15 if the photo drifts. No fake 3D. | PROPOSED |
| 17 | Texture | Clean digital type over dark. Texture lives only in photography. | CONFIRMED (carousels) |
| 18 | Grain | Film grain in hook photos (CONFIRMED). PROPOSED: static grain overlay at 3–4% opacity on type-only frames, for continuity with the photos. Not animated. | mixed |
| 19 | Lighting | Subtle top glow on the background (CONFIRMED). No other glows. No text glow, ever. | CONFIRMED |
| 20 | Material | Matte and ink-dark. Nothing glossy, no glass, no chrome. | PROPOSED |
| 21 | Shadows | None. | PROPOSED (none observed) |
| 22 | Borders | None, except the gold underline bar (95×5 px) as the one rule. | CONFIRMED |
| 23 | Shapes | The gold bar and the gold dot. Nothing else. | CONFIRMED (footer dot, header bar) |
| 24 | Image treatment | Cinematic, painterly realism, film grain, darkness left for type. Bottom gradient from 52% → 100% at up to 235 alpha. "No text, no watermark." Book covers used exactly as-is. | CONFIRMED |
| 25 | UI treatment | ASK ME. (No product UI appears in UnifyMind content yet.) | ASK ME |
| 26 | Audio | ASK ME: music genre and energy? PROPOSED default: one sparse instrumental bed (piano or low strings), no SFX on text, silence allowed before the key line. | ASK ME / PROPOSED |
| 27 | Accessibility | Measured WCAG contrast on `#0B0E14`: bone 15.9:1 · gold 9.1:1 (both pass AAA) · grey 4.7:1 (AA only, so grey is for meta text of 32 px and up). PROPOSED: no text under 32 px on 9:16, no flashes, burned-in captions whenever there's voice. | CONFIRMED (ratios) + PROPOSED (rules) |
| 28 | Reduced motion | Web and UI only: replace rises with 200 ms opacity fades, no push-ins. | PROPOSED |
| 29 | Never | 1. Two gold phrases in one frame. 2. Em-dashes. 3. Bounce, elastic or scale-from-zero. 4. Text glow, neon or gradients on type. 5. Showing the vessel, guests or location (the NDA rule). | CONFIRMED (1, 2, 5) + PROPOSED (3, 4) |

## 30. Shot-by-shot example (PROPOSED, 9:16, 10 s)

| Time | Shot | Motion |
|---|---|---|
| 0.0–0.3 | The dark field is already lit by its top glow. The wordmark is small at the top, already present. **No empty frame.** | Static. |
| 0.3–2.6 | Hook, three lines, bone, 104 px. | Lines rise 32 px, 800 ms `power4.out`, 110 ms stagger. The last line's key phrase turns gold 300 ms after landing. |
| 2.6–2.9 | Transition. | The gold bar extends from under the wordmark across the frame (300 ms, `power3.inOut`), and the old lines exit upward under it. |
| 2.9–6.8 | Body idea, two short lines. | Rise 450 ms. Hold. Only the one gold phrase is gold. |
| 6.8–7.1 | Transition. | Hard cut on the beat. |
| 7.1–10.0 | CTA: "Comment WARRIOR for the link ▶" (Book 1), gold, centred. | Rises once, holds to the end. No looping pulse. |

## Frame tokens (HyperFrames)

Machine-readable tokens for `activate-brand`, which writes them as the frontmatter of the
project's `frame.md`. HyperFrames treats `frame.md` frontmatter as brand truth. Colours and
the typeface are CONFIRMED. Pixel sizes and spacing are PROPOSED, like the fields above.

```yaml
version: alpha
name: UnifyMind · Frame
description: >
  Generated from brands/unifymind. Dark ink field with a subtle top glow, bone type, ONE gold
  accent phrase per frame, Inter SemiBold only. Motion makes an idea feel inevitable: lines rise
  into place, the gold phrase lands last, cuts on the beat, no bounce, no glow, no em-dashes.
unit: the frame · 1080×1920 primary; 1080×1350 and 1920×1080 documented
principle: one idea per frame · one gold phrase · real words only · numbers come from facts.md
colors:
  bg-top: "#0B0E14"
  bg-bottom: "#05070B"
  text-primary: "#EEE9DC"
  accent: "#E0A83E"
  text-meta: "#787E8A"
typography:
  hero:     { fontFamily: "Inter", px: 104, weight: 600, lineHeight: 1.12, tracking: "-0.02em", color: "text-primary" }
  body:     { fontFamily: "Inter", px: 72,  weight: 600, lineHeight: 1.28, tracking: "-0.01em", color: "text-primary" }
  wordmark: { fontFamily: "Inter", px: 40,  weight: 600, tracking: "0.08em", upper: true }
  meta:     { fontFamily: "Inter", px: 32,  weight: 600, color: "text-meta" }
spacing:
  pad-x: "96px"
  safe-top: "269px"
  safe-bottom: "672px"
components:
  background:
    background: "linear-gradient(180deg, {colors.bg-top}, {colors.bg-bottom})"
    description: "Always present from frame 0, with a subtle top glow. Never flat black, never another gradient."
  gold-bar:
    backgroundColor: "{colors.accent}"
    size: "95×5px under the wordmark"
    description: "The only rule and the only allowed wipe: it may stretch across the frame as a transition."
  gold-dot:
    backgroundColor: "{colors.accent}"
    rounded: "50%"
    description: "Footer marker only."
  accent-phrase:
    textColor: "{colors.accent}"
    description: "Exactly one phrase per frame. It arrives last."
```
