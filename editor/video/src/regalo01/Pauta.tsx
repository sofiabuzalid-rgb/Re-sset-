import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { COLORS } from "./config";
import { CHECKS, CHECKS_END, END, FPS, HOOK, Shot, SHOTS, VOICE, WORDS } from "./pauta.config";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const back = Easing.bezier(0.34, 1.56, 0.64, 1);
const F = (s: number) => Math.round(s * FPS);
// text lives inside Meta's Reels safe zone: below the top 14 %, above the bottom 35 %
const SHADOW = "0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6)";

const Clip: React.FC<{ src: string; at: number; style?: React.CSSProperties }> = ({ src, at, style }) => (
  <OffthreadVideo muted src={staticFile(`regalo01/${src}.mp4`)} startFrom={F(at)} style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />
);

/* every cut lands with a short punch-in (1.10 → 1) on top of the slow drift */
const ShotView: React.FC<{ s: Shot; frames: number }> = ({ s, frames }) => {
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, frames], s.zoom, { ...clamp, easing: Easing.inOut(Easing.quad) });
  const punch = interpolate(f, [0, 7], [1.1, 1], { ...clamp, easing: easeOut });
  if (s.grid) {
    return (
      <AbsoluteFill style={{ backgroundColor: COLORS.ink, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8 }}>
        {s.grid.map((g, k) => {
          const p = interpolate(f, [k * 3, k * 3 + 8], [0, 1], { ...clamp, easing: back });
          return (
            <div key={k} style={{ overflow: "hidden", transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 1.5) }}>
              <Clip src={g.src} at={g.at} style={{ transform: `scale(${drift})` }} />
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Clip src={s.src} at={s.at} style={{ transform: `scale(${drift * punch})`, transformOrigin: `${s.origin[0]}% ${s.origin[1]}%` }} />
    </AbsoluteFill>
  );
};

/* 2-frame white flash on the cuts that change scene (into the grid, into the end card) */
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(f, [0, 4], [0.7, 0], clamp) }} />;
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(HOOK.to) - 6, F(HOOK.to)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: out }}>
      {HOOK.lines.map((l, k) => {
        // visible on frame 0 (the thumbnail); the second line kicks in a beat later
        const p = k === 0 ? 1 : interpolate(f, [6, 14], [0, 1], { ...clamp, easing: back });
        return (
          <div key={k} style={{ transform: `scale(${0.7 + 0.3 * p})`, opacity: p, fontFamily: "Montserrat", fontWeight: 900, fontSize: 88, lineHeight: 1, letterSpacing: "-0.02em", padding: "10px 26px 14px", borderRadius: 14, color: k ? COLORS.ink : "#fff", background: k ? COLORS.lime : "transparent", textShadow: k ? "none" : SHADOW }}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

const Checks: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(CHECKS_END) - 6, F(CHECKS_END)], [1, 0], clamp);
  if (f < F(CHECKS[0].at) || out <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 290, left: 56, display: "flex", flexDirection: "column", gap: 14, opacity: out }}>
      {CHECKS.map((c, k) => {
        const p = interpolate(f, [F(c.at), F(c.at) + 9], [0, 1], { ...clamp, easing: back });
        if (p <= 0) return null;
        const latest = CHECKS.filter((x) => F(x.at) <= f).length - 1 === k;
        return (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 16, transform: `translateX(${(1 - p) * -60}px)`, opacity: Math.min(1, p * 1.4), background: latest ? COLORS.lime : "rgba(18,18,18,0.72)", color: latest ? COLORS.ink : "#fff", borderRadius: 999, padding: "14px 30px 14px 16px", fontFamily: "Montserrat", fontWeight: 800, fontSize: 42 }}>
            <span style={{ width: 46, height: 46, borderRadius: 999, background: latest ? COLORS.ink : COLORS.lime, color: latest ? COLORS.lime : COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900 }}>✓</span>
            {c.text}
          </div>
        );
      })}
    </div>
  );
};

/* Subtitles = her exact words, 1-3 words at a time, big, the word she is saying in lime with a pop */
type W = (typeof WORDS)[number];
const blocks: W[][] = [];
for (const w of WORDS) {
  const b = blocks[blocks.length - 1];
  const prev = b?.[b.length - 1];
  const len = b ? b.map((x) => x.w).join(" ").length + 1 + w.w.length : 0;
  if (!b || b.length >= 3 || len > 16 || prev!.br || w.piece !== prev!.piece) blocks.push([w]);
  else b.push(w);
}

const Captions: React.FC<{ hideFrom: number }> = ({ hideFrom }) => {
  const f = useCurrentFrame();
  if (f >= hideFrom) return null;
  const t = f / FPS;
  const i = blocks.findIndex((b, k) => t >= b[0].s - 0.04 && t < Math.min(blocks[k + 1]?.[0].s ?? 1e9, b[b.length - 1].e + 0.35));
  if (i < 0) return null;
  const b = blocks[i];
  const p = interpolate(t, [b[0].s - 0.04, b[0].s + 0.1], [0, 1], { ...clamp, easing: back });
  return (
    <div style={{ position: "absolute", top: 1010, left: 50, right: 50, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2), textAlign: "center", fontFamily: "Montserrat", fontWeight: 900, fontSize: 84, lineHeight: 1.05, letterSpacing: "-0.015em", color: "#fff", textShadow: SHADOW, WebkitTextStroke: "2px rgba(0,0,0,0.35)" }}>
        {b.map((w, k) => {
          const on = t >= w.s - 0.02 && t < (b[k + 1]?.s ?? w.e + 0.35);
          const pop = interpolate(t, [w.s - 0.02, w.s + 0.08], [1.14, 1], { ...clamp, easing: easeOut });
          return (
            <span key={k} style={{ display: "inline-block", marginLeft: k ? 20 : 0, color: on ? COLORS.lime : "#fff", transform: `scale(${on ? pop : 1})` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const bg = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: easeOut });
  const logo = interpolate(f, [2, 12], [0, 1], { ...clamp, easing: back });
  const kick = interpolate(f, [8, 16], [0, 1], { ...clamp, easing: easeOut });
  const cta = interpolate(f, [12, 22], [0, 1], { ...clamp, easing: back });
  const pulse = 1 + 0.035 * Math.max(0, Math.sin(((f - 22) / FPS) * Math.PI * 2.2)) * (f > 22 ? 1 : 0);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: bg, backdropFilter: "blur(14px)", background: "rgba(14,14,14,0.62)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={staticFile(END.logo)} style={{ width: 560, opacity: Math.min(1, logo * 1.4), transform: `scale(${0.7 + 0.3 * logo})` }} />
        <div style={{ marginTop: 40, opacity: kick, transform: `translateY(${(1 - kick) * 16}px)`, fontFamily: "Montserrat", fontWeight: 800, fontSize: 50, color: "#fff", textShadow: SHADOW }}>{END.kicker}</div>
        <div style={{ marginTop: 44, opacity: Math.min(1, cta * 1.4), transform: `scale(${(0.7 + 0.3 * cta) * pulse})`, background: COLORS.lime, color: COLORS.ink, fontFamily: "Montserrat", fontWeight: 900, fontSize: 46, padding: "24px 48px", borderRadius: 999, boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}>
          {END.cta} →
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Pauta: React.FC = () => {
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
      {SHOTS.filter((s) => s.grid || s === end).map((s) => (
        <Sequence key={`flash-${s.name}`} from={F(s.from)} durationInFrames={5}>
          <Flash />
        </Sequence>
      ))}
      <Hook />
      <Checks />
      <Captions hideFrom={F(end.from)} />
      <Sequence from={F(end.from)}>
        <EndCard />
      </Sequence>
      <Audio src={staticFile(VOICE)} />
    </AbsoluteFill>
  );
};
