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
const INK = "#141414";
const LIME = "#E2EC95"; // Pantone 386 U, used sparingly
const SHADOW = "0 2px 6px rgba(0,0,0,0.35), 0 6px 30px rgba(0,0,0,0.25)";
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) => easeOut(Math.min(1, Math.max(0, (f - a) / d)));

/* eslint-disable @typescript-eslint/no-explicit-any */
type Shot = (typeof edit.shots)[number] & { snap?: number; whip?: number; push?: number[] };
type Text = any;
export const FAMILY_TOTAL = edit.total;

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  let z = 1;
  let x = 0;
  let blur = 0;
  if (s.snap) z = interpolate(f, [0, 7], [1.16, 1.0], { ...clamp, easing: easeOut }); // punch in on frame 1
  if (s.whip) {
    // motion-motivated entry: slides in from the right with a short motion blur
    x = interpolate(f, [0, 6], [180, 0], { ...clamp, easing: easeOut });
    blur = interpolate(f, [0, 6], [14, 0], clamp);
  }
  if (s.push) z *= s.push[0] + (s.push[1] - s.push[0]) * Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  if (!s.snap && !s.whip && !s.push) z = interpolate(f, [0, 4], [1.025, 1], clamp); // tiny settle on beat cuts
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#e9e5df" }}>
      <OffthreadVideo
        muted
        src={staticFile(`family/${s.id}.mp4`)}
        style={{ width: "100%", height: "100%", transform: `translateX(${x}px) scale(${z})`, filter: blur ? `blur(${blur}px)` : undefined }}
      />
    </AbsoluteFill>
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

const big: React.CSSProperties = { fontFamily: SANS, fontWeight: 900, fontSize: 96, lineHeight: 1.02, letterSpacing: "-0.015em", color: INK, textAlign: "center" };

const Hero: React.FC<{ t: Text; f: number }> = ({ t, f }) => (
  <>
    <div style={{ position: "absolute", top: 160, left: 40, right: 40 }}>
      {t.lines.map((l: string, i: number) => (
        <Word key={i} f={f} at={i * 5} style={{ ...big, fontSize: t.size ?? 96 }}>
          {l.split(" ").map((w, k, arr) => (
            <React.Fragment key={k}>
              {t.hl === w ? <span style={{ background: LIME, padding: "0 0.14em" }}>{w}</span> : w}
              {k < arr.length - 1 ? " " : ""}
            </React.Fragment>
          ))}
        </Word>
      ))}
    </div>
    {(t.tags ?? []).map((g: { text: string; x: number; y: number }, i: number) => {
      const p = ramp(f, 12 + i * 6, 10);
      return (
        <div key={g.text} style={{ position: "absolute", left: g.x - 130, width: 260, top: g.y, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
          <div style={{ display: "inline-block", fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.24em", color: "#fff", background: INK, padding: "9px 14px 9px 21px", borderRadius: 4 }}>{g.text}</div>
          <div style={{ width: 2, height: 40 * p, background: INK, margin: "0 auto" }} />
        </div>
      );
    })}
  </>
);

const Price: React.FC<{ t: Text; f: number }> = ({ t, f }) => (
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

const End: React.FC<{ t: Text; f: number }> = ({ t, f }) => (
  <div style={{ position: "absolute", top: 140, left: 30, right: 30, display: "flex", flexDirection: "column", alignItems: "center" }}>
    {t.lines.map((l: string, i: number) => (
      <Word key={i} f={f} at={i * 5} style={{ ...big, fontSize: 68 }}>
        {l === "CON RE:SET." ? l : l.replace("MATCH", "\u0000").split("\u0000").reduce((acc: React.ReactNode[], part, k, arr) => (k < arr.length - 1 ? [...acc, part, <span key={k} style={{ background: LIME, padding: "0 0.12em" }}>MATCH</span>] : [...acc, part]), [])}
      </Word>
    ))}
    <div style={{ marginTop: 18, opacity: ramp(f, 10, 10) }}>
      <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 210 }} />
    </div>
    <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: "0.3em", color: INK, paddingLeft: "0.3em", opacity: ramp(f, 16, 10) }}>
      {t.cta} →
    </div>
  </div>
);

const TextView: React.FC<{ t: Text }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from + 1;
  const o = t.type === "end" ? 1 : interpolate(f, [dur - 3, dur], [1, 0], clamp);
  const C: Record<string, React.FC<{ t: Text; f: number }>> = { hero: Hero, price: Price, end: End };
  const V = C[t.type];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <V t={t} f={f} />
    </AbsoluteFill>
  );
};

export const FamilyAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#e9e5df" }}>
    {edit.shots.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.frames}>
        <ShotView s={s as Shot} />
      </Sequence>
    ))}
    {/* soft light wash behind the top text zone so dark type stays legible on every shirt colour */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(240,237,232,0.6) 0%, rgba(240,237,232,0.35) 16%, rgba(240,237,232,0) 26%)" }} />
    {edit.texts.map((t, i) => (
      <Sequence key={i} from={t.from} durationInFrames={t.to - t.from + 1}>
        <TextView t={t} />
      </Sequence>
    ))}
    <Audio src={staticFile("family/music.wav")} />
  </AbsoluteFill>
);
