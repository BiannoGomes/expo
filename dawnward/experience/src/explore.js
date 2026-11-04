// Explore: the Discovery Galaxy as a list, and the quest player. The rules come
// from @dawnward/core, the same engine the server runs; without an account the
// state is kept on this device, with an account it goes through the API.
// Progress is discoveries only (owner decision): no XP, levels or scores.
import { ART, artPath } from "./registry.js";
import { reminderSheet } from "./remind.js";
import {
  MISSIONS,
  SYSTEMS,
  LAB,
  canPlay,
  answerStep,
  beginAttempt,
  completeAttempt,
  describeDiscovery,
  discoveriesFrom,
  missionById,
  plannedAction,
  validateAnswer,
  sortItems,
} from "../../packages/core/src/expeditions/index.ts";

const KEY = "dw-expeditions-v1";

/** The same calls, kept on this device. Every write is read back before it counts. */
export function localStore(device) {
  const empty = () => ({ attempts: {}, experiments: [], events: [], discoveries: [], gameLayer: true, following: [], plan: "free" });
  let s = Object.assign(empty(), device.read(KEY, {}));
  const id = (p) => `${p}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  const keep = () => device.write(KEY, s);
  const progress = (events) => {
    const fresh = [];
    for (const e of events) if (!s.events.some((x) => x.kind === e.kind && x.ref === e.ref)) s.events.push({ ...e, at: new Date().toISOString() });
    for (const d of discoveriesFrom(s.events)) if (!s.discoveries.some((x) => x.key === d.key)) { const full = { ...d, discoveredAt: new Date().toISOString() }; s.discoveries.push(full); fresh.push({ ...full, ...describeDiscovery(full) }); }
    return fresh;
  };
  const tx = (fn) => { const before = JSON.stringify(s); const out = fn(); if (!keep()) { s = JSON.parse(before); return { error: "I couldn't keep that on this device. Your words are still here." }; } return out; };
  return {
    local: true,
    async load() {
      return { attempts: Object.values(s.attempts), experiments: s.experiments, discoveries: s.discoveries.map((d) => ({ ...d, ...describeDiscovery(d) })), gameLayer: s.gameLayer, following: [...(s.following ?? [])], plan: s.plan ?? "free" };
    },
    async begin(missionId) {
      const m = missionById(missionId);
      const open = s.attempts[missionId];
      if (open && (open.status === "in_progress" || open.status === "paused")) return tx(() => { open.status = "in_progress"; return { ...open }; });
      return tx(() => { const a = beginAttempt(m, id("att")); s.attempts[missionId] = a; return { ...a }; });
    },
    async answer(attempt, stepIndex, answer) {
      const m = missionById(attempt.missionId);
      const r = answerStep(m, s.attempts[attempt.missionId] ?? attempt, stepIndex, answer);
      if ("error" in r) return r;
      return tx(() => { s.attempts[attempt.missionId] = r.attempt; return { attempt: { ...r.attempt } }; });
    },
    async complete(attempt) {
      const m = missionById(attempt.missionId);
      const current = s.attempts[attempt.missionId] ?? attempt;
      if (current.status === "completed") return { attempt: current, discoveries: [], experiment: null };
      const r = completeAttempt(m, current);
      if ("error" in r) return r;
      return tx(() => {
        s.attempts[attempt.missionId] = { ...r.attempt, completed_at: new Date().toISOString() }; // "Your week" counts it
        const events = [...r.events];
        const plan = plannedAction(m, r.attempt);
        let experiment = null;
        if (plan) {
          experiment = { id: id("exp"), attempt_id: r.attempt.id, world: m.world, action: plan.action, when_text: plan.when, status: "planned", outcome: null, created_at: new Date().toISOString() };
          s.experiments.unshift(experiment);
          events.push({ kind: "experiment_planned", ref: `experiment:${m.world}:${experiment.id}:planned` });
        }
        return { attempt: r.attempt, discoveries: progress(events), experiment };
      });
    },
    async exit(attempt) { return tx(() => { const a = s.attempts[attempt.missionId]; if (a && a.status === "in_progress") a.status = "paused"; return a; }); },
    async review(experimentId, outcome, text) {
      const ex = s.experiments.find((x) => x.id === experimentId);
      if (!ex) return { error: "I can't find that action." };
      if (ex.status === "reviewed") return { reviewed: true, discoveries: [] };
      return tx(() => {
        Object.assign(ex, { status: "reviewed", outcome, review: text, reviewed_at: new Date().toISOString() });
        return { reviewed: true, discoveries: progress([{ kind: "experiment_reviewed", ref: `experiment:${ex.world}:${ex.id}:reviewed` }]) };
      });
    },
    async setGameLayer(on) { return tx(() => { s.gameLayer = on; return { gameLayer: on }; }); },
    /** Member preview, on this device only: no payment exists yet, so this only lets Bianno see members' content. */
    async setPlan(plan) { return tx(() => { s.plan = plan; return { plan }; }); },
    async follow(systemId, on) {
      return tx(() => { const f = (s.following ?? []).filter((x) => x.systemId !== systemId); if (on) f.push({ systemId, since: new Date().toISOString() }); s.following = f; return { following: on }; });
    },
    noteReflection(recordId) { return tx(() => ({ discoveries: progress([{ kind: "reflection_saved", ref: `record:${recordId}` }]) })); },
    wipe() { s = empty(); return device.remove(KEY); },
    snapshot() { return JSON.parse(JSON.stringify(s)); },
  };
}

/** The same calls, through the Dawnward API. */
export function remoteStore(call) {
  const post = (url, body) => call(url, { method: "POST", body: JSON.stringify(body ?? {}) });
  const wrap = async (p) => { try { return await p; } catch (e) { return { error: e.status === 403 ? "Dawnward needs your consent first. Open the app to give it." : "I couldn't save that just now. Your words are still here; try again.", status: e.status }; } };
  return {
    local: false,
    async load() {
      const r = await call("/expeditions");
      return { attempts: r.attempts, experiments: r.experiments, discoveries: r.discoveries, gameLayer: r.gameLayer, following: r.following ?? [], plan: r.plan ?? "free" };
    },
    begin: (missionId) => wrap(post("/attempts", { missionId })),
    answer: async (attempt, stepIndex, answer) => { const r = await wrap(post(`/attempts/${attempt.id}/answer`, { stepIndex, answer })); return r.error || r.crisis ? r : { attempt: r }; },
    complete: (attempt) => wrap(post(`/attempts/${attempt.id}/complete`)),
    exit: (attempt) => wrap(post(`/attempts/${attempt.id}/exit`)),
    review: (experimentId, outcome, text) => wrap(post(`/experiments/${experimentId}/review`, { outcome, text })),
    follow: (systemId, on) => wrap(call(`/enrollments/${encodeURIComponent(systemId)}`, { method: on ? "PUT" : "DELETE" })),
    setGameLayer: (on) => wrap(call("/preferences/game-layer", { method: "PUT", body: JSON.stringify({ on }) })),
    noteReflection() { return { discoveries: [] }; },
    wipe() { return true; },
  };
}

/**
 * The Explore view and quest player. `h` holds the page's helpers:
 * { $, el, svg, ICON, META, announce, quiet, longDate, sound, distress, crisisText, showPlace, onDiscoveries, goHomeWith }
 */
/** Beta: everything open on the phone (no membership talk) until membership is real. */
export const BETA_ALL_OPEN = true;

export function createExplore(store, h) {
  const { $, el, svg, ICON, META } = h;
  let data = { attempts: [], experiments: [], discoveries: [], gameLayer: true, following: [], plan: "free" };
  // The beta, on the phone: every chapter, world and pack is open, and nothing mentions a plan.
  // The membership code stays for later (council verdict, docs/blueprint/2026-11-04-user-council.md).
  const planNow = () => (store.local && BETA_ALL_OPEN ? "pro" : data.plan ?? "free");
  const gateOf = (m) => canPlay(m, planNow(), data.attempts);
  const locked = (m) => !gateOf(m).ok;
  const isFollowing = (systemId) => (data.following ?? []).some((f) => f.systemId === systemId);
  async function follow(systemId, on) {
    const r = await store.follow(systemId, on);
    if (r?.error) { h.announce(r.error); return false; }
    await refresh();
    h.announce(on ? `Following ${SYSTEMS.find((x) => x.id === systemId)?.title}. Home will suggest its next chapter.` : "Stopped following. Nothing is lost.");
    return true;
  }
  const followButton = (sys, after) => el("button", { class: "ghost follow", "aria-pressed": String(isFollowing(sys.id)), onclick: async () => { if (await follow(sys.id, !isFollowing(sys.id))) after(); } },
    isFollowing(sys.id) ? "Following · stop" : "Follow this expedition");
  const body = () => $("x-body");
  const attemptFor = (missionId) => data.attempts.find((a) => a.missionId === missionId && a.status !== "abandoned");
  const DRAFT = (a, step) => `dw-qdraft-${a.id}-${step}`;

  async function refresh() { try { data = await store.load(); } catch { /* keep what we had */ } return data; }

  function head(title, sub, back) {
    return [
      h.crumbs([{ label: "Learn", root: true }]),
      back ? el("button", { class: "text-btn back", onclick: back }, el("span", { html: svg(ICON.back, 16) }), " Learn") : null,
      el("h2", { class: "s-title", id: "x-title", tabindex: "-1" }, title),
      sub ? el("p", { class: "quiet" }, sub) : null,
    ].filter(Boolean);
  }

  /** What to do next: what you're in the middle of, else the first open practice you haven't finished. */
  function featured(going) {
    const a = going[0];
    if (a && missionById(a.missionId)) return { m: missionById(a.missionId), a };
    const done = (id) => data.attempts.some((x) => x.missionId === id && x.status === "completed");
    for (const sys of SYSTEMS) for (const id of sys.missionIds) { const m = missionById(id); if (m && !done(id) && !locked(m) && !h.missionLock?.(m)) return { m, a: null }; }
    return null;
  }
  function featureCard({ m, a }) {
    const n = m.steps.length, at = a ? Math.min(a.step + 1, n) : 0;
    return el("section", { class: "nextcard x-feature", "aria-labelledby": "x-feat" },
      el("h3", { class: "c-title", id: "x-feat" }, m.title),
      el("p", { class: "c-part" }, `${META[m.world].name} · ${m.part.replace(/^Chapter \d+: /, "")}`),
      a ? el("div", { class: "lockbar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(n), "aria-valuenow": String(at), "aria-label": `${at} of ${n}` }, el("span", { style: `width:${Math.round((at / n) * 100)}%` })) : null,
      el("button", { class: "primary wide", onclick: () => play(m.id) }, a ? `Continue · ${at} of ${n}` : `Begin · ${m.minutes} min`));
  }

  // ----- the Discovery Galaxy, as a list that works without any 3D -----
  async function open() {
    h.showPlace("explore");
    setArt(null);
    await refresh();
    draw();
    $("x-title")?.focus();
  }
  function draw() {
    document.body.classList.remove("in-practice");
    setArt(null);
    // Learn's own heading, once; then one featured next step (the only gold button), then everything else
    const kids = [el("h2", { class: "s-title", id: "x-title", tabindex: "-1" }, "Learn"), el("p", { class: "quiet" }, "Explore. Practise. Grow.")];
    const going = data.attempts.filter((a) => a.status === "in_progress" || a.status === "paused");
    const feat = featured(going);
    if (feat) kids.push(featureCard(feat));
    const others = going.filter((a) => a.missionId !== feat?.m.id);
    if (others.length) {
      kids.push(el("section", { class: "group", "aria-labelledby": "x-cont" }, el("h3", { id: "x-cont" }, "Pick up where you left off"),
        ...others.map((a) => { const m = missionById(a.missionId); return el("button", { class: "row", onclick: () => play(m.id) },
          el("span", { class: "ricon", html: svg(ICON[m.world], 22) }),
          el("span", { class: "rtext" }, el("span", { class: "rtitle" }, `${m.title}, ${m.part}`), el("span", { class: "rsub" }, `${Math.min(a.step + 1, m.steps.length)} of ${m.steps.length}`)),
          el("span", { class: "rgo", html: svg(ICON.arrow, 16) })); })));
    }
    const waiting = data.experiments.filter((x) => x.status === "planned");
    if (waiting.length) {
      kids.push(el("section", { class: "group", "aria-labelledby": "x-wait" }, el("h3", { id: "x-wait" }, "Waiting to hear how it went"),
        ...waiting.map((x) => el("button", { class: "row", onclick: () => review(x.id) },
          el("span", { class: "ricon", html: svg(ICON[x.world] ?? ICON.soul, 22) }),
          el("span", { class: "rtext" }, el("span", { class: "rtitle" }, x.action), el("span", { class: "rsub" }, `You planned: ${x.when_text}`)),
          el("span", { class: "rgo", html: svg(ICON.arrow, 16) })))));
    }
    // each series: where you are, and ONE clear next chapter; every chapter is one tap away under "All chapters"
    for (const sys of SYSTEMS) {
      const ms = sys.missionIds.map(missionById);
      const isDone = (m) => data.attempts.some((x) => x.missionId === m.id && x.status === "completed");
      const cur = ms.find((m) => !isDone(m)), d = ms.filter(isDone).length, series = sys.kind === "expedition";
      const rowFor = (m, primaryRow) => {
        const a = attemptFor(m.id), done = isDone(m);
        const pl = !done && h.missionLock?.(m), lock = !done && !a && !pl && locked(m);
        // only the chapter you're on says "Continue"; another one you opened says "Started"
        const state = done ? "✦ Done" : pl ? "Opens later" : lock ? "Plus" : a ? (primaryRow ? `Continue · step ${Math.min(a.step + 1, m.steps.length)} of ${m.steps.length}` : "Started") : `${m.minutes} min`;
        return el("li", {}, el("button", { class: `mission${done ? " done" : ""}${lock || pl ? " locked" : ""}${primaryRow ? " current" : ""}`, onclick: () => play(m.id), "aria-label": `${m.title}, ${m.part}. ${m.objective} ${pl ? `Opens when you: ${pl.need}` : lock ? "Part of Dawnward Plus." : `${state.replace("✦ ", "")}.`}` },
          el("span", { class: "rtext" }, el("span", { class: "rtitle" }, series ? m.part : m.title), el("span", { class: "rsub" }, m.objective),
            el("span", { class: "mmeta mline" }, state)),
          el("span", { class: "rgo", html: svg(ICON.arrow, 16) })));
      };
      kids.push(el("section", { class: "group system", "aria-labelledby": `x-${sys.id}` },
        ART.systems[sys.id] ? el("img", { class: "sys-planet", src: h.asset(artPath(ART.systems[sys.id])), alt: "" }) : null,
        el("h3", { id: `x-${sys.id}`, class: "sys-title" }, sys.title),
        el("p", { class: "sys-meta" }, `${META[sys.world].name}${series ? ` · ${ms.length} chapters${d ? ` · ${d} done` : ""}` : ""}`),
        el("p", { class: "quiet" }, sys.objective),
        series ? el("div", { class: "actions" }, followButton(sys, () => { draw(); body().querySelector(`[aria-labelledby="x-${sys.id}"] .follow`)?.focus(); })) : null,
        series
          ? [cur ? el("ul", { class: "missions" }, rowFor(cur, true)) : el("p", { class: "quiet" }, `All ${ms.length} chapters done.`),
             el("details", { class: "more" }, el("summary", {}, `All ${ms.length} chapters`), el("ul", { class: "missions" }, ms.map((m) => rowFor(m, false)))),
             // the worksheets, reachable any time (not only at a chapter's start or end)
             ms.some((m) => m.worksheet && !locked(m)) ? el("div", { class: "ws-links" }, el("p", { class: "quiet small" }, "Worksheets to fill in"),
               ...ms.filter((m) => m.worksheet && !locked(m)).map((m) => el("button", { class: "text-btn", onclick: () => worksheet(m, () => { draw(); $("x-title")?.focus(); }) }, m.worksheet.title))) : null]
          : el("ul", { class: "missions" }, ms.map((m) => rowFor(m, false)))));
    }
    kids.push(el("section", { class: "group", "aria-labelledby": "x-lib" }, el("h3", { id: "x-lib" }, "Library"),
      el("button", { class: "row", onclick: () => h.openLibrary?.() },
        el("span", { class: "rtext" }, el("span", { class: "rtitle" }, "Lessons, audio & films"), el("span", { class: "rsub" }, "From Bianno")),
        el("span", { class: "rgo", html: svg(ICON.arrow, 16) }))));
    body().replaceChildren(...kids);
  }

  // ----- the quest player: one step at a time, saved before it moves on -----
  let current = null; // { mission, attempt, from }
  // Where Back leads: Explore by default, or the world the mission was opened from.
  let from = null; // { label, go, trail }
  async function play(missionId, opts = {}) {
    from = opts.from ?? null;
    const m = missionById(missionId);
    h.showPlace("explore");
    body().replaceChildren(el("p", { class: "quiet", role: "status" }, "Opening…"));
    await refresh();
    const pl = h.missionLock?.(m);
    if (pl) { // the path comes first: it opens by doing, never by paying
      body().replaceChildren(...head(m.title, null, back), el("p", { class: "lead" }, m.objective), h.lockCard(pl),
        el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => { from = null; h.goNext(pl.next); } }, h.nextLabel(pl.next)), el("button", { class: "ghost", onclick: back }, "Back")));
      body().querySelector(".s-title")?.focus();
      return;
    }
    if (locked(m)) { gate(m); return; }
    const r = await store.begin(m.id);
    if (r.status === 402) { await refresh(); gate(m); return; }
    if (r.error) { body().replaceChildren(...head(m.title, null, back), el("p", { class: "error", role: "alert" }, r.error)); return; }
    current = { mission: m, attempt: r };
    await refresh();
    show(Math.min(r.step, m.steps.length - 1));
  }
  async function back() {
    if (current && current.attempt.status === "in_progress") { const r = await store.exit(current.attempt); if (r && !r.error) h.announce("Your place is kept."); }
    current = null; h.quiet(false); await refresh();
    if (from) { const f = from; from = null; f.go(); return; }
    draw(); $("x-title")?.focus();
  }

  // The chapter's art: its scene behind the opening and the ending, a softer backdrop behind
  // practice and writing. Decorative only (alt=""), and never under text without a dark veil.
  function setArt(m, step) {
    const a = m?.id === "review" ? { hero: ART.review } : ART.missions[m?.id] ?? {}, type = step?.type;
    const code = !m ? null : a.steps?.[step?.id] ?? (["intro", "lesson", "close"].includes(type) ? a.hero : ["rehearse", "reflect", "plan"].includes(type) ? a.reflect ?? a.exercise : a.exercise ?? a.hero);
    const box = $("x-art");
    if (!code) { box.hidden = true; $("explore").dataset.art = ""; look.on(false); return; }
    const src = h.asset(artPath(code));
    const img = box.querySelector("img");
    if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    box.hidden = false;
    $("explore").dataset.art = ["intro", "close"].includes(type) || a.scene?.includes(step?.id) ? "scene" : "dim";
    look.on($("explore").dataset.art === "scene");
  }
  // Look around: the scene leans gently toward the pointer or the phone's tilt (Gravity: damped, half-life 0.32 s).
  // Off under reduced motion, and off whenever no scene is showing.
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const look = (() => {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, last = 0, active = false;
    const aim = (nx, ny) => { tx = Math.max(-1, Math.min(1, nx)); ty = Math.max(-1, Math.min(1, ny)); };
    const onPointer = (e) => aim((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    const onTilt = (e) => { if (e.gamma != null) aim(e.gamma / 25, (e.beta - 45) / 25); };
    const step = (now) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      const k = 1 - Math.pow(2, -dt / 0.32);
      x += (tx - x) * k; y += (ty - y) * k;
      $("x-art").style.transform = `translate3d(${(-x * 14).toFixed(1)}px, ${(-y * 10).toFixed(1)}px, 0) scale(1.05)`;
      raf = active ? requestAnimationFrame(step) : 0;
    };
    return { on(want) {
      const go = want && !reduce();
      if (go === active) return;
      active = go;
      if (go) { addEventListener("pointermove", onPointer); addEventListener("deviceorientation", onTilt); last = 0; raf = requestAnimationFrame(step); }
      else { removeEventListener("pointermove", onPointer); removeEventListener("deviceorientation", onTilt); cancelAnimationFrame(raf); $("x-art").style.transform = ""; }
    } };
  })();

  // ----- the passage: through the gateway in one Revelation beat (2.6 s), always skippable -----
  function passage(m, done) {
    const still = reduce();
    const src = h.asset(artPath(ART.missions[m.id]?.passage ?? "B3"));
    const canvas = el("canvas", { class: "streaks", "aria-hidden": "true" });
    const skip = el("button", { class: "ghost skip-pass" }, "Skip");
    const ov = el("div", { id: "passage", role: "dialog", "aria-modal": "true", "aria-label": "Passing through the gateway", class: still ? "still" : "" },
      el("div", { class: "tunnel", "aria-hidden": "true" }, [0, 1, 2, 3].map((k) => el("img", { src, alt: "", class: "ring", style: `--k:${k}` }))),
      canvas, el("div", { class: "flash", "aria-hidden": "true" }), skip);
    document.body.append(ov);
    const anims = [];
    let ended = false, raf = 0;
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); end(); } };
    const onPointer = (e) => { ov.style.setProperty("--ox", `${(e.clientX / innerWidth) * 100}%`); ov.style.setProperty("--oy", `${(e.clientY / innerHeight) * 100}%`); };
    function end() {
      if (ended) return; ended = true;
      anims.forEach((a) => a.cancel()); cancelAnimationFrame(raf);
      removeEventListener("keydown", onKey, true); removeEventListener("pointermove", onPointer);
      ov.classList.add("out");
      setTimeout(() => ov.remove(), still ? 200 : 420);
      done();
    }
    skip.addEventListener("click", end);
    addEventListener("keydown", onKey, true);
    skip.focus();
    h.announce("Passing through the gateway.");
    if (still) { setTimeout(end, 1400); return; }   // Revelation, reduced: a 400 ms cross-fade, no travel
    addEventListener("pointermove", onPointer);
    h.sound?.rise?.(2.6);
    const D = 2600, curve = "cubic-bezier(0.65, 0, 0.35, 1)";
    ov.querySelectorAll(".ring").forEach((r, k) => anims.push(r.animate([
      { transform: `translate(-50%, -50%) translateZ(-1800px) rotate(${k * 47}deg)`, opacity: 0 },
      { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.75 },
      { transform: `translate(-50%, -50%) translateZ(560px) rotate(${k * 47 + 110}deg)`, opacity: 0 },
    ], { duration: D / 2, delay: (k * D) / 8, easing: "linear", fill: "both" })));
    anims.push(ov.querySelector(".tunnel").animate([{ transform: "rotate(0deg) scale(1)" }, { transform: "rotate(-40deg) scale(1.15)" }], { duration: D, easing: curve, fill: "both" }));
    anims.push(ov.querySelector(".flash").animate([{ opacity: 0 }, { opacity: 0, offset: 0.78 }, { opacity: 0.95, offset: 0.93 }, { opacity: 0 }], { duration: D + 300, easing: "ease-out", fill: "both" }));
    // streaks of light rushing outward, faster as the passage deepens
    const ctx2 = canvas.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    const cols = ["#E6C07B", "#C9B8FF", "#9B5BFF", "#37D5E8", "#FFF3D6"];
    const P = Array.from({ length: innerWidth < 600 ? 140 : 260 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random() * 0.4, v: 0.25 + Math.random() * 0.75, c: cols[(Math.random() * cols.length) | 0] }));
    const t0 = performance.now();
    const draw = (now) => {
      const p = Math.min(1, (now - t0) / D), sp = 0.004 + 0.05 * p * p;
      const W = canvas.width, H = canvas.height, cx = (parseFloat(ov.style.getPropertyValue("--ox")) || 50) / 100 * W, cy = (parseFloat(ov.style.getPropertyValue("--oy")) || 50) / 100 * H, R = Math.hypot(W, H) / 2;
      ctx2.clearRect(0, 0, W, H); ctx2.lineCap = "round";
      for (const s of P) {
        const r0 = s.r * R, r1 = r0 + (8 + 220 * p) * s.v * dpr;
        ctx2.strokeStyle = s.c; ctx2.globalAlpha = Math.min(1, s.r * 2.2) * (0.35 + 0.65 * p); ctx2.lineWidth = (0.6 + 1.6 * s.r) * dpr;
        ctx2.beginPath(); ctx2.moveTo(cx + Math.cos(s.a) * r0, cy + Math.sin(s.a) * r0); ctx2.lineTo(cx + Math.cos(s.a) * r1, cy + Math.sin(s.a) * r1); ctx2.stroke();
        s.r += sp * s.v; if (s.r > 1.05) { s.r = Math.random() * 0.08; s.a = Math.random() * Math.PI * 2; }
      }
      if (p < 1 && !ended) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    setTimeout(end, D + 200);
  }
  function frame(m, i, ...kids) {
    setArt(m, m.steps[i]);
    // focus mode (user council, 4 Nov 2026): inside a practice there's one way out and no tab bar
    document.body.classList.add("in-practice");
    body().replaceChildren(
      el("div", { class: "qhead" },
        el("button", { class: "text-btn back", onclick: back, "aria-label": `Close, back to ${from?.label ?? "Learn"}` }, el("span", { html: svg(ICON.back, 16) }), ` ${from?.label ?? "Learn"}`),
        el("p", { class: "kicker" }, `${META[m.world].name} · ${m.part}`),
        el("p", { class: "qpos", role: "img", "aria-label": `Step ${i + 1} of ${m.steps.length}` }, ...m.steps.map((_, k) => el("span", { class: k < i ? "on" : k === i ? "here" : "" })))),
      ...kids.filter(Boolean));
    body().querySelector(".s-title")?.focus();
    $("explore").scrollTop = 0;
    h.motion?.enter(body(), "step");
  }

  function show(i) {
    const { mission: m, attempt: a } = current;
    const step = m.steps[i];
    const prev = a.answers[step.id];
    const err = el("p", { class: "error", role: "alert" });
    const next = async (answer) => {
      err.textContent = "";
      const said = !answer ? "" : "text" in answer ? answer.text : "action" in answer ? `${answer.action} ${answer.when}` : "lab" in answer ? [...answer.lab.options, ...answer.lab.values].join(" ") : "";
      if (said && h.distress(said) && store.local) { crisis(h.crisisText); return; }
      const problem = answer ? validateAnswer(step, answer, a.answers) : null;
      if (problem) { err.textContent = problem; return; }
      const r = await store.answer(a, i, answer);
      if (r.crisis) { crisis(r.reply); return; }
      if (r.error) { err.textContent = r.error; return; }
      try { localStorage.removeItem(DRAFT(a, step.id)); } catch {}
      current.attempt = r.attempt;
      // keep the shared list in step too, so Home's "Continue · x of y" matches where you really are
      const k = data.attempts.findIndex((x) => x.id === r.attempt.id);
      if (k >= 0) data.attempts[k] = r.attempt;
      if (i + 1 < m.steps.length) show(i + 1); else finish();
    };
    const title = el("h2", { class: "s-title", tabindex: "-1" }, step.title);
    if (step.type === "intro") {
      h.quiet(false);
      frame(m, i, title, el("p", { class: "lead" }, step.body),
        el("p", { class: "quiet" }, `${m.objective} About ${m.minutes} min.`),
        m.worksheet ? el("p", { class: "quiet" }, "Includes a worksheet to print or keep: ", el("button", { class: "text-btn", onclick: () => worksheet(m, () => show(i)) }, m.worksheet.title)) : null,
        m.safetyNote ? el("p", { class: "quiet safety" }, m.safetyNote) : null,
        err, el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => next({ ack: true }) }, "Begin")));
      return;
    }
    if (step.type === "portal") {
      h.quiet(false);
      frame(m, i, title, el("p", { class: "lead" }, step.body), err,
        el("div", { class: "actions" },
          el("button", { class: "primary", onclick: () => passage(m, () => next({ ack: true })) }, "Open the gateway"),
          el("button", { class: "text-btn", onclick: () => next({ ack: true }) }, "Skip the passage")));
      return;
    }
    if (step.type === "lesson") {
      h.quiet(false);
      const canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
      let speaking = false;
      const listen = canSpeak ? el("button", { class: "ghost", "aria-pressed": "false", onclick: () => {
        speaking = !speaking; listen.setAttribute("aria-pressed", String(speaking)); listen.lastChild.textContent = speaking ? "Stop" : "Listen";
        speechSynthesis.cancel();
        if (speaking) { const u = new SpeechSynthesisUtterance([step.title, ...step.paragraphs].join(". ")); u.onend = () => { speaking = false; listen.setAttribute("aria-pressed", "false"); listen.lastChild.textContent = "Listen"; }; speechSynthesis.speak(u); }
      } }, el("span", { html: svg(ICON.listen, 16) }), el("span", {}, "Listen")) : null;
      const words = step.paragraphs.join(" ").split(/\s+/).length; // read at an unhurried 180 words a minute
      frame(m, i, title, el("p", { class: "quiet" }, `Lesson · about ${Math.max(1, Math.ceil(words / 180))} min to read`),
        el("div", { class: "lesson" }, step.paragraphs.map((t) => el("p", {}, t))),
        // the longer reading is there for anyone who wants it, one tap away, never in the way
        step.more?.length ? el("details", { class: "more lesson-more" }, el("summary", {}, "Why this works"), el("div", { class: "lesson" }, step.more.map((t) => el("p", {}, t)))) : null,
        err, el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => { if (canSpeak) speechSynthesis.cancel(); next({ ack: true }); } }, "Continue"), listen));
      return;
    }
    if (step.type === "pause") {
      h.quiet(false);
      const cues = step.cues;
      const total = cues.reduce((a, c) => a + c.seconds, 0);
      const cue = el("p", { class: "cue", "aria-live": "polite" }, "When you're ready, press Start.");
      const ring = el("div", { class: "pause-ring", "aria-hidden": "true" });
      const all = el("ol", { class: "cue-list", hidden: true }, cues.map((c) => el("li", {}, c.text)));
      let timer = null, k = -1;
      const stop = () => { clearTimeout(timer); timer = null; ring.classList.remove("on"); };
      const advance = () => {
        k++;
        if (k >= cues.length) { stop(); cue.textContent = "That's the minute. Notice how you are now, without judging it."; start.textContent = "Again"; return; }
        cue.textContent = cues[k].text;
        timer = setTimeout(advance, cues[k].seconds * 1000);
      };
      // one button: Start, Stop while it runs, Again when it's done
      const start = el("button", { class: "ghost", onclick: () => {
        if (timer) { stop(); cue.textContent = "Stopped. That's fine. Start again whenever you like, or continue."; start.textContent = "Start"; return; }
        k = -1; start.textContent = "Stop"; ring.classList.add("on"); advance();
      } }, "Start");
      const read = el("button", { class: "text-btn", "aria-expanded": "false", onclick: () => { all.hidden = !all.hidden; read.setAttribute("aria-expanded", String(!all.hidden)); read.textContent = all.hidden ? "Read the steps instead" : "Hide the steps"; } }, "Read the steps instead");
      frame(m, i, title, el("p", { class: "lead" }, step.body), el("p", { class: "quiet" }, `About ${Math.round(total / 60)} minute. You can stop at any moment.`),
        el("div", { class: "pause-box" }, ring, cue), el("div", { class: "actions" }, start, read), all,
        err, el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => { stop(); next({ ack: true }); } }, "Continue")));
      return;
    }
    if (step.type === "lab") {
      h.quiet(false);
      // Fields keep their own positions (3 options, 2 things that matter); empty ones are left out when saved.
      const blank = { options: ["", "", ""], values: ["", ""], marks: {} };
      let st = blank;
      if (prev && "lab" in prev) st = { options: [...prev.lab.options, "", ""].slice(0, 3), values: [...prev.lab.values, ""].slice(0, 2), marks: { ...prev.lab.marks } };
      else { try { st = { ...blank, ...JSON.parse(localStorage.getItem(DRAFT(a, step.id)) || "null") }; } catch { st = blank; } }
      const keepDraft = () => { try { localStorage.setItem(DRAFT(a, step.id), JSON.stringify(st)); } catch {} };
      const ex = step.examples ?? [];
      const MARK = [[1, "Helps"], [2, "Mixed"], [3, "Costs"]];
      const filled = (xs) => xs.map((t, i) => [t.trim(), i]).filter(([t]) => t);
      const gridBox = el("div", { class: "lab-grid" });
      const summary = el("div", { class: "explain", "aria-live": "polite" });
      const go = el("button", { class: "primary", disabled: true, onclick: () => {
        const os = filled(st.options), vs = filled(st.values), marks = {};
        os.forEach(([, oi], i) => vs.forEach(([, vj], j) => { marks[`${i}-${j}`] = st.marks[`${oi}-${vj}`]; }));
        next({ lab: { options: os.map(([t]) => t), values: vs.map(([t]) => t), marks } });
      } }, "Continue");
      const complete = () => { const os = filled(st.options), vs = filled(st.values); return os.length >= 2 && vs.length >= 1 && os.every(([, i]) => vs.every(([, j]) => st.marks[`${i}-${j}`])); };
      const update = () => {
        const done = complete(); go.disabled = !done;
        const os = filled(st.options), vs = filled(st.values), word = (v) => MARK.find(([n]) => n === v)?.[1] ?? "";
        summary.replaceChildren(...(done ? [el("p", { class: "outcome" }, "Your lab"),
          el("table", { class: "ws-table lab-sum" }, el("thead", {}, el("tr", {}, el("th", { scope: "col" }, "Option"), vs.map(([t]) => el("th", { scope: "col" }, t)))),
            el("tbody", {}, os.map(([t, i]) => el("tr", {}, el("th", { scope: "row" }, t), vs.map(([, j]) => el("td", { class: `m${st.marks[`${i}-${j}`]}` }, word(st.marks[`${i}-${j}`]))))))),
          el("p", { class: "quiet" }, step.feedback)] : []));
      };
      const grid = () => {
        const os = filled(st.options), vs = filled(st.values);
        gridBox.replaceChildren(...(os.length >= 2 && vs.length ? [el("p", { class: "lead" }, "Now weigh each option against what matters."),
          ...os.map(([t, i]) => el("fieldset", { class: "lab-opt" }, el("legend", {}, t),
            vs.map(([v, j]) => {
              const key = `${i}-${j}`;
              const group = el("div", { class: "seg sort-scale", role: "radiogroup", "aria-label": `${t}: ${v}` },
                MARK.map(([n, label]) => el("button", { role: "radio", "aria-checked": String(st.marks[key] === n), onclick: (e) => {
                  st.marks[key] = n; keepDraft();
                  group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b === e.currentTarget)));
                  update();
                } }, label)));
              return el("div", { class: "lens" }, el("p", { class: "lens-text" }, v), group);
            })))] : [el("p", { class: "quiet" }, "Write at least two options and one thing that matters, and the lab will open.")]));
        update();
      };
      const field = (id, label, list, k, max, hint) => [el("label", { for: id, class: "label" }, label),
        el("input", { id, class: "field", maxlength: String(max), autocomplete: "off", value: list[k], placeholder: hint ? `For example: ${hint}` : null,
          oninput: (e) => { list[k] = e.target.value; keepDraft(); }, onchange: () => grid() })];
      frame(m, i, title, el("p", { class: "lead" }, step.body), el("p", { class: "quiet" }, step.prompt),
        el("div", { class: "lab-fields" },
          ...field("lab-o1", "Option 1", st.options, 0, LAB.optionMax, ex[0]),
          ...field("lab-o2", "Option 2", st.options, 1, LAB.optionMax, ex[1]),
          ...field("lab-o3", "A third way (optional)", st.options, 2, LAB.optionMax, ex[2]),
          ...field("lab-v1", "What matters most to you here", st.values, 0, LAB.valueMax, ex[3]),
          ...field("lab-v2", "Something else that matters (optional)", st.values, 1, LAB.valueMax, ex[4])),
        el("button", { class: "ghost", onclick: () => grid() }, "Open the lab"),
        gridBox, summary, err, el("div", { class: "actions" }, go));
      grid();
      return;
    }
    if (step.type === "sort") {
      h.quiet(false);
      const items = sortItems(step, a.answers);
      const own = !!step.fromStep;
      const sorted = Object.fromEntries(Object.entries(prev && "sorted" in prev ? prev.sorted : {}).filter(([k]) => items.some((x) => x.id === k)));
      const label = (id) => step.bins.find((b) => b.id === id)?.label ?? "";
      const feedback = el("div", { class: "explain", "aria-live": "polite" });
      const go = el("button", { class: "primary", disabled: true, onclick: () => next({ sorted }) }, "Continue");
      const update = () => {
        const all = items.every((x) => sorted[x.id]);
        go.disabled = !all;
        // your own thoughts: no "reading" of them, just what you decided, counted, and the idea behind it
        if (own) {
          const n = (b) => items.filter((x) => sorted[x.id] === b).length;
          feedback.replaceChildren(...(all ? [el("p", { class: "outcome" }, `${step.bins.map((b) => `${b.label}: ${n(b.id)}`).join(" · ")}`), el("p", { class: "quiet" }, step.feedback)] : []));
          return;
        }
        feedback.replaceChildren(...(all ? [el("p", { class: "outcome" }, "One way to read them"),
          el("ul", { class: "readings" }, items.map((x) => el("li", {}, el("b", {}, `${x.text} `), el("span", { class: "rb" }, label(x.bin)), el("span", { class: "quiet" }, ` ${x.why}`), sorted[x.id] !== x.bin ? el("span", { class: "quiet small" }, ` You put it in ${label(sorted[x.id])}, and that's a fair reading too if you see it that way.`) : null))),
          el("p", { class: "quiet" }, step.feedback)] : []));
      };
      const rows = items.map((x) => {
        const group = el("div", { class: "seg sort-scale", role: "radiogroup", "aria-label": x.text },
          step.bins.map((b) => el("button", { role: "radio", "aria-checked": String(sorted[x.id] === b.id), onclick: (e) => {
            sorted[x.id] = b.id;
            group.querySelectorAll("button").forEach((n) => n.setAttribute("aria-checked", String(n === e.currentTarget)));
            update();
          } }, b.label)));
        return el("div", { class: "lens" }, el("p", { class: "lens-text" }, x.text), group);
      });
      frame(m, i, title, step.body ? el("div", { class: "card event" }, el("p", { class: "lead" }, step.body)) : null,
        el("p", { class: "lead" }, step.prompt), ...rows,
        own && !items.length ? el("p", { class: "quiet" }, "Nothing to sort from the last step. That's fine: carry on.") : null,
        feedback, err, el("div", { class: "actions" }, go));
      update();
      return;
    }
    if (step.type === "choice") {
      h.quiet(false);
      const list = el("div", { class: "choices", role: "group", "aria-label": step.title });
      const explain = el("div", { class: "explain", "aria-live": "polite" });
      let chosen = prev && "choice" in prev ? prev.choice : null;
      const go = el("button", { class: "primary", disabled: !chosen, onclick: () => next({ choice: chosen }) }, "Continue");
      const pick = (o) => {
        chosen = o.id; go.disabled = false;
        list.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === o.id)));
        explain.replaceChildren(el("p", { class: "outcome" }, o.outcome), el("p", { class: "quiet" }, o.why), el("p", { class: "quiet small" }, "You can tap the others to see what tends to happen with them too."));
      };
      for (const o of step.options) list.append(el("button", { class: "choice", "data-id": o.id, "aria-pressed": "false", onclick: () => pick(o) }, o.text));
      frame(m, i, title, step.body ? el("p", { class: "lead" }, step.body) : null, list, explain, err, el("div", { class: "actions" }, go));
      if (chosen) pick(step.options.find((o) => o.id === chosen));
      return;
    }
    if (step.type === "lens") {
      // one reading at a time: rate it, and the next one comes; earlier ones stay, tappable to change
      h.quiet(false);
      const ratings = { ...(prev && "ratings" in prev ? prev.ratings : {}) };
      const scale = [[1, "Doesn't fit"], [2, "Partly"], [3, "Fits well"]];
      const lenses = step.lenses, still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let at = lenses.findIndex((l) => !ratings[l.id]); if (at < 0) at = lenses.length;
      const feedback = el("div", { class: "explain", "aria-live": "polite" });
      const go = el("button", { class: "primary", disabled: true, onclick: () => next({ ratings }) }, "Continue");
      const stage = el("div", { class: "lens-stage" }), done = el("ol", { class: "lens-done", "aria-label": "Your readings so far" });
      const draw = () => {
        done.replaceChildren(...lenses.filter((l, k) => ratings[l.id] && k !== at).map((l) => el("li", {}, el("button", { class: "lens-past", onclick: () => { at = lenses.indexOf(l); draw(); stage.querySelector("[role=radio]")?.focus(); } },
          el("span", { class: "lens-past-t" }, l.text), el("span", { class: "mmeta" }, scale.find(([v]) => v === ratings[l.id])[1])))));
        done.hidden = !done.children.length;
        if (at < lenses.length) {
          const l = lenses[at];
          const group = el("div", { class: "seg lens-scale", role: "radiogroup", "aria-label": `How well does this fit: ${l.text}` },
            scale.map(([v, label]) => el("button", { role: "radio", "aria-checked": String(ratings[l.id] === v), onclick: (e) => {
              ratings[l.id] = v;
              group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b === e.currentTarget)));
              const n = lenses.findIndex((x) => !ratings[x.id]); at = n < 0 ? lenses.length : n;
              setTimeout(() => { draw(); (stage.querySelector("[role=radio]") ?? go).focus(); }, still ? 0 : 220);
            } }, label)));
          stage.replaceChildren(el("p", { class: "lens-pos" }, `${at + 1} of ${lenses.length}`), el("div", { class: "lens" }, el("p", { class: "lens-text" }, l.text), group));
        } else stage.replaceChildren();
        const all = lenses.every((l) => ratings[l.id]);
        go.disabled = !all;
        feedback.replaceChildren(...(all ? [el("p", { class: "outcome" }, "Your readings"), el("p", { class: "quiet" }, step.feedback)] : []));
      };
      frame(m, i, title, el("div", { class: "card event" }, el("p", { class: "lead" }, step.body)),
        el("p", { class: "lead" }, step.prompt), stage, done, feedback, err, el("div", { class: "actions" }, go));
      draw();
      return;
    }
    if (step.type === "rehearse" || step.type === "reflect") {
      const ta = el("textarea", { id: "q-words", class: "grow", rows: "3", maxlength: "2000", "aria-labelledby": "q-prompt" });
      const fitTa = () => { ta.style.height = "auto"; ta.style.height = `${Math.min(ta.scrollHeight + 2, Math.round(innerHeight * 0.5))}px`; };
      ta.addEventListener("input", fitTa); requestAnimationFrame(fitTa);
      let draft = ""; try { draft = localStorage.getItem(DRAFT(a, step.id)) ?? ""; } catch {}
      ta.value = prev && "text" in prev ? prev.text : draft;
      ta.addEventListener("input", () => { try { localStorage.setItem(DRAFT(a, step.id), ta.value); } catch {} });
      h.quiet(true);
      frame(m, i, title, el("p", { class: "lead", id: "q-prompt" }, step.prompt), ta,
        step.examples?.length ? el("p", { class: "quiet" }, `For example: “${step.examples[0]}”`) : null,
        m.steps.findIndex((x) => x.type === "rehearse" || x.type === "reflect") === i ? el("p", { class: "quiet" }, store.local ? "Kept on this device, in your words." : "Kept in your Dawnward, in your words.") : null, // said once per practice
        err, el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => next({ text: ta.value }) }, "Continue"),
          // "not sure" is a complete answer, and an optional step can be left: both count the same
          step.notSure ? el("button", { class: "ghost", onclick: () => next({ text: "Not sure." }) }, "I'm not sure") : null,
          step.required ? null : el("button", { class: "ghost", onclick: () => next({ skip: true }) }, "Not this time")));
      ta.focus({ preventScroll: true });
      return;
    }
    if (step.type === "plan") {
      const action = el("input", { id: "q-action", class: "field", maxlength: "200", autocomplete: "off" });
      const when = el("input", { id: "q-when", class: "field", maxlength: "60", autocomplete: "off" });
      if (prev && "action" in prev) { action.value = prev.action; when.value = prev.when; }
      h.quiet(true);
      frame(m, i, title, el("p", { class: "lead" }, step.prompt),
        el("label", { for: "q-action", class: "label" }, "One small action"), action,
        el("label", { for: "q-when", class: "label" }, "Roughly when"), when,
        step.examples?.length ? el("p", { class: "quiet" }, `For example: “${step.examples[0]}”`) : null,
        el("p", { class: "quiet" }, "Small, safe and in your control. Whatever happens when you try it, coming back to say how it went counts."),
        err, el("div", { class: "actions" },
          el("button", { class: "primary", onclick: () => next({ action: action.value, when: when.value }) }, "Continue"),
          step.required ? null : el("button", { class: "ghost", onclick: () => next({ skip: true }) }, "Not this time")));
      action.focus({ preventScroll: true });
      return;
    }
    if (step.type === "close") { h.quiet(false); finish(); }
  }

  async function finish() {
    const { mission: m } = current;
    const closeStep = m.steps[m.steps.length - 1];
    frame(m, m.steps.length - 1, el("h2", { class: "s-title", tabindex: "-1" }, closeStep.title), el("p", { class: "quiet", role: "status" }, "Keeping it…"));
    const r = await store.complete(current.attempt);
    if (r.error) {
      frame(m, m.steps.length - 1, el("h2", { class: "s-title", tabindex: "-1" }, closeStep.title), el("p", { class: "error", role: "alert" }, r.error),
        el("div", { class: "actions" }, el("button", { class: "primary", onclick: finish }, "Try again")));
      return;
    }
    current.attempt = r.attempt;
    await refresh();
    h.onDiscoveries(data, r.discoveries ?? []);
    const plan = r.experiment;
    const found = (r.discoveries ?? [])[0];
    frame(m, m.steps.length - 1,
      el("h2", { class: "s-title", tabindex: "-1" }, closeStep.title),
      el("p", { class: "lead" }, closeStep.body),
      plan ? el("div", { class: "card x-action" }, el("p", { class: "kicker" }, "Your action"), el("p", { class: "statement" }, plan.action), el("p", { class: "why" }, plan.when_text)) : null,
      found && data.gameLayer ? el("div", { class: "card found" },
        el("img", { class: "reward-moon", src: h.asset(artPath(ART.missions[m.id]?.moon ?? ART.moon)), alt: "" }),
        el("p", { class: "kicker" }, "Discovered"), el("p", { class: "statement" }, found.title), el("p", { class: "why" }, found.why)) : null,
      el("div", { class: "actions" },
        // the universe changed: show it there first
        found ? el("button", { class: "primary", onclick: () => { current = null; from = null; h.goHomeWith(found.key); } }, "See it in your universe") : null,
        el("button", { class: found ? "ghost" : "primary", onclick: () => { current = null; from = null; h.goEarth(found ?? null); } }, "Go home"),
        // the one way back without accounts or notifications: their own calendar, on the day they chose
        plan ? el("button", { class: "ghost", id: "x-remind", onclick: (e) => reminderSheet({ el, action: plan.action, when: plan.when_text, announce: h.announce, returnFocus: e.currentTarget, mark: h.asset(artPath(ART.remind)) }) }, "Remind me") : null,
        (() => { const sys = SYSTEMS.find((x) => x.id === m.systemId); return sys?.kind === "expedition" && !isFollowing(sys.id) ? followButton(sys, () => finishFollowNote(sys)) : null; })(),
        m.worksheet ? el("button", { class: "ghost", onclick: () => worksheet(m, () => { current = null; draw(); $("x-title")?.focus(); }) }, `Worksheet: ${m.worksheet.title}`) : null,
        el("button", { class: "text-btn", onclick: () => { current = null; draw(); $("x-title")?.focus(); } }, "Back to Learn")));
    h.announce(found ? `Done. ${found.title} appeared.` : "Done.");
    h.motion?.star(body().querySelector(".s-title"));
  }

  // ----- worksheets: readable here, printable on paper -----
  // ----- worksheets: filled in here, saved on this phone as you type, printable or saved as PDF with your answers -----
  const SHEETS = "dw-sheets-v1";
  const readSheets = () => { try { return JSON.parse(localStorage.getItem(SHEETS) || "{}"); } catch { return {}; } };
  /** Answers for one worksheet: { [sectionIndex]: string[][] (a table) | string (lines) } */
  function sheetAnswers(id) { return readSheets()[id] ?? {}; }
  function worksheet(m, back) {
    setArt(null);
    const w = m.worksheet;
    const head = ART.missions[m.id]?.header;
    const ans = sheetAnswers(m.id);
    const status = el("p", { class: "quiet small no-print", role: "status", "aria-live": "polite" }, Object.keys(ans).length ? "Your answers are back." : "");
    let timer = null;
    const save = () => { clearTimeout(timer); timer = setTimeout(() => {
      const all = readSheets(); all[m.id] = { ...ans, savedAt: new Date().toISOString() };
      try { localStorage.setItem(SHEETS, JSON.stringify(all)); status.textContent = "Saved on this phone."; } catch { status.textContent = "Couldn't save on this device. Copy your answers somewhere safe."; }
    }, 300); };
    // a field that types like a textarea, and prints as plain text (textareas print badly)
    const field = (value, label, onChange, rows = 2) => {
      const out = el("span", { class: "ws-print" }, value);
      const ta = el("textarea", { class: "ws-in no-print", rows: String(rows), "aria-label": label, maxlength: "1000" });
      ta.value = value;
      ta.addEventListener("input", () => { out.textContent = ta.value; onChange(ta.value); save(); });
      return [ta, out];
    };
    const tableFor = (sec, k) => {
      const rows = Array.isArray(ans[k]) ? ans[k] : Array.from({ length: sec.rows ?? 3 }, () => sec.columns.map(() => ""));
      ans[k] = rows;
      const tbody = el("tbody");
      const drawRows = () => tbody.replaceChildren(...rows.map((r, ri) => el("tr", {}, sec.columns.map((c, ci) => el("td", {}, ...field(r[ci] ?? "", `${c}, row ${ri + 1}`, (v) => { r[ci] = v; }))))));
      drawRows();
      return [el("div", { class: "ws-scroll" }, el("table", { class: "ws-table" }, el("thead", {}, el("tr", {}, sec.columns.map((c) => el("th", { scope: "col" }, c)))), tbody)),
        el("button", { class: "text-btn no-print", onclick: () => { rows.push(sec.columns.map(() => "")); drawRows(); save(); tbody.lastChild?.querySelector("textarea")?.focus(); } }, "Add a row")];
    };
    const sheet = el("article", { class: "sheet", "aria-labelledby": "ws-title" },
      head ? el("img", { class: "ws-art no-print", src: h.asset(artPath(head)), alt: "" }) : null,
      el("p", { class: "kicker" }, `Dawnward · ${m.title} · ${m.part}`),
      el("h2", { id: "ws-title", class: "s-title", tabindex: "-1" }, w.title),
      el("p", { class: "lead" }, w.intro),
      el("p", { class: "quiet small no-print" }, "Fill it in here. It saves on this phone as you type, and prints or saves as a PDF with your answers."),
      ...w.sections.map((sec, k) => el("section", { class: "ws-sec" }, el("h3", {}, sec.heading),
        sec.items ? el("ol", { class: "ws-items" }, sec.items.map((t) => el("li", {}, t)))
        : sec.columns ? tableFor(sec, k)
        : field(typeof ans[k] === "string" ? ans[k] : "", sec.heading, (v) => { ans[k] = v; }, Math.max(2, sec.lines ?? 2)))),
      status);
    body().replaceChildren(
      el("div", { class: "actions no-print" },
        el("button", { class: "text-btn back", onclick: back }, el("span", { html: svg(ICON.back, 16) }), " Back"),
        typeof window.print === "function" ? el("button", { class: "ghost", onclick: () => { try { window.print(); } catch { h.announce("Printing isn't available here."); } } }, "Print or save as PDF") : null),
      sheet);
    $("ws-title").focus();
    $("explore").scrollTop = 0;
  }

  function finishFollowNote(sys) {
    const b = body().querySelector(".follow");
    if (b) b.replaceWith(el("p", { class: "quiet", role: "status" }, `You're following ${sys.title}. Home will suggest its next chapter, and you can stop any time in Learn.`));
  }

  // ----- members' pieces: say what's inside, say honestly that membership isn't open yet -----
  function gate(m) {
    h.quiet(false);
    setArt(m, { type: "intro", id: "intro" });
    const free = MISSIONS.find((x) => !locked(x) && x.id !== m.id && !data.attempts.some((a) => a.missionId === x.id && a.status === "completed"));
    body().replaceChildren(
      el("div", { class: "qhead" },
        h.crumbs([...(from?.trail ?? [{ label: "Learn", root: true, go: () => { from = null; draw(); } }]), { label: m.title }]),
        el("button", { class: "text-btn back", onclick: () => { const f = from; from = null; f ? f.go() : draw(); } }, el("span", { html: svg(ICON.back, 16) }), ` ${from?.label ?? "Learn"}`)),
      el("p", { class: "kicker plus-kicker" }, "Dawnward Plus"),
      el("h2", { class: "s-title", id: "x-title", tabindex: "-1" }, `${m.title}: ${m.part}`),
      el("p", { class: "lead" }, m.objective),
      el("p", { class: "quiet" }, `About ${m.minutes} minutes${m.worksheet ? `, with a worksheet: ${m.worksheet.title}` : ""}.${m.freeOnce ? " Everyone can take this once; you already have." : ""}`),
      el("section", { class: "card plus-card", "aria-labelledby": "plus-h" },
        el("h3", { id: "plus-h" }, "What Plus includes"),
        el("ul", { class: "plus-list" }, ["Every chapter of every expedition", "All worksheets and listen-along lessons", "The Quantum Gateway, any time", "New expeditions as they're written", "Bianno's books, as guided expeditions"].map((t) => el("li", {}, t))),
        el("p", { class: "quiet" }, "Membership isn't open yet. It opens after the beta, with a reminder before any charge and one-tap cancel."),
        el("p", { class: "quiet" }, "Your reflections, memories and everything you've written stay free, always.")),
      el("div", { class: "actions" },
        store.local ? el("button", { class: "primary", onclick: async () => { await store.setPlan("plus"); await refresh(); h.announce("Member preview on, on this device only."); play(m.id, { from }); } }, "Preview as a member") : null,
        free ? el("button", { class: "ghost", onclick: () => play(free.id, { from }) }, `Free now: ${free.title}`) : null),
      store.local ? el("p", { class: "quiet small" }, "Member preview is for seeing what members get. It changes nothing but what this device shows, and you can switch it off in You.") : null);
    $("x-title").focus();
    $("explore").scrollTop = 0;
  }

  function crisis(text) {
    setArt(null);
    h.quiet(false);
    if (current?.attempt?.status === "in_progress") store.exit(current.attempt);
    body().replaceChildren(el("h2", { class: "s-title", tabindex: "-1" }, "You matter more than any practice"),
      ...String(text).split("\n").map((l) => el("p", { class: "crisis" }, l)),
      el("p", { class: "quiet" }, "This practice is paused. Nothing more is needed from you right now."),
      el("div", { class: "actions" }, el("button", { class: "ghost", onclick: () => { current = null; draw(); } }, "Back to Explore")));
    body().querySelector(".s-title").focus();
  }

  // ----- coming back: how did the real action go? Any outcome counts -----
  function review(experimentId) {
    const x = data.experiments.find((e) => e.id === experimentId);
    if (!x) return;
    // four outcomes, all counting the same (2 Nov review: not yet, and changing your mind, are real answers)
    const outcomes = [["did", "I did it", '<path d="m5 12.5 4.5 4.5L19 7.5"/>'], ["partly", "Partly", '<path d="M4 12c2.5-3 5-3 8 0s5.5 3 8 0"/>'],
      ["notyet", "Not yet", '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>'], ["changed", "I changed my mind", '<path d="M18.5 9A7 7 0 1 0 19 13"/><path d="M19 4.5V9h-4.5"/>']];
    let outcome = null;
    const group = el("div", { class: "x-tiles", role: "radiogroup", "aria-label": "How did it go?" },
      outcomes.map(([v, label, icon]) => el("button", { role: "radio", "aria-checked": "false", class: "x-tile", onclick: (e) => { outcome = v; group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b === e.currentTarget))); } },
        el("span", { class: "x-tile-i", html: svg(icon, 26) }), el("span", {}, label))));
    const ta = el("textarea", { id: "x-review", rows: "3", maxlength: "2000", "aria-labelledby": "x-review-q", placeholder: "Anything you noticed?" });
    const err = el("p", { class: "error", role: "alert" });
    h.showPlace("explore");
    setArt({ id: "review" }, { type: "intro" });
    body().replaceChildren(...head("How did it go?", null, () => { draw(); $("x-title")?.focus(); }),
      el("div", { class: "card" }, el("p", { class: "kicker" }, "You planned"), el("p", { class: "statement" }, x.action), el("p", { class: "why" }, x.when_text)),
      group,
      el("label", { class: "label", id: "x-review-q", for: "x-review" }, "What happened? (optional)"), ta,
      el("p", { class: "quiet small" }, "Whatever happened, saying how it went is what counts."),
      err,
      el("div", { class: "actions" }, el("button", { class: "primary", onclick: async () => {
        if (!outcome) { err.textContent = "Choose how it went."; return; }
        if (store.local && ta.value.trim() && h.distress(ta.value)) { crisis(h.crisisText); return; }
        const r = await store.review(x.id, outcome, ta.value.trim());
        if (r.crisis) { crisis(r.reply); return; }
        if (r.error) { err.textContent = r.error; return; }
        await refresh();
        h.onDiscoveries(data, r.discoveries ?? []);
        const found = (r.discoveries ?? [])[0];
        body().replaceChildren(...head("Thank you for coming back", null, () => { draw(); $("x-title")?.focus(); }),
          el("p", { class: "lead" }, { didnt: "Not doing it is information too. Next time, notice what got in the way.", notyet: "Not yet is fine. It's here whenever you're ready.", changed: "Changing your mind is a real decision too. Knowing that is worth something." }[outcome] ?? "You tried something real. That's the part that changes things."),
          found && data.gameLayer ? el("div", { class: "card found" }, el("p", { class: "kicker" }, "Discovered"), el("p", { class: "statement" }, found.title), el("p", { class: "why" }, found.why)) : null,
          el("div", { class: "actions" }, el("button", { class: "primary", onclick: () => h.goEarth(found ?? null) }, "Go home"), el("button", { class: "ghost", onclick: () => { draw(); $("x-title")?.focus(); } }, "Back to Explore")));
        $("x-title")?.focus();
      } }, "Save")));
    $("x-title")?.focus();
  }

  return {
    store, open, refresh, play, review, sheetAnswers, readSheets,
    get data() { return data; },
    isFollowing, follow,
    /** Opens a chapter's worksheet on its own, from a world's Library. */
    sheet(missionId, back) { const m = missionById(missionId); if (!m?.worksheet) return; h.showPlace("explore"); if (locked(m) && !data.attempts.some((a) => a.missionId === m.id && a.status === "completed")) { from = { label: "Back", go: back }; gate(m); return; } worksheet(m, back); },
    locked, plan: planNow, beta: () => !!store.local && BETA_ALL_OPEN,
    async setPlan(plan) { const r = await store.setPlan?.(plan); await refresh(); return r; },
    get missions() { return MISSIONS; },
    textSummary() {
      return SYSTEMS.map((sys) => ({ sys, missions: sys.missionIds.map((id) => ({ m: missionById(id), done: data.attempts.some((a) => a.missionId === id && a.status === "completed") })) }));
    },
  };
}
