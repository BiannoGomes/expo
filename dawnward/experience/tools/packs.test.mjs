// node --test tools/packs.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const TOOL = new URL("./packs.mjs", import.meta.url).pathname;
function run(packs) {
  const root = mkdtempSync(join(tmpdir(), "dw-packs-")), dir = join(root, "packs");
  mkdirSync(dir);
  for (const [id, { json, files = {} }] of Object.entries(packs)) {
    mkdirSync(join(dir, id));
    writeFileSync(join(dir, id, "pack.json"), typeof json === "string" ? json : JSON.stringify(json));
    for (const [f, body] of Object.entries(files)) writeFileSync(join(dir, id, f), body);
  }
  const env = { ...process.env, DW_PACKS_DIR: dir, DW_PACKS_ASSETS: join(root, "out"), DW_PACKS_DATA: join(root, "packs.data.js") };
  let out = "", code = 0;
  try { out = execFileSync("node", [TOOL], { env, encoding: "utf8" }); } catch (e) { out = e.stdout; code = e.status; }
  const data = existsSync(env.DW_PACKS_DATA) ? JSON.parse(readFileSync(env.DW_PACKS_DATA, "utf8").replace(/^[^[]*/, "").replace(/;\s*$/, "")) : null;
  return { out, code, data, root };
}
const base = (over = {}) => ({ id: "evening", title: "The Evening Reset", summary: "Close the day gently.", place: "spiritual", rights: "Bianno owns all of this", rightsConfirmed: true, ...over });

test("a good pack is listed, with honest credits and files copied", () => {
  const r = run({ evening: { json: base({ items: [
    { type: "lesson", title: "Why evenings", source: "opus", reviewed: { by: "Bianno", on: "2026-11-01" }, text: "One.\n\nTwo." },
    { type: "video", title: "The door", source: "fable", file: "door.mp4", noSpeech: true, description: "A door opens at dusk." },
    { type: "audio", title: "Breaths", source: "bianno", file: "b.mp3", transcript: "Breathe in." },
  ] }), files: { "door.mp4": "x", "b.mp3": "y" } } });
  assert.equal(r.code, 0, r.out);
  assert.equal(r.data.length, 1);
  const [p] = r.data;
  assert.equal(p.access, "plus");
  assert.deepEqual(p.items[0].paragraphs, ["One.", "Two."]);
  assert.equal(p.items[0].credit, "Written with Claude Opus, reviewed by Bianno");
  assert.equal(p.items[1].credit, "Animated with Fable");
  assert.ok(existsSync(join(r.root, "out", "evening", "door.mp4")));
});

test("Opus writing without a review is left out, or shown as a draft with --drafts", () => {
  const r = run({ evening: { json: base({ items: [
    { type: "lesson", title: "Unreviewed", source: "opus", text: "Draft words." },
    { type: "lesson", title: "Mine", source: "bianno", text: "My words." },
  ] }) } });
  assert.equal(r.code, 0);
  assert.deepEqual(r.data[0].items.map((i) => i.title), ["Mine"]);
  assert.match(r.out, /not reviewed yet/);
});

test("rights must be confirmed, and Skool items carry a reminder", () => {
  const r = run({ evening: { json: base({ rightsConfirmed: false, items: [{ type: "lesson", title: "From Skool", source: "skool", text: "My lesson." }] }) } });
  assert.equal(r.code, 1);
  assert.match(r.out, /rightsConfirmed/);
  assert.match(r.out, /no members' words, names or faces/);
});

test("accessibility: videos need captions or a description, audio a transcript, images alt text", () => {
  const r = run({ evening: { json: base({ items: [
    { type: "video", title: "Talking", source: "skool", file: "v.mp4" },
    { type: "audio", title: "Voice", source: "bianno", file: "a.mp3" },
    { type: "image", title: "Picture", source: "fable", file: "p.webp" },
  ] }), files: { "v.mp4": "x", "a.mp3": "y", "p.webp": "z" } } });
  assert.equal(r.code, 1);
  assert.match(r.out, /needs "captions"/);
  assert.match(r.out, /needs a "transcript"/);
  assert.match(r.out, /needs "alt"/);
  assert.equal(r.data, null, "a pack with problems doesn't change the app's list");
});

test("folders starting with _ are ignored, and bad JSON is reported plainly", () => {
  const r = run({ _template: { json: base({ id: "_template", items: [] }) }, broken: { json: "{ not json" } });
  assert.equal(r.code, 1);
  assert.match(r.out, /isn't valid JSON/);
  assert.doesNotMatch(r.out, /_template/);
});
