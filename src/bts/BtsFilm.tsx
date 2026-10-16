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
// Gotham is the brand face; Montserrat is the closest available stand-in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const B = {
  lime: "#E2EC95",
  blue: "#7B95AB",
  mauve: "#B07E7F",
  white: "#FFFFFF",
  ink: "#000000",
};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = edit.fps;
const fr = (s: number) => Math.round(s * FPS);
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));
const SHADOW = "0 1px 2px rgba(0,0,0,0.55), 0 2px 12px rgba(0,0,0,0.45)";

type Shot = (typeof edit.shots)[number] & { from: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
}
export const BTS_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

const subs = edit.subtitles.map((s) => {
  const v = edit.voice[s.v];
  const at = edit.voiceAt[s.v];
  return { text: s.text, from: at + fr(s.a - v.a), to: at + fr(s.b - v.a) };
});

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
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      {"photo" in s && s.photo ? (
        <Img src={staticFile(`bts/${s.photo}`)} style={style} />
      ) : (
        <OffthreadVideo
          muted
          src={staticFile(`bts/${s.id}.mp4`)}
          style={style}
        />
      )}
    </AbsoluteFill>
  );
};

/** Documentary subtitle: moderate size, max two lines, a highlighted phrase in Pantone 386 U. */
const Subtitle: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 4, dur - 4, dur], [0, 1, 1, 0], clamp);
  const parts = text.split("*");
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        bottom: 1920 - 1250,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          maxWidth: 860,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.28,
          color: B.white,
          textShadow: SHADOW,
        }}
      >
        {parts.map((p, i) => (
          <span key={i} style={i % 2 ? { color: B.lime } : undefined}>
            {p}
          </span>
        ))}
      </div>
    </div>
  );
};

const LowerThird: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const line = ramp(f, 0, 16);
  const name = ramp(f, 6, 14);
  const role = ramp(f, 12, 14);
  const out = interpolate(f, [dur - 10, dur], [1, 0], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 930,
          width: 760,
          height: 300,
          opacity: out * line,
          background:
            "radial-gradient(ellipse 60% 50% at 25% 50%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 80, top: 1010, opacity: out }}>
        <div
          style={{
            width: 64 * line,
            height: 3,
            background: B.lime,
            marginBottom: 14,
          }}
        />
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: "0.16em",
            color: B.white,
            textShadow: SHADOW,
            opacity: name,
            transform: `translateY(${(1 - name) * 8}px)`,
          }}
        >
          {edit.lowerThird.name}
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: 28,
            letterSpacing: "0.04em",
            color: B.white,
            textShadow: SHADOW,
            marginTop: 6,
            opacity: role,
            transform: `translateY(${(1 - role) * 6}px)`,
          }}
        >
          {edit.lowerThird.role}
        </div>
      </div>
    </>
  );
};

/** Editorial text between scenes: small kicker, lines revealed one after another. */
const Editorial: React.FC<{ t: (typeof edit.texts)[number] }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from;
  const out = interpolate(f, [dur - 10, dur], [1, 0], clamp);
  return (
    <>
      {/* soft scrim so the words read on busy footage without a visible box */}
      <div
        style={{
          position: "absolute",
          left: -100,
          right: -100,
          top: t.top - 170,
          height: 220 + t.lines.length * 70 + 170,
          opacity: out * ramp(f, 0, 14),
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: t.top,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          opacity: out,
        }}
      >
        {t.kicker ? (
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: "0.38em",
              color: B.lime,
              textShadow: SHADOW,
              marginBottom: 18,
              opacity: ramp(f, 0, 12),
            }}
          >
            {t.kicker}
          </div>
        ) : null}
        {t.lines.map((l, i) => {
          const p = ramp(f, 4 + i * 22, 16);
          return (
            <div
              key={l}
              style={{
                fontFamily: SANS,
                fontWeight: t.caps
                  ? 700
                  : i === 0 && t.lines.length > 1 && t.kicker
                    ? 300
                    : 500,
                fontSize: t.caps ? 46 : 56,
                letterSpacing: t.caps ? "0.22em" : "-0.005em",
                lineHeight: 1.18,
                color: B.white,
                textShadow: SHADOW,
                opacity: p,
                transform: `translateY(${(1 - p) * 10}px)`,
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
    </>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const veil = ramp(f, 0, 24);
  const logo = ramp(f, 8, 18);
  const tag = ramp(f, 22, 16);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: veil,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 34%, rgba(0,0,0,0) 52%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            opacity: logo,
            transform: `translateY(${(1 - logo) * 10}px)`,
          }}
        >
          <Img
            src={staticFile("brand/reset-logo-white.png")}
            style={{ width: 360 }}
          />
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: 34,
            letterSpacing: "0.12em",
            color: B.white,
            textShadow: SHADOW,
            marginTop: 18,
            opacity: tag,
          }}
        >
          {edit.close.tagline}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const BtsFilm: React.FC = () => (
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
      from={edit.lowerThird.from}
      durationInFrames={edit.lowerThird.to - edit.lowerThird.from}
    >
      <LowerThird dur={edit.lowerThird.to - edit.lowerThird.from} />
    </Sequence>
    {subs.map((s) => (
      <Sequence key={s.text} from={s.from} durationInFrames={s.to - s.from}>
        <Subtitle text={s.text} dur={s.to - s.from} />
      </Sequence>
    ))}
    {edit.texts.map((t) => (
      <Sequence key={t.from} from={t.from} durationInFrames={t.to - t.from}>
        <Editorial t={t} />
      </Sequence>
    ))}
    <Sequence from={edit.close.from}>
      <Close />
    </Sequence>
    <Audio src={staticFile("bts/mix.wav")} />
  </AbsoluteFill>
);
