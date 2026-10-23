// RE:SET — campaña de 4 Meta Ads: piezas compartidas (tomas, nieve con seguimiento, subtítulos, precios, música con ducking).
// Cada anuncio vive en src/campana/<ad>/ (config.ts = lo editable, Ad.tsx = composición) y usa timing.json de editor/campana/voz.py.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame } from "remotion";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Cormorant", url: staticFile("fonts/Cormorant-500-italic.woff2"), weight: "500", style: "italic" });

export const FPS = 30;
export const COLORS = {
  ivory: "#FFFBF2",
  ink: "#151515",
  lime: "#E2EC95", // brand
  slate: "#7B95AB", // Pantone 536 U
  rose: "#B07E7F", // Pantone 679 U
};
export const SHADOW = "0 2px 14px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.5)";
// Meta Reels / Stories safe zone: keep text between y≈270 (top 14 %) and y≈1250 (above the bottom 35 % UI)
export const SAFE = { top: 280, bottom: 1250 };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const F = (s: number) => Math.round(s * FPS);

export type Word = { w: string; s: number; e: number; piece: number; br: boolean };
export type Timing = { fps: number; total: number; pieceStarts: number[]; pieceSrc: (number | null)[]; voiceEnd: number; lastWord: number; ambient: boolean; words: Word[] };

/** helpers bound to one ad's timing: w(text, n) = output start of the n-th occurrence of a word; lip(k, t) = source second for lip sync */
export const anchors = (t: Timing) => ({
  w: (text: string, n = 0) => {
    const hit = t.words.filter((x) => x.w === text)[n];
    if (!hit) throw new Error(`palabra no encontrada: ${text} #${n}`);
    return hit.s - 0.03;
  },
  P: t.pieceStarts,
  lip: (k: number, out: number) => (t.pieceSrc[k] as number) + (out - t.pieceStarts[k]),
});

export type Panel = { src: string; at: number; tag?: "adulto" | "ninos" };
export type Snow = { poly: [number, number][][]; track: [number, number][]; refFrame: number; density?: number };
export type Shot = {
  name: string;
  src: string;
  from: number;
  to: number;
  at: number;
  zoom?: [number, number];
  origin?: [number, number];
  rate?: number;
  xf?: number; // crossfade-in frames (0 = hard cut)
  panels?: Panel[];
  snow?: Snow;
};
export const sync = (lip: (k: number, t: number) => number, name: string, k: number, src: string, from: number, to: number, extra: Partial<Shot> = {}): Shot => ({ name, src, from, to, at: lip(k, from), ...extra });

/* ---------- prices (confirmed by the client) ---------- */
export const PRICES = { adulto: { label: "Adulto", price: "$999" }, ninos: { label: "Niños", price: "$699" } };

export const PriceTag: React.FC<{ size: "adulto" | "ninos"; scale?: number; delay?: number }> = ({ size, scale = 1, delay = 0 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 9], [0, 1], { ...clamp, easing: easeOut });
  const { label, price } = PRICES[size];
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px) scale(${scale})`, display: "flex", flexDirection: "column", alignItems: "center", background: size === "adulto" ? COLORS.ivory : COLORS.lime, color: COLORS.ink, borderRadius: 26, padding: "12px 30px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 32, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 84, lineHeight: 0.95, letterSpacing: "-0.02em" }}>{price}</div>
    </div>
  );
};

/* ---------- snow, only behind the window glass ---------- */
// flakes are drawn in a layer clipped to the window polygon(s); the polygon follows the camera (phase-correlation track of the
// background, see editor/campana) so the snow stays "outside". Three depths: far = small/slow/soft, near = bigger/faster.
const SnowLayer: React.FC<{ snow: Snow; srcFrame: number; t: number }> = ({ snow, srcFrame, t }) => {
  const tr = snow.track[Math.min(snow.track.length - 1, Math.max(0, srcFrame))];
  const ref = snow.track[snow.refFrame];
  const dx = tr[0] - ref[0];
  const dy = tr[1] - ref[1];
  const n = snow.density ?? 140;
  return (
    <>
      {snow.poly.map((poly, pi) => {
        const xs = poly.map((p) => p[0]);
        const ys = poly.map((p) => p[1]);
        const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
        const clip = `polygon(${poly.map(([x, y]) => `${x + dx}px ${y + dy}px`).join(",")})`;
        return (
          <AbsoluteFill key={pi} style={{ clipPath: clip }}>
            {Array.from({ length: Math.round((n * (x1 - x0) * (y1 - y0)) / 200000) }).map((_, i) => {
              const depth = random(`d${pi}-${i}`); // 0 far … 1 near
              const speed = 60 + depth * 140; // px/s
              const size = 4 + depth * 9;
              const span = y1 - y0 + 40;
              const y = y0 - 20 + ((random(`y${pi}-${i}`) * span + t * speed) % span);
              const x = x0 + random(`x${pi}-${i}`) * (x1 - x0) + Math.sin(t * (0.6 + depth) + i) * (8 + depth * 14) + t * 10;
              return (
                <div key={i} style={{ position: "absolute", left: x + dx, top: y + dy, width: size, height: size, borderRadius: "50%", background: "#fff", opacity: 0.5 + depth * 0.45, filter: `blur(${1.4 - depth * 0.8}px)` }} />
              );
            })}
          </AbsoluteFill>
        );
      })}
    </>
  );
};

/* ---------- one shot ---------- */
export const ShotView: React.FC<{ s: Shot; frames: number; grade: string; base: string }> = ({ s, frames, grade, base }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, frames], s.zoom ?? [1, 1.04], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const o = s.origin ?? [50, 50];
  const fadeIn = s.xf ? interpolate(f, [0, s.xf], [0, 1], clamp) : 1;
  if (s.panels) {
    const four = s.panels.length === 4;
    return (
      <AbsoluteFill style={{ opacity: fadeIn, backgroundColor: COLORS.ivory, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: four ? "1fr 1fr" : "1fr", gap: 6 }}>
        {s.panels.map((p, k) => (
          <div key={k} style={{ position: "relative", overflow: "hidden" }}>
            <OffthreadVideo muted src={staticFile(`${base}/${p.src}.mp4`)} startFrom={F(p.at)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: grade, transform: `scale(${z})` }} />
            {p.tag && (
              <div style={{ position: "absolute", left: 0, right: 0, top: four ? 40 : SAFE.top, display: "flex", justifyContent: "center" }}>
                <PriceTag size={p.tag} scale={four ? 0.6 : 1} delay={k * 4} />
              </div>
            )}
          </div>
        ))}
      </AbsoluteFill>
    );
  }
  const rate = s.rate ?? 1;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000", opacity: fadeIn }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${o[0]}% ${o[1]}%` }}>
        <OffthreadVideo muted src={staticFile(`${base}/${s.src}.mp4`)} startFrom={F(s.at)} playbackRate={rate} style={{ width: "100%", height: "100%", objectFit: "cover", filter: grade }} />
        {s.snow && <SnowLayer snow={s.snow} srcFrame={F(s.at) + Math.round(f * rate)} t={(F(s.at) + f * rate) / FPS} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** all shots of an ad; a shot with xf starts xf frames early and fades over the previous one (true dissolve, no black) */
export const Timeline: React.FC<{ shots: Shot[]; grade: string; base: string }> = ({ shots, grade, base }) => (
  <>
    {shots.map((s) => {
      const from = F(s.from) - (s.xf ?? 0);
      const frames = F(s.to) - from;
      return (
        <Sequence key={s.name} name={s.name} from={from} durationInFrames={frames}>
          <ShotView s={s} frames={frames} grade={grade} base={base} />
        </Sequence>
      );
    })}
  </>
);

/* ---------- subtitles: her exact words ---------- */
// blocks of ≤ ~24 characters (a phrase's last word may stay up to 32 instead of sitting alone), break on punctuation,
// a new clause ("y …") opens a new block once the current one has some length; max two lines at the given width.
export const makeBlocks = (words: Word[], max = 24) => {
  const blocks: Word[][] = [];
  words.forEach((w, i) => {
    const b = blocks[blocks.length - 1];
    const prev = b?.[b.length - 1];
    const cur = b ? b.map((x) => x.w).join(" ").length : 0;
    const len = cur + 1 + w.w.length;
    const nx = words[i + 1];
    const endsPhrase = w.br || nx?.piece !== w.piece || nx?.w === "y";
    const full = len > max && !(endsPhrase && len <= max + 8);
    if (!b || full || prev!.br || w.piece !== prev!.piece || (w.w === "y" && cur > 12)) blocks.push([w]);
    else b.push(w);
  });
  return blocks;
};

export type CaptionStyle = { top: number; size: number; weight: number; font?: string; italic?: boolean; scrim: string; highlight: Set<string>; hl: string; width?: number };

export const Captions: React.FC<{ words: Word[]; style: CaptionStyle; until: number }> = ({ words, style, until }) => {
  const blocks = React.useMemo(() => makeBlocks(words), [words]);
  const f = useCurrentFrame();
  if (f >= F(until)) return null;
  const t = f / FPS;
  const i = blocks.findIndex((b, k) => t >= b[0].s - 0.06 && t < Math.min(blocks[k + 1]?.[0].s ?? 1e9, b[b.length - 1].e + 0.4));
  if (i < 0) return null;
  const b = blocks[i];
  const o = interpolate(t, [b[0].s - 0.06, b[0].s + 0.06], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: style.top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: style.width ?? 880, opacity: o, textAlign: "center", fontFamily: style.font ?? "Montserrat", fontStyle: style.italic ? "italic" : "normal", fontWeight: style.weight, fontSize: style.size, lineHeight: 1.2, color: COLORS.ivory, textShadow: SHADOW, background: style.scrim, padding: "10px 24px 14px", borderRadius: 16 }}>
        {b.map((w, k) => (
          <span key={k} style={{ color: style.highlight.has(w.w.replace(/[.,?¿]/g, "")) ? style.hl : COLORS.ivory }}>
            {k ? " " : ""}
            {w.w}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ---------- music bed with ducking (licensed track goes in config; none = silent) ---------- */
export type Music = { src: string | null; bed: number; duck: number };
export const MusicBed: React.FC<{ music: Music; words: Word[]; total: number }> = ({ music, words, total }) => {
  if (!music.src) return null;
  const spans = words.map((w) => [w.s - 0.25, w.e + 0.3]);
  const duckAt = (t: number) => {
    const d = Math.min(...spans.map(([a, b]) => (t < a ? a - t : t > b ? t - b : 0)));
    return interpolate(d, [0, 0.25], [music.duck, music.bed], clamp); // ~0.25 s ramps around her words
  };
  return <Audio src={staticFile(music.src)} volume={(f) => duckAt(f / FPS) * interpolate(f, [0, 12], [0, 1], clamp) * interpolate(f, [total - 30, total], [1, 0], clamp)} />;
};

/** fade a graphic in/out over a window */
export const useWindow = (from: number, to: number, inF = 8, outF = 6) => {
  const f = useCurrentFrame();
  return Math.min(interpolate(f, [F(from), F(from) + inF], [0, 1], { ...clamp, easing: easeOut }), interpolate(f, [F(to) - outF, F(to)], [1, 0], clamp));
};

/** subtle animated film grain (SVG noise), for the cinematic piece */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="1080" height="1920">
        <filter id={`g${f % 4}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 4} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${f % 4})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.28 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }} />
);

/** store + web block used by the end cards (verified: Av. Stim 39 PB local 4 on resetwear.com.mx; Perisur given by the client and said by her on camera) */
export const STORES = [
  { name: "Perisur", detail: "Kiosco, planta baja" },
  { name: "Av. Stim 39", detail: "Planta baja, local 4" },
];
export const WEB = "resetwear.com.mx";

/** "Perisur · Kiosco, planta baja | Av. Stim 39 · Planta baja, local 4" + web pill */
export const StoreBlock: React.FC<{ delay: number; accent?: string; serif?: boolean }> = ({ delay, accent = COLORS.lime, serif }) => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [delay + s, delay + s + 12], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ display: "flex", gap: 22 }}>
        {STORES.map((s, k) => (
          <div key={s.name} style={{ opacity: a(k * 4), transform: `translateY(${(1 - a(k * 4)) * 12}px)`, textAlign: "center", border: "2px solid rgba(255,251,242,0.55)", borderRadius: 18, padding: "12px 22px", minWidth: 330 }}>
            <div style={{ fontFamily: serif ? "Cormorant" : "Montserrat", fontStyle: serif ? "italic" : "normal", fontWeight: serif ? 500 : 800, fontSize: serif ? 50 : 38, color: COLORS.ivory, lineHeight: 1.05 }}>{s.name}</div>
            <div style={{ fontFamily: "Montserrat", fontWeight: 500, fontSize: 26, color: COLORS.ivory, opacity: 0.9, marginTop: 4 }}>{s.detail}</div>
          </div>
        ))}
      </div>
      <div style={{ opacity: a(10), transform: `scale(${0.92 + 0.08 * a(10)})`, background: accent, color: COLORS.ink, fontFamily: "Montserrat", fontWeight: 800, fontSize: 40, padding: "16px 44px", borderRadius: 999 }}>{WEB}</div>
    </div>
  );
};
