// Her words only (editor/softwinter26/voz.py → voz.json). Word by word, ≤ 2 lines, cream Manrope over a soft bottom shade
// (no box), key words she says get a soft underline. Kept low, inside the safe zone, so it never covers her face.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import VOZ from "./voz.json";
import { C } from "./copy";
import { FPS } from "./Footage";

type Wd = { w: string; s: number; e: number; hl: boolean; end_sentence: boolean };
export const WORDS = (VOZ as { words: Wd[] }).words;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const BLOCKS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let cur: Wd[] = [];
  const len = (ws: Wd[]) => ws.reduce((n, w) => n + w.w.length + 1, 0);
  WORDS.forEach((w, i) => {
    if (cur.length && (len(cur) + w.w.length > 44 || (["y", "o", "para", "con"].includes(w.w) && len(cur) > 24))) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
    if (w.end_sentence || (/,$/.test(w.w) && len(cur) > 18) || !WORDS[i + 1]) {
      out.push(cur);
      cur = [];
    }
  });
  return out;
})();

export const Subtitles: React.FC<{ hideFrom?: number; hideTo?: number }> = ({ hideFrom = -1, hideTo = -1 }) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const k = BLOCKS.findIndex((b, i) => t >= b[0].s - 0.08 && (i + 1 === BLOCKS.length || t < BLOCKS[i + 1][0].s - 0.08));
  if (k < 0) return null;
  const b = BLOCKS[k];
  if (t > b[b.length - 1].e + 0.45) return null;
  const pop = interpolate(t, [b[0].s - 0.1, b[0].s + 0.12], [0, 1], clamp);
  const shade = fr >= hideFrom && fr < hideTo ? 0 : 1;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 440 }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(30,22,16,0.5) 76%, rgba(30,22,16,0.55) 100%)", opacity: shade }} />
      <div style={{ position: "relative", maxWidth: 900, textAlign: "center", opacity: pop, transform: `translateY(${(1 - pop) * 12}px)`, filter: `blur(${(1 - pop) * 4}px)` }}>
        <div style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 56, lineHeight: 1.18, color: C.cream, textShadow: "0 2px 14px rgba(20,12,6,0.6), 0 0 2px rgba(20,12,6,0.6)" }}>
          {b.map((w, i) => {
            const a = interpolate(t, [w.s - 0.05, w.s + 0.07], [0, 1], clamp);
            const u = w.hl ? interpolate(t, [w.s, w.s + 0.25], [0, 1], clamp) : 0;
            return (
              <span key={i} style={{ position: "relative", display: "inline-block", marginRight: "0.26em", opacity: 0.3 + 0.7 * a }}>
                {w.w}
                {w.hl && <span style={{ position: "absolute", left: 0, bottom: 2, height: 6, width: `${u * 100}%`, borderRadius: 3, background: "rgba(233,214,178,0.9)" }} />}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
