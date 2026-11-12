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
 * RE:SET BUEN FIN 2026 · 15% OFF · AD01 promo directa.
 * Ilana's real takes only: shots, her voice, verbatim subtitles and the ad copy live in src/buenfin/edit.json;
 * media from scripts/build-buenfin-media.py. Palette: white, cream, soft black; the garments are the colour.
 */

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const INK = "#1C1A19"; // soft black
const CREAM = "#F7F1E6";
const IVORY = "#FFFBF2";
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
export const BUENFIN_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;
const ctaShot = shots[shots.length - 1];

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#fff" }}>
      <OffthreadVideo
        muted
        src={staticFile(`buenfin/${s.id}.mp4`)}
        style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%` }}
      />
    </AbsoluteFill>
  );
};

/** Hook: PIJAMAS / 15% OFF / BUEN FIN, readable from frame 0 (3-frame fade only), upper third. */
const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const k = ramp(f, 0, 3);
  const out = interpolate(f, [dur - 6, dur], [1, 0], clamp);
  const [a, b, c] = edit.hook.lines;
  const line = (t: string, size: number, dark: boolean, ls: string) => (
    <div style={{ background: dark ? INK : CREAM, color: dark ? CREAM : INK, padding: `${size * 0.16}px ${size * 0.42}px ${size * 0.2}px`, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: ls, lineHeight: 1 }}>
      {t}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 0, opacity: k * out }}>
      {line(a, 50, true, "0.32em")}
      {line(b, 128, false, "0.02em")}
      {line(c, 50, true, "0.32em")}
    </div>
  );
};

/** Discreet offer tag while she says the promo applies to everything. */
const Tag: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const o = Math.min(ramp(f, 0, 8), interpolate(f, [dur - 6, dur], [1, 0], clamp));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: "rgba(28,26,25,0.86)", color: CREAM, padding: "14px 30px 15px", borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: "0.12em" }}>
        {edit.tag.text}
      </div>
    </div>
  );
};

/** Verbatim subtitle. *text* = a phrase she actually says that matches the offer, set in bold, nothing louder. */
const Sub: React.FC<{ text: string; dur: number; top: number }> = ({ text, dur, top }) => {
  const f = useCurrentFrame();
  const o = Math.min(ramp(f, 0, 3), interpolate(f, [dur - 3, dur], [1, 0], clamp));
  const parts = text.split("*");
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 48,
          lineHeight: 1.2,
          textAlign: "center",
          color: IVORY,
          background: "rgba(20,18,17,0.48)",
          borderRadius: 10,
          padding: "8px 22px 10px",
          textShadow: "0 1px 3px rgba(0,0,0,0.35)",
        }}
      >
        {parts.map((p, i) => (
          <span key={i} style={i % 2 ? { fontWeight: 800 } : undefined}>
            {p}
          </span>
        ))}
      </div>
    </div>
  );
};

/** CTA: cream card over her and the rack, logo, offer, line. The pajamas stay visible above it. */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const k = ramp(f, 4, 12);
  const l = ramp(f, 10, 12);
  const c = ramp(f, 18, 12);
  return (
    <div style={{ position: "absolute", left: 130, right: 130, top: 250, background: "rgba(247,241,230,0.95)", borderRadius: 14, padding: "36px 40px 34px", display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `translateY(${(1 - k) * 16}px)`, boxShadow: "0 16px 40px rgba(0,0,0,0.18)" }}>
      <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 300, opacity: l }} />
      <div style={{ marginTop: 22, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: "0.3em", color: INK, opacity: l }}>{edit.cta.title}</div>
      <div style={{ marginTop: 14, background: INK, color: CREAM, padding: "12px 26px 14px", fontFamily: SANS, fontWeight: 800, fontSize: 38, letterSpacing: "0.04em", opacity: c }}>{edit.cta.offer}</div>
      <div style={{ marginTop: 16, fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: "0.18em", color: INK, opacity: c }}>{edit.cta.line}</div>
    </div>
  );
};

export const BuenFinAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fff" }}>
    {shots.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
        <ShotView s={s} />
      </Sequence>
    ))}
    <Sequence from={edit.hook.from} durationInFrames={edit.hook.to - edit.hook.from}>
      <Hook dur={edit.hook.to - edit.hook.from} />
    </Sequence>
    <Sequence from={edit.tag.from} durationInFrames={edit.tag.to - edit.tag.from}>
      <Tag dur={edit.tag.to - edit.tag.from} />
    </Sequence>
    {edit.subs.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
        <Sub text={s.text} dur={s.to - s.from} top={s.from >= ctaShot.from ? 1450 : 1320} />
      </Sequence>
    ))}
    <Sequence from={ctaShot.from}>
      <Cta />
    </Sequence>
    <Audio src={staticFile("buenfin/mix.wav")} />
  </AbsoluteFill>
);
