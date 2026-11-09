// RE:SET · OUTLET 25% OFF — shared, deliberately simple engine for the four ads ("menos es más"):
// straight cuts, clips in sync with her real voice (direct sound from the camera, editor/outlet25/voz.py), plain subtitles,
// one clear offer system, background music that dips under her voice. Each ad is a config (ads.tsx).
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import VOZ from "./voz.json";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });

export const FPS = 30;
export const C = { red: "#C8102E", ink: "#1C1C1C", cream: "#FFF8EF", white: "#FFFFFF", green: "#163528" };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

export type Shot = { from: number; len: number; src: string; at: number; z?: number; ox?: number; oy?: number; rate?: number };
export type Voice = { clip: string; a: number; b: number; at: number };
type W = { w: string; s: number; e: number };
const WORDS = VOZ as Record<string, W[]>;

// ---------------------------------------------------------------- video
export const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const z = (s.z ?? 1) * (1 + 0.02 * (f / Math.max(1, s.len))); // barely-there push, never a "zoom effect"
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Sequence from={-Math.round(s.at * FPS)} layout="none">
        <OffthreadVideo
          muted
          playbackRate={s.rate ?? 1}
          src={staticFile(`outlet25/o${s.src}.mp4`)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})`, transformOrigin: `${s.ox ?? 50}% ${s.oy ?? 50}%` }}
        />
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
          <Audio src={staticFile(`outlet25/v${v.clip}.wav`)} startFrom={Math.round(v.a * FPS)} volume={(f) => interpolate(f, [0, 2, len - 3, len], [0, 1, 1, 0], clamp)} />
        </Sequence>
      );
    })}
  </>
);

/** her words placed on the edit timeline (seconds) */
export const editWords = (voices: Voice[]) =>
  voices.flatMap((v) => (WORDS[v.clip] ?? []).filter((w) => w.s >= v.a - 0.02 && (w.s + w.e) / 2 <= v.b).map((w) => ({ ...w, s: v.at / FPS + w.s - v.a, e: v.at / FPS + Math.min(w.e, v.b) - v.a })));

const blocks = (ws: W[]) => {
  const out: W[][] = [];
  let cur: W[] = [];
  const len = (x: W[]) => x.reduce((n, w) => n + w.w.length + 1, 0);
  ws.forEach((w, i) => {
    const gap = i > 0 && w.s - ws[i - 1].e > 0.6;
    if (cur.length && (gap || len(cur) + w.w.length > 56)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.?!]$/.test(w.w) || (/,$/.test(w.w) && len(cur) > 20)) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
};

/** discreet: whole block, cream, soft shadow, low in the frame (above the Reels UI); no word-by-word animation */
export const Subtitles: React.FC<{ voices: Voice[] }> = ({ voices }) => {
  const t = useCurrentFrame() / FPS;
  const bs = blocks(editWords(voices));
  const b = bs.find((x, i) => t >= x[0].s - 0.05 && t <= x[x.length - 1].e + 0.12 && (i + 1 === bs.length || t < bs[i + 1][0].s - 0.05));
  if (!b) return null;
  const a = interpolate(t, [b[0].s - 0.05, b[0].s + 0.08], [0, 1], clamp);
  const text = b.map((w) => w.w).join(" ");
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 420 }}>
      <div style={{ maxWidth: 900, textAlign: "center", opacity: a, fontFamily: "Montserrat", fontWeight: 600, fontSize: 52, lineHeight: 1.22, color: C.cream, textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 0 3px rgba(0,0,0,0.8)" }}>
        {text.charAt(0).toUpperCase() + text.slice(1)}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- campaign graphics (white cards, red offer: clearly not subtitles)
const useFade = (from: number, to: number, d = 6) => {
  const f = useCurrentFrame();
  if (from <= 0) return interpolate(f, [to - d, to], [1, 0], clamp); // ads open with the message already on screen
  return interpolate(f, [from, from + d, to - d, to], [0, 1, 1, 0], clamp);
};

/** big hook at the top; lines appear together (fast), never over the garment's centre */
export const Hook: React.FC<{ lines: string[]; from?: number; to: number; size?: number; ratio?: number }> = ({ lines, from = 0, to, size = 74, ratio = 0.62 }) => {
  const a = useFade(from, to, 4);
  const y = 0;
  return (
    <div style={{ position: "absolute", top: 190, left: 50, right: 50, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${y}px)` }}>
      <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 24, padding: "20px 34px 24px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.18)" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: "Montserrat", fontSize: i === 0 ? size : size * ratio, lineHeight: 1.06, color: C.ink, letterSpacing: "-0.01em", marginTop: i ? 6 : 0, fontWeight: i === 2 ? 700 : 900 }}>
            {l.split(/(25% OFF|PIJAMAS|pijamas)/).map((p, k) => (
              <span key={k} style={{ color: /25% OFF/.test(p) ? C.red : C.ink }}>{p}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/** the offer badge: OUTLET RE:SET · 25% OFF (visible from ~0.2 s) */
export const Badge: React.FC<{ from?: number; to: number; text?: string; top?: number }> = ({ from = 0, to, text = "OUTLET RE:SET", top = 0 }) => {
  const a = useFade(from, to, 5);
  return (
    <div style={{ position: "absolute", top: top || 105, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ display: "flex", alignItems: "center", borderRadius: 999, overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,0.2)", fontFamily: "Montserrat", fontWeight: 800, fontSize: 40, letterSpacing: "0.06em" }}>
        <span style={{ background: C.ink, color: C.white, padding: "12px 24px 14px 30px" }}>{text}</span>
        <span style={{ background: C.red, color: C.white, padding: "12px 30px 14px 24px" }}>25% OFF</span>
      </div>
    </div>
  );
};

/** model number tag for "¿Cuál te llevarías?" */
export const Num: React.FC<{ n: number; from: number; to: number }> = ({ n, from, to }) => {
  const a = useFade(from, to, 4);
  return (
    <div style={{ position: "absolute", top: 300, left: 60, opacity: a, width: 120, height: 120, borderRadius: 60, background: C.white, color: C.ink, fontFamily: "Montserrat", fontWeight: 900, fontSize: 70, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(0,0,0,0.2)" }}>
      {n}
    </div>
  );
};

/** mid-ad offer card (over the real pajamas) */
export const OfferCard: React.FC<{ from: number; to: number; title?: string }> = ({ from, to, title = "OUTLET RE:SET" }) => {
  const f = useCurrentFrame();
  const a = useFade(from, to, 6);
  const s = interpolate(f, [from, from + 10], [0.9, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `scale(${s})` }}>
      <div style={{ background: C.white, borderRadius: 28, padding: "22px 50px 28px", textAlign: "center", boxShadow: "0 12px 34px rgba(0,0,0,0.22)" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 42, letterSpacing: "0.2em", paddingLeft: "0.2em", color: C.ink }}>{title}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 150, lineHeight: 1, color: C.red, letterSpacing: "-0.03em" }}>25% OFF</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 32, letterSpacing: "0.08em", color: C.ink, marginTop: 4 }}>EN MODELOS PARTICIPANTES</div>
      </div>
    </div>
  );
};

/** end card over a real product shot: logo + lines + CTA */
export const EndCard: React.FC<{ shot: Shot; lines: string[]; cta: string; from: number }> = ({ shot, lines, cta, from }) => {
  const f = useCurrentFrame() - from;
  const a = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: ease });
  const b = interpolate(f, [8, 16], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <ShotView s={shot} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.55) 100%)" }} />
      <div style={{ position: "absolute", top: 190, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", opacity: a, transform: `translateY(${(1 - a) * -12}px)` }}>
        <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 300 }} />
        <div style={{ marginTop: 30, background: C.white, borderRadius: 26, padding: "18px 44px 22px", textAlign: "center" }}>
          {lines.map((l, i) => (
            <div key={i} style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: i === 0 ? 64 : 54, lineHeight: 1.1, color: /25% OFF/.test(l) ? C.red : C.ink }}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: b, transform: `translateY(${(1 - b) * 12}px)` }}>
        <div style={{ background: C.red, color: C.white, fontFamily: "Montserrat", fontWeight: 800, fontSize: 48, padding: "18px 40px 20px", borderRadius: 999 }}>{cta}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the ad
export type AdConfig = { frames: number; shots: Shot[]; voices: Voice[]; music: string; musicLevel?: number; overlays: React.ReactNode; end?: { from: number; shot: Shot; lines: string[]; cta: string } };

export const OutletAd: React.FC<{ cfg: AdConfig }> = ({ cfg }) => {
  const ws = editWords(cfg.voices);
  const top = cfg.musicLevel ?? 0.5;
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
    const g = near === 0 ? 0.12 : interpolate(near, [0.4, 0.9], [0.12, top], clamp); // waits ~0.4 s after her last syllable, then rises
    return g * interpolate(f, [cfg.frames - 12, cfg.frames], [1, 0], clamp);
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cfg.shots.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.len}>
          <ShotView s={s} />
        </Sequence>
      ))}
      {cfg.end && (
        <Sequence from={cfg.end.from} durationInFrames={cfg.frames - cfg.end.from}>
          <EndCard shot={cfg.end.shot} lines={cfg.end.lines} cta={cfg.end.cta} from={0} />
        </Sequence>
      )}
      {cfg.overlays}
      <Subtitles voices={cfg.voices} />
      <VoiceTrack voices={cfg.voices} />
      <Audio src={staticFile(`outlet25/${cfg.music}.wav`)} volume={vol} />
    </AbsoluteFill>
  );
};
