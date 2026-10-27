// DEMO COPY · not for posting
// 05 · THE HUMAN SIGNAL · every value the piece uses. index.html reads window.DATA (this file loads first, synchronously).
// Times are seconds of composition time; positions are frame pixels (1080x1920). A scratchpad build may swap this one
// file (other copy, other light colours, a real photo as plate.src). Never a real photo in the repo (house rule 8).
// No people and no faces: the two "people" are two points of light.
//
// Variants: set `variant` (or window.SIGNAL_VARIANT before this file loads) to a key of `variants`; its fields replace
// the base fields of the same name (one level deep). Each variant carries its own Night Watch cue in `cue`; cue.json
// must equal the active variant's cue (tools: `node envelope.mjs --check`). The variants are the brief's `outcome`:
//   both      (hero) a first bid is missed, a second bid is answered        11 s
//   answered  one bid, answered                                            8 s
//   missed    one bid, missed: the line greys and sinks                    8.6 s
//
// The waveform is driven by the score's own sound. envelope.js (written by `node envelope.mjs`, committed as data)
// holds one loudness value per frame for two isolated layers of each variant's cue: `bells` (the opening sting A-E-D
// and the landing sting E-D-A, nothing else) and `heart` (the heartbeat alone). A bid names the layer it carries.
// At the light that speaks, the line's amplitude IS that layer's loudness at that frame; farther along the line the
// same envelope plays later (when the line's front passed that point), so the signal rolls out from the light.
(function () {
  var base = {
    variant: "both",
    duration: 11,
    outcome: "both",
    grain: { seed: 5, amount: 0.05 },
    plate: { src: null, seed: 31, glow: "none", horizonY: 1040, density: 1, fadeIn: [0.05, 1.1], push: [1.0, 1.035] },
    // the two lights: `a` speaks first; colours are token names
    lights: {
      y: 1040,
      a: { x: 196, color: "gold", ignite: 0.05, igniteDur: 0.25 },
      b: { x: 884, color: "paleGold", appear: 0.3, appearDur: 0.45, alpha: 0.95 },
      r: 9, litR: 12, halo: 44, haloA: 0.10, haloLitA: 0.17, litMix: 0.45, dimTo: 0.62
    },
    // soften: a one-pole attack/release (s) on a layer's envelope before it drives the line (the heartbeat swells, not spikes)
    wave: { gamma: { bells: 5, heart: 2 }, soften: { heart: { attack: 0.06, release: 0.6 } }, lambda: 70, phaseSpeed: 70, amp: 48, width: 4, replyWidth: 4, jitter: 1.3, seed: 7, step: 4, headTaper: 46, rootTaper: 18 },
    // a bid: `from` light, start `at`, the front reaches `reach` (fraction of the gap) over `dur` (power2.out),
    // carrying the envelope layer `env` from `at` for `envLen` seconds. A missed bid greys and sinks from `missAt`.
    // `residual` (px): the smallest ripple amplitude, so a waiting bid stays alive; `freezeAt`: the line stops moving
    // on that frame (the dead stop of the silent turn, turn - 0.42). `ampScale` scales a bid's peak amplitude.
    bids: [
      { from: "a", at: 0.05, reach: 0.46, dur: 1.6, env: "bells", envLen: 3.4, residual: 5, freezeAt: 2.88, missed: true, missAt: 3.3, sinkDur: 1.3, sinkY: 64 },
      { from: "a", at: 4.1, reach: 0.5, dur: 1.5, env: "heart", envLen: 2.1, ampScale: 1, missed: false }
    ],
    // the answer: the other light reaches back, carrying the landing sting, and meets the bid's front
    reply: { from: "b", at: 5.6, reach: 0.5, dur: 0.5, env: "bells", envLen: 1.2 },
    connect: { at: 6.1, settle: 0.9, steadyAmp: 1.6, steadyLambda: 140, steadySpeed: 40 },
    phrase: { text: "Notice the small reach.\n*Answer* *it.*", top: 640, at: 6.24, stagger: 0.4 },
    mark: { show: true, at: 8.9 },
    fade: { at: 10.3, dur: 0.7 },
    // the Night Watch cue for this variant (cue.json must equal it). No tick (ticks: false), so there is no tick race.
    // The missed bid is a silent turn (hits: false): the bed stops dead 0.42 s before missAt and the pad darkens on it.
    // stingAt = the gold light igniting and speaking (A-E-D); land = the answer (E-D-A, soft low D on the first word).
    cue: { kind: "watch", duration: 11, turns: [3.3], card: null, land: 5.6, fade: 1.4, stingAt: 0.05, ticks: false, hits: false }
  };
  var variants = {
    both: {},
    answered: {
      duration: 8,
      outcome: "answered",
      bids: [{ from: "a", at: 0.05, reach: 0.5, dur: 1.6, env: "bells", envLen: 2.3, missed: false }],
      reply: { from: "b", at: 2.3, reach: 0.5, dur: 0.5, env: "bells", envLen: 1.2 },
      connect: { at: 2.8, settle: 0.9, steadyAmp: 1.6, steadyLambda: 140, steadySpeed: 40 },
      phrase: { text: "Notice the small reach.\n*Answer* *it.*", top: 640, at: 2.94, stagger: 0.4 },
      mark: { show: true, at: 5.2 },
      fade: { at: 7.3, dur: 0.7 },
      cue: { kind: "watch", duration: 8, turns: [], card: null, land: 2.3, fade: 1.4, stingAt: 0.05, ticks: false, hits: false }
    },
    missed: {
      duration: 8.6,
      outcome: "missed",
      bids: [{ from: "a", at: 0.05, reach: 0.46, dur: 1.6, env: "bells", envLen: 3.4, residual: 5, freezeAt: 2.88, missed: true, missAt: 3.3, sinkDur: 1.3, sinkY: 64 }],
      reply: null,
      connect: null,
      phrase: { text: "Notice the reach\nyou *missed.*", top: 640, at: 4.6, stagger: 0.4 },
      mark: { show: true, at: 6.8 },
      fade: { at: 7.9, dur: 0.7 },
      cue: { kind: "watch", duration: 8.6, turns: [3.3], card: null, land: 4.6, fade: 1.4, stingAt: 0.05, ticks: false, hits: false }
    }
  };
  var w = typeof window !== "undefined" ? window : globalThis;
  var v = w.SIGNAL_VARIANT || base.variant;
  var D = {};
  Object.keys(base).forEach(function (k) { D[k] = base[k]; });
  var over = variants[v] || {};
  Object.keys(over).forEach(function (k) { D[k] = over[k]; });
  D.variant = v;
  D.variants = Object.keys(variants);
  w.DATA = D;
  w.SIGNAL_VARIANTS = variants;
  w.SIGNAL_BASE = base;
})();
