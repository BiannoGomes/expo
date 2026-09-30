# HyperFrames field guide + bridge

Verified hands-on on 2026-09-30 with `hyperframes@0.8.97` (a 10 s 1080×1920 reel rendered in
about 18 s on 4 CPU cores). HyperFrames releases several times a day. **When its installed skill
disagrees with this file, the skill wins.** This file only records the traps.

## Running the CLI

- **Plugin install** (recommended): run the bundled launcher, not a bare `npx`:
  `node "<PLUGIN_ROOT>/skills/hyperframes/scripts/plugin-cli.mjs" <command>`. It pins the
  plugin's own version.
- **Standalone:** `npx -y hyperframes@<version> <command>`. Pin the version per project.
- Needs **Node ≥ 22, ffmpeg + ffprobe, Chrome Headless Shell** (`npx hyperframes browser ensure`,
  or set `HYPERFRAMES_BROWSER_PATH`). `npx hyperframes doctor` checks all three.
- Set `HYPERFRAMES_SKIP_SKILLS=1`. Otherwise `init` re-installs its skills into
  `~/.claude/skills` and `~/.agents/skills` on every run (`--skip-skills` is ignored).
  Optional: `HYPERFRAMES_NO_TELEMETRY=1`.

## The loop

```
lint → check → preview (optional, a Studio URL) → render --quality draft|looks|delivery
```

- `check` = lint + runtime errors + layout (overflow, overlap, clipping, 9 samples) + motion
  (`sweep_static`) + WCAG AA contrast. **If lint has errors, `check` skips the browser audits
  and reports "0 samples", which is not a pass.**
- `preview` stamps `data-hf-id` into your HTML. That's harmless.
- `render --fps` accepts only **24, 30 or 60**. For 20 fps (Charlie's `loop-cover`), use ffmpeg.
- GIF: `render --format gif --gif-loop 0` (≤30 fps, 15 recommended).

## Composition contract (the parts that bit us)

- One root `<div data-composition-id="main" data-width="1080" data-height="1920" data-duration="10" data-start="0">`
  directly in `<body>`. **Length = the root's `data-duration`**, not the timeline's length.
- Exactly one `gsap.timeline({ paused: true })`, registered **last** as `window.__timelines["main"] = tl`.
  Never `play()`. No `Math.random`, `Date.now`, `requestAnimationFrame`, `setTimeout`, or `repeat: -1`.
- **Vendor GSAP locally** (`npm pack gsap` → `vendor/gsap.min.js`). CDNs can be blocked at render
  time, which fails the render after a 45 s wait.
- Fonts: an in-file `@font-face` pointing at a local woff2 (e.g. from `@fontsource/<font>` on npm) is
  deterministic across machines. Never rely on system fonts.
- Don't mix a CSS `transform` with a GSAP tween of the same property. Use `fromTo`.
- Never tween `autoAlpha`/`visibility`/`display` on `.clip` elements. Opacity is fine.
- A `class="clip"` wrapper containing structured children → `nested_structure_needs_subcomposition`.
  Either put the timing on the leaf element, or (simplest for short motion pieces) skip timed clips
  and drive everything from the one timeline, as the proof project does.
- Only one HTML composition at the project root. Aspect variants go in `formats/<name>.html`,
  rendered with `render -c formats/<name>.html`. Lint doesn't gate those, so run `brand-lint` on them.
- Media: `<video muted playsinline id>` plus a separate `<audio id>`. An `<audio>` without an `id` renders silent.

## Bridge: Charlie Hills' `window.seek()` pages

His skills output a plain HTML page with `window.seek(seconds)`, a `?render` freeze flag,
and requestAnimationFrame autoplay. The HyperFrames CLI can't render these: the root lacks
composition attributes, and rAF fails lint (`non_deterministic_code`). Two options:

1. **Export as-is (recommended for his skills):**
   `node SKILLS/motion-review/scripts/seek-render.mjs index.html --duration 8 --width 1080 --height 1350 --out renders/x.mp4 --silent-audio`.
   It uses headless Chrome over DevTools and ffmpeg, frame by frame, with zero npm dependencies.
2. **Port to HyperFrames** (when you also want `check`'s layout and contrast audits): add the root
   attributes, delete the rAF autoplay, and drive his `seek` from a paused timeline:
   ```js
   const tl = gsap.timeline({ paused: true });
   const clock = { t: 0 };
   tl.to(clock, { t: DURATION, duration: DURATION, ease: "none", onUpdate: () => window.seek(clock.t) });
   window.__timelines["main"] = tl;
   ```
   UNTESTED as of 2026-09-30. Verify with `check` before trusting it.

## Where the brand comes in

`activate-brand` writes `frame.md` (YAML tokens + prose digest). HyperFrames' `hyperframes-creative`
reads it as brand truth: frontmatter values are normative, and prose is context. Never hand-edit
`frame.md`; edit the brand's `MOTION.md` and re-activate.
