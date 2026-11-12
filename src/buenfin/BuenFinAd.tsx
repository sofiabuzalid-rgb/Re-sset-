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
 * Ilana's real takes only; shots, voice, word-timed captions and ad copy live in src/buenfin/edit.json.
 * Type language (from the reference reels): no boxes, ultra-tight heavy sans in 1–3-word beats, key words jump to
 * giant stacked caps on the wall, emotional words in italic serif, red only on the offer.
 */

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Playfair Display", url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"), weight: "400 900", style: "italic" });
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";
const INK = "#1C1A19";
const RED = "#D7261E";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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

/** Quick settle-in: 4 frames, slight scale, no bounce. */
const settle = (f: number, a = 0) => {
  const t = Easing.out(Easing.cubic)(Math.min(1, Math.max(0, (f - a) / 4)));
  return { opacity: t, transform: `scale(${0.92 + 0.08 * t})` };
};

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

const tight = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 900,
  fontSize: size,
  letterSpacing: "-0.06em",
  lineHeight: 0.88,
  color,
  textAlign: "center",
  ...extra,
});

/** Hook: the question as giant type on the white wall, offer in red, Buen Fin in serif. */
const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const h = edit.hook;
  const out = interpolate(f, [dur - 5, dur], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 210, display: "flex", flexDirection: "column", alignItems: "center", opacity: out }}>
      <div style={{ ...tight(104, INK), ...settle(f, 0) }}>{h.l1}</div>
      <div style={{ ...tight(196, RED, { marginTop: 6 }), ...settle(f, 4) }}>{h.l2}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 76, color: INK, marginTop: 4, letterSpacing: "-0.01em", ...settle(f, 10) }}>{h.l3}</div>
    </div>
  );
};

/** One caption beat. n = small lowercase, s = italic serif, b/r = giant stacked caps high on the wall. */
const Beat: React.FC<{ text: string; style: string }> = ({ text, style }) => {
  const f = useCurrentFrame();
  if (style === "b" || style === "r") {
    const words = text.replace(/[.,]$/, "").split(" ");
    const longest = Math.max(...words.map((w) => w.length));
    const size = Math.min(200, Math.floor(1350 / Math.max(5, longest)));
    return (
      <div style={{ position: "absolute", left: 30, right: 30, top: 230, display: "flex", flexDirection: "column", alignItems: "center", ...settle(f) }}>
        {words.map((w, i) => (
          <div key={i} style={tight(size, style === "r" ? RED : INK)}>
            {w}
          </div>
        ))}
      </div>
    );
  }
  if (style === "low")
    return (
      <div style={{ position: "absolute", left: 60, right: 60, top: 1250, display: "flex", justifyContent: "center", ...settle(f) }}>
        <div style={tight(92, "#FFFDF8", { lineHeight: 1, textShadow: "0 3px 14px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.5)" })}>{text}</div>
      </div>
    );
  const serif = style === "s";
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 300, display: "flex", justifyContent: "center", ...settle(f) }}>
      <div
        style={
          serif
            ? { fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 112, lineHeight: 1, color: INK, textAlign: "center", letterSpacing: "-0.02em" }
            : tight(104, INK, { lineHeight: 0.95 })
        }
      >
        {text}
      </div>
    </div>
  );
};

/** CTA in the same language: logo, giant red offer, serif line, small tracked caps — rack stays visible. */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const c = edit.cta;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 150, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 300, ...settle(f, 2) }} />
      <div style={{ ...tight(210, RED, { marginTop: 18 }), ...settle(f, 8) }}>{c.big}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 78, color: INK, marginTop: 2, ...settle(f, 14) }}>{c.serif}</div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: "0.2em", color: INK, marginTop: 18, ...settle(f, 20) }}>{c.small}</div>
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
    {edit.subs.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
        <Beat text={s.text} style={s.from >= ctaShot.from || s.from < edit.hook.to ? "low" : s.style} />
      </Sequence>
    ))}
    <Sequence from={ctaShot.from}>
      <Cta />
    </Sequence>
    <Audio src={staticFile("buenfin/mix.wav")} />
  </AbsoluteFill>
);
