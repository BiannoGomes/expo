/*!
 * Night Watch · the Becoming house score, as a standalone browser module.
 *
 * Extracted from Jarvis Studio (renderWatch() and its helpers hz, NOTE, rng, clamp, irBuffer, masterTo,
 * MOODS.watch). The synthesis code is copied unchanged; the only edits are the optional cue fields below, and
 * each one defaults to the studio's behaviour. With no optional fields a cue renders the same samples as the studio.
 *
 * Global API (no dependencies; needs OfflineAudioContext, so run it in a browser or headless Chromium):
 *   NightWatch.render(cue, sampleRate = 48000) -> Promise<AudioBuffer>   stereo, mastered to -14 LUFS, faded out
 *   NightWatch.toWav(audioBuffer, { bits = 16 }) -> ArrayBuffer           RIFF/WAVE; 16-bit PCM (default) or 32-bit float
 *
 * Cue (JSON):
 *   kind      "watch" (optional; any other value is rejected)
 *   duration  seconds (required)
 *   turns     [t, ...] each turn: the tick races in, stops dead 0.42 s before t, and the hit lands on t
 *   card      [start, end] | null   the title card: the biggest hit (D bell), no tick or heartbeat under it, D major pad
 *   land      seconds | null        landing sting E-D-A plus a soft low D at land + 0.64; the tick slows to silence after it
 *   fade      seconds of fade-out at the end
 * Optional (decision 9 of the foundation spec; defaults reproduce today's output exactly):
 *   stingAt   opening sting A-E-D start time (default 0). null or false: no opening sting
 *   tickFrom  first tick time (default 0.9)
 *   ticks     watch tick and its echo (default true)
 *   heartbeat soft body thump (default true)
 *   pad       detuned triangle pad (default true)
 *   sea       synthetic sea bed (default true)
 *   hits      riser, thump, crack and low bell on each turn (default true). The dead stop stays with the turn.
 *
 * Rules kept by the engine: no piano; nothing below 60 Hz (master high-pass); no sub drones; identity between
 * 200 Hz and 4 kHz. Toggling a layer never changes another layer's random texture (the PRNG is consumed the same way).
 */
(function (root) {
  "use strict";

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const NOTE = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
  const hz = n => { const m = /^([A-G][#b]?)(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + 12 * (+m[2] + 1) - 69) / 12); };
  const MOODS = {
    watch: { kind: "watch", bpm: 60 }, // Night Watch: no piano. A watch tick that races, stops dead and hits on every turn
  };
  const DEFAULTS = Object.freeze({ stingAt: 0, tickFrom: 0.9, ticks: true, heartbeat: true, pad: true, sea: true, hits: true });

  function irBuffer(ac, rt = 3.0) {
    const n = Math.floor(rt * ac.sampleRate), pre = Math.floor(0.025 * ac.sampleRate), buf = ac.createBuffer(2, n + pre, ac.sampleRate), r = rng(3);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); let lp = 0; for (let i = 0; i < n; i++) { const x = r() * 2 - 1; lp = lp * 0.55 + x * 0.45; d[i + pre] = lp * Math.exp((-6.91 * i) / n); } }
    return buf;
  }

  // Loudness: BS.1770-style gated blocks (400 ms, -70 LUFS absolute and -10 LU relative gates) to the target, a soft ceiling near -1 dBFS, and a fade-out
  function masterTo(L, R, SR, target, fadeS) {
    const N = L.length, blk = Math.round(0.4 * SR), hop = Math.round(0.1 * SR), pw = [];
    for (let s0 = 0; s0 + blk <= N; s0 += hop) { let acc = 0; for (let i = s0; i < s0 + blk; i += 2) acc += L[i] * L[i] + R[i] * R[i]; pw.push(acc / (blk / 2)); }
    const lk = z => -0.691 + 10 * Math.log10(z + 1e-12), mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
    const g1 = pw.filter(z => lk(z) > -70), gate = lk(mean(g1)) - 10, g2 = g1.filter(z => lk(z) > gate);
    const gain = g2.length ? Math.pow(10, (target - lk(mean(g2))) / 20) : 1;
    const lim = x => { x *= gain; const ax = Math.abs(x); return ax > 0.78 ? Math.sign(x) * (0.78 + 0.08 * Math.tanh((ax - 0.78) / 0.08)) : x; }; // ceiling 0.86, about -1.3 dBFS
    const fo = fadeS * SR;
    for (let i = 0; i < N; i++) { const f = i > N - fo ? (N - i) / fo : 1; L[i] = lim(L[i]) * f; R[i] = lim(R[i]) * f; }
  }

  // Fill in the optional fields; reject anything that isn't a watch cue.
  function normCue(cue) {
    if (!cue || typeof cue !== "object") throw new Error("NightWatch: cue must be an object");
    if (cue.kind !== undefined && cue.kind !== "watch") throw new Error(`NightWatch: cue.kind must be "watch" (got ${JSON.stringify(cue.kind)})`);
    if (!(cue.duration > 0)) throw new Error("NightWatch: cue.duration must be a positive number of seconds");
    const bool = (k) => { const v = cue[k]; if (v === undefined) return DEFAULTS[k]; if (typeof v !== "boolean") throw new Error(`NightWatch: cue.${k} must be true or false`); return v; };
    const num = (k) => { const v = cue[k]; if (v === undefined) return DEFAULTS[k]; if (typeof v !== "number" || !isFinite(v) || v < 0) throw new Error(`NightWatch: cue.${k} must be a number of seconds >= 0`); return v; };
    const stingAt = cue.stingAt === null || cue.stingAt === false ? null : num("stingAt");
    const land = cue.land === undefined || cue.land === null ? null : +cue.land;
    if (land !== null && !isFinite(land)) throw new Error("NightWatch: cue.land must be a number or null");
    return {
      duration: +cue.duration, turns: Array.isArray(cue.turns) ? cue.turns.map(Number) : [], card: Array.isArray(cue.card) && cue.card.length === 2 ? cue.card.map(Number) : null,
      land, fade: cue.fade === undefined ? (cue.duration < 20 ? 1.4 : 2.5) : +cue.fade,
      stingAt, tickFrom: num("tickFrom"), ticks: bool("ticks"), heartbeat: bool("heartbeat"), pad: bool("pad"), sea: bool("sea"), hits: bool("hits"),
    };
  }

  // renderWatch() from Jarvis Studio; the `opt.*` guards are the only additions.
  async function render(rawCue, sr = 48000) {
    const cue = normCue(rawCue), opt = cue;
    const D = cue.duration, N = Math.ceil(D * sr), ac = new OfflineAudioContext(2, N, sr), r = rng(37);
    const out = ac.createGain(); out.connect(ac.destination);
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 60; hp.connect(out); // nothing below 60 Hz
    const turns = cue.turns, card = cue.card, land = cue.land === null ? Infinity : cue.land;
    // the bed: pad, sea, tick, echo, heartbeat and the reverb. It is gated almost shut for the 0.42 s before each hit (the dead stop)
    const bed = ac.createGain(); bed.connect(hp); bed.gain.setValueAtTime(1, 0);
    for (const x of turns) { bed.gain.setValueAtTime(1, x - 0.45); bed.gain.linearRampToValueAtTime(0.03, x - 0.41); bed.gain.setValueAtTime(0.03, x - 0.005); bed.gain.linearRampToValueAtTime(1, x + 0.9); }
    const conv = ac.createConvolver(); conv.buffer = irBuffer(ac, 3.6); const wet = ac.createGain(); wet.gain.value = 0.42; conv.connect(wet).connect(bed);
    const inCard = t => card && t >= card[0] && t < card[1];
    // bells: inharmonic partials, struck glass
    const bell = (f, t0, vel, decay = 2.6, pan = 0, send = 0.6) => {
      if (t0 >= D) return;
      const g = ac.createGain(), p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(hp); const s2 = ac.createGain(); s2.gain.value = send; p.connect(s2).connect(conv);
      [[1, 1, 1], [2.76, 0.42, 0.62], [5.4, 0.2, 0.4], [8.93, 0.09, 0.25]].forEach(([ratio, amp, dk]) => {
        const fr = f * ratio; if (fr > 9000) return;
        const o = ac.createOscillator(); o.frequency.value = fr; const og = ac.createGain();
        og.gain.setValueAtTime(0, t0); og.gain.linearRampToValueAtTime(vel * amp, t0 + 0.004); og.gain.setTargetAtTime(0, t0 + 0.004, decay * dk / 3);
        o.connect(og).connect(g); o.start(t0); o.stop(Math.min(D, t0 + decay * dk * 2.5));
      });
    };
    const sting = (notes, t0, gap, vel) => notes.forEach((n, i) => bell(hz(n), t0 + i * gap, vel * (1 - 0.12 * i), 2.8, [-0.25, 0.25, 0][i % 3]));
    // the watch tick: two pre-rendered clicks (tick and tock), band-limited to 1.5–4.5 kHz
    const click = (fc, len = 0.03) => {
      const n = Math.floor(len * sr), bf = ac.createBuffer(1, n, sr), d = bf.getChannelData(0); let ph = 0;
      for (let i = 0; i < n; i++) { const e = Math.exp(-i / (0.0016 * sr)), ring = Math.exp(-i / (0.006 * sr)); ph += (2 * Math.PI * fc) / sr; d[i] = (r() * 2 - 1) * e * 0.7 + Math.sin(ph) * ring * 0.5; }
      return bf;
    };
    const TICK = click(3150), TOCK = click(2350); // always built, so the PRNG stream stays the same when ticks are off
    const tickBus = ac.createGain(); tickBus.gain.value = 0.55;
    const tbp = ac.createBiquadFilter(); tbp.type = "bandpass"; tbp.frequency.value = 2700; tbp.Q.value = 0.6; tickBus.connect(tbp); tbp.connect(bed);
    // the echo comes in after the first turn
    const dl = ac.createDelay(1.2); dl.delayTime.value = 0.375; const fb = ac.createGain(); fb.gain.value = 0.38; const echo = ac.createGain(); echo.gain.setValueAtTime(0, 0);
    if (turns.length) { echo.gain.setValueAtTime(0, turns[0]); echo.gain.linearRampToValueAtTime(0.5, turns[0] + 1.5); }
    tbp.connect(echo).connect(dl); dl.connect(fb).connect(dl); const dlp = ac.createBiquadFilter(); dlp.type = "lowpass"; dlp.frequency.value = 3000; dl.connect(dlp).connect(bed);
    const tickAt = (t0, vel, tock) => { const src = ac.createBufferSource(); src.buffer = tock ? TOCK : TICK; const g = ac.createGain(); g.gain.value = vel; const p = ac.createStereoPanner(); p.pan.value = tock ? 0.12 : -0.12; src.connect(g).connect(p).connect(tickBus); src.start(t0); };
    if (opt.ticks) {
      let t = opt.tickFrom, i = 0; const outEnd = D - cue.fade * 0.5;
      while (t < outEnd) {
        if (inCard(t)) { t = card[1] + 0.4; continue; }
        const next = turns.find(x => x > t - 1e-3);
        if (next !== undefined && t > next - 0.42) { t = next + 0.7; continue; }               // stops dead before the hit
        let iv = 0.5, vel = 0.5 + 0.06 * (i % 2 === 0);
        if (next !== undefined) { const d = next - 0.42 - t; if (d < 4) { const k = 1 - d / 4; iv = 0.5 - 0.39 * k * k; vel += 0.25 * k; } } // races into the turn
        if (t >= land) { const k = clamp((t - land) / Math.max(1, outEnd - land), 0, 1); iv = 0.5 + 1.1 * k; vel *= 1 - k; if (vel < 0.03) break; } // slows to silence
        tickAt(t, vel, i % 2 === 1); t += iv; i++;
      }
    }
    // heartbeat: a soft body thump, 90–160 Hz, never a drone; it fades in after the first beat of the story and drops out at the stops
    const hb = ac.createGain(); hb.connect(bed);
    const hbLevel = x => {
      let v = 0.32 * clamp((x - 2) / 4, 0, 1);
      for (const u of turns) { if (x > u - 0.42 && x < u + 0.5) return 0; if (x >= u + 0.5 && x < u + 2.5) v = Math.min(v, 0.3 * (x - u - 0.5) / 2); if (x > u - 4 && x <= u - 0.42) v = Math.max(v, 0.32 + 0.1 * (1 - (u - 0.42 - x) / 3.58)); }
      if (inCard(x)) return 0; if (card && x >= card[1] && x < card[1] + 2) v = Math.min(v, 0.28 * (x - card[1]) / 2);
      if (x >= land) v *= clamp(1 - (x - land) / 2, 0, 1);
      return v;
    };
    if (opt.heartbeat) for (let tb = 1.0; tb < D - 1; tb += 1.05) for (const [off, gv] of [[0, 1], [0.24, 0.6]]) {
      const t0 = tb + off, lv = hbLevel(t0) * gv; if (lv < 0.01) continue;
      const o = ac.createOscillator(); o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(88, t0 + 0.08);
      const g = ac.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(lv, t0 + 0.005); g.gain.setTargetAtTime(0, t0 + 0.005, 0.07);
      o.connect(g).connect(hb); o.start(t0); o.stop(Math.min(D, t0 + 0.45));
    }
    // pad: D minor colour that opens to D major under the card; high-passed at 150 Hz so it never sits on his voice
    const pad = ac.createGain(); const pLP = ac.createBiquadFilter(); pLP.type = "lowpass"; pLP.frequency.value = 1800; const pHP = ac.createBiquadFilter(); pHP.type = "highpass"; pHP.frequency.value = 150;
    pad.connect(pLP).connect(pHP); pHP.connect(bed); const pw = ac.createGain(); pw.gain.value = 0.6; pHP.connect(pw).connect(conv);
    const marks = [0, ...turns, ...(card ? [card[1]] : []), land].filter((x, k, a) => x < D && a.indexOf(x) === k).sort((x, y) => x - y);
    const PROG = [["D4", "E4", "A4"], ["A#3", "F4", "A4"], ["G3", "D4", "A#4"], ["A3", "E4", "A4"]];
    if (opt.pad) marks.forEach((m0, k) => {
      const m1 = k + 1 < marks.length ? marks[k + 1] : D, chord = card && m0 === card[0] ? ["D4", "F#4", "A4"] : m0 >= land ? ["D4", "E4", "A4"] : PROG[k % 4];
      for (const n of chord) for (const det of [-5, 5]) {
        const o = ac.createOscillator(); o.type = "triangle"; o.frequency.value = hz(n); o.detune.value = det;
        const g = ac.createGain(); g.gain.setValueAtTime(0, m0); g.gain.linearRampToValueAtTime(0.03, m0 + 1.6); g.gain.setValueAtTime(0.03, Math.max(m0 + 1.6, m1 - 0.5)); g.gain.linearRampToValueAtTime(0, Math.min(D, m1 + 0.8));
        const p = ac.createStereoPanner(); p.pan.value = det < 0 ? -0.4 : 0.4; o.connect(g).connect(p).connect(pad); o.start(m0); o.stop(Math.min(D, m1 + 0.85));
      }
    });
    // hits on every turn: riser cut dead, then a body thump, a noise crack and a low bell
    turns.forEach((x, k) => {
      const big = card && Math.abs(x - card[0]) < 0.05, rl = big ? 2.6 : 1.6, r0 = Math.max(0.5, x - 0.42 - rl);
      const nz = ac.createBufferSource(), nb = ac.createBuffer(1, Math.ceil((rl + 0.1) * sr), sr), nd = nb.getChannelData(0); for (let j = 0; j < nd.length; j++) nd[j] = r() * 2 - 1; nz.buffer = nb;
      const cr = ac.createBufferSource(), cb = ac.createBuffer(1, Math.ceil(0.8 * sr), sr), cd = cb.getChannelData(0); for (let j = 0; j < cd.length; j++) cd[j] = (r() * 2 - 1) * Math.exp(-j / (0.09 * sr)); cr.buffer = cb;
      if (!opt.hits) return; // noise buffers above are still drawn, so the sea keeps its texture
      const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 2.5; bp.frequency.setValueAtTime(400, r0); bp.frequency.exponentialRampToValueAtTime(3200, x - 0.42);
      const rg = ac.createGain(); rg.gain.setValueAtTime(0.0001, r0); rg.gain.exponentialRampToValueAtTime(big ? 0.22 : 0.12, x - 0.43); rg.gain.setValueAtTime(0, x - 0.42);
      nz.connect(bp).connect(rg).connect(hp); nz.start(r0); nz.stop(x - 0.4);
      const o = ac.createOscillator(); o.frequency.setValueAtTime(190, x); o.frequency.exponentialRampToValueAtTime(70, x + 0.35);
      const og = ac.createGain(); og.gain.setValueAtTime(0, x); og.gain.linearRampToValueAtTime(big ? 0.9 : 0.65, x + 0.006); og.gain.setTargetAtTime(0, x + 0.006, 0.16);
      o.connect(og).connect(hp); o.start(x); o.stop(Math.min(D, x + 1.2));
      const cbp = ac.createBiquadFilter(); cbp.type = "bandpass"; cbp.frequency.value = 900; cbp.Q.value = 0.7; const cg = ac.createGain(); cg.gain.value = big ? 0.5 : 0.35;
      cr.connect(cbp).connect(cg); cg.connect(hp); cg.connect(conv); cr.start(x);
      bell(hz(big ? "D4" : "A3"), x + 0.01, big ? 0.34 : 0.22, big ? 7 : 4.5, 0, 0.9);
    });
    // sea: brown noise, high-passed at 150 Hz, very low and steady
    const sb = ac.createBuffer(2, sr * 6, sr); for (let ch = 0; ch < 2; ch++) { const d = sb.getChannelData(ch); let lv = 0; for (let j = 0; j < d.length; j++) { lv = (lv + 0.02 * (r() * 2 - 1)) / 1.02; d[j] = lv * 3.5; } }
    if (opt.sea) {
      const sea = ac.createBufferSource(); sea.buffer = sb; sea.loop = true; const sHP = ac.createBiquadFilter(); sHP.type = "highpass"; sHP.frequency.value = 150; const sLP = ac.createBiquadFilter(); sLP.type = "lowpass"; sLP.frequency.value = 2000;
      const sg = ac.createGain(); sg.gain.value = 0.1; const lfo = ac.createOscillator(); lfo.frequency.value = 0.07; const lg = ac.createGain(); lg.gain.value = 0.05; lfo.connect(lg).connect(sg.gain);
      sea.connect(sHP).connect(sLP).connect(sg).connect(bed); sea.start(0); lfo.start(0);
    }
    // the stings: A-E-D on the gold light (then the voice after half a second), E-D-A with a soft low D on the last line
    if (opt.stingAt !== null) sting(["A5", "E6", "D6"], opt.stingAt, 0.16, 0.42);
    if (cue.land !== null) { sting(["E5", "D5", "A4"], land, 0.32, 0.4); bell(hz("D3"), land + 0.64, 0.1, 5, 0, 0.6); }
    const buf = await ac.startRendering();
    // master: -14 LUFS (gated, like the voice mix) under a soft ceiling, then the fade
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    masterTo(L, R, sr, -14, cue.fade);
    return buf;
  }

  // WAV writer. 16-bit matches Jarvis Studio's export byte for byte (clamp, x32767, truncate); 32 writes IEEE float.
  function toWav(buffer, { bits = 16 } = {}) {
    if (bits !== 16 && bits !== 32) throw new Error("NightWatch.toWav: bits must be 16 or 32");
    const ch = buffer.numberOfChannels, n = buffer.length, sr = buffer.sampleRate, bps = bits / 8, data = n * ch * bps;
    const chans = []; for (let c = 0; c < ch; c++) chans.push(buffer.getChannelData(c));
    const ab = new ArrayBuffer(44 + data), v = new DataView(ab), w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + data, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, bits === 32 ? 3 : 1, true); v.setUint16(22, ch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * ch * bps, true); v.setUint16(32, ch * bps, true); v.setUint16(34, bits, true); w(36, "data"); v.setUint32(40, data, true);
    if (bits === 16) { const pcm = new Int16Array(ab, 44, n * ch); for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) pcm[i * ch + c] = Math.max(-1, Math.min(1, chans[c][i])) * 32767; }
    else { const f = new Float32Array(ab, 44, n * ch); for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) f[i * ch + c] = chans[c][i]; }
    return ab;
  }

  root.NightWatch = Object.freeze({ version: "1.0.0", render, toWav, normCue, DEFAULTS, MOODS, NOTE, hz, rng, clamp, irBuffer, masterTo });
})(typeof window !== "undefined" ? window : globalThis);
