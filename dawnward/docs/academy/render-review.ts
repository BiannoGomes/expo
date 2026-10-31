// Writes the review copy of every draft chapter, straight from the catalog the app uses.
// Run from dawnward/server: npx tsx ../docs/academy/render-review.ts > ../docs/academy/beyond-overthinking.md
import { MISSIONS, SYSTEMS } from "../../packages/core/src/expeditions/index.ts";

const sys = SYSTEMS.find((s) => s.id === (process.argv[2] ?? "mind-beyond-overthinking"))!;
const out: string[] = [];
const p = (s = "") => out.push(s);
p(`# ${sys.title}: written chapters for review`);
p();
p(`**Status:** draft. Generated from \`packages/core/src/expeditions/catalog.ts\`, so this is exactly what the app shows. Edit here or in the catalog; I'll apply your changes to the catalog and regenerate this file.`);
p();
p(`**Expedition:** ${sys.title} (${sys.world[0].toUpperCase()}${sys.world.slice(1)}). ${sys.objective}`);
p();
p(`**Chapters:**`);
sys.missionIds.forEach((id, i) => { const m = MISSIONS.find((x) => x.id === id)!; p(`${i + 1}. ${m.part.replace(/^Chapter \d+: /, "")} (draft, written)`); });
(sys.planned ?? []).forEach((c, i) => p(`${sys.missionIds.length + i + 1}. ${c.title}: ${c.line} (planned)`));
p();
p(`The chapter titles come from your outline. Nothing is scored. Sorting exercises offer "one way to read them", and a different answer is called a fair reading.`);
for (const id of sys.missionIds) {
  const m = MISSIONS.find((x) => x.id === id)!;
  p(); p(`---`); p();
  p(`## ${m.part}`);
  p();
  p(`**Objective:** ${m.objective}`);
  p();
  p(`**Time:** about ${m.minutes} minutes`);
  p();
  p(`**Safety note:** ${m.safetyNote ?? "none"}`);
  for (const s of m.steps) {
    p(); p(`### ${s.title} (${s.type}${s.required ? "" : ", optional"})`); p();
    if (s.body) { p(s.body); p(); }
    if (s.paragraphs) { for (const t of s.paragraphs) { p(t); p(); } }
    if (s.prompt) { p(`**Prompt:** ${s.prompt}`); p(); }
    if (s.cues) {
      p(`| Cue | Seconds |`); p(`|---|---|`);
      for (const c of s.cues) p(`| ${c.text} | ${c.seconds} |`);
      p();
    }
    if (s.options) {
      p(`| Option | What tends to happen | Why |`); p(`|---|---|---|`);
      for (const o of s.options) p(`| ${o.text} | ${o.outcome} | ${o.why} |`);
      p();
    }
    if (s.bins && s.items) {
      p(`| Thought | Suggested reading | Why |`); p(`|---|---|---|`);
      for (const x of s.items) p(`| ${x.text} | ${s.bins.find((b) => b.id === x.bin)!.label} | ${x.why} |`);
      p();
    }
    if (s.feedback) { p(`**Afterwards:** ${s.feedback}`); p(); }
    if (s.examples?.length) { p(`**Example offered (never prefilled):** ${s.examples.join(" / ")}`); p(); }
  }
  if (m.worksheet) {
    const w = m.worksheet;
    p(`### Worksheet: ${w.title}`); p(); p(w.intro); p();
    for (const sec of w.sections) {
      if (sec.items) {
        p(`**${sec.heading}:**`); sec.items.forEach((t, i) => p(`${i + 1}. ${t}`));
      } else if (sec.columns) {
        p(`**${sec.heading}:** a table with columns ${sec.columns.map((c) => `"${c}"`).join(", ")}, and ${sec.rows} blank rows.`);
      } else {
        p(`**${sec.heading}:** ${sec.lines} blank line${sec.lines === 1 ? "" : "s"}.`);
      }
      p();
    }
  }
}
p(`---`); p();
p(`## Sources and claims to check before publishing`); p();
if (sys.id === "mind-beyond-overthinking") p(`- **Chapter 1, lesson paragraph 3** (concrete "how" thinking versus abstract "why" thinking): Watkins, E. R. (2008). "Constructive and unconstructive repetitive thought." *Psychological Bulletin*, 134(2), 163–206. The paragraph paraphrases the review's general finding; a reviewer should confirm the wording isn't overstated.`);
if (sys.id === "mind-beyond-overthinking") p(`- **Chapter 3, lesson paragraph 3** ("breathing out a little more slowly than you breathe in helps many people settle"): worded as a common experience, not a physiological claim. It also offers an alternative for people who find breath focus uncomfortable. A reviewer should confirm the wording.`);
p(`- No other factual claims are made. Everything else is practice guidance, not research findings.`);
p(); p(`## Review checklist`); p();
p(`- [ ] Bianno: tone, examples, and whether these feel like your voice`);
p(`- [ ] A qualified reviewer (for example, a CBT-trained therapist), because the topic touches anxiety: no clinical claims, the safety note, and the sorting examples`);
p(`- [ ] Then change \`status: "draft"\` to \`"reviewed"\` in the catalog; the "Draft" tags disappear by themselves`);
console.log(out.join("\n"));
