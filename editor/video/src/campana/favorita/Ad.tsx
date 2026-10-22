import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Captions, clamp, COLORS, easeOut, F, MusicBed, SHADOW, StoreBlock, Timeline, useWindow } from "../shared";
import { BASE, CAPTION_HL, DETAILS, END, HOOK, MUSIC, SHOTS, STORE_CUES, T } from "./config";

const GRADE = "brightness(1.04) contrast(1.04) saturate(1.02)"; // light, clean; the olive stays the olive it is
const OLIVE = "#3E4430";

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(HOOK.to) - 8, F(HOOK.to)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 780, left: 60, right: 60, textAlign: "center", opacity: out }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 30, letterSpacing: "0.32em", textTransform: "uppercase", color: COLORS.ivory, textShadow: SHADOW, marginBottom: 14 }}>{HOOK.eyebrow}</div>
      {HOOK.lines.map((l, k) => {
        const p = k === 0 ? 1 : interpolate(f, [5, 14], [0, 1], { ...clamp, easing: easeOut });
        return (
          <div key={k} style={{ display: "table", margin: k ? "12px auto 0" : "0 auto", opacity: p, transform: `translateY(${(1 - p) * 12}px)`, fontFamily: "Montserrat", fontWeight: 800, fontSize: 60, lineHeight: 1.1, letterSpacing: "-0.015em", color: k ? COLORS.ivory : COLORS.ink, background: k ? OLIVE : COLORS.ivory, padding: "10px 26px 14px", borderRadius: 14 }}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

/* editorial detail label: lime rule + small caps on a soft pill, top-left, away from the waist */
const Detail: React.FC<{ text: string; from: number; to: number }> = ({ text, from, to }) => {
  const o = useWindow(from, to, 7, 5);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 320, left: 64, opacity: o, transform: `translateX(${(1 - o) * -24}px)`, display: "flex", alignItems: "center", gap: 16, background: "rgba(20,22,16,0.55)", padding: "12px 26px 12px 20px", borderRadius: 999 }}>
      <div style={{ width: 40 * o, height: 3, background: COLORS.lime }} />
      <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 38, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.ivory }}>{text}</div>
    </div>
  );
};

const Store: React.FC<{ name: string; detail: string; from: number; to: number; i: number }> = ({ name, detail, from, to, i }) => {
  const o = useWindow(from, to, 8, 6);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 300 + i * 124, left: 60, opacity: o, transform: `translateX(${(1 - o) * -30}px)`, background: "rgba(20,22,16,0.6)", borderLeft: `4px solid ${COLORS.lime}`, padding: "10px 26px 12px 22px", borderRadius: "0 14px 14px 0" }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 40, color: COLORS.ivory }}>{name}</div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 500, fontSize: 28, color: COLORS.ivory, opacity: 0.9 }}>{detail}</div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 12], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0), backdropFilter: "blur(10px)", background: "rgba(20,22,16,0.58)" }} />
      <div style={{ position: "absolute", top: 520, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Img src={staticFile(END.logo)} style={{ width: 460, opacity: a(2) }} />
        <div style={{ marginTop: 40, fontFamily: "Montserrat", fontWeight: 500, fontSize: 52, color: COLORS.ivory, opacity: a(8), transform: `translateY(${(1 - a(8)) * 12}px)` }}>{END.title}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 70, lineHeight: 1.05, color: COLORS.lime, opacity: a(12), transform: `translateY(${(1 - a(12)) * 12}px)` }}>{END.title2}</div>
        <div style={{ marginTop: 44 }}>
          <StoreBlock delay={18} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Favorita: React.FC = () => {
  const end = SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Timeline shots={SHOTS} grade={GRADE} base={BASE} />
      <Hook />
      {DETAILS.map((d) => (
        <Detail key={d.text} {...d} />
      ))}
      {STORE_CUES.map((s, i) => (
        <Store key={s.name} {...s} i={i} />
      ))}
      {/* subtitles sit below the waist tie, still above the Reels UI */}
      <Captions words={T.words} until={end.from} style={{ top: 1230, size: 52, weight: 600, scrim: "rgba(16,16,16,0.46)", highlight: CAPTION_HL, hl: COLORS.lime }} />
      <Sequence from={F(end.from)}>
        <EndCard />
      </Sequence>
      <Audio src={staticFile("campana/favorita/voice.wav")} />
      <MusicBed music={MUSIC} words={T.words} total={T.total} />
    </AbsoluteFill>
  );
};
