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
const C = {
  cream: "#F4EEE6",
  ink: "#2B2826",
  taupe: "#8A7F76",
  white: "#FFFFFF",
};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));
const SHADOW = "0 1px 3px rgba(0,0,0,0.5), 0 2px 22px rgba(0,0,0,0.45)";

type Shot = (typeof edit.shots)[number] & { from: number; xf: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t, xf: s.xf ?? 0 });
    t += s.frames;
  }
}
export const HOTBOOK_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

/** Footage with a slow push (or pull); dissolves in over `xf` frames when set. */
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
        src={staticFile(`hotbook/${s.id}.mp4`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${z})`,
          transformOrigin: origin,
        }}
      />
      {/* soft edge falloff keeps the eye centred without a visible vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 60%, rgba(30,20,10,0.22) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** One short line per moment: rises in, settles, fades. The hook is two lines, the second in tracked caps. */
const Caption: React.FC<{ t: (typeof edit.texts)[number] }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from;
  const hook = t.kind === "hook";
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const top = hook ? 300 : 1250;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: -120,
          right: -120,
          top: top - 150,
          height: hook ? 520 : 380,
          opacity: out * ramp(f, 0, hook ? 4 : 10),
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 55%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          opacity: out,
          color: C.white,
          textShadow: SHADOW,
          fontFamily: SANS,
        }}
      >
        {t.lines.map((l, i) => {
          // the hook is readable by frame ~6; later captions ease in more slowly
          const p = hook ? ramp(f, i * 5, 10) : ramp(f, 0, 14);
          const caps = hook && i === 1;
          return (
            <div
              key={l}
              style={{
                fontWeight: caps ? 600 : hook ? 400 : 500,
                fontSize: hook ? (caps ? 84 : 72) : 62,
                letterSpacing: caps ? "0.08em" : "0",
                whiteSpace: "nowrap",
                lineHeight: 1.15,
                marginTop: caps ? 10 : 0,
                opacity: p,
                transform: `translateY(${(1 - p) * 14}px)`,
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

/** Close: the stand photo as a print on cream, thank-you line, then the discreet logo and handle. */
const Close: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const dur = s.frames + s.xf;
  const veil = interpolate(f, [0, s.xf], [0, 1], clamp);
  const photo = ramp(f, 2, 22);
  const push = 1.0 + 0.05 * Easing.inOut(Easing.quad)(Math.min(1, f / dur));
  const title = ramp(f, 22, 18);
  const logo = ramp(f, 40, 18);
  const sub = ramp(f, 48, 18);
  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, opacity: veil }}>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 230,
          width: 860,
          height: 997,
          overflow: "hidden",
          borderRadius: 6,
          boxShadow: "0 18px 50px rgba(60,40,20,0.18)",
          opacity: photo,
          transform: `translateY(${(1 - photo) * 24}px)`,
        }}
      >
        <Img
          src={staticFile(`hotbook/${s.photo}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${push})`,
            transformOrigin: "50% 60%",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1290,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 54,
          lineHeight: 1.2,
          color: C.ink,
          opacity: title,
          transform: `translateY(${(1 - title) * 12}px)`,
        }}
      >
        {edit.close.title}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Img
          src={staticFile("brand/reset-logo-black.png")}
          style={{ width: 170, opacity: logo * 0.85 }}
        />
        <div
          style={{
            marginTop: 16,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: "0.2em",
            color: C.taupe,
            opacity: sub,
          }}
        >
          {edit.close.sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const HotbookRecap: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {shots.map((s) => (
      <Sequence
        key={s.id}
        from={s.from - s.xf}
        durationInFrames={s.frames + s.xf}
        premountFor={15}
      >
        {"photo" in s && s.photo ? <Close s={s} /> : <ShotView s={s} />}
      </Sequence>
    ))}
    {edit.texts.map((t) => (
      <Sequence key={t.from} from={t.from} durationInFrames={t.to - t.from}>
        <Caption t={t} />
      </Sequence>
    ))}
    <Audio src={staticFile("hotbook/mix.wav")} />
  </AbsoluteFill>
);
