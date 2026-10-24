import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut, F, MusicBed, Timeline, Vignette } from "../campana/shared";
import { BASE, DIPS, LOGO, MUSIC, SHOTS, TITLE, TOTAL_S } from "./config";

// shots are already composited on studio white; no extra grade (garment colours untouched)
const GRADE = "none";
const SOFT = "0 1px 14px rgba(255,255,255,0.55)";

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
    <div style={{ position: "absolute", top: 760, left: 0, right: 0, textAlign: "center", color: TITLE.color, textShadow: SOFT }}>
      <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 150, lineHeight: 0.9, WebkitTextStroke: `0.8px ${TITLE.color}`, opacity: top, filter: `blur(${(1 - top) * 6}px)` }}>{TITLE.top}</div>
      <div style={{ fontFamily: "Cormorant", fontWeight: 500, fontSize: 132, lineHeight: 1, letterSpacing: "0.01em", opacity: bottom, filter: `blur(${(1 - bottom) * 6}px)` }}>{TITLE.bottom}</div>
    </div>
  );
};

const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [F(LOGO.from), F(LOGO.from) + 14], [0, 1], { ...clamp, easing: easeOut });
  return <Img src={staticFile(LOGO.src)} style={{ position: "absolute", top: 1180, left: (1080 - 260) / 2, width: 260, opacity: o, filter: "none" }} />;
};

export const Coleccion: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
    <Vignette strength={0.08} />
    <Dips />
    <Title />
    <Logo />
    <MusicBed music={MUSIC} words={[]} total={F(TOTAL_S)} />
  </AbsoluteFill>
);
