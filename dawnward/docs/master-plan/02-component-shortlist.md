# 02. Vetted component shortlist and source verification

These are research and implementation sources, not authorities. Nothing below is installed.

**Rules for any approved import:**
- Pin the version.
- Record the repo URL, licence and commit SHA (`dawnward/CLAUDE.md`).
- For the app, install with `npx expo install`, so versions match Expo SDK 54.
- Evidence: `appendix-research-notes.md`. Expo pins were read from `expo/expo` branch `sdk-54`, `packages/expo/bundledNativeModules.json`. Licences were read from each package's LICENSE file or npm metadata on 2026-10-31.

## The sources the directive named

| Source | What it actually is | Licence | Works with vanilla three.js | Works with Expo / React Native | Use for Dawnward |
|---|---|---|---|---|---|
| github.com | Code host. The licence is per repository. | per repo | depends | depends | Source of the shortlist below |
| 21st.dev | Community registry of React and Tailwind components. Anyone can publish. | **No blanket licence.** Content belongs to its authors (O, terms). CLI is MIT. | No | No | Reference only. Any single component needs its own licence checked and recorded. |
| getlayers.io | **Could not be reached from this session** (network allowlist). A third-party listing describes a paid library of templates, three.js scenes and prompts. | **Unknown** | unverified | unknown | Inspiration only, until you or an allowed session read its terms |
| ui.shadcn.com | A CLI that copies React component source into your project | MIT (O) | No | No | Not applicable: the web Universe is vanilla, the app is native |
| motion.dev (formerly Framer Motion) | Animation library for React, Vue and plain JS. Its vanilla `animate()` works on DOM elements. | MIT (O); the paid Motion+ tier has separate terms | **Yes** (`motion/mini`, 3.2 kB) | No (use Reanimated) | Optional for web panel chrome. Current CSS transitions already cover it. |
| gsap.com | JS animation library. Webflow acquired GreenSock in October 2024 (S). Free since 30 April 2025 (O). | "Standard 'No Charge' GSAP License": proprietary, with a no-competing-builder clause (O) | Yes | Not officially | Not shortlisted: it is not an open-source licence |
| threejs.org | The renderer the web experience already uses, r187 | MIT (O) | native | heavy via expo-gl | Keep. Use Skia for the app constellation. |
| reactbits.dev | Animated React components copied as source, in four flavours (JS or TS × CSS or Tailwind) | **"MIT + Commons Clause"** (O): commercial use inside the product is allowed; redistributing or porting the components is not | No | No | Reference only |
| framer.com/motion | Now motion.dev | MIT | see motion.dev | No | as motion.dev |

## Shortlist: the app (the Mind milestone)

| Package | Licence (verified) | Version to use (Expo 54 pin) | Latest on npm | Why | Risk |
|---|---|---|---|---|---|
| `react-native-reanimated` + `react-native-worklets` | MIT | ~4.1.1 + 0.5.1 | 4.7.1 (needs RN 0.86+, so do **not** take latest) | Reversible travel and pullback on the UI thread; layout animation for steps | New Architecture only, check `app.json` |
| `react-native-gesture-handler` | MIT | ~2.28.0 | 3.4.0 (new major) | Edge-swipe pullback, long-press peek, star taps | Low on the pinned version |
| `@shopify/react-native-skia` | MIT | 2.2.12 | 2.14.0 | The Mind constellation as one GPU canvas | Adds several MB to the binary (A). Measure on a low-end Android. |
| `expo-image` | MIT | ~3.0.11 | 58.0.18 | WebP and AVIF, memory and disk cache, off-thread decode for the world art | Low |
| `expo-haptics` | MIT | ~15.0.8 (have ~15.0.7) | 58.0.7 | Already installed. Extend the haptic vocabulary (05). | Silent in Low Power Mode, which is fine |
| `@expo-google-fonts/source-serif-4`, `@expo-google-fonts/source-sans-3` | MIT (package) + OFL-1.1 (fonts) | 0.4.2 | 0.4.2 | One type system (D1) | None |
| `jest-expo` + `@testing-library/react-native` | MIT | jest-expo ~54.0.18; RNTL 14.1.0 | | Tests for the P0 flows | Dev only |
| Maestro (CLI, not an npm dependency) | Apache-2.0 (LICENSE O) | current | | One end-to-end path: Universe → Mind → dispute → undo → back | Dev only; runs on a device or simulator |
| `expo-local-authentication` (optional) | MIT | ~17.0.9 | 58.0.2 | Optional app lock (Journal lesson) | Product decision |

**Not recommended for the app:**
- `moti`: no release in 21 months, built on Reanimated 3, open React 19 issue.
- three.js through expo-gl: heavy, and Skia covers the need.

## Shortlist: the web experience (later phase, unchanged in spirit from the tech scout)

| Package | Licence | Version | Note |
|---|---|---|---|
| `@pmndrs/detect-gpu` | MIT | 6.0.28 | **Correction to the tech-scout roadmap**, which named the unscoped `detect-gpu` 5.0.70: the package has moved. Self-host its data, since the default fetches from unpkg. Its benchmark data froze in December 2025, so keep the live frame-time governor already in `main.js`. |
| `focus-trap` | MIT | 8.2.4 | Only if native `<dialog>` + `inert` (current approach, 0 axe violations) proves insufficient. Not needed today. |
| `postprocessing` (pmndrs) | Zlib | 6.39.5 | **Blocked:** its peer range is three `<0.187`. Use three's bundled `EffectComposer` if a bloom spike is approved. |
| `camera-controls` | MIT | 3.1.2 | Not adopted. It duplicates the existing deterministic camera rig, which the films depend on. |
| `three-mesh-bvh` | MIT | 0.9.17 | Only if star picking shows up in profiling |

## Repo note found during research (not changed)
`apps/mobile/package.json` mixes `^57.x` ranges for `expo-font`, `expo-file-system`, `expo-secure-store`, `expo-sharing` and `expo-linear-gradient` with `expo ~54`. The SDK 54 pins are, for example, `expo-font ~14.0.x` and `expo-file-system ~19.0.x`.
- It may be intentional, since the repo is an Expo fork with workspace packages.
- `npx expo install --check` would confirm.
- Because it can break a native build, it should be the **first task of Phase 1**, after approval.
