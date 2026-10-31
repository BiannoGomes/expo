# 05. Proposed visual system

Goal: one system across the app, the web experience and the films. Today they share colours exactly. They differ in typeface, label style, type scale and motion values.

This proposal changes three owner-approved rules in `docs/design-direction.md`, and each one needs a yes:
- D1: the typefaces.
- D2: the label style.
- D3: the danger colour.

Everything else formalises what already exists.

## What exists today (observed)

| | App (`apps/mobile/lib/theme.ts`) | Web (`experience/index.html`, `src/tokens.js`) | Films (`marketing/remotion/src/theme.ts`) |
|---|---|---|---|
| Colours | Ground, Surface, Raised, Line, Ink, Dim, Faint, Gold, Danger (exact doctrine values) | same values as CSS variables, plus `--void #04060A` and glass | same |
| Display | Cormorant Garamond 300 to 500 | **Source Serif 4** | **Source Serif 4** |
| Body | Albert Sans 400/500 | **Source Sans 3** | **Source Sans 3** |
| Labels | IBM Plex Mono 9 to 11 px, UPPERCASE, +0.22em | Source Sans 3, sentence case | Source Sans 3, sentence case |
| Type sizes in use | 24 distinct values; `theme.type` defines 5 | CSS clamp scale | theme |
| Motion values | 10 distinct inline durations | `motion.tokens` (quick 240, base 420, slow 900; enter, settle and standard curves) | shared with web |
| Off-token colours | `#06080D` hard-coded as the universe background (3 places) | `#04060A` void | |

Why the web and films moved: the owner judged the earlier film type "very AI". Source Serif was chosen (choice A, "Source Serif (Recommended)") and has been used since. The app still carries the earlier look, so the product and its film don't match.

## D1. Typefaces: Source Serif 4 and Source Sans 3 everywhere
- **Display:** Source Serif 4, Regular 400 and Italic 400.
  - Use for headlines, the one question, beliefs and the Future Self.
  - Never bold. Weight comes from size and space.
- **Text:** Source Sans 3, 400 and 600.
- **Mono:** none. Numbers are rare in Dawnward by design, so mono has no job.
- **Licence:** both are SIL Open Font License 1.1 (Adobe), already self-hosted in `experience/fonts/`. For the app, use `@expo-google-fonts/source-serif-4` and `@expo-google-fonts/source-sans-3`, which needs approval.
- **Startup:** 4 font files instead of 8.

## D2. Labels: sentence case, 12 to 13 px, quiet
- Uppercase mono tracking reads as machine output, is harder for dyslexic readers, and some screen readers spell it out.
- **New label style:** Source Sans 3 600, 12.5 px, +0.02em, Faint (`#79818F`). Contrast is 4.62:1 on Surface and 4.93:1 on Ground.
- Remove "SCALE 1 · THE INTIMATE SKY" style internal wording entirely.

## D3. Danger lifts to `#C47A73`
The current `#B4655F` measures 4.29:1 on Surface for 14 px text, which fails AA. The new value measures:

| On | Contrast |
|---|---|
| Ground | 5.87:1 |
| Surface | 5.51:1 |
| Raised | 5.19:1 |

The hue is the same, so it stays reserved for "That's not right" and destructive confirms.

## Tokens (single source)
Proposal: one `packages/tokens/tokens.json` that generates:
- `apps/mobile/lib/tokens.ts`
- the CSS variables in `experience/`
- `marketing/remotion/src/theme.ts`

The values stay identical to today's unless marked new.

**Colour**

| Token | Value | Use |
|---|---|---|
| void | `#04060A` | universe background (replaces `#06080D`; **new: one value**) |
| ground | `#0B0E12` | room background |
| surface | `#12161D` | cards |
| raised | `#171C25` | sheets, pressed state |
| line | `#232A34` | hairlines |
| ink | `#ECE9E2` | text |
| dim | `#9AA0A9` | secondary text |
| faint | `#79818F` | labels |
| gold | `#C9A96A` | meaning only |
| danger | `#C47A73` | **changed** |
| atmosphere | `#4A5A7A` | nebula, never text |
| world tints | from `experience/src/tokens.js` `look` | atmosphere only |

**Type scale.** Six steps replace the 24 sizes in use. Each step allows Dynamic Type up to 1.3×, beyond which layouts wrap rather than clip.

| Step | Size / line height | Face |
|---|---|---|
| label | 12.5 / 16 | Sans 600, faint |
| small | 14 / 20 | Sans 400, dim; used for "Why I think this" |
| body | 16 / 25.6 | Sans 400, max 65ch |
| lead | 20 / 27 | Serif 400; beliefs, the quiet move |
| title | 30 / 36 | Serif 400 |
| display | 40 / 46 | Serif 400; invitation, reveal |

**Space and shape**
- Space: 8 px grid (4 allowed inside controls).
- Radius:
  - control 12 (**new name** for the 9 inline uses of 12 and 10)
  - card 14
  - sheet 22
- One shadow: `0 18px 48px rgba(0,0,0,.45)`, on floating elements only.

**Materials**
- Ground, Surface and Raised are opaque.
- **Glass** is used only for a panel over the universe:
  - Web: `rgba(16,20,27,.58)` with a 24 px blur.
  - App: `rgba(11,14,18,.82)` solid. A blur via `expo-blur` is optional, high tier only, and must be measured first.
- Glass never sits on glass.

**Motion.** The `motion.tokens` from web become the shared source.

| Token | Value | Use |
|---|---|---|
| instant | 0 ms | reduced motion |
| quick | 150 ms ease-out | state changes (doctrine) |
| press | 110 ms in, 180 ms out | already in `Press` |
| base | 420 ms, settle `cubic-bezier(.16,1,.3,1)` | panel arrival |
| slow | 900 ms | reveal words |
| travel | spring ω 5.2, critically damped (≈1.4 s to settle), reversible | replaces the fixed 1600 ms, keeps its feel |
| pullback | spring ω 4.4 (≈1.8 s), layers staggered 90 ms by depth | |
| deal | 340 ms, 60 ms stagger, 12 px rise | |

**Reduced motion.** Every token maps to an instant change or a 200 ms crossfade, as the doctrine requires.

## Haptic vocabulary (app)

| Moment | Haptic |
|---|---|
| Step done | light impact (exists) |
| Reflection sent and received | success notification, once |
| Arrive at a world | soft impact at settle |
| Dispute confirmed | selection |
| Errors | none (calm, never alarming) |

No sound in the app. That is doctrine: "No confetti. No sounds. Ever." Sound lives only in the web experience and the films.

## Components (shared names across app and web)

| Component | Exists as | Change |
|---|---|---|
| `Press` | `lib/motion.tsx` | becomes the only tappable primitive; adds haptic prop |
| `StepCard` | `SlotCard` in Today | unchanged look; outbox-backed |
| `BeliefCard` | two versions (World, You) | one version: statement, "Why I think this", dispute options, correction, undo |
| `WorldPanel` | World screen panel; web `.panel` | glass material, title, belief, quiet move, back |
| `BackToSky` | text link "← YOUR SKY" | sentence case, 44 pt target, triggers the pullback |
| `InlineNotice` | ad hoc dim text | one calm notice with an optional Retry |
| `Undo` | web constellation toast | port to app |
| `Field` | debrief `TextInput` | draft-backed, error state, voice row |
| `Label` | `theme.type.label` | new label style (D2) |

## Iconography and imagery
- Text-first; the arrow glyph stays.
- No icon set is needed for the Mind milestone.
- World art: the existing generated planets (owner assets). Ship them as WebP (see 04).
