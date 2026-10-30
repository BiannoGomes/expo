// Motion proof (9.5 s): "Your words, back to you".
// The confession typed at night becomes the morning step. The word "sister"
// travels from one real screen to the other on a matched vector.
import React, { useMemo, useState } from "react";
import {
  AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, interpolate,
  interpolateColors, staticFile, useCurrentFrame,
} from "remotion";
import { color, ease, font, fontFaces, sec } from "./theme";

export const PROOF_FRAMES = sec(9.5);

// ---- phone geometry (frame px at rest) ------------------------------------
const K = 0.78;                       // screen px -> frame px
const SW = 780, SH = 1688;            // shipped screen captures
const C = { x: 540, y: 1110 };        // phone centre at rest
const S0 = { x: C.x - (SW * K) / 2, y: C.y - (SH * K) / 2 };
const BEZEL = 16;

// ---- the words ---------------------------------------------------------------
const L1 = "Snapped at my sister again.";
const L2 = "Don't know why.";
const UI_PX = 31;                     // the debrief's input text, in screen px
const UI_X = 83, UI_B1 = 502, UI_B2 = 546;
const STEP_X = 91, STEP_B = 953;      // "Call your sister." on Today, card 3
const BIG_PX = 72;

// typing: deterministic, slightly human (never a metronome)
const jitter = (i: number) => Math.sin(i * 12.9898) * 0.6;
const typeFrames = (text: string, start: number, per: number, pauseBefore?: { at: number; frames: number }) => {
  const f: number[] = [];
  let t = start;
  for (let i = 0; i < text.length; i++) {
    if (pauseBefore && i === pauseBefore.at) t += pauseBefore.frames;
    f.push(Math.round(t + jitter(i)));
    t += per;
  }
  return f;
};
const T1 = typeFrames(L1, 9, 2.1);
const T2 = typeFrames(L2, 86, 2.0, { at: 11, frames: 6 }); // a breath before "why."
const typed = (frames: number[], frame: number) => frames.filter((f) => f <= frame).length;

// ---- key frames ----------------------------------------------------------------
const F = {
  handoff: [sec(3.8), sec(4.75)],     // big words fly into the input; the phone appears
  lightOn: sec(5.0),                  // "sister" is noticed
  slide: [sec(5.5), sec(6.0)],        // debrief -> Today, the word flies with it
  land: sec(6.0),
  push: [sec(6.4), sec(8.0)],         // in to the step
  vo: sec(4.6),                       // "Every morning, three small steps. Drawn from your own words."
};

const useFontsReady = () => {
  const [handle] = useState(() => delayRender("fonts"));
  const [ready, setReady] = useState(false);
  React.useEffect(() => {
    Promise.all(['400 64px "Source Serif 4"', '400 31px "Albert Sans"', '400 40px "Source Sans 3"']
      .map((f) => document.fonts.load(f))).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  return ready;
};
const measure = (text: string, f: string) => {
  const c = document.createElement("canvas").getContext("2d")!;
  c.font = f; return c.measureText(text).width;
};

export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const ready = useFontsReady();
  const m = useMemo(() => (ready ? {
    big1: measure(L1, `400 ${BIG_PX}px "Source Serif 4"`),
    preSisterUI: measure("Snapped at my ", `400 ${UI_PX}px "Albert Sans"`),
    preSisterStep: measure("Call your ", `400 ${UI_PX}px "Albert Sans"`),
  } : null), [ready]);
  if (!m) return <AbsoluteFill style={{ background: color.void }}><style>{fontFaces}</style></AbsoluteFill>;

  const clampE = (a: number, b: number, e = ease.move) => interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

  // phone transform: appears with a short pull-back, later pushes in to the step
  const h = clampE(F.handoff[0], F.handoff[1]);
  const p = clampE(F.push[0], F.push[1], ease.settle);
  const P = interpolate(h, [0, 1], [1.14, 1]) * interpolate(p, [0, 1], [1, 1.3]);
  const ty = interpolate(p, [0, 1], [0, 70]); // the step lands below the words, never under them
  const phoneOpacity = interpolate(h, [0, 0.55], [0, 1], { extrapolateRight: "clamp" });
  const toFrame = (sx: number, sy: number) => ({
    x: C.x + (S0.x + sx * K - C.x) * P,
    y: C.y + (S0.y + sy * K - C.y) * P + ty,
  });

  // the big words: typed on black, then they fly into the input box
  const n1 = typed(T1, frame), n2 = typed(T2, frame);
  const bigLeft = 540 - m.big1 / 2, bigB1 = 860, lineGapBig = 94;
  const target = toFrame(UI_X, UI_B1);
  const sc = interpolate(h, [0, 1], [1, (UI_PX * K * P) / BIG_PX]);
  const bigX = interpolate(h, [0, 1], [bigLeft, target.x]);
  const bigY = interpolate(h, [0, 1], [bigB1, target.y]);
  const bigOpacity = interpolate(h, [0.7, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const caretOn = frame < F.handoff[0] + 4 && Math.floor(frame / 15) % 2 === 0 || (frame > 8 && frame < F.handoff[0] && (T1.includes(frame) || T2.includes(frame) || frame - Math.max(...T1.concat(T2).filter((f) => f <= frame), 0) < 8));

  // time of day: evening amber behind the debrief, predawn indigo after the slide
  const tod = clampE(F.slide[0] - 6, F.slide[1] + 24, ease.move);
  const glow = interpolateColors(tod, [0, 1], [color.duskAmber, color.predawnIndigo]);
  const dawnEdge = clampE(F.slide[1], F.push[1], ease.enter) * 0.22;

  // the screens slide like the app's own tab change
  const sl = clampE(F.slide[0], F.slide[1]);
  const debriefX = -SW * sl, todayX = SW * (1 - sl);
  // "sister": noticed, then carried across on a matched vector
  const notice = clampE(F.lightOn, F.lightOn + 10, ease.enter);
  const fly = sl;
  const sisA = { x: UI_X + m.preSisterUI, y: UI_B1 }, sisB = { x: STEP_X + m.preSisterStep, y: STEP_B };
  const arc = Math.sin(Math.PI * fly) * -40; // a gentle lift through the move
  const sisX = interpolate(fly, [0, 1], [sisA.x, sisB.x]), sisY = interpolate(fly, [0, 1], [sisA.y, sisB.y]) + arc;
  const settle = clampE(F.land, F.land + 24, ease.settle);
  const sisColor = interpolateColors(Math.min(notice, 1 - settle), [0, 1], [color.ink, color.gold]);
  const flyVisible = frame >= F.slide[0] && settle < 1;
  // the step, held: everything else on the screen steps back
  const spot = clampE(F.push[0], F.push[0] + 18, ease.enter);
  const cardHalo = clampE(F.land, F.land + 12, ease.enter) * (1 - 0.55 * clampE(F.land + 12, F.land + 45, ease.settle));

  // narration captions, timed to the line's own phrasing (nE)
  const capA = frame >= F.vo && frame < PROOF_FRAMES ? 1 : 0;
  const capB = frame >= F.vo + sec(2.76) ? 1 : 0;
  const capIn = (start: number) => interpolate(frame, [start, start + 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.enter });
  const fadeOut = interpolate(frame, [PROOF_FRAMES - 10, PROOF_FRAMES - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const uiText: React.CSSProperties = { position: "absolute", font: `400 ${UI_PX}px ${font.app}`, color: color.ink, whiteSpace: "pre", lineHeight: 1 };

  return (
    <AbsoluteFill style={{ background: color.void, opacity: fadeOut }}>
      <style>{fontFaces}</style>

      {/* light behind the phone: the app's own evening and predawn tones */}
      <AbsoluteFill style={{ opacity: phoneOpacity, background: `radial-gradient(60% 42% at 50% 56%, ${glow} 0%, rgba(4,6,10,0) 100%)` }} />
      <AbsoluteFill style={{ opacity: dawnEdge, background: `radial-gradient(90% 30% at 50% 104%, ${color.dawn} 0%, rgba(232,168,124,0) 100%)` }} />

      {/* the phone */}
      <div style={{
        position: "absolute", left: C.x, top: C.y + ty, width: 0, height: 0, opacity: phoneOpacity,
        transform: `scale(${P})`, transformOrigin: "0 0",
      }}>
        <div style={{
          position: "absolute", left: -(SW * K) / 2 - BEZEL, top: -(SH * K) / 2 - BEZEL,
          width: SW * K + BEZEL * 2, height: SH * K + BEZEL * 2, borderRadius: 96,
          background: "linear-gradient(145deg, #2A3038 0%, #12161C 40%, #0A0C10 100%)",
          boxShadow: "0 60px 120px -30px rgba(0,0,0,.85), inset 0 0 0 1.5px rgba(236,233,226,.10)",
        }} />
        <div style={{ position: "absolute", left: -(SW * K) / 2, top: -(SH * K) / 2, width: SW * K, height: SH * K, borderRadius: 80, overflow: "hidden", background: color.ground }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transform: `scale(${K})`, transformOrigin: "0 0" }}>
            {/* Debrief, with the confession in its input */}
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${debriefX}px)` }}>
              <Img src={staticFile("img/debrief-story.webp")} style={{ width: SW, height: SH }} />
              <div style={{ position: "absolute", left: 66, top: 452, width: 640, height: 120, background: "#13161E" }} />
              <div style={{ ...uiText, left: UI_X, top: UI_B1 - UI_PX * 0.8, opacity: interpolate(h, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
                <span>Snapped at my </span>
                <span style={{ color: sisColor, opacity: frame >= F.slide[0] ? 0 : 1 }}>sister</span>
                <span> again.</span>
              </div>
              <div style={{ ...uiText, left: UI_X, top: UI_B2 - UI_PX * 0.8, opacity: interpolate(h, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{L2}</div>
            </div>
            {/* Today: the step the words became */}
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${todayX}px)` }}>
              <Img src={staticFile("img/today-story.webp")} style={{ width: SW, height: SH }} />
              <div style={{ position: "absolute", left: 46, top: 832, width: 688, height: 286, borderRadius: 26,
                boxShadow: `0 0 0 2px rgba(201,169,106,${0.85 * cardHalo}), 0 0 60px rgba(201,169,106,${0.25 * cardHalo})` }} />
            </div>
            {/* the rest of the screen steps back while the step is read */}
            <div style={{ position: "absolute", inset: 0, opacity: spot, pointerEvents: "none",
              background: "rgba(4,6,10,.72)",
              clipPath: "polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 40px 815px, 40px 1135px, 740px 1135px, 740px 815px, 40px 815px)" }} />
            {/* the travelling word */}
            {flyVisible && (
              <div style={{ ...uiText, left: sisX, top: sisY - UI_PX * 0.8, color: sisColor,
                textShadow: `0 0 ${18 * (1 - settle)}px rgba(201,169,106,${0.6 * (1 - settle)})` }}>sister</div>
            )}
          </div>
        </div>
      </div>

      {/* the words, first on black */}
      <div style={{
        position: "absolute", left: bigX, top: bigY - BIG_PX * 0.78, transform: `scale(${sc})`, transformOrigin: `0 ${BIG_PX * 0.78}px`,
        font: `400 ${BIG_PX}px ${font.display}`, color: color.ink, whiteSpace: "pre", opacity: bigOpacity, lineHeight: 1,
      }}>
        <div>{L1.slice(0, n1)}{n2 === 0 && caretOn && <Caret />}</div>
        <div style={{ marginTop: lineGapBig - BIG_PX }}>{L2.slice(0, n2)}{n2 > 0 && caretOn && <Caret />}</div>
      </div>

      {/* narration */}
      <div style={{ position: "absolute", top: 150, left: 80, right: 80, textAlign: "center", font: `400 54px/1.2 ${font.display}`, color: color.ink, textShadow: "0 0 30px rgba(4,6,10,.9)" }}>
        <div style={{ opacity: capA * capIn(F.vo), transform: `translateY(${(1 - capIn(F.vo)) * 12}px)` }}>Every morning, three small steps.</div>
        <div style={{ opacity: capB * capIn(F.vo + sec(2.76)), transform: `translateY(${(1 - capIn(F.vo + sec(2.76))) * 12}px)` }}>Drawn from your own words.</div>
      </div>
      <div style={{ position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center", font: `400 26px ${font.label}`, color: color.faint, opacity: phoneOpacity }}>
        Demonstration content
      </div>

      {/* sound: the score's opening, keys, the slide, the landing, the voice */}
      <Audio src={staticFile("audio/score-open.wav")} volume={(f) =>
        interpolate(f, [0, 24], [0, 0.9], { extrapolateRight: "clamp" }) *
        interpolate(f, [F.vo - 6, F.vo + 6, PROOF_FRAMES - 12, PROOF_FRAMES], [1, 0.5, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {T1.concat(T2).map((f, i) => (L1 + L2)[i] === " " ? null : (
        <Sequence key={i} from={f} durationInFrames={18}><Audio src={staticFile("audio/tick.wav")} volume={0.28 + 0.08 * Math.sin(i * 7.1)} playbackRate={1 + 0.06 * Math.sin(i * 3.3)} /></Sequence>
      ))}
      <Sequence from={F.slide[0] - 4} durationInFrames={sec(2)}><Audio src={staticFile("audio/breath.wav")} volume={0.35} /></Sequence>
      <Sequence from={F.land - 2} durationInFrames={sec(3)}><Audio src={staticFile("audio/star-chime.wav")} volume={0.28} /></Sequence>
      <Sequence from={F.vo}><Audio src={staticFile("audio/nE.mp3")} volume={1} /></Sequence>
    </AbsoluteFill>
  );
};

const Caret: React.FC = () => (
  <span style={{ display: "inline-block", width: 4, height: 58, marginLeft: 6, background: color.gold, verticalAlign: "-8px" }} />
);
