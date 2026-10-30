// Dawnward sound. Muted until the visitor asks for it. The owner's score is
// the bed; a low-pass filter opens as the story widens (scale), focus pulls it
// slightly closed (proximity), and each world answers with its own bell.
import { worlds } from "./tokens.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

export function createSound({ asset, film }) {
  let ctx = null, gain, filter, src = null, on = false, buffer = null, loading = null;
  const notes = { mind: 659.25, body: 440, soul: 880, future: 587.33, back: 329.63 };

  function ensure() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 500; filter.Q.value = 0.4;
    gain = ctx.createGain(); gain.gain.value = 0;
    filter.connect(gain).connect(ctx.destination);
    loading = fetch(asset("audio/score.mp3")).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((b) => { buffer = b; }).catch(() => {});
  }
  function startBed() {
    if (!buffer || src) return;
    src = ctx.createBufferSource(); src.buffer = buffer; src.loop = true; src.connect(filter); src.start();
  }
  function bell(freq, level = 0.12) {
    if (!on || !ctx) return;
    const t = ctx.currentTime, out = ctx.createGain();
    out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(level, t + 0.012); out.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    out.connect(ctx.destination);
    [[1, 1], [2.01, 0.32], [3.02, 0.12]].forEach(([m, a]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq * m; g.gain.value = a;
      o.connect(g).connect(out); o.start(t); o.stop(t + 2.7);
    });
  }
  return {
    async toggle() {
      if (film) return false;
      ensure();
      const resumed = ctx.resume(); // inside the tap itself, before any await (iOS)
      on = !on;
      if (on) {
        await resumed; await loading; startBed();
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setTargetAtTime(0.55, ctx.currentTime, 0.6);
        bell(notes.back, 0.08);
      } else {
        gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      }
      return on;
    },
    update(s, focus) {
      if (!on || !ctx) return;
      const scale = smooth(0.4, 3.0, s);
      const f = 380 * Math.pow(16000 / 380, scale) * (1 - focus * 0.35) * (1 - smooth(4.4, 5, s) * 0.6);
      filter.frequency.setTargetAtTime(f, ctx.currentTime, 0.25);
    },
    world(key) { bell(notes[key] || 523.25, 0.1); },
    pause(hidden) { if (ctx && on) (hidden ? ctx.suspend() : ctx.resume()); },
    back() { bell(notes.back, 0.06); },
    get on() { return on; },
  };
}
