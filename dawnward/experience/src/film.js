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
  [1.6, 1.0, easeOutQuart],          // the evening debrief
  [5.6, 1.18, easeInOutSine],        // the confession types itself
  [7.4, 1.3, easeInOutSine],
  [8.6, 1.42, easeInOutSine],        // morning
  [10.0, 1.56, easeInOutSine],       // the sister step lifts
  [12.6, 1.66, easeInOutSine],       // kept: its seed of light
  [14.2, 1.8, easeInOutSine],
  [beat.swell, 2.25, (k) => k * k],  // through the glass, on the swell
  [17.6, 2.62, easeOutQuart],
  [20.4, 2.95, easeInOutSine],
  [22.0, 3.0, easeOutQuart],         // the worlds, named as they bloom
  [32.0, 3.0, null],                 // Soul is visited
  [34.4, 3.9, easeInOutCubic],       // the phone returns on the climax
  [37.0, 4.25, easeInOutSine],
  [47.0, 4.32, null],                // the insight, held long enough to read
  [52.0, 4.55, easeInOutSine],
  [beat.accent, 4.85, easeInOutCubic],
  [56.0, 5.0, easeOutQuart],
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
  [0.0, 1.8, 0.35, 1], [1.8, 6.4, 1, 1], [6.4, 8.0, 1, 0.25], [8.0, 8.6, 0.25, 0.25], [8.6, 10.2, 0.25, 1], [10.2, 12.4, 1, 1], [12.4, 14.0, 1, 0],
  [35.0, 37.6, 0, 1], [37.6, 47.0, 1, 1], [47.0, 49.6, 1, 0],
];
function pushAt(t) {
  for (const [a, b, v0, v1] of PUSH) if (t >= a && t <= b) return v0 + (v1 - v0) * easeInOutSine(seg(t, a, b));
  return 0;
}

// Visit: the camera goes to Soul, its panel opens, then it returns.
const VISITS = [{ key: "soul", from: 24.6, to: 31.2 }];
// Each world blooms on its spoken name ("Mind, body, soul, and future").
const BLOOM_AT = { mind: 20.75, body: 21.6, soul: 22.7, future: 23.65 };

export function filmState(ms) {
  const t = ms / 1000;
  const s = sAt(t);
  let focusKey = null, focusAmt = 0, panelOpen = false;
  for (const v of VISITS) {
    if (t >= v.from && t <= v.to + 2.2) {
      focusKey = v.key;
      // approach 2.6 s, return 2.2 s: Gravity, never a lurch
      focusAmt = easeInOutCubic(seg(t, v.from, v.from + 2.6)) * (1 - easeInOutCubic(seg(t, v.to, v.to + 2.2)));
      panelOpen = t > v.from + 2.0 && t < v.to;
    }
  }
  // Through the glass, the worlds are already there, dim, waiting.
  const wait = 0.26 * easeOutQuart(seg(t, 14.4, 17.5));
  const bloom = worlds.map((w) => Math.max(wait, easeOutQuart(seg(t, BLOOM_AT[w.key], BLOOM_AT[w.key] + 1.3))));
  const push = pushAt(t);
  const ping = seg(t, 41.6, 42.9); // "you can tell it": the dispute control answers
  const end = t >= beat.accent;
  const endAmt = easeOutQuart(seg(t, beat.accent, beat.accent + 1.0));
  const fade = seg(t, 59.0, 59.85);
  return { s, focusKey, focusAmt, bloom, panelOpen, end, endAmt, fade, push, spot: push, ping: ping > 0 && ping < 1 ? ping : 0 };
}

// Captions are the narration, so the film works with the sound off.
const CAPS = [
  [0.6, 4.1, "Ever go to bed not sure how your day really went?"],
  [4.4, 7.3, "Dawnward is a journal you talk to."],
  [10.3, 14.4, "No streaks. No scores. No guilt."],
  [15.4, 18.1, "Nothing you live honestly is lost."],
  [18.4, 25.6, "Your days become four worlds. Mind, body, soul and future."],
  [34.2, 39.3, "And slowly, it understands you. And shows you why."],
  [40.4, 43.2, "And when it’s wrong, you can tell it."],
  [44.0, 46.7, "Private. Never sold."],
  [47.6, 50.4, "Just you, understood."],
  [55.2, 58.4, "Dawnward. Coming soon."],
];
export function filmCaptions(ms) {
  const t = ms / 1000;
  const c = CAPS.find(([a, b]) => t >= a && t < b);
  return c ? c[2] : "";
}
export const FILM_CAPTIONS = CAPS;
