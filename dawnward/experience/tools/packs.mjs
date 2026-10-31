// Members' content packs: what Bianno makes on their own computer (writing with
// Claude Opus, animation with Fable, their own Skool lessons) becomes members' content
// in the app. Nothing here calls a paid service; it checks and copies files.
//
//   node tools/packs.mjs            check every pack and build the app's list
//   node tools/packs.mjs --drafts   also include unreviewed items, marked "Draft"
//
// Packs live in dawnward/content/packs/<pack-id>/pack.json with their files beside it.
// Folders starting with "_" (like _template) are ignored.
import { readdirSync, readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync, statSync, rmSync, renameSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
// the folders can be moved for tests
const PACKS_DIR = process.env.DW_PACKS_DIR ?? join(HERE, "../../content/packs");
const OUT_ASSETS = process.env.DW_PACKS_ASSETS ?? join(HERE, "../assets/packs"), STAGE = `${OUT_ASSETS}.staging`;
const OUT_DATA = process.env.DW_PACKS_DATA ?? join(HERE, "../src/packs.data.js");

const PLACES = ["library", "creative", "spiritual", "knowledge", "ai", "mind", "body", "soul", "spirit", "future"];
const SOURCES = { opus: "Written with Claude Opus, reviewed by Bianno", fable: "Animated with Fable", skool: "From Bianno's Skool community", bianno: "By Bianno" };
const TYPES = ["lesson", "video", "audio", "worksheet", "image"];
const FILES = { video: [".mp4", ".webm"], audio: [".mp3", ".m4a", ".ogg", ".wav"], worksheet: [".pdf"], image: [".webp", ".png", ".jpg", ".jpeg"], captions: [".vtt"], cover: [".webp", ".png", ".jpg", ".jpeg"] };
const BIG = 12 * 1024 * 1024; // bigger than this should be hosted, not shipped inside the app

export function buildPacks({ drafts = false, quiet = false } = {}) {
  const errors = [], warnings = [], packs = [];
  const say = (...a) => { if (!quiet) console.log(...a); };
  if (!existsSync(PACKS_DIR)) { write([]); return { packs, errors, warnings }; }
  rmSync(STAGE, { recursive: true, force: true }); mkdirSync(STAGE, { recursive: true });
  for (const dir of readdirSync(PACKS_DIR).sort()) {
    const base = join(PACKS_DIR, dir);
    if (dir.startsWith("_") || dir.startsWith(".") || !statSync(base).isDirectory()) continue;
    const where = `content/packs/${dir}`;
    const err = (m) => errors.push(`${where}: ${m}`), warn = (m) => warnings.push(`${where}: ${m}`);
    let p;
    try { p = JSON.parse(readFileSync(join(base, "pack.json"), "utf8")); } catch (e) { err(`pack.json is missing or isn't valid JSON (${e.message})`); continue; }
    if (p.id !== dir) err(`"id" must match the folder name ("${dir}")`);
    if (!p.title) err(`needs a "title"`);
    if (!p.summary) err(`needs a "summary" (one or two plain sentences)`);
    if (!PLACES.includes(p.place)) err(`"place" must be one of: ${PLACES.join(", ")}`);
    if (!["free", "plus"].includes(p.access ?? "plus")) err(`"access" must be "plus" (members) or "free"`);
    if (p.rightsConfirmed !== true || !p.rights) err(`needs "rights" (who owns this) and "rightsConfirmed": true. Only content you own: never Skool members' posts, comments, names or photos`);
    if (!Array.isArray(p.items) || !p.items.length) err(`needs at least one item`);
    const copy = (file, kinds, label) => {
      if (!file) return null;
      if (!kinds.includes(extname(file).toLowerCase())) { err(`${label} "${file}" should be one of ${kinds.join(" ")}`); return null; }
      const src = join(base, file);
      if (!existsSync(src)) { err(`${label} "${file}" isn't in the folder`); return null; }
      const size = statSync(src).size;
      if (size > BIG) warn(`${label} "${file}" is ${(size / 1048576).toFixed(1)} MB. Host it and use "url" instead, or the app grows by that much`);
      mkdirSync(join(STAGE, dir), { recursive: true });
      copyFileSync(src, join(STAGE, dir, file));
      return `packs/${dir}/${file}`;
    };
    const items = [];
    (p.items ?? []).forEach((it, i) => {
      const at = `item ${i + 1}${it.title ? ` ("${it.title}")` : ""}`;
      if (!TYPES.includes(it.type)) return err(`${at}: "type" must be one of ${TYPES.join(", ")}`);
      if (!it.title) err(`${at}: needs a "title"`);
      if (!SOURCES[it.source]) err(`${at}: "source" must be one of ${Object.keys(SOURCES).join(", ")}`);
      const text = [it.text, it.transcript, it.description].filter(Boolean).join(" ");
      if (/—/.test(text + (it.title ?? ""))) warn(`${at}: uses an em-dash; the house style avoids them`);
      // AI-written words need a person's review before members see them
      const needsReview = it.source === "opus" && (it.type === "lesson" || it.transcript || it.text);
      const reviewed = it.reviewed?.by && /^\d{4}-\d{2}-\d{2}$/.test(it.reviewed?.on ?? "");
      if (needsReview && !reviewed) {
        if (!drafts) { warn(`${at}: written with Opus but not reviewed yet ("reviewed": {"by": "Bianno", "on": "YYYY-MM-DD"}). Left out until it is`); return; }
        warn(`${at}: unreviewed, included as a draft`);
      }
      if (it.source === "skool") warn(`${at}: from Skool. Check it's your own lesson or post, with no members' words, names or faces`);
      const out = { type: it.type, title: it.title, source: it.source, credit: SOURCES[it.source], draft: needsReview && !reviewed ? true : undefined, minutes: it.minutes };
      if (it.type === "lesson") { if (!it.text) err(`${at}: a lesson needs "text" (blank lines between paragraphs)`); out.paragraphs = String(it.text ?? "").split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean); }
      if (it.type === "video" || it.type === "audio") {
        if (it.url) { if (!/^https:\/\//.test(it.url)) err(`${at}: "url" must start with https://`); out.url = it.url; }
        else out.src = copy(it.file, FILES[it.type], `${at} file`);
        if (!it.url && !it.file) err(`${at}: needs "file" (in the folder) or "url" (hosted)`);
      }
      if (it.type === "video") {
        if (it.captions) out.captions = copy(it.captions, FILES.captions, `${at} captions`);
        else if (it.noSpeech) { if (!it.description) err(`${at}: a video without speech needs a "description" of what happens, for people who can't see it`); }
        else err(`${at}: a video needs "captions" (a .vtt file), or "noSpeech": true with a "description"`);
        if (it.poster) out.poster = copy(it.poster, FILES.image, `${at} poster`);
        out.description = it.description; out.transcript = it.transcript;
      }
      if (it.type === "audio") { if (!it.transcript) err(`${at}: audio needs a "transcript"`); out.transcript = it.transcript; }
      if (it.type === "worksheet") out.src = copy(it.file, FILES.worksheet, `${at} file`);
      if (it.type === "image") { out.src = copy(it.file, FILES.image, `${at} file`); if (it.alt === undefined) err(`${at}: an image needs "alt" (or "alt": "" if it's only decoration)`); out.alt = it.alt ?? ""; }
      items.push(out);
    });
    const cover = p.cover ? copy(p.cover, FILES.cover, "cover") : null;
    if (items.length) packs.push({ id: p.id, title: p.title, summary: p.summary, place: p.place, access: p.access ?? "plus", cover, coverAlt: p.coverAlt ?? "", added: p.added, items });
    say(`${items.length ? "✓" : "–"} ${dir}: ${items.length} item${items.length === 1 ? "" : "s"}`);
  }
  // only a clean check replaces what the app has: files and list together
  if (!errors.length) { rmSync(OUT_ASSETS, { recursive: true, force: true }); renameSync(STAGE, OUT_ASSETS); write(packs); } else rmSync(STAGE, { recursive: true, force: true });
  for (const w of warnings) say("  note:", w);
  for (const e of errors) say("  FIX:", e);
  say(errors.length ? `\n${errors.length} thing${errors.length === 1 ? "" : "s"} to fix; the app's list wasn't changed.` : `\n${packs.length} pack${packs.length === 1 ? "" : "s"} ready for the app.`);
  return { packs, errors, warnings };
}

function write(packs) {
  writeFileSync(OUT_DATA, `// Made by tools/packs.mjs from content/packs. Don't edit by hand.\nexport const PACKS = ${JSON.stringify(packs, null, 2)};\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = buildPacks({ drafts: process.argv.includes("--drafts") });
  process.exit(r.errors.length ? 1 : 0);
}
