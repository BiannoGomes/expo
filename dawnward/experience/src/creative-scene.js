// Creative Worlds: real-time worlds you can look around and touch (three.js).
// Two worlds share one small engine: a damped look-around camera, tap-to-pick,
// and a render loop that stops when the world closes. Every pickable thing is
// also offered as a button in the page, so nothing here needs a pointer or WebGL.
//
// Motion families (src/tokens.js): Gravity for the camera (half-life 0.32 s),
// Breath for drifting islands and glowing plants, Emergence for things lighting up.
// Reduced motion: no drift, no bobbing, no swirling; your own drag still moves the view.
import * as THREE from "three";

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int k = 0; k < 5; k++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }`;

/** A glow sprite texture, drawn once. */
function glowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,.6)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const rand = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

/**
 * Builds a world into `host`. Returns { pick(id), dispose(), resize(), lit(id) }.
 * onPick(id) is called when something is tapped; the page decides what that means.
 */
export function buildWorld(kind, { host, reduced, onPick, opts = {} }) {
  if (!BUILDERS[kind]) throw new Error(`No world called ${kind}`);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.6 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.className = "cw-canvas";
  host.replaceChildren(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
  const clock = new THREE.Clock();
  const glow = glowTexture();
  const pickables = [];
  const tickers = [];
  const build = BUILDERS[kind];
  if (!build) throw new Error(`No world called ${kind}`);
  const world = build(scene, glow, pickables, tickers, reduced, opts);
  world.useCamera?.(camera);

  // ----- look around: drag to turn, pinch or wheel to come closer (Gravity damping) -----
  const view = { yaw: world.view.yaw, pitch: world.view.pitch, dist: world.view.dist };
  const want = { ...view };
  const pointers = new Map();
  let downAt = null, pinch0 = 0, idle = 0;
  const el = renderer.domElement;
  el.style.touchAction = "none";
  const fixed = !!world.view.fixed, plane0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const onPlane = (e) => { ray.setFromCamera(ndc(e), camera); return ray.ray.intersectPlane(plane0, new THREE.Vector3()); };
  let pressing = false;
  if (fixed) {
    el.addEventListener("pointerdown", (e) => { el.setPointerCapture(e.pointerId); pressing = true; world.press?.(onPlane(e)); });
    el.addEventListener("pointermove", (e) => { if (pressing) world.dragTo?.(onPlane(e)); });
    el.addEventListener("pointerup", (e) => { if (pressing) world.release?.(onPlane(e)); pressing = false; });
    el.addEventListener("pointercancel", () => { pressing = false; world.release?.(null); });
  }
  if (!fixed) el.addEventListener("pointerdown", (e) => { el.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); downAt = { x: e.clientX, y: e.clientY }; idle = 0; world.hover?.(ndc(e)); if (pointers.size === 2) pinch0 = spread(); });
  if (!fixed) el.addEventListener("pointermove", (e) => {
    const p = pointers.get(e.pointerId); if (!p) { world.hover?.(ndc(e)); return; }
    if (pointers.size === 1) { want.yaw -= (e.clientX - p.x) * 0.006; want.pitch = clamp(want.pitch + (e.clientY - p.y) * 0.004, world.view.minPitch, world.view.maxPitch); }
    p.x = e.clientX; p.y = e.clientY;
    if (pointers.size === 2) { const s = spread(); want.dist = clamp(want.dist * (pinch0 / Math.max(1, s)), world.view.minDist, world.view.maxDist); pinch0 = s; }
    world.hover?.(ndc(e));
  });
  const up = (e) => {
    const moved = downAt ? Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) : 99;
    pointers.delete(e.pointerId);
    if (moved < 8 && pointers.size === 0) {
      ray.setFromCamera(ndc(e), camera);
      const hit = ray.intersectObjects(pickables, true)[0];
      let o = hit?.object; while (o && !o.userData.id) o = o.parent;
      if (o) onPick(o.userData.id);
    }
    downAt = null;
  };
  if (!fixed) { el.addEventListener("pointerup", up); el.addEventListener("pointercancel", (e) => pointers.delete(e.pointerId)); }
  el.addEventListener("wheel", (e) => { e.preventDefault(); want.dist = clamp(want.dist * (1 + e.deltaY * 0.001), world.view.minDist, world.view.maxDist); idle = 0; }, { passive: false });
  const ray = new THREE.Raycaster();
  const ndc = (e) => { const r = el.getBoundingClientRect(); return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
  const spread = () => { const [a, b] = [...pointers.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function resize() {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h < 0.7 ? 68 : 55; camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);
  const frames = [];
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime;
    frames.push(dt * 1000); if (frames.length > 240) frames.shift();
    idle += dt;
    if (!reduced && !fixed && !world.view.noTurn && idle > 2.5) want.yaw += dt * 0.035;           // Orbit: a slow turn when left alone
    const k = 1 - Math.pow(2, -dt / 0.32);
    view.yaw += (want.yaw - view.yaw) * k; view.pitch += (want.pitch - view.pitch) * k; view.dist += (want.dist - view.dist) * k;
    const c = world.view.target;
    camera.position.set(c.x + Math.sin(view.yaw) * Math.cos(view.pitch) * view.dist, c.y + Math.sin(view.pitch) * view.dist, c.z + Math.cos(view.yaw) * Math.cos(view.pitch) * view.dist);
    camera.lookAt(c);
    for (const f of tickers) f(t, dt);
    renderer.render(scene, camera);
  });
  const v3 = new THREE.Vector3();
  return {
    lit: (id, on = true) => world.light?.(id, on),
    /** what this world lets the page do (add a flower, set the breath, strike a bowl...) */
    api: world.api ?? {},
    /** keyboard and buttons: turn, tilt, come closer (the same damping as a drag) */
    nudge(dyaw = 0, dpitch = 0, zoom = 1) {
      idle = 0; want.yaw += dyaw;
      want.pitch = clamp(want.pitch + dpitch, world.view.minPitch, world.view.maxPitch);
      want.dist = clamp(want.dist * zoom, world.view.minDist, world.view.maxDist);
    },
    /** where a thing is on screen, in CSS pixels (for tests and for placing a label) */
    screenOf(id) {
      const o = pickables.find((x) => x.userData.id === id); if (!o) return null;
      o.getWorldPosition(v3).project(camera);
      const r = el.getBoundingClientRect();
      return { x: r.left + (v3.x + 1) / 2 * r.width, y: r.top + (1 - v3.y) / 2 * r.height, front: v3.z < 1 };
    },
    frames: () => { const f = frames.slice().sort((a, b) => a - b); return { n: f.length, median: Math.round(f[f.length >> 1] ?? 0) }; },
    dispose() {
      renderer.setAnimationLoop(null); removeEventListener("resize", resize);
      scene.traverse((o) => { o.geometry?.dispose(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => { x.map?.dispose(); x.dispose(); }); });
      glow.dispose(); renderer.dispose(); renderer.forceContextLoss?.(); host.replaceChildren();
    },
  };
}

// ======================= The Floating Kingdom =======================
function kingdom(scene, glow, pickables, tickers, reduced) {
  const r = rand(42);
  // sky: a gradient dome from deep violet to a warm horizon
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `varying vec3 vP; void main(){ float h = normalize(vP).y;
      vec3 top = vec3(0.07,0.05,0.2), mid = vec3(0.45,0.25,0.55), hor = vec3(1.0,0.72,0.55);
      vec3 c = h > 0.08 ? mix(mid, top, smoothstep(0.08, 0.7, h)) : mix(hor, mid, smoothstep(-0.05, 0.08, h));
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }`,
  })));
  // a sea of clouds below, slowly moving
  const clouds = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 1, 1), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uT: { value: 0 } },
    vertexShader: "varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: `uniform float uT; varying vec2 vUv; varying vec3 vW; ${NOISE}
      void main(){ vec2 p = vW.xz * 0.045 + vec2(uT * 0.012, uT * 0.006);
        float n = fbm(p) * 0.8 + fbm(p * 2.7 - uT * 0.01) * 0.35;
        float d = length(vW.xz) / 190.0;
        vec3 c = mix(vec3(0.62,0.48,0.72), vec3(1.0,0.86,0.8), smoothstep(0.35, 0.95, n));
        gl_FragColor = vec4(c, smoothstep(0.25, 0.6, n) * (1.0 - smoothstep(0.6, 1.0, d)));
        #include <colorspace_fragment> }`,
  }));
  clouds.rotation.x = -Math.PI / 2; clouds.position.y = -7;
  scene.add(clouds);
  tickers.push((t) => { if (!reduced) clouds.material.uniforms.uT.value = t; });

  scene.add(new THREE.HemisphereLight(0xffe6d0, 0x3a2a5a, 1.1));
  const sun = new THREE.DirectionalLight(0xffd2a0, 1.6); sun.position.set(-20, 18, 10); scene.add(sun);

  const rock = new THREE.MeshStandardMaterial({ color: 0x6b5a7a, roughness: 0.95, flatShading: true });
  const grass = new THREE.MeshStandardMaterial({ color: 0x5f9a6a, roughness: 0.9, flatShading: true });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x3f7a58, roughness: 0.9, flatShading: true });
  const stone = new THREE.MeshStandardMaterial({ color: 0xf2e6d8, roughness: 0.6, flatShading: true });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe6c07b, roughness: 0.35, metalness: 0.6, emissive: 0x3a2a10 });
  function island(radius, seed) {
    const g = new THREE.Group(), rr = rand(seed);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.92, radius * 0.35, 9), grass); g.add(top);
    const coneGeo = new THREE.ConeGeometry(radius * 0.95, radius * 1.9, 9, 3);
    const pos = coneGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i) * (0.85 + rr() * 0.3), pos.getY(i), pos.getZ(i) * (0.85 + rr() * 0.3));
    coneGeo.computeVertexNormals();
    const under = new THREE.Mesh(coneGeo, rock); under.rotation.x = Math.PI; under.position.y = -radius * 1.1; g.add(under);
    for (let k = 0; k < Math.round(radius * 2); k++) {
      const a = rr() * Math.PI * 2, d = rr() * radius * 0.75;
      const tr = new THREE.Mesh(new THREE.ConeGeometry(0.28 + rr() * 0.2, 0.9 + rr() * 0.6, 6), leaf);
      tr.position.set(Math.cos(a) * d, radius * 0.18 + 0.45, Math.sin(a) * d); g.add(tr);
    }
    return g;
  }
  // the castle at the heart
  const heart = island(4.2, 7);
  for (const [x, z, h, w] of [[0, 0, 4.2, 0.9], [-1.6, 0.6, 2.6, 0.55], [1.5, 0.7, 2.9, 0.6], [0.4, -1.5, 2.2, 0.5], [-0.9, -1.1, 1.8, 0.45]]) {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(w, w * 1.08, h, 10), stone); tower.position.set(x, 0.75 + h / 2, z); heart.add(tower);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 1.25, h * 0.45, 10), gold); roof.position.set(x, 0.75 + h + h * 0.22, z); heart.add(roof);
  }
  scene.add(heart);
  // waterfalls: falling light from the heart's edge
  const fallMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform float uT; varying vec2 vUv; ${NOISE} void main(){ float n = noise(vec2(vUv.x * 18.0, vUv.y * 6.0 + uT * 2.5));
      float a = (0.25 + 0.6 * n) * smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) * smoothstep(0.0, 0.35, vUv.y);
      gl_FragColor = vec4(vec3(0.85, 0.92, 1.0) * a, a); }` });
  for (const a of [0.3, 2.4]) {
    const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 9), fallMat);
    fall.position.set(Math.cos(a) * 4.1, -4.1, Math.sin(a) * 4.1); fall.lookAt(0, -4.1, 0); heart.add(fall);
  }
  tickers.push((t) => { if (!reduced) fallMat.uniforms.uT.value = t; });

  // the outer islands, each with one lantern to light
  const NAMES = ["the island of the old bell", "the twin-tree island", "the garden island", "the high meadow", "the island at the edge"];
  const lanterns = new Map();
  const isles = [];
  NAMES.forEach((name, i) => {
    const a = (i / NAMES.length) * Math.PI * 2 + 0.4, d = 11 + (i % 2) * 3.5, y = -1 + (i % 3) * 1.6;
    const g = island(1.7 + r() * 1.1, 100 + i);
    g.position.set(Math.cos(a) * d, y, Math.sin(a) * d);
    scene.add(g); isles.push({ g, y, phase: i * 1.3 });
    // the lantern: a post, a lamp, and a glow that brightens when lit
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.6, 6), stone); post.position.y = 1.3; g.add(post);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), new THREE.MeshStandardMaterial({ color: 0x8a7a68, emissive: 0x000000, roughness: 0.4 }));
    lamp.position.y = 2.2; g.add(lamp);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffd38a, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.setScalar(1.6); halo.position.y = 2.2; g.add(halo);
    // a generous invisible target, so a fingertip finds it
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 2.0; hit.userData.id = `lantern-${i}`; g.add(hit); pickables.push(hit);
    lanterns.set(`lantern-${i}`, { lamp, halo, on: 0, want: 0, name });
  });
  tickers.push((t, dt) => {
    for (const s of isles) s.g.position.y = s.y + (reduced ? 0 : Math.sin(t * 0.5 + s.phase) * 0.35);   // Breath
    for (const l of lanterns.values()) {
      l.on += (l.want - l.on) * (reduced ? 1 : 1 - Math.pow(2, -dt / 0.35));                        // Emergence
      l.lamp.material.emissive.setRGB(1.0 * l.on, 0.72 * l.on, 0.3 * l.on);
      l.halo.material.opacity = 0.12 + 0.75 * l.on; l.halo.scale.setScalar(1.6 + 3.2 * l.on);
    }
  });
  // drifting motes of light
  const n = 500, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = 6 + r() * 40; p.set([Math.cos(a) * d, -5 + r() * 22, Math.sin(a) * d], i * 3); }
  const motes = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(p, 3)),
    new THREE.PointsMaterial({ map: glow, size: 0.35, color: 0xffe2b8, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(motes);
  tickers.push((t) => { if (!reduced) motes.rotation.y = t * 0.01; });
  return {
    view: { target: new THREE.Vector3(0, 1, 0), yaw: 0.6, pitch: 0.28, dist: 30, minPitch: -0.05, maxPitch: 1.1, minDist: 12, maxDist: 46 },
    light(id, on) { const l = lanterns.get(id); if (l) l.want = on ? 1 : 0; },
  };
}

// ======================= The Living Forest =======================
function forest(scene, glow, pickables, tickers, reduced) {
  const r = rand(7);
  scene.background = new THREE.Color(0x030a12);
  scene.fog = new THREE.FogExp2(0x041220, 0.045);
  scene.add(new THREE.HemisphereLight(0x2a5a7a, 0x020406, 0.55));
  const moon = new THREE.DirectionalLight(0x8ab8ff, 0.5); moon.position.set(10, 20, -5); scene.add(moon);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 48), new THREE.MeshStandardMaterial({ color: 0x0a1a1c, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  // the trees: tall dark trunks and soft canopies, drawn as two instanced meshes
  const N = 70;
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.38, 1, 7), new THREE.MeshStandardMaterial({ color: 0x1a2426, roughness: 1 }), N);
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0x0f3a3a, roughness: 1, flatShading: true, emissive: 0x021614 }), N);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), v3 = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    const a = r() * Math.PI * 2, d = 5 + r() * 32, h = 5 + r() * 7;
    m4.compose(v3.set(Math.cos(a) * d, h / 2, Math.sin(a) * d), q.identity(), s3.set(1, h, 1)); trunks.setMatrixAt(i, m4);
    const cs = 1.6 + r() * 1.6;
    m4.compose(v3.set(Math.cos(a) * d, h + cs * 0.4, Math.sin(a) * d), q.setFromAxisAngle(s3.set(0, 1, 0), r() * 3), s3.set(cs, cs * 1.3, cs)); crowns.setMatrixAt(i, m4);
  }
  scene.add(trunks, crowns);

  // the glowing plants to wake
  const NAMES = ["the fern by the stream", "the moon lily", "the lantern mushrooms", "the whispering reed", "the old root flower", "the twin bells", "the heart bloom"];
  const plants = new Map();
  NAMES.forEach((name, i) => {
    const a = (i / NAMES.length) * Math.PI * 2 + 0.3, d = 3.2 + (i % 3) * 1.6;
    const g = new THREE.Group(); g.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x1d4a44, emissive: 0x000000, roughness: 0.7 });
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0x2a5a5a, emissive: 0x000000, roughness: 0.3 });
    for (let k = 0; k < 3; k++) {
      const h = 0.8 + r() * 0.9, lean = (r() - 0.5) * 0.5;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, h, 5), stemMat);
      stem.position.set((k - 1) * 0.22, h / 2, 0); stem.rotation.z = lean; g.add(stem);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13 + r() * 0.08, 12, 10), bulbMat);
      bulb.position.set((k - 1) * 0.22 - Math.sin(lean) * h, h, 0); g.add(bulb);
    }
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: i % 2 ? 0x5fe3c0 : 0x7fb2ff, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.position.y = 1.1; halo.scale.setScalar(1.5); g.add(halo);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 48), new THREE.MeshBasicMaterial({ color: 0x5fe3c0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; g.add(ring);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 0.9; hit.userData.id = `plant-${i}`; g.add(hit); pickables.push(hit);
    scene.add(g);
    plants.set(`plant-${i}`, { stemMat, bulbMat, halo, ring, on: 0, want: 0, wave: 1, name, phase: i * 0.9, tint: new THREE.Color(i % 2 ? 0x5fe3c0 : 0x7fb2ff) });
  });
  // fireflies: they drift, and gather toward your touch
  const F = 260, fp = new Float32Array(F * 3), home = [];
  for (let i = 0; i < F; i++) { const a = r() * Math.PI * 2, d = 1 + r() * 14, y = 0.4 + r() * 4; home.push([Math.cos(a) * d, y, Math.sin(a) * d, r() * 6]); fp.set(home[i].slice(0, 3), i * 3); }
  const flies = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(fp, 3)),
    new THREE.PointsMaterial({ map: glow, size: 0.22, color: 0xc8ffb0, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(flies);
  const lure = new THREE.Vector3(0, 1.2, 0); let luring = 0;
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.2), rc = new THREE.Raycaster();
  let lastCam = null;
  tickers.push((t, dt) => {
    for (const pl of plants.values()) {
      pl.on += (pl.want - pl.on) * (reduced ? 1 : 1 - Math.pow(2, -dt / 0.4));
      const breathe = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 1.3 + pl.phase);                       // Breath
      const e = pl.on * breathe;
      pl.bulbMat.emissive.copy(pl.tint).multiplyScalar(1.6 * e); pl.stemMat.emissive.copy(pl.tint).multiplyScalar(0.35 * e);
      pl.halo.material.opacity = 0.05 + 0.7 * e; pl.halo.scale.setScalar(1.5 + 2.5 * e);
      if (pl.wave < 1) { pl.wave = Math.min(1, pl.wave + dt / 1.4); pl.ring.scale.setScalar(1 + pl.wave * 5); pl.ring.material.opacity = (1 - pl.wave) * 0.8; }
    }
    if (reduced) return;
    luring = Math.max(0, luring - dt * 0.4);
    const pos = flies.geometry.attributes.position;
    for (let i = 0; i < F; i++) {
      const [hx, hy, hz, ph] = home[i];
      const dx = hx + Math.sin(t * 0.4 + ph) * 0.8, dy = hy + Math.sin(t * 0.7 + ph * 2) * 0.4, dz = hz + Math.cos(t * 0.35 + ph) * 0.8;
      const x = dx + (lure.x + Math.sin(t + ph) * 1.2 - dx) * luring * 0.6, y = dy + (lure.y + Math.cos(t * 1.3 + ph) * 0.6 - dy) * luring * 0.6, z = dz + (lure.z + Math.cos(t + ph) * 1.2 - dz) * luring * 0.6;
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
  });
  return {
    view: { target: new THREE.Vector3(0, 1.4, 0), yaw: 0.2, pitch: 0.32, dist: 11, minPitch: 0.05, maxPitch: 1.0, minDist: 5, maxDist: 22 },
    light(id, on) { const pl = plants.get(id); if (pl) { if (on && pl.want === 0) pl.wave = 0; pl.want = on ? 1 : 0; } },
    hover(ndcPoint) {
      // fireflies gather where you point (touch or mouse)
      if (!lastCam) return;
      rc.setFromCamera(ndcPoint, lastCam);
      if (rc.ray.intersectPlane(groundPlane, lure)) luring = 1;
    },
    useCamera(c) { lastCam = c; },
  };
}

// ======================= shared pieces for the other worlds =======================
const C = (hex) => new THREE.Color(hex);
/** A gradient sky you can recolour: top, middle and horizon. */
function skyDome(scene, top, mid, hor) {
  const u = { uTop: { value: C(top) }, uMid: { value: C(mid) }, uHor: { value: C(hor) } };
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: u,
    vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform vec3 uTop, uMid, uHor; varying vec3 vP;
      void main(){ float h = normalize(vP).y;
        vec3 c = h > 0.06 ? mix(uMid, uTop, smoothstep(0.06, 0.75, h)) : mix(uHor, uMid, smoothstep(-0.08, 0.06, h));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  })));
  return { set(t, m, h) { u.uTop.value.set(t); u.uMid.value.set(m); u.uHor.value.set(h); } };
}
/** Many small stars on a big sphere. */
function starfield(scene, glow, n, seed, size = 0.6, r0 = 90, r1 = 150, color = 0xffffff) {
  const r = rand(seed), p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, a = r() * Math.PI * 2, d = r0 + r() * (r1 - r0), s = Math.sqrt(1 - u * u);
    p.set([Math.cos(a) * s * d, u * d, Math.sin(a) * s * d], i * 3);
  }
  const pts = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(p, 3)),
    new THREE.PointsMaterial({ map: glow, size, color, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(pts); return pts;
}
/** A floating island: a flat top and a rough rock underneath. */
function makeIsland(radius, seed, top, rock) {
  const g = new THREE.Group(), rr = rand(seed);
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.92, radius * 0.3, 12), top));
  const cone = new THREE.ConeGeometry(radius * 0.95, radius * 1.8, 12, 3), pos = cone.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i) * (0.85 + rr() * 0.3), pos.getY(i), pos.getZ(i) * (0.85 + rr() * 0.3));
  cone.computeVertexNormals();
  const under = new THREE.Mesh(cone, rock); under.rotation.x = Math.PI; under.position.y = -radius * 1.05; g.add(under);
  return g;
}
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...o });
const hitSphere = (id, r, y = 0) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); m.position.y = y; m.userData.id = id; return m; };
const halo = (glow, color, scale, opacity = 0.6) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(scale); return s; };
const hash = (str) => { let h = 2166136261; for (const ch of String(str)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return Math.abs(h); };
const disposeTree = (o) => o.traverse((x) => { x.geometry?.dispose(); const m = x.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((y) => y.dispose()); });
const ease = (t) => t * t * (3 - 2 * t);

// ======================= The Dream Architect =======================
// A small place made from four choices. The page sends the design; the place is rebuilt.
export const ARCH = {
  ground: { meadow: ["A meadow", 0x6fae6a, 0x6b5a7a], desert: ["A desert", 0xe0b77a, 0xa8744a], snow: ["Snow", 0xf2f4f8, 0x7d8aa0], crystal: ["Crystal", 0x9a7ae0, 0x3a2a6a], water: ["A lake", 0x5f9f74, 0x5a6a7a] },
  sky: { dawn: ["Dawn", 0x3a3a7a, 0xd88aa0, 0xffd2a0], day: ["Day", 0x3d7ad8, 0x8fc0f0, 0xe8f2ff], dusk: ["Dusk", 0x1a1440, 0x8a4f7d, 0xf2a070], night: ["Night", 0x02040c, 0x0a1430, 0x23305a] },
  build: { tower: "A tower", cottage: "A cottage", temple: "A temple", lighthouse: "A lighthouse" },
  life: { trees: "Trees", flowers: "Flowers", fireflies: "Fireflies", birds: "Birds" },
};
function architect(scene, glow, pickables, tickers, reduced, opts) {
  const sky = skyDome(scene, 0x3a3a7a, 0xd88aa0, 0xffd2a0);
  const stars = starfield(scene, glow, 700, 3, 0.9); stars.visible = false;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x404060, 1.0));
  const sun = new THREE.DirectionalLight(0xffe2c0, 1.4); sun.position.set(-12, 16, 8); scene.add(sun);
  const holder = new THREE.Group(); scene.add(holder);
  let place = null, lamp = null, lampOn = 0, lampWant = 0, movers = [];
  function apply(d) {
    if (place) { holder.remove(place); disposeTree(place); }
    pickables.length = 0; movers = [];
    place = new THREE.Group(); holder.add(place);
    const [, topC, rockC] = ARCH.ground[d.ground] ?? ARCH.ground.meadow;
    const isl = makeIsland(5, 11, std(topC), std(rockC)); place.add(isl);
    const [, t, m, hz] = ARCH.sky[d.sky] ?? ARCH.sky.dawn;
    sky.set(t, m, hz); stars.visible = d.sky === "night";
    sun.intensity = d.sky === "night" ? 0.25 : 1.4;
    const rr = rand(hash(JSON.stringify(d)) % 100000 + 7);
    if (d.ground === "crystal") for (let i = 0; i < 9; i++) { const a = rr() * 6.28, r = 2 + rr() * 2.6, h = 0.6 + rr() * 1.6;
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), std(0xc8b0ff, { emissive: 0x5a3aa0, roughness: 0.2, metalness: 0.2 })); c.scale.set(0.6, h * 1.6, 0.6); c.position.set(Math.cos(a) * r, 0.15 + h * 0.4, Math.sin(a) * r); place.add(c); }
    if (d.ground === "water") { const lake = new THREE.Mesh(new THREE.CircleGeometry(1.9, 32), std(0x4fa0c8, { roughness: 0.15, metalness: 0.3, emissive: 0x0a2a3a, flatShading: false })); lake.rotation.x = -Math.PI / 2; lake.position.set(2.2, 0.16, 1.2); place.add(lake); }
    if (d.ground === "desert") for (let i = 0; i < 5; i++) { const a = rr() * 6.28, r = 1.5 + rr() * 3; const dune = new THREE.Mesh(new THREE.SphereGeometry(0.9 + rr() * 0.6, 10, 6, 0, 6.28, 0, 1.2), std(0xe8c48a)); dune.scale.y = 0.35; dune.position.set(Math.cos(a) * r, 0.1, Math.sin(a) * r); place.add(dune); }
    // the building, with a light you can switch on
    const b = new THREE.Group(), stone = std(0xf0e6d8), roof = std(0xe6c07b, { metalness: 0.5, roughness: 0.4 });
    if (d.build === "cottage") { const body = new THREE.Mesh(new THREE.BoxGeometry(2, 1.4, 1.6), stone); body.position.y = 0.85; b.add(body);
      const r = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.1, 4), std(0x9a4a3a)); r.rotation.y = Math.PI / 4; r.position.y = 2.1; b.add(r); }
    else if (d.build === "temple") { for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.2, 8), stone); c.position.set(Math.cos(a) * 1.3, 1.25, Math.sin(a) * 1.3); b.add(c); }
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.45, 16, 8, 0, 6.28, 0, Math.PI / 2), roof); dome.position.y = 2.35; b.add(dome); }
    else if (d.build === "lighthouse") { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.75, 4, 12), stone); t.position.y = 2.15; b.add(t);
      for (let k = 0; k < 2; k++) { const band = new THREE.Mesh(new THREE.CylinderGeometry(0.62 - k * 0.12, 0.66 - k * 0.12, 0.4, 12), std(0xb04a3a)); band.position.y = 1.2 + k * 1.4; b.add(band); }
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.6, 12), roof); cap.position.y = 4.75; b.add(cap); }
    else { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 3.6, 10), stone); t.position.y = 1.95; b.add(t);
      const r = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.6, 10), roof); r.position.y = 4.55; b.add(r); }
    lamp = new THREE.PointLight(0xffd38a, 0, 12); lamp.position.y = d.build === "lighthouse" ? 4.3 : 2.2; b.add(lamp);
    const glowS = halo(glow, 0xffd38a, 1, 0); glowS.position.copy(lamp.position); b.add(glowS); lamp.userData.halo = glowS;
    b.position.set(-0.6, 0.15, -0.6);
    const hit = hitSphere("build", 2.2, 2.2); b.add(hit); pickables.push(hit);
    place.add(b);
    // something alive
    if (d.life === "trees" || d.life === "flowers") for (let i = 0; i < (d.life === "trees" ? 9 : 26); i++) {
      const a = rr() * 6.28, r = 1.9 + rr() * 2.7; let m;
      if (d.life === "trees") { m = new THREE.Mesh(new THREE.ConeGeometry(0.35 + rr() * 0.2, 1.2 + rr() * 0.8, 6), std(d.ground === "snow" ? 0xdfe8f0 : 0x2f6a48)); m.position.y = 0.75; }
      else { m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), std([0xff8fb0, 0xffd36a, 0xb08aff, 0xffffff][i % 4], { emissive: 0x221100 })); m.position.y = 0.25; }
      m.position.x = Math.cos(a) * r; m.position.z = Math.sin(a) * r; place.add(m);
    }
    if (d.life === "fireflies") { const n = 60, p = new Float32Array(n * 3), home = [];
      for (let i = 0; i < n; i++) { const a = rr() * 6.28, r = 1 + rr() * 5; home.push([Math.cos(a) * r, 0.5 + rr() * 2.5, Math.sin(a) * r, rr() * 6]); p.set(home[i].slice(0, 3), i * 3); }
      const pts = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(p, 3)), new THREE.PointsMaterial({ map: glow, size: 0.3, color: 0xd8ffa0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      place.add(pts); movers.push((t) => { const q = pts.geometry.attributes.position; home.forEach(([x, y, z, ph], i) => q.setXYZ(i, x + Math.sin(t * 0.5 + ph) * 0.4, y + Math.sin(t * 0.8 + ph) * 0.3, z + Math.cos(t * 0.4 + ph) * 0.4)); q.needsUpdate = true; }); }
    if (d.life === "birds") for (let i = 0; i < 7; i++) {
      const bird = new THREE.Mesh(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array([-0.35, 0.1, 0, 0, 0, 0.12, 0.35, 0.1, 0, 0, 0, -0.1]), 3)).setIndex([0, 1, 3, 1, 2, 3]), new THREE.MeshBasicMaterial({ color: 0x2a2030, side: THREE.DoubleSide }));
      const ph = i * 0.9, rad = 5 + (i % 3) * 1.4, hgt = 4 + (i % 2) * 1.2; place.add(bird);
      const at = (t) => { const a = t * 0.35 + ph; bird.position.set(Math.cos(a) * rad, hgt + Math.sin(t + ph) * 0.3, Math.sin(a) * rad); bird.rotation.y = -a; };
      at(0); movers.push(at);
    }
    lampWant = 0; lampOn = 0;
  }
  apply(opts.design ?? {});
  tickers.push((t, dt) => {
    if (!reduced) { holder.position.y = Math.sin(t * 0.5) * 0.25; for (const f of movers) f(t); }
    lampOn += (lampWant - lampOn) * (reduced ? 1 : 1 - Math.pow(2, -dt / 0.35));
    if (lamp) { lamp.intensity = 6 * lampOn; lamp.userData.halo.material.opacity = 0.85 * lampOn; lamp.userData.halo.scale.setScalar(1 + 3 * lampOn); }
  });
  return {
    view: { target: new THREE.Vector3(0, 1.4, 0), yaw: 0.7, pitch: 0.3, dist: 17, minPitch: -0.1, maxPitch: 1.15, minDist: 8, maxDist: 30 },
    api: { apply, lamp(on) { lampWant = on ? 1 : 0; }, get lampOn() { return lampWant === 1; } },
  };
}

// ======================= The Time Garden =======================
// Each moment you keep becomes a flower. Flowers grow over a week of real time.
function garden(scene, glow, pickables, tickers, reduced, opts) {
  skyDome(scene, 0x5a86c8, 0xf4c9a0, 0xffe6c0);
  scene.add(new THREE.HemisphereLight(0xfff2dd, 0x4a5a3a, 1.1));
  const sun = new THREE.DirectionalLight(0xffe0b0, 1.3); sun.position.set(-10, 14, 6); scene.add(sun);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(30, 64), std(0x6b9a5a, { flatShading: false })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const path = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.3, 48), std(0xd8c8a8, { flatShading: false })); path.rotation.x = -Math.PI / 2; path.position.y = 0.01; scene.add(path);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.8, 16), std(0xe8e0d0)); dial.position.y = 0.4; scene.add(dial);
  const gnomon = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 4), std(0xc9a25a, { metalness: 0.6 })); gnomon.position.y = 1.05; scene.add(gnomon);
  // a low hedge around the edge
  const hedge = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.9, 0), std(0x3f6e3c), 64), m4 = new THREE.Matrix4();
  for (let i = 0; i < 64; i++) { const a = i / 64 * 6.28; m4.makeTranslation(Math.cos(a) * 13, 0.5, Math.sin(a) * 13); hedge.setMatrixAt(i, m4); } scene.add(hedge);
  // trees beyond the hedge, tufts and stones in the grass, pollen in the air
  const gr = rand(17), trees = new THREE.InstancedMesh(new THREE.ConeGeometry(1.2, 4, 7), std(0x2f5a3a), 26), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  for (let i = 0; i < 26; i++) { const a = gr() * 6.28, d = 15 + gr() * 9, k = 0.7 + gr() * 0.8; m4.compose(ps.set(Math.cos(a) * d, 2 * k, Math.sin(a) * d), q, sc.set(k, k, k)); trees.setMatrixAt(i, m4); } scene.add(trees);
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.12, 0.45, 4), std(0x7fb86a), 160);
  for (let i = 0; i < 160; i++) { const a = gr() * 6.28, d = 1.6 + gr() * 10.5; m4.compose(ps.set(Math.cos(a) * d, 0.2, Math.sin(a) * d), q.setFromAxisAngle(sc.set(0, 0, 1), (gr() - 0.5) * 0.5), sc.set(1, 0.6 + gr(), 1)); tufts.setMatrixAt(i, m4); } scene.add(tufts);
  for (let i = 0; i < 9; i++) { const a = gr() * 6.28, d = 6 + gr() * 5; const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25 + gr() * 0.3, 0), std(0xb8b0a0)); st.scale.y = 0.5; st.position.set(Math.cos(a) * d, 0.08, Math.sin(a) * d); scene.add(st); }
  const pollen = starfield(scene, glow, 160, 18, 0.14, 0.5, 9, 0xfff2b0); pollen.position.y = 1.2; pollen.scale.y = 0.25;
  tickers.push((t) => { if (!reduced) pollen.rotation.y = t * 0.03; });
  const PET = [0xff8fb0, 0xffd36a, 0xb08aff, 0xffffff, 0xff9a6a, 0x8ad0ff];
  const flowers = new Map(), DAY = 864e5;
  const spot = (i) => { const a = i * 2.39996, r = 1.9 + 0.62 * Math.sqrt(i) * 1.6; return [Math.cos(a) * r, Math.sin(a) * r]; };
  function plant(mo, i, fresh = false) {
    const g = new THREE.Group(), [x, z] = spot(i); g.position.set(x, 0, z);
    const grow = Math.min(1, Math.max(0.2, (Date.now() - Date.parse(mo.at)) / (7 * DAY)));
    const h = 0.35 + 1.1 * grow, col = PET[hash(mo.id) % PET.length];
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, h, 5), std(0x3f7a3a)); stem.position.y = h / 2; g.add(stem);
    const head = new THREE.Group(); head.position.y = h;
    for (let k = 0; k < 6; k++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.2 + 0.1 * grow, 8, 6), std(col, { flatShading: false, roughness: 0.6 })); p.scale.set(1, 0.45, 1.6); const a = k / 6 * 6.28; p.position.set(Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26); p.rotation.y = -a; head.add(p); }
    head.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), std(0xffd36a, { emissive: 0x553300 })));
    const shine = halo(glow, col, 1.4, 0); head.add(shine); g.add(head);
    const hit = hitSphere(mo.id, 0.55, h * 0.7); g.add(hit); pickables.push(hit);
    g.scale.setScalar(fresh && !reduced ? 0.01 : 1);
    scene.add(g); flowers.set(mo.id, { g, head, shine, born: fresh ? performance.now() : 0, phase: i });
  }
  (opts.moments ?? []).forEach((m, i) => plant(m, i));
  let lit = null;
  tickers.push((t) => {
    for (const f of flowers.values()) {
      if (f.born) { const k = Math.min(1, (performance.now() - f.born) / 1200); f.g.scale.setScalar(ease(k)); if (k >= 1) f.born = 0; }
      if (!reduced) f.head.rotation.z = Math.sin(t * 0.9 + f.phase) * 0.06;
      f.shine.material.opacity += ((lit === f ? 0.8 : 0) - f.shine.material.opacity) * 0.1;
    }
  });
  return {
    view: { target: new THREE.Vector3(0, 0.6, 0), yaw: 0.4, pitch: 0.42, dist: 8.5, minPitch: 0.12, maxPitch: 1.3, minDist: 3.5, maxDist: 22 },
    api: {
      add(mo, i) { plant(mo, i, true); },
      remove(id) { const f = flowers.get(id); if (!f) return; scene.remove(f.g); disposeTree(f.g); flowers.delete(id); const k = pickables.findIndex((p) => p.userData.id === id); if (k >= 0) pickables.splice(k, 1); },
      show(id) { lit = flowers.get(id) ?? null; },
    },
  };
}

// ======================= The Temple of Stillness =======================
// An open temple around a light that breathes with you. The page sets the breath (0 to 1).
function stillness(scene, glow, pickables, tickers, reduced) {
  skyDome(scene, 0x0a0c24, 0x2a2450, 0x6a4a6a);
  starfield(scene, glow, 600, 5, 0.7);
  scene.add(new THREE.HemisphereLight(0xb8c0ff, 0x101020, 0.5));
  const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshStandardMaterial({ color: 0x141a30, roughness: 0.25, metalness: 0.4 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const pool = new THREE.Mesh(new THREE.RingGeometry(1.4, 2.6, 64), new THREE.MeshStandardMaterial({ color: 0x1a2a4a, roughness: 0.05, metalness: 0.7, emissive: 0x050a20 })); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.01; scene.add(pool);
  const stone = std(0xe8e2f0, { flatShading: false, roughness: 0.6 });
  for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * 6.28; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 4.2, 12), stone); c.position.set(Math.cos(a) * 6, 2.1, Math.sin(a) * 6); scene.add(c); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(6, 0.22, 8, 64), stone); ring.rotation.x = Math.PI / 2; ring.position.y = 4.3; scene.add(ring);
  const orbMat = new THREE.MeshBasicMaterial({ color: 0xffe6c0 });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16), orbMat); orb.position.y = 1.6; scene.add(orb);
  const aura = halo(glow, 0xffc890, 3, 0.5); aura.position.y = 1.6; scene.add(aura);
  const inner = halo(glow, 0xfff4e0, 1.2, 0.9); inner.position.y = 1.6; scene.add(inner);
  const light = new THREE.PointLight(0xffd8a0, 4, 16); light.position.y = 1.6; scene.add(light);
  const hit = hitSphere("orb", 1.2, 1.6); scene.add(hit); pickables.push(hit);
  let b = 0.3, show = 0.3;
  tickers.push((t, dt) => {
    show += (b - show) * (1 - Math.pow(2, -dt / 0.25));
    const s = reduced ? 1 : 0.7 + 0.65 * show;
    orb.scale.setScalar(s); orbMat.color.setRGB(0.85 + 0.15 * show, 0.72 + 0.2 * show, 0.55 + 0.3 * show);
    inner.scale.setScalar(reduced ? 1.6 : 1.1 + 1.0 * show);
    aura.scale.setScalar(reduced ? 4 : 2.6 + 3.4 * show); aura.material.opacity = 0.25 + 0.55 * show;
    light.intensity = 2 + 8 * show;
  });
  return {
    view: { target: new THREE.Vector3(0, 1.1, 0), yaw: 0, pitch: 0.16, dist: 5.3, minPitch: -0.05, maxPitch: 1.0, minDist: 3, maxDist: 5.6, noTurn: true },
    api: { breath(v) { b = Math.max(0, Math.min(1, v)); } },
  };
}

// ======================= The Sound Sanctuary =======================
// Seven singing bowls on a stone floor. Striking one sends a ring of light across the floor.
function sanctuary(scene, glow, pickables, tickers, reduced) {
  skyDome(scene, 0x05060e, 0x10142a, 0x2a2440);
  starfield(scene, glow, 500, 9, 0.6);
  scene.add(new THREE.HemisphereLight(0xffd8b0, 0x101018, 0.45));
  const warm = new THREE.PointLight(0xffb070, 6, 20); warm.position.set(0, 5, 0); scene.add(warm);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 64), std(0x2a2630, { flatShading: false, roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const profile = [[0.05, 0], [0.5, 0.02], [0.78, 0.18], [0.9, 0.42], [0.92, 0.55], [0.86, 0.55], [0.82, 0.42], [0.7, 0.2], [0.45, 0.07], [0.05, 0.06]].map(([x, y]) => new THREE.Vector2(x, y));
  const bowls = [];
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * 6.28 - Math.PI / 2, g = new THREE.Group(), size = 1.15 - i * 0.07;
    const mat = new THREE.MeshStandardMaterial({ color: 0xc89a5a, metalness: 0.85, roughness: 0.3, emissive: 0x000000 });
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), mat); bowl.scale.setScalar(size); g.add(bowl);
    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.8 * size, 0.9 * size, 0.18, 24), std(0x5a2a4a, { flatShading: false })); cushion.position.y = -0.06; g.add(cushion);
    const wave = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.0, 64), new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    wave.rotation.x = -Math.PI / 2; wave.position.y = 0.02; g.add(wave);
    const hit = hitSphere(`bowl-${i}`, 1.0 * size, 0.3); g.add(hit); pickables.push(hit);
    g.position.set(Math.cos(a) * 3.4, 0.1, Math.sin(a) * 3.4); scene.add(g);
    bowls.push({ mat, wave, k: 1 });
  }
  // candles: a few warm points of light
  for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28 + 0.3; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8), std(0xf4ead8)); c.position.set(Math.cos(a) * 6.5, 0.2, Math.sin(a) * 6.5); scene.add(c);
    const f = halo(glow, 0xffb060, 0.6, 0.9); f.position.set(c.position.x, 0.5, c.position.z); scene.add(f); }
  tickers.push((t, dt) => {
    for (const b of bowls) if (b.k < 1) {
      b.k = Math.min(1, b.k + dt / (reduced ? 0.6 : 3));
      b.mat.emissive.setRGB(0.6 * (1 - b.k), 0.4 * (1 - b.k), 0.15 * (1 - b.k));
      if (!reduced) { b.wave.scale.setScalar(1 + b.k * 5); b.wave.material.opacity = (1 - b.k) * 0.7; } else b.wave.material.opacity = 0;
    }
  });
  return {
    view: { target: new THREE.Vector3(0, 0.3, 0), yaw: 0, pitch: 0.78, dist: 13.5, minPitch: 0.2, maxPitch: 1.4, minDist: 6, maxDist: 20 },
    api: { strike(i) { const b = bowls[i]; if (b) b.k = 0; } },
  };
}

// ======================= The Inner Cosmos =======================
// Inside a nebula. Six bright stars each hold a small invitation to notice.
function cosmos(scene, glow, pickables, tickers, reduced) {
  const neb = new THREE.Mesh(new THREE.SphereGeometry(180, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { uT: { value: 0 } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform float uT; varying vec3 vP; ${NOISE}
      void main(){ vec2 p = vec2(atan(vP.z, vP.x) * 1.6, vP.y * 2.4) + uT * 0.004;
        float n = fbm(p * 1.4), m = fbm(p * 3.1 + 4.0);
        vec3 c = vec3(0.01, 0.01, 0.04);
        c += vec3(0.35, 0.12, 0.5) * smoothstep(0.45, 0.85, n);
        c += vec3(0.1, 0.3, 0.55) * smoothstep(0.5, 0.9, m) * 0.8;
        c += vec3(0.6, 0.25, 0.35) * smoothstep(0.7, 0.95, n * m * 1.6) * 0.6;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  }));
  scene.add(neb);
  starfield(scene, glow, 2600, 21, 0.55, 60, 170);
  const near = starfield(scene, glow, 300, 22, 0.35, 8, 40, 0xcfe0ff);
  const COLS = [0xffe2b8, 0xbfd6ff, 0xffc8e0, 0xd8ffe8, 0xfff2c8, 0xc8c0ff];
  const bright = [];
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * 6.28 + 0.4, y = (i % 2 ? 0.35 : -0.15) + (i % 3) * 0.12, d = 22;
    const g = new THREE.Group(); g.position.set(Math.cos(a) * d, y * d, Math.sin(a) * d);
    const core = halo(glow, COLS[i], 2.2, 0.95), aura = halo(glow, COLS[i], 6, 0.25); g.add(core, aura);
    const hit = hitSphere(`star-${i}`, 3.2); g.add(hit); pickables.push(hit);
    scene.add(g); bright.push({ core, aura, phase: i * 1.1, seen: 0 });
  }
  tickers.push((t) => {
    if (!reduced) { neb.material.uniforms.uT.value = t; near.rotation.y = t * 0.004; }
    for (const s of bright) { const tw = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 1.4 + s.phase); s.core.scale.setScalar((2.2 + s.seen * 0.8) * tw); s.aura.material.opacity = 0.2 + 0.15 * s.seen; }
  });
  return {
    view: { target: new THREE.Vector3(0, 0, 0), yaw: 0, pitch: 0.05, dist: 1.5, minPitch: -1.2, maxPitch: 1.2, minDist: 1.2, maxDist: 2.5 },
    api: { seen(i) { if (bright[i]) bright[i].seen = 1; } },
  };
}

// ======================= The Dream Realm =======================
// Each dream you keep floats as a bubble above a pastel sea of cloud.
function dreams(scene, glow, pickables, tickers, reduced, opts) {
  skyDome(scene, 0x6a5aa8, 0xe8a8c8, 0xffe0c8);
  const clouds = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uT: { value: 0 } },
    vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: `uniform float uT; varying vec3 vW; ${NOISE}
      void main(){ vec2 p = vW.xz * 0.05 + vec2(uT * 0.01, uT * 0.004); float n = fbm(p) * 0.8 + fbm(p * 2.5) * 0.3, d = length(vW.xz) / 190.0;
        vec3 c = mix(vec3(0.85, 0.7, 0.9), vec3(1.0, 0.92, 0.88), smoothstep(0.4, 0.9, n));
        gl_FragColor = vec4(c, smoothstep(0.25, 0.6, n) * (1.0 - smoothstep(0.6, 1.0, d)));
        #include <colorspace_fragment>
      }`,
  }));
  clouds.rotation.x = -Math.PI / 2; clouds.position.y = -4; scene.add(clouds);
  scene.add(new THREE.HemisphereLight(0xffe8f0, 0x8a7ab0, 1.0));
  const bubbleMat = () => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uH: { value: 0 } },
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: `uniform float uT, uH; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.2);
        vec3 rb = 0.5 + 0.5 * cos(6.2831 * (f * 1.3 + uT * 0.05 + uH + vec3(0.0, 0.33, 0.67)));
        gl_FragColor = vec4(mix(vec3(1.0), rb, 0.7), 0.08 + f * 0.75); }` });
  const bubbles = new Map();
  const spot = (i) => { const a = i * 2.39996, r = 3 + Math.sqrt(i) * 2.2; return [Math.cos(a) * r, 1 + (i % 3) * 1.1, Math.sin(a) * r]; };
  function add(dr, i, fresh = false) {
    const g = new THREE.Group(), [x, y, z] = spot(i); g.position.set(x, y, z);
    const mat = bubbleMat(); mat.uniforms.uH.value = (hash(dr.id) % 100) / 100;
    g.add(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), mat));
    const inner = halo(glow, 0xfff0f8, 1.2, 0.5); g.add(inner);
    const hit = hitSphere(dr.id, 1.15); g.add(hit); pickables.push(hit);
    g.scale.setScalar(fresh && !reduced ? 0.01 : 1); scene.add(g);
    bubbles.set(dr.id, { g, mat, inner, y, born: fresh ? performance.now() : 0, phase: i });
  }
  (opts.dreams ?? []).forEach((d, i) => add(d, i));
  let lit = null;
  tickers.push((t) => {
    if (!reduced) clouds.material.uniforms.uT.value = t;
    for (const b of bubbles.values()) {
      if (b.born) { const k = Math.min(1, (performance.now() - b.born) / 1400); b.g.scale.setScalar(ease(k)); if (k >= 1) b.born = 0; }
      if (!reduced) { b.mat.uniforms.uT.value = t; b.g.position.y = b.y + Math.sin(t * 0.6 + b.phase) * 0.3; }
      b.inner.material.opacity += ((lit === b ? 1 : 0.4) - b.inner.material.opacity) * 0.1;
    }
  });
  return {
    view: { target: new THREE.Vector3(0, 1.5, 0), yaw: 0.3, pitch: 0.22, dist: 15, minPitch: -0.1, maxPitch: 1.1, minDist: 5, maxDist: 28 },
    api: {
      add(d, i) { add(d, i, true); },
      remove(id) { const b = bubbles.get(id); if (!b) return; scene.remove(b.g); disposeTree(b.g); bubbles.delete(id); const k = pickables.findIndex((p) => p.userData.id === id); if (k >= 0) pickables.splice(k, 1); },
      show(id) { lit = bubbles.get(id) ?? null; },
    },
  };
}

// ======================= The Cosmic Observatory =======================
// The Sun and eight planets. Sizes and distances are squeezed to fit; years keep their true ratios.
export const BODIES = [
  { id: "sun", color: 0xffc860, d: 109, au: 0, year: 0 },
  { id: "mercury", color: 0xa8a29a, d: 0.38, au: 0.39, year: 0.241 },
  { id: "venus", color: 0xe8c890, d: 0.95, au: 0.72, year: 0.615 },
  { id: "earth", color: 0x4a8ad8, d: 1, au: 1, year: 1 },
  { id: "mars", color: 0xc8643a, d: 0.53, au: 1.52, year: 1.881 },
  { id: "jupiter", color: 0xd8b08a, d: 11.2, au: 5.2, year: 11.86 },
  { id: "saturn", color: 0xe8d4a0, d: 9.45, au: 9.58, year: 29.46 },
  { id: "uranus", color: 0x9ad8e0, d: 4.0, au: 19.2, year: 84.0 },
  { id: "neptune", color: 0x4a6ae0, d: 3.88, au: 30.1, year: 164.8 },
];
function observatory(scene, glow, pickables, tickers, reduced) {
  scene.background = C(0x02030a);
  starfield(scene, glow, 1800, 31, 0.6);
  scene.add(new THREE.AmbientLight(0x404050, 0.6));
  const sunLight = new THREE.PointLight(0xfff0d0, 2.6, 0, 0); scene.add(sunLight);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffd070 }));
  sun.userData.id = "sun"; scene.add(sun); pickables.push(sun);
  scene.add(halo(glow, 0xffb040, 7, 0.7));
  const orbits = [];
  BODIES.slice(1).forEach((b, i) => {
    const R = 2.6 + i * 1.45, size = 0.16 + 0.09 * Math.log2(1 + b.d * 2);
    const loop = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 128 }, (_, k) => new THREE.Vector3(Math.cos(k / 128 * 6.28) * R, 0, Math.sin(k / 128 * 6.28) * R))),
      new THREE.LineBasicMaterial({ color: 0x8090c0, transparent: true, opacity: 0.25 }));
    scene.add(loop);
    const g = new THREE.Group();
    const p = new THREE.Mesh(new THREE.SphereGeometry(size, 24, 12), new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.8 })); g.add(p);
    if (b.id === "saturn") { const ring = new THREE.Mesh(new THREE.RingGeometry(size * 1.4, size * 2.3, 48), new THREE.MeshBasicMaterial({ color: 0xe8d8b0, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })); ring.rotation.x = -Math.PI / 2 + 0.45; g.add(ring); }
    if (b.id === "uranus") p.rotation.z = 1.71;
    const sel = new THREE.Mesh(new THREE.RingGeometry(size * 1.9, size * 2.1, 40), new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); sel.rotation.x = -Math.PI / 2; g.add(sel);
    const hit = hitSphere(b.id, Math.max(0.55, size * 1.8)); g.add(hit); pickables.push(hit);
    scene.add(g);
    orbits.push({ b, g, R, sel, a0: (hash(b.id) % 628) / 100 });
  });
  let running = !reduced, clockT = 0, picked = null;
  const place = () => { for (const o of orbits) { const a = o.a0 + (clockT / (o.b.year * 24)) * 6.28; o.g.position.set(Math.cos(a) * o.R, 0, Math.sin(a) * o.R); } };
  place();
  tickers.push((t, dt) => {
    if (running) { clockT += dt; place(); }
    for (const o of orbits) o.sel.material.opacity += ((picked === o.b.id ? 0.9 : 0) - o.sel.material.opacity) * 0.15;
  });
  return {
    view: { target: new THREE.Vector3(0, 0, 0), yaw: 0.2, pitch: 0.75, dist: 24, minPitch: 0.1, maxPitch: 1.5, minDist: 8, maxDist: 40 },
    api: { run(on) { running = on; }, get running() { return running; }, select(id) { picked = id; } },
  };
}

// ======================= The Discovery Lab: gravity =======================
// Throw moons around a star. Real Newtonian gravity, integrated in small steps.
function lab(scene, glow, pickables, tickers, reduced, opts) {
  scene.background = C(0x03050c);
  starfield(scene, glow, 900, 41, 0.5);
  const GM = 70, star = halo(glow, 0xffd890, 3.2, 1); scene.add(star);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 12), new THREE.MeshBasicMaterial({ color: 0xfff0c8 })); scene.add(core);
  const grid = new THREE.PolarGridHelper(12, 12, 6, 64, 0x203050, 0x101a30); grid.material.transparent = true; grid.material.opacity = 0.5; scene.add(grid);
  const aim = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0 })); scene.add(aim);
  const COLS = [0x9ad8ff, 0xffb0d0, 0xb0ffd0, 0xffe2a0, 0xc8b0ff, 0xffffff];
  const moons = []; let n = 0, start = null;
  const T = 160;
  function launch(x, z, vx, vz) {
    if (moons.length >= 10) kill(moons[0], null);
    const col = COLS[n++ % COLS.length];
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), new THREE.MeshBasicMaterial({ color: col }));
    const trail = new THREE.Line(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(T * 3), 3)), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.55 }));
    trail.geometry.setDrawRange(0, 0); scene.add(m, trail);
    const moon = { m, trail, p: new THREE.Vector2(x, z), v: new THREE.Vector2(vx, vz), pts: [], age: 0, orbited: false, a0: Math.atan2(z, x), swept: 0 };
    m.position.set(x, 0, z); moons.push(moon); return moon;
  }
  function kill(moon, why) { scene.remove(moon.m, moon.trail); moon.m.geometry.dispose(); moon.m.material.dispose(); moon.trail.geometry.dispose(); moon.trail.material.dispose(); moons.splice(moons.indexOf(moon), 1); if (why) opts.onEvent?.(why, moons.length); }
  const circular = (x, z) => { const r = Math.hypot(x, z) || 1, v = Math.sqrt(GM / r); return [-z / r * v, x / r * v]; };
  tickers.push((t, dt) => {
    const steps = 6, h = dt / steps;
    for (const moon of [...moons]) {
      for (let s = 0; s < steps; s++) {
        const r2 = moon.p.lengthSq(), r = Math.sqrt(r2), a = -GM / (r2 * r);
        moon.v.x += moon.p.x * a * h; moon.v.y += moon.p.y * a * h; moon.p.x += moon.v.x * h; moon.p.y += moon.v.y * h;
      }
      moon.m.position.set(moon.p.x, 0, moon.p.y);
      const ang = Math.atan2(moon.p.y, moon.p.x); let da = ang - moon.a0; if (da > Math.PI) da -= 6.283; if (da < -Math.PI) da += 6.283; moon.swept += Math.abs(da); moon.a0 = ang;
      if (!moon.orbited && moon.swept > 6.283) { moon.orbited = true; opts.onEvent?.("orbit", moons.length); }
      moon.pts.push(moon.p.x, 0.01, moon.p.y); if (moon.pts.length > T * 3) moon.pts.splice(0, 3);
      moon.trail.geometry.attributes.position.array.set(moon.pts); moon.trail.geometry.attributes.position.needsUpdate = true; moon.trail.geometry.setDrawRange(0, moon.pts.length / 3);
      const r = moon.p.length();
      if (r < 0.55) kill(moon, "fell"); else if (r > 40) kill(moon, "escaped");
    }
    if (!reduced) star.scale.setScalar(3.2 + Math.sin(t * 2) * 0.15);
  });
  return {
    view: { target: new THREE.Vector3(0, 0, 0), yaw: 0, pitch: 1.5, dist: 26, minPitch: 1.5, maxPitch: 1.5, minDist: 14, maxDist: 40, fixed: true },
    press(p) { if (!p) return; start = p.clone(); },
    dragTo(p) { if (!start || !p) return; aim.geometry.setFromPoints([start, p]); aim.material.opacity = 0.8; },
    release(p) {
      aim.material.opacity = 0;
      if (!start || !p) { start = null; return; }
      const dx = p.x - start.x, dz = p.z - start.z, len = Math.hypot(dx, dz);
      if (Math.hypot(start.x, start.z) > 0.8) { const [vx, vz] = len < 0.4 ? circular(start.x, start.z) : [dx * 1.6, dz * 1.6]; launch(start.x, start.z, vx, vz); opts.onEvent?.("launched", moons.length); }
      start = null;
    },
    api: {
      /** kinds: circle, oval, slow, fast */
      throw(kind, r = 5) {
        const [vx, vz] = circular(r, 0), k = { circle: 1, oval: 0.78, slow: 0.35, fast: 1.55 }[kind] ?? 1;
        launch(r, 0, vx * k, vz * k); opts.onEvent?.("launched", moons.length);
      },
      clear() { for (const m of [...moons]) kill(m, null); },
      get count() { return moons.length; },
    },
  };
}

// ======================= The Flower of Life =======================
// Grown in five steps: one circle, the Seed, the Flower, the Fruit, Metatron's Cube.
function flower(scene, glow, pickables, tickers, reduced) {
  scene.background = C(0x070516);
  starfield(scene, glow, 900, 51, 0.5);
  const g = new THREE.Group(); scene.add(g);
  const circle = (x, y, r, color) => new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 96 }, (_, k) => new THREE.Vector3(x + Math.cos(k / 96 * 6.2832) * r, y + Math.sin(k / 96 * 6.2832) * r, 0))),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  const r = 1, h = Math.sqrt(3) / 2;
  // the hexagonal grid: every centre within two radii of the middle (19 of them)
  const grid = [];
  for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) { const x = (a + b / 2) * r, y = b * h * r; if (Math.hypot(x, y) < 2 * r + 1e-6) grid.push([x, y]); }
  grid.sort((p, q) => Math.hypot(...p) - Math.hypot(...q));
  const layers = [[], [], [], [], []];
  layers[0].push(circle(0, 0, r, 0xfff2d0));
  grid.slice(1, 7).forEach(([x, y]) => layers[1].push(circle(x, y, r, 0xf0d6a2)));
  grid.slice(7).forEach(([x, y]) => layers[2].push(circle(x, y, r, 0xc9a8ff)));
  layers[2].push(circle(0, 0, 3 * r, 0xc9a8ff));
  // the Fruit: thirteen touching circles, centres on two hexagons (2r and 4r), drawn a little in front
  const fruit = [[0, 0]]; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.2832 + Math.PI / 2; fruit.push([Math.cos(a) * 2 * r, Math.sin(a) * 2 * r]); } for (let k = 0; k < 6; k++) { const a = k / 6 * 6.2832 + Math.PI / 2; fruit.push([Math.cos(a) * 4 * r, Math.sin(a) * 4 * r]); }
  fruit.forEach(([x, y]) => { const c = circle(x, y, r, 0x7fd8ff); c.position.z = 0.6; layers[3].push(c); });
  // Metatron's Cube: every centre joined to every other, 78 lines
  const pts = []; for (let i = 0; i < 13; i++) for (let j = i + 1; j < 13; j++) pts.push(new THREE.Vector3(fruit[i][0], fruit[i][1], 1.2), new THREE.Vector3(fruit[j][0], fruit[j][1], 1.2));
  const cube = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  layers[4].push(cube);
  layers.flat().forEach((o) => g.add(o));
  const core = halo(glow, 0xfff2d0, 2.4, 0.5); g.add(core);
  const hit = new THREE.Mesh(new THREE.CircleGeometry(5.5, 32), new THREE.MeshBasicMaterial({ visible: false })); hit.userData.id = "flower"; g.add(hit); pickables.push(hit);
  let step = 0;
  const want = (i) => (i <= step ? (i === 4 ? 0.55 : i === step ? 0.95 : 0.4) : 0);
  tickers.push((t, dt) => {
    const k = reduced ? 1 : 1 - Math.pow(2, -dt / 0.4);
    layers.forEach((l, i) => l.forEach((o) => { o.material.opacity += (want(i) - o.material.opacity) * k; }));
    if (!reduced) { g.rotation.y = Math.sin(t * 0.15) * 0.35; g.rotation.x = Math.sin(t * 0.11) * 0.18; core.material.opacity = 0.4 + 0.15 * Math.sin(t * 0.8); }
  });
  return {
    view: { target: new THREE.Vector3(0, -2.2, 0), yaw: 0, pitch: 0, dist: 15, minPitch: -0.6, maxPitch: 0.6, minDist: 6, maxDist: 24, noTurn: true },
    api: { step(n) { step = Math.max(0, Math.min(4, n)); }, get at() { return step; } },
  };
}

// ======================= The Five Solids =======================
// The Platonic solids in a ring around the star tetrahedron.
function solids(scene, glow, pickables, tickers, reduced) {
  scene.background = C(0x04050f);
  starfield(scene, glow, 1100, 61, 0.55);
  scene.add(new THREE.AmbientLight(0x8090c0, 0.6));
  const key = new THREE.PointLight(0xfff0d0, 3, 0, 0); key.position.set(0, 6, 6); scene.add(key);
  const make = (geo, color) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.18, roughness: 0.3, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false })));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 })));
    return g;
  };
  const DEFS = [["tetra", new THREE.TetrahedronGeometry(1.1), 0xff8a5a], ["cube", new THREE.BoxGeometry(1.25, 1.25, 1.25), 0x7fd08a], ["octa", new THREE.OctahedronGeometry(1.05), 0xfff0a8],
    ["icosa", new THREE.IcosahedronGeometry(1.05), 0x7fb2ff], ["dodeca", new THREE.DodecahedronGeometry(1.05), 0xc9a8ff]];
  const items = new Map();
  DEFS.forEach(([id, geo, color], i) => {
    const a = i / 5 * 6.2832 - Math.PI / 2, g = make(geo, color);
    g.position.set(Math.cos(a) * 4.2, 0, Math.sin(a) * 4.2); scene.add(g);
    const aura = halo(glow, color, 3.2, 0.12); g.add(aura);
    const hit = hitSphere(id, 1.5); g.add(hit); pickables.push(hit);
    items.set(id, { g, aura, phase: i, sel: 0 });
  });
  // the star tetrahedron: two tetrahedra, each other's mirror
  const star = new THREE.Group(), t1 = make(new THREE.TetrahedronGeometry(1.5), 0xf0d6a2), t2 = make(new THREE.TetrahedronGeometry(1.5), 0xf0d6a2);
  // one tetrahedron points up, its mirror points down; they turn together as one star
  t2.rotation.z = Math.PI / 2; const upright = new THREE.Group(); upright.add(t1, t2);
  upright.quaternion.setFromUnitVectors(new THREE.Vector3(1, 1, 1).normalize(), new THREE.Vector3(0, 1, 0));
  star.add(upright); star.position.y = 0.4; scene.add(star);
  const sAura = halo(glow, 0xffd890, 5, 0.25); star.add(sAura);
  const sHit = hitSphere("star", 1.9); star.add(sHit); pickables.push(sHit);
  items.set("star", { g: star, aura: sAura, phase: 0, sel: 0 });
  let picked = null;
  tickers.push((t, dt) => {
    if (!reduced) { for (const it of items.values()) if (it.g !== star) { it.g.rotation.y = t * 0.3 + it.phase; it.g.rotation.x = t * 0.17 + it.phase; } star.rotation.y = t * 0.25; }
    for (const [id, it] of items) { it.sel += ((picked === id ? 1 : 0) - it.sel) * (1 - Math.pow(2, -dt / 0.25)); it.g.scale.setScalar(1 + 0.3 * it.sel); it.aura.material.opacity = (id === "star" ? 0.25 : 0.12) + 0.45 * it.sel; }
  });
  return {
    view: { target: new THREE.Vector3(0, 0.2, 0), yaw: 0, pitch: 0.42, dist: 13, minPitch: -0.2, maxPitch: 1.3, minDist: 6, maxDist: 22 },
    api: { select(id) { picked = id; } },
  };
}

// ======================= The Hall of the Seven Principles =======================
// Seven pillars around a flame, each with its own sign; a seven-pointed star on the floor.
function hall(scene, glow, pickables, tickers, reduced) {
  skyDome(scene, 0x07061a, 0x1a1238, 0x3a2448);
  starfield(scene, glow, 700, 71, 0.6);
  scene.add(new THREE.HemisphereLight(0xc8b8ff, 0x100818, 0.45));
  const fire = new THREE.PointLight(0xffb060, 10, 22); fire.position.y = 1.4; scene.add(fire);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 64), new THREE.MeshStandardMaterial({ color: 0x1c1830, roughness: 0.3, metalness: 0.5 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const star7 = []; for (let k = 0; k <= 7; k++) { const a = (k * 3) / 7 * 6.2832 - Math.PI / 2; star7.push(new THREE.Vector3(Math.cos(a) * 3.2, 0.02, Math.sin(a) * 3.2)); }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(star7), new THREE.LineBasicMaterial({ color: 0xe6c07b, transparent: true, opacity: 0.6 })));
  const flame = halo(glow, 0xffb060, 2.6, 0.9); flame.position.y = 1.3; scene.add(flame);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 0.5, 24), std(0xc89a5a, { metalness: 0.8, roughness: 0.3, flatShading: false })); bowl.position.y = 0.55; scene.add(bowl);
  const stone = std(0xe8e2f0, { flatShading: false, roughness: 0.6 }), gold = () => new THREE.MeshStandardMaterial({ color: 0xe6c07b, metalness: 0.7, roughness: 0.3, emissive: 0x000000 });
  const SIGNS = [() => new THREE.SphereGeometry(0.32, 24, 12), () => new THREE.ConeGeometry(0.3, 0.7, 4), () => new THREE.TorusKnotGeometry(0.22, 0.06, 64, 8), () => new THREE.CapsuleGeometry(0.12, 0.6, 4, 12),
    () => new THREE.TorusGeometry(0.3, 0.07, 12, 32), () => new THREE.ConeGeometry(0.22, 0.6, 3), () => new THREE.TorusGeometry(0.24, 0.05, 12, 32)];
  const pillars = [];
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * 6.2832 - Math.PI / 2, g = new THREE.Group(); g.position.set(Math.cos(a) * 5.4, 0, Math.sin(a) * 5.4);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 3.4, 16), stone); col.position.y = 1.7; g.add(col);
    const m = gold(), sign = new THREE.Mesh(SIGNS[i](), m); sign.position.y = 4.0; g.add(sign);
    if (i === 6) { const s2 = new THREE.Mesh(SIGNS[i](), m); s2.position.set(0.22, 4.0, 0); s2.rotation.y = Math.PI / 2; g.add(s2); }
    const aura = halo(glow, 0xffd8a0, 1.6, 0.1); aura.position.y = 4.0; g.add(aura);
    const hit = hitSphere(`p-${i}`, 1.2, 2.6); g.add(hit); pickables.push(hit);
    scene.add(g); pillars.push({ sign, m, aura, on: 0, want: 0, sel: 0, phase: i });
  }
  let picked = -1;
  tickers.push((t, dt) => {
    const k = reduced ? 1 : 1 - Math.pow(2, -dt / 0.35);
    pillars.forEach((p, i) => {
      p.on += (p.want - p.on) * k; p.sel += ((picked === i ? 1 : 0) - p.sel) * k;
      p.m.emissive.setRGB(0.5 * p.on + 0.4 * p.sel, 0.35 * p.on + 0.3 * p.sel, 0.1 * p.on);
      p.aura.material.opacity = 0.1 + 0.4 * p.on + 0.3 * p.sel; p.aura.scale.setScalar(1.6 + 1.6 * p.sel);
      if (!reduced) { p.sign.rotation.y = t * 0.6 + p.phase; p.sign.position.y = 4.0 + Math.sin(t * 0.8 + p.phase) * 0.08; }
    });
    if (!reduced) { flame.scale.setScalar(2.4 + Math.sin(t * 7) * 0.12 + Math.sin(t * 3.1) * 0.1); fire.intensity = 9 + Math.sin(t * 6) * 1.2; }
  });
  return {
    view: { target: new THREE.Vector3(0, 2.0, 0), yaw: 0, pitch: 0.2, dist: 3.6, minPitch: -0.2, maxPitch: 1.1, minDist: 2.2, maxDist: 4.6 },
    api: { light(i, on = true) { if (pillars[i]) pillars[i].want = on ? 1 : 0; }, select(i) { picked = i; } },
  };
}

// ======================= The Crown: inner knowing =======================
// A ring of light above a still sea, under the stars.
function crown(scene, glow, pickables, tickers, reduced) {
  skyDome(scene, 0x02030c, 0x0a1030, 0x1e2650);
  starfield(scene, glow, 1600, 81, 0.6);
  scene.add(new THREE.HemisphereLight(0x8090ff, 0x050510, 0.35));
  const sea = new THREE.Mesh(new THREE.CircleGeometry(80, 64), new THREE.MeshStandardMaterial({ color: 0x0a1028, roughness: 0.08, metalness: 0.9 })); sea.rotation.x = -Math.PI / 2; scene.add(sea);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0.85 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 12, 96), ringMat); ring.position.y = 3.2; ring.rotation.x = Math.PI / 2; scene.add(ring);
  const jewels = []; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832, j = halo(glow, 0xfff2d0, 0.5, 0.9); j.position.set(Math.cos(a) * 1.6, 3.2, Math.sin(a) * 1.6); scene.add(j); jewels.push(j); }
  const heart = halo(glow, 0xffd890, 3, 0.5); heart.position.y = 3.2; scene.add(heart);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.6, 3.2, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); beam.position.y = 1.6; scene.add(beam);
  const reflection = halo(glow, 0xffd890, 4, 0.25); reflection.position.y = 0.02; scene.add(reflection);
  const hit = hitSphere("crown", 2.2, 3.2); scene.add(hit); pickables.push(hit);
  let g = 0.2, show = 0.2;
  tickers.push((t, dt) => {
    show += (g - show) * (1 - Math.pow(2, -dt / 0.5));
    heart.material.opacity = 0.3 + 0.6 * show; heart.scale.setScalar(2.4 + 2.6 * show); beam.material.opacity = 0.04 + 0.14 * show; reflection.material.opacity = 0.15 + 0.4 * show;
    if (!reduced) { ring.rotation.z = t * 0.12; jewels.forEach((j, i) => { const a = i / 12 * 6.2832 + t * 0.12; j.position.set(Math.cos(a) * 1.6, 3.2 + Math.sin(t + i) * 0.05, Math.sin(a) * 1.6); }); }
  });
  return {
    view: { target: new THREE.Vector3(0, 2.6, 0), yaw: 0, pitch: 0.38, dist: 8.5, minPitch: 0, maxPitch: 1.1, minDist: 5, maxDist: 16 },
    api: { glow(v) { g = Math.max(0, Math.min(1, v)); } },
  };
}

const BUILDERS = { kingdom, forest, architect, garden, stillness, sanctuary, cosmos, dreams, observatory, lab, flower, solids, hall, crown };
