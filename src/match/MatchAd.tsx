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
const C = { ink: "#14110F", white: "#FFFFFF", lime: "#E2EC95" };
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));
const SHADOW = "0 1px 2px rgba(0,0,0,0.35), 0 2px 18px rgba(0,0,0,0.35)";

type Shot = (typeof edit.shots)[number] & { from: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
}
export const MATCH_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

/** Slow drift on every shot; first 4 frames settle in so cuts feel like one continuous move. */
const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const z = 1 + 0.025 * (1 - ramp(f, 0, 5)) + 0.03 * (f / s.frames);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(`match/${s.id}.mp4`)}
        style={{ width: "100%", height: "100%", transform: `scale(${z})` }}
      />
    </AbsoluteFill>
  );
};

type T = (typeof edit.texts)[number] & { accent?: boolean; big?: boolean };
/** Editorial headline over a soft top gradient: Gotham-style bold caps, line-by-line reveal. */
const Headline: React.FC<{ t: T }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from;
  const o = interpolate(f, [dur - 5, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.5) 22%, rgba(0,0,0,0.2) 32%, rgba(0,0,0,0) 40%)",
          opacity: ramp(f, 0, 6),
        }}
      />
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
        {t.lines.map((l, i) => {
          const p = ramp(f, i * 5, 9);
          return (
            <div
              key={l}
              style={{ overflow: "hidden", paddingTop: 6, marginTop: -6 }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: t.big ? 800 : 700,
                  fontSize: t.big ? 124 : 80,
                  lineHeight: 1.08,
                  letterSpacing: t.big ? "0.01em" : "0.03em",
                  color:
                    t.accent && i === t.lines.length - 1 ? C.lime : C.white,
                  textShadow: SHADOW,
                  transform: `translateY(${(1 - p) * 100}%)`,
                }}
              >
                {l}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Price badge, always visible from the price section to the close. */
const Badge: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 58, 8); // appears once the two big price cards have been read
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        top: 1090,
        opacity: k,
        transform: `translateX(${(1 - k) * -24}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.94)",
          borderLeft: `7px solid ${C.lime}`,
          padding: "12px 22px 12px 18px",
        }}
      >
        {edit.badge.lines.map((l) => (
          <div
            key={l}
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 32,
              lineHeight: 1.25,
              letterSpacing: "0.04em",
              color: C.ink,
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const veil = ramp(f, 0, 12);
  const pr = ramp(f, 16, 10);
  const sub = ramp(f, 24, 10);
  const lg = ramp(f, 32, 12);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: veil,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.5) 22%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 64%, rgba(0,0,0,0.65) 100%)",
        }}
      />
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
        {edit.close.title.map((l, i) => {
          const p = ramp(f, 2 + i * 6, 10);
          return (
            <div
              key={l}
              style={{ overflow: "hidden", paddingTop: 6, marginTop: -6 }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 80,
                  lineHeight: 1.08,
                  letterSpacing: "0.03em",
                  color: i ? C.lime : C.white,
                  textShadow: SHADOW,
                  transform: `translateY(${(1 - p) * 100}%)`,
                }}
              >
                {l}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1060,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 50,
            letterSpacing: "0.03em",
            color: C.white,
            opacity: pr,
            transform: `translateY(${(1 - pr) * 10}px)`,
          }}
        >
          {edit.close.price}
        </div>
        <div
          style={{
            marginTop: 16,
            background: C.lime,
            color: C.ink,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 25,
            letterSpacing: "0.1em",
            padding: "14px 26px 12px",
            opacity: sub,
          }}
        >
          {edit.close.sub}
        </div>
        <Img
          src={staticFile("brand/reset-logo-white.png")}
          style={{ width: 200, marginTop: 22, opacity: lg }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const MatchAd: React.FC = () => (
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
    {edit.texts.map((t) => (
      <Sequence key={t.from} from={t.from} durationInFrames={t.to - t.from}>
        <Headline t={t} />
      </Sequence>
    ))}
    <Sequence
      from={edit.badge.from}
      durationInFrames={edit.badge.to - edit.badge.from}
    >
      <Badge />
    </Sequence>
    <Sequence from={edit.close.from}>
      <Close />
    </Sequence>
    <Audio src={staticFile("match/music.wav")} />
  </AbsoluteFill>
);
