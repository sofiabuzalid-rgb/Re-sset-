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
import { COLORS, FONTS, LABELS, LOGO, MUSIC, SHOTS, TITLE } from "./config";

loadFont({
  family: FONTS.title.family,
  url: staticFile(FONTS.title.file),
  weight: "100 900",
});
loadFont({
  family: FONTS.label.family,
  url: staticFile(FONTS.label.file),
  weight: String(FONTS.label.weight),
  style: "italic",
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

type Shot = (typeof SHOTS)[number];

const Shot: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const fp = "fastPush" in s ? s.fastPush : undefined;
  const ks = s.zoom;
  let z = ks[ks.length - 1][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [a, za] = ks[i];
    const [b, zb] = ks[i + 1];
    if (f >= a && f <= b)
      z = interpolate(f, [a, b], [za, zb], {
        ...clamp,
        easing: fp && a === fp[0] ? easeOut : undefined,
      });
  }
  const os = s.origin;
  const ox = interpolate(
    f,
    os.map((o) => o[0]),
    os.map((o) => o[1]),
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );
  const oy = interpolate(
    f,
    os.map((o) => o[0]),
    os.map((o) => o[2]),
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        muted
        src={staticFile(s.src)}
        startFrom={s.startFrom}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${z})`,
          transformOrigin: `${ox}% ${oy}%`,
        }}
      />
    </AbsoluteFill>
  );
};

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const dx = interpolate(
    f,
    [TITLE.holdUntil, TITLE.exitEnd],
    [0, TITLE.exitDx],
    { ...clamp, easing: Easing.in(Easing.quad) },
  );
  return (
    <AbsoluteFill style={{ transform: `translateX(${dx}px)` }}>
      {TITLE.lines.map((l, i) => (
        <div
          key={l}
          style={{
            position: "absolute",
            top: TITLE.tops[i],
            left: TITLE.x - 540,
            width: 1080,
            textAlign: "center",
            fontFamily: FONTS.title.family,
            fontWeight: FONTS.title.weight,
            fontVariationSettings: FONTS.title.variation,
            fontSize: TITLE.size,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            color: COLORS.title,
          }}
        >
          {l}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Label: React.FC<{ text: string; from: number; to: number; pos: number[][] }> = ({
  text,
  from,
  pos,
}) => {
  const f = useCurrentFrame() + from;
  const [, x, y] = [...pos].reverse().find((p) => f >= p[0]) ?? pos[0];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%,-50%)",
        background: COLORS.labelBg,
        border: `1.5px solid ${COLORS.labelBorder}`,
        borderRadius: 10,
        padding: "7px 20px 8px",
        fontFamily: FONTS.label.family,
        fontStyle: "italic",
        fontWeight: FONTS.label.weight,
        fontSize: 34,
        letterSpacing: "0.005em",
        color: COLORS.labelText,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

export const Recreacion: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#d9d6d2" }}>
    {SHOTS.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.frames}>
        <Shot s={s} />
      </Sequence>
    ))}
    <Sequence durationInFrames={TITLE.exitEnd + 1}>
      <Title />
    </Sequence>
    {LABELS.map((l) => (
      <Sequence key={l.text} from={l.from} durationInFrames={l.to - l.from}>
        <Label {...l} />
      </Sequence>
    ))}
    {LOGO && (
      <Img
        src={staticFile(LOGO)}
        style={{
          position: "absolute",
          top: 120,
          left: 440,
          width: 200,
          opacity: 0.9,
        }}
      />
    )}
    {MUSIC && <Audio src={staticFile(MUSIC)} />}
  </AbsoluteFill>
);
