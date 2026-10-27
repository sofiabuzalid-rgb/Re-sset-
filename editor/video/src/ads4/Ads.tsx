import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, Shot, StoreBlock, Timeline, Vignette } from "../campana/shared";
import { AD, BA, BF, Pan, Row } from "./config";

export const BASE = "ads4";
const INK = "#151515";
const LIME = "#E2EC95";
const PAPER = "#FFFBF2";
const FONT = "Montserrat";
const SH = "0 2px 18px rgba(0,0,0,0.45)";
const over = Easing.bezier(0.34, 1.7, 0.5, 1);
const GRADE = "contrast(1.05) saturate(1.06)";

/** frames: duration of each ad, from its beats */
export const DUR = { ad1: Math.round(AD.ad1.beats * AD.ad1.B * 30), ad2: Math.round(AD.ad2.beats * AD.ad2.B * 30), ad3: Math.round(AD.ad3.beats * AD.ad3.B * 30), ad4: Math.round(AD.ad4.beats * AD.ad4.B * 30) };

const rowShots = (B: number, rows: Row[]): Shot[] => rows.map(([b0, b1, src, at, zoom = [1, 1.05]]) => ({ name: `${src}@${b0}`, src, from: b0 * B, to: b1 * B, at, zoom, origin: [50, 45] }));
const panShots = (B: number, pans: Pan[]): Shot[] => pans.map((p) => ({ name: `pan@${p.b0}`, src: p.panels[0][0], from: p.b0 * B, to: p.b1 * B, at: p.panels[0][1], zoom: [1, 1], panels: p.panels.map(([s, a]) => ({ src: s, at: a })) }));
const shotsOf = (c: { B: number; rows: Row[]; pans: Pan[] }) => [...rowShots(c.B, c.rows), ...panShots(c.B, c.pans)];

/** the picture moves with the music: a small punch on every beat, a harder punch + shake on the hits */
const Beat: React.FC<{ B: number; hits: number[]; children: React.ReactNode }> = ({ B, hits, children }) => {
  const f = useCurrentFrame();
  const bf = B * 30;
  const punch = 1 + 0.02 * Math.exp(-(f % bf) / 3.2);
  const d = hits.map((h) => f - h * bf).filter((x) => x >= 0 && x < 9);
  const hit = d.length ? Math.min(...d) : undefined;
  const hp = hit === undefined ? 1 : 1 + 0.05 * Math.exp(-hit / 2.5);
  const sh = hit === undefined ? 0 : Math.sin(hit * 2.6) * 12 * Math.exp(-hit / 2.5);
  return <AbsoluteFill style={{ transform: `translate(${sh}px, ${sh * 0.4}px) scale(${punch * hp})` }}>{children}</AbsoluteFill>;
};

/** white flash on the hits (not on frame 0, so the thumbnail stays clean) */
const Flash: React.FC<{ B: number; hits: number[] }> = ({ B, hits }) => {
  const f = useCurrentFrame();
  const bf = B * 30;
  const o = Math.max(0, ...hits.map((h) => { const d = f - h * bf; return d < 0 || d > 5 ? 0 : interpolate(d, [0, 5], [0.45, 0], clamp); }));
  return <AbsoluteFill style={{ background: "#fff", opacity: o, pointerEvents: "none" }} />;
};

/** shows its children between two beats, with a quick pop in and a fade out */
const Win: React.FC<{ B: number; b0: number; b1: number; children: React.ReactNode }> = ({ B, b0, b1, children }) => {
  const f = useCurrentFrame();
  const a = b0 * B * 30;
  const b = b1 * B * 30;
  if (f < a - 1 || f >= b) return null;
  const p = interpolate(f, [a, a + 6], [0, 1], { ...clamp, easing: over });
  const o = interpolate(f, [b - 5, b], [1, 0], clamp);
  return <div style={{ position: "absolute", inset: 0, opacity: Math.min(p * 1.6, 1) * o, transform: `scale(${0.94 + 0.06 * p})`, pointerEvents: "none" }}>{children}</div>;
};

const Label: React.FC<{ lines: string[]; top: number; bg?: string; fg?: string; size?: number }> = ({ lines, top, bg = INK, fg = PAPER, size = 56 }) => (
  <div style={{ position: "absolute", top, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    {lines.map((l) => (
      <div key={l} style={{ background: bg, color: fg, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.08, letterSpacing: "-0.015em", padding: "10px 26px 14px", textAlign: "center", textShadow: SH }}>{l}</div>
    ))}
  </div>
);

/** "25% OFF" pill in the corner, pulsing on the beat */
const Corner: React.FC<{ B: number; b0: number; b1: number }> = ({ B, b0, b1 }) => {
  const f = useCurrentFrame();
  const bf = B * 30;
  if (f < b0 * bf || f >= b1 * bf) return null;
  const pop = 1 + 0.06 * Math.exp(-(f % bf) / 2.5);
  return <div style={{ position: "absolute", top: 290, right: 46, background: LIME, color: INK, fontFamily: FONT, fontWeight: 900, fontSize: 44, padding: "8px 18px", transform: `scale(${pop}) rotate(3deg)`, transformOrigin: "right top" }}>25% OFF</div>;
};

/** big "25% OFF" block that flips colour on every beat */
const Badge25: React.FC<{ B: number; b0: number; b1: number; top: number; size?: number }> = ({ B, b0, b1, top, size = 130 }) => {
  const f = useCurrentFrame();
  const bf = B * 30;
  const a = b0 * bf;
  const b = b1 * bf;
  if (f < a - 1 || f >= b) return null;
  const flip = Math.floor((f - a) / bf) % 2 === 1;
  const p = interpolate(f, [a, a + 6], [0, 1], { ...clamp, easing: over });
  const o = interpolate(f, [b - 5, b], [1, 0], clamp);
  const pop = 1 + 0.04 * Math.exp(-(f % bf) / 3);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: flip ? PAPER : INK, color: flip ? INK : LIME, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 0.95, letterSpacing: "-0.03em", padding: "14px 36px 20px", transform: `scale(${(0.6 + 0.4 * p) * pop})`, boxShadow: "0 18px 50px rgba(0,0,0,0.35)" }}>25% OFF</div>
    </div>
  );
};

/** the common frame: beat-synced picture, vignette, flash, the ad's own overlays, its music from the chosen beat */
const Frame: React.FC<{ c: { B: number; hits: number[]; startM: number; music: string; beats: number; rows: Row[]; pans: Pan[] }; children: React.ReactNode }> = ({ c, children }) => {
  const frames = Math.round(c.beats * c.B * 30);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Beat B={c.B} hits={c.hits}>
        <Timeline shots={shotsOf(c)} grade={GRADE} base={BASE} />
      </Beat>
      <Vignette strength={0.25} />
      <Flash B={c.B} hits={c.hits} />
      {children}
      <Audio src={staticFile(c.music)} startFrom={Math.round(c.startM * 30)} volume={(f) => 0.9 * interpolate(f, [frames - 12, frames], [1, 0], clamp)} />
    </AbsoluteFill>
  );
};

/* 1 · ESTA ES TU SEÑAL */
export const Ad01: React.FC = () => {
  const c = AD.ad1;
  const B = c.B;
  return (
    <Frame c={c}>
      <Win B={B} b0={0} b1={5}><Label lines={["Si estabas esperando una señal", "para comprar esa pijama…", "es esta."]} top={420} size={50} /></Win>
      <Corner B={B} b0={2} b1={44} />
      <Badge25 B={B} b0={5} b1={10} top={820} />
      <Win B={B} b0={36} b1={44}><Label lines={["Tus favoritas tienen 25% OFF."]} top={1000} bg={PAPER} fg={INK} size={50} /></Win>
      <Win B={B} b0={44} b1={50}>
        <Label lines={["Aprovecha el 25% OFF.", "Compra en RE:SET."]} top={300} bg={LIME} fg={INK} size={62} />
        <div style={{ position: "absolute", top: 760, left: 0, right: 0 }}><StoreBlock delay={Math.round(44 * B * 30) + 4} /></div>
      </Win>
    </Frame>
  );
};

/* 2 · POV */
export const Ad02: React.FC = () => {
  const c = AD.ad2;
  const B = c.B;
  return (
    <Frame c={c}>
      <Corner B={B} b0={0} b1={42} />
      <Win B={B} b0={0} b1={6}><Label lines={["POV: entras por una pijama", "y ves que tienen 25% OFF."]} top={420} size={50} /></Win>
      <Win B={B} b0={6} b1={18}><Label lines={["25% OFF"]} top={920} bg={LIME} fg={INK} size={120} /></Win>
      <Win B={B} b0={30} b1={36}><Label lines={["¿Cuál escogerías?"]} top={1000} bg={PAPER} fg={INK} size={56} /></Win>
      <Win B={B} b0={42} b1={48}>
        <Label lines={["25% OFF en RE:SET"]} top={300} bg={LIME} fg={INK} size={62} />
        <Label lines={["Encuentra tu favorita."]} top={440} bg={PAPER} fg={INK} size={46} />
        <div style={{ position: "absolute", top: 640, left: 0, right: 0 }}><StoreBlock delay={Math.round(42 * B * 30) + 4} /></div>
      </Win>
    </Frame>
  );
};

/* 3 · NO PAGUES PRECIO COMPLETO */
export const Ad03: React.FC = () => {
  const c = AD.ad3;
  const B = c.B;
  return (
    <Frame c={c}>
      <Win B={B} b0={0} b1={4}><Label lines={["No pagues precio completo", "por tu próxima pijama."]} top={420} size={50} /></Win>
      <Corner B={B} b0={4} b1={40} />
      <Badge25 B={B} b0={4} b1={14} top={860} size={130} />
      <Win B={B} b0={40} b1={46}>
        <Label lines={["25% OFF"]} top={360} bg={LIME} fg={INK} size={130} />
        <Label lines={["Compra ahora en RE:SET."]} top={560} size={50} />
        <div style={{ position: "absolute", top: 720, left: 0, right: 0 }}><StoreBlock delay={Math.round(40 * B * 30) + 4} /></div>
      </Win>
    </Frame>
  );
};

/* 4 · 25% OFF DROP */
export const Ad04: React.FC = () => {
  const c = AD.ad4;
  const B = c.B;
  return (
    <Frame c={c}>
      <Win B={B} b0={0} b1={4}><Label lines={["25% OFF"]} top={520} bg={LIME} fg={INK} size={200} /></Win>
      <Win B={B} b0={4} b1={8}><Label lines={["Ok… esto sí cambia las cosas."]} top={380} size={50} /></Win>
      <Corner B={B} b0={8} b1={40} />
      <Win B={B} b0={40} b1={46}><Label lines={["Elige tu favorita."]} top={330} bg={PAPER} fg={INK} size={74} /></Win>
      <Win B={B} b0={46} b1={52}>
        <Label lines={["25% OFF"]} top={470} bg={LIME} fg={INK} size={150} />
        <Label lines={["RE:SET"]} top={680} size={72} />
        <Label lines={["Compra ahora."]} top={800} bg={PAPER} fg={INK} size={58} />
      </Win>
    </Frame>
  );
};

export { BA, BF };
