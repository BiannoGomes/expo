// DEMO COPY · not for posting
// 08 · THE QUIET ENDING · every value the piece uses. A scratchpad build may swap this one file (real photo, real line).
// Times are composition seconds; x/y are FRAME pixels (1080x1920) unless a comment says otherwise.
window.DATA = {
  duration: 8,

  // the last caption of the piece this ending closes (BM.captions chunking and flash). [] = start straight on the dim plate
  captions: [
    { text: "The", start: 0.15, end: 0.36 },
    { text: "change", start: 0.38, end: 0.7 },
    { text: "is", start: 0.72, end: 0.84 },
    { text: "quiet.", start: 0.86, end: 1.6 }
  ],

  // the final question, word by word, Cormorant italic in cream, centred. times = each word's beat: BM.revealWords
  // starts its rise .06 s before it (.22 s long). The first and third words and the last word sit on
  // the three notes of the landing sting (cue.land, +.32, +.64), so the sting is the question being spoken.
  question: { text: "Who are you becoming?", top: 880, size: 92, times: [3.0, 3.16, 3.32, 3.64] },

  // the plate: type 'code' (BM.seaPlate) or 'photo' (src = an image inside the composition folder, scratchpad builds only)
  // glow 'dawn' (low, left): the last warm light in the sea fades with the plate, so the gold line is the light that remains
  plate: { type: "code", src: null, seed: 23, glow: "dawn", glowX: 300, horizonY: 1180, density: 0.9, swell: 0.5,
           // opacity keyframes: already dim at the first frame (it is an ending), density drops, then a very slow settle
           opacity: [[0, 0.9], [1.3, 0.9], [3.3, 0.3], [8.0, 0.22]],
           push: [1.02, 1.035] },              // a slow push that never stops (linear over the whole piece)
  grain: { seed: 5, amount: 0.05, opacity: [[0, 1], [1.3, 1], [3.3, 0.3], [8.0, 0.2]] },

  // the gold line: from x0 under the question, past the right edge, and it keeps going (the frame cuts it).
  // sine.in: it leaves slowly and is at full speed when it meets the edge, so it never comes to rest inside the frame.
  line: { seed: 13, x0: 70, x1: 1500, y: 1060, at: 3.85, dur: 3.1, ease: "sine.in", width: 4, head: 4 },

  // "THE BECOMING PROJECT" small at y 1450. false = no mark
  mark: { show: true, at: 5.2, y: 1450 }
};
