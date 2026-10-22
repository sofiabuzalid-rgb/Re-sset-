import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Captions, clamp, COLORS, easeOut, F, MusicBed, SHADOW, StoreBlock, Timeline, useWindow } from "../shared";
import { BASE, CAPTION_HL, END, HOOK, MUSIC, SHOTS, STEPS, T } from "./config";

const GRADE = "brightness(1.03) contrast(1.05) saturate(1.03)"; // crisp; navy stays navy
const NAVY = "#1F2A44";

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(HOOK.to) - 6, F(HOOK.to)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 640, left: 50, right: 50, textAlign: "center", opacity: out }}>
      {HOOK.lines.map((l, k) => {
        const p = k === 0 ? 1 : interpolate(f, [4, 12], [0, 1], { ...clamp, easing: easeOut });
        return (
          <div key={k} style={{ display: "table", margin: k ? "10px auto 0" : "0 auto", opacity: p, transform: `translateY(${(1 - p) * 10}px)`, fontFamily: "Montserrat", fontWeight: 800, fontSize: 56, lineHeight: 1.1, letterSpacing: "-0.015em", color: k ? COLORS.ink : COLORS.ivory, background: k ? COLORS.lime : NAVY, padding: "10px 24px 14px", borderRadius: 14 }}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

const Step: React.FC<{ n: string; text: string; from: number; to: number }> = ({ n, text, from, to }) => {
  const o = useWindow(from, to, 5, 4);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 300, left: 60, opacity: o, transform: `translateX(${(1 - o) * -30}px)`, display: "flex", alignItems: "center", gap: 18, background: "rgba(255,251,242,0.95)", padding: "10px 28px 10px 10px", borderRadius: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
      <div style={{ width: 62, height: 62, borderRadius: 999, background: NAVY, color: COLORS.lime, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Montserrat", fontWeight: 900, fontSize: 36 }}>{n}</div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 40, color: COLORS.ink }}>{text}</div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 10], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0), backdropFilter: "blur(10px)", background: "rgba(18,24,40,0.62)" }} />
      <div style={{ position: "absolute", top: 520, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Img src={staticFile(END.logo)} style={{ width: 440, opacity: a(2) }} />
        <div style={{ marginTop: 40, fontFamily: "Montserrat", fontWeight: 600, fontSize: 54, color: COLORS.ivory, textShadow: SHADOW, opacity: a(6), transform: `translateY(${(1 - a(6)) * 10}px)` }}>{END.title}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 72, lineHeight: 1.05, color: COLORS.lime, opacity: a(10), transform: `translateY(${(1 - a(10)) * 10}px)` }}>{END.title2}</div>
        <div style={{ marginTop: 44 }}>
          <StoreBlock delay={14} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Viaje: React.FC = () => {
  const end = SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
      <Hook />
      {STEPS.map((s) => (
        <Step key={s.n} {...s} />
      ))}
      <Captions words={T.words} until={end.from} style={{ top: 1080, size: 54, weight: 700, scrim: "rgba(14,18,30,0.5)", highlight: CAPTION_HL, hl: COLORS.lime }} />
      <Sequence from={F(end.from)}>
        <EndCard />
      </Sequence>
      <Audio src={staticFile("campana/viaje/voice.wav")} />
      <MusicBed music={MUSIC} words={T.words} total={T.total} />
    </AbsoluteFill>
  );
};
