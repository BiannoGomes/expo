// DEMO COPY · not for posting
// 07 · THE REVEAL · every value the piece uses. index.html reads window.DATA (this file is loaded first, synchronously).
// Times are seconds of composition time; positions are frame pixels (1080x1920). A scratchpad build may swap this one
// file (other copy, a real photo as plate.src). Never a real photo in the repo (house rule 8).
//
// Two modes in one component (gold line behaviour in both: it drops in from above as the mark that changes the meaning):
//   mode 'word'      a Cinzel word; the line falls and becomes a mark inside it (IMPOSSIBLE -> I'M POSSIBLE: the apostrophe);
//                    the letters part to make room (x transforms per letter); a faint echo of the old word stays a moment
//   mode 'sentence'  one Cormorant sentence in timed fragments; the line falls and becomes the underline of the
//                    reframing word, which arrives on the hit
// `window.REVEAL_MODE` (set before this file loads) overrides `mode`. The turn time lives in data (turn) and must equal
// cue.json turns[0]; index.html writes the derived times to window.REVEAL_TIMES so a build can check them.
//
// Glyph advances below were measured once in this Chromium (canvas measureText at 1000 px, fonts from ../../fonts),
// because the timeline is built synchronously before the web fonts finish loading, so the DOM can't be measured.
// Per-letter spans are positioned absolutely, so the browser applies no kerning: the table is the whole layout.
(function () {
  var metrics = {
    cinzel500: { A: 714, B: 615, C: 767, D: 814, E: 595, F: 559, G: 811, H: 829, I: 354, J: 344, K: 690, L: 580, M: 938,
      N: 849, O: 852, P: 603, Q: 852, R: 700, S: 509, T: 634, U: 797, V: 736, W: 978, X: 684, Y: 675, Z: 654,
      "'": 180, "’": 210, " ": 250, ascent: 976, descent: 372, cap: 703 },
    cormorant500: { a: 420, b: 512, c: 415, d: 512, e: 411, f: 305, g: 447, h: 502, i: 270, j: 259, k: 491, l: 261, m: 768,
      n: 520, o: 482, p: 511, q: 492, r: 369, s: 338, t: 338, u: 497, v: 436, w: 675, x: 439, y: 432, z: 405,
      A: 706, B: 570, C: 684, D: 696, E: 542, F: 513, G: 719, H: 761, I: 335, J: 327, K: 652, L: 537, M: 842, N: 730,
      O: 766, P: 546, Q: 766, R: 681, S: 499, T: 637, U: 700, V: 664, W: 925, X: 650, Y: 612, Z: 598,
      " ": 234, ".": 200, ",": 222, "?": 332, "'": 143, "’": 190, ";": 227, ":": 200, ascent: 924, descent: 287, xHeight: 391 }
  };
  var shared = {
    duration: 11,
    grain: { seed: 5, amount: 0.05 },
    plate: { src: null, seed: 31, glow: "moon", horizonY: 1320, glowX: 760, fadeIn: [0.15, 1.0], push: [1.0, 1.04], opacity: 0.9 },
    // the point of light (the pen, waiting) ignites on the opening sting (cue stingAt) and holds above the text
    point: { y: 400, ignite: 0.05, igniteDur: 0.3, color: "cream" },
    deadStop: 0.42,          // Night Watch's dead stop before each turn: the plate and grain freeze for its length
    mark: { show: true, at: 8.7 },
    fade: { at: 10.3, dur: 0.7 },
    metrics: metrics
  };
  var modes = {
    word: {
      mode: "word",
      turn: 4.0,             // the hit: the falling line touches down as the mark (cue turns[0])
      land: 5.05,            // the landing sting: the new word has visibly settled (measured: last 2 px of travel by 5.03; cue land)
      word: {
        from: "IMPOSSIBLE",
        to: "I’M POSSIBLE",
        markChar: "’",  // the character in `to` that the gold line becomes; every other character comes from `from`
        size: 104, tracking: 0.12, baseline: 880,
        at: 0.55, inDur: 0.9, inY: 14,
        stoneOpacity: 0.84,  // the old word reads a little unlit; the new one settles to full cream
        part: { delay: 0.05, dur: 1.1, ease: "power3.inOut" },
        relight: { delay: 0.2, dur: 0.95 },
        echo: { opacity: 0.12, hold: 0.4, dur: 0.15 }    // held 4.0-4.4, gone by 4.55 (before the letters are halfway), so I'M POSSIBLE lands clean
      },
      // the stroke is painted on the head canvas: it tapers from widthTop at its tail to widthTip at the falling tip
      // (ink, not a ruled line), then settles to markWidth as the tail lifts away
      pen: { fall: 0.38, fallEase: "power2.in", widthTop: 3, widthTip: 6, markWidth: 8.5, retract: { delay: 0.04, dur: 0.75, ease: "power3.inOut" },
             jitter: 1.0, seed: 7 },
      // one concrete thing to try (the strongest of three candidates; README lists the others). "\n" = line break
      // word mode uses the shared plate: horizon 1320 and glowX 760 put the moon at about (930, 960), clear of the word
      // (baseline 880) and right of the two-line action (x 270-750)
      line: { text: "Turn one \u201cI can\u2019t\u201d\ninto \u201cI\u2019m learning\u201d.", top: 1010, at: 5.6, stagger: 0.4 }
    },
    sentence: {
      mode: "sentence",
      turn: 4.4,
      land: 5.71,            // the underline has settled: only the mark under the reframing word remains
      sentence: {
        size: 84, lineHeight: 1.08, top: 600,
        // the strongest of three candidates (README lists the other two)
        fragments: [
          { text: "Every limit you name", at: 0.8, stagger: 0.4 },
          { text: "is also", at: 2.7, stagger: 0.4 },
          { text: "a direction.", at: null, stagger: 0.4 }      // at null: its reframing word arrives on the turn
        ],
        reframe: { fragment: 2, word: 1 },                      // "direction." is the word that changes the first line
        dimOthers: { to: 0.72, delay: 0.3, dur: 1.2 }
      },
      pen: { x: null /* null = safe x0 + 40 */, fall: 0.3, fallEase: "power2.in", widthTop: 3, widthTip: 6, markWidth: 5.5, run: 0.55, runEase: "power2.out", underline: 0.13,
             retract: { delay: 0.06, dur: 0.7, ease: "power3.inOut" }, jitter: 1.0, seed: 7 },
      // a lower horizon so the moon sits clear of the three lines
      plate: { src: null, seed: 31, glow: "moon", horizonY: 1320, glowX: 700, fadeIn: [0.15, 1.0], push: [1.0, 1.04], opacity: 0.9 },
      line: null
    }
  };
  var m = (typeof window !== "undefined" && window.REVEAL_MODE) || "word";
  var D = {};
  Object.keys(shared).forEach(function (k) { D[k] = shared[k]; });
  var over = modes[m] || modes.word;
  Object.keys(over).forEach(function (k) { D[k] = over[k]; });
  window.DATA = D;
})();
