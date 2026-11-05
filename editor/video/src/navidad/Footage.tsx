// Footage: the four clips are horizontal iPhone HDR (converted to SDR in public/navidad/n26xx.mp4); every shot picks its
// vertical window with cx (0–1 across the source width) so her face and the pajama stay in frame and the background
// football shirts stay out.
import React from "react";
import { AbsoluteFill, Easing, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DUR: Record<string, number> = { n2683: 18.55, n2684: 7.38, n2685: 11.38, n2686: 26.75 };
export type Shot = {
  from: number; len: number; src: string; at: number; cx: number; cx1?: number; z?: [number, number]; rate?: number;
  punch?: boolean; // camera punch-in on the beat (scale 1.1 → 1 over 7 frames)
  whip?: 1 | -1; // enters with a horizontal motion blur from the left (1) or right (-1)
  leak?: boolean; // warm light leak on the cut
};

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
  let z = s.z ? s.z[0] + (s.z[1] - s.z[0]) * p : 1.02 + 0.03 * p; // always a slow push: nothing sits dead still
  if (s.punch) z *= interpolate(f, [0, 7], [1.1, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const cx = s.cx1 !== undefined ? s.cx + (s.cx1 - s.cx) * p : s.cx;
  const wk = s.whip ? interpolate(f, [0, 6], [1, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 0;
  return (
    <AbsoluteFill style={{ transform: `translateX(${-(s.whip ?? 0) * wk * 140}px)`, filter: wk > 0.02 ? `url(#mb${Math.min(4, Math.ceil(wk * 4))})` : undefined }}>
      <Frame src={s.src} frame={srcFrame(s, f)} cx={cx} z={z} />
    </AbsoluteFill>
  );
};

/** horizontal motion-blur filters for the whips */
export const BlurDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      {[1, 2, 3, 4].map((i) => (
        <filter key={i} id={`mb${i}`} x="-20%" y="0" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${i * 14} 0`} />
        </filter>
      ))}
    </defs>
  </svg>
);

/** vertical strips, one model each; each strip slides in at its own frame (e.g. on "mamá", "papá", "niños", "niñas") */
export const Split: React.FC<{ shots: Shot[]; at?: number[] }> = ({ shots, at }) => {
  const f = useCurrentFrame();
  const w = W / shots.length;
  return (
    <AbsoluteFill style={{ background: "#F6F0E4" }}>
      {shots.map((s, i) => {
        const t0 = at ? at[i] : i * 4;
        const a = interpolate(f, [t0, t0 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });
        return (
          <div key={i} style={{ position: "absolute", left: i * w + 4, top: 0, width: w - 8, height: H, overflow: "hidden", transform: `translateY(${(1 - a) * (i % 2 ? -1 : 1) * 220}px)`, opacity: a }}>
            <div style={{ position: "absolute", left: -(W - w) / 2, top: 0, width: W, height: H }}>
              <Frame src={s.src} frame={srcFrame(s, f)} cx={s.cx} z={1.08 - 0.03 * Math.min(1, f / 60)} />
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
