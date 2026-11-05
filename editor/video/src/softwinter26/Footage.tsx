// Footage: 8 vertical iPhone HDR clips (rotation applied) converted to SDR (public/softwinter26/w26xx.mp4); each shot picks its vertical window (cx).
// Transitions are soft: a shot can dissolve in over `soft` frames with a little blur (no whips, no flashes: this is the cozy one).
import React from "react";
import { AbsoluteFill, Easing, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DUR: Record<string, number> = { w2691: 8.5, w2692: 10.15, w2693: 7.0, w2694: 4.8, w2695: 1.6, w2696: 6.6, w2697: 5.2, w2698: 12.2 };
export type Shot = { from: number; len: number; src: string; at: number; cx: number; cx1?: number; z?: [number, number]; rate?: number; ramp?: [number, number]; soft?: number; cy?: number };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Frame: React.FC<{ src: string; frame: number; cx: number; z?: number; cy?: number }> = ({ src, frame, cx, z = 1, cy = 0.5 }) => {
  const vw = W * z; // these clips are vertical (1080×1920): z zooms in, cx picks the horizontal focus
  const vh = H * z;
  const left = Math.min(0, Math.max(W - vw, W / 2 - cx * vw));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Freeze frame={0}>
        <Sequence from={-frame} layout="none">
          <OffthreadVideo muted src={staticFile(`softwinter26/${src}.mp4`)} style={{ position: "absolute", left, top: Math.min(0, Math.max(H - vh, H / 2 - cy * vh)), width: vw, height: vh, filter: "contrast(1.02) saturate(0.98) brightness(1.02)" }} />
        </Sequence>
      </Freeze>
    </AbsoluteFill>
  );
};

/** source frame for local frame f; `ramp` = discreet speed ramp (start → end speed) */
export const srcFrame = (s: Shot, f: number) => {
  const g = Math.max(0, f - (s.soft ?? 0));
  const adv = s.ramp ? s.ramp[0] * g + ((s.ramp[1] - s.ramp[0]) * g * g) / (2 * s.len) : g * (s.rate ?? 1);
  return Math.max(0, Math.min(Math.floor(DUR[s.src] * FPS) - 2, Math.round(s.at * FPS + adv)));
};

/** rendered inside a Sequence that starts `soft` frames before s.from */
export const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const soft = s.soft ?? 0;
  const p = interpolate(f, [0, s.len + soft], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const z = s.z ? s.z[0] + (s.z[1] - s.z[0]) * p : 1.02 + 0.035 * p;
  const cx = s.cx1 !== undefined ? s.cx + (s.cx1 - s.cx) * p : s.cx;
  const a = soft ? interpolate(f, [0, soft], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) }) : 1;
  const blur = soft ? interpolate(f, [0, soft], [10, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ opacity: a, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
      <Frame src={s.src} frame={srcFrame(s, f)} cx={cx} z={z} />
    </AbsoluteFill>
  );
};

/** colour panels on an oat background (one model per panel), each rising in at its own frame */
export const Panels: React.FC<{ shots: Shot[]; at: number[]; bg: string }> = ({ shots, at, bg }) => {
  const f = useCurrentFrame();
  const n = shots.length;
  const gap = 18;
  const pw = (W - gap * (n + 1)) / n;
  return (
    <AbsoluteFill style={{ background: bg }}>
      {shots.map((s, i) => {
        const a = interpolate(f, [at[i], at[i] + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1) });
        return (
          <div key={i} style={{ position: "absolute", left: gap + i * (pw + gap), top: 300, width: pw, height: 1200, overflow: "hidden", borderRadius: pw / 2, opacity: a, transform: `translateY(${(1 - a) * 80}px)`, boxShadow: "0 18px 40px rgba(74,58,48,0.18)" }}>
            <div style={{ position: "absolute", left: -(W - pw) / 2, top: -(H - 1200) / 2, width: W, height: H }}>
              <Frame src={s.src} frame={srcFrame(s, f)} cx={s.cx} cy={s.cy} z={(s.cy ? 1.35 : 1.1) - 0.04 * Math.min(1, f / 90)} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
