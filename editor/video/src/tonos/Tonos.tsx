import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, COLORS, easeOut, F, Grain, MusicBed, Timeline, Vignette } from "../campana/shared";
import { BASE, END, MUSIC, RAIL, SHOTS, TEXTS, TOTAL_S } from "./config";

const GRADE = "contrast(1.04) saturate(1.02) brightness(1.02) sepia(0.05)"; // warm, soft; the three tones stay true
const SOFT = "0 2px 22px rgba(40,24,18,0.45), 0 1px 3px rgba(40,24,18,0.35)";

const Text: React.FC<{ kind: string; lines: string[]; from: number; to: number }> = ({ kind, lines, from, to }) => {
  const f = useCurrentFrame();
  const a = F(from);
  const b = F(to);
  if (f < a - 1 || f > b) return null;
  const out = interpolate(f, [b - 6, b], [1, 0], clamp);
  const style: React.CSSProperties =
    kind === "big"
      ? { fontFamily: "Montserrat", fontWeight: 700, fontSize: 84, letterSpacing: "0.06em", lineHeight: 1.05 }
      : kind === "caps"
        ? { fontFamily: "Montserrat", fontWeight: 600, fontSize: 46, letterSpacing: "0.34em", textTransform: "uppercase", lineHeight: 1 }
        : kind === "num"
        ? { fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 200, lineHeight: 1 }
        : { fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 82, lineHeight: 1.04 };
  const top = kind === "num" ? 300 : kind === "big" ? 760 : kind === "caps" ? 880 : 820;
  return (
    <div style={{ position: "absolute", top: top - 40, left: 30, right: 30, padding: "40px 0", textAlign: "center", opacity: out, background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(45,30,24,0.46) 0%, rgba(45,30,24,0.22) 55%, rgba(45,30,24,0) 80%)" }}>
      {lines.map((l, k) => {
        const p = interpolate(f, [a + k * 4, a + k * 4 + 10], [0, 1], { ...clamp, easing: easeOut });
        return (
          <div key={k} style={{ ...style, color: COLORS.ivory, textShadow: SOFT, opacity: a === 0 && k === 0 ? 1 : p, transform: `translateY(${(1 - p) * 16}px)`, filter: `blur(${(1 - p) * 4}px)` }}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 12], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      {RAIL.map((r, k) => (
        <div key={r.n} style={{ position: "absolute", top: 820, left: r.x - 90, width: 180, textAlign: "center", fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 92, color: COLORS.ivory, textShadow: SOFT, opacity: a(2 + k * 3), transform: `translateY(${(1 - a(2 + k * 3)) * 12}px)` }}>
          {r.n}
        </div>
      ))}
      <AbsoluteFill style={{ opacity: a(8), background: "linear-gradient(180deg, rgba(45,30,24,0) 52%, rgba(45,30,24,0.62) 66%, rgba(45,30,24,0.7) 100%)" }} />
      <div style={{ position: "absolute", top: 1060, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 96, lineHeight: 1, color: COLORS.ivory, textShadow: SOFT, opacity: a(12), transform: `translateY(${(1 - a(12)) * 14}px)` }}>{END.q}</div>
        <div style={{ marginTop: 26, fontFamily: "Montserrat", fontWeight: 600, fontSize: 32, letterSpacing: "0.24em", textTransform: "uppercase", color: COLORS.ivory, opacity: a(20) }}>{END.line}</div>
        <Img src={staticFile(END.logo)} style={{ marginTop: 26, width: 260, opacity: a(24) }} />
      </div>
    </AbsoluteFill>
  );
};

export const Tonos: React.FC = () => {
  const end = SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
      <Vignette strength={0.22} />
      <Grain opacity={0.035} />
      {TEXTS.map((t, i) => (
        <Text key={i} {...t} />
      ))}
      <Sequence from={F(end.from)}>
        <Close />
      </Sequence>
      <MusicBed music={MUSIC} words={[]} total={F(TOTAL_S)} />
    </AbsoluteFill>
  );
};
