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
 * Ilana's real takes only: shots, her voice, verbatim subtitles and the ad copy live in src/buenfin/edit.json;
 * media from scripts/build-buenfin-media.py. Palette: white, cream, soft black; the garments are the colour.
 */

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
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

const RED = "#E1251B";
// heavy outline so white caps read on any background
const STROKE = "0 0 2px #000, 0 3px 0 #000, 0 -2px 0 #000, 3px 0 0 #000, -3px 0 0 #000, 0 6px 18px rgba(0,0,0,0.55)";
const pop = (f: number, a = 0) => {
  const t = Math.min(1, Math.max(0, (f - a) / 5));
  return 0.82 + 0.18 * Easing.out(Easing.back(2.2))(t);
};

/** Hook: a question that stops the scroll, then a giant red 15% OFF stamp; readable from frame 0. */
const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const h = edit.hook;
  const out = interpolate(f, [dur - 5, dur], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", flexDirection: "column", alignItems: "center", opacity: out }}>
      <div style={{ background: "#fff", color: "#000", padding: "12px 26px 14px", fontFamily: SANS, fontWeight: 900, fontSize: 46, letterSpacing: "-0.01em", textAlign: "center", maxWidth: 940, lineHeight: 1.05, transform: `rotate(-2deg) scale(${pop(f, 0)})` }}>
        {h.kicker}
      </div>
      <div style={{ marginTop: 18, background: RED, color: "#fff", padding: "6px 38px 14px", fontFamily: SANS, fontWeight: 900, fontSize: 168, letterSpacing: "-0.03em", lineHeight: 1, transform: `rotate(2deg) scale(${pop(f, 6)})`, boxShadow: "0 14px 40px rgba(0,0,0,0.35)" }}>
        {h.big}
      </div>
      <div style={{ marginTop: 18, background: "#000", color: "#fff", padding: "10px 24px 12px", fontFamily: SANS, fontWeight: 900, fontSize: 44, letterSpacing: "0.08em", transform: `rotate(-1deg) scale(${pop(f, 12)})`, opacity: f >= 12 ? 1 : 0 }}>
        {h.sub}
      </div>
    </div>
  );
};

/** Offer banner while she says every collection is in. */
const Tag: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 5, dur], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ background: RED, color: "#fff", padding: "14px 30px 16px", fontFamily: SANS, fontWeight: 900, fontSize: 54, letterSpacing: "-0.01em", transform: `rotate(-2deg) scale(${pop(f)})`, boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>
        {edit.tag.text}
      </div>
    </div>
  );
};

/** Collection name, big and red, on the garment she is showing. */
const Label: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 4, dur], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ color: "#fff", background: RED, padding: "8px 30px 12px", fontFamily: SANS, fontWeight: 900, fontSize: 96, letterSpacing: "-0.02em", lineHeight: 1, transform: `rotate(-3deg) scale(${pop(f)})`, boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>
        {text}
      </div>
    </div>
  );
};

/** Verbatim captions, 2-4 words at a time, all caps; [words] = her key words in red. */
type Word = { w: string; red: boolean };
const words = (text: string): Word[] => {
  // a [red phrase] stays one token; punctuation sticks to the word before it
  const out: Word[] = [];
  text.split(/(\[[^\]]+\])/).forEach((part) => {
    if (part.startsWith("[")) out.push({ w: part.slice(1, -1), red: true });
    else
      part.split(" ").filter(Boolean).forEach((w) => {
        if (/^[.,?!]+$/.test(w) && out.length) out[out.length - 1].w += w;
        else out.push({ w, red: false });
      });
  });
  return out;
};
const chunks = (ws: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of ws) {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 20)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
};

const Sub: React.FC<{ text: string; dur: number; top: number }> = ({ text, dur, top }) => {
  const f = useCurrentFrame();
  const cs = chunks(words(text));
  const lens = cs.map((c) => c.reduce((n, x) => n + x.w.length + 2, 0));
  const tot = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  const starts = lens.map((l) => {
    const s0 = Math.round((acc / tot) * dur);
    acc += l;
    return s0;
  });
  let i = starts.length - 1;
  while (i > 0 && f < starts[i]) i--;
  const c: Word[] = [];
  for (const w of cs[i]) {
    const last = c[c.length - 1];
    if (last && last.red && w.red) last.w += " " + w.w;
    else c.push({ ...w });
  }
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 18px", transform: `scale(${pop(f, starts[i])})` }}>
      {c.map((w, k) =>
        w.red ? (
          <span key={k} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, lineHeight: 1.15, color: "#fff", background: RED, padding: "0 14px 4px", transform: "rotate(-2deg)", display: "inline-block" }}>
            {w.w}
          </span>
        ) : (
          <span key={k} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, lineHeight: 1.15, color: "#fff", textShadow: STROKE, display: "inline-block" }}>
            {w.w}
          </span>
        ),
      )}
    </div>
  );
};

/** CTA: logo on white, big red offer stamp, black call to action — pajamas still visible below. */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ background: "#fff", padding: "20px 40px 18px", transform: `scale(${pop(f, 2)})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 280 }} />
        <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 900, fontSize: 34, letterSpacing: "0.22em", color: "#000" }}>{edit.cta.title}</div>
      </div>
      <div style={{ marginTop: 16, background: RED, color: "#fff", padding: "10px 30px 14px", fontFamily: SANS, fontWeight: 900, fontSize: 64, lineHeight: 1.02, textAlign: "center", maxWidth: 900, transform: `rotate(-2deg) scale(${pop(f, 8)})`, opacity: f >= 8 ? 1 : 0, boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>
        {edit.cta.offer}
      </div>
      <div style={{ marginTop: 16, background: "#000", color: "#fff", padding: "10px 26px 12px", fontFamily: SANS, fontWeight: 900, fontSize: 44, letterSpacing: "0.06em", transform: `rotate(1deg) scale(${pop(f, 14)})`, opacity: f >= 14 ? 1 : 0 }}>
        {edit.cta.line}
      </div>
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
    <Sequence from={edit.tag.from} durationInFrames={edit.tag.to - edit.tag.from}>
      <Tag dur={edit.tag.to - edit.tag.from} />
    </Sequence>
    {edit.labels.map((l) => (
      <Sequence key={l.text} from={l.from} durationInFrames={l.to - l.from}>
        <Label text={l.text} dur={l.to - l.from} />
      </Sequence>
    ))}
    {edit.subs.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
        <Sub text={s.text} dur={s.to - s.from} top={1230} />
      </Sequence>
    ))}
    <Sequence from={ctaShot.from}>
      <Cta />
    </Sequence>
    <Audio src={staticFile("buenfin/mix.wav")} />
  </AbsoluteFill>
);
