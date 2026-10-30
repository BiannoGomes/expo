// Dawnward Living Universe: the single source of truth for design and motion.
// Values mirror apps/mobile/lib/theme.ts and docs/design-direction.md. The
// interactive experience and the film both import this file.

export const color = {
  ground: "#0B0E12",
  void: "#04060A",
  surface: "#12161D",
  line: "#232A34",
  ink: "#ECE9E2",
  dim: "#9AA0A9",
  faint: "#79818F",
  gold: "#C9A96A",
  dawn: "#E8A87C", // sky only, never on components
  cool: "#C7D5EE", // starlight
};

export const type = {
  display: '"Cormorant Garamond", Georgia, serif',
  body: '"Albert Sans", system-ui, sans-serif',
  label: '"IBM Plex Mono", ui-monospace, monospace',
};

// The five motion families. Every animation in the engine names one.
// dur in ms; ease is a function of t in [0,1].
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export const motion = {
  // Breath: organic expansion and contraction. Living things at rest.
  breath: { period: 6400, depth: 0.06, ease: easeInOutSine, reduced: "static at mid value" },
  // Orbit: slow deliberate spatial movement. Worlds, the camera at rest.
  orbit: { period: 48000, radius: 0.35, ease: (t) => t, reduced: "no orbit" },
  // Emergence: meaningful objects appearing from darkness.
  emergence: { dur: 1400, ease: easeOutQuart, scaleFrom: 0.86, reduced: "opacity fade 300 ms" },
  // Gravity: movement with mass. Scroll response, camera follow, world focus.
  gravity: { halfLife: 0.32, focusHalfLife: 0.55, reduced: "halfLife 0 (instant)" },
  // Revelation: transitions that change understanding. The portal, the return.
  revelation: { dur: 2600, ease: easeInOutCubic, reduced: "cross-fade 400 ms, no camera travel" },
  ease: { easeOutQuart, easeInOutCubic, easeInOutSine, easeOutExpo },
};

// Story time s runs 0..5. Rest points are where the story pauses when the
// visitor stops scrolling.
export const chapters = [
  { id: "light", label: "First light", rest: 0.55 },
  { id: "phone", label: "The honest minute", rest: 1.6 },
  { id: "portal", label: "Through the glass", rest: 2.3 },
  { id: "worlds", label: "Your worlds", rest: 3.0 },
  { id: "you", label: "What it understands", rest: 4.0 },
  { id: "end", label: "Become", rest: 5.0 },
];

// The four worlds. Copy is verbatim from apps/mobile/app/world/[world].tsx
// and lib/universe.tsx. "move" values are the canon demonstration plan.
export const worlds = [
  { key: "mind", name: "Mind", meta: "The current exploration", tint: "#9DB4E0",
    title: "The world of clarity.",
    text: "Connections appear here between what you read, what you write and what you believe. The rings are the thoughts that keep returning, settling into orbit.",
    move: "Ship the first chapter to your editor", pos: [2.0, -3.2, -34], size: 13 },
  { key: "body", name: "Body", meta: "A world you know", tint: "#D9A46A",
    title: "The world where promises become physical.",
    text: "Training, rest, the water you're preparing for. This world holds only what your days have shown it. Its weather is simply how things have been lately.",
    move: "40 minutes of open-water prep", pos: [-6.4, 3.4, -44], size: 9.5 },
  { key: "soul", name: "Soul", meta: "Quiet, luminous", tint: "#D6D2E6",
    title: "The quiet, luminous world.",
    text: "Meaning, feeling and the people who matter live here. It grows in light when your evenings say something true.",
    move: "Watch the light change, phone elsewhere", pos: [-7.2, -4.4, -28], size: 5.2 },
  { key: "future", name: "Future", meta: "The direction", tint: "#E3B877",
    title: "The direction you chose.",
    text: "An aspiration you wrote, never a prediction. It gains definition as your days agree with it.",
    move: null, aspiration: "You have built something of your own, and it carries your name with quiet pride.",
    pos: [15, 12, -80], size: 18 },
];

// The real next step that exists today. No store link, no waitlist yet.
export const cta = {
  label: "Follow the build on Instagram",
  href: "https://www.instagram.com/bianno.becoming/",
  note: "Dawnward is in private testing. Nothing to download yet.",
};

// The beat grid of the owner's score "Emotional build" (measured).
export const beat = { period: 0.9387, phase: 0.1, swell: 15.12, climax: 33.89, accent: 54.54 };
