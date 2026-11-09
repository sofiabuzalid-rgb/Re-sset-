import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import ad01 from "./ad01.json";
import ad02 from "./ad02.json";

/*
 * RE:SET Smiley Pajamas (Happy Vibes Women) — OUTLET 25% OFF UGC ads.
 * Each ad = src/smiley/<ad>.json (shots, her voice, hook, verbatim subtitles, CTA) + media from
 * scripts/build-smiley-media.py. Ad copy is black/yellow blocks; her words are cream subtitles, so the two never mix.
 */

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const INK = "#111111";
const YELLOW = "#FFD21F"; // matched to the print
const CREAM = "#FFF8E8";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));

type Edit = typeof ad01;
const isOffer = (t: string) => /OFF/.test(t);

const makeSmileyAd = (edit: Edit, dir: string) => {
  type Shot = Edit["shots"][number] & { from: number };
  const shots: Shot[] = [];
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
  const total = t;
  const cta = shots[shots.length - 1];

  const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
    const f = useCurrentFrame();
    const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
    const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#fff" }}>
        <OffthreadVideo
          muted
          src={staticFile(`smiley/${dir}/${s.id}.mp4`)}
          style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%` }}
        />
      </AbsoluteFill>
    );
  };

  const Block: React.FC<{ text: string; size: number; k: number; offer?: boolean }> = ({ text, size, k, offer }) => (
    <div
      style={{
        background: offer ? YELLOW : INK,
        color: offer ? INK : "#fff",
        padding: `${size * 0.22}px ${size * 0.5}px ${size * 0.26}px`,
        borderRadius: 8,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: offer ? "0.06em" : "-0.005em",
        lineHeight: 1.12,
        textAlign: "center",
        maxWidth: 900,
        opacity: k,
        transform: `translateY(${(1 - k) * 14}px)`,
      }}
    >
      {text}
    </div>
  );

  /** Hook: product first (PIJAMAS RE:SET), offer second (OUTLET · 25% OFF), upper third only. */
  const Hook: React.FC<{ dur: number }> = ({ dur }) => {
    const f = useCurrentFrame();
    const h = edit.hook;
    const out = interpolate(f, [dur - 6, dur], [1, 0], clamp);
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: out }}>
        <Block text={h.kicker} size={38} k={ramp(f, 0, 6)} />
        <Block text={h.title} size={54} k={ramp(f, 3, 8)} />
        <div style={{ display: "flex", gap: 14 }}>
          {h.sub ? <Block text={h.sub} size={42} k={ramp(f, 10, 8)} /> : null}
          <Block text={h.badge} size={42} k={ramp(f, 6, 8)} offer />
        </div>
      </div>
    );
  };

  /** Verbatim subtitle: cream, max two lines, safe zone above the platform UI. */
  const Sub: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
    const f = useCurrentFrame();
    const o = Math.min(ramp(f, 0, 3), interpolate(f, [dur - 3, dur], [1, 0], clamp));
    return (
      <div style={{ position: "absolute", left: 100, right: 100, top: 1320, display: "flex", justifyContent: "center", opacity: o }}>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 50,
            lineHeight: 1.18,
            textAlign: "center",
            color: CREAM,
            background: "rgba(17,17,17,0.55)",
            borderRadius: 10,
            padding: "8px 22px 10px",
            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        >
          {text}
        </div>
      </div>
    );
  };

  const Cta: React.FC = () => {
    const f = useCurrentFrame();
    const c = edit.cta;
    const dim = ramp(f, 0, 10);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ background: `rgba(0,0,0,${0.22 * dim})` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: c.top, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          {c.lines.map((l, i) => (
            <Block key={l} text={l} size={isOffer(l) ? 92 : 64} k={ramp(f, 2 + i * 5, 9)} offer={isOffer(l)} />
          ))}
          <Block text={c.sub} size={isOffer(c.sub) ? 50 : 46} k={ramp(f, 12, 9)} offer={isOffer(c.sub)} />
          <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.6)", opacity: ramp(f, 18, 9) }}>
            {c.foot}
          </div>
        </div>
      </AbsoluteFill>
    );
  };

  const Component: React.FC = () => (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      {shots.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
          <ShotView s={s} />
        </Sequence>
      ))}
      <Sequence from={edit.hook.from} durationInFrames={edit.hook.to - edit.hook.from}>
        <Hook dur={edit.hook.to - edit.hook.from} />
      </Sequence>
      {edit.subs.map((s) => (
        <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
          <Sub text={s.text} dur={s.to - s.from} />
        </Sequence>
      ))}
      <Sequence from={cta.from}>
        <Cta />
      </Sequence>
      <Audio src={staticFile(`smiley/${dir}/mix.wav`)} />
    </AbsoluteFill>
  );

  return { Component, total };
};

const a1 = makeSmileyAd(ad01, "ad01");
const a2 = makeSmileyAd(ad02 as Edit, "ad02");
export const SmileyAd01 = a1.Component;
export const SMILEY_AD01_TOTAL = a1.total;
export const SmileyAd02 = a2.Component;
export const SMILEY_AD02_TOTAL = a2.total;
