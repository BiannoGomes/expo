async function handler(request, env) {
  // JARVIS LINE — Bianno's private WhatsApp channel to Jarvis. Runs as a Kapso Function
  // (Cloudflare runtime, free tier). Contract: starts with `async function handler(request, env)`,
  // no exports, returns a Response. Doctrine: jarvis/whatsapp/WHATSAPP.md.
  //
  // Secrets (set in Kapso function settings, never in code or the repo):
  //   OWNER_WA            Bianno's WhatsApp number, digits only incl. country code
  //   WEBHOOK_SECRET      Kapso webhook signing secret
  //   KAPSO_API_KEY       Kapso project API key (used only to reply to OWNER_WA)
  //   PHONE_NUMBER_ID     the Jarvis line's Meta phone_number_id
  //   OPENROUTER_API_KEY  powers Jev (router) and the brain
  //   BRAIN_MODEL         OpenRouter model id for answers/drafts
  //   SYNC_KEY            long random string; lets desktop Claude export the inbox
  // Optional: JEV_MODEL (default typesafe/jev-1.13), KAPSO_API_BASE_URL.

  const KAPSO = (env.KAPSO_API_BASE_URL || 'https://api.kapso.ai').replace(/\/+$/, '');
  const OR_API = 'https://openrouter.ai/api/v1/chat/completions';
  const JEV = env.JEV_MODEL || 'typesafe/jev-1.13';
  const ROUTES = ['ANSWER', 'DRAFT', 'CAPTURE', 'DEEP_WORK'];
  const ROUTE_THRESHOLD = 0.85;
  const MAX_HIST = 12, MAX_INBOX = 200, WA_LIMIT = 3800;

  const digits = (s) => String(s || '').replace(/\D/g, '');
  const OWNER = digits(env.OWNER_WA);
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
  const now = () => Date.now();

  function safeEqual(a, b) {
    a = String(a || ''); b = String(b || '');
    if (!a || a.length !== b.length) return false;
    let r = 0;
    for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return r === 0;
  }

  async function hmacHex(secret, body) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
    return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function kvGet(key, fallback) {
    try { const v = await env.KV.get(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; }
  }
  const kvPut = (key, val) => env.KV.put(key, JSON.stringify(val));

  // The ONLY outbound path. It refuses any recipient except the owner — this line never
  // messages customers, leads or anyone else (GODMODE: publish/send/pay stays Bianno's tap).
  async function sendToOwner(to, text) {
    if (!OWNER || digits(to) !== OWNER) throw new Error('refused: Jarvis line only messages its owner');
    const chunks = [];
    let rest = String(text || '').trim() || '…';
    while (rest.length > WA_LIMIT) {
      let cut = rest.lastIndexOf('\n', WA_LIMIT);
      if (cut < WA_LIMIT / 2) cut = WA_LIMIT;
      chunks.push(rest.slice(0, cut)); rest = rest.slice(cut).trim();
    }
    chunks.push(rest);
    for (const body of chunks) {
      const r = await fetch(`${KAPSO}/meta/whatsapp/v24.0/${env.PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: { 'X-API-Key': env.KAPSO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: OWNER, type: 'text', text: { body, preview_url: false } }),
      });
      if (!r.ok) throw new Error('send failed ' + r.status);
    }
  }

  async function openrouter(model, messages, maxTokens) {
    if (!env.OPENROUTER_API_KEY) throw new Error('no OPENROUTER_API_KEY');
    const r = await fetch(OR_API, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/BiannoGomes',
        'X-Title': 'Jarvis line',
      },
      body: JSON.stringify({ model, messages, temperature: 0, max_tokens: maxTokens }),
    });
    if (!r.ok) throw new Error('openrouter ' + r.status);
    const out = await r.json();
    return String(out.choices?.[0]?.message?.content || '').trim();
  }

  // S1 REFLEX — deterministic fallback router. Used when Jev is unavailable.
  function keywordRoute(t) {
    const s = t.toLowerCase();
    if (/^(idea|note|remember|save|capture|ideia|nota)\b|^https?:\/\//.test(s)) return 'CAPTURE';
    if (/\b(draft|write|reply to|follow[- ]?up|caption|email|post|message for|escreve|rascunho)\b/.test(s)) return 'DRAFT';
    if (/\b(research|build|plan|analy[sz]e|deep|strategy|teardown|investigate|pesquisa)\b/.test(s)) return 'DEEP_WORK';
    return 'ANSWER';
  }

  // S1 REFLEX — Jev picks the path (registry judge: message_route). A judge scores; it never acts.
  async function route(text) {
    const t0 = now();
    try {
      const raw = await openrouter(JEV, [{
        role: 'user',
        content: 'You are a decision function. Answer with JSON only: {"choice": <one of the options>, "probabilities": {<option>: <0..1>, ...}}\n' +
          'QUESTION: What does Bianno want done with this WhatsApp message to his assistant? ANSWER = reply now in chat; DRAFT = produce copy he will send himself; CAPTURE = store an idea/link/note for later; DEEP_WORK = multi-step research or build for the deep brain.\n' +
          'OPTIONS: ' + JSON.stringify(ROUTES) + '\nSTATE:\n' + JSON.stringify({ message: text.slice(0, 1500) }),
      }], 60);
      const data = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
      const choice = ROUTES.includes(data.choice) ? data.choice : null;
      const conf = choice ? Number((data.probabilities || {})[choice] || 0) : 0;
      if (!choice) throw new Error('bad choice');
      const lane = conf >= ROUTE_THRESHOLD ? 'proceed' : conf >= 0.5 ? 'review' : 'blocked';
      // review/blocked never escalate to action: fall back to the deterministic router,
      // and a blocked decision only ever stores the message.
      const final = lane === 'proceed' ? choice : lane === 'review' ? keywordRoute(text) : 'CAPTURE';
      return { choice: final, judged: choice, confidence: conf, lane, source: 'jev', ms: now() - t0 };
    } catch (e) {
      return { choice: keywordRoute(text), judged: null, confidence: null, lane: 'fallback', source: 'keywords', ms: now() - t0 };
    }
  }

  // CAG layer — the cached context every answer starts from. Public-repo facts only.
  const CONTEXT = [
    'You are JARVIS, chief of staff to Bianno Gomes (27, deckhand on M/Y Goldrush in Palma, building UnifyOps — AI front desk for dental clinics in Portugal — plus the UnifyMind books brand).',
    'Prime directive: move him toward self-sustaining income THIS month. Buyer conversations beat building systems.',
    'Rules: verdict first, then at most 3 short reasons. ONE next action, doable within 48h. Real numbers only — if you do not know a figure, say UNKNOWN. Never invent metrics, testimonials or proof.',
    'You cannot send, post, publish, pay or contact anyone. You only talk to Bianno. Anything outward is a DRAFT he sends himself — never claim something was sent.',
    'UnifyOps offer ladder (locked): €97 missed-call audit (live on Stripe) → €1,500–2,500 AI Front Desk setup → €500/month retainer floor. Guarantee: 5 new bookings in 30 days or the next month is free. Prices change only by a decision on the rail, never in chat.',
    'Current bottleneck: the Wave 7 clinic follow-ups are drafted but unsent; the demo page goes live once GitHub Pages is switched to "GitHub Actions".',
    'Style: WhatsApp-friendly — short lines, *bold* for the verdict, no headers, no tables, British English, warm and direct, zero hype. Portuguese when he writes in Portuguese. Keep replies under 900 characters unless he asks for long.',
  ].join('\n');

  async function brain(mode, text, hist) {
    if (!env.BRAIN_MODEL) return '⚙️ Brain not configured yet — set BRAIN_MODEL in the Kapso function settings.';
    const task = mode === 'DRAFT'
      ? 'Produce a copy-paste-ready draft for what he asks. Start with "📝 DRAFT — check it, then send it yourself:" then the draft only.'
      : 'Answer him directly.';
    const messages = [{ role: 'system', content: CONTEXT + '\n' + task }]
      .concat(hist.map((h) => ({ role: h.r === 'b' ? 'user' : 'assistant', content: h.t })))
      .concat([{ role: 'user', content: text }]);
    return openrouter(env.BRAIN_MODEL, messages, mode === 'DRAFT' ? 900 : 600);
  }

  function extractText(m) {
    const k = m.kapso || {};
    if (m.type === 'text' && m.text?.body) return { text: m.text.body, voice: false };
    if (m.type === 'audio') return { text: k.transcript?.text || '', voice: true };
    if (m.type === 'interactive') {
      const r = m.interactive?.button_reply || m.interactive?.list_reply;
      if (r) return { text: r.title, voice: false };
    }
    if (m.type === 'button' && m.button) return { text: m.button.text, voice: false };
    const caption = k.message_type_data?.caption || m.image?.caption || m.document?.caption || m.video?.caption;
    if (caption) return { text: caption + (k.media_url ? '\n[media: ' + k.media_url + ']' : ''), voice: false };
    if (k.content) return { text: k.content, voice: false };
    return { text: '', voice: false };
  }

  function messagesFrom(payload) {
    const items = Array.isArray(payload.data) ? payload.data
      : payload.message ? [{ message: payload.message, conversation: payload.conversation }] : [];
    if (payload.type && payload.type !== 'whatsapp.message.received') return [];
    return items
      .map((it) => it.message || {})
      .filter((m) => m.id && (m.kapso?.direction ? m.kapso.direction === 'inbound' : true))
      .map((m) => ({ id: m.id, from: digits(m.from || m.kapso?.phone_number), ...extractText(m) }));
  }

  async function addInbox(kind, text, judged) {
    const inbox = await kvGet('inbox', []);
    const id = (await kvGet('seq', 0)) + 1;
    await kvPut('seq', id);
    inbox.push({ id, kind, text: text.slice(0, 4000), ts: now(), status: 'open', judged });
    while (inbox.length > MAX_INBOX) inbox.shift();
    await kvPut('inbox', inbox);
    return { id, open: inbox.filter((i) => i.status === 'open').length };
  }

  async function command(text) {
    const [cmd, arg] = text.trim().split(/\s+/, 2);
    const inbox = await kvGet('inbox', []);
    const open = inbox.filter((i) => i.status === 'open');
    if (cmd === '/help') return '*Jarvis line*\nTalk or send voice notes — I route them.\n/inbox — open items\n/done N — close item N\n/clear — forget chat history\nSay "draft …" for copy you send yourself, "idea …" to save, "research …" for deep work.';
    if (cmd === '/inbox') {
      if (!open.length) return '📥 Inbox empty.';
      return '📥 *' + open.length + ' open*\n' + open.slice(-15).map((i) => `#${i.id} ${i.kind === 'DEEP_WORK' ? '🧠' : i.kind === 'DRAFT' ? '📝' : '💡'} ${i.text.slice(0, 70)}`).join('\n');
    }
    if (cmd === '/done') {
      const it = inbox.find((i) => String(i.id) === String(arg));
      if (!it) return 'No item #' + arg + '.';
      it.status = 'done'; it.closed = now();
      await kvPut('inbox', inbox);
      return '✅ Closed #' + it.id + '.';
    }
    if (cmd === '/clear') { await kvPut('hist', []); return '🧹 Chat history cleared. Inbox untouched.'; }
    return 'Unknown command. /help';
  }

  // ---- export for desktop sync (vault/_inbox) — authenticated, read-only ----
  if (request.method === 'GET') {
    const url = new URL(request.url);
    if (url.searchParams.get('export') === 'inbox') {
      if (!env.SYNC_KEY || !safeEqual(request.headers.get('x-jarvis-key'), env.SYNC_KEY)) return json({ error: 'unauthorized' }, 401);
      return json({ inbox: await kvGet('inbox', []), stats: await kvGet('stats', {}) });
    }
    return json({ ok: true, line: 'jarvis' });
  }
  if (request.method !== 'POST') return json({ error: 'method' }, 405);

  // ---- inbound webhook: verify before anything else; fail closed ----
  const raw = await request.text();
  if (!env.WEBHOOK_SECRET || !OWNER) return json({ error: 'not configured' }, 503);
  const sig = String(request.headers.get('x-webhook-signature') || '').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(sig) || !safeEqual(sig, await hmacHex(env.WEBHOOK_SECRET, raw))) {
    return json({ error: 'invalid signature' }, 401);
  }
  let payload;
  try { payload = JSON.parse(raw); } catch (_) { return json({ error: 'bad json' }, 400); }

  const stats = await kvGet('stats', { handled: 0, ignored: 0, routes: {} });
  const results = [];
  for (const m of messagesFrom(payload)) {
    // Owner-only: anyone else is ignored silently and nothing they wrote is stored.
    if (m.from !== OWNER) { stats.ignored++; results.push({ id: m.id, ignored: true }); continue; }
    if (await env.KV.get('seen:' + m.id)) { results.push({ id: m.id, duplicate: true }); continue; }
    await env.KV.put('seen:' + m.id, '1', { expirationTtl: 86400 });

    let reply;
    if (!m.text) {
      reply = m.voice ? "🎙️ Couldn't transcribe that one — type it, or try again." : 'Got it, but I can only read text and voice notes so far.';
    } else if (m.text.trim().startsWith('/')) {
      reply = await command(m.text);
    } else {
      const r = await route(m.text);
      stats.routes[r.choice] = (stats.routes[r.choice] || 0) + 1;
      const hist = await kvGet('hist', []);
      const tag = (m.voice ? '🎙️ ' : '');
      if (r.choice === 'CAPTURE') {
        const s = await addInbox('CAPTURE', m.text, r);
        reply = `${tag}💡 Saved as #${s.id}. ${s.open} open in /inbox.`;
      } else if (r.choice === 'DEEP_WORK') {
        const s = await addInbox('DEEP_WORK', m.text, r);
        reply = `${tag}🧠 Queued for deep work as #${s.id}. Next time you open Claude, say "sync whatsapp" and it gets done properly.`;
      } else {
        try {
          reply = await brain(r.choice, m.text, hist);
          if (r.choice === 'DRAFT') await addInbox('DRAFT', m.text + '\n---\n' + reply, r);
        } catch (e) {
          const s = await addInbox(r.choice, m.text, r);
          reply = `${tag}⚠️ Brain offline (${String(e.message).slice(0, 40)}). Saved as #${s.id} so nothing is lost.`;
        }
      }
      hist.push({ r: 'b', t: m.text.slice(0, 2000) }, { r: 'j', t: String(reply).slice(0, 2000) });
      await kvPut('hist', hist.slice(-MAX_HIST));
    }
    try {
      await sendToOwner(m.from, reply);
      stats.handled++;
      results.push({ id: m.id, replied: true });
    } catch (e) {
      stats.sendErrors = (stats.sendErrors || 0) + 1;
      results.push({ id: m.id, replied: false, error: String(e.message).slice(0, 80) });
    }
  }
  await kvPut('stats', stats);
  return json({ ok: true, results });
}
