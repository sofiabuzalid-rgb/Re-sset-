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
import { COLORS, FONTS, MUSIC, SHOTS, TEXT } from "./config";

loadFont({
  family: FONTS.serif,
  url: staticFile("fonts/Cormorant-500.woff2"),
  weight: "500",
});
loadFont({
  family: FONTS.serif,
  url: staticFile("fonts/Cormorant-500-italic.woff2"),
  weight: "500",
  style: "italic",
});
loadFont({
  family: FONTS.sans,
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const ease = Easing.inOut(Easing.cubic);

type Shot = (typeof SHOTS)[number];

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const z = interpolate(
    f,
    s.zoom.map((k) => k[0]),
    s.zoom.map((k) => k[1]),
    { ...clamp, easing: ease },
  );
  const ox = interpolate(
    f,
    s.origin.map((k) => k[0]),
    s.origin.map((k) => k[1]),
    { ...clamp, easing: ease },
  );
  const oy = interpolate(
    f,
    s.origin.map((k) => k[0]),
    s.origin.map((k) => k[2]),
    { ...clamp, easing: ease },
  );
  const video: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `scale(${z})`,
    transformOrigin: `${ox}% ${oy}%`,
  };
  const d = "dodge" in s ? s.dodge : undefined;
  let mask: string | undefined;
  let dodgeOn = 0;
  if (d) {
    const dx = interpolate(
      f,
      d.path.map((k) => k[0]),
      d.path.map((k) => k[1]),
      clamp,
    );
    const dy = interpolate(
      f,
      d.path.map((k) => k[0]),
      d.path.map((k) => k[2]),
      clamp,
    );
    mask = `radial-gradient(ellipse ${d.rx}px ${d.ry}px at ${dx}px ${dy}px, #000 0%, rgba(0,0,0,0.75) 45%, transparent 100%)`;
    dodgeOn = interpolate(f, [d.from, d.from + 8], [0, 1], clamp);
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: COLORS.light }}>
      <OffthreadVideo
        muted
        src={staticFile(s.src)}
        startFrom={s.startFrom}
        style={video}
      />
      {d && (
        // conventional dodge: the same frame, exposure lifted, feathered over the phone's shadow only
        <AbsoluteFill
          style={{ WebkitMaskImage: mask, maskImage: mask, opacity: dodgeOn }}
        >
          <OffthreadVideo
            muted
            src={staticFile(s.src)}
            startFrom={s.startFrom}
            style={{ ...video, filter: `brightness(${d.gain}) contrast(0.94)` }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** Discreet sign-off over the white wall of the closing shot: official logo + small tracked CTA, never over the prints. */
const SignOff: React.FC = () => {
  const f = useCurrentFrame();
  const b = interpolate(f, [TEXT.brand.from, TEXT.brand.from + 14], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const c = interpolate(f, [TEXT.cta.from, TEXT.cta.from + 14], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: TEXT.brand.top,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Img
        src={staticFile(TEXT.brand.logo)}
        style={{
          width: 310,
          opacity: b * 0.92,
          transform: `translateY(${(1 - b) * 18}px)`,
        }}
      />
      <div
        style={{
          marginTop: 26,
          opacity: c,
          transform: `translateY(${(1 - c) * 14}px)`,
          fontFamily: FONTS.sans,
          fontWeight: 500,
          fontSize: 28,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: COLORS.ink,
          paddingLeft: "0.22em",
        }}
      >
        {TEXT.cta.text}
      </div>
    </div>
  );
};

export const Cajon: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.light }}>
    {SHOTS.map((s) => (
      <Sequence
        key={s.name}
        name={s.name}
        from={s.from}
        durationInFrames={s.frames}
      >
        <ShotView s={s} />
      </Sequence>
    ))}
    <Sequence
      from={TEXT.line1.from}
      durationInFrames={TEXT.textOut - TEXT.line1.from}
    >
      <LineStack />
    </Sequence>
    <SignOff />
    <Audio src={staticFile(MUSIC)} />
  </AbsoluteFill>
);

/** Line 1 alone until the accent, then it lifts to make room for line 2 underneath. */
const LineStack: React.FC = () => {
  const f = useCurrentFrame() + TEXT.line1.from;
  const lift = interpolate(f, [TEXT.line2.from, TEXT.line2.from + 10], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const out = interpolate(f, [TEXT.textOut - 6, TEXT.textOut], [1, 0], clamp);
  const p1 = interpolate(f, [TEXT.line1.from, TEXT.line1.from + 12], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const p2 = interpolate(f, [TEXT.line2.from, TEXT.line2.from + 12], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const base: React.CSSProperties = {
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: 86,
    whiteSpace: "nowrap",
    lineHeight: 1.08,
    letterSpacing: "-0.005em",
    color: COLORS.ink,
  };
  return (
    <div
      style={{
        position: "absolute",
        top: TEXT.line1.top - 52 * lift,
        left: 30,
        right: 30,
        textAlign: "center",
        opacity: out,
      }}
    >
      <div
        style={{
          ...base,
          opacity: p1,
          transform: `translateY(${(1 - p1) * 24}px)`,
          filter: `blur(${(1 - p1) * 6}px)`,
        }}
      >
        {TEXT.line1.text}
      </div>
      <div
        style={{
          ...base,
          marginTop: 6,
          opacity: p2,
          transform: `translateY(${(1 - p2) * 24}px)`,
          filter: `blur(${(1 - p2) * 6}px)`,
        }}
      >
        {TEXT.line2.text}
        <span
          style={{
            fontStyle: "normal",
            fontSize: 60,
            marginLeft: 12,
            verticalAlign: "6px",
          }}
        >
          {TEXT.line2.emoji}
        </span>
      </div>
    </div>
  );
};
