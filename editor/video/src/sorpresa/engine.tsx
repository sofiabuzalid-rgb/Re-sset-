// RE:SET · VENTA SORPRESA BUEN FIN ($49–$299 MXN, productos participantes) — engine for the two ads.
// Forked from the outlet engine (straight cuts, clips in sync with her direct sound from editor/sorpresa/voz.py, plain subtitles,
// music that waits after each phrase) with its own look — hot pink + cream — so it never reads as the 25% outlet (red) or the
// general 15% Buen Fin (green).
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import VOZ from "./voz.json";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });

export const FPS = 30;
export const C = { red: "#E5216C", ink: "#1C1C1C", cream: "#FFF8EF", white: "#FFFFFF", yellow: "#FFE14D" };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

export type Shot = { from: number; len: number; src: string; at: number; z?: number; ox?: number; oy?: number; rate?: number };
export type Voice = { clip: string; a: number; b: number; at: number; fo?: number }; // fo: fade-out frames (default 3)
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
          src={staticFile(`sorpresa/s${s.src}.mp4`)}
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
          <Audio src={staticFile(`sorpresa/v${v.clip}.wav`)} startFrom={Math.round(v.a * FPS)} volume={(f) => interpolate(f, [0, 2, len - (v.fo ?? 3), len], [0, 1, 1, 0], clamp)} />
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
    if (cur.length && (gap || len(cur) + w.w.length > 56 || (["para", "en"].includes(w.w) && len(cur) > 34))) {
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
export const Subtitles: React.FC<{ voices: Voice[]; boxed?: boolean }> = ({ voices, boxed }) => {
  const t = useCurrentFrame() / FPS;
  const bs = blocks(editWords(voices));
  const b = bs.find((x, i) => t >= x[0].s - 0.05 && t <= x[x.length - 1].e + 0.12 && (i + 1 === bs.length || t < bs[i + 1][0].s - 0.05));
  if (!b) return null;
  const a = interpolate(t, [b[0].s - 0.05, b[0].s + 0.08], [0, 1], clamp);
  const text = b.map((w) => w.w).join(" ");
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 420 }}>
      <div style={{ maxWidth: 900, textAlign: "center", opacity: a, fontFamily: "Montserrat", fontWeight: boxed ? 700 : 600, fontSize: boxed ? 58 : 52, lineHeight: 1.22, color: C.cream, textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 0 3px rgba(0,0,0,0.8)", ...(boxed ? { background: "rgba(0,0,0,0.55)", borderRadius: 18, padding: "10px 24px 14px" } : {}) }}>
        {text /* her words as written: capitals only where a sentence starts */}
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
export const Hook: React.FC<{ lines: string[]; from?: number; to: number; size?: number; ratio?: number; sizes?: number[] }> = ({ lines, from = 0, to, size = 74, ratio = 0.62, sizes }) => {
  const a = useFade(from, to, 4);
  const y = 0;
  return (
    <div style={{ position: "absolute", top: 190, left: 50, right: 50, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${y}px)` }}>
      <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 24, padding: "20px 34px 24px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.18)" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: "Montserrat", fontSize: sizes ? sizes[i] : i === 0 ? size : size * ratio, lineHeight: 1.06, color: C.ink, letterSpacing: "-0.01em", marginTop: i ? 6 : 0, fontWeight: sizes ? (sizes[i] < 40 ? 700 : 900) : i === 2 ? 700 : 900 }}>
            {l.split(/(\$49[^ ]*(?: MXN)?|\$299 MXN|¡SORPRESA!|SORPRESA)/).map((p, k) => (
              <span key={k} style={{ color: /\$|SORPRESA/.test(p) ? C.red : C.ink }}>{p}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/** the whole offer in one fixed header (clean: white card, black type), on screen from frame 0 to `to`; the price pulses when she says it */
export const Header: React.FC<{ to: number; pulseAt?: number }> = ({ to, pulseAt = -99 }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [to - 6, to], [1, 0], clamp);
  const p = f >= pulseAt ? 1 + 0.06 * Math.exp(-(f - pulseAt) / 6) : 1;
  return (
    <div style={{ position: "absolute", top: 60, left: 50, right: 50, opacity: a, background: "rgba(255,255,255,0.96)", borderRadius: 26, padding: "20px 24px 22px", textAlign: "center", boxShadow: "0 10px 28px rgba(0,0,0,0.18)" }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 30, letterSpacing: "0.28em", paddingLeft: "0.28em", color: "#6B6B6B" }}>VENTA SORPRESA DE BUEN FIN</div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 70, lineHeight: 1.08, color: C.ink, marginTop: 4 }}>PIJAMAS RE:SET</div>
      <div style={{ height: 3, width: 120, background: C.ink, margin: "10px auto 12px", borderRadius: 2 }} />
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 84, lineHeight: 1.0, color: C.ink, transform: `scale(${p})`, letterSpacing: "-0.01em" }}>$49 – $299 MXN</div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 26, color: "#6B6B6B", marginTop: 8 }}>en productos seleccionados</div>
    </div>
  );
};

/** big store card under the header */
export const Store: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  const a = useFade(from, to, 6);
  const s = interpolate(f, [from, from + 10], [0.9, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `scale(${s})` }}>
      <div style={{ background: C.ink, color: C.white, borderRadius: 24, padding: "12px 36px 16px", textAlign: "center" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 28, letterSpacing: "0.24em", paddingLeft: "0.24em", color: "#CFCFCF" }}>SOLO EN TIENDA</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 54 }}>Av. Stim 39 · planta baja</div>
      </div>
    </div>
  );
};

/** persistent pill: VENTA SORPRESA · $49–$299 MXN */
export const Pill: React.FC<{ from?: number; to: number; text?: string }> = ({ from = 0, to, text = "VENTA SORPRESA · $49–$299 MXN" }) => {
  const a = useFade(from, to, 5);
  return (
    <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ background: C.red, color: C.white, fontFamily: "Montserrat", fontWeight: 800, fontSize: 36, letterSpacing: "0.06em", padding: "11px 28px 13px", borderRadius: 999, boxShadow: "0 6px 18px rgba(0,0,0,0.2)" }}>{text}</div>
    </div>
  );
};

/** price reveal: big range + "productos seleccionados" (never a price on a specific model) */
export const PriceCard: React.FC<{ from: number; to: number; title?: string; small?: string; top?: number }> = ({ from, to, title = "VENTA SORPRESA DE BUEN FIN", small = "EN PRODUCTOS SELECCIONADOS", top = 210 }) => {
  const f = useCurrentFrame();
  const a = useFade(from, to, 6);
  const s = interpolate(f, [from, from + 10], [0.88, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `scale(${s})` }}>
      <div style={{ background: C.cream, borderRadius: 28, padding: "20px 46px 26px", textAlign: "center", boxShadow: "0 12px 34px rgba(0,0,0,0.22)" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 38, letterSpacing: "0.12em", paddingLeft: "0.12em", color: C.ink }}>{title}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 112, lineHeight: 1.05, color: C.red, letterSpacing: "-0.02em" }}>$49 – $299</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 30, letterSpacing: "0.1em", color: C.ink }}>MXN · {small}</div>
      </div>
    </div>
  );
};

/** small store line (she says it: "solo está disponible en Avenida Stim 39 en la planta baja") */
export const Note: React.FC<{ from: number; to: number; text: string; top?: number }> = ({ from, to, text, top = 470 }) => {
  const a = useFade(from, to, 6);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ background: C.ink, color: C.white, fontFamily: "Montserrat", fontWeight: 700, fontSize: 38, padding: "12px 28px 14px", borderRadius: 16 }}>{text}</div>
    </div>
  );
};

/** end card over a real product shot: logo + lines + CTA */
export const EndCard: React.FC<{ shot: Shot; lines: string[]; cta: string; from: number; sub?: string; neutral?: boolean }> = ({ shot, lines, cta, from, sub, neutral }) => {
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
            <div key={i} style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: i === 0 ? 64 : 54, lineHeight: 1.1, color: /\$/.test(l) && !neutral ? C.red : C.ink }}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1080, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: b, transform: `translateY(${(1 - b) * 12}px)` }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ background: neutral ? C.ink : C.red, color: C.white, fontFamily: "Montserrat", fontWeight: 800, fontSize: 46, padding: "18px 40px 20px", borderRadius: 999, textAlign: "center", maxWidth: 900 }}>{cta}</div>
          {sub && <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 36, color: C.white, textShadow: "0 2px 10px rgba(0,0,0,0.7)", textAlign: "center" }}>{sub}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- the ad
export type AdConfig = { boxedSubs?: boolean; frames: number; shots: Shot[]; voices: Voice[]; music: string; musicLevel?: number; overlays: React.ReactNode; end?: { from: number; shot: Shot; lines: string[]; cta: string; sub?: string; neutral?: boolean }; sfx?: { at: number; src: string; vol: number }[] };

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
          <EndCard shot={cfg.end.shot} lines={cfg.end.lines} cta={cfg.end.cta} sub={cfg.end.sub} neutral={cfg.end.neutral} from={0} />
        </Sequence>
      )}
      {cfg.overlays}
      <Subtitles voices={cfg.voices} boxed={cfg.boxedSubs} />
      <VoiceTrack voices={cfg.voices} />
      <Audio src={staticFile(`sorpresa/${cfg.music}.wav`)} volume={vol} />
      {(cfg.sfx ?? []).map((x, i) => (
        <Sequence key={i} from={x.at} durationInFrames={30}>
          <Audio src={staticFile(x.src)} volume={x.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
