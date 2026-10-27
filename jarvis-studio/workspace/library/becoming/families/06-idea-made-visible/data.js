// DEMO COPY · not for posting
// 06 · THE IDEA MADE VISIBLE · every value the piece uses. index.html reads window.DATA (this file loads first,
// synchronously). Times are seconds of composition time; positions are frame pixels (1080x1920); colours are token names.
// A scratchpad build may swap this one file (other steps, other line). Code-drawn only: no photo, no people.
//
// Variants: set `variant` (or window.LOOP_VARIANT before this file loads) to a key of `variants`; its fields replace the
// base fields of the same name (one level deep). Each variant carries its own Night Watch cue in `cue`; cue.json must
// equal the default variant's cue (`node plan.mjs --check`).
//   loop   (hero) STATE > CHOICE > ACTION > EVIDENCE > IDENTITY, the line closes the ring, the ring becomes the eclipse   12 s
//   open   the same loop, but the line passes its start and keeps going outwards (a spiral): the loop is never closed  12 s
//   three  ACTION > EVIDENCE > IDENTITY, closed ring                                                                      10.5 s
//
// The sound drives the timing. The line reaches each step exactly on a tick of the cue's own watch tick: `reachTicks[k]`
// names the tick (0 = the first tick at cue.tickFrom) on which step k lights. index.html and plan.mjs compute the tick
// times with the same schedule as lib/night-watch.js (0.5 s apart, racing into the turn), so a changed cue moves the
// picture with it. Step 0 lights on the ignition (cue.stingAt). The ring closes on the turn (cue.turns[0]); the head stops
// dead 0.42 s before it, when the score stops dead. The landing sting (cue.land) is the first word of the phrase.
(function () {
  var base = {
    variant: "loop",
    duration: 12,
    steps: ["STATE", "CHOICE", "ACTION", "EVIDENCE", "IDENTITY"],
    close: "ring",
    // the circle: centre, radius, the angle of step 0 (degrees, clockwise from 3 o'clock), and the gap the head stops short
    // of before the hit closes it (degrees). Steps sit every 360/n degrees, clockwise. Revision 1: R 220 -> 290, centre
    // (520, 850) -> (510, 800), STATE at 12 o'clock (-90), gap 16 -> 28 degrees (a 140 px chord at the dead stop).
    ring: { cx: 510, cy: 800, R: 290, startAngle: -90, gap: 28, jitter: 1.3, seed: 7, width: 4 },
    // step labels: Cinzel caps on arcs concentric with the ring (textPath). mode 'arc': every word follows its arc, upright
    // facing outwards (upper half) or reading left to right under the ring (lower half). mode 'mixed' (the first draft):
    // words near the sides (|sin| < .5) sit level beside the node instead; that only fits small rings (R 220 at 40 px).
    labels: { mode: "arc", size: 50, weight: 500, tracking: "0.12em", gap: 22, capH: 35, arcSpan: 50, sideGap: 24, sideDy: 14,
      dim: "mist", lit: "ink", flash: "paleGold", fadeIn: [0.6, 0.8], flashDur: 0.08, settleDur: 0.25, lead: 0.03 },
    nodes: { r: 5, litR: 6, flashR: 8.5, dimAlpha: 0.75, stopR: 7 },
    ignite: { at: 0.3, dur: 0.25 },
    move: { start: 0.6 },
    // Revision 1: every arrival is on a "tick" (even index: the brighter 3150 Hz click, +0.06 velocity), and every tick
    // up to IDENTITY is an arrival, so the off-beat "tock" is the only sound between two words: tick (word) tock tick (word).
    reachTicks: [null, 0, 2, 4, 6],
    closeDur: 0.1,
    closeLead: 0.034,   // the closing starts one frame before the hit, so the hit frame already shows the ring closing
    open: { extra: 140, grow: 70, dur: 1.7 },
    corona: { dur: 1.1, outer: 1.95, disc: 0.86, ringA: 0.34 },
    bg: { fadeIn: [0.3, 1.0] },
    stars: { seed: 23, count: 150, alpha: [0.08, 0.34], size: [0.6, 1.5], twinkle: 0.25, keepOut: 1.25 },
    grain: { seed: 5, amount: 0.045 },
    // one line that states the idea plainly (interpretation, not a research claim). It names three of the ring's words and
    // points at the lever (the one step the viewer controls). *word* = pale-gold italic, one word at a time.
    // 7 words at 0.4 s = 2.5 words/s (house limit 2.6); fully on screen from 9.52 to the fade at 11.6 = 2.08 s
    // (readability floor for 7 words: 0.8 + 0.3 x 4 = 2.0 s).
    phrase: { text: "Change one *action.*\nIdentity follows the *evidence.*", top: 1215, at: 6.9, stagger: 0.4 },
    mark: { show: true, at: 10.0 },
    fade: { at: 11.6, dur: 0.4 },
    cue: { kind: "watch", duration: 12, turns: [6.5], card: null, land: 6.9, fade: 1.4, stingAt: 0.3, tickFrom: 1.9 }
  };
  var variants = {
    loop: {},
    open: { close: "open" },
    three: {
      duration: 10.5,
      steps: ["ACTION", "EVIDENCE", "IDENTITY"],
      ring: { cx: 510, cy: 800, R: 290, startAngle: -90, gap: 28, jitter: 1.3, seed: 7, width: 4 },
      reachTicks: [null, 2, 6],
      phrase: { text: "Change one *action.*\nIdentity follows the *evidence.*", top: 1215, at: 5.4, stagger: 0.4 },
      mark: { show: true, at: 8.4 },
      fade: { at: 10.05, dur: 0.45 },
      cue: { kind: "watch", duration: 10.5, turns: [5.0], card: null, land: 5.4, fade: 1.4, stingAt: 0.3, tickFrom: 1.6 }
    }
  };
  var w = typeof window !== "undefined" ? window : globalThis;
  var v = w.LOOP_VARIANT || base.variant;
  var D = {};
  Object.keys(base).forEach(function (k) { D[k] = base[k]; });
  var over = variants[v] || {};
  Object.keys(over).forEach(function (k) { D[k] = over[k]; });
  D.variant = v;
  D.variants = Object.keys(variants);
  w.DATA = D;
  w.LOOP_VARIANTS = variants;
  w.LOOP_BASE = base;
})();
