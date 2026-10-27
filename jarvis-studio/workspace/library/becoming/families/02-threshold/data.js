// DEMO COPY · not for posting
// 02 · THE THRESHOLD · every value the piece uses. index.html reads window.DATA (this file is loaded first, synchronously).
// Times are seconds of composition time; positions are frame pixels (1080x1920). A scratchpad build may swap this one
// file (other copy, other palette, a real photo as plate.src). Never a real photo in the repo (house rule 8).
//
// Variants: set `variant` to a key of `variants`; its fields replace the base fields of the same name (one level deep).
//   divider 'vertical'   the wall stands upright at wall.at (x); the line runs left to right; the second state opens to the right
//   divider 'horizontal' the wall lies flat at wall.at (y); the line runs top to bottom; the second state opens below
//   wall.hold            seconds of strain at the wall before the dead stop (the turn lands at contact + hold + 0.42;
//                        cue.json's turns[0] must equal it: index.html writes the computed value to window.THRESHOLD_TURN)
//   states.before/after  copy + palette of each side (keyword text, keyword colour token, plate glow)
(function () {
  var base = {
    duration: 9.5,
    variant: "vertical",
    divider: "vertical",
    grain: { seed: 5, amount: 0.05 },
    // the travel axis: u runs along the line (x for 'vertical', y for 'horizontal'); v is the line's cross position
    line: { seed: 7, v: 1000, u0: 110, u1: 1160, ignite: 0.05, igniteDur: 0.25, run: [0.25, 2.15] },
    wall: { at: 540, gap: 5, hold: 1.28, dash: [8, 12], opacity: 0.5, appear: 0.12, dissolve: 0.55, bend: 12, press: 4, bendSigma: 80 },
    through: { dur: 0.95, ease: "power3.out", lead: 0.0334 },
    sweep: { delay: 0.1, dur: 1.15, ease: "power3.inOut", edgeOpacity: 0.42 },
    states: {
      before: { keyword: "GIVEN", color: "mist", seed: 23, tight: 0.62 },
      after: { keyword: "TESTED", color: "cream", seed: 11, glow: "dawn", glowX: 820, horizonV: 1000, push: [1.0, 1.04], wash: 0.16 }
    },
    keywords: { before: { x: 310, y: 838, at: 0.9 }, after: { x: 740, y: 838, lag: 0.05 } },
    phrase: { text: "What you test becomes *yours.*", top: 1160, at: 5.3, stagger: 0.4 },
    mark: { show: true, at: 7.5 },
    fade: { at: 8.8, dur: 0.7 },
    plate: { src: null }
  };
  var variants = {
    vertical: {},
    horizontal: {
      divider: "horizontal",
      line: { seed: 7, v: 300, u0: 300, u1: 2000, ignite: 0.05, igniteDur: 0.25, run: [0.25, 2.15] },
      wall: { at: 900, gap: 5, hold: 1.28, dash: [8, 12], opacity: 0.5, appear: 0.12, dissolve: 0.55, bend: 12, press: 4, bendSigma: 80 },
      states: {
        before: { keyword: "GIVEN", color: "mist", seed: 23, tight: 0.62 },
        after: { keyword: "TESTED", color: "cream", seed: 11, glow: "dawn", glowX: 640, horizonV: 1240, push: [1.0, 1.04], wash: 0.16 }
      },
      keywords: { before: { x: 620, y: 640, at: 0.9 }, after: { x: 620, y: 1030, lag: 0.05 } },
      phrase: { text: "What you test becomes *yours.*", top: 1290, left: 380, width: 560, at: 5.3, stagger: 0.4 }
    }
  };
  var v = (typeof window !== "undefined" && window.THRESHOLD_VARIANT) || base.variant;
  var D = {};
  Object.keys(base).forEach(function (k) { D[k] = base[k]; });
  var over = variants[v] || {};
  Object.keys(over).forEach(function (k) { D[k] = over[k]; });
  D.variant = v;
  window.DATA = D;
})();
