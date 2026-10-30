import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { STORES, WEB } from "../campana/shared";
import { At, BeatProvider, cl, Music, Sfx, Split3, Ticker, useBeat, useSeg, Vid } from "../outlet4/fx";

/** second wave · five ads on the client's Pixabay afro house (licensed for commercial use), each on its own section of the track.
 *  Look: bright footage in clean rounded cards on solid brand colours, giant type that lands on the beat. */
const AF = 0.5725; // seconds per beat of the afro house
const GRID0 = 14.338; // a downbeat of the track; the drop is beat 8 of this grid (18.92 s)
const atBeat = (k: number) => GRID0 + k * AF;
const TRACK = "outlet4/audio/afrohouse.mp3";

export const OUTLET2 = {
  ad06: { beats: 42, startS: atBeat(-4) }, // drop at beat 12
  ad07: { beats: 42, startS: atBeat(0) }, // drop at beat 8
  ad08: { beats: 40, startS: atBeat(4) }, // drop at beat 4
  ad09: { beats: 47, startS: atBeat(-12) }, // drop at beat 20
  ad10: { beats: 22, startS: atBeat(6) }, // drop at beat 2
} as const;
export type Key2 = keyof typeof OUTLET2;
export const frames2 = (k: Key2) => Math.round(OUTLET2[k].beats * AF * 30);

const LIME = "#E2EC95";
const INK = "#141414";
const CREAM = "#F4F1EA";
const WHITE = "#FFFFFF";
const BLUSH = "#F3D6CF";
const SANS = "Montserrat";
const GRADE = "brightness(1.07) contrast(1.07) saturate(1.12)";
const over = Easing.bezier(0.34, 1.56, 0.64, 1);
const outE = Easing.out(Easing.cubic);

const useF = () => {
  const f = useCurrentFrame();
  const { d } = useBeat();
  return { f, d };
};
/** a punch that decays after every beat */
const punch = (f: number, d: (b: number) => number, amt: number) => 1 + amt * Math.exp(-(f % d(1)) / 4);
/** font size that keeps an uppercase Montserrat 900 line inside the safe width */
const fit = (t: string, max: number) => Math.min(max, Math.floor(950 / (Math.max(3, t.length) * 0.68)));

const Frame2: React.FC<{ k: Key2; children: React.ReactNode }> = ({ k, children }) => (
  <BeatProvider B={AF} off={0}>
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      {children}
      <Music src={TRACK} startS={OUTLET2[k].startS} total={frames2(k)} />
    </AbsoluteFill>
  </BeatProvider>
);

const Bg: React.FC<{ c: string }> = ({ c }) => <AbsoluteFill style={{ background: c }} />;

/** full-bleed shot: snaps in on its beat, slow push, a small punch on every beat */
const Full: React.FC<{ src: string; at: number; z?: [number, number] }> = ({ src, at, z = [1.0, 1.06] }) => {
  const { f, d } = useF();
  const seg = useSeg();
  const snap = interpolate(f, [0, 5], [1.12, 1], { ...cl, easing: outE });
  const zz = interpolate(f, [0, seg], z, cl);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <AbsoluteFill style={{ transform: `scale(${snap * zz * punch(f, d, 0.02)})`, filter: GRADE }}>
        <Vid src={src} at={at} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** one product per beat, full-bleed */
const Montage: React.FC<{ b0: number; shots: [string, number][] }> = ({ b0, shots }) => (
  <>
    {shots.map(([src, at], i) => (
      <At key={i} b0={b0 + i} b1={b0 + i + 1}>
        <Full src={src} at={at} />
      </At>
    ))}
  </>
);

/** rounded footage card that lands on its beat (relative to the block) */
type CardP = { src: string; at: number; x: number; y: number; w: number; h: number; r?: number; b?: number; from?: "up" | "left" | "right" | "pop"; label?: string; hi?: boolean };
const Card: React.FC<CardP> = ({ src, at, x, y, w, h, r = 0, b = 0, from = "up", label, hi }) => {
  const { f, d } = useF();
  const s = d(b);
  if (f < s) return null;
  const p = interpolate(f, [s, s + 9], [0, 1], { ...cl, easing: over });
  const dx = from === "left" ? -(1 - p) * 800 : from === "right" ? (1 - p) * 800 : 0;
  const dy = from === "up" ? (1 - p) * 600 : 0;
  const sc = (from === "pop" ? 0.4 + 0.6 * p : 1) * punch(f, d, 0.015);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 34, overflow: "hidden", background: WHITE, outline: hi ? `10px solid ${LIME}` : "none", boxShadow: "0 30px 70px rgba(0,0,0,0.28)", opacity: Math.min(1, p * 2), transform: `translate(${dx}px, ${dy}px) rotate(${r}deg) scale(${sc})` }}>
      <Sequence from={s} layout="none">
        <AbsoluteFill style={{ filter: GRADE }}>
          <Vid src={src} at={at} />
        </AbsoluteFill>
      </Sequence>
      {label && <div style={{ position: "absolute", left: 22, bottom: 22, background: INK, color: LIME, fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: "0.04em", padding: "10px 22px", borderRadius: 999 }}>{label}</div>}
    </div>
  );
};

/** giant uppercase lines that slam in on their beats; unrevealed lines keep their space so nothing jumps */
type Line = { t: string; b: number; c?: string; bg?: string; size?: number };
const Slam: React.FC<{ lines: Line[]; top: number; size?: number; gap?: number; out?: number }> = ({ lines, top, size = 170, gap = 8, out }) => {
  const { f, d } = useF();
  const o = out === undefined ? 1 : interpolate(f, [d(out) - 4, d(out)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap, opacity: o }}>
      {lines.map((L, i) => {
        const s = d(L.b);
        const on = f >= s;
        const p = on ? interpolate(f, [s, s + 6], [0, 1], { ...cl, easing: over }) : 0;
        return (
          <div key={i} style={{ fontFamily: SANS, fontWeight: 900, fontSize: fit(L.t, L.size ?? size), lineHeight: 0.95, letterSpacing: "-0.025em", textTransform: "uppercase", whiteSpace: "nowrap", color: L.c ?? INK, background: L.bg, padding: L.bg ? "8px 24px 14px" : 0, opacity: on ? Math.min(1, p * 1.6) : 0, transform: `scale(${on ? 1.35 - 0.35 * p : 1})` }}>
            {L.t}
          </div>
        );
      })}
    </div>
  );
};

/** small sans line */
const Kick: React.FC<{ t: string; b: number; top: number; c?: string; out?: number }> = ({ t, b, top, c = INK, out }) => {
  const { f, d } = useF();
  const p = interpolate(f, [d(b), d(b) + 8], [0, 1], { ...cl, easing: outE });
  const o = out === undefined ? 1 : interpolate(f, [d(out) - 4, d(out)], [1, 0], cl);
  return <div style={{ position: "absolute", top, left: 72, right: 72, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: "0.08em", textTransform: "uppercase", color: c, opacity: p * o, transform: `translateY(${(1 - p) * 16}px)` }}>{t}</div>;
};

/** round 25% OFF badge that wobbles and pulses on the beat */
const Badge25: React.FC<{ x: number; y: number; size?: number; dark?: boolean; b?: number }> = ({ x, y, size = 240, dark, b = 0 }) => {
  const { f, d } = useF();
  const s = d(b);
  if (f < s) return null;
  const p = interpolate(f, [s, s + 9], [0, 1], { ...cl, easing: over });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: dark ? INK : LIME, color: dark ? LIME : INK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, boxShadow: "0 18px 40px rgba(0,0,0,0.25)", transform: `scale(${p * punch(f, d, 0.06)}) rotate(${-10 + 6 * Math.sin((f - s) / 9)}deg)` }}>
      <div style={{ fontSize: size * 0.36, lineHeight: 0.9, letterSpacing: "-0.03em" }}>25%</div>
      <div style={{ fontSize: size * 0.17, letterSpacing: "0.14em", marginLeft: "0.14em" }}>OFF</div>
    </div>
  );
};

/** closing card on lime: logo, the product, the offer, the CTA, stores and web */
const EndLime: React.FC<{ src: string; at: number; cta: string; title?: string }> = ({ src, at, cta, title = "OUTLET RE:SET" }) => {
  const { f, d } = useF();
  const a = (b: number) => interpolate(f, [d(b), d(b) + 8], [0, 1], { ...cl, easing: outE });
  return (
    <AbsoluteFill style={{ background: LIME }}>
      <Img src={staticFile("brand/reset-logo-black.png")} style={{ position: "absolute", top: 262, left: "50%", width: 300, marginLeft: -150, opacity: a(0) }} />
      <Card src={src} at={at} x={250} y={410} w={580} h={720} r={-3} from="pop" />
      <Badge25 x={690} y={340} size={240} dark b={1} />
      <div style={{ position: "absolute", top: 1160, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: fit(title, 110), letterSpacing: "-0.02em", color: INK, opacity: a(0.5), transform: `translateY(${(1 - a(0.5)) * 20}px)` }}>{title}</div>
      <div style={{ position: "absolute", top: 1300, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a(1), transform: `scale(${(0.8 + 0.2 * a(1)) * punch(f, d, 0.03)})` }}>
        <div style={{ background: INK, color: LIME, fontFamily: SANS, fontWeight: 900, fontSize: 56, padding: "20px 54px 24px", borderRadius: 999 }}>{cta}</div>
      </div>
      <div style={{ position: "absolute", top: 1440, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 30, color: INK, opacity: a(1.5) }}>
        {WEB} · {STORES.map((s) => s.name).join(" · ")}
      </div>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   06 · YO SOLO IBA A VER… — the "just looking" pile grows faster and faster, a counter keeps score
   ===================================================================================== */
const PILE: (CardP & { b: number })[] = [
  { src: "IMG_2857", at: 0.3, b: 4, x: 60, y: 760, w: 470, h: 620, r: -7, from: "left" },
  { src: "IMG_2848", at: 0.5, b: 5, x: 550, y: 720, w: 470, h: 620, r: 6, from: "right" },
  { src: "IMG_3189", at: 0.5, b: 6, x: 300, y: 900, w: 480, h: 620, r: -2 },
  { src: "IMG_2842", at: 1.0, b: 8, x: 40, y: 900, w: 440, h: 580, r: 8, from: "left" },
  { src: "IMG_2988", at: 0.6, b: 8.5, x: 600, y: 880, w: 440, h: 580, r: -8, from: "right" },
  { src: "IMG_2995", at: 1.8, b: 9, x: 320, y: 760, w: 460, h: 600, r: 3 },
  { src: "IMG_3186", at: 1.0, b: 9.5, x: 90, y: 820, w: 450, h: 600, r: -5, from: "left" },
  { src: "IMG_2852", at: 1.0, b: 10, x: 540, y: 800, w: 450, h: 600, r: 7, from: "right" },
  { src: "IMG_3187", at: 1.0, b: 10.5, x: 300, y: 860, w: 470, h: 620, r: -3 },
  { src: "IMG_2846", at: 1.0, b: 11, x: 120, y: 740, w: 440, h: 580, r: 5, from: "left" },
  { src: "IMG_2862", at: 0.5, b: 11.5, x: 520, y: 900, w: 440, h: 580, r: -6, from: "right" },
];
const Counter: React.FC = () => {
  const { f, d } = useF();
  if (f < d(4)) return null;
  const n = 1 + PILE.filter((c) => f >= d(c.b)).length;
  const last = Math.max(...PILE.filter((c) => f >= d(c.b)).map((c) => d(c.b)));
  const k = 1 + 0.25 * Math.exp(-(f - last) / 4);
  return (
    <>
      <div style={{ position: "absolute", top: 280, left: 72, right: 72, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: "0.06em", color: INK }}>PIJAMAS QUE "SOLO IBA A VER":</div>
      <div style={{ position: "absolute", top: 340, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 300, lineHeight: 1, color: INK, transform: `scale(${k})` }}>{n}</div>
    </>
  );
};

export const Ad06: React.FC = () => (
  <Frame2 k="ad06">
    <At b0={0} b1={12}>
      <Bg c={CREAM} />
      <Slam top={300} out={4} lines={[{ t: "YO SOLO", b: 0 }, { t: "IBA A VER…", b: 0.5 }]} />
      <Kick t="entrando al outlet de RE:SET" b={0.8} top={640} out={4} />
      <Card src="IMG_2861" at={0.3} b={0} x={250} y={720} w={580} h={760} r={-2} />
      {PILE.map((c, i) => <Card key={i} {...c} />)}
      <Counter />
      <Badge25 x={790} y={620} size={230} b={4} />
    </At>
    <Montage b0={12} shots={[["IMG_2842", 1], ["IMG_3187", 1], ["IMG_2857", 0.5], ["IMG_2989", 1], ["IMG_3189", 1], ["IMG_2861", 0.4], ["IMG_2848", 0.8], ["IMG_2995", 1.8]]} />
    <At b0={12} b1={20}>
      <Slam top={300} lines={[{ t: "OK, PERO", b: 0, bg: LIME }, { t: "VEAN ESTAS", b: 0.5, bg: LIME }]} size={150} out={7.6} />
      <Badge25 x={780} y={1260} size={210} b={1} />
    </At>
    <At b0={20} b1={28}>
      <Bg c={LIME} />
      <Kick t="en el outlet de RE:SET" b={0} top={330} />
      <Slam top={420} lines={[{ t: "25%", b: 0, size: 460 }, { t: "OFF", b: 0.5, size: 300 }]} gap={0} />
      <Card src="IMG_3186" at={1.0} b={1} x={-40} y={1220} w={480} h={560} r={-8} from="left" />
      <Card src="IMG_2857" at={1.0} b={1.5} x={640} y={1200} w={480} h={560} r={8} from="right" />
    </At>
    <At b0={28} b1={34}>
      <Bg c={INK} />
      <Slam top={270} lines={[{ t: "ELIGE TU FAVORITA", b: 0, c: LIME }]} size={90} />
      <Card src="IMG_2842" at={1.0} b={0} x={60} y={420} w={470} h={540} from="pop" />
      <Card src="IMG_2861" at={0.4} b={0.5} x={550} y={420} w={470} h={540} from="pop" />
      <Card src="IMG_3189" at={1.0} b={1} x={60} y={980} w={470} h={540} from="pop" />
      <Card src="IMG_2848" at={0.8} b={1.5} x={550} y={980} w={470} h={540} from="pop" />
    </At>
    <At b0={34} b1={42}>
      <EndLime src="IMG_2861" at={0.4} cta="Elige tu favorita" />
    </At>
    <Sfx b={1} name="pop" vol={0.3} />
    {PILE.map((c, i) => <Sfx key={i} b={c.b} name="pop" vol={0.22} />)}
    <Sfx b={12} name="impact" vol={0.5} />
    <Sfx b={20} name="impact" vol={0.45} />
    <Sfx b={28} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={34} name="whoosh" off={-4} vol={0.35} />
  </Frame2>
);

/** a lime plus sign that pops in on its beat */
const PlusSign: React.FC<{ x: number; b: number }> = ({ x, b }) => {
  const { f, d } = useF();
  if (f < d(b)) return null;
  const p = interpolate(f, [d(b), d(b) + 6], [0, 1], { ...cl, easing: over });
  return <div style={{ position: "absolute", left: x - 30, top: 800, width: 60, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 110, lineHeight: 1, color: LIME, zIndex: 3, transform: `scale(${p})` }}>+</div>;
};

/* =====================================================================================
   07 · HAZ LAS CUENTAS — the equation builds on the beat, the drop answers it
   ===================================================================================== */
export const Ad07: React.FC = () => (
  <Frame2 k="ad07">
    <At b0={0} b1={8}>
      <Bg c={CREAM} />
      <Kick t="la matemática que sí me interesa:" b={0} top={290} />
      <Slam top={400} gap={14} lines={[{ t: "100%", b: 1, size: 300 }, { t: "− 25%", b: 3, size: 300, bg: LIME }, { t: "=", b: 5, size: 220 }, { t: "TU FAVORITA", b: 6, size: 150 }]} />
    </At>
    <At b0={8} b1={14}>
      <Bg c={INK} />
      <Slam top={300} lines={[{ t: "25% OFF", b: 0, c: LIME, size: 250 }]} />
      <Card src="IMG_2861" at={0.4} b={1} x={40} y={640} w={280} h={440} r={-4} />
      <Card src="IMG_3189" at={0.5} b={2} x={400} y={640} w={280} h={440} />
      <Card src="IMG_2857" at={0.5} b={3} x={760} y={640} w={280} h={440} r={4} />
      {[360, 720].map((x, i) => <PlusSign key={x} x={x} b={1.5 + i} />)}
      <Slam top={1200} lines={[{ t: "TODAS CON 25% OFF", b: 4, c: INK, bg: LIME, size: 80 }]} />
    </At>
    <Montage b0={14} shots={[["IMG_2848", 0.8], ["IMG_3186", 1], ["IMG_2842", 1], ["IMG_2989", 1], ["IMG_2857", 1.5], ["IMG_3187", 1], ["IMG_2861", 1], ["IMG_2984", 7.6], ["IMG_2995", 1.8], ["IMG_2852", 1]]} />
    <At b0={14} b1={24}>
      <Slam top={300} lines={[{ t: "LAS CUENTAS", b: 2, bg: WHITE }, { t: "SALEN MEJOR", b: 2.5, bg: WHITE }, { t: "EN RE:SET", b: 3, bg: LIME }]} size={130} out={9.6} />
      <Badge25 x={790} y={1270} size={210} b={1} />
    </At>
    <At b0={24} b1={30}>
      <Full src="IMG_3189" at={2.5} />
      <Ticker text="25% OFF" top={560} size={92} bg={LIME} fg={INK} rot={-6} />
      <Ticker text="OUTLET RE:SET" top={1020} size={92} bg={INK} fg={LIME} rot={5} speed={0.6} />
    </At>
    <At b0={30} b1={42}>
      <EndLime src="IMG_2848" at={0.8} cta="Aprovecha el 25% OFF" />
    </At>
    {[1, 3, 5, 6].map((b) => <Sfx key={b} b={b} name="click" vol={0.4} />)}
    <Sfx b={8} name="impact" vol={0.5} />
    {[9, 10, 11].map((b) => <Sfx key={b} b={b} name="pop" vol={0.28} />)}
    <Sfx b={24} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={30} name="whoosh" off={-4} vol={0.35} />
  </Frame2>
);

/* =====================================================================================
   08 · ELIGE TU PERSONALIDAD — four styles, four colours, then you pick
   ===================================================================================== */
const STYLES = [
  { w: "COLORIDA", bg: LIME, fg: INK, src: "IMG_2842", at: 1.0, from: "left" as const },
  { w: "DIVERTIDA", bg: CREAM, fg: INK, src: "IMG_2857", at: 0.5, from: "right" as const },
  { w: "CLÁSICA", bg: INK, fg: LIME, src: "IMG_2861", at: 0.4, from: "left" as const },
  { w: "DEPORTIVA", bg: BLUSH, fg: INK, src: "IMG_3189", at: 0.5, from: "right" as const },
];
const GRID = [
  { x: 60, y: 560 }, { x: 550, y: 560 }, { x: 60, y: 1070 }, { x: 550, y: 1070 },
];
const Pick: React.FC = () => {
  const { f, d } = useF();
  const hi = f >= d(2) ? [0, 2, 1, 3, 0, 2, 1, 3, 2, 2, 2, 2][Math.min(11, Math.floor((f - d(2)) / d(0.5)))] : -1;
  return (
    <>
      {STYLES.map((s, i) => <Card key={i} src={s.src} at={s.at} b={i * 0.25} x={GRID[i].x} y={GRID[i].y} w={470} h={480} from="pop" label={s.w} hi={hi === i} />)}
    </>
  );
};

export const Ad08: React.FC = () => (
  <Frame2 k="ad08">
    <At b0={0} b1={4}>
      <Bg c={INK} />
      <Slam top={380} lines={[{ t: "TU PIJAMA", b: 0, c: WHITE }, { t: "DICE MUCHO", b: 0.5, c: WHITE }, { t: "DE TI.", b: 1, c: LIME }]} />
      <Slam top={1060} lines={[{ t: "¿CUÁL ERES?", b: 2, c: INK, bg: LIME, size: 110 }]} />
    </At>
    {STYLES.map((s, i) => (
      <At key={i} b0={4 + i * 4} b1={8 + i * 4}>
        <Bg c={s.bg} />
        <Kick t={`0${i + 1} / 04`} b={0} top={270} c={s.fg} />
        <Slam top={340} lines={[{ t: s.w, b: 0, c: s.fg, size: 200 }]} />
        <Card src={s.src} at={s.at} b={0.25} x={190} y={560} w={700} h={960} r={i % 2 ? 3 : -3} from={s.from} />
      </At>
    ))}
    <At b0={20} b1={28}>
      <Bg c={CREAM} />
      <Slam top={280} lines={[{ t: "¿YA SABES", b: 0 }, { t: "CUÁL ERES?", b: 0.5 }]} size={120} />
      <Pick />
    </At>
    <At b0={28} b1={34}>
      <Bg c={INK} />
      <Slam top={300} lines={[{ t: "TODAS CON", b: 0, c: WHITE, size: 140 }, { t: "25% OFF", b: 0.5, c: LIME, size: 250 }]} />
      {STYLES.map((s, i) => <Card key={i} src={s.src} at={s.at} b={1 + i * 0.5} x={30 + i * 240} y={900} w={300} h={440} r={[-10, -4, 4, 10][i]} />)}
    </At>
    <At b0={34} b1={40}>
      <EndLime src="IMG_2857" at={0.5} cta="Encuentra la tuya" />
    </At>
    <Sfx b={2} name="pop" vol={0.35} />
    <Sfx b={4} name="impact" vol={0.45} />
    {[8, 12, 16].map((b) => <Sfx key={b} b={b} name="swipe" off={-3} vol={0.35} />)}
    {[22, 22.5, 23, 23.5, 24, 24.5, 25, 25.5].map((b) => <Sfx key={b} b={b} name="click" vol={0.25} />)}
    <Sfx b={28} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={34} name="whoosh" off={-4} vol={0.35} />
  </Frame2>
);

/* =====================================================================================
   09 · EL ALGORITMO ME CONOCE — a feed (original design) that fills up with pajamas, then the drop
   ===================================================================================== */
const FEED = ["IMG_2842", "IMG_3189", "IMG_2857", "IMG_2861", "IMG_3186", "IMG_2848", "IMG_3187", "IMG_2995", "IMG_2852", "IMG_2846", "IMG_2862", "IMG_2988"];
const FEED_AT: Record<string, number> = { IMG_2995: 1.8, IMG_2988: 0.5 };
const NOTES: [number, string][] = [[8, "Para ti: pijamas con 25% OFF"], [12, "Te puede gustar: otra pijama RE:SET"], [16, "Sigues viendo pijamas…"]];

const Feed: React.FC = () => {
  const { f, d } = useF();
  const grow = interpolate(f, [d(6), d(8.5)], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const scroll = 1.5 * f + 0.03 * f * f;
  const ITEM = 780;
  return (
    <div style={{ position: "absolute", left: 190 - 190 * grow, top: 820 - 700 * grow, width: 700 + 380 * grow, height: 1300 + 500 * grow, borderRadius: 70 * (1 - grow) + 10, background: INK, padding: 16 * (1 - grow), boxSizing: "border-box", boxShadow: "0 40px 90px rgba(0,0,0,0.35)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 56 * (1 - grow), overflow: "hidden", background: WHITE }}>
        {FEED.map((src, i) => {
          const y = 40 + i * ITEM - scroll;
          if (y > 1900 || y < -ITEM) return null;
          return (
            <div key={i} style={{ position: "absolute", left: 24, right: 24, top: y, height: ITEM - 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, height: 80 }}>
                <div style={{ width: 60, height: 60, borderRadius: 30, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 24, color: INK }}>RE</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK }}>re:set</div>
                <div style={{ marginLeft: "auto", background: INK, color: LIME, fontFamily: SANS, fontWeight: 800, fontSize: 24, padding: "8px 16px", borderRadius: 999 }}>25% OFF</div>
              </div>
              <div style={{ position: "absolute", top: 90, left: 0, right: 0, bottom: 0, borderRadius: 26, overflow: "hidden", filter: GRADE }}>
                <Vid src={src} at={FEED_AT[src] ?? 1.0} />
              </div>
            </div>
          );
        })}
        {NOTES.map(([b, t]) => {
          const p = interpolate(f, [d(b), d(b) + 7, d(b + 3), d(b + 3) + 7], [0, 1, 1, 0], { ...cl, easing: outE });
          if (p <= 0) return null;
          return (
            <div key={b} style={{ position: "absolute", left: 40, right: 40, top: 60 + 180 * grow - (1 - p) * 220, background: "rgba(255,255,255,0.96)", borderRadius: 34, padding: "26px 30px", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 18px 40px rgba(0,0,0,0.25)" }}>
              <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 22, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 24, color: INK }}>RE</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: INK }}>{t}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Ad09: React.FC = () => (
  <Frame2 k="ad09">
    <At b0={0} b1={20}>
      <Bg c={LIME} />
      <Slam top={270} out={6.5} size={120} lines={[{ t: "MI ALGORITMO", b: 0 }, { t: "CUANDO VE QUE", b: 0.5 }, { t: "RE:SET TIENE", b: 1 }, { t: "25% OFF", b: 1.5, c: LIME, bg: INK }]} />
      <Feed />
    </At>
    <At b0={20} b1={24}>
      <Bg c={INK} />
      <Slam top={560} lines={[{ t: "OK,", b: 0, c: WHITE, size: 220 }, { t: "MENSAJE", b: 0.5, c: LIME, size: 220 }, { t: "RECIBIDO.", b: 1, c: LIME, size: 220 }]} />
    </At>
    <Montage b0={24} shots={[["IMG_3186", 1], ["IMG_2842", 1], ["IMG_3187", 1], ["IMG_2857", 1], ["IMG_3189", 1], ["IMG_2861", 0.4], ["IMG_2848", 0.8], ["IMG_2995", 1.8]]} />
    <At b0={24} b1={32}>
      <Badge25 x={780} y={1270} size={210} b={0.5} />
    </At>
    <At b0={32} b1={36}>
      <Split3 cells={[{ src: "IMG_3186", at: 2 }, { src: "IMG_3187", at: 2 }, { src: "IMG_3189", at: 2 }]} />
      <Slam top={300} lines={[{ t: "25% OFF", b: 0.5, c: INK, bg: LIME, size: 160 }]} />
    </At>
    <At b0={36} b1={47}>
      <EndLime src="IMG_3189" at={0.5} cta="Compra ahora" title="RE:SET OUTLET" />
    </At>
    {NOTES.map(([b]) => <Sfx key={b} b={b} name="notif" vol={0.4} />)}
    <Sfx b={20} name="impact" vol={0.5} />
    <Sfx b={32} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={36} name="whoosh" off={-4} vol={0.35} />
  </Frame2>
);

/* =====================================================================================
   10 · DIEZ SEGUNDOS PARA ENAMORARTE — a countdown, one pajama per beat, then the offer
   ===================================================================================== */
const COUNT: [string, number][] = [["IMG_2842", 1], ["IMG_3189", 1], ["IMG_2857", 0.5], ["IMG_2861", 0.4], ["IMG_3186", 1.5], ["IMG_2848", 0.8], ["IMG_2984", 7.6], ["IMG_3187", 1.5], ["IMG_2995", 1.8], ["IMG_2852", 1]];
const Num: React.FC<{ n: number }> = ({ n }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 5], [1.4, 1], { ...cl, easing: outE });
  return <div style={{ position: "absolute", top: 250, left: 72, fontFamily: SANS, fontWeight: 900, fontSize: 280, lineHeight: 1, color: LIME, textShadow: "0 6px 30px rgba(0,0,0,0.45)", transform: `scale(${p})`, transformOrigin: "left top" }}>{n}</div>;
};

export const Ad10: React.FC = () => (
  <Frame2 k="ad10">
    <At b0={0} b1={2}>
      <Bg c={CREAM} />
      <Slam top={520} lines={[{ t: "DAME", b: 0 }, { t: "10 SEGUNDOS", b: 0.25 }, { t: "PARA ENAMORARTE", b: 0.5, bg: LIME }]} />
    </At>
    {COUNT.map(([src, at], i) => (
      <At key={i} b0={2 + i} b1={3 + i}>
        <Full src={src} at={at} />
        <Num n={10 - i} />
      </At>
    ))}
    <At b0={12} b1={16}>
      <Bg c={LIME} />
      <Kick t="outlet RE:SET" b={0} top={330} />
      <Slam top={440} gap={0} lines={[{ t: "25%", b: 0, size: 480 }, { t: "OFF", b: 0.4, size: 300 }]} />
    </At>
    <At b0={16} b1={22}>
      <EndLime src="IMG_2842" at={1.0} cta="Descúbrelo ahora" />
    </At>
    <Sfx b={2} name="impact" vol={0.45} />
    <Sfx b={12} name="impact" vol={0.5} />
    <Sfx b={16} name="whoosh" off={-4} vol={0.35} />
  </Frame2>
);
