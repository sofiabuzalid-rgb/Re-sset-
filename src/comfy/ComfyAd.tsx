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
const B = {
  lime: "#E2EC95",
  blue: "#7B95AB",
  white: "#FFFFFF",
  ink: "#111111",
};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = edit.fps;
const fr = (s: number) => Math.round(s * FPS);
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));
const SHADOW = "0 1px 2px rgba(0,0,0,0.5), 0 2px 14px rgba(0,0,0,0.35)";

type Shot = (typeof edit.shots)[number] & { from: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
}
export const COMFY_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

const subs = edit.subtitles.map((s) => {
  const v = edit.voice[s.v];
  return { text: s.text, from: v.at + fr(s.a - v.a), to: v.at + fr(s.b - v.a) };
});

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(`comfy/${s.id}.mp4`)}
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

/** Subtitle group (3–6 words): fast, discreet fade-up; at most one emphasised word in Pantone 386 U. */
const Subtitle: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], clamp);
  const y = (1 - ramp(f, 0, 6)) * 6;
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
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 860,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 46,
          lineHeight: 1.25,
          color: B.white,
          background: "rgba(17,17,17,0.42)",
          padding: "8px 22px 10px",
          borderRadius: 10,
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

const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const k = ramp(f, 0, 10);
  const words = edit.hook.title.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 290,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: out,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: "0.4em",
          color: B.white,
          textShadow: SHADOW,
          opacity: k,
        }}
      >
        {edit.hook.kicker}
      </div>
      <div
        style={{
          width: 80 * k,
          height: 3,
          background: B.lime,
          margin: "14px 0 12px",
        }}
      />
      <div style={{ display: "flex", gap: 22 }}>
        {words.map((w, i) => {
          const p = ramp(f, 3 + i * 4, 12);
          return (
            <div
              key={i}
              style={{ overflow: "hidden", paddingTop: 8, marginTop: -8 }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 800,
                  fontSize: 66,
                  letterSpacing: "0.02em",
                  color: w === "·" ? B.lime : B.white,
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
    </div>
  );
};

/** Small product label with a hairline and an optional colour swatch taken from the garment. */
const Tag: React.FC<{ t: (typeof edit.tags)[number] }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from;
  const o = Math.min(
    ramp(f, 0, 8),
    interpolate(f, [dur - 6, dur], [1, 0], clamp),
  );
  const line = ramp(f, 2, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: t.x,
        top: t.y,
        opacity: o,
        transform: `translateX(${(1 - ramp(f, 0, 10)) * -14}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(17,17,17,0.5)",
          padding: "12px 22px 12px 16px",
          borderLeft: `3px solid ${B.lime}`,
        }}
      >
        {"swatch" in t && t.swatch ? (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              background: t.swatch,
              border: "2px solid rgba(255,255,255,0.9)",
            }}
          />
        ) : null}
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.2em",
            color: B.white,
          }}
        >
          {t.text}
        </div>
      </div>
      <div
        style={{
          height: 1.5,
          width: 160 * line,
          background: "rgba(255,255,255,0.8)",
          marginTop: 8,
        }}
      />
    </div>
  );
};

const Favorite: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const p = ramp(f, 0, 8);
  const out = interpolate(f, [dur - 4, dur], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 1920 - 1250,
        display: "flex",
        justifyContent: "center",
        opacity: p * out,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 60,
          letterSpacing: "0.03em",
          color: B.ink,
          background: B.white,
          padding: "14px 30px 12px",
          transform: `scale(${0.94 + 0.06 * p})`,
        }}
      >
        {edit.favorite.text}
      </div>
    </div>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const veil = ramp(f, 0, 12);
  const t1 = ramp(f, 4, 12);
  const logo = ramp(f, 14, 14);
  const cta = ramp(f, 24, 12);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: veil,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.45) 28%, rgba(0,0,0,0) 46%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 64,
            letterSpacing: "0.04em",
            color: B.white,
            opacity: t1,
            transform: `translateY(${(1 - t1) * 12}px)`,
          }}
        >
          {edit.close.title}
        </div>
        <div
          style={{
            width: 90 * logo,
            height: 3,
            background: B.lime,
            margin: "18px 0 22px",
          }}
        />
        <div style={{ opacity: logo }}>
          <Img
            src={staticFile("brand/reset-logo-white.png")}
            style={{ width: 300 }}
          />
        </div>
        <div
          style={{
            marginTop: 26,
            padding: "16px 38px 14px",
            background: B.white,
            color: B.ink,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "0.18em",
            opacity: cta,
            transform: `translateY(${(1 - cta) * 10}px)`,
          }}
        >
          {edit.close.cta}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ComfyAd: React.FC = () => (
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
      <Hook dur={edit.hook.to - edit.hook.from} />
    </Sequence>
    {edit.tags.map((t) => (
      <Sequence
        key={`${t.text}${t.from}`}
        from={t.from}
        durationInFrames={t.to - t.from}
      >
        <Tag t={t} />
      </Sequence>
    ))}
    {subs.map((s) => (
      <Sequence key={s.text} from={s.from} durationInFrames={s.to - s.from}>
        <Subtitle text={s.text} dur={s.to - s.from} />
      </Sequence>
    ))}
    <Sequence
      from={edit.favorite.from}
      durationInFrames={edit.favorite.to - edit.favorite.from}
    >
      <Favorite dur={edit.favorite.to - edit.favorite.from} />
    </Sequence>
    <Sequence from={edit.close.from}>
      <Close />
    </Sequence>
    <Audio src={staticFile("comfy/mix.wav")} />
  </AbsoluteFill>
);
