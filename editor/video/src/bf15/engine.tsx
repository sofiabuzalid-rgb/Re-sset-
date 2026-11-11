// RE:SET · BUEN FIN 15% EN TODA LA TIENDA — engine for four ads.
// Her real voice from the Buen Fin voice memos (editor/bf15/voz.py), the official Buen Fin card, straight cuts, an offer card that
// stays readable. Every text sits in the TikTok / Reels / Stories safe zone (below the top bar, left of the side buttons, above captions).
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import VOZ from "./voz.json";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });

export const FPS = 30;
const RED = "#E30613"; // the Buen Fin card's red
const INK = "#111111";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const W = 1080;
const H = 1920;

/** src: path under public/ without .mp4. cx: horizontal focus (0–1) for landscape sources; vertical sources fill the frame. */
export type Shot = { from: number; len: number; src: string; at: number; cx?: number; z?: number; rate?: number };
export type Voice = { memo: string; a: number; b: number; at: number };
type Wd = { w: string; s: number; e: number };
const WORDS = VOZ as Record<string, Wd[]>;

// ---------------------------------------------------------------- video
export const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const z = (s.z ?? 1) * (1 + 0.03 * (f / Math.max(1, s.len)));
  const land = s.cx !== undefined;
  const vw = land ? ((H * 16) / 9) * z : W * z;
  const vh = H * z;
  const left = land ? Math.min(0, Math.max(W - vw, W / 2 - (s.cx as number) * vw)) : (W - vw) / 2;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Sequence from={-Math.round(s.at * FPS)} layout="none">
        <OffthreadVideo muted playbackRate={s.rate ?? 1} src={staticFile(`${s.src}.mp4`)} style={{ position: "absolute", left, top: (H - vh) / 2, width: vw, height: vh, objectFit: "cover" }} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- voice + subtitles (her words only)
export const VoiceTrack: React.FC<{ voices: Voice[] }> = ({ voices }) => (
  <>
    {voices.map((v, i) => {
      const len = Math.round((v.b - v.a) * FPS);
      return (
        <Sequence key={i} from={v.at} durationInFrames={len}>
          <Audio src={staticFile(`bf15/m_${v.memo}.wav`)} startFrom={Math.round(v.a * FPS)} volume={(f) => interpolate(f, [0, 2, len - 2, len], [0, 1, 1, 0], clamp)} />
        </Sequence>
      );
    })}
  </>
);

export const editWords = (voices: Voice[]) =>
  voices.flatMap((v) => {
    const ws = (WORDS[v.memo] ?? []).filter((w) => (w.s + w.e) / 2 >= v.a && (w.s + w.e) / 2 <= v.b).map((w) => ({ ...w, s: v.at / FPS + w.s - v.a, e: v.at / FPS + Math.min(w.e, v.b) - v.a }));
    if (ws.length) {
      const last = ws[ws.length - 1];
      ws[ws.length - 1] = { ...last, w: last.w.replace(/,$/, "").replace(/([^.?!])$/, "$1.") }; // every piece ends a sentence
      ws[0] = { ...ws[0], w: ws[0].w.charAt(0) === "¿" ? ws[0].w : ws[0].w.charAt(0).toUpperCase() + ws[0].w.slice(1) };
    }
    return ws;
  });

const blocks = (ws: Wd[]) => {
  const out: Wd[][] = [];
  let cur: Wd[] = [];
  const len = (x: Wd[]) => x.reduce((n, w) => n + w.w.length + 1, 0);
  ws.forEach((w, i) => {
    const gap = i > 0 && w.s - ws[i - 1].e > 0.6;
    if (cur.length && (gap || len(cur) + w.w.length > 56 || (["y", "para", "en", "con"].includes(w.w) && len(cur) > 30))) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.?!]$/.test(w.w) || (/,$/.test(w.w) && len(cur) > 22)) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
};

export const Subtitles: React.FC<{ voices: Voice[]; bottom?: number }> = ({ voices, bottom = 830 }) => {
  const t = useCurrentFrame() / FPS;
  const bs = blocks(editWords(voices));
  const b = bs.find((x, i) => t >= x[0].s - 0.05 && t <= x[x.length - 1].e + 0.15 && (i + 1 === bs.length || t < bs[i + 1][0].s - 0.05));
  if (!b) return null;
  const a = interpolate(t, [b[0].s - 0.05, b[0].s + 0.08], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bottom }}>
      <div style={{ maxWidth: 860, marginRight: 60, textAlign: "center", opacity: a, background: "rgba(0,0,0,0.58)", borderRadius: 18, padding: "10px 24px 14px", fontFamily: "Montserrat", fontWeight: 700, fontSize: 54, lineHeight: 1.2, color: "#FFFFFF" }}>
        {b.map((w) => w.w).join(" ")}
      </div>
    </AbsoluteFill>
  );
};

/** text-led ads (no voice): one short line at a time, same place and look as subtitles, describing only what is on screen */
export const Lines: React.FC<{ lines: { from: number; to: number; text: string }[]; bottom?: number }> = ({ lines, bottom = 830 }) => {
  const f = useCurrentFrame();
  const l = lines.find((x) => f >= x.from && f < x.to);
  if (!l) return null;
  const a = interpolate(f, [l.from, l.from + 5, l.to - 4, l.to], [l.from === 0 ? 1 : 0, 1, 1, 0], clamp);
  const y = l.from === 0 ? 0 : interpolate(f, [l.from, l.from + 8], [14, 0], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bottom }}>
      <div style={{ maxWidth: 860, marginRight: 60, textAlign: "center", opacity: a, transform: `translateY(${y}px)`, background: "rgba(0,0,0,0.62)", borderRadius: 18, padding: "12px 28px 16px", fontFamily: "Montserrat", fontWeight: 800, fontSize: 60, lineHeight: 1.15, color: "#FFFFFF", whiteSpace: "pre-line" }}>
        {l.text}
      </div>
    </AbsoluteFill>
  );
};

/** THE message: what we sell. Huge "PIJAMAS" at the top from frame 0, collection underneath; stays until the end card. */
export const Headline: React.FC<{ sub: string; to: number }> = ({ sub, to }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [to - 6, to], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 185, left: 60, right: 140, opacity: a, background: "rgba(255,255,255,0.96)", borderRadius: 26, padding: "10px 16px 16px", textAlign: "center", boxShadow: "0 10px 26px rgba(0,0,0,0.22)" }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 150, lineHeight: 1.0, color: INK, letterSpacing: "-0.02em" }}>PIJAMAS</div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 44, letterSpacing: "0.12em", paddingLeft: "0.12em", color: RED, marginTop: 2 }}>{sub}</div>
    </div>
  );
};

/** the offer in one low bar: the Buen Fin card + 15% OFF EN TODA LA TIENDA; pulses when she says "15%" */
export const OfferBar: React.FC<{ to: number; pulses?: number[] }> = ({ to, pulses = [] }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [to - 6, to], [1, 0], clamp);
  const p = pulses.reduce((m, at) => (f >= at ? Math.max(m, 0.08 * Math.exp(-(f - at) / 6)) : m), 0);
  return (
    <div style={{ position: "absolute", top: 1115, left: 60, right: 140, opacity: a, background: "rgba(255,255,255,0.97)", borderRadius: 24, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 10px 26px rgba(0,0,0,0.22)", transform: `scale(${1 + p})` }}>
      <Img src={staticFile("bf15/cartel.png")} style={{ width: 170, transform: "rotate(-4deg)" }} />
      <div style={{ flex: 1, textAlign: "center" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 104, lineHeight: 1.0, color: RED, letterSpacing: "-0.03em" }}>15% OFF</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 38, color: INK }}>EN TODA LA TIENDA</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- the Buen Fin card (official artwork) — pops in, then breathes
export const Cartel: React.FC<{ from?: number; to: number; top?: number; width?: number }> = ({ from = 0, to, top = 200, width = 360 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = 0.8 + 0.2 * spring({ frame: f - from, fps, config: { damping: 9, stiffness: 160 } }); // readable on frame 0, then a small bounce
  const out = interpolate(f, [to - 6, to], [1, 0], clamp);
  const bob = Math.sin((f - from) / 9) * 1.6;
  if (f < from || f > to) return null;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 60, display: "flex", justifyContent: "center", opacity: out }}>
      <Img src={staticFile("bf15/cartel.png")} style={{ width, transform: `scale(${s}) rotate(${-4 + bob}deg)`, filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.35))" }} />
    </div>
  );
};

// ---------------------------------------------------------------- the offer, low in the safe zone; the number counts up on entry and pulses on cue
export const Offer: React.FC<{ from?: number; to: number; pulses?: number[]; top?: number }> = ({ from = 0, to, pulses = [], top = 1120 }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [from, from + 5, to - 6, to], [from === 0 ? 1 : 0, 1, 1, 0], clamp);
  const n = 15; // always 15: the first frame (thumbnail) must already say it
  const p = pulses.reduce((m, at) => (f >= at ? Math.max(m, 0.1 * Math.exp(-(f - at) / 6)) : m), 0);
  if (f > to) return null;
  return (
    <div style={{ position: "absolute", top, left: 70, right: 150, opacity: a, background: "rgba(255,255,255,0.97)", borderRadius: 26, padding: "14px 18px 18px", textAlign: "center", boxShadow: "0 12px 30px rgba(0,0,0,0.25)" }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 30, letterSpacing: "0.2em", paddingLeft: "0.2em", color: INK }}>BUEN FIN · RE:SET</div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 132, lineHeight: 1.0, color: RED, letterSpacing: "-0.03em", transform: `scale(${1 + p + interpolate(f, [from, from + 8], [0.12, 0], clamp)})` }}>{n}% OFF</div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 46, color: INK, letterSpacing: "0.04em" }}>EN TODA LA TIENDA</div>
    </div>
  );
};

/** a short extra line on a dark pill (product name she says, or the stores she names) */
export const Tag: React.FC<{ from: number; to: number; text: string; top?: number }> = ({ from, to, text, top = 1040 }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [from, from + 6, to - 6, to], [0, 1, 1, 0], clamp);
  const y = interpolate(f, [from, from + 8], [12, 0], { ...clamp, easing: ease });
  if (f < from || f > to) return null;
  return (
    <div style={{ position: "absolute", top, left: 70, right: 150, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${y}px)` }}>
      <div style={{ background: INK, color: "#FFFFFF", fontFamily: "Montserrat", fontWeight: 800, fontSize: 38, padding: "10px 26px 12px", borderRadius: 14, textAlign: "center" }}>{text}</div>
    </div>
  );
};

/** end card: real product shot, the Buen Fin card, 15% OFF EN TODA LA TIENDA, CTA and stores — all inside the safe zone */
export const EndCard: React.FC<{ shot: Shot; cta: string; stores?: string; sub?: string }> = ({ shot, cta, stores = "Av. Stim 39 · Perisur", sub = "RE:SET" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 10, stiffness: 150 } });
  const b = interpolate(f, [10, 20], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <ShotView s={shot} />
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.38)" }} />
      <div style={{ position: "absolute", top: 190, left: 60, right: 140, background: "rgba(255,255,255,0.96)", borderRadius: 26, padding: "10px 16px 16px", textAlign: "center" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 150, lineHeight: 1.0, color: INK, letterSpacing: "-0.02em" }}>PIJAMAS</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 44, letterSpacing: "0.12em", paddingLeft: "0.12em", color: RED }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", top: 480, left: 0, right: 80, display: "flex", justifyContent: "center" }}>
        <Img src={staticFile("bf15/cartel.png")} style={{ width: 280, transform: `scale(${s}) rotate(-4deg)`, filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.4))" }} />
      </div>
      <div style={{ position: "absolute", top: 820, left: 60, right: 140, background: "rgba(255,255,255,0.97)", borderRadius: 26, padding: "14px 18px 18px", textAlign: "center", opacity: b, transform: `scale(${0.92 + 0.08 * b})` }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 120, lineHeight: 1, color: RED, letterSpacing: "-0.03em" }}>15% OFF</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 46, color: INK }}>EN TODA LA TIENDA</div>
      </div>
      <div style={{ position: "absolute", top: 1100, left: 70, right: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: b }}>
        <div style={{ background: RED, color: "#FFFFFF", fontFamily: "Montserrat", fontWeight: 800, fontSize: 46, padding: "16px 36px 18px", borderRadius: 999, textAlign: "center" }}>{cta}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 38, color: "#FFFFFF", textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>{stores}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the ad
export type AdConfig = { frames: number; shots: Shot[]; voices: Voice[]; music: string; overlays: React.ReactNode; end: { from: number; shot: Shot; cta: string; stores?: string; sub?: string } };

export const BuenFinAd: React.FC<{ cfg: AdConfig }> = ({ cfg }) => {
  const ws = editWords(cfg.voices);
  const vol = (f: number) => {
    const t = f / FPS;
    let near = 99;
    for (const w of ws) {
      if (t >= w.s - 0.15 && t <= w.e + 0.4) {
        near = 0;
        break;
      }
      near = Math.min(near, Math.abs(t - w.s), Math.abs(t - w.e));
    }
    const g = near === 0 ? 0.12 : interpolate(near, [0.4, 0.9], [0.12, 0.55], clamp);
    return g * interpolate(f, [cfg.frames - 12, cfg.frames], [1, 0], clamp);
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cfg.shots.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.len}>
          <ShotView s={s} />
        </Sequence>
      ))}
      <Sequence from={cfg.end.from} durationInFrames={cfg.frames - cfg.end.from}>
        <EndCard shot={cfg.end.shot} cta={cfg.end.cta} stores={cfg.end.stores} sub={cfg.end.sub} />
      </Sequence>
      <Sequence durationInFrames={cfg.end.from}>{cfg.overlays}</Sequence>
      <Subtitles voices={cfg.voices} />
      <VoiceTrack voices={cfg.voices} />
      <Audio src={staticFile(`bf15/${cfg.music}.wav`)} volume={vol} />
    </AbsoluteFill>
  );
};
