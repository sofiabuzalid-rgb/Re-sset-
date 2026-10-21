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

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Bebas Neue", url: staticFile("fonts/BebasNeue-Regular.woff2"), weight: "400" });
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const DISPLAY = '"Bebas Neue", Gotham, Montserrat, sans-serif';
const LIME = "#E2EC95"; // Pantone 386 U
const INK = "#141414";
const CREAM = "#F7EFE3";
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) => easeOut(Math.min(1, Math.max(0, (f - a) / d)));

/* eslint-disable @typescript-eslint/no-explicit-any */
export const REGALO_TOTAL = edit.total;

/** 2x2 grid: the four Christmas designs at once, each a real clip, with thin cream gutters. */
const Grid: React.FC<{ l: any }> = ({ l }) => {
  const f = useCurrentFrame();
  const G = 8;
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      {["a", "b", "c", "d"].map((k, i) => {
        const p = ramp(f, i * 3, 10);
        return (
          <div key={k} style={{ position: "absolute", left: (i % 2) * (540 + G / 2), top: Math.floor(i / 2) * (960 + G / 2), width: 540 - G / 2, height: 960 - G / 2, overflow: "hidden", opacity: p }}>
            <OffthreadVideo muted src={staticFile(`regalo/${l.id}${k}.mp4`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.06 - 0.06 * p})` }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Layer: React.FC<{ l: any }> = ({ l }) => {
  const f = useCurrentFrame();
  if (l.grid) return <Grid l={l} />;
  const push = l.push ?? [1, 1];
  const z = push[0] + (push[1] - push[0]) * Easing.inOut(Easing.quad)(Math.min(1, f / l.frames));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo muted src={staticFile(`regalo/${l.id}.mp4`)} style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: "50% 40%" }} />
    </AbsoluteFill>
  );
};

/** Her real words, max two lines, words highlighted only where she says them. */
const Sub: React.FC<{ s: any }> = ({ s }) => {
  const f = useCurrentFrame();
  const dur = s.to - s.from;
  const p = ramp(f, 0, 6);
  const o = interpolate(f, [dur - 3, dur], [1, 0], clamp);
  const words: string[] = s.text.split(" ");
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: s.y ?? 300, display: "flex", justifyContent: "center", opacity: p * o }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 54,
          lineHeight: 1.18,
          textAlign: "center",
          color: "#fff",
          maxWidth: 900,
          transform: `translateY(${(1 - p) * 14}px)`,
          textShadow: "0 1px 2px rgba(0,0,0,0.4)",
          background: "rgba(20,20,20,0.42)",
          borderRadius: 18,
          padding: "10px 26px 12px",
        }}
      >
        {words.map((w, i) => (
          <span key={i} style={{ color: s.hl.includes(w) ? LIME : "#fff" }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

const Word: React.FC<{ f: number; at: number; children: React.ReactNode; style: React.CSSProperties }> = ({ f, at, children, style }) => {
  const p = ramp(f, at, 7);
  return (
    <div style={{ overflow: "hidden", paddingTop: 10, marginTop: -10 }}>
      <div style={{ transform: `translateY(${(1 - p) * 100}%)`, ...style }}>{children}</div>
    </div>
  );
};

const big: React.CSSProperties = { fontFamily: SANS, fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.015em", color: INK, textAlign: "center" };

const Hero: React.FC<{ t: any; f: number }> = ({ t, f }) => (
  <div style={t.on === "grid" ? { position: "absolute", top: 830, left: 170, right: 170, background: CREAM, borderRadius: 10, padding: "26px 0 22px", boxShadow: "0 18px 50px rgba(0,0,0,0.25)" } : { position: "absolute", top: 160, left: 40, right: 40 }}>
    {t.lines.map((l: string, i: number) => (
      <Word key={i} f={f} at={i * 5} style={{ ...big, fontSize: t.size }}>
        {l.split(" ").map((w, k, arr) => (
          <React.Fragment key={k}>
            {t.hl === w ? <span style={{ background: LIME, padding: "0 0.14em" }}>{w}</span> : w}
            {k < arr.length - 1 ? " " : ""}
          </React.Fragment>
        ))}
      </Word>
    ))}
  </div>
);

const Tags: React.FC<{ t: any; f: number }> = ({ t, f }) => (
  <>
    {t.tags.map((g: { text: string; x: number; y: number }, i: number) => {
      const p = ramp(f, 4 + i * 5, 10);
      return (
        <div key={g.text} style={{ position: "absolute", left: g.x - 130, width: 260, top: g.y, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
          <div style={{ display: "inline-block", fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.24em", color: "#fff", background: INK, padding: "9px 14px 9px 21px", borderRadius: 4 }}>{g.text}</div>
          <div style={{ width: 2, height: 40 * p, background: INK, margin: "0 auto" }} />
        </div>
      );
    })}
  </>
);

const Price: React.FC<{ t: any; f: number }> = ({ t, f }) => (
  <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 90 }}>
    {t.items.map(([who, v]: string[], i: number) => {
      const p = ramp(f, i * 6, 10);
      const slam = interpolate(f - i * 6, [0, 6], [1.22, 1], { ...clamp, easing: easeOut });
      return (
        <div key={who} style={{ textAlign: "center", opacity: p }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: "0.3em", color: INK, paddingLeft: "0.3em" }}>{who}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 176, lineHeight: 0.95, color: INK, transform: `scale(${slam})` }}>{v}</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: "0.3em", color: INK, opacity: 0.7, paddingLeft: "0.3em" }}>MXN</div>
        </div>
      );
    })}
  </div>
);

/** Close: the real RE:SET wall is already in frame, so only the model name she says ("Soft Winter") is added. */
/** Close over the 2x2 of all designs: official logo + one CTA on a cream card at the grid's centre. */
const End: React.FC<{ t: any; f: number }> = ({ t, f }) => {
  const p = ramp(f, 4, 12);
  return (
    <div style={{ position: "absolute", top: 810, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: p }}>
      <div style={{ background: CREAM, borderRadius: 10, padding: "34px 64px 30px", textAlign: "center", boxShadow: "0 18px 50px rgba(0,0,0,0.25)", transform: `scale(${0.94 + 0.06 * p})` }}>
        <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 300 }} />
        <div style={{ marginTop: 18, fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: "0.32em", color: INK, paddingLeft: "0.32em" }}>{t.cta}</div>
      </div>
    </div>
  );
};

const TextView: React.FC<{ t: any }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from + 1;
  const o = t.type === "end" ? 1 : interpolate(f, [dur - 3, dur], [1, 0], clamp);
  const C: Record<string, React.FC<{ t: any; f: number }>> = { hero: Hero, tags: Tags, price: Price, end: End };
  const V = C[t.type];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <V t={t} f={f} />
    </AbsoluteFill>
  );
};

export const RegaloAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {edit.layers.map((l: any) => (
      <Sequence key={l.id} from={l.from} durationInFrames={l.frames}>
        <Layer l={l} />
      </Sequence>
    ))}
    {/* light wash behind the top text zone (dark type) and a soft shade under the subtitles */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(240,237,232,0.55) 0%, rgba(240,237,232,0.3) 16%, rgba(240,237,232,0) 26%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.25) 100%)" }} />
    {edit.texts.map((t: any, i: number) => (
      <Sequence key={i} from={t.from} durationInFrames={t.to - t.from + 1}>
        <TextView t={t} />
      </Sequence>
    ))}
    {edit.subs.map((s: any, i: number) => (
      <Sequence key={`s${i}`} from={s.from} durationInFrames={s.to - s.from}>
        <Sub s={s} />
      </Sequence>
    ))}
    <Audio src={staticFile("regalo/mix.wav")} />
  </AbsoluteFill>
);
