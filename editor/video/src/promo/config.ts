// RE:SET — OUTLET 25% OFF, sin diálogo (4 clips de producto: playeras adulto + niño colgadas). Todo lo editable vive aquí.
// 25 % OFF confirmado por el cliente; sin precio (no confirmado para estas playeras) y sin fecha.
// Música: "NFL Main Theme" (Toners), grabada de Spotify por el cliente (sin licencia para pauta). ~114.8 BPM → un golpe = 0.5225 s.
import { Shot } from "../campana/shared";

export const BASE = "promo";
export const B = 0.5225; // "NFL Main Theme" (Toners), ~114.8 BPM — client's screen recording from Spotify
export const t = (beats: number) => +(beats * B).toFixed(3);
export const TOTAL_S = t(38); // 21.8 s

const Z = (a: number, b: number): [number, number] => [a, b];
export const SHOTS: Shot[] = [
  // HOOK — red SF tees, close on the print, from frame 0
  { name: "hook", src: "IMG_2038", from: 0, to: t(8), at: 0.2, zoom: Z(1.55, 1.3), origin: [60, 38] },
  // WHAT IT IS — the pairs, full, one per half-bar
  { name: "dallas", src: "IMG_2037", from: t(8), to: t(12), at: 0.3, zoom: Z(1.0, 1.1), origin: [55, 35] },
  { name: "turquesa", src: "IMG_2039", from: t(12), to: t(16), at: 0.3, zoom: Z(1.1, 1.0), origin: [55, 35] },
  // DEMO — close-ups of each design
  { name: "estrella", src: "IMG_2037", from: t(16), to: t(19), at: 2.2, zoom: Z(1.5, 1.7), origin: [62, 42] },
  { name: "sf", src: "IMG_2038", from: t(19), to: t(22), at: 2.2, zoom: Z(1.5, 1.7), origin: [60, 36] },
  { name: "jugador", src: "IMG_2039", from: t(22), to: t(25), at: 2.2, zoom: Z(1.5, 1.7), origin: [62, 40] },
  { name: "rojo", src: "IMG_2040", from: t(25), to: t(28), at: 2.2, zoom: Z(1.5, 1.7), origin: [58, 42] },
  // REINFORCEMENT — the four at once
  {
    name: "cuatro", src: "IMG_2037", from: t(28), to: t(32), at: 3.0,
    panels: [{ src: "IMG_2037", at: 3.0 }, { src: "IMG_2038", at: 3.0 }, { src: "IMG_2039", at: 3.0 }, { src: "IMG_2040", at: 3.0 }],
  },
  // CTA
  { name: "cta", src: "IMG_2040", from: t(32), to: TOTAL_S, at: 3.0, rate: 0.5, zoom: Z(1.1, 1.0), origin: [55, 40], xf: 4 },
];

export const COPY = {
  // Outlet: 25 % OFF confirmado por el cliente. Sin precio (no confirmado para estas playeras) y sin fecha.
  off: "25% OFF",
  outlet: "OUTLET",
  hook: "¿Ya viste el descuento de RE:SET?",
  hookPunch: "APROVÉCHALO YA",
  stamp: "25% OFF",
  chips: [
    { text: "Adulto y niño", sub: "25% OFF", from: t(8), to: t(16) },
    { text: "Edición limitada", sub: "25% OFF", from: t(16), to: t(28) },
  ],
  reinforce: ["SE ESTÁN YENDO RÁPIDO", "25% OFF", "HASTA AGOTAR EXISTENCIAS"],
  cta1: "CORRE POR LA TUYA",
  cta2: "Outlet 25% OFF hasta agotar existencias.",
  logo: "brand/reset-logo-white.png",
};
export const CUT = { hookEnd: t(8), reinforce: t(28), cta: t(32) };
export const MUSIC = { src: "promo/music_nfl_theme.wav" as string | null, startAt: 1.115, volume: 0.95 }; // first beat of the track at frame 0
/** beats where the edit hits hardest: flash + shake (cuts into new sections) */
export const HITS = [0, 8, 16, 28, 32];
