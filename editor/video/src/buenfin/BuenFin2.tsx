// RE:SET — BUEN FIN 2026 · segunda tanda (05–08). Foco: "BUEN FIN · 15% OFF EN TODA LA TIENDA", visible siempre.
// Voz: solo frases reales de la protagonista (editor/campana/voz.py bf05…bf08). La promoción va como texto gráfico.
// Tiempos en segundos (BeatProvider B = 1); los cortes musicales se calculan con el golpe de la afro house (0.5725 s).
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Captions, clamp, easeOut, F, FPS, StoreBlock, Timing, Word } from "../campana/shared";
import { At, BeatProvider, BlurDefs, Fx, Sfx, Shot, useSeg, Vid } from "../outlet4/fx";
import t05 from "../campana/bf05/timing.json";
import t06 from "../campana/bf06/timing.json";
import t07 from "../campana/bf07/timing.json";
import t08 from "../campana/bf08/timing.json";

loadFont({ family: "Playfair", url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"), weight: "400 900", style: "italic" });

const T5 = t05 as Timing;
const T6 = t06 as Timing;
const T7 = t07 as Timing;
const T8 = t08 as Timing;
export const BF2_FRAMES = { bf05: T5.total, bf06: T6.total, bf07: T7.total, bf08: T8.total };

const INK = "#141414";
const IVORY = "#FFFBF2";
const LIME = "#E2EC95";
const SANS = "Montserrat";
const SERIF = "Playfair";
const SH = "0 4px 26px rgba(0,0,0,0.5)";
const GRADE = "brightness(1.05) contrast(1.06) saturate(1.06)";
const AB = 0.5725; // one beat of the afro house
const AFRO = "outlet4/audio/afrohouse.mp3";
const AFRO_GRID = 14.338; // a downbeat of the track; its drop is 8 beats later (18.918 s)

/* ---------- music, ducked under her words ---------- */
const Bed: React.FC<{ src: string; startS: number; words: Word[]; total: number; bed?: number; duck?: number }> = ({ src, startS, words, total, bed = 0.8, duck = 0.13 }) => {
  const spans = words.map((w) => [w.s - 0.25, w.e + 0.3]);
  const g = (t: number) => {
    const d = spans.length ? Math.min(...spans.map(([a, b]) => (t < a ? a - t : t > b ? t - b : 0))) : 9;
    return interpolate(d, [0, 0.25], [duck, bed], clamp);
  };
  return <Audio src={staticFile(src)} startFrom={Math.round(startS * FPS)} volume={(f) => g(f / FPS) * interpolate(f, [0, 4], [0, 1], clamp) * interpolate(f, [total - 24, total], [1, 0], clamp)} />;
};

const beatPunch = (f: number, phase = 0, amt = 0.05) => {
  const per = AB * FPS;
  return 1 + amt * Math.exp(-(((f - phase) % per) + per) % per / 3.5);
};

/* ---------- the offer, always readable ---------- */
/** lime band under the top safe line: BUEN FIN | 15% OFF EN TODA LA TIENDA (absolute seconds) */
const OfferBar: React.FC<{ from: number; to: number; phase?: number }> = ({ from, to, phase = 0 }) => {
  const f = useCurrentFrame();
  if (f < F(from) || f >= F(to)) return null;
  const p = interpolate(f, [F(from), F(from) + 7], [0, 1], { ...clamp, easing: easeOut });
  const o = interpolate(f, [F(to) - 5, F(to)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - p) * -40}px)` }}>
      <div style={{ display: "flex", alignItems: "center", background: LIME, borderRadius: 999, padding: "8px 30px 8px 8px", gap: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.28)", transform: `scale(${beatPunch(f, F(phase), 0.025)})` }}>
        <div style={{ background: INK, color: IVORY, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.22em", padding: "12px 20px 12px 26px", borderRadius: 999 }}>BUEN FIN</div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, color: INK, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>15% OFF <span style={{ fontWeight: 700, fontSize: 30 }}>EN TODA LA TIENDA</span></div>
      </div>
    </div>
  );
};

/** the big lockup: BUEN FIN / 15% / OFF / EN TODA LA TIENDA (local frames) */
const Big15: React.FC<{ top: number; size?: number; light?: boolean; delay?: number }> = ({ top, size = 1, light, delay = 0 }) => {
  const f = useCurrentFrame() - delay;
  if (f < 0) return null;
  const p = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: easeOut });
  const fg = light ? INK : IVORY;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, p * 1.6), transform: `scale(${1.3 - 0.3 * p})` }}>
      <div style={{ background: light ? INK : LIME, color: light ? IVORY : INK, fontFamily: SANS, fontWeight: 800, fontSize: 44 * size, letterSpacing: "0.3em", padding: `${8 * size}px ${22 * size}px ${8 * size}px ${34 * size}px`, borderRadius: 10 }}>BUEN FIN</div>
      <div style={{ display: "flex", alignItems: "flex-start", fontFamily: SANS, fontWeight: 900, color: fg, textShadow: light ? "none" : SH, lineHeight: 0.85, marginTop: 10 * size }}>
        <span style={{ fontSize: 330 * size, letterSpacing: "-0.05em" }}>15</span>
        <span style={{ display: "flex", flexDirection: "column", marginLeft: 10 * size, marginTop: 34 * size }}>
          <span style={{ fontSize: 150 * size, lineHeight: 0.9 }}>%</span>
          <span style={{ fontSize: 108 * size, lineHeight: 0.9, color: light ? INK : LIME }}>OFF</span>
        </span>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46 * size, letterSpacing: "0.12em", color: fg, textShadow: light ? "none" : SH, marginTop: 16 * size }}>EN TODA LA TIENDA</div>
    </div>
  );
};

/** round 15% OFF stamp that slams onto the product (local frames) */
const Stamp: React.FC<{ x: number; y: number; r?: number; size?: number }> = ({ x, y, r = -12, size = 250 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [2, 8], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: LIME, border: `8px solid ${INK}`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, color: INK, boxShadow: "0 18px 40px rgba(0,0,0,0.35)", opacity: Math.min(1, p * 2), transform: `scale(${2.2 - 1.2 * p}) rotate(${r}deg)` }}>
      <div style={{ fontSize: size * 0.13, letterSpacing: "0.2em", marginLeft: "0.2em" }}>BUEN FIN</div>
      <div style={{ fontSize: size * 0.36, lineHeight: 0.9, letterSpacing: "-0.04em" }}>15%</div>
      <div style={{ fontSize: size * 0.17, letterSpacing: "0.12em", marginLeft: "0.12em" }}>OFF</div>
    </div>
  );
};

/** lines of copy that pop on one after another (local seconds) */
type L = { t: string; at: number; bg?: string; fg?: string; size?: number; serif?: boolean };
const Lines: React.FC<{ lines: L[]; top: number; out?: number; gap?: number }> = ({ lines, top, out, gap = 12 }) => {
  const f = useCurrentFrame();
  const seg = useSeg();
  const o = interpolate(f, [(out !== undefined ? F(out) : seg) - 5, out !== undefined ? F(out) : seg], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top, left: 56, right: 56, display: "flex", flexDirection: "column", alignItems: "center", gap, opacity: o }}>
      {lines.map((l, i) => {
        const p = interpolate(f, [F(l.at), F(l.at) + 6], [0, 1], { ...clamp, easing: easeOut });
        if (p <= 0) return <div key={i} style={{ height: 0 }} />;
        return (
          <div key={i} style={{ background: l.bg, color: l.fg ?? INK, fontFamily: l.serif ? SERIF : SANS, fontStyle: l.serif ? "italic" : "normal", fontWeight: l.serif ? 600 : 900, fontSize: l.size ?? 70, lineHeight: 1.05, letterSpacing: l.serif ? "-0.01em" : "-0.02em", textAlign: "center", padding: l.bg ? "10px 28px 16px" : 0, borderRadius: 14, textShadow: l.bg ? "none" : SH, opacity: Math.min(1, p * 1.6), transform: `scale(${1.15 - 0.15 * p}) translateY(${(1 - p) * 14}px)`, boxShadow: l.bg ? "0 12px 34px rgba(0,0,0,0.25)" : "none" }}>
            {l.t}
          </div>
        );
      })}
    </div>
  );
};

/** closing card over blurred footage: logo, the ad's line, the offer, CTA, stores, web (local frames) */
const End: React.FC<{ src: string; at: number; line: string; cta: string }> = ({ src, at, line, cta }) => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 10], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(18px) brightness(0.55)", transform: "scale(1.15)" }}>
        <Vid src={src} at={at} rate={0.5} />
      </AbsoluteFill>
      <Img src={staticFile("brand/reset-logo-white.png")} style={{ position: "absolute", top: 262, left: "50%", width: 300, marginLeft: -150, opacity: a(0) }} />
      <div style={{ position: "absolute", top: 400, left: 60, right: 60, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 64, lineHeight: 1.08, color: IVORY, opacity: a(4) }}>{line}</div>
      <Big15 top={540} size={0.82} delay={6} />
      <div style={{ position: "absolute", top: 1060, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a(14), transform: `scale(${0.8 + 0.2 * a(14)})` }}>
        <div style={{ background: LIME, color: INK, fontFamily: SANS, fontWeight: 900, fontSize: 58, padding: "18px 56px 22px", borderRadius: 999, boxShadow: "0 14px 34px rgba(0,0,0,0.35)" }}>{cta}</div>
      </div>
      <div style={{ position: "absolute", top: 1200, left: 0, right: 0 }}>
        <StoreBlock delay={18} />
      </div>
    </AbsoluteFill>
  );
};

/** lip-synced shot of her: source second = srcStart + (out − pieceStart) */
const lip = (T: Timing, k: number, out: number) => (T.pieceSrc[k] as number) + (out - T.pieceStarts[k]);

const CAP = { top: 1250, size: 50, weight: 700, scrim: "rgba(16,16,16,0.55)", highlight: new Set(["RE:SET", "Perisur", "Stim", "calidad", "cómodo", "cómoda", "transparenta", "regalar", "familia"]), hl: LIME };

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BeatProvider B={1} off={0}>
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <BlurDefs />
      {children}
    </AbsoluteFill>
  </BeatProvider>
);

/* =====================================================================================
   05 · ¿CUÁL TIENE 15%? → TODAS. Un sello de 15% cae sobre cada pijama, una por golpe
   ===================================================================================== */
const DROP5 = 4 * AB; // the music starts 4 beats before its drop
const ALL: [string, number, number, number][] = [
  // [clip, second, stamp x, stamp y]
  ["IMG_8943", 1.6, 700, 560], ["IMG_2842", 1.0, 90, 600], ["IMG_9051", 0.4, 720, 640], ["IMG_2848", 0.8, 100, 520], ["IMG_9025", 0.3, 690, 520],
  ["IMG_2861", 0.4, 110, 640], ["IMG_8974", 1.0, 700, 600], ["IMG_2857", 0.6, 90, 560], ["IMG_9018", 4.8, 700, 640], ["IMG_2865", 0.4, 110, 520],
  ["IMG_9036", 1.0, 700, 560], ["IMG_2052", 1.0, 110, 640], ["IMG_2851", 1.5, 700, 520], ["IMG_8933", 0.6, 90, 600], ["IMG_2041", 1.0, 700, 640],
  ["IMG_2862", 0.6, 100, 560], ["IMG_2254_L", 2.0, 720, 600],
];
const FINS: Fx[] = ["snap", "whip", "snap", "zoom", "snap", "whipL", "snap", "push"];

const Count: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ position: "absolute", top: 1330, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ background: INK, color: IVORY, fontFamily: SANS, fontWeight: 800, fontSize: 40, padding: "12px 30px 14px", borderRadius: 999 }}>
      Esta también <span style={{ color: LIME }}>✓</span> <span style={{ opacity: 0.6, fontWeight: 600 }}>{n}</span>
    </div>
  </div>
);

export const BF05: React.FC = () => {
  const voice = T5.pieceStarts[1];
  return (
    <Frame>
      {/* hook on ivory: the question, word by word */}
      <At b0={0} b1={DROP5}>
        <AbsoluteFill style={{ background: IVORY }} />
        <Lines top={560} lines={[{ t: "¿Qué pijamas", at: 0.0, size: 104 }, { t: "de RE:SET tienen", at: 0.35, size: 92 }, { t: "15% OFF", at: 0.75, size: 150, bg: LIME }, { t: "este Buen Fin?", at: 1.15, size: 92 }]} />
      </At>
      {/* the answer, on the drop */}
      <At b0={DROP5} b1={DROP5 + 2 * AB}>
        <Shot src="IMG_8943" at={2.6} fin="zoom" />
        <AbsoluteFill style={{ background: "rgba(16,16,16,0.35)" }} />
        <Lines top={640} lines={[{ t: "TODAS.", at: 0, size: 240, fg: LIME }]} />
      </At>
      {ALL.map(([src, at, x, y], i) => (
        <At key={i} b0={DROP5 + (2 + i) * AB} b1={i === ALL.length - 1 ? voice : DROP5 + (3 + i) * AB} pre={["whip", "whipL", "push"].includes(FINS[i % FINS.length]) ? 6 : 0}>
          <Shot src={src} at={at} fin={FINS[i % FINS.length]} z={i % 2 ? [1.08, 1.0] : [1.0, 1.08]} />
          <Stamp x={x} y={y} r={i % 2 ? 10 : -12} />
          <Count n={i + 1} />
        </At>
      ))}
      {/* her: where */}
      <At b0={voice} b1={T5.voiceEnd}>
        <Shot src="IMG_9054" at={lip(T5, 1, voice)} z={[1.0, 1.05]} />
      </At>
      <OfferBar from={DROP5 + 2 * AB} to={T5.voiceEnd} phase={DROP5} />
      <Captions words={T5.words} until={T5.voiceEnd} style={CAP} />
      <At b0={T5.voiceEnd} b1={T5.total / FPS}>
        <End src="IMG_9051" at={1.0} line="Todas tus favoritas," cta="Ven por la tuya" />
      </At>
      {ALL.map((_, i) => <Sfx key={i} b={DROP5 + (2 + i) * AB + 0.07} name="pop" vol={0.22} />)}
      <Sfx b={DROP5} name="impact" vol={0.5} />
      <Audio src={staticFile("campana/bf05/voice.wav")} />
      <Bed src={AFRO} startS={AFRO_GRID + 4 * AB} words={T5.words} total={T5.total} bed={0.9} />
    </Frame>
  );
};

/* =====================================================================================
   06 · ADELANTA TUS REGALOS — su idea de regalo + mismo estampado adulto y niño, con 15% OFF de Buen Fin
   ===================================================================================== */
const Split2: React.FC<{ a: [string, number]; b: [string, number]; la: string; lb: string }> = ({ a, b, la, lb }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: easeOut });
  const lab = (t: string) => <div style={{ position: "absolute", bottom: 640, left: 0, right: 0, textAlign: "center" }}><span style={{ background: IVORY, color: INK, fontFamily: SANS, fontWeight: 900, fontSize: 46, padding: "8px 24px 10px", borderRadius: 12 }}>{t}</span></div>;
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 536, height: 1920, overflow: "hidden", transform: `translateY(${(1 - p) * -500}px)` }}>
        <AbsoluteFill style={{ filter: GRADE, transform: "scale(1.06)" }}><Vid src={a[0]} at={a[1]} /></AbsoluteFill>
        {lab(la)}
      </div>
      <div style={{ position: "absolute", left: 544, top: 0, width: 536, height: 1920, overflow: "hidden", transform: `translateY(${(1 - p) * 500}px)` }}>
        <AbsoluteFill style={{ filter: GRADE, transform: "scale(1.06)" }}><Vid src={b[0]} at={b[1]} /></AbsoluteFill>
        {lab(lb)}
      </div>
    </AbsoluteFill>
  );
};

export const BF06: React.FC = () => {
  const P = T6.pieceStarts;
  return (
    <Frame>
      {/* her idea, with the hook card from frame 0 */}
      <At b0={0} b1={P[1]}>
        <Shot src="IMG_8931" at={lip(T6, 0, 0)} z={[1.0, 1.05]} />
        <Lines top={330} lines={[{ t: "REGALOS DE NAVIDAD", at: 0, size: 64, bg: INK, fg: IVORY }, { t: "con 15% OFF este Buen Fin", at: 0.35, size: 54, bg: LIME }]} />
      </At>
      {/* the gift idea: adult and child racks, the offer */}
      <At b0={P[1]} b1={P[1] + 0.8}><Shot src="IMG_2052" at={1.0} fin="snap" /></At>
      <At b0={P[1] + 0.8} b1={P[1] + 1.6}><Shot src="IMG_2053" at={1.0} fin="snap" /></At>
      <At b0={P[1] + 1.6} b1={P[1] + 2.4}><Shot src="IMG_2041" at={1.0} fin="snap" /></At>
      <At b0={P[1] + 2.4} b1={P[2]}><Shot src="IMG_2044" at={1.0} fin="snap" /></At>
      <At b0={P[1]} b1={P[2]}>
        <AbsoluteFill style={{ background: "rgba(16,16,16,0.32)" }} />
        <Big15 top={520} />
      </At>
      {/* her: combine with the family */}
      <At b0={P[2]} b1={P[3]}><Shot src="IMG_8946" at={lip(T6, 2, P[2])} z={[1.0, 1.05]} /></At>
      {/* same print, adult and child */}
      <At b0={P[3]} b1={P[3] + 1.7}><Split2 a={["IMG_2052", 2.0]} b={["IMG_2053", 2.0]} la="ADULTO" lb="NIÑO" /></At>
      <At b0={P[3] + 1.7} b1={P[4]}><Split2 a={["IMG_2041", 2.5]} b={["IMG_2044", 2.0]} la="ADULTO" lb="NIÑO" /></At>
      <At b0={P[3]} b1={P[4]}><Lines top={360} lines={[{ t: "Mismo estampado,", at: 0.1, size: 62, serif: true, bg: IVORY }, { t: "toda la familia", at: 0.4, size: 62, bg: INK, fg: IVORY }]} /></At>
      {/* her: the close, with a cut-away while she lists */}
      <At b0={P[4]} b1={17.1}><Shot src="IMG_8949" at={lip(T6, 4, P[4])} z={[1.0, 1.05]} /></At>
      <At b0={17.1} b1={18.4}><Shot src="IMG_8936" at={1.6} fin="snap" /></At>
      <At b0={18.4} b1={T6.voiceEnd}><Shot src="IMG_8949" at={lip(T6, 4, 18.4)} /></At>
      <OfferBar from={P[2]} to={T6.voiceEnd} />
      <Captions words={T6.words} until={T6.voiceEnd} style={CAP} />
      <At b0={T6.voiceEnd} b1={T6.total / FPS}>
        <End src="IMG_8943" at={1.0} line="Adelanta tus regalos de Navidad." cta="Ven a RE:SET" />
      </At>
      <Sfx b={P[1]} name="impact" vol={0.35} />
      <Audio src={staticFile("campana/bf06/voice.wav")} />
      <Bed src={AFRO} startS={0} words={T6.words} total={T6.total} bed={0.75} duck={0.12} />
    </Frame>
  );
};

/* =====================================================================================
   07 · 3 RAZONES — 1. el 15% en toda la tienda, 2. la calidad (su voz + contraluz), 3. la bolsita
   ===================================================================================== */
const Reason: React.FC<{ n: number; title: string }> = ({ n, title }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ position: "absolute", top: 350, left: 56, display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * -60}px)` }}>
      <div style={{ width: 110, height: 110, borderRadius: "50%", background: LIME, color: INK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 72, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>{n}</div>
      <div style={{ background: INK, color: IVORY, fontFamily: SANS, fontWeight: 900, fontSize: 52, padding: "12px 28px 16px", borderRadius: 14 }}>{title}</div>
    </div>
  );
};

export const BF07: React.FC = () => {
  const P = T7.pieceStarts;
  const r1 = 1.7;
  const MONT: [string, number][] = [["IMG_2842", 1.0], ["IMG_9051", 0.4], ["IMG_2848", 0.8], ["IMG_9025", 0.3], ["IMG_2861", 0.4], ["IMG_8974", 1.0]];
  const step = (P[1] - r1) / MONT.length;
  return (
    <Frame>
      {/* hook */}
      <At b0={0} b1={r1}>
        <Shot src="IMG_9018" at={8.0} z={[1.08, 1.0]} />
        <AbsoluteFill style={{ background: "rgba(16,16,16,0.35)" }} />
        <Lines top={560} lines={[{ t: "3 razones", at: 0, size: 150, fg: LIME }, { t: "para comprar tu pijama", at: 0.25, size: 66, bg: INK, fg: IVORY }, { t: "este BUEN FIN", at: 0.5, size: 92, bg: IVORY }]} />
      </At>
      {/* 1 · the offer */}
      {MONT.map(([src, at], i) => (
        <At key={i} b0={r1 + i * step} b1={r1 + (i + 1) * step} pre={i % 2 ? 6 : 0}><Shot src={src} at={at} fin={i % 2 ? "whip" : "snap"} /></At>
      ))}
      <At b0={r1} b1={P[1]}>
        <AbsoluteFill style={{ background: "rgba(16,16,16,0.3)" }} />
        <Reason n={1} title="15% OFF" />
        <Big15 top={620} size={0.9} />
      </At>
      {/* 2 · quality: her words, then the backlight test */}
      <At b0={P[1]} b1={P[3]}><Shot src="IMG_9047" at={lip(T7, 1, P[1])} z={[1.0, 1.05]} /></At>
      <At b0={P[3]} b1={P[4]}><Shot src="IMG_9018" at={lip(T7, 3, P[3])} z={[1.0, 1.04]} /></At>
      <At b0={P[1]} b1={P[4]}><Reason n={2} title="LA CALIDAD" /></At>
      {/* 3 · the travel pouch */}
      <At b0={P[4]} b1={P[5]}><Shot src="IMG_8972" at={0.5} fin="snap" z={[1.1, 1.0]} /></At>
      <At b0={P[5]} b1={18.9}><Shot src="IMG_8974" at={lip(T7, 5, P[5])} z={[1.0, 1.05]} /></At>
      <At b0={18.9} b1={19.9}><Shot src="IMG_8976" at={1.5} fin="snap" /></At>
      <At b0={19.9} b1={P[6]}><Shot src="IMG_8974" at={lip(T7, 5, 19.9)} /></At>
      <At b0={P[4]} b1={P[6]}><Reason n={3} title="TRAE SU BOLSITA" /></At>
      {/* where */}
      <At b0={P[6]} b1={P[7]}><Shot src="IMG_2254_L" at={1.0} fin="snap" /></At>
      <At b0={P[7]} b1={T7.voiceEnd}><Shot src="IMG_9054" at={lip(T7, 7, P[7])} z={[1.0, 1.05]} /></At>
      <OfferBar from={P[1]} to={T7.voiceEnd} />
      <Captions words={T7.words} until={T7.voiceEnd} style={CAP} />
      <At b0={T7.voiceEnd} b1={T7.total / FPS}>
        <End src="IMG_9047" at={1.0} line="Calidad, comodidad y 15% OFF." cta="Ven por la tuya" />
      </At>
      {[r1, P[1], P[4]].map((b) => <Sfx key={b} b={b} name="pop" vol={0.35} />)}
      <Audio src={staticFile("campana/bf07/voice.wav")} />
      <Bed src={AFRO} startS={AFRO_GRID + 20 * AB} words={T7.words} total={T7.total} bed={0.8} duck={0.11} />
    </Frame>
  );
};

/* =====================================================================================
   08 · MI LISTA DEL BUEN FIN — una lista que se palomea al ritmo, cada pijama a la vista
   ===================================================================================== */
const LIST: [string, string, number][] = [
  ["Pijama roja de renos", "IMG_8943", 1.6],
  ["La verde de galletas", "IMG_9025", 0.3],
  ["Básica verde olivo", "IMG_9051", 0.4],
  ["Azul marino con bolsita", "IMG_8974", 1.0],
  ["La de duendes", "IMG_2842", 1.0],
  ["La de esquí", "IMG_2848", 0.8],
  ["Rojo de pinos", "IMG_2861", 0.4],
  ["La de gorros navideños", "IMG_2857", 0.5],
];
const L0 = 4 * AB; // the list starts on beat 4
const PER = 2 * AB; // one item every two beats

const ListCard: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS + L0; // the card's block starts at L0; its timeline is absolute
  const done = (i: number) => t >= L0 + i * PER + AB;
  const shown = (i: number) => t >= L0 + i * PER;
  const all = t >= L0 + LIST.length * PER;
  return (
    <div style={{ position: "absolute", top: 330, left: 50, right: 50, background: IVORY, borderRadius: 30, padding: "30px 40px 26px", boxShadow: "0 30px 70px rgba(0,0,0,0.35)" }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 64, color: INK }}>Mi lista del Buen Fin</div>
      <div style={{ height: 3, background: INK, opacity: 0.15, margin: "16px 0 14px" }} />
      {LIST.map(([name], i) => {
        const p = shown(i) ? interpolate(t, [L0 + i * PER, L0 + i * PER + 0.2], [0, 1], clamp) : 0;
        const ck = done(i) ? interpolate(t, [L0 + i * PER + AB, L0 + i * PER + AB + 0.12], [0, 1], clamp) : 0;
        return (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 18, height: 78, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, border: `4px solid ${INK}`, background: ck > 0 ? LIME : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 36, color: INK, transform: `scale(${1 + 0.3 * Math.max(0, 1 - Math.abs(ck - 0.5) * 2)})` }}>{ck > 0.3 ? "✓" : ""}</div>
            <div style={{ flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 48, color: INK }}>{name}</div>
            <div style={{ opacity: ck, background: INK, color: LIME, fontFamily: SANS, fontWeight: 900, fontSize: 34, padding: "6px 16px", borderRadius: 999 }}>−15%</div>
          </div>
        );
      })}
      {all && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", transform: `rotate(-8deg) scale(${interpolate(t, [L0 + LIST.length * PER, L0 + LIST.length * PER + 0.25], [2, 1], clamp)})` }}>
          <div style={{ background: LIME, border: `8px solid ${INK}`, color: INK, fontFamily: SANS, fontWeight: 900, fontSize: 84, lineHeight: 1, padding: "16px 34px 22px", borderRadius: 18, textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
            TODO CON 15% OFF
            <div style={{ fontSize: 36, letterSpacing: "0.2em", marginTop: 8 }}>BUEN FIN · RE:SET</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const BF08: React.FC = () => {
  const listEnd = L0 + LIST.length * PER;
  const voice = T8.pieceStarts[1];
  return (
    <Frame>
      {/* hook */}
      <At b0={0} b1={L0}>
        <Shot src="IMG_8961" at={0.5} z={[1.0, 1.08]} />
        <AbsoluteFill style={{ background: "rgba(16,16,16,0.35)" }} />
        <Lines top={600} lines={[{ t: "Lo que me voy", at: 0, size: 96, fg: IVORY }, { t: "a comprar en el", at: 0.3, size: 96, fg: IVORY }, { t: "BUEN FIN", at: 0.65, size: 140, bg: LIME }, { t: "de RE:SET", at: 1.0, size: 80, fg: IVORY }]} />
      </At>
      {/* the list: product behind, the card on top */}
      {LIST.map(([, src, at], i) => (
        <At key={i} b0={L0 + i * PER} b1={L0 + (i + 1) * PER} pre={i % 2 ? 6 : 0}><Shot src={src} at={at} fin={i % 2 ? "whip" : "snap"} /></At>
      ))}
      <At b0={listEnd} b1={listEnd + 4 * AB}><Shot src="IMG_2857" at={1.5} z={[1.0, 1.06]} /></At>
      <At b0={L0} b1={listEnd + 4 * AB}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(16,16,16,0.15) 0%, rgba(16,16,16,0) 60%)" }} />
        <ListCard />
      </At>
      {/* where to buy */}
      <At b0={listEnd + 4 * AB} b1={voice}>
        <Shot src="IMG_2254_L" at={2.5} fin="zoom" />
        <Lines top={400} lines={[{ t: "Todo esto en", at: 0, size: 70, serif: true, fg: IVORY }, { t: "RE:SET PERISUR", at: 0.25, size: 84, bg: IVORY }]} />
      </At>
      {/* her */}
      <At b0={voice} b1={T8.voiceEnd}><Shot src="IMG_8948" at={lip(T8, 1, voice)} z={[1.0, 1.05]} /></At>
      <OfferBar from={voice} to={T8.voiceEnd} />
      <Captions words={T8.words} until={T8.voiceEnd} style={CAP} />
      <At b0={T8.voiceEnd} b1={T8.total / FPS}>
        <End src="IMG_2842" at={1.0} line="Arma tu lista." cta="Compra en RE:SET" />
      </At>
      {LIST.map((_, i) => <Sfx key={i} b={L0 + i * PER + AB} name="click" vol={0.4} />)}
      <Sfx b={listEnd} name="impact" vol={0.45} />
      <Audio src={staticFile("campana/bf08/voice.wav")} />
      <Bed src={AFRO} startS={AFRO_GRID + 13 * AB} words={T8.words} total={T8.total} bed={0.85} />
    </Frame>
  );
};

