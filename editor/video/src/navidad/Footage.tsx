// Footage: the four clips are horizontal iPhone HDR (converted to SDR in public/navidad/n26xx.mp4); every shot picks its
// vertical window with cx (0–1 across the source width) so her face and the pajama stay in frame and the background
// football shirts stay out.
import React from "react";
import { AbsoluteFill, Easing, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DUR: Record<string, number> = { n2683: 18.55, n2684: 7.38, n2685: 11.38, n2686: 26.75 };
export type Shot = { from: number; len: number; src: string; at: number; cx: number; cx1?: number; z?: [number, number]; rate?: number };

/** one exact source frame, cropped to 9:16 (Freeze clamps to the composition length, so freeze at 0 and shift the clip) */
export const Frame: React.FC<{ src: string; frame: number; cx: number; z?: number }> = ({ src, frame, cx, z = 1 }) => {
  const vw = ((H * 16) / 9) * z;
  const vh = H * z;
  const left = Math.min(0, Math.max(W - vw, W / 2 - cx * vw));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Freeze frame={0}>
        <Sequence from={-frame} layout="none">
          <OffthreadVideo muted src={staticFile(`navidad/${src}.mp4`)} style={{ position: "absolute", left, top: (H - vh) / 2, width: vw, height: vh, filter: "contrast(1.04) saturate(1.04)" }} />
        </Sequence>
      </Freeze>
    </AbsoluteFill>
  );
};

export const srcFrame = (s: Shot, f: number) => Math.min(Math.floor(DUR[s.src] * FPS) - 2, Math.round(s.at * FPS + f * (s.rate ?? 1)));

export const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, s.len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const z = s.z ? s.z[0] + (s.z[1] - s.z[0]) * p : 1;
  const cx = s.cx1 !== undefined ? s.cx + (s.cx1 - s.cx) * p : s.cx;
  return <Frame src={s.src} frame={srcFrame(s, f)} cx={cx} z={z} />;
};

/** three vertical strips (one model each), sliding in one after the other */
export const Split: React.FC<{ shots: Shot[] }> = ({ shots }) => {
  const f = useCurrentFrame();
  const w = W / shots.length;
  return (
    <AbsoluteFill style={{ background: "#F6F0E4" }}>
      {shots.map((s, i) => {
        const a = interpolate(f, [i * 4, i * 4 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
        return (
          <div key={i} style={{ position: "absolute", left: i * w + 4, top: 0, width: w - 8, height: H, overflow: "hidden", transform: `translateY(${(1 - a) * (i % 2 ? -1 : 1) * 160}px)`, opacity: a }}>
            <div style={{ position: "absolute", left: -(W - w) / 2, top: 0, width: W, height: H }}>
              <Frame src={s.src} frame={srcFrame(s, f)} cx={s.cx} z={1.05} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 2×2 editorial grid */
export const Grid: React.FC<{ shots: Shot[] }> = ({ shots }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#F6F0E4" }}>
      {shots.map((s, i) => {
        const a = interpolate(f, [i * 3, i * 3 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
        const x = (i % 2) * (W / 2);
        const y = Math.floor(i / 2) * (H / 2);
        return (
          <div key={i} style={{ position: "absolute", left: x + 6, top: y + 6, width: W / 2 - 12, height: H / 2 - 12, overflow: "hidden", borderRadius: 18, opacity: a, transform: `scale(${0.92 + 0.08 * a})` }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: "scale(0.5)", transformOrigin: "0 0" }}>
              <Frame src={s.src} frame={srcFrame(s, f)} cx={s.cx} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
