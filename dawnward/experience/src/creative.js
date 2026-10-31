// Creative Worlds: the galaxy page, the Infinite Door, and the worlds it opens.
// The 3D lives in creative-scene.js and loads only when a world opens.
// Everything you can touch in a world is also a button in "Things here", so the
// worlds work with a keyboard, a screen reader, the text view, or no WebGL at all.
// Progress is what you've lit, kept on this device. No scores, no streaks.

const KEY = "dw-creative-v1";
const RANK = { free: 0, plus: 1, pro: 2 };

/** The worlds behind the door. Copy is plain; nothing claims to change you. */
export const CW = {
  kingdom: {
    name: "The Floating Kingdom", access: "free", hue: "#F2B880", sky: "linear-gradient(180deg,#2a1d4a,#8a4f7d 55%,#f2b880)",
    line: "Islands drifting above a sea of clouds, and a castle with golden roofs.",
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
    name: "The Living Forest", access: "plus", hue: "#5FE3C0", sky: "linear-gradient(180deg,#02060c,#06231f 60%,#0d3b33)",
    line: "A night forest that glows when you come close. Fireflies follow your hand.",
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
export const PLANETS = [
  { id: "door", name: "The Infinite Door", status: "open", line: "The way in. Choose where it opens." },
  { id: "kingdom", name: CW.kingdom.name, status: "open", line: CW.kingdom.line },
  { id: "forest", name: CW.forest.name, status: "open", line: CW.forest.line },
  { id: "architect", name: "The Dream Architect", status: "planned", line: "Build a place from a few words and walk into it." },
  { id: "garden", name: "The Time Garden", status: "planned", line: "A garden that grows from the moments you choose to keep." },
];

function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || "{}"); return { lit: { kingdom: [], forest: [], ...(s.lit ?? {}) }, found: s.found ?? {} }; } catch { return { lit: { kingdom: [], forest: [] }, found: {} }; } }

export function createCreative(h) {
  const { $, el, svg, ICON, asset, sound, announce } = h;
  const root = $("creative"), page = $("cw-page"), door = $("cw-door"), stage = $("cw-stage");
  let view = "galaxy", kind = null, scene = null, saved = load(), sceneMod = null, keyHandler = null;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); return true; } catch { return false; } };
  const member = () => RANK[h.explore.plan()] >= RANK.plus;
  const locked = (k) => RANK[CW[k].access] > RANK[h.explore.plan()];

  function route() { return view === "galaxy" || view === "gate" ? "#/universe/creative" : view === "door" ? "#/creative/door" : `#/creative/${kind}`; }
  function show(v) {
    view = v;
    page.hidden = !(v === "galaxy" || v === "gate"); door.hidden = v !== "door"; stage.hidden = v !== "world";
    root.classList.toggle("immersive", v === "door" || v === "world");
    if (v !== "world") closeWorld();
    h.showPlace("creative");
  }

  // ---------------- the galaxy page ----------------
  function open() {
    show("galaxy");
    const count = (k) => saved.lit[k].length, of = (k) => CW[k].things.length;
    page.replaceChildren(el("div", { class: "ycol" },
      h.crumbs([{ label: "Universe", go: h.toUniverse }, { label: "Creative Worlds" }]),
      el("div", { class: "cw-hero" }, el("img", { src: asset("img/art/A6.webp"), alt: "" })),
      el("p", { class: "kicker" }, "Galaxy · open · the first world is free"),
      el("h2", { class: "s-title", id: "cw-title", tabindex: "-1" }, "Creative Worlds"),
      el("p", { class: "lead" }, "Places to wander, play and make things. Step through the Infinite Door and choose where it opens."),
      el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => openDoor() }, "Open the Infinite Door")),
      el("h3", { class: "cw-h" }, "Planets here"),
      el("ul", { class: "cw-planets" }, PLANETS.map((p) => {
        const w = CW[p.id], lock = w && locked(p.id);
        const meta = p.status === "planned" ? "Planned" : w ? (lock ? "Members" : `${count(p.id)} of ${of(p.id)} ${w.access === "free" ? "· free" : ""}`.trim()) : "Open";
        const body = [el("span", { class: `cw-dot cw-${p.id}`, "aria-hidden": "true" }),
          el("span", { class: "rtext" }, el("span", { class: "rtitle" }, p.name), el("span", { class: "rsub" }, p.line),
            saved.found[p.id] ? el("span", { class: "cw-found" }, `Discovered: ${w.done.toLowerCase()}`) : null),
          el("span", { class: `mmeta${lock ? " plus-tag" : ""}` }, meta)];
        return el("li", {}, p.status === "planned" ? el("div", { class: "row planned" }, ...body)
          : el("button", { class: "row", onclick: () => (p.id === "door" ? openDoor() : enter(p.id)) }, ...body));
      })),
      el("p", { class: "quiet small" }, "Drawn live on your device. What you light is kept on this device. Nothing here is scored."),
      el("div", { class: "actions" }, el("button", { class: "ghost", onclick: h.toUniverse }, "Back to the Universe"))));
    root.scrollTop = 0;
    $("cw-title").focus({ preventScroll: true });
    announce("Creative Worlds.");
  }

  // ---------------- members ----------------
  function gate(k) {
    show("gate");
    const w = CW[k];
    page.replaceChildren(el("div", { class: "ycol" },
      h.crumbs([{ label: "Universe", go: h.toUniverse }, { label: "Creative Worlds", go: open }, { label: w.name }]),
      el("p", { class: "kicker plus-kicker" }, "Dawnward Plus"),
      el("h2", { class: "s-title", id: "cw-title", tabindex: "-1" }, w.name),
      el("p", { class: "lead" }, w.line),
      el("section", { class: "card plus-card", "aria-labelledby": "cw-plus-h" },
        el("h3", { id: "cw-plus-h" }, "This world is for members"),
        el("p", {}, "Members get every world behind the Infinite Door as it opens, with every chapter and expedition in Learn."),
        el("p", { class: "quiet" }, "Membership isn't open yet. It opens after the beta, with a reminder before any charge and one-tap cancel.")),
      el("div", { class: "actions" },
        h.explore.store?.local ? el("button", { class: "primary", onclick: async () => { await h.explore.setPlan("plus"); announce("Member preview on, on this device only."); enter(k); } }, "Preview as a member") : null,
        el("button", { class: "ghost", onclick: () => enter("kingdom") }, `Free now: ${CW.kingdom.name}`),
        el("button", { class: "text-btn", onclick: open }, "Back to Creative Worlds"))));
    $("cw-title").focus({ preventScroll: true });
  }

  // ---------------- the Infinite Door ----------------
  // A dive toward the planet, clouds part, a floating temple with a glowing door.
  // Skip finishes it at once. Reduced motion shows the temple still.
  let anims = [];
  function openDoor() {
    show("door");
    const still = reduced();
    const choices = el("div", { class: "cw-choices", role: "group", "aria-label": "Where should the door open?" },
      ...["kingdom", "forest"].map((k) => el("button", { class: `cw-choice cw-${k}`, "data-k": k,
        onfocus: () => door.style.setProperty("--door", CW[k].hue), onmouseenter: () => door.style.setProperty("--door", CW[k].hue),
        onclick: () => through(k) },
        el("span", { class: "cw-swatch", "aria-hidden": "true", style: `background:${CW[k].sky}` }),
        el("span", { class: "rtext" }, el("span", { class: "rtitle" }, CW[k].name), el("span", { class: "rsub" }, CW[k].line)),
        locked(k) ? el("span", { class: "mmeta plus-tag" }, "Members") : null)));
    door.replaceChildren(
      el("div", { class: "cw-sky", "aria-hidden": "true" }),
      el("img", { class: "cw-dive", src: asset("img/art/A6.webp"), alt: "", "aria-hidden": "true" }),
      el("div", { class: "cw-temple", "aria-hidden": "true", html: TEMPLE }),
      el("div", { class: "cw-cloud l", "aria-hidden": "true" }), el("div", { class: "cw-cloud r", "aria-hidden": "true" }),
      el("div", { class: "cw-light", "aria-hidden": "true" }),
      el("div", { class: "cw-dtop" },
        el("button", { class: "text-btn back", onclick: open }, el("span", { html: svg(ICON.back, 16) }), " Creative Worlds"),
        el("button", { class: "ghost cw-skip", onclick: finish }, "Skip")),
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
    if (locked(k)) { gate(k); return; }
    finish();
    door.style.setProperty("--door", CW[k].hue);
    const light = door.querySelector(".cw-light");
    sound.chime?.(CW[k].notes[2]);
    if (reduced()) { enter(k); return; }
    light.animate([{ transform: "translate(-50%,-50%) scale(.05)", opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: "translate(-50%,-50%) scale(3)", opacity: 1 }], { duration: 900, easing: "cubic-bezier(.5,0,.2,1)", fill: "both" })
      .finished.then(() => enter(k, { fromDoor: true })).catch(() => enter(k));
  }

  // ---------------- a world ----------------
  async function enter(k, { fromDoor = false } = {}) {
    if (!CW[k]) return open();
    if (locked(k)) return gate(k);
    kind = k; show("world");
    const w = CW[k];
    stage.dataset.k = k;
    stage.style.setProperty("--sky", w.sky);
    const host = el("div", { class: "cw-host" });
    const count = el("p", { class: "cw-task", id: "cw-task" });
    const list = el("ul", { class: "cw-list", id: "cw-list", hidden: "" });
    const toggle = el("button", { class: "ghost cw-tool", "aria-expanded": "false", "aria-controls": "cw-list", onclick: () => { const o = list.hidden; list.hidden = !o; toggle.setAttribute("aria-expanded", String(o)); if (o) list.querySelector("button")?.focus(); } }, "Things here");
    const sbtn = el("button", { class: "ghost cw-tool", "aria-pressed": String(!!sound.on), onclick: () => { $("y-sound").click(); sbtn.setAttribute("aria-pressed", String(!!sound.on)); sbtn.textContent = sound.on ? "Sound on" : "Sound off"; } }, sound.on ? "Sound on" : "Sound off");
    const hint = el("p", { class: "cw-hint", id: "cw-hint" }, w.hint);
    const card = el("section", { class: "cw-card glass", hidden: "", "aria-labelledby": "cw-done-h" });
    stage.replaceChildren(host,
      el("div", { class: "cw-hud" },
        el("div", { class: "cw-top" },
          el("button", { class: "text-btn back", onclick: () => leave() }, el("span", { html: svg(ICON.back, 16) }), " Leave"),
          el("div", { class: "cw-tools" }, sbtn, toggle)),
        el("div", { class: "cw-head" }, el("p", { class: "kicker" }, "Creative Worlds"), el("h2", { class: "s-title", id: "cw-wname", tabindex: "-1" }, w.name), count),
        list, hint),
      card);
    const draw = () => {
      const lit = saved.lit[k];
      count.textContent = w.task(lit.length, w.things.length);
      list.replaceChildren(...w.things.map(([id, name, line]) => {
        const on = lit.includes(id);
        return el("li", {}, el("button", { class: `row${on ? " lit" : ""}`, "data-id": id, onclick: () => pick(id) },
          el("span", { class: "cw-bulb", "aria-hidden": "true" }),
          el("span", { class: "rtext" }, el("span", { class: "rtitle" }, name), el("span", { class: "rsub" }, on ? line : `${w.verb} the ${w.noun}`)),
          el("span", { class: "mmeta" }, on ? "Lit" : w.verb)));
      }));
    };
    const pick = (id) => {
      const i = w.things.findIndex((t) => t[0] === id); if (i < 0) return;
      sound.chime?.(w.notes[i]);
      hint.classList.add("gone");
      if (saved.lit[k].includes(id)) { scene?.lit(id, true); return; }
      saved.lit[k] = [...saved.lit[k], id];
      const kept = save();
      scene?.lit(id, true);
      draw();
      announce(`${w.things[i][1]}. ${w.things[i][2]} ${w.task(saved.lit[k].length, w.things.length)}${kept ? "" : " I couldn't keep this on this device."}`);
      if (saved.lit[k].length === w.things.length && !saved.found[k]) {
        saved.found[k] = new Date().toISOString(); save();
        setTimeout(() => complete(), reduced() ? 0 : 900);
      }
    };
    const complete = () => {
      [0, 2, 4].forEach((n, j) => setTimeout(() => sound.chime?.(w.notes[n] * 2), j * 220));
      card.replaceChildren(
        el("p", { class: "kicker" }, "Discovered"),
        el("h3", { id: "cw-done-h", tabindex: "-1" }, w.done),
        el("p", { class: "quiet" }, w.carry),
        el("div", { class: "actions" },
          el("button", { class: "primary", onclick: () => { card.hidden = true; $("cw-wname").focus(); } }, "Stay a while"),
          el("button", { class: "ghost", onclick: () => openDoor() }, "Choose another door"),
          el("button", { class: "text-btn", onclick: () => leave() }, "Back to Creative Worlds")));
      list.hidden = true; toggle.setAttribute("aria-expanded", "false");
      card.hidden = false;
      $("cw-done-h").focus();
    };
    draw();
    $("cw-wname").focus({ preventScroll: true });
    announce(`${w.name}. ${w.line} ${w.task(saved.lit[k].length, w.things.length)} Use Things here for a list.`);
    // the world itself: only drawn when the device can, and not in the text view
    if (h.textMode() || !hasGL()) { stage.classList.add("words"); list.hidden = false; toggle.setAttribute("aria-expanded", "true");
      hint.textContent = "This view shows the world in words. Choose each one to light it."; return; }
    stage.classList.remove("words");
    try {
      sceneMod ??= await import("./creative-scene.js");
      if (view !== "world" || kind !== k) return; // left while loading
      scene = sceneMod.buildWorld(k, { host, reduced: reduced(), onPick: pick });
      for (const id of saved.lit[k]) scene.lit(id, true);
      window.__dwCreative = scene;
    } catch (e) {
      stage.classList.add("words"); list.hidden = false; toggle.setAttribute("aria-expanded", "true");
      hint.textContent = "This device couldn't draw the world, so here it is in words.";
    }
    if (fromDoor && !reduced()) stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: "ease-out" });
    keyHandler = (e) => {
      if (view !== "world" || e.target.closest?.("input,textarea")) return;
      const m = { ArrowLeft: [0.25, 0, 1], ArrowRight: [-0.25, 0, 1], ArrowUp: [0, 0.12, 1], ArrowDown: [0, -0.12, 1], "+": [0, 0, 0.85], "=": [0, 0, 0.85], "-": [0, 0, 1.18] }[e.key];
      if (m && scene && !e.target.closest?.("button")) { e.preventDefault(); scene.nudge(...m); }
    };
    addEventListener("keydown", keyHandler);
  }
  function closeWorld() {
    if (keyHandler) { removeEventListener("keydown", keyHandler); keyHandler = null; }
    if (scene) { scene.dispose(); scene = null; window.__dwCreative = null; }
  }
  function leave() { closeWorld(); open(); }
  function close() { if (view === "world" || view === "door") { closeWorld(); view = "galaxy"; root.classList.remove("immersive"); } }
  /** Escape steps back one level: world or door to the galaxy page, the page to the Universe. */
  function escape() { if (view === "world" || view === "door") leave(); else if (view === "gate") open(); else h.toUniverse(); }
  function follow(part) { if (part === "door") openDoor(); else if (CW[part]) enter(part); else open(); }
  return { open, openDoor, enter, follow, close, route, escape, get view() { return view; }, get progress() { return saved; } };
}

function hasGL() { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } }

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
