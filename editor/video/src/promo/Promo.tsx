import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut, F, StoreBlock, Timeline, Vignette } from "../campana/shared";
import { B, BASE, COPY, CUT, HITS, MUSIC, SHOTS, t, TOTAL_S } from "./config";

const GRADE = "contrast(1.06) saturate(1.08)";
const INK = "#151515";
const LIME = "#E2EC95"; // brand
const PAPER = "#FFFBF2";
const FONT = "Montserrat";
const BEAT = B * 30; // frames per beat
const over = Easing.bezier(0.34, 1.7, 0.5, 1); // slam with a little overshoot

/** frames since the last beat (0 … BEAT) */
const sinceBeat = (f: number) => f % BEAT;

/** OUTLET / 25% OFF block — the same mark as the outlet ads */
const Badge: React.FC<{ scale?: number; flip?: boolean }> = ({ scale = 1, flip }) => (
  <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: flip ? LIME : INK, padding: "18px 40px 22px", transform: `scale(${scale})`, boxShadow: "0 18px 50px rgba(0,0,0,0.35)" }}>
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, letterSpacing: "0.42em", marginRight: "-0.42em", color: flip ? INK : PAPER }}>{COPY.outlet}</div>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 168, lineHeight: 0.95, letterSpacing: "-0.03em", color: flip ? INK : LIME }}>{COPY.off}</div>
  </div>
);

/** the whole picture breathes with the music: a short punch-in on every beat, a harder one + shake on the section hits */
const Groove: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const s = sinceBeat(f);
  const beatPunch = 1 + 0.025 * Math.exp(-s / 3);
  const hit = HITS.map((h) => f - F(t(h))).find((d) => d >= 0 && d < 8);
  const hitPunch = hit === undefined ? 1 : 1 + 0.06 * Math.exp(-hit / 2.5);
  const shake = hit === undefined ? 0 : Math.sin(hit * 2.6) * 14 * Math.exp(-hit / 2.5);
  return <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.4}px) scale(${beatPunch * hitPunch})` }}>{children}</AbsoluteFill>;
};

/** white flash on the section hits */
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.max(0, ...HITS.filter((h) => h > 0).map((h) => { const d = f - F(t(h)); return d < 0 ? 0 : interpolate(d, [0, 5], [0.55, 0], clamp); })); // only after the hit
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

/** 0–4.2 s: 25% OFF slams in on frame 0 (thumbnail already readable), question on beat 2, "Aprovéchalo ya" on beat 5 */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(CUT.hookEnd) - 5, F(CUT.hookEnd)], [1, 0], clamp);
  const slam = interpolate(f, [0, 8], [1.35, 1], { ...clamp, easing: over });
  const bump = f > 8 ? 1 + 0.04 * Math.exp(-sinceBeat(f) / 3) : 1; // pulses with the beat after landing
  const q = interpolate(f, [F(t(2)), F(t(2)) + 8], [0, 1], { ...clamp, easing: easeOut });
  const p = interpolate(f, [F(t(5)), F(t(5)) + 7], [0, 1], { ...clamp, easing: over });
  return (
    <div style={{ position: "absolute", top: 290, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", opacity: out }}>
      <div style={{ transform: `scale(${slam * bump}) rotate(${(1 - Math.min(1, f / 8)) * -4}deg)` }}>
        <Badge />
      </div>
      <div style={{ marginTop: 28, background: PAPER, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 52, lineHeight: 1.1, textAlign: "center", padding: "14px 28px 18px", opacity: q, transform: `translateY(${(1 - q) * 18}px)` }}>{COPY.hook}</div>
      <div style={{ marginTop: 18, background: LIME, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 70, padding: "8px 30px 12px", opacity: Math.min(1, p * 1.5), transform: `scale(${0.6 + 0.4 * p}) rotate(-2deg)` }}>{COPY.hookPunch}</div>
    </div>
  );
};

/** what's on screen + the discount; the 25% block flips colour on every beat */
const Chip: React.FC<{ text: string; sub: string; from: number; to: number }> = ({ text, sub, from, to }) => {
  const f = useCurrentFrame();
  const a = F(from), b = F(to);
  if (f < a || f >= b) return null;
  const p = interpolate(f, [a, a + 6], [0, 1], { ...clamp, easing: easeOut });
  const out = interpolate(f, [b - 4, b], [1, 0], clamp);
  const flip = Math.floor((f - a) / BEAT) % 2 === 1;
  const pop = 1 + 0.08 * Math.exp(-sinceBeat(f) / 2.5);
  return (
    <div style={{ position: "absolute", left: 56, top: 1000, opacity: out, clipPath: `inset(0 ${100 * (1 - p)}% 0 -40px)` }}>
      <div style={{ background: INK, color: PAPER, fontFamily: FONT, fontWeight: 800, fontSize: 44, padding: "10px 24px 12px", width: "fit-content" }}>{text}</div>
      <div style={{ background: flip ? PAPER : LIME, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 76, padding: "4px 24px 10px", width: "fit-content", transform: `scale(${pop})`, transformOrigin: "left center" }}>{sub}</div>
    </div>
  );
};

/** 25% OFF stays in the corner from the hook to the CTA, ticking on every beat */
const Seal: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [F(CUT.hookEnd), F(CUT.hookEnd) + 6], [0, 1], clamp), interpolate(f, [F(CUT.cta) - 4, F(CUT.cta)], [1, 0], clamp));
  const pop = 1 + 0.07 * Math.exp(-sinceBeat(f) / 2.5);
  return <div style={{ position: "absolute", top: 292, right: 48, opacity: o, background: LIME, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 46, padding: "8px 18px", transform: `scale(${pop}) rotate(3deg)`, transformOrigin: "right top" }}>{COPY.stamp}</div>;
};

/** "SE ESTÁN YENDO RÁPIDO" → giant 25% OFF that flips lime/white on each beat → "HASTA AGOTAR EXISTENCIAS" */
const Reinforce: React.FC = () => {
  const f = useCurrentFrame();
  const flip = Math.floor(f / BEAT) % 2 === 1;
  return (
    <div style={{ position: "absolute", top: 680, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {COPY.reinforce.map((l, i) => {
        const start = i * Math.round(BEAT);
        const p = interpolate(f, [start, start + 7], [0, 1], { ...clamp, easing: i === 1 ? over : easeOut });
        const big: React.CSSProperties = { background: flip ? PAPER : LIME, color: INK, fontSize: 170, lineHeight: 1, letterSpacing: "-0.03em", padding: "6px 34px 14px", transform: `scale(${(0.5 + 0.5 * p) * (1 + 0.05 * Math.exp(-sinceBeat(f) / 2.5))})`, opacity: Math.min(1, p * 2) };
        const small: React.CSSProperties = { background: INK, color: PAPER, fontSize: i ? 40 : 60, letterSpacing: "0.04em", padding: "10px 28px 12px", clipPath: `inset(0 ${100 * (1 - p)}% 0 0)` };
        return <div key={l} style={{ fontFamily: FONT, fontWeight: 900, ...(i === 1 ? big : small) }}>{l}</div>;
      })}
    </div>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 8], [0, 1], { ...clamp, easing: easeOut });
  const slam = interpolate(f, [2, 10], [1.3, 0.85], { ...clamp, easing: over });
  const pulse = 1 + 0.06 * Math.exp(-sinceBeat(f) / 3);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0), backdropFilter: "blur(10px)", background: "rgba(16,16,16,0.6)" }} />
      <div style={{ position: "absolute", top: 320, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ opacity: a(2), transform: `scale(${f > 10 ? pulse : 1})` }}>
          <Badge scale={slam} />
        </div>
        <div style={{ marginTop: 26, transform: `scale(${(0.7 + 0.3 * a(8)) * (f > 16 ? pulse : 1)}) rotate(-1.5deg)`, background: LIME, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 80, lineHeight: 1, padding: "18px 34px 22px", opacity: a(8) }}>{COPY.cta1}</div>
        <div style={{ marginTop: 24, fontFamily: FONT, fontWeight: 700, fontSize: 38, color: PAPER, opacity: a(14) }}>{COPY.cta2}</div>
        <div style={{ marginTop: 34 }}>
          <StoreBlock delay={18} />
        </div>
        <Img src={staticFile(COPY.logo)} style={{ marginTop: 26, width: 280, opacity: a(26) }} />
      </div>
    </AbsoluteFill>
  );
};

export const Promo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
    <Groove>
      <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
    </Groove>
    <Vignette strength={0.3} />
    <Flash />
    <Hook />
    <Seal />
    {COPY.chips.map((c) => <Chip key={c.text} {...c} />)}
    <Sequence from={F(CUT.reinforce)} durationInFrames={F(CUT.cta) - F(CUT.reinforce)}>
      <Reinforce />
    </Sequence>
    <Sequence from={F(CUT.cta)}>
      <Cta />
    </Sequence>
    {MUSIC.src && <Audio src={staticFile(MUSIC.src)} startFrom={F(MUSIC.startAt)} volume={(f) => MUSIC.volume * interpolate(f, [F(TOTAL_S) - 24, F(TOTAL_S)], [1, 0], clamp)} />}
  </AbsoluteFill>
);
