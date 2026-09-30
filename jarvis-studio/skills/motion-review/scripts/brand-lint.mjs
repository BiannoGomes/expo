#!/usr/bin/env node
// brand-lint: static check of a composition against the brand's MOTION.md and the studio's house
// rules. Catches off-palette colours, glow, text gradients, bounce/elastic/back eases,
// scale-from-zero, typewriter text, and brand voice laws (e.g. UnifyMind's zero em-dash rule).
// Zero dependencies (Node 18+).
//
// usage: node brand-lint.mjs <project-dir> [--motion path/to/MOTION.md] [--brand path/to/brand.md] [--json]
//        (defaults: <project-dir>/MOTION.md and <project-dir>/brand.md, as placed by activate-brand)
// exit:  0 = clean (warnings allowed) · 1 = violations · 2 = usage error

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i === -1 ? null : args[i + 1]; };
const dir = args.find((a, i) => !a.startsWith('--') && !['--motion', '--brand'].includes(args[i - 1]));
if (!dir) { console.error('usage: node brand-lint.mjs <project-dir> [--motion MOTION.md] [--brand brand.md] [--json]'); process.exit(2); }
const motionPath = flag('--motion') ?? join(dir, 'MOTION.md');
const brandPath = flag('--brand') ?? join(dir, 'brand.md');
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const motion = read(motionPath); const brand = read(brandPath);
if (!motion) console.warn(`⚠ no MOTION.md at ${motionPath}. Palette checks skipped. Run activate-brand first.`);

// ---- brand rules, parsed from the files, never hard-coded ------------------------------------------
const hexes = (s) => [...s.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi)].map((m) => expand(m[0]));
function expand(h) { h = h.toLowerCase(); return h.length === 4 ? '#' + [...h.slice(1)].map((c) => c + c).join('') : h; }
const paletteRow = motion.split(/\r?\n/).find((l) => /^\|\s*1\s*\|\s*colou?r palette/i.test(l)) ?? '';
const palette = new Set(hexes(paletteRow.length ? paletteRow : ''));
const paletteKnown = palette.size > 0 && !/ASK ME/.test(paletteRow);
const all = `${brand}\n${motion}`;
const noEmDash = /zero em-?dash|no em-?dash/i.test(all);
const oneAccent = /one (gold )?accent|one gold phrase|two gold phrases/i.test(all);
const accentHex = oneAccent ? (motion.match(/`?(#[0-9a-f]{6})`?\s*gold/i)?.[1] ?? motion.match(/gold\s*`?(#[0-9a-f]{6})/i)?.[1] ?? null) : null;

// Neutrals that are never "brand colours": pure black/white used for masks, and transparent.
const NEUTRAL = new Set(['#000000', '#ffffff']);

// ---- scan ----------------------------------------------------------------------------------------
const SKIP = new Set(['node_modules', '.git', 'renders', 'review', 'dist', '.hyperframes', 'vendor', 'fonts']);
function walk(d, out = []) {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n) || n.startsWith('.')) continue;
    const p = join(d, n); const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (['.html', '.htm', '.css', '.js', '.mjs'].includes(extname(n).toLowerCase()) && !/\.min\.js$/i.test(n)) out.push(p); // skip third-party bundles
  }
  return out;
}
const lineOf = (s, i) => s.slice(0, i).split('\n').length;
const out = [];
const hit = (level, rule, file, src, idx, detail) => out.push({ level, rule, file, line: lineOf(src, idx), detail });

const RULES = [
  // [level, rule, regex, detail]
  ['error', 'glow', /filter\s*:\s*[^;]*drop-shadow\([^)]*\b([6-9]|\d{2,})px[^)]*(?:rgba?\([^)]*\)|#[0-9a-f]{3,8})\s*\)/gi, 'large drop-shadow filter reads as glow'],
  ['error', 'text-gradient', /background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text/gi, 'gradient-filled text (house rule: no text gradients)'],
  ['error', 'bounce-ease', /\b(?:bounce|elastic|back)(?:\.(?:in|out|inOut))?\b(?=['"`(])|cubic-bezier\(\s*[\d.]+\s*,\s*-[\d.]+|cubic-bezier\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*1\.[1-9]/gi, 'bounce/elastic/back or overshooting bezier (house rule: no meaningless bounce; brand must justify overshoot)'],
  ['error', 'scale-from-zero', /\bscale\s*:\s*0(?:\.0+)?\s*[,}]|\bscale\(\s*0(?:\.0+)?\s*\)/gi, 'animating from scale 0 (house rule: never scale from zero; start at 0.9–0.97 + opacity 0)'],
  ['warn', 'axis-scale-from-zero', /\bscale[XY]\s*:\s*0(?:\.0+)?\s*[,}]|\bscale[XY]\(\s*0(?:\.0+)?\s*\)/g, 'one-axis scale from 0: fine for a line or rule drawing itself on, not for a 2-D element popping in'],
  ['warn', 'typewriter', /TextPlugin|typewriter|\.split\(\s*['"]{2}\s*\)[\s\S]{0,120}?(?:stagger|setTimeout|delay)/gi, 'possible typewriter reveal (house rule: no typewriter text, except inside a real product input box)'],
  ['warn', 'purple-blue', /linear-gradient\([^)]*(?:#(?:6[0-9a-f]|7[0-9a-f]|8[0-9a-f])[0-9a-f]{2}(?:e|f)[0-9a-f]|purple|violet)[^)]*(?:#[0-9a-f]{2}[0-9a-f]{2}f[0-9a-f]|blue)/gi, 'purple-to-blue gradient (house rule: never the default background)'],
  ['warn', 'setTimeout-clock', /setTimeout\(|setInterval\(|requestAnimationFrame\(/g, 'wall-clock timing: deterministic renders need one seekable timeline (GSAP timeline or window.seek)'],
  ['warn', 'unseeded-random', /Math\.random\(\)/g, 'unseeded randomness: renders will differ run to run; use a seeded PRNG'],
];

const files = walk(dir);
for (const f of files) {
  const src = readFileSync(f, 'utf8'); const rel = relative(dir, f);
  for (const [level, rule, re, detail] of RULES) for (const m of src.matchAll(re)) hit(level, rule, rel, src, m.index, `${detail}: \`${m[0].slice(0, 60)}\``);
  // glow: any text-shadow / box-shadow on text with blur radius >= 3px (offset-x offset-y BLUR)
  for (const m of src.matchAll(/text-shadow\s*:\s*([^;}"']+)/gi)) {
    const blurs = [...m[1].matchAll(/(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)px/g)].map((b) => +b[3]);
    if (blurs.some((b) => b >= 3)) hit('error', 'glow', rel, src, m.index, `text-shadow blur ${Math.max(...blurs)}px reads as glow (house rule: no generic AI glow): \`${m[0].slice(0, 60)}\``);
  }

  if (paletteKnown) {
    const seen = new Map();
    for (const m of src.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b(?![0-9a-f])/gi)) {
      const h = expand(m[0]);
      if (palette.has(h) || NEUTRAL.has(h)) continue;
      if (!seen.has(h)) seen.set(h, m.index);
    }
    for (const [h, idx] of seen) hit('error', 'off-palette', rel, src, idx, `${h} is not in MOTION.md field 1 (palette: ${[...palette].join(' ')})`);
  }

  if (/\.html?$/i.test(f)) {
    const visible = src.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (m) => m.replace(/[^\n]/g, ' ')).replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
    if (noEmDash) for (const m of visible.matchAll(/>[^<]*—[^<]*</g)) hit('error', 'em-dash', rel, src, m.index, `brand voice law: zero em-dashes, found in "${m[0].slice(1, 70).trim()}"`);
    if (noEmDash) for (const m of src.matchAll(/(['"`])[^'"`\n]*—[^'"`\n]*\1/g)) hit('error', 'em-dash', rel, src, m.index, `brand voice law: zero em-dashes (script string ${m[0].slice(0, 60)})`);
    if (accentHex) {
      const n = (src.match(new RegExp(`class="[^"]*\\b(?:gold|accent)\\b`, 'g')) ?? []).length;
      if (n > 1) hit('warn', 'one-accent', rel, src, 0, `${n} elements carry an accent/gold class: the brand allows ONE accent phrase per frame; verify no two are on screen together`);
    }
  }
}

const errors = out.filter((o) => o.level === 'error');
if (args.includes('--json')) console.log(JSON.stringify({ palette: [...palette], paletteKnown, noEmDash, files: files.map((f) => relative(dir, f)), findings: out }, null, 2));
else {
  console.log(`brand-lint · ${files.length} file(s) · palette ${paletteKnown ? [...palette].join(' ') : 'UNKNOWN (ASK ME)'}${noEmDash ? ' · zero-em-dash law' : ''}`);
  if (!out.length) console.log('✔ no house-rule or brand violations found (static check only; still review frames)');
  for (const o of out) console.log(`${o.level === 'error' ? '✖' : '⚠'} [${o.rule}] ${o.file}:${o.line}  ${o.detail}`);
}
process.exit(errors.length ? 1 : 0);
