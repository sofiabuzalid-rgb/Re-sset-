import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, Shot, StoreBlock, Timeline, Vignette } from "../campana/shared";
import { AD, BA, BF, Pan, Row } from "./config";

export const BASE = "ads4";
const LIME = "#E2EC95";
const WHITE = "#FFFFFF";
const FONT = "Montserrat";
const SH = "0 3px 26px rgba(0,0,0,0.7)";
const SAFE_X = 64;
const over = Easing.bezier(0.34, 1.7, 0.5, 1);
const GRADE = "contrast(1.05) saturate(1.04)";

/** frames: duration of each ad, from its beats */
export const DUR = { ad1: Math.round(AD.ad1.beats * AD.ad1.B * 30), ad2: Math.round(AD.ad2.beats * AD.ad2.B * 30), ad3: Math.round(AD.ad3.beats * AD.ad3.B * 30), ad4: Math.round(AD.ad4.beats * AD.ad4.B * 30) };

const rowShots = (B: number, rows: Row[]): Shot[] => rows.map(([b0, b1, src, at, zoom = [1, 1.05]]) => ({ name: `${src}@${b0}`, src, from: b0 * B, to: b1 * B, at, zoom, origin: [50, 45] }));
const panShots = (B: number, pans: Pan[]): Shot[] => pans.map((p) => ({ name: `pan@${p.b0}`, src: p.panels[0][0], from: p.b0 * B, to: p.b1 * B, at: p.panels[0][1], zoom: [1, 1], panels: p.panels.map(([s, a]) => ({ src: s, at: a })) }));
const shotsOf = (c: { B: number; rows: Row[]; pans: Pan[] }) => [...rowShots(c.B, c.rows), ...panShots(c.B, c.pans)];

/** the picture moves with the music: a soft punch on every beat, a small push on the hits */
const Beat: React.FC<{ B: number; hits: number[]; children: React.ReactNode }> = ({ B, hits, children }) => {
  const f = useCurrentFrame();
  const bf = B * 30;
  const punch = 1 + 0.015 * Math.exp(-(f % bf) / 3.2);
  const d = hits.map((h) => f - h * bf).filter((x) => x >= 0 && x < 9);
  const hit = d.length ? Math.min(...d) : undefined;
  const hp = hit === undefined ? 1 : 1 + 0.03 * Math.exp(-hit / 2.5);
  const sh = hit === undefined ? 0 : Math.sin(hit * 2.6) * 4 * Math.exp(-hit / 2.5);
  return <AbsoluteFill style={{ transform: `translate(${sh}px, ${sh * 0.4}px) scale(${punch * hp})` }}>{children}</AbsoluteFill>;
};

/** a faint white pulse on the hits (not on frame 0, so the opening frame stays clean) */
const Flash: React.FC<{ B: number; hits: number[] }> = ({ B, hits }) => {
  const f = useCurrentFrame();
  const bf = B * 30;
  const o = Math.max(0, ...hits.map((h) => { const d = f - h * bf; return d < 0 || d > 5 ? 0 : interpolate(d, [0, 5], [0.18, 0], clamp); }));
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

/** shows its children between two beats, with a short fade in and out */
const Win: React.FC<{ B: number; b0: number; b1: number; children: React.ReactNode }> = ({ B, b0, b1, children }) => {
  const f = useCurrentFrame();
  const a = b0 * B * 30;
  const b = b1 * B * 30;
  if (f < a - 1 || f >= b) return null;
  const p = interpolate(f, [a, a + 8], [0, 1], { ...clamp, easing: over });
  const o = interpolate(f, [b - 6, b], [1, 0], clamp);
  return <div style={{ position: "absolute", inset: 0, opacity: Math.min(p * 1.4, 1) * o, transform: `translateY(${(1 - p) * 14}px)`, pointerEvents: "none" }}>{children}</div>;
};

/** top and bottom shade so the type reads on any photo */
const Shade: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.42) 100%)", pointerEvents: "none" }} />
);

/** wordmark kept inside Meta's top safe zone */
const Brand: React.FC = () => (
  <div style={{ position: "absolute", top: 262, left: SAFE_X, fontFamily: FONT, fontWeight: 900, fontSize: 34, letterSpacing: "0.22em", color: WHITE, textShadow: SH }}>RE:SET</div>
);

/** left-aligned headline, one line per array item */
const Headline: React.FC<{ lines: string[]; top?: number; size?: number; color?: string }> = ({ lines, top = 380, size = 92, color = WHITE }) => (
  <div style={{ position: "absolute", top, left: SAFE_X, right: SAFE_X, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.02em", color, textShadow: SH }}>
    {lines.map((l) => <div key={l}>{l}</div>)}
  </div>
);

/** the discount: one lime figure, no box */
const Price: React.FC<{ top: number; size?: number }> = ({ top, size = 200 }) => (
  <div style={{ position: "absolute", top, left: SAFE_X, right: SAFE_X, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: "-0.03em", color: LIME, textShadow: SH, whiteSpace: "nowrap" }}>25% OFF</div>
);

/** small supporting line */
const Caption: React.FC<{ text: string; top: number }> = ({ text, top }) => (
  <div style={{ position: "absolute", top, left: SAFE_X, right: SAFE_X, fontFamily: FONT, fontWeight: 600, fontSize: 46, color: WHITE, textShadow: SH }}>{text}</div>
);

/** the common frame: beat-synced picture, shade, vignette, flash, brand, the ad's own text, its music from the chosen beat */
const Frame: React.FC<{ c: { B: number; hits: number[]; startM: number; music: string; beats: number; rows: Row[]; pans: Pan[] }; children: React.ReactNode }> = ({ c, children }) => {
  const frames = Math.round(c.beats * c.B * 30);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Beat B={c.B} hits={c.hits}>
        <Timeline shots={shotsOf(c)} grade={GRADE} base={BASE} />
      </Beat>
      <Shade />
      <Vignette strength={0.2} />
      <Flash B={c.B} hits={c.hits} />
      <Brand />
      {children}
      <Audio src={staticFile(c.music)} startFrom={Math.round(c.startM * 30)} volume={(f) => 0.9 * interpolate(f, [frames - 12, frames], [1, 0], clamp)} />
    </AbsoluteFill>
  );
};

/* 1 · PIJAMA ROJA DE PINOS — hook con el producto y el precio desde el primer cuadro */
export const Ad01: React.FC = () => {
  const c = AD.ad1;
  const B = c.B;
  return (
    <Frame c={c}>
      <Win B={B} b0={0} b1={8}>
        <Headline lines={["Pijama roja", "de pinos"]} />
        <Price top={640} />
      </Win>
      <Win B={B} b0={18} b1={34}><Caption text="Estampados navideños, en Outlet." top={1020} /></Win>
      <Win B={B} b0={44} b1={50}>
        <Headline lines={["Compra en RE:SET"]} top={380} size={82} />
        <Price top={520} size={140} />
        <div style={{ position: "absolute", top: 820, left: 0, right: 0 }}><StoreBlock delay={Math.round(44 * B * 30) + 4} /></div>
      </Win>
    </Frame>
  );
};

/* 2 · POV — hook en primera persona, pregunta, cierre */
export const Ad02: React.FC = () => {
  const c = AD.ad2;
  const B = c.B;
  return (
    <Frame c={c}>
      <Win B={B} b0={0} b1={6}><Headline lines={["POV: encuentras", "la pijama de esquí"]} size={80} /></Win>
      <Win B={B} b0={6} b1={18}>
        <Headline lines={["Pijama de esquí"]} top={380} size={84} />
        <Price top={520} />
      </Win>
      <Win B={B} b0={30} b1={36}><Headline lines={["¿Cuál escogerías?"]} top={380} size={84} /></Win>
      <Win B={B} b0={42} b1={48}>
        <Headline lines={["Encuéntrala en RE:SET"]} top={380} size={72} />
        <Price top={520} size={140} />
        <div style={{ position: "absolute", top: 820, left: 0, right: 0 }}><StoreBlock delay={Math.round(42 * B * 30) + 4} /></div>
      </Win>
    </Frame>
  );
};

/* 3 · PRECIO COMPLETO — hook directo con el estampado y la oferta */
export const Ad03: React.FC = () => {
  const c = AD.ad3;
  const B = c.B;
  return (
    <Frame c={c}>
      <Win B={B} b0={0} b1={4}><Headline lines={["Pijama con gorros", "de Navidad."]} size={84} /></Win>
      <Win B={B} b0={4} b1={14}>
        <Headline lines={["No pagues", "precio completo."]} top={380} size={80} />
        <Price top={620} />
      </Win>
      <Win B={B} b0={40} b1={46}>
        <Headline lines={["Compra ahora en RE:SET"]} top={380} size={72} />
        <Price top={520} size={140} />
        <div style={{ position: "absolute", top: 820, left: 0, right: 0 }}><StoreBlock delay={Math.round(40 * B * 30) + 4} /></div>
      </Win>
    </Frame>
  );
};

/* 4 · DROP — 25% OFF gigante al abrir, estampados en el montaje, cierre de marca */
export const Ad04: React.FC = () => {
  const c = AD.ad4;
  const B = c.B;
  return (
    <Frame c={c}>
      <Win B={B} b0={0} b1={4}>
        <Price top={460} size={210} />
        <Caption text="en pijamas navideñas" top={720} />
      </Win>
      <Win B={B} b0={4} b1={8}><Headline lines={["Estampados navideños"]} size={80} /></Win>
      <Win B={B} b0={40} b1={46}><Headline lines={["Elige tu favorita."]} top={380} size={84} /></Win>
      <Win B={B} b0={46} b1={52}>
        <Price top={460} size={190} />
        <Headline lines={["RE:SET"]} top={700} size={72} />
        <div style={{ position: "absolute", top: 880, left: 0, right: 0 }}><StoreBlock delay={Math.round(46 * B * 30) + 4} /></div>
      </Win>
    </Frame>
  );
};

export { BA, BF };
