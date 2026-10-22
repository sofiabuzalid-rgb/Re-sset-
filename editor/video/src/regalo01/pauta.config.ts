// RE:SET — Anuncio 01, corte para pauta (~23 s). Same real voice as the long cut, minus the slow lead-ins.
// Voice + word times: `python3 editor/regalo01/build.py pauta` → timing_pauta.json. Shots are anchored to her words.
import timing from "./timing_pauta.json";

export const FPS = timing.fps;
export const TOTAL = timing.total;
export const WORDS = timing.words;
export const VOICE = "regalo01/voice_pauta.wav";

const P = timing.pieceStarts;
const w = (text: string, n = 0) => WORDS.filter((x) => x.w === text)[n].s - 0.03;

/** src clip in public/regalo01, from/to = output seconds, at = clip second it starts at; sync = her own lip-synced take.
 *  grid = 2x2 of four clips instead of one. */
export type Shot = { name: string; src: string; from: number; to: number; at: number; zoom: [number, number]; origin: [number, number]; sync?: boolean; grid?: { src: string; at: number }[] };

export const SHOTS: Shot[] = [
  // HOOK — her face from frame 0: "Les tengo una idea buenísima, por si no saben qué regalar"
  { name: "hook", src: "IMG_8931", from: 0, to: w("esta"), at: 0.37, zoom: [1.5, 1.66], origin: [0, 54], sync: true },
  // "esta Navidad." — the pajama in motion
  { name: "giro", src: "IMG_8943", from: w("esta"), to: P[1], at: 1.4, zoom: [1.0, 1.06], origin: [50, 50] },
  // "Por favor quiero que vean"
  { name: "presenta", src: "IMG_8944", from: P[1], to: w("estas"), at: 0.3, zoom: [1.5, 1.56], origin: [15, 62], sync: true },
  // "estas pijamas de RE:SET" — the print up close
  { name: "estampado", src: "IMG_9022", from: w("estas"), to: P[2], at: 1.6, zoom: [1.0, 1.08], origin: [50, 50] },
  // "No es la típica pijama"
  { name: "cara-1", src: "IMG_8947", from: P[2], to: w("que", 1), at: 3.7, zoom: [1.45, 1.52], origin: [26, 29], sync: true },
  // "que nada más ocupas una vez"
  { name: "camina", src: "IMG_9021", from: w("que", 1), to: w("en"), at: 1.0, zoom: [1.0, 1.06], origin: [50, 40] },
  // "en tu vida,"
  { name: "balcon", src: "IMG_9020", from: w("en"), to: w("sino"), at: 5.0, zoom: [1.0, 1.05], origin: [50, 30] },
  // "sino lo puedes ocupar"
  { name: "estira", src: "IMG_9010", from: w("sino"), to: w("todo"), at: 3.0, zoom: [1.12, 1.18], origin: [45, 40] },
  // "todo el tiempo" — another design, another day
  { name: "lee", src: "IMG_9036", from: w("todo"), to: w("porque"), at: 3.0, zoom: [1.0, 1.05], origin: [50, 45] },
  // "porque está súper cómoda."
  { name: "comoda", src: "IMG_8935", from: w("porque"), to: P[3], at: 0.0, zoom: [1.0, 1.06], origin: [50, 35] },
  // "Imagínate que lo puedes"
  { name: "cara-2", src: "IMG_8946", from: P[3], to: w("combinar"), at: 0.37, zoom: [1.35, 1.42], origin: [36, 25], sync: true },
  // "combinar con toda tu familia." — four looks at once
  {
    name: "familia", src: "IMG_8957", from: w("combinar"), to: P[4], at: 1.0, zoom: [1.0, 1.04], origin: [50, 50],
    grid: [{ src: "IMG_9017", at: 0.2 }, { src: "IMG_9045", at: 2.0 }, { src: "IMG_9035", at: 0.3 }, { src: "IMG_8957", at: 1.0 }],
  },
  // CLOSE — "Dense una vuelta por RE:SET porque yo ya tengo las mías."
  { name: "cierre", src: "IMG_8949", from: P[4], to: timing.voiceEnd, at: 2.8, zoom: [1.28, 1.38], origin: [20, 13], sync: true },
  // end card
  { name: "firma", src: "IMG_8941", from: timing.voiceEnd, to: TOTAL / FPS, at: 0.3, zoom: [1.04, 1.1], origin: [50, 50] },
];

/** top headline over the hook — the brief's promise, in big type, visible from the very first frame */
export const HOOK = { lines: ["EL REGALO QUE", "SÍ VAN A USAR"], to: w("esta") };

/** benefit checklist: each line appears on the word she says it on and stays until her face returns for the close */
export const CHECKS = [
  { text: "No es de una sola vez", at: w("típica") },
  { text: "Para usarla todo el tiempo", at: w("todo") },
  { text: "Súper cómoda", at: w("súper") },
  { text: "Matching en familia", at: w("combinar") },
];
export const CHECKS_END = P[4];

export const END = {
  logo: "brand/reset-logo-white.png",
  kicker: "El regalo que sí van a usar",
  cta: "Descubre la colección navideña",
};
