#!/usr/bin/env node
// seek-render: frame-exact MP4 export for any HTML page that exposes window.seek(seconds), the
// convention every Charlie Hills motion skill uses. HyperFrames' CLI can't render these pages
// directly (they're not compositions, and their rAF autoplay fails its lint). This drives headless
// Chrome over the DevTools protocol and pipes each frame into ffmpeg. Zero npm dependencies; needs
// Node 22+ (global WebSocket), ffmpeg, and a Chrome/Chromium binary.
//
// usage: node seek-render.mjs <page.html> --duration 8 [--width 1080 --height 1920] [--fps 30]
//                             [--out renders/out.mp4] [--chrome /path/to/chrome] [--silent-audio]
// Chrome lookup order: --chrome · $HYPERFRAMES_BROWSER_PATH · $CHROME_PATH · common install paths.
// The page is loaded with ?render (Charlie's freeze-autoplay flag). We wait for document.fonts.ready
// and, if the page defines it, window.__ready === true.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const flag = (n, d = null) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const page = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
const duration = +flag('--duration', 0);
if (!page || !existsSync(page) || !duration) { console.error('usage: node seek-render.mjs <page.html> --duration <s> [--width 1080 --height 1920 --fps 30 --out out.mp4]'); process.exit(2); }
const W = +flag('--width', 1080), H = +flag('--height', 1920), FPS = +flag('--fps', 30);
const out = resolve(flag('--out', join(dirname(page), 'renders', 'seek-render.mp4')));
if (typeof WebSocket === 'undefined') { console.error('Node 22+ required (global WebSocket).'); process.exit(2); }

const candidates = [
  flag('--chrome'), process.env.HYPERFRAMES_BROWSER_PATH, process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA ?? ''}/Google/Chrome/Application/chrome.exe`,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) { console.error('No Chrome found. Pass --chrome, or run `npx hyperframes browser ensure` and set HYPERFRAMES_BROWSER_PATH to `npx hyperframes browser path`.'); process.exit(2); }

const profile = mkdtempSync(join(tmpdir(), 'seek-render-'));
// Chrome refuses to run as root with its sandbox (containers, CI). Only then do we disable it.
const rootLinux = process.platform === 'linux' && process.getuid?.() === 0;
const proc = spawn(chrome, [...(rootLinux ? ['--no-sandbox'] : []), '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--mute-audio', '--disable-gpu', '--force-device-scale-factor=1', '--allow-file-access-from-files', `--window-size=${W},${H}`, 'about:blank'],
  { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => {
  let buf = ''; const t = setTimeout(() => rej(new Error('Chrome did not start in 20 s')), 20000);
  proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); res(m[1]); } });
  proc.on('exit', (c) => rej(new Error(`Chrome exited (${c}): ${buf.slice(-400)}`)));
});

// Minimal CDP client over the browser endpoint, using a flattened session for one page target.
const ws = new WebSocket(wsUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); } };
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
const evaluate = async (expression) => { const r = await S('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text); return r.result.value; };

await S('Page.enable'); await S('Runtime.enable');
await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await S('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 1 } });
const url = pathToFileURL(resolve(page)).href + '?render';
await S('Page.navigate', { url });
const deadline = Date.now() + 30000;
for (;;) {
  const ok = await evaluate(`document.readyState === 'complete' && typeof window.seek === 'function' && (window.__ready === undefined || window.__ready === true)`).catch(() => false);
  if (ok) break;
  if (Date.now() > deadline) { console.error('Page never exposed window.seek (or __ready stayed false) within 30 s.'); process.exit(1); }
  await new Promise((r) => setTimeout(r, 100));
}
await evaluate('document.fonts.ready.then(() => true)');

mkdirSync(dirname(out), { recursive: true });
const ffArgs = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(FPS), '-i', '-'];
if (args.includes('--silent-audio')) ffArgs.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000', '-shortest', '-c:a', 'aac', '-b:a', '128k');
ffArgs.push('-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-g', String(Math.round(FPS / 2)), '-bf', '2', '-crf', '16',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', out);
const ff = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

const total = Math.round(duration * FPS); const t0 = Date.now();
for (let f = 0; f < total; f++) {
  const t = f / FPS;
  await evaluate(`Promise.resolve(window.seek(${t})).then(() => new Promise((r) => requestAnimationFrame(() => r(true))))`);
  const { data } = await S('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 }, captureBeyondViewport: false });
  if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % FPS === 0) process.stdout.write(`\rframe ${f}/${total}`);
}
ff.stdin.end();
const code = await new Promise((r) => ff.on('exit', r));
ws.close();
const exited = new Promise((r) => proc.once('exit', r)); proc.kill(); await Promise.race([exited, new Promise((r) => setTimeout(r, 3000))]);
try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp profile; the OS will clean it */ }
console.log(`\rseek-render → ${out} · ${total} frames · ${W}×${H} @ ${FPS} fps · ${((Date.now() - t0) / 1000).toFixed(1)} s${code ? ` · ffmpeg exit ${code}` : ''}`);
process.exit(code ? 1 : 0);
