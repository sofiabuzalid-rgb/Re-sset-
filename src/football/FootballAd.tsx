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
import ad01 from "./football-ad01.json";
import ad01Subs from "./football-ad01.subs.json";
import ad02 from "./football-ad02.json";
import ad02Subs from "./football-ad02.subs.json";

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
// Gotham is the brand face; Montserrat stands in until the licensed files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const LIME = "#E2EC95"; // RE:SET Pantone 386
const INK = "#111111";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const pop = (f: number, a: number) => easeOut(Math.min(1, Math.max(0, (f - a) / 6)));

type Shot = { id: string; frames: number; zoom: number[]; focus: number[]; photo?: string };
type Text = { from: number; to: number; kind: string; lines: string[] };
type Edit = {
  shots: Shot[];
  texts: Text[];
  badge: { text: string; ranges: number[][] };
  subtitleTop: number;
};
type Sub = { from: number; to: number; text: string };

export const FOOTBALL_ADS = {
  ad01: { edit: ad01 as unknown as Edit, subs: ad01Subs as Sub[] },
  ad02: { edit: ad02 as unknown as Edit, subs: ad02Subs as Sub[] },
};
export type FootballAdId = keyof typeof FOOTBALL_ADS;
export const footballTotal = (ad: FootballAdId) =>
  FOOTBALL_ADS[ad].edit.shots.reduce((n, s) => n + s.frames, 0);

const ShotView: React.FC<{ dir: string; s: Shot }> = ({ dir, s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
    transform: `scale(${z})`,
    transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
  };
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      {s.photo ? (
        <Img src={staticFile(`${dir}/${s.photo}`)} style={style} />
      ) : (
        <OffthreadVideo muted src={staticFile(`${dir}/${s.id}.mp4`)} style={style} />
      )}
    </AbsoluteFill>
  );
};

/** UGC caption cards: a white card for the message, a lime chip for the offer. Snap in, no flourish. */
const Card: React.FC<{ text: string; f0: number; big?: boolean; chip?: boolean }> = ({ text, f0, big, chip }) => {
  const f = useCurrentFrame();
  const p = pop(f, f0);
  return (
    <div
      style={{
        alignSelf: "center",
        padding: chip ? "12px 30px 14px" : "14px 30px 18px",
        marginTop: 14,
        borderRadius: 18,
        background: chip ? LIME : "#FFFFFF",
        color: INK,
        fontFamily: SANS,
        fontWeight: chip ? 800 : 900,
        fontSize: big ? 78 : chip ? 54 : 50,
        letterSpacing: chip ? "0.02em" : "-0.01em",
        lineHeight: 1.08,
        textAlign: "center",
        maxWidth: 940,
        boxShadow: "0 6px 22px rgba(0,0,0,0.28)",
        opacity: p,
        transform: `scale(${0.85 + 0.15 * p})`,
      }}
    >
      {text}
    </div>
  );
};

const Graphic: React.FC<{ t: Text }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from;
  const out = interpolate(f, [dur - 5, dur], [1, 0], clamp);
  const cta = t.kind === "cta";
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: cta ? 1060 : t.kind === "question" ? 340 : 290,
        display: "flex",
        flexDirection: "column",
        opacity: out,
      }}
    >
      {t.lines.map((l, i) => (
        <Card key={l} text={l} f0={i * (cta ? 6 : 3)} big={i === 0 && t.kind !== "cta"} chip={i > 0} />
      ))}
    </div>
  );
};

/** Always-on offer reminder while the product is on screen. */
const Badge: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const o = Math.min(pop(f, 0), interpolate(f, [dur - 4, dur], [1, 0], clamp));
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 236,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          padding: "8px 22px 10px",
          borderRadius: 999,
          background: LIME,
          color: INK,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 32,
          letterSpacing: "0.04em",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Her words, literally: two lines max, plain fade, lower third clear of the platform UI. */
const Subtitle: React.FC<{ text: string; dur: number; top: number }> = ({ text, dur, top }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          maxWidth: 900,
          padding: "10px 22px 12px",
          borderRadius: 14,
          background: "rgba(0,0,0,0.55)",
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 46,
          lineHeight: 1.22,
          color: "#FFFFFF",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const FootballAd: React.FC<{ ad: FootballAdId }> = ({ ad }) => {
  const { edit, subs } = FOOTBALL_ADS[ad];
  const dir = `football-${ad}`;
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
