import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { At, BeatProvider, Shade, Shot, useBeat, cl, outE } from "../outlet4/fx";

/** RE:SET PERISUR — store film, 18.8 s. The beat clock runs in seconds here (B = 1, off = 0), so every number below is a time in seconds. */
export const PERISUR_SECONDS = 18.8;
export const PERISUR_FRAMES = Math.round(PERISUR_SECONDS * 30);

const IVORY = "#FFFBF2";
const SERIF = "Playfair";
const SANS = "Montserrat";
const SH = "0 3px 26px rgba(0,0,0,0.55)";

/** a line of type that fades and rises in at second `s` (and out at `hide`, if given) */
const Line: React.FC<{ s: number; top: number; hide?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ s, top, hide, children, style }) => {
  const f = useCurrentFrame();
  const { f: F } = useBeat();
  if (f < F(s) - 1) return null;
  const p = interpolate(f, [F(s), F(s) + 12], [0, 1], { ...cl, easing: outE });
  const o = hide === undefined ? 1 : interpolate(f, [F(hide) - 8, F(hide)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", top, left: 64, right: 64, textAlign: "center", color: IVORY, textShadow: SH, opacity: p * o, transform: `translateY(${(1 - p) * 16}px)`, ...style }}>
      {children}
    </div>
  );
};

export const Perisur: React.FC<{ music: string }> = ({ music }) => (
  <BeatProvider B={1} off={0}>
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {/* 0–2.8 s · hook: the ceiling of Perisur, then the name */}
      <At b0={0} b1={2.8}>
        <Shot src="IMG_2314" at={0} z={[1.0, 1.06]} />
        <Shade top={0} h={520} o={0.45} />
        <Line s={0.5} top={300} hide={2.8} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: "0.42em", paddingLeft: "0.42em" }}>RE:SET · PERISUR</Line>
        <Line s={1.3} top={360} hide={2.8} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 84 }}>ya estamos aquí.</Line>
      </At>

      {/* 2.8–5.8 s · the walk through the mall */}
      <At b0={2.8} b1={5.8}>
        <Shot src="IMG_2272" at={0} z={[1.0, 1.04]} />
      </At>

      {/* 5.8–8.4 s · reveal: the RE:SET wall, slow push-in */}
      <At b0={5.8} b1={8.4}>
        <Shot src="IMG_2255" at={0} z={[1.0, 1.04]} />
        <Shade top={1100} h={440} o={0.5} />
      </At>
      <Line s={6.4} hide={8.4} top={1200} style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 96, letterSpacing: "0.02em" }}>RE:SET PERISUR</Line>
      <Line s={7.3} hide={8.4} top={1330} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, letterSpacing: "0.3em", paddingLeft: "0.3em" }}>ven a conocernos</Line>

      {/* 8.4–14 s · the space: quick cuts, one object per cut, no text */}
      <At b0={8.4} b1={9.4}><Shot src="IMG_2254" at={0} z={[1.0, 1.05]} /></At>
      <At b0={9.4} b1={10.4}><Shot src="IMG_3084" at={0} z={[1.0, 1.05]} /></At>
      <At b0={10.4} b1={11.5}><Shot src="IMG_2252" at={0} z={[1.0, 1.05]} /></At>
      <At b0={11.5} b1={12.6}><Shot src="IMG_2317" at={0} z={[1.0, 1.05]} /></At>
      <At b0={12.6} b1={14}><Shot src="IMG_2315" at={0} z={[1.0, 1.05]} /></At>

      {/* 14–18.8 s · closing: the counter and the wall, the invitation */}
      <At b0={14} b1={PERISUR_SECONDS}>
        <Shot src="IMG_2250" at={0} z={[1.0, 1.05]} />
        <Shade top={900} h={640} o={0.55} />
      </At>
      <Line s={15} top={1180} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 110 }}>Te esperamos.</Line>
      <Line s={15.8} top={1360} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 38, letterSpacing: "0.42em", paddingLeft: "0.42em" }}>RE:SET PERISUR</Line>

      <Audio src={staticFile(music)} />
    </AbsoluteFill>
  </BeatProvider>
);
