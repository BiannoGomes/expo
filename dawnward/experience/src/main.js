import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { color, motion, chapters, worlds, cta, beat } from "./tokens.js";
import { createSound } from "./sound.js";
import { filmState, filmCaptions, FILM_MS } from "./film.js";

const { easeOutQuart, easeInOutCubic, easeInOutSine } = motion.ease;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

const params = new URLSearchParams(location.search);
const FILM = params.has("film");
const rmq = matchMedia("(prefers-reduced-motion: reduce)");
let REDUCED = !FILM && rmq.matches;
rmq.addEventListener?.("change", (e) => { REDUCED = !FILM && e.matches; });
const ASSET = window.DW_ASSETS || ((p) => `assets/${p}`);

/* ---------------------------------------------------------------- renderer */
const stageEl = document.getElementById("stage");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: FILM });
} catch (e) {
  document.documentElement.classList.add("no-webgl");
  throw e;
}
renderer.setPixelRatio(FILM ? 1 : Math.min(devicePixelRatio, innerWidth < 760 ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.autoClear = false;
renderer.setClearColor(color.void, 1);
stageEl.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 400);
const phoneScene = new THREE.Scene();
const uniScene = new THREE.Scene();
uniScene.fog = new THREE.FogExp2(0x04060a, 0.0045);
const pmrem = new THREE.PMREMGenerator(renderer);
phoneScene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const loader = new THREE.TextureLoader();
const tex = (p) => {
  const t = loader.load(ASSET(p));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

/* ------------------------------------------------- soft radial glow texture */
function glowTexture(stops) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const goldGlow = glowTexture([[0, "rgba(255,236,196,1)"], [0.08, "rgba(232,196,128,.85)"], [0.3, "rgba(201,169,106,.22)"], [1, "rgba(201,169,106,0)"]]);
const softGlow = glowTexture([[0, "rgba(255,255,255,.9)"], [0.4, "rgba(255,255,255,.22)"], [1, "rgba(255,255,255,0)"]]);
const shadowTex = glowTexture([[0, "rgba(0,0,0,.9)"], [0.55, "rgba(0,0,0,.35)"], [1, "rgba(0,0,0,0)"]]);

/* ------------------------------------------------------------- the light */
// Moment 1: a point that feels physically present: core, halo, faint
// diffraction, and a field of dust that answers the pointer.
const lightShader = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  uniforms: { uI: { value: 0 }, uHalo: { value: 1 }, uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `varying vec2 vUv; uniform float uI; uniform float uHalo; uniform float uTime;
    void main(){
      vec2 p = vUv - 0.5; float r = length(p);
      float core = exp(-r*r*2600.0);
      float halo = exp(-r*r*70.0) * 0.38 * uHalo;
      float wide = exp(-r*r*9.0) * 0.08 * uHalo;
      float spikeH = exp(-abs(p.y)*900.0) * exp(-abs(p.x)*9.0) * 0.22;
      float spikeV = exp(-abs(p.x)*900.0) * exp(-abs(p.y)*12.0) * 0.12;
      float breath = 0.94 + 0.06 * sin(uTime * 0.98);
      vec3 gold = vec3(0.788, 0.663, 0.416);
      vec3 col = vec3(1.0, 0.93, 0.80) * core + gold * (halo + wide + spikeH + spikeV);
      gl_FragColor = vec4(col * uI * breath, 1.0);
    }`,
});
const lightMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), lightShader);
lightMesh.position.set(0, 0, 0.08);
lightMesh.renderOrder = 10; // a glow is never occluded
phoneScene.add(lightMesh);

function starPoints(count, seed, spread, zRange, size, tint, scene) {
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const pos = new Float32Array(count * 3), ph = new Float32Array(count), sz = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rnd() - 0.5) * spread[0];
    pos[i * 3 + 1] = (rnd() - 0.5) * spread[1];
    pos[i * 3 + 2] = mix(zRange[0], zRange[1], rnd());
    ph[i] = rnd() * 6.283; sz[i] = 0.4 + rnd() * rnd() * 1.6;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
  g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uSize: { value: size }, uAlpha: { value: 1 }, uTint: { value: new THREE.Color(tint) }, uPx: { value: 1 } },
    vertexShader: `attribute float aPhase; attribute float aSize; uniform float uTime; uniform float uSize; uniform float uPx; varying float vTw;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
        vTw = 0.65 + 0.35 * sin(uTime * 0.0011 * (0.6 + aSize) + aPhase);
        gl_PointSize = uSize * aSize * uPx * (60.0 / max(1.0, -mv.z)); }`,
    fragmentShader: `uniform vec3 uTint; uniform float uAlpha; varying float vTw;
      void main(){ vec2 p = gl_PointCoord - 0.5; float d = length(p); float a = smoothstep(0.5, 0.0, d); a = a*a;
        gl_FragColor = vec4(uTint * a * vTw * uAlpha, 1.0); }`,
  });
  const pts = new THREE.Points(g, m);
  scene.add(pts);
  return pts;
}
const dust = starPoints(900, 7, [14, 24], [-6, 2], 0.9, color.gold, phoneScene);
dust.material.uniforms.uAlpha.value = 0;

/* -------------------------------------------------------- the phone */
// Moment 2: titanium frame, glass, a real interface drawn into the screen,
// a floating interface layer for parallax, and a soft contact shadow.
const PW = 1.0, PH = 2.06, PD = 0.085;
const phone = new THREE.Group();
phoneScene.add(phone);
const frameMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1e24, metalness: 1, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.9, transparent: true });
const body = new THREE.Mesh(new RoundedBoxGeometry(PW, PH, PD, 8, 0.15), frameMat);
phone.add(body);
const bezel = new THREE.Mesh(new RoundedBoxGeometry(PW - 0.035, PH - 0.035, PD + 0.002, 8, 0.135),
  new THREE.MeshPhysicalMaterial({ color: 0x050608, metalness: 0.2, roughness: 0.15, clearcoat: 1, transparent: true }));
phone.add(bezel);
[[-0.512, 0.42, 0.16], [-0.512, 0.2, 0.16], [0.512, 0.32, 0.26]].forEach(([x, y, h]) => {
  const b = new THREE.Mesh(new RoundedBoxGeometry(0.02, h, 0.03, 2, 0.008), frameMat);
  b.position.set(x, y, 0);
  phone.add(b);
});

// The screen: the real interface (a canvas compositing the shipped screens),
// a portal to the universe (render target), and a moving glass glare.
const SW = 780, SH = 1688;
const screenCanvas = document.createElement("canvas");
screenCanvas.width = SW; screenCanvas.height = SH;
const sctx = screenCanvas.getContext("2d");
const screenTex = new THREE.CanvasTexture(screenCanvas);
screenTex.colorSpace = THREE.SRGBColorSpace;
screenTex.anisotropy = 8;
const portalRT = new THREE.WebGLRenderTarget(16, 16, { colorSpace: THREE.SRGBColorSpace });
const screenMat = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uUI: { value: screenTex }, uPortal: { value: portalRT.texture }, uMix: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
    uGlare: { value: 0 }, uBright: { value: 1 }, uOpacity: { value: 1 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `varying vec2 vUv; uniform sampler2D uUI; uniform sampler2D uPortal; uniform float uMix; uniform vec2 uRes; uniform float uGlare; uniform float uBright; uniform float uOpacity;
    float rr(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r; }
    void main(){
      vec2 p = (vUv - 0.5) * vec2(0.892, 1.93);
      float d = rr(p, vec2(0.446, 0.965), 0.11);
      float mask = 1.0 - smoothstep(-0.002, 0.002, d);
      vec4 ui = texture2D(uUI, vUv);
      vec4 portal = texture2D(uPortal, gl_FragCoord.xy / uRes);
      vec3 col = mix(ui.rgb * uBright, portal.rgb, uMix);
      float g = smoothstep(0.0, 0.7, 1.0 - abs((vUv.x + vUv.y * 0.6) - uGlare)) * 0.05 * (1.0 - uMix);
      col += vec3(g);
      gl_FragColor = vec4(col, mask * uOpacity);
    }`,
});
const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.892, 1.93), screenMat);
screen.position.z = PD / 2 + 0.0015;
phone.add(screen);
// Floating layer: the kept card lifts 6 mm off the glass and catches the
// light, so the interface has depth when the phone turns.
const cardCanvas = document.createElement("canvas");
cardCanvas.width = 688; cardCanvas.height = 240;
const cardTex = new THREE.CanvasTexture(cardCanvas);
cardTex.colorSpace = THREE.SRGBColorSpace;
const cardMat = new THREE.MeshBasicMaterial({ map: cardTex, transparent: true, opacity: 0, depthWrite: false });
const PX = 1.93 / 1688;
const card = new THREE.Mesh(new THREE.PlaneGeometry(688 * PX, 240 * PX), cardMat);
card.position.set((390 - 390) * PX, (844 - 414) * PX, PD / 2 + 0.008);
phone.add(card);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.7), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2;
shadow.position.set(0, -1.32, 0.05);
phoneScene.add(shadow);

const key = new THREE.DirectionalLight(0xfff1dc, 2.2); key.position.set(-2, 3, 4); phoneScene.add(key);
const rim = new THREE.DirectionalLight(0xc7d5ee, 1.4); rim.position.set(3, 1, -2); phoneScene.add(rim);
phoneScene.add(new THREE.AmbientLight(0x404858, 0.4));

// Screen content: the shipped screens, plus live overlays drawn on top.
const shots = {};
const imgLoad = (name) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = ASSET(`img/${name}.webp`); });
const confession = "Snapped at my sister again. Don't know why.";
let lastScreenKey = "";
function drawScreen(mode, typed, seed, lift = 0) {
  const k = `${mode}|${typed}|${Math.round(seed * 20)}|${Math.round(lift * 10)}`;
  if (k === lastScreenKey || !shots.debrief) return;
  lastScreenKey = k;
  sctx.fillStyle = color.ground; sctx.fillRect(0, 0, SW, SH);
  if (mode === "debrief") {
    sctx.drawImage(shots.debrief, 0, 0, SW, SH);
    sctx.fillStyle = "#11151C"; sctx.fillRect(66, 452, 640, 80);
    const txt = confession.slice(0, typed);
    sctx.font = '400 31px "Albert Sans"'; sctx.fillStyle = color.ink; sctx.textBaseline = "alphabetic";
    let line = "", y = 502;
    for (const w of txt.split(" ")) {
      const test = line ? `${line} ${w}` : w;
      if (sctx.measureText(test).width > 610) { sctx.fillText(line, 83, y); line = w; y += 44; } else line = test;
    }
    if (txt.length) sctx.fillText(line, 83, y);
    if (typed < confession.length) {
      const w = sctx.measureText(line).width;
      sctx.fillStyle = color.gold; sctx.fillRect(83 + (txt.length ? w + 4 : 0), y - 28, 2.5, 34);
    }
  } else if (mode === "today") {
    sctx.drawImage(shots.today, 0, 0, SW, SH);
    if (lift > 0) {
      sctx.globalAlpha = lift; sctx.fillStyle = "#0A0D12";
      sctx.beginPath(); sctx.roundRect(49, 297, 682, 233, 26); sctx.fill();
      sctx.strokeStyle = "rgba(35,42,52,.9)"; sctx.lineWidth = 2; sctx.stroke(); sctx.globalAlpha = 1;
    }
    if (seed > 0) {
      const g = sctx.createRadialGradient(680, 348, 0, 680, 348, 70 * seed);
      g.addColorStop(0, `rgba(255,236,196,${0.95 * seed})`); g.addColorStop(0.25, `rgba(201,169,106,${0.6 * seed})`); g.addColorStop(1, "rgba(201,169,106,0)");
      sctx.fillStyle = g; sctx.beginPath(); sctx.arc(680, 348, 70 * seed, 0, 6.283); sctx.fill();
    }
  } else if (mode === "you") {
    sctx.drawImage(shots.you, 0, 0, SW, SH);
  }
  screenTex.needsUpdate = true;
}
function drawCard() {
  const g = cardCanvas.getContext("2d");
  g.clearRect(0, 0, 688, 240);
  g.drawImage(shots.today, 46 * (shots.today.naturalWidth / 780), 294 * (shots.today.naturalHeight / 1688), 688 * (shots.today.naturalWidth / 780), 240 * (shots.today.naturalHeight / 1688), 0, 0, 688, 240);
  cardTex.needsUpdate = true;
}

/* ------------------------------------------------------------ the universe */
// Moment 3 and 4: layered depth, a believable camera path, four worlds.
const nebula = new THREE.Mesh(new THREE.PlaneGeometry(260, 460), new THREE.MeshBasicMaterial({ map: tex("img/nebula-sky.webp"), transparent: true, opacity: 0.85, depthWrite: false, fog: false }));
nebula.position.set(0, 0, -180);
uniScene.add(nebula);
const starsFar = starPoints(2600, 11, [220, 380], [-170, -60], 1.6, color.ink, uniScene);
const starsMid = starPoints(1100, 29, [90, 150], [-60, -12], 1.3, color.cool, uniScene);
const starsNear = starPoints(420, 47, [30, 50], [-14, 4], 1.0, color.ink, uniScene);
const keptStar = new THREE.Sprite(new THREE.SpriteMaterial({ map: goldGlow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
keptStar.position.set(-1.6, 1.9, -16);
keptStar.scale.setScalar(2.2);
uniScene.add(keptStar);

const worldObjs = worlds.map((w) => {
  const g = new THREE.Group();
  g.position.set(...w.pos);
  const atmo = new THREE.Sprite(new THREE.SpriteMaterial({ map: softGlow, color: new THREE.Color(w.tint), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  atmo.scale.setScalar(w.size * 1.9);
  const planet = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(`img/${w.key}.webp`), transparent: true, depthWrite: false, opacity: 0 }));
  planet.scale.setScalar(w.size);
  planet.userData.key = w.key;
  g.add(atmo, planet);
  uniScene.add(g);
  return { w, g, planet, atmo, base: v3(...w.pos) };
});

/* ------------------------------------------------------------- camera rig */
// One continuous path. Positions are functions of story time s, never jumps.
const HUB = { pos: v3(0, 0, -6), look: v3(0, 0, -40) };
function cameraFor(s, t) {
  const pos = v3(0, 0, 7), look = v3(0, 0, 0);
  if (s < 1) {
    const k = easeInOutCubic(clamp(s));
    pos.set(mix(0, 0.42, k), mix(0, 0.08, k), mix(7.5, 4.4, k));
  } else if (s < 1.8) {
    const k = easeInOutSine(clamp((s - 1) / 0.8));
    pos.set(mix(0.42, 0.12, k), mix(0.08, 0.02, k), mix(4.4, 3.5, k));
  } else if (s < 2.3) {
    // the push through the glass: accelerating, then through.
    const k = clamp((s - 1.8) / 0.5);
    const kk = k * k * (3 - 2 * k);
    pos.set(mix(0.12, 0, kk), mix(0.02, 0, kk), mix(3.5, -1.2, Math.pow(k, 1.6)));
    look.set(0, 0, -20);
  } else if (s < 3) {
    const k = easeOutQuart(clamp((s - 2.3) / 0.7));
    pos.set(0, 0, mix(-1.2, HUB.pos.z, k));
    look.copy(HUB.look);
  } else {
    pos.copy(HUB.pos); look.copy(HUB.look);
    const back = easeInOutCubic(clamp((s - 3) / 1));
    pos.z += back * 4;
  }
  // portrait: the web lifts the phone above bottom captions; the film lowers it under top captions
  if (s < 2.3 && camera.aspect < 0.75) { const dy = FILM ? 0.34 : -0.28; pos.y += dy; look.y += dy; }
  if (s >= 2.3) {
    // Orbit: the camera at rest is never quite still.
    const o = (t / motion.orbit.period) * 6.283;
    pos.x += Math.sin(o) * motion.orbit.radius * smooth(2.6, 3, s);
    pos.y += Math.cos(o * 0.7) * motion.orbit.radius * 0.6 * smooth(2.6, 3, s);
  }
  return { pos, look };
}
function focusPose(wo) {
  const p = wo.g.position.clone();
  const dir = p.clone().sub(HUB.pos).normalize();
  const pos = p.clone().sub(dir.multiplyScalar(wo.w.size * (wo.w.key === "future" ? 1.05 : 1.55)));
  pos.x += wo.w.size * 0.28;
  pos.y -= wo.w.size * 0.12;
  return { pos, look: p.clone().add(v3(wo.w.size * 0.22, -wo.w.size * 0.1, 0)) };
}

/* ------------------------------------------------------------- DOM overlay */
const $ = (id) => document.getElementById(id);
const hubHint = $("hubhint"), capEl = $("caption"), panel = $("panel"), endEl = $("end"), labelsEl = $("labels"), hint = $("hint"), demoTag = $("demo");
const labelEls = Object.fromEntries(worlds.map((w) => {
  const b = document.createElement("button");
  b.className = "wlabel"; b.type = "button"; b.dataset.key = w.key;
  b.innerHTML = `<span class="n">${w.name}</span><span class="m">${w.meta}</span>`;
  b.setAttribute("aria-label", `Visit ${w.name}: ${w.meta}`);
  b.addEventListener("click", (e) => { e.stopPropagation(); selectWorld(w.key); });
  labelsEl.appendChild(b);
  return [w.key, b];
}));
$("ctaLink").href = cta.href; $("ctaLink").textContent = cta.label; $("ctaNote").textContent = cta.note;

const interactiveCaptions = [
  [0.22, 0.86, "It begins with one honest moment."],
  [0.98, 1.36, "Each evening, Dawnward asks one real question. You talk. It listens."],
  [1.42, 1.82, "Each morning, three small steps, drawn from your own words."],
  [1.95, 2.55, "Nothing you live honestly is lost."],
  [2.62, 2.93, "It becomes your universe. Four worlds that change as you do."],
  [3.55, 4.45, "And slowly, it understands you. And shows you why."],
];
let capText = "";
function setCaption(text) {
  if (text === capText) return;
  capText = text;
  capEl.classList.remove("on");
  if (text) { capEl.textContent = text; void capEl.offsetWidth; capEl.classList.add("on"); }
}

/* ------------------------------------------------------------- world focus */
let focusKey = null, focusAmt = 0, hoverKey = null;
function selectWorld(key) {
  focusKey = key;
  const wo = worldObjs.find((o) => o.w.key === key);
  if (!wo) return;
  const w = wo.w;
  panel.querySelector(".plbl").textContent = `${w.name} · ${w.meta}`;
  panel.querySelector(".pt").textContent = w.title;
  panel.querySelector(".pb").textContent = w.text;
  const mv = panel.querySelector(".pm");
  mv.textContent = w.move ? `One quiet move today: ${w.move}.` : w.aspiration;
  mv.className = w.move ? "pm" : "pm asp";
  panel.querySelector(".pf").textContent = w.move ? "" : "An aspiration you chose. Never a prediction.";
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  sound.world(key);
  if (!FILM) setTimeout(() => panel.querySelector(".close").focus({ preventScroll: true }), 500);
}
function closeWorld() {
  focusKey = null;
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  sound.back();
}
panel.querySelector(".close").addEventListener("click", closeWorld);

/* --------------------------------------------------------------- story time */
let s = 0, target = 0, lastInput = 0; // lastInput 0 = the visitor has not moved yet
const goTo = (v) => { target = clamp(v, 0, 5); lastInput = performance.now(); };
const nav = $("nav");
chapters.forEach((c, i) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "dot";
  b.innerHTML = `<i></i><span>${c.label}</span>`;
  b.setAttribute("aria-label", `Chapter ${i + 1}: ${c.label}`);
  b.addEventListener("click", () => { if (focusKey) closeWorld(); goTo(c.rest); });
  nav.appendChild(b);
});
const dots = [...nav.children];

if (!FILM) {
  addEventListener("wheel", (e) => { if (focusKey) return; goTo(target + e.deltaY * 0.0011); }, { passive: true });
  let ty = null;
  addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchmove", (e) => {
    if (ty == null || focusKey) return;
    const y = e.touches[0].clientY; goTo(target + (ty - y) * 0.0042); ty = y;
  }, { passive: true });
  addEventListener("touchend", () => { ty = null; }, { passive: true });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && focusKey) { closeWorld(); return; }
    if (focusKey) return;
    const next = chapters.find((c) => c.rest > s + 0.05), prev = [...chapters].reverse().find((c) => c.rest < s - 0.05);
    if (["ArrowDown", "PageDown", " "].includes(e.key) && next) { e.preventDefault(); goTo(next.rest); }
    if (["ArrowUp", "PageUp"].includes(e.key) && prev) { e.preventDefault(); goTo(prev.rest); }
  });
  $("replay").addEventListener("click", () => { if (focusKey) closeWorld(); goTo(0); });
  $("begin").addEventListener("click", () => goTo(chapters[1].rest));
}

/* -------------------------------------------------------------- pointer */
const pointer = new THREE.Vector2(0, 0), pointerS = new THREE.Vector2(0, 0);
const ray = new THREE.Raycaster();
addEventListener("pointermove", (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
});
renderer.domElement.addEventListener("click", (e) => {
  if (FILM) return;
  const pt = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  if (s > 2.75 && s < 3.6) {
    ray.setFromCamera(pt, camera);
    const hit = ray.intersectObjects(worldObjs.map((o) => o.planet))[0];
    if (hit) selectWorld(hit.object.userData.key); else if (focusKey) closeWorld();
  } else if (s > 1.2 && s < 1.9) {
    goTo(2.3); // the kept card: tapping it sends you through
  } else if (s < 0.9) {
    goTo(chapters[1].rest);
  }
});

/* -------------------------------------------------------------- sound */
const sound = createSound({ asset: ASSET, film: FILM });
const soundBtn = $("sound");
soundBtn.addEventListener("click", async () => {
  const on = await sound.toggle();
  soundBtn.setAttribute("aria-pressed", String(on));
  soundBtn.querySelector("span").textContent = on ? "Sound on" : "Sound off";
});

/* -------------------------------------------------------------- resize */
function resize() {
  const w = FILM ? 1080 : innerWidth, h = FILM ? 1920 : innerHeight;
  renderer.setSize(w, h, false);
  renderer.domElement.style.width = `${w}px`; renderer.domElement.style.height = `${h}px`;
  camera.aspect = w / h;
  // Portrait screens: widen the lens so the phone and worlds stay framed.
  camera.fov = w / h < 0.75 ? 46 : 34;
  camera.updateProjectionMatrix();
  const dpr = renderer.getPixelRatio();
  portalRT.setSize(Math.round(w * dpr * 0.75), Math.round(h * dpr * 0.75));
  screenMat.uniforms.uRes.value.set(w * dpr, h * dpr);
  for (const p of [dust, starsFar, starsMid, starsNear]) p.material.uniforms.uPx.value = dpr * (h / 900);
}
addEventListener("resize", resize);
resize();

/* ------------------------------------------------------------- the frame */
const tmpPos = v3(0, 0, 0), tmpLook = v3(0, 0, 0);
function frame(st) {
  const { s, t, focusAmt: fa, bloom } = st;
  const tSec = t / 1000;
  // camera first: everything placed relative to it reads this frame's pose.
  // camera: the story path, mixed toward the focused world by gravity
  const c = cameraFor(s, t);
  tmpPos.copy(c.pos); tmpLook.copy(c.look);
  const fk = st.focusKey || focusKey;
  if (fk && fa > 0) {
    const f = focusPose(worldObjs.find((o) => o.w.key === fk));
    tmpPos.lerp(f.pos, easeInOutCubic(fa)); tmpLook.lerp(f.look, easeInOutCubic(fa));
  }
  if (!FILM && s >= 2.6) { tmpLook.x += pointerS.x * 1.2; tmpLook.y += pointerS.y * 0.8; }
  camera.position.copy(tmpPos); camera.lookAt(tmpLook);
  // light
  const li = smooth(0.05, 0.5, s) * (1 - smooth(0.78, 1.02, s));
  lightShader.uniforms.uI.value = li;
  lightShader.uniforms.uTime.value = tSec;
  lightShader.uniforms.uHalo.value = 1 + (FILM ? 0 : clamp(1 - pointerS.length()) * 0.6) * (1 - smooth(0.8, 1, s));
  dust.material.uniforms.uAlpha.value = smooth(0.1, 0.7, s) * (1 - smooth(1.9, 2.25, s)) * 0.9;
  dust.material.uniforms.uTime.value = t;
  dust.rotation.y = pointerS.x * 0.08 + tSec * 0.004;
  dust.rotation.x = -pointerS.y * 0.05;

  // phone: emergence from the light, then the honest minute, then the portal
  const pe = easeOutQuart(smooth(0.62, 1.05, s));
  const phoneOn = s < 2.3 || s > 3.3;
  phone.visible = phoneOn; shadow.visible = phoneOn && s < 2.3;
  let mode = "debrief", typed = 0, seed = 0;
  if (s < 2.3) {
    phone.position.set(0, mix(-0.35, 0, pe), 0);
    phone.rotation.set(mix(0.2, 0.06, pe) - pointerS.y * 0.06, mix(-0.62, -0.2, pe) + smooth(1.75, 2.15, s) * 0.2 + pointerS.x * 0.09, 0);
    phone.visible = pe > 0.002; // an invisible phone must not write depth over the light
    frameMat.opacity = pe; bezel.material.opacity = pe; screenMat.uniforms.uOpacity.value = pe;
    screenMat.uniforms.uBright.value = smooth(0.85, 1.1, s);
    typed = Math.round(confession.length * smooth(1.0, 1.32, s));
    if (s >= 1.38) { mode = "today"; seed = smooth(1.55, 1.78, s); }
    screenMat.uniforms.uMix.value = smooth(1.86, 2.08, s);
    cardMat.opacity = smooth(1.42, 1.55, s) * (1 - smooth(1.86, 2.0, s));
    card.position.z = PD / 2 + 0.004 + smooth(1.45, 1.6, s) * 0.012;
    shadow.material.opacity = pe * 0.55 * (1 - smooth(1.8, 2.1, s));
  } else {
    // Moment 5: the phone returns inside the universe, at human scale.
    const r = easeOutQuart(smooth(3.35, 3.9, s)) * (1 - smooth(4.35, 4.75, s));
    mode = "you";
    phone.visible = r > 0.002;
    phone.position.copy(camera.position).add(v3(0, (camera.aspect < 0.75 ? (FILM ? -0.2 : 0.42) : 0.16) + (1 - r) * -0.4, -4.7));
    phone.rotation.set(0.04 - pointerS.y * 0.05, -0.12 + pointerS.x * 0.08 + Math.sin(tSec * 0.25) * 0.02, 0);
    frameMat.opacity = r; bezel.material.opacity = r; screenMat.uniforms.uOpacity.value = r;
    screenMat.uniforms.uMix.value = 0; screenMat.uniforms.uBright.value = 1;
    cardMat.opacity = 0;
    shadow.visible = false;
  }
  drawScreen(mode, typed, seed, mode === "today" ? cardMat.opacity : 0);
  screenMat.uniforms.uGlare.value = 0.6 + phone.rotation.y * 1.6;

  // universe
  const uniOn = s > 1.8;
  const dimU = 1 - smooth(3.3, 3.9, s) * 0.45 - smooth(4.4, 4.95, s) * 0.5;
  for (const p of [starsFar, starsMid, starsNear]) { p.material.uniforms.uTime.value = t; p.material.uniforms.uAlpha.value = dimU; }
  nebula.material.opacity = 0.85 * dimU;
  keptStar.material.opacity = smooth(2.15, 2.45, s) * dimU * (0.85 + 0.15 * Math.sin(tSec * 0.98));
  worldObjs.forEach((o, i) => {
    const b = bloom[i];
    const breath = 1 + Math.sin(tSec * 6.283 / (motion.breath.period / 1000) + i) * motion.breath.depth * 0.5;
    const isF = focusKey === o.w.key || st.focusKey === o.w.key;
    o.planet.material.opacity = b * dimU;
    o.planet.scale.setScalar(o.w.size * mix(motion.emergence.scaleFrom, 1, b) * (hoverKey === o.w.key ? 1.03 : 1));
    o.atmo.material.opacity = b * dimU * (o.w.key === "future" ? 0.14 : 0.28) * breath * (isF ? 1.25 : 1);
    o.atmo.scale.setScalar(o.w.size * 1.9 * breath);
    const ang = tSec * 6.283 / 90 + i * 1.7;
    // portrait screens: draw the worlds in, stack them taller
    const kx = camera.aspect < 0.75 ? 0.45 : 1, ky = camera.aspect < 0.75 ? 1.35 : 1;
    o.g.position.set(o.base.x * kx + Math.cos(ang) * 0.5, o.base.y * ky + Math.sin(ang * 0.8) * 0.35, o.base.z);
  });


  // render: the universe directly once we are through the glass; before
  // that, only as the portal inside the screen.
  renderer.clear();
  if (uniOn && s < 2.3) {
    renderer.setRenderTarget(portalRT); renderer.clear(); renderer.render(uniScene, camera); renderer.setRenderTarget(null);
  }
  if (s >= 2.24) renderer.render(uniScene, camera);
  if (phoneOn) { renderer.clearDepth(); renderer.render(phoneScene, camera); }

  // overlay
  const showLabels = s > 2.85 && s < 3.4 && !fk;
  worldObjs.forEach((o, i) => {
    const el = labelEls[o.w.key];
    const W = innerWidthF(), H = innerHeightF();
    const c0 = o.g.position.clone().project(camera);
    const c1 = o.g.position.clone().add(camera.up.clone().multiplyScalar(o.w.size * 0.5)).project(camera);
    const rPx = Math.abs(c1.y - c0.y) * 0.5 * H;
    const x = clamp((c0.x * 0.5 + 0.5) * W, 70, W - 150);
    const y = clamp((-c0.y * 0.5 + 0.5) * H + rPx * 0.78, 80, H - 210);
    const vis = showLabels && bloom[i] > 0.6 && c0.z < 1;
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, 0)`;
    el.classList.toggle("on", vis);
    el.tabIndex = vis ? 0 : -1;
  });
  return { li };
}
const innerWidthF = () => (FILM ? 1080 : innerWidth);
const innerHeightF = () => (FILM ? 1920 : innerHeight);

/* ------------------------------------------------------------- run loops */
const bloomFor = (s) => worlds.map((_, i) => easeOutQuart(smooth(2.55 + i * 0.07, 2.95 + i * 0.07, s)));
async function boot() {
  const [debrief, today, you] = await Promise.all(["debrief", "today", "you"].map(imgLoad));
  Object.assign(shots, { debrief, today, you });
  await document.fonts.ready;
  if (shots.today) drawCard();
  document.documentElement.classList.add("ready");
  if (FILM) {
    window.FILM_MS = FILM_MS;
    window.SEEK = (ms) => {
      const st = filmState(ms);
      s = st.s;
      focusKey = null;
      pointerS.set(0, 0);
      frame({ ...st, t: ms });
      const cap = filmCaptions(ms);
      setCaption(cap);
      panel.classList.toggle("open", st.panelOpen);
      if (st.panelOpen && st.focusKey && panel.dataset.k !== st.focusKey) { selectWorld(st.focusKey); focusKey = null; panel.dataset.k = st.focusKey; }
      endEl.classList.toggle("on", st.end);
      endEl.style.opacity = st.endAmt;
      demoTag.classList.toggle("on", s > 3.6 && s < 4.6);
      document.documentElement.style.setProperty("--fade", st.fade);
    };
    window.SEEK(0);
    window.FILM_READY = true;
    return;
  }
  window.DW = { goTo, select: selectWorld, close: closeWorld, jump: (v) => { s = target = v; lastInput = performance.now(); focusAmt = focusKey ? 1 : 0; }, get s() { return s; } };
  let prev = performance.now(), t0 = prev, raf = 0, paused = false;
  document.addEventListener("visibilitychange", () => {
    paused = document.hidden;
    sound.pause(paused);
    if (!paused) { prev = performance.now(); raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
  });
  renderer.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); paused = true; cancelAnimationFrame(raf); document.getElementById("textv").click(); });
  renderer.domElement.addEventListener("webglcontextrestored", () => location.reload());
  const loop = (now) => {
    if (paused) return;
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    const hl = REDUCED ? 0.0001 : motion.gravity.halfLife;
    // Gravity: settle toward the nearest rest point once input stops.
    if (lastInput && now - lastInput > 900 && !focusKey) {
      const rest = chapters.reduce((a, c) => (Math.abs(c.rest - target) < Math.abs(a - target) ? c.rest : a), chapters[0].rest);
      target += (rest - target) * (1 - Math.pow(0.5, dt / 0.4));
    }
    s += (target - s) * (1 - Math.pow(0.5, dt / hl));
    if (Math.abs(target - s) < 0.0005) s = target;
    pointerS.lerp(pointer, 1 - Math.pow(0.5, dt / 0.25));
    focusAmt += ((focusKey ? 1 : 0) - focusAmt) * (1 - Math.pow(0.5, dt / (REDUCED ? 0.0001 : motion.gravity.focusHalfLife)));
    const bl = bloomFor(s);
    frame({ s, t: now - t0, focusAmt, bloom: bl, focusKey: null });
    const cap = interactiveCaptions.find(([a, b]) => s >= a && s < b);
    setCaption(focusKey ? "" : cap ? cap[2] : "");
    hint.classList.toggle("on", s < 0.12 && now - t0 > 1600);
    hubHint.classList.toggle("on", s > 2.93 && s < 3.4 && !focusKey);
    endEl.classList.toggle("on", s > 4.7);
    endEl.style.opacity = smooth(4.55, 4.95, s);
    demoTag.classList.toggle("on", s > 3.6 && s < 4.6);
    dots.forEach((d, i) => d.classList.toggle("cur", Math.abs(chapters[i].rest - s) < 0.35));
    sound.update(s, focusAmt);
    // hover cursor on worlds
    if (s > 2.75 && s < 3.6 && !focusKey) {
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(worldObjs.map((o) => o.planet))[0];
      hoverKey = hit ? hit.object.userData.key : null;
      renderer.domElement.style.cursor = hit ? "pointer" : "default";
    } else hoverKey = null;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}
boot();
