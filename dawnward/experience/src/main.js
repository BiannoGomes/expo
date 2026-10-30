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
const texLoads = [];
const tex = (p) => {
  const t = loader.load(ASSET(p));
  texLoads.push(new Promise((res) => { const chk = () => (t.image && t.image.complete ? res() : setTimeout(chk, 30)); chk(); }));
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
const portalRT = new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType }); // linear, so the portal matches the sky it opens onto
const rtSize = { w: 16, h: 16 };
const screenMat = new THREE.ShaderMaterial({
  transparent: true, toneMapped: false, // the interface shows exactly as shipped
  uniforms: {
    uUI: { value: screenTex }, uPortal: { value: portalRT.texture }, uMix: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
    uGlare: { value: 0 }, uBright: { value: 1 }, uOpacity: { value: 1 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `varying vec2 vUv; uniform sampler2D uUI; uniform sampler2D uPortal; uniform float uMix; uniform vec2 uRes; uniform float uGlare; uniform float uBright; uniform float uOpacity;
    vec3 RRTAndODTFit(vec3 v){ vec3 a = v*(v+0.0245786)-0.000090537; vec3 b = v*(0.983729*v+0.4329510)+0.238081; return a/b; }
    vec3 dwACES(vec3 c){ // the renderer's ACES, applied to the portal so it matches the sky after the crossing
      const mat3 I = mat3(vec3(0.59719,0.07600,0.02840), vec3(0.35458,0.90834,0.13383), vec3(0.04823,0.01566,0.83777));
      const mat3 O = mat3(vec3(1.60475,-0.10208,-0.00327), vec3(-0.53108,1.10813,-0.07276), vec3(-0.07367,-0.00605,1.07602));
      c *= 1.05 / 0.6; c = O * RRTAndODTFit(I * c); return clamp(c, 0.0, 1.0); }
    float rr(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r; }
    void main(){
      vec2 p = (vUv - 0.5) * vec2(0.892, 1.93);
      float d = rr(p, vec2(0.446, 0.965), 0.11);
      float mask = 1.0 - smoothstep(-0.002, 0.002, d);
      vec4 ui = texture2D(uUI, vUv);
      vec3 portal = uMix > 0.0 ? dwACES(texture2D(uPortal, gl_FragCoord.xy / uRes).rgb) : vec3(0.0);
      vec3 col = mix(ui.rgb * uBright, portal, uMix);
      float g = smoothstep(0.0, 0.7, 1.0 - abs((vUv.x + vUv.y * 0.6) - uGlare)) * 0.05 * (1.0 - uMix);
      gl_FragColor = vec4(col, mask * uOpacity);
      #include <colorspace_fragment>
      gl_FragColor.rgb += vec3(g); // glare is added in display space, as the eye sees it
    }`,
});
const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.892, 1.93), screenMat);
screen.position.z = PD / 2 + 0.0015;
phone.add(screen);
// Floating layer: the kept card lifts 6 mm off the glass and catches the
// light, so the interface has depth when the phone turns.
const cardCanvas = document.createElement("canvas");
cardCanvas.width = 688; cardCanvas.height = 286;
const cardTex = new THREE.CanvasTexture(cardCanvas);
cardTex.colorSpace = THREE.SRGBColorSpace;
const cardMat = new THREE.MeshBasicMaterial({ map: cardTex, transparent: true, opacity: 0, depthWrite: false });
const PX = 1.93 / 1688;
const card = new THREE.Mesh(new THREE.PlaneGeometry(688 * PX, 286 * PX), cardMat);
card.position.set(0, (844 - (832 + 143)) * PX, PD / 2 + 0.008);
phone.add(card);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.7), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2;
shadow.position.set(0, -1.32, 0.05);
phoneScene.add(shadow);

const key = new THREE.DirectionalLight(0xfff1dc, 2.2); key.position.set(-2, 3, 4); phoneScene.add(key);
const rim = new THREE.DirectionalLight(0xc7d5ee, 1.4); rim.position.set(3, 1, -2); phoneScene.add(rim);
phoneScene.add(new THREE.AmbientLight(0x404858, 0.4));

// Screen content: the shipped screens, corrected for truth, plus live overlays.
// Truth: the tab bar reads Today / Debrief / Universe (the Personal Model is
// reached from the universe), and the greeting carries no name. Story: one
// thread runs through every screen. The confession becomes a morning step,
// and the step becomes something the app understands, with its reason.
const shots = {};
const imgLoad = (name) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = ASSET(`img/${name}.webp`); });
const confession = "Snapped at my sister again. Don't know why.";
const CARD = { x: 46, y: 832, w: 688, h: 286 }; // the sister step on Today
const INSIGHT = { x: 49, y: 1135, w: 682, h: 373 }; // the Personal Model card
const SPOTS = { debrief: [40, 100, 700, 470], today: [40, 815, 700, 320], you: [40, 1118, 700, 405] };
const base = {};
function baseCanvas(img, fn) {
  const c = document.createElement("canvas"); c.width = SW; c.height = SH;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0, SW, SH); fn(g, img); return c;
}
function fixTabs(g, img, active) {
  // erase YOU (and its dot), then set the shipped third tab
  g.drawImage(img, 650, 1568, 70, 58, 580, 1568, 70, 58);
  g.font = '400 20.5px "IBM Plex Mono"'; g.letterSpacing = "4.2px"; g.textBaseline = "alphabetic";
  const w = g.measureText("UNIVERSE").width - 4.2;
  g.fillStyle = active ? color.gold : "#CCB28B"; g.globalAlpha = active ? 1 : 0.62;
  g.fillText("UNIVERSE", 617 - w / 2, 1598); g.globalAlpha = 1; g.letterSpacing = "0px";
  if (active) { g.fillStyle = color.gold; g.beginPath(); g.arc(619, 1614, 3, 0, 6.283); g.fill(); }
}
function buildScreens() {
  base.debrief = baseCanvas(shots.debrief, (g, img) => fixTabs(g, img, false));
  base.today = baseCanvas(shots.today, (g, img) => {
    fixTabs(g, img, false);
    g.drawImage(img, 410, 124, 146, 40, 264, 124, 146, 40); // "GOOD MORNING", no name
    g.fillStyle = "#13161E"; g.fillRect(60, 915, 660, 172);
    g.font = '400 31px "Albert Sans"'; g.fillStyle = color.ink;
    g.fillText("Call your sister.", 91, 953); g.fillText("Just to talk.", 91, 1003);
    g.font = '400 26px "Albert Sans"'; g.fillStyle = "#AAADAD";
    g.fillText("the people closest get your tired self", 91, 1064);
  });
  base.you = baseCanvas(shots.you, (g, img) => {
    fixTabs(g, img, true);
    const { x, y, w, h } = INSIGHT;
    g.fillStyle = color.ground; g.fillRect(x - 6, y - 6, w + 12, 1530 - y);
    g.fillStyle = "#13161E"; g.strokeStyle = "#252B33"; g.lineWidth = 2;
    g.beginPath(); g.roundRect(x, y, w, h, 26); g.fill(); g.stroke();
    g.drawImage(img, 85, 1172, 300, 32, 85, 1172, 300, 32); // PROBABLY TRUE
    g.font = 'italic 400 41px "Cormorant Garamond"'; g.fillStyle = color.ink;
    g.fillText("You get sharp with the people closest", 91, 1260);
    g.fillText("when you’re running on empty.", 91, 1305);
    g.font = '400 25px "Albert Sans"'; g.fillStyle = color.dim;
    g.fillText("Why I think this: I have seen this in your", 91, 1347);
    g.fillText("evenings 3 times this month.", 91, 1385);
    g.drawImage(img, 66, 1350, 250, 86, 66, 1404, 250, 86); // the real "That's not right" control
    g.drawImage(img, 662, 1294, 28, 34, 662, 1318, 28, 34); // chevron
  });
}
let lastScreenKey = "";
function drawScreen(mode, typed, seed, lift = 0, spot = 0, ping = 0) {
  const k = `${mode}|${typed}|${Math.round(seed * 20)}|${Math.round(lift * 10)}|${Math.round(spot * 40)}|${Math.round(ping * 30)}`;
  if (k === lastScreenKey || !base.debrief) return;
  lastScreenKey = k;
  sctx.drawImage(base[mode], 0, 0);
  if (mode === "debrief") {
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
  } else if (mode === "today" && lift > 0) {
    // the slot the lifted step leaves behind
    sctx.globalAlpha = lift; sctx.fillStyle = "#0A0D12";
    sctx.beginPath(); sctx.roundRect(CARD.x + 3, CARD.y + 6, CARD.w - 6, CARD.h - 12, 26); sctx.fill();
    sctx.strokeStyle = "rgba(35,42,52,.9)"; sctx.lineWidth = 2; sctx.stroke(); sctx.globalAlpha = 1;
  } else if (mode === "you" && ping > 0) {
    // the dispute control answers: one soft ring
    const r = 40 + ping * 90;
    sctx.strokeStyle = `rgba(180,101,95,${0.55 * (1 - ping)})`; sctx.lineWidth = 3;
    sctx.beginPath(); sctx.roundRect(91 - r * 0.3, 1440 - r * 0.42, 195 + r * 0.6, r * 0.84, 18 + r * 0.2); sctx.stroke();
  }
  if (spot > 0) {
    // film: the frame isolates what matters so it reads at phone size
    const [x, y, w, h] = SPOTS[mode];
    sctx.save(); sctx.fillStyle = `rgba(6,8,12,${0.86 * spot})`;
    sctx.beginPath(); sctx.rect(0, 0, SW, SH); sctx.roundRect(x, y, w, h, 30); sctx.fill("evenodd"); sctx.restore();
  }
  screenTex.needsUpdate = true;
}
let lastCardKey = -1;
function drawCard(seed) {
  const k = Math.round(seed * 20);
  if (k === lastCardKey || !base.today) return;
  lastCardKey = k;
  const g = cardCanvas.getContext("2d");
  g.clearRect(0, 0, CARD.w, CARD.h);
  g.save(); g.beginPath(); g.roundRect(2, 6, CARD.w - 4, CARD.h - 12, 26); g.clip();
  g.drawImage(base.today, CARD.x, CARD.y, CARD.w, CARD.h, 0, 0, CARD.w, CARD.h); g.restore();
  g.strokeStyle = `rgba(201,169,106,${0.25 + 0.55 * seed})`; g.lineWidth = 2.5;
  g.beginPath(); g.roundRect(3, 7, CARD.w - 6, CARD.h - 14, 25); g.stroke();
  if (seed > 0) {
    // kept: a small seed of light, the same light the story began with
    const cx = 634, cy = 56, r = 46 * seed;
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, `rgba(255,236,196,${0.95 * seed})`); gr.addColorStop(0.25, `rgba(201,169,106,${0.6 * seed})`); gr.addColorStop(1, "rgba(201,169,106,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.fill();
  }
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

function placeWorlds(tSec) {
  // Orbit: worlds drift slowly. Placed before the camera solve, which aims at them.
  // Portrait screens draw the worlds in and stack them taller.
  const portrait = camera.aspect < 0.75, ky = portrait ? 1.35 : 1;
  if (REDUCED) tSec = 0;
  worldObjs.forEach((o, i) => {
    const kx = portrait ? (o.w.key === "soul" ? 0.3 : 0.45) : 1;
    const ang = tSec * 6.283 / 90 + i * 1.7;
    o.g.position.set(o.base.x * kx + Math.cos(ang) * 0.5, o.base.y * ky + Math.sin(ang * 0.8) * 0.35, o.base.z);
  });
}

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
    look.set(0, 0, mix(0, -20, kk)); // the gaze leaves the glass smoothly
  } else if (s < 3) {
    const k = 1 - Math.pow(1 - clamp((s - 2.3) / 0.7), 2.2); // enters at the speed of the push
    look.copy(HUB.look);
    pos.set(0, 0, mix(-1.2, HUB.pos.z, k));
  } else {
    pos.copy(HUB.pos); look.copy(HUB.look);
    const back = easeInOutCubic(clamp((s - 3) / 1));
    pos.z += back * 4;
  }
  // portrait: the web lifts the phone above bottom captions; the film lowers it under top captions
  if (s < 2.3 && camera.aspect < 0.75) { const dy = (FILM ? 0.34 : 0.1) * (1 - smooth(1.9, 2.3, s)); pos.y += dy; look.y += dy; }
  if (s >= 2.3 && !REDUCED) {
    // Orbit: the camera at rest is never quite still.
    const o = (t / motion.orbit.period) * 6.283;
    pos.x += Math.sin(o) * motion.orbit.radius * smooth(2.6, 3, s);
    pos.y += Math.cos(o * 0.7) * motion.orbit.radius * 0.6 * smooth(2.6, 3, s);
  }
  return { pos, look };
}
// Reading push: the camera comes close enough that the interface reads at
// phone size. y is the region of interest in phone units.
const PUSH_Y = { debrief: (844 - 335) * PX, today: (844 - 975) * PX, you: (844 - 1320) * PX };
// distance at which the screen fills about 90% of the frame width (portrait),
// or sits comfortably beside the words (landscape)
const pushDist = () => (camera.aspect < 0.75 ? PD / 2 + 0.99 / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect) : 2.9);
const bump = (a, b, c, d, v) => smooth(a, b, v) * (1 - smooth(c, d, v));
function pushFor(s) {
  if (s < 1.8) return Math.max(bump(1.02, 1.14, 1.3, 1.37, s), bump(1.45, 1.56, 1.7, 1.79, s));
  return bump(3.95, 4.2, 4.42, 4.62, s);
}
function focusPose(wo) {
  const p = wo.g.position.clone();
  const dir = p.clone().sub(HUB.pos).normalize();
  const pos = p.clone().sub(dir.multiplyScalar(wo.w.size * (wo.w.key === "future" ? 1.05 : 1.55)));
  if (camera.aspect < 0.75) {
    // portrait: the world centred in the upper half, its panel below
    pos.y -= wo.w.size * 0.1;
    return { pos, look: p.clone().add(v3(0, -wo.w.size * 0.34, 0)) };
  }
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
$("ctaLink").href = cta.href; $("ctaLink").textContent = cta.label; $("ctaNote").textContent = cta.note; $("ctaHandle").textContent = cta.handle;
$("ctaLink").setAttribute("aria-label", `${cta.label} (opens in a new tab)`);

const interactiveCaptions = [
  [0.22, 0.86, "It begins with one honest moment."],
  [0.98, 1.4, "Each evening, Dawnward asks one real question. You talk. It listens."],
  [1.42, 1.85, "Each morning, three small steps, drawn from your own words."],
  [1.95, 2.6, "Nothing you live honestly is lost."],
  [2.62, 2.93, "Your days become four worlds. Mind, body, soul and future."],
  [3.55, 4.12, "And slowly, it understands you. And shows you why."],
  [4.12, 4.55, "When it\u2019s wrong, you tell it. Private. Never sold."],
];
// Captions change as the visitor scrubs; screen readers hear one only once it
// has stayed for 600 ms, so scrolling never floods them.
const live = $("live");
let capText = "", liveT = 0;
function setCaption(text) {
  if (text === capText) return;
  capText = text;
  capEl.classList.remove("on");
  if (text) { capEl.textContent = text; void capEl.offsetWidth; capEl.classList.add("on"); }
  capEl.classList.toggle("side", sideCaption);
  if (!FILM) { clearTimeout(liveT); if (text) liveT = setTimeout(() => { live.textContent = text; }, 600); }
}
let sideCaption = false;

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
  mv.textContent = w.move ? `One quiet move today: ${w.move.replace(/\.$/, "")}.` : w.aspiration;
  const bel = panel.querySelector(".pbel");
  bel.hidden = !w.belief;
  if (w.belief) { bel.querySelector("q").textContent = w.belief.text; bel.querySelector("span").textContent = `Why I think this: ${w.belief.why}`; }
  panel.classList.add("open");
  panel.inert = false;
  sound.world(key);
  if (!FILM) setTimeout(() => panel.querySelector(".pt").focus({ preventScroll: true }), 450);
}
function closeWorld() {
  const key = focusKey;
  focusKey = null;
  panel.classList.remove("open");
  panel.inert = true;
  sound.back();
  // focus returns to where the visitor was
  if (!FILM && key && panel.contains(document.activeElement)) {
    const el = labelEls[key];
    if (el && s > 2.85 && s < 3.4) { el.inert = false; el.tabIndex = 0; el.focus({ preventScroll: true }); } // its label returns this frame
    else (nav.querySelector(".cur") || nav.firstChild).focus({ preventScroll: true });
  }
}
panel.querySelector(".close").addEventListener("click", closeWorld);

/* --------------------------------------------------------------- story time */
let s = 0, target = 0, lastInput = 0; // lastInput 0 = the visitor has not moved yet
const story = $("story");
const storyOpen = () => story.classList.contains("show");
let swapT = 0;
const goTo = (v) => {
  target = clamp(v, 0, 5); lastInput = performance.now();
  if (REDUCED && !FILM) {
    // reduced motion: no travel. A short cross-fade, then the new chapter.
    stageEl.classList.add("swap"); clearTimeout(swapT);
    swapT = setTimeout(() => { s = target; focusAmt = focusKey ? 1 : 0; stageEl.classList.remove("swap"); }, 200);
  }
};
const step = (dir) => {
  const next = chapters.find((c) => c.rest > target + 0.05), prev = [...chapters].reverse().find((c) => c.rest < target - 0.05);
  const c = dir > 0 ? next : prev; if (c) goTo(c.rest);
};
const nav = $("nav");
chapters.forEach((c, i) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "dot";
  b.innerHTML = `<i></i><span>${c.label}</span>`;
  b.setAttribute("aria-label", `Chapter ${i + 1} of ${chapters.length}: ${c.label}`);
  b.addEventListener("click", () => { if (focusKey) closeWorld(); goTo(c.rest); });
  nav.appendChild(b);
});
const dots = [...nav.children];

if (!FILM) {
  let wheelLock = 0;
  addEventListener("wheel", (e) => {
    if (focusKey || storyOpen()) return;
    if (!REDUCED) { goTo(target + e.deltaY * 0.0011); return; }
    const now = performance.now(); // reduced motion: one wheel gesture, one chapter
    if (Math.abs(e.deltaY) > 8 && now > wheelLock) { wheelLock = now + 700; step(Math.sign(e.deltaY)); }
  }, { passive: true });
  let ty = null, ty0 = null;
  addEventListener("touchstart", (e) => { ty = ty0 = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchmove", (e) => {
    if (ty == null || focusKey || storyOpen() || e.touches.length > 1 || REDUCED) return;
    const y = e.touches[0].clientY; goTo(target + (ty - y) * 0.0042); ty = y;
  }, { passive: true });
  addEventListener("touchend", (e) => {
    if (REDUCED && ty0 != null && !focusKey && !storyOpen()) { const d = ty0 - e.changedTouches[0].clientY; if (Math.abs(d) > 40) step(Math.sign(d)); }
    ty = ty0 = null;
  }, { passive: true });
  addEventListener("keydown", (e) => {
    if (storyOpen()) return;
    if (e.key === "Escape" && focusKey) { closeWorld(); return; }
    if (focusKey) return;
    const t = e.target; // Space and Enter on a control belong to that control
    if (e.key === " " && t && t.closest && t.closest("button, a, input")) return;
    if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); step(1); }
    if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); step(-1); }
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
  } else if (s > 1.45 && s < 1.9) {
    goTo(chapters.find((c) => c.id === "portal").rest); // the kept step: tapping it sends you through
  } else if (s < 0.9) {
    goTo(chapters[1].rest);
  } else if (s >= 0.9 && s <= 1.45) {
    step(1);
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
  rtSize.w = Math.round(w * dpr * 0.75); rtSize.h = Math.round(h * dpr * 0.75);
  if (portalRT.width !== 16) portalRT.setSize(rtSize.w, rtSize.h);
  screenMat.uniforms.uRes.value.set(w * dpr, h * dpr);
  for (const p of [dust, starsFar, starsMid, starsNear]) p.material.uniforms.uPx.value = dpr * (h / 900);
}
addEventListener("resize", resize);
resize();

/* ------------------------------------------------------------- the frame */
const tmpPos = v3(0, 0, 0), tmpLook = v3(0, 0, 0), tmpV = v3(0, 0, 0), lv0 = v3(0, 0, 0), lv1 = v3(0, 0, 0);
function frame(st) {
  const { s, t, focusAmt: fa, bloom } = st;
  const tSec = REDUCED ? 0 : t / 1000;
  const push = st.push ?? pushFor(s), pushE = easeInOutCubic(push);
  const spot = st.spot ?? push;
  placeWorlds(tSec);
  // camera first: everything placed relative to it reads this frame's pose.
  // camera: the story path, mixed toward the focused world by gravity
  const c = cameraFor(s, t);
  tmpPos.copy(c.pos); tmpLook.copy(c.look);
  if (s < 1.8 && pushE > 0) {
    // the reading push: straight on to the part of the screen that matters
    const py = mix(PUSH_Y.debrief, PUSH_Y.today, smooth(1.33, 1.45, s)), pz = pushDist();
    tmpPos.lerp(v3(0, py, pz), pushE); tmpLook.lerp(v3(0, py, 0), pushE);
  }
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
  lightMesh.visible = li > 0.001; // an unlit glow still costs a full-frame pass when the camera is close
  lightShader.uniforms.uTime.value = tSec;
  lightShader.uniforms.uHalo.value = 1 + (FILM ? 0 : clamp(1 - pointerS.length()) * 0.6) * (1 - smooth(0.8, 1, s));
  dust.material.uniforms.uAlpha.value = smooth(0.1, 0.7, s) * (1 - smooth(1.9, 2.25, s)) * 0.9;
  dust.visible = dust.material.uniforms.uAlpha.value > 0.001;
  dust.material.uniforms.uTime.value = REDUCED ? 0 : t;
  dust.rotation.y = pointerS.x * 0.08 + tSec * 0.004;
  dust.rotation.x = -pointerS.y * 0.05;

  // phone: emergence from the light, then the honest minute, then the portal
  const pe = easeOutQuart(smooth(0.62, 1.05, s));
  const phoneOn = s < 2.3 || s > 3.3;
  phone.visible = phoneOn; shadow.visible = phoneOn && s < 2.3;
  let mode = "debrief", typed = 0, seed = 0;
  if (s < 2.3) {
    phone.position.set(0, mix(-0.35, 0, pe), 0);
    phone.rotation.set((mix(0.2, 0.06, pe) - pointerS.y * 0.06) * (1 - pushE), (mix(-0.62, -0.2, pe) + pointerS.x * 0.09) * (1 - pushE * 0.85) + smooth(1.75, 2.15, s) * 0.2, 0);
    phone.visible = pe > 0.002; // an invisible phone must not write depth over the light
    // the frame thins away as the glass becomes a window, so it never slabs across the view
    const fr = pe * (1 - smooth(1.95, 2.08, s));
    frameMat.opacity = fr; bezel.material.opacity = fr; screenMat.uniforms.uOpacity.value = pe;
    screenMat.uniforms.uBright.value = smooth(0.85, 1.1, s);
    typed = Math.round(confession.length * smooth(1.0, 1.18, s));
    if (s >= 1.38) { mode = "today"; seed = smooth(1.5, 1.62, s); }
    screenMat.uniforms.uMix.value = smooth(1.86, 2.08, s);
    cardMat.opacity = smooth(1.42, 1.55, s) * (1 - smooth(1.86, 2.0, s));
    card.position.z = PD / 2 + 0.004 + smooth(1.45, 1.6, s) * 0.012;
    shadow.material.opacity = pe * 0.55 * (1 - smooth(1.8, 2.1, s));
  } else {
    // Moment 5: the phone returns inside the universe, at human scale.
    const r = easeOutQuart(smooth(3.35, 3.9, s)) * (1 - smooth(4.5, 4.85, s));
    mode = "you";
    phone.visible = r > 0.002;
    const yRest = camera.aspect < 0.75 ? (FILM ? -0.2 : 0.1) : 0.16;
    tmpV.set(0, mix(yRest, -PUSH_Y.you, pushE) + (1 - r) * -0.4, -mix(4.7, pushDist(), pushE));
    phone.position.copy(camera.position).add(tmpV.applyQuaternion(camera.quaternion));
    phone.quaternion.copy(camera.quaternion);
    phone.rotateX((0.04 - pointerS.y * 0.05) * (1 - pushE)); phone.rotateY((-0.12 + pointerS.x * 0.08 + Math.sin(tSec * 0.25) * 0.02) * (1 - pushE * 0.85));
    frameMat.opacity = r; bezel.material.opacity = r; screenMat.uniforms.uOpacity.value = r;
    screenMat.uniforms.uMix.value = 0; screenMat.uniforms.uBright.value = 1;
    cardMat.opacity = 0;
    shadow.visible = false;
  }
  drawScreen(mode, typed, seed, mode === "today" ? cardMat.opacity : 0, spot, st.ping || 0);
  if (mode === "today") drawCard(seed);
  screenMat.uniforms.uGlare.value = 0.6 + phone.rotation.y * 1.6;

  // universe
  const uniOn = s > 1.8;
  const dimU = 1 - smooth(3.3, 3.9, s) * 0.45 - smooth(4.4, 4.95, s) * 0.5;
  for (const p of [starsFar, starsMid, starsNear]) { p.material.uniforms.uTime.value = REDUCED ? 0 : t; p.material.uniforms.uAlpha.value = dimU; }
  // the passage: near stars brighten while we travel, so depth reads
  starsNear.material.uniforms.uAlpha.value = dimU * (1 + 1.2 * smooth(2.0, 2.3, s) * (1 - smooth(2.7, 3.0, s)));
  starsMid.material.uniforms.uAlpha.value = dimU * (1 + 0.6 * smooth(2.0, 2.3, s) * (1 - smooth(2.7, 3.0, s)));
  nebula.material.opacity = 0.85 * dimU;
  keptStar.material.opacity = smooth(2.15, 2.45, s) * dimU * (0.85 + 0.15 * Math.sin(tSec * 0.98));
  worldObjs.forEach((o, i) => {
    const b = bloom[i];
    const breath = REDUCED ? 1 : 1 + Math.sin(tSec * 6.283 / (motion.breath.period / 1000) + i) * motion.breath.depth * 0.5;
    const isF = focusKey === o.w.key || st.focusKey === o.w.key;
    o.planet.material.opacity = b * dimU;
    o.planet.scale.setScalar(o.w.size * mix(motion.emergence.scaleFrom, 1, b) * (hoverKey === o.w.key ? 1.03 : 1));
    o.atmo.material.opacity = b * dimU * (o.w.key === "future" ? 0.14 : 0.28) * breath * (isF ? 1.25 : 1);
    o.atmo.scale.setScalar(o.w.size * 1.9 * breath);
  });


  // render: the universe directly once we are through the glass; before
  // that, only as the portal inside the screen.
  renderer.clear();
  // the portal target exists at full size only around the crossing
  const needRT = s > 1.7 && s < 2.3, rw = needRT ? rtSize.w : 16, rh = needRT ? rtSize.h : 16;
  if ((needRT || s < 1.5 || s > 2.6) && (portalRT.width !== rw || portalRT.height !== rh)) portalRT.setSize(rw, rh);
  if (uniOn && s < 2.3) {
    renderer.setRenderTarget(portalRT); renderer.clear(); renderer.render(uniScene, camera); renderer.setRenderTarget(null);
  }
  // once the camera is past the glass the sky is drawn directly, never a frame of nothing
  if (s >= 2.24 || (s > 2.0 && camera.position.z < PD / 2 + 0.06)) renderer.render(uniScene, camera);
  if (phoneOn) { renderer.clearDepth(); renderer.render(phoneScene, camera); }

  // overlay
  const showLabels = s > 2.85 && s < 3.4 && !fk;
  worldObjs.forEach((o, i) => {
    const el = labelEls[o.w.key];
    const W = innerWidthF(), H = innerHeightF();
    const c0 = lv0.copy(o.g.position).project(camera);
    const c1 = lv1.copy(camera.up).multiplyScalar(o.w.size * 0.5).add(o.g.position).project(camera);
    const rPx = Math.abs(c1.y - c0.y) * 0.5 * H;
    const x = clamp((c0.x * 0.5 + 0.5) * W, 70, W - 150);
    const y = clamp((-c0.y * 0.5 + 0.5) * H + rPx * 0.78, 80, H - 210);
    const vis = showLabels && bloom[i] > 0.6 && c0.z < 1;
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, 0)`;
    el.classList.toggle("on", vis);
    el.tabIndex = vis ? 0 : -1;
    el.inert = !vis;
  });
  return { li };
}
const innerWidthF = () => (FILM ? 1080 : innerWidth);
const innerHeightF = () => (FILM ? 1920 : innerHeight);

/* ------------------------------------------------------------- run loops */
const bloomFor = (s) => worlds.map((_, i) => Math.max(0.26 * smooth(1.95, 2.35, s), easeOutQuart(smooth(2.55 + i * 0.07, 2.95 + i * 0.07, s))));
async function boot() {
  const [debrief, today, you] = await Promise.all(["debrief", "today", "you"].map(imgLoad));
  Object.assign(shots, { debrief, today, you });
  // canvas text needs its faces loaded explicitly; document.fonts.ready only covers the DOM
  await Promise.all(['400 31px "Albert Sans"', '400 20px "IBM Plex Mono"', 'italic 400 41px "Cormorant Garamond"']
    .map((f) => document.fonts.load(f, "Aa").catch(() => {})));
  await document.fonts.ready;
  if (debrief && today && you) buildScreens();
  document.documentElement.classList.add("ready");
  const nearest = (v) => chapters.reduce((a, c) => (Math.abs(c.rest - v) < Math.abs(a.rest - v) ? c : a), chapters[0]);
  const chrome = (end, demo) => {
    endEl.inert = !end; demoTag.classList.toggle("on", demo);
  };
  if (FILM) {
    await Promise.all(texLoads);
    window.FILM_MS = FILM_MS;
    window.SEEK = (ms) => {
      const st = filmState(ms);
      s = st.s;
      focusKey = null;
      pointerS.set(0, 0);
      frame({ ...st, t: ms });
      setCaption(filmCaptions(ms));
      panel.classList.toggle("open", st.panelOpen);
      if (st.panelOpen && st.focusKey && panel.dataset.k !== st.focusKey) { selectWorld(st.focusKey); focusKey = null; panel.dataset.k = st.focusKey; }
      endEl.classList.toggle("on", st.end);
      endEl.style.opacity = st.endAmt;
      chrome(st.end, (s > 0.95 && s < 1.95) || (s > 3.6 && s < 4.55));
      document.documentElement.style.setProperty("--fade", st.fade);
    };
    window.SEEK(0);
    window.FILM_READY = true;
    return;
  }
  hubHint.textContent = matchMedia("(hover: hover) and (pointer: fine)").matches ? "Click a world to visit it" : "Tap a world to visit it";
  window.DW = { goTo, select: selectWorld, close: closeWorld, jump: (v) => { s = target = v; lastInput = performance.now(); focusAmt = focusKey ? 1 : 0; }, get s() { return s; } };
  let prev = performance.now(), t0 = prev, raf = 0, paused = false, hiddenTab = false, storyShown = false;
  const run = () => {
    const stop = hiddenTab || storyShown;
    if (stop === paused) return;
    paused = stop;
    sound.pause(paused);
    if (!paused) { prev = performance.now(); raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
  };
  document.addEventListener("visibilitychange", () => { hiddenTab = document.hidden; run(); });
  document.addEventListener("dwstory", (e) => { storyShown = e.detail; run(); }); // nothing renders behind the text version
  renderer.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); paused = true; cancelAnimationFrame(raf); document.getElementById("textv").click(); });
  renderer.domElement.addEventListener("webglcontextrestored", () => location.reload());
  let curId = "";
  const loop = (now) => {
    if (paused) return;
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    if (!REDUCED) {
      // Gravity: settle toward the nearest rest point once input stops.
      if (lastInput && now - lastInput > 900 && !focusKey) {
        const rest = nearest(target).rest;
        target += (rest - target) * (1 - Math.pow(0.5, dt / 0.4));
        if (Math.abs(rest - target) < 0.001) target = rest;
      }
      s += (target - s) * (1 - Math.pow(0.5, dt / motion.gravity.halfLife));
      if (Math.abs(target - s) < 0.0005) s = target;
      pointerS.lerp(pointer, 1 - Math.pow(0.5, dt / 0.25));
      focusAmt += ((focusKey ? 1 : 0) - focusAmt) * (1 - Math.pow(0.5, dt / motion.gravity.focusHalfLife));
    } else { pointerS.set(0, 0); focusAmt = focusKey ? 1 : 0; } // reduced motion: s moves only by cross-fade steps
    const bl = bloomFor(s);
    frame({ s, t: now - t0, focusAmt, bloom: bl, focusKey: null });
    sideCaption = camera.aspect > 1.1 && ((s > 0.85 && s < 1.95) || (s > 3.45 && s < 4.62));
    const cap = interactiveCaptions.find(([a, b]) => s >= a && s < b);
    setCaption(focusKey ? "" : cap ? cap[2] : "");
    const hintOn = s < 0.12 && now - t0 > 1600;
    hint.classList.toggle("on", hintOn); hint.inert = !hintOn;
    hubHint.classList.toggle("on", s > 2.93 && s < 3.4 && !focusKey);
    endEl.classList.toggle("on", s > 4.7);
    endEl.style.opacity = smooth(4.55, 4.95, s);
    chrome(s > 4.7, (s > 0.95 && s < 1.95) || (s > 3.6 && s < 4.55));
    const cur = nearest(s).id;
    if (cur !== curId) {
      curId = cur;
      dots.forEach((d, i) => { const on = chapters[i].id === cur; d.classList.toggle("cur", on); on ? d.setAttribute("aria-current", "step") : d.removeAttribute("aria-current"); });
    }
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
