// Dawnward, the 60 s flagship (1080x1920). Built from timeline.ts.
// Real interface: the app's own screens, corrected in code to match the
// shipped product. Cinematic shots: Higgsfield, anchored to the app's planet art.
import React, { useMemo, useState } from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender,
  interpolate, interpolateColors, staticFile, useCurrentFrame,
} from "remotion";
import { color, ease, font, fontFaces, sec, FPS } from "../theme";
import { CARDS, SCORE, SFX, SHOTS, VO, VO_LEN, FILM_SECONDS, type Shot } from "./timeline";

export type FlagshipProps = { captions: boolean; stem: "all" | "dialogue" | "music" | "fx" };
export const FLAGSHIP_FRAMES = sec(FILM_SECONDS);

const clampI = (f: number, a: number, b: number, from = 0, to = 1, e = ease.move) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

// ---------------------------------------------------------------- fonts ----
const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  const [ready, setReady] = useState(false);
  React.useEffect(() => {
    Promise.all(['400 72px "Source Serif 4"', '400 31px "Albert Sans"', '400 21px "IBM Plex Mono"', '600 30px "Source Sans 3"']
      .map((f) => document.fonts.load(f))).then(() => { setReady(true); continueRender(h); });
  }, [h]);
  return ready;
};
const measure = (text: string, f: string) => { const c = document.createElement("canvas").getContext("2d")!; c.font = f; return c.measureText(text).width; };
const extraFaces = `@font-face { font-family: "IBM Plex Mono"; src: url(${staticFile("fonts/IBMPlexMono_400Regular.woff2")}) format("woff2"); }`;

// ---------------------------------------------------------------- phone ----
const K = 0.78, SW = 780, SH = 1688, BEZEL = 16;
const C = { x: 540, y: 1110 };
const S0 = { x: C.x - (SW * K) / 2, y: C.y - (SH * K) / 2 };
const UI_PX = 31;
const L1 = "Snapped at my sister again.", L2 = "Don't know why.";
const uiText: React.CSSProperties = { position: "absolute", font: `400 ${UI_PX}px ${font.app}`, color: color.ink, whiteSpace: "pre", lineHeight: 1 };

const Phone: React.FC<{ P: number; ty: number; opacity: number; children: React.ReactNode }> = ({ P, ty, opacity, children }) => (
  <div style={{ position: "absolute", left: C.x, top: C.y + ty, width: 0, height: 0, opacity, transform: `scale(${P})`, transformOrigin: "0 0" }}>
    <div style={{ position: "absolute", left: -(SW * K) / 2 - BEZEL, top: -(SH * K) / 2 - BEZEL, width: SW * K + BEZEL * 2, height: SH * K + BEZEL * 2, borderRadius: 96,
      background: "linear-gradient(145deg, #2A3038 0%, #12161C 40%, #0A0C10 100%)", boxShadow: "0 60px 120px -30px rgba(0,0,0,.85), inset 0 0 0 1.5px rgba(236,233,226,.10)" }} />
    <div style={{ position: "absolute", left: -(SW * K) / 2, top: -(SH * K) / 2, width: SW * K, height: SH * K, borderRadius: 80, overflow: "hidden", background: color.ground }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transform: `scale(${K})`, transformOrigin: "0 0" }}>{children}</div>
    </div>
  </div>
);
const toFrame = (P: number, ty: number, sx: number, sy: number) => ({ x: C.x + (S0.x + sx * K - C.x) * P, y: C.y + (S0.y + sy * K - C.y) * P + ty });
const Veil: React.FC<{ amt: number; hole: [number, number, number, number] }> = ({ amt, hole: [x, y, w, h] }) => (
  <div style={{ position: "absolute", inset: 0, opacity: amt, background: "rgba(4,6,10,.86)",
    clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${x}px ${y}px, ${x}px ${y + h}px, ${x + w}px ${y + h}px, ${x + w}px ${y}px, ${x}px ${y}px)` }} />
);

// typing rhythm: deterministic, slightly human
const jitter = (i: number) => Math.sin(i * 12.9898) * 0.6;
const keys = (text: string, start: number, per: number, pause?: [number, number]) => {
  const f: number[] = []; let t = start;
  for (let i = 0; i < text.length; i++) { if (pause && i === pause[0]) t += pause[1]; f.push(Math.round(t + jitter(i))); t += per; }
  return f;
};
const T1 = keys(L1, 6, 1.9), T2 = keys(L2, 70, 1.8, [11, 6]);
const typed = (fs: number[], f: number) => fs.filter((x) => x <= f).length;

// ---------------------------------------------------------------- scenes ---
const BIG = 72;
const OpeningAndHandoff: React.FC<{ f: number; m: Measures }> = ({ f, m }) => {
  // A: typed on black (0 to 3.8 s); B: into the debrief (3.8 to 6.2 s)
  const h = clampI(f, sec(3.8), sec(4.7));
  const P = interpolate(h, [0, 1], [1.14, 1]) * clampI(f, sec(5.4), sec(6.2), 1, 3.2, ease.move); // then dive into the screen's light
  const phoneOpacity = interpolate(h, [0, 0.55], [0, 1], { extrapolateRight: "clamp" }) * clampI(f, sec(5.95), sec(6.2), 1, 0);
  const target = toFrame(1, 0, 83, 502);
  const sc = interpolate(h, [0, 1], [1, (UI_PX * K) / BIG]);
  const left = 540 - m.big1 / 2;
  const n1 = typed(T1, f), n2 = typed(T2, f);
  const caret = f < sec(3.8) && (Math.floor(f / 15) % 2 === 0 || T1.concat(T2).some((k) => f - k >= 0 && f - k < 8));
  const glow = clampI(f, sec(5.5), sec(6.2), 0, 1, ease.enter);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: phoneOpacity, background: `radial-gradient(60% 42% at 50% 56%, ${color.duskAmber} 0%, rgba(4,6,10,0) 100%)` }} />
      <Phone P={P} ty={0} opacity={phoneOpacity}>
        <Img src={staticFile("img/debrief-story.webp")} style={{ width: SW, height: SH }} />
        <div style={{ position: "absolute", left: 66, top: 452, width: 640, height: 120, background: "#13161E" }} />
        <div style={{ ...uiText, left: 83, top: 502 - UI_PX * 0.8, opacity: clampI(h, 0.7, 1) }}>{L1}</div>
        <div style={{ ...uiText, left: 83, top: 546 - UI_PX * 0.8, opacity: clampI(h, 0.7, 1) }}>{L2}</div>
      </Phone>
      <div style={{ position: "absolute", left: interpolate(h, [0, 1], [left, target.x]), top: interpolate(h, [0, 1], [860, target.y]) - BIG * 0.78,
        transform: `scale(${sc})`, transformOrigin: `0 ${BIG * 0.78}px`, font: `400 ${BIG}px ${font.display}`, color: color.ink, whiteSpace: "pre", lineHeight: 1, opacity: clampI(h, 0.7, 1, 1, 0) }}>
        <div>{L1.slice(0, n1)}{n2 === 0 && caret && <Caret />}</div>
        <div style={{ marginTop: 22 }}>{L2.slice(0, n2)}{n2 > 0 && caret && <Caret />}</div>
      </div>
      {/* the screen's light becomes the first light (match on a point of light) */}
      <AbsoluteFill style={{ opacity: glow, background: `radial-gradient(circle at 50% 50%, rgba(255,236,196,${0.9 * glow}) 0, rgba(201,169,106,${0.35 * glow}) 6%, rgba(4,6,10,0) 22%), ${color.void}` }} />
    </AbsoluteFill>
  );
};

const SlideToToday: React.FC<{ f: number; m: Measures }> = ({ f, m }) => {
  // local f from 15.12 s: phone rises in, slides to Today, "sister" travels, push in
  const inA = clampI(f, 0, sec(0.7), 0, 1, ease.settle);
  const sl = clampI(f, sec(1.4), sec(1.9));
  const settle = clampI(f, sec(1.9), sec(2.7), 0, 1, ease.settle);
  const notice = clampI(f, sec(0.8), sec(1.15), 0, 1, ease.enter);
  const push = clampI(f, sec(2.6), sec(4.0), 0, 1, ease.settle);
  const P = interpolate(push, [0, 1], [1, 1.3]), ty = interpolate(push, [0, 1], [0, 70]) + (1 - inA) * 120;
  const tod = clampI(f, sec(1.2), sec(2.6));
  const glowC = interpolateColors(tod, [0, 1], [color.duskAmber, color.predawnIndigo]);
  const A = { x: 83 + m.preSisterUI, y: 502 }, B = { x: 91 + m.preSisterStep, y: 953 };
  const sx = interpolate(sl, [0, 1], [A.x, B.x]), sy = interpolate(sl, [0, 1], [A.y, B.y]) + Math.sin(Math.PI * sl) * -40;
  const sisColor = interpolateColors(Math.min(notice, 1 - settle), [0, 1], [color.ink, color.gold]);
  const halo = clampI(f, sec(1.9), sec(2.3), 0, 1, ease.enter) * (1 - 0.55 * clampI(f, sec(2.3), sec(3.4)));
  return (
    <AbsoluteFill style={{ opacity: inA }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 42% at 50% 56%, ${glowC} 0%, rgba(4,6,10,0) 100%)` }} />
      <AbsoluteFill style={{ opacity: clampI(f, sec(1.9), sec(4)) * 0.22, background: `radial-gradient(90% 30% at 50% 104%, ${color.dawn} 0%, rgba(232,168,124,0) 100%)` }} />
      <Phone P={P} ty={ty} opacity={1}>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-SW * sl}px)` }}>
          <Img src={staticFile("img/debrief-story.webp")} style={{ width: SW, height: SH }} />
          <div style={{ position: "absolute", left: 66, top: 452, width: 640, height: 120, background: "#13161E" }} />
          <div style={{ ...uiText, left: 83, top: 502 - UI_PX * 0.8 }}><span>Snapped at my </span><span style={{ color: sisColor, opacity: f >= sec(1.4) ? 0 : 1 }}>sister</span><span> again.</span></div>
          <div style={{ ...uiText, left: 83, top: 546 - UI_PX * 0.8 }}>{L2}</div>
        </div>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${SW * (1 - sl)}px)` }}>
          <Img src={staticFile("img/today-story.webp")} style={{ width: SW, height: SH }} />
          <div style={{ position: "absolute", left: 46, top: 832, width: 688, height: 286, borderRadius: 26, boxShadow: `0 0 0 2px rgba(201,169,106,${0.85 * halo}), 0 0 60px rgba(201,169,106,${0.25 * halo})` }} />
        </div>
        <Veil amt={push} hole={[40, 815, 700, 320]} />
        {f >= sec(1.4) && settle < 1 && <div style={{ ...uiText, left: sx, top: sy - UI_PX * 0.8, color: sisColor, textShadow: `0 0 ${18 * (1 - settle)}px rgba(201,169,106,${0.6 * (1 - settle)})` }}>sister</div>}
      </Phone>
    </AbsoluteFill>
  );
};

const Cards: React.FC<{ t: number }> = ({ t }) => {
  const cur = [...CARDS].reverse().find((c) => t >= c.at);
  if (!cur) return <AbsoluteFill style={{ background: color.void }} />;
  const k = interpolate(t - cur.at, [0, 0.16], [0, 1], { extrapolateRight: "clamp", easing: ease.enter });
  return (
    <AbsoluteFill style={{ background: color.void, alignItems: "center", justifyContent: "center" }}>
      <div style={{ font: `400 132px ${font.display}`, color: color.ink, opacity: k, transform: `translateY(${(1 - k) * 18}px)`, letterSpacing: "-0.01em" }}>{cur.text}</div>
    </AbsoluteFill>
  );
};

const INSIGHT = { x: 49, y: 1135, w: 682, h: 373 };
const Insight: React.FC<{ f: number }> = ({ f }) => {
  // local f from 30.6 s. Rises to land on the climax (33.89 s), pushes in, then the dispute.
  const climax = sec(33.89 - 30.6);
  const rise = clampI(f, 0, climax, 0, 1, ease.settle);
  const push = clampI(f, sec(3.7), sec(5.4), 0, 1, ease.settle);
  const P = interpolate(push, [0, 1], [0.86, 1.3]), ty = interpolate(rise, [0, 1], [900, 0]) + interpolate(push, [0, 1], [0, -318]);
  const ping = clampI(f, sec(40.0 - 30.6), sec(41.2 - 30.6), 0, 1, (x) => x);
  const disp = clampI(f, sec(40.3 - 30.6), sec(41.0 - 30.6));
  const out = clampI(f, sec(43.3 - 30.6), sec(43.9 - 30.6), 1, 0);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 42% at 50% 56%, ${color.predawnIndigo} 0%, rgba(4,6,10,0) 100%)`, opacity: rise }} />
      <Phone P={P} ty={ty} opacity={rise}>
        <Img src={staticFile("img/you-story.webp")} style={{ width: SW, height: SH }} />
        {ping > 0 && ping < 1 && (
          <div style={{ position: "absolute", left: 80 - ping * 30, top: 1405 - ping * 34, width: 220 + ping * 60, height: 72 + ping * 68, borderRadius: 24 + ping * 14,
            border: `3px solid rgba(180,101,95,${0.55 * (1 - ping)})` }} />
        )}
        {disp > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: disp }}>
            {/* what the app does: set aside at your word (you.tsx: opacity 0.5, new label, no button) */}
            <div style={{ position: "absolute", left: 85, top: 1170, width: 600, height: 36, background: "#13161E" }} />
            <div style={{ position: "absolute", left: 62, top: 1400, width: 270, height: 96, background: "#13161E" }} />
            <div style={{ position: "absolute", left: 91, top: 1196 - 17, font: `400 21px "IBM Plex Mono"`, letterSpacing: "4.8px", color: color.dim, whiteSpace: "pre", lineHeight: 1 }}>SET ASIDE, AT YOUR WORD</div>
            <div style={{ position: "absolute", left: INSIGHT.x - 1, top: INSIGHT.y - 1, width: INSIGHT.w + 2, height: INSIGHT.h + 2, borderRadius: 27, background: "rgba(11,14,18,.5)" }} />
          </div>
        )}
        <Veil amt={push} hole={[40, 1118, 700, 405]} />
      </Phone>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const a = interpolate(t, [54.54, 55.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.enter });
  const b = interpolate(t, [56.0, 56.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.enter });
  return (
    <AbsoluteFill style={{ background: color.void, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ width: 12, height: 12, borderRadius: 6, background: color.gold, boxShadow: "0 0 50px 16px rgba(201,169,106,.45)", opacity: a, marginBottom: 54 }} />
      <div style={{ font: `400 150px ${font.display}`, color: color.ink, opacity: a, transform: `translateY(${(1 - a) * 16}px)`, letterSpacing: "0.01em" }}>Dawnward</div>
      <div style={{ font: `400 50px ${font.display}`, color: color.dim, opacity: a, marginTop: 14 }}>Become who you are becoming.</div>
      <div style={{ opacity: b, marginTop: 70, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ font: `600 34px ${font.label}`, color: color.void, background: color.gold, padding: "24px 44px", borderRadius: 999 }}>Follow the build on Instagram</div>
        <div style={{ font: `600 38px ${font.label}`, color: color.ink }}>@bianno.becoming</div>
        <div style={{ font: `400 30px ${font.label}`, color: color.faint }}>Coming soon. In private testing.</div>
      </div>
    </AbsoluteFill>
  );
};

const Video: React.FC<{ shot: Shot; f: number }> = ({ shot, f }) => {
  const len = shot.to - shot.from;
  const fadeIn = shot.id === "C" ? clampI(f, 0, sec(0.5), 0, 1, ease.enter) : 1; // C rises out of the light
  const drift = 1 + 0.04 * (f / sec(len)); // a slow, constant push keeps cuts alive
  return (
    <AbsoluteFill style={{ background: color.void }}>
      <AbsoluteFill style={{ opacity: fadeIn, transform: `scale(${drift})` }}>
        <OffthreadVideo src={staticFile(shot.src!)} startFrom={Math.round((shot.srcIn || 0) * FPS)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- film -----
type Measures = { big1: number; preSisterUI: number; preSisterStep: number };

export const Flagship: React.FC<FlagshipProps> = ({ captions, stem }) => {
  const frame = useCurrentFrame();
  const ready = useFonts();
  const m = useMemo<Measures | null>(() => (ready ? {
    big1: measure(L1, `400 ${BIG}px "Source Serif 4"`),
    preSisterUI: measure("Snapped at my ", `400 ${UI_PX}px "Albert Sans"`),
    preSisterStep: measure("Call your ", `400 ${UI_PX}px "Albert Sans"`),
  } : null), [ready]);
  const t = frame / FPS;
  const vis = stem === "all";
  const capLines = VO.filter((v) => v.file !== "audio/n7.mp3"); // the end card says it
  const cap = capLines.find((v) => t >= v.at && t < v.at + VO_LEN[v.file] + 0.35 && !(t >= 21.4 && t < 25.7));
  const title = t >= 50.0 && t < 54.3 ? "Your own words, back to you." : null;
  const demo = (t >= 3.9 && t < 6.0) || (t >= 15.12 && t < 21.4) || (t >= 30.8 && t < 43.6);
  const fade = interpolate(t, [59.1, 59.95], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const duck = (f: number) => {
    const tt = f / FPS;
    const inVO = VO.some((v) => tt > v.at - 0.15 && tt < v.at + VO_LEN[v.file] + 0.2);
    return inVO ? SCORE.duck : 1;
  };
  const ducked = useMemo(() => {
    // smooth the duck so the music breathes rather than steps (computed per frame, deterministic)
    const out: number[] = []; let g = 1;
    for (let f = 0; f < FLAGSHIP_FRAMES; f++) { g += (duck(f) - g) * 0.22; out.push(g); }
    return out;
  }, []);

  return (
    <AbsoluteFill style={{ background: color.void }}>
      <style>{fontFaces + extraFaces}</style>
      {vis && m && (
        <AbsoluteFill style={{ opacity: fade }}>
          {SHOTS.map((s) => {
            const from = sec(s.from), dur = sec(s.to) - sec(s.from);
            return (
              <Sequence key={s.id} from={from} durationInFrames={dur}>
                {s.kind === "video" && <Video shot={s} f={frame - from} />}
                {s.kind === "phone" && s.id === "F" && <SlideToToday f={frame - from} m={m} />}
                {s.kind === "cards" && <Cards t={t} />}
                {s.kind === "insight" && <Insight f={frame - from} />}
                {s.kind === "end" && <EndCard t={t} />}
              </Sequence>
            );
          })}
          <Sequence from={0} durationInFrames={sec(6.2)}><OpeningAndHandoff f={frame} m={m} /></Sequence>

          {/* captions mirror the narration; the clean version drops them */}
          {captions && cap && (
            <div style={{ position: "absolute", top: 150, left: 70, right: 70, textAlign: "center", font: `400 56px/1.2 ${font.display}`, color: color.ink, textShadow: "0 0 30px rgba(4,6,10,.95), 0 2px 6px rgba(4,6,10,.9)", textWrap: "balance" as never }}>{cap.text}</div>
          )}
          {title && (
            <div style={{ position: "absolute", top: 300, left: 70, right: 70, textAlign: "center", font: `400 76px/1.15 ${font.display}`, color: color.ink,
              opacity: interpolate(t, [50.0, 50.6, 53.7, 54.3], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), textShadow: "0 0 40px rgba(4,6,10,.8)", textWrap: "balance" as never }}>{title}</div>
          )}
          {demo && <div style={{ position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center", font: `400 26px ${font.label}`, color: color.faint }}>Demonstration content</div>}
        </AbsoluteFill>
      )}

      {/* sound: stems render separately (stem prop); "all" is the mix */}
      {(stem === "all" || stem === "music") && (
        <Audio src={staticFile(SCORE.file)} volume={(f) => SCORE.gain * (stem === "music" ? 1 : ducked[Math.min(f, FLAGSHIP_FRAMES - 1)]) * interpolate(f, [sec(59.0), sec(60)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      )}
      {(stem === "all" || stem === "dialogue") && VO.map((v) => (
        <Sequence key={v.file} from={sec(v.at)}><Audio src={staticFile(v.file)} volume={v.gain || 1} /></Sequence>
      ))}
      {(stem === "all" || stem === "fx") && (
        <>
          {T1.concat(T2).map((f, i) => ((L1 + L2)[i] === " " ? null : (
            <Sequence key={`k${i}`} from={f} durationInFrames={18}><Audio src={staticFile("audio/tick.wav")} volume={0.26 + 0.08 * Math.sin(i * 7.1)} playbackRate={1 + 0.06 * Math.sin(i * 3.3)} /></Sequence>
          )))}
          {SFX.map((x, i) => <Sequence key={`s${i}`} from={sec(x.at)} durationInFrames={sec(3.5)}><Audio src={staticFile(x.file)} volume={x.gain} /></Sequence>)}
        </>
      )}
    </AbsoluteFill>
  );
};

const Caret: React.FC = () => <span style={{ display: "inline-block", width: 4, height: 58, marginLeft: 6, background: color.gold, verticalAlign: "-8px" }} />;
