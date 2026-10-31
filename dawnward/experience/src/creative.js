// The galaxies you can walk into: Creative Worlds, Spiritual Exploration, Knowledge
// and AI Creation. One shell (galaxy page, members' gate, a world's HUD) and one
// small experience per planet. The 3D lives in creative-scene.js.
//
// Every world also works in words: "Things here" lists everything you can touch,
// and with no WebGL (or in the text view) the world opens as a list.
// What you make is kept on this device, can be saved as a file and deleted.
// No scores, no streaks. Nothing here calls a paid service.
import { buildWorld, ARCH, BODIES } from "./creative-scene.js";
import { PACKS } from "./packs.data.js";

/** Members' packs from content/packs (tools/packs.mjs). A test can supply its own. */
const packs = () => window.DW_PACKS ?? PACKS;
const PLACE_NAMES = { library: "Members' Library", creative: "Creative Worlds", spiritual: "Spiritual Exploration", knowledge: "Knowledge", ai: "AI Creation", mind: "Mind", body: "Body", soul: "Soul", spirit: "Spirit", future: "Future" };
const KIND = { lesson: "Lesson", video: "Film", audio: "Listen", worksheet: "Worksheet", image: "Picture" };

const KEY = "dw-creative-v1";
const RANK = { free: 0, plus: 1, pro: 2 };
const uid = (p) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const day = (iso) => { try { return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }); } catch { return ""; } };
const clip = (t, n = 64) => (t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t);

/** The two lantern worlds behind the door. Copy is plain; nothing claims to change you. */
export const CW = {
  kingdom: {
    hue: "#F2B880", sky: "linear-gradient(180deg,#2a1d4a,#8a4f7d 55%,#f2b880)",
    task: (n, of) => `Light the lanterns. ${n} of ${of} lit.`,
    hint: "Drag to look around. Pinch or scroll to come closer. Tap a lantern to light it.",
    things: [
      ["lantern-0", "The island of the old bell", "A bell somewhere below answers the light."],
      ["lantern-1", "The twin-tree island", "Two trees lean toward the glow, as if listening."],
      ["lantern-2", "The garden island", "Moths come up out of the leaves."],
      ["lantern-3", "The high meadow", "The grass turns gold for a moment."],
      ["lantern-4", "The island at the edge", "From here you can see how far the clouds go."],
    ],
    noun: "lantern", verb: "Light", done: "Every lantern is lit",
    carry: "A question to carry, if you like: what would you build if no one were watching?",
    notes: [523.25, 587.33, 659.25, 783.99, 880],
  },
  forest: {
    hue: "#5FE3C0", sky: "linear-gradient(180deg,#02060c,#06231f 60%,#0d3b33)",
    task: (n, of) => `Wake the glowing plants. ${n} of ${of} awake.`,
    hint: "Drag to look around. Move or tap to call the fireflies. Tap a plant to wake it.",
    things: [
      ["plant-0", "The fern by the stream", "Its fronds unroll in blue light."],
      ["plant-1", "The moon lily", "It opens slowly, the colour of sea glass."],
      ["plant-2", "The lantern mushrooms", "A ring of small lights spreads across the moss."],
      ["plant-3", "The whispering reed", "It hums, very quietly."],
      ["plant-4", "The old root flower", "Light runs along the roots and fades."],
      ["plant-5", "The twin bells", "Both bells glow, one a moment after the other."],
      ["plant-6", "The heart bloom", "The fireflies gather round it for a while."],
    ],
    noun: "plant", verb: "Wake", done: "The whole forest is awake",
    carry: "A question to carry, if you like: what small thing grew in you this week, unnoticed?",
    notes: [392, 440, 523.25, 587.33, 659.25, 783.99, 880],
  },
};

const NEEDS_AI = "Planned. It needs an AI service.";
const NEEDS_REVIEW = "Planned. Its lessons need writing and checking by a qualified reviewer first.";
/** Each galaxy and its planets. `exp` names the experience; `access` is free or plus. */
export const REALMS = {
  creative: {
    name: "Creative Worlds", art: "A6", door: true,
    lead: "Places to wander, play and make things. Step through the Infinite Door and choose where it opens.",
    planets: [
      { id: "door", name: "The Infinite Door", line: "The way in. Choose where it opens.", status: "open", access: "free" },
      { id: "kingdom", name: "The Floating Kingdom", line: "Islands drifting above a sea of clouds, and a castle with golden roofs.", status: "open", access: "free", exp: "lights" },
      { id: "forest", name: "The Living Forest", line: "A night forest that glows when you come close. Fireflies follow your hand.", status: "open", access: "plus", exp: "lights" },
      { id: "architect", name: "The Dream Architect", line: "Build a small place from four choices, give it a name, and walk around it.", status: "open", access: "plus", exp: "architect", hue: "#9AA8FF", sky: "linear-gradient(180deg,#3a3a7a,#d88aa0 60%,#ffd2a0)" },
      { id: "garden", name: "The Time Garden", line: "Keep a moment and it becomes a flower. Flowers grow over a week of real time.", status: "open", access: "free", exp: "garden", hue: "#FFD36A", sky: "linear-gradient(180deg,#5a86c8,#f4c9a0 60%,#ffe6c0)" },
    ],
  },
  spiritual: {
    name: "Spiritual Exploration", art: "A5",
    lead: "Quiet places for attention, awe and rest. Nothing here asks you to believe anything.",
    planets: [
      { id: "stillness", name: "The Temple of Stillness", line: "An open temple and a light that breathes with you.", status: "open", access: "free", exp: "stillness", sky: "linear-gradient(180deg,#0a0c24,#2a2450 60%,#6a4a6a)" },
      { id: "dreams", name: "The Dream Realm", line: "Keep your dreams as bubbles above a pastel sea. No interpretations.", status: "open", access: "free", exp: "dreams", sky: "linear-gradient(180deg,#6a5aa8,#e8a8c8 60%,#ffe0c8)" },
      { id: "sanctuary", name: "The Sound Sanctuary", line: "Seven singing bowls to strike, alone or over a low hum.", status: "open", access: "plus", exp: "sanctuary", sky: "linear-gradient(180deg,#05060e,#10142a 60%,#2a2440)" },
      { id: "cosmos", name: "The Inner Cosmos", line: "Float inside a nebula. Six bright stars, six small invitations.", status: "open", access: "plus", exp: "cosmos", sky: "linear-gradient(180deg,#05030f,#2a0f3a 60%,#0f2440)" },
      { id: "traditions", name: "Sacred Traditions", line: "Practices from the world's traditions, told by people who keep them.", status: "planned", why: "Planned. Waiting for writers and reviewers from each tradition." },
    ],
  },
  knowledge: {
    name: "Knowledge", art: "A4",
    lead: "Learn by looking and trying. Anything not yet checked by a reviewer says so.",
    planets: [
      { id: "observatory", name: "The Cosmic Observatory", line: "The Sun and its eight planets, moving in their true proportions of time.", status: "open", access: "free", exp: "observatory", sky: "#02030a" },
      { id: "lab", name: "The Discovery Lab", line: "Throw moons around a star and watch real gravity at work.", status: "open", access: "plus", exp: "lab", sky: "#03050c" },
      { id: "mind", name: "The Human Mind", line: "How attention, memory and habits work.", status: "planned", why: NEEDS_REVIEW },
      { id: "civilizations", name: "Civilizations", line: "How people have lived, built and changed.", status: "planned", why: NEEDS_REVIEW },
      { id: "philosophy", name: "The Philosophy Temple", line: "Old questions, asked plainly.", status: "planned", why: NEEDS_REVIEW },
    ],
  },
  ai: {
    name: "AI Creation", art: "A3",
    lead: "Everything you've made, in one place. The AI studios are planned.",
    planets: [
      { id: "gallery", name: "The Creation Gallery", line: "Everything you've made in the worlds, kept on this device.", status: "open", access: "free", page: true },
      { id: "forge", name: "The Dream Forge", line: "Turn an idea into pictures and stories with AI.", status: "planned", why: NEEDS_AI },
      { id: "builder", name: "The Architect", line: "Describe a world in words and AI builds it.", status: "planned", why: NEEDS_AI },
      { id: "future", name: "Future Self", line: "A conversation with a possible future you.", status: "planned", why: `${NEEDS_AI} The Quantum Gateway offers a future-self practice now, without AI.` },
      { id: "companion", name: "The Companion Nexus", line: "A companion for your practice.", status: "planned", why: NEEDS_AI },
    ],
  },
};
const planet = (r, id) => REALMS[r]?.planets.find((p) => p.id === id);
/** where each lantern world's copy lives */
const meta = (r, id) => ({ ...planet(r, id), ...(CW[id] ?? {}) });

const SANCT = [["The deepest bowl", "C", 130.81], ["The low bowl", "D", 146.83], ["The warm bowl", "E", 164.81], ["The middle bowl", "G", 196.0], ["The clear bowl", "A", 220.0], ["The bright bowl", "high C", 261.63], ["The smallest bowl", "high D", 293.66]];
const STARS = [
  ["The amber star", "Look for the faintest light you can find. Notice how your eyes have to soften to see it."],
  ["The blue star", "Somewhere, right now, someone is looking up at a sky like this. You don't need to know who."],
  ["The rose star", "Breathe out slowly. Nothing out here needs anything from you."],
  ["The pale green star", "Think of one thing that felt too big this week. Notice how it sits against all this space."],
  ["The gold star", "Name, quietly, one thing you're grateful for. Let it be small."],
  ["The violet star", "Starlight takes years to arrive, so the sky you see is the past reaching you. What from your own past still reaches you kindly?"],
];
/** Draft facts, well established, awaiting a reviewer's check before launch. */
const FACTS = {
  sun: ["The Sun", "Our star.", ["About 109 times as wide as Earth.", "Its light takes about 8 minutes to reach Earth.", "Holds over 99% of the mass of the solar system."]],
  mercury: ["Mercury", "The smallest planet, and the closest to the Sun.", ["A year lasts 88 Earth days.", "About 0.39 times Earth's distance from the Sun.", "Rocky, with almost no air."]],
  venus: ["Venus", "The hottest planet's surface, under thick clouds.", ["A year lasts about 225 Earth days.", "Spins very slowly, and backwards compared with most planets.", "Nearly the same size as Earth."]],
  earth: ["Earth", "The only world where life is known to exist.", ["A year lasts about 365.25 days.", "Its distance from the Sun is called one astronomical unit (AU).", "In this model, Earth goes round once every 24 seconds."]],
  mars: ["Mars", "The red planet.", ["A year lasts 687 Earth days.", "About half as wide as Earth.", "Home to Olympus Mons, the tallest known volcano in the solar system."]],
  jupiter: ["Jupiter", "The largest planet.", ["A year lasts about 11.9 Earth years.", "About 11 times as wide as Earth.", "Its Great Red Spot is a storm wider than Earth."]],
  saturn: ["Saturn", "The planet with the brightest rings.", ["A year lasts about 29.5 Earth years.", "Its rings are made mostly of ice.", "About 9.5 times as wide as Earth."]],
  uranus: ["Uranus", "The planet that spins on its side.", ["A year lasts about 84 Earth years.", "Its axis is tilted about 98 degrees.", "An ice giant, about 4 times as wide as Earth."]],
  neptune: ["Neptune", "The farthest planet from the Sun.", ["A year lasts about 165 Earth years.", "About 30 times Earth's distance from the Sun.", "Has the fastest winds measured in the solar system."]],
};

function load() {
  const empty = { lit: { kingdom: [], forest: [] }, found: {}, places: [], moments: [], dreams: [] };
  try { const s = JSON.parse(localStorage.getItem(KEY) || "{}"); return { ...empty, ...s, lit: { ...empty.lit, ...(s.lit ?? {}) } }; } catch { return empty; }
}
function hasGL() { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } }

export function createCreative(h) {
  const { $, el, svg, ICON, asset, sound, announce } = h;
  const root = $("creative"), page = $("cw-page"), door = $("cw-door"), stage = $("cw-stage");
  let view = "galaxy", realm = "creative", pid = null, scene = null, saved = load(), keyHandler = null, exp = null, pageKind = null, packId = null;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); return true; } catch { return false; } };
  const locked = (r, id) => RANK[planet(r, id)?.access ?? "free"] > RANK[h.explore.plan()];

  function route() {
    if (view === "page") return pageKind === "library" ? "#/library" : pageKind === "pack" ? `#/library/${packId}` : "#/ai/gallery";
    if (view === "galaxy" || view === "gate") return `#/universe/${realm}`;
    if (view === "door") return "#/creative/door";
    return `#/${realm}/${pid}`;
  }
  function show(v) {
    view = v;
    page.hidden = !(v === "galaxy" || v === "gate" || v === "page"); door.hidden = v !== "door"; stage.hidden = v !== "world";
    root.classList.toggle("immersive", v === "door" || v === "world");
    if (v !== "world") closeWorld();
    h.showPlace("creative");
  }
  const back = (label, go) => el("button", { class: "text-btn back", onclick: go }, el("span", { html: svg(ICON.back, 16) }), ` ${label}`);

  // ---------------- a galaxy's page ----------------
  function open(r = realm) {
    if (!REALMS[r]) r = "creative";
    realm = r; show("galaxy");
    const R = REALMS[r], open_ = R.planets.filter((p) => p.status === "open"), freeN = open_.filter((p) => p.access === "free").length;
    const metaOf = (p) => {
      if (p.status === "planned") return "Planned";
      if (locked(r, p.id)) return "Members";
      if (CW[p.id]) return `${saved.lit[p.id].length} of ${CW[p.id].things.length}${p.access === "free" ? " · free" : ""}`;
      if (p.id === "garden") return saved.moments.length ? `${saved.moments.length} growing` : "Free";
      if (p.id === "dreams") return saved.dreams.length ? `${saved.dreams.length} kept` : "Free";
      if (p.id === "architect") return saved.places.length ? `${saved.places.length} made` : "Open";
      return p.access === "free" ? "Free" : "Open";
    };
    page.replaceChildren(el("div", { class: "ycol" },
      h.crumbs([{ label: "Universe", go: h.toUniverse }, { label: R.name }]),
      el("div", { class: "cw-hero" }, el("img", { src: asset(`img/art/${R.art}.webp`), alt: "" })),
      el("p", { class: "kicker" }, `Galaxy · ${open_.length} open${freeN ? `, ${freeN} free` : ""}`),
      el("h2", { class: "s-title", id: "cw-title", tabindex: "-1" }, R.name),
      el("p", { class: "lead" }, R.lead),
      R.door ? el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => openDoor() }, "Open the Infinite Door")) : null,
      el("h3", { class: "cw-h" }, "Planets here"),
      el("ul", { class: "cw-planets" }, R.planets.map((p) => {
        const lock = p.status === "open" && locked(r, p.id);
        const body = [el("span", { class: `cw-dot cw-${p.id}`, "aria-hidden": "true" }),
          el("span", { class: "rtext" }, el("span", { class: "rtitle" }, p.name), el("span", { class: "rsub" }, p.line),
            p.why ? el("span", { class: "rsub cw-why" }, p.why) : null,
            saved.found[p.id] && CW[p.id] ? el("span", { class: "cw-found" }, `Discovered: ${CW[p.id].done.toLowerCase()}`) : null),
          el("span", { class: `mmeta${lock ? " plus-tag" : ""}` }, metaOf(p))];
        return el("li", {}, p.status === "planned" ? el("div", { class: "row planned" }, ...body)
          : el("button", { class: "row", onclick: () => (p.id === "door" ? openDoor() : enter(r, p.id)) }, ...body));
      })),
      packRows(packs().filter((k) => k.place === r), "From Bianno"),
      el("p", { class: "quiet small" }, "Drawn live on your device. What you make is kept on this device, and you can save or delete it in the Creation Gallery. Nothing here is scored."),
      el("div", { class: "actions" }, el("button", { class: "ghost", onclick: h.toUniverse }, "Back to the Universe"))));
    root.scrollTop = 0;
    $("cw-title").focus({ preventScroll: true });
    announce(`${R.name}.`);
  }

  // ---------------- members ----------------
  function gate(r, id) {
    realm = r; show("gate");
    const p = planet(r, id), free = REALMS[r].planets.find((x) => x.status === "open" && x.access === "free" && x.id !== "door");
    page.replaceChildren(el("div", { class: "ycol" },
      h.crumbs([{ label: "Universe", go: h.toUniverse }, { label: REALMS[r].name, go: () => open(r) }, { label: p.name }]),
      el("p", { class: "kicker plus-kicker" }, "Dawnward Plus"),
      el("h2", { class: "s-title", id: "cw-title", tabindex: "-1" }, p.name),
      el("p", { class: "lead" }, p.line),
      el("section", { class: "card plus-card", "aria-labelledby": "cw-plus-h" },
        el("h3", { id: "cw-plus-h" }, "This world is for members"),
        el("p", {}, "Members get every world in every galaxy as it opens, with every chapter and expedition in Learn."),
        el("p", { class: "quiet" }, "Membership isn't open yet. It opens after the beta, with a reminder before any charge and one-tap cancel."),
        el("p", { class: "quiet" }, "Anything you've made or written stays yours to read, save and delete, always.")),
      el("div", { class: "actions" },
        h.explore.store?.local ? el("button", { class: "primary", onclick: async () => { await h.explore.setPlan("plus"); announce("Member preview on, on this device only."); enter(r, id); } }, "Preview as a member") : null,
        free ? el("button", { class: "ghost", onclick: () => enter(r, free.id) }, `Free now: ${free.name}`) : null,
        el("button", { class: "text-btn", onclick: () => open(r) }, `Back to ${REALMS[r].name}`))));
    $("cw-title").focus({ preventScroll: true });
  }

  // ---------------- the Infinite Door ----------------
  // A dive toward the planet, clouds part, a floating temple with a glowing door.
  // Skip finishes it at once. Reduced motion shows the temple still.
  let anims = [];
  function openDoor() {
    realm = "creative"; show("door");
    const still = reduced();
    const dests = ["kingdom", "forest", "architect", "garden"].map((k) => meta("creative", k));
    const choices = el("div", { class: "cw-choices", role: "group", "aria-label": "Where should the door open?" },
      ...dests.map((d) => el("button", { class: `cw-choice cw-${d.id}`, "data-k": d.id,
        onfocus: () => door.style.setProperty("--door", d.hue), onmouseenter: () => door.style.setProperty("--door", d.hue),
        onclick: () => through(d.id) },
        el("span", { class: "cw-swatch", "aria-hidden": "true", style: `background:${d.sky}` }),
        el("span", { class: "rtext" }, el("span", { class: "rtitle" }, d.name), el("span", { class: "rsub" }, d.line)),
        locked("creative", d.id) ? el("span", { class: "mmeta plus-tag" }, "Members") : null)));
    door.replaceChildren(
      el("div", { class: "cw-sky", "aria-hidden": "true" }),
      el("img", { class: "cw-dive", src: asset("img/art/A6.webp"), alt: "", "aria-hidden": "true" }),
      el("div", { class: "cw-temple", "aria-hidden": "true", html: TEMPLE }),
      el("div", { class: "cw-cloud l", "aria-hidden": "true" }), el("div", { class: "cw-cloud r", "aria-hidden": "true" }),
      el("div", { class: "cw-light", "aria-hidden": "true" }),
      el("div", { class: "cw-dtop" }, back("Creative Worlds", () => open("creative")), el("button", { class: "ghost cw-skip", onclick: finish }, "Skip")),
      el("div", { class: "cw-dfoot" },
        el("h2", { class: "s-title", id: "cw-dtitle", tabindex: "-1" }, "The Infinite Door"),
        el("p", { class: "quiet" }, "Choose where it opens."), choices));
    door.classList.toggle("still", still);
    door.style.setProperty("--door", "#F0D6A2");
    anims = [];
    if (!still) {
      const a = (sel, kf, o) => { const n = door.querySelector(sel); if (n) anims.push(n.animate(kf, { fill: "both", easing: "cubic-bezier(.65,0,.35,1)", ...o })); };
      a(".cw-dive", [{ transform: "translate(-50%,-50%) scale(.42)", opacity: 1, filter: "blur(0)" }, { transform: "translate(-50%,-50%) scale(1.6)", opacity: 1, offset: 0.55 }, { transform: "translate(-50%,-50%) scale(5)", opacity: 0, filter: "blur(10px)" }], { duration: 1700 });
      a(".cw-cloud.l", [{ transform: "translateX(-8%)", opacity: 0 }, { transform: "translateX(0)", opacity: 1, offset: 0.35 }, { transform: "translateX(-75%)", opacity: 0.9 }], { duration: 2200, delay: 700 });
      a(".cw-cloud.r", [{ transform: "translateX(8%)", opacity: 0 }, { transform: "translateX(0)", opacity: 1, offset: 0.35 }, { transform: "translateX(75%)", opacity: 0.9 }], { duration: 2200, delay: 700 });
      a(".cw-temple", [{ opacity: 0, transform: "translate(-50%,-44%) scale(.86)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1)" }], { duration: 1300, delay: 1600 });
      a(".cw-dfoot", [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 600, delay: 2600 });
      sound.rise?.(2.4);
    }
    $("cw-dtitle").focus({ preventScroll: true });
    announce("The Infinite Door. A doorway in a floating temple. Choose where it opens.");
  }
  function finish() { anims.forEach((x) => { try { x.finish(); } catch {} }); door.querySelector(".cw-choice")?.focus(); }
  function through(k) {
    if (locked("creative", k)) { gate("creative", k); return; }
    finish();
    const d = meta("creative", k);
    door.style.setProperty("--door", d.hue);
    sound.chime?.(660);
    if (reduced()) { enter("creative", k); return; }
    door.querySelector(".cw-light").animate([{ transform: "translate(-50%,-50%) scale(.05)", opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: "translate(-50%,-50%) scale(3)", opacity: 1 }], { duration: 900, easing: "cubic-bezier(.5,0,.2,1)", fill: "both" })
      .finished.then(() => enter("creative", k, { fromDoor: true })).catch(() => enter("creative", k));
  }

  // ---------------- a world ----------------
  async function enter(r, id, args = {}) {
    const p = planet(r, id);
    if (!p || p.status !== "open") return open(r);
    if (p.page) return gallery();
    if (locked(r, id)) { await h.ready?.(); if (locked(r, id)) return gate(r, id); }
    realm = r; pid = id; show("world");
    const w = meta(r, id);
    stage.dataset.k = id;
    stage.style.setProperty("--sky", w.sky ?? "#05070D");
    const host = el("div", { class: "cw-host" });
    const task = el("p", { class: "cw-task", id: "cw-task" });
    const list = el("ul", { class: "cw-list", id: "cw-list", hidden: "" });
    const toggle = el("button", { class: "ghost cw-tool", "aria-expanded": "false", "aria-controls": "cw-list", onclick: () => { const o = list.hidden; list.hidden = !o; toggle.setAttribute("aria-expanded", String(o)); if (o) list.querySelector("button")?.focus(); } }, "Things here");
    const sbtn = el("button", { class: "ghost cw-tool", "aria-pressed": String(!!sound.on), onclick: () => { $("y-sound").click(); sbtn.setAttribute("aria-pressed", String(!!sound.on)); sbtn.textContent = sound.on ? "Sound on" : "Sound off"; } }, sound.on ? "Sound on" : "Sound off");
    const tools = el("div", { class: "cw-tools" }, sbtn);
    const hint = el("p", { class: "cw-hint", id: "cw-hint" });
    const panel = el("div", { class: "cw-panel glass", id: "cw-panel", hidden: "" });
    const card = el("section", { class: "cw-card glass", hidden: "", "aria-labelledby": "cw-done-h" });
    stage.replaceChildren(host,
      el("div", { class: "cw-hud" },
        el("div", { class: "cw-top" }, back("Leave", () => leave()), tools),
        el("div", { class: "cw-head" }, el("p", { class: "kicker" }, REALMS[r].name), el("h2", { class: "s-title", id: "cw-wname", tabindex: "-1" }, w.name), task),
        list, hint, panel),
      card);
    const words = h.textMode() || !hasGL();
    // what every experience can use
    const x = {
      el, w, args, saved, save, announce, sound, reduced: reduced(), words,
      get scene() { return scene; },
      task: (t) => { task.textContent = t; },
      hint: (t) => { hint.textContent = t; hint.classList.remove("gone"); },
      quietHint: () => hint.classList.add("gone"),
      tool(label, onclick, pressed) { const b = el("button", { class: "ghost cw-tool", onclick: () => onclick(b) }, label); if (pressed !== undefined) b.setAttribute("aria-pressed", String(pressed)); tools.append(b); return b; },
      things(items) {
        if (!toggle.isConnected) tools.append(toggle);
        list.replaceChildren(...items.map((t) => el("li", {}, el("button", { class: `row${t.on ? " lit" : ""}`, "data-id": t.id, onclick: () => exp.pick?.(t.id) },
          el("span", { class: "cw-bulb", "aria-hidden": "true" }),
          el("span", { class: "rtext" }, el("span", { class: "rtitle" }, t.title), t.sub ? el("span", { class: "rsub" }, t.sub) : null),
          t.meta ? el("span", { class: "mmeta" }, t.meta) : null))));
      },
      openList() { list.hidden = false; toggle.setAttribute("aria-expanded", "true"); },
      closeList() { list.hidden = true; toggle.setAttribute("aria-expanded", "false"); },
      panel(...kids) { kids = kids.filter(Boolean); panel.replaceChildren(...kids); panel.hidden = !kids.length; return panel; },
      card(kicker, title, ...kids) {
        card.replaceChildren(el("p", { class: "kicker" }, kicker), el("h3", { id: "cw-done-h", tabindex: "-1" }, title), ...kids);
        x.closeList(); card.hidden = false; panel.dataset.was = String(!panel.hidden); panel.hidden = true; $("cw-done-h").focus();
      },
      closeCard() { card.hidden = true; if (panel.dataset.was === "true") panel.hidden = false; $("cw-wname").focus(); },
      /** a crisis line in what someone writes: support first, and their words are still kept */
      careFor(text) {
        if (!h.distress?.(text)) return false;
        x.card("You matter", "You matter more than any practice", ...String(h.crisisText).split("\n").map((l) => el("p", { class: "crisis" }, l)),
          el("p", { class: "quiet" }, "What you wrote is kept on this device, only for you."),
          el("div", { class: "actions" }, el("button", { class: "ghost", onclick: () => x.closeCard() }, "Close")));
        return true;
      },
      close: () => x.closeCard(), leave: () => leave(), openDoor: () => openDoor(), enter: (a, b, c) => enter(a, b, c),
    };
    exp = EXP[p.exp](x);
    $("cw-wname").focus({ preventScroll: true });
    announce(`${w.name}. ${w.line}${toggle.isConnected ? " Use Things here for a list." : ""}`);
    if (words) {
      stage.classList.add("words"); exp.words?.(); if (toggle.isConnected) x.openList();
      if (!hint.textContent) hint.textContent = "This view shows the world in words.";
      return;
    }
    stage.classList.remove("words");
    try {
      scene = buildWorld(exp.scene ?? id, { host, reduced: reduced(), onPick: (k) => exp.pick?.(k), opts: exp.opts ?? {} });
      exp.ready?.(scene);
      window.__dwCreative = scene;
    } catch (e) {
      stage.classList.add("words"); exp.words?.(); if (toggle.isConnected) x.openList();
      hint.textContent = "This device couldn't draw the world, so here it is in words.";
    }
    if (args.fromDoor && !reduced()) stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: "ease-out" });
    keyHandler = (e) => {
      if (view !== "world" || e.target.closest?.("input,textarea,button,[role=radio]")) return;
      const m = { ArrowLeft: [0.25, 0, 1], ArrowRight: [-0.25, 0, 1], ArrowUp: [0, 0.12, 1], ArrowDown: [0, -0.12, 1], "+": [0, 0, 0.85], "=": [0, 0, 0.85], "-": [0, 0, 1.18] }[e.key];
      if (m && scene) { e.preventDefault(); scene.nudge(...m); }
    };
    addEventListener("keydown", keyHandler);
  }
  function closeWorld() {
    if (keyHandler) { removeEventListener("keydown", keyHandler); keyHandler = null; }
    exp?.stop?.(); exp = null;
    if (scene) { scene.dispose(); scene = null; window.__dwCreative = null; }
  }
  function leave() { closeWorld(); open(realm); }
  function close() { if (view === "world" || view === "door") { closeWorld(); view = "galaxy"; root.classList.remove("immersive"); } }
  /** Escape steps back one level: world or door to the galaxy page, the page to the Universe. */
  function escape() {
    if (view === "world" || view === "door") leave();
    else if (view === "page" && pageKind === "pack") library();
    else if (view === "page" && pageKind === "library") h.toLearn();
    else if (view === "gate" || view === "page") open(realm); else h.toUniverse();
  }
  function follow(r, part) { if (r === "creative" && part === "door") openDoor(); else if (part) enter(r, part); else open(r); }

  // ---------------- the Creation Gallery: everything you've made ----------------
  function gallery() {
    realm = "ai"; pid = "gallery"; pageKind = "gallery"; show("page");
    const sec = (title, ...kids) => el("section", { class: "cw-gsec" }, el("h3", { class: "cw-h" }, title), ...kids);
    const empty = !saved.places.length && !saved.moments.length && !saved.dreams.length && !saved.lit.kingdom.length && !saved.lit.forest.length;
    const confirmBox = el("div", { class: "card", hidden: "" });
    page.replaceChildren(el("div", { class: "ycol" },
      h.crumbs([{ label: "Universe", go: h.toUniverse }, { label: "AI Creation", go: () => open("ai") }, { label: "The Creation Gallery" }]),
      el("p", { class: "kicker" }, "AI Creation · free"),
      el("h2", { class: "s-title", id: "cw-title", tabindex: "-1" }, "The Creation Gallery"),
      el("p", { class: "lead" }, "Everything you've made in the worlds. Kept on this device, and always yours to read, save and delete."),
      empty ? el("p", { class: "quiet" }, "Nothing here yet. Places you design, moments you keep and dreams you write will appear here.") : null,
      saved.places.length ? sec("Places you designed", el("ul", { class: "cw-planets" }, saved.places.map((pl) => el("li", {}, el("button", { class: "row", onclick: () => enter("creative", "architect", { design: pl }) },
        el("span", { class: "rtext" }, el("span", { class: "rtitle" }, pl.name || "A place without a name"), el("span", { class: "rsub" }, describe(pl)), el("span", { class: "rsub" }, day(pl.at))),
        el("span", { class: "mmeta" }, locked("creative", "architect") ? "Members" : "Visit")))))) : null,
      saved.moments.length ? sec(`Moments in your Time Garden (${saved.moments.length})`,
        el("ul", { class: "cw-words" }, [...saved.moments].reverse().map((m) => el("li", {}, el("p", {}, m.text), el("p", { class: "quiet small" }, day(m.at))))),
        el("div", { class: "actions" }, el("button", { class: "ghost", onclick: () => enter("creative", "garden") }, "Visit the garden"))) : null,
      saved.dreams.length ? sec(`Dreams you kept (${saved.dreams.length})`,
        el("ul", { class: "cw-words" }, [...saved.dreams].reverse().map((d) => el("li", {}, d.title ? el("p", { class: "rtitle" }, d.title) : null, el("p", {}, d.text), el("p", { class: "quiet small" }, day(d.at))))),
        el("div", { class: "actions" }, el("button", { class: "ghost", onclick: () => enter("spiritual", "dreams") }, "Visit the Dream Realm"))) : null,
      saved.lit.kingdom.length || saved.lit.forest.length ? sec("Worlds you lit", el("ul", { class: "cw-words" },
        el("li", {}, el("p", {}, `The Floating Kingdom: ${saved.lit.kingdom.length} of 5 lanterns lit.`)),
        el("li", {}, el("p", {}, `The Living Forest: ${saved.lit.forest.length} of 7 plants awake.`)))) : null,
      !empty ? sec("Your copy",
        el("p", { class: "quiet" }, "Save everything here as a file, or delete it from this device."),
        el("div", { class: "actions" },
          el("button", { class: "ghost", onclick: () => saveCopy() }, "Save a copy"),
          el("button", { class: "ghost", id: "cw-del", onclick: () => {
            confirmBox.hidden = false;
            confirmBox.replaceChildren(el("p", { tabindex: "-1", id: "cw-del-ask" }, "Delete every place, moment, dream and lit lantern from this device? This can't be undone."),
              el("div", { class: "actions" },
                el("button", { class: "danger", onclick: () => { if (wipe()) { announce("Everything you made in the worlds was deleted from this device."); gallery(); } else confirmBox.append(el("p", { class: "error", role: "alert" }, "I couldn't delete it. Try again.")); } }, "Delete all of it"),
                el("button", { class: "ghost", onclick: () => { confirmBox.hidden = true; $("cw-del").focus(); } }, "Cancel")));
            $("cw-del-ask").focus();
          } }, "Delete all of it")), confirmBox) : null,
      el("div", { class: "actions" }, el("button", { class: "ghost", onclick: () => open("ai") }, "Back to AI Creation"))));
    root.scrollTop = 0;
    $("cw-title").focus({ preventScroll: true });
    announce("The Creation Gallery.");
  }
  function snapshot() { return { places: saved.places, moments: saved.moments, dreams: saved.dreams, lit: saved.lit, found: saved.found }; }
  function hasData() { const s = saved; return !!(s.places.length || s.moments.length || s.dreams.length || s.lit.kingdom.length || s.lit.forest.length); }
  function wipe() { try { localStorage.removeItem(KEY); } catch { return false; } saved = load(); return !hasData(); }
  async function saveCopy() {
    const json = JSON.stringify({ exported: new Date().toISOString(), worlds: snapshot() }, null, 2), filename = `dawnward-worlds-${new Date().toISOString().slice(0, 10)}.json`;
    try { const d = await window.claude?.use?.("downloads"); if (d) { await d.save({ filename, data: json }); announce("Saved."); return; } } catch (e) { if (e?.code === "declined") return; }
    const a = el("a", { href: URL.createObjectURL(new Blob([json], { type: "application/json" })), download: filename });
    document.body.append(a); a.click(); a.remove(); announce("Saved as a file.");
  }

  // ---------------- the Members' Library: packs Bianno makes ----------------
  const packLocked = (k) => RANK[k.access ?? "plus"] > RANK[h.explore.plan()];
  function packRows(list, heading) {
    if (!list.length) return null;
    return el("section", { class: "cw-gsec" }, heading ? el("h3", { class: "cw-h" }, heading) : null,
      el("ul", { class: "cw-planets" }, list.map((k) => el("li", {}, el("button", { class: "row", onclick: () => pack(k.id) },
        k.cover ? el("img", { class: "cw-pcover", src: asset(k.cover), alt: "" }) : el("span", { class: "cw-dot cw-pack", "aria-hidden": "true" }),
        el("span", { class: "rtext" }, el("span", { class: "rtitle" }, k.title), el("span", { class: "rsub" }, k.summary),
          el("span", { class: "rsub" }, [...new Set(k.items.map((i) => KIND[i.type]))].join(" · "))),
        el("span", { class: `mmeta${packLocked(k) ? " plus-tag" : ""}` }, packLocked(k) ? "Members" : k.access === "free" ? "Free" : "Open"))))));
  }
  function library() {
    pageKind = "library"; show("page");
    const all = packs(), groups = Object.keys(PLACE_NAMES).map((pl) => [pl, all.filter((k) => k.place === pl)]).filter(([, l]) => l.length);
    page.replaceChildren(el("div", { class: "ycol" },
      h.crumbs([{ label: "Learn", root: true, go: h.toLearn }, { label: "Members' Library" }]),
      el("p", { class: "kicker" }, "Learn · for members"),
      el("h2", { class: "s-title", id: "cw-title", tabindex: "-1" }, "Members' Library"),
      el("p", { class: "lead" }, "Lessons, films, guided audio and worksheets from Bianno. Each says how it was made."),
      all.length ? null : el("p", { class: "quiet" }, "Bianno is preparing the first packs. They'll appear here."),
      ...groups.map(([pl, l]) => packRows(l, PLACE_NAMES[pl])),
      el("div", { class: "actions" }, el("button", { class: "ghost", onclick: h.toLearn }, "Back to Learn"))));
    root.scrollTop = 0;
    $("cw-title").focus({ preventScroll: true });
    announce("Members' Library.");
  }
  async function pack(id) {
    let k = packs().find((x) => x.id === id);
    if (!k) return library();
    if (packLocked(k)) await h.ready?.();
    pageKind = "pack"; packId = id; show("page");
    const lock = packLocked(k), crumbs = h.crumbs([{ label: "Learn", root: true, go: h.toLearn }, { label: "Members' Library", go: library }, { label: k.title }]);
    const head = [crumbs,
      k.cover ? el("img", { class: "cw-pack-hero", src: asset(k.cover), alt: k.coverAlt ?? "" }) : null,
      el("p", { class: `kicker${lock ? " plus-kicker" : ""}` }, `${k.access === "free" ? "Free" : "Members"} · ${PLACE_NAMES[k.place]}`),
      el("h2", { class: "s-title", id: "cw-title", tabindex: "-1" }, k.title),
      el("p", { class: "lead" }, k.summary)];
    const meta = (it) => [KIND[it.type], it.minutes ? `${it.minutes} min` : null, it.credit, it.draft ? "Draft, not yet reviewed" : null].filter(Boolean).join(" · ");
    let body;
    if (lock) {
      body = [el("section", { class: "card plus-card", "aria-labelledby": "cw-plus-h" },
        el("h3", { id: "cw-plus-h" }, "This is for members"),
        el("p", {}, "Inside:"), el("ul", { class: "plus-list" }, k.items.map((it) => el("li", {}, `${it.title} (${KIND[it.type].toLowerCase()})`))),
        el("p", { class: "quiet" }, "Membership isn't open yet. It opens after the beta, with a reminder before any charge and one-tap cancel.")),
        el("div", { class: "actions" },
          h.explore.store?.local ? el("button", { class: "primary", onclick: async () => { await h.explore.setPlan("plus"); announce("Member preview on, on this device only."); pack(id); } }, "Preview as a member") : null,
          el("button", { class: "ghost", onclick: library }, "Back to the library"))];
    } else {
      body = k.items.map((it, i) => {
        const hid = `cw-it-${i}`, src = it.src ? asset(it.src) : it.url;
        const part = [el("h3", { id: hid, class: "cw-ititle" }, it.title), el("p", { class: "quiet small" }, meta(it))];
        if (it.type === "lesson") part.push(...it.paragraphs.map((t) => el("p", {}, t)));
        if (it.type === "video") {
          const v = el("video", { controls: "", playsinline: "", preload: "metadata", src, poster: it.poster ? asset(it.poster) : null, "aria-labelledby": hid, class: "cw-media" });
          if (it.captions) v.append(el("track", { kind: "captions", src: asset(it.captions), srclang: "en", label: "English", default: "" }));
          part.push(v);
          if (it.description) part.push(el("p", { class: "quiet" }, `What happens: ${it.description}`));
          if (it.transcript) part.push(el("details", {}, el("summary", {}, "Transcript"), el("p", {}, it.transcript)));
        }
        if (it.type === "audio") part.push(el("audio", { controls: "", preload: "none", src, "aria-labelledby": hid, class: "cw-media" }), el("details", {}, el("summary", {}, "Transcript"), el("p", {}, it.transcript)));
        if (it.type === "worksheet") part.push(el("p", {}, el("a", { href: src, target: "_blank", rel: "noopener", download: "" }, `Open the worksheet (PDF)`)));
        if (it.type === "image") part.push(el("img", { src, alt: it.alt, class: "cw-media" }));
        return el("section", { class: `cw-item card${it.draft ? " draft" : ""}`, "aria-labelledby": hid }, ...part);
      });
      body.push(el("div", { class: "actions" }, el("button", { class: "ghost", onclick: library }, "Back to the library")));
    }
    page.replaceChildren(el("div", { class: "ycol" }, ...head, ...body));
    root.scrollTop = 0;
    $("cw-title").focus({ preventScroll: true });
    announce(`${k.title}.`);
  }
  function followLibrary(id) { if (id) pack(id); else library(); }

  return { open, openDoor, enter, follow, close, route, escape, snapshot, hasData, wipe, library, pack, followLibrary, packsFor: (pl) => packs().filter((k) => k.place === pl), packRowsFor: (pl, heading) => packRows(packs().filter((k) => k.place === pl), heading),
    get inLearn() { return view === "page" && (pageKind === "library" || pageKind === "pack"); }, get view() { return view; }, get progress() { return saved; } };
}

/** "A meadow island at dawn, with a tower and trees." */
export function describe(d) {
  const g = { meadow: "A meadow island", desert: "A desert island", snow: "A snowy island", crystal: "A crystal island", water: "An island with a lake" }[d.ground] ?? "An island";
  const s = { dawn: "at dawn", day: "by day", dusk: "at dusk", night: "at night" }[d.sky] ?? "";
  const b = { tower: "a tower", cottage: "a cottage", temple: "a temple", lighthouse: "a lighthouse" }[d.build] ?? "a tower";
  const l = { trees: "trees", flowers: "flowers", fireflies: "fireflies", birds: "birds" }[d.life] ?? "trees";
  return `${g} ${s}, with ${b} and ${l}.`;
}

// ================= the experiences, one per planet =================
const EXP = {
  // ---- the lantern worlds: light every one ----
  lights(x) {
    const { el } = x, w = x.w, k = w.id, lit = () => x.saved.lit[k];
    x.hint(w.hint);
    const draw = () => {
      x.task(w.task(lit().length, w.things.length));
      x.things(w.things.map(([id, name, line]) => { const on = lit().includes(id); return { id, title: name, sub: on ? line : `${w.verb} the ${w.noun}`, meta: on ? "Lit" : w.verb, on }; }));
    };
    const complete = () => {
      [0, 2, 4].forEach((n, j) => setTimeout(() => x.sound.chime?.(w.notes[n] * 2), j * 220));
      x.card("Discovered", w.done, el("p", { class: "quiet" }, w.carry),
        el("div", { class: "actions" },
          el("button", { class: "primary", onclick: () => x.close() }, "Stay a while"),
          el("button", { class: "ghost", onclick: () => x.openDoor() }, "Choose another door"),
          el("button", { class: "text-btn", onclick: () => x.leave() }, "Back to Creative Worlds")));
    };
    draw();
    return {
      pick(id) {
        const i = w.things.findIndex((t) => t[0] === id); if (i < 0) return;
        x.sound.chime?.(w.notes[i]); x.quietHint();
        if (lit().includes(id)) { x.scene?.lit(id, true); return; }
        x.saved.lit[k] = [...lit(), id];
        const kept = x.save();
        x.scene?.lit(id, true); draw();
        x.announce(`${w.things[i][1]}. ${w.things[i][2]} ${w.task(lit().length, w.things.length)}${kept ? "" : " I couldn't keep this on this device."}`);
        if (lit().length === w.things.length && !x.saved.found[k]) { x.saved.found[k] = new Date().toISOString(); x.save(); setTimeout(complete, x.reduced ? 0 : 900); }
      },
      ready(s) { for (const id of lit()) s.lit(id, true); },
      words() { x.hint("This view shows the world in words. Choose each one to light it."); },
    };
  },

  // ---- the Dream Architect: four choices make a place ----
  architect(x) {
    const { el } = x;
    const d = { ground: "meadow", sky: "dawn", build: "tower", life: "trees", name: "", ...(x.args.design ?? {}) };
    const opts = { design: { ...d } };
    const say = () => x.task(describe(d));
    const group = (key, label, entries) => el("fieldset", { class: "cw-chips" }, el("legend", {}, label),
      el("div", { role: "radiogroup", "aria-label": label }, entries.map(([v, text]) => el("button", { role: "radio", "aria-checked": String(d[key] === v), "data-v": v,
        onclick: (e) => { d[key] = v; e.currentTarget.parentNode.querySelectorAll("[role=radio]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.v === v))); x.scene?.api.apply(d); say(); x.announce(describe(d)); } }, text))));
    const name = el("input", { class: "field", id: "cw-aname", maxlength: "40", value: d.name, autocomplete: "off" });
    const mine = el("div", { class: "cw-mine" });
    const drawMine = () => mine.replaceChildren(...(x.saved.places.length ? [el("p", { class: "quiet small" }, `Your places (${x.saved.places.length})`),
      el("ul", { class: "cw-mini" }, x.saved.places.map((pl) => el("li", {}, el("button", { class: "text-btn", onclick: () => { Object.assign(d, pl); name.value = pl.name || ""; x.scene?.api.apply(d); say(); x.announce(`${pl.name || "Your place"}. ${describe(pl)}`); syncChips(); } }, pl.name || describe(pl)))))] : []));
    const panelEl = x.panel(
      group("ground", "Ground", Object.entries(ARCH.ground).map(([k, v]) => [k, v[0]])),
      group("sky", "Sky", Object.entries(ARCH.sky).map(([k, v]) => [k, v[0]])),
      group("build", "Something built", Object.entries(ARCH.build)),
      group("life", "Something alive", Object.entries(ARCH.life)),
      el("label", { for: "cw-aname", class: "cw-label" }, "Name it (optional)"), name,
      el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => keep() }, d.id ? "Keep the changes" : "Keep this place")),
      mine);
    const syncChips = () => panelEl.querySelectorAll("[role=radio]").forEach((b) => { const key = b.closest("fieldset").querySelector("legend").textContent; const map = { Ground: "ground", Sky: "sky", "Something built": "build", "Something alive": "life" }; b.setAttribute("aria-checked", String(d[map[key]] === b.dataset.v)); });
    function keep() {
      d.name = name.value.trim();
      if (x.careFor(d.name)) return;
      const rec = { id: d.id ?? `place-${Date.now().toString(36)}`, name: d.name, ground: d.ground, sky: d.sky, build: d.build, life: d.life, at: d.at ?? new Date().toISOString() };
      const i = x.saved.places.findIndex((p) => p.id === rec.id);
      if (i >= 0) x.saved.places[i] = rec; else { if (x.saved.places.length >= 12) { x.announce("You can keep twelve places. Let one go in the Creation Gallery first."); return; } x.saved.places.push(rec); }
      d.id = rec.id; d.at = rec.at;
      x.announce(x.save() ? `Kept: ${rec.name || "your place"}. It's in the Creation Gallery.` : "I couldn't keep this on this device.");
      drawMine();
    }
    x.tool("Design", (b) => { const o = panelEl.hidden; panelEl.hidden = !o; b.setAttribute("aria-expanded", String(o)); }).setAttribute("aria-expanded", "true");
    say(); drawMine();
    x.hint("Choose below and the place changes. Tap the building to light it.");
    return {
      opts,
      pick(id) { if (id !== "build") return; const on = !x.scene.api.lampOn; x.scene.api.lamp(on); x.sound.chime?.(on ? 880 : 660); x.quietHint(); x.announce(on ? "The light is on." : "The light is off."); },
      words() { x.hint("This view describes your place in words. Choose below and keep it."); },
    };
  },

  // ---- the Time Garden: moments become flowers ----
  garden(x) { return journal(x, { list: "moments", noun: "moment", what: "A moment to keep", max: 280, button: "Plant it", prefix: "m",
    task: (n) => (n ? `${n} ${n === 1 ? "moment" : "moments"} growing.` : "Nothing planted yet."),
    hint: "Write a moment below and plant it. Tap a flower to read it.", note: "Kept on this device. Each flower grows over a week of real time.",
    title: "A moment you kept", kept: "Planted. It will grow over the next week." }); },

  // ---- the Dream Realm: dreams become bubbles ----
  dreams(x) { return journal(x, { list: "dreams", noun: "dream", what: "The dream", max: 1200, button: "Keep this dream", prefix: "d", titled: true,
    task: (n) => (n ? `${n} ${n === 1 ? "dream" : "dreams"} floating.` : "No dreams kept yet."),
    hint: "Write a dream below. Tap a bubble to read it again.", note: "Dawnward doesn't interpret dreams. They're yours to wonder about. Kept on this device.",
    title: "A dream you kept", kept: "Kept. It floats here now." }); },

  // ---- the Temple of Stillness: a breathing practice ----
  stillness(x) {
    const { el } = x;
    const st = { min: 3, pace: [4, 6], running: false, t0: 0, used: 0, raf: 0, phase: "" };
    const cue = el("p", { class: "cw-cue", id: "cw-cue" }, "Ready when you are.");
    const left = el("p", { class: "quiet small", id: "cw-left" });
    const startB = el("button", { class: "primary", id: "cw-start", onclick: () => toggle() }, "Begin");
    const radios = (label, items, cur, set) => el("fieldset", { class: "cw-chips" }, el("legend", {}, label),
      el("div", { role: "radiogroup", "aria-label": label }, items.map(([v, t]) => el("button", { role: "radio", "aria-checked": String(cur() === v), "data-v": String(v),
        onclick: (e) => { set(v); e.currentTarget.parentNode.querySelectorAll("[role=radio]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.v === String(v)))); } }, t))));
    const lenR = radios("Length", [[1, "1 minute"], [3, "3 minutes"], [5, "5 minutes"]], () => st.min, (v) => { st.min = v; });
    x.panel(lenR,
      radios("Pace", [["calm", "Calm: in 4, out 6"], ["even", "Even: in 4, out 4"]], () => (st.pace[1] === 6 ? "calm" : "even"), (v) => { st.pace = v === "calm" ? [4, 6] : [4, 4]; }),
      cue, left, el("div", { class: "actions" }, startB),
      el("p", { class: "quiet small" }, "Follow the light: breathe in as it grows, out as it fades. If you feel light-headed, stop and breathe normally."));
    x.task("A light that breathes with you.");
    x.hint("Choose a length, then Begin. Or tap the light.");
    const tick = () => {
      const t = st.used + (performance.now() - st.t0) / 1000, total = st.min * 60, [a, b] = st.pace, cyc = a + b, c = t % cyc;
      const inhale = c < a, v = inhale ? c / a : 1 - (c - a) / b, phase = inhale ? "in" : "out";
      x.scene?.api.breath(v * v * (3 - 2 * v));
      const secs = Math.ceil(inhale ? a - c : cyc - c);
      cue.textContent = `${inhale ? "Breathe in" : "Breathe out"} · ${secs}`;
      if (phase !== st.phase) { st.phase = phase; x.sound.chime?.(inhale ? 196 : 164.81); }
      const rem = Math.max(0, Math.ceil(total - t)); left.textContent = `${Math.floor(rem / 60)}:${String(rem % 60).padStart(2, "0")} left`;
      if (t >= total) return done();
      st.raf = requestAnimationFrame(tick);
    };
    function toggle() {
      if (st.running) { st.used += (performance.now() - st.t0) / 1000; st.running = false; cancelAnimationFrame(st.raf); startB.textContent = "Carry on"; cue.textContent = "Paused."; x.announce("Paused."); return; }
      st.running = true; st.t0 = performance.now(); startB.textContent = "Pause"; x.quietHint();
      lenR.parentNode.querySelectorAll(".cw-chips").forEach((f) => (f.hidden = true));
      if (!st.used) x.announce(`Breathing for ${st.min} ${st.min === 1 ? "minute" : "minutes"}. In as the light grows, out as it fades.`);
      st.raf = requestAnimationFrame(tick);
    }
    function done() {
      st.running = false; st.used = 0; st.phase = ""; startB.textContent = "Begin";
      lenR.parentNode.querySelectorAll(".cw-chips").forEach((f) => (f.hidden = false)); cue.textContent = "Ready when you are."; left.textContent = ""; x.scene?.api.breath(0.3);
      x.card("Done", "That's all", el("p", { class: "quiet" }, "Nothing was recorded. Stay as long as you like."),
        el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => x.close() }, "Stay a while"), el("button", { class: "text-btn", onclick: () => x.leave() }, "Back to Spiritual Exploration")));
    }
    return {
      pick(id) { if (id === "orb") toggle(); },
      stop() { cancelAnimationFrame(st.raf); },
      words() { x.hint("The practice works in words too: follow the cues below."); },
    };
  },

  // ---- the Sound Sanctuary: singing bowls ----
  sanctuary(x) {
    let ctx = null, hum = null;
    const audio = () => { if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); } ctx.resume(); return ctx; };
    function bowl(f) {
      const c = audio(); if (!c) return;
      const t = c.currentTime, out = c.createGain(); out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(0.22, t + 0.01); out.gain.exponentialRampToValueAtTime(0.0001, t + 7); out.connect(c.destination);
      [[1, 1], [2.71, 0.45], [5.15, 0.2], [8.45, 0.08]].forEach(([m, a], i) => {
        for (const det of [-1.2, 1.2]) { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f * m + det * (i + 1) * 0.6; g.gain.value = a / 2; o.connect(g).connect(out); o.start(t); o.stop(t + 7.1); }
      });
    }
    x.task("Seven bowls on a stone floor.");
    x.hint("Tap a bowl to hear it. Each tap plays sound, even when the app's sound is off.");
    x.things(SANCT.map(([n, note], i) => ({ id: `bowl-${i}`, title: n, sub: `Tuned to ${note}`, meta: "Strike" })));
    x.tool("Hum", (b) => {
      const c = audio(); if (!c) return;
      if (hum) { hum.g.gain.setTargetAtTime(0, c.currentTime, 0.4); const h0 = hum; setTimeout(() => h0.oscs.forEach((o) => o.stop()), 1500); hum = null; b.setAttribute("aria-pressed", "false"); x.announce("Hum off."); return; }
      const g = c.createGain(); g.gain.value = 0; g.connect(c.destination); g.gain.setTargetAtTime(0.06, c.currentTime, 0.8);
      const oscs = [65.41, 98.0, 130.81].map((f, i) => { const o = c.createOscillator(); o.frequency.value = f + i * 0.15; o.connect(g); o.start(); return o; });
      hum = { g, oscs }; b.setAttribute("aria-pressed", "true"); x.announce("A low hum underneath.");
    }, false);
    return {
      pick(id) { const i = +id.split("-")[1]; if (!(i >= 0)) return; x.quietHint(); x.scene?.api.strike(i); bowl(SANCT[i][2]); },
      stop() { try { ctx?.close(); } catch {} },
      words() { x.hint("Strike the bowls from the list. Each tap plays sound."); },
    };
  },

  // ---- the Inner Cosmos: six invitations ----
  cosmos(x) {
    const { el } = x;
    x.task("Six bright stars. Each holds a small invitation.");
    x.hint("Drag to look around. Tap a bright star.");
    x.things(STARS.map(([n], i) => ({ id: `star-${i}`, title: n, meta: "Look" })));
    return {
      pick(id) {
        const i = +id.split("-")[1], s = STARS[i]; if (!s) return;
        x.quietHint(); x.scene?.api.seen(i); x.sound.chime?.([523.25, 587.33, 659.25, 783.99, 880, 987.77][i]);
        x.card(s[0], s[1], el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => x.close() }, "Close")));
      },
      words() { x.hint("Choose a star from the list to read its invitation."); },
    };
  },

  // ---- the Cosmic Observatory ----
  observatory(x) {
    const { el } = x;
    x.task("Sizes and distances are squeezed to fit. Years keep their true proportions: Earth goes round once every 24 seconds.");
    x.hint("Drag to look around. Tap the Sun or a planet.");
    x.things(BODIES.map((b) => ({ id: b.id, title: FACTS[b.id][0], sub: FACTS[b.id][1], meta: "Learn" })));
    const play = x.tool(x.reduced ? "Play orbits" : "Pause orbits", (b) => { const on = !x.scene?.api.running; x.scene?.api.run(on); b.textContent = on ? "Pause orbits" : "Play orbits"; x.announce(on ? "Orbits moving." : "Orbits paused."); });
    void play;
    return {
      pick(id) {
        const f = FACTS[id]; if (!f) return;
        x.quietHint(); x.scene?.api.select(id);
        x.card("Draft · awaiting a reviewer's check", f[0], el("p", {}, f[1]), el("ul", { class: "cw-facts" }, f[2].map((t) => el("li", {}, t))),
          el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => { x.scene?.api.select(null); x.close(); } }, "Close")));
      },
      words() { x.hint("Choose the Sun or a planet from the list."); },
    };
  },

  // ---- the Discovery Lab: gravity ----
  lab(x) {
    const { el } = x;
    let orbited = false;
    const stat = el("p", { class: "cw-task", id: "cw-labstat", "aria-live": "polite" }, "No moons yet.");
    const count = (n) => { stat.textContent = n ? `${n} ${n === 1 ? "moon" : "moons"} in the sky.` : "No moons in the sky."; };
    const btn = (label, fn) => el("button", { class: "ghost", onclick: fn, disabled: x.words ? "" : null }, label);
    const opts = { onEvent(kind, n) {
      count(n);
      if (kind === "fell") x.announce("A moon fell into the star.");
      if (kind === "escaped") x.announce("A moon escaped into space.");
      if (kind === "orbit" && !orbited) { orbited = true; x.announce("A moon went all the way round."); }
    } };
    x.panel(
      el("div", { class: "actions cw-labbtns" },
        btn("A circle", () => x.scene?.api.throw("circle")), btn("An oval", () => x.scene?.api.throw("oval")),
        btn("Too slow", () => x.scene?.api.throw("slow")), btn("Too fast", () => x.scene?.api.throw("fast")),
        btn("Clear", () => { x.scene?.api.clear(); count(0); x.announce("The sky is clear."); })),
      stat,
      el("p", { class: "quiet small" }, "Drag from anywhere to throw a moon, or tap to place one in a circle. Closer orbits go faster. Too slow and a moon falls in; too fast and it escapes."));
    x.task("A star, and real gravity.");
    x.hint("Drag to throw a moon. Tap to place one in a circle.");
    return {
      opts,
      words() { stat.textContent = "This lab needs 3D drawing, which isn't available here. The idea: a moon falls toward the star all the time, but moves sideways fast enough to keep missing it. That's an orbit."; },
    };
  },
};

/** The Time Garden and the Dream Realm: things you write become things in the world. */
function journal(x, c) {
  const { el } = x, items = () => x.saved[c.list];
  const titleIn = c.titled ? el("input", { class: "field", id: "cw-jtitle", maxlength: "60", autocomplete: "off" }) : null;
  const text = el("textarea", { id: "cw-jtext", maxlength: String(c.max), rows: "3" });
  const draw = () => {
    x.task(c.task(items().length));
    x.things([...items()].reverse().map((m) => ({ id: m.id, title: clip(m.title || m.text), sub: day(m.at), meta: "Read" })));
  };
  const panelEl = x.panel(
    titleIn ? el("label", { for: "cw-jtitle", class: "cw-label" }, "A title (optional)") : null, titleIn,
    el("label", { for: "cw-jtext", class: "cw-label" }, c.what), text,
    el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => add() }, c.button)),
    el("p", { class: "quiet small" }, c.note));
  const writeB = x.tool("Write", () => fold(panelEl.hidden));
  writeB.setAttribute("aria-expanded", "true");
  const fold = (open) => { panelEl.hidden = !open; writeB.setAttribute("aria-expanded", String(open)); if (open) text.focus(); };
  x.hint(c.hint);
  draw();
  function add() {
    const t = text.value.trim();
    if (!t) { x.announce("Write a few words first."); text.focus(); return; }
    const m = { id: `${c.prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, text: t, at: new Date().toISOString(), ...(titleIn && titleIn.value.trim() ? { title: titleIn.value.trim() } : {}) };
    x.saved[c.list] = [...items(), m];
    if (!x.save()) { x.saved[c.list] = items().filter((y) => y.id !== m.id); x.announce("I couldn't keep this on this device. Your words are still in the box."); return; }
    text.value = ""; if (titleIn) titleIn.value = "";
    if (!x.words) fold(false);
    x.scene?.api.add(m, items().length - 1);
    draw(); x.quietHint();
    x.sound.chime?.(784);
    if (!x.careFor(`${m.title ?? ""} ${t}`)) x.announce(c.kept);
  }
  function read(id) {
    const m = items().find((y) => y.id === id); if (!m) return;
    x.scene?.api.show(id);
    const ask = el("div", { class: "actions" });
    const base = () => ask.replaceChildren(
      el("button", { class: "primary", onclick: () => { x.scene?.api.show(null); x.close(); } }, "Close"),
      el("button", { class: "ghost", onclick: () => ask.replaceChildren(el("p", { class: "quiet" }, `Let this ${c.noun} go? It will be deleted from this device.`),
        el("button", { class: "danger", onclick: () => { x.saved[c.list] = items().filter((y) => y.id !== id); x.save(); x.scene?.api.remove(id); draw(); x.close(); x.announce(`The ${c.noun} was let go.`); } }, "Let it go"),
        el("button", { class: "ghost", onclick: base }, "Keep it")) }, "Let it go"));
    base();
    x.card(day(m.at), m.title || c.title, ...m.text.split(/\n+/).map((p) => el("p", {}, p)), ask);
  }
  return { opts: { [c.list]: items() }, pick: read, words() { x.hint(`Write below. What you keep is listed under Things here.`); } };
}

// The floating temple: gold line art around a doorway of light. The door's colour
// follows the destination you're looking at (--door).
const TEMPLE = `<svg viewBox="0 0 320 300" role="presentation">
  <defs>
    <radialGradient id="cw-dl" cx="50%" cy="60%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="var(--door)"/><stop offset="1" stop-color="var(--door)" stop-opacity="0"/></radialGradient>
    <linearGradient id="cw-rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a62"/><stop offset="1" stop-color="#1a1430" stop-opacity="0"/></linearGradient>
    <filter id="cw-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  <path d="M40 222 Q160 300 280 222 L250 236 Q160 330 70 236 Z" fill="url(#cw-rock)"/>
  <path d="M60 230 L160 292 L260 230" fill="none" stroke="#6b5a8a" stroke-width="1" opacity=".6"/>
  <ellipse cx="160" cy="222" rx="122" ry="18" fill="#2a2244" stroke="#E6C07B" stroke-opacity=".55"/>
  <path d="M96 212 h128 M104 204 h112" stroke="#E6C07B" stroke-opacity=".7"/>
  <g class="cw-glowdoor"><path d="M126 204 V120 A34 34 0 0 1 194 120 V204 Z" fill="url(#cw-dl)" filter="url(#cw-glow)" opacity=".9"/></g>
  <path d="M130 204 V122 A30 30 0 0 1 190 122 V204 Z" fill="url(#cw-dl)"/>
  <path d="M130 204 V122 A30 30 0 0 1 190 122 V204" fill="none" stroke="#F0D6A2" stroke-width="1.5"/>
  <g fill="none" stroke="#E6C07B" stroke-width="1.4" stroke-opacity=".9">
    <path d="M100 204 V104 M112 204 V104 M208 204 V104 M220 204 V104"/>
    <path d="M94 104 h24 M202 104 h24 M94 98 h24 M202 98 h24"/>
    <path d="M88 98 Q160 26 232 98"/><path d="M100 98 Q160 42 220 98"/>
    <circle cx="160" cy="52" r="5"/>
  </g>
</svg>`;
