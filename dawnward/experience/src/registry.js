// Dawnward's world registry. Every place a person can go is defined here as
// data: what it is, how it looks, where it leads, what it offers, how progress
// shows, and how it reads without any 3D. Screens read from this; adding a
// world or galaxy starts here, plus reviewed content and approved art.
import { SYSTEMS, WORLD_PLAY } from "../../packages/core/src/expeditions/index.ts";

export const ORDER = ["mind", "body", "soul", "spirit", "future"];

const COPY = {
  mind: { name: "Mind", kicker: "Your inner world", q: "What is on your mind?", line: "A quiet space to understand what you are carrying.", start: "Begin with a thought, a feeling, or a moment from today.", words: "Reflect · Understand · Clarity" },
  body: { name: "Body", kicker: "Your energy and habits", q: "How did your body carry you today?", line: "A quiet space to notice energy, rest and movement.", start: "Begin with how you slept, moved or felt.", words: "Energy · Habits · Wellbeing" },
  soul: { name: "Soul", kicker: "Your values and connections", q: "Who or what mattered today?", line: "A quiet space for people, meaning and feeling.", start: "Begin with a person, a moment or a feeling that stayed with you.", words: "Values · Connection · Meaning" },
  spirit: { name: "Spirit", kicker: "Your sense of wonder", q: "What gave you a sense of awe or stillness today?", line: "A quiet space for wonder, stillness and the big questions.", start: "Begin with a moment that felt bigger than you, or a question you keep coming back to.", words: "Awe · Stillness · Wonder" },
  future: { name: "Future", kicker: "Your goals and pathways", q: "What moved you closer today?", line: "A quiet space for where you're heading.", start: "Begin with a step you took, or one you're ready to take.", words: "Goals · Pathways · Possibilities" },
};

/** The five worlds of the Personal Growth galaxy. */
export const WORLDS = ORDER.map((id) => ({
  id,
  ...COPY[id],
  description: COPY[id].line,
  assets: { planet: `img/worlds/planet-${id}-640.webp`, closeup: `img/worlds/closeup-${id}.webp`, placeholder: id === "spirit" },
  theme: { color: `var(--${id})` },
  route: `#/world/${id}`,
  /** What you can do here: the reflection space, plus its solar systems (skill pathways). */
  experiences: () => ({ reflect: true, systems: SYSTEMS.filter((x) => x.world === id), mechanic: WORLD_PLAY[id].mechanic, planned: WORLD_PLAY[id].planned }),
  /** Progress here is discoveries from saved actions only: stars for chapters, a moon for a finished system, landmarks for real actions looked back on. */
  progression: { discoveries: ["star", "moon", "landmark"], fromSavedDataOnly: true },
  /** Without 3D: the text view lists this world, its memories and patterns. */
  fallback: "text-view",
}));
export const META = COPY;
export const worldRoute = (id) => `#/world/${id}`;

// The Universe Atlas. Only what is built opens; the rest is a preview and says so plainly.
export const GALAXIES = [
  { id: "growth", p: [50, 50, 38], name: "Personal Growth", tag: "Your inner universe: Mind, Body, Soul, Spirit and Future.", open: true, hue: 0, x: 50, y: 46, size: 30 },
  { id: "ai", p: [20, 27, 26], name: "AI Creation", tag: "An interactive creation studio: build ideas, projects, content and practical workflows with AI.", planned: "A conversation simulator, a decision lab, an imagination studio, a knowledge explorer, a future-self dialogue, and values exercises.", hue: 175, x: 20, y: 20, size: 18 },
  { id: "knowledge", p: [80, 27, 26], name: "Knowledge", tag: "A living knowledge atlas: learn subjects through visual explanations, reading and quizzes.", planned: "Guided explorations of ideas, one small world at a time, each with a short quiz you can retry.", hue: 215, x: 81, y: 19, size: 17 },
  { id: "spiritual", p: [20, 73, 26], name: "Spiritual Exploration", tag: "Immersive contemplation: meditation, philosophy, awe and meaning, never presenting speculation as fact.", planned: "Practices of awe and attention, and questions worth sitting with. Spirit's world in Personal Growth is already open.", hue: 265, x: 17, y: 74, size: 17 },
  { id: "creative", p: [80, 73, 26], name: "Creative Worlds", tag: "A world-building and storytelling studio.", planned: "Create stories, art concepts, music briefs and imaginative experiences, one small project at a time.", hue: 305, x: 83, y: 73, size: 17 },
  { id: "gateway", p: [50, 9, 19], name: "Quantum Gateway", tag: "A step toward the person you are becoming.", planned: "Opens next: the Future Self Observatory, with the Mirror, the Crossroads and the First Step. A visual metaphor for imagining possible futures, never a prediction.", kind: "gateway", x: 50, y: 12, size: 13 },
  { id: "earth", p: [50, 90, 24], name: "Earth Realm", tag: "Your everyday life: today, your actions and your words.", open: true, kind: "earth", x: 50, y: 85, size: 13 },
];
