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
const CREAM = "#F7EFE3";
const INK = "#141414";
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) => easeOut(Math.min(1, Math.max(0, (f - a) / d)));

export const XMATCH_TOTAL = edit.total;

const Layer: React.FC<{ l: (typeof edit.layers)[number] }> = ({ l }) => {
  const f = useCurrentFrame();
  const push = (l as { push?: number[] }).push ?? [1, 1];
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / l.frames));
  const z = push[0] + (push[1] - push[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(`xmatch/${l.id}.mp4`)}
        style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: "50% 35%" }}
      />
    </AbsoluteFill>
  );
};

/** Subtitle chunk: max two lines, highlighted words only where she actually says them. */
const Sub: React.FC<{ s: (typeof edit.subs)[number] }> = ({ s }) => {
  const f = useCurrentFrame();
  const dur = s.to - s.from;
  const p = ramp(f, 0, 6);
  const o = interpolate(f, [dur - 3, dur], [1, 0], clamp);
  const words = s.text.split(" ");
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1360, display: "flex", justifyContent: "center", opacity: p * o }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 58,
          lineHeight: 1.18,
          textAlign: "center",
          color: "#fff",
          maxWidth: 900,
          transform: `translateY(${(1 - p) * 14}px) scale(${0.97 + 0.03 * p})`,
          textShadow: "0 2px 3px rgba(0,0,0,0.55), 0 0 22px rgba(0,0,0,0.35)",
          WebkitTextStroke: "1px rgba(0,0,0,0.25)",
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

const Price: React.FC = () => {
  const f = useCurrentFrame();
  const dur = edit.price.to - edit.price.from;
  const p = ramp(f, 0, 12);
  const o = interpolate(f, [dur - 6, dur], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: p * o }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          background: "rgba(247,239,227,0.95)",
          borderRadius: 999,
          padding: "12px 40px 10px",
          boxShadow: "0 12px 34px rgba(0,0,0,0.22)",
          transform: `translateY(${(1 - p) * -24}px)`,
        }}
      >
        {edit.price.items.map(([who, v], i) => (
          <React.Fragment key={who}>
            {i ? <div style={{ width: 2, height: 46, background: "#bbb" }} /> : null}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: "0.2em", color: INK }}>{who}</span>
              <span style={{ fontFamily: DISPLAY, fontSize: 70, lineHeight: 1, color: INK }}>{v}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const t = edit.end;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.5) 72%, rgba(0,0,0,0.6) 100%)",
          opacity: ramp(f, 0, 14),
        }}
      />
      <div style={{ position: "absolute", top: 1040, left: 60, right: 60, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ opacity: ramp(f, 0, 12), transform: `translateY(${(1 - ramp(f, 0, 12)) * 16}px)` }}>
          <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 300 }} />
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 56,
            lineHeight: 1.1,
            color: "#fff",
            textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            opacity: ramp(f, 6, 12),
            transform: `translateY(${(1 - ramp(f, 6, 12)) * 16}px)`,
          }}
        >
          Encuentra tu <span style={{ color: LIME }}>match</span> en RE:SET
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1480,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: "0.16em",
          color: CREAM,
          opacity: ramp(f, 20, 12),
        }}
      >
        {t.sub}
      </div>
    </AbsoluteFill>
  );
};

export const XMatch: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {edit.layers.map((l) => (
      <Sequence key={l.id} from={l.from} durationInFrames={l.frames}>
        <Layer l={l} />
      </Sequence>
    ))}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.28) 100%)" }} />
    <Sequence from={edit.price.from} durationInFrames={edit.price.to - edit.price.from}>
      <Price />
    </Sequence>
    {edit.subs.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.to - s.from}>
        <Sub s={s} />
      </Sequence>
    ))}
    <Sequence from={edit.end.from} durationInFrames={edit.total - edit.end.from}>
      <End />
    </Sequence>
    <Audio src={staticFile("xmatch/mix.wav")} />
  </AbsoluteFill>
);
