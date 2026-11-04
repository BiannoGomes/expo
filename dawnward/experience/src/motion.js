// How Dawnward moves. Flow is the default (4 Nov 2026): the best of the three lab directions, plus continuity
// that modern browsers can draw (View Transitions), sheets you can pull down, and a tab bar that steps aside
// inside a practice. The lab directions stay switchable for comparison; Still turns the extra motion off.
//   flow   · DEFAULT. Living's critically damped springs for arrivals and touch, a card that becomes the
//            practice it opens (shared-element transition), a few pixels of art parallax away from text
//   now    · "Still": the minimum (state changes only)
//   calm   · A, calm cinematic: the place arrives first, then the words; ease-in-out, never an overshoot
//   living · B, living physics: everything answers your touch; critically damped springs, small distances,
//            and no bounce at all inside a practice
//   depth  · C, spatial depth: places come toward you out of the dark; the words appear once it has settled;
//            the art leans a few pixels with your hand or phone, and stops while you read
// Rules from the public-source research (docs/universe/motion-research.md, 2 Nov 2026), whose timings are
// starting points, not measurements of any app: acknowledge a touch within ~80 ms; reading text, Back and
// the tabs never drift; Apple names scaling and simulated depth as motion triggers, so prefers-reduced-motion
// turns every one of these off. Only animates a screen as it ARRIVES (never delays a click, never leaves
// content hidden at rest). Kept on this device only.
const KEY = "dw-motion";
export const PROFILES = [
  ["flow", "Flow"], ["calm", "Calm"], ["living", "Living"], ["depth", "Depth"], ["now", "Still"],
];
/** The lab directions, shown on the comparison pill; Flow and Still are settled choices and don't need it. */
export const LAB = ["calm", "living", "depth"];

/** A critically-damped-ish spring as a CSS linear() easing (the bounce of a real spring, no library). */
function spring({ stiffness = 170, damping = 15, mass = 1, steps = 48 } = {}) {
  const w0 = Math.sqrt(stiffness / mass), zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = w0 * Math.sqrt(Math.max(1e-6, 1 - zeta * zeta));
  const x = (t) => (zeta < 1 ? 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t)) : 1 - Math.exp(-w0 * t) * (1 + w0 * t));
  let end = 0.1; while (end < 4 && Math.abs(1 - x(end)) > 0.002) end += 0.05; // settle time, seconds
  const pts = Array.from({ length: steps + 1 }, (_, i) => +x((end * i) / steps).toFixed(4));
  return { easing: `linear(${pts.join(", ")})`, ms: Math.round(end * 1000) };
}
/** Every motion-lab animation is tagged, so tests (and the profiler) can tell it from the rest. */
const anim = (el, keys, opts) => el.animate(keys, { ...opts, id: "dw-motion" });
const supportsLinear = (() => { try { return CSS.supports("animation-timing-function", "linear(0, 1)"); } catch { return false; } })();

export function createMotion() {
  let profile = "flow";
  try { profile = localStorage.getItem(KEY) || "flow"; } catch {}
  if (!PROFILES.some(([k]) => k === profile)) profile = "flow";
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const off = () => profile === "now" || mq.matches;
  const SPR = spring({ stiffness: 420, damping: 41 }), SOFT = spring({ stiffness: 520, damping: 46 }); // ζ≈1: settles in ~250–450 ms, no bounce
  const ease = (s, fallback) => (supportsLinear ? s.easing : fallback);
  const apply = () => { document.documentElement.dataset.motion = mq.matches ? "reduced" : profile; };
  apply(); mq.addEventListener?.("change", apply);

  /** The pieces of a screen that arrive in sequence: headings first, then cards and rows. */
  const parts = (root) => [...root.querySelectorAll("h2, .s-title, .lead, .nextcard, .card, .row, .mission, .cw-btree, .wplanets, .planet, .gx, .becoming, .a-landing, .seg, .actions")]
    .filter((e) => e.offsetParent !== null && !e.closest("[hidden]")).slice(0, 14);

  const IO = "cubic-bezier(.65,0,.35,1)", OUT = "cubic-bezier(.16,1,.3,1)";
  function enter(root, kind = "place") {
    if (off() || !root || root.hidden) return;
    const els = parts(root), step = kind === "step";
    if (profile === "calm") {
      // A: the place dissolves in, then the words settle a few pixels; nothing overshoots
      anim(root, [{ opacity: 0 }, { opacity: 1 }], { duration: step ? 280 : 600, easing: IO });
      els.forEach((e, i) => anim(e, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
        { duration: 520, delay: (step ? 120 : 300) + i * 60, easing: OUT, fill: "backwards" }));
    } else if (profile === "living" || profile === "flow") {
      // B: arrivals have a little mass: 12 px up and a critically damped settle; inside a practice, just 6 px
      els.forEach((e, i) => anim(e, [{ opacity: 0, transform: step ? "translateY(6px)" : "translateY(12px) scale(.985)" }, { opacity: 1, transform: "none" }],
        { duration: SPR.ms, delay: i * 30, easing: ease(SPR, OUT), fill: "backwards" }));
    } else if (profile === "depth") {
      // C: the place approaches out of the dark (ease-in-out, no roll, no lens change), then the words appear
      // on a still plane once it has landed
      const travel = kind === "world" ? 1000 : step ? 420 : 760;
      anim(root, [{ opacity: 0, transform: "perspective(900px) translateZ(-120px)", filter: "blur(6px) brightness(.6)" },
        { opacity: 1, transform: "none", filter: "none" }], { duration: travel, easing: IO });
      els.forEach((e, i) => anim(e, [{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: travel * 0.7 + i * 40, easing: OUT, fill: "backwards" }));
    }
  }

  /** The signature moment: a finished practice releases one point of light that settles into Journey. */
  function star(from) {
    if (off() || !from) return;
    const tab = document.querySelector('#tabs [data-tab="journey"] svg') ?? document.querySelector('#tabs [data-tab="journey"]');
    if (!tab) return;
    const a = from.getBoundingClientRect(), b = tab.getBoundingClientRect();
    const x0 = a.left + Math.min(a.width, 200) / 2, y0 = a.top + a.height / 2, dx = b.left + b.width / 2 - x0, dy = b.top + b.height / 2 - y0;
    const s = document.createElement("div");
    s.className = "m-star"; s.setAttribute("aria-hidden", "true");
    s.style.left = `${x0 - 5}px`; s.style.top = `${y0 - 5}px`;
    document.body.append(s);
    const path = profile === "depth"
      ? [{ transform: "translate(0,0) scale(3)", opacity: 0, filter: "blur(3px)" }, { transform: "translate(0,0) scale(2)", opacity: 1, filter: "blur(0)", offset: 0.25 }, { transform: `translate(${dx}px,${dy}px) scale(.6)`, opacity: 1 }]
      : profile === "living" || profile === "flow"
        ? [{ transform: "translate(0,0) scale(0)", opacity: 0 }, { transform: "translate(0,-24px) scale(1.2)", opacity: 1, offset: 0.25 }, { transform: `translate(${dx}px,${dy}px) scale(.6)`, opacity: 1 }]
        : [{ transform: "translate(0,0) scale(.4)", opacity: 0 }, { transform: "translate(0,-12px) scale(1)", opacity: 1, offset: 0.3 }, { transform: `translate(${dx}px,${dy}px) scale(.6)`, opacity: 0.9 }];
    const springy = profile === "living" || profile === "flow";
    const fly = anim(s, path, { duration: profile === "depth" ? 1000 : springy ? 760 : 900, delay: 350, easing: IO, fill: "both" });
    fly.finished.then(() => {
      s.remove();
      // the Journey tab takes the light in: a glow (Calm), a damped settle (Living), a step toward you (Depth)
      anim(tab, springy ? [{ transform: "scale(1.18)" }, { transform: "scale(1)" }] : profile === "depth" ? [{ transform: "scale(1.12)", filter: "drop-shadow(0 0 6px #e8c37a)" }, { transform: "none", filter: "none" }] : [{ filter: "drop-shadow(0 0 8px #e8c37a)" }, { filter: "none" }],
        { duration: springy ? SOFT.ms : 700, easing: springy ? ease(SOFT, OUT) : IO });
    }).catch(() => s.remove());
  }

  // B: every press answers your finger: a quick squash, then a spring back
  addEventListener("pointerdown", (ev) => {
    if (off() || (profile !== "living" && profile !== "flow")) return;
    const b = ev.target.closest?.("button, .row, a[href]");
    if (!b || b.disabled) return;
    anim(b, [{ transform: "scale(1)" }, { transform: "scale(.97)" }], { duration: 70, easing: "ease-out", fill: "forwards" });
    const up = () => { anim(b, [{ transform: "scale(.97)" }, { transform: "scale(1)" }], { duration: SOFT.ms, easing: ease(SOFT, OUT), fill: "forwards" }); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); };
    addEventListener("pointerup", up); addEventListener("pointercancel", up);
  }, { passive: true });

  // C: the art leans with your hand (or your phone's tilt): a few pixels of parallax, damped
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const ART = "#closeup-img, .cw-btree-bg, .a-threshold, .un-art, #x-art img, .cw-hero img, .becoming img";
  const tick = () => {
    x += (tx - x) * 0.08; y += (ty - y) * 0.08;
    document.documentElement.style.setProperty("--lean-x", `${(x * 10).toFixed(2)}px`);
    document.documentElement.style.setProperty("--lean-y", `${(y * 8).toFixed(2)}px`);
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(tick) : 0;
  };
  const reading = () => document.body.dataset.place === "explore" || !!document.querySelector("dialog[open]");
  // Flow leans less than Depth (60%): enough to feel the depth, never enough to notice while reading
  const aim = (nx, ny) => { const k = profile === "flow" ? 0.6 : 1; if (off() || (profile !== "depth" && profile !== "flow") || reading()) { tx = 0; ty = 0; } else { tx = Math.max(-1, Math.min(1, nx)) * k; ty = Math.max(-1, Math.min(1, ny)) * k; } if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener("pointermove", (e) => aim((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1), { passive: true });
  addEventListener("deviceorientation", (e) => { if (e.gamma != null) aim(e.gamma / 30, (e.beta - 40) / 30); }, { passive: true });
  const style = document.createElement("style");
  style.textContent = `.m-star { position:fixed; z-index:70; width:10px; height:10px; border-radius:50%; pointer-events:none; background:radial-gradient(circle,#fff 0,#f4dca0 35%,rgba(232,195,122,0) 70%); box-shadow:0 0 14px 4px rgba(232,195,122,.55); }\n:root:is([data-motion="depth"], [data-motion="flow"]) :is(${ART}) { translate: calc(var(--lean-x, 0px) * -1) calc(var(--lean-y, 0px) * -1); transition: translate .1s linear; }`;
  document.head.append(style);

  /**
   * Continuity (Flow): the element you tapped becomes the heading of what it opens, with the View Transitions
   * API. Occasional moments only (opening a practice), never tabs. Falls back to a plain update.
   * @param from the element tapped (its title)  @param update async () => void  @param to () => the new heading
   */
  let morphing = false;
  async function morph(from, update, to) {
    if (off() || profile !== "flow" || morphing || typeof document.startViewTransition !== "function" || !from) return update();
    morphing = true;
    from.style.viewTransitionName = "dw-hero";
    try {
      const vt = document.startViewTransition(async () => {
        from.style.viewTransitionName = "";
        await update();
        const t = to?.(); if (t) t.style.viewTransitionName = "dw-hero";
      });
      await vt.updateCallbackDone;
      vt.finished.finally(() => { const t = to?.(); if (t) t.style.viewTransitionName = ""; morphing = false; });
    } catch { from.style.viewTransitionName = ""; morphing = false; }
  }

  // Sheets you can pull down (every direction but Still): drag the top of a sheet, let go past a third of its
  // height or with a quick flick, and it slides away; otherwise it springs back. Keyboard and Cancel still work.
  let drag = null;
  addEventListener("pointerdown", (e) => {
    const d = e.target.closest?.("dialog.sheetdlg[open]");
    if (!d || off() || e.button > 0) return;
    const r = d.getBoundingClientRect();
    if (e.clientY - r.top > 56 || e.target.closest("input, textarea, select, button, a, label")) return; // only the top strip
    drag = { d, y0: e.clientY, t0: performance.now(), dy: 0, h: r.height };
    d.style.transition = "none";
  }, { passive: true });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    drag.dy = Math.max(0, e.clientY - drag.y0) + Math.min(0, e.clientY - drag.y0) * 0.15; // rubber-band upward
    drag.d.style.transform = `translateY(${drag.dy}px)`;
  }, { passive: true });
  const release = () => {
    if (!drag) return;
    const { d, dy, t0, h } = drag; drag = null;
    const v = dy / Math.max(1, performance.now() - t0);
    if (dy > h / 3 || (dy > 24 && v > 0.11)) {
      anim(d, [{ transform: `translateY(${dy}px)` }, { transform: "translateY(100%)" }], { duration: 220, easing: "cubic-bezier(.32,.72,0,1)", fill: "forwards" })
        .finished.then(() => { d.style.transform = ""; d.style.transition = ""; d.close(); }).catch(() => d.close());
    } else {
      anim(d, [{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }], { duration: SOFT.ms, easing: ease(SOFT, OUT) })
        .finished.finally(() => { d.style.transform = ""; d.style.transition = ""; });
    }
  };
  addEventListener("pointerup", release, { passive: true });
  addEventListener("pointercancel", release, { passive: true });

  return {
    morph,
    get profile() { return profile; },
    set(p) { profile = p; try { p === "flow" ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, p); } catch {} apply(); document.documentElement.style.removeProperty("--lean-x"); document.documentElement.style.removeProperty("--lean-y"); },
    enter,
    star,
    get reduced() { return mq.matches; },
  };
}
