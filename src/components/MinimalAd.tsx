import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { INTER, MinimalEndTag, MinimalHook, MinimalSubtitle } from "./Minimal";

/**
 * Shared minimal ad: the footage full bleed with a slow drift, a short hook, her literal subtitles and a discreet
 * sign-off. Used by every voice-led RE:SET ad so they share one clean look.
 */
export type MinShot = {
  id: string;
  frames: number;
  zoom?: number[];
  focus?: number[];
  freeze?: unknown; // still extracted to <dir>/<id>.jpg
  photo?: string; // still at <dir>/<photo>
  xf?: number; // frames of soft dissolve into this shot
};
export type MinGraphic = {
  kind: "hook" | "end";
  from: number;
  to: number;
  text?: string;
  line?: string;
  tone?: "dark" | "light";
  top?: number;
  logo?: boolean;
  left?: number;
};
export type MinEdit = {
  shots: MinShot[];
  graphics: MinGraphic[];
  subtitleTop?: number;
  font?: "inter"; // default: the shared Montserrat system
  subtitleSize?: number;
};
export type MinSub = { from: number; to: number; text: string; top?: number };

export const minimalTotal = (e: MinEdit) => e.shots.reduce((n, s) => n + s.frames, 0);

const ShotView: React.FC<{ dir: string; s: MinShot }> = ({ dir, s }) => {
  const f = useCurrentFrame();
  const dur = s.frames + (s.xf ?? 0);
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / dur));
  const zoom = s.zoom ?? [1, 1.03];
  const focus = s.focus ?? [0.5, 0.5];
  const z = zoom[0] + (zoom[1] - zoom[0]) * p;
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`,
    transform: `scale(${z})`,
    transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`,
  };
  const o = s.xf ? interpolate(f, [0, s.xf], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: o }}>
      {s.freeze || s.photo ? (
        <Img src={staticFile(`${dir}/${s.photo ?? `${s.id}.jpg`}`)} style={style} />
      ) : (
        <OffthreadVideo muted src={staticFile(`${dir}/${s.id}.mp4`)} style={style} />
      )}
    </AbsoluteFill>
  );
};

export const MinimalAd: React.FC<{ edit: MinEdit; subs: MinSub[]; dir: string; bare?: boolean }> = ({ edit, subs, dir, bare }) => {
  const font = edit.font === "inter" ? INTER : undefined;
  let t = 0;
  const shots = edit.shots.map((s) => {
    const o = { ...s, from: t };
    t += s.frames;
    return o;
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {shots.map((s) => (
        <Sequence key={s.id} from={s.from - (s.xf ?? 0)} durationInFrames={s.frames + (s.xf ?? 0)} premountFor={15}>
          <ShotView dir={dir} s={s} />
        </Sequence>
      ))}
      {!bare && edit.graphics.map((g) => (
        <Sequence key={`${g.kind}-${g.from}`} from={g.from} durationInFrames={g.to - g.from}>
          {g.kind === "hook" ? (
            <MinimalHook text={g.text ?? ""} dur={g.to - g.from} tone={g.tone} top={g.top} />
          ) : (
            <MinimalEndTag line={g.line ?? ""} dur={g.to - g.from} tone={g.tone} top={g.top} logo={g.logo} left={g.left} font={font} />
          )}
        </Sequence>
      ))}
      {!bare && subs.map((s) => (
        <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
          <MinimalSubtitle text={s.text} dur={s.to - s.from} top={s.top ?? edit.subtitleTop} font={font} size={edit.subtitleSize} />
        </Sequence>
      ))}
      <Audio src={staticFile(`${dir}/mix.wav`)} />
    </AbsoluteFill>
  );
};
