// The path through the galaxies: earned by doing real things, never by paying, and never guessed at.
// Every galaxy stays visible; a locked one says exactly what opens it and how far along you are.
// Facts come only from what is already kept: finished expeditions (the expedition store), things made
// in Creative Worlds (the creative store), and your direction. Once a galaxy opens it stays open.
import { missionById } from "../../packages/core/src/expeditions/index.ts";

export const KEY = "dw-progress-v1";

/** In path order. `need` is said to the person; `count` says how far along they are. */
export const PATH = [
  { id: "growth", always: true },
  { id: "earth", always: true },
  { id: "knowledge", need: "Finish one expedition in Personal Growth.", next: "learn",
    count: (f) => [Math.min(f.done.length, 1), 1] },
  { id: "spiritual", need: "Finish two different practices.", next: "learn",
    count: (f) => [Math.min(f.done.length, 2), 2] },
  { id: "creative", need: "Finish three practices, in at least two worlds.", next: "learn",
    count: (f) => [Math.min(f.done.length, 3), 3], ok: (f) => f.done.length >= 3 && f.worlds >= 2,
    extra: (f) => (f.done.length >= 3 && f.worlds < 2 ? "Try one in another world." : null) },
  { id: "ai", need: "Make something in Creative Worlds and keep it: design a place in the Dream Architect, or plant a moment in the Time Garden.", next: "creative",
    count: (f) => [Math.min(f.made, 1), 1] },
  { id: "gateway", need: "Finish a practice in Future, and set your direction on Home.", next: "future",
    count: (f) => [(f.future ? 1 : 0) + (f.direction ? 1 : 0), 2] },
];
/** Steps where you do something, as opposed to reading (lesson), watching (portal) or opening and closing. */
const DOING = new Set(["choice", "lens", "sort", "lab", "rehearse", "reflect", "plan", "pause"]);
export const isPractice = (m) => !!m && m.steps.some((s) => s.required && DOING.has(s.type));
export const step = (id) => PATH.find((p) => p.id === id);
const passes = (s, f) => (s.ok ? s.ok(f) : (([have, of]) => have >= of)(s.count(f)));

/** Facts from what's kept. `attempts` from the expedition store, `made` from the creative store. */
export function facts({ attempts = [], creative = null, direction = null }) {
  // a practice is a finished guided exercise: a mission with at least one required step you do, not only read
  const done = [...new Set(attempts.filter((a) => a.status === "completed").map((a) => a.missionId))].filter((id) => isPractice(missionById(id)));
  const worlds = new Set(done.map((id) => missionById(id).world)).size;
  const c = creative ?? {};
  // a creation is a saved artifact: a place you designed or a moment you planted. Lighting lanterns is play, not a creation.
  const made = (c.places?.length ?? 0) + (c.moments?.length ?? 0);
  // the Gateway is itself a Future practice, so it doesn't count toward opening itself
  const future = done.some((id) => id !== "gateway-1" && missionById(id).world === "future");
  return { done, worlds, made, future, direction: !!direction?.text };
}

/** Where someone stands on one step: open, or locked with [have, of] and what to do. */
export function standing(id, f, kept) {
  const s = step(id);
  if (!s || s.always || kept.unlocked?.[id]) return { open: true };
  const [have, of] = s.count(f);
  return { open: passes(s, f), have, of, need: s.need, extra: s.extra?.(f) ?? null, next: s.next };
}

export function createProgress(device) {
  const blank = () => ({ unlocked: {}, celebrated: {} });
  let kept = { ...blank(), ...device.read(KEY, {}) };
  const save = () => device.write(KEY, kept);
  return {
    get kept() { return kept; },
    /** First run of this version for someone who already used Dawnward: what they already used stays open, quietly. */
    migrate({ hadData, used }) {
      if (device.read(KEY, null) || !hadData) return [];
      for (const id of used) { kept.unlocked[id] = new Date().toISOString(); kept.celebrated[id] = true; }
      save();
      return used;
    },
    /** Records anything newly earned (idempotent: an open galaxy is never opened twice). Returns the new ones. */
    update(f) {
      const fresh = [];
      for (const s of PATH) {
        if (s.always || kept.unlocked[s.id]) continue;
        if (passes(s, f)) { kept.unlocked[s.id] = new Date().toISOString(); fresh.push(s.id); }
      }
      if (fresh.length && !save()) for (const id of fresh) delete kept.unlocked[id];
      return fresh;
    },
    standing: (id, f) => standing(id, f, kept),
    /** The next opening not yet celebrated, if any. */
    toCelebrate() { return PATH.find((s) => !s.always && kept.unlocked[s.id] && !kept.celebrated[s.id])?.id ?? null; },
    celebrated(id) { kept.celebrated[id] = true; save(); },
    wipe() { kept = blank(); return device.remove(KEY); },
    snapshot() { return JSON.parse(JSON.stringify(kept)); },
  };
}
