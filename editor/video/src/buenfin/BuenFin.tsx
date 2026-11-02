// RE:SET — BUEN FIN 2026 · 15% OFF en toda la tienda · cuatro anuncios para Meta Ads (1080×1920, 30 fps).
// Voz: solo frases reales de la protagonista (editor/campana/voz.py bf01…bf04 → timing.json). La promoción va SIEMPRE como texto
// gráfico, nunca en su voz. Sin 25% OFF, sin "outlet", sin precios, fechas, envío ni condiciones que la marca no haya confirmado.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { anchors, Captions, clamp, COLORS, easeOut, F, FPS, Grain, Shot, StoreBlock, sync, Timeline, Timing, useWindow, Vignette, Word } from "../campana/shared";
import t01 from "../campana/bf01/timing.json";
import t02 from "../campana/bf02/timing.json";
import t03 from "../campana/bf03/timing.json";
import t04 from "../campana/bf04/timing.json";

loadFont({ family: "Playfair", url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"), weight: "400 900", style: "italic" });

const T1 = t01 as Timing;
const T2 = t02 as Timing;
const T3 = t03 as Timing;
const T4 = t04 as Timing;
export const BF_FRAMES = { bf01: T1.total, bf02: T2.total, bf03: T3.total, bf04: T4.total };

const INK = COLORS.ink;
const IVORY = COLORS.ivory;
const LIME = COLORS.lime;
const SANS = "Montserrat";
const SERIF = "Playfair";
const MEDIA = "campana/media";
const GRADE = "brightness(1.04) contrast(1.05) saturate(1.03)";

/* ---------- music: a licensed track from a chosen second, ducked under her words ---------- */
// AD01, AD03, AD04: "Afro House" (jonasblakewood, Pixabay — licencia Pixabay, uso comercial permitido), cada uno desde otra sección.
// AD02: pista original de RE:SET (editor/outlet4/music.py --perisur23). Cambiar src/startS aquí cuando llegue una pista licenciada.
type Bed = { src: string; startS: number; bed: number; duck: number };
const MUSIC: Record<string, Bed> = {
  bf01: { src: "outlet4/audio/afrohouse.mp3", startS: 15.9, bed: 0.55, duck: 0.12 },
  bf02: { src: "outlet4/audio/perisur_music_original_23s.wav", startS: 0, bed: 0.7, duck: 0.16 },
  bf03: { src: "outlet4/audio/afrohouse.mp3", startS: 18.918, bed: 0.85, duck: 0.15 },
  bf04: { src: "outlet4/audio/afrohouse.mp3", startS: 1.72, bed: 0.6, duck: 0.12 },
};
const MusicBed: React.FC<{ m: Bed; words: Word[]; total: number }> = ({ m, words, total }) => {
  const spans = words.map((w) => [w.s - 0.25, w.e + 0.3]);
  const duckAt = (t: number) => {
    const d = spans.length ? Math.min(...spans.map(([a, b]) => (t < a ? a - t : t > b ? t - b : 0))) : 9;
    return interpolate(d, [0, 0.25], [m.duck, m.bed], clamp);
  };
  return <Audio src={staticFile(m.src)} startFrom={Math.round(m.startS * FPS)} volume={(f) => duckAt(f / FPS) * interpolate(f, [0, 6], [0, 1], clamp) * interpolate(f, [total - 24, total], [1, 0], clamp)} />;
};

/* ---------- campaign graphics ---------- */
/** the Buen Fin offer, the one promotion of this campaign */
const Offer: React.FC<{ scale?: number; dark?: boolean; delay?: number }> = ({ scale = 1, dark = true, delay = 0 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 9], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: dark ? INK : IVORY, padding: `${22 * scale}px ${44 * scale}px ${26 * scale}px`, borderRadius: 26 * scale, boxShadow: "0 18px 50px rgba(0,0,0,0.3)", opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32 * scale, letterSpacing: "0.42em", marginLeft: "0.42em", color: dark ? IVORY : INK }}>BUEN FIN</div>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 150 * scale, lineHeight: 0.95, letterSpacing: "-0.03em", color: dark ? LIME : INK, whiteSpace: "nowrap" }}>15% OFF</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30 * scale, letterSpacing: "0.18em", marginLeft: "0.18em", color: dark ? IVORY : INK, marginTop: 6 * scale }}>EN TODA LA TIENDA</div>
    </div>
  );
};

/** small corner reminder of the offer */
const Tag: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const o = useWindow(from, to, 8, 6);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 262, right: 64, opacity: o, background: INK, borderRadius: 16, padding: "10px 18px 12px", textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.3em", marginLeft: "0.3em", color: IVORY }}>BUEN FIN</div>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 46, lineHeight: 1, color: LIME }}>15% OFF</div>
    </div>
  );
};

/** a line of graphic copy (never a subtitle) */
const Copy: React.FC<{ from: number; to: number; top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ from, to, top, children, style }) => {
  const o = useWindow(from, to, 7, 6);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top, left: 64, right: 64, textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 14}px)`, ...style }}>{children}</div>
  );
};
const pill = (bg: string, fg: string, size: number): React.CSSProperties => ({ display: "inline-block", background: bg, color: fg, fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1.12, padding: "10px 26px 14px", borderRadius: 14, letterSpacing: "-0.01em" });

/** closing card: logo, the line of the ad, the offer, stores */
const EndCard: React.FC<{ line1: string; line2: string; serif?: boolean; stores?: boolean }> = ({ line1, line2, serif, stores = true }) => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 12], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0), backdropFilter: "blur(8px)", background: "rgba(16,16,16,0.55)" }} />
      <div style={{ position: "absolute", top: 300, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 360, opacity: a(2) }} />
        <div style={{ marginTop: 34, fontFamily: serif ? SERIF : SANS, fontStyle: serif ? "italic" : "normal", fontWeight: serif ? 500 : 600, fontSize: 58, lineHeight: 1.1, color: IVORY, opacity: a(6), transform: `translateY(${(1 - a(6)) * 12}px)` }}>{line1}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, lineHeight: 1.08, color: LIME, opacity: a(10), transform: `translateY(${(1 - a(10)) * 12}px)` }}>{line2}</div>
        <div style={{ marginTop: 34 }}>
          <Offer scale={0.72} dark={false} delay={14} />
        </div>
        {stores && (
          <div style={{ marginTop: 34 }}>
            <StoreBlock delay={20} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const CAP = (top: number) => ({ top, size: 50, weight: 600, scrim: "rgba(16,16,16,0.5)", highlight: new Set(["RE:SET", "Perisur", "Stim", "cómoda", "cómodo"]), hl: LIME });

/* =====================================================================================
   01 · LA SEÑAL — deseo: la pijama que querías, ahora con una razón para comprarla
   ===================================================================================== */
const A1 = anchors(T1);
const S1: Shot[] = [
  sync(A1.lip, "presenta", 0, "IMG_8944", 0, A1.P[1], { zoom: [1.0, 1.05], origin: [50, 40] }),
  { name: "gira-roja", src: "IMG_8943", from: A1.P[1], to: 3.9, at: 1.5, zoom: [1.05, 1.0] },
  { name: "verde", src: "IMG_9025", from: 3.9, to: 5.0, at: 0.3, zoom: [1.0, 1.06] },
  { name: "olivo", src: "IMG_9051", from: 5.0, to: 6.1, at: 0.4, zoom: [1.05, 1.0] },
  { name: "marino", src: "IMG_8981", from: 6.1, to: A1.P[2], at: 0.3, zoom: [1.0, 1.05] },
  sync(A1.lip, "modelo", 2, "IMG_9047", A1.P[2], A1.w("está"), { zoom: [1.0, 1.06], origin: [50, 45] }),
  { name: "silueta", src: "IMG_9050", from: A1.w("está"), to: A1.w("el"), at: 0.0, zoom: [1.0, 1.03] },
  { name: "color", src: "IMG_9049", from: A1.w("el"), to: A1.w("y"), at: 0.0, zoom: [1.0, 1.04], origin: [50, 40] },
  { name: "lazo", src: "IMG_9052", from: A1.w("y"), to: A1.w("calidad"), at: 0.0, zoom: [1.0, 1.04] },
  { name: "comodo", src: "IMG_9051", from: A1.w("calidad"), to: A1.P[3], at: 3.6, zoom: [1.0, 1.03] },
  { name: "variedad", src: "IMG_8943", from: A1.P[3], to: A1.P[4], at: 2.2, zoom: [1, 1], panels: [{ src: "IMG_8943", at: 2.2 }, { src: "IMG_9036", at: 1.0 }, { src: "IMG_9047", at: 0.2 }, { src: "IMG_8974", at: 1.0 }] },
  sync(A1.lip, "tiendas", 4, "IMG_9054", A1.P[4], T1.voiceEnd, { zoom: [1.0, 1.05], origin: [50, 40] }),
  { name: "cierre", src: "IMG_8943", from: T1.voiceEnd, to: T1.total / FPS, at: 1.2, rate: 0.6, zoom: [1.0, 1.05], xf: 6 },
];

const Hook1: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const swap = 1.55;
  const l1 = interpolate(t, [0, 0.2], [0, 1], clamp);
  const l2 = interpolate(t, [0.55, 0.8], [0, 1], clamp);
  const out = interpolate(t, [swap - 0.15, swap], [1, 0], clamp);
  return (
    <>
      <div style={{ position: "absolute", top: 300, left: 60, right: 60, textAlign: "center", opacity: out }}>
        <div style={{ ...pill(IVORY, INK, 58), opacity: l1 }}>Si estabas esperando una señal</div>
        <div style={{ height: 12 }} />
        <div style={{ ...pill(INK, IVORY, 58), opacity: l2, transform: `translateY(${(1 - l2) * 12}px)` }}>para comprarte esa pijama…</div>
      </div>
      <Sequence from={F(swap)} durationInFrames={F(A1.P[1] + 0.3 - swap)} layout="none">
        <div style={{ position: "absolute", top: 290, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ ...pill(LIME, INK, 50) }}>…es esta.</div>
          <Offer scale={0.9} />
        </div>
      </Sequence>
    </>
  );
};

export const BF01: React.FC = () => {
  const end = S1[S1.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Timeline shots={S1} grade={GRADE} base={MEDIA} />
      <Hook1 />
      <Tag from={A1.P[1] + 0.3} to={A1.P[3]} />
      <Copy from={A1.P[1] + 0.2} to={A1.P[2] - 0.1} top={1100}><div style={pill(IVORY, INK, 54)}>¿Cuál es la tuya?</div></Copy>
      <Copy from={A1.P[3]} to={A1.P[4]} top={720}><Offer /></Copy>
      <Copy from={A1.P[3] + 0.4} to={A1.P[4]} top={1180}><div style={pill(IVORY, INK, 50)}>Elige entre todos los modelos</div></Copy>
      <Tag from={A1.P[4]} to={end.from} />
      <Captions words={T1.words} until={end.from} style={CAP(1250)} />
      <Sequence from={F(end.from)}>
        <EndCard line1="Ven a RE:SET" line2="y elige tu favorita." />
      </Sequence>
      <Audio src={staticFile("campana/bf01/voice.wav")} />
      <MusicBed m={MUSIC.bf01} words={T1.words} total={T1.total} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   02 · VEN CONMIGO A RE:SET — la visita: Perisur, el espacio, las pijamas, cómo llegar
   ===================================================================================== */
const A2 = anchors(T2);
const S2: Shot[] = [
  { name: "muro", src: "IMG_2255", from: 0, to: 3.0, at: 0.0, zoom: [1.0, 1.06], origin: [50, 40] },
  { name: "techo", src: "IMG_2314", from: 3.0, to: 5.6, at: 0.3, zoom: [1.0, 1.05], xf: 8 },
  { name: "pasillo", src: "IMG_2272", from: 5.6, to: 8.0, at: 0.4, zoom: [1.02, 1.0], xf: 8 },
  { name: "kiosco", src: "IMG_2254_L", from: 8.0, to: A2.P[1], at: 1.2, zoom: [1.0, 1.05], xf: 8 },
  { name: "pantalla", src: "IMG_3084_L", from: A2.P[1], to: 12.0, at: 0.5, zoom: [1.0, 1.05], xf: 6 },
  { name: "repisa", src: "IMG_2252", from: 12.0, to: 13.1, at: 0.0, zoom: [1.0, 1.04] },
  { name: "productos", src: "IMG_2317_L", from: 13.1, to: A2.P[2] + 0.1, at: 4.0, zoom: [1.0, 1.04] },
  sync(A2.lip, "ella", 2, "IMG_9015", A2.P[2] + 0.1, A2.w("así"), { zoom: [1.0, 1.05], origin: [50, 40] }),
  { name: "mostrador", src: "IMG_2250_L", from: A2.w("así"), to: T2.voiceEnd, at: 0.5, zoom: [1.0, 1.05] },
  { name: "cierre", src: "IMG_2315_L", from: T2.voiceEnd, to: T2.total / FPS, at: 1.0, rate: 0.8, zoom: [1.0, 1.06], xf: 8 },
];

const Serif: React.FC<{ from: number; to: number; top: number; size?: number; children: React.ReactNode }> = ({ from, to, top, size = 92, children }) => (
  <Copy from={from} to={to} top={top} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: size, lineHeight: 1.05, color: IVORY }}>
    <span style={{ display: "inline-block", background: "rgba(16,16,16,0.55)", padding: "8px 28px 16px", borderRadius: 18, backdropFilter: "blur(6px)" }}>{children}</span>
  </Copy>
);
const Kicker: React.FC<{ from: number; to: number; top: number; children: React.ReactNode }> = ({ from, to, top, children }) => (
  <Copy from={from} to={to} top={top} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: "0.38em", color: IVORY }}>
    <span style={{ display: "inline-block", background: "rgba(16,16,16,0.6)", padding: "10px 18px 10px 30px", borderRadius: 999 }}>{children}</span>
  </Copy>
);

export const BF02: React.FC = () => {
  const end = S2[S2.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Timeline shots={S2} grade="brightness(1.03) contrast(1.04) saturate(0.98)" base="perisur" />
      <Vignette strength={0.22} />
      <Grain opacity={0.04} />
      {/* 0–3 s: the RE:SET wall, the offer */}
      <Kicker from={0.0} to={3.0} top={300}>BUEN FIN EN RE:SET</Kicker>
      <Copy from={0.5} to={3.0} top={380}><Offer scale={0.85} /></Copy>
      <Serif from={0.9} to={3.0} top={1120} size={70}>¿Quieres aprovechar<br />el Buen Fin?</Serif>
      {/* 3–8 s: where */}
      <Kicker from={3.1} to={5.5} top={300}>PERISUR</Kicker>
      <Serif from={3.4} to={5.5} top={370} size={80}>Te enseño dónde<br />encontrar RE:SET.</Serif>
      <Serif from={5.8} to={7.9} top={330} size={80}>ven conmigo</Serif>
      {/* 8–16 s: discovering, offer reminder */}
      <Tag from={8.0} to={end.from} />
      <Kicker from={8.2} to={A2.P[1]} top={1160}>KIOSCO · PLANTA BAJA</Kicker>
      <Captions words={T2.words} until={end.from} style={CAP(1250)} />
      <Sequence from={F(end.from)}>
        <EndCard line1="Buen Fin: 15% OFF en toda la tienda." line2="Visítanos en Perisur." serif />
      </Sequence>
      <Audio src={staticFile("campana/bf02/voice.wav")} />
      <MusicBed m={MUSIC.bf02} words={T2.words} total={T2.total} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   03 · EL PROBLEMA ES ELEGIR UNA SOLA — la variedad como entretenimiento (afro house desde su drop)
   ===================================================================================== */
const B = 0.5725;
const A3 = anchors(T3);
const opina = A3.P[1] - 0.25;
const S3: Shot[] = [
  { name: "esta", src: "IMG_8943", from: 5 * B, to: 12 * B, at: 1.5, zoom: [1.06, 1.0] },
  { name: "no-espera", src: "IMG_9051", from: 12 * B, to: 19 * B, at: 0.3, zoom: [1.0, 1.06] },
  { name: "decidir", src: "IMG_9036", from: 19 * B, to: 26 * B, at: 0.5, zoom: [1, 1], panels: [{ src: "IMG_9036", at: 0.5 }, { src: "IMG_8974", at: 1.0 }] },
  { name: "probador", src: "IMG_8943", from: 26 * B, to: opina, at: 3.0, zoom: [1, 1.03], panels: [{ src: "IMG_8943", at: 3.0 }, { src: "IMG_9047", at: 0.2 }, { src: "IMG_9025", at: 0.3 }, { src: "IMG_8974", at: 1.0 }] },
  sync(A3.lip, "opina", 1, "IMG_9049", opina, A3.P[1] + 1.0, { zoom: [1.0, 1.04], origin: [50, 40] }),
  { name: "cierre", src: "IMG_9051", from: A3.P[1] + 1.0, to: T3.total / FPS, at: 1.0, rate: 0.6, zoom: [1.0, 1.05], xf: 6 },
];

/** big typographic hook on ivory, word by word on the beat */
const Hook3: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t >= 5 * B) return null;
  const words: [string, number, boolean][] = [["El problema", 0, false], ["del Buen Fin", 0.5, false], ["de RE:SET", 1.0, false], ["no es el 15% OFF…", 1.5, true]];
  const second = t >= 3 * B;
  return (
    <AbsoluteFill style={{ background: IVORY, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
      {!second &&
        words.map(([w, b, hl]) => {
          const p = interpolate(t, [b * B, b * B + 0.12], [0, 1], clamp);
          return <div key={w} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 104, lineHeight: 1, letterSpacing: "-0.03em", color: hl ? INK : INK, background: hl ? LIME : "transparent", padding: hl ? "6px 22px 12px" : 0, opacity: p, transform: `scale(${1.2 - 0.2 * p})` }}>{w}</div>;
        })}
      {second && (
        <>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 90, color: INK }}>…es escoger</div>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 170, lineHeight: 0.95, letterSpacing: "-0.035em", color: INK, transform: `scale(${1 + 0.06 * Math.exp(-((t - 3 * B) * FPS) / 4)})` }}>UNA SOLA</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 90, color: INK }}>pijama.</div>
        </>
      )}
    </AbsoluteFill>
  );
};

/** fitting-room labels on the split and the grid */
const Pick: React.FC<{ from: number; to: number; text: string; top: number; big?: boolean }> = ({ from, to, text, top, big }) => {
  const o = useWindow(from, to, 5, 4);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", opacity: o }}>
      <div style={{ ...pill(big ? LIME : IVORY, INK, big ? 86 : 64), transform: `scale(${0.8 + 0.2 * o}) rotate(${(1 - o) * -4}deg)`, boxShadow: "0 14px 40px rgba(0,0,0,0.3)" }}>{text}</div>
    </div>
  );
};

export const BF03: React.FC = () => {
  const end = S3[S3.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Timeline shots={S3} grade={GRADE} base={MEDIA} />
      <Hook3 />
      <Pick from={6 * B} to={12 * B} text="Esta." top={1120} big />
      <Pick from={13 * B} to={19 * B} text="No, espera… esta." top={1120} big />
      <Pick from={20 * B} to={26 * B} text="Ok… necesito decidir." top={860} big />
      <Copy from={27 * B} to={opina} top={700}><Offer /></Copy>
      <Tag from={opina} to={end.from} />
      <Captions words={T3.words} until={end.from} style={{ ...CAP(1150), size: 64 }} />
      <Sequence from={F(end.from)}>
        <EndCard line1="¿Cuál escogerías tú?" line2="Descúbrelas en RE:SET." />
      </Sequence>
      {[5, 12, 19, 26].map((b) => (
        <Sequence key={b} from={F(b * B)} durationInFrames={20} layout="none">
          <Audio src={staticFile("outlet4/audio/sfx_pop.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Audio src={staticFile("campana/bf03/voice.wav")} />
      <MusicBed m={MUSIC.bf03} words={T3.words} total={T3.total} />
    </AbsoluteFill>
  );
};

/* =====================================================================================
   04 · NAVIDAD O TODOS LOS DÍAS — dos antojos, una promoción
   ===================================================================================== */
const A4 = anchors(T4);
const drop = 17.2; // the track's drop (MUSIC.bf04.startS = 18.918 − 17.2)
const S4: Shot[] = [
  { name: "split", src: "IMG_8935", from: 0, to: A4.P[1], at: 0.2, zoom: [1, 1], panels: [{ src: "IMG_8935", at: 0.2 }, { src: "IMG_9051", at: 0.3 }] },
  sync(A4.lip, "ella", 1, "IMG_8947", A4.P[1], A4.w("estampado"), { zoom: [1.0, 1.05], origin: [50, 40] }),
  { name: "renos", src: "IMG_8934", from: A4.w("estampado"), to: A4.w("no"), at: 0.4, zoom: [1.1, 1.0] },
  { name: "copo", src: "IMG_9022", from: A4.w("no"), to: A4.w("ocupas"), at: 1.5, zoom: [1.0, 1.06] },
  sync(A4.lip, "ella2", 1, "IMG_8947", A4.w("ocupas"), A4.w("sino"), { zoom: [1.0, 1.05], origin: [50, 40] }),
  { name: "verde", src: "IMG_9025", from: A4.w("sino"), to: A4.w("todo"), at: 0.3, zoom: [1.0, 1.05] },
  { name: "lee", src: "IMG_9039", from: A4.w("todo"), to: A4.w("porque"), at: 1.0, zoom: [1.0, 1.04] },
  sync(A4.lip, "comoda", 1, "IMG_8947", A4.w("porque"), A4.P[2] + 0.35, { zoom: [1.0, 1.05], origin: [50, 40] }),
  { name: "olivo", src: "IMG_9050", from: A4.P[2] + 0.35, to: A4.P[3], at: 0.3, zoom: [1.06, 1.0] },
  sync(A4.lip, "temporada", 3, "IMG_9048", A4.P[3], A4.w("temporada,"), { zoom: [1.0, 1.05], origin: [50, 40] }),
  { name: "lazo", src: "IMG_9052", from: A4.w("temporada,"), to: A4.w("verde"), at: 0.0, zoom: [1.0, 1.04] },
  sync(A4.lip, "militar", 3, "IMG_9048", A4.w("verde"), drop, { zoom: [1.0, 1.05], origin: [50, 40] }),
  // the drop: both worlds, matched by colour, one per beat
  ...(
    [
      ["IMG_8943", 2.0], ["IMG_9051", 1.5], ["IMG_9035", 0.3], ["IMG_8974", 1.0], ["IMG_8933", 0.5], ["IMG_9047", 0.3],
      ["IMG_9036", 2.0], ["IMG_8981", 0.4], ["IMG_8961", 0.5], ["IMG_9051", 3.4], ["IMG_9029", 0.5], ["IMG_8974", 2.5],
    ] as [string, number][]
  ).map(([src, at], i): Shot => ({ name: `mix${i}`, src, from: drop + i * B, to: drop + (i + 1) * B, at, zoom: i % 2 ? [1.06, 1.0] : [1.0, 1.06] })),
  { name: "final", src: "IMG_8943", from: drop + 12 * B, to: T4.total / FPS, at: 1.5, zoom: [1, 1], panels: [{ src: "IMG_8943", at: 1.5 }, { src: "IMG_9051", at: 1.0 }] },
];

const SplitLabels: React.FC<{ to: number }> = ({ to }) => {
  const o = useWindow(0, to, 6, 6);
  return (
    <div style={{ opacity: o }}>
      <div style={{ position: "absolute", top: 1180, left: 40, width: 460, textAlign: "center" }}><div style={pill("#B3322E", IVORY, 46)}>NAVIDAD</div></div>
      <div style={{ position: "absolute", top: 1180, left: 580, width: 460, textAlign: "center" }}><div style={pill(IVORY, INK, 46)}>TODOS LOS DÍAS</div></div>
    </div>
  );
};

export const BF04: React.FC = () => {
  const fin = S4[S4.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Timeline shots={S4} grade={GRADE} base={MEDIA} />
      {/* hook */}
      <SplitLabels to={A4.P[1]} />
      <Copy from={0.0} to={1.5} top={300}><div style={pill(INK, IVORY, 62)}>¿Pijamas para Navidad</div><div style={{ height: 10 }} /><div style={pill(INK, IVORY, 62)}>o para todos los días?</div></Copy>
      <Copy from={1.5} to={A4.P[1]} top={290}><div style={pill(LIME, INK, 52)}>Este Buen Fin, las dos tienen</div><div style={{ height: 14 }} /><Offer scale={0.8} /></Copy>
      {/* the two worlds */}
      <Copy from={A4.P[1] + 0.2} to={A4.P[2] + 0.35} top={300} style={{ textAlign: "left" }}><div style={pill("#B3322E", IVORY, 40)}>NAVIDAD</div></Copy>
      <Copy from={A4.P[2] + 0.35} to={drop} top={300} style={{ textAlign: "left" }}><div style={pill(IVORY, INK, 40)}>TODOS LOS DÍAS</div></Copy>
      <Tag from={A4.P[1] + 0.2} to={drop} />
      <Captions words={T4.words} until={drop} style={CAP(1250)} />
      {/* the collection, on the drop */}
      <Copy from={drop} to={fin.from} top={720}><Offer /></Copy>
      <Sequence from={F(fin.from)}>
        <EndCard line1="RE:SET Buen Fin" line2="Ven y encuentra tus favoritas." />
      </Sequence>
      <Audio src={staticFile("campana/bf04/voice.wav")} />
      <MusicBed m={MUSIC.bf04} words={T4.words} total={T4.total} />
    </AbsoluteFill>
  );
};
