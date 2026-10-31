// Lab-only shared pieces for the three prototypes. Uses the installed three.js
// and the production tokens; nothing here is imported by the shipped site.
import * as THREE from "three";
import { color, motion, worlds } from "../../src/tokens.js";

export { THREE, color, motion, worlds };
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const easeInOutCubic = motion.ease.easeInOutCubic;
export const params = new URLSearchParams(location.search);
export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Quality tiers: high / standard / low (?quality= forces one). Starts high,
// steps down when 60-frame medians run slow; never steps back up mid-session.
export function createRenderer(host) {
  const r = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.setClearColor(color.void, 1);
  host.appendChild(r.domElement);
  window.__renderer = r; // read by the benchmark (draw calls, triangles)
  const q = { tier: params.get("quality") || "high", forced: params.has("quality"), dts: [] };
  const cap = () => (q.tier === "low" ? 1 : q.tier === "standard" ? 1.5 : 2);
  const size = () => { r.setPixelRatio(Math.min(devicePixelRatio, cap())); r.setSize(innerWidth, innerHeight); };
  size(); addEventListener("resize", size);
  q.sample = (dt) => {
    if (q.forced || q.tier === "low") return;
    q.dts.push(dt); if (q.dts.length < 60) return;
    const m = q.dts.sort((a, b) => a - b)[30]; q.dts = [];
    if (m > 50) q.tier = "low"; else if (m > 24) q.tier = q.tier === "high" ? "standard" : "low"; else return;
    document.documentElement.dataset.quality = q.tier; size(); q.onChange && q.onChange(q.tier);
  };
  document.documentElement.dataset.quality = q.tier;
  return { renderer: r, quality: q };
}

export function stars(scene, count = 1800, spread = [160, 260], z = [-140, -10], tint = color.ink) {
  let s = 7; const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const pos = new Float32Array(count * 3), sz = new Float32Array(count);
  for (let i = 0; i < count; i++) { pos[i * 3] = (rnd() - 0.5) * spread[0]; pos[i * 3 + 1] = (rnd() - 0.5) * spread[1]; pos[i * 3 + 2] = mix(z[0], z[1], rnd()); sz[i] = 0.4 + rnd() * rnd() * 1.6; }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTint: { value: new THREE.Color(tint) }, uPx: { value: devicePixelRatio }, uAlpha: { value: 1 } },
    vertexShader: `attribute float aSize; uniform float uPx; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = 1.6 * aSize * uPx * (60.0 / max(1.0, -mv.z)); }`,
    fragmentShader: `uniform vec3 uTint; uniform float uAlpha; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(uTint * a * a * uAlpha, 1.0); }`,
  });
  const p = new THREE.Points(g, m); scene.add(p); return p;
}

export async function loadFonts() {
  const faces = [
    new FontFace("Source Serif 4", "url(../fonts/source-serif-4-latin-400-normal.woff2)"),
    new FontFace("Source Serif 4", "url(../fonts/source-serif-4-latin-400-italic.woff2)", { style: "italic" }),
    new FontFace("Source Sans 3", "url(../fonts/source-sans-3-latin-400-normal.woff2)"),
    new FontFace("Source Sans 3", "url(../fonts/source-sans-3-latin-600-normal.woff2)", { weight: "600" }),
  ];
  await Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff)).catch(() => {})));
}

// The production planet look: the app's art with a silhouette-hugging atmosphere.
export function planet(w, loader) {
  const t = loader.load(`../assets/img/${w.key}.webp`); t.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uMap: { value: t }, uOpacity: { value: 1 }, uTint: { value: new THREE.Color(w.look.rim) }, uLight: { value: new THREE.Vector2(...w.look.light).normalize() }, uR: { value: w.look.reach }, uGlow: { value: w.look.glow }, uLimb: { value: w.look.limb }, uQuality: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec2 vUv; uniform sampler2D uMap; uniform float uOpacity; uniform vec3 uTint; uniform vec2 uLight; uniform float uR; uniform float uGlow; uniform float uLimb; uniform float uQuality;
      void main(){ vec4 c = texture2D(uMap, vUv); float halo = 0.0, inner = 1.0;
        if (uQuality > 0.5) { inner = 0.0; for (int i = 0; i < 8; i++) { float an = float(i) * 0.7854; vec2 d = vec2(cos(an), sin(an));
          halo += texture2D(uMap, vUv + d * uR).a * (0.35 + 0.65 * max(dot(-d, uLight), 0.0)); inner += texture2D(uMap, vUv + d * uR * 0.35).a; } halo /= 8.0; inner /= 8.0; }
        float outside = halo * (1.0 - c.a); float limb = c.a * (1.0 - inner) * uLimb;
        vec3 rgb = c.rgb * c.a + uTint * (limb + outside * uGlow); float a = clamp(c.a + outside * uGlow * 0.85, 0.0, 1.0);
        gl_FragColor = vec4(rgb / max(a, 1e-3), a * uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  m.scale.setScalar(w.size); m.userData.key = w.key; return m;
}

// Frame clock with a measured history, exposed for the benchmark (window.LAB).
export function loop(fn, quality) {
  const LAB = (window.LAB = { frames: [], ready: false });
  let prev = performance.now(), raf = 0;
  const tick = (now) => {
    const dt = now - prev; prev = now;
    LAB.frames.push(dt); if (LAB.frames.length > 600) LAB.frames.shift();
    quality && quality.sample(dt);
    fn(Math.min(0.1, dt / 1000), now);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else { prev = performance.now(); raf = requestAnimationFrame(tick); } });
  return LAB;
}
