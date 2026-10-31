// Prototype B: Cinematic world transition, hub -> Mind.
// A spline camera path driven by a critically damped spring on progress, so
// the move can be reversed at any instant from wherever it is (no restart, no
// jump). Atmosphere thickens toward Mind's tone; the world title arrives on landing.
import { THREE, color, worlds, clamp, mix, easeInOutCubic, createRenderer, stars, planet, loop, reducedMotion } from "./common.js";

const host = document.getElementById("stage");
const { renderer, quality } = createRenderer(host);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x04060a, 0.004);
const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.05, 500);
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.fov = camera.aspect < 0.75 ? 48 : 36; camera.updateProjectionMatrix(); });
dispatchEvent(new Event("resize"));
const starField = stars(scene, 2600, [220, 380], [-170, -8]);
const loader = new THREE.TextureLoader();
const portrait = () => camera.aspect < 0.75;
const W = Object.fromEntries(worlds.map((w) => {
  const m = planet(w, loader);
  const kx = portrait() ? 0.45 : 1, ky = portrait() ? 1.35 : 1;
  m.position.set(w.pos[0] * kx, w.pos[1] * ky, w.pos[2]); scene.add(m);
  return [w.key, m];
}));
const mind = W.mind, mw = worlds.find((w) => w.key === "mind");

// the path: hub -> a sideways arc (Mind's identity) -> close orbit, looking at the world
const HUB = new THREE.Vector3(0, 0, -6);
const p0 = HUB.clone(), target = mind.position.clone();
// the world settles to the right on wide screens, leaving the left for its title
const close = target.clone().add(new THREE.Vector3(portrait() ? 0 : -mw.size * 0.62, portrait() ? -mw.size * 0.3 : -mw.size * 0.12, mw.size * 1.6));
const path = new THREE.CatmullRomCurve3([p0, new THREE.Vector3(-mw.size * 0.5, mw.size * 0.12, -16), new THREE.Vector3(mw.size * 0.1, -mw.size * 0.05, target.z + mw.size * 2.6), close], false, "centripetal", 0.5);
const lookHub = new THREE.Vector3(0, 0, -40), lookMind = target.clone().add(new THREE.Vector3(portrait() ? 0 : -mw.size * 0.62, portrait() ? -mw.size * 0.42 : -mw.size * 0.08, 0));
// fog and clear colour are not tone mapped: keep the tone very dark so the sky stays night
const fogHub = new THREE.Color(0x04060a), fogMind = new THREE.Color(0x070b14);

// progress spring: target 0 (hub) or 1 (Mind); travel time about 1.4 s (motion.tokens travel)
let p = 0, v = 0, goal = 0;
const OMEGA = 5.2;
const title = document.getElementById("title"), back = document.getElementById("back"), enter = document.getElementById("enter"), live = document.getElementById("live"), fade = document.getElementById("fade");
function setGoal(g) {
  goal = g;
  window.LAB && (window.LAB.lastInput = performance.now());
  if (reducedMotion()) { // no travel: a 200 ms cross-fade, then the destination
    fade.classList.add("on"); setTimeout(() => { p = g; v = 0; fade.classList.remove("on"); }, 200);
  }
  live.textContent = g ? "Entering Mind, the world of clarity." : "Back to your sky.";
  back.hidden = !g; enter.hidden = !!g;
  (g ? back : enter).focus({ preventScroll: true });
}
enter.addEventListener("click", () => setGoal(1));
back.addEventListener("click", () => setGoal(0));
addEventListener("keydown", (e) => { if (e.key === "Escape" && goal) setGoal(0); });
const ray = new THREE.Raycaster();
renderer.domElement.addEventListener("pointerdown", (e) => {
  // a tap during travel reverses it from where it is; a tap on Mind at the hub enters
  if (p > 0.02 && p < 0.98) return setGoal(goal ? 0 : 1);
  ray.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  if (!goal && ray.intersectObject(mind)[0]) setGoal(1);
});

const pos = new THREE.Vector3(), look = new THREE.Vector3();
const LAB = loop((dt, now) => {
  if (!reducedMotion()) { v += (OMEGA * OMEGA * (goal - p) - 2 * OMEGA * v) * dt; p += v * dt; }
  const e = clamp(p);
  path.getPointAt(easeInOutCubic(e), pos);
  look.lerpVectors(lookHub, lookMind, easeInOutCubic(clamp(e * 1.25)));
  camera.position.copy(pos); camera.lookAt(look);
  // atmosphere: the air thickens and takes Mind's tone mid-travel, then clears on arrival
  const mid = Math.sin(Math.PI * e);
  scene.fog.color.lerpColors(fogHub, fogMind, e); scene.fog.density = 0.004 + mid * 0.012 * (quality.tier === "low" ? 0.5 : 1);
  renderer.setClearColor(scene.fog.color, 1);
  starField.material.uniforms.uAlpha.value = 1 - mid * 0.5;
  Object.values(W).forEach((m) => { m.quaternion.copy(camera.quaternion); m.material.uniforms.uQuality.value = quality.tier === "low" ? 0 : 1; });
  // the other worlds step back so the eye goes where the camera goes
  Object.entries(W).forEach(([k, m]) => { m.material.uniforms.uOpacity.value = k === "mind" ? 1 : 1 - 0.75 * e; });
  title.style.opacity = String(clamp((e - 0.82) / 0.18)); title.style.transform = `translateY(${(1 - clamp((e - 0.82) / 0.18)) * 14}px)`;
  title.inert = e < 0.9;
  renderer.render(scene, camera);
}, quality);
LAB.ready = true; LAB.setGoal = setGoal; LAB.progress = () => p;
