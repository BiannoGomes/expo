// Desktop sync: pulls the Jarvis-line inbox into the Obsidian vault so deep work gets done.
// Run on the laptop (Cowork) when Bianno says "sync whatsapp":
//   JARVIS_LINE_URL=<function endpoint> SYNC_KEY=<from .env> VAULT_INBOX=<vault>/_inbox node jarvis/whatsapp/sync.mjs
// Read-only against the line. Secrets come from the environment (.env), never from this file.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const { JARVIS_LINE_URL, SYNC_KEY, VAULT_INBOX } = process.env;
if (!JARVIS_LINE_URL || !SYNC_KEY || !VAULT_INBOX) {
  console.error('Set JARVIS_LINE_URL, SYNC_KEY and VAULT_INBOX (see jarvis/whatsapp/WHATSAPP.md).');
  process.exit(1);
}
const url = new URL(JARVIS_LINE_URL);
url.searchParams.set('export', 'inbox');
const res = await fetch(url, { headers: { 'x-jarvis-key': SYNC_KEY }, redirect: 'error' });
if (!res.ok) { console.error('Export failed:', res.status); process.exit(1); }
const { inbox = [], stats = {} } = await res.json();
const open = inbox.filter((i) => i.status === 'open');

mkdirSync(VAULT_INBOX, { recursive: true });
const day = new Date().toISOString().slice(0, 10);
const file = join(VAULT_INBOX, `whatsapp-${day}.md`);
const icon = { DEEP_WORK: '🧠', DRAFT: '📝', CAPTURE: '💡', ANSWER: '💬' };
const lines = [
  '---', 'source: jarvis-line', `synced: ${new Date().toISOString()}`, 'tags: [inbox, whatsapp]', '---',
  `# WhatsApp inbox — ${day}`,
  `${open.length} open · routes so far: ${JSON.stringify(stats.routes || {})}`, '',
  ...open.map((i) => `## ${icon[i.kind] || '•'} #${i.id} ${i.kind} — ${new Date(i.ts).toISOString().slice(0, 16)}\n${i.text}\n`),
  '> Deep-work items: Claude classifies and works them under the usual gates. Close on the line with /done N.',
];
writeFileSync(file, lines.join('\n'), 'utf8');
console.log(`${existsSync(file) ? 'Wrote' : 'Failed'} ${file} — ${open.length} open (${open.filter((i) => i.kind === 'DEEP_WORK').length} deep work).`);
