import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut, F, StoreBlock, Timeline, Vignette } from "../campana/shared";
import { BASE, COPY, MODELS, MUSIC, SHOTS, TOTAL_S } from "./config";

const GRADE = "contrast(1.06) saturate(1.04) brightness(1.02)";
const INK = "#151515";
const LIME = "#E2EC95"; // brand
const PAPER = "#FFFBF2";
const SH = "0 2px 16px rgba(0,0,0,0.35)";

/** the hard-edged OUTLET 25% OFF block: ink box, lime number */
const Badge: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: INK, padding: `${18 * scale}px ${36 * scale}px ${22 * scale}px`, transform: `scale(${scale})`, transformOrigin: "top left" }}>
    <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 34, letterSpacing: "0.42em", color: PAPER, marginRight: "-0.42em" }}>{COPY.badge[0]}</div>
    <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 132, lineHeight: 0.95, letterSpacing: "-0.03em", color: LIME }}>{COPY.badge[1]}</div>
  </div>
);

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(3.0) - 6, F(3.0)], [1, 0], clamp);
  const line = interpolate(f, [8, 18], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: out }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 40, letterSpacing: "0.4em", color: PAPER, background: INK, padding: "10px 24px 10px 34px" }}>{COPY.hookTop}</div>
      <div style={{ marginTop: 18 }}>
        <Badge />
      </div>
      <div style={{ marginTop: 26, fontFamily: "Montserrat", fontWeight: 800, fontSize: 62, color: PAPER, textShadow: SH, opacity: line, transform: `translateY(${(1 - line) * 16}px)` }}>{COPY.hookLine}</div>
    </div>
  );
};

/** persistent corner tag after the hook */
const Corner: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [F(3.0), F(3.0) + 8], [0, 1], clamp), interpolate(f, [F(22.5) - 6, F(22.5)], [1, 0], clamp));
  return (
    <div style={{ position: "absolute", top: 290, right: 50, opacity: o, background: LIME, color: INK, fontFamily: "Montserrat", fontWeight: 900, fontSize: 34, letterSpacing: "0.04em", padding: "10px 20px" }}>
      25% OFF
    </div>
  );
};

/** model card: index + description, bottom-left inside the safe zone */
const ModelCard: React.FC<{ n: string; name: string; from: number; to: number }> = ({ n, name, from, to }) => {
  const f = useCurrentFrame();
  const a = F(from);
  const b = F(to);
  if (f < a || f >= b) return null;
  const p = interpolate(f, [a, a + 8], [0, 1], { ...clamp, easing: easeOut });
  const out = interpolate(f, [b - 5, b], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 50, top: 1040, opacity: out, clipPath: `inset(0 ${100 * (1 - p)}% 0 0)` }}>
      <div style={{ display: "inline-block", background: INK, color: LIME, fontFamily: "Montserrat", fontWeight: 900, fontSize: 30, padding: "8px 16px" }}>{n}</div>
      <div style={{ background: PAPER, color: INK, fontFamily: "Montserrat", fontWeight: 800, fontSize: 52, padding: "12px 26px 14px", marginTop: 0 }}>{name}</div>
      <div style={{ display: "inline-flex", alignItems: "baseline", gap: 14, background: LIME, color: INK, padding: "10px 22px", fontFamily: "Montserrat", fontWeight: 900, fontSize: 44 }}>
        25% OFF<span style={{ fontWeight: 700, fontSize: 26, letterSpacing: "0.2em" }}>FINAL SALE</span>
      </div>
    </div>
  );
};

const Urgency: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top: 800, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {COPY.urgency.map((l, i) => {
        const p = interpolate(f, [i * 6, i * 6 + 9], [0, 1], { ...clamp, easing: easeOut });
        return (
          <div key={l} style={{ clipPath: `inset(0 ${100 * (1 - p)}% 0 0)`, background: i ? LIME : INK, color: i ? INK : PAPER, fontFamily: "Montserrat", fontWeight: 900, fontSize: i ? 76 : 96, letterSpacing: "-0.01em", padding: "8px 34px 12px" }}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 10], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0), backdropFilter: "blur(10px)", background: "rgba(16,16,16,0.58)" }} />
      <div style={{ position: "absolute", top: 330, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ opacity: a(2) }}>
          <Badge scale={0.8} />
        </div>
        {COPY.cta.map((l, i) => (
          <div key={l} style={{ marginTop: i ? 0 : 40, fontFamily: "Montserrat", fontWeight: 800, fontSize: 58, lineHeight: 1.12, color: PAPER, opacity: a(8 + i * 3), transform: `translateY(${(1 - a(8 + i * 3)) * 12}px)` }}>{l}</div>
        ))}
        <div style={{ marginTop: 18, fontFamily: "Montserrat", fontWeight: 600, fontSize: 36, letterSpacing: "0.06em", color: LIME, opacity: a(16) }}>{COPY.ctaSub}</div>
        <div style={{ marginTop: 40 }}>
          <StoreBlock delay={22} />
        </div>
        <Img src={staticFile(COPY.logo)} style={{ marginTop: 34, width: 300, opacity: a(34) }} />
      </div>
    </AbsoluteFill>
  );
};

export const Outlet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
    <Vignette strength={0.22} />
    <Hook />
    <Corner />
    {MODELS.map((m) => <ModelCard key={m.n} {...m} />)}
    <Sequence from={F(18.5)} durationInFrames={F(4.0)}>
      <Urgency />
    </Sequence>
    <Sequence from={F(22.5)}>
      <Cta />
    </Sequence>
    {MUSIC.src && <Audio src={staticFile(MUSIC.src)} volume={(f) => MUSIC.volume * interpolate(f, [F(TOTAL_S) - 20, F(TOTAL_S)], [1, 0], clamp)} />}
  </AbsoluteFill>
);
