import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { At, BeatProvider, Shade, Shot, Vid, useBeat, cl, outE, overE } from "../outlet4/fx";

/** RE · recreation of the reference reel (flooring ad, 12.2 s): same beats of the reference's track (113.6 BPM, beat 0.5283 s, first beat 0.06 s) */
export const RE_B = 0.5283;
export const RE_OFF = 0.06;
export const RE_BEATS = 23;
export const RE_FRAMES = Math.round((RE_OFF + RE_BEATS * RE_B) * 30);

const INK = "#151515";
const CREAM = "#F1EEE5";
const SERIF = "Playfair";
const SANS = "Montserrat";

/** one floating product card: framed photo on a soft shadow, lands on its beat with a slight overshoot and floats after */
const Card: React.FC<{ src: string; at: number; b: number; x: number; y: number; w: number; h: number; r: number; hide?: number }> = ({ src, at, b, x, y, w, h, r, hide }) => {
  const f = useCurrentFrame();
  const { f: F } = useBeat();
  const s = F(b);
  if (f < s - 1) return null;
  const p = interpolate(f, [s, s + 9], [0, 1], { ...cl, easing: overE });
  const o = hide === undefined ? 1 : interpolate(f, [F(hide), F(hide) + 5], [1, 0], cl);
  const drift = Math.sin(((f - s) / 30) * Math.PI * 0.7) * 6;
  return (
    <div style={{ position: "absolute", left: x, top: y + drift + (1 - p) * 140, width: w, height: h, background: "#FFFBF2", padding: 12, boxSizing: "border-box", boxShadow: "0 28px 54px rgba(20,20,20,0.22)", transform: `rotate(${r + (1 - p) * 7}deg) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 2) * o }}>
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        <Sequence from={s} layout="none">
          <AbsoluteFill>
            <Vid src={src} at={at} />
          </AbsoluteFill>
        </Sequence>
      </div>
    </div>
  );
};

/** the first product: lands centred, then shrinks and slides to the top to make room for the reveal */
const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const { f: F } = useBeat();
  const p = interpolate(f, [F(0), F(0) + 9], [0, 1], { ...cl, easing: overE });
  const k = interpolate(f, [F(4), F(5.6)], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const fade = interpolate(f, [F(5.6), F(6.4)], [1, 0], cl);
  const w = 560 - 220 * k;
  const h = 800 - 330 * k;
  return (
    <div style={{ position: "absolute", left: 260 + 120 * k - (1 - p) * 40, top: 640 - 240 * k + (1 - p) * 120, width: w, height: h, background: "#FFFBF2", padding: 12, boxSizing: "border-box", boxShadow: "0 30px 60px rgba(20,20,20,0.24)", transform: `rotate(${-3 + 3 * k}deg)`, opacity: Math.min(1, p * 2) * fade }}>
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        <Sequence from={0} layout="none">
          <AbsoluteFill>
            <Vid src="IMG_2861" at={0.3} />
          </AbsoluteFill>
        </Sequence>
      </div>
    </div>
  );
};

/** the hook: built word by word in an editorial serif, then gone */
const PHRASES: [number, string][] = [
  [0, "Esto"],
  [0.95, "Esto no es"],
  [1.9, "Esto no es un descuento"],
  [2.95, "Esto no es un descuento cualquiera."],
];
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { f: F } = useBeat();
  let cur: [number, string] | null = null;
  for (const ph of PHRASES) if (f >= F(ph[0])) cur = ph;
  if (!cur) return null;
  const p = interpolate(f, [F(cur[0]), F(cur[0]) + 6], [0, 1], { ...cl, easing: outE });
  const out = interpolate(f, [F(4), F(4.6)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", top: 300, left: 70, right: 70, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 92, lineHeight: 1.08, color: INK, opacity: p * out, transform: `translateY(${(1 - p) * 18}px)` }}>
      {cur[1]}
    </div>
  );
};

/** a line of type that lands on its beat */
const Pop: React.FC<{ b: number; top: number; children: React.ReactNode; style?: React.CSSProperties; hide?: number }> = ({ b, top, children, style, hide }) => {
  const f = useCurrentFrame();
  const { f: F } = useBeat();
  if (f < F(b) - 1) return null;
  const p = interpolate(f, [F(b), F(b) + 7], [0, 1], { ...cl, easing: outE });
  const o = hide === undefined ? 1 : interpolate(f, [F(hide), F(hide) + 5], [1, 0], cl);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", opacity: p * o, transform: `translateY(${(1 - p) * 24}px)`, ...style }}>
      {children}
    </div>
  );
};

/** the reveal: RE / OUTLET / 25% OFF, each on its beat */
const Reveal: React.FC = () => (
  <>
    <Pop b={5} top={690} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 330, lineHeight: 1, color: INK, letterSpacing: "-0.02em" }} hide={9.8}>RE</Pop>
    <Pop b={5.5} top={1080} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, letterSpacing: "0.5em", color: INK, paddingLeft: "0.5em" }} hide={9.8}>OUTLET</Pop>
    <Pop b={6.5} top={1150} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 200, lineHeight: 0.95, letterSpacing: "-0.03em", color: INK }} hide={9.8}>25% OFF</Pop>
  </>
);

/** the specs around the product: small sans labels with a hairline, one beat apart */
const Labels: React.FC = () => {
  const f = useCurrentFrame();
  const { f: F } = useBeat();
  const L = (b: number, left: number | undefined, right: number | undefined, top: number, text: string) => {
    if (f < F(b) || f >= F(9.8)) return null;
    const p = interpolate(f, [F(b), F(b) + 6], [0, 1], { ...cl, easing: outE });
    return (
      <div key={text} style={{ position: "absolute", top, left, right, opacity: p, fontFamily: SANS, fontWeight: 600, fontSize: 34, letterSpacing: "0.2em", textTransform: "uppercase", color: INK, display: "flex", alignItems: "center", gap: 16, flexDirection: right !== undefined ? "row-reverse" : "row" }}>
        <div style={{ width: 120 * p, height: 2, background: INK }} />
        <div>{text}</div>
      </div>
    );
  };
  return (
    <>
      {L(8, 64, undefined, 1400, "Pijamas seleccionadas")}
      {L(8.5, undefined, 64, 1480, "Elige tu favorita")}
      {L(9, 64, undefined, 1560, "Outlet RE")}
    </>
  );
};

/** the real footage: a small editorial frame that grows to full screen while the clips change */
const Grow: React.FC = () => {
  const f = useCurrentFrame();
  const { f: F } = useBeat();
  if (f < F(10) || f >= F(14)) return null;
  const k = interpolate(f, [F(10), F(14)], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const w = 480 + (1080 - 480) * k;
  const h = 853 + (1920 - 853) * k;
  const left = 300 * (1 - k);
  const top = 640 * (1 - k);
  return (
    <div style={{ position: "absolute", left, top, width: w, height: h, overflow: "hidden", boxShadow: k < 1 ? "0 30px 60px rgba(20,20,20,0.24)" : "none" }}>
      <Sequence from={F(10)} durationInFrames={F(12) - F(10)} layout="none"><AbsoluteFill><Vid src="IMG_2842" at={1.0} /></AbsoluteFill></Sequence>
      <Sequence from={F(12)} durationInFrames={F(13) - F(12)} layout="none"><AbsoluteFill><Vid src="IMG_2988" at={0.7} /></AbsoluteFill></Sequence>
      <Sequence from={F(13)} durationInFrames={F(14) - F(13)} layout="none"><AbsoluteFill><Vid src="IMG_2989" at={1.5} /></AbsoluteFill></Sequence>
      {f >= F(13) && (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.55) 60%, rgba(10,10,10,0.6) 100%)" }} />
          <Pop b={13} top={1240} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 70, color: "#FFFBF2", textShadow: "0 3px 24px rgba(0,0,0,0.5)" }}>Tus favoritas, ahora en outlet.</Pop>
        </>
      )}
    </div>
  );
};

/** the closing card: clean cream, the offer, a readable CTA, the RE logo */
const Closing: React.FC = () => {
  const f = useCurrentFrame();
  const { f: F } = useBeat();
  if (f < F(20) - 1) return null;
  const a = (s: number) => interpolate(f, [F(s), F(s) + 8], [0, 1], { ...cl, easing: outE });
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <div style={{ position: "absolute", top: 600, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: "0.5em", paddingLeft: "0.5em", color: INK, opacity: a(20) }}>OUTLET</div>
      <div style={{ position: "absolute", top: 650, left: 0, right: 0, textAlign: "center", fontFamily: SERIF, fontWeight: 900, fontSize: 300, lineHeight: 1, color: INK, opacity: a(20.4), transform: `scale(${0.96 + 0.04 * a(20.4)})` }}>RE</div>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 180, lineHeight: 1, letterSpacing: "-0.03em", color: INK, opacity: a(20.8) }}>25% OFF</div>
      <div style={{ position: "absolute", top: 1260, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a(21.2) }}>
        <div style={{ background: INK, color: "#FFFBF2", fontFamily: SANS, fontWeight: 800, fontSize: 60, padding: "24px 64px 28px", borderRadius: 999 }}>Compra ahora</div>
      </div>
      <div style={{ position: "absolute", top: 1390, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 40, color: INK, opacity: a(21.6) }}>Descubre el outlet</div>
      <Img src={staticFile("brand/reset-logo-black.png")} style={{ position: "absolute", top: 1450, left: "50%", width: 220, marginLeft: -110, opacity: a(22) * 0.9 }} />
    </AbsoluteFill>
  );
};

/** the montage: one product per beat, snap cuts, each one a choice from the outlet */
const MONTAGE: [number, string, number][] = [
  [14, "IMG_2862", 0.4],
  [15, "IMG_2839", 0.6],
  [16, "IMG_2865", 0.4],
  [17, "IMG_2848", 1.0],
  [18, "IMG_2857", 1.0],
  [19, "IMG_2851", 1.5],
];

export const Re12: React.FC<{ music: string }> = ({ music }) => (
  <BeatProvider B={RE_B} off={RE_OFF}>
    <AbsoluteFill style={{ background: CREAM, overflow: "hidden" }}>
      {/* 0–6 s · hook, the product floats in, the reveal, the specs */}
      <Hero />
      <Hook />
      <Card src="IMG_2988" at={0.6} b={4} x={50} y={290} w={280} h={330} r={-4} hide={9.8} />
      <Card src="IMG_2857" at={0.8} b={4.4} x={400} y={250} w={280} h={340} r={2} hide={9.8} />
      <Card src="IMG_2985" at={1.2} b={4.8} x={760} y={300} w={280} h={330} r={5} hide={9.8} />
      <Reveal />
      <Labels />

      {/* 6–14 s · the real footage grows to full screen */}
      <Grow />

      {/* 14–20 s · montage, one product per beat */}
      {MONTAGE.map(([b, src, at]) => (
        <At key={b} b0={b} b1={b + 1}>
          <Shot src={src} at={at} fin="snap" z={[1.08, 1.0]} />
        </At>
      ))}
      <At b0={14} b1={20}>
        <Shade top={330} h={560} o={0.5} />
        <div style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 190, lineHeight: 0.95, letterSpacing: "-0.03em", color: "#E2EC95", whiteSpace: "nowrap", textShadow: "0 4px 30px rgba(0,0,0,0.45)" }}>25% OFF</div>
      </At>
      <At b0={15.5} b1={19.5}>
        <div style={{ position: "absolute", top: 1220, left: 0, right: 0, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 88, color: "#FFFBF2", textShadow: "0 3px 24px rgba(0,0,0,0.5)" }}>elige tu favorita</div>
      </At>

      {/* 20–23 s · closing */}
      <Closing />
      <Audio src={staticFile(music)} />
    </AbsoluteFill>
  </BeatProvider>
);
