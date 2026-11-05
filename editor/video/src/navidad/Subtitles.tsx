// Her words only (editor/navidad/voz.py → voz.json): word by word, ≤ 2 lines, bottom safe zone (above the Reels UI).
// Highlights only on words she actually says (pijamas, navideñas, Navidad, RE:SET, 15%).
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import VOZ from "./voz.json";
import { C } from "./copy";
import { FPS } from "./Footage";

type Wd = { w: string; s: number; e: number; hl: boolean; end_sentence: boolean };
export const WORDS = (VOZ as { words: Wd[] }).words;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** blocks ≤ 48 characters (two lines), never across a sentence end; long blocks break at commas or before y/o/con */
export const BLOCKS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let cur: Wd[] = [];
  const len = (ws: Wd[]) => ws.reduce((n, w) => n + w.w.length + 1, 0);
  WORDS.forEach((w, i) => {
    const next = WORDS[i + 1];
    if (cur.length && (len(cur) + w.w.length > 48 || (["y", "o", "con"].includes(w.w) && len(cur) > 22))) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
    if (w.end_sentence || (/,$/.test(w.w) && len(cur) > 20) || !next) {
      out.push(cur);
      cur = [];
    }
  });
  return out;
})();

const SHADOW = "0 2px 12px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.7)";

export const Subtitles: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const k = BLOCKS.findIndex((b, i) => t >= b[0].s - 0.08 && (i + 1 === BLOCKS.length || t < BLOCKS[i + 1][0].s - 0.08));
  if (k < 0) return null;
  const b = BLOCKS[k];
  if (t > b[b.length - 1].e + 0.5) return null;
  const pop = interpolate(t, [b[0].s - 0.08, b[0].s + 0.08], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 470 }}>
      <div style={{ maxWidth: 880, padding: "12px 26px 14px", borderRadius: 22, background: "rgba(16,16,16,0.42)", backdropFilter: "blur(6px)", textAlign: "center", opacity: pop, transform: `translateY(${(1 - pop) * 10}px)` }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 54, lineHeight: 1.16, color: C.white, textShadow: SHADOW }}>
          {b.map((w, i) => {
            const a = interpolate(t, [w.s - 0.05, w.s + 0.06], [0, 1], clamp);
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.26em", opacity: 0.25 + 0.75 * a, color: w.hl && a > 0.5 ? C.gold : C.white }}>
                {w.w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
