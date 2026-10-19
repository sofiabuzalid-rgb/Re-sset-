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
const CREAM = "#F7EFE3";
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));
const SHADOW = "0 2px 4px rgba(0,0,0,0.45), 0 4px 24px rgba(0,0,0,0.4)";

type Shot = (typeof edit.shots)[number] & { from: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
}
export const MAMA_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z =
    (s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p) *
    (1 + 0.025 * (1 - ramp(f, 0, 5)));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(`mama/${s.id}.mp4`)}
        style={{ width: "100%", height: "100%", transform: `scale(${z})` }}
      />
    </AbsoluteFill>
  );
};

const Line: React.FC<{
  text: string;
  f: number;
  at: number;
  size: number;
  color?: string;
  weight?: number;
}> = ({ text, f, at, size, color = "#fff", weight = 800 }) => {
  const p = ramp(f, at, 8);
  return (
    <div style={{ overflow: "hidden", paddingTop: 8, marginTop: -8 }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: "0.01em",
          color,
          textShadow: SHADOW,
          transform: `translateY(${(1 - p) * 102}%)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

type T = (typeof edit.texts)[number] & {
  lines?: string[];
  size?: number;
  accent?: number;
  mama?: boolean;
  price?: boolean;
};
const Text: React.FC<{ t: T }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from;
  const o = interpolate(f, [dur - 4, dur], [1, 0], clamp);
  if (t.mama) {
    // the memorable moment: big, centred, three beats — MAMÁ / + / MINI ME
    const plus = ramp(f, 8, 8);
    return (
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: o,
        }}
      >
        <Line text="MAMÁ" f={f} at={0} size={150} weight={900} />
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 110,
            lineHeight: 0.9,
            color: CREAM,
            textShadow: SHADOW,
            opacity: plus,
            transform: `scale(${0.6 + 0.4 * plus})`,
          }}
        >
          +
        </div>
        <Line text="MINI ME" f={f} at={15} size={150} weight={900} />
      </div>
    );
  }
  if (t.price) {
    return (
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 320,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 40,
          opacity: o,
        }}
      >
        {edit.price.map(([k, v], i) => {
          const p = ramp(f, i * 8, 9);
          return (
            <React.Fragment key={k}>
              {i ? (
                <div
                  style={{
                    width: 2,
                    height: 160,
                    background: "#fff",
                    opacity: p * 0.9,
                    marginBottom: 12,
                  }}
                />
              ) : null}
              <div
                style={{
                  textAlign: "center",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 14}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 30,
                    letterSpacing: "0.28em",
                    color: CREAM,
                    textShadow: SHADOW,
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: 900,
                    fontSize: 132,
                    lineHeight: 1,
                    color: "#fff",
                    textShadow: SHADOW,
                  }}
                >
                  {v}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        opacity: o,
      }}
    >
      {(t.lines ?? []).map((l, i) => (
        <Line
          key={l}
          text={l}
          f={f}
          at={i * 5}
          size={t.size ?? 84}
          color={t.accent === i ? CREAM : "#fff"}
        />
      ))}
    </div>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const sub = ramp(f, 16, 10);
  const lg = ramp(f, 26, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {edit.close.title.map((l, i) => (
        <Line
          key={l}
          text={l}
          f={f}
          at={i * 6}
          size={92}
          weight={900}
          color={i ? CREAM : "#fff"}
        />
      ))}
      <div
        style={{
          marginTop: 22,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.14em",
          color: "#fff",
          textShadow: SHADOW,
          opacity: sub,
        }}
      >
        {edit.close.sub}
      </div>
      <Img
        src={staticFile("brand/reset-logo-white.png")}
        style={{ width: 200, marginTop: 26, opacity: lg }}
      />
    </div>
  );
};

export const MamaAd: React.FC = () => (
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
    {/* light top gradient keeps white type readable on the white wall without boxes or bars */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(40,6,10,0.5) 0%, rgba(40,6,10,0.35) 22%, rgba(40,6,10,0) 40%)",
      }}
    />
    {edit.texts.map((t) => (
      <Sequence key={t.from} from={t.from} durationInFrames={t.to - t.from}>
        <Text t={t} />
      </Sequence>
    ))}
    <Sequence from={edit.close.from}>
      <Close />
    </Sequence>
    <Audio src={staticFile("mama/music.wav")} />
  </AbsoluteFill>
);
