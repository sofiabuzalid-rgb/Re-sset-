import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Captions, clamp, COLORS, easeOut, F, Grain, MusicBed, SHADOW, StoreBlock, Timeline, useWindow, Vignette } from "../shared";
import { BASE, CAPTION_HL, END, HOOK, MUSIC, SHOTS, STORE_CUES, T } from "./config";

const GRADE = "contrast(1.06) saturate(1.0) brightness(1.01) sepia(0.06)"; // warm, filmic; prints stay true

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(HOOK.to) - 10, F(HOOK.to)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 290, left: 50, right: 50, textAlign: "center", opacity: out, background: "radial-gradient(ellipse at 50% 50%, rgba(10,8,6,0.62) 0%, rgba(10,8,6,0.35) 55%, rgba(10,8,6,0) 78%)", padding: "40px 0" }}>
      {HOOK.lines.map((l, k) => {
        // line 1 on frame 0; line 2 slides in half a second later
        const p = k === 0 ? 1 : interpolate(f, [12, 26], [0, 1], { ...clamp, easing: easeOut });
        return (
          <div key={k} style={{ opacity: p, transform: `translateY(${(1 - p) * 12}px)`, fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: k ? 72 : 82, lineHeight: 1.06, color: k ? COLORS.lime : COLORS.ivory, textShadow: "0 2px 18px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.6)" }}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

const Store: React.FC<{ name: string; detail: string; from: number; to: number; i: number }> = ({ name, detail, from, to, i }) => {
  const o = useWindow(from, to, 10, 6);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 300 + i * 132, left: 60, opacity: o, transform: `translateX(${(1 - o) * -30}px)`, background: "rgba(20,16,14,0.5)", borderLeft: `4px solid ${COLORS.lime}`, padding: "10px 26px 12px 22px", borderRadius: "0 14px 14px 0" }}>
      <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 54, color: COLORS.ivory, lineHeight: 1 }}>{name}</div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 500, fontSize: 28, color: COLORS.ivory, opacity: 0.9, marginTop: 4 }}>{detail}</div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 16], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0), background: "linear-gradient(180deg, rgba(14,12,10,0.15) 0%, rgba(14,12,10,0.55) 40%, rgba(14,12,10,0.75) 100%)" }} />
      <div style={{ position: "absolute", top: 620, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 92, lineHeight: 1.0, color: COLORS.ivory, textShadow: SHADOW, opacity: a(4), transform: `translateY(${(1 - a(4)) * 14}px)` }}>{END.title}</div>
        <Img src={staticFile(END.logo)} style={{ marginTop: 40, width: 400, opacity: a(12) }} />
        <div style={{ marginTop: 40 }}>
          <StoreBlock delay={20} serif />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Casa: React.FC = () => {
  const end = SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
      <Vignette strength={0.34} />
      <Grain opacity={0.05} />
      <Hook />
      {STORE_CUES.map((s, i) => (
        <Store key={s.name} {...s} i={i} />
      ))}
      <Captions words={T.words} until={end.from} style={{ top: 1090, size: 52, weight: 600, scrim: "rgba(16,14,12,0.34)", highlight: CAPTION_HL, hl: COLORS.lime }} />
      <Sequence from={F(end.from)}>
        <EndCard />
      </Sequence>
      <Audio src={staticFile("campana/casa/voice.wav")} />
      <Audio src={staticFile("campana/casa/ambient.wav")} volume={1.6} />
      <MusicBed music={MUSIC} words={T.words} total={T.total} />
    </AbsoluteFill>
  );
};
