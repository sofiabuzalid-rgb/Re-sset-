import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Captions, clamp, COLORS, easeOut, F, MusicBed, PriceTag, SHADOW, StoreBlock, Timeline, useWindow, Vignette } from "../shared";
import { BASE, CAPTION_HL, END, HOOK, MUSIC, SHOTS, T, TAGS } from "./config";

const GRADE = "contrast(1.05) saturate(1.06) brightness(1.02) sepia(0.04)"; // warm, festive, skin natural

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(HOOK.to) - 8, F(HOOK.to)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 500, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", opacity: out }}>
      {HOOK.lines.map((l, k) => (
        <div key={k} style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: k ? 74 : 66, lineHeight: 1.08, letterSpacing: "-0.02em", color: k ? COLORS.lime : COLORS.ivory, textShadow: SHADOW }}>
          {l}
        </div>
      ))}
      <div style={{ marginTop: 24, display: "flex", gap: 22 }}>
        <PriceTag size="ninos" scale={0.85} delay={-9} />
        <PriceTag size="adulto" scale={0.85} delay={-9} />
      </div>
    </div>
  );
};

const Tag: React.FC<{ text: string; from: number; to: number }> = ({ text, from, to }) => {
  const o = useWindow(from, to);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: o, transform: `translateY(${(1 - o) * 10}px)`, fontFamily: "Montserrat", fontWeight: 700, fontSize: 36, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.ink, background: "rgba(255,251,242,0.94)", padding: "12px 28px", borderRadius: 999 }}>{text}</div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 12], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0), backdropFilter: "blur(12px)", background: "rgba(24,14,14,0.6)" }} />
      <div style={{ position: "absolute", top: 380, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Img src={staticFile(END.logo)} style={{ width: 460, opacity: a(2), transform: `translateY(${(1 - a(2)) * 14}px)` }} />
        <div style={{ marginTop: 34, fontFamily: "Montserrat", fontWeight: 800, fontSize: 60, lineHeight: 1.1, color: COLORS.ivory, textShadow: SHADOW, opacity: a(8), transform: `translateY(${(1 - a(8)) * 12}px)` }}>{END.title}</div>
        <div style={{ marginTop: 30, display: "flex", gap: 22 }}>
          <PriceTag size="ninos" scale={0.8} delay={14} />
          <PriceTag size="adulto" scale={0.8} delay={17} />
        </div>
        <div style={{ marginTop: 34 }}>
          <StoreBlock delay={22} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Familia: React.FC = () => {
  const end = SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
      <Vignette strength={0.22} />
      <Hook />
      {TAGS.map((t) => (
        <Tag key={t.text} {...t} />
      ))}
      <Captions words={T.words} until={end.from} style={{ top: 1070, size: 56, weight: 700, scrim: "rgba(16,16,16,0.4)", highlight: CAPTION_HL, hl: COLORS.lime }} />
      <Sequence from={F(end.from)}>
        <EndCard />
      </Sequence>
      <Audio src={staticFile("campana/familia/voice.wav")} />
      <MusicBed music={MUSIC} words={T.words} total={T.total} />
    </AbsoluteFill>
  );
};
