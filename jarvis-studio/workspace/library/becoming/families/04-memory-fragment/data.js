// DEMO COPY · not for posting
// 04 · THE MEMORY FRAGMENT · every value the piece uses. A scratchpad build may swap this one file (real photo, real
// EXIF date, real line). Times are composition seconds; x/y are FRAME pixels (1080x1920) unless a comment says otherwise.
window.DATA = {
  duration: 9,

  // the still: type 'code' (a frozen BM.seaPlate + a code-drawn headland whose ridge IS `contour`) or 'photo'
  // (src = an image inside the composition folder, scratchpad builds only; it is cover-fitted to the 1188x2112 overscan
  // plate, so measure `contour` on the photo after that fit, in frame pixels)
  plate: { type: "code", src: null, seed: 23, glow: "dawn", glowX: 250, horizonY: 1180, density: 0.8, freezeAt: 1.7 },
  grain: { seed: 9, amount: 0.06 },

  // the camera push on the still (and on everything printed on it: stamp and line). origin = frame px
  push: { from: 1.0, to: 1.07, origin: [540, 1180] },

  // assembly: 0 | 2 | 3 horizontal slices, top to bottom. cuts = frame y of the slice boundaries (n - 1 values).
  // Each slice fades in at its own time (black until then), offset dx px, and slides into register by `settle`;
  // the black seams between slices close over seam.dur from seam.at. The cuts go through the ridge and the headland's
  // foot, where a misregistration can be seen (first render: cuts in the black sky read as nothing). The band holding
  // the light arrives first, so the first thing seen is light, not a dark slab. Revision 1: the whole assembly is
  // done by 1.2 s and the seams are closed by 1.4 (it was 2.3: the first 2.4 s read as a dark slab on a phone).
  slices: 3,
  cuts: { 2: [1196], 3: [960, 1196] },
  sliceIn: [
    { at: 0.25, fade: 0.4, dx: -14, settle: 0.9 },   // sky + the ridge's peaks
    { at: 0.05, fade: 0.4, dx: 16, settle: 1.1 },    // the ridge's foot + the lit horizon (first: the light)
    { at: 0.45, fade: 0.4, dx: 9, settle: 0.75 }     // the sea + the headland's shore
  ],
  seam: { px: 7, at: 0.5, dur: 0.9 },

  // the date stamp, burned into the still. 'DD.MM.YYYY' (the real EXIF date in real use) or null (no stamp: the line
  // then ignites on the contour). The demo shows a clearly fake placeholder so nothing pretends to be real.
  stamp: "00.00.0000",
  // Revision 1: the stamp sits in the dark water just under the horizon, ending at the headland's foot, so its
  // underline runs straight into the ridge (it sat 200 px lower, and the line had to climb across open water)
  stampBox: { x: 158, y: 1192, size: 30 },     // left / top of the text, Inter 500 px (baseline ~1218)
  stampIn: { at: 1.5, dur: 0.4 },
  stampFade: { at: 5.1, dur: 1.0, to: 0.55 },  // the date recedes while "not the date." arrives

  // the gold line: underlines the stamp, then leaves it (its tail erases the underline) and traces the contour.
  // underline1 should equal contour[0] (the underline ends where the contour starts, so the line never crosses
  // anything that isn't in the image). If they differ, a straight joining stroke is drawn between them.
  line: {
    seed: 4, width: 4,
    underline0: [152, 1230], underline1: [376, 1230], // under the stamp; set by hand (measuring text at load time races the font)
    ignite: 2.0, igniteDur: 0.25,
    underline: [2.0, 0.9],                      // [start, duration], power2.out: ends on the headland's foot at 2.9
    travel: [3.7, 2.7],                         // the head rests on the date, then leaves it and runs the ridge out of frame
    tail: [3.7, 0.8]                            // the tail erases the underline, then rests at contour[0]
  },
  // the ridge, frame px, left to right, starting at the headland's foot on the water (= underline1); the last point is
  // past the right edge, so the line continues out of frame. The code-drawn headland's outline IS this list.
  contour: [[376, 1230], [398, 1214], [420, 1194], [442, 1170], [464, 1140], [486, 1104], [515, 1063], [548, 1020], [578, 984], [606, 951],
            [634, 918], [660, 897], [684, 889], [708, 899], [733, 921], [756, 934], [781, 926], [808, 913], [836, 921],
            [866, 944], [900, 962], [940, 975], [985, 986], [1030, 994], [1080, 1002], [1150, 1012]],

  // one italic Cormorant line about what memory keeps. times = when each word starts to rise (2.43 words/s); the
  // whole line is fully up at ~6.06 and holds ~2.2 s before the dip (7 words: floor 0.8 + 4 x 0.3 = 2.0 s)
  phrase: { text: "Memory keeps the *shape*,\nnot the date.", top: 380, size: 92, times: [3.3, 3.7, 4.1, 4.5, 5.1, 5.5, 5.9] },

  dip: { at: 8.3, dur: 0.6 }
};
