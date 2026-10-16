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
const P = { mauve: "#B07E7F", ink: "#1A1416", paper: "rgba(255,255,255,0.9)" };
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));

type Shot = (typeof edit.shots)[number] & { from: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
}
export const PINK_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;
const shot = (id: string) => shots.find((s) => s.id === id)!;

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  // 6-frame cross-dissolve in: soft, no flashy transition
  const o = s.from === 0 ? 1 : interpolate(f, [0, 6], [0.4, 1], clamp);
  return (
    <AbsoluteFill
      style={{ overflow: "hidden", backgroundColor: "#fff", opacity: o }}
    >
      <OffthreadVideo
        muted
        src={staticFile(`pink/${s.id}.mp4`)}
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

const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, 12);
  const t = ramp(f, 5, 14);
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1000,
        display: "flex",
        justifyContent: "center",
        opacity: out,
      }}
    >
      <div
        style={{
          background: P.paper,
          padding: "26px 54px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: k,
          transform: `translateY(${(1 - k) * 14}px)`,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "0.42em",
            color: P.mauve,
          }}
        >
          {edit.hook.kicker}
        </div>
        <div
          style={{
            width: 60 * t,
            height: 1.5,
            background: P.mauve,
            margin: "14px 0 12px",
          }}
        />
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 300,
            fontSize: 84,
            letterSpacing: "0.14em",
            color: P.ink,
            opacity: t,
          }}
        >
          {edit.hook.title}
        </div>
      </div>
    </div>
  );
};

/** Detail label: white tab, mauve hairline, letter-spaced caps; sits low-left, away from the detail itself. */
const Label: React.FC<{ text: string; dur: number; top?: number }> = ({
  text,
  dur,
  top = 1080,
}) => {
  const f = useCurrentFrame();
  const o = Math.min(
    ramp(f, 2, 10),
    interpolate(f, [dur - 6, dur], [1, 0], clamp),
  );
  const line = ramp(f, 6, 14);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top,
        opacity: o,
        transform: `translateX(${(1 - ramp(f, 2, 12)) * -16}px)`,
      }}
    >
      <div
        style={{
          background: P.paper,
          padding: "16px 26px 15px",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.24em",
          color: P.ink,
          maxWidth: 760,
        }}
      >
        {text}
      </div>
      <div
        style={{
          height: 2,
          width: 140 * line,
          background: P.mauve,
          marginTop: 10,
        }}
      />
    </div>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 4, 14);
  const logo = ramp(f, 16, 14);
  const cta = ramp(f, 28, 14);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 960,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: P.paper,
          padding: "34px 56px 34px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: k,
          transform: `translateY(${(1 - k) * 14}px)`,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 300,
            fontSize: 64,
            letterSpacing: "0.06em",
            color: P.ink,
          }}
        >
          {edit.close.title}
        </div>
        <div
          style={{
            width: 70 * logo,
            height: 1.5,
            background: P.mauve,
            margin: "20px 0 22px",
          }}
        />
        <Img
          src={staticFile("brand/reset-logo-black.png")}
          style={{ width: 250, opacity: logo }}
        />
        <div
          style={{
            marginTop: 22,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "0.2em",
            color: P.mauve,
            opacity: cta,
          }}
        >
          {edit.close.cta}
        </div>
      </div>
    </div>
  );
};

export const PinkDetail: React.FC = () => {
  const close = shot("close");
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
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
        <Hook dur={edit.hook.to - edit.hook.from} />
      </Sequence>
      {edit.labels.map((l) => {
        const a = shot(l.shot);
        const b = shot(l.to ?? l.shot);
        const dur = b.from + b.frames - a.from;
        return (
          <Sequence key={l.text} from={a.from} durationInFrames={dur}>
            <Label
              text={l.text}
              dur={dur}
              top={"top" in l ? l.top : undefined}
            />
          </Sequence>
        );
      })}
      <Sequence from={close.from}>
        <Close />
      </Sequence>
      <Audio src={staticFile("pink/mix.wav")} />
    </AbsoluteFill>
  );
};
