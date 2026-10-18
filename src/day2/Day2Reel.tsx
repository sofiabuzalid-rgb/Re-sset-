import { loadFont } from "@remotion/fonts";
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
const SHADOW = "0 1px 2px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.45)";

type Shot = (typeof edit.shots)[number] & { from: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
}
export const DAY2_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

/** Each cut lands on the beat with a tiny settle-in (scale 1.04 -> 1.0 in 6 frames) so the cuts feel connected by motion. */
const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const z = 1 + 0.04 * (1 - ramp(f, 0, 6)) + 0.02 * (f / s.frames);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(`day2/${s.id}.mp4`)}
        style={{ width: "100%", height: "100%", transform: `scale(${z})` }}
      />
    </AbsoluteFill>
  );
};

const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const o = Math.min(
    ramp(f, 0, 6),
    interpolate(f, [dur - 6, dur], [1, 0], clamp),
  );
  const words = edit.intro.text.split(" ");
  return (
    <>
      <AbsoluteFill
        style={{
          opacity: o,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.3) 22%, rgba(0,0,0,0) 34%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 330,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          columnGap: 16,
          opacity: o,
        }}
      >
        {words.map((w, i) => {
          const p = ramp(f, i * 3, 10);
          return (
            <div
              key={i}
              style={{ overflow: "hidden", paddingTop: 6, marginTop: -6 }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: i < 2 ? 700 : 300,
                  fontSize: 46,
                  letterSpacing: "0.16em",
                  color: "#fff",
                  textShadow: SHADOW,
                  transform: `translateY(${(1 - p) * 100}%)`,
                }}
              >
                {w}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const veil = ramp(f, 0, 14);
  const t1 = ramp(f, 4, 14);
  const t2 = ramp(f, 16, 12);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: veil,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 20%, rgba(0,0,0,0) 32%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 280,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 300,
            fontSize: 64,
            letterSpacing: "0.04em",
            color: "#fff",
            textShadow: SHADOW,
            opacity: t1,
            transform: `translateY(${(1 - t1) * 12}px)`,
          }}
        >
          {edit.outro.title}
        </div>
        <div
          style={{
            width: 70 * t2,
            height: 1.5,
            background: "#fff",
            margin: "20px 0 16px",
            opacity: 0.85,
          }}
        />
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 28,
            letterSpacing: "0.24em",
            color: "#fff",
            textShadow: SHADOW,
            opacity: t2,
          }}
        >
          {edit.outro.sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Day2Reel: React.FC = () => (
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
      from={edit.intro.from}
      durationInFrames={edit.intro.to - edit.intro.from}
    >
      <Intro dur={edit.intro.to - edit.intro.from} />
    </Sequence>
    <Sequence from={edit.outro.from}>
      <Outro />
    </Sequence>
    <Audio src={staticFile("day2/music.wav")} />
  </AbsoluteFill>
);
