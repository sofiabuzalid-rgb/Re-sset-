// RE:SET — Anuncio 01 "El regalo que sí van a usar". Everything editable lives here.
// Voice + word times come from editor/regalo01/build.py (timing.json). Shots are anchored to output seconds.
import timing from "./timing.json";

export const FPS = timing.fps;
export const TOTAL = timing.total;
export const WORDS = timing.words;

export const COLORS = {
  lime: "#E2EC95", // Pantone 386 U (brand)
  ink: "#151515",
  pill: "rgba(18,18,18,0.62)",
};

/** A shot: src clip (public/regalo01), from/to in output seconds, `src` second the clip starts at,
 *  zoom [scale at start, scale at end], origin = transform origin in % (face framing). sync = her own lip-synced take. */
type Shot = { name: string; src: string; from: number; to: number; at: number; zoom: [number, number]; origin: [number, number]; sync?: boolean };

const P = timing.pieceStarts; // output start of each voice piece
/** output start time of the n-th occurrence of a subtitle word — shots are anchored to her words, never to fixed seconds */
const w = (text: string, n = 0) => WORDS.filter((x) => x.w === text)[n].s - 0.03;
// sync takes start at the voice piece's source in-point so lips match the voice track
export const SHOTS: Shot[] = [
  // 0-5.5 · HOOK on her face: "Les tengo una idea buenísima, por si no saben qué regalar esta Navidad."
  { name: "hook", src: "IMG_8931", from: 0, to: P[1], at: 0.37, zoom: [1.42, 1.62], origin: [0, 54], sync: true },
  // 5.5-6.3 · "quiero que vean"
  { name: "presenta", src: "IMG_8944", from: P[1], to: w("estas"), at: 0.3, zoom: [1.5, 1.55], origin: [15, 62], sync: true },
  // 6.3-7.73 · "estas pijamas de RE:SET" — full body, how it fits
  { name: "cuerpo", src: "IMG_8943", from: w("estas"), to: P[2], at: 4.6, zoom: [1.0, 1.04], origin: [50, 50] },
  // 7.73-10.27 · "Aparte lo padre es que a pesar de que tenga el"
  { name: "cara-1", src: "IMG_8947", from: P[2], to: w("estampado"), at: 0.27, zoom: [1.45, 1.5], origin: [26, 29], sync: true },
  // 10.27-11.39 · "estampado de Navidad" — the print
  { name: "estampado", src: "IMG_8941", from: w("estampado"), to: w("no", 1), at: 0.3, zoom: [1.0, 1.06], origin: [50, 50] },
  // 11.39-14.51 · back to her face: "no es la típica pijama que nada más ocupas una vez en tu vida"
  { name: "cara-2", src: "IMG_8947", from: w("no", 1), to: w("sino"), at: 0.27 + (w("no", 1) - P[2]), zoom: [1.5, 1.58], origin: [26, 29], sync: true },
  // 14.51-15.97 · "sino lo puedes ocupar" — wearing it on another day: balcony, coffee
  { name: "balcon", src: "IMG_9008", from: w("sino"), to: w("todo"), at: 4.2, zoom: [1.0, 1.05], origin: [50, 45] },
  // 15.97-16.93 · "todo el tiempo" — another design of the collection, reading at home
  { name: "verde-casa", src: "IMG_9038", from: w("todo"), to: w("porque"), at: 0.0, zoom: [1.0, 1.04], origin: [50, 50] },
  // 16.93-18.07 · "porque está súper cómoda" — stretching on the bed
  { name: "comoda", src: "IMG_8936", from: w("porque"), to: P[3], at: 2.0, zoom: [1.0, 1.05], origin: [50, 40] },
  // 18.07-19.24 · "Imagínate que lo puedes"
  { name: "cara-3", src: "IMG_8946", from: P[3], to: w("combinar"), at: 0.37, zoom: [1.35, 1.4], origin: [36, 25], sync: true },
  // 19.24-20.70 · "combinar con toda tu familia" — the green set laid out
  { name: "verde-cama", src: "IMG_8957", from: w("combinar"), to: P[4], at: 1.0, zoom: [1.05, 1.1], origin: [50, 60] },
  // 20.70-22.61 · "y todos van a estar matching y" — folding the sets
  { name: "doblar", src: "IMG_8959", from: P[4], to: w("súper", 1), at: 2.0, zoom: [1.05, 1.1], origin: [50, 55] },
  // 22.61-24.30 · "súper cómodos esta Navidad" — lying among the sets
  { name: "juntas", src: "IMG_8961", from: w("súper", 1), to: P[5], at: 1.4, zoom: [1.05, 1.1], origin: [50, 50] },
  // 24.30-29.40 · CLOSE on her face: "si todavía no saben qué regalar esta Navidad, dense una vuelta por RE:SET porque yo ya tengo las mías."
  { name: "cierre", src: "IMG_8949", from: P[5], to: timing.voiceEnd, at: 0.97, zoom: [1.28, 1.36], origin: [20, 13], sync: true },
  // 29.40-30.6 · sign-off
  { name: "firma", src: "IMG_8933", from: timing.voiceEnd, to: TOTAL / FPS, at: 1.0, zoom: [1.0, 1.04], origin: [50, 50] },
];

export const END = {
  logo: "brand/reset-logo-white.png",
  cta: "Descubre la colección navideña",
};

export const VOICE = "regalo01/voice.wav";
