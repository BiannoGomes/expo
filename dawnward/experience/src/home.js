// Galaxy Home: the vertical slice of the Living Intelligence Universe.
// Galaxy Home → a world → capture → save → a new memory star → insight
// review → home. Every word a person reads is HTML; the 3D scene is the
// setting, never the text. Without a token it runs on a clearly labelled
// sample that lives in this page only. With a token it reads and writes the
// real Dawnward API (/galaxy, /debrief, /assertions/:id/dispute, /campaign).
import { buildHome, WORLDS } from "./home-scene.js";

const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ORDER = ["mind", "body", "soul", "future"];
const META = {
  mind: { name: "Mind", line: "How you think, plan and make things.", ask: "What went on in your head today?" },
  body: { name: "Body", line: "Movement, rest, energy and the outdoors.", ask: "How did your body feel today?" },
  soul: { name: "Soul", line: "People, meaning and how you felt.", ask: "Who or what mattered today?" },
  future: { name: "Future", line: "Where you are heading, and the steps that got you closer.", ask: "What moved you closer to where you're going?" },
};
const CONFIDENCE = { hypothesis: "A guess", probable: "Probably true", established: "Well established" };
const ICON = {
  mind: '<path d="M12 3v2M5.6 5.6l1.4 1.4M3 12h2M18.4 5.6 17 7M21 12h-2"/><path d="M9 18h6M10 21h4"/><path d="M8.5 15a5 5 0 1 1 7 0c-.8.7-1 1.4-1 2.5h-5c0-1.1-.2-1.8-1-2.5Z"/>',
  body: '<path d="M3 12h4l2.5-5 4 10 2.5-5h5"/>',
  soul: '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"/>',
  future: '<path d="M12 3 4 21l8-4 8 4-8-18Z"/>',
};
const icon = (k, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

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
  return finish({ stars, themes, goal, sample: true });
}

/** Fills in what the screen shows from what the data holds, so counts always match. */
function finish(data) {
  const byId = new Map(data.stars.map((s) => [s.id, s]));
  for (const s of data.stars) s.themeIds = [];
  for (const t of data.themes) {
    t.starIds = t.starIds.filter((id) => byId.has(id) && !data.setAside?.has?.(id));
    for (const id of t.starIds) byId.get(id).themeIds.push(t.id);
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
  const res = await fetch(`${api}${path}`, { ...init, headers: { authorization: `Bearer ${token}`, ...(init.body ? { "content-type": "application/json" } : {}) } });
  if (!res.ok) { const e = new Error(`${path} ${res.status}`); e.status = res.status; throw e; }
  return res.json();
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
  const list = [...stars.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
  return finish({ stars: list, themes: [...themes.values()], goal, sample: false });
}

async function loadData() {
  const params = new URLSearchParams(location.hash.slice(1));
  token = params.get("token");
  if (!token) return sampleData();
  history.replaceState(null, "", location.pathname + location.search);
  api = trustedApi(new URLSearchParams(location.search).get("api"));
  if (!api) throw new Error("untrusted api origin");
  return loadConnected();
}

// Sample mode keeps nothing and calls nothing, so it cannot run Dawnward's
// safety triage. It still never answers words like these with a plan.
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
  chime(freq = 880) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = "sine"; o.frequency.value = freq; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.08, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 1.7);
  },
};

// ---------- The page ----------

function main(data, failed) {
  const state = { view: "home", mode: "galaxy", panel: "insights", lastWorld: null, selStar: null, review: null, suggestion: null, draftWorld: "mind" };
  const announce = (msg) => { const live = $("live"); live.textContent = ""; setTimeout(() => (live.textContent = msg), 30); };
  const starById = (id) => data.stars.find((s) => s.id === id);
  const themeById = (id) => data.themes.find((t) => t.id === id);
  const worldStars = (w) => data.stars.filter((s) => s.world === w);
  const worldThemes = (w) => data.themes.filter((t) => t.world === w && t.starIds.length && !t.rejected);

  $("source").textContent = failed
    ? "I couldn't load your universe, so this is a sample. Invented evenings, not anyone's."
    : data.sample ? "Sample universe. Invented evenings, not anyone's. Nothing you type leaves this page." : "Your universe, from your own evenings.";
  document.body.classList.toggle("is-sample", data.sample);

  // ----- 3D -----
  let ctx = null;
  try { ctx = buildHome({ stage: $("stage"), reduced, hash }); } catch { ctx = null; }
  if (!ctx) { document.body.classList.add("no-webgl"); }
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

  // ----- planet buttons, placed over the planets each frame -----
  const labels = new Map();
  for (const w of ORDER) {
    const b = el("button", { class: `planet planet-${w}`, "data-world": w, "aria-label": `${META[w].name}: ${plural(worldStars(w).length, "memory", "memories")}`, onclick: () => goWorld(w) },
      el("span", { class: "chip", html: icon(w, 16) }), el("span", { class: "pname" }, META[w].name));
    $("planets").append(b);
    labels.set(w, b);
  }
  const refreshPlanetNames = () => { for (const w of ORDER) labels.get(w).setAttribute("aria-label", `${META[w].name}: ${plural(worldStars(w).length, "memory", "memories")}`); };

  // ----- panel rendering -----
  const panel = $("panel");
  function heading(text, kicker) {
    const h = el("h2", { class: "ptitle", tabindex: "-1" }, text);
    return [kicker ? el("p", { class: "kicker" }, kicker) : null, h];
  }
  function quoteOf(id) {
    const s = starById(id);
    return el("li", { class: "quote" }, el("span", { class: "when" }, `${META[s.world].name} · ${longDate(s.date)}`), el("q", {}, s.excerpt));
  }
  function insightCard(t, { compact = false } = {}) {
    const kicker = `${META[t.world].name} · ${t.forming ? "Still forming" : CONFIDENCE[t.confidence] ?? "Probably true"}`;
    const card = el("article", { class: `card card-${t.world}` },
      el("p", { class: "kicker" }, kicker),
      el("p", { class: "statement" }, t.corrected ?? t.statement),
      el("p", { class: "why" }, t.why));
    if (t.accepted) card.append(el("p", { class: "note" }, "You said this is right."));
    if (t.corrected) card.append(el("p", { class: "note" }, "In your words, after you corrected it."));
    if (!compact) card.append(el("details", {}, el("summary", {}, "The evenings behind it"), el("ul", { class: "quotes" }, t.starIds.map(quoteOf))));
    return card;
  }

  function renderHome() {
    const top = data.themes.filter((t) => t.starIds.length && !t.rejected).sort((a, b) => b.starIds.length - a.starIds.length).slice(0, 3);
    panel.replaceChildren(
      ...heading("What I understand about you"),
      el("p", { class: "sub" }, data.stars.length ? `From ${plural(data.stars.length, "evening", "evenings")} you shared. Each line says where it came from.` : "Nothing yet. Each evening you share becomes a star here."),
      el("div", { class: "cards" }, top.map((t) => insightCard(t, { compact: true }))),
      top.length < 3 && data.stars.length ? el("p", { class: "why" }, "I don't have enough evidence to say more yet.") : null,
      top.length ? el("button", { class: "primary", onclick: () => goWorld(top[0].world, { review: true }) }, "Explore this memory") : el("button", { class: "primary", onclick: () => openCapture("mind") }, "Add your first memory"),
    );
  }

  function renderWorld(w) {
    const stars = worldStars(w), themes = worldThemes(w);
    const kids = [
      ...heading(META[w].name, `World ${ORDER.indexOf(w) + 1} of 4`),
      el("p", { class: "sub" }, META[w].line),
    ];
    if (w === "future" && data.goal) kids.push(goalBlock(data.goal));
    kids.push(el("h3", {}, "What I understand here"));
    if (themes.length) kids.push(el("div", { class: "cards" }, themes.map((t) => insightCard(t))));
    else kids.push(el("p", { class: "why" }, "I don't have enough evidence to conclude anything here yet."));
    kids.push(el("div", { class: "row" },
      el("button", { class: "primary", onclick: () => openCapture(w) }, `Add to ${META[w].name}`),
      themes.length ? el("button", { class: "ghost", onclick: () => openReview(w) }, "Review what I understand") : null));
    kids.push(el("h3", {}, `Memories in ${META[w].name}`));
    kids.push(stars.length
      ? el("ul", { class: "memories" }, [...stars].reverse().map((s) => el("li", {}, el("button", { class: "memory", "aria-pressed": String(state.selStar === s.id), onclick: () => showStar(s.id) },
          el("span", { class: "when" }, longDate(s.date)), el("span", { class: "text" }, s.excerpt)))))
      : el("p", { class: "why" }, "No memories here yet."));
    kids.push(el("button", { class: "ghost back", onclick: goHome }, "Return to your galaxy"));
    panel.replaceChildren(...kids);
  }

  function goalBlock(goal) {
    const reached = goal.milestones.filter((m) => m.evidence).length;
    return el("section", { class: "goal", "aria-label": "Destination" },
      el("p", { class: "kicker" }, "Destination"),
      el("p", { class: "statement" }, goal.title),
      el("ol", { class: "milestones" }, goal.milestones.map((m) => {
        const s = m.evidence && starById(m.evidence);
        return el("li", { class: s ? "done" : "" },
          el("span", { class: "mt" }, m.title),
          el("span", { class: "why" }, s ? `Reached. You said so on ${longDate(s.date)}: “${s.excerpt}”` : goal.planned ? `Planned for day ${m.day}. Marked only when an evening says it happened.` : "Not yet. It's marked when an evening says it happened."));
      })),
      el("p", { class: "why" }, `${reached} of ${goal.milestones.length} reached, each from your own words.`));
  }

  function showStar(id, { born = false } = {}) {
    const s = starById(id);
    state.selStar = id; state.panel = "star";
    const themes = s.themeIds.map(themeById).filter(Boolean);
    panel.replaceChildren(
      ...heading(born ? "A new star" : "Memory", `${META[s.world].name} · ${longDate(s.date)}`),
      el("blockquote", { class: "said" }, el("p", {}, s.excerpt)),
      el("p", { class: "why" }, born
        ? (data.sample ? "Kept in this page only. Word for word, nothing sent anywhere." : "Kept, word for word.")
        : "Your words, as you said them."),
      themes.length
        ? el("div", {}, el("h3", {}, "It supports"), el("div", { class: "cards" }, themes.map((t) => insightCard(t, { compact: true }))))
        : el("p", { class: "why" }, "Not linked to anything yet. That takes more than one evening."),
      el("div", { class: "row" },
        el("button", { class: "primary", onclick: () => openReview(s.world) }, "Review what I understand"),
        el("button", { class: "ghost", onclick: () => goWorld(s.world) }, `Back to ${META[s.world].name}`)),
    );
    highlight();
    panel.querySelector(".ptitle").focus();
  }

  // ----- capture -----
  let recog = null;
  function openCapture(w, { speak = false } = {}) {
    state.draftWorld = w ?? (state.view !== "home" ? state.view : "mind");
    state.panel = "capture";
    if (state.view !== state.draftWorld && ctx && state.mode === "galaxy") { state.view = state.draftWorld; ctx.focusWorld(state.view); setDots(); }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const ta = el("textarea", { id: "words", rows: "5", maxlength: "20000", "aria-describedby": "cap-help" });
    const err = el("p", { class: "error", role: "alert" });
    const worlds = el("div", { class: "seg small", role: "radiogroup", "aria-label": "Which world" },
      ORDER.map((k) => el("button", { role: "radio", "aria-checked": String(k === state.draftWorld), onclick: (e) => {
        state.draftWorld = k;
        worlds.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b === e.currentTarget)));
        $("cap-q").textContent = META[k].ask;
        if (ctx && state.mode === "galaxy") { state.view = k; ctx.focusWorld(k); setDots(); highlight(); }
      } }, META[k].name)));
    const speakBtn = SR ? el("button", { class: "ghost", "aria-pressed": "false", onclick: () => toggleSpeech(speakBtn, ta) }, "Speak instead") : null;
    panel.replaceChildren(
      ...heading("Add a memory", "Speak or type"),
      el("label", { for: "words", id: "cap-q", class: "ask" }, META[state.draftWorld].ask),
      worlds,
      ta,
      el("p", { id: "cap-help", class: "why" }, data.sample
        ? "Sample: this stays in this page and disappears when you close it."
        : "Kept word for word. You can leave any evening out later."),
      SR ? null : el("p", { class: "why" }, "Speaking isn't available in this browser, so type instead."),
      err,
      el("div", { class: "row" },
        el("button", { class: "primary", onclick: () => save(ta, err) }, "Keep it"),
        speakBtn,
        el("button", { class: "ghost", onclick: () => { stopSpeech(); state.view === "home" ? renderHome() : goWorld(state.view); } }, "Cancel")),
    );
    if (speak && speakBtn) toggleSpeech(speakBtn, ta);
    ta.focus();
  }
  function stopSpeech() { try { recog?.stop(); } catch {} recog = null; }
  function toggleSpeech(btn, ta) {
    if (recog) { stopSpeech(); btn.setAttribute("aria-pressed", "false"); btn.textContent = "Speak instead"; return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recog = new SR(); recog.continuous = true; recog.interimResults = false;
    const base = ta.value ? `${ta.value} ` : "";
    let said = "";
    recog.onresult = (e) => { for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) said += e.results[i][0].transcript; ta.value = base + said.trim(); };
    recog.onend = () => { recog = null; btn.setAttribute("aria-pressed", "false"); btn.textContent = "Speak instead"; };
    recog.onerror = () => announce("I couldn't hear that. You can type instead.");
    recog.start();
    btn.setAttribute("aria-pressed", "true"); btn.textContent = "Stop listening";
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
      let id;
      if (data.sample) {
        id = `local-${Date.now()}`;
        data.stars.push({ id, world: w, date: today(), excerpt: words.length > 220 ? `${words.slice(0, 217)}…` : words, themeIds: [], local: true });
        state.suggestion = suggest(id);
        finish(data);
      } else {
        clientKey ??= (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/-/g, "").slice(0, 32);
        const before = new Set(data.stars.map((s) => s.id));
        const res = await call("/debrief", { method: "POST", body: JSON.stringify({ date: today(), transcript: words, world: w, clientKey }) });
        clientKey = null;
        if (res.crisis) { showCrisis(res.reply); return; }
        Object.assign(data, await loadConnected());
        id = data.stars.find((s) => !before.has(s.id))?.id ?? null;
        state.reply = res.reply;
      }
      sound.chime(988);
      refreshPlanetNames();
      sync(id);
      announce(`Kept, word for word. A new star in ${META[w].name}.`);
      if (id) showStar(id, { born: true });
      else goWorld(w);
    } catch (e) {
      err.textContent = e.status === 403 ? "Dawnward needs your consent before it keeps anything. Open the app to give it." : "I couldn't keep that just now. Your words are still here; try again.";
    } finally { saving = false; }
  }

  function showCrisis(text) {
    panel.replaceChildren(...heading("You matter more than any plan"), ...text.split("\n").map((l) => el("p", { class: "crisis" }, l)),
      el("button", { class: "ghost", onclick: goHome }, "Return to your galaxy"));
    panel.querySelector(".ptitle").focus();
  }

  // Sample logic only: a plain word match inside this page, labelled as such.
  // It never decides anything; it asks.
  function suggest(id) {
    const s = starById(id);
    const words = new Set(s.excerpt.toLowerCase().match(/[a-z']{4,}/g) ?? []);
    let best = null, bestHits = 0;
    for (const t of data.themes) {
      if (t.rejected) continue;
      const pool = new Set(t.starIds.flatMap((sid) => starById(sid).excerpt.toLowerCase().match(/[a-z']{4,}/g) ?? []));
      const hits = [...words].filter((x) => pool.has(x) && !["with", "that", "this", "then", "than", "about", "before", "after", "again"].includes(x));
      if (hits.length > bestHits) { best = { theme: t.id, hits }; bestHits = hits.length; }
    }
    return best ? { star: id, ...best } : { star: id, theme: null };
  }

  // ----- insight review: what you said, kept apart from what I think it means -----
  function openReview(w) {
    state.panel = "review";
    const themes = worldThemes(w);
    const kids = [...heading("Review what I understand", META[w].name),
      el("p", { class: "sub" }, "What you said is on the left of each pair. What I think it means is mine, and you can correct it.")];
    const sug = state.suggestion && starById(state.suggestion.star)?.world === w ? state.suggestion : null;
    if (sug) {
      const s = starById(sug.star);
      if (sug.theme && themeById(sug.theme) && !themeById(sug.theme).starIds.includes(s.id)) {
        const t = themeById(sug.theme);
        kids.push(el("section", { class: "suggest" },
          el("p", { class: "kicker" }, "Sample logic · a word match in this page, not Dawnward's model"),
          el("p", {}, "Your new evening might support:"),
          el("p", { class: "statement" }, t.corrected ?? t.statement),
          el("p", { class: "why" }, `Because it shares ${sug.hits.map((h) => `“${h}”`).join(", ")} with the evenings behind it.`),
          el("div", { class: "row" },
            el("button", { class: "primary", onclick: () => { t.starIds.push(s.id); finish(data); state.suggestion = null; sync(); announce("Linked. The line between them is new."); sound.chime(1175); openReview(w); } }, "Yes, it does"),
            el("button", { class: "ghost", onclick: () => { state.suggestion = null; announce("Left unlinked."); openReview(w); } }, "No, leave it"))));
      } else if (!sug.theme) {
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
          el("div", { class: "pair" },
            el("div", {}, el("p", { class: "kicker" }, "What you said"), el("ul", { class: "quotes" }, t.starIds.map(quoteOf))),
            el("div", {}, el("p", { class: "kicker" }, `What I think it means · ${t.forming ? "Still forming" : CONFIDENCE[t.confidence] ?? ""}`),
              el("p", { class: "statement" }, t.corrected ?? t.statement), el("p", { class: "why" }, t.why),
              t.forming ? el("p", { class: "why" }, "This is a guess. I don't have enough evidence to conclude it yet.") : null)),
          t.accepted ? el("p", { class: "note" }, "You said this is right.") : null,
          el("div", { class: "row" },
            el("button", { class: "ghost", onclick: () => { t.accepted = true; announce("Kept as it is."); draw(); } }, "That's right"),
            el("button", { class: "ghost", onclick: () => correct(t, box, draw) }, "Correct it"),
            el("button", { class: "danger", onclick: () => reject(t, box, draw, w) }, "That's not right")));
      };
      draw();
      kids.push(box);
    }
    kids.push(el("div", { class: "row" },
      el("button", { class: "primary", onclick: goHome }, "Return to your galaxy"),
      el("button", { class: "ghost", onclick: () => goWorld(w) }, `Back to ${META[w].name}`)));
    panel.replaceChildren(...kids);
    panel.querySelector(".ptitle").focus();
  }
  function correct(t, box, draw) {
    const input = el("textarea", { rows: "3", id: `fix-${t.id}` });
    input.value = t.corrected ?? t.statement;
    const err = el("p", { class: "error", role: "alert" });
    box.replaceChildren(el("label", { for: `fix-${t.id}`, class: "ask" }, "Say it the way it's true for you"), input, err,
      el("div", { class: "row" },
        el("button", { class: "primary", onclick: async () => {
          const v = input.value.trim();
          if (!v) { err.textContent = "Write the version that's true, or cancel."; return; }
          try {
            if (!data.sample) await call(`/assertions/${t.id}/dispute`, { method: "POST", body: JSON.stringify({ correction: v }) });
            t.corrected = v; t.accepted = false; announce("Corrected. I'll use your words from now on."); draw();
            box.querySelector("button")?.focus();
          } catch { err.textContent = "I couldn't save the correction. Nothing changed."; }
        } }, "Save my version"),
        el("button", { class: "ghost", onclick: () => { draw(); box.querySelector("button")?.focus(); } }, "Cancel")));
    input.focus();
  }
  function reject(t, box, draw, w) {
    const err = el("p", { class: "error", role: "alert" });
    box.replaceChildren(el("p", { class: "statement" }, t.corrected ?? t.statement),
      el("p", { class: "why", tabindex: "-1", id: `ask-${t.id}` }, "Set this aside? I'll stop drawing on it. Your evenings stay exactly as they are."), err,
      el("div", { class: "row" },
        el("button", { class: "danger", onclick: async () => {
          try {
            if (!data.sample) await call(`/assertions/${t.id}/dispute`, { method: "POST", body: "{}" });
            t.rejected = true; finish(data); sync(); announce("Set aside. The lines it drew are gone.");
            openReview(w);
          } catch { err.textContent = "I couldn't set it aside. Nothing changed."; }
        } }, "Set it aside"),
        el("button", { class: "ghost", onclick: () => { draw(); box.querySelector("button")?.focus(); } }, "Keep it as it is")));
    box.querySelector("#ask-" + CSS.escape(`${t.id}`)).focus();
  }

  // ----- navigation -----
  function setDots() {
    document.querySelectorAll("#dots button").forEach((b) => b.toggleAttribute("aria-current", b.dataset.view === state.view));
    document.querySelectorAll(".planet").forEach((b) => b.classList.toggle("on", b.dataset.world === state.view));
    document.body.dataset.view = state.view;
  }
  function goWorld(w, { review = false } = {}) {
    stopSpeech();
    state.view = w; state.lastWorld = w; state.panel = "world"; state.selStar = null;
    setDots();
    if (ctx && state.mode === "galaxy") ctx.focusWorld(w);
    if (review) openReview(w); else { renderWorld(w); panel.querySelector(".ptitle").focus(); }
    highlight();
    announce(`${META[w].name}. ${plural(worldStars(w).length, "memory", "memories")}.`);
  }
  function goHome() {
    stopSpeech();
    const from = state.lastWorld;
    state.view = "home"; state.panel = "insights"; state.selStar = null;
    setDots();
    if (ctx && state.mode === "galaxy") ctx.focusWorld(null);
    renderHome(); highlight();
    announce("Your galaxy.");
    (from && state.mode === "galaxy" ? labels.get(from) : panel.querySelector(".ptitle"))?.focus();
  }
  $("dots").append(...["home", ...ORDER].map((v) => el("button", { "data-view": v, "aria-label": v === "home" ? "Galaxy home" : META[v].name, onclick: () => (v === "home" ? goHome() : goWorld(v)) })));
  $("explore").addEventListener("click", () => {
    const i = ORDER.indexOf(state.view);
    goWorld(ORDER[(i + 1) % ORDER.length]);
  });
  $("add").addEventListener("click", () => openCapture(state.view === "home" ? "mind" : state.view));
  $("star").addEventListener("click", () => openCapture(state.view === "home" ? "mind" : state.view, { speak: true }));
  $("orbit").addEventListener("click", goHome);
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !e.defaultPrevented) {
      if ($("menu-pop").hidden === false) { closeMenu(); return; }
      if ($("search-pop").hidden === false) { closeSearch(); return; }
      if (state.view !== "home") goHome();
    }
  });

  // ----- search -----
  function closeSearch() { $("search-pop").hidden = true; $("search").setAttribute("aria-expanded", "false"); $("search").focus(); }
  $("search").addEventListener("click", () => {
    const open = $("search-pop").hidden;
    if (!open) return closeSearch();
    $("search-pop").hidden = false; $("search").setAttribute("aria-expanded", "true"); $("q").focus(); runSearch();
  });
  function runSearch() {
    const q = $("q").value.trim().toLowerCase();
    const hits = q ? data.stars.filter((s) => s.excerpt.toLowerCase().includes(q)).slice(-8).reverse() : [];
    $("hits").replaceChildren(...hits.map((s) => el("li", {}, el("button", { onclick: () => { $("search-pop").hidden = true; $("search").setAttribute("aria-expanded", "false"); goWorld(s.world); showStar(s.id); } },
      el("span", { class: "when" }, `${META[s.world].name} · ${shortDate(s.date)}`), el("span", { class: "text" }, s.excerpt)))));
    $("hits-n").textContent = q ? (hits.length ? plural(hits.length, "memory", "memories") : "Nothing matches that.") : "";
  }
  $("q").addEventListener("input", runSearch);

  // ----- menu -----
  function closeMenu() { $("menu-pop").hidden = true; $("menu").setAttribute("aria-expanded", "false"); $("menu").focus(); }
  $("menu").addEventListener("click", () => {
    const open = $("menu-pop").hidden;
    $("menu-pop").hidden = !open; $("menu").setAttribute("aria-expanded", String(open));
    if (open) $("menu-pop").querySelector("a,button")?.focus();
  });
  $("replay").addEventListener("click", () => { $("menu-pop").hidden = true; $("menu").setAttribute("aria-expanded", "false"); entrance(true); });

  // ----- Galaxy / Text / Sound -----
  function setMode(m) {
    state.mode = m;
    document.body.dataset.mode = m;
    $("m-galaxy").setAttribute("aria-checked", String(m === "galaxy"));
    $("m-text").setAttribute("aria-checked", String(m === "text"));
    if (m === "text") renderText();
    else { if (ctx) ctx.focusWorld(state.view === "home" ? null : state.view); state.view === "home" ? renderHome() : renderWorld(state.view); }
    try { localStorage.setItem("dw-home-mode", m); } catch {}
  }
  $("m-galaxy").addEventListener("click", () => setMode("galaxy"));
  $("m-text").addEventListener("click", () => setMode("text"));
  $("sound").addEventListener("click", () => {
    const b = $("sound");
    if (sound.on) { sound.stop(); b.setAttribute("aria-pressed", "false"); b.textContent = "Sound off"; }
    else if (sound.start()) { b.setAttribute("aria-pressed", "true"); b.textContent = "Sound on"; }
  });

  // Text mode: the whole universe as a plain, complete document.
  function renderText() {
    const box = $("text");
    box.replaceChildren(el("h2", { class: "ptitle", tabindex: "-1" }, "Your universe as text"),
      el("p", { class: "sub" }, "Everything the galaxy shows, in reading order."),
      el("button", { class: "primary", onclick: () => { setMode("galaxy"); openCapture("mind"); } }, "Add a memory"),
      ...ORDER.map((w) => el("section", { "aria-labelledby": `tx-${w}` },
        el("h3", { id: `tx-${w}` }, el("span", { class: `chip chip-${w}`, html: icon(w, 14) }), ` ${META[w].name}`),
        el("p", { class: "sub" }, META[w].line),
        w === "future" && data.goal ? goalBlock(data.goal) : null,
        worldThemes(w).length ? el("div", { class: "cards" }, worldThemes(w).map((t) => insightCard(t))) : el("p", { class: "why" }, "I don't have enough evidence to conclude anything here yet."),
        el("ul", { class: "memories" }, [...worldStars(w)].reverse().map((s) => el("li", { class: "memory" }, el("span", { class: "when" }, longDate(s.date)), el("span", { class: "text" }, s.excerpt)))))));
  }

  // ----- entrance: a point of light opens into the galaxy -----
  function entrance(force = false) {
    let seen = false;
    try { seen = localStorage.getItem("dw-home-seen") === "1"; } catch {}
    const ov = $("entrance");
    if (reduced || (seen && !force) || !ctx) { ov.hidden = true; ctx?.skipIntro(); return; }
    if (force) location.reload(); // simplest honest replay: the whole sequence, from the start
    ov.hidden = false;
    document.body.classList.add("arriving");
    const done = () => {
      if (ov.hidden) return;
      ov.classList.add("out"); ctx.skipIntro();
      document.body.classList.remove("arriving");
      setTimeout(() => (ov.hidden = true), 500);
      try { localStorage.setItem("dw-home-seen", "1"); } catch {}
      panel.querySelector(".ptitle")?.focus({ preventScroll: true });
    };
    $("skip").addEventListener("click", done, { once: true });
    setTimeout(done, 3200);
  }

  // ----- layout and the frame loop -----
  const wide = () => innerWidth >= 1000;
  function resize() {
    if (!ctx) return;
    ctx.resize(innerWidth, innerHeight);
    // Wide screens: slide the worlds left so the panel on the right never covers them.
    ctx.setShift(wide() ? Math.round(Math.min(230, innerWidth * 0.14)) : 0);
  }
  addEventListener("resize", resize);
  resize();

  const frames = (window.__dwFrames = []);
  let last = performance.now();
  function place() {
    const W = innerWidth, H = innerHeight;
    for (const [w, b] of labels) {
      const p = ctx.project(w, W, H);
      b.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y + p.r + 10)}px) translateX(-50%)`;
      b.style.visibility = p.visible ? "visible" : "hidden";
    }
  }
  if (ctx) {
    ctx.renderer.setAnimationLoop((now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      frames.push(now - last); last = now;
      if (frames.length > 600) frames.shift();
      if (ctx.bloomOn && frames.length === 180) {
        const sorted = frames.slice(60).sort((a, b) => a - b);
        if (sorted[Math.floor(sorted.length / 2)] > 28) { ctx.degrade(); window.__dwDegraded = true; }
      }
      if (state.mode === "text") return; // nothing drawn behind a text page
      ctx.frame(dt);
      place();
    });
  }

  let mode = "galaxy";
  try { mode = localStorage.getItem("dw-home-mode") === "text" || !ctx ? "text" : "galaxy"; } catch { mode = ctx ? "galaxy" : "text"; }
  setDots();
  setMode(mode);
  entrance();
  window.__dwHome = { state, data, ctx };
  window.__dwHomeReady = true;
}

loadData()
  .then((d) => main(d, false))
  .catch(() => main(sampleData(), true));
