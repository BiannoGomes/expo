// The Memory Galaxy scene. Presentation only: every bright star is one of
// the person's evenings and every line a belief two evenings share. The
// dust, nebula and far stars are atmosphere and carry no data; they are
// fainter by design so nothing decorative can be mistaken for a memory.
//
// Look: a tilted spiral, oldest evenings near the core, newest at the rim.
// Stars are shader sprites (core, halo, four-point diffraction spikes) that
// twinkle; belief lines are thin glowing tubes with light pulses running
// along them; a bloom pass lifts the highlights on screen. Comfort and
// access: Reduce Motion stops twinkle, pulses, spin and camera drift; in
// VR there is no spin, no camera motion and no post-processing.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const CENTER = new THREE.Vector3(0, 1.45, -3.4);
const TILT = 0.48;
const GOLD = new THREE.Color("#E9C98A");
const INK = new THREE.Color("#F1EEE6");
const COOL = new THREE.Color("#C7D5EE");

export function rand(seed) {
  // small deterministic generator for the atmosphere
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Where each evening sits: a two-armed spiral, oldest at the core. */
export function layout(stars, hash) {
  const n = stars.length;
  return new Map(
    stars.map((s, i) => {
      const t = n > 1 ? i / (n - 1) : 0.5;
      const arm = hash(s.id, 3) < 0.5 ? 0 : Math.PI;
      const r = 0.4 + 2.25 * t + (hash(s.id, 4) - 0.5) * 0.18;
      const theta = t * Math.PI * 2.1 + arm + (hash(s.id, 5) - 0.5) * 0.45;
      const y = (hash(s.id, 9) - 0.5) * 0.32 * (1 - 0.5 * t);
      return [s.id, new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta))];
    }),
  );
}

export const STAR_VERT = /* glsl */ `
  uniform float uTime, uPixel, uIntro, uReduced, uScale;
  attribute vec3 aColor; attribute float aSize, aPhase, aBirth, aLit, aSel;
  varying vec3 vColor; varying float vSel, vAlpha, vFlash, vLit;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float born = uReduced > 0.5 ? 1.0 : smoothstep(aBirth, aBirth + 0.7, uIntro);
    float flash = uReduced > 0.5 ? 0.0 : (1.0 - smoothstep(aBirth + 0.1, aBirth + 1.1, uIntro)) * born;
    float tw = uReduced > 0.5 ? 1.0 : 0.8 + 0.2 * sin(uTime * (1.1 + aPhase * 1.9) + aPhase * 40.0);
    float size = aSize * (1.0 + 0.45 * aLit + 0.7 * aSel + 1.4 * flash) * tw * born;
    gl_PointSize = size * uPixel * (uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
    vColor = mix(aColor, vec3(0.98, 0.83, 0.55), aLit * 0.9);
    vSel = aSel; vAlpha = born; vFlash = flash; vLit = aLit;
  }`;

export const STAR_FRAG = /* glsl */ `
  uniform float uTime, uReduced;
  varying vec3 vColor; varying float vSel, vAlpha, vFlash, vLit;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = length(p);
    if (d > 1.0) discard;
    float core = exp(-d * d * 30.0);
    float halo = exp(-d * d * 5.5) * 0.42;
    float spikes = (exp(-abs(p.x) * 42.0) * exp(-abs(p.y) * 2.6) + exp(-abs(p.y) * 42.0) * exp(-abs(p.x) * 2.6)) * 0.6;
    float pulse = uReduced > 0.5 ? 0.0 : 0.05 * sin(uTime * 3.0);
    float ring = vSel * smoothstep(0.05, 0.0, abs(d - (0.66 + pulse))) * 0.95;
    float a = core + halo + spikes * (1.0 + vFlash) + ring;
    // Lit stars keep their gold: the halo carries the colour, the core stays below white.
    vec3 gold = vec3(0.98, 0.78, 0.42);
    vec3 col = vColor * (core * 1.15 + halo + spikes) + gold * (halo * 1.4 + spikes * 0.6) * vLit + gold * ring + vec3(1.0) * vFlash * core;
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * vAlpha);
  }`;

export const DUST_VERT = /* glsl */ `
  uniform float uTime, uPixel, uReduced, uIntro;
  attribute vec3 aColor; attribute float aSize, aPhase;
  varying vec3 vColor; varying float vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = uReduced > 0.5 ? 1.0 : 0.65 + 0.35 * sin(uTime * (0.6 + aPhase) + aPhase * 30.0);
    float on = uReduced > 0.5 ? 1.0 : smoothstep(0.0, 2.4, uIntro);
    gl_PointSize = aSize * uPixel * (60.0 / -mv.z) * (0.6 + 0.4 * tw);
    gl_Position = projectionMatrix * mv;
    vColor = aColor; vA = tw * on;
  }`;

export const DUST_FRAG = /* glsl */ `
  varying vec3 vColor; varying float vA;
  void main() {
    float d = length(gl_PointCoord * 2.0 - 1.0);
    if (d > 1.0) discard;
    gl_FragColor = vec4(vColor, exp(-d * d * 7.0) * 0.38 * vA);
  }`;

export const LINK_VERT = /* glsl */ `
  varying float vProg;
  void main() { vProg = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const LINK_FRAG = /* glsl */ `
  uniform float uTime, uLit, uOffset, uReduced, uIntro, uBorn;
  varying float vProg;
  void main() {
    float drawn = uReduced > 0.5 ? 1.0 : step(vProg, clamp((uIntro - uBorn) / 0.9, 0.0, 1.0));
    float base = mix(0.12, 0.85, uLit);
    float head = fract(uTime * mix(0.18, 0.32, uLit) + uOffset);
    float pulse = uReduced > 0.5 ? 0.0 : smoothstep(0.1, 0.0, abs(head - vProg)) * mix(0.5, 1.4, uLit);
    vec3 col = mix(vec3(0.55, 0.68, 0.95), vec3(0.98, 0.82, 0.5), uLit);
    float a = (base + pulse) * drawn;
    gl_FragColor = vec4(col * (base + pulse * 1.8), a);
  }`;

export const NEBULA_FRAG = /* glsl */ `
  uniform float uTime, uReduced;
  varying vec3 vDir;
  float h(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float n3(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n3(p); p *= 2.03; a *= 0.5; } return v; }
  void main() {
    vec3 d = normalize(vDir);
    float t = uReduced > 0.5 ? 0.0 : uTime * 0.008;
    float n = fbm(d * 2.2 + vec3(t, 0.0, -t));
    float m = fbm(d * 4.5 - vec3(0.0, t, t) + n);
    vec3 indigo = vec3(0.05, 0.06, 0.16), violet = vec3(0.17, 0.09, 0.26), teal = vec3(0.04, 0.16, 0.2), gold = vec3(0.35, 0.24, 0.1);
    vec3 col = mix(indigo, violet, smoothstep(0.35, 0.75, n));
    col = mix(col, teal, smoothstep(0.55, 0.85, m) * 0.6);
    float core = pow(max(dot(d, normalize(vec3(0.0, 0.05, -1.0))), 0.0), 8.0);
    col += gold * core * 0.5;
    // Mostly dark sky with wisps: the nebula is a backdrop, never the subject.
    col *= 0.06 + 0.7 * smoothstep(0.42, 0.9, n * m * 1.7);
    gl_FragColor = vec4(col * 0.32, 1.0);
  }`;

export function buildScene(galaxy, { hash, reduced, stage }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.xr.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#020308");
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 120);
  // Pull back on tall screens so the whole galaxy fits a phone.
  function placeCamera(t) {
    const k = camera.aspect < 1.15 ? Math.pow(1.15 / camera.aspect, 0.9) : 1;
    const dx = t === null ? 0 : Math.sin(t * 0.045) * 0.7;
    const dy = t === null ? 0 : Math.sin(t * 0.07) * 0.15;
    const dz = t === null ? 0 : Math.sin(t * 0.03) * 0.3;
    camera.position.set(CENTER.x + dx * k, CENTER.y + (1.1 + dy) * k, CENTER.z + (6.1 + dz) * k);
    camera.lookAt(CENTER);
  }
  placeCamera(null);

  const uniforms = {
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uPixel: { value: renderer.getPixelRatio() },
    uReduced: { value: reduced ? 1 : 0 },
    uScale: { value: 300 },
  };

  // yaw (user) > tilt (fixed) > disc (spins slowly)
  const yawGroup = new THREE.Group();
  yawGroup.position.copy(CENTER);
  scene.add(yawGroup);
  const tilt = new THREE.Group();
  tilt.rotation.x = TILT;
  yawGroup.add(tilt);
  const disc = new THREE.Group();
  tilt.add(disc);

  // ---- nebula and far stars: a stationary frame of reference ----
  const nebula = new THREE.Mesh(
    new THREE.SphereGeometry(60, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms,
      vertexShader: "varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: NEBULA_FRAG,
    }),
  );
  scene.add(nebula);

  const rf = rand(7);
  const farN = 2200;
  const far = new Float32Array(farN * 3), farC = new Float32Array(farN * 3), farS = new Float32Array(farN), farP = new Float32Array(farN);
  for (let i = 0; i < farN; i++) {
    const u = rf(), v = rf(), r = 40 + 15 * rf();
    const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
    far.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
    const c = rf() < 0.15 ? GOLD : rf() < 0.5 ? COOL : INK;
    farC.set([c.r, c.g, c.b], i * 3);
    farS[i] = 1.2 + rf() * 2.6;
    farP[i] = rf();
  }
  const farGeo = new THREE.BufferGeometry();
  farGeo.setAttribute("position", new THREE.BufferAttribute(far, 3));
  farGeo.setAttribute("aColor", new THREE.BufferAttribute(farC, 3));
  farGeo.setAttribute("aSize", new THREE.BufferAttribute(farS, 1));
  farGeo.setAttribute("aPhase", new THREE.BufferAttribute(farP, 1));
  const dustMat = (scale) =>
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: DUST_VERT.replace("60.0", scale),
      fragmentShader: DUST_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  scene.add(new THREE.Points(farGeo, dustMat("70.0")));

  // ---- the spiral's dust: atmosphere along two arms, no data ----
  const rd = rand(11);
  let dustN = Math.min(12000, Math.round(7500 * Math.min(devicePixelRatio, 2)));
  const dust = new Float32Array(dustN * 3), dustC = new Float32Array(dustN * 3), dustS = new Float32Array(dustN), dustP = new Float32Array(dustN);
  for (let i = 0; i < dustN; i++) {
    // Two arms winding out from a dense core; a few percent scattered free.
    const t = Math.pow(rd(), 1.35);
    const arm = rd() < 0.5 ? 0 : Math.PI;
    const g = () => (rd() + rd() + rd() - 1.5) / 1.5;
    const free = rd() < 0.12;
    const spread = free ? 1.6 : 0.3 + 0.45 * (1 - t);
    const r = 0.1 + 2.9 * t;
    const theta = t * Math.PI * 2.1 + arm + g() * spread;
    dust.set([r * Math.cos(theta), g() * 0.14 * (1 - 0.6 * t), r * Math.sin(theta)], i * 3);
    const c = new THREE.Color().copy(GOLD).lerp(INK, Math.min(1, t * 1.6)).lerp(COOL, Math.max(0, t * 1.4 - 0.45));
    dustC.set([c.r, c.g, c.b], i * 3);
    dustS[i] = 0.5 + rd() * 1.4;
    dustP[i] = rd();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  dustGeo.setAttribute("aColor", new THREE.BufferAttribute(dustC, 3));
  dustGeo.setAttribute("aSize", new THREE.BufferAttribute(dustS, 1));
  dustGeo.setAttribute("aPhase", new THREE.BufferAttribute(dustP, 1));
  const dustPoints = new THREE.Points(dustGeo, dustMat("14.0"));
  disc.add(dustPoints);

  // ---- the core glow ----
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 256;
  const g2 = glowCanvas.getContext("2d");
  const grad = g2.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,226,170,0.9)");
  grad.addColorStop(0.25, "rgba(233,190,120,0.35)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g2.fillStyle = grad;
  g2.fillRect(0, 0, 256, 256);
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.6 }));
  core.scale.set(1.4, 1.4, 1);
  disc.add(core);

  // ---- the evenings: one star each ----
  const pos = layout(galaxy.stars, hash);
  const n = galaxy.stars.length;
  const sp = new Float32Array(n * 3), sc = new Float32Array(n * 3), ss = new Float32Array(n), sph = new Float32Array(n), sb = new Float32Array(n);
  const lit = new Float32Array(n), sel = new Float32Array(n);
  galaxy.stars.forEach((s, i) => {
    const p = pos.get(s.id);
    sp.set([p.x, p.y, p.z], i * 3);
    const c = s.themeIds.length ? INK : COOL;
    sc.set([c.r, c.g, c.b], i * 3);
    ss[i] = s.themeIds.length ? 1.0 : 0.78;
    sph[i] = hash(s.id, 13);
    sb[i] = 0.5 + (2.4 * i) / Math.max(n, 1); // born oldest first
  });
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  starGeo.setAttribute("aColor", new THREE.BufferAttribute(sc, 3));
  starGeo.setAttribute("aSize", new THREE.BufferAttribute(ss, 1));
  starGeo.setAttribute("aPhase", new THREE.BufferAttribute(sph, 1));
  starGeo.setAttribute("aBirth", new THREE.BufferAttribute(sb, 1));
  starGeo.setAttribute("aLit", new THREE.BufferAttribute(lit, 1));
  starGeo.setAttribute("aSel", new THREE.BufferAttribute(sel, 1));
  const stars = new THREE.Points(
    starGeo,
    new THREE.ShaderMaterial({ uniforms, vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  disc.add(stars);

  // ---- belief lines: thin glowing tubes, arched, with running light ----
  const links = galaxy.links.map((l, k) => {
    const a = pos.get(l.from), b = pos.get(l.to);
    if (!a || !b) return null;
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y += 0.12 + 0.08 * a.distanceTo(b);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: uniforms.uTime,
        uIntro: uniforms.uIntro,
        uReduced: uniforms.uReduced,
        uLit: { value: 0 },
        uOffset: { value: (k * 0.37) % 1 },
        uBorn: { value: Math.max(sb[galaxy.stars.findIndex((s) => s.id === l.to)] ?? 1, 0) + 0.3 },
      },
      vertexShader: LINK_VERT,
      fragmentShader: LINK_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.008, 6, false), mat);
    disc.add(tube);
    return { link: l, mat };
  });

  // ---- a quiet card for VR, where the side panel is out of view ----
  const cardCanvas = document.createElement("canvas");
  cardCanvas.width = 1024; cardCanvas.height = 512;
  const cardTex = new THREE.CanvasTexture(cardCanvas);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshBasicMaterial({ map: cardTex, transparent: true, depthWrite: false }));
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

  // ---- bloom on screen only; quality drops itself if frames run long ----
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // Only the bright things glow: stars, pulses, the core.
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.85, 0.5, 0.55);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  let bloomOn = true;

  const indexOf = new Map(galaxy.stars.map((s, i) => [s.id, i]));
  const ray = new THREE.Raycaster();
  ray.params.Points.threshold = 0.1;

  return {
    renderer,
    scene,
    camera,
    card,
    drawCard,
    get bloomOn() { return bloomOn; },
    /** Which evening the ray points at, if any. */
    pick(origin, direction) {
      ray.set(origin, direction);
      const hit = ray.intersectObject(stars)[0];
      return hit ? galaxy.stars[hit.index]?.id ?? null : null;
    },
    pickScreen(ndc) {
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(stars)[0];
      return hit ? galaxy.stars[hit.index]?.id ?? null : null;
    },
    /** Light the evenings and beliefs in play; ring the selected star. */
    setSelection({ litIds, selId, litThemes }) {
      galaxy.stars.forEach((s, i) => {
        lit[i] = litIds.has(s.id) ? 1 : 0;
        sel[i] = s.id === selId ? 1 : 0;
      });
      starGeo.getAttribute("aLit").needsUpdate = true;
      starGeo.getAttribute("aSel").needsUpdate = true;
      for (const l of links) if (l) l.mat.uniforms.uLit.value = litThemes.has(l.link.themeId) ? 1 : 0;
    },
    worldPositionOf(id) {
      const i = indexOf.get(id);
      if (i === undefined) return null;
      return stars.localToWorld(new THREE.Vector3(sp[i * 3], sp[i * 3 + 1], sp[i * 3 + 2]));
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      placeCamera(reduced ? null : uniforms.uTime.value);
      uniforms.uPixel.value = renderer.getPixelRatio();
    },
    /** Lower the cost: no bloom, fewer pixels. Called by the frame governor. */
    degrade() {
      bloomOn = false;
      renderer.setPixelRatio(1);
      uniforms.uPixel.value = 1;
      dustPoints.geometry.setDrawRange(0, Math.round(dustN * 0.5));
    },
    frame(dt, yaw) {
      const presenting = renderer.xr.isPresenting;
      uniforms.uTime.value += dt;
      uniforms.uIntro.value += dt;
      const still = reduced || presenting;
      if (!still) disc.rotation.y += dt * 0.035;
      yawGroup.rotation.y += (yaw - yawGroup.rotation.y) * Math.min(1, dt * 6);
      if (!still) placeCamera(uniforms.uTime.value);
      if (card.visible) card.lookAt(presenting ? renderer.xr.getCamera().position : camera.position);
      if (presenting || !bloomOn) renderer.render(scene, camera);
      else composer.render(dt);
    },
  };
}
