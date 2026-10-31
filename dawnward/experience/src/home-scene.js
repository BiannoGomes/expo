// Galaxy Home: the full-screen universe, laid out like the Galaxy Home board
// (Mind above, Body and Soul either side, Future below, a spiral core of light
// between them). Presentation only: every word a person reads is HTML in
// home.js. The planets are Bianno's ChatGPT paintings (assets/img/worlds,
// provenance in SOURCE.md), shown as camera-facing worlds lit from the core.
// Memory stars are real evenings (or the labelled sample) placed near their
// world; a line joins two evenings that support the same belief.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { STAR_VERT, STAR_FRAG, DUST_VERT, DUST_FRAG, LINK_VERT, LINK_FRAG, rand } from "./galaxy-scene.js";

const R = 2.6; // distance of each world from the core
// x, z in the disc. Each painting is lit from its upper left; worlds left of
// the core are mirrored so their gold edge always faces the light.
// Five worlds on a ring: Spirit above, "beyond"; Mind and Soul either side;
// Body and Future below. Paintings left of the core are mirrored so their
// gold edge always faces the light at the centre.
const P = (deg) => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
export const WORLDS = [
  { key: "spirit", at: P(-90), size: 1.8, flip: false, disk: [0.491, 0.49, 0.423], rim: "#B9A6FF" },
  { key: "soul", at: P(-18), size: 1.75, flip: false, disk: [0.497, 0.49, 0.43], rim: "#9B5BFF" },
  { key: "future", at: P(54), size: 2.55, flip: false, disk: [0.515, 0.473, 0.28], rim: "#E6C07B" },
  { key: "body", at: P(126), size: 1.75, flip: true, disk: [0.498, 0.49, 0.43], rim: "#37D5E8" },
  { key: "mind", at: P(198), size: 1.85, flip: true, disk: [0.499, 0.493, 0.41], rim: "#5B8CFF" },
].map((w) => ({ ...w, x: w.at[0] * R, z: w.at[1] * R }));
const TILT = 0.55;

const asset = (p) => (window.DW_ASSETS ? window.DW_ASSETS(p) : `assets/${p}`);

const SPRITE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// The paintings sit on pure black. Their colour is treated as light already
// multiplied by coverage; coverage comes from the planet's disc plus how bright
// the glow is, so the halo blends into the sky and the night side stays solid.
const WORLD_FRAG = /* glsl */ `
  uniform sampler2D uMap; uniform vec3 uDisk; uniform float uFlip, uAlpha, uFocus, uTime, uReduced;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv; if (uFlip > 0.5) uv.x = 1.0 - uv.x;
    vec4 t = texture2D(uMap, uv);
    float d = distance(uv, vec2(uFlip > 0.5 ? 1.0 - uDisk.x : uDisk.x, uDisk.y));
    float disk = smoothstep(uDisk.z, uDisk.z - 0.012, d);
    float m = max(t.r, max(t.g, t.b));
    float a = max(disk, clamp(m * 2.5, 0.0, 1.0));
    float e = smoothstep(0.0, 0.06, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
    // a slow breath of light across the atmosphere
    float breath = uReduced > 0.5 ? 0.0 : 0.04 * sin(uTime * 0.6 + uv.y * 3.0);
    vec3 col = t.rgb * (1.0 + breath + 0.12 * uFocus) * e;
    gl_FragColor = vec4(col, a * e) * uAlpha;
    #include <colorspace_fragment>
  }`;
const GLOW_FRAG = /* glsl */ `
  uniform sampler2D uMap; uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    vec4 t = texture2D(uMap, vUv);
    float e = smoothstep(0.0, 0.08, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
    gl_FragColor = vec4(t.rgb * e * uAlpha, 0.0);
    #include <colorspace_fragment>
  }`;
const BEAM_FRAG = /* glsl */ `
  uniform float uTime, uReduced, uAlpha; varying vec2 vUv;
  void main() {
    float across = exp(-pow((vUv.x - 0.5) * 9.0, 2.0));
    float along = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
    float pulse = uReduced > 0.5 ? 0.0 : 0.35 * pow(0.5 + 0.5 * sin(vUv.y * 18.0 - uTime * 1.6), 6.0);
    vec3 gold = vec3(1.0, 0.78, 0.45);
    gl_FragColor = vec4(gold * across * along * (0.55 + pulse) * uAlpha, 0.0);
  }`;

// Additive light on a transparent canvas: colour adds, coverage stays as it was,
// so the painted sky behind shows through everywhere the light is dim.
const addLight = { transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor };

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function buildHome({ stage, reduced, hash }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NoToneMapping; // the paintings keep their own colour
  renderer.xr.enabled = true;
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); // transparent: the painted sky is the page behind it
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 140);
  const loader = new THREE.TextureLoader();
  // Each texture is sent to the GPU as soon as it decodes, not on the first frame that shows it.
  const tex = (p) => { const t = loader.load(asset(p), (x) => renderer.initTexture(x)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

  const uniforms = {
    uTime: { value: 0 }, uIntro: { value: 0 }, uPixel: { value: renderer.getPixelRatio() },
    uReduced: { value: reduced ? 1 : 0 }, uScale: { value: 300 },
  };

  // The disc: tilted towards the viewer. The spin group turns slowly; worlds stay put.
  const sys = new THREE.Group();
  sys.rotation.x = TILT;
  scene.add(sys);
  const spin = new THREE.Group();
  sys.add(spin);

  // ---- the core: Bianno's spiral, lying in the disc ----
  const coreMat = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: tex("img/worlds/galaxy-core-1024.webp") }, uAlpha: { value: 1 } },
    vertexShader: SPRITE_VERT, fragmentShader: GLOW_FRAG, ...addLight,
  });
  const core = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), coreMat);
  core.rotation.x = -Math.PI / 2;
  spin.add(core);

  // ---- dust that sparkles over the painting ----
  const pointsMat = (scale, alpha) => new THREE.ShaderMaterial({
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
  const dustN = Math.min(6000, Math.round(3500 * Math.min(devicePixelRatio, 2)));
  const dust = cloud(dustN, 11, (r) => {
    const t = Math.pow(r(), 1.2), arm = r() < 0.5 ? 0 : Math.PI;
    const g = () => (r() + r() + r() - 1.5) / 1.5;
    const Rr = 0.3 + 3.9 * t, th = t * Math.PI * 2.4 + arm + g() * (0.35 + 0.5 * (1 - t));
    return [Rr * Math.cos(th), g() * 0.1, Rr * Math.sin(th), t < 0.3 ? 0 : r() < 0.5 ? 3 : r() < 0.5 ? 1 : 4];
  }, "12.0", "0.5");
  spin.add(dust);

  // ---- the beam joining Mind, the core and Future, and the orbit through all four ----
  const beamMat = new THREE.ShaderMaterial({ uniforms: { uTime: uniforms.uTime, uReduced: uniforms.uReduced, uAlpha: { value: 1 } }, vertexShader: SPRITE_VERT, fragmentShader: BEAM_FRAG, ...addLight, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.16, R * 2), beamMat);
  beam.rotation.x = -Math.PI / 2;
  sys.add(beam);
  const orbitMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#E6C07B"), transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false });
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(R * 0.99, 0.006, 6, 360), orbitMat);
  orbit.rotation.x = Math.PI / 2;
  sys.add(orbit);

  // ---- the worlds and their moons ----
  sys.updateMatrixWorld(true);
  // Tall screens stretch the ring top to bottom a little, so labels on the same side never meet.
  const tiltOnly = new THREE.Matrix4().makeRotationX(TILT);
  let stretch = 1;
  const placeWorlds = () => { for (const p of planets.values()) p.home.set(p.w.x, 0.05, p.w.z * stretch).applyMatrix4(tiltOnly); };
  const planets = new Map();
  const moons = [];
  const worldMat = (map, disk, flip) => new THREE.ShaderMaterial({
    uniforms: { uMap: { value: map }, uDisk: { value: new THREE.Vector3(...disk) }, uFlip: { value: flip ? 1 : 0 }, uAlpha: { value: 1 }, uFocus: { value: 0 }, uTime: uniforms.uTime, uReduced: uniforms.uReduced },
    vertexShader: SPRITE_VERT, fragmentShader: WORLD_FRAG, transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  WORLDS.forEach((w, i) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w.size, w.size), worldMat(tex(`img/worlds/planet-${w.key}-640.webp`), w.disk, w.flip));
    const home = new THREE.Vector3(w.x, 0.05, w.z).applyMatrix4(tiltOnly);
    mesh.position.copy(home);
    mesh.renderOrder = 10;
    scene.add(mesh);
    planets.set(w.key, { w, mesh, home, phase: i * 1.7 });
    const moonSize = 0.22 + 0.06 * (i % 3);
    const moon = new THREE.Mesh(new THREE.PlaneGeometry(moonSize, moonSize), worldMat(tex(`img/worlds/moon-${(i % 4) + 1}.webp`), [0.5, 0.5, 0.44], w.flip));
    moon.renderOrder = 11;
    scene.add(moon);
    moons.push({ moon, of: w.key, r: w.size * w.disk[2] * 1.35, speed: 0.12 + 0.05 * i, phase: i * 2.1 });
  });

  // ---- memories ----
  let stars = null, links = [], starData = [];
  const starGroup = new THREE.Group();
  sys.add(starGroup);
  function placeMemory(s) {
    const w = WORLDS.find((x) => x.key === s.world) ?? WORLDS[0];
    const ang = Math.atan2(w.z, w.x) + (hash(s.id, 5) - 0.5) * (s.discovery ? 0.5 : 0.9);
    const rr = 1.05 + 1.15 * hash(s.id, 4);
    return new THREE.Vector3(rr * Math.cos(ang), 0.06 + (hash(s.id, 9) - 0.5) * 0.18, rr * Math.sin(ang));
  }
  function setMemories(galaxy, bornId) {
    if (stars) { starGroup.remove(stars); stars.geometry.dispose(); }
    for (const l of links) { starGroup.remove(l.tube); l.tube.geometry.dispose(); }
    starData = galaxy.stars;
    const n = starData.length;
    const pos = new Map(starData.map((s) => [s.id, placeMemory(s)]));
    const sp = new Float32Array(n * 3), sc = new Float32Array(n * 3), ss = new Float32Array(n), sph = new Float32Array(n), sb = new Float32Array(n);
    const ink = new THREE.Color("#F6F1E4"), cyan = new THREE.Color("#9BE8F2"), gold = new THREE.Color("#FFD98A");
    starData.forEach((s, i) => {
      const p = pos.get(s.id);
      sp.set([p.x, p.y, p.z], i * 3);
      // discoveries glow gold and a little larger; memories are white or cyan
      const c = s.discovery ? gold : s.themeIds.length ? ink : cyan;
      sc.set([c.r, c.g, c.b], i * 3);
      ss[i] = s.discovery ? 1.15 : s.themeIds.length ? 0.85 : 0.65;
      sph[i] = hash(s.id, 13);
      sb[i] = s.id === bornId ? uniforms.uIntro.value + 0.2 : 0.9 + (2.2 * i) / Math.max(n, 1);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(sc, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(ss, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(sph, 1));
    g.setAttribute("aBirth", new THREE.BufferAttribute(sb, 1));
    g.setAttribute("aLit", new THREE.BufferAttribute(new Float32Array(n), 1));
    g.setAttribute("aSel", new THREE.BufferAttribute(new Float32Array(n), 1));
    stars = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms, vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    stars.renderOrder = 5;
    starGroup.add(stars);
    links = galaxy.links.map((l, k) => {
      const a = pos.get(l.from), b = pos.get(l.to);
      if (!a || !b) return null;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += 0.12 + 0.08 * a.distanceTo(b);
      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: uniforms.uTime, uIntro: uniforms.uIntro, uReduced: uniforms.uReduced, uLit: { value: 0 }, uOffset: { value: (k * 0.37) % 1 }, uBorn: { value: 1.6 } },
        vertexShader: LINK_VERT, fragmentShader: LINK_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 40, 0.007, 6, false), mat);
      starGroup.add(tube);
      return { link: l, mat, tube };
    }).filter(Boolean);
  }

  // ---- camera: a home pose per screen shape, a close pose per world, and an
  // eased arc between them that any new request interrupts ----
  const look = new THREE.Vector3();
  let from = null, to = null, tStart = 0, dur = 1, onSettle = null;
  let focusKey = null, off = { x: 0, y: 0 }, size = { w: 1, h: 1 }, fit = 1;
  function homePose() {
    const a = camera.aspect;
    if (a < 0.8) {
      // portrait: look down steeply so Mind sits high and Future low, as on the board
      const k = Math.max(1, 0.62 / a) * fit;
      return { pos: new THREE.Vector3(0, 9.6 * k, 4.4 * k), look: new THREE.Vector3(0, -0.2, 0.55) };
    }
    const k = (a < 1.25 ? 1.25 / a : 1) * fit;
    return { pos: new THREE.Vector3(0, 5.2 * k, 7.6 * k), look: new THREE.Vector3(0, -0.35, 0.2) };
  }
  function worldPose(key) {
    const p = planets.get(key);
    const h = homePose();
    const dir = h.pos.clone().sub(p.home).normalize();
    const dist = (p.w.size * p.w.disk[2] * 2.2) / Math.tan((camera.fov * Math.PI) / 360) / Math.min(1, camera.aspect);
    return { pos: p.home.clone().add(dir.multiplyScalar(dist)), look: p.home.clone() };
  }
  function go(pose, ms) {
    if (reduced || ms === 0) {
      from = to = null;
      camera.position.copy(pose.pos); look.copy(pose.look); camera.lookAt(look);
      // A snap lands any move in flight: its arrival must still happen, or a
      // resize during a flight would leave a world without its close-up.
      const f = onSettle; onSettle = null; f?.();
      return;
    }
    from = { pos: camera.position.clone(), look: look.clone() };
    to = pose; tStart = performance.now() / 1000; dur = ms / 1000;
  }
  function stepCamera() {
    if (!to) return;
    // real time, so a slow frame never stretches a move: it lands when promised
    const t = Math.min(1, (performance.now() / 1000 - tStart) / dur), e = ease(t);
    camera.position.lerpVectors(from.pos, to.pos, e);
    camera.position.y += Math.sin(Math.PI * e) * 0.35;
    look.lerpVectors(from.look, to.look, e);
    camera.lookAt(look);
    if (t >= 1) { to = null; const f = onSettle; onSettle = null; f?.(); }
  }

  // ---- glow: only the brightest light blooms ----
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, format: THREE.RGBAFormat }));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.55, 0.45, 0.86);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  let bloomOn = true;

  function applyCamera() {
    camera.aspect = size.w / Math.max(size.h, 1);
    if (off.x || off.y) camera.setViewOffset(size.w, size.h, off.x, off.y, size.w, size.h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    go(focusKey ? worldPose(focusKey) : homePose(), 0);
  }
  const ray = new THREE.Raycaster();
  ray.params.Points.threshold = 0.12;
  const v = new THREE.Vector3(), up = new THREE.Vector3();

  // Compile every material's shaders now, in the background where the browser
  // supports it, so the first sight of the worlds never stutters.
  renderer.compileAsync?.(scene, camera).catch(() => {});

  const api = {
    renderer,
    get bloomOn() { return bloomOn; },
    setMemories,
    /** Screen position (CSS px) and on-screen radius of a world, for its HTML label. */
    project(key, w, h) {
      const p = planets.get(key);
      up.set(0, 1, 0).applyQuaternion(camera.quaternion).multiplyScalar(p.w.size * p.w.disk[2]);
      const c = p.mesh.position.clone();
      const top = c.clone().add(up).project(camera);
      v.copy(c).project(camera);
      return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, r: Math.abs((top.y - v.y) * 0.5 * h), visible: v.z < 1 };
    },
    pickWorld(ndc) {
      ray.setFromCamera(ndc, camera);
      for (const [k, p] of planets) {
        const d = ray.ray.distanceToPoint(p.mesh.position);
        if (d < p.w.size * p.w.disk[2]) return k;
      }
      return null;
    },
    setSelection({ litIds, selId, litThemes }) {
      if (!stars) return;
      const lit = stars.geometry.getAttribute("aLit"), sel = stars.geometry.getAttribute("aSel");
      starData.forEach((s, i) => { lit.array[i] = litIds.has(s.id) ? 1 : 0; sel.array[i] = s.id === selId ? 1 : 0; });
      lit.needsUpdate = sel.needsUpdate = true;
      for (const l of links) l.mat.uniforms.uLit.value = litThemes.has(l.link.themeId) ? 1 : 0;
    },
    /** Fly to a world (or home with null). onDone runs when the move lands. */
    focusWorld(key, onDone) {
      focusKey = key;
      for (const [k, p] of planets) p.mesh.material.uniforms.uFocus.value = k === key ? 1 : 0;
      onSettle = onDone ?? null;
      go(key ? worldPose(key) : homePose(), key ? 700 : 650); // within the directive's 450 to 850 ms
      if (reduced) { const f = onSettle; onSettle = null; f?.(); }
    },
    get focus() { return focusKey; },
    get moving() { return Boolean(to); },
    /** True once the entrance has opened fully and no move is under way. */
    get settled() { return !to && (reduced || uniforms.uIntro.value > 2.6); },
    skipIntro() { uniforms.uIntro.value = Math.max(uniforms.uIntro.value, 6); },
    /** Fit the four worlds into the free part of the screen (CSS px), so no panel covers one.
     *  Moves only the camera: no buffers are rebuilt. */
    setStretch(k) { if (k !== stretch) { stretch = k; placeWorlds(); applyCamera(); } },
    setFrame({ left, right, top, bottom }, scale = 1) {
      const W = size.w, H = size.h;
      off = { x: Math.round(W / 2 - (left + right) / 2), y: Math.round(H / 2 - (top + bottom) / 2) };
      fit = Math.max(1, Math.max(H / Math.max(80, bottom - top), W / Math.max(80, right - left)) * scale);
      applyCamera();
    },
    resize(w, h) {
      size = { w, h };
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      uniforms.uPixel.value = renderer.getPixelRatio();
      applyCamera();
    },
    degrade() {
      bloomOn = false;
      renderer.setPixelRatio(1);
      uniforms.uPixel.value = 1;
      dust.geometry.setDrawRange(0, Math.round(dustN * 0.5));
    },
    frame(dt) {
      uniforms.uTime.value += dt;
      uniforms.uIntro.value += dt;
      const t = uniforms.uTime.value;
      // the entrance: a point of light opens into the galaxy
      const s = reduced ? 1 : Math.max(0.001, ease(Math.min(1, uniforms.uIntro.value / 2.4)));
      sys.scale.set(s, s, s * stretch);
      if (!reduced && !renderer.xr.isPresenting) spin.rotation.y += dt * 0.025;
      for (const p of planets.values()) {
        const bob = reduced ? 0 : Math.sin(t * 0.5 + p.phase) * 0.04;
        p.mesh.position.copy(p.home).multiplyScalar(s).add(new THREE.Vector3(0, bob, 0));
        p.mesh.scale.setScalar(s);
        p.mesh.quaternion.copy(camera.quaternion);
        p.mesh.material.uniforms.uAlpha.value = Math.min(1, Math.max(0, (uniforms.uIntro.value - 1.0) / 1.2));
      }
      for (const m of moons) {
        const p = planets.get(m.of);
        const a = m.phase + (reduced ? 0 : t * m.speed);
        up.set(Math.cos(a) * m.r, Math.sin(a) * m.r * 0.35, 0).applyQuaternion(camera.quaternion);
        m.moon.position.copy(p.mesh.position).add(up);
        m.moon.quaternion.copy(camera.quaternion);
        m.moon.scale.setScalar(s);
        // behind the planet for half its orbit
        m.moon.renderOrder = Math.sin(a) > 0 ? 9 : 11;
        m.moon.material.uniforms.uAlpha.value = p.mesh.material.uniforms.uAlpha.value;
      }
      stepCamera();
      if (renderer.xr.isPresenting || !bloomOn) renderer.render(scene, camera);
      else composer.render(dt);
    },
  };
  return api;
}
