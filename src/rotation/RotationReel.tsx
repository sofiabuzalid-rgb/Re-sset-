import { loadFont } from "@remotion/fonts";
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

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));
const SHADOW = "0 1px 2px rgba(0,0,0,0.45), 0 2px 14px rgba(0,0,0,0.4)";

type Shot = (typeof edit.shots)[number] & { from: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
}
export const ROTATION_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

/** Hard cut on the beat + a 5-frame settle (1.03 -> 1) so look changes feel snappy, never flashy. */
const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const z = s.zoom * (1 + 0.03 * (1 - ramp(f, 0, 5)) + 0.015 * (f / s.frames));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(`rotation/${s.id}.mp4`)}
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${z})`,
          transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Small lowercase editorial line, centred low on the frame so it never hides the garment's top. */
const Line: React.FC<{
  text: string;
  dur: number;
  size?: number;
  top?: number;
}> = ({ text, dur, size = 42, top = 1150 }) => {
  const f = useCurrentFrame();
  const o = Math.min(
    ramp(f, 0, 5),
    interpolate(f, [dur - 4, dur], [1, 0], clamp),
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top,
        textAlign: "center",
        opacity: o,
        transform: `translateY(${(1 - ramp(f, 0, 8)) * 8}px)`,
      }}
    >
      <span
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: size,
          letterSpacing: "0.02em",
          color: "#fff",
          textShadow: SHADOW,
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const veil = ramp(f, 0, 12);
  const t1 = ramp(f, 3, 12);
  const t2 = ramp(f, 14, 12);
  const lg = ramp(f, 24, 14);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: veil,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 48%, rgba(0,0,0,0.38) 62%, rgba(0,0,0,0.45) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1010,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: "0.06em",
            color: "#fff",
            textShadow: SHADOW,
            opacity: t1,
            transform: `translateY(${(1 - t1) * 10}px)`,
          }}
        >
          {edit.close.title}
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: 32,
            color: "#fff",
            textShadow: SHADOW,
            marginTop: 12,
            opacity: t2,
          }}
        >
          {edit.close.sub}
        </div>
        <Img
          src={staticFile("brand/reset-logo-white.png")}
          style={{ width: 190, marginTop: 30, opacity: lg }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const RotationReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {shots.map((s) => (
      <Sequence
        key={s.id}
        from={s.from}
        durationInFrames={s.frames}
        premountFor={10}
      >
        <ShotView s={s} />
      </Sequence>
    ))}
    <Sequence
      from={edit.hook.from}
      durationInFrames={edit.hook.to - edit.hook.from}
    >
      <Line
        text={edit.hook.text}
        dur={edit.hook.to - edit.hook.from}
        size={50}
        top={880}
      />
    </Sequence>
    {edit.tags.map((t) => (
      <Sequence key={t.from} from={t.from} durationInFrames={t.to - t.from}>
        <Line text={t.text} dur={t.to - t.from} />
      </Sequence>
    ))}
    <Sequence from={edit.close.from}>
      <Close />
    </Sequence>
    <Audio src={staticFile("rotation/music.wav")} />
  </AbsoluteFill>
);
