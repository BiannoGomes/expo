/* becoming-motion.js · the Becoming picture runtime, global `BM` (v0.1.0, 27.10.2026)
 *
 * Browser runtime for HyperFrames 0.8.97 compositions. Depends only on GSAP 3.14.2 (vendor/gsap.min.js, no plugins):
 * every scheduling helper takes the composition's paused timeline as its first argument.
 *
 * Ports from Reel 01 v5 (build_v5.py, the build Bianno liked on 06.10.2026):
 *   wob() / poly() / path()   -> BM.wob, BM.poly, BM.pathD, BM.pathLength, BM.goldPath
 *   caption chunking + flash  -> BM.chunkWords, BM.captions
 *   hook word rises           -> BM.revealWords
 * Port from Jarvis Studio demoPlate() (seeded Canvas 2D sea plates), made time-driven -> BM.seaPlate
 *
 * Determinism: no wall clock, no unseeded randomness. Canvas painters are pure functions of composition time t and
 * are driven by BM.onTime, which listens to the runtime's "hf-seek" event (dispatched on every seek/frame, proven
 * byte-identical in audit/environment.md) and to the onUpdate of every timeline handed to a BM helper (Studio preview
 * playback). Colours are the PROPOSED tokens (tokens.json); rgba() strings are those tokens with alpha.
 */
(function (root) {
  "use strict";

  var BM = { version: "0.1.0" };

  /* ------------------------------------------------------------------ tokens ------------------------------------ */
  BM.color = {
    night: "#04070B",
    abyss: "#05080C",
    ocean: "#13283D",
    gold: "#D8A45F",
    paleGold: "#E8C99B",
    cream: "#F2E3C4",
    ink: "#F2EDE4",
    stone: "#EFE9DF",
    dim: "#D9D2C6",
    mist: "#9AA1A9",
    grey: "#808891",
    wall: "#D6E4F5",
    teal: "#6E9C98"
  };

  BM.timing = {
    fps: 30,
    textIn: { min: 0.6, max: 0.9, ease: "power2.out" },
    hook: { dur: 0.22, y: 14, stagger: 0.12, lead: 0.06, ease: "power2.out" },
    caption: {
      maxWords: 4, inDur: 0.18, inY: 10, inLead: 0.1, outDur: 0.16, hold: 0.7, gap: 0.04,
      flashDur: 0.08, flashLead: 0.03, settleDur: 0.25, settleDelay: 0.02, ease: "power2.out"
    },
    plate: { inDur: 0.8, inEase: "power1.out", pushFrom: 1.0, pushTo: 1.07, pushEase: "none", outDur: 0.7, outEase: "power1.in" },
    dip: 0.5,
    line: { ease: "power2.out", width: 4, widthSecondary: 3, wob: { step: 16, amp: 2.6 }, poly: { step: 14, amp: 2.2, along: 0.6 }, dashGap: 40 },
    mark: { dur: 0.9, y: 1450, ease: "power1.out" }
  };

  BM.safe = { x0: 80, x1: 940, y0: 250, y1: 1500, axisX: 510 };
  BM.canvas = { width: 1080, height: 1920, fps: 30 };
  BM.plate = { width: 1188, height: 2112, left: -54, top: -96, horizonY: 1180 };
  BM.MARK = "THE BECOMING PROJECT";

  /* ------------------------------------------------------------------ helpers ----------------------------------- */
  function num(v, d) { return v == null || v !== v ? d : v; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hexRgb(hex) {
    var h = String(hex).replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  /** A token (name or hex) with alpha, as an rgba() string. */
  BM.rgba = function (c, a) {
    var rgb = hexRgb(BM.color[c] || c);
    return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + num(a, 1) + ")";
  };
  /** Linear blend of two tokens (t = 0 gives a, 1 gives b), as an rgb() string: gradient stops between palette values. */
  BM.mix = function (a, b, t, alpha) {
    var x = hexRgb(BM.color[a] || a), y = hexRgb(BM.color[b] || b);
    var r = Math.round(x[0] + (y[0] - x[0]) * t), g = Math.round(x[1] + (y[1] - x[1]) * t), bl = Math.round(x[2] + (y[2] - x[2]) * t);
    return alpha == null ? "rgb(" + r + "," + g + "," + bl + ")" : "rgba(" + r + "," + g + "," + bl + "," + alpha + ")";
  };
  function el(x) { return typeof x === "string" ? document.querySelector(x) : x; }

  /* ------------------------------------------------------------------ randomness -------------------------------- */
  /** mulberry32: a seeded PRNG returning floats in [0, 1). Same seed, same sequence, on every machine. */
  BM.rng = function (seed) {
    var a = (num(seed, 1) >>> 0);
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  /** Integer hash of (seed, n): a fresh, reproducible seed per frame or per item. */
  BM.hash = function (seed, n) {
    var h = Math.imul((num(seed, 1) | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((num(n, 0) | 0) + 0x632be5ab, 0xc2b2ae35);
    h ^= h >>> 16; h = Math.imul(h, 0x7feb352d); h ^= h >>> 15; h = Math.imul(h, 0x846ca68b); h ^= h >>> 16;
    return h >>> 0;
  };
  // v5 seeded Python's random with 7 once and drew every line from that stream. The default stream does the same, so
  // results depend on call order; pass an explicit `rng` to make a line independent of everything drawn before it.
  var defaultRng = BM.rng(7);
  function uniform(r, a, b) { return a + (b - a) * r(); }

  /* ------------------------------------------------------------------ the gold line (v5 ports) ------------------ */
  /** v5 wob(): a horizontal hand-drawn line from x0 to x1 at y, a point every `step` px jittered by +-amp in y. */
  BM.wob = function (x0, x1, y, o) {
    o = o || {};
    var step = num(o.step, 16), amp = num(o.amp, 2.6), r = o.rng || defaultRng;
    var pts = [], x = x0;
    while (x < x1) { pts.push([x, y + uniform(r, -amp, amp)]); x += step; }
    pts.push([x1, y + uniform(r, -amp, amp)]);
    return pts;
  };
  /** v5 poly(): resample a polyline every ~`step` px, jitter +-0.6 px along x and +-amp px in y; keeps the last point exact. */
  BM.poly = function (P, o) {
    o = o || {};
    var step = num(o.step, 14), amp = num(o.amp, 2.2), along = num(o.along, 0.6), r = o.rng || defaultRng;
    var out = [];
    for (var i = 0; i + 1 < P.length; i++) {
      var x0 = P[i][0], y0 = P[i][1], x1 = P[i + 1][0], y1 = P[i + 1][1];
      var n = Math.max(1, Math.floor(Math.hypot(x1 - x0, y1 - y0) / step));
      for (var k = 0; k < n; k++) {
        var t = k / n;
        out.push([x0 + (x1 - x0) * t + uniform(r, -along, along), y0 + (y1 - y0) * t + uniform(r, -amp, amp)]);
      }
    }
    out.push([P[P.length - 1][0], P[P.length - 1][1]]);
    return out;
  };
  /** v5 dstr(): "M x,y L x,y ..." with one decimal. */
  BM.pathD = function (pts) {
    return "M" + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L");
  };
  /** v5 plen(): polyline length, computed (no DOM measurement, so it is safe at build time and seek-order independent). */
  BM.pathLength = function (pts) {
    var L = 0;
    for (var i = 0; i + 1 < pts.length; i++) L += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    return L;
  };
  var SVGNS = "http://www.w3.org/2000/svg";
  /** v5 path(): append a gold <path> to `svg` with dasharray "L L+40" and dashoffset L (hidden, ready to draw on). */
  BM.goldPath = function (svg, id, pts, o) {
    o = o || {};
    var host = el(svg);
    var L = BM.pathLength(pts);
    var p = document.createElementNS(SVGNS, "path");
    if (id) p.setAttribute("id", id);
    p.setAttribute("d", BM.pathD(pts));
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", o.color || BM.color.gold);
    p.setAttribute("stroke-width", String(num(o.width, BM.timing.line.width)));
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    p.setAttribute("opacity", String(num(o.opacity, 1)));
    p.setAttribute("stroke-dasharray", L.toFixed(1) + " " + (L + BM.timing.line.dashGap).toFixed(1));
    // Hidden = an offset a little past L (inside the gap). Exactly L can leak a sub-pixel dash, and a round cap turns
    // that into a visible dot. The same value goes in the style, where GSAP writes, so a fresh page and a page that has
    // already been seeked elsewhere start from identical state (renders split frames across workers).
    p.setAttribute("stroke-dashoffset", hiddenOffset(L).toFixed(1));
    p.style.strokeDashoffset = hiddenOffset(L).toFixed(1) + "px";
    p.setAttribute("data-bm-length", L.toFixed(1));
    if (host) host.appendChild(p);
    return p;
  };
  function hiddenOffset(L) { return Math.ceil(L) + 2; }
  function lengthOf(target) {
    var t = el(target);
    if (t && t.getAttribute && t.getAttribute("data-bm-length")) return parseFloat(t.getAttribute("data-bm-length"));
    return null;
  }
  /** Draw a path on: tween strokeDashoffset from its length to 0 starting at `at`.
   *  opts.from / opts.to: drawn fractions (default 0 -> 1), so one path can draw in stages (e.g. to .7, later to 1). */
  BM.drawOn = function (tl, target, at, duration, ease, opts) {
    track(tl);
    opts = opts || {};
    var L = lengthOf(target);
    var e = ease || BM.timing.line.ease;
    if (L == null) return tl.to(target, { strokeDashoffset: 0, duration: duration, ease: e }, at);
    var f0 = num(opts.from, 0), f1 = num(opts.to, 1);
    // from 0 means hidden (see goldPath); autoRound off, or GSAP rounds the offset to whole pixels, so a hidden
    // offset of L rounds below L and a stray cap dot shows, and a drawn line advances in 1 px steps
    var o0 = f0 <= 0 ? hiddenOffset(L) : L * (1 - f0), o1 = f1 <= 0 ? hiddenOffset(L) : L * (1 - f1);
    return tl.fromTo(target, { strokeDashoffset: o0 },
      { strokeDashoffset: o1, duration: duration, ease: e, immediateRender: false, autoRound: false }, at);
  };

  /* ------------------------------------------------------------------ words ------------------------------------- */
  function wordSpan(cls, text) {
    var s = document.createElement("span");
    s.className = cls;
    s.textContent = text;
    return s;
  }
  /** Hook-style word reveal: one inline-block <span class="bm-w"> per word, each rising from y to 0 with opacity 0 -> 1.
   *  Start times: opts.times (spoken word times, each rise starts `lead` = .06 s earlier, as v5) or at + i * stagger.
   *  "\n" in text forces a line break; *word* marks an emphasis word (italic pale gold, class bm-em). No letter-spacing
   *  tweens, no per-letter animation. Returns the spans. */
  BM.revealWords = function (tl, container, text, o) {
    track(tl);
    o = o || {};
    var T = BM.timing.hook;
    var box = el(container);
    var at = num(o.at, 0), stagger = num(o.stagger, T.stagger), y = num(o.y, T.y), dur = num(o.dur, T.dur);
    var lead = num(o.lead, T.lead), ease = o.ease || T.ease, times = o.times || null;
    var spans = [];
    var lines = String(text).split("\n");
    lines.forEach(function (line, li) {
      if (li > 0) box.appendChild(document.createElement("br"));
      line.split(/\s+/).filter(Boolean).forEach(function (w, wi) {
        var em = /^\*(.+)\*([,.;:?…]*)$/.exec(w);
        var s = wordSpan("bm-w" + (em ? " bm-em" : ""), em ? em[1] + em[2] : w);
        if (wi > 0) box.appendChild(document.createTextNode(" "));
        box.appendChild(s);
        spans.push(s);
      });
    });
    spans.forEach(function (s, i) {
      var t0 = times ? Math.max(0.02, times[i] - lead) : at + i * stagger;
      tl.fromTo(s, { opacity: 0, y: y }, { opacity: 1, y: 0, duration: dur, ease: ease, immediateRender: false }, t0);
    });
    return spans;
  };

  /** v5 caption chunking, as a pure function. words: [{text, start, end}].
   *  A phrase ends after a word ending in , . … ? ; : (closing quotes allowed), before any index in opts.breakBefore,
   *  and around any index in opts.hide (words the hero type already carries). Each phrase splits into
   *  ceil(n / maxWords) chunks, sizes as even as possible, earlier chunks one longer. Returns arrays of word indices. */
  BM.chunkWords = function (words, o) {
    o = o || {};
    var maxWords = num(o.maxWords, BM.timing.caption.maxWords);
    var hide = new Set(o.hide || []), brk = new Set(o.breakBefore || []);
    var phrases = [], cur = [];
    words.forEach(function (w, i) {
      if (hide.has(i)) { if (cur.length) { phrases.push(cur); cur = []; } return; }
      if (cur.length && brk.has(i)) { phrases.push(cur); cur = []; }
      cur.push(i);
      if (/[,.…?;:]["'”’)\]]*$/.test(w.text)) { phrases.push(cur); cur = []; }
    });
    if (cur.length) phrases.push(cur);
    var chunks = [];
    phrases.forEach(function (ph) {
      var n = Math.ceil(ph.length / maxWords), base = Math.floor(ph.length / n), extra = ph.length % n, k = 0;
      for (var c = 0; c < n; c++) { var sz = base + (c < extra ? 1 : 0); chunks.push(ph.slice(k, k + sz)); k += sz; }
    });
    return chunks;
  };
  /** v5 word-by-word serif captions. Builds one <div class="bm-cap"> per chunk inside `container` (position it with
   *  .bm-captions) and schedules: chunk in .18 s power2.out from y 10 at its first word - .1 s, out .16 s by
   *  min(last word end + .7, next chunk start - .04); each word appears with a pale-gold flash (.08 s, from its start
   *  - .03 s) and settles to ink over .25 s from its end + .02 s. Returns [{el, words, start, end}]. */
  BM.captions = function (tl, container, words, o) {
    track(tl);
    o = o || {};
    var C = BM.timing.caption;
    var box = el(container);
    var flash = o.flash || BM.color.paleGold, ink = o.color || BM.color.ink;
    var chunks = BM.chunkWords(words, o);
    var out = [];
    chunks.forEach(function (ch, n) {
      var div = document.createElement("div");
      div.className = "bm-cap";
      var spans = [];
      ch.forEach(function (wi, j) {
        if (j > 0) div.appendChild(document.createTextNode(" "));
        var s = wordSpan("bm-cw", words[wi].text);
        div.appendChild(s);
        spans.push(s);
      });
      box.appendChild(div);
      var s0 = words[ch[0]].start, last = words[ch[ch.length - 1]].end;
      var nxt = n + 1 < chunks.length ? words[chunks[n + 1][0]].start : last + 1;
      var end = Math.min(last + C.hold, nxt - C.gap);
      tl.fromTo(div, { opacity: 0, y: C.inY }, { opacity: 1, y: 0, duration: C.inDur, ease: C.ease, immediateRender: false }, Math.max(0, s0 - C.inLead));
      tl.fromTo(div, { opacity: 1 }, { opacity: 0, duration: C.outDur, ease: "power1.out", immediateRender: false }, Math.max(0, end - C.outDur));
      ch.forEach(function (wi, j) {
        var w = words[wi];
        tl.fromTo(spans[j], { opacity: 0, color: ink }, { opacity: 1, color: flash, duration: C.flashDur, ease: "none", immediateRender: false }, Math.max(0, w.start - C.flashLead));
        tl.fromTo(spans[j], { color: flash }, { color: ink, duration: C.settleDur, ease: "power1.out", immediateRender: false }, w.end + C.settleDelay);
      });
      out.push({ el: div, words: spans, start: s0, end: end });
    });
    return out;
  };

  /** The end mark "THE BECOMING PROJECT" (Inter 24 px, .5em, gold), fading in over .9 s at opts.at.
   *  opts.tl: the timeline (defaults to the last timeline handed to a BM helper). Never his name on a frame. */
  BM.mark = function (container, o) {
    o = o || {};
    var M = BM.timing.mark;
    var tl = o.tl || lastTimeline;
    var d = document.createElement("div");
    d.className = "bm-mark";
    d.textContent = BM.MARK;
    d.style.top = num(o.y, M.y) + "px";
    el(container).appendChild(d);
    if (tl) {
      track(tl);
      tl.fromTo(d, { opacity: 0 }, { opacity: num(o.opacity, 1), duration: num(o.dur, M.dur), ease: M.ease, immediateRender: false }, num(o.at, 0));
    }
    return d;
  };

  /* ------------------------------------------------------------------ time ------------------------------------- */
  var subscribers = [], tracked = [], lastTimeline = null, lastT = null, listening = false;
  function tick(t) {
    lastT = t;
    for (var i = 0; i < subscribers.length; i++) subscribers[i](t);
  }
  function listen() {
    if (listening || typeof root.addEventListener !== "function") return;
    listening = true;
    // HyperFrames dispatches CustomEvent("hf-seek", {detail: {time}}) on every seek/frame (renders and snapshots).
    root.addEventListener("hf-seek", function (e) { tick(Math.max(0, Number(e && e.detail && e.detail.time) || 0)); });
  }
  /** Bind a timeline so Studio preview playback (which plays GSAP rather than seeking) also repaints the canvases.
   *  Any existing onUpdate callback is kept. Called automatically by every BM helper that takes a timeline. */
  function track(tl) {
    if (!tl || typeof tl.eventCallback !== "function") return;
    lastTimeline = tl;
    if (tracked.indexOf(tl) !== -1) return;
    tracked.push(tl);
    var prev = tl.eventCallback("onUpdate");
    tl.eventCallback("onUpdate", function () {
      if (prev) prev.apply(this, arguments);
      var t = tl.time();
      if (t !== lastT) tick(t);
    });
  }
  BM.track = track;
  /** Call fn(t) on every seek/frame: the "hf-seek" listener (renders, snapshots) plus the onUpdate of every timeline
   *  handed to a BM helper or to BM.track (preview playback). fn must be a pure function of t. Paints t = 0 at once.
   *  Returns an unsubscribe function. */
  BM.onTime = function (fn) {
    listen();
    subscribers.push(fn);
    fn(lastT == null ? 0 : lastT);
    return function () { var i = subscribers.indexOf(fn); if (i !== -1) subscribers.splice(i, 1); };
  };
  /** Drive every subscriber at time t by hand (tests, or a custom harness). */
  BM.seek = function (t) { tick(Math.max(0, Number(t) || 0)); };

  /* ------------------------------------------------------------------ canvas sizing ---------------------------- */
  function sizeCanvas(canvas, w, h) {
    // a fresh <canvas> without width/height attributes is 300x150; give it the frame (or plate) size
    if (!canvas.getAttribute("width") || !canvas.getAttribute("height")) { canvas.width = w; canvas.height = h; }
  }
  function offscreen(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

  /* ------------------------------------------------------------------ the sea plate ----------------------------- */
  /** Code-drawn dark-sea plate (port of Jarvis Studio demoPlate(): seeded Canvas 2D, now a pure function of time).
   *  canvas: a <canvas class="bm-plate"> (1188x2112 overscan at -54, -96). opts:
   *    seed (1) · horizonY (1180, FRAME pixels) · glow 'dawn' | 'moon' | 'none' ('dawn') · density (1: swell lines
   *    and glints) · glowX (frame x of the light, 540) · stars (moon 90, else 0) · swell (1: speed of the water).
   *  Returns draw(t); register it with BM.onTime(draw). Sets transform-origin on the horizon, so a push on the canvas
   *  keeps the horizon (and a gold line drawn on it) in place. Palette only: night/abyss/ocean/teal/mist for the
   *  dark, gold/pale gold/cream for the light (added with "lighter" so it warms instead of greying). */
  BM.seaPlate = function (canvas, o) {
    o = o || {};
    canvas = el(canvas);
    sizeCanvas(canvas, BM.plate.width, BM.plate.height);
    var W = canvas.width, H = canvas.height;
    var ox = (W - BM.canvas.width) / 2, oy = (H - BM.canvas.height) / 2;
    var seed = num(o.seed, 1), glow = o.glow || "dawn", dens = num(o.density, 1), swell = num(o.swell, 1);
    var hy = num(o.horizonY, BM.plate.horizonY) + oy;          // horizon in canvas pixels
    var gx = num(o.glowX, BM.canvas.width / 2) + ox;           // light x in canvas pixels
    var g = canvas.getContext("2d");
    var r = BM.rng(seed);
    var lit = glow === "moon" ? "cream" : "gold", lit2 = glow === "moon" ? "ink" : "paleGold";
    if (!canvas.style.transformOrigin) canvas.style.transformOrigin = "50% " + (hy / H * 100).toFixed(2) + "%";
    function ellipse(c, x, y, sx, sy, R, stops) {
      c.save(); c.translate(x, y); c.scale(sx, sy);
      var rg = c.createRadialGradient(0, 0, 0, 0, 0, R);
      stops.forEach(function (s) { rg.addColorStop(s[0], s[1]); });
      c.fillStyle = rg; c.fillRect(-R, -R, 2 * R, 2 * R); c.restore();
    }

    // ---- static layer (drawn once): sky, light, stars, sea body, reflection ----
    var base = offscreen(W, H), b = base.getContext("2d");
    var sky = b.createLinearGradient(0, 0, 0, hy);
    sky.addColorStop(0, BM.color.night);
    sky.addColorStop(0.45, BM.color.abyss);
    sky.addColorStop(0.8, BM.mix("abyss", "ocean", 0.7));
    sky.addColorStop(1, BM.mix("ocean", "teal", glow === "moon" ? 0.2 : 0.1));
    b.fillStyle = sky; b.fillRect(0, 0, W, hy);
    var moonX = gx + 170, moonY = hy - 360, moonR = 30;
    var nStars = Math.round(num(o.stars, glow === "moon" ? 90 : 0) * dens);
    for (var s = 0; s < nStars; s++) {
      var sx = r() * W, sy = Math.pow(r(), 1.3) * (hy - 220), sz = 0.8 + r() * 1.5;
      b.fillStyle = BM.rgba("ink", (0.1 + r() * 0.45) * (1 - sy / hy)); b.fillRect(sx, sy, sz, sz);
    }
    b.globalCompositeOperation = "lighter";
    if (glow === "dawn") {
      // a light still below the horizon: a wide warm band that thins upward
      ellipse(b, gx, hy + 20, 3.2, 0.42, 560, [[0, BM.rgba("gold", 0.62)], [0.18, BM.rgba("gold", 0.34)], [0.5, BM.rgba("gold", 0.1)], [1, BM.rgba("gold", 0)]]);
      ellipse(b, gx, hy + 2, 5, 0.16, 170, [[0, BM.rgba("cream", 0.55)], [0.45, BM.rgba("paleGold", 0.2)], [1, BM.rgba("paleGold", 0)]]);
    } else if (glow === "moon") {
      ellipse(b, moonX, moonY, 1, 1, 380, [[0, BM.rgba("cream", 0.16)], [0.25, BM.rgba("mist", 0.06)], [1, BM.rgba("mist", 0)]]);
      ellipse(b, gx, hy + 10, 3.6, 0.45, 420, [[0, BM.rgba("mist", 0.1)], [1, BM.rgba("mist", 0)]]);
    }
    b.globalCompositeOperation = "source-over";
    if (glow === "moon") {
      b.fillStyle = BM.rgba("cream", 0.94); b.beginPath(); b.arc(moonX, moonY, moonR, 0, Math.PI * 2); b.fill();
      b.fillStyle = BM.mix("abyss", "ocean", 0.55); b.beginPath(); b.arc(moonX + 12, moonY - 7, moonR - 1, 0, Math.PI * 2); b.fill();
    }
    // sea body: darker than the sky at the horizon, falling to night
    var sea = b.createLinearGradient(0, hy, 0, H);
    sea.addColorStop(0, BM.mix("ocean", "abyss", 0.25));
    sea.addColorStop(0.25, BM.mix("ocean", "abyss", 0.55));
    sea.addColorStop(0.7, BM.mix("ocean", "night", 0.85));
    sea.addColorStop(1, BM.color.night);
    b.fillStyle = sea; b.fillRect(0, hy, W, H - hy);
    var lx = glow === "moon" ? moonX : gx;
    if (glow !== "none") {
      // the light's soft reflection, a tall ellipse hanging from the horizon (no hard edges)
      b.save(); b.beginPath(); b.rect(0, hy, W, H - hy); b.clip();
      b.globalCompositeOperation = "lighter";
      ellipse(b, lx, hy, 1.4, 6.5, 120, [[0, BM.rgba(lit, glow === "moon" ? 0.14 : 0.22)], [0.45, BM.rgba(lit, 0.06)], [1, BM.rgba(lit, 0)]]);
      b.restore();
    }

    // ---- moving layer data (seeded once; positions are pure functions of t) ----
    var nLines = Math.round(34 * dens), lines = [];
    for (var k = 0; k < nLines; k++) {
      var d = (k + 0.5 + (r() - 0.5) * 0.7) / nLines;               // 0 at the horizon, 1 at the bottom
      lines.push({ d: d, y: hy + 6 + Math.pow(d, 1.9) * (H - hy - 6), amp: 1 + d * 8 + r() * 2.5, f: 0.005 + r() * 0.007 - d * 0.0025,
        ph: r() * 6.283, sp: (0.3 + r() * 0.4) * (r() < 0.5 ? -1 : 1), bob: r() * 6.283, a: 0.07 + d * 0.1 + r() * 0.05 });
    }
    var nGlints = Math.round((glow === "none" ? 60 : 220) * dens), glints = [];
    for (var q = 0; q < nGlints; q++) {
      var dd = Math.pow(r(), 1.35);
      var spread = 30 + dd * 260;
      var gauss = r() + r() + r() + r() - 2;                         // -2..2, sd .58, peaked at 0
      glints.push({ d: dd, x: glow === "none" ? r() * W : lx + gauss * spread, y: hy + 3 + Math.pow(dd, 1.6) * (H - hy - 10),
        len: (5 + r() * 26) * (0.4 + dd * 1.3), th: 1 + Math.round(dd * 2), w: (1.2 + r() * 3.6) * swell, ph: r() * 6.283,
        sway: 2 + dd * 10, base: 0.3 + r() * 0.6, tint: r() < 0.6 ? lit : lit2 });
    }

    function draw(t) {
      t = Math.max(0, Number(t) || 0);
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = 1;
      g.clearRect(0, 0, W, H);
      g.drawImage(base, 0, 0);
      // swell: slow sines drifting with time, thicker and taller toward the viewer
      for (var i = 0; i < lines.length; i++) {
        var L = lines[i];
        var y0 = L.y + Math.sin(t * 0.45 * swell + L.bob) * (0.6 + L.d * 3);
        g.strokeStyle = BM.rgba("teal", L.a);
        g.lineWidth = 1 + L.d * 2;
        g.beginPath();
        for (var x = 0; x <= W; x += 12) {
          var yy = y0 + Math.sin(x * L.f + L.ph + t * L.sp * swell) * L.amp;
          if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
        }
        g.stroke();
      }
      g.globalCompositeOperation = "lighter";
      // the horizon seam: a thin lit line that breathes very slightly
      if (glow !== "none") {
        var sA = 0.3 + 0.05 * Math.sin(t * 0.8);
        ellipse(g, lx, hy, 5.5, 0.012, 160, [[0, BM.rgba(lit2, sA)], [0.6, BM.rgba(lit2, sA * 0.35)], [1, BM.rgba(lit2, 0)]]);
      }
      // glints: short flecks on the water that sparkle (sine cubed) and sway
      for (var j = 0; j < glints.length; j++) {
        var G = glints[j];
        var sp = 0.5 + 0.5 * Math.sin(t * G.w + G.ph);
        var a = G.base * sp * sp * sp * (1 - G.d * 0.5) * (glow === "none" ? 0.35 : 1);
        if (a < 0.012) continue;
        var gxp = G.x + Math.sin(t * 0.35 * swell + G.ph) * G.sway;
        g.fillStyle = BM.rgba(glow === "none" ? "mist" : G.tint, a);
        g.fillRect(gxp - G.len / 2, G.y + Math.sin(t * 0.6 * swell + G.ph * 1.7) * (0.5 + G.d * 2), G.len, G.th);
      }
      g.globalCompositeOperation = "source-over";
    }
    draw.canvas = canvas;
    draw.horizonY = hy - oy;
    return draw;
  };

  /* ------------------------------------------------------------------ grain ------------------------------------ */
  /** Film grain on a full-frame canvas (class bm-grain) blended soft-light over the plates, below the type.
   *  Frame-deterministic: the pattern for a frame is picked by hash(seed, round(t * fps)), so it changes on every frame
   *  and renders identically every time. Soft-light keeps it zero-mean (no lifted blacks) and strongest in the
   *  mid-tones, like film. opts: seed (3) · amount (.05; .05 gives a speck standard deviation of about 2-3 levels in
   *  the dark sky, close to the THE BEGINNING grade's sigma .016) · scale (2: drawn at 1/scale resolution and
   *  smoothed up, so specks are about 2 px) · tile (256) · blend ('soft-light'). Returns draw(t).
   *  Cost: changing noise on every frame is what an encoder can't compress; budget for it (README, "Grain"). */
  BM.grain = function (canvas, o) {
    o = o || {};
    canvas = el(canvas);
    var scale = Math.max(1, num(o.scale, 2));
    var dispW = num(o.width, BM.canvas.width), dispH = num(o.height, BM.canvas.height);
    canvas.width = Math.ceil(dispW / scale); canvas.height = Math.ceil(dispH / scale);
    canvas.style.width = dispW + "px"; canvas.style.height = dispH + "px";
    var W = canvas.width, H = canvas.height, T = num(o.tile, 256), fps = num(o.fps, BM.timing.fps);
    var seed = num(o.seed, 3), amount = num(o.amount, 0.05);
    var g = canvas.getContext("2d");
    var tile = offscreen(T, T), tg = tile.getContext("2d"), img = tg.createImageData(T, T), r = BM.rng(seed);
    if (!canvas.style.mixBlendMode) canvas.style.mixBlendMode = o.blend || "soft-light";
    for (var i = 0; i < img.data.length; i += 4) {
      var n = (r() + r() + r() - 1.5) * 2;              // sd about 1
      var v = Math.round(clamp(128 + n * amount * 1.2 * 255, 0, 255));
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    tg.putImageData(img, 0, 0);
    function draw(t) {
      var f = Math.round(Math.max(0, Number(t) || 0) * fps);
      var h = BM.rng(BM.hash(seed, f));
      var ox = Math.floor(h() * T), oy = Math.floor(h() * T), flip = h() < 0.5;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, W, H);
      if (flip) g.setTransform(-1, 0, 0, 1, W, 0);
      for (var y = -oy; y < H; y += T) for (var x = -ox; x < W; x += T) g.drawImage(tile, x, y);
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
    draw.canvas = canvas;
    return draw;
  };

  /* ------------------------------------------------------------------ shader ----------------------------------- */
  /** Minimal WebGL1 full-frame quad (SwiftShader-safe: preserveDrawingBuffer true, antialias false).
   *  fragSrc gets uniforms u_time (s) and u_res (px); opts.uniforms {name: number | [x,y] | [x,y,z] | [x,y,z,w]} are
   *  set once; draw(t, extra) sets u_time and any extra uniforms, then draws. opts.alpha (false) for an overlay canvas.
   *  If WebGL is missing (e.g. --browser-gpu on a GPU-less machine) draw.ok is false and draw() does nothing. */
  BM.shader = function (canvas, fragSrc, o) {
    o = o || {};
    canvas = el(canvas);
    sizeCanvas(canvas, BM.canvas.width, BM.canvas.height);
    var gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false, alpha: !!o.alpha, premultipliedAlpha: !!o.alpha });
    function noop() {}
    if (!gl) { noop.ok = false; noop.error = "webgl unavailable"; return noop; }
    var src = /precision\s+(lowp|mediump|highp)\s+float/.test(fragSrc) ? fragSrc : "precision highp float;\n" + fragSrc;
    function sh(type, s) {
      var x = gl.createShader(type); gl.shaderSource(x, s); gl.compileShader(x);
      if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error("BM.shader: " + gl.getShaderInfoLog(x));
      return x;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, src));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("BM.shader: " + gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    var cache = {};
    function set(name, v) {
      var u = cache[name] !== undefined ? cache[name] : (cache[name] = gl.getUniformLocation(prog, name));
      if (u === null) return;
      if (typeof v === "number") gl.uniform1f(u, v);
      else if (v.length === 2) gl.uniform2f(u, v[0], v[1]);
      else if (v.length === 3) gl.uniform3f(u, v[0], v[1], v[2]);
      else if (v.length === 4) gl.uniform4f(u, v[0], v[1], v[2], v[3]);
    }
    set("u_res", [canvas.width, canvas.height]);
    var U = o.uniforms || {};
    Object.keys(U).forEach(function (k) { set(k, U[k]); });
    function draw(t, extra) {
      set("u_time", Math.max(0, Number(t) || 0));
      if (extra) Object.keys(extra).forEach(function (k) { set(k, extra[k]); });
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    draw.ok = true;
    draw.gl = gl;
    draw.canvas = canvas;
    return draw;
  };

  root.BM = BM;
  if (typeof module !== "undefined" && module.exports) module.exports = BM;
})(typeof window !== "undefined" ? window : globalThis);
