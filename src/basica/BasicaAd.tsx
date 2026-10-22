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
import edit from "./edit.json";

/*
 * ANUNCIO 04 — "La pijama que no te quieres quitar" (Colección básica).
 * Real footage + her own words only: shots and voice phrases come from src/basica/edit.json,
 * media from scripts/build-basica-media.py. Subtitles are verbatim; the only added copy is the close card.
 */

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const INK = "#1A1416";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));

type Shot = (typeof edit.shots)[number] & { from: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
}
export const BASICA_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;
const close = shots[shots.length - 1];

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#fff" }}>
      <OffthreadVideo
        muted
        src={staticFile(`basica/${s.id}.mp4`)}
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${z})`,
          transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Verbatim subtitle: clean sentence case, soft shadow, sits above the platform UI. */
const Sub: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const o = Math.min(ramp(f, 0, 4), interpolate(f, [dur - 3, dur], [1, 0], clamp));
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top: 1350,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${(1 - ramp(f, 0, 6)) * 6}px)`,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 50,
          lineHeight: 1.18,
          textAlign: "center",
          color: "#fff",
          textShadow: "0 2px 14px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 2, 14);
  const logo = ramp(f, 10, 14);
  const cta = ramp(f, 18, 14);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: `rgba(255,255,255,${0.18 * k})` }} />
      <div
        style={{
          marginTop: 560,
          background: "rgba(255,255,255,0.92)",
          padding: "34px 64px 34px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: k,
          transform: `translateY(${(1 - k) * 14}px)`,
        }}
      >
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: "0.38em", color: INK }}>
          {edit.close.kicker}
        </div>
        <div style={{ width: 70 * logo, height: 1.5, background: INK, margin: "20px 0 24px" }} />
        <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 300, opacity: logo }} />
        <div style={{ marginTop: 26, fontFamily: SANS, fontWeight: 500, fontSize: 32, color: INK, opacity: cta }}>
          {edit.close.cta}
        </div>
        <div style={{ marginTop: 8, fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: "0.12em", color: INK, opacity: cta }}>
          {edit.close.handle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const BasicaAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fff" }}>
    {shots.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
        <ShotView s={s} />
      </Sequence>
    ))}
    {edit.subs.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
        <Sub text={s.text} dur={s.to - s.from} />
      </Sequence>
    ))}
    <Sequence from={close.from}>
      <Close />
    </Sequence>
    <Audio src={staticFile("basica/mix.wav")} />
  </AbsoluteFill>
);
