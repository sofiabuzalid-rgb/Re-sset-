import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut, F, StoreBlock, Timeline, Vignette } from "../campana/shared";
import { BASE, COPY, MODELS, MUSIC, PRICE, SHOTS, TOTAL_S } from "./config";

const GRADE = "contrast(1.07) saturate(1.05) brightness(1.02)";
const INK = "#151515";
const LIME = "#E2EC95";
const PAPER = "#FFFBF2";
const SH = "0 2px 16px rgba(0,0,0,0.4)";

/** before → after: the old price gets struck through, the new one lands */
const Price: React.FC<{ start: number; big?: boolean }> = ({ start, big }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [start + 2, start + 8], [0, 1], { ...clamp, easing: easeOut }); // strike
  const n = interpolate(f, [start + 6, start + 12], [0, 1], { ...clamp, easing: easeOut }); // new price
  const k = big ? 1 : 0.62;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 * k }}>
      <div style={{ position: "relative", fontFamily: "Montserrat", fontWeight: 700, fontSize: 84 * k, color: PAPER, opacity: 0.85, textShadow: SH }}>
        {PRICE.before}
        <div style={{ position: "absolute", left: -6, top: "52%", height: 7 * k, width: `calc(${s * 100}% + 12px)`, background: LIME, transform: "rotate(-8deg)" }} />
      </div>
      <div style={{ opacity: n, transform: `scale(${0.8 + 0.2 * n})`, transformOrigin: "left center", background: LIME, color: INK, fontFamily: "Montserrat", fontWeight: 900, fontSize: 132 * k, lineHeight: 1, padding: `${8 * k}px ${22 * k}px ${12 * k}px`, letterSpacing: "-0.03em" }}>{PRICE.after}</div>
    </div>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(4.5) - 6, F(4.5)], [1, 0], clamp);
  const line = interpolate(f, [F(2.5), F(2.5) + 9], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ position: "absolute", top: 290, left: 60, right: 60, opacity: out }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        <div style={{ background: INK, color: PAPER, fontFamily: "Montserrat", fontWeight: 800, fontSize: 44, letterSpacing: "0.32em", padding: "14px 22px 14px 30px", display: "flex", alignItems: "center" }}>{COPY.hookTop}</div>
        <div style={{ background: LIME, color: INK, fontFamily: "Montserrat", fontWeight: 900, fontSize: 92, lineHeight: 1, padding: "8px 22px 12px" }}>{PRICE.off}</div>
      </div>
      <div style={{ marginTop: 34 }}>
        <Price start={-12} big />
      </div>
      <div style={{ marginTop: 34, fontFamily: "Montserrat", fontWeight: 900, fontSize: 70, lineHeight: 1.05, color: PAPER, textShadow: SH, opacity: line, transform: `translateY(${(1 - line) * 18}px)` }}>{COPY.hookLine}</div>
    </div>
  );
};

/** per-print card: number, name, limited-edition chip, price before → after */
const Card: React.FC<{ n: string; name: string; from: number; to: number }> = ({ n, name, from, to }) => {
  const f = useCurrentFrame();
  const a = F(from);
  const b = F(to);
  if (f < a || f >= b) return null;
  const p = interpolate(f, [a, a + 7], [0, 1], { ...clamp, easing: easeOut });
  const out = interpolate(f, [b - 4, b], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 56, top: 900, opacity: out }}>
      <div style={{ clipPath: `inset(0 ${100 * (1 - p)}% 0 0)` }}>
        <div style={{ background: INK, color: LIME, fontFamily: "Montserrat", fontWeight: 900, fontSize: 28, letterSpacing: "0.2em", padding: "8px 16px 8px 18px", width: "fit-content" }}>{COPY.limited}</div>
        <div style={{ display: "inline-block", fontFamily: "Montserrat", fontWeight: 900, fontSize: 58, color: PAPER, background: "rgba(21,21,21,0.82)", padding: "6px 20px 10px", marginTop: 0 }}>
          <span style={{ color: LIME }}>{n}</span> {name}
        </div>
      </div>
      <div style={{ marginTop: 16, background: "rgba(21,21,21,0.82)", padding: "10px 18px", width: "fit-content" }}>
        <Price start={a} />
      </div>
    </div>
  );
};

/** -25% stays in the corner the whole time after the hook */
const Corner: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [F(4.5), F(4.5) + 6], [0, 1], clamp), interpolate(f, [F(17) - 5, F(17)], [1, 0], clamp));
  return <div style={{ position: "absolute", top: 290, right: 50, opacity: o, background: LIME, color: INK, fontFamily: "Montserrat", fontWeight: 900, fontSize: 40, padding: "8px 18px" }}>OUTLET -25%</div>;
};

const Scarcity: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 820, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {COPY.scarcity.map((l, i) => {
        const p = interpolate(f, [i * 7, i * 7 + 9], [0, 1], { ...clamp, easing: easeOut });
        return <div key={l} style={{ clipPath: `inset(0 ${100 * (1 - p)}% 0 0)`, background: i ? LIME : INK, color: i ? INK : PAPER, fontFamily: "Montserrat", fontWeight: 900, fontSize: i ? 46 : 78, padding: "10px 30px 12px" }}>{l}</div>;
      })}
    </div>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 9], [0, 1], { ...clamp, easing: easeOut });
  const pulse = 1 + 0.03 * Math.max(0, Math.sin(((f - 14) / 30) * Math.PI * 2.4)) * (f > 14 ? 1 : 0);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0), backdropFilter: "blur(10px)", background: "rgba(16,16,16,0.6)" }} />
      <div style={{ position: "absolute", top: 320, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ opacity: a(2) }}>
          <Price start={2} big />
        </div>
        <div style={{ marginTop: 40, transform: `scale(${pulse})`, background: LIME, color: INK, fontFamily: "Montserrat", fontWeight: 900, fontSize: 82, lineHeight: 1, padding: "18px 36px 22px", opacity: a(10) }}>{COPY.cta}</div>
        <div style={{ marginTop: 24, fontFamily: "Montserrat", fontWeight: 700, fontSize: 38, color: PAPER, opacity: a(16) }}>{COPY.ctaSub}</div>
        <div style={{ marginTop: 40 }}>
          <StoreBlock delay={22} />
        </div>
        <Img src={staticFile(COPY.logo)} style={{ marginTop: 30, width: 280, opacity: a(32) }} />
      </div>
    </AbsoluteFill>
  );
};

export const Outlet2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
    <Vignette strength={0.3} />
    <Hook />
    <Corner />
    {MODELS.map((m) => <Card key={m.n} {...m} />)}
    <Sequence from={F(14)} durationInFrames={F(3)}>
      <Scarcity />
    </Sequence>
    <Sequence from={F(17)}>
      <Cta />
    </Sequence>
    {MUSIC.src && <Audio src={staticFile(MUSIC.src)} volume={(f) => MUSIC.volume * interpolate(f, [F(TOTAL_S) - 20, F(TOTAL_S)], [1, 0], clamp)} />}
  </AbsoluteFill>
);
