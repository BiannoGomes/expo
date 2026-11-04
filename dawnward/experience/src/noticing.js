// Noticing, without AI: honest patterns in a person's OWN words and actions, worked out on their phone.
// Every observation is a count plus quotes of what they wrote (the evidence), phrased as a question they
// can confirm or correct. Never a diagnosis, never a guess at causes, never a score. Nothing leaves the device.

const STOP = new Set(("about above after again against all also always am among an and another any anything are around as at " +
  "away back be because been before being below between both but by came can cannot could day days did didn't do does doing done " +
  "don't down during each even ever every feel feeling felt few first for from get gets getting go goes going gone got had has have " +
  "having he her here hers herself him himself his how i i'm i've if in into is isn't it it's its itself just keep kept know knew last " +
  "less let like little lot lots made make makes making many may maybe me might more most much must my myself need needed never new " +
  "next nice no nor not nothing now of off often oh ok okay on once one only or other others our out over own part people really " +
  "right said same say saying see seem seemed she should since so some something sometimes still such sure take than that that's " +
  "the their them themselves then there these they thing things think thinking this those though thought through time times to " +
  "today told too took tomorrow toward try trying under until up upon us very want wanted was wasn't way we week well went were " +
  "what when where which while who whole why will wish with without won't work's would yeah year yes yesterday yet you your " +
  "yours yourself i'd i'll it'll let's that'll there's they're we're what's who's would've could've should've").split(" "));
/** Feeling words people use about themselves; counted, never interpreted. */
const FEELINGS = ["tired", "exhausted", "stressed", "anxious", "worried", "overwhelmed", "calm", "happy", "grateful", "sad", "angry",
  "frustrated", "lonely", "hopeful", "proud", "excited", "peaceful", "nervous", "scared", "relieved", "content", "restless", "bored",
  "guilty", "ashamed", "confident", "motivated", "stuck", "lost", "joyful", "irritated", "drained", "energised", "energized", "rested", "low"];
const FEEL = new Set(FEELINGS);
const DAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
const WORLD = { mind: "Mind", body: "Body", soul: "Soul", spirit: "Spirit", future: "Future" };

/** A word in a standard form: "Works" and "work" count as one. */
export function norm(w) {
  w = w.toLowerCase().replace(/[’']s$/, "").replace(/[’]/g, "'");
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us")) return w.slice(0, -1);
  return w;
}
const words = (t) => (t.toLowerCase().match(/[a-zà-ÿ’']+/g) ?? []).map(norm);
const sentences = (t) => t.split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
const clip = (s, n = 120) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
/** The sentence that contains the word, as a quote. */
function quoteFor(text, w) {
  const s = sentences(text).find((x) => words(x).includes(w)) ?? text;
  return clip(s);
}
const listOf = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const dayOf = (d) => new Date(`${d}T12:00:00`).getDay();

/**
 * Patterns across everything kept on this device.
 * @param stars [{id, world, date: "YYYY-MM-DD", excerpt}]  @param experiments [{status, outcome}]
 * @returns [{ id, text, evidence: [{date, quote}] , note? }]
 */
export function observations({ stars = [], experiments = [] } = {}) {
  const out = [], n = stars.length;
  if (n >= 3) {
    // 1. words that keep coming back (in at least 3 reflections, and at least a third of them)
    const seen = new Map();
    for (const s of stars) for (const w of new Set(words(s.excerpt))) {
      if (w.length < 4 || STOP.has(w) || FEEL.has(w)) continue;
      if (!seen.has(w)) seen.set(w, []);
      seen.get(w).push(s);
    }
    const recurring = [...seen].filter(([, ss]) => ss.length >= 3 && ss.length / n >= 1 / 3).sort((a, b) => b[1].length - a[1].length).slice(0, 2);
    for (const [w, ss] of recurring) out.push({
      id: `word:${w}`, text: `You wrote about “${w}” in ${ss.length} of your ${n} reflections. Does that sound right?`,
      evidence: ss.slice(-2).reverse().map((s) => ({ date: s.date, quote: quoteFor(s.excerpt, w) })),
    });
    // 2. the feeling word named most often (at least twice)
    const feel = new Map();
    for (const s of stars) for (const w of new Set(words(s.excerpt))) if (FEEL.has(w)) { if (!feel.has(w)) feel.set(w, []); feel.get(w).push(s); }
    const topFeel = [...feel].filter(([, ss]) => ss.length >= 2).sort((a, b) => b[1].length - a[1].length)[0];
    if (topFeel) out.push({
      id: `feel:${topFeel[0]}`, text: `The feeling you named most often is “${topFeel[0]}”, in ${topFeel[1].length} reflections.`,
      evidence: topFeel[1].slice(-2).reverse().map((s) => ({ date: s.date, quote: quoteFor(s.excerpt, topFeel[0]) })),
    });
  }
  // 3. when you tend to write (4+ reflections, one weekday holds half or more, at least 3)
  if (n >= 4) {
    const byDay = Array(7).fill(0); for (const s of stars) byDay[dayOf(s.date)]++;
    const top = byDay.indexOf(Math.max(...byDay));
    if (byDay[top] >= 3 && byDay[top] / n >= 0.5) out.push({ id: `day:${top}`, text: `Most of your reflections are on ${DAYS[top]}: ${byDay[top]} of ${n}.`, evidence: [] });
  }
  // 4. where your attention has been (5+ reflections, one world holds most of them)
  if (n >= 5) {
    const byW = {}; for (const s of stars) byW[s.world] = (byW[s.world] ?? 0) + 1;
    const [tw, tc] = Object.entries(byW).sort((a, b) => b[1] - a[1])[0];
    const quiet = Object.keys(WORLD).filter((w) => !byW[w]);
    if (tc / n >= 0.7) out.push({ id: `world:${tw}`, text: `Most of your reflections are in ${WORLD[tw] ?? tw}: ${tc} of ${n}.${quiet.length ? ` ${listOf(quiet.map((w) => WORLD[w]))} ${quiet.length === 1 ? "hasn't" : "haven't"} had one yet.` : ""}`, evidence: [] });
  }
  // 5. follow-through: the steps you came back to tell about (any answer counts, all are shown)
  const reviewed = experiments.filter((x) => x.status === "reviewed");
  if (reviewed.length >= 2) {
    const c = (o) => reviewed.filter((x) => x.outcome === o).length;
    const parts = [[c("did"), "done"], [c("partly"), "partly"], [c("notyet") + c("didnt"), "not yet"], [c("changed"), "changed your mind"]].filter(([k]) => k).map(([k, l]) => `${k} ${l}`);
    const waiting = experiments.filter((x) => x.status === "planned").length;
    out.push({ id: "follow", text: `You came back to say how ${reviewed.length} of your steps went: ${parts.join(", ")}.${waiting ? ` ${waiting} ${waiting === 1 ? "is" : "are"} still waiting to hear how it went.` : ""}`, evidence: [], noFeedback: true });
  }
  return out;
}

/** The last seven days, from what was kept: counts, actions and how they went, one line in your own words. */
export function weekSummary({ stars = [], experiments = [], attempts = [] } = {}, now = new Date()) {
  const from = new Date(now); from.setDate(from.getDate() - 6); from.setHours(0, 0, 0, 0);
  const inWeek = (iso) => !!iso && new Date(iso.length === 10 ? `${iso}T12:00:00` : iso) >= from;
  const ws = stars.filter((s) => inWeek(s.date));
  const worlds = [...new Set(ws.map((s) => s.world))].map((w) => WORLD[w] ?? w);
  const practices = attempts.filter((a) => a.status === "completed" && inWeek(a.completed_at));
  const chosen = experiments.filter((x) => inWeek(x.created_at));
  const told = experiments.filter((x) => x.status === "reviewed" && inWeek(x.reviewed_at));
  // one line you wrote: the fullest sentence this week (20–140 characters), the newest if equal
  let line = null;
  for (const s of ws) for (const t of sentences(s.excerpt)) if (t.length >= 20 && t.length <= 140 && (!line || t.length >= line.quote.length)) line = { date: s.date, quote: t };
  // the question you came back to: asked twice or more this week
  const qc = new Map(); for (const s of ws) if (s.prompt) qc.set(s.prompt, (qc.get(s.prompt) ?? 0) + 1);
  const q = [...qc].filter(([, k]) => k >= 2).sort((a, b) => b[1] - a[1])[0];
  return {
    from: from.toISOString().slice(0, 10), reflections: ws.length, worlds, practices: practices.length,
    actions: chosen.map((x) => ({ action: x.action, when: x.when_text, status: x.status, outcome: x.outcome })),
    told: told.length, line, question: q ? { text: q[0], times: q[1] } : null,
    empty: !ws.length && !practices.length && !chosen.length && !told.length,
  };
}

export const OUTCOME_WORDS = { did: "Done", partly: "Partly", notyet: "Not yet", didnt: "Not this time", changed: "Changed my mind" };
