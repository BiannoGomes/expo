# 04. Performance improvement plan

Principle: measure first, then change one thing, then measure again. Numbers marked **rig** come from this container (SwiftShader software GL, CPU 4× throttle). They are upper bounds, not device results. No physical-device data exists yet, and getting it is step 1.

## Baseline

| Surface | Metric | Value | Source |
|---|---|---|---|
| Web | First load (390×844, sound off) | 1.41 MB, 17 requests | `dawnward/CLAUDE.md`, `experience/qa-results.json` |
| Web | JS | 597 KB minified, 155 KB gzip (three.js is most of it) | `experience/docs/technology-inventory.md` |
| Web | Frame median, rig | first light 17 ms · hub 67 ms · phone close-ups 117 to 133 ms | `experience/docs/performance-benchmarks.md` |
| Web lab | Prototypes A, B, C, rig | 17 ms medians; B travel p95 200 ms; interactions 20 to 45 ms | `experience/lab/bench-results.json` |
| App | Universe art | 7 PNGs, **7.9 MB** on disk, 1024² RGBA. That is about 4 MB each once decoded, so about 28 MB of image memory if all are resident. | Measured here |
| App | Startup | 8 font files load before the first frame (`useFonts`), then a blank ground colour | `apps/mobile/app/_layout.tsx` |
| App | Continuous animation | sky glow (3.8 s loop), universe drift, constellation drift (14 s) and twinkles: all `Animated.loop`, never paused when their tab is not focused | `lib/sky.tsx`, `lib/universe.tsx`, `lib/constellation.tsx` |
| App | Network | no timeout; `/plan/today` fetched separately by 3 screens | `lib/api.ts` |
| App | Frame times, startup time, memory | **unmeasured** | none |

## Budgets (proposed, to confirm on hardware)

| Budget | App (mid-range Android, for example a Pixel 6a class; iPhone 12 class) | Web (same phones, Safari and Chrome) |
|---|---|---|
| Input response (tap to visible change) | under 100 ms, first frame of feedback under 16 ms | under 100 ms |
| Frame time during travel | p95 under 16.7 ms on iPhone 12, under 25 ms on mid-range Android | p95 under 33 ms at the medium tier |
| Cold start to interactive Today | under 2.0 s (iPhone 12), under 3.0 s (mid Android) | first meaningful paint under 2.5 s on 4G |
| Image memory resident | under 40 MB | n/a |
| App download size growth per milestone | under 2 MB | JS under +8 KB gzip per module |
| Idle CPU on a still screen | ~0 (no JS work; native-driver loops only while focused) | rAF paused when tab hidden (done) |

## Work items (ordered by expected gain per effort)

| # | Change | Expected gain | Measure with | Effort |
|---|---|---|---|---|
| 1 | **Get device numbers.** EAS development build on one iPhone and one mid-range Android. Measure with the React Native perf monitor, Xcode Instruments (Time Profiler, Core Animation FPS), Android Studio profiler and `adb shell dumpsys gfxinfo`. For the web, use Safari Web Inspector timelines on the same phones. | replaces guesses with numbers | same tools | M (needs hardware and Apple and EAS tokens, owner-held) |
| 2 | **Universe art PNG to WebP or AVIF, sized for the display.** Planets at 512 to 768 px where shown under 400 pt, nebula at device width × 2. Load with `expo-image` (disk and memory cache, decode off the JS thread). | about 7.9 MB down to about 1 MB on disk (the web build already ships the same art as WebP); decoded memory roughly halves | file sizes; Instruments memory | S (and approve `expo-image`) |
| 3 | **Pause ambient loops when not visible.** Use `useIsFocused()` plus `AppState`. Stop the sky, drift and twinkle loops on blurred tabs and in the background. | less GPU and CPU while on another tab; battery | Instruments Energy log; `gfxinfo` | S |
| 4 | **Request timeout and a shared plan store** (UX backlog #6 and #23). One `/plan` fetch per focus cycle, optimistic local updates. | fewer requests; no 60 s hangs | network log | M |
| 5 | **Keep the splash until fonts load.** Load 4 font files, not 8, once the visual system is settled (05). | no blank flash; less font I/O at start | cold-start trace | S |
| 6 | **Move travel and pullback to Reanimated worklets** (UI thread). Drive one shared progress value with a spring, interruptible. Today's `Animated` with native driver can't be reversed mid-flight from JS without a jump. | smooth, cancelable travel under JS load | Instruments FPS during travel while the plan loads | M (approve `react-native-reanimated` and `react-native-gesture-handler`, both Expo SDK 54 compatible) |
| 7 | **Constellation in Skia** (Mind world). One canvas instead of dozens of SVG nodes, with stars as a single draw. | scales to hundreds of moments | FPS with 300 synthetic stars | M (approve `@shopify/react-native-skia`) |
| 8 | **Web: start at the right tier.** Use self-hosted detect-gpu data so slow phones don't spend 60 frames at high quality. | removes the slow first second on weak GPUs | rig plus device | S (approval pending since the tech scout) |
| 9 | **Web: cut phone close-up fill cost.** Phone close-ups (117 to 133 ms rig) come from overlapping transparent layers and clearcoat. Drop clearcoat on low and medium, and render the bezel opaque at close range. | close-ups toward hub cost | `bench.mjs` same states | M |

## Rules for every performance change
- Record the before and after numbers in `docs/master-plan/perf-log.md` with device, OS, build and commit.
- A change that does not move its metric is reverted.
- Reduced motion and accessibility checks rerun with every change: `qa.mjs` for the web, and for the app a screen-reader pass once device testing exists.
