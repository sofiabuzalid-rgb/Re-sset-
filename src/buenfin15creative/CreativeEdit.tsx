import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { MinimalEndTag, MinimalHook, MinimalSubtitle } from "../components/Minimal";
import edit from "./buenfin15-creative.json";
import subsJson from "./buenfin15-creative.subs.json";

const DIR = "buenfin15-creative";

type Shot = { id: string; frames: number; zoom: number[]; focus: number[]; freeze?: unknown };
type G = { kind: string; from: number; to: number; text?: string; line?: string; logo?: boolean; top?: number };
type Sub = { from: number; to: number; text: string; top?: number };

const E = edit as unknown as { shots: Shot[]; graphics: G[] };
const SUBS = subsJson as Sub[];
export const CREATIVE_TOTAL = E.shots.reduce((n, s) => n + s.frames, 0);

let acc = 0;
const SHOTS = E.shots.map((s) => {
  const o = { ...s, from: acc };
  acc += s.frames;
  return o;
});

/** Full-bleed footage with a slow, barely-there drift; held frames get the same treatment. */
const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
    transform: `scale(${z})`,
    transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
  };
  return s.freeze ? (
    <Img src={staticFile(`${DIR}/${s.id}.jpg`)} style={style} />
  ) : (
    <OffthreadVideo muted src={staticFile(`${DIR}/${s.id}.mp4`)} style={style} />
  );
};

export const CreativeEdit: React.FC<{ bare?: boolean }> = ({ bare }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SHOTS.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={15}>
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <ShotView s={s} />
        </AbsoluteFill>
      </Sequence>
    ))}
    {!bare && E.graphics.map((g) => (
      <Sequence key={g.kind} from={g.from} durationInFrames={g.to - g.from}>
        {g.kind === "hook" ? (
          <MinimalHook text={g.text as string} dur={g.to - g.from} />
        ) : (
          <MinimalEndTag line={g.line as string} dur={g.to - g.from} logo={g.logo} top={g.top} />
        )}
      </Sequence>
    ))}
    {!bare && SUBS.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
        <MinimalSubtitle text={s.text} dur={s.to - s.from} top={s.top} />
      </Sequence>
    ))}
    <Audio src={staticFile(`${DIR}/mix.wav`)} />
  </AbsoluteFill>
);
