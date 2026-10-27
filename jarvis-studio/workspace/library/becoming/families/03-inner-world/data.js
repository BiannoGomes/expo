// DEMO COPY · not for posting
// 03 · THE INNER WORLD · every value the piece uses. A scratchpad build may swap this one file (real photo, real line).
// Times are composition seconds; x/y are FRAME pixels (1080x1920) unless a comment says otherwise.
window.DATA = {
  duration: 12.0,

  // the field inside the lens: 'scattered' (one slow, tangled flow) | 'conflicting' (two opposing flows that resolve)
  field: "scattered",
  seed: 3,

  // the Instrument lens: centre and radius (px). The gold line crosses it on its centre line, so cy is also the
  // plate's horizon after the iris. soft = the lens edge's feather (px); rim = alpha of the thin mist rim
  lens: {
    cx: 540, cy: 1060, r: 380, rFrom: 340, soft: 46, rim: 0.5, rimIn: 0.2,
    in: [0.15, 0.5],          // [start, duration] the lens comes up out of the dark (radius rFrom -> r, never from 0); Revision 1: 1.0 -> 0.5 s
    tint: 0.3,                // how much ocean colours the inside of the lens (0 = flat abyss)
    // rimIn: the rim comes up in 0.2 s, so the first light is visible on the opening sting (cue stingAt = in[0])
  },

  // the strands: N per lens radius when aligned (spacing = r / N px), stroke width (px), peak alpha, halftone mix
  strands: {
    n: 15, width: 1.3, alpha: 0.5, dither: 0.55, drift: 0.06,
    // freq: noise frequency of the scattered flow; shear: a directional tilt of the flow. Revision 1: freq 1.35 -> 0.8 and
    // shear 0 -> 0.3 cut the closed contour loops that read as a topographic map
    freq: 0.8, shear: 0.3,
    // nGather: how many strands each side of the centre survive the gather (the rest fade out as it starts), so the
    // converging bundle is a few strands, not a barcode (Revision 1: was all 15 a side)
    nGather: 3,
    in: [0.15, 0.7],          // [start, duration] the strands fade up with the sting (Revision 1: was 0.45; interior YMAX >= 60 by 0.25 s)
    align: [1.4, 2.6],        // [start, duration] the flow bends until every strand runs horizontally (sine.inOut); done at 4.0 = cue tickFrom
    gather: [4.2, 1.3],       // [start, duration] the strands converge on the centre line (power2.inOut)
    gold: [4.6, 0.9], goldMax: 0.55,   // [start, duration] the bundle warms towards gold near the centre, never fully:
                              // the crisp gold line at line.at must read as a step (the hit), not a continuation
    out: [5.5, 0.55]          // [start, duration] the strands give way to the line
  },

  // the gold line: appears when the strands become it (the cue's turn lands on line.at), crisp, 4 px, hand-drawn.
  // lead: it starts 0.05 s early so the hit frame (5.5 s) already shows it two-thirds lit (measured: with no lead the
  // first changed frame was 5.533, one frame after the hit)
  line: { at: 5.5, lead: 0.05, inDur: 0.12, x0: -60, x1: 1140, seed: 7, amp: 1.6, step: 18, width: 4 },

  // the iris: the lens opens back to the plate and the line continues as its horizon
  returnToPlate: true,
  iris: { at: 5.95, dur: 1.6, rTo: 1320, open: [5.95, 0.8], rimOut: [6.1, 0.9] },

  // the plate seen once the lens opens: code-drawn sea (photo only in scratchpad builds, src inside the folder).
  // horizonY must equal lens.cy so the line lands on the horizon.
  plate: { type: "code", src: null, horizonY: 1060, seed: 11, glow: "dawn", glowX: 600, push: [5.95, 6.05, 1.0, 1.04] },
  grain: { seed: 5, amount: 0.05 },

  // the label outside the lens says what the lens is (Inter tracked caps)
  label: { text: "ILLUSTRATION", top: 600, topNoReturn: 1466,   // no-return: below the lens, clear of the 3-line phrase
           in: [0.7, 0.6], out: [5.55, 0.45] },

  // one line, word by word, in the sky above the horizon once the lens has opened (Cormorant 500 96 px).
  // Revision 1: a practice the viewer can do, not an aphorism. 7 words, one start time each; the landing sting is on the
  // last word (cue land = 9.0). Readability: 7 words over 6.5 -> 9.22 s = 2.57 words/s; whole line fully up 9.22 -> 11.25
  // = 2.03 s (floor 0.8 + 0.3 x 4 = 2.0 s). With returnToPlate false the phrase sits at topNoReturn.
  phrase: { text: "Choose *one* thing.\nLet the rest wait.", top: 560, topNoReturn: 330,
            times: [6.5, 6.9, 7.3, 7.95, 8.3, 8.65, 9.0], lead: 0.03 },   // lead: each word is visible on its own time's frame

  dip: { at: 11.25, dur: 0.6 }
};
