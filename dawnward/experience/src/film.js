// The film is the experience, played by a director instead of a visitor.
// filmState(ms) is pure: the same millisecond always gives the same frame.
import { motion, beat, worlds } from "./tokens.js";

const { easeOutQuart, easeInOutCubic, easeInOutSine } = motion.ease;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const B = (n) => beat.phase + beat.period * n; // beat n in seconds

export const FILM_MS = 60000;

// [time (s), story time s, easing into this key]
const S_KEYS = [
  [0.0, 0.0, null],
  [5.7, 0.86, easeOutQuart],         // the light forms
  [9.4, 1.34, easeInOutSine],        // the phone, the honest minute, typing
  [14.2, 1.80, easeInOutSine],       // morning: three moves, one kept, the seed glows
  [beat.swell, 2.25, (k) => k * k],  // through the glass, landing on the swell
  [22.6, 2.62, easeOutQuart],        // drifting deep into the sky
  [B(35), 2.95, easeInOutSine],      // gathering toward the climax
  [beat.climax, 3.0, easeOutQuart],  // the hub
  [B(48), 3.0, null],                // hold through the sustain (worlds visited)
  [47.6, 3.92, easeInOutCubic],      // the phone returns, human scale
  [53.4, 4.25, easeInOutSine],       // the personal revelation holds
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

// Visits: the camera goes to a world, its panel opens, then it returns.
const VISITS = [
  { key: "mind", from: 23.57, to: 30.14 },
  { key: "future", from: B(40), to: B(47) },
];

export function filmState(ms) {
  const t = ms / 1000;
  const s = sAt(t);
  let focusKey = null, focusAmt = 0, panelOpen = false;
  for (const v of VISITS) {
    if (t >= v.from && t <= v.to + 1.6) {
      focusKey = v.key;
      focusAmt = easeInOutCubic(seg(t, v.from, v.from + 1.9)) * (1 - easeInOutCubic(seg(t, v.to, v.to + 1.6)));
      panelOpen = t > v.from + 1.3 && t < v.to;
    }
  }
  // Mind is lit when we first visit it; the others bloom one per downbeat at the climax.
  const bloom = worlds.map((w, i) => {
    if (w.key === "mind") return easeOutQuart(seg(t, 21.7, 23.6));
    const order = { body: 0, soul: 1, future: 2 }[w.key];
    return easeOutQuart(seg(t, beat.climax + order * beat.period, beat.climax + order * beat.period + 1.3));
  });
  const end = t >= beat.accent;
  const endAmt = easeOutQuart(seg(t, beat.accent, beat.accent + 1.0));
  const fade = seg(t, 59.0, 59.85);
  return { s, focusKey, focusAmt, bloom, panelOpen, end, endAmt, fade };
}

// Captions are the narration, so the film works with the sound off.
const CAPS = [
  [0.35, 3.7, "Ever go to bed not sure how your day really went?"],
  [3.95, 6.35, "Dawnward is a journal you talk to."],
  [6.6, 9.45, "It listens. Night after night."],
  [9.75, 13.8, "No streaks. No scores. No guilt."],
  [16.4, 21.4, "Nothing you live honestly is lost."],
  [46.3, 50.9, "And slowly, it understands you. And shows you why."],
  [51.3, 53.6, "Just you, understood."],
];
export function filmCaptions(ms) {
  const t = ms / 1000;
  const c = CAPS.find(([a, b]) => t >= a && t < b);
  return c ? c[2] : "";
}
export const FILM_CAPTIONS = CAPS;
