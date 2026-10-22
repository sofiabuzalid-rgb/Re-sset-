import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { COLORS, DETAILS, END, FPS, HOOK, Shot, SHOTS, VOICE, WORDS } from "./config";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const F = (s: number) => Math.round(s * FPS);
const SHADOW = "0 2px 14px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.5)";
// Meta Reels/Stories safe zone: text between y≈270 (top 14 %) and y≈1250 (bottom 35 %)

/* light, clean grade; the olive stays the olive it is (no hue shift, saturation barely touched) */
const GRADE = "brightness(1.04) contrast(1.04) saturate(1.02)";

const ShotView: React.FC<{ s: Shot; frames: number }> = ({ s, frames }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, frames], s.zoom, { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo muted src={staticFile(`olivo04/${s.src}.mp4`)} startFrom={F(s.at)} playbackRate={s.rate ?? 1} style={{ width: "100%", height: "100%", objectFit: "cover", filter: GRADE, transform: `scale(${z})`, transformOrigin: `${s.origin[0]}% ${s.origin[1]}%` }} />
    </AbsoluteFill>
  );
};

const useWindow = (from: number, to: number, inF = 7, outF = 5) => {
  const f = useCurrentFrame();
  return Math.min(interpolate(f, [F(from), F(from) + inF], [0, 1], { ...clamp, easing: easeOut }), interpolate(f, [F(to) - outF, F(to)], [1, 0], clamp));
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(HOOK.to) - 8, F(HOOK.to)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 820, left: 60, right: 60, textAlign: "center", opacity: out }}>
      {HOOK.text.map((l, k) => {
        // line 1 is on screen at frame 0 (thumbnail); line 2 follows a beat later. Sits on the chest: her face stays clear, the waist too
        const p = k === 0 ? 1 : interpolate(f, [5, 14], [0, 1], { ...clamp, easing: easeOut });
        return (
          <div key={k} style={{ display: "table", margin: k ? "12px auto 0" : "0 auto", opacity: p, transform: `translateY(${(1 - p) * 12}px)`, fontFamily: "Montserrat", fontWeight: 800, fontSize: 58, lineHeight: 1.1, letterSpacing: "-0.015em", color: k ? COLORS.ivory : COLORS.ink, background: k ? COLORS.olive : COLORS.ivory, padding: "10px 26px 14px", borderRadius: 14 }}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

/* a detail label: thin rule + small caps, top-left, away from the waist */
const Detail: React.FC<{ text: string; from: number; to: number }> = ({ text, from, to }) => {
  const o = useWindow(from, to);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 320, left: 64, display: "flex", alignItems: "center", gap: 18, opacity: o, transform: `translateX(${(1 - o) * -24}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(20,22,16,0.55)", padding: "12px 26px 12px 20px", borderRadius: 999 }}>
        <div style={{ width: 40 * o, height: 3, background: COLORS.lime }} />
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 38, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.ivory }}>{text}</div>
      </div>
    </div>
  );
};

/* Subtitles: her exact words, short blocks, max two lines, ivory on a soft scrim */
type W = (typeof WORDS)[number];
const blocks: W[][] = [];
WORDS.forEach((w, i) => {
  const b = blocks[blocks.length - 1];
  const prev = b?.[b.length - 1];
  const len = b ? b.map((x) => x.w).join(" ").length + 1 + w.w.length : 0;
  const nx = WORDS[i + 1];
  const endsPhrase = w.br || nx?.piece !== w.piece || nx?.w === "y";
  const full = len > 24 && !(endsPhrase && len <= 32);
  const cur = b ? b.map((x) => x.w).join(" ").length : 0;
  // a new clause ("y …") starts a new block once the current one has some length
  if (!b || full || prev!.br || w.piece !== prev!.piece || (w.w === "y" && cur > 20)) blocks.push([w]);
  else b.push(w);
});
const HL = new Set(["RE:SET", "verde", "militar."]);

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = blocks.findIndex((b, k) => t >= b[0].s - 0.06 && t < Math.min(blocks[k + 1]?.[0].s ?? 1e9, b[b.length - 1].e + 0.4));
  if (i < 0) return null;
  const b = blocks[i];
  const o = interpolate(t, [b[0].s - 0.06, b[0].s + 0.06], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: 1230, left: 90, right: 90, height: 170, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ opacity: o, textAlign: "center", fontFamily: "Montserrat", fontWeight: 600, fontSize: 52, lineHeight: 1.18, color: COLORS.ivory, textShadow: SHADOW, background: "rgba(16,16,16,0.46)", padding: "10px 24px 14px", borderRadius: 16 }}>
        {b.map((w, k) => (
          <span key={k} style={{ color: HL.has(w.w) ? COLORS.lime : COLORS.ivory }}>
            {k ? " " : ""}
            {w.w}
          </span>
        ))}
      </div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number, d = 12) => interpolate(f, [s, s + d], [0, 1], { ...clamp, easing: easeOut });
  const rise = (s: number) => ({ opacity: a(s), transform: `translateY(${(1 - a(s)) * 14}px)` });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0, 14), backdropFilter: "blur(10px)", background: "rgba(20,22,16,0.55)" }} />
      <div style={{ position: "absolute", top: 560, left: 60, right: 60, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Img src={staticFile(END.logo)} style={{ width: 520, ...rise(2) }} />
        <div style={{ marginTop: 44, fontFamily: "Montserrat", fontWeight: 700, fontSize: 58, color: COLORS.ivory, textShadow: SHADOW, ...rise(10) }}>{END.tagline}</div>
        <div style={{ marginTop: 34, fontFamily: "Montserrat", fontWeight: 500, fontSize: 42, lineHeight: 1.3, color: COLORS.ivory, ...rise(18) }}>
          {END.where.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 40, background: COLORS.lime, color: COLORS.ink, fontFamily: "Montserrat", fontWeight: 800, fontSize: 46, letterSpacing: "0.01em", padding: "20px 50px", borderRadius: 999, ...rise(26) }}>{END.url}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Olivo: React.FC = () => {
  const end = SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SHOTS.map((s) => {
        const from = F(s.from);
        const frames = F(s.to) - from;
        return (
          <Sequence key={s.name} name={s.name} from={from} durationInFrames={frames}>
            <ShotView s={s} frames={frames} />
          </Sequence>
        );
      })}
      <Hook />
      {DETAILS.map((d) => (
        <Detail key={d.text} {...d} />
      ))}
      <Sequence from={0} durationInFrames={F(end.from)}>
        <Captions />
      </Sequence>
      <Sequence from={F(end.from)}>
        <EndCard />
      </Sequence>
      <Audio src={staticFile(VOICE)} />
    </AbsoluteFill>
  );
};
