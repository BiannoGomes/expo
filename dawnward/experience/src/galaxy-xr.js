// Prototype C: the Memory Galaxy in 3D and, where the browser offers it, in
// WebXR. It renders the same /galaxy contract as the app's list and sky, so
// nothing here is decoration: a star is an evening, a line is a belief two
// evenings share. Without WebXR or WebGL the list beside it is the whole
// experience. Read-only: changes happen in the app.
import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";

const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const CONFIDENCE = { hypothesis: "A guess", probable: "Probably true", established: "Well established" };
const GOLD = new THREE.Color("#C9A96A");
const INK = new THREE.Color("#ECE9E2");
const DIM = new THREE.Color("#5E6570");

function hash(id, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
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

async function loadGalaxy() {
  // A token in the fragment never reaches a server log; it is read once and
  // removed from the address bar straight away.
  const params = new URLSearchParams(location.hash.slice(1));
  const token = params.get("token");
  const api = new URLSearchParams(location.search).get("api") ?? "http://localhost:3000";
  if (!token) return { galaxy: sampleGalaxy(), sample: true };
  history.replaceState(null, "", location.pathname + location.search);
  const res = await fetch(`${api}/galaxy?world=all`, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`galaxy ${res.status}`);
  return { galaxy: await res.json(), sample: false };
}

// ---------- Scene ----------

function buildScene(galaxy) {
  const stage = $("stage");
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.xr.enabled = true;
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#04060A");
  const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 100);
  camera.position.set(0, 1.6, 1.8);
  camera.lookAt(0, 1.5, -2.5);

  // The galaxy sits at human scale in front of you, oldest evening on the left.
  const world = new THREE.Group();
  scene.add(world);
  const n = galaxy.stars.length;
  const pos = new Map(galaxy.stars.map((s, i) => [s.id, new THREE.Vector3(
    n === 1 ? 0 : -2.4 + (4.8 * i) / (n - 1),
    1.05 + 0.95 * hash(s.id),
    -2.2 - 1.3 * hash(s.id, 7),
  )]));

  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial(), Math.max(n, 1));
  const m = new THREE.Matrix4();
  galaxy.stars.forEach((s, i) => {
    const scale = s.themeIds.length ? 1 : 0.7;
    m.compose(pos.get(s.id), new THREE.Quaternion(), new THREE.Vector3(scale, scale, scale));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, INK);
  });
  mesh.count = n;
  world.add(mesh);

  const linkGeo = new THREE.BufferGeometry();
  const lp = [];
  for (const l of galaxy.links) { const a = pos.get(l.from), b = pos.get(l.to); if (a && b) lp.push(a.x, a.y, a.z, b.x, b.y, b.z); }
  linkGeo.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
  linkGeo.setAttribute("color", new THREE.Float32BufferAttribute(new Array(lp.length).fill(0), 3));
  const lines = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85 }));
  world.add(lines);

  // A stationary field of faint far stars: a frame of reference for comfort.
  const far = new Float32Array(1500);
  for (let i = 0; i < far.length; i += 3) {
    const u = hash(`f${i}`), v = hash(`g${i}`), r = 30 + 20 * hash(`h${i}`);
    const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
    far.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i);
  }
  const farGeo = new THREE.BufferGeometry();
  farGeo.setAttribute("position", new THREE.BufferAttribute(far, 3));
  scene.add(new THREE.Points(farGeo, new THREE.PointsMaterial({ color: "#79818F", size: 0.08 })));

  // In a headset the DOM panel is out of view, so the selected evening is
  // also written on a quiet card floating beside it.
  const cardCanvas = document.createElement("canvas");
  cardCanvas.width = 1024; cardCanvas.height = 512;
  const cardTex = new THREE.CanvasTexture(cardCanvas);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshBasicMaterial({ map: cardTex, transparent: true }));
  card.visible = false;
  scene.add(card);

  function drawCard(lines) {
    const c = cardCanvas.getContext("2d");
    c.clearRect(0, 0, 1024, 512);
    c.fillStyle = "rgba(18,22,29,0.92)"; c.beginPath(); c.roundRect(0, 0, 1024, 512, 36); c.fill();
    c.fillStyle = "#79818F"; c.font = "34px 'Source Sans 3', sans-serif"; c.fillText(lines[0], 48, 80);
    c.fillStyle = "#ECE9E2"; c.font = "44px 'Source Serif 4', Georgia, serif";
    let y = 150;
    for (const para of lines.slice(1)) {
      let line = "";
      for (const w of para.split(" ")) {
        if (c.measureText(`${line}${w} `).width > 920) { c.fillText(line, 48, y); y += 58; line = ""; }
        line += `${w} `;
      }
      c.fillText(line, 48, y); y += 72;
      if (y > 480) break;
    }
    cardTex.needsUpdate = true;
  }

  return { renderer, scene, camera, world, mesh, lines, linkGeo, pos, card, drawCard };
}

// ---------- Selection: one state for the list, the panel and the scene ----------

function main({ galaxy, sample }) {
  $("source").textContent = sample
    ? "Sample galaxy. These are invented evenings, not anyone's."
    : `Your galaxy: ${galaxy.stars.length} ${galaxy.stars.length === 1 ? "evening" : "evenings"}, ${galaxy.themes.length} ${galaxy.themes.length === 1 ? "thing" : "things"} they support.`;
  if (sample) $("source").className = "sample";

  const themesById = new Map(galaxy.themes.map((t) => [t.id, t]));
  const ctx = galaxy.stars.length ? buildScene(galaxy) : null;
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
        b.addEventListener("click", () => select({ kind: "theme", id: t.id }));
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
      const why = document.createElement("p"); why.className = "why"; why.textContent = `${t.why} To correct it, use That's not right in the app.`;
      panel.append(when, st, why);
      ctx?.drawCard([t.forming ? "Still forming" : CONFIDENCE[t.confidence], t.statement]);
    }
    panel.classList.toggle("on", Boolean(sel));
    document.querySelectorAll("li button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === sel?.id)));

    if (!ctx) return;
    galaxy.stars.forEach((s, i) => ctx.mesh.setColorAt(i, lit.has(s.id) ? GOLD : INK));
    ctx.mesh.instanceColor.needsUpdate = true;
    const colors = ctx.linkGeo.getAttribute("color");
    galaxy.links.forEach((l, i) => {
      const c = litTheme.has(l.themeId) ? GOLD : DIM;
      colors.setXYZ(i * 2, c.r, c.g, c.b); colors.setXYZ(i * 2 + 1, c.r, c.g, c.b);
    });
    colors.needsUpdate = true;
    const anchor = sel?.kind === "star" ? ctx.pos.get(sel.id) : sel ? ctx.pos.get(themesById.get(sel.id).starIds[0]) : null;
    ctx.card.visible = Boolean(anchor) && ctx.renderer.xr.isPresenting;
    if (anchor) ctx.card.position.set(anchor.x + 0.8, anchor.y + 0.1, anchor.z + 0.4);
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
  const { renderer, scene, camera, world, mesh } = ctx;
  const ray = new THREE.Raycaster();
  function pick(origin, direction) {
    ray.set(origin, direction);
    const hit = ray.intersectObject(mesh)[0];
    if (hit?.instanceId !== undefined) select({ kind: "star", id: galaxy.stars[hit.instanceId].id });
  }
  renderer.domElement.addEventListener("click", (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(mesh)[0];
    if (hit?.instanceId !== undefined) select({ kind: "star", id: galaxy.stars[hit.instanceId].id });
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
  renderer.domElement.setAttribute("aria-label", "Galaxy view. Arrow keys turn it gently; the list beside it has the same content.");
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

  $("stage").append(Object.assign(document.createElement("div"), { id: "vr" }));
  $("vr").append(VRButton.createButton(renderer));

  function resize() {
    const r = $("stage").getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(r.height, 1);
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  // Frame times for QA (window.__dwFrames), measured, never assumed.
  const frames = (window.__dwFrames = []);
  let last = performance.now(), t = 0;
  renderer.setAnimationLoop((now) => {
    frames.push(now - last); last = now;
    if (frames.length > 600) frames.shift();
    t += 1 / 60;
    world.rotation.y += ((reduced ? yaw : yaw + Math.sin(t * 0.05) * 0.03) - world.rotation.y) * 0.1;
    renderer.render(scene, camera);
  });
  window.__dwGalaxyReady = true;
}

loadGalaxy()
  .then(main)
  .catch(() => {
    $("source").textContent = "I couldn't load your galaxy, so this is the sample. These are invented evenings, not anyone's.";
    main({ galaxy: sampleGalaxy(), sample: true });
    $("source").className = "sample";
  });
