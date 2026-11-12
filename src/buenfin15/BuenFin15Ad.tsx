import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import ad02 from "./buenfin15-ad02.json";
import ad02Subs from "./buenfin15-ad02.subs.json";

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
// Gotham is the brand face; Montserrat stands in until the licensed files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const CREAM = "#FBF7F0";
const INK = "#1B1917";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const fadeUp = (f: number, a: number, d = 8) => easeOut(Math.min(1, Math.max(0, (f - a) / d)));

type Shot = { id: string; frames: number; zoom: number[]; focus: number[] };
type Text = { from: number; to: number; kind: string; lines: string[] };
type Edit = { shots: Shot[]; texts: Text[]; badge: { text: string; ranges: number[][] }; subtitleTop: number };
type Sub = { from: number; to: number; text: string };

export const BUENFIN15_ADS = {
  ad02: { edit: ad02 as unknown as Edit, subs: ad02Subs as Sub[], dir: "buenfin15-ad02" },
};
export type BuenFin15AdId = keyof typeof BUENFIN15_ADS;
export const buenFin15Total = (ad: BuenFin15AdId) =>
  BUENFIN15_ADS[ad].edit.shots.reduce((n, s) => n + s.frames, 0);

const ShotView: React.FC<{ dir: string; s: Shot }> = ({ dir, s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(`${dir}/${s.id}.mp4`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${z})`,
          transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Neutral, editorial text: cream card for the message, ink chip for the offer. A short fade, nothing else. */
const Line: React.FC<{ text: string; f0: number; size: number; ink?: boolean; weight?: number; tracking?: string }> = ({
  text,
  f0,
  size,
  ink,
  weight = 800,
  tracking = "0.01em",
}) => {
  const f = useCurrentFrame();
  const p = fadeUp(f, f0);
  return (
    <div
      style={{
        alignSelf: "center",
        marginTop: 12,
        padding: `${Math.round(size * 0.22)}px ${Math.round(size * 0.5)}px ${Math.round(size * 0.28)}px`,
        borderRadius: 6,
        background: ink ? INK : CREAM,
        color: ink ? CREAM : INK,
        fontFamily: SANS,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: tracking,
        lineHeight: 1.1,
        textAlign: "center",
        maxWidth: 960,
        boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
        opacity: p,
        transform: `translateY(${(1 - p) * 10}px)`,
      }}
    >
      {text}
    </div>
  );
};

const Graphic: React.FC<{ t: Text }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from;
  const out = t.kind === "end" ? 1 : interpolate(f, [dur - 6, dur], [1, 0], clamp);
  const box: React.CSSProperties = {
    position: "absolute",
    left: 50,
    right: 50,
    top: t.kind === "end" ? 250 : t.kind === "hook" ? 270 : 320,
    display: "flex",
    flexDirection: "column",
    opacity: out,
  };
  if (t.kind === "hook")
    return (
      <div style={box}>
        <Line text={t.lines[0]} f0={0} size={70} weight={900} />
        <Line text={t.lines[1]} f0={2} size={54} ink tracking="0.06em" />
      </div>
    );
  if (t.kind === "note")
    return (
      <div style={box}>
        <Line text={t.lines[0]} f0={0} size={40} weight={600} />
      </div>
    );
  if (t.kind === "collections")
    return (
      <div style={box}>
        <Line text={t.lines[0]} f0={0} size={36} ink tracking="0.06em" />
        <Line text={t.lines[1]} f0={6} size={34} weight={800} tracking="0.05em" />
      </div>
    );
  // end: RE:SET logo + BUEN FIN on one cream card, the offer, then the invitation
  return (
    <div style={box}>
      <div
        style={{
          alignSelf: "center",
          padding: "26px 54px 22px",
          background: CREAM,
          borderRadius: 6,
          boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: fadeUp(f, 0),
          transform: `translateY(${(1 - fadeUp(f, 0)) * 10}px)`,
        }}
      >
        <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 300 }} />
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 62, letterSpacing: "0.08em", color: INK, marginTop: 10 }}>
          {t.lines[0]}
        </div>
      </div>
      <Line text={t.lines[1]} f0={6} size={46} ink tracking="0.05em" />
      <Line text={t.lines[2]} f0={12} size={42} weight={700} />
    </div>
  );
};

const Badge: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const o = Math.min(fadeUp(f, 0, 6), interpolate(f, [dur - 5, dur], [1, 0], clamp));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          padding: "8px 22px 9px",
          borderRadius: 999,
          background: INK,
          color: CREAM,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: "0.08em",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Ilana's words, literally: cream text on a soft dark plate, two lines max, plain fade. */
const Subtitle: React.FC<{ text: string; dur: number; top: number }> = ({ text, dur, top }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          maxWidth: 900,
          padding: "10px 22px 12px",
          borderRadius: 12,
          background: "rgba(20,16,14,0.55)",
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 46,
          lineHeight: 1.22,
          color: CREAM,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const BuenFin15Ad: React.FC<{ ad: BuenFin15AdId }> = ({ ad }) => {
  const { edit, subs, dir } = BUENFIN15_ADS[ad];
  let t = 0;
  const shots = edit.shots.map((s) => {
    const o = { ...s, from: t };
    t += s.frames;
    return o;
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {shots.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={15}>
          <ShotView dir={dir} s={s} />
        </Sequence>
      ))}
      {edit.badge.ranges.map(([a, b]) => (
        <Sequence key={a} from={a} durationInFrames={b - a}>
          <Badge text={edit.badge.text} dur={b - a} />
        </Sequence>
      ))}
      {edit.texts.map((g) => (
        <Sequence key={g.from} from={g.from} durationInFrames={g.to - g.from}>
          <Graphic t={g} />
        </Sequence>
      ))}
      {subs.map((s) => (
        <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
          <Subtitle text={s.text} dur={s.to - s.from} top={edit.subtitleTop} />
        </Sequence>
      ))}
      <Audio src={staticFile(`${dir}/mix.wav`)} />
    </AbsoluteFill>
  );
};
