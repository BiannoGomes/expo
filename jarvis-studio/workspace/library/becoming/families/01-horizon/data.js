// DEMO COPY · not for posting
// 01 · THE HORIZON · every value the piece uses. A scratchpad build may swap this one file (real photo, real line).
// Times are composition seconds; x/y are FRAME pixels (1080x1920) unless a comment says otherwise.
window.DATA = {
  duration: 10,

  // the vault's "The sea, four ways": 'still' | 'trembling' | 'jagged' | 'gone'
  state: "still",
  states: {
    // amp/step: the line's hand-drawn jitter (BM.wob) · tremor: px of live vertical shake at tremorHz
    // swell/density/glow: the code plate (BM.seaPlate) · seam: how bright the plate's own horizon is after the hand-over
    still:     { amp: 1.6, step: 18, tremor: 0,   tremorHz: 0, swell: 0.6, density: 0.85, glow: "dawn", seam: 1.0 },
    trembling: { amp: 2.4, step: 16, tremor: 1.6, tremorHz: 6, swell: 1.25, density: 1.0, glow: "dawn", seam: 0.8 },
    jagged:    { amp: 7.5, step: 24, tremor: 0,   tremorHz: 0, swell: 1.8, density: 1.25, glow: "moon", seam: 0.6 },
    gone:      { amp: 2.0, step: 16, tremor: 0,   tremorHz: 0, swell: 0.45, density: 0.7, glow: "none", seam: 0.0 }
  },

  // plate: type 'code' (BM.seaPlate) or 'photo' (src = an image inside the composition folder, scratchpad builds only).
  // horizonY = the frame y of the plate's horizon; the line is drawn on it. A photo is cover-fitted to the 1188x2112
  // overscan plate, so measure its horizon after that fit.
  plate: { type: "code", src: null, horizonY: 1180, seed: 11, glowX: 640 },
  grain: { seed: 5, amount: 0.05 },

  // the gold line: ignites at x0, a head travels right past the edge, a quieter arm travels left past the other edge
  line: {
    seed: 7, x0: 330, xRight: 1170, xLeft: -90,
    ignite: 0.05, igniteDur: 0.25,
    right: [0.3, 2.7],        // [start, duration] of the head's travel
    left: [0.5, 2.6],         // [start, duration] of the left arm
    ease: "power1.inOut",
    width: 4, widthEnd: 1.5
  },

  // the sea exists only where the line has passed: per column, the plate opens up and down from the horizon
  reveal: { up: 1340, down: 900, grow: 1.5, fadeIn: 0.3, feather: 170, soft: 260, column: 4,
            spill: { r: 120, sy: 3.4, alpha: 0.2 } },

  // one phrase, word by word above the line (Cormorant 500 96 px). times = when each word starts to rise; "or" and
  // "horizon?" sit on the Night Watch ticks at 4.5 and 5.0 (cue tickFrom 4.0, a tick every .5 s; measured)
  phrase: { text: "An edge,\nor a *horizon*?", top: 720, times: [3.2, 3.6, 4.5, 4.75, 5.0] },

  // the hand-over: the stroke cools and thins into the plate's own horizon while the camera pushes
  handover: { at: 5.8, dur: 1.7, seamAlpha: 0.55 },
  push: { at: 5.8, dur: 1.7, from: 1.0, to: 1.04, ease: "sine.inOut" },

  dip: { at: 9.3, dur: 0.6 }
};
