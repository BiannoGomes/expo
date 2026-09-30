#!/usr/bin/env node
// check-facts: every number, date, percentage and quote that appears on screen must trace to
// an APPROVED row in the project's facts.md ledger. Zero dependencies (Node 18+).
//
// usage: node check-facts.mjs <project-dir> [--ledger facts.md] [--json]
// exit:  0 = clean · 1 = unverified claims or unapproved facts · 2 = usage / ledger error
//
// Two mechanisms:
//   1. Bound facts:  <span data-fact="book1-rating">4.8</span>  → text must equal the ledger value exactly.
//   2. Claim sweep:  every numeric/date/percent/currency token and every quoted phrase in visible
//                    text (and in display strings inside <script>) must appear inside some approved value.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i === -1 ? null : args[i + 1]; };
const dir = args.find((a) => !a.startsWith('--') && a !== flag('--ledger'));
const asJson = args.includes('--json');
if (!dir) { console.error('usage: node check-facts.mjs <project-dir> [--ledger facts.md] [--json]'); process.exit(2); }

const ledgerPath = join(dir, flag('--ledger') ?? 'facts.md');
if (!existsSync(ledgerPath)) { console.error(`No ledger at ${ledgerPath}. Copy templates/facts.md into the project first.`); process.exit(2); }

// ---- ledger: the first markdown table whose header has id | value | source | approved -------------
function parseLedger(md) {
  const rows = [];
  let cols = null;
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line.startsWith('|')) { if (cols && rows.length) break; continue; }
    const cells = line.slice(1, line.endsWith('|') ? -1 : undefined).split('|').map((c) => c.trim());
    if (!cols) {
      const lower = cells.map((c) => c.toLowerCase());
      if (['id', 'value', 'source', 'approved'].every((k) => lower.includes(k))) cols = lower;
      continue;
    }
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
    const row = Object.fromEntries(cols.map((k, i) => [k, (cells[i] ?? '').replace(/^`|`$/g, '')]));
    if (row.id) rows.push(row);
  }
  if (!cols) throw new Error('facts.md has no table with columns: id | value | source | approved');
  return rows;
}

let facts;
try { facts = parseLedger(readFileSync(ledgerPath, 'utf8')); }
catch (e) { console.error(e.message); process.exit(2); }

const isApproved = (f) => /^(yes|y|true|✅|approved)$/i.test(f.approved);
const approved = facts.filter(isApproved);
const byId = new Map(facts.map((f) => [f.id, f]));
const norm = (s) => s.replace(/[  ]/g, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const approvedValues = approved.map((f) => norm(f.value));

// ---- files ---------------------------------------------------------------------------------------
const SKIP = new Set(['node_modules', '.git', 'renders', 'review', 'dist', '.hyperframes']);
function walk(d, out = []) {
  for (const name of readdirSync(d)) {
    if (SKIP.has(name) || name.startsWith('.')) continue;
    const p = join(d, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (['.html', '.htm'].includes(extname(name).toLowerCase())) out.push(p);
  }
  return out;
}
const files = walk(dir);

// ---- extraction ----------------------------------------------------------------------------------
const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));

function visibleText(src) {
  // Blank out script/style/comments but keep offsets so line numbers stay true.
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  let s = src.replace(/<!--[\s\S]*?-->/g, blank).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, blank);
  const chunks = [];
  const re = />([^<]+)</g;
  let m;
  while ((m = re.exec(s))) { const t = decode(m[1]); if (t.trim()) chunks.push({ text: t, line: lineOf(src, m.index) }); }
  // alt / aria-label / title attributes are on screen or read aloud too
  const attr = /\b(alt|aria-label|title)\s*=\s*"([^"]*)"/gi;
  while ((m = attr.exec(s))) if (m[2].trim()) chunks.push({ text: decode(m[2]), line: lineOf(src, m.index) });
  return chunks;
}

function scriptDisplayStrings(src) {
  // String literals inside <script> that look like display copy (contain a letter AND a space, or a %/currency sign).
  const chunks = [];
  const blocks = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let b;
  while ((b = blocks.exec(src))) {
    const body = b[1]; const base = b.index + b[0].indexOf(body);
    const lit = /(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g;
    let m;
    while ((m = lit.exec(body))) {
      const t = m[2];
      if (/[a-z]/i.test(t) && /\s/.test(t) || /[%$€£¥₹]|\bR\s?\d/.test(t)) {
        if (/^[\w.#\-\s>:()[\]="',*]+$/.test(t) && !/\d/.test(t)) continue; // selectors / class lists
        if (/^\s*[#.\[]|:nth-|::?[a-z-]+\(|\s[#.][\w-]/i.test(t)) continue;         // CSS selectors with digits
        if (/^[-\d.\s%]+(?:px|em|rem|vw|vh|deg|s|ms)?(?:\s+[-\d.]+(?:%|px|em|rem|vw|vh|deg)?)*$/i.test(t)) continue; // pure CSS values ("0% 50%")
        if (/^(power|expo|sine|circ|back|elastic|bounce|linear|none|steps)/.test(t)) continue; // eases
        chunks.push({ text: t, line: lineOf(src, base + m.index), fromScript: true });
      }
    }
  }
  return chunks;
}

// Claim tokens: currency/number/percent/multiplier/year/date/time-ish strings with at least one digit.
const MONTHS = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const CLAIM = new RegExp(
  String.raw`(?:\b\d{1,2}\s(?:${MONTHS})\s\d{4}\b)|(?:\b(?:${MONTHS})\s\d{1,2},?\s\d{4}\b)|` +
  String.raw`(?:[$€£¥₹]|\bR\s?|\bZAR\s?)?[+\-−]?\d[\d,.\s]*\d?\s?(?:%|x\b|×|k\b|K\b|m\b|M\b|bn\b|B\b|million\b|billion\b|thousand\b)?\+?`,
  'gi');
const QUOTE = /"([^"]{12,})"|“([^”]{12,})”/g;

// Numbers that are layout furniture, not claims. Extend per project with --allow "1 / 7,SWIPE".
const allow = new Set((flag('--allow') ?? '').split(',').map((s) => norm(s)).filter(Boolean));
const furniture = (tok, text) =>
  /^\d{1,2}\s?\/\s?\d{1,2}$/.test(tok) ||                    // slide counters "3 / 7"
  /^\d{1,2}$/.test(tok) && /\b\d{1,2}\s?\/\s?\d{1,2}\b/.test(text) ||
  allow.has(norm(tok));

const problems = []; const bound = []; const used = new Set();

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const rel = relative(dir, file);

  // 1. bound facts
  const bindRe = /<([a-z0-9-]+)\b[^>]*\bdata-fact\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = bindRe.exec(src))) {
    const [, , id, inner] = m; const line = lineOf(src, m.index);
    const text = decode(inner.replace(/<[^>]+>/g, '')).trim();
    const f = byId.get(id);
    used.add(id);
    if (!f) problems.push({ file: rel, line, kind: 'unknown-fact-id', detail: `data-fact="${id}" is not in the ledger` });
    else if (!isApproved(f)) problems.push({ file: rel, line, kind: 'unapproved-fact', detail: `"${id}" is not approved yet` });
    else if (norm(text) !== norm(f.value)) problems.push({ file: rel, line, kind: 'value-mismatch', detail: `"${id}" shows "${text}" but the ledger says "${f.value}"` });
    else bound.push({ file: rel, line, id });
  }

  // 2. claim sweep (bound elements were checked above, so blank them to avoid double reports)
  const swept = src.replace(bindRe, (all) => all.replace(/>([\s\S]*)</, (x) => x.replace(/[^\n<>]/g, ' ')));
  for (const c of [...visibleText(swept), ...scriptDisplayStrings(swept)]) {
    const t = norm(c.text);
    for (const q of c.text.matchAll(QUOTE)) {
      const phrase = norm(q[1] ?? q[2]);
      const qhit = approved.find((f) => norm(f.value).includes(phrase));
      if (qhit) used.add(qhit.id); else problems.push({ file: rel, line: c.line, kind: 'unsourced-quote', detail: `"${phrase}"` });
    }
    for (const tokM of c.text.matchAll(CLAIM)) {
      const tok = norm(tokM[0]).replace(/[,.\s]+$/, '');
      if (!/\d/.test(tok) || furniture(tok, t)) continue;
      const hit = approved.find((f) => norm(f.value).includes(tok));
      if (hit) { used.add(hit.id); continue; }
      problems.push({ file: rel, line: c.line, kind: 'unsourced-claim', detail: `"${tok}" in "${c.text.trim().slice(0, 80)}"${c.fromScript ? ' (script string)' : ''}` });
    }
  }
}

for (const f of facts) if (!isApproved(f)) problems.push({ file: 'facts.md', line: 0, kind: 'pending-approval', detail: `${f.id}: "${f.value}" (source: ${f.source || 'NONE'})` });
for (const f of approved) if (!f.source || /^(\?|tbd|none|ask me)$/i.test(f.source)) problems.push({ file: 'facts.md', line: 0, kind: 'missing-source', detail: `${f.id} is approved but has no source` });
const unused = approved.filter((f) => !used.has(f.id)).map((f) => f.id);

if (asJson) {
  console.log(JSON.stringify({ files: files.map((f) => relative(dir, f)), facts: facts.length, approved: approved.length, bound, unused, problems }, null, 2));
} else {
  console.log(`fact-lock · ${files.length} composition file(s) · ${approved.length}/${facts.length} facts approved · ${bound.length} bound`);
  if (!problems.length) console.log('✔ every on-screen claim traces to an approved, sourced fact');
  for (const p of problems) console.log(`✖ [${p.kind}] ${p.file}${p.line ? ':' + p.line : ''}  ${p.detail}`);
  if (unused.length) console.log(`ℹ approved but not on screen: ${unused.join(', ')}`);
}
process.exit(problems.length ? 1 : 0);
