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
import ad02 from "./buenfin15-ad02.json";
import ad02Subs from "./buenfin15-ad02.subs.json";

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
// Bebas Neue is the RE:SET logotype face: condensed capitals that read at a glance. Montserrat for small labels.
const DISPLAY = '"Bebas Neue", Montserrat, sans-serif';
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const RED = "#E3202B";
const WHITE = "#FFFFFF";
const INK = "#111111";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// heavy outline + drop so white capitals hold on the white wall
const OUTLINE = [
  ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
    const r = (a * Math.PI) / 180;
    return `${(Math.cos(r) * 4).toFixed(1)}px ${(Math.sin(r) * 4).toFixed(1)}px 0 #000`;
  }),
  "0 8px 18px rgba(0,0,0,0.6)",
].join(", ");

type Shot = { id: string; frames: number; zoom: number[]; focus: number[] };
type Text = { from: number; to: number; kind: string; lines: string[] };
type Edit = {
  shots: Shot[];
  texts: Text[];
  badge: { text: string; ranges: number[][] };
  subtitleTop: number;
  punch?: number[];
};
type Sub = { from: number; to: number; text: string };

export const BUENFIN15_ADS = {
  ad02: { edit: ad02 as unknown as Edit, subs: ad02Subs as Sub[], dir: "buenfin15-ad02" },
};
export type BuenFin15AdId = keyof typeof BUENFIN15_ADS;
export const buenFin15Total = (ad: BuenFin15AdId) =>
  BUENFIN15_ADS[ad].edit.shots.reduce((n, s) => n + s.frames, 0);

/** Snap in: overshoots slightly and settles in 5 frames. */
const snap = (f: number, a: number) => {
  const t = Math.min(1, Math.max(0, (f - a) / 5));
  return { o: Math.min(1, t * 2.5), s: 1.18 - 0.18 * Easing.out(Easing.back(2))(t) };
};

const ShotView: React.FC<{ dir: string; s: Shot & { from: number }; punch: number[] }> = ({ dir, s, punch }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  let z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  for (const at of punch) {
    const d = s.from + f - at;
    if (d >= 0 && d < 20) z *= 1 + 0.06 * Math.exp(-d / 4); // a quick push on the key word
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(`${dir}/${s.id}.mp4`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${z})`,
          transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Caption words: capitals; *key words* sit in a red box. */
const Words: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <>
    {text.split(/(\*[^*]+\*)/).filter(Boolean).map((part, i) =>
      part.startsWith("*") ? (
        <span
          key={i}
          style={{
            display: "inline-block",
            background: RED,
            color: WHITE,
            padding: `0 ${size * 0.14}px`,
            margin: `0 ${size * 0.06}px`,
            borderRadius: 6,
            transform: "rotate(-2deg)",
            textShadow: "none",
            boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
          }}
        >
          {part.slice(1, -1).toUpperCase()}
        </span>
      ) : (
        <span key={i}>{part.toUpperCase()}</span>
      ),
    )}
  </>
);

/** Ilana's words, literally, set in capitals: one short phrase at a time, snapping in on her rhythm. */
const Subtitle: React.FC<{ text: string; top: number }> = ({ text, top }) => {
  const f = useCurrentFrame();
  const { o, s } = snap(f, 0);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          maxWidth: 960,
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: 104,
          lineHeight: 1.0,
          letterSpacing: "0.01em",
          color: WHITE,
          textShadow: OUTLINE,
          transform: `scale(${s})`,
        }}
      >
        <Words text={text.replace(/[.,]+$/, "")} size={104} />
      </div>
    </div>
  );
};

const Stack: React.FC<{
  lines: { text: string; size: number; red?: boolean; chip?: boolean; dark?: boolean; at: number }[];
  top: number;
}> = ({
  lines,
  top,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {lines.map((l) => {
        const { o, s } = snap(f, l.at);
        return (
          <div
            key={l.text}
            style={{
              opacity: o,
              transform: `scale(${s}) rotate(${l.red ? -2 : 0}deg)`,
              marginTop: l.chip ? 14 : 2,
              padding: l.red || l.chip || l.dark ? `2px ${l.size * 0.18}px 0` : 0,
              background: l.red ? RED : l.chip ? WHITE : l.dark ? INK : "transparent",
              color: l.chip ? INK : WHITE,
              borderRadius: 8,
              fontFamily: l.chip ? SANS : DISPLAY,
              fontWeight: l.chip ? 900 : 400,
              fontSize: l.size,
              lineHeight: l.chip ? 1.5 : 0.98,
              letterSpacing: l.chip ? "0.06em" : "0.01em",
              textShadow: l.red || l.chip || l.dark ? "none" : OUTLINE,
              boxShadow: l.red || l.chip || l.dark ? "0 8px 20px rgba(0,0,0,0.35)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

const Graphic: React.FC<{ t: Text }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from;
  const out = t.kind === "end" ? 1 : interpolate(f, [dur - 5, dur], [1, 0], clamp);
  if (t.kind === "hook")
    return (
      <AbsoluteFill style={{ opacity: out }}>
        <Stack
          top={250}
          lines={[
            { text: t.lines[0], size: 108, dark: true, at: 0 },
            { text: t.lines[1], size: 108, dark: true, at: 2 },
            { text: t.lines[2], size: 150, red: true, at: 4 },
            { text: t.lines[3], size: 44, chip: true, at: 8 },
          ]}
        />
      </AbsoluteFill>
    );
  if (t.kind === "collections")
    return (
      <AbsoluteFill style={{ opacity: out }}>
        <Stack
          top={300}
          lines={[
            { text: t.lines[0], size: 38, chip: true, at: 0 },
            { text: t.lines[1], size: 104, red: true, at: 8 },
            { text: t.lines[2], size: 104, red: true, at: 18 },
            { text: t.lines[3], size: 104, red: true, at: 28 },
          ]}
        />
      </AbsoluteFill>
    );
  // end: logo + BUEN FIN, giant red 15% OFF, the scope, the invitation
  const logo = snap(f, 0);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 38%, rgba(0,0,0,0) 55%)", opacity: logo.o }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 240, display: "flex", justifyContent: "center", opacity: logo.o }}>
        <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 320, transform: `scale(${logo.s})` }} />
      </div>
      <Stack
        top={390}
        lines={[
          { text: t.lines[0], size: 120, at: 3 },
          { text: t.lines[1], size: 210, red: true, at: 7 },
          { text: t.lines[2], size: 84, at: 11 },
          { text: t.lines[3], size: 44, chip: true, at: 16 },
        ]}
      />
    </AbsoluteFill>
  );
};

const Badge: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const { o, s } = snap(f, 0);
  const out = interpolate(f, [dur - 4, dur], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", justifyContent: "center", opacity: o * out }}>
      <div
        style={{
          padding: "4px 26px 0",
          borderRadius: 8,
          background: RED,
          color: WHITE,
          fontFamily: DISPLAY,
          fontSize: 58,
          letterSpacing: "0.04em",
          transform: `scale(${s}) rotate(-2deg)`,
          boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const BuenFin15Ad: React.FC<{ ad: BuenFin15AdId }> = ({ ad }) => {
  const { edit, subs, dir } = BUENFIN15_ADS[ad];
  let t = 0;
  const shots = edit.shots.map((s) => {
    const o = { ...s, from: t };
    t += s.frames;
    return o;
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {shots.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={15}>
          <ShotView dir={dir} s={s} punch={edit.punch ?? []} />
        </Sequence>
      ))}
      {edit.badge.ranges.map(([a, b]) => (
        <Sequence key={a} from={a} durationInFrames={b - a}>
          <Badge text={edit.badge.text} dur={b - a} />
        </Sequence>
      ))}
      {edit.texts.map((g) => (
        <Sequence key={g.from} from={g.from} durationInFrames={g.to - g.from}>
          <Graphic t={g} />
        </Sequence>
      ))}
      {subs.map((s) => (
        <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
          <Subtitle text={s.text} top={edit.subtitleTop} />
        </Sequence>
      ))}
      <Audio src={staticFile(`${dir}/mix.wav`)} />
    </AbsoluteFill>
  );
};
