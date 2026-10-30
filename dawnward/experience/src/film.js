// The film is the experience, played by a director instead of a visitor.
// filmState(ms) is pure: the same millisecond always gives the same frame.
import { motion, beat, worlds } from "./tokens.js";

const { easeOutQuart, easeInOutCubic, easeInOutSine } = motion.ease;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));

export const FILM_MS = 60000;

// [time (s), story time s, easing into this key]
// One thread: the confession, the morning step it becomes, the Soul world
// where the people who matter live, and what the app comes to understand.
const S_KEYS = [
  [0.0, 0.74, null],                 // the phone already forming out of the light
  [1.4, 1.0, easeOutQuart],          // the evening debrief
  [4.4, 1.18, easeInOutSine],        // the confession types itself
  [5.4, 1.3, easeInOutSine],
  [6.4, 1.42, easeInOutSine],        // morning: three steps from your own words
  [7.8, 1.56, easeInOutSine],        // the sister step lifts
  [10.6, 1.66, easeInOutSine],       // kept: its seed of light
  [14.2, 1.8, easeInOutSine],
  [beat.swell, 2.25, (k) => k * k],  // through the glass, on the swell
  [17.6, 2.62, easeOutQuart],
  [20.4, 2.95, easeInOutSine],
  [22.0, 3.0, easeOutQuart],         // the worlds, named as they bloom
  [31.0, 3.0, null],                 // Soul is visited
  [beat.climax, 3.9, easeInOutCubic], // the phone returns on the climax
  [36.0, 4.25, easeInOutSine],
  [44.0, 4.32, null],                // the insight, held long enough to read
  [48.5, 4.62, easeInOutSine],
  [51.73, 4.9, easeInOutCubic],      // the end card on a downbeat
  [53.0, 5.0, easeOutQuart],
  [60.0, 5.0, null],
];

function sAt(t) {
  for (let i = 1; i < S_KEYS.length; i++) {
    const [t1, s1, ease] = S_KEYS[i];
    const [t0, s0] = S_KEYS[i - 1];
    if (t <= t1) return s0 + (s1 - s0) * (ease || ((k) => k))(seg(t, t0, t1));
  }
  return 5;
}

// The reading push: [from, to, start value, end value], eased.
const PUSH = [
  [0.0, 1.6, 0.35, 1], [1.6, 4.8, 1, 1], [4.8, 6.0, 1, 0.25], [6.0, 6.4, 0.25, 0.25], [6.4, 7.8, 0.25, 1], [7.8, 12.4, 1, 1], [12.4, 14.0, 1, 0],
  [34.2, 36.6, 0, 1], [36.6, 44.0, 1, 1], [44.0, 46.6, 1, 0],
];
function pushAt(t) {
  for (const [a, b, v0, v1] of PUSH) if (t >= a && t <= b) return v0 + (v1 - v0) * easeInOutSine(seg(t, a, b));
  return 0;
}

// Visit: the camera goes to Soul, its panel opens, then it returns.
const VISIT = { key: "soul", from: 25.3, to: 30.5, approach: 2.4, back: 2.2 };
// Each world blooms on its spoken name ("Mind, body, soul, and future"),
// measured from the narration: nB starts at 18.4 s.
const BLOOM_AT = { mind: 21.65, body: 22.77, soul: 23.68, future: 24.75 };
const END = 51.73, CTA = beat.accent;

export function filmState(ms) {
  const t = ms / 1000;
  const s = sAt(t);
  let focusKey = null, focusAmt = 0, panelOpen = false;
  const v = VISIT;
  if (t >= v.from && t <= v.to + v.back) {
    focusKey = v.key;
    focusAmt = easeInOutCubic(seg(t, v.from, v.from + v.approach)) * (1 - easeInOutCubic(seg(t, v.to, v.to + v.back)));
    panelOpen = t > v.from + 1.8 && t < v.to;
  }
  // Through the glass, the worlds are already there, dim, waiting.
  const wait = 0.26 * easeOutQuart(seg(t, 14.4, 17.5));
  const bloom = worlds.map((w) => Math.max(wait, easeOutQuart(seg(t, BLOOM_AT[w.key], BLOOM_AT[w.key] + 1.3))));
  const push = pushAt(t);
  // "you can tell it": the control answers, then the card is set aside, as in the app
  const ping = seg(t, 40.1, 41.3);
  const disp = easeInOutSine(seg(t, 40.5, 41.3));
  // the wordmark begins to form just before the downbeat, so the sky never empties to black
  const end = t >= END - 0.7;
  const endAmt = easeOutQuart(seg(t, END - 0.7, END + 0.5));
  const ctaAmt = easeOutQuart(seg(t, CTA, CTA + 0.8));
  const fade = seg(t, 59.0, 59.85);
  return { s, focusKey, focusAmt, bloom, panelOpen, end, endAmt, ctaAmt, fade, push, spot: push, ping: ping > 0 && ping < 1 ? ping : 0, disp };
}

// Captions are the narration, so the film works with the sound off.
const CAPS = [
  [0.5, 3.95, "Ever go to bed not sure how your day really went?"],
  [4.1, 6.55, "Dawnward is a journal you talk to."],
  [6.75, 11.1, "Every morning, three small steps. Drawn from your own words."],
  [11.25, 15.3, "No streaks. No scores. No guilt."],
  [15.4, 18.1, "Nothing you live honestly is lost."],
  [18.4, 25.6, "Your days become four worlds. Mind, body, soul and future."],
  [27.3, 30.3, "The people who matter live in Soul."],
  [33.6, 38.3, "Slowly, it understands you. And shows you why."],
  [38.6, 41.2, "And when it’s wrong, you can tell it."],
  [42.2, 44.6, "Private. Never sold."],
  [45.2, 47.7, "Just you, understood."],
  [52.3, 54.7, "Dawnward. Coming soon."],
];
export function filmCaptions(ms) {
  const t = ms / 1000;
  const c = CAPS.find(([a, b]) => t >= a && t < b);
  return c ? c[2] : "";
}
export const FILM_CAPTIONS = CAPS;
