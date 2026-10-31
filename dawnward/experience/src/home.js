// Galaxy Home: the vertical slice of the Living Intelligence Universe, in the
// look of the Galaxy Home board. Galaxy home → a world → capture → save → a new
// memory star → insight review → home. Every word a person reads is HTML; the
// 3D scene is the setting, never the text. Without a token it runs on a clearly
// labelled sample that lives in this page only. With a token it reads and
// writes the real Dawnward API (/galaxy, /debrief, /assertions/:id/dispute,
// /campaign), and only ever to this page's own origin or a local dev server.
import { buildHome } from "./home-scene.js";

const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const asset = (p) => (window.DW_ASSETS ? window.DW_ASSETS(p) : `assets/${p}`);
const ORDER = ["mind", "body", "soul", "future"];
const META = {
  mind: { name: "Mind", words: "Reflect · Understand · Clarity", line: "Your thoughts, patterns and inner world.", ask: "What went on in your head today?" },
  body: { name: "Body", words: "Energy · Habits · Wellbeing", line: "Your energy, movement, rest and the outdoors.", ask: "How did your body feel today?" },
  soul: { name: "Soul", words: "Values · Connection · Meaning", line: "Your values, your people and what lights you up.", ask: "Who or what mattered today?" },
  future: { name: "Future", words: "Goals · Pathways · Possibilities", line: "Where you're heading, and the steps that got you closer.", ask: "What moved you closer to where you're going?" },
};
const CONFIDENCE = { hypothesis: "A guess", probable: "Probably true", established: "Well established" };
const svg = (paths, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICON = {
  mind: '<path d="M12 4c-3.3 0-6 2.5-6 5.6 0 1.8.9 3.4 2.3 4.4V17h7.4v-3c1.4-1 2.3-2.6 2.3-4.4C18 6.5 15.3 4 12 4Z"/><path d="M9.5 20h5M12 8v6M9.5 10.5 12 12l2.5-1.5"/>',
  body: '<path d="M5 19c7 0 13-5 14-14-8 1-13 6-13 12"/><path d="M6 17c3-3 6-5 9-7"/>',
  soul: '<path d="M12 20c-4-2-7-5-7-9 2 0 4 1 5 3-.5-3 .5-6 2-8 1.5 2 2.5 5 2 8 1-2 3-3 5-3 0 4-3 7-7 9Z"/>',
  future: '<path d="M4 16h16M7 16a5 5 0 0 1 10 0"/><path d="M12 5v3M5.5 9l1.8 1.5M18.5 9l-1.8 1.5M3 19h18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  feather: '<path d="M20 4C12 4 6 9 5 19M5 19l5-5M9 15c4 0 8-2 9-6"/>',
  constellation: '<circle cx="5" cy="7" r="1.4"/><circle cx="12" cy="4" r="1.4"/><circle cx="18" cy="9" r="1.4"/><circle cx="9" cy="14" r="1.4"/><circle cx="16" cy="18" r="1.4"/><path d="M6.2 6.4 10.8 4.6M13.2 4.8l3.6 3.4M17.3 10.2 16.3 16.7M14.8 17.4 10 14.8M8.4 12.8 5.6 8.3"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  memories: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  insight: '<path d="M12 3 14 9l6 .5-4.6 3.9L17 20l-5-3.2L7 20l1.6-6.6L4 9.5 10 9Z"/>',
  review: '<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="M13 7l4 4"/>',
  destination: '<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  galaxy: '<ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(-20 12 12)"/><circle cx="12" cy="12" r="2.2"/>',
};

function hash(id, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967295;
}
const longDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
const shortDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
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
const seenIn = (n, days) => (n <= 1 ? "Seen in one of your evenings so far." : `Seen in ${n} of your evenings, across ${days} ${days === 1 ? "day" : "days"}.`);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const greeting = () => { const h = new Date().getHours(); return h < 5 ? "Good evening" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

// ---------- Data ----------

function sampleData() {
  const rows = [
    ["mind", "2026-09-02", "Started the list on paper again. Did the first three before lunch."],
    ["body", "2026-09-04", "Skipped the walk. Felt it in the afternoon."],
    ["mind", "2026-09-07", "Wrote tomorrow down and kept to it, even the hard call."],
    ["soul", "2026-09-09", "A long talk with my sister. We laughed about the old flat."],
    ["body", "2026-09-12", "Walked at lunch and the afternoon was clearer."],
    ["mind", "2026-09-15", "Planned the week on Sunday night. It held until Thursday."],
    ["future", "2026-09-16", "Signed up for the spring half marathon. Scared, but it's done."],
    ["soul", "2026-09-18", "Called my sister back. Easier than I thought."],
    ["body", "2026-09-21", "Walked before the meeting. Said what I meant."],
    ["future", "2026-09-23", "First 5k without stopping. Slow, but all of it."],
    ["soul", "2026-09-26", "Sat with the quiet for ten minutes before bed. Slept better."],
    ["future", "2026-09-30", "Ran 8k on Sunday. Legs heavy, head clear."],
  ];
  const stars = rows.map(([world, date, excerpt], i) => ({ id: `sample-${i}`, world, date, excerpt, themeIds: [] }));
  const themes = [
    { id: "t-mind", world: "mind", statement: "Writing the day down helps you keep to it.", confidence: "probable", starIds: ["sample-0", "sample-2", "sample-5"] },
    { id: "t-body", world: "body", statement: "A walk at midday changes your afternoon.", confidence: "probable", starIds: ["sample-1", "sample-4", "sample-8"] },
    { id: "t-soul", world: "soul", statement: "Your sister is someone you return to.", confidence: "hypothesis", starIds: ["sample-3", "sample-7"] },
    { id: "t-future", world: "future", statement: "You keep going once a goal has a date on it.", confidence: "probable", starIds: ["sample-6", "sample-9", "sample-11"] },
  ];
  const goal = {
    title: "Run the spring half marathon",
    milestones: [
      { title: "Sign up", evidence: "sample-6" },
      { title: "Run 5k without stopping", evidence: "sample-9" },
      { title: "Run 10k", evidence: null },
      { title: "Race day", evidence: null },
    ],
  };
  // Three morning steps, each drawn from an evening (sample, not the planner).
  const steps = [
    { text: "Write tomorrow down before bed.", from: "sample-2" },
    { text: "Take the walk at lunch, even a short one.", from: "sample-4" },
    { text: "Send your sister a message.", from: "sample-7" },
  ];
  return finish({ stars, themes, goal, steps, sample: true });
}

/** Works out what the screen shows from what the data holds, so counts always match. */
function finish(data) {
  const byId = new Map(data.stars.map((s) => [s.id, s]));
  for (const s of data.stars) s.themeIds = [];
  for (const t of data.themes) {
    t.starIds = t.starIds.filter((id) => byId.has(id));
    if (!t.rejected) for (const id of t.starIds) byId.get(id).themeIds.push(t.id);
    t.why = seenIn(t.starIds.length, new Set(t.starIds.map((id) => byId.get(id).date)).size);
    t.forming = t.starIds.length < 2 || t.confidence === "hypothesis";
  }
  data.links = data.themes.filter((t) => !t.rejected).flatMap((t) => t.starIds.slice(1).map((to, i) => ({ from: t.starIds[i], to, themeId: t.id })));
  return data;
}

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
  // Each world asked for separately: the server decides what belongs where.
  const per = await Promise.all(ORDER.map((w) => call(`/galaxy?world=${w}`)));
  const stars = new Map(), themes = new Map();
  per.forEach((g, i) => {
    for (const s of g.stars) if (!stars.has(s.id)) stars.set(s.id, { ...s, world: ORDER[i] });
    for (const t of g.themes) if (!themes.has(t.id)) themes.set(t.id, { ...t, world: ORDER[i] });
  });
  let goal = null;
  try {
    const c = await call("/campaign");
    goal = { title: c.title, milestones: (c.milestones ?? []).map((m) => ({ title: m.title, day: m.day, evidence: null })), planned: true };
  } catch {}
  const list = [...stars.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return finish({ stars: list, themes: [...themes.values()], goal, steps: null, sample: false });
}

async function loadData() {
  const params = new URLSearchParams(location.hash.slice(1));
  token = params.get("token");
  if (!token) return sampleData();
  // Read once and removed from the address bar straight away.
  history.replaceState(null, "", location.pathname + location.search);
  api = trustedApi(new URLSearchParams(location.search).get("api"));
  if (!api) throw new Error("untrusted api origin");
  return loadConnected();
}

// Sample mode sends nothing anywhere, so Dawnward's real safety check can't run.
// It still never answers words like these with anything but support.
const DISTRESS = /\b(kill myself|suicid|end it all|end my life|hurt myself|self[- ]harm|don'?t want to (be here|live))/i;
const CRISIS_TEXT = [
  "Thank you for telling me this. What you're carrying right now matters more than any plan or goal.",
  "I can't help with this the way a person can, and you deserve real support:",
  "• findahelpline.com lists free, confidential support lines for your country",
  "If you are in immediate danger, please contact emergency services now.",
];

// ---------- Sound: only after a click, never on its own ----------

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
  const state = { view: "home", mode: "galaxy", lastWorld: null, selStar: null, suggestion: null, draftWorld: "mind", opener: null };
  const announce = (msg) => { const live = $("live"); live.textContent = ""; setTimeout(() => (live.textContent = msg), 30); };
  const starById = (id) => data.stars.find((s) => s.id === id);
  const themeById = (id) => data.themes.find((t) => t.id === id);
  const worldStars = (w) => data.stars.filter((s) => s.world === w);
  const worldThemes = (w) => data.themes.filter((t) => t.world === w && t.starIds.length && !t.rejected);
  const liveThemes = () => data.themes.filter((t) => t.starIds.length && !t.rejected);

  const [short, long] = failed
    ? ["Sample universe", ". I couldn't load yours, so these are invented evenings, not anyone's."]
    : data.sample ? ["Sample universe", " · invented evenings, not anyone's · nothing you type leaves this page"] : ["Your universe", ", from your own evenings"];
  $("source").replaceChildren(el("span", {}, short), el("span", { class: "long" }, long));
  document.body.classList.toggle("is-sample", data.sample);

  // ----- 3D -----
  let ctx = null;
  try { ctx = buildHome({ stage: $("stage"), reduced, hash }); } catch { ctx = null; }
  if (!ctx) document.body.classList.add("no-webgl");
  const sync = (bornId) => { if (ctx) { ctx.setMemories({ stars: data.stars, links: data.links }, bornId); highlight(); } };
  function highlight() {
    if (!ctx) return;
    const w = state.view === "home" ? null : state.view;
    const lit = new Set(w ? worldStars(w).map((s) => s.id) : []);
    const litThemes = new Set(w ? worldThemes(w).map((t) => t.id) : []);
    if (state.selStar) { lit.add(state.selStar); for (const t of starById(state.selStar)?.themeIds ?? []) litThemes.add(t); }
    ctx.setSelection({ litIds: lit, selId: state.selStar, litThemes });
  }
  sync();

  // ----- the four worlds: the name curves around each planet, its three words
  // follow the lower rim only where they fit, and one Explore button sits below.
  // The curved words are decoration for sighted readers; the button carries
  // the full name for everyone else. Nothing is allowed to overlap.
  const NS = "http://www.w3.org/2000/svg";
  const labels = new Map(), arcs = new Map();
  for (const w of ORDER) {
    const svgEl = document.createElementNS(NS, "svg");
    svgEl.setAttribute("class", `arc arc-${w}`);
    svgEl.setAttribute("aria-hidden", "true");
    const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
    const top = mk("path", { id: `arc-top-${w}`, fill: "none" }), bot = mk("path", { id: `arc-bot-${w}`, fill: "none" });
    const name = mk("text", { class: "aname" }), words = mk("text", { class: "awords" });
    const tp1 = mk("textPath", { href: `#arc-top-${w}`, startOffset: "50%", "text-anchor": "middle" }); tp1.textContent = META[w].name.toUpperCase();
    const tp2 = mk("textPath", { href: `#arc-bot-${w}`, startOffset: "50%", "text-anchor": "middle" }); tp2.textContent = META[w].words.toUpperCase();
    name.append(tp1); words.append(tp2); svgEl.append(top, bot, name, words);
    $("planets").append(svgEl);
    arcs.set(w, { svg: svgEl, top, bot, words, last: "" });
    const b = el("button", { class: `planet planet-${w}`, "data-world": w, onclick: () => goWorld(w) },
      el("span", { class: "picon", html: svg(ICON[w], 16) }), el("span", {}, "Explore"), el("span", { html: svg(ICON.arrow, 14) }));
    $("planets").append(b);
    labels.set(w, b);
  }
  const refreshPlanetNames = () => { for (const w of ORDER) labels.get(w).setAttribute("aria-label", `${META[w].name}: ${META[w].words.replaceAll(" · ", ", ")}. ${plural(worldStars(w).length, "memory", "memories")}. Explore`); };
  refreshPlanetNames();

  // ----- home: notice, the evening card, three cards -----
  function renderHome() {
    const ranked = liveThemes().sort((a, b) => b.starIds.length - a.starIds.length);
    const lead = ranked[0];
    const linked = ranked.find((t) => t.starIds.length >= 3);
    $("notice").hidden = !linked;
    if (linked) {
      $("notice-n").textContent = `${plural(linked.starIds.length, "memory", "memories")} linked`;
      $("notice").onclick = () => { state.opener = $("notice"); goWorld(linked.world, { open: () => openInsight(linked.id) }); };
    }
    $("hello").textContent = greeting();
    if (lead) {
      $("hero-title").textContent = lead.corrected ?? lead.statement;
      $("hero-body").textContent = `${lead.why} ${lead.forming ? "Still a guess." : CONFIDENCE[lead.confidence] ?? ""}`.trim();
      $("hero-thumb").src = asset(`img/worlds/closeup-${lead.world}.webp`);
      $("hero").onclick = () => { state.opener = $("hero"); goWorld(lead.world, { open: () => openInsight(lead.id) }); };
    } else {
      $("hero-title").textContent = "Your universe starts tonight.";
      $("hero-body").textContent = "Tell it about your day. Each evening becomes a star.";
      $("hero-thumb").src = asset("img/worlds/closeup-mind.webp");
      $("hero").onclick = () => openCapture("mind");
    }
    const newest = [...liveThemes()].filter((t) => t.forming)[0] ?? lead;
    $("q-insight-sub").textContent = newest ? (newest.forming ? "A pattern still forming" : "A pattern in your words") : "Nothing yet";
  }

  // ----- the world screen: close-up art, title, rows, and a sheet for detail -----
  const sheet = $("sheet");
  function worldRows(w) {
    const stars = worldStars(w), themes = worldThemes(w);
    const row = (icon, title, sub, onclick) => el("li", {}, el("button", { class: "row", onclick },
      el("span", { class: "ricon", html: svg(icon, 22) }),
      el("span", { class: "rtext" }, el("span", { class: "rtitle" }, title), el("span", { class: "rsub" }, sub)),
      el("span", { class: "rgo", html: svg(ICON.arrow, 16) })));
    const reached = data.goal ? data.goal.milestones.filter((m) => m.evidence).length : 0;
    return el("ul", { class: "rows" },
      row(ICON.feather, "New reflection", `Write or speak, kept in ${META[w].name}`, () => openCapture(w)),
      row(ICON.memories, "Memories here", stars.length ? `${plural(stars.length, "evening", "evenings")} you placed here` : "None yet", () => openMemories(w)),
      row(ICON.insight, "What I understand here", themes.length ? `${plural(themes.length, "insight", "insights")}, each with its evenings` : "Not enough evidence yet", () => openReview(w)),
      w === "future" && data.goal
        ? row(ICON.destination, "Your destination", `${reached} of ${data.goal.milestones.length} milestones, from your words`, () => openGoal())
        : row(ICON.review, "Correct what I think", "Accept, correct or set aside", () => openReview(w)));
  }
  function showWorld(w) {
    $("w-title").textContent = META[w].name;
    $("w-line").textContent = META[w].line;
    $("w-kicker").textContent = `World ${ORDER.indexOf(w) + 1} of 4`;
    $("closeup-img").src = asset(`img/worlds/closeup-${w}.webp`);
    $("closeup-img").dataset.world = w;
    document.body.dataset.world = w;
    quiet(false);
    document.body.classList.remove("sheet-open");
    sheet.replaceChildren(worldRows(w));
  }
  function sheetHead(title, kicker, back = () => { quiet(false); stopSpeech(); document.body.classList.remove("sheet-open"); sheet.replaceChildren(worldRows(state.view)); $("w-title").focus(); }) {
    quiet(false);
    document.body.classList.add("sheet-open");
    return [el("button", { class: "sback", onclick: back }, el("span", { html: svg(ICON.back, 16) }), ` ${META[state.view]?.name ?? "Back"}`),
      kicker ? el("p", { class: "kicker" }, kicker) : null,
      el("h2", { class: "stitle", tabindex: "-1" }, title)];
  }
  const focusSheet = () => sheet.querySelector(".stitle")?.focus();
  // While someone writes or speaks, the universe goes quiet around them.
  function quiet(on) { document.body.classList.toggle("quiet", on); sound.duck(on); }

  function quoteOf(id) {
    const s = starById(id);
    return el("li", { class: "quote" }, el("span", { class: "when" }, `${META[s.world].name} · ${longDate(s.date)}`), el("q", {}, s.excerpt));
  }
  function insightCard(t) {
    return el("article", { class: `card card-${t.world}` },
      el("p", { class: "kicker" }, `${META[t.world].name} · ${t.forming ? "Still forming" : CONFIDENCE[t.confidence] ?? "Probably true"}`),
      el("p", { class: "statement" }, t.corrected ?? t.statement),
      el("p", { class: "why" }, t.why),
      t.accepted ? el("p", { class: "note" }, "You said this is right.") : null,
      t.corrected ? el("p", { class: "note" }, "In your words, after you corrected it.") : null);
  }

  function openMemories(w) {
    const stars = [...worldStars(w)].reverse();
    sheet.replaceChildren(...sheetHead(`Memories in ${META[w].name}`, plural(stars.length, "evening", "evenings")),
      stars.length
        ? el("ul", { class: "memories" }, stars.map((s) => el("li", {}, el("button", { class: "memory", onclick: () => showStar(s.id) },
            el("span", { class: "when" }, longDate(s.date)), el("span", { class: "text" }, s.excerpt)))))
        : el("p", { class: "why" }, "No memories here yet. Add one and it becomes a star."));
    focusSheet();
  }

  function openInsight(id) {
    const t = themeById(id);
    if (!t) return;
    sheet.replaceChildren(...sheetHead(t.corrected ?? t.statement, `${META[t.world].name} · ${t.forming ? "Still forming" : CONFIDENCE[t.confidence] ?? ""}`),
      el("p", { class: "why gold" }, t.why),
      t.forming ? el("p", { class: "why" }, "This is a guess. I don't have enough evidence to conclude it yet.") : null,
      el("h3", {}, "What you said"),
      el("ul", { class: "quotes" }, t.starIds.map(quoteOf)),
      el("div", { class: "actions" },
        el("button", { class: "primary", onclick: () => openReview(t.world) }, "Review what I understand"),
        el("button", { class: "ghost", onclick: () => openMemories(t.world) }, "View memories")));
    state.selStar = null; highlight();
    if (ctx) ctx.setSelection({ litIds: new Set(t.starIds), selId: null, litThemes: new Set([t.id]) });
    focusSheet();
  }

  function openGoal() {
    const goal = data.goal;
    const reached = goal.milestones.filter((m) => m.evidence).length;
    sheet.replaceChildren(...sheetHead(goal.title, "Destination"),
      el("ol", { class: "milestones" }, goal.milestones.map((m) => {
        const s = m.evidence && starById(m.evidence);
        return el("li", { class: s ? "done" : "" },
          el("span", { class: "mt" }, m.title),
          el("span", { class: "why" }, s ? `Reached. You said so on ${longDate(s.date)}: “${s.excerpt}”` : goal.planned ? `Planned for day ${m.day}. Marked only when an evening says it happened.` : "Not yet. It's marked when an evening says it happened."));
      })),
      el("p", { class: "why" }, `${reached} of ${goal.milestones.length} reached, each from your own words.`));
    focusSheet();
  }

  function showStar(id, { born = false } = {}) {
    const s = starById(id);
    state.selStar = id;
    const themes = s.themeIds.map(themeById).filter(Boolean);
    sheet.replaceChildren(...sheetHead(born ? "A new star" : "Memory", `${META[s.world].name} · ${longDate(s.date)}`),
      el("blockquote", { class: "said" }, el("p", {}, s.excerpt)),
      el("p", { class: "why" }, born ? (data.sample ? "Kept, word for word, in this page only. Nothing was sent anywhere." : state.reply ?? "Kept, word for word.") : "Your words, as you said them."),
      themes.length
        ? el("div", {}, el("h3", {}, "It supports"), el("div", { class: "cards" }, themes.map(insightCard)))
        : el("p", { class: "why" }, "Not linked to anything yet. That takes more than one evening."),
      el("div", { class: "actions" },
        el("button", { class: "primary", onclick: () => openReview(s.world) }, "Review what I understand"),
        el("button", { class: "ghost", onclick: () => goHome({ show: s.id }) }, born ? "See it in your galaxy" : "Find it in your galaxy")));
    highlight();
    focusSheet();
  }

  // ----- capture: speak or type -----
  let recog = null;
  function openCapture(w, { speak = false } = {}) {
    w = w ?? (state.view !== "home" ? state.view : "mind");
    state.draftWorld = w;
    if (state.view !== w) { goWorld(w, { open: () => openCapture(w, { speak }) }); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const ta = el("textarea", { id: "words", rows: "6", maxlength: "20000", "aria-describedby": "cap-help", placeholder: "What's on your mind?" });
    const err = el("p", { class: "error", role: "alert" });
    const worlds = el("div", { class: "seg", role: "radiogroup", "aria-label": "Which world it belongs to" },
      ORDER.map((k) => el("button", { role: "radio", "aria-checked": String(k === w), onclick: () => {
        state.draftWorld = k;
        worlds.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b.textContent === META[k].name)));
        $("cap-q").textContent = META[k].ask;
      } }, META[k].name)));
    const speakBtn = SR ? el("button", { class: "mic", "aria-pressed": "false", onclick: () => toggleSpeech(speakBtn, ta) },
      el("span", { class: "mic-orb", html: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', 26) }), el("span", { class: "mic-label" }, "Speak")) : null;
    sheet.replaceChildren(...sheetHead("Write or speak your reflection", "Tonight"),
      el("p", { class: "sub" }, "A safe space for what's real."),
      el("label", { for: "words", id: "cap-q", class: "ask" }, META[w].ask),
      ta,
      el("p", { id: "cap-help", class: "why" }, data.sample
        ? "Sample: this stays in this page and is gone when you close it."
        : "Kept word for word. You can leave any evening out later."),
      SR ? null : el("p", { class: "why" }, "Speaking isn't available in this browser, so type instead."),
      el("p", { class: "ask small" }, "It belongs to"), worlds,
      err,
      el("div", { class: "actions" }, speakBtn, el("button", { class: "primary", onclick: () => save(ta, err) }, "Keep it")));
    quiet(true);
    if (speak && speakBtn) toggleSpeech(speakBtn, ta);
    ta.focus();
  }
  function stopSpeech() { try { recog?.stop(); } catch {} recog = null; }
  function toggleSpeech(btn, ta) {
    const label = btn.querySelector(".mic-label");
    if (recog) { stopSpeech(); btn.setAttribute("aria-pressed", "false"); label.textContent = "Speak"; return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recog = new SR(); recog.continuous = true; recog.interimResults = false;
    const base = ta.value ? `${ta.value} ` : "";
    let said = "";
    recog.onresult = (e) => { for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) said += e.results[i][0].transcript; ta.value = base + said.trim(); };
    recog.onend = () => { recog = null; btn.setAttribute("aria-pressed", "false"); label.textContent = "Speak"; };
    recog.onerror = () => announce("I couldn't hear that. You can type instead.");
    try { recog.start(); } catch { recog = null; return; }
    btn.setAttribute("aria-pressed", "true"); label.textContent = "Stop";
    announce("Listening.");
  }

  let clientKey = null, saving = false;
  async function save(ta, err) {
    const words = ta.value.trim();
    if (!words) { err.textContent = "Write or say something first."; ta.focus(); return; }
    if (saving) return;
    stopSpeech();
    saving = true; err.textContent = "";
    const w = state.draftWorld;
    try {
      if (DISTRESS.test(words) && data.sample) { showCrisis(CRISIS_TEXT.join("\n")); return; }
      let id = null;
      if (data.sample) {
        id = `local-${Date.now()}`;
        data.stars.push({ id, world: w, date: today(), excerpt: words.length > 220 ? `${words.slice(0, 217)}…` : words, themeIds: [] });
        state.suggestion = suggest(id);
        finish(data);
      } else {
        clientKey ??= (crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/[^a-z0-9]/gi, "").slice(0, 32);
        const before = new Set(data.stars.map((s) => s.id));
        const res = await call("/debrief", { method: "POST", body: JSON.stringify({ date: today(), transcript: words, world: w, clientKey }) });
        clientKey = null;
        if (res.crisis) { showCrisis(res.reply); return; }
        state.reply = res.reply;
        try { Object.assign(data, await loadConnected()); } catch {}
        id = data.stars.find((s) => !before.has(s.id))?.id ?? null;
      }
      sound.chime(988);
      refreshPlanetNames();
      sync(id);
      renderHome();
      announce(`Kept, word for word. A new star in ${META[w].name}.`);
      if (state.view !== w) goWorld(w, { open: () => (id ? showStar(id, { born: true }) : null) });
      else if (id) showStar(id, { born: true });
      else sheet.replaceChildren(worldRows(w));
    } catch (e) {
      err.textContent = e.status === 403 ? "Dawnward needs your consent before it keeps anything. Open the app to give it." : "I couldn't keep that just now. Your words are still here; try again.";
    } finally { saving = false; }
  }

  function showCrisis(text) {
    sheet.replaceChildren(el("h2", { class: "stitle", tabindex: "-1" }, "You matter more than any plan"),
      ...text.split("\n").map((l) => el("p", { class: "crisis" }, l)),
      el("div", { class: "actions" }, el("button", { class: "ghost", onclick: () => goHome() }, "Return to your galaxy")));
    focusSheet();
  }

  // Sample logic only: a plain word match inside this page, labelled as such.
  // It never decides anything; it asks.
  const STOP = new Set(["with", "that", "this", "then", "than", "about", "before", "after", "again", "just", "really", "today", "felt", "have", "were", "what", "when", "into", "there"]);
  function suggest(id) {
    const s = starById(id);
    const words = new Set(s.excerpt.toLowerCase().match(/[a-z']{4,}/g) ?? []);
    let best = null, bestHits = 0;
    for (const t of liveThemes()) {
      const pool = new Set(t.starIds.flatMap((sid) => starById(sid).excerpt.toLowerCase().match(/[a-z']{4,}/g) ?? []));
      const hits = [...words].filter((x) => pool.has(x) && !STOP.has(x));
      if (hits.length > bestHits) { best = { theme: t.id, hits }; bestHits = hits.length; }
    }
    return best ? { star: id, ...best } : { star: id, theme: null };
  }

  // ----- insight review: what you said, kept apart from what I think it means -----
  function openReview(w) {
    if (state.view !== w) { goWorld(w, { open: () => openReview(w) }); return; }
    const themes = worldThemes(w);
    const kids = [...sheetHead("Review what I understand", META[w].name),
      el("p", { class: "sub" }, "What you said comes first. What I think it means is mine, and you can correct it or set it aside.")];
    const sug = state.suggestion && starById(state.suggestion.star)?.world === w ? state.suggestion : null;
    if (sug) {
      const s = starById(sug.star);
      const t = sug.theme && themeById(sug.theme);
      if (t && !t.starIds.includes(s.id)) {
        kids.push(el("section", { class: "suggest" },
          el("p", { class: "kicker" }, "Sample logic · a word match in this page, not Dawnward's model"),
          el("p", {}, "Your new evening might support:"),
          el("p", { class: "statement" }, t.corrected ?? t.statement),
          el("p", { class: "why" }, `Because it shares ${sug.hits.map((h) => `“${h}”`).join(", ")} with the evenings behind it.`),
          el("div", { class: "actions" },
            el("button", { class: "primary", onclick: () => { t.starIds.push(s.id); finish(data); state.suggestion = null; sync(); renderHome(); announce("Linked. The line between them is new."); sound.chime(1175); openReview(w); } }, "Yes, it does"),
            el("button", { class: "ghost", onclick: () => { state.suggestion = null; announce("Left unlinked."); openReview(w); } }, "No, leave it"))));
      } else if (!t) {
        kids.push(el("section", { class: "suggest" },
          el("p", { class: "kicker" }, "Your new evening"),
          el("p", { class: "statement" }, "I don't have enough evidence to conclude anything from it yet."),
          el("p", { class: "why" }, "One evening is a note, not a pattern. If it comes up again, I'll show you what links them.")));
      }
    }
    if (!themes.length) kids.push(el("p", { class: "why" }, "I don't have enough evidence to conclude anything here yet."));
    for (const t of themes) {
      const box = el("article", { class: `review card-${t.world}` });
      const draw = () => {
        box.replaceChildren(
          el("p", { class: "kicker" }, "What you said"),
          el("ul", { class: "quotes" }, t.starIds.map(quoteOf)),
          el("p", { class: "kicker" }, `What I think it means · ${t.forming ? "Still forming" : CONFIDENCE[t.confidence] ?? ""}`),
          el("p", { class: "statement" }, t.corrected ?? t.statement),
          el("p", { class: "why gold" }, t.why),
          t.forming ? el("p", { class: "why" }, "This is a guess. I don't have enough evidence to conclude it yet.") : null,
          t.accepted ? el("p", { class: "note" }, "You said this is right.") : null,
          el("div", { class: "actions" },
            el("button", { class: "ghost", onclick: () => { t.accepted = true; announce("Kept as it is."); draw(); box.querySelector("button")?.focus(); } }, "That's right"),
            el("button", { class: "ghost", onclick: () => correct(t, box, draw) }, "Correct it"),
            el("button", { class: "danger", onclick: () => reject(t, box, draw, w) }, "That's not right")));
      };
      draw();
      kids.push(box);
    }
    kids.push(el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => goHome() }, "Return to your galaxy")));
    sheet.replaceChildren(...kids);
    if (ctx) ctx.setSelection({ litIds: new Set(themes.flatMap((t) => t.starIds)), selId: state.suggestion?.star ?? null, litThemes: new Set(themes.map((t) => t.id)) });
    focusSheet();
  }
  function correct(t, box, draw) {
    const input = el("textarea", { rows: "3", id: `fix-${t.id}` });
    input.value = t.corrected ?? t.statement;
    const err = el("p", { class: "error", role: "alert" });
    box.replaceChildren(el("label", { for: `fix-${t.id}`, class: "ask" }, "Say it the way it's true for you"), input, err,
      el("div", { class: "actions" },
        el("button", { class: "primary", onclick: async () => {
          const v = input.value.trim();
          if (!v) { err.textContent = "Write the version that's true, or cancel."; return; }
          try {
            if (!data.sample) await call(`/assertions/${t.id}/dispute`, { method: "POST", body: JSON.stringify({ correction: v }) });
            t.corrected = v; t.accepted = false; announce("Corrected. I'll use your words from now on."); draw(); renderHome();
            box.querySelector("button")?.focus();
          } catch { err.textContent = "I couldn't save the correction. Nothing changed."; }
        } }, "Save my version"),
        el("button", { class: "ghost", onclick: () => { draw(); box.querySelector("button")?.focus(); } }, "Cancel")));
    input.focus();
  }
  function reject(t, box, draw, w) {
    const err = el("p", { class: "error", role: "alert" });
    const ask = el("p", { class: "why", tabindex: "-1" }, "Set this aside? I'll stop drawing on it. Your evenings stay exactly as they are.");
    box.replaceChildren(el("p", { class: "statement" }, t.corrected ?? t.statement), ask, err,
      el("div", { class: "actions" },
        el("button", { class: "danger", onclick: async () => {
          try {
            if (!data.sample) await call(`/assertions/${t.id}/dispute`, { method: "POST", body: "{}" });
            t.rejected = true; finish(data); sync(); renderHome(); announce("Set aside. The lines it drew are gone.");
            openReview(w);
          } catch { err.textContent = "I couldn't set it aside. Nothing changed."; }
        } }, "Set it aside"),
        el("button", { class: "ghost", onclick: () => { draw(); box.querySelector("button")?.focus(); } }, "Keep it as it is")));
    ask.focus();
  }

  // ----- places from the rail -----
  function openPlace(kind) {
    if (kind === "galaxy") return goHome();
    if (kind === "text") return setMode("text");
    const w = state.view === "home" ? "mind" : state.view;
    goWorld(w, { open: () => {
      if (kind === "evenings") {
        const all = [...data.stars].reverse();
        sheet.replaceChildren(...sheetHead("Evenings", plural(all.length, "memory", "memories")),
          el("ul", { class: "memories" }, all.map((s) => el("li", {}, el("button", { class: "memory", onclick: () => { goWorld(s.world, { open: () => showStar(s.id) }); } },
            el("span", { class: "when" }, `${META[s.world].name} · ${longDate(s.date)}`), el("span", { class: "text" }, s.excerpt))))));
      } else if (kind === "insights") {
        sheet.replaceChildren(...sheetHead("Insights", "What I understand about you"),
          el("p", { class: "sub" }, "Each one shows the evenings it came from. Open one to correct it."),
          el("div", { class: "cards" }, liveThemes().map((t) => el("button", { class: "cardbtn", onclick: () => goWorld(t.world, { open: () => openInsight(t.id) }) }, insightCard(t)))),
          liveThemes().length < 4 ? el("p", { class: "why" }, "I don't have enough evidence to say more yet.") : null);
      } else if (kind === "tomorrow") {
        sheet.replaceChildren(...sheetHead("Tomorrow's three steps", data.steps ? "Sample" : "Made each morning"),
          data.steps
            ? el("ol", { class: "steps" }, data.steps.map((st) => { const s = starById(st.from); return el("li", {}, el("span", { class: "mt" }, st.text), el("span", { class: "why" }, `From ${longDate(s.date)}: “${s.excerpt}”`)); }))
            : el("p", { class: "why" }, "Your three steps are drawn from last night's words each morning, in the app."),
          data.steps ? el("p", { class: "why" }, "Sample: written by hand for this preview, to show how each step points back to an evening.") : null);
      } else if (kind === "privacy") {
        sheet.replaceChildren(...sheetHead("Private. Never sold.", "Your words"),
          el("ul", { class: "facts" },
            el("li", {}, "Every evening is kept word for word. Nothing is rewritten."),
            el("li", {}, "You can leave any evening out, and everything it supported is worked out again without it."),
            el("li", {}, "You can pause learning. Evenings are still kept, and none of them are learned from."),
            el("li", {}, "You can export everything, or delete it."),
            el("li", {}, data.sample ? "This page is a sample: nothing you type here leaves it." : "This page talks only to Dawnward's own server.")));
      }
      focusSheet();
    } });
  }
  document.querySelectorAll("[data-place]").forEach((b) => b.addEventListener("click", () => {
    if (b.closest("#menu-pop")) { $("menu-pop").hidden = true; $("menu").setAttribute("aria-expanded", "false"); state.opener = $("menu"); } else state.opener = b;
    openPlace(b.dataset.place);
  }));

  // ----- navigation -----
  function setView(v) {
    state.view = v;
    document.body.dataset.view = v === "home" ? "home" : "world";
    document.querySelectorAll("#dots button").forEach((b) => b.toggleAttribute("aria-current", b.dataset.view === v));
    document.querySelectorAll("#rail button").forEach((b) => b.toggleAttribute("aria-current", v === "home" && b.dataset.place === "galaxy"));
  }
  function goWorld(w, { open } = {}) {
    stopSpeech();
    const arriving = state.view !== w;
    setView(w); state.lastWorld = w; state.selStar = null;
    showWorld(w);
    $("world").hidden = false;
    document.body.classList.add("in-world");
    if (open) open(); else $("w-title").focus();
    highlight();
    if (arriving) {
      document.body.classList.remove("closeup-on");
      const reveal = () => { if (state.view === w) document.body.classList.add("closeup-on"); };
      if (ctx && state.mode === "galaxy") ctx.focusWorld(w, reveal); else reveal();
      announce(`${META[w].name}. ${plural(worldStars(w).length, "memory", "memories")}.`);
    }
  }
  function goHome({ show = null } = {}) {
    if (show instanceof Event) show = null;
    stopSpeech(); quiet(false);
    const from = state.lastWorld;
    setView("home"); state.selStar = show;
    document.body.classList.remove("closeup-on", "in-world", "sheet-open");
    $("world").hidden = true;
    if (ctx && state.mode === "galaxy") ctx.focusWorld(null);
    renderHome(); highlight();
    announce(show ? "Your galaxy. Your new star is the one shining brightest." : "Your galaxy.");
    const target = state.opener && document.contains(state.opener) && !state.opener.closest("#world") ? state.opener : from ? labels.get(from) : null;
    state.opener = null;
    target?.focus();
  }
  $("w-back").addEventListener("click", () => goHome());
  $("dots").append(...["home", ...ORDER].map((v) => el("button", { "data-view": v, "aria-label": v === "home" ? "Galaxy home" : META[v].name, onclick: () => (v === "home" ? goHome() : goWorld(v)) })));
  $("q-reflect").addEventListener("click", () => openCapture(state.view === "home" ? "mind" : state.view));
  $("q-insight").addEventListener("click", () => { const t = liveThemes().find((x) => x.forming) ?? liveThemes()[0]; if (t) goWorld(t.world, { open: () => openInsight(t.id) }); });
  $("q-next").addEventListener("click", () => openPlace("tomorrow"));
  $("star").addEventListener("click", () => openCapture(state.view === "home" ? "mind" : state.view, { speak: true }));
  $("brand").addEventListener("click", (e) => { e.preventDefault(); goHome(); });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!$("menu-pop").hidden) return closeMenu();
    if (!$("search-pop").hidden) return closeSearch();
    if (state.mode === "text") return;
    if (state.view !== "home") goHome();
  });
  // Tapping a planet in the picture does what its button does.
  if (ctx) {
    let down = null;
    ctx.renderer.domElement.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
    ctx.renderer.domElement.addEventListener("click", (e) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6 || state.view !== "home") return;
      const k = ctx.pickWorld({ x: (e.clientX / innerWidth) * 2 - 1, y: -(e.clientY / innerHeight) * 2 + 1 });
      if (k) goWorld(k);
    });
  }

  // ----- search -----
  function closeSearch() { $("search-pop").hidden = true; $("search").setAttribute("aria-expanded", "false"); $("search").focus(); }
  $("search").addEventListener("click", () => {
    if (!$("search-pop").hidden) return closeSearch();
    $("search-pop").hidden = false; $("search").setAttribute("aria-expanded", "true"); $("q").focus(); runSearch();
  });
  function runSearch() {
    const q = $("q").value.trim().toLowerCase();
    const hits = q ? data.stars.filter((s) => s.excerpt.toLowerCase().includes(q)).slice(-8).reverse() : [];
    $("hits").replaceChildren(...hits.map((s) => el("li", {}, el("button", { onclick: () => { $("search-pop").hidden = true; $("search").setAttribute("aria-expanded", "false"); goWorld(s.world, { open: () => showStar(s.id) }); } },
      el("span", { class: "when" }, `${META[s.world].name} · ${shortDate(s.date)}`), el("span", { class: "text" }, s.excerpt)))));
    $("hits-n").textContent = q ? (hits.length ? plural(hits.length, "memory", "memories") : "Nothing matches that.") : "Search the words of every evening.";
  }
  $("q").addEventListener("input", runSearch);

  // ----- menu -----
  function closeMenu() { $("menu-pop").hidden = true; $("menu").setAttribute("aria-expanded", "false"); $("menu").focus(); }
  $("menu").addEventListener("click", () => {
    const open = $("menu-pop").hidden;
    $("menu-pop").hidden = !open; $("menu").setAttribute("aria-expanded", String(open));
    if (open) $("menu-pop").querySelector("a,button")?.focus();
  });
  $("replay").addEventListener("click", () => { try { localStorage.removeItem("dw-home-seen"); } catch {} location.reload(); });

  // ----- Galaxy / Text / Sound -----
  function setMode(m) {
    state.mode = m;
    document.body.dataset.mode = m;
    $("m-galaxy").setAttribute("aria-checked", String(m === "galaxy"));
    $("m-text").setAttribute("aria-checked", String(m === "text"));
    $("text").hidden = m !== "text";
    if (m === "text") { renderText(); $("text").querySelector("h2")?.focus(); }
    else { if (ctx) ctx.focusWorld(state.view === "home" ? null : state.view); renderHome(); }
    try { localStorage.setItem("dw-home-mode", m); } catch {}
  }
  $("m-galaxy").addEventListener("click", () => setMode("galaxy"));
  $("m-text").addEventListener("click", () => setMode("text"));
  const soundBtns = [$("sound"), $("sound-m")];
  const toggleSound = () => {
    if (sound.on) sound.stop(); else sound.start();
    for (const b of soundBtns) { b.setAttribute("aria-pressed", String(sound.on)); b.textContent = sound.on ? "Sound on" : "Sound off"; }
  };
  soundBtns.forEach((b) => b.addEventListener("click", toggleSound));

  // Text view: the whole universe as one plain, complete document.
  function renderText() {
    const box = $("text-body");
    box.replaceChildren(
      el("p", { class: "sub" }, "Everything the galaxy shows, in reading order. Nothing here is a picture of words."),
      el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => { setMode("galaxy"); openCapture("mind"); } }, "Add a memory")),
      ...ORDER.map((w) => el("section", { "aria-labelledby": `tx-${w}` },
        el("h3", { id: `tx-${w}` }, el("span", { class: `tchip tchip-${w}`, html: svg(ICON[w], 16) }), ` ${META[w].name}`),
        el("p", { class: "sub" }, META[w].line),
        w === "future" && data.goal ? el("p", { class: "why" }, `Destination: ${data.goal.title}. ${data.goal.milestones.filter((m) => m.evidence).length} of ${data.goal.milestones.length} milestones reached, each from your words.`) : null,
        worldThemes(w).length
          ? el("div", { class: "cards" }, worldThemes(w).map((t) => el("div", {}, insightCard(t), el("ul", { class: "quotes" }, t.starIds.map(quoteOf)))))
          : el("p", { class: "why" }, "I don't have enough evidence to conclude anything here yet."),
        el("h4", {}, `Memories in ${META[w].name}`),
        el("ul", { class: "memories" }, [...worldStars(w)].reverse().map((s) => el("li", { class: "memory" }, el("span", { class: "when" }, longDate(s.date)), el("span", { class: "text" }, s.excerpt)))))));
  }

  // ----- the entrance: a point of light opens into the galaxy -----
  function entrance() {
    let seen = false;
    try { seen = localStorage.getItem("dw-home-seen") === "1"; } catch {}
    const ov = $("entrance");
    if (reduced || seen || !ctx || state.mode === "text") { ov.hidden = true; ctx?.skipIntro(); document.body.classList.add("arrived"); return; }
    ov.hidden = false;
    const done = () => {
      if (ov.classList.contains("out")) return;
      ov.classList.add("out"); ctx.skipIntro();
      document.body.classList.add("arrived");
      setTimeout(() => (ov.hidden = true), 600);
      try { localStorage.setItem("dw-home-seen", "1"); } catch {}
    };
    $("skip").addEventListener("click", () => { done(); $("brand").focus(); }, { once: true });
    setTimeout(done, 3000);
  }

  // ----- layout and the frame loop -----
  function layout() {
    document.documentElement.style.setProperty("--dock-h", `${Math.round($("home-ui").getBoundingClientRect().height)}px`);
    if (!ctx) return;
    ctx.resize(innerWidth, innerHeight);
    // Fit the four worlds into the space the panels leave free.
    const W = innerWidth, H = innerHeight, wide = W >= 1000;
    const r = (id) => $(id).getBoundingClientRect();
    const frame = wide
      ? { left: r("home-ui").right + 10, right: r("rail").left - 10, top: r("brand").bottom - 10, bottom: r("dock").top - 70 }
: { left: 0, right: W, top: Math.max(r("brand").bottom, $("notice").hidden ? 0 : r("notice").bottom) + 26, bottom: r("home-ui").top - 34 };
    ctx.setFrame(frame, wide ? 0.82 : 0.74);
  }
  addEventListener("resize", layout);

  const frames = (window.__dwFrames = []);
  let last = performance.now();
  function place() {
    const W = innerWidth, H = innerHeight;
    for (const w of ORDER) {
      const p = ctx.project(w, W, H), a = arcs.get(w), b = labels.get(w);
      const r = Math.max(20, p.r);
      const ra = r + 7;                       // the name sits just outside the rim
      const fs = parseFloat(getComputedStyle(a.svg).getPropertyValue("--words")) || 12;
      const rb = r + 6 + fs * 0.75;           // the words hang just outside the lower rim
      const S = Math.ceil(2 * (rb + 26));
      const c = S / 2;
      const key = `${Math.round(r)}|${S}`;
      if (key !== a.last) {
        a.last = key;
        a.svg.setAttribute("width", S); a.svg.setAttribute("height", S); a.svg.setAttribute("viewBox", `0 0 ${S} ${S}`);
        a.top.setAttribute("d", `M ${c - ra} ${c} A ${ra} ${ra} 0 0 1 ${c + ra} ${c}`);
        a.bot.setAttribute("d", `M ${c - rb} ${c} A ${rb} ${rb} 0 0 0 ${c + rb} ${c}`);
        // the words only appear where they fit comfortably along the arc
        // phones keep just the name and Explore: less to read, nothing crowded
        a.fits = W >= 1000 && a.words.getComputedTextLength() <= a.bot.getTotalLength() * 0.82;
        a.words.style.display = a.fits ? "" : "none";
      }
      a.svg.style.transform = `translate(${Math.round(p.x - c)}px, ${Math.round(p.y - c)}px)`;
      a.svg.style.visibility = p.visible ? "visible" : "hidden";
      const below = p.y + (a.fits ? rb + 10 : r + 12);
      const half = (b.offsetWidth || 120) / 2 + 6;
      const x = Math.min(W - half, Math.max(half, p.x));
      b.style.transform = `translate(${Math.round(x)}px, ${Math.round(below)}px) translateX(-50%)`;
      b.style.visibility = p.visible ? "visible" : "hidden";
    }
  }

  let mode = "galaxy";
  try { mode = localStorage.getItem("dw-home-mode") === "text" ? "text" : "galaxy"; } catch {}
  if (!ctx) mode = "text";
  setView("home");
  renderHome();
  setMode(mode);
  layout();
  if (ctx) {
    let rendered = 0;
    ctx.renderer.setAnimationLoop((now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      const gap = now - last; last = now;
      if (state.mode === "text") return; // nothing is drawn behind the text view
      // Inside a world the painting covers the galaxy: stop drawing it (battery).
      if (document.body.classList.contains("closeup-on")) return;
      // The governor counts only frames actually drawn: every 120, if the median
      // runs past 28 ms it drops the glow, the pixel ratio and half the dust.
      frames.push(gap);
      if (frames.length > 600) frames.shift();
      if (++rendered % 120 === 0 && ctx.bloomOn) {
        const recent = frames.slice(-100).sort((a, b) => a - b);
        if (recent[50] > 28) { ctx.degrade(); window.__dwDegraded = true; }
      }
      ctx.frame(dt);
      place();
    });
  }
  entrance();
  window.__dwHome = { state, data };
  window.__dwHomeReady = true;
}

loadData()
  .then((d) => main(d, false))
  .catch(() => main(sampleData(), true));
