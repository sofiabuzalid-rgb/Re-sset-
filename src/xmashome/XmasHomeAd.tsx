import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { MinimalEndTag, MinimalHook, MinimalSubtitle } from "../components/Minimal";
import edit from "./edit.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = edit.fps;

type Shot = {
  id: string;
  frames: number;
  zoom?: number[];
  focus?: number[];
  card?: boolean;
  from: number;
  xf: number;
};
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots as (Omit<Shot, "from" | "xf"> & { xf?: number })[]) {
    shots.push({ ...s, from: t, xf: s.xf ?? 0 });
    t += s.frames;
  }
}
export const XMASHOME_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

// subtitles are timed in voice-source seconds; place them on the edit timeline
const subs = (edit.subtitles as { a: number; b: number; text: string; top?: number }[]).map(
  (s) => ({
    text: s.text,
    top: s.top,
    from: edit.voice.at + Math.round((s.a - edit.voice.a) * FPS),
    to: edit.voice.at + Math.round((s.b - edit.voice.a) * FPS),
  }),
);

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const dur = s.frames + s.xf;
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / dur));
  const z = s.zoom![0] + (s.zoom![1] - s.zoom![0]) * p;
  const o = s.xf ? interpolate(f, [0, s.xf], [0, 1], clamp) : 1;
  const origin = `${s.focus![0] * 100}% ${s.focus![1] * 100}%`;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: o }}>
      <OffthreadVideo
        muted
        src={staticFile(`xmashome/${s.id}.mp4`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${z})`,
          transformOrigin: origin,
        }}
      />
    </AbsoluteFill>
  );
};

/** Warm room glow + vignette over the footage: a whisper of gold from the lamps, never over the product's colour. */
const Finish: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 85% 8%, rgba(255,196,120,0.10) 0%, rgba(255,196,120,0) 70%), radial-gradient(ellipse 60% 35% at 10% 95%, rgba(255,180,100,0.08) 0%, rgba(255,180,100,0) 70%)",
        mixBlendMode: "screen",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 90% 75% at 50% 50%, rgba(0,0,0,0) 62%, rgba(20,10,4,0.32) 100%)",
      }}
    />
  </AbsoluteFill>
);

export const XmasHomeAd: React.FC<{ bare?: boolean }> = ({ bare }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {shots.map((s) => (
      <Sequence key={s.id} from={s.from - s.xf} durationInFrames={s.frames + s.xf} premountFor={15}>
        <ShotView s={s} />
      </Sequence>
    ))}
    <Sequence durationInFrames={XMASHOME_TOTAL}>
      <Finish />
    </Sequence>
    {!bare && edit.texts.map((t) => (
      <Sequence key={t.from} from={t.from} durationInFrames={t.to - t.from}>
        <MinimalHook text={t.lines.join(" ")} dur={t.to - t.from} tone="light" />
      </Sequence>
    ))}
    {!bare && subs.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
        <MinimalSubtitle text={s.text} dur={s.to - s.from} top={s.top ?? edit.subtitleTop} />
      </Sequence>
    ))}
    <Sequence from={edit.endTag.from} durationInFrames={XMASHOME_TOTAL - edit.endTag.from}>
      <MinimalEndTag
        line={edit.endTag.line}
        dur={XMASHOME_TOTAL - edit.endTag.from}
        tone="light"
        top={edit.endTag.top}
        left={edit.endTag.left}
      />
    </Sequence>
    <Audio src={staticFile("xmashome/mix.wav")} />
  </AbsoluteFill>
);
