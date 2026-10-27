import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut, F, StoreBlock, Timeline, Vignette } from "../campana/shared";
import { BASE, COPY, CUT, MUSIC, SHOTS, TOTAL_S } from "./config";

const GRADE = "contrast(1.04) saturate(1.04)";
const INK = "#151515";
const LIME = "#E2EC95";
const PAPER = "#FFFBF2";
const SH = "0 2px 18px rgba(0,0,0,0.45)";
const FONT = "Montserrat";

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(CUT.hookEnd) - 6, F(CUT.hookEnd)], [1, 0], clamp);
  const k = (i: number) => (i <= 1 ? 1 : interpolate(f, [4, 13], [0, 1], { ...clamp, easing: easeOut })); // line 1 + DESCUENTO are there on frame 0
  const under = interpolate(f, [14, 28], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ position: "absolute", top: 300, left: 50, right: 50, textAlign: "center", opacity: out }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, letterSpacing: "0.12em", color: PAPER, textShadow: SH, opacity: k(0) }}>{COPY.hookA}</div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 6, opacity: k(1), transform: `scale(${0.92 + 0.08 * k(1)})` }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 134, lineHeight: 1, letterSpacing: "-0.03em", color: LIME, textShadow: SH }}>{COPY.hookB}</div>
        <div style={{ position: "absolute", left: 0, bottom: -10, height: 9, width: `${under * 100}%`, background: PAPER }} />
      </div>
      <div style={{ marginTop: 26, fontFamily: FONT, fontWeight: 800, fontSize: 56, letterSpacing: "0.06em", color: PAPER, textShadow: SH, opacity: k(2), transform: `translateY(${(1 - k(2)) * 14}px)` }}>{COPY.hookC}</div>
    </div>
  );
};

/** small label that follows what is on screen */
const Chip: React.FC<{ text: string; from: number; to: number }> = ({ text, from, to }) => {
  const f = useCurrentFrame();
  const a = F(from), b = F(to);
  if (f < a || f >= b) return null;
  const p = interpolate(f, [a, a + 7], [0, 1], { ...clamp, easing: easeOut });
  const out = interpolate(f, [b - 5, b], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 56, top: 1000, opacity: out, clipPath: `inset(0 ${100 * (1 - p)}% 0 0)` }}>
      <div style={{ display: "inline-block", background: PAPER, color: INK, fontFamily: FONT, fontWeight: 800, fontSize: 40, padding: "10px 24px 12px" }}>{text}</div>
    </div>
  );
};

/** discreet DESCUENTO seal, top right, from the end of the hook to the CTA */
const Seal: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [F(CUT.hookEnd), F(CUT.hookEnd) + 8], [0, 1], clamp), interpolate(f, [F(CUT.cta) - 5, F(CUT.cta)], [1, 0], clamp));
  return <div style={{ position: "absolute", top: 292, right: 48, opacity: o, border: `3px solid ${LIME}`, color: LIME, background: "rgba(21,21,21,0.55)", fontFamily: FONT, fontWeight: 900, fontSize: 32, letterSpacing: "0.14em", padding: "8px 18px" }}>{COPY.stamp}</div>;
};

const Reinforce: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {COPY.reinforce.map((l, i) => {
        const p = interpolate(f, [i * 7, i * 7 + 9], [0, 1], { ...clamp, easing: easeOut });
        return <div key={l} style={{ clipPath: `inset(0 ${100 * (1 - p)}% 0 0)`, background: i ? LIME : INK, color: i ? INK : PAPER, fontFamily: FONT, fontWeight: 900, fontSize: i ? 92 : 64, letterSpacing: i ? "-0.02em" : "0.2em", padding: "10px 32px 14px" }}>{l}</div>;
      })}
    </div>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 9], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0), backdropFilter: "blur(10px)", background: "rgba(16,16,16,0.58)" }} />
      <div style={{ position: "absolute", top: 380, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Img src={staticFile(COPY.logo)} style={{ width: 340, opacity: a(2) }} />
        <div style={{ marginTop: 40, background: LIME, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 64, lineHeight: 1.05, padding: "16px 30px 20px", opacity: a(8), transform: `translateY(${(1 - a(8)) * 14}px)` }}>{COPY.cta1}</div>
        <div style={{ marginTop: 22, fontFamily: FONT, fontWeight: 700, fontSize: 46, color: PAPER, opacity: a(14) }}>{COPY.cta2}</div>
        <div style={{ marginTop: 40 }}>
          <StoreBlock delay={20} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Promo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
    <Vignette strength={0.28} />
    <Hook />
    <Seal />
    {COPY.chips.map((c) => <Chip key={c.text} {...c} />)}
    <Sequence from={F(CUT.reinforce)} durationInFrames={F(CUT.cta) - F(CUT.reinforce)}>
      <Reinforce />
    </Sequence>
    <Sequence from={F(CUT.cta)}>
      <Cta />
    </Sequence>
    {MUSIC.src && <Audio src={staticFile(MUSIC.src)} startFrom={F(MUSIC.startAt)} volume={(f) => MUSIC.volume * interpolate(f, [F(TOTAL_S) - 30, F(TOTAL_S)], [1, 0], clamp)} />}
  </AbsoluteFill>
);
