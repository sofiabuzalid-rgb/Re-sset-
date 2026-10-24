import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut, F, MusicBed, Timeline, Vignette } from "../campana/shared";
import { BASE, DIPS, LOGO, MUSIC, SHOTS, TITLE, TOTAL_S } from "./config";

// clean studio grade: a touch brighter and softer, neutral; garment colours untouched (no hue/saturation shift)
const GRADE = "brightness(1.04) contrast(1.02)";
const SOFT = "0 2px 24px rgba(30,24,20,0.35)";

const Dips: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.max(0, ...DIPS.map(([a, b]) => interpolate(f, [F(a), F((a + b) / 2), F(b)], [0, 0.92, 0], clamp)));
  return <AbsoluteFill style={{ backgroundColor: "#0d0b0a", opacity: o }} />;
};

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const vis = (delay: number) =>
    Math.max(
      ...TITLE.on.map(([a, b]) => {
        const s = F(a) + (a === 0 ? -99 : delay); // first appearance: already there on frame 0
        return Math.min(interpolate(f, [s, s + 12], [0, 1], { ...clamp, easing: easeOut }), interpolate(f, [F(b) - 8, F(b)], [1, 0], clamp));
      }),
    );
  const top = vis(0);
  const bottom = vis(8);
  return (
    <div style={{ position: "absolute", top: 760, left: 0, right: 0, textAlign: "center", color: "#FFFFFF", textShadow: SOFT }}>
      <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 150, lineHeight: 0.9, WebkitTextStroke: "1.2px #fff", opacity: top, filter: `blur(${(1 - top) * 6}px)` }}>{TITLE.top}</div>
      <div style={{ fontFamily: "Cormorant", fontWeight: 500, fontSize: 132, lineHeight: 1, letterSpacing: "0.01em", opacity: bottom, filter: `blur(${(1 - bottom) * 6}px)` }}>{TITLE.bottom}</div>
    </div>
  );
};

const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [F(LOGO.from), F(LOGO.from) + 14], [0, 1], { ...clamp, easing: easeOut });
  return <Img src={staticFile(LOGO.src)} style={{ position: "absolute", top: 1180, left: (1080 - 280) / 2, width: 280, opacity: o, filter: "drop-shadow(0 2px 12px rgba(30,24,20,0.6))" }} />;
};

export const Coleccion: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
    <Vignette strength={0.2} />
    <Dips />
    <Title />
    <Logo />
    <MusicBed music={MUSIC} words={[]} total={F(TOTAL_S)} />
  </AbsoluteFill>
);
