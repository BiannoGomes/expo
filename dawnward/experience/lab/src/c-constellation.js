// Prototype C: Living constellation (WebGL), SAMPLE DATA ONLY.
// Stars are moments placed by date; links exist only where two moments share
// words, and every link names those words. Writing a moment sends a star from
// the text box into the sky; refusing a link retracts it; removing a moment
// takes its links with it. Nothing leaves the page.
import { THREE, color, worlds, clamp, mix, createRenderer, loop, reducedMotion } from "./common.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

const tint = Object.fromEntries(worlds.map((w) => [w.key, new THREE.Color(w.tint)]));
const STOP = new Set("a an and the to of in on at my me i it is was with for after before again then just about so that this be been day".split(" "));
const words = (t) => [...new Set(t.toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)))];
const SAMPLE = [
  ["2026-09-29", "body", "Forty minutes in the cold water. Head clear after."],
  ["2026-09-30", "mind", "Wrote 900 words before work."],
  ["2026-10-03", "mind", "Couldn't focus. Kept rewriting the same page."],
  ["2026-10-06", "soul", "Short with Sam at dinner. Tired, long day."],
  ["2026-10-08", "future", "Pictured the book on a shelf with my name on it."],
  ["2026-10-13", "body", "Skipped the water. Slept five hours. Tired."],
  ["2026-10-13", "soul", "Snapped at my sister again. Tired. Don't know why."],
  ["2026-10-14", "soul", "Called my sister. Just to talk. We laughed."],
  ["2026-10-18", "body", "Back in the water. Forty minutes."],
  ["2026-10-19", "mind", "Wrote 1,100 words. The chapter finally turned."],
  ["2026-10-22", "soul", "Quiet walk, phone in a drawer. Felt like me again."],
  ["2026-10-27", "mind", "Sent the chapter to my editor. The book is real."],
];
const domainOf = (t) => (/(water|swim|run|slept|sleep|train)/i.test(t) ? "body" : /(wrote|words|chapter|page|focus|read)/i.test(t) ? "mind" : /(book|someday|future|plan)/i.test(t) ? "future" : "soul");

const host = document.getElementById("stage");
const { renderer, quality } = createRenderer(host);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 200);
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
dispatchEvent(new Event("resize"));

let moments = SAMPLE.map(([d, k, t], i) => ({ id: `m${i}`, date: d, domain: k, text: t, words: words(t), alive: 1, gone: false, born: -10 }));
let links = [], selected = null, showLinks = true;
const T0 = Date.parse("2026-09-29"), T1 = Date.parse("2026-10-31");
function slot(m, i) {
  const k = clamp((Date.parse(m.date) - T0) / (T1 - T0));
  const ang = -1.2 + k * 5.4 + (i % 3) * 0.12, r = 1.2 + k * 4.6;
  return new THREE.Vector3(Math.cos(ang) * r, Math.sin(ang) * r * 0.82, Math.sin(i * 1.7) * 0.6);
}
function relink() {
  const keep = new Map(links.map((l) => [`${l.a.id}|${l.b.id}`, l]));
  links = [];
  for (let i = 0; i < moments.length; i++) for (let j = i + 1; j < moments.length; j++) {
    const a = moments[i], b = moments[j]; if (a.gone || b.gone) continue;
    const shared = a.words.filter((w) => b.words.includes(w)); if (!shared.length) continue;
    const old = keep.get(`${a.id}|${b.id}`);
    links.push(old || { a, b, shared, show: 0, rejected: false });
  }
}
moments.forEach((m, i) => { m.pos = slot(m, i); m.cur = m.pos.clone(); });
relink();

// stars: Points with per-star colour, size and life; links: line segments with per-vertex alpha
const MAX = 64;
const sGeo = new THREE.BufferGeometry();
const sPos = new Float32Array(MAX * 3), sCol = new Float32Array(MAX * 3), sSize = new Float32Array(MAX);
sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3)); sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3)); sGeo.setAttribute("aSize", new THREE.BufferAttribute(sSize, 1));
const sMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
  uniforms: { uPx: { value: devicePixelRatio } },
  vertexShader: `attribute float aSize; varying vec3 vC; uniform float uPx; void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uPx * (16.0 / max(1.0, -mv.z)); }`,
  fragmentShader: `varying vec3 vC; void main(){ float d = length(gl_PointCoord - 0.5); float core = smoothstep(0.12, 0.0, d); float halo = smoothstep(0.5, 0.0, d) * 0.35; gl_FragColor = vec4(vC * (core + halo), 1.0); }`,
});
const starPts = new THREE.Points(sGeo, sMat); scene.add(starPts);
const lGeo = new THREE.BufferGeometry();
const lPos = new Float32Array(MAX * 8 * 6), lCol = new Float32Array(MAX * 8 * 6);
lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3)); lGeo.setAttribute("color", new THREE.BufferAttribute(lCol, 3));
// links: three's bundled wide lines (Line2 family), so threads have real width on every GPU
const lMat = new LineMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, linewidth: 2.2, worldUnits: false });
const linkLines = new LineSegments2(new LineSegmentsGeometry(), lMat);
scene.add(linkLines);
const syncLineRes = () => lMat.resolution.set(innerWidth, innerHeight); syncLineRes(); addEventListener("resize", syncLineRes);

// DOM: card, list mirror, compose box
const $ = (id) => document.getElementById(id);
const card = $("card"), list = $("list"), toast = $("toast"), live = $("live");
const fmt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
function renderList() {
  list.innerHTML = moments.filter((m) => !m.gone).map((m) => `<li><button type="button" data-id="${m.id}" aria-current="${m.id === selected}">${fmt(m.date)} · ${m.text}</button></li>`).join("");
}
function show(id) {
  selected = id; const m = moments.find((x) => x.id === id && !x.gone);
  if (!m) { card.innerHTML = ""; card.hidden = true; renderList(); return; }
  const mine = links.filter((l) => showLinks && !l.rejected && (l.a === m || l.b === m));
  card.hidden = false;
  card.innerHTML = `<p class="meta">${fmt(m.date)} · ${m.domain[0].toUpperCase() + m.domain.slice(1)}</p><p class="txt">${m.text}</p>
    ${mine.map((l) => { const o = l.a === m ? l.b : l.a; return `<div class="why"><p>Shares your words: ${l.shared.map((w) => `“${w}”`).join(", ")}</p><p class="with">With ${fmt(o.date)}: “${o.text}”</p><button type="button" class="reject" data-a="${l.a.id}" data-b="${l.b.id}">That's not right</button></div>`; }).join("") || `<p class="none">${showLinks ? "No shared words with other moments yet." : "Connections are off."}</p>`}
    <button type="button" class="remove" data-id="${m.id}">Remove this moment</button>`;
  live.textContent = `${fmt(m.date)}. ${m.text}. ${mine.length} connection${mine.length === 1 ? "" : "s"}.`;
  renderList();
}
function say(msg, undo) {
  toast.innerHTML = `${msg}${undo ? ' <button type="button" id="undo">Undo</button>' : ""}`; toast.classList.add("on");
  if (undo) { const u = $("undo"); u.onclick = () => { undo(); toast.classList.remove("on"); }; u.focus(); }
}
document.addEventListener("click", (e) => {
  const t = e.target.closest("button"); if (!t) return;
  window.LAB && (window.LAB.lastInput = performance.now());
  if (t.dataset.id && !t.classList.contains("remove")) return show(t.dataset.id);
  if (t.classList.contains("reject")) {
    const l = links.find((x) => x.a.id === t.dataset.a && x.b.id === t.dataset.b); l.rejected = true; show(selected);
    return say("Thank you. I'll hold this loosely until your days say otherwise.", () => { l.rejected = false; show(selected); });
  }
  if (t.classList.contains("remove")) {
    const m = moments.find((x) => x.id === t.dataset.id); m.gone = true; relink(); show(null);
    return say("Removed, with its connections.", () => { m.gone = false; relink(); show(m.id); });
  }
});
$("links").addEventListener("change", (e) => { showLinks = e.target.checked; show(selected); });
$("compose").addEventListener("submit", (e) => {
  e.preventDefault(); const ta = $("text"), text = ta.value.trim(); if (!text) return;
  window.LAB && (window.LAB.lastInput = performance.now());
  const m = { id: `n${moments.length}`, date: "2026-10-31", domain: domainOf(text), text, words: words(text), alive: 1, gone: false, born: performance.now() };
  // the star starts where the words were written
  const r = ta.getBoundingClientRect(), ndc = new THREE.Vector3(((r.left + r.width / 2) / innerWidth) * 2 - 1, -((r.top) / innerHeight) * 2 + 1, 0.5).unproject(camera);
  m.pos = slot(m, moments.length); m.from = ndc; m.cur = ndc.clone();
  moments.push(m); relink(); ta.value = "";
  const n = links.filter((l) => l.a === m || l.b === m).length;
  say(n ? `Kept. It shares words with ${n} other moment${n > 1 ? "s" : ""}.` : "Kept. Nothing shares its words yet.");
  setTimeout(() => show(m.id), reducedMotion() ? 0 : 1200);
});
renderList();

// select a star by tapping near it
const ray = new THREE.Raycaster(); ray.params.Points.threshold = 0.35;
renderer.domElement.addEventListener("pointerdown", (e) => {
  window.LAB && (window.LAB.lastInput = performance.now());
  ray.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  const hit = ray.intersectObject(starPts)[0]; if (hit && hit.index < order.length) show(order[hit.index].id);
});

let order = [];
const LAB = loop((dt, now) => {
  const rm = reducedMotion();
  const a = rm ? 0 : now / 26000;
  const wide = camera.aspect > 1.1; // on wide screens the sky sits left of the side panel
  camera.position.set(Math.sin(a) * 1.2 + (wide ? 2.6 : 0), Math.cos(a * 0.7) * 0.6, camera.aspect < 0.75 ? 17 : 12.5); camera.lookAt(wide ? 2.6 : 0, camera.aspect < 0.75 ? -1.2 : 0, 0);
  order = moments.filter((m) => !m.gone || m.alive > 0.01);
  let i = 0;
  for (const m of order) {
    m.alive += ((m.gone ? 0 : 1) - m.alive) * (rm ? 1 : 1 - Math.pow(0.5, dt / 0.18));
    if (m.from) { const k = rm ? 1 : clamp((now - m.born) / 1100); m.cur.lerpVectors(m.from, m.pos, 1 - Math.pow(1 - k, 3)); if (k >= 1) m.from = null; }
    const w = (m.id === selected ? 1.6 : 1) * (0.9 + 0.4 * m.words.length / 6);
    sPos.set([m.cur.x, m.cur.y, m.cur.z], i * 3);
    const c = tint[m.domain]; sCol.set([c.r * m.alive, c.g * m.alive, c.b * m.alive], i * 3);
    sSize[i] = (28 + 10 * w) * m.alive; i++;
  }
  sGeo.setDrawRange(0, i); sGeo.attributes.position.needsUpdate = sGeo.attributes.color.needsUpdate = sGeo.attributes.aSize.needsUpdate = true;
  let j = 0;
  for (const l of links) {
    const goal = showLinks && !l.rejected && !l.a.gone && !l.b.gone ? 1 : 0;
    l.show += (goal - l.show) * (rm ? 1 : 1 - Math.pow(0.5, dt / 0.25));
    if (l.show < 0.01) continue;
    // draw from a toward b by `show`, so a refused link visibly retracts
    const end = new THREE.Vector3().lerpVectors(l.a.cur, l.b.cur, l.show);
    const hi = selected && (l.a.id === selected || l.b.id === selected) ? 1 : 0.45;
    lPos.set([l.a.cur.x, l.a.cur.y, l.a.cur.z, end.x, end.y, end.z], j * 6);
    const c = hi === 1 ? [0.79, 0.66, 0.42] : [0.6, 0.62, 0.68];
    lCol.set([c[0] * hi * l.show, c[1] * hi * l.show, c[2] * hi * l.show, c[0] * hi * 0.5, c[1] * hi * 0.5, c[2] * hi * 0.5], j * 6); j++;
  }
  const g2 = new LineSegmentsGeometry(); g2.setPositions(lPos.subarray(0, Math.max(6, j * 6))); g2.setColors(lCol.subarray(0, Math.max(6, j * 6)));
  linkLines.geometry.dispose(); linkLines.geometry = g2; linkLines.visible = j > 0;
  renderer.render(scene, camera);
}, quality);
LAB.ready = true; LAB.show = show;
