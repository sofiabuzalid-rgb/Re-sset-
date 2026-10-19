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
// Gotham is the brand face; Montserrat (Black/ExtraBold) stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const INK = "#0E0E10";
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));
// white type + soft shadow over a light top gradient: readable over rail, hangers and any shirt colour, no boxes or bars
const HALO = "0 2px 4px rgba(0,0,0,0.45), 0 4px 22px rgba(0,0,0,0.4)";

type Shot = (typeof edit.shots)[number] & { from: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
}
export const GAMEDAY_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

/** Each shot drifts between its two zoom values; the first frames carry a short punch so team changes hit with the beat. */
const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z =
    (s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p) *
    (1 + 0.04 * (1 - ramp(f, 0, 5)));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(`gameday/${s.id}.mp4`)}
        style={{ width: "100%", height: "100%", transform: `scale(${z})` }}
      />
    </AbsoluteFill>
  );
};

const Word: React.FC<{ text: string; f: number; at: number; size: number }> = ({
  text,
  f,
  at,
  size,
}) => {
  const p = ramp(f, at, 6);
  return (
    <div style={{ overflow: "hidden", paddingTop: 8, marginTop: -8 }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 0.98,
          letterSpacing: "-0.01em",
          color: "#fff",
          textShadow: HALO,
          transform: `translateY(${(1 - p) * 102}%)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Hook: one phrase per team cut, each replacing the last, so the sentence is built by the montage. */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const cur = [...edit.hookLines].reverse().find((l) => f >= l.at)!;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
      <Word key={cur.text} text={cur.text} f={f} at={cur.at} size={112} />
    </div>
  );
};

type B = (typeof edit.beats)[number] & {
  steps?: number[];
  top?: number;
  price?: boolean;
};
const Beat: React.FC<{ b: B }> = ({ b }) => {
  const f = useCurrentFrame();
  const dur = b.to - b.from;
  const o = interpolate(f, [dur - 4, dur], [1, 0], clamp);
  if (b.price) {
    const p1 = ramp(f, 0, 7);
    const p2 = ramp(f, 6, 7);
    return (
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 300,
          display: "flex",
          alignItems: "flex-end",
          gap: 36,
          opacity: o,
        }}
      >
        {[
          { k: "ADULTOS", v: edit.price.adult, p: p1 },
          { k: "NIÑOS", v: edit.price.kid, p: p2 },
        ].map((x, i) => (
          <React.Fragment key={x.k}>
            {i ? (
              <div
                style={{
                  width: 3,
                  height: 150,
                  background: INK,
                  opacity: x.p,
                  marginBottom: 10,
                }}
              />
            ) : null}
            <div
              style={{
                opacity: x.p,
                transform: `translateY(${(1 - x.p) * 16}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 30,
                  letterSpacing: "0.24em",
                  color: "#fff",
                  textShadow: HALO,
                }}
              >
                {x.k}
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 128,
                  lineHeight: 1,
                  color: "#fff",
                  textShadow: HALO,
                }}
              >
                {x.v}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: b.top ?? 290,
        opacity: o,
      }}
    >
      {(b.lines ?? []).map((l, i) => (
        <Word
          key={l}
          text={l}
          f={f}
          at={b.steps ? b.steps[i] : i * 4}
          size={b.size ?? 96}
        />
      ))}
    </div>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const t = ramp(f, 2, 8);
  const lg = ramp(f, 14, 10);
  const cta = ramp(f, 22, 8);
  const pulse = 1 + 0.03 * Math.max(0, Math.sin(((f - 30) / 15) * Math.PI));
  return (
    <>
      <div style={{ position: "absolute", left: 70, right: 70, top: 290 }}>
        <Word text="ENCUENTRA SU MATCH" f={f} at={0} size={80} />
        <Word text="EN RE:SET." f={f} at={5} size={80} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 620,
          display: "flex",
          alignItems: "center",
          gap: 28,
          opacity: t,
        }}
      >
        <Img
          src={staticFile("brand/reset-logo-white.png")}
          style={{ width: 220, opacity: lg }}
        />
        <div
          style={{
            border: "3px solid #fff",
            background: "#fff",
            padding: "14px 26px 12px",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: "0.16em",
            color: INK,
            opacity: cta,
            transform: `scale(${pulse})`,
          }}
        >
          {edit.close.cta}
        </div>
      </div>
    </>
  );
};

export const GameDayAd: React.FC = () => (
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
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.3) 18%, rgba(0,0,0,0) 34%)",
      }}
    />
    <Sequence from={0} durationInFrames={60}>
      <Hook />
    </Sequence>
    {edit.beats.map((b) => (
      <Sequence key={b.from} from={b.from} durationInFrames={b.to - b.from}>
        <Beat b={b} />
      </Sequence>
    ))}
    <Sequence from={edit.close.from}>
      <Close />
    </Sequence>
    <Audio src={staticFile("gameday/music.wav")} />
  </AbsoluteFill>
);
