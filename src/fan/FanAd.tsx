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
export const FAN_TOTAL = edit.total;

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
        src={staticFile(`fan/${s.id}.mp4`)}
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

const big: React.CSSProperties = { fontFamily: SANS, fontWeight: 900, fontSize: 104, lineHeight: 1.0, letterSpacing: "-0.015em", color: INK, textAlign: "center" };

const Hook: React.FC<{ t: Text; f: number }> = ({ t, f }) => (
  <div style={{ position: "absolute", top: 150, left: 50, right: 50 }}>
    {t.lines.map((l: string, i: number) => (
      <Word key={i} f={f} at={i * 5} style={big}>
        {l}
      </Word>
    ))}
  </div>
);

const Kicker: React.FC<{ t: Text; f: number }> = ({ t, f }) => (
  <div style={{ position: "absolute", top: 160, left: 0, right: 0, textAlign: "center", opacity: ramp(f, 0, 8) }}>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: "0.32em", color: INK, paddingLeft: "0.32em" }}>{t.text}</div>
    <div style={{ width: 70, height: 4, background: INK, margin: "18px auto 0" }} />
  </div>
);

const City: React.FC<{ t: Text; f: number }> = ({ t, f }) => (
  <div style={{ position: "absolute", top: 245, left: 0, right: 0, textAlign: "center" }}>
    <Word f={f} at={0} style={{ fontFamily: DISPLAY, fontSize: 96, lineHeight: 1, letterSpacing: "0.04em", color: INK }}>
      {t.text}
    </Word>
  </div>
);

const Stack: React.FC<{ t: Text; f: number }> = ({ t, f }) => (
  <div style={{ position: "absolute", top: 160, left: 50, right: 50 }}>
    {t.lines.map((l: string, i: number) => (
      <Word key={i} f={f} at={i * 8} style={{ ...big, fontSize: l.length > 16 ? 76 : 96 }}>
        {l}
      </Word>
    ))}
  </div>
);

const Match: React.FC<{ t: Text; f: number }> = ({ t, f }) => (
  <>
    <div style={{ position: "absolute", top: 160, left: 40, right: 40 }}>
      <Word f={f} at={0} style={{ ...big, fontSize: 92 }}>
        PAPÁ <span style={{ fontWeight: 300 }}>+</span> MINI
      </Word>
      <Word f={f} at={5} style={{ ...big, fontSize: 92 }}>
        MATCH
      </Word>
    </div>
    {t.tags.map((g: { text: string; x: number; y: number }, i: number) => {
      const p = ramp(f, 10 + i * 5, 10);
      return (
        <div key={g.text} style={{ position: "absolute", left: g.x - 120, width: 240, top: g.y, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
          <div style={{ display: "inline-block", fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.26em", color: "#fff", background: INK, padding: "8px 14px 8px 22px", borderRadius: 4 }}>{g.text}</div>
          <div style={{ width: 2, height: 34 * p, background: INK, margin: "0 auto" }} />
        </div>
      );
    })}
  </>
);

const Price: React.FC<{ t: Text; f: number }> = ({ t, f }) => (
  <>
    {t.items.map((it: { who: string; v: string; x: number }, i: number) => {
      const p = ramp(f, i * 6, 10);
      const slam = interpolate(f - i * 6, [0, 6], [1.25, 1], { ...clamp, easing: easeOut });
      return (
        <div key={it.who} style={{ position: "absolute", top: 150, left: it.x - 200, width: 400, textAlign: "center", opacity: p }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.3em", color: INK, paddingLeft: "0.3em" }}>{it.who}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 170, lineHeight: 0.95, color: INK, transform: `scale(${slam})` }}>{it.v}</div>
          <div style={{ width: 2, height: 46 * p, background: INK, margin: "4px auto 0" }} />
        </div>
      );
    })}
  </>
);

const End: React.FC<{ t: Text; f: number }> = ({ t, f }) => (
  <div style={{ position: "absolute", top: 130, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Word f={f} at={0} style={{ ...big, fontSize: 70 }}>
      HAZ <span style={{ background: LIME, padding: "0 0.12em" }}>MATCH</span> CON RE:SET.
    </Word>
    <div style={{ marginTop: 14, opacity: ramp(f, 8, 10) }}>
      <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 200 }} />
    </div>
    <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: "0.3em", color: INK, paddingLeft: "0.3em", opacity: ramp(f, 14, 10) }}>
      {t.cta} →
    </div>
  </div>
);

const TextView: React.FC<{ t: Text }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from + 1;
  const o = t.type === "end" || t.type === "kicker" ? 1 : interpolate(f, [dur - 3, dur], [1, 0], clamp);
  const C: Record<string, React.FC<{ t: Text; f: number }>> = { hook: Hook, kicker: Kicker, city: City, stack: Stack, match: Match, price: Price, end: End };
  const V = C[t.type];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <V t={t} f={f} />
    </AbsoluteFill>
  );
};

export const FanAd: React.FC = () => (
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
    <Audio src={staticFile("fan/music.wav")} />
  </AbsoluteFill>
);
