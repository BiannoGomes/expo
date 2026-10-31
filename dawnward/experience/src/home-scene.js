// Galaxy Home: the full-screen universe. Presentation only; the data and
// every readable word live in HTML (home.js). Four worlds orbit a central
// star; each memory star is a real evening (or labelled sample) placed in
// its world's sector of the spiral; lines are beliefs two evenings share.
// The camera moves on an arc that any new request interrupts.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { STAR_VERT, STAR_FRAG, DUST_VERT, DUST_FRAG, LINK_VERT, LINK_FRAG, NEBULA_FRAG, rand } from "./galaxy-scene.js";

export const WORLDS = [
  { key: "mind", angle: -2.35, base: "#0A1F5C", band: "#37D5E8", rim: "#5B8CFF", size: 0.42 },
  { key: "body", angle: -0.8, base: "#05302C", band: "#4FE3B5", rim: "#37D5E8", size: 0.34 },
  { key: "soul", angle: 2.45, base: "#1E0F44", band: "#9B5BFF", rim: "#B98BFF", size: 0.38 },
  { key: "future", angle: 0.75, base: "#3A1F08", band: "#E6C07B", rim: "#F2D29A", size: 0.4 },
];
const ORBIT = 2.7;
const TILT = 0.5;

const PLANET_VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vP; varying vec3 vView;
  void main() {
    vN = normalize(normalMatrix * normal); vP = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const PLANET_FRAG = /* glsl */ `
  uniform vec3 uBase, uBand, uRim; uniform float uTime, uReduced, uFocus;
  varying vec3 vN; varying vec3 vP; varying vec3 vView;
  float h(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float n3(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z); }
  float fbm(vec3 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n3(p); p *= 2.07; a *= 0.5; } return v; }
  void main() {
    vec3 p = normalize(vP);
    float t = uReduced > 0.5 ? 0.0 : uTime * 0.04;
    // swirling bands: domain-warped latitude, like a storm around the planet
    float warp = fbm(p * 2.4 + vec3(t, 0.0, -t));
    float lat = p.y * 3.2 + warp * 2.2 + sin(p.x * 3.0 + t * 2.0) * 0.25;
    float band = smoothstep(0.55, 1.0, sin(lat * 2.2) * 0.5 + 0.5) * (0.35 + 0.65 * fbm(p * 6.0 - t));
    float storm = smoothstep(0.62, 0.95, fbm(p * 3.5 + warp));
    vec3 col = mix(uBase, uBand * 0.9, band * 0.85) + uBand * storm * 0.35;
    // lit from the central star, with a night side
    float light = clamp(dot(vN, normalize(vec3(-0.4, 0.3, 0.85))) * 0.6 + 0.45, 0.12, 1.0);
    col *= light;
    float fres = pow(1.0 - max(dot(vN, vView), 0.0), 2.6);
    col += uRim * fres * (1.4 + uFocus * 0.8);
    gl_FragColor = vec4(col, 1.0);
  }`;
const ATMOS_FRAG = /* glsl */ `
  uniform vec3 uRim; uniform float uFocus;
  varying vec3 vN; varying vec3 vP; varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(vN, vView)), 3.0);
    gl_FragColor = vec4(uRim * f * (1.1 + uFocus), f * 0.9);
  }`;

function glowTexture(stops) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  for (const [o, col] of stops) grad.addColorStop(o, col);
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function buildHome({ stage, reduced, hash }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.xr.enabled = true;
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#05070D");
  const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 140);

  const uniforms = {
    uTime: { value: 0 }, uIntro: { value: 0 }, uPixel: { value: renderer.getPixelRatio() },
    uReduced: { value: reduced ? 1 : 0 }, uScale: { value: 300 },
  };

  // ---- sky ----
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(70, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms,
    vertexShader: "varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: NEBULA_FRAG.replace("col *= 0.06 + 0.7", "col = mix(col, vec3(0.04,0.08,0.2), 0.35); col *= 0.06 + 0.7"),
  })));
  const pointsMat = (scale, alpha = "0.38") => new THREE.ShaderMaterial({
    uniforms, vertexShader: DUST_VERT.replace("60.0", scale), fragmentShader: DUST_FRAG.replace("0.38", alpha),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const cloud = (n, seed, place, scale, alpha) => {
    const r = rand(seed);
    const p = new Float32Array(n * 3), c = new Float32Array(n * 3), s = new Float32Array(n), ph = new Float32Array(n);
    const palette = [new THREE.Color("#E6C07B"), new THREE.Color("#37D5E8"), new THREE.Color("#5B8CFF"), new THREE.Color("#F1EEE6"), new THREE.Color("#9B5BFF")];
    for (let i = 0; i < n; i++) {
      const [x, y, z, k] = place(r);
      p.set([x, y, z], i * 3);
      const col = palette[k ?? Math.floor(r() * palette.length)];
      c.set([col.r, col.g, col.b], i * 3);
      s[i] = 0.5 + r() * 1.5; ph[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(c, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(s, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));
    return new THREE.Points(g, pointsMat(scale, alpha));
  };
  scene.add(cloud(2400, 3, (r) => {
    const u = r(), v = r(), R = 45 + 20 * r(), th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
    return [R * Math.sin(ph) * Math.cos(th), R * Math.cos(ph), R * Math.sin(ph) * Math.sin(th), r() < 0.6 ? 3 : 2];
  }, "70.0", "0.6"));

  // ---- the system: tilted disc holding the spiral, worlds and memories ----
  const sys = new THREE.Group();
  sys.rotation.x = TILT;
  scene.add(sys);
  const spin = new THREE.Group();
  sys.add(spin);
  const dustN = Math.min(12000, Math.round(7000 * Math.min(devicePixelRatio, 2)));
  const dust = cloud(dustN, 11, (r) => {
    const t = Math.pow(r(), 1.3), arm = r() < 0.5 ? 0 : Math.PI;
    const g = () => (r() + r() + r() - 1.5) / 1.5;
    const spread = r() < 0.1 ? 1.6 : 0.3 + 0.45 * (1 - t);
    const R = 0.25 + 3.6 * t, th = t * Math.PI * 2.2 + arm + g() * spread;
    return [R * Math.cos(th), g() * 0.12 * (1 - 0.6 * t), R * Math.sin(th), t < 0.35 ? 0 : r() < 0.55 ? 3 : r() < 0.6 ? 1 : 2];
  }, "14.0", "0.36");
  spin.add(dust);

  // central star: the voice of the universe
  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture([[0, "rgba(255,240,205,1)"], [0.12, "rgba(255,214,150,0.85)"], [0.35, "rgba(230,192,123,0.25)"], [1, "rgba(0,0,0,0)"]]),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  }));
  coreGlow.scale.set(1.5, 1.5, 1);
  sys.add(coreGlow);

  // ---- four worlds ----
  const planets = new Map();
  for (const w of WORLDS) {
    const pivot = new THREE.Group();
    sys.add(pivot);
    const u = { uBase: { value: new THREE.Color(w.base) }, uBand: { value: new THREE.Color(w.band) }, uRim: { value: new THREE.Color(w.rim) }, uTime: uniforms.uTime, uReduced: uniforms.uReduced, uFocus: { value: 0 } };
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(w.size, 64, 48), new THREE.ShaderMaterial({ uniforms: u, vertexShader: PLANET_VERT, fragmentShader: PLANET_FRAG }));
    const atmos = new THREE.Mesh(new THREE.SphereGeometry(w.size * 1.16, 48, 32), new THREE.ShaderMaterial({
      uniforms: u, vertexShader: PLANET_VERT, fragmentShader: ATMOS_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    }));
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(ORBIT, 0.0035, 6, 256), new THREE.MeshBasicMaterial({ color: new THREE.Color(w.rim), transparent: true, opacity: 0.0 }));
    orbit.rotation.x = Math.PI / 2;
    const holder = new THREE.Group();
    holder.position.set(ORBIT * Math.cos(w.angle), 0.1, ORBIT * Math.sin(w.angle));
    holder.add(mesh, atmos);
    pivot.add(holder);
    planets.set(w.key, { w, holder, mesh, u, angle: w.angle });
  }
  // one faint orbit ring for all four
  const ring = new THREE.Mesh(new THREE.TorusGeometry(ORBIT, 0.004, 6, 300), new THREE.MeshBasicMaterial({ color: new THREE.Color("#5B8CFF"), transparent: true, opacity: 0.22 }));
  ring.rotation.x = Math.PI / 2;
  sys.add(ring);

  // ---- memories ----
  let stars = null, links = [], starData = [], pos = new Map();
  const starGroup = new THREE.Group();
  sys.add(starGroup);
  function placeMemory(s, i, n) {
    const w = WORLDS.find((x) => x.key === s.world) ?? WORLDS[0];
    const t = n > 1 ? i / (n - 1) : 0.5;
    const R = 1.0 + 1.45 * hash(s.id, 4) + 0.25 * t;
    const th = w.angle + (hash(s.id, 5) - 0.5) * 1.15;
    return new THREE.Vector3(R * Math.cos(th), (hash(s.id, 9) - 0.5) * 0.3, R * Math.sin(th));
  }
  function setMemories(galaxy, bornId) {
    if (stars) { starGroup.remove(stars); stars.geometry.dispose(); }
    for (const l of links) { starGroup.remove(l.tube); l.tube.geometry.dispose(); }
    starData = galaxy.stars;
    const n = starData.length;
    pos = new Map(starData.map((s, i) => [s.id, placeMemory(s, i, n)]));
    const sp = new Float32Array(n * 3), sc = new Float32Array(n * 3), ss = new Float32Array(n), sph = new Float32Array(n), sb = new Float32Array(n);
    const lit = new Float32Array(n), sel = new Float32Array(n);
    const ink = new THREE.Color("#F1EEE6"), cyan = new THREE.Color("#9BE8F2");
    starData.forEach((s, i) => {
      const p = pos.get(s.id);
      sp.set([p.x, p.y, p.z], i * 3);
      const c = s.themeIds.length ? ink : cyan;
      sc.set([c.r, c.g, c.b], i * 3);
      ss[i] = s.themeIds.length ? 0.95 : 0.72;
      sph[i] = hash(s.id, 13);
      // a newly saved memory is born now; the rest were born during the entrance
      sb[i] = s.id === bornId ? uniforms.uIntro.value + 0.15 : 0.9 + (2.2 * i) / Math.max(n, 1);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(sc, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(ss, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(sph, 1));
    g.setAttribute("aBirth", new THREE.BufferAttribute(sb, 1));
    g.setAttribute("aLit", new THREE.BufferAttribute(lit, 1));
    g.setAttribute("aSel", new THREE.BufferAttribute(sel, 1));
    stars = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms, vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    starGroup.add(stars);
    links = galaxy.links.map((l, k) => {
      const a = pos.get(l.from), b = pos.get(l.to);
      if (!a || !b) return null;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += 0.1 + 0.08 * a.distanceTo(b);
      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: uniforms.uTime, uIntro: uniforms.uIntro, uReduced: uniforms.uReduced, uLit: { value: 0 }, uOffset: { value: (k * 0.37) % 1 }, uBorn: { value: 1.6 } },
        vertexShader: LINK_VERT, fragmentShader: LINK_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 40, 0.0075, 6, false), mat);
      starGroup.add(tube);
      return { link: l, mat, tube };
    }).filter(Boolean);
  }

  // ---- camera: home pose, world poses, an interruptible arc between ----
  const target = new THREE.Vector3(0, 0, 0);
  const look = new THREE.Vector3();
  let from = null, to = null, tStart = 0, dur = 1;
  let focusKey = null;
  function homePose() {
    const k = camera.aspect < 1.1 ? Math.pow(1.1 / camera.aspect, 0.85) : 1;
    return { pos: new THREE.Vector3(0, 3.3 * k, 6.4 * k), look: new THREE.Vector3(0, -0.15, 0) };
  }
  function worldPose(key) {
    const p = planets.get(key);
    const wp = p.holder.getWorldPosition(new THREE.Vector3());
    const out = wp.clone().setY(0).normalize();
    const k = camera.aspect < 1.1 ? Math.pow(1.1 / camera.aspect, 0.6) : 1;
    // stand off the planet, slightly outside its orbit, looking back toward it
    const pos = wp.clone().add(out.multiplyScalar(1.15 * k)).add(new THREE.Vector3(0, 0.55 * k, 0)).add(new THREE.Vector3(0, 0, 0.9 * k));
    // in portrait the panel sits low, so look a little below the planet
    return { pos, look: wp.clone().add(new THREE.Vector3(0, camera.aspect < 1 ? -0.35 : 0, 0)) };
  }
  let current = null;
  function go(pose, ms) {
    const now = uniforms.uTime.value;
    if (reduced || ms === 0) {
      current = pose; from = to = null;
      camera.position.copy(pose.pos); look.copy(pose.look); camera.lookAt(look);
      return;
    }
    from = { pos: camera.position.clone(), look: look.clone() };
    to = pose; tStart = now; dur = ms / 1000;
  }
  function stepCamera() {
    if (!to) return;
    const t = Math.min(1, (uniforms.uTime.value - tStart) / dur), e = ease(t);
    // an arc: lerp, lifted at the middle of the move
    camera.position.lerpVectors(from.pos, to.pos, e);
    camera.position.y += Math.sin(Math.PI * e) * 0.6;
    look.lerpVectors(from.look, to.look, e);
    camera.lookAt(look);
    if (t >= 1) { current = to; to = null; onSettle?.(); onSettle = null; }
  }
  let onSettle = null;
  let shift = 0, size = { w: 1, h: 1 };

  // ---- glow ----
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(512, 512), 0.8, 0.55, 0.5));
  composer.addPass(new OutputPass());
  let bloomOn = true;

  const ray = new THREE.Raycaster();
  ray.params.Points.threshold = 0.12;
  const v = new THREE.Vector3();

  return {
    renderer,
    get bloomOn() { return bloomOn; },
    setMemories,
    /** Screen position (CSS px) of a world, for its HTML label. */
    project(key, w, h) {
      const p = planets.get(key);
      p.holder.getWorldPosition(v);
      const r = p.w.size;
      const top = v.clone().add(new THREE.Vector3(0, r, 0)).project(camera);
      v.project(camera);
      return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, r: Math.abs((top.y - v.y) * 0.5 * h), visible: v.z < 1 };
    },
    pickStar(ndc) {
      if (!stars) return null;
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(stars)[0];
      return hit ? starData[hit.index]?.id ?? null : null;
    },
    setSelection({ litIds, selId, litThemes }) {
      if (!stars) return;
      const lit = stars.geometry.getAttribute("aLit"), sel = stars.geometry.getAttribute("aSel");
      starData.forEach((s, i) => { lit.array[i] = litIds.has(s.id) ? 1 : 0; sel.array[i] = s.id === selId ? 1 : 0; });
      lit.needsUpdate = sel.needsUpdate = true;
      for (const l of links) l.mat.uniforms.uLit.value = litThemes.has(l.link.themeId) ? 1 : 0;
    },
    focusWorld(key, onDone) {
      focusKey = key;
      for (const [k, p] of planets) p.u.uFocus.value = k === key ? 1 : 0;
      onSettle = onDone ?? null;
      go(key ? worldPose(key) : homePose(), key ? 950 : 1000);
      if (reduced) { onSettle?.(); onSettle = null; }
    },
    get focus() { return focusKey; },
    skipIntro() { uniforms.uIntro.value = Math.max(uniforms.uIntro.value, 6); },
    /** Slide the whole view sideways (CSS px) so a side panel never hides the worlds. */
    setShift(px) { shift = px; this.resize(size.w, size.h); },
    resize(w, h) {
      size = { w, h };
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / Math.max(h, 1);
      if (shift) camera.setViewOffset(w, h, shift, 0, w, h); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      uniforms.uPixel.value = renderer.getPixelRatio();
      go(focusKey ? worldPose(focusKey) : homePose(), 0);
    },
    degrade() {
      bloomOn = false;
      renderer.setPixelRatio(1);
      uniforms.uPixel.value = 1;
      dust.geometry.setDrawRange(0, Math.round(dustN * 0.5));
    },
    entranceScale() {
      // a point of light that opens into the galaxy
      if (reduced) return 1;
      const t = uniforms.uIntro.value;
      return Math.min(1, ease(Math.min(1, t / 2.4)) * 1.0 + 0.0);
    },
    frame(dt) {
      uniforms.uTime.value += dt;
      uniforms.uIntro.value += dt;
      const s = Math.max(0.001, this.entranceScale());
      sys.scale.setScalar(s);
      coreGlow.material.opacity = 0.35 + 0.65 * s;
      if (!reduced && !renderer.xr.isPresenting) spin.rotation.y += dt * 0.03;
      for (const p of planets.values()) if (!reduced) p.mesh.rotation.y += dt * 0.12;
      stepCamera();
      if (renderer.xr.isPresenting || !bloomOn) renderer.render(scene, camera);
      else composer.render(dt);
    },
    worldOfStar(id) { return starData.find((s) => s.id === id)?.world ?? null; },
  };
}
