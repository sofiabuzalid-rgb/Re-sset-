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
  family: "Bebas Neue",
  url: staticFile("fonts/BebasNeue-Regular.woff2"),
  weight: "400",
});
loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const DISPLAY = '"Bebas Neue", Gotham, Montserrat, sans-serif';
const C = { ink: "#0B0B0C", white: "#FFFFFF", lime: "#E2EC95" }; // RE:SET Pantone 386 U as the single accent
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
export const NFL_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const z = 1 + 0.035 * (1 - ramp(f, 0, 6)) + 0.02 * (f / s.frames);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(`nfl/${s.id}.mp4`)}
        style={{ width: "100%", height: "100%", transform: `scale(${z})` }}
      />
    </AbsoluteFill>
  );
};

/** Bebas line on a solid ink strip: reads instantly with no sound, never covers the shirt (sits above the hanger). */
const Strip: React.FC<{
  text: string;
  f: number;
  at: number;
  size?: number;
  bg?: string;
  color?: string;
}> = ({ text, f, at, size = 104, bg = C.ink, color = C.white }) => {
  const p = ramp(f, at, 7);
  return (
    <div style={{ overflow: "hidden", alignSelf: "center" }}>
      <div
        style={{
          background: bg,
          padding: `10px 26px 2px`,
          transform: `translateY(${(1 - p) * 105}%)`,
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: size,
            lineHeight: 1.02,
            letterSpacing: "0.02em",
            color,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [dur - 5, dur], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 270,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        opacity: o,
      }}
    >
      <Strip text={edit.hook.lines[0]} f={f} at={0} size={92} />
      <Strip
        text={edit.hook.lines[1]}
        f={f}
        at={14}
        size={112}
        bg={C.lime}
        color={C.ink}
      />
    </div>
  );
};

const Card: React.FC<{ c: (typeof edit.cards)[number] }> = ({ c }) => {
  const f = useCurrentFrame();
  const dur = c.to - c.from;
  const o = interpolate(f, [dur - 5, dur], [1, 0], clamp);
  const k = ramp(f, 0, 6);
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity: o,
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: "0.32em",
          color: C.ink,
          background: C.lime,
          padding: "8px 16px 7px",
          opacity: k,
        }}
      >
        {c.kicker}
      </div>
      <Strip text={c.text} f={f} at={2} size={c.text.length > 24 ? 78 : 96} />
    </div>
  );
};

/** Price badge, on screen from 3 s to the close (the price is always visible). */
const Badge: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, 8);
  return (
    <div
      style={{
        position: "absolute",
        left: 48,
        top: 1060,
        transform: `translateX(${(1 - k) * -30}px)`,
        opacity: k,
      }}
    >
      <div
        style={{
          background: C.white,
          borderLeft: `8px solid ${C.lime}`,
          padding: "12px 22px 6px",
          boxShadow: "0 10px 26px rgba(0,0,0,0.25)",
        }}
      >
        {edit.badge.lines.map((l) => (
          <div
            key={l}
            style={{
              fontFamily: DISPLAY,
              fontSize: 52,
              lineHeight: 1.0,
              color: C.ink,
              letterSpacing: "0.02em",
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

const Trust: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const o = Math.min(
    ramp(f, 4, 8),
    interpolate(f, [dur - 5, dur], [1, 0], clamp),
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 520,
        textAlign: "center",
        opacity: o,
      }}
    >
      <span
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: "0.12em",
          color: C.white,
          background: "rgba(11,11,12,0.75)",
          padding: "8px 16px",
        }}
      >
        {edit.trust.text}
      </span>
    </div>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const veil = ramp(f, 0, 10);
  const pr = ramp(f, 18, 8);
  const cta = ramp(f, 26, 8);
  const pulse = 1 + 0.035 * Math.max(0, Math.sin(((f - 34) / 15) * Math.PI));
  const lg = ramp(f, 34, 10);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: veil,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.72) 58%, rgba(0,0,0,0.8) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 270,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Strip text="TU MATCH FAMILIAR NFL" f={f} at={2} size={92} />
        <Strip
          text="ESTÁ EN RE:SET"
          f={f}
          at={8}
          size={104}
          bg={C.lime}
          color={C.ink}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 1090,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 64,
            color: C.white,
            letterSpacing: "0.03em",
            opacity: pr,
            transform: `translateY(${(1 - pr) * 10}px)`,
          }}
        >
          {edit.close.price}
        </div>
        <div
          style={{
            marginTop: 14,
            background: C.lime,
            color: C.ink,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 38,
            letterSpacing: "0.16em",
            padding: "18px 46px 16px",
            opacity: cta,
            transform: `scale(${(0.9 + 0.1 * cta) * pulse})`,
          }}
        >
          {edit.close.cta}
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.08em",
            color: C.white,
            opacity: cta,
          }}
        >
          {edit.close.sub}
        </div>
        <Img
          src={staticFile("brand/reset-logo-white.png")}
          style={{ width: 180, marginTop: 18, opacity: lg }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const NflAd: React.FC = () => (
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
    {edit.cards.map((c) => (
      <Sequence key={c.from} from={c.from} durationInFrames={c.to - c.from}>
        <Card c={c} />
      </Sequence>
    ))}
    <Sequence
      from={edit.badge.from}
      durationInFrames={edit.badge.to - edit.badge.from}
    >
      <Badge />
    </Sequence>
    <Sequence
      from={edit.trust.from}
      durationInFrames={edit.trust.to - edit.trust.from}
    >
      <Trust dur={edit.trust.to - edit.trust.from} />
    </Sequence>
    <Sequence from={edit.close.from}>
      <Close />
    </Sequence>
    <Audio src={staticFile("nfl/music.wav")} />
  </AbsoluteFill>
);
