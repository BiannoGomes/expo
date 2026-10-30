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
  gravity: { halfLife: 0.32, omega: 7, maxSpeed: 1.8, focusHalfLife: 0.55, reduced: "chapter steps with a 200 ms cross-fade" },
  // Revelation: transitions that change understanding. The portal, the return.
  revelation: { dur: 2600, ease: easeInOutCubic, reduced: "cross-fade 400 ms, no camera travel" },
  ease: { easeOutQuart, easeInOutCubic, easeInOutSine, easeOutExpo },
  // Shared tokens for CSS, the engine and the Remotion films (marketing/remotion/src/theme.ts).
  tokens: {
    duration: { instant: 120, quick: 240, base: 420, slow: 900, travel: 1400 },
    curve: { standard: [0.65, 0, 0.35, 1], settle: [0.16, 1, 0.3, 1], enter: [0.33, 1, 0.68, 1], exit: [0.32, 0, 0.67, 0] },
    depth: { card: 0.012, glass: 24, lift: 6 }, // phone units, blur px, shadow px
    opacity: { veil: 0.72, quiet: 0.62, ghost: 0.26 },
    stagger: 60,
  },
};

// Story time s runs 0..5. Rest points are where the story pauses when the
// visitor stops scrolling.
export const chapters = [
  { id: "light", label: "First light", rest: 0.55 },
  { id: "debrief", label: "Evening debrief", rest: 1.2 },
  { id: "morning", label: "Morning plan", rest: 1.62 },
  { id: "portal", label: "Through the glass", rest: 2.4 },
  { id: "worlds", label: "Your worlds", rest: 3.0 },
  { id: "you", label: "What it understands", rest: 4.3 },
  { id: "end", label: "Follow the build", rest: 5.0 },
];

// The four worlds. Copy is verbatim from apps/mobile/app/world/[world].tsx
// and lib/universe.tsx. "move" and "belief" values are demonstration content,
// shaped like the app's real assertions; "why" uses the server's own wording
// (server/src/model/voice.ts humanizeBasis), "because" the Today card's reason.
export const worlds = [
  { key: "mind", name: "Mind", meta: "The current exploration", tint: "#9DB4E0",
    title: "The world of clarity.",
    text: "Connections appear here between what you read, what you write and what you believe. The rings are the thoughts that keep returning, settling into orbit.",
    move: "Ship the first chapter to your editor", because: "the campaign turns on finished things",
    belief: { text: "You think most clearly once it is written down.", why: "I have seen this in your days 5 times now." }, pos: [2.0, -3.2, -34], size: 13,
    // identity: cool clear light, a thin crisp atmosphere, approached on an arc
    look: { rim: "#9DB4E0", light: [-0.6, 0.6], reach: 0.035, glow: 0.9, limb: 0.35, distance: 1.55, approach: "arc" },
    sound: { note: 659.25, partials: [[1, 1], [2.01, 0.32], [3.02, 0.12]], decay: 2.4 } },
  { key: "body", name: "Body", meta: "A world you know", tint: "#D9A46A",
    title: "The world where promises become physical.",
    text: "Training, rest, the water you're preparing for. This world holds only what your days have shown it. Its weather is simply how things have been lately.",
    move: "40 minutes of open-water prep", because: "your body keeps the promises your mind makes",
    belief: { text: "Training is how you settle a loud week.", why: "I have seen this in your days 4 times now." }, pos: [-6.4, 3.4, -44], size: 9.5,
    // identity: warm low sun, dense close atmosphere, approached low and direct
    look: { rim: "#D9A46A", light: [-0.75, 0.3], reach: 0.028, glow: 0.7, limb: 0.25, distance: 1.4, approach: "low" },
    sound: { note: 220, partials: [[1, 1], [2, 0.5], [4, 0.12]], decay: 1.8 } },
  { key: "soul", name: "Soul", meta: "Quiet, luminous", tint: "#D6D2E6",
    title: "The quiet, luminous world.",
    text: "Meaning, feeling and the people who matter live here. It grows in light when your evenings say something true.",
    move: "Call your sister. Just to talk.", because: "the people closest get your tired self",
    belief: { text: "You get sharp with the people closest when you\u2019re running on empty.", why: "I have seen this in your days 3 times now." }, pos: [-7.2, -4.4, -28], size: 5.2,
    // identity: soft overhead light, a wide luminous halo, the camera drifts
    look: { rim: "#D6D2E6", light: [0.0, 0.85], reach: 0.05, glow: 1.1, limb: 0.45, distance: 1.6, approach: "drift" },
    sound: { note: 880, partials: [[1, 1], [1.5, 0.22], [2.5, 0.08]], decay: 3.2 } },
  { key: "future", name: "Future", meta: "The direction", tint: "#E3B877",
    title: "The direction you chose.",
    text: "An aspiration you wrote, never a prediction. It gains definition as your days agree with it.",
    move: null, aspiration: "You have built something of your own, and it carries your name with quiet pride.",
    pos: [15, 12, -80], size: 18,
    // identity: dawn on the limb, seen from far away on a long lens
    look: { rim: "#E8A87C", light: [0.9, -0.1], reach: 0.04, glow: 1.0, limb: 0.5, distance: 1.6, approach: "tele" },
    sound: { note: 587.33, partials: [[1, 1], [1.5, 0.45], [2, 0.2]], decay: 3.6 } },
];

// The real next step that exists today. No store link, no waitlist yet.
export const cta = {
  label: "Follow the build on Instagram",
  href: "https://www.instagram.com/bianno.becoming/",
  handle: "@bianno.becoming",
  note: "Coming soon. In private testing, nothing to download yet.",
};

// The beat grid of the owner's score "Emotional build" (measured).
export const beat = { period: 0.9387, phase: 0.1, swell: 15.12, climax: 33.89, accent: 54.54 };
