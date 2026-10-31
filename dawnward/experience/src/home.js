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
// Worlds and galaxies live in one registry: new places come from data, not new screens.
import { ORDER, META, GALAXIES, WORLDS, worldRoute, ART, artPath } from "./registry.js";

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
  listen: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
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
  /** The passage: a slow rising sweep under the drone. Only when sound is already on. */
  rise(sec = 2.6) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.setValueAtTime(82, t); o.frequency.exponentialRampToValueAtTime(330, t + sec);
    f.type = "lowpass"; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2400, t + sec);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + sec * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + sec + 0.6);
    o.connect(f); f.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + sec + 0.7);
    this.chime(1318);
  },
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
    const tabs = [["overview", "Overview"], ["expeditions", "Expeditions"], ["library", "Library"], ["progress", "Progress"]];
    const cur = state.wtab?.[w] ?? "overview";
    const panels = { overview: () => [worldNext(w), ...more], expeditions: () => [worldSystems(w)], library: () => [worldLibrary(w)], progress: () => [worldProgress(w)] };
    const panel = el("div", { class: "wpanel", role: "tabpanel", id: "w-panel", "aria-labelledby": `w-tab-${cur}`, tabindex: "0" }, ...panels[cur]());
    const pick = (id, focus) => { state.wtab = { ...(state.wtab ?? {}), [w]: id }; worldIntro(w); routeTo(`${worldRoute(w)}/${id}`, { replace: true }); if (focus) $(`w-tab-${id}`)?.focus(); };
    const bar = el("div", { class: "wtabs", role: "tablist", "aria-label": `${META[w].name} sections`, onkeydown: (e) => {
      const k = tabs.findIndex(([id]) => id === cur), d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); pick(tabs[(k + d + tabs.length) % tabs.length][0], true); }
    } }, tabs.map(([id, label]) => el("button", { role: "tab", id: `w-tab-${id}`, "aria-selected": String(id === cur), "aria-controls": "w-panel", tabindex: id === cur ? "0" : "-1", onclick: () => pick(id, true) }, label)));
    wbody.replaceChildren(
      el("p", { class: "kicker" }, META[w].kicker),
      el("h2", { class: "w-q", id: "w-q", tabindex: "-1" }, META[w].q),
      el("p", { class: "w-line" }, META[w].line),
      el("p", { class: "w-start" }, META[w].start),
      el("button", { class: "primary wide", onclick: () => openEditor(w) }, "Begin reflection"),
      bar, panel);
    document.body.classList.remove("sheet-open");
  }
  const fromWorld = (w) => ({ from: { label: META[w].name, go: () => goWorld(w), trail: [growthCrumb, { label: META[w].name, go: () => goWorld(w) }] } });
  const chapterDone = (id) => (explore?.data.attempts ?? []).some((a) => a.missionId === id && a.status === "completed");
  /** Draws a skill pathway: the system is the sun, each chapter a moon on its own orbit.
   *  Lit = completed and saved. Ringed = next. Dim and dashed = planned, not yet written. */
  function solarSystem(sys) {
    const NSV = "http://www.w3.org/2000/svg";
    const mk = (tag, a) => { const n = document.createElementNS(NSV, tag); for (const [k, v] of Object.entries(a)) n.setAttribute(k, v); return n; };
    const written = sys.missionIds.map(missionById), planned = sys.planned ?? [];
    const all = [...written.map((m) => ({ title: m.part.replace(/^Chapter \d+: /, ""), done: chapterDone(m.id), planned: false })), ...planned.map((p) => ({ title: p.title, done: false, planned: true }))];
    const nextIdx = all.findIndex((c) => !c.done && !c.planned);
    const W = 300, H = 124, cx = W / 2, cy = H / 2, n = all.length;
    const svgEl = mk("svg", { viewBox: `0 0 ${W} ${H}`, class: `solar solar-${sys.world}`, role: "img",
      "aria-label": `${sys.title}: ${all.filter((c) => c.done).length} of ${n} ${sys.kind === "expedition" ? "chapters" : "missions"} done.${nextIdx >= 0 ? ` Next: ${all[nextIdx].title}.` : ""}${planned.length ? ` ${planned.length} still being written.` : ""}` });
    const planet = ART.systems[sys.id];
    if (planet) svgEl.append(mk("image", { href: asset(artPath(planet)), x: cx - 22, y: cy - 22, width: 44, height: 44, class: "sun-art" }));
    else svgEl.append(mk("circle", { cx, cy, r: 13, class: "sun" }));
    all.forEach((c, k) => {
      const r = n === 1 ? 62 : 24 + (k * (78 - 24)) / (n - 1), rx = r * 1.85, ry = r * 0.62;
      svgEl.append(mk("ellipse", { cx, cy, rx, ry, class: `orbit${c.done ? " lit" : ""}${c.planned ? " planned" : ""}` }));
      const a = -0.5 + k * 0.95, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
      if (k === nextIdx) svgEl.append(mk("circle", { cx: x, cy: y, r: 9, class: "next-ring" }));
      svgEl.append(mk("circle", { cx: x, cy: y, r: c.planned ? 3.5 : 5, class: `moon${c.done ? " lit" : ""}${c.planned ? " planned" : ""}` }));
    });
    return svgEl;
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
        el("p", { class: "kicker" }, sys.kind === "expedition" ? `Solar system · expedition · ${sys.missionIds.length + (sys.planned?.length ?? 0)} chapters` : "Solar system"),
        el("p", { class: "sys-title" }, sys.title),
        el("p", { class: "quiet" }, sys.objective),
        solarSystem(sys),
        el("ul", { class: "missions" }, sys.missionIds.map(missionById).map((m) => el("li", {}, el("button", {
          class: `mission${done(m.id) ? " done" : ""}`, "aria-label": `${m.title}, ${m.part}. ${m.objective} ${done(m.id) ? "Done." : `${m.minutes} minutes.`}`,
          onclick: () => explore.play(m.id, fromWorld(w)),
        }, el("span", { class: "mstate", "aria-hidden": "true" }, done(m.id) ? "✦" : ""), el("span", { class: "rtext" }, el("span", { class: "rtitle" }, sys.kind === "expedition" ? m.part : m.title), el("span", { class: "rsub" }, sys.kind === "expedition" ? m.objective : m.part)), el("span", { class: "mmeta" }, done(m.id) ? "Done" : `${m.minutes} min${m.status === "draft" ? " · draft" : ""}`)))),
          (sys.planned ?? []).map((p, k) => el("li", { class: "planned" }, el("span", { class: "rtext" }, el("span", { class: "rtitle" }, `Chapter ${sys.missionIds.length + k + 1}: ${p.title}`), el("span", { class: "rsub" }, p.line)), el("span", { class: "mmeta" }, "Planned")))))),
      el("p", { class: "quiet small" }, systems.length ? `Planned next here: ${play.planned.join(", ")}.` : `Planned here: ${play.planned.join(", ")}. Reflection is open now.`),
      play.planned.some((p) => ART.planned[p]) ? el("ul", { class: "planned-row", "aria-label": "Pathways being written" }, play.planned.filter((p) => ART.planned[p]).map((p) =>
        el("li", {}, el("img", { src: asset(artPath(ART.planned[p])), alt: "" }), el("span", {}, p), el("span", { class: "quiet small" }, "Planned")))) : null);
  }
  // Overview: the one next step in this world, if there is one
  function worldNext(w) {
    const open = (explore?.data.attempts ?? []).find((a) => (a.status === "in_progress" || a.status === "paused") && missionById(a.missionId)?.world === w);
    const m = open ? missionById(open.missionId) : MISSIONS.find((x) => x.world === w && !chapterDone(x.id));
    const play = WORLD_PLAY[w];
    return el("section", { class: "group", "aria-labelledby": "w-next-h" },
      el("h3", { id: "w-next-h" }, `Next in ${META[w].name}`),
      el("p", { class: "quiet" }, play.mechanic),
      m ? el("button", { class: "row", onclick: () => explore.play(m.id, fromWorld(w)) },
            el("span", { class: "ricon", html: svg(ICON[w], 22) }),
            el("span", { class: "rtext" }, el("span", { class: "rtitle" }, `${m.title}: ${m.part}`), el("span", { class: "rsub" }, open ? `You stopped at step ${open.step + 1} of ${m.steps.length}` : `${m.objective} About ${m.minutes} minutes.`)),
            el("span", { class: "rgo", html: svg(ICON.arrow, 16) }))
        : el("p", { class: "quiet" }, SYSTEMS.some((x) => x.world === w) ? "Everything written here is done. More is being written." : `Expeditions here are planned: ${play.planned.join(", ")}. Reflection is open now.`));
  }
  // Library: the resources this world's chapters really have
  function worldLibrary(w) {
    const withSheets = MISSIONS.filter((m) => m.world === w && m.worksheet);
    return el("section", { class: "group", "aria-labelledby": "w-lib-h" },
      el("h3", { id: "w-lib-h" }, "Worksheets"),
      withSheets.length
        ? el("ul", { class: "missions" }, withSheets.map((m) => el("li", {}, el("button", { class: "mission", onclick: () => explore.sheet(m.id, () => { goWorld(w); }) },
            el("span", { class: "mstate", "aria-hidden": "true" }, ""), el("span", { class: "rtext" }, el("span", { class: "rtitle" }, m.worksheet.title), el("span", { class: "rsub" }, `${m.title} · ${m.part}`)), el("span", { class: "mmeta" }, "Print")))))
        : el("p", { class: "quiet" }, "No worksheets here yet. They arrive with each written chapter."),
      el("h3", {}, "Books and audio"),
      el("p", { class: "quiet" }, "None yet. Books are added only from manuscripts you own, chapter by chapter, after review. Lessons can already be listened to inside each chapter."));
  }
  // Progress: only what was done and saved
  function worldProgress(w) {
    const systems = SYSTEMS.filter((x) => x.world === w);
    const ex = explore?.data ?? { experiments: [], discoveries: [] };
    const disc = ex.discoveries.filter((d) => d.world === w);
    const actions = ex.experiments.filter((x) => x.world === w);
    return el("section", { class: "group", "aria-labelledby": "w-prog-h" },
      el("h3", { id: "w-prog-h" }, `Your progress in ${META[w].name}`),
      el("ul", { class: "progress-list" },
        systems.map((sys) => { const n = sys.missionIds.length + (sys.planned?.length ?? 0), d = sys.missionIds.filter(chapterDone).length;
          return el("li", {}, el("span", { class: "pl-title" }, sys.title), el("span", { class: "pl-bar", role: "img", "aria-label": `${d} of ${n} done` }, el("span", { style: `width:${Math.round((100 * d) / n)}%` })), el("span", { class: "pl-n" }, `${d} of ${n}`)); }),
        el("li", {}, el("span", { class: "pl-title" }, "Memories"), el("span", { class: "pl-n" }, String(worldStars(w).length))),
        el("li", {}, el("span", { class: "pl-title" }, "Discoveries"), el("span", { class: "pl-n" }, String(disc.length))),
        el("li", {}, el("span", { class: "pl-title" }, "Real actions chosen"), el("span", { class: "pl-n" }, String(actions.length)))),
      disc.length ? el("ol", { class: "journey" }, [...disc].reverse().map((d) => el("li", {}, el("span", { class: "mt" }, d.title), el("span", { class: "quiet" }, d.why)))) : el("p", { class: "quiet" }, "Nothing yet. Progress here only ever shows what you've done and kept."));
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
  document.querySelectorAll("#m-views button").forEach((b) => b.addEventListener("click", () => { state.view = b.dataset.v; drawMemories(); routeTo(routeOf("memories"), { replace: true }); }));
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
  // ----- routes: every place has an address, so Back works and a link lands where it says -----
  const WTABS = ["overview", "expeditions", "library", "progress"];
  let routing = false, booted = false;
  const startHash = location.hash; // read before anything is drawn, so a link lands where it says
  function routeTo(r, { replace = false } = {}) {
    if (!booted || routing || state.mode === "text" || location.hash === r) return;
    try { if (replace) history.replaceState(null, "", r); else history.pushState(null, "", r); } catch { /* a frame that forbids history: places still work */ }
  }
  const routeOf = (p) => ({ earth: "#/home", atlas: "#/universe", home: "#/universe/growth", explore: "#/learn", memories: state.view === "miles" ? "#/journey/milestones" : "#/journey", you: "#/you",
    world: `${worldRoute(state.world)}/${state.wtab?.[state.world] ?? "overview"}` })[p] ?? "#/home";
  function followRoute(hash) {
    const [a, b, c] = hash.replace(/^#\/?/, "").split("/");
    routing = true;
    try {
      if (a === "universe" && b === "growth") goHome();
      else if (a === "universe") openAtlas();
      else if (a === "world" && ORDER.includes(b)) { if (WTABS.includes(c)) state.wtab = { ...(state.wtab ?? {}), [b]: c }; goWorld(b); }
      else if (a === "learn") explore.open();
      else if (a === "journey") { if (b === "milestones") state.view = "miles"; openMemories(); }
      else if (a === "you") openYou();
      else openEarth();
    } finally { routing = false; }
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
    routeTo(routeOf(p));
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
      world.scrollTop = 0; // a new world starts at its top, not where the last one was left
      document.body.classList.remove("closeup-on");
      let fallback = 0;
      const reveal = () => { clearTimeout(fallback); if (state.place === "world" && state.world === w) document.body.classList.add("closeup-on"); };
      if (ctx && state.mode === "galaxy") {
        ctx.focusWorld(w, reveal);
        // Safeguard: the flight takes 0.7 s. If its arrival hasn't come by 1.6 s
        // (a lost frame, a paused tab), open the world anyway, and count it.
        fallback = setTimeout(() => { if (!document.body.classList.contains("closeup-on")) { window.__dwArrivalFallbacks = (window.__dwArrivalFallbacks ?? 0) + 1; reveal(); } }, 1600);
      } else reveal();
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
    const orb = ART.galaxies[g.id];
    const art = orb ? el("img", { class: `gx-img gx-orb${g.kind ? ` gx-${g.kind}-orb` : ""}`, alt: "", src: asset(artPath(orb)) })
      : el("img", { class: "gx-img", alt: "", src: asset("img/worlds/galaxy-core-1024.webp") });
    inner.append(el("button", { class: `gx g-${g.id}${g.open ? "" : " closed"}`, "data-id": g.id, style: `--lx:${g.x}%;--ly:${g.y}%;--gx:${g.size};--px:${g.p[0]}%;--py:${g.p[1]}%;--pw:${g.p[2]}`, "aria-label": `${g.name}. ${g.tag} ${g.open ? "Open." : "Not open yet."}`, "aria-pressed": "false", onclick: () => selectGalaxy(g) },
      art, el("span", { class: "gx-name" }, g.name), g.open ? null : el("span", { class: "gx-soon" }, g.kind === "gateway" ? "Opens next" : "Preview")));
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
      el("p", { class: "kicker" }, g.open ? "Open" : g.kind === "gateway" ? "Opens next · preview" : "Preview · not open yet"),
      el("h2", { class: "s-title", id: "a-name", tabindex: "-1" }, g.name),
      el("p", { class: "lead" }, g.tag),
      g.planned ? el("p", { class: "quiet" }, g.open ? g.planned : `Planned: ${g.planned}`) : null,
      el("div", { class: "actions" },
        g.id === "growth" ? el("button", { class: "primary", onclick: () => goHome() }, "Enter Personal Growth") : null,
        g.id === "earth" ? el("button", { class: "primary", onclick: () => openEarth() }, "Return to Earth") : null,
        g.id === "gateway" ? el("button", { class: "primary", onclick: () => explore.play("gateway-1", { from: { label: "Universe", go: () => openAtlas(), trail: [] } }) }, "Enter the Gateway") : null,
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
    $("earth").style.setProperty("--e-art", `url("${asset(artPath(ART.home))}")`);
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
    // the expedition you chose to follow comes first
    for (const f of explore?.data.following ?? []) {
      const sys = SYSTEMS.find((x) => x.id === f.systemId);
      const next = sys?.missionIds.find((id) => !missionDone(id));
      if (next) return { m: missionById(next), step: 0, following: sys, why: `You chose to follow ${sys.title}, and this is its next chapter.` };
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
  const chaptersIn = (m) => { const sys = SYSTEMS.find((x) => x.id === m.systemId); return sys ? sys.missionIds.length + (sys.planned?.length ?? 0) : 1; };
  function compassCard(pick) {
    const { m } = pick, total = m.steps.length;
    return el("article", { class: "compass", "aria-labelledby": "c-title" },
      el("img", { class: "c-medal", src: asset(artPath(ART.compass)), alt: "" }),
      el("div", { class: "c-top" }, el("p", { class: "kicker" }, "Your daily compass"),
        el("p", { class: "c-meta" }, m.chapter ? `Chapter ${m.chapter} of ${chaptersIn(m)}` : pick.resume ? `Step ${pick.step + 1} of ${total}` : `${META[m.world].name} · ${m.minutes} min`)),
      el("h3", { id: "c-title", class: "c-title" }, m.title),
      el("p", { class: "c-part" }, `${META[m.world].name} · ${m.part}${m.status === "draft" ? " · draft" : ""}`),
      el("p", { class: "c-mission" }, `Today's mission: ${m.objective}`),
      pick.following ? el("p", { class: "c-part" }, `You're following ${pick.following.title} · ${pick.following.missionIds.filter(missionDone).length} of ${chaptersIn(m)} chapters done`) : null,
      pick.resume ? el("p", { class: "c-part" }, `Step ${pick.step + 1} of ${total}`) : null,
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
    const other = MISSIONS.find((m) => m.systemId !== pick?.m.systemId && !missionDone(m.id));
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
    const chapters = (ex.attempts ?? []).filter((x) => x.status === "completed").length;
    const counts = [[data.stars.length, "Reflections"], [chapters, "Chapters"], [ex.experiments.length, "Actions"], [ex.discoveries.length, "Discoveries"]];
    box.replaceChildren(
      // Your evolution: counts of what was done and kept, nothing estimated
      el("section", { class: "group", "aria-labelledby": "mm-evo" }, el("h3", { id: "mm-evo" }, "Your evolution"),
        el("ul", { class: "evo" }, counts.map(([n, label]) => el("li", {}, el("span", { class: "evo-n" }, String(n)), el("span", { class: "evo-l" }, label))))),
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
    // A link with an address goes straight to its place: no arrival film in the way.
    if (reduced || seen || !ctx || state.mode === "text" || /^#\/[a-z]/.test(startHash)) { ov.hidden = true; ctx?.skipIntro(); document.body.classList.add("arrived"); return; }
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
    // the ring makes itself round from the camera it gets (see roundRing in the scene)
    // The free space is measured around the galaxy card, so only while it shows.
    if ($("home-ui").hidden) { fit.frame = null; return; }
    const r = (id) => $(id).getBoundingClientRect();
    fit.frame = wide
      ? { left: r("home-ui").right + 16, right: r("tabs").left - 16, top: r("brand").bottom + 8, bottom: H - 24 }
      : { left: 0, right: W, top: Math.max(r("brand").bottom, $("notice").hidden ? 0 : r("notice").bottom) + 8, bottom: r("home-ui").top - 8 };
    // compact screens show no names around the planets (the world buttons replace them), so the worlds can come closer still
    fit.scale = wide ? 0.62 : document.body.classList.contains("compact") ? 0.36 : 0.56;
    fit.tries = 0; fit.dy = 0;
    ctx.setFrame(fit.frame, fit.scale);
  }
  const fit = { frame: null, scale: 0.8, tries: 0, dy: 0 };
  addEventListener("resize", layout);
  window.visualViewport?.addEventListener("resize", () => {
    const a = document.activeElement;
    if (a && a.tagName === "TEXTAREA") a.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  });

  function place() {
    const W = innerWidth, H = innerHeight;
    let top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity;
    const compact = document.body.classList.contains("compact");
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
      top = Math.min(top, p.y - ra - (compact ? 6 : 18));
      bottom = Math.max(bottom, compact ? p.y + r + 6 : by + 44);   // compact: no names, the planets themselves
      left = Math.min(left, p.x - r - 6); right = Math.max(right, p.x + r + 6);
    }
    // Labels have a fixed size while the worlds scale: if any label leaves the
    // free space, step the worlds back a little until everything fits.
    // Fit: centre the worlds and their names (not the core) in the free space, then size them to fill
    // about 92% of it, stepping back if they'd overflow and in if there's room. A few steps at most.
    if (fit.frame && ctx.settled && fit.tries < 12) {
      const F = fit.frame;
      const need = Math.max((bottom - top) / Math.max(80, F.bottom - F.top), (right - left) / Math.max(80, F.right - F.left));
      const cy = (top + bottom) / 2 - (F.top + F.bottom) / 2;
      if (need > 0.98 || need < 0.86 || Math.abs(cy) > 3) {
        fit.tries++;
        fit.dy -= cy;
        if (need > 0.98 || need < 0.86) fit.scale *= Math.min(1.6, Math.max(0.75, need / 0.92));
        ctx.setFrame({ ...F, top: F.top + fit.dy, bottom: F.bottom + fit.dy }, fit.scale);
      }
    }


  }

  let mode = "galaxy";
  try { mode = localStorage.getItem("dw-home-mode") === "text" ? "text" : "galaxy"; } catch {}
  if (!ctx) mode = "text";
  // Explore shares the engine with the server: on this device without an
  // account, through the API with one.
  explore = createExplore(data.local ? localStore(device) : remoteStore(call), {
    $, el, svg, ICON, META, announce, quiet, longDate, sound, showPlace, asset,
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
  // A link with an address opens that place; otherwise Home. Back and Forward follow the addresses.
  if (/^#\/[a-z]/.test(startHash) && mode === "galaxy") followRoute(startHash); else openEarth(null, { quietFocus: true });
  booted = true;
  routeTo(routeOf(state.place), { replace: true });
  addEventListener("popstate", () => { if (state.mode !== "text") followRoute(location.hash); });
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
  if (ctx) {
    // A lost GPU context stops the render loop (three.js pauses it until the context returns).
    // Count it, and never let it strand anyone mid-flight: open the world now.
    ctx.renderer.domElement.addEventListener("webglcontextlost", () => {
      window.__dwContextLost = (window.__dwContextLost ?? 0) + 1;
      if (state.place === "world") document.body.classList.add("closeup-on");
    });
  }
  window.__dwHome = { state, data, get scene() { return ctx ? { moving: ctx.moving, focus: ctx.focus, settled: ctx.settled, fit: { ...fit } } : null; } };
  window.__dwHomeReady = true;
}

loadData()
  .then((d) => main(d, false))
  .catch(() => main(localData(), true));
