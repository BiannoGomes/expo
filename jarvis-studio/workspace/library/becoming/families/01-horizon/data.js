// DEMO COPY · not for posting
// 01 · THE HORIZON · every value the piece uses. A scratchpad build may swap this one file (real photo, real line).
// Times are composition seconds; x/y are FRAME pixels (1080x1920) unless a comment says otherwise.
window.DATA = {
  duration: 8.5,

  // the vault's "The sea, four ways": 'still' | 'trembling' | 'jagged' | 'gone'
  state: "still",
  states: {
    // amp/step: the line's hand-drawn jitter (BM.wob) · tremor: px of live vertical shake at tremorHz
    // swell/density/glow: the code plate (BM.seaPlate); optional glowX overrides plate.glowX (the moon sits at glowX + 170,
    // 360 px above the horizon: at the default 640 it touched "horizon?" in the jagged draft, so jagged moves it right)
    // · seam: how bright the plate's own horizon is after the hand-over
    still:     { amp: 1.6, step: 18, tremor: 0,   tremorHz: 0, swell: 0.6, density: 1.0, glow: "dawn", seam: 1.0 },
    trembling: { amp: 2.4, step: 16, tremor: 1.6, tremorHz: 6, swell: 1.25, density: 1.1, glow: "dawn", seam: 0.8 },
    jagged:    { amp: 7.5, step: 24, tremor: 0,   tremorHz: 0, swell: 1.8, density: 1.25, glow: "moon", seam: 0.6, glowX: 770 },
    gone:      { amp: 2.0, step: 16, tremor: 0,   tremorHz: 0, swell: 0.45, density: 0.8, glow: "none", seam: 0.0 }
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

  // the sea exists only where the line has passed. Per column the plate opens from the horizon: a horizon-hugging band
  // (up/down, opened over `grow` s from ignition, tapered to zero over `taper` px towards each head, so it keeps pace with
  // the head and never peaks over the ignition point); the feather is signed (it runs 60 px
  // ahead of each head and 50 px behind it, on both arms, so no column edge is hard). Once both heads are off frame,
  // `rise` opens the rest of the sky for every column at once (flat top, no cone).
  reveal: { up: 300, down: 260, grow: 1.0, growEase: "sine.inOut", taper: 150, fadeIn: 0.25, feather: 110, lead: 0.55, soft: 260, column: 4,
            rise: { up: 1040, down: 760, at: 2.6, dur: 2.6, ease: "sine.inOut" },
            spill: { r: 120, sy: 2.0, alpha: 0.2 } },
  // the water's own light (revision 1: the sea read as near-black). A soft additive wash below the horizon in plate
  // tones, revealed by the same mask; and the scrim's lower stops (tokens.css: .7 at 70 %, .94 at 100 %) eased for this piece
  water: { alpha: 0.24, depth: 700 },
  scrim: { at70: 0.5, at100: 0.82 },

  // one phrase, word by word above the line (Cormorant 500 96 px). times = when each word starts to rise ("An edge,"
  // is fully up by 3.67 and holds alone before "or" over the 0.8 s readability floor); "or" and "horizon?" sit on
  // the two Night Watch ticks at 4.5 and 5.0 (cue tickFrom 4.5); the landing sting falls on "horizon?" at 5.0
  phrase: { text: "An edge,\nor a *horizon*?", top: 720, times: [3.15, 3.45, 4.5, 4.75, 5.0] },

  // the hand-over: one line becoming another. Over the whole window (sine.inOut) the stroke's jitter flattens to the
  // seam's straight line, its width goes 4 -> 1.5 px and its colour gold -> cream, while it fades at the same rate
  // as the plate's seam comes up underneath (both about 50 % at the midpoint, 6.65 s)
  handover: { at: 5.8, dur: 1.7, seamAlpha: 0.55, ease: "sine.inOut" },
  // linear push (the grammar's push) from the phrase's settle to the end, so the hold never stands still
  push: { at: 5.2, dur: 3.3, from: 1.0, to: 1.05, ease: "none" },

  dip: { at: 7.8, dur: 0.6 }
};
