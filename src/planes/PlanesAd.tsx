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

/*
 * META ADS — "Planes cancelados, pijama puesta" (red/white Christmas set).
 * Shots, her voice, ad copy, subtitles and store data live in src/planes/edit.json;
 * media from scripts/build-planes-media.py. Copy lines are ad text, subtitles are her own words.
 */

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, 'Noto Color Emoji', sans-serif";
const INK = "#1A1416";
const RED = "#C3202F"; // sampled from the pajama print
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
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
export const PLANES_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;
const closeFrom = shots.find((s) => s.id === "close")!.from;

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#fff" }}>
      <OffthreadVideo
        muted
        src={staticFile(`planes/${s.id}.mp4`)}
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

/** Ad copy: stacked white tabs in the upper third, never over her face or the garment. */
const Copy: React.FC<{ lines: string[]; dur: number }> = ({ lines, dur }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 5, dur], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: out }}>
      {lines.map((l, i) => {
        const k = ramp(f, i * 4, 9);
        return (
          <div
            key={l}
            style={{
              background: "rgba(255,255,255,0.95)",
              padding: "12px 26px 14px",
              borderRadius: 10,
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 54,
              letterSpacing: "-0.01em",
              color: INK,
              opacity: k,
              transform: `translateY(${(1 - k) * 18}px) scale(${0.96 + 0.04 * k})`,
              boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};

/** Verbatim subtitle of her own words. */
const Sub: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const o = Math.min(ramp(f, 0, 4), interpolate(f, [dur - 3, dur], [1, 0], clamp));
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1330, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 48,
          lineHeight: 1.18,
          textAlign: "center",
          color: "#fff",
          textShadow: "0 2px 14px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Where to buy: editorial card, stores revealed as she names them. */
const Stores: React.FC = () => {
  const f = useCurrentFrame();
  const st = edit.stores;
  const dur = st.to - st.from;
  const k = ramp(f, 0, 12);
  const out = interpolate(f, [dur - 6, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: `rgba(20,14,14,${0.32 * k})` }} />
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 300,
          background: "rgba(255,255,255,0.96)",
          borderRadius: 18,
          padding: "46px 56px 40px",
          opacity: k,
          transform: `translateY(${(1 - k) * 24}px)`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 48, color: INK, letterSpacing: "-0.01em", textAlign: "center" }}>{st.title}</div>
        <div style={{ width: 90, height: 3, background: RED, margin: "24px auto 18px" }} />
        {st.items.map((it, i) => {
          const a = ramp(f, it.at - st.from, 10);
          return (
            <div
              key={it.name}
              style={{
                padding: "22px 0 20px",
                borderTop: i === 0 ? "none" : "1.5px solid rgba(26,20,22,0.12)",
                textAlign: "center",
                opacity: 0.18 + 0.82 * a,
                transform: `translateY(${(1 - a) * 14}px)`,
              }}
            >
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, letterSpacing: "0.06em", color: i === 2 ? RED : INK }}>{it.name}</div>
              <div style={{ marginTop: 6, fontFamily: SANS, fontWeight: i === 2 ? 700 : 500, fontSize: 38, color: INK }}>{it.detail}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 2, 14);
  const l = ramp(f, 10, 14);
  const c = ramp(f, 20, 14);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.38) 100%)", opacity: k }} />
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 1010,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          padding: "40px 48px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: k,
          transform: `translateY(${(1 - k) * 20}px)`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
        }}
      >
        <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 330, opacity: l }} />
        <div style={{ marginTop: 28, fontFamily: SANS, fontWeight: 600, fontSize: 40, lineHeight: 1.2, textAlign: "center", color: INK, opacity: l }}>
          {edit.close.line}
        </div>
        <div
          style={{
            marginTop: 30,
            background: RED,
            color: "#fff",
            borderRadius: 999,
            padding: "18px 40px 20px",
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 36,
            opacity: c,
            transform: `scale(${0.94 + 0.06 * c})`,
          }}
        >
          {edit.close.cta}
        </div>
        <div style={{ marginTop: 16, fontFamily: SANS, fontWeight: 600, fontSize: 32, letterSpacing: "0.04em", color: INK, opacity: c }}>{edit.close.url}</div>
      </div>
    </AbsoluteFill>
  );
};

export const PlanesAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fff" }}>
    {shots.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
        <ShotView s={s} />
      </Sequence>
    ))}
    {edit.copy.map((c) => (
      <Sequence key={c.from} from={c.from} durationInFrames={c.to - c.from}>
        <Copy lines={c.lines} dur={c.to - c.from} />
      </Sequence>
    ))}
    <Sequence from={edit.stores.from} durationInFrames={edit.stores.to - edit.stores.from}>
      <Stores />
    </Sequence>
    {edit.subs.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
        <Sub text={s.text} dur={s.to - s.from} />
      </Sequence>
    ))}
    <Sequence from={closeFrom}>
      <Close />
    </Sequence>
    <Audio src={staticFile("planes/mix.wav")} />
  </AbsoluteFill>
);
