// Prototype A: Holographic interface. The morning's three real steps as
// translucent cards in space: physical depth, light that follows the pointer,
// type rendered at 2x so it stays crisp, keyboard, swipe and screen-reader parity.
import { THREE, color, motion, clamp, mix, createRenderer, stars, loadFonts, loop, reducedMotion } from "./common.js";

const STEPS = [ // demonstration content, the app's Today copy
  { label: "One thing to train", title: "40 minutes of open-water prep", why: "your body keeps the promises your mind makes" },
  { label: "One thing to build", title: "Ship the first chapter to your editor", why: "the campaign turns on finished things" },
  { label: "One thing to experience", title: "Call your sister. Just to talk.", why: "the people closest get your tired self" },
];

const host = document.getElementById("stage");
const { renderer, quality } = createRenderer(host);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 400);
camera.position.set(0, 0, 6.2);
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.fov = camera.aspect < 0.75 ? 52 : 40; camera.updateProjectionMatrix(); });
dispatchEvent(new Event("resize"));
stars(scene);

const CW = 2.4, CH = 1.42, TEX = [1024, 606];
function cardTexture(s) {
  const c = document.createElement("canvas"); c.width = TEX[0]; c.height = TEX[1];
  const g = c.getContext("2d");
  g.fillStyle = "rgba(236,233,226,.62)"; g.font = '600 34px "Source Sans 3"'; g.fillText(s.label, 72, 112);
  g.fillStyle = color.ink; g.font = '400 66px "Source Serif 4"';
  // wrap the title in two lines at most
  const words = s.title.split(" "); let line = "", y = 230;
  for (const w of words) { const t = line ? `${line} ${w}` : w; if (g.measureText(t).width > 880) { g.fillText(line, 72, y); line = w; y += 80; } else line = t; }
  g.fillText(line, 72, y);
  g.fillStyle = "rgba(154,160,169,.95)"; g.font = '400 36px "Source Sans 3"'; g.fillText(s.why, 72, y + 96);
  g.fillStyle = "rgba(121,129,143,.9)"; g.font = '400 26px "Source Sans 3"'; g.fillText("Demonstration content", 72, TEX[1] - 56);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t;
}
const cardMat = (map) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uMap: { value: map }, uLight: { value: new THREE.Vector2(0.3, 0.7) }, uFocus: { value: 0 }, uAspect: { value: CW / CH }, uQ: { value: 1 } },
  vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position,1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; uniform sampler2D uMap; uniform vec2 uLight; uniform float uFocus; uniform float uAspect; uniform float uQ;
    float rr(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r; }
    void main(){
      vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
      float d = rr(p, vec2(uAspect * 0.5, 0.5) - 0.002, 0.09);
      float inside = 1.0 - smoothstep(-0.003, 0.003, d);
      float facing = clamp(dot(vN, vV), 0.0, 1.0);
      // glass: a cool translucent body, denser toward the edges like real glass seen at an angle
      vec3 body = vec3(0.07, 0.09, 0.13);
      float a = mix(0.42, 0.62, uFocus) + (1.0 - facing) * 0.2;
      // edge light: a thin rim whose hue drifts with the viewing angle (restrained, not rainbow)
      float rim = (1.0 - smoothstep(0.0, 0.012, abs(d))) * (0.45 + 0.55 * uFocus);
      vec3 rimC = mix(vec3(0.78, 0.84, 0.93), vec3(0.79, 0.66, 0.42), 0.5 + 0.5 * sin(facing * 3.0 + vUv.x * 2.0));
      // responsive light: a soft sheen that follows the pointer
      float sheen = uQ * exp(-12.0 * dot(vUv - uLight, vUv - uLight)) * 0.12 * (0.4 + 0.6 * uFocus);
      vec4 text = texture2D(uMap, vUv);
      vec3 col = body * a + vec3(sheen) + rimC * rim;
      col = mix(col, text.rgb, text.a * mix(0.55, 1.0, uFocus));
      gl_FragColor = vec4(col, inside * clamp(a + rim + text.a * 0.9, 0.0, 1.0));
      #include <colorspace_fragment>
    }`,
});

let focus = 2; // start on the step the story is about
const cards = [];
const live = document.getElementById("live"), list = document.getElementById("cards");

await loadFonts();
STEPS.forEach((s, i) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), cardMat(cardTexture(s)));
  m.userData = { i, x: 0, z: 0, ry: 0, f: 0, vx: 0 };
  scene.add(m); cards.push(m);
  const b = document.createElement("button"); b.type = "button";
  b.innerHTML = `<span>${s.label}</span>`; b.setAttribute("aria-label", `${s.label}: ${s.title}. ${s.why}.`);
  b.addEventListener("click", () => go(i)); list.appendChild(b);
});
// a soft pool of light behind the focused card (radial, never a hard rectangle)
const gc = document.createElement("canvas"); gc.width = gc.height = 256;
{ const g = gc.getContext("2d"), r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, "rgba(70,96,150,.55)"); r.addColorStop(1, "rgba(70,96,150,0)"); g.fillStyle = r; g.fillRect(0, 0, 256, 256); }
const glowTex = new THREE.CanvasTexture(gc); glowTex.colorSpace = THREE.SRGBColorSpace;
const glow = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.6), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5 }));
glow.position.z = -0.6; scene.add(glow);

function go(i) {
  focus = clamp(i, 0, STEPS.length - 1);
  [...list.children].forEach((b, j) => b.setAttribute("aria-current", j === focus ? "true" : "false"));
  live.textContent = `${STEPS[focus].label}: ${STEPS[focus].title}. ${focus + 1} of ${STEPS.length}.`;
}
go(focus);
addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") { e.preventDefault(); go(focus + 1); }
  if (e.key === "ArrowLeft") { e.preventDefault(); go(focus - 1); }
});
// swipe and click
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), ptrS = new THREE.Vector2();
let down = null;
renderer.domElement.addEventListener("pointerdown", (e) => { down = { x: e.clientX, t: performance.now() }; window.LAB && (window.LAB.lastInput = performance.now()); });
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!down) return; const dx = e.clientX - down.x; down = null;
  if (Math.abs(dx) > 40) return go(focus + (dx < 0 ? 1 : -1));
  ray.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  const hit = ray.intersectObjects(cards)[0]; if (hit) go(hit.object.userData.i);
});
addEventListener("pointermove", (e) => ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1));

// spring toward each card's slot: interruptible by construction (always from where it is)
const W = 9; // spring stiffness (omega)
const LAB = loop((dt) => {
  const rm = reducedMotion();
  ptrS.lerp(ptr, rm ? 1 : 1 - Math.pow(0.5, dt / 0.2));
  cards.forEach((m) => {
    const u = m.userData, k = u.i - focus;
    const tx = k * (camera.aspect < 0.75 ? 1.55 : 2.55), tz = -Math.abs(k) * 1.4, tr = -k * 0.42, tf = k === 0 ? 1 : 0;
    if (rm) { u.x = tx; u.z = tz; u.ry = tr; u.f = tf; }
    else {
      u.vx += (W * W * (tx - u.x) - 2 * W * u.vx) * dt; u.x += u.vx * dt;
      u.z += (tz - u.z) * (1 - Math.pow(0.5, dt / 0.12)); u.ry += (tr - u.ry) * (1 - Math.pow(0.5, dt / 0.12)); u.f += (tf - u.f) * (1 - Math.pow(0.5, dt / 0.15));
    }
    m.position.set(u.x, (camera.aspect < 0.75 ? 0.6 : 0) + Math.sin(performance.now() / 2400 + u.i) * (rm ? 0 : 0.02), u.z);
    m.rotation.set(-ptrS.y * 0.05 * u.f, u.ry + ptrS.x * 0.08 * u.f, 0);
    m.material.uniforms.uFocus.value = u.f;
    m.material.uniforms.uQ.value = quality.tier === "low" ? 0 : 1;
    m.material.uniforms.uLight.value.set(0.5 + ptrS.x * 0.45, 0.5 + ptrS.y * 0.45);
    m.renderOrder = Math.round(10 - Math.abs(k));
  });
  glow.position.x = cards[focus].userData.x;
  camera.position.x = rm ? 0 : ptrS.x * 0.25; camera.position.y = rm ? 0 : ptrS.y * 0.15; camera.lookAt(0, camera.aspect < 0.75 ? 0.6 : 0, 0);
  renderer.render(scene, camera);
}, quality);
LAB.ready = true; LAB.go = go;
