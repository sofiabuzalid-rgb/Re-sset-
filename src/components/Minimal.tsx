import { loadFont } from "@remotion/fonts";
import React from "react";
import { Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";

/*
 * RE:SET minimal text system — shared by every ad so captions, hooks and the end tag look the same everywhere.
 * One sans serif, white, a very soft shadow, whole phrases that fade in and out (no pop, no karaoke, no colour,
 * no per-word sizing). Text accompanies the footage; the pajama stays the subject.
 */

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
export const MIN_SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const SHADOW = "0 1px 3px rgba(0,0,0,0.7), 0 0 12px rgba(0,0,0,0.32)";
const INK = "#1C1A19";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Opacity for a clip of `dur` frames: `fin`-frame fade in, `fout`-frame fade out. */
const fade = (f: number, dur: number, fin: number, fout: number) =>
  Math.min(interpolate(f, [0, fin], [0, 1], clamp), interpolate(f, [dur - fout, dur], [1, 0], clamp));

/** Caption zone default: ~72% of the frame height (inside the 70–78% band), adjustable per ad. */
export const CAPTION_TOP = 1390;

const Caption: React.FC<{ text: string; dur: number; top: number }> = ({ text, dur, top }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", justifyContent: "center", opacity: fade(f, dur, 4, 4) }}>
      <div style={{ fontFamily: MIN_SANS, fontWeight: 500, fontSize: 44, lineHeight: 1.25, letterSpacing: "0.005em", textAlign: "center", color: "#FFFFFF", textShadow: SHADOW }}>
        {text}
      </div>
    </div>
  );
};

/** Verbatim captions: one Sequence per phrase, exactly over the time she says it. */
export const MinimalCaptions: React.FC<{ subs: { from: number; to: number; text: string }[]; top?: number; topFrom?: { from: number; top: number }[] }> = ({ subs, top = CAPTION_TOP, topFrom = [] }) => (
  <>
    {subs.map((s) => {
      const override = [...topFrom].reverse().find((o) => s.from >= o.from);
      return (
        <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from} layout="none">
          <Caption text={s.text} dur={s.to - s.from} top={override ? override.top : top} />
        </Sequence>
      );
    })}
  </>
);

type HookProps = { text: string; dur: number; top: number; tone: "dark" | "light"; align: "center" | "right" | "left" };

/** Short opening hook: one quiet line, same family, slightly larger than captions. Ink on light walls, white on dark. */
export const MinimalHook: React.FC<{ text: string; from?: number; dur: number; top?: number; tone?: string; align?: string }> = ({ text, from = 0, dur, top = 300, tone = "dark", align = "center" }) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    <HookLine text={text} dur={dur} top={top} tone={tone === "light" ? "light" : "dark"} align={align === "right" || align === "left" ? align : "center"} />
  </Sequence>
);

const HookLine: React.FC<HookProps> = ({ text, dur, top, tone, align }) => {
  const f = useCurrentFrame();
  const side = align === "center" ? null : align;
  return (
    <div style={{ position: "absolute", left: side === "right" ? 560 : 50, right: side === "left" ? 560 : side === "right" ? 60 : 50, top, display: "flex", justifyContent: side === "right" ? "flex-end" : side === "left" ? "flex-start" : "center", opacity: fade(f, dur, 6, 8) }}>
      <div
        style={{
          fontFamily: MIN_SANS,
          fontWeight: 600,
          fontSize: 50,
          lineHeight: 1.2,
          letterSpacing: "-0.005em",
          textAlign: side ?? "center",
          color: tone === "light" ? "#FFFFFF" : INK,
          textShadow: tone === "light" ? SHADOW : "0 0 12px rgba(255,255,255,0.45)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Discreet end identification: official logo · promo, one small line. */
export const MinimalEndTag: React.FC<{ promo: string; from: number; top?: number; tone?: string; scale?: number }> = ({ promo, from, top = 1500, tone = "light", scale = 1 }) => (
  <Sequence from={from} layout="none">
    <EndLine promo={promo} top={top} dark={tone === "dark"} scale={scale} />
  </Sequence>
);

/** Logo · promo on one line: white with soft shadow over footage, ink + black logo over light walls. */
const EndLine: React.FC<{ promo: string; top: number; dark: boolean; scale: number }> = ({ promo, top, dark, scale }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 12], [0, 1], clamp);
  const color = dark ? INK : "#FFFFFF";
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, opacity: o, transform: `scale(${scale})` }}>
      <Img
        src={staticFile(dark ? "brand/reset-logo-black.png" : "brand/reset-logo-white.png")}
        style={{ width: 150, filter: dark ? undefined : "drop-shadow(0 1px 2px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(0,0,0,0.2))" }}
      />
      <div style={{ width: 1.5, height: 34, background: color, opacity: 0.8, boxShadow: dark ? undefined : SHADOW }} />
      <div style={{ fontFamily: MIN_SANS, fontWeight: 600, fontSize: 28, letterSpacing: "0.16em", color, textShadow: dark ? undefined : SHADOW }}>{promo}</div>
    </div>
  );
};
