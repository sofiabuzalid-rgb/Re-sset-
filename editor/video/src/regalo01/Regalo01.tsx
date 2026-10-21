import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { COLORS, END, FPS, SHOTS, VOICE, WORDS } from "./config";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

type Shot = (typeof SHOTS)[number];

const ShotView: React.FC<{ s: Shot; frames: number }> = ({ s, frames }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, frames], s.zoom, { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo muted src={staticFile(`regalo01/${s.src}.mp4`)} startFrom={Math.round(s.at * FPS)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${s.origin[0]}% ${s.origin[1]}%` }} />
    </AbsoluteFill>
  );
};

/* Subtitles = her exact words. 1-4 words per block, break on punctuation / 20 chars / voice piece; current word in brand lime. */
type W = (typeof WORDS)[number];
const blocks: W[][] = [];
for (const w of WORDS) {
  const b = blocks[blocks.length - 1];
  const prev = b?.[b.length - 1];
  const len = b ? b.map((x) => x.w).join(" ").length + 1 + w.w.length : 0;
  if (!b || b.length >= 4 || len > 20 || prev!.br || w.piece !== prev!.piece) blocks.push([w]);
  else b.push(w);
}

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = blocks.findIndex((b, k) => t >= b[0].s - 0.05 && t < Math.min(blocks[k + 1]?.[0].s ?? 1e9, b[b.length - 1].e + 0.45));
  if (i < 0) return null;
  const b = blocks[i];
  const p = interpolate(t, [b[0].s - 0.05, b[0].s + 0.08], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ position: "absolute", top: 1235, left: 60, right: 60, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: p, transform: `translateY(${(1 - p) * 10}px) scale(${0.96 + 0.04 * p})`, background: COLORS.pill, borderRadius: 18, padding: "12px 26px 14px", textAlign: "center", fontFamily: "Montserrat", fontWeight: 800, fontSize: 60, lineHeight: 1.12, letterSpacing: "-0.01em", color: "#fff" }}>
        {b.map((w, k) => {
          const on = t >= w.s - 0.02 && t < (b[k + 1]?.s ?? w.e + 0.45);
          return (
            <span key={k} style={{ color: on ? COLORS.lime : "#fff" }}>
              {k ? " " : ""}
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const SignOff: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: easeOut });
  const c = interpolate(f, [6, 18], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: p, background: "linear-gradient(180deg, rgba(10,10,10,0) 35%, rgba(10,10,10,0.55) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={staticFile(END.logo)} style={{ width: 380, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }} />
        <div style={{ marginTop: 30, opacity: c, transform: `translateY(${(1 - c) * 12}px)`, background: COLORS.lime, color: COLORS.ink, fontFamily: "Montserrat", fontWeight: 800, fontSize: 36, letterSpacing: "0.02em", padding: "16px 34px", borderRadius: 999 }}>{END.cta}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Regalo01: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SHOTS.map((s) => {
      const from = Math.round(s.from * FPS);
      const frames = Math.round(s.to * FPS) - from;
      return (
        <Sequence key={s.name} name={s.name} from={from} durationInFrames={frames}>
          <ShotView s={s} frames={frames} />
        </Sequence>
      );
    })}
    <Captions />
    <Sequence from={Math.round(SHOTS[SHOTS.length - 1].from * FPS)}>
      <SignOff />
    </Sequence>
    <Audio src={staticFile(VOICE)} />
  </AbsoluteFill>
);
