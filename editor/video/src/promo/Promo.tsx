import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut, F, StoreBlock, Timeline, Vignette } from "../campana/shared";
import { BASE, COPY, CUT, MUSIC, SHOTS, TOTAL_S } from "./config";

const GRADE = "contrast(1.04) saturate(1.04)";
const INK = "#151515";
const LIME = "#E2EC95"; // brand
const PAPER = "#FFFBF2";
const FONT = "Montserrat";

/** OUTLET / 25% OFF block — the same mark as the outlet ads */
const Badge: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: INK, padding: "18px 40px 22px", transform: `scale(${scale})` }}>
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, letterSpacing: "0.42em", marginRight: "-0.42em", color: PAPER }}>{COPY.outlet}</div>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 168, lineHeight: 0.95, letterSpacing: "-0.03em", color: LIME }}>{COPY.off}</div>
  </div>
);

/** 0–4.6 s: 25% OFF is on frame 0 (thumbnail), the question lands a beat later */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(CUT.hookEnd) - 6, F(CUT.hookEnd)], [1, 0], clamp);
  const pop = interpolate(f, [0, 6], [1.08, 1], { ...clamp, easing: easeOut });
  const q = interpolate(f, [8, 18], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ position: "absolute", top: 300, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", opacity: out }}>
      <div style={{ transform: `scale(${pop})` }}>
        <Badge />
      </div>
      <div style={{ marginTop: 30, background: PAPER, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 52, lineHeight: 1.1, textAlign: "center", padding: "14px 28px 18px", opacity: q, transform: `translateY(${(1 - q) * 16}px)` }}>{COPY.hook}</div>
    </div>
  );
};

/** what's on screen + the discount, bottom-left */
const Chip: React.FC<{ text: string; sub: string; from: number; to: number }> = ({ text, sub, from, to }) => {
  const f = useCurrentFrame();
  const a = F(from), b = F(to);
  if (f < a || f >= b) return null;
  const p = interpolate(f, [a, a + 7], [0, 1], { ...clamp, easing: easeOut });
  const out = interpolate(f, [b - 5, b], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 56, top: 1010, opacity: out, clipPath: `inset(0 ${100 * (1 - p)}% 0 0)` }}>
      <div style={{ background: INK, color: PAPER, fontFamily: FONT, fontWeight: 800, fontSize: 44, padding: "10px 24px 12px", width: "fit-content" }}>{text}</div>
      <div style={{ background: LIME, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 64, padding: "6px 24px 10px", width: "fit-content" }}>{sub}</div>
    </div>
  );
};

/** 25% OFF stays in the corner from the hook to the CTA */
const Seal: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [F(CUT.hookEnd), F(CUT.hookEnd) + 8], [0, 1], clamp), interpolate(f, [F(CUT.cta) - 5, F(CUT.cta)], [1, 0], clamp));
  return <div style={{ position: "absolute", top: 292, right: 48, opacity: o, background: LIME, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 44, padding: "8px 18px" }}>{COPY.stamp}</div>;
};

const Reinforce: React.FC = () => {
  const f = useCurrentFrame();
  const style = (i: number): React.CSSProperties =>
    i === 1
      ? { background: LIME, color: INK, fontSize: 150, lineHeight: 1, letterSpacing: "-0.03em", padding: "6px 34px 14px" }
      : { background: INK, color: PAPER, fontSize: i ? 40 : 58, letterSpacing: "0.04em", padding: "10px 28px 12px" };
  return (
    <div style={{ position: "absolute", top: 700, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {COPY.reinforce.map((l, i) => {
        const p = interpolate(f, [i * 6, i * 6 + 9], [0, 1], { ...clamp, easing: easeOut });
        return <div key={l} style={{ clipPath: `inset(0 ${100 * (1 - p)}% 0 0)`, fontFamily: FONT, fontWeight: 900, ...style(i) }}>{l}</div>;
      })}
    </div>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 9], [0, 1], { ...clamp, easing: easeOut });
  const pulse = 1 + 0.03 * Math.max(0, Math.sin(((f - 16) / 30) * Math.PI * 2.4)) * (f > 16 ? 1 : 0);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0), backdropFilter: "blur(10px)", background: "rgba(16,16,16,0.6)" }} />
      <div style={{ position: "absolute", top: 320, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ opacity: a(2) }}>
          <Badge scale={0.85} />
        </div>
        <div style={{ marginTop: 34, transform: `scale(${pulse})`, background: LIME, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 80, lineHeight: 1, padding: "18px 34px 22px", opacity: a(8) }}>{COPY.cta1}</div>
        <div style={{ marginTop: 22, fontFamily: FONT, fontWeight: 700, fontSize: 38, color: PAPER, opacity: a(14) }}>{COPY.cta2}</div>
        <div style={{ marginTop: 36 }}>
          <StoreBlock delay={20} />
        </div>
        <Img src={staticFile(COPY.logo)} style={{ marginTop: 28, width: 280, opacity: a(30) }} />
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
