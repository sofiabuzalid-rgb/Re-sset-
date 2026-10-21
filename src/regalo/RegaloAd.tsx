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

const Layer: React.FC<{ l: any }> = ({ l }) => {
  const f = useCurrentFrame();
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
    <div style={{ position: "absolute", left: 70, right: 70, top: 300, display: "flex", justifyContent: "center", opacity: p * o }}>
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
  <div style={{ position: "absolute", top: 160, left: 40, right: 40 }}>
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

const End: React.FC<{ t: any; f: number }> = ({ t, f }) => (
  <div style={{ position: "absolute", top: 150, left: 30, right: 30, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ opacity: ramp(f, 0, 10), transform: `translateY(${(1 - ramp(f, 0, 10)) * 14}px)` }}>
      <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 280 }} />
    </div>
    <div style={{ marginTop: 16, fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: "0.3em", color: INK, paddingLeft: "0.3em", opacity: ramp(f, 8, 10) }}>{t.cta} →</div>
  </div>
);

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
