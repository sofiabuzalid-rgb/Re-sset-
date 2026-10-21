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
import {
  COLORS,
  FONTS,
  LABELS,
  LOGO,
  MUSIC,
  SCAN,
  SHOTS,
  TITLE,
} from "./config";

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
  const dx =
    TITLE.direction *
    interpolate(
      f,
      TITLE.motion.map((m) => m[0]),
      TITLE.motion.map((m) => m[1]),
      clamp,
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

/** Instagram-style product tag: flat grey box, humanist italic, small caret on top pointing at the garment. */
const Label: React.FC<{
  text: string;
  from: number;
  pos: number[][];
  pop?: boolean;
}> = ({ text, from, pos, pop }) => {
  const local = useCurrentFrame();
  const f = local + from;
  const [, x, y] = [...pos].reverse().find((p) => f >= p[0]) ?? pos[0];
  const p = pop
    ? interpolate(local, [0, 4], [0, 1], { ...clamp, easing: easeOut })
    : 1; // tags pop as the scan line hits them
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * p})`,
        opacity: p,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: -9,
          marginLeft: -10,
          width: 0,
          height: 0,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderBottom: `10px solid ${COLORS.labelBg}`,
        }}
      />
      <div
        style={{
          background: COLORS.labelBg,
          borderRadius: 9,
          padding: "6px 22px 8px",
          fontFamily: FONTS.label.family,
          fontStyle: "italic",
          fontWeight: FONTS.label.weight,
          fontSize: 36,
          color: COLORS.labelText,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Outfit scanner: viewfinder brackets on "can I please", a glowing line sweeping down on "scan your outfit", out on "I guess so". */
const Scanner: React.FC = () => {
  const f = useCurrentFrame();
  const { x, y, w, h } = SCAN.box;
  const inP = interpolate(f, [SCAN.bracketsIn, SCAN.bracketsIn + 7], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const outP = interpolate(f, SCAN.out, [1, 0], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const blink = f >= SCAN.out[0] - 6 && f < SCAN.out[0] - 3 ? 0.35 : 1; // brackets blink once: "done"
  const sweep = interpolate(f, SCAN.sweep, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const lineY = y + sweep * h;
  const sweeping = f >= SCAN.sweep[0] && f <= SCAN.sweep[1] + 2;
  const L = 78;
  const T = 8;
  const corner = (cx: number, cy: number, sx: number, sy: number) => (
    <div
      key={`${cx}-${cy}`}
      style={{
        position: "absolute",
        left: sx > 0 ? cx : cx - L,
        top: sy > 0 ? cy : cy - L,
        width: L,
        height: L,
        borderColor: COLORS.scan,
        borderStyle: "solid",
        borderWidth: 0,
        [sy > 0 ? "borderTopWidth" : "borderBottomWidth"]: T,
        [sx > 0 ? "borderLeftWidth" : "borderRightWidth"]: T,
        borderRadius: 4,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35)) drop-shadow(0 0 10px rgba(236,150,196,0.9))",
      }}
    />
  );
  const grow = 1.08 - 0.08 * inP;
  return (
    <AbsoluteFill style={{ opacity: inP * outP }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${grow})`,
          transformOrigin: `${x + w / 2}px ${y + h / 2}px`,
          opacity: blink,
        }}
      >
        {corner(x, y, 1, 1)}
        {corner(x + w, y, -1, 1)}
        {corner(x, y + h, 1, -1)}
        {corner(x + w, y + h, -1, -1)}
      </div>
      {sweeping && (
        <>
          {/* scanned area: soft pink wash + fine scan lines */}
          <div
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: lineY - y,
              background:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.10) 0 2px, transparent 2px 7px), rgba(246,215,227,0.10)",
            }}
          />
          {/* trail */}
          <div
            style={{
              position: "absolute",
              left: x,
              top: lineY - 260,
              width: w,
              height: 260,
              background:
                "linear-gradient(180deg, rgba(246,215,227,0) 0%, rgba(240,175,210,0.42) 100%)",
            }}
          />
          {/* the line */}
          <div
            style={{
              position: "absolute",
              left: x - 24,
              top: lineY - 3,
              width: w + 48,
              height: 6,
              borderRadius: 3,
              background: "#fff",
              boxShadow: `0 0 14px 4px ${COLORS.scanGlow}, 0 0 44px 12px rgba(246,215,227,0.8)`,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};

export const Recreacion: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#d9d6d2" }}>
    {SHOTS.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.frames}>
        <Shot s={s} />
      </Sequence>
    ))}
    <Sequence durationInFrames={TITLE.motion[TITLE.motion.length - 1][0] + 1}>
      <Title />
    </Sequence>
    <Scanner />
    {LABELS.map((l) => {
      // scan tags appear the frame the line reaches their y
      const from =
        "scan" in l && l.scan
          ? Math.round(
              SCAN.sweep[0] +
                ((l.pos[0][2] - SCAN.box.y) / SCAN.box.h) *
                  (SCAN.sweep[1] - SCAN.sweep[0]),
            )
          : l.from;
      return (
        <Sequence
          key={`${l.text}-${l.from}-${l.pos[0][2]}`}
          from={from}
          durationInFrames={l.to - from}
        >
          <Label
            text={l.text}
            from={from}
            pos={l.pos}
            pop={"scan" in l && !!l.scan}
          />
        </Sequence>
      );
    })}
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
