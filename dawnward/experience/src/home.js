// Galaxy Home: Dawnward's universe in a browser. Home → a world → reflect →
// a new star → Memories → You, with one tab bar everywhere.
//
// Data. Nothing here is invented. Without a token, what the person writes is
// kept on this device (localStorage) and only reported as kept once it has
// been written and read back. With a token, the real Dawnward API is used
// (/galaxy, /debrief, /assertions/:id/dispute, /campaign), only ever on this
// page's own origin or a local development server.
//
// Rendering. Every word is HTML. The 3D scene (home-scene.js) is the setting
// and never the source of truth: state lives here.
import { buildHome } from "./home-scene.js";
import { createExplore, localStore, remoteStore } from "./explore.js";
import { MISSIONS, SYSTEMS, WORLD_PLAY, missionById } from "../../packages/core/src/expeditions/index.ts";

const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const asset = (p) => (window.DW_ASSETS ? window.DW_ASSETS(p) : `assets/${p}`);
const ORDER = ["mind", "body", "soul", "spirit", "future"];
const META = {
  mind: { name: "Mind", kicker: "Your inner world", q: "What is on your mind?", line: "A quiet space to understand what you are carrying.", start: "Begin with a thought, a feeling, or a moment from today.", words: "Reflect · Understand · Clarity" },
  body: { name: "Body", kicker: "Your energy and habits", q: "How did your body carry you today?", line: "A quiet space to notice energy, rest and movement.", start: "Begin with how you slept, moved or felt.", words: "Energy · Habits · Wellbeing" },
  soul: { name: "Soul", kicker: "Your values and connections", q: "Who or what mattered today?", line: "A quiet space for people, meaning and feeling.", start: "Begin with a person, a moment or a feeling that stayed with you.", words: "Values · Connection · Meaning" },
  spirit: { name: "Spirit", kicker: "Your sense of wonder", q: "What gave you a sense of awe or stillness today?", line: "A quiet space for wonder, stillness and the big questions.", start: "Begin with a moment that felt bigger than you, or a question you keep coming back to.", words: "Awe · Stillness · Wonder" },
  future: { name: "Future", kicker: "Your goals and pathways", q: "What moved you closer today?", line: "A quiet space for where you're heading.", start: "Begin with a step you took, or one you're ready to take.", words: "Goals · Pathways · Possibilities" },
};
// The Universe Atlas. Only what is built opens; the rest says so plainly.
const GALAXIES = [
  { id: "growth", p: [50, 50, 38], name: "Personal Growth", tag: "Your inner universe: Mind, Body, Soul, Spirit and Future.", open: true, hue: 0, x: 50, y: 46, size: 30 },
  { id: "ai", p: [20, 27, 26], name: "AI Discovery", tag: "Conversations, decisions and imagination, practised with AI.", planned: "A conversation simulator, a decision lab, an imagination studio, a knowledge explorer, a future-self dialogue, and values exercises.", hue: 175, x: 20, y: 20, size: 18 },
  { id: "knowledge", p: [80, 27, 26], name: "Knowledge", tag: "Learn something new, visually.", planned: "Guided explorations of ideas, one small world at a time.", hue: 215, x: 81, y: 19, size: 17 },
  { id: "spiritual", p: [20, 73, 26], name: "Spiritual Exploration", tag: "Awe, stillness and the big questions.", planned: "Practices of awe and attention, and questions worth sitting with. Spirit's world in Personal Growth is already open.", hue: 265, x: 17, y: 74, size: 17 },
  { id: "creative", p: [80, 73, 26], name: "Creative", tag: "Imagination, given room.", planned: "Short creative practices: stories, images and making things.", hue: 305, x: 83, y: 73, size: 17 },
  { id: "gateway", p: [50, 9, 19], name: "Quantum Gateway", tag: "A step toward the person you are becoming.", planned: "Opens next: the Future Self Observatory, with the Mirror, the Crossroads and the First Step. A visual metaphor for imagining possible futures, never a prediction.", kind: "gateway", x: 50, y: 12, size: 13 },
  { id: "earth", p: [50, 90, 24], name: "Earth Realm", tag: "Your everyday life: today, your actions and your words.", open: true, kind: "earth", x: 50, y: 85, size: 13 },
];

const CONFIDENCE = { hypothesis: "Still forming", probable: "Probably true", established: "Well established" };
const svg = (paths, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICON = {
  explore: `<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>`,
  pen: `<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>`,
  mind: '<path d="M12 4c-3.3 0-6 2.5-6 5.6 0 1.8.9 3.4 2.3 4.4V17h7.4v-3c1.4-1 2.3-2.6 2.3-4.4C18 6.5 15.3 4 12 4Z"/><path d="M9.5 20h5M12 8v6M9.5 10.5 12 12l2.5-1.5"/>',
  body: '<path d="M5 19c7 0 13-5 14-14-8 1-13 6-13 12"/><path d="M6 17c3-3 6-5 9-7"/>',
  soul: '<path d="M12 20c-4-2-7-5-7-9 2 0 4 1 5 3-.5-3 .5-6 2-8 1.5 2 2.5 5 2 8 1-2 3-3 5-3 0 4-3 7-7 9Z"/>',
  future: '<path d="M4 16h16M7 16a5 5 0 0 1 10 0"/><path d="M12 5v3M5.5 9l1.8 1.5M18.5 9l-1.8 1.5M3 19h18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  atlas: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><circle cx="12" cy="12" r="1.6"/>',
  earth: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  spirit: '<circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="12" r="5.5"/><path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
};

function hash(id, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967295;
}
const longDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
const shortDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
const weekday = (d) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: "long" });
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) n.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
};
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const seenIn = (n, days) => (n <= 1 ? "Seen in one of your evenings so far." : `Seen in ${n} of your evenings, across ${days} ${days === 1 ? "day" : "days"}.`);

// ---------- This device: memories, patterns and the unsent draft ----------

const STORE = "dw-local-v1", DRAFT = "dw-draft-v1";
const device = {
  read(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  /** Writes, then reads back: true only if what was written is really there. */
  write(key, value) {
    try { const s = JSON.stringify(value); localStorage.setItem(key, s); return localStorage.getItem(key) === s; } catch { return false; }
  },
  remove(key) { try { localStorage.removeItem(key); return localStorage.getItem(key) === null; } catch { return false; } },
};

/** Works out what the screen shows from what is kept, so every count matches. */
function finish(data) {
  const byId = new Map(data.stars.map((s) => [s.id, s]));
  for (const s of data.stars) s.themeIds = [];
  for (const t of data.themes) {
    t.starIds = t.starIds.filter((id) => byId.has(id));
    if (!t.rejected) for (const id of t.starIds) byId.get(id).themeIds.push(t.id);
    t.why = seenIn(t.starIds.length, new Set(t.starIds.map((id) => byId.get(id).date)).size);
    t.forming = t.starIds.length < 2 || t.confidence === "hypothesis";
  }
  data.themes = data.themes.filter((t) => t.starIds.length);
  data.links = data.themes.filter((t) => !t.rejected).flatMap((t) => t.starIds.slice(1).map((to, i) => ({ from: t.starIds[i], to, themeId: t.id })));
  return data;
}
function localData() {
  const kept = device.read(STORE, { stars: [], themes: [] });
  return finish({ stars: kept.stars ?? [], themes: kept.themes ?? [], goal: null, local: true });
}
const keepLocal = (data) => device.write(STORE, {
  stars: data.stars.map(({ id, world, date, excerpt }) => ({ id, world, date, excerpt })),
  themes: data.themes.map(({ id, world, statement, starIds, confidence, words, accepted, corrected, rejected }) => ({ id, world, statement, starIds, confidence, words, accepted, corrected, rejected })),
});

// ---------- The Dawnward API (with a token) ----------

function trustedApi(raw) {
  if (!raw) return location.origin;
  try {
    const u = new URL(raw);
    const local = ["localhost", "127.0.0.1"].includes(u.hostname);
    if (u.origin === location.origin || (local && ["http:", "https:"].includes(u.protocol))) return u.origin;
  } catch {}
  return null;
}
let api = null, token = null;
async function call(path, init = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(`${api}${path}`, { ...init, signal: ctl.signal, headers: { authorization: `Bearer ${token}`, ...(init.body ? { "content-type": "application/json" } : {}) } });
    if (!res.ok) { const e = new Error(`${path} ${res.status}`); e.status = res.status; throw e; }
    return res.json();
  } finally { clearTimeout(timer); }
}
async function loadConnected() {
  const per = await Promise.all(ORDER.map((w) => call(`/galaxy?world=${w}`)));
  const stars = new Map(), themes = new Map();
  per.forEach((g, i) => {
    for (const s of g.stars) if (!stars.has(s.id)) stars.set(s.id, { ...s, world: ORDER[i] });
    for (const t of g.themes) if (!themes.has(t.id)) themes.set(t.id, { ...t, world: ORDER[i] });
  });
  let goal = null;
  try {
    const c = await call("/campaign");
    goal = { title: c.title, milestones: (c.milestones ?? []).map((m) => ({ title: m.title, day: m.day })) };
  } catch {}
  const list = [...stars.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return finish({ stars: list, themes: [...themes.values()], goal, local: false });
}
async function loadData() {
  const params = new URLSearchParams(location.hash.slice(1));
  token = params.get("token");
  if (!token) return localData();
  history.replaceState(null, "", location.pathname + location.search); // read once, gone from the address bar
  api = trustedApi(new URLSearchParams(location.search).get("api"));
  if (!api) throw new Error("untrusted api origin");
  return loadConnected();
}

// Without the server, Dawnward's safety check can't run. Clear crisis phrases
// still get only the hand-written support text the server uses, and nothing is kept.
const DISTRESS = /\b(kill myself|suicid|end it all|end my life|hurt myself|self[- ]harm|don'?t want to (be here|live))/i;
const CRISIS_TEXT = [
  "Thank you for telling me this. What you're carrying right now matters more than any plan or goal.",
  "I can't help with this the way a person can, and you deserve real support:",
  "• findahelpline.com lists free, confidential support lines for your country",
  "If you are in immediate danger, please contact emergency services now.",
];

// Possible connections: two evenings that use the same meaningful word. A
// plain fact the person can confirm or ignore, never a conclusion about them.
const STOP = new Set("about after again also always before being could didn't doesn't every from have just know like little made make more much really should some still than that their them then there these they thing think this those through today tonight very want went were what when where which while with would your felt feel feeling good back into over time days evening night morning".split(" "));
const wordsOf = (t) => new Set((t.toLowerCase().match(/[a-z']{4,}/g) ?? []).map((w) => w.replace(/'s$/, "")).filter((w) => !STOP.has(w)));

// ---------- Sound: only after a click ----------

const sound = {
  ctx: null, master: null, on: false,
  start() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      const ctx = (this.ctx = new AC());
      this.master = ctx.createGain(); this.master.gain.value = 0; this.master.connect(ctx.destination);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; lp.connect(this.master);
      for (const [f, d] of [[110, 0], [164.81, 4], [220.5, -5]]) {
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f; o.detune.value = d;
        const g = ctx.createGain(); g.gain.value = 0.18; o.connect(g); g.connect(lp); o.start();
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + Math.random() * 0.05;
        const lg = ctx.createGain(); lg.gain.value = 0.08; lfo.connect(lg); lg.connect(g.gain); lfo.start();
      }
    }
    this.ctx.resume();
    this.master.gain.setTargetAtTime(0.12, this.ctx.currentTime, 0.8);
    this.on = true;
    return true;
  },
  stop() { if (this.ctx) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3); this.on = false; },
  duck(on) { if (this.on && this.ctx) this.master.gain.setTargetAtTime(on ? 0.04 : 0.12, this.ctx.currentTime, 0.6); },
  chime(freq = 880) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = "sine"; o.frequency.value = freq; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.08, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 1.7);
  },
};

// ---------- The page ----------

function main(data, failed) {
  const state = { place: "home", world: null, lastWorld: "mind", mode: "galaxy", selStar: null, filter: "all", query: "", view: "galaxy", zoom: 1, dismissed: new Set(), draftWorld: "mind" };
  const announce = (msg) => { const live = $("live"); live.textContent = ""; setTimeout(() => (live.textContent = msg), 30); };
  const starById = (id) => data.stars.find((s) => s.id === id);
  const themeById = (id) => data.themes.find((t) => t.id === id);
  const worldStars = (w) => data.stars.filter((s) => s.world === w);
  const liveThemes = () => data.themes.filter((t) => !t.rejected);
  const worldThemes = (w) => liveThemes().filter((t) => t.world === w);
  const keptWhere = data.local ? "on this device" : "in your Dawnward";
  if (failed) $("note").textContent = "I couldn't reach your Dawnward, so this shows only what's kept on this device.";
  $("note").hidden = !failed;

  // ----- 3D -----
  let ctx = null;
  try { ctx = buildHome({ stage: $("stage"), reduced, hash }); } catch { ctx = null; }
  if (!ctx) document.body.classList.add("no-webgl");
  let explore = null;
  const discoveryStars = () => (explore && explore.data.gameLayer ? explore.data.discoveries.map((d) => ({ id: `d:${d.key}`, world: d.world ?? "spirit", date: (d.discoveredAt ?? "").slice(0, 10), excerpt: "", themeIds: [], discovery: true })) : []);
  const sync = (bornId) => { if (ctx) { ctx.setMemories({ stars: [...data.stars, ...discoveryStars()], links: data.links }, bornId); highlight(); } };
  function highlight() {
    if (!ctx) return;
    const w = state.place === "world" ? state.world : null;
    const lit = new Set(w ? worldStars(w).map((s) => s.id) : []);
    if (state.selStar) lit.add(state.selStar);
    const litThemes = new Set(w ? worldThemes(w).map((t) => t.id) : []);
    ctx.setSelection({ litIds: lit, selId: state.selStar, litThemes });
  }
  sync();

  // ----- the four worlds: curved name, Explore below, nothing overlapping -----
  const NS = "http://www.w3.org/2000/svg";
  const labels = new Map(), arcs = new Map();
  for (const w of ORDER) {
    const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
    const s = mk("svg", { class: `arc arc-${w}`, "aria-hidden": "true" });
    const top = mk("path", { id: `arc-top-${w}`, fill: "none" }), bot = mk("path", { id: `arc-bot-${w}`, fill: "none" });
    const name = mk("text", { class: "aname" }), words = mk("text", { class: "awords" });
    const tp1 = mk("textPath", { href: `#arc-top-${w}`, startOffset: "50%", "text-anchor": "middle" }); tp1.textContent = META[w].name.toUpperCase();
    const tp2 = mk("textPath", { href: `#arc-bot-${w}`, startOffset: "50%", "text-anchor": "middle" }); tp2.textContent = META[w].words.toUpperCase();
    name.append(tp1); words.append(tp2); s.append(top, bot, name, words);
    $("planets").append(s);
    arcs.set(w, { svg: s, top, bot, words, last: "" });
    const b = el("button", { class: `planet planet-${w}`, "data-world": w, onclick: () => goWorld(w) },
      el("span", { class: "pn" }, META[w].name), el("span", { class: "pk" }, META[w].kicker));
    $("planets").append(b);
    labels.set(w, b);
  }
  for (const w of ORDER) $("worldbar").append(el("button", { class: `planet-${w}`, "data-world": w, onclick: () => goWorld(w) }, el("span", { html: svg(ICON[w], 16) }), el("span", {}, META[w].name)));
  const refreshNames = () => { for (const w of ORDER) labels.get(w).setAttribute("aria-label", `${META[w].name}: ${META[w].kicker.toLowerCase()}. ${plural(worldStars(w).length, "memory", "memories")}. Enter`); };

  // ----- home: one question, one action -----
  function renderHome() {
    const n = data.stars.length;
    $("home-meta").textContent = `Five worlds: Mind, Body, Soul, Spirit and Future. Tap one to enter.${n ? ` ${plural(n, "memory", "memories")} so far.` : ""}`;
    const sug = suggestions()[0];
    $("notice").hidden = !sug;
    if (sug) $("notice-n").textContent = `Two evenings both mention “${sug.word}”`;
    refreshNames();
  }

  // ----- breadcrumbs: where you are, and every step back to the Universe -----
  function crumbs(items) {
    const trail = items[0]?.label === "Universe" || items[0]?.root ? items : [{ label: "Universe", go: () => openAtlas() }, ...items];
    return el("nav", { class: "crumbs", "aria-label": "You are here" }, el("ol", {}, trail.map((c, i) => el("li", {},
      i === trail.length - 1 || !c.go ? el("span", { "aria-current": i === trail.length - 1 ? "location" : null }, c.label) : el("button", { onclick: c.go }, c.label)))));
  }
  const growthCrumb = { label: "Personal Growth", go: () => goHome() };

  // ----- the world template: the same structure for all five -----
  const world = $("world"), wbody = $("w-body");
  function worldIntro(w) {
    const stars = [...worldStars(w)].reverse(), themes = worldThemes(w);
    const more = [];
    if (w === "future" && data.goal) more.push(goalBlock(data.goal));
    more.push(el("section", { class: "group", "aria-labelledby": "w-mem-h" },
      el("div", { class: "group-head" }, el("h3", { id: "w-mem-h" }, `Memories in ${META[w].name}`), stars.length > 3 ? el("button", { class: "text-btn", onclick: () => openMemories({ filter: w }) }, "See all") : null),
      stars.length
        ? el("ul", { class: "memories" }, stars.slice(0, 3).map((s) => el("li", {}, memoryButton(s, () => openMemory(s.id)))))
        : el("p", { class: "quiet" }, "No memories here yet. Your first one becomes a star in this world.")));
    more.push(el("section", { class: "group", "aria-labelledby": "w-und-h" },
      el("h3", { id: "w-und-h" }, "What I understand here"),
      themes.length ? el("div", { class: "cards" }, themes.map(patternCard)) : el("p", { class: "quiet" }, "I don't have enough evidence to conclude anything here yet.")));
    wbody.replaceChildren(
      el("p", { class: "kicker" }, META[w].kicker),
      el("h2", { class: "w-q", id: "w-q", tabindex: "-1" }, META[w].q),
      el("p", { class: "w-line" }, META[w].line),
      el("p", { class: "w-start" }, META[w].start),
      el("button", { class: "primary wide", onclick: () => openEditor(w) }, "Begin reflection"),
      worldSystems(w),
      ...more);
    document.body.classList.remove("sheet-open");
  }
  // Each world plays its own way; its solar systems open missions right here.
  function worldSystems(w) {
    const systems = SYSTEMS.filter((x) => x.world === w);
    const play = WORLD_PLAY[w];
    const done = (id) => explore?.data.attempts.some((a) => a.missionId === id && a.status === "completed");
    return el("section", { class: "group", "aria-labelledby": "w-sys-h" },
      el("h3", { id: "w-sys-h" }, "Solar systems"),
      el("p", { class: "quiet" }, play.mechanic),
      ...systems.map((sys) => el("div", { class: "system" },
        el("p", { class: "kicker" }, "Solar system"),
        el("p", { class: "sys-title" }, sys.title),
        el("p", { class: "quiet" }, sys.objective),
        el("ul", { class: "missions" }, sys.missionIds.map(missionById).map((m) => el("li", {}, el("button", {
          class: `mission${done(m.id) ? " done" : ""}`, "aria-label": `${m.title}, ${m.part}. ${m.objective} ${done(m.id) ? "Done." : `${m.minutes} minutes.`}`,
          onclick: () => explore.play(m.id, { from: { label: META[w].name, go: () => goWorld(w), trail: [growthCrumb, { label: META[w].name, go: () => goWorld(w) }] } }),
        }, el("span", { class: "mstate", "aria-hidden": "true" }, done(m.id) ? "✦" : ""), el("span", { class: "rtext" }, el("span", { class: "rtitle" }, `${m.title}`), el("span", { class: "rsub" }, m.part)), el("span", { class: "mmeta" }, done(m.id) ? "Done" : `${m.minutes} min`))))))),
      el("p", { class: "quiet small" }, systems.length ? `Planned next here: ${play.planned.join(", ")}.` : `Planned here: ${play.planned.join(", ")}. Reflection is open now.`));
  }
  function memoryButton(s, onclick) {
    return el("button", { class: "memory", onclick }, el("span", { class: "when" }, `${META[s.world].name} · ${longDate(s.date)}`), el("span", { class: "text" }, s.excerpt));
  }
  function patternCard(t) {
    return el("article", { class: `card card-${t.world}` },
      el("p", { class: "kicker" }, `${META[t.world].name} · ${t.forming ? "Still forming" : CONFIDENCE[t.confidence] ?? "Probably true"}`),
      el("p", { class: "statement" }, t.corrected ?? t.statement),
      el("p", { class: "why" }, t.why),
      el("button", { class: "text-btn", onclick: () => openPattern(t.id) }, "See the evenings behind it"));
  }
  function goalBlock(goal) {
    return el("section", { class: "group goal" },
      el("h3", {}, "Destination"),
      el("p", { class: "statement" }, goal.title),
      el("ol", { class: "milestones" }, goal.milestones.map((m) => el("li", {}, el("span", { class: "mt" }, m.title), el("span", { class: "quiet" }, `Planned for day ${m.day}. Marked only when an evening says it happened.`)))));
  }
  // A sheet replaces the world's content; the world's name stays at the top.
  function sheet(title, kicker, ...kids) {
    wbody.replaceChildren(
      el("button", { class: "text-btn back", onclick: () => { stopSpeech(); quiet(false); worldIntro(state.world); $("w-q").focus(); } }, el("span", { html: svg(ICON.back, 16) }), ` ${META[state.world].name}`),
      ...(kicker ? [el("p", { class: "kicker" }, kicker)] : []),
      el("h2", { class: "s-title", tabindex: "-1" }, title),
      ...kids.filter(Boolean));
    document.body.classList.add("sheet-open");
    world.scrollTop = 0;
    wbody.querySelector(".s-title").focus({ preventScroll: true });
  }
  function quiet(on) { document.body.classList.toggle("quiet", on); sound.duck(on); markTabs(); }

  // ----- reflecting: one question, a spacious editor, voice with clear states -----
  let recog = null, autosave = null, saving = false, clientKey = null;
  function openEditor(w, { speak = false } = {}) {
    if (state.place !== "world" || state.world !== w) { goWorld(w, { then: () => openEditor(w, { speak }) }); return; }
    const draft = device.read(DRAFT, null);
    state.draftWorld = draft?.world && ORDER.includes(draft.world) && draft.text ? draft.world : w;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const ta = el("textarea", { id: "words", rows: "7", maxlength: "20000", "aria-labelledby": "ed-q", "aria-describedby": "ed-status" });
    if (draft?.text) ta.value = draft.text;
    const status = el("p", { id: "ed-status", class: "quiet", "aria-live": "polite" }, draft?.text ? "Your unsent words are back, just as you left them." : data.local ? "Only you can see this. It stays on this device." : "Only you can see this.");
    const err = el("p", { class: "error", role: "alert" });
    const where = el("p", { class: "quiet where" });
    const chips = el("div", { class: "seg", role: "radiogroup", "aria-label": "Which world it belongs to", hidden: true });
    const drawWhere = () => { where.replaceChildren(`Kept in ${META[state.draftWorld].name}. `, el("button", { class: "text-btn", "aria-expanded": String(!chips.hidden), onclick: () => { chips.hidden = !chips.hidden; drawWhere(); } }, chips.hidden ? "Change" : "Done")); };
    for (const k of ORDER) chips.append(el("button", { role: "radio", "aria-checked": String(k === state.draftWorld), onclick: () => {
      state.draftWorld = k; chips.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b.textContent === META[k].name))); drawWhere(); saveDraft(ta.value);
    } }, META[k].name));
    drawWhere();
    const vstate = el("span", { class: "vstate" }, "Speak");
    const micBtn = SR ? el("button", { class: "mic", "aria-pressed": "false", onclick: () => toggleSpeech(micBtn, vstate, ta, status) }, el("span", { class: "mic-orb", html: svg(ICON.mic, 22) }), vstate) : null;
    ta.addEventListener("input", () => { clearTimeout(autosave); autosave = setTimeout(() => saveDraft(ta.value, status), 400); });
    sheet(META[state.draftWorld].q, `${META[w].name} · a private reflection`,
      ta, status, where, chips, err,
      el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => save(ta, err, status) }, "Keep it"), micBtn),
      SR ? null : el("p", { class: "quiet" }, "Speaking isn't available in this browser. Typing works everywhere."));
    wbody.querySelector(".s-title").id = "ed-q";
    quiet(true);
    ta.focus({ preventScroll: true });
    if (speak && micBtn) toggleSpeech(micBtn, vstate, ta, status);
  }
  function saveDraft(text, status) {
    if (!text.trim()) { device.remove(DRAFT); return; }
    const ok = device.write(DRAFT, { world: state.draftWorld, text });
    if (status) status.textContent = ok ? "Draft kept on this device." : "This browser won't keep a draft, so keep this page open until you save.";
  }
  function stopSpeech() { try { recog?.stop(); } catch {} recog = null; }
  // Speaking. The page first asks for the microphone, so a blocked one is said
  // plainly instead of listening to silence; words appear as they are heard;
  // nothing heard after a few seconds is said too. One phrase per press
  // (Android's continuous mode repeats words); press again to add more.
  async function toggleSpeech(btn, label, ta, status) {
    if (recog) { status.textContent = "Writing it down…"; stopSpeech(); return; }
    btn.disabled = true;
    status.textContent = "Asking for the microphone…";
    if (navigator.mediaDevices?.getUserMedia) {
      try { const m = await navigator.mediaDevices.getUserMedia({ audio: true }); m.getTracks().forEach((t) => t.stop()); }
      catch { btn.disabled = false; micBlocked(btn, status); return; }
    }
    btn.disabled = false;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = (recog = new SR());
    r.lang = navigator.language || "en-GB"; r.continuous = false; r.interimResults = true;
    const base = ta.value.trim() ? `${ta.value.trimEnd()} ` : "";
    let finalText = "", heard = false, failed = false;
    const silence = setTimeout(() => { if (!heard && recog === r) status.textContent = "I'm not hearing anything yet. If nothing appears, speaking may not work in this browser, so typing is the surest way."; }, 6000);
    r.onresult = (e) => {
      heard = true;
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) finalText += t; else interim += t; }
      ta.value = (base + finalText + interim).replace(/\s+/g, " ").trimStart();
      status.textContent = "Listening…";
    };
    r.onerror = (e) => {
      failed = true; clearTimeout(silence);
      if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "audio-capture") micBlocked(btn, status);
      else if (e.error === "no-speech") status.textContent = "I didn't catch anything. Press Speak and try again, or type instead.";
      else if (e.error !== "aborted") status.textContent = "Speaking stopped working here. Your words so far are kept; you can type instead.";
    };
    r.onend = () => {
      clearTimeout(silence);
      if (recog === r) recog = null;
      btn.setAttribute("aria-pressed", "false"); label.textContent = "Speak";
      if (heard) { saveDraft(ta.value); status.textContent = "Your words are in the box. Change anything before you keep it, or press Speak to add more."; }
      else if (!failed) status.textContent = "I didn't catch anything. Press Speak and try again, or type instead.";
    };
    try { r.start(); } catch { recog = null; status.textContent = "I couldn't start listening. You can type instead."; return; }
    btn.setAttribute("aria-pressed", "true"); label.textContent = "Stop";
    status.textContent = "Listening. Speak naturally.";
  }
  function micBlocked(btn, status) {
    stopSpeech();
    btn.disabled = true; btn.setAttribute("aria-pressed", "false");
    btn.querySelector(".vstate").textContent = "Speak";
    status.textContent = "The microphone isn't available on this page, so speaking can't work here. Type instead. In the Dawnward app, speaking uses its own recorder.";
  }

  async function save(ta, err, status) {
    const words = ta.value.trim();
    if (!words) { err.textContent = "Write or say something first."; ta.focus(); return; }
    if (saving) return;
    stopSpeech();
    saving = true; err.textContent = "";
    status.textContent = "Keeping it…";
    const w = state.draftWorld;
    try {
      if (data.local && DISTRESS.test(words)) { showCrisis(CRISIS_TEXT.join("\n")); return; }
      let id = null, reply = null;
      if (data.local) {
        id = `m-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
        data.stars.push({ id, world: w, date: today(), excerpt: words, themeIds: [] });
        finish(data);
        if (!keepLocal(data)) {
          data.stars = data.stars.filter((s) => s.id !== id); finish(data);
          err.textContent = "I couldn't keep that on this device. Your words are still here.";
          status.textContent = "Not kept yet.";
          return;
        }
      } else {
        clientKey ??= (crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/[^a-z0-9]/gi, "").slice(0, 32);
        const before = new Set(data.stars.map((s) => s.id));
        const res = await call("/debrief", { method: "POST", body: JSON.stringify({ date: today(), transcript: words, world: w, clientKey }) });
        clientKey = null;
        if (res.crisis) { showCrisis(res.reply); return; }
        reply = res.reply;
        try { Object.assign(data, await loadConnected()); } catch {}
        id = data.stars.find((s) => !before.has(s.id))?.id ?? null;
      }
      device.remove(DRAFT);
      if (data.local && explore) { const r = explore.store.noteReflection(id); if (r?.discoveries?.length) await explore.refresh(); }
      sound.chime(988);
      sync(id);
      renderHome();
      announce(`Kept. A new star in ${META[w].name}.`);
      if (state.world !== w) goWorld(w, { then: () => showNewStar(id, reply) }); else showNewStar(id, reply);
    } catch (e) {
      err.textContent = e.status === 403 ? "Dawnward needs your consent before it keeps anything. Open the app to give it." : "I couldn't keep that just now. Your words are still here; try again.";
      status.textContent = "Not kept yet.";
    } finally { saving = false; }
  }
  function showCrisis(text) {
    quiet(false);
    sheet("You matter more than any plan", null, ...text.split("\n").map((l) => el("p", { class: "crisis" }, l)),
      el("p", { class: "quiet" }, "Nothing was kept."),
      el("div", { class: "actions" }, el("button", { class: "ghost", onclick: () => goHome() }, "Return to your galaxy")));
  }
  function showNewStar(id, reply) {
    quiet(false);
    const s = id && starById(id);
    if (!s) { sheet("Kept", null, el("p", {}, reply ?? "Kept, word for word."), el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => openMemories() }, "See your memories"))); return; }
    state.selStar = id; highlight();
    const sug = suggestions().find((x) => x.a === id || x.b === id);
    sheet(`A new star in ${META[s.world].name}`, longDate(s.date),
      el("blockquote", { class: "said" }, el("p", {}, s.excerpt)),
      el("p", { class: "quiet" }, reply ?? `Kept ${keptWhere}, word for word.`),
      sug ? connectionCard(sug, () => showNewStar(id, reply)) : el("p", { class: "quiet" }, "One evening is a note, not a pattern. Nothing is concluded from it."),
      el("div", { class: "actions" },
        el("button", { class: "primary", onclick: () => openMemories({ select: id }) }, "See it in your memories"),
        el("button", { class: "ghost", onclick: () => { worldIntro(state.world); $("w-q").focus(); } }, `Back to ${META[state.world].name}`)));
  }

  // ----- possible connections: a shared word between two of your own evenings -----
  function suggestions() {
    const out = [];
    const linked = (a, b) => liveThemes().some((t) => t.starIds.includes(a) && t.starIds.includes(b));
    const ws = data.stars.map((s) => [s, wordsOf(s.excerpt)]);
    for (let i = ws.length - 1; i >= 0; i--) for (let j = i - 1; j >= 0; j--) {
      const [a, A] = ws[i], [b, B] = ws[j];
      if (linked(a.id, b.id)) continue;
      const word = [...A].find((x) => B.has(x));
      const key = `${a.id}|${b.id}`;
      if (word && !state.dismissed.has(key)) out.push({ a: a.id, b: b.id, word, key });
      if (out.length >= 3) return out;
    }
    return out;
  }
  function connectionCard(sug, after) {
    const a = starById(sug.a), b = starById(sug.b);
    return el("section", { class: "suggest", "aria-label": "Possible connection" },
      el("p", { class: "kicker" }, el("span", { html: svg(ICON.link, 14) }), " Possible connection"),
      el("p", {}, `Your evenings on ${longDate(b.date)} and ${longDate(a.date)} both mention “${sug.word}”.`),
      el("p", { class: "quiet" }, "A word in common, nothing more. Link them only if they belong together."),
      el("div", { class: "actions" },
        el("button", { class: "ghost", onclick: () => { linkPair(sug); announce("Linked. A new line joins them."); after(); } }, "Link them"),
        el("button", { class: "text-btn", onclick: () => { state.dismissed.add(sug.key); renderHome(); after(); } }, "Not now")));
  }
  function linkPair(sug) {
    const a = starById(sug.a);
    const existing = liveThemes().find((t) => t.words?.includes(sug.word) && (t.starIds.includes(sug.a) || t.starIds.includes(sug.b)));
    if (existing) { for (const id of [sug.a, sug.b]) if (!existing.starIds.includes(id)) existing.starIds.push(id); }
    else data.themes.push({ id: `p-${Date.now().toString(36)}`, world: a.world, statement: `Evenings that mention “${sug.word}”`, starIds: [sug.b, sug.a], confidence: "hypothesis", words: [sug.word] });
    finish(data);
    persist();
    sound.chime(1175); sync(); renderHome();
  }

  // ----- one pattern and its evidence; correct or set aside -----
  const persist = () => { if (data.local) keepLocal(data); };
  function openPattern(id) {
    const t = themeById(id);
    if (!t) return;
    if (state.place !== "world" || state.world !== t.world) { goWorld(t.world, { then: () => openPattern(id) }); return; }
    const box = el("div", { class: "review" });
    const draw = () => box.replaceChildren(
      el("p", { class: "kicker" }, "What you said"),
      el("ul", { class: "quotes" }, t.starIds.map((sid) => { const s = starById(sid); return el("li", { class: "quote" }, el("span", { class: "when" }, `${META[s.world].name} · ${longDate(s.date)}`), el("q", {}, s.excerpt)); })),
      el("p", { class: "kicker" }, `What it might mean · ${t.forming ? "Still forming" : CONFIDENCE[t.confidence] ?? ""}`),
      el("p", { class: "statement" }, t.corrected ?? t.statement),
      el("p", { class: "why" }, t.why),
      t.forming ? el("p", { class: "quiet" }, "I don't have enough evidence to conclude more than this.") : null,
      t.accepted ? el("p", { class: "note" }, "You said this is right.") : null,
      el("div", { class: "actions" },
        el("button", { class: "ghost", onclick: () => { t.accepted = true; persist(); announce("Kept as it is."); draw(); box.querySelector("button")?.focus(); } }, "That's right"),
        el("button", { class: "ghost", onclick: () => correct(t, box, draw) }, "Correct it"),
        el("button", { class: "danger", onclick: () => reject(t, box, draw) }, "That's not right")));
    draw();
    sheet(t.corrected ?? t.statement, `${META[t.world].name} · what I understand`, box);
    if (ctx) ctx.setSelection({ litIds: new Set(t.starIds), selId: null, litThemes: new Set([t.id]) });
  }
  function correct(t, box, draw) {
    const input = el("textarea", { rows: "3", id: `fix-${t.id}` });
    input.value = t.corrected ?? t.statement;
    const err = el("p", { class: "error", role: "alert" });
    box.replaceChildren(el("label", { for: `fix-${t.id}`, class: "label" }, "Say it the way it's true for you"), input, err,
      el("div", { class: "actions" },
        el("button", { class: "primary", onclick: async () => {
          const v = input.value.trim();
          if (!v) { err.textContent = "Write the version that's true, or cancel."; return; }
          try {
            if (!data.local) await call(`/assertions/${t.id}/dispute`, { method: "POST", body: JSON.stringify({ correction: v }) });
            t.corrected = v; t.accepted = false; persist(); announce("Corrected. Your words are used from now on."); draw(); box.querySelector("button")?.focus();
          } catch { err.textContent = "I couldn't save the correction. Nothing changed."; }
        } }, "Save my version"),
        el("button", { class: "ghost", onclick: () => { draw(); box.querySelector("button")?.focus(); } }, "Cancel")));
    input.focus();
  }
  function reject(t, box, draw) {
    const err = el("p", { class: "error", role: "alert" });
    const ask = el("p", { tabindex: "-1" }, "Set this aside? It stops being used, and the lines it drew disappear. Your evenings stay exactly as they are.");
    box.replaceChildren(ask, err, el("div", { class: "actions" },
      el("button", { class: "danger", onclick: async () => {
        try {
          if (!data.local) await call(`/assertions/${t.id}/dispute`, { method: "POST", body: "{}" });
          t.rejected = true; finish(data); persist(); sync(); renderHome(); announce("Set aside.");
          worldIntro(state.world); $("w-q").focus();
        } catch { err.textContent = "I couldn't set it aside. Nothing changed."; }
      } }, "Set it aside"),
      el("button", { class: "ghost", onclick: () => { draw(); box.querySelector("button")?.focus(); } }, "Keep it as it is")));
    ask.focus();
  }

  // ----- Memories: your evenings as stars you can open, filter, search or list -----
  function openMemories({ filter, select, search } = {}) {
    stopSpeech(); quiet(false);
    if (filter) state.filter = filter;
    if (search) state.view = "list";
    showPlace("memories");
    drawMemories();
    if (select) openMemory(select);
    else if (search) $("m-q").focus();
    else $("m-title").focus();
  }
  function visibleStars() {
    const q = state.query.trim().toLowerCase();
    return data.stars.filter((s) => (state.filter === "all" || s.world === state.filter) && (!q || s.excerpt.toLowerCase().includes(q)));
  }
  function drawMemories() {
    const vis = visibleStars();
    $("m-count").textContent = data.stars.length
      ? (vis.length === data.stars.length ? plural(data.stars.length, "memory", "memories") : `${vis.length} of ${plural(data.stars.length, "memory", "memories")}`)
      : "No memories yet";
    document.querySelectorAll("#m-filters button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.f === state.filter)));
    document.querySelectorAll("#m-views button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.v === state.view)));
    $("m-tools").hidden = false;
    $("m-q").hidden = $("m-filters").hidden = !data.stars.length;
    const miles = $("m-miles");
    miles.hidden = state.view !== "miles";
    if (state.view === "miles") { $("m-zoom").hidden = true; $("m-field").hidden = $("m-list").hidden = true; drawMiles(miles); return; }
    $("m-zoom").hidden = state.view !== "galaxy";
    $("m-zoom-in").disabled = state.zoom >= 2; $("m-zoom-out").disabled = state.zoom <= 1;
    const field = $("m-field"), list = $("m-list");
    field.hidden = state.view !== "galaxy"; list.hidden = state.view !== "list";
    if (!data.stars.length) {
      field.hidden = true; list.hidden = false;
      list.replaceChildren(el("li", { class: "empty" }, el("p", { class: "statement" }, "Your first reflection becomes your first star."), el("button", { class: "primary", onclick: () => openEditor(state.lastWorld) }, "Begin reflection")));
      return;
    }
    if (!vis.length) {
      list.hidden = false; field.hidden = true;
      list.replaceChildren(el("li", { class: "empty" }, el("p", {}, state.query ? "Nothing matches that." : `No memories in ${META[state.filter]?.name ?? "this world"} yet.`)));
      return;
    }
    if (state.view === "list") list.replaceChildren(...[...vis].reverse().map((s) => el("li", {}, memoryButton(s, () => openMemory(s.id)))));
    else drawField(vis);
  }
  // Stars are buttons, never painted: each sits in its world's direction, the
  // oldest near the centre, with at least 48 px between targets.
  function drawField(vis) {
    const field = $("m-field");
    const W = field.clientWidth || 360, H = Math.max(field.clientHeight || 420, 300);
    const z = state.zoom;
    const cx = (W * z) / 2, cy = (H * z) / 2, R = (Math.min(W, H) * z) / 2 - 36;
    const dir = { mind: -Math.PI / 2, soul: 0, future: Math.PI / 2, body: Math.PI };
    const all = data.stars;
    const pos = vis.map((s) => {
      const rank = all.indexOf(s) / Math.max(1, all.length - 1);
      const a = dir[s.world] + (hash(s.id, 5) - 0.5) * 1.3;
      const r = R * (0.22 + 0.7 * rank) * (0.9 + 0.2 * hash(s.id, 9));
      return { s, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    });
    for (let k = 0; k < 40; k++) for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
      const A = pos[i], B = pos[j], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 0.01;
      if (d < 50) { const push = (50 - d) / 2, ux = dx / d, uy = dy / d; A.x -= ux * push; A.y -= uy * push; B.x += ux * push; B.y += uy * push; }
    }
    for (const p of pos) { p.x = Math.min(W * z - 26, Math.max(26, p.x)); p.y = Math.min(H * z - 26, Math.max(26, p.y)); }
    const at = new Map(pos.map((p) => [p.s.id, p]));
    const lines = document.createElementNS(NS, "svg");
    lines.setAttribute("class", "m-lines"); lines.setAttribute("width", W * z); lines.setAttribute("height", H * z); lines.setAttribute("aria-hidden", "true");
    for (const l of data.links) {
      const A = at.get(l.from), B = at.get(l.to);
      if (!A || !B) continue;
      const line = document.createElementNS(NS, "line");
      for (const [k, v] of Object.entries({ x1: A.x, y1: A.y, x2: B.x, y2: B.y })) line.setAttribute(k, v);
      lines.append(line);
    }
    const inner = el("div", { class: "m-inner", style: `width:${W * z}px;height:${H * z}px` }, lines,
      ...pos.map((p) => el("button", {
        class: `mstar mstar-${p.s.world}${p.s.id === state.selStar ? " sel" : ""}`, style: `left:${p.x}px;top:${p.y}px`, "data-id": p.s.id,
        "aria-label": `${META[p.s.world].name}, ${longDate(p.s.date)}: ${p.s.excerpt.slice(0, 80)}`, onclick: () => openMemory(p.s.id),
      }, el("span", { class: "dot" }), z > 1 ? el("span", { class: "mlabel" }, shortDate(p.s.date)) : null)));
    field.replaceChildren(inner);
    const sel = state.selStar && at.get(state.selStar);
    field.scrollTo(sel ? { left: sel.x - W / 2, top: sel.y - H / 2 } : { left: (W * z - W) / 2, top: (H * z - H) / 2 });
  }
  function openMemory(id) {
    const s = starById(id);
    if (!s) return;
    if (state.place !== "memories") { showPlace("memories"); }
    state.selStar = id; highlight();
    drawMemories();
    const themes = s.themeIds.map(themeById).filter((t) => t && !t.rejected);
    const panel = $("m-detail");
    panel.replaceChildren(
      el("div", { class: "m-detail-head" }, el("p", { class: "kicker" }, `${META[s.world].name} · ${longDate(s.date)}`),
        el("button", { class: "icon-btn", "aria-label": "Close this memory", html: svg('<path d="M6 6l12 12M18 6 6 18"/>', 18), onclick: closeMemory })),
      el("h2", { class: "sr", id: "md-h", tabindex: "-1" }, `Memory from ${longDate(s.date)}`),
      el("blockquote", { class: "said" }, el("p", {}, s.excerpt)),
      themes.length ? el("div", { class: "cards" }, themes.map(patternCard)) : el("p", { class: "quiet" }, "Not linked to anything yet."),
      el("div", { class: "actions" },
        el("button", { class: "ghost", onclick: () => goWorld(s.world) }, `Open ${META[s.world].name}`),
        data.local ? el("button", { class: "danger", onclick: () => deleteMemory(s.id) }, "Delete") : null));
    panel.hidden = false;
    $("md-h").focus();
  }
  function closeMemory() {
    const id = state.selStar;
    $("m-detail").hidden = true;
    state.selStar = null; highlight(); drawMemories();
    (document.querySelector(`.mstar[data-id="${id}"]`) ?? $("m-title")).focus();
  }
  function deleteMemory(id) {
    const panel = $("m-detail");
    const err = el("p", { class: "error", role: "alert" });
    const ask = el("p", { tabindex: "-1" }, "Delete this memory from this device? This can't be undone.");
    panel.append(el("div", { class: "confirm" }, ask, err, el("div", { class: "actions" },
      el("button", { class: "danger", onclick: () => {
        const keep = data.stars;
        data.stars = data.stars.filter((s) => s.id !== id); finish(data);
        if (!keepLocal(data)) { data.stars = keep; finish(data); err.textContent = "I couldn't delete it. Nothing changed."; return; }
        $("m-detail").hidden = true; state.selStar = null; sync(); renderHome(); drawMemories(); announce("Deleted."); $("m-title").focus();
      } }, "Delete it"),
      el("button", { class: "ghost", onclick: () => openMemory(id) }, "Keep it"))));
    ask.focus();
  }
  $("m-filters").append(...[["all", "All"], ...ORDER.map((w) => [w, META[w].name])].map(([f, label]) =>
    el("button", { role: "radio", "data-f": f, "aria-checked": "false", onclick: () => { state.filter = f; drawMemories(); } }, label)));
  document.querySelectorAll("#m-views button").forEach((b) => b.addEventListener("click", () => { state.view = b.dataset.v; drawMemories(); }));
  $("m-q").addEventListener("input", (e) => { state.query = e.target.value; drawMemories(); });
  $("m-zoom-in").addEventListener("click", () => { state.zoom = Math.min(2, state.zoom + 0.5); drawMemories(); });
  $("m-zoom-out").addEventListener("click", () => { state.zoom = Math.max(1, state.zoom - 0.5); drawMemories(); });

  // ----- You: what Dawnward understands, connections, your data, display -----
  function openYou() {
    stopSpeech(); quiet(false);
    showPlace("you");
    drawYou();
    $("y-title").focus();
  }
  function drawYou() {
    const themes = liveThemes(), sugs = suggestions();
    $("y-understand").replaceChildren(themes.length ? el("div", { class: "cards" }, themes.map(patternCard)) : el("p", { class: "quiet" }, "I don't have enough evidence to conclude anything yet. Patterns appear when evenings share something and you confirm it."));
    $("y-connections").replaceChildren(...(sugs.length ? sugs.map((s) => connectionCard(s, drawYou)) : [el("p", { class: "quiet" }, "None right now.")]));
    $("y-data-line").textContent = data.local
      ? `${plural(data.stars.length, "memory", "memories")} kept on this device, and nowhere else.`
      : `${plural(data.stars.length, "memory", "memories")} in your Dawnward.`;
    $("y-export").hidden = !data.local || !data.stars.length; $("y-delete").hidden = !data.local || !data.stars.length;
    const found = explore?.data.discoveries ?? [];
    $("y-journey").replaceChildren(found.length
      ? el("ol", { class: "journey" }, [...found].reverse().map((d) => el("li", {}, el("span", { class: "when" }, d.discoveredAt ? longDate(d.discoveredAt.slice(0, 10)) : ""), el("span", { class: "mt" }, d.title), el("span", { class: "quiet" }, `Why this appeared: ${d.why}`))))
      : el("p", { class: "quiet" }, "Nothing yet. Your first reflection brings first light; finishing a practice in Explore adds a star."));
    $("y-game").setAttribute("aria-pressed", String(explore?.data.gameLayer !== false));
    $("y-game").textContent = explore?.data.gameLayer !== false ? "Discoveries shown" : "Discoveries hidden";
  }
  $("y-game").addEventListener("click", async () => {
    const on = explore.data.gameLayer === false;
    const r = await explore.store.setGameLayer(on);
    if (r?.error) { announce(r.error); return; }
    await explore.refresh(); sync(); drawYou();
    announce(on ? "Discoveries are shown in your galaxy." : "Discoveries are hidden. Nothing was deleted.");
  });
  let downloads = null;
  window.claude?.use?.("downloads").then((d) => (downloads = d), () => {});
  $("y-export").addEventListener("click", async () => {
    const json = JSON.stringify({ exported: new Date().toISOString(), memories: data.stars.map(({ id, world, date, excerpt }) => ({ id, world, date, words: excerpt })), patterns: data.themes.map(({ id, world, statement, starIds, corrected, rejected }) => ({ id, world, statement, memories: starIds, corrected, rejected })), expeditions: explore?.store.snapshot?.() ?? null }, null, 2);
    const filename = `dawnward-${today()}.json`;
    if (downloads) {
      try { await downloads.save({ filename, data: json }); announce("Saved."); }
      catch (e) { if (e?.code !== "declined") announce("I couldn't save a copy here."); }
      return;
    }
    const a = el("a", { href: URL.createObjectURL(new Blob([json], { type: "application/json" })), download: filename });
    document.body.append(a); a.click(); a.remove();
    announce("Your memories were saved as a file.");
  });
  $("y-delete").addEventListener("click", () => {
    const box = $("y-delete-confirm");
    box.hidden = false;
    box.replaceChildren(el("p", { tabindex: "-1", id: "y-del-ask" }, `Delete all ${plural(data.stars.length, "memory", "memories")} from this device? This can't be undone.`),
      el("div", { class: "actions" },
        el("button", { class: "danger", onclick: () => {
          const okA = device.remove(STORE), okB = device.remove(DRAFT), okC = explore ? explore.store.wipe() : true;
          if (!okA || !okB || !okC) { box.append(el("p", { class: "error", role: "alert" }, "I couldn't delete everything. Try again.")); return; }
          data.stars = []; data.themes = []; finish(data); explore?.refresh().then(() => { sync(); drawYou(); }); sync(); renderHome(); drawYou(); box.hidden = true; announce("Everything on this device was deleted."); $("y-title").focus();
        } }, "Delete everything"),
        el("button", { class: "ghost", onclick: () => { box.hidden = true; $("y-delete").focus(); } }, "Cancel")));
    $("y-del-ask").focus();
  });

  // ----- places and navigation -----
  function markTabs() {
    const p = state.place, inQuiet = document.body.classList.contains("quiet");
    const cur = { earth: "home", atlas: "universe", home: "universe", world: inQuiet ? "reflect" : "universe", explore: "learn", memories: "journey" }[p] ?? p;
    document.querySelectorAll("#tabs [data-tab]").forEach((b) => { if (b.dataset.tab === cur) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
  }
  function showPlace(p) {
    state.place = p;
    document.body.dataset.place = p;
    for (const id of ["memories", "you", "explore", "atlas", "earth"]) $(id).hidden = p !== id;
    if (p !== "atlas") resetAtlas();
    if (p !== "memories") $("m-detail").hidden = true;
    world.hidden = p !== "world";
    $("home-ui").hidden = p !== "home";
    if (p === "home" && !fit.frame) layout();
    if (p !== "world") { document.body.classList.remove("closeup-on", "in-world", "sheet-open"); if (ctx && state.mode === "galaxy" && ctx.focus) ctx.focusWorld(null); }
    markTabs();
  }
  function goWorld(w, { then } = {}) {
    stopSpeech(); quiet(false);
    const arriving = state.place !== "world" || state.world !== w;
    state.world = w; state.lastWorld = w; state.selStar = null;
    showPlace("world");
    $("w-name").textContent = META[w].name;
    $("w-crumbs").replaceChildren(crumbs([growthCrumb, { label: META[w].name }]));
    document.body.dataset.world = w;
    document.body.classList.add("in-world");
    $("closeup-img").src = asset(`img/worlds/closeup-${w}.webp`);
    worldIntro(w);
    if (then) then(); else $("w-q").focus({ preventScroll: true });
    highlight();
    if (arriving) {
      document.body.classList.remove("closeup-on");
      const reveal = () => { if (state.place === "world" && state.world === w) document.body.classList.add("closeup-on"); };
      if (ctx && state.mode === "galaxy") ctx.focusWorld(w, reveal); else reveal();
      announce(`${META[w].name}. ${plural(worldStars(w).length, "memory", "memories")}.`);
    }
  }
  function goHome({ show = null } = {}) {
    stopSpeech(); quiet(false);
    const from = state.place === "world" ? state.world : null;
    state.selStar = show;
    showPlace("home");
    renderHome(); highlight();
    announce(show ? "Back on Earth. Your new discovery is the brightest gold star." : "Your galaxy.");
    (from ? labels.get(from) : $("begin"))?.focus({ preventScroll: true });
  }
  $("w-back").addEventListener("click", () => goHome());
  $("begin").addEventListener("click", () => openEditor(state.lastWorld));
  $("notice").addEventListener("click", () => openYou());
  $("to-you").addEventListener("click", () => openYou());

  // ----- the Universe Atlas: galaxies you can pan, select, zoom toward and enter -----
  const field = $("a-field"), inner = $("a-inner");
  for (const g of GALAXIES) {
    const art = g.kind === "earth" ? el("span", { class: "gx-earth" }) : g.kind === "gateway" ? el("span", { class: "gx-gate" })
      : el("img", { class: "gx-img", alt: "", src: asset("img/worlds/galaxy-core-1024.webp"), style: g.hue ? `filter:hue-rotate(${g.hue}deg) saturate(1.15)` : "" });
    inner.append(el("button", { class: `gx g-${g.id}${g.open ? "" : " closed"}`, "data-id": g.id, style: `--lx:${g.x}%;--ly:${g.y}%;--gx:${g.size};--px:${g.p[0]}%;--py:${g.p[1]}%;--pw:${g.p[2]}`, "aria-label": `${g.name}. ${g.tag} ${g.open ? "Open." : "Not open yet."}`, "aria-pressed": "false", onclick: () => selectGalaxy(g) },
      art, el("span", { class: "gx-name" }, g.name), g.open ? null : el("span", { class: "gx-soon" }, g.kind === "gateway" ? "Opens next" : "Not open yet")));
  }
  $("a-list").append(...GALAXIES.map((g) => el("li", {}, el("button", { class: "row", onclick: () => selectGalaxy(g) },
    el("span", { class: "rtext" }, el("span", { class: "rtitle" }, g.name), el("span", { class: "rsub" }, g.tag)),
    el("span", { class: "mmeta" }, g.open ? "Open" : g.kind === "gateway" ? "Opens next" : "Not open yet")))));
  document.querySelectorAll("#a-views button").forEach((b) => b.addEventListener("click", () => {
    const list = b.dataset.v === "list";
    $("a-list").hidden = !list; field.hidden = list;
    document.querySelectorAll("#a-views button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    resetAtlas();
  }));
  function resetAtlas() {
    inner.style.transform = ""; $("a-panel").hidden = true;
    inner.querySelectorAll(".gx").forEach((b) => b.setAttribute("aria-pressed", "false"));
  }
  function openAtlas() {
    stopSpeech(); quiet(false);
    showPlace("atlas");
    $("a-crumbs").replaceChildren(crumbs([{ label: "Universe" }]));
    $("a-title").focus({ preventScroll: true });
    announce("The Universe.");
  }
  function selectGalaxy(g) {
    inner.querySelectorAll(".gx").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === g.id)));
    // move toward it: the selected galaxy slides to the centre and grows
    // measured from where it really sits, so portrait and landscape both work
    const b = inner.querySelector(`[data-id="${g.id}"]`);
    if (!field.hidden && b) inner.style.transform = `translate(${Math.round(inner.clientWidth / 2 - b.offsetLeft)}px, ${Math.round(inner.clientHeight * 0.42 - b.offsetTop)}px) scale(1.3)`;
    const panel = $("a-panel");
    panel.replaceChildren(
      el("p", { class: "kicker" }, g.open ? "Open" : g.kind === "gateway" ? "Opens next" : "Not open yet"),
      el("h2", { class: "s-title", id: "a-name", tabindex: "-1" }, g.name),
      el("p", { class: "lead" }, g.tag),
      g.planned ? el("p", { class: "quiet" }, g.open ? g.planned : `Planned: ${g.planned}`) : null,
      el("div", { class: "actions" },
        g.id === "growth" ? el("button", { class: "primary", onclick: () => goHome() }, "Enter Personal Growth") : null,
        g.id === "earth" ? el("button", { class: "primary", onclick: () => openEarth() }, "Return to Earth") : null,
        el("button", { class: "ghost", onclick: () => { resetAtlas(); inner.querySelector(`[data-id="${g.id}"]`)?.focus(); } }, "Back to the Universe")));
    panel.hidden = false;
    $("a-name").focus({ preventScroll: true });
  }
  // drag to pan with a mouse; touch scrolls natively
  { let drag = null;
    field.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse" && !e.target.closest("button")) drag = { x: e.clientX, y: e.clientY, l: field.scrollLeft, t: field.scrollTop }; });
    addEventListener("pointermove", (e) => { if (drag) { field.scrollLeft = drag.l - (e.clientX - drag.x); field.scrollTop = drag.t - (e.clientY - drag.y); } });
    addEventListener("pointerup", () => { drag = null; }); }

  // ----- Earth Realm: everyday life. Nothing urgent, nothing punished -----
  function openEarth(found = null, { quietFocus = false } = {}) {
    stopSpeech(); quiet(false);
    showPlace("earth");
    drawEarth(found);
    if (!quietFocus) $("e-title").focus({ preventScroll: true });
    $("earth").scrollTop = 0;
    announce(found ? `Home. ${found.title} appeared.` : "Home.");
  }
  // ----- the Daily Compass: one clear, optional next step, and the reason for it -----
  const COMPASS_HIDE = "dw-compass-hide";
  const localDay = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const missionDone = (id) => (explore?.data.attempts ?? []).some((a) => a.missionId === id && a.status === "completed");
  function compassPick() {
    const attempts = explore?.data.attempts ?? [];
    const open = attempts.find((a) => (a.status === "in_progress" || a.status === "paused") && missionById(a.missionId));
    if (open) {
      const m = missionById(open.missionId);
      return { m, step: open.step, resume: true, why: `You started it and stopped at step ${open.step + 1} of ${m.steps.length}. It picks up exactly where you left off.` };
    }
    for (const sys of SYSTEMS) {
      const next = sys.missionIds.find((id) => !missionDone(id));
      if (next && sys.missionIds.some(missionDone)) return { m: missionById(next), step: 0, why: `It's the next part of ${sys.title} in ${META[sys.world].name}, which you've already begun.` };
    }
    const inWorld = data.stars.length ? MISSIONS.find((m) => m.world === state.lastWorld && !missionDone(m.id)) : null;
    if (inWorld) return { m: inWorld, step: 0, why: `Your last reflection was in ${META[inWorld.world].name}, and this is its expedition.` };
    const first = MISSIONS.find((m) => !missionDone(m.id));
    if (first) return { m: first, step: 0, why: attempts.length ? "It's the next expedition you haven't tried yet." : "It's a short first expedition: about six minutes, nothing to prepare." };
    return null;
  }
  const fromHome = { label: "Home", go: () => openEarth(), trail: [{ label: "Home", go: () => openEarth(), root: true }] };
  function compassCard(pick) {
    const { m } = pick, total = m.steps.length;
    return el("article", { class: "compass", "aria-labelledby": "c-title" },
      el("div", { class: "c-top" }, el("p", { class: "kicker" }, "Your daily compass"),
        el("p", { class: "c-meta" }, pick.resume ? `Step ${pick.step + 1} of ${total}` : `${META[m.world].name} · ${m.minutes} min`)),
      el("h3", { id: "c-title", class: "c-title" }, m.title),
      el("p", { class: "c-part" }, `${META[m.world].name} · ${m.part}`),
      el("p", { class: "c-mission" }, `Today's mission: ${m.objective}`),
      el("div", { class: "c-bar", role: "progressbar", "aria-label": "Your progress through this expedition", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": String(pick.step), "aria-valuetext": pick.step ? `Step ${pick.step + 1} of ${total}` : "Not started" },
        el("span", { style: `width:${Math.round((100 * pick.step) / total)}%` })),
      el("button", { class: "primary wide", onclick: () => explore.play(m.id, { from: fromHome }) }, `${pick.resume ? "Continue" : "Begin"} expedition · ${m.minutes} min`),
      el("details", { class: "c-why" }, el("summary", {}, "Why this?"),
        el("p", {}, `${pick.why} Suggestions come only from what you've done in Dawnward${data.local ? ", on this device" : ""}. Nothing is read from your reflections.`)),
      el("div", { class: "c-more" },
        el("button", { class: "text-btn", onclick: () => explore.open() }, "Choose another"),
        el("button", { class: "text-btn", onclick: () => { try { localStorage.setItem(COMPASS_HIDE, localDay()); } catch {} drawEarth(); $("e-title").focus(); announce("No suggestion today."); } }, "Not today")));
  }
  function drawEarth(found) {
    const ex = explore?.data ?? { experiments: [], discoveries: [], attempts: [] };
    const active = ex.experiments.filter((x) => x.status === "planned");
    const pick = compassPick();
    let hidden = false;
    try { hidden = localStorage.getItem(COMPASS_HIDE) === localDay(); } catch {}
    $("e-title").textContent = data.stars.length || ex.attempts.length ? "Welcome back" : "Welcome";
    $("e-crumbs").replaceChildren();
    const compass = !pick
      ? el("article", { class: "compass" }, el("p", { class: "kicker" }, "Your daily compass"), el("h3", { class: "c-title" }, "Every open expedition is done"), el("p", { class: "c-mission" }, "More are being written. Reflecting is always here."))
      : hidden
        ? el("div", { class: "compass slim" }, el("p", { class: "quiet" }, "No suggestion today, as you asked."),
            el("button", { class: "text-btn", onclick: () => { try { localStorage.removeItem(COMPASS_HIDE); } catch {} drawEarth(); } }, "Show it"))
        : compassCard(pick);
    const other = MISSIONS.find((m) => m !== pick?.m && !missionDone(m.id));
    const next = [
      other
        ? { icon: ICON.explore, t: "Practise", s: `${other.title} · ${other.minutes} min`, go: () => explore.play(other.id, { from: fromHome }) }
        : { icon: ICON.explore, t: "Practise", s: "See every expedition", go: () => explore.open() },
      active[0]
        ? { icon: ICON.earth, t: "Your action", s: active[0].action, go: () => explore.review(active[0].id) }
        : { icon: ICON.earth, t: "Real actions", s: "None waiting", go: () => explore.open() },
      { icon: ICON.atlas, t: "Your journey", s: ex.discoveries.length || data.stars.length ? `${plural(ex.discoveries.length, "discovery", "discoveries")} · ${plural(data.stars.length, "memory", "memories")}` : "Begins with your first reflection", go: () => openMemories() },
    ];
    $("e-body").replaceChildren(
      found ? el("div", { class: "card found", role: "status" }, el("p", { class: "kicker" }, "Just discovered"), el("p", { class: "statement" }, found.title), el("p", { class: "why" }, found.why)) : "",
      compass,
      el("section", { "aria-labelledby": "e-worlds" },
        el("div", { class: "sec-head" }, el("h3", { id: "e-worlds" }, "Explore your worlds"), el("button", { class: "text-btn", onclick: () => goHome() }, "View galaxy")),
        el("div", { class: "wplanets" }, ORDER.map((w) => el("button", { class: `planet-${w}`, onclick: () => goWorld(w), "aria-label": `${META[w].name}: ${META[w].kicker.toLowerCase()}` },
          el("img", { src: asset(`img/worlds/planet-${w}-640.webp`), alt: "", loading: "lazy" }), el("span", {}, META[w].name))))),
      el("section", { "aria-labelledby": "e-next" },
        el("div", { class: "sec-head" }, el("h3", { id: "e-next" }, "Your next steps")),
        el("div", { class: "nextrow" }, next.map((n) => el("button", { onclick: n.go }, el("span", { class: "ni", html: svg(n.icon, 20) }), el("b", {}, n.t), el("span", { class: "ns" }, n.s))))),
      el("section", { class: "moment", "aria-labelledby": "e-moment" },
        el("p", { class: "kicker" }, "A moment for yourself"),
        el("h3", { id: "e-moment" }, "What's worth remembering today?"),
        el("p", { class: "quiet" }, "Your private reflection space is always one tap away."),
        el("button", { class: "ghost", onclick: () => openEditor(state.lastWorld) }, el("span", { html: svg(ICON.pen, 18) }), "Begin reflection")));
  }
  // ----- Journey: milestones, discoveries and the actions you chose -----
  function drawMiles(box) {
    const ex = explore?.data ?? { experiments: [], discoveries: [] };
    const disc = [...ex.discoveries].reverse();
    box.replaceChildren(
      el("section", { class: "group", "aria-labelledby": "mm-disc" }, el("h3", { id: "mm-disc" }, "Milestones and discoveries"),
        disc.length ? el("ol", { class: "journey" }, disc.map((d) => el("li", {}, el("span", { class: "when" }, d.discoveredAt ? longDate(d.discoveredAt.slice(0, 10)) : ""), el("span", { class: "mt" }, d.title), el("span", { class: "quiet" }, d.why))))
          : el("p", { class: "quiet" }, "Nothing yet. They appear when you reflect, practise, or come back to say how something went.")),
      el("section", { class: "group", "aria-labelledby": "mm-ex" }, el("h3", { id: "mm-ex" }, "Real actions you chose"),
        ex.experiments.length ? el("ul", { class: "memories" }, [...ex.experiments].reverse().map((x) => el("li", {}, el("button", { class: "memory", onclick: () => explore.review(x.id) },
          el("span", { class: "when" }, `${META[x.world]?.name ?? ""} · ${x.status === "reviewed" ? "looked back on" : x.when_text}`), el("span", { class: "text" }, x.action)))))
          : el("p", { class: "quiet" }, "None yet. Expeditions can end with one small real action, always optional.")));
  }
  $("brand").addEventListener("click", (e) => { e.preventDefault(); openEarth(); });
  document.querySelectorAll("#tabs [data-tab]").forEach((b) => b.addEventListener("click", () => {
    const t = b.dataset.tab;
    if (t === "home") openEarth();
    else if (t === "universe") openAtlas();
    else if (t === "reflect") openEditor(state.place === "world" ? state.world : state.lastWorld);
    else if (t === "journey") openMemories();
    else if (t === "learn") explore.open();
  }));
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || state.mode === "text") return;
    if (!$("m-detail").hidden) return closeMemory();
    if (state.place === "world") goHome();
    else if (state.place !== "earth") openEarth();
  });
  if (ctx) {
    let down = null;
    ctx.renderer.domElement.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
    ctx.renderer.domElement.addEventListener("click", (e) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6 || state.place !== "home") return;
      const k = ctx.pickWorld({ x: (e.clientX / innerWidth) * 2 - 1, y: -(e.clientY / innerHeight) * 2 + 1 });
      if (k) goWorld(k);
    });
  }

  // ----- display: text view, sound, entrance -----
  function setMode(m) {
    state.mode = m;
    document.body.dataset.mode = m;
    $("text").hidden = m !== "text";
    $("y-text").setAttribute("aria-pressed", String(m === "text"));
    if (m === "text") { renderText(); $("text-h").focus(); }
    else if (ctx) ctx.focusWorld(state.place === "world" ? state.world : null);
    try { localStorage.setItem("dw-home-mode", m); } catch {}
  }
  $("y-text").addEventListener("click", () => setMode(state.mode === "text" ? "galaxy" : "text"));
  $("text-close").addEventListener("click", () => { setMode("galaxy"); goHome(); });
  $("y-sound").addEventListener("click", () => {
    if (sound.on) sound.stop(); else sound.start();
    $("y-sound").setAttribute("aria-pressed", String(sound.on)); $("y-sound").textContent = sound.on ? "Sound on" : "Sound off";
  });
  $("y-replay").addEventListener("click", () => { try { localStorage.removeItem("dw-home-seen"); } catch {} location.reload(); });
  function renderText() {
    $("text-body").replaceChildren(
      el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => { setMode("galaxy"); openEditor(state.lastWorld); } }, "Begin reflection")),
      el("section", { "aria-labelledby": "tx-practise" }, el("h3", { id: "tx-practise" }, "Practise"),
        ...(explore ? explore.textSummary() : []).map(({ sys, missions }) => el("div", { class: "card" },
          el("p", { class: "kicker" }, `${META[sys.world].name} · ${sys.title}`), el("p", {}, sys.objective),
          el("ul", { class: "memories" }, missions.map(({ m, done }) => el("li", {}, el("button", { class: "memory", onclick: () => { setMode("galaxy"); explore.play(m.id); } },
            el("span", { class: "when" }, done ? "Done" : `${m.minutes} min`), el("span", { class: "text" }, `${m.part}: ${m.objective}`)))))))),
      ...ORDER.map((w) => el("section", { "aria-labelledby": `tx-${w}` },
        el("h3", { id: `tx-${w}` }, META[w].name),
        el("p", { class: "quiet" }, META[w].kicker),
        worldThemes(w).length ? el("div", { class: "cards" }, worldThemes(w).map((t) => el("div", { class: "card" }, el("p", { class: "statement" }, t.corrected ?? t.statement), el("p", { class: "why" }, t.why)))) : el("p", { class: "quiet" }, "I don't have enough evidence to conclude anything here yet."),
        worldStars(w).length ? el("ul", { class: "memories" }, [...worldStars(w)].reverse().map((s) => el("li", { class: "memory" }, el("span", { class: "when" }, longDate(s.date)), el("span", { class: "text" }, s.excerpt)))) : el("p", { class: "quiet" }, "No memories here yet."))));
  }
  function entrance() {
    let seen = false;
    try { seen = localStorage.getItem("dw-home-seen") === "1"; } catch {}
    const ov = $("entrance");
    if (reduced || seen || !ctx || state.mode === "text") { ov.hidden = true; ctx?.skipIntro(); document.body.classList.add("arrived"); return; }
    ov.hidden = false;
    const done = () => {
      if (ov.classList.contains("out")) return;
      ov.classList.add("out"); ctx.skipIntro(); document.body.classList.add("arrived");
      setTimeout(() => (ov.hidden = true), 600);
      try { localStorage.setItem("dw-home-seen", "1"); } catch {}
    };
    $("skip").addEventListener("click", () => { done(); $("e-title").focus({ preventScroll: true }); }, { once: true });
    setTimeout(done, 3000);
  }

  // ----- layout: fit the worlds into the free space; keep the editor above the keyboard -----
  function layout() {
    if (!ctx) return;
    ctx.resize(innerWidth, innerHeight);
    const W = innerWidth, H = innerHeight, wide = W >= 1000;
    // Too little room for four labelled planets: show four world buttons instead.
    document.body.classList.toggle("compact", !wide && (H < 700 || W < 340));
    ctx.setStretch(W / H < 0.8 ? 1.32 : 1);
    // The free space is measured around the galaxy card, so only while it shows.
    if ($("home-ui").hidden) { fit.frame = null; return; }
    const r = (id) => $(id).getBoundingClientRect();
    fit.frame = wide
      ? { left: r("home-ui").right + 16, right: r("tabs").left - 16, top: r("brand").bottom + 8, bottom: H - 24 }
      : { left: 0, right: W, top: Math.max(r("brand").bottom, $("notice").hidden ? 0 : r("notice").bottom) + 8, bottom: r("home-ui").top - 8 };
    fit.scale = wide ? 0.8 : 0.74;
    fit.tries = 0;
    ctx.setFrame(fit.frame, fit.scale);
  }
  const fit = { frame: null, scale: 0.8, tries: 0 };
  addEventListener("resize", layout);
  window.visualViewport?.addEventListener("resize", () => {
    const a = document.activeElement;
    if (a && a.tagName === "TEXTAREA") a.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  });

  function place() {
    const W = innerWidth, H = innerHeight;
    let top = Infinity, bottom = -Infinity;
    for (const w of ORDER) {
      const p = ctx.project(w, W, H), a = arcs.get(w), b = labels.get(w);
      const r = Math.max(18, p.r), ra = r + 7, rb = r + 15;
      const S = Math.ceil(2 * (rb + 26)), c = S / 2;
      const key = `${Math.round(r)}|${S}`;
      if (key !== a.last) {
        a.last = key;
        a.svg.setAttribute("width", S); a.svg.setAttribute("height", S); a.svg.setAttribute("viewBox", `0 0 ${S} ${S}`);
        a.top.setAttribute("d", `M ${c - ra} ${c} A ${ra} ${ra} 0 0 1 ${c + ra} ${c}`);
        a.bot.setAttribute("d", `M ${c - rb} ${c} A ${rb} ${rb} 0 0 0 ${c + rb} ${c}`);
        a.fits = W >= 1000 && a.words.getComputedTextLength() <= a.bot.getTotalLength() * 0.82;
        a.words.style.display = a.fits ? "" : "none";
      }
      a.svg.style.transform = `translate(${Math.round(p.x - c)}px, ${Math.round(p.y - c)}px)`;
      const half = (b.offsetWidth || 120) / 2 + 8;
      const x = Math.min(W - half, Math.max(half, p.x));
      const by = Math.round(p.y + (a.fits ? rb + 10 : r + 12));
      b.style.transform = `translate(${Math.round(x)}px, ${by}px) translateX(-50%)`;
      b.classList.toggle("off", !p.visible);
      a.svg.classList.toggle("off", !p.visible);
      top = Math.min(top, p.y - ra - 18);
      bottom = Math.max(bottom, by + 44);
    }
    // Labels have a fixed size while the worlds scale: if any label leaves the
    // free space, step the worlds back a little until everything fits.
    if (fit.frame && ctx.settled && fit.tries < 30 && (top < fit.frame.top || bottom > fit.frame.bottom)) {
      fit.tries++; fit.scale *= 1.04;
      ctx.setFrame(fit.frame, fit.scale);
    }
  }

  let mode = "galaxy";
  try { mode = localStorage.getItem("dw-home-mode") === "text" ? "text" : "galaxy"; } catch {}
  if (!ctx) mode = "text";
  // Explore shares the engine with the server: on this device without an
  // account, through the API with one.
  explore = createExplore(data.local ? localStore(device) : remoteStore(call), {
    $, el, svg, ICON, META, announce, quiet, longDate, sound, showPlace,
    distress: (t) => DISTRESS.test(t), crisisText: CRISIS_TEXT.join("\n"),
    onDiscoveries: (_d, fresh) => { sync(); if (fresh.length && explore.data.gameLayer) sound.chime(1175); },
    goHomeWith: (key) => goHome({ show: key ? `d:${key}` : null }),
    goEarth: (found) => { if (found) state.selStar = `d:${found.key}`; openEarth(found); },
    crumbs,
  });
  explore.refresh().then(() => { sync(); renderHome(); });
  let firstVisit = false;
  try { firstVisit = localStorage.getItem("dw-home-seen") !== "1"; } catch {}
  showPlace("home");
  renderHome();
  setMode(mode);
  // Everyone opens on Home: the next step is visible in seconds; the Universe is one tab away.
  void firstVisit;
  openEarth(null, { quietFocus: true });
  layout();
  if (ctx) {
    const frames = (window.__dwFrames = []);
    let last = performance.now(), rendered = 0;
    ctx.renderer.setAnimationLoop((now) => {
      const dt = Math.min((now - last) / 1000, 0.1), gap = now - last; last = now;
      if (state.mode === "text") return;                            // nothing drawn behind the text view
      if (document.body.classList.contains("closeup-on")) return;   // a world's painting covers it
      if (!(state.place === "home" || state.place === "world" || state.place === "atlas")) return; // Home, Learn, Journey and You cover it: keep the last frame, save the battery
      frames.push(gap); if (frames.length > 600) frames.shift();
      // Every 120 drawn frames: a median over 28 ms drops glow, pixel ratio and half the dust.
      if (++rendered % 120 === 0 && ctx.bloomOn) { const f = frames.slice(-100).sort((a, b) => a - b); if (f[50] > 28) { ctx.degrade(); window.__dwDegraded = true; } }
      ctx.frame(dt);
      if (state.place === "home") place();
    });
  }
  entrance();
  window.__dwHome = { state, data };
  window.__dwHomeReady = true;
}

loadData()
  .then((d) => main(d, false))
  .catch(() => main(localData(), true));
