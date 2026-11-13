import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import edit from "./edit.json";
import { MinimalCaptions, MinimalEndTag, MinimalHook } from "../components/Minimal";

/*
 * RE:SET BUEN FIN 15% · Soft Winter Blush — Ilana always on screen talking (one uncut take) with a small side
 * picture-in-picture of real close-ups while she talks about warmth, feel and details.
 * Minimal text system (src/components/Minimal.tsx): short hook, verbatim captions, discreet end tag.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.out(Easing.cubic);
const appear = (f: number, a = 0, d = 8) => ease(Math.min(1, Math.max(0, (f - a) / d)));

const MAIN = edit.shots[0];
const FREEZE = edit.freeze;
export const BLUSH_TOTAL = MAIN.frames + FREEZE.frames;

const zoomStyle = (f: number, dur: number, z: number[], focus: number[]) => {
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / dur));
  return { transform: `scale(${z[0] + (z[1] - z[0]) * p})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%` };
};

const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo muted src={staticFile("blush/main.mp4")} style={{ width: "100%", height: "100%", ...zoomStyle(f, MAIN.frames, MAIN.zoom, MAIN.focus) }} />
    </AbsoluteFill>
  );
};

/** CTA hold: her last frame looking at camera, with a slow push. */
const Freeze: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile("blush/freeze.png")} style={{ width: "100%", height: "100%", ...zoomStyle(f, FREEZE.frames, FREEZE.zoom, FREEZE.focus) }} />
    </AbsoluteFill>
  );
};

/** Small side picture-in-picture (left, beside her), thin edge, tiny label; content swaps without the card leaving. */
type Pip = (typeof edit.pips)[number];
const PIP = { w: 270, h: 340, left: 46, top: 900 };
const PipCard: React.FC<{ group: Pip[] }> = ({ group }) => {
  const f = useCurrentFrame();
  const start = group[0].from;
  const dur = group[group.length - 1].to - start;
  const k = Math.min(appear(f, 0, 9), interpolate(f, [dur - 7, dur], [1, 0], clamp));
  return (
    <div
      style={{
        position: "absolute",
        left: PIP.left,
        top: PIP.top,
        width: PIP.w,
        height: PIP.h,
        borderRadius: 16,
        overflow: "hidden",
        border: "2px solid rgba(255,255,255,0.9)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        opacity: k,
        transform: `translateY(${(1 - k) * 12}px)`,
        background: "#e8e2de",
      }}
    >
      {group.map((p) => (
        <Sequence key={p.id} from={p.from - start} durationInFrames={p.to - p.from} layout="none">
          <PipClip p={p} />
        </Sequence>
      ))}
    </div>
  );
};

const PipClip: React.FC<{ p: Pip }> = ({ p }) => {
  const f = useCurrentFrame();
  const dur = p.to - p.from;
  return (
    <AbsoluteFill style={{ opacity: appear(f, 0, 5) }}>
      <OffthreadVideo
        muted
        src={staticFile(`blush/${p.id}.mp4`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${p.focus[0] * 100}% ${p.focus[1] * 100}%`, transform: `scale(${1.02 + 0.03 * (f / dur)})` }}
      />
    </AbsoluteFill>
  );
};

/** Consecutive PiPs (one ends where the next starts) share one card. */
const pipGroups: Pip[][] = [];
for (const p of edit.pips) {
  const g = pipGroups[pipGroups.length - 1];
  if (g && g[g.length - 1].to === p.from) g.push(p);
  else pipGroups.push([p]);
}

export const BlushAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence durationInFrames={MAIN.frames}>
      <Main />
    </Sequence>
    <Sequence from={MAIN.frames} durationInFrames={FREEZE.frames}>
      <Freeze />
    </Sequence>
    <MinimalHook text={edit.minimal.hook} dur={edit.minimal.hookFrames} top={edit.minimal.hookTop} tone={edit.minimal.hookTone} align={"hookAlign" in edit.minimal ? String(edit.minimal.hookAlign) : "center"} />
    {pipGroups.map((g) => (
      <Sequence key={g[0].id} from={g[0].from} durationInFrames={g[g.length - 1].to - g[0].from}>
        <PipCard group={g} />
      </Sequence>
    ))}
    <MinimalCaptions subs={edit.subs} top={edit.minimal.captionTop} />
    <MinimalEndTag promo={edit.minimal.promo} from={MAIN.frames + 6} top={edit.minimal.endTop} tone={edit.minimal.endTone} />
    <Audio src={staticFile("blush/mix.wav")} />
  </AbsoluteFill>
);
