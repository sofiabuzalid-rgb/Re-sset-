// RE:SET · THE MEMORIES WE WEAR — Christmas editorial motion film (two cuts + model variants).
// Reference mechanic (client's reel, analysed frame by frame): the product sample never moves; thin seams slide in and build a
// grid around it on a calm wall (0–5 s), then the world behind it changes on the beat while the sample stays put, and the film
// ends back on the clean wall. Here the sample is a real RE:SET pajama photo, untouched, printed as a photo-print card
// ("memories"), and the worlds are Christmas moments. Layers: background (graded + grain) · light leak · seams · product card ·
// text · logo · music. Everything sits in the TikTok / Reels safe zone.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

loadFont({ family: "Playfair Display", url: staticFile("fonts/PlayfairDisplay-Variable.woff2"), weight: "400 900" });
loadFont({ family: "Cormorant", url: staticFile("fonts/Cormorant-500-italic.woff2"), weight: "500", style: "italic" });
loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const CREAM = "#F6EFE4";

// ---------------------------------------------------------------- product card (fixed: same place, same size, every frame)
export const PRODUCTS = {
  roja: { src: "memories/p_roja.jpg", pos: "50% 40%" },
  verde: { src: "memories/p_verde.jpg", pos: "50% 50%" },
  grinch: { src: "memories/p_grinch.jpg", pos: "50% 50%" },
  hanukkah: { src: "memories/p_hanukkah.jpg", pos: "50% 50%" },
} as const;
export type Product = keyof typeof PRODUCTS;
const PW = 460; // photo
const PH = 690; // 2:3
const MAT = 18;
const MATB = 70; // photo-print bottom margin
const CW = PW + MAT * 2;
const CH = PH + MAT + MATB;
const CL = (W - CW) / 2; // 292
const CT = 262;
const CR = CL + CW;
const CB = CT + CH; // 1040

const Card: React.FC<{ product: Product; light: number }> = ({ product, light }) => {
  const p = PRODUCTS[product];
  const sh = `0 ${interpolate(light, [0, 1], [44, 26])}px ${interpolate(light, [0, 1], [90, 60])}px rgba(${light > 0.5 ? "70,45,25" : "0,0,0"},${interpolate(light, [0, 1], [0.55, 0.22])})`;
  return (
    <div style={{ position: "absolute", left: CL, top: CT, width: CW, height: CH, background: "#FBF7F0", boxShadow: sh }}>
      <div style={{ position: "absolute", left: MAT, top: MAT, width: PW, height: PH, overflow: "hidden", outline: "1px solid rgba(0,0,0,0.08)" }}>
        <Img src={staticFile(p.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos }} />
      </div>
      <Img src={staticFile("brand/reset-logo-black.png")} style={{ position: "absolute", left: (CW - 96) / 2, top: MAT + PH + (MATB - 35) / 2, width: 96, opacity: 0.82 }} />
    </div>
  );
};

// ---------------------------------------------------------------- backgrounds
export type Bg = { img: string; from: number; len: number; fx?: number; fy?: number; xf?: number };
const BgImg: React.FC<{ b: Bg }> = ({ b }) => {
  const f = useCurrentFrame();
  const t = f - b.from;
  const xf = b.xf ?? 0;
  const op = xf ? interpolate(t, [-xf / 2, xf / 2], [0, 1], clamp) : t >= 0 ? 1 : 0;
  if (t < -xf / 2 || t > b.len + 40) return null;
  // continuous camera: every world drifts up and pushes in at the same rate, so cuts feel like one move
  const z = 1.1 + 0.0011 * (t + 20);
  const y = 26 - 0.42 * (t + 20);
  return (
    <AbsoluteFill style={{ opacity: op, overflow: "hidden" }}>
      <Img
        src={staticFile(`memories/${b.img}.jpg`)}
        style={{
          position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover",
          objectPosition: `${(b.fx ?? 0.5) * 100}% ${(b.fy ?? 0.5) * 100}%`,
          transform: `translateY(${y}px) scale(${z})`,
          filter: "saturate(0.95) sepia(0.12) contrast(0.95) brightness(0.9)",
        }}
      />
    </AbsoluteFill>
  );
};

/** the clean wall of the reference, in RE:SET cream, with the same soft curved light */
const Wall: React.FC<{ op: number }> = ({ op }) => {
  const f = useCurrentFrame();
  const lx = 72 - 0.06 * f; // the window light drifts slowly across the wall, so the end never sits frozen
  const ly = 34 + 0.015 * f;
  if (op <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 55% at ${lx}% ${ly}%, #FBF6EE 0%, #EFE5D6 55%, #DED0BC 100%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(100deg, rgba(120,90,60,0) ${30 + 0.05 * f}%, rgba(120,90,60,0.10) ${44 + 0.05 * f}%, rgba(120,90,60,0) ${58 + 0.05 * f}%)` }} />
      <AbsoluteFill style={{ opacity: 0.5 }}><Grain /></AbsoluteFill>
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 2) % 4;
  return (
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile(`memories/grain${k}.png`)})`, backgroundSize: "512px 512px", backgroundPosition: `${(f * 137) % 512}px ${(f * 71) % 512}px`, opacity: 0.09, mixBlendMode: "overlay" }} />
  );
};

const Vignette: React.FC<{ dark: number }> = ({ dark }) => (
  <AbsoluteFill style={{ opacity: dark }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 42%, rgba(0,0,0,0) 55%, rgba(12,6,2,0.55) 100%)" }} />
    {/* keeps the captions readable without a box */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,5,2,0) 52%, rgba(10,5,2,0.55) 66%, rgba(10,5,2,0.55) 82%, rgba(10,5,2,0.15) 100%)" }} />
  </AbsoluteFill>
);

/** warm film light leak that sweeps through on a chapter change */
const Leak: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < -10 || t > 16) return null;
  const op = interpolate(t, [-10, 0, 16], [0, 0.42, 0], clamp);
  const x = interpolate(t, [-10, 16], [-20, 120]);
  return <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 45% at ${x}% 30%, rgba(255,160,70,0.9), rgba(255,120,40,0) 70%)`, mixBlendMode: "screen", opacity: op }} />;
};

// ---------------------------------------------------------------- seams (the reference's line build)
const Seams: React.FC<{ at: number; out?: number; color: string; dur?: number }> = ({ at, out, color, dur = 1 }) => {
  const f = useCurrentFrame();
  const t = (f - at) / dur;
  if (f < at || (out !== undefined && f >= out)) return null;
  const v = interpolate(t, [0, 24], [0, 1], { ...clamp, easing: ease }); // verticals grow away from the card
  const top = interpolate(t, [10, 44], [-6, CT], { ...clamp, easing: inOut }); // top seam slides down
  const bot = interpolate(t, [26, 62], [H + 6, CB], { ...clamp, easing: inOut }); // bottom seam slides up
  const L = 3;
  const line = (s: React.CSSProperties) => <div style={{ position: "absolute", background: color, ...s }} />;
  return (
    <AbsoluteFill>
      {[CL - 1, CR - 2].map((x) => (
        <React.Fragment key={x}>
          {line({ left: x, width: L, top: CT - CT * v, height: CT * v })}
          {line({ left: x, width: L, top: CB, height: (H - CB) * v })}
        </React.Fragment>
      ))}
      {t > 10 && line({ left: 0, width: W, top: top - 1, height: L })}
      {t > 26 && line({ left: 0, width: W, top: bot - 2, height: L })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- text
const fadeRise = (f: number, a: number, b: number, k = 8) => {
  const op = interpolate(f, [a, a + k, b - k, b], [0, 1, 1, 0], clamp);
  const y = interpolate(f, [a, a + k + 6], [14, 0], { ...clamp, easing: ease });
  return { op, y };
};
export const TEXT_TOP = CB + 46;
export const CELL = CW - 20; // text width inside the grid cell under the card // first text line under the card, inside the grid cell

/** words in front: shows at full strength on frame 0 when a === 0 */
export const Block: React.FC<{ a: number; b: number; top?: number; w?: number; children: React.ReactNode; k?: number }> = ({ a, b, top = TEXT_TOP, w = 760, children, k = 8 }) => {
  const f = useCurrentFrame();
  const { op, y } = a === 0 ? { op: interpolate(f, [b - k, b], [1, 0], clamp), y: 0 } : fadeRise(f, a, b, k);
  if (op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: (W - w) / 2, width: w, top, opacity: op, transform: `translateY(${y}px)`, textAlign: "center" }}>{children}</div>
  );
};

const shadow = "0 2px 18px rgba(0,0,0,0.55)";
export const Big: React.FC<{ c?: string; size?: number; children: React.ReactNode }> = ({ c = CREAM, size = 92, children }) => (
  <div style={{ fontFamily: "Playfair Display", fontWeight: 600, fontSize: size, lineHeight: 1.0, letterSpacing: "0.05em", color: c, textShadow: c === CREAM ? shadow : "none" }}>{children}</div>
);
export const Caps: React.FC<{ c?: string; size?: number; children: React.ReactNode; mt?: number }> = ({ c = CREAM, size = 34, children, mt = 0 }) => (
  <div style={{ fontFamily: "Playfair Display", fontWeight: 500, fontSize: size, lineHeight: 1.25, letterSpacing: "0.08em", color: c, marginTop: mt, textShadow: c === CREAM ? shadow : "none" }}>{children}</div>
);
export const Label: React.FC<{ c?: string; children: React.ReactNode; mt?: number }> = ({ c = CREAM, children, mt = 0 }) => (
  <div style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 21, letterSpacing: "0.42em", color: c, marginTop: mt, opacity: 0.9, textShadow: c === CREAM ? shadow : "none" }}>{children}</div>
);
export const Italic: React.FC<{ c?: string; size?: number; children: React.ReactNode; mt?: number }> = ({ c = CREAM, size = 64, children, mt = 0 }) => (
  <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: size, lineHeight: 1.1, color: c, marginTop: mt, textShadow: c === CREAM ? shadow : "none" }}>{children}</div>
);
export const Logo: React.FC<{ w?: number; mt?: number }> = ({ w = 230, mt = 0 }) => (
  <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: w, marginTop: mt }} />
);

// ---------------------------------------------------------------- film
export type Film = {
  frames: number;
  music: string;
  bgs: Bg[];
  leaks: number[];
  wallAt: number; // frame where the film returns to the clean wall
  wallXf: number;
  seamColor: string;
  text: React.FC;
};

export const MemoriesFilm: React.FC<{ film: Film; product: Product }> = ({ film, product }) => {
  const f = useCurrentFrame();
  const wall = interpolate(f, [film.wallAt - film.wallXf / 2, film.wallAt + film.wallXf / 2 + 0.001], [0, 1], clamp);
  const Text = film.text;
  return (
    <AbsoluteFill style={{ background: "#120b07" }}>
      {/* background layer */}
      {film.bgs.map((b, i) => <BgImg key={i} b={b} />)}
      <Vignette dark={1 - wall} />
      <AbsoluteFill style={{ opacity: 1 - wall }}><Grain /></AbsoluteFill>
      {film.leaks.map((a) => <Leak key={a} at={a} />)}
      <Wall op={wall} />
      {/* seams: over the warm opening world, then again on the clean wall */}
      <Seams at={0} out={film.bgs[1].from - (film.bgs[1].xf ?? 0) / 2} color="rgba(247,236,220,0.72)" />
      <Seams at={film.wallAt + 2} color={film.seamColor} dur={0.8} />
      {/* product */}
      <Card product={product} light={wall} />
      {/* text + logo */}
      <Text />
      <Audio src={staticFile(`memories/${film.music}.wav`)} />
    </AbsoluteFill>
  );
};
