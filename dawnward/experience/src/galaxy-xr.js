// Prototype C: the Memory Galaxy in 3D and, where the browser offers it, in
// WebXR. It renders the same /galaxy contract as the app's list and sky, so
// nothing here is decoration: a star is an evening, a line is a belief two
// evenings share. Without WebXR or WebGL the list beside it is the whole
// experience. Read-only: changes happen in the app.
import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { buildScene } from "./galaxy-scene.js";

const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const CONFIDENCE = { hypothesis: "A guess", probable: "Probably true", established: "Well established" };
const GOLD = new THREE.Color("#C9A96A");

function hash(id, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  // Final mix: without it, ids that differ only in their last character
  // (sample-0, sample-1) land at almost the same height.
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967295;
}
const date = (d) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

// ---------- Data: the person's galaxy, or a clearly labelled sample ----------

function sampleGalaxy() {
  const words = [
    ["2026-09-02", "Started the list on paper again. Did the first three before lunch."],
    ["2026-09-04", "Skipped the walk. Felt it in the afternoon."],
    ["2026-09-07", "Wrote tomorrow down and kept to it, even the hard call."],
    ["2026-09-09", "A long talk with my sister. We laughed about the old flat."],
    ["2026-09-12", "Walked at lunch and the afternoon was clearer."],
    ["2026-09-15", "Planned the week on Sunday night. It held until Thursday."],
    ["2026-09-18", "Called my sister back. Easier than I thought."],
    ["2026-09-21", "Walked before the meeting. Said what I meant."],
  ];
  const stars = words.map(([d, t], i) => ({ id: `sample-${i}`, date: d, excerpt: t, themeIds: [] }));
  const themes = [
    { id: "t1", statement: "Writing the day down helps you keep to it.", confidence: "probable", why: "Seen in three of your evenings.", starIds: ["sample-0", "sample-2", "sample-5"], forming: false },
    { id: "t2", statement: "A walk at midday changes your afternoon.", confidence: "probable", why: "Seen in three of your evenings.", starIds: ["sample-1", "sample-4", "sample-7"], forming: false },
    { id: "t3", statement: "Your sister is someone you return to.", confidence: "hypothesis", why: "Seen in two evenings so far.", starIds: ["sample-3", "sample-6"], forming: true },
  ];
  for (const t of themes) for (const id of t.starIds) stars.find((s) => s.id === id).themeIds.push(t.id);
  const links = themes.flatMap((t) => t.starIds.slice(1).map((to, i) => ({ from: t.starIds[i], to, themeId: t.id })));
  return { world: "all", stars, themes, links };
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

async function loadGalaxy() {
  // A token in the fragment never reaches a server log; it is read once and
  // removed from the address bar straight away.
  const params = new URLSearchParams(location.hash.slice(1));
  const token = params.get("token");
  if (!token) return { galaxy: sampleGalaxy(), sample: true };
  history.replaceState(null, "", location.pathname + location.search);
  // The token only ever goes to this page's own origin, or to a local
  // development server. A link cannot point it anywhere else.
  const api = trustedApi(new URLSearchParams(location.search).get("api"));
  if (!api) throw new Error("untrusted api origin");
  const res = await fetch(`${api}/galaxy?world=all`, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`galaxy ${res.status}`);
  return { galaxy: await res.json(), sample: false };
}

// ---------- Selection: one state for the list, the panel and the scene ----------

function main({ galaxy, sample }) {
  $("source").textContent = sample
    ? "Sample galaxy. These are invented evenings, not anyone's."
    : `Your galaxy: ${galaxy.stars.length} ${galaxy.stars.length === 1 ? "evening" : "evenings"}, ${galaxy.themes.length} ${galaxy.themes.length === 1 ? "thing" : "things"} they support.`;
  if (sample) $("source").className = "sample";

  const themesById = new Map(galaxy.themes.map((t) => [t.id, t]));
  const ctx = galaxy.stars.length ? buildScene(galaxy, { hash, reduced, stage: $("stage") }) : null;
  let selected = null;

  function select(sel) {
    selected = sel;
    const panel = $("panel");
    const lit = new Set();
    let litTheme = new Set();
    if (sel?.kind === "star") {
      const s = galaxy.stars.find((x) => x.id === sel.id);
      litTheme = new Set(s.themeIds);
      s.themeIds.forEach((t) => themesById.get(t).starIds.forEach((id) => lit.add(id)));
      lit.add(s.id);
      panel.innerHTML = "";
      const when = document.createElement("p"); when.className = "when"; when.textContent = date(s.date);
      const q = document.createElement("q"); q.textContent = s.excerpt;
      panel.append(when, q);
      for (const t of s.themeIds.map((id) => themesById.get(id))) {
        const b = document.createElement("button"); b.textContent = `Supports: ${t.statement}`;
        b.addEventListener("click", () => { select({ kind: "theme", id: t.id }); panel.querySelector(".statement")?.focus(); });
        panel.append(b);
      }
      if (!s.themeIds.length) { const p = document.createElement("p"); p.className = "why"; p.textContent = "Not linked to anything yet. That takes more than one evening."; panel.append(p); }
      ctx?.drawCard([date(s.date), `“${s.excerpt}”`]);
    } else if (sel?.kind === "theme") {
      const t = themesById.get(sel.id);
      litTheme = new Set([t.id]);
      t.starIds.forEach((id) => lit.add(id));
      panel.innerHTML = "";
      const when = document.createElement("p"); when.className = "when"; when.textContent = t.forming ? "Still forming" : CONFIDENCE[t.confidence];
      const st = document.createElement("p"); st.className = "statement"; st.textContent = t.statement;
      st.tabIndex = -1; // focus lands here when the button that opened it disappears
      const why = document.createElement("p"); why.className = "why"; why.textContent = `${t.why} To correct it, use That's not right in the app.`;
      panel.append(when, st, why);
      ctx?.drawCard([t.forming ? "Still forming" : CONFIDENCE[t.confidence], t.statement]);
    }
    panel.classList.toggle("on", Boolean(sel));
    document.querySelectorAll("li button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === sel?.id)));

    if (!ctx) return;
    ctx.setSelection({ litIds: lit, selId: sel?.kind === "star" ? sel.id : null, litThemes: litTheme });
    const anchor = sel?.kind === "star" ? ctx.worldPositionOf(sel.id) : sel ? ctx.worldPositionOf(themesById.get(sel.id).starIds[0]) : null;
    ctx.card.visible = Boolean(anchor) && ctx.renderer.xr.isPresenting;
    if (anchor) ctx.card.position.set(anchor.x + 0.7, anchor.y + 0.35, anchor.z + 0.3);
  }

  // The accessible list: the complete experience on its own.
  const themesUl = $("themes"), starsUl = $("stars");
  for (const t of galaxy.themes) {
    const li = document.createElement("li"), b = document.createElement("button");
    b.dataset.id = t.id;
    b.innerHTML = `<span class="when"></span><span class="text"></span>`;
    b.querySelector(".when").textContent = `${t.forming ? "Still forming" : CONFIDENCE[t.confidence]} · ${t.starIds.length} ${t.starIds.length === 1 ? "evening" : "evenings"}`;
    b.querySelector(".text").textContent = t.statement;
    b.addEventListener("click", () => select({ kind: "theme", id: t.id }));
    li.append(b); themesUl.append(li);
  }
  for (const s of [...galaxy.stars].reverse()) {
    const li = document.createElement("li"), b = document.createElement("button");
    b.dataset.id = s.id;
    b.innerHTML = `<span class="when"></span><span class="text"></span>`;
    b.querySelector(".when").textContent = date(s.date);
    b.querySelector(".text").textContent = s.excerpt;
    b.addEventListener("click", () => select({ kind: "star", id: s.id }));
    li.append(b); starsUl.append(li);
  }
  if (!galaxy.stars.length) {
    $("stage").textContent = "";
    const p = document.createElement("p"); p.className = "note"; p.style.padding = "24px";
    p.textContent = "No evenings yet. Each one you share becomes a star here.";
    $("stage").append(p);
    return;
  }

  // ---------- Interaction: pointer, keyboard, controllers ----------
  const { renderer, scene } = ctx;
  function pick(origin, direction) {
    const id = ctx.pick(origin, direction);
    if (id) select({ kind: "star", id });
  }
  const ndcOf = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  let downX = 0;
  renderer.domElement.addEventListener("pointerdown", (e) => { downX = e.clientX; });
  renderer.domElement.addEventListener("click", (e) => {
    if (Math.abs(e.clientX - downX) > 6) return; // that was a drag, not a tap
    const id = ctx.pickScreen(ndcOf(e));
    if (id) select({ kind: "star", id });
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    renderer.domElement.style.cursor = ctx.pickScreen(ndcOf(e)) ? "pointer" : "grab";
  });

  // Gentle yaw only, capped, with a stationary sky behind it (visionOS HIG:
  // never spin the world; keep a stable frame of reference).
  let yaw = 0, dragging = null;
  const MAX_YAW = 0.45;
  renderer.domElement.addEventListener("pointerdown", (e) => { dragging = e.clientX; });
  addEventListener("pointerup", () => { dragging = null; });
  addEventListener("pointermove", (e) => {
    if (dragging === null) return;
    yaw = Math.max(-MAX_YAW, Math.min(MAX_YAW, yaw + (e.clientX - dragging) * 0.003));
    dragging = e.clientX;
  });
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute("aria-label", "Three-dimensional view of your evenings. Arrow keys turn it gently. The list beside it has the same content.");
  renderer.domElement.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") yaw = Math.max(-MAX_YAW, yaw - 0.08);
    if (e.key === "ArrowRight") yaw = Math.min(MAX_YAW, yaw + 0.08);
  });

  for (const i of [0, 1]) {
    const controller = renderer.xr.getController(i);
    const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -4)]), new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.5 }));
    controller.add(beam);
    controller.addEventListener("select", () => {
      const origin = new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld);
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion().setFromRotationMatrix(controller.matrixWorld));
      pick(origin, dir);
      if (selected) select(selected); // refresh the floating card now that we are presenting
    });
    scene.add(controller);
  }

  $("vr").append(VRButton.createButton(renderer));

  function resize() {
    const r = $("stage").getBoundingClientRect();
    ctx.resize(r.width, r.height);
  }
  addEventListener("resize", resize);
  resize();

  // Frame times for QA (window.__dwFrames), measured, never assumed.
  // A governor drops bloom and pixels if frames run long (measured, not assumed).
  const frames = (window.__dwFrames = []);
  let last = performance.now();
  renderer.setAnimationLoop((now) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    frames.push(now - last); last = now;
    if (frames.length > 600) frames.shift();
    if (ctx.bloomOn && frames.length === 180) {
      const sorted = frames.slice(60).sort((a, b) => a - b);
      if (sorted[Math.floor(sorted.length / 2)] > 28) { ctx.degrade(); window.__dwDegraded = true; }
    }
    ctx.frame(dt, yaw);
  });
  window.__dwGalaxyReady = true;
}

loadGalaxy()
  .then(main)
  .catch(() => {
    main({ galaxy: sampleGalaxy(), sample: true });
    // After main(), which would otherwise replace this with the plain label.
    $("source").textContent = "I couldn't load your galaxy, so this is the sample. These are invented evenings, not anyone's.";
  });
