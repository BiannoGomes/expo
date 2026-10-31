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
export function buildWorld(kind, { host, reduced, onPick }) {
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
  const world = kind === "forest" ? forest(scene, glow, pickables, tickers, reduced) : kingdom(scene, glow, pickables, tickers, reduced);
  world.useCamera?.(camera);

  // ----- look around: drag to turn, pinch or wheel to come closer (Gravity damping) -----
  const view = { yaw: world.view.yaw, pitch: world.view.pitch, dist: world.view.dist };
  const want = { ...view };
  const pointers = new Map();
  let downAt = null, pinch0 = 0, idle = 0;
  const el = renderer.domElement;
  el.style.touchAction = "none";
  el.addEventListener("pointerdown", (e) => { el.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); downAt = { x: e.clientX, y: e.clientY }; idle = 0; world.hover?.(ndc(e)); if (pointers.size === 2) pinch0 = spread(); });
  el.addEventListener("pointermove", (e) => {
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
  el.addEventListener("pointerup", up); el.addEventListener("pointercancel", (e) => pointers.delete(e.pointerId));
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
    if (!reduced && idle > 2.5) want.yaw += dt * 0.035;            // Orbit: a slow turn when left alone
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
    lit: (id, on = true) => world.light(id, on),
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
