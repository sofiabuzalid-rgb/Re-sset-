// RE:SET · Teaser "la mejor temporada" — 9:16, 15 s, 30 fps.
// Material: los 4 videos (inventario s1–s3, showroom s4). Voz real de s4: dos frases, subtituladas palabra por palabra.
// Música original (editor/teaser/music.py, 120 BPM): cada corte cae en un golpe (15 cuadros).
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Freeze, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import VOZ from "./voz.json";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Cormorant", url: staticFile("fonts/Cormorant-500.woff2"), weight: "500" });
loadFont({ family: "Cormorant", url: staticFile("fonts/Cormorant-500-italic.woff2"), weight: "500", style: "italic" });

export const FPS = 30;
export const TEASER_FRAMES = 450;
const DUR: Record<string, number> = { s1: 25.2, s2: 1.6, s3: 9.6, s4: 42.0 };
const GRADE = "contrast(1.07) saturate(1.1) sepia(0.07) brightness(1.02)";
const ease = Easing.bezier(0.22, 1, 0.36, 1);

type Cut = {
  from: number; // frame in the edit
  len: number;
  src: string;
  at: number; // seconds in the source
  rate?: number; // playback speed
  ramp?: [number, number]; // speed ramp start→end
  zoom?: [number, number]; // scale start→end
  punch?: boolean; // fast punch-in at the head of the shot
  ox?: number; // horizontal focus (%)
  oy?: number;
  flash?: boolean; // light flash on the cut
  whip?: boolean; // motion blur on the way in
};

const CUTS: Cut[] = [
  // 0–1.5 s · hook (black, flash, close-ups of the festive prints)
  { from: 4, len: 20, src: "s4", at: 29.0, rate: 1.4, zoom: [1.42, 1.3], flash: true, ox: 45 },
  { from: 24, len: 21, src: "s4", at: 20.5, rate: 1.6, zoom: [1.35, 1.22], whip: true, ox: 55 },
  // 1.5–7.5 s · showroom ("Muy felices de que ya empezó la mejor temporada del año." / "Tenemos aquí las de Navidad.")
  { from: 45, len: 30, src: "s4", at: 0.25, rate: 0.9, zoom: [1.06, 1.16], flash: true, oy: 55 },
  { from: 75, len: 30, src: "s4", at: 20.3, rate: 1.1, zoom: [1.12, 1.2], whip: true },
  { from: 105, len: 30, src: "s4", at: 14.3, rate: 0.9, zoom: [1.0, 1.0], punch: true, oy: 40 },
  { from: 135, len: 20, src: "s4", at: 6.2, rate: 1.0, zoom: [1.05, 1.14], whip: true },
  { from: 155, len: 33, src: "s4", at: 24.6, ramp: [1.8, 0.8], zoom: [1.2, 1.1], ox: 40, flash: true },
  { from: 188, len: 37, src: "s4", at: 28.8, rate: 0.9, zoom: [1.1, 1.2], whip: true },
  // 7.5–11 s · inventory, building ("Tenemos estas calientitas que les han gustado muchísimo.")
  { from: 225, len: 15, src: "s1", at: 4.4, ramp: [2.0, 0.8], zoom: [1.1, 1.2], flash: true },
  { from: 240, len: 15, src: "s3", at: 2.4, rate: 1.4, zoom: [1.0, 1.0], punch: true },
  { from: 255, len: 15, src: "s1", at: 13.4, ramp: [2.0, 0.8], zoom: [1.15, 1.25], whip: true },
  { from: 270, len: 15, src: "s3", at: 7.1, rate: 1.3, zoom: [1.0, 1.0], punch: true },
  { from: 285, len: 15, src: "s1", at: 20.9, ramp: [2.2, 0.9], zoom: [1.1, 1.22], flash: true },
  { from: 300, len: 15, src: "s3", at: 3.2, rate: 1.4, zoom: [1.12, 1.24], whip: true },
  { from: 315, len: 8, src: "s1", at: 9.0, rate: 1.8, zoom: [1.0, 1.0], punch: true },
  { from: 323, len: 7, src: "s3", at: 5.6, rate: 2.0, zoom: [1.15, 1.3], whip: true },
  // 11–13 s · the festive pajamas, slower ("Es como el regalo perfecto.")
  { from: 330, len: 30, src: "s4", at: 25.0, rate: 0.75, zoom: [1.04, 1.14], flash: true },
  { from: 360, len: 30, src: "s4", at: 27.4, rate: 0.75, zoom: [1.16, 1.08], whip: true, ox: 45 },
];

/** one exact source frame. Freeze clamps to the composition length (450), so freeze at 0 and shift the clip instead */
const SrcFrame: React.FC<{ src: string; frame: number }> = ({ src, frame }) => (
  <Freeze frame={0}>
    <Sequence from={-frame} layout="none">
      <OffthreadVideo muted src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </Sequence>
  </Freeze>
);

const Clip: React.FC<{ c: Cut }> = ({ c }) => {
  const f = useCurrentFrame();
  const g = f;
  const s = c.ramp ? c.ramp[0] * g + ((c.ramp[1] - c.ramp[0]) * g * g) / (2 * c.len) : (c.rate ?? 1) * g;
  const sf = Math.max(0, Math.min(Math.floor(DUR[c.src] * FPS) - 2, Math.round(c.at * FPS + s)));
  const [z0, z1] = c.zoom ?? [1.05, 1.12];
  let z = interpolate(f, [0, c.len], [z0, z1], { easing: ease, extrapolateRight: "clamp" });
  if (c.punch) z *= interpolate(f, [0, 5], [1.18, 1.0], { easing: ease, extrapolateRight: "clamp" });
  const blur = c.whip ? interpolate(f, [0, 4], [14, 0], { extrapolateRight: "clamp" }) : 0;
  const dx = c.whip ? interpolate(f, [0, 5], [-70, 0], { easing: ease, extrapolateRight: "clamp" }) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `translateX(${dx}px) scale(${z})`, transformOrigin: `${c.ox ?? 50}% ${c.oy ?? 50}%`, filter: `${GRADE} blur(${blur}px)` }}>
        <SrcFrame src={`teaser/${c.src}.mp4`} frame={sf} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** warm light flash on the cut */
const Flash: React.FC<{ peak?: number }> = ({ peak = 0.75 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 1, 7], [peak, peak * 0.9, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "radial-gradient(70% 55% at 50% 45%, #FFF6E6 0%, #FFE3B8 60%, rgba(255,214,160,0.6) 100%)", opacity: o, mixBlendMode: "screen" }} />;
};

/** warm vignette + fine grain: one look across all the footage */
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(120% 85% at 50% 45%, rgba(0,0,0,0) 55%, rgba(12,6,2,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,170,90,0.06), rgba(120,40,10,0.08))", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ opacity: 0.07, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${f % 7}'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")` }} />
    </>
  );
};

const SHADOW = "0 2px 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.6)";

const HookText: React.FC = () => {
  const f = useCurrentFrame();
  const words = "Algo muy esperado está por llegar…".split(" ");
  const veil = interpolate(f, [0, 6, 34, 41], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 90px" }}>
      <AbsoluteFill style={{ background: "radial-gradient(75% 30% at 50% 50%, rgba(0,0,0,0.5), rgba(0,0,0,0) 100%)", opacity: veil }} />
      <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 92, lineHeight: 1.05, color: "#FFFFFF", textAlign: "center", textShadow: SHADOW }}>
        {words.map((w, i) => {
          const a = interpolate(f, [2 + i * 2.2, 8 + i * 2.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span key={i} style={{ display: "inline-block", opacity: a, transform: `translateY(${(1 - a) * 14}px)`, filter: `blur(${(1 - a) * 6}px)`, marginRight: "0.24em" }}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

type W = { w: string; s: number; e: number };
/** split a phrase into even one-line chunks: at most 4 words and ~22 characters each (5 words → 3 + 2) */
const chunks = (words: W[]) => {
  const chars = words.reduce((k, w) => k + w.w.length + 1, 0);
  const n = Math.max(Math.ceil(words.length / 4), Math.ceil(chars / 22));
  const out: W[][] = [];
  let i = 0;
  for (let k = 0; k < n; k++) {
    const size = Math.ceil((words.length - i) / (n - k));
    out.push(words.slice(i, i + size));
    i += size;
  }
  return out;
};
const Subtitle: React.FC<{ words: W[]; len: number }> = ({ words, len }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const out = interpolate(f, [len - 6, len], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ws = words.map((w, i) => ({ ...w, w: i === 0 ? w.w[0].toUpperCase() + w.w.slice(1) : w.w }));
  const cs = chunks(ws);
  let k = 0;
  for (let i = 0; i < cs.length; i++) if (t >= cs[i][0].s - 0.06) k = i;
  const c = cs[k];
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 430, opacity: out }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 58, letterSpacing: "0.01em", color: "#FFFFFF", textAlign: "center", textShadow: SHADOW, maxWidth: 900, lineHeight: 1.2 }}>
        {c.map((w, i) => {
          const a = interpolate(t, [w.s - 0.04, w.s + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span key={`${k}-${i}`} style={{ opacity: 0.15 + 0.85 * a, marginRight: "0.28em", display: "inline-block", transform: `translateY(${(1 - a) * 6}px)` }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const bg = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const l1 = interpolate(f, [4, 18], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l2 = interpolate(f, [30, 42], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logo = interpolate(f, [34, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: bg, transform: `scale(${1.12 + f * 0.0012})`, filter: `${GRADE} blur(26px) brightness(0.42)` }}>
        <SrcFrame src="teaser/s4.mp4" frame={Math.round(26.8 * FPS)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(90% 60% at 50% 50%, rgba(0,0,0,0.1), rgba(0,0,0,0.6))", opacity: bg }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 100px" }}>
        <div style={{ opacity: l1, transform: `translateY(${(1 - l1) * 18}px)`, fontFamily: "Cormorant", fontWeight: 500, fontSize: 86, lineHeight: 1.08, color: "#FFFFFF", textAlign: "center", textShadow: SHADOW }}>
          Estamos preparando
          <br />
          la mejor temporada.
        </div>
        <div style={{ opacity: l2, marginTop: 56, fontFamily: "Montserrat", fontWeight: 500, fontSize: 40, letterSpacing: "0.42em", paddingLeft: "0.42em", color: "#F3E6D2", textShadow: SHADOW }}>
          MUY PRONTO.
        </div>
      </AbsoluteFill>
      <Img src={staticFile("brand/reset-logo-white.png")} style={{ position: "absolute", bottom: 150, left: "50%", width: 260, marginLeft: -130, opacity: logo * 0.92 }} />
    </AbsoluteFill>
  );
};

// voice placement (frames in the edit) and a music bed that dips under every phrase
const VOICE = [
  { id: "felices", at: 40 },
  { id: "navidad", at: 154 },
  { id: "calientitas", at: 222 },
  { id: "regalo", at: 326 },
  { id: "esperamos", at: 404 },
] as const;

export const Teaser: React.FC = () => {
  const dips = VOICE.map((v) => [v.at, v.at + Math.round((VOZ as any)[v.id].dur * FPS)]);
  const musicVol = (f: number) => {
    let g = 0.8;
    for (const [a, b] of dips) g = Math.min(g, interpolate(f, [a - 6, a, b, b + 8], [0.8, 0.13, 0.13, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    return g * interpolate(f, [TEASER_FRAMES - 20, TEASER_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {CUTS.map((c, i) => (
        <Sequence key={i} from={c.from} durationInFrames={c.len}>
          <Clip c={c} />
          {c.flash && <Flash />}
        </Sequence>
      ))}
      <Sequence from={390} durationInFrames={60}>
        <EndCard />
      </Sequence>
      <Sequence from={388} durationInFrames={8}>
        <Flash peak={0.5} />
      </Sequence>
      <Look />
      <Sequence from={4} durationInFrames={41}>
        <HookText />
      </Sequence>
      {VOICE.map((v) => {
        const m = (VOZ as any)[v.id];
        const len = Math.round(m.dur * FPS) + 6;
        return (
          <Sequence key={v.id} from={v.at} durationInFrames={len}>
            <Subtitle words={m.words} len={len} />
            <Audio src={staticFile(m.src)} />
          </Sequence>
        );
      })}
      <Audio src={staticFile("teaser/musica.wav")} volume={musicVol} />
      <Sequence from={22} durationInFrames={20}>
        <Audio src={staticFile("outlet4/audio/sfx_whoosh.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={221} durationInFrames={20}>
        <Audio src={staticFile("outlet4/audio/sfx_whoosh.wav")} volume={0.3} />
      </Sequence>
    </AbsoluteFill>
  );
};
