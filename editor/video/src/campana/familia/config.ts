// RE:SET — Anuncio 01 · NAVIDAD EN FAMILIA · "Esta Navidad, todos combinando". Todo lo editable vive aquí.
// Voz: python3 editor/campana/voz.py familia → timing.json. Las tomas se anclan a sus palabras.
import { anchors, Music, Shot, sync, Timing } from "../shared";
import timingJson from "./timing.json";

export const T = timingJson as Timing;
const { w, P, lip } = anchors(T);
// voz.py shrank a 0.36 s pause inside 8946 ("esta, … tu hijo"): after it, lip sync runs 0.36 s later in the source
const CUT = { at: P[2] + (4.31 - 2.933), len: 0.36 };
const lip2 = (k: number, t: number) => lip(k, t) + (k === 2 && t > CUT.at ? CUT.len : 0);

export const BASE = "campana/media";
export const SHOTS: Shot[] = [
  // HOOK — her real line on combining, sets already on the bed: "Imagínate que lo puedes combinar con toda tu familia."
  sync(lip2, "hook", 0, "IMG_8946", 0, P[1], { zoom: [1.12, 1.2], origin: [45, 40] }),
  // "Por favor quiero que vean"
  sync(lip2, "presenta", 1, "IMG_8944", P[1], w("estas"), { zoom: [1.15, 1.2], origin: [30, 40] }),
  // "estas pijamas de RE:SET." — the same red print, adult and kids, with prices
  { name: "roja-tallas", src: "IMG_2052", from: w("estas"), to: P[2], at: 0.5, panels: [{ src: "IMG_2052", at: 0.5, tag: "adulto" }, { src: "IMG_2053", at: 0.5, tag: "ninos" }] },
  // "Tú te pones"
  sync(lip2, "tu", 2, "IMG_8946", P[2], w("esta,"), { zoom: [1.1, 1.14], origin: [45, 40] }),
  // "esta," — her own: the red reindeer print up close (also hides the shortened pause)
  { name: "roja", src: "IMG_8934", from: w("esta,"), to: w("tu", 1), at: 0.5, zoom: [1.0, 1.06] },
  // "tu hijo o tu hermano" — she lifts the green one in this take
  sync(lip2, "hijo", 2, "IMG_8946", w("tu", 1), w("se"), { zoom: [1.12, 1.16], origin: [40, 55] }),
  // "se pone a lo mejor la verde," — green, adult and kids, with prices
  { name: "verde-tallas", src: "IMG_2041", from: w("se"), to: w("la", 1), at: 0.5, panels: [{ src: "IMG_2041", at: 0.5, tag: "adulto" }, { src: "IMG_2044", at: 0.5, tag: "ninos" }] },
  // "la blanca se la puede poner tu esposo" — she lifts the light one on these words
  sync(lip2, "blanca", 2, "IMG_8946", w("la", 1), w("y"), { zoom: [1.08, 1.14], origin: [50, 55] }),
  // "y todos van a estar matching" — four sets, two prints, two sizes
  { name: "todos", src: "IMG_2052", from: w("y"), to: w("súper"), at: 2.0, panels: [{ src: "IMG_2052", at: 2.0 }, { src: "IMG_2053", at: 2.0 }, { src: "IMG_2041", at: 2.5 }, { src: "IMG_2044", at: 2.0 }] },
  // "y súper cómodos esta Navidad."
  { name: "comodos", src: "IMG_8935", from: w("súper"), to: P[3], at: 0.2, zoom: [1.0, 1.06], origin: [50, 40] },
  // "Así que en serio, si todavía no saben qué regalar esta Navidad,"
  sync(lip2, "cierre", 3, "IMG_8949", P[3], w("dense"), { zoom: [1.1, 1.16], origin: [30, 20] }),
  // "dense una vuelta por RE:SET" — the look in motion
  { name: "vuelta", src: "IMG_8943", from: w("dense"), to: w("porque"), at: 1.3, zoom: [1.0, 1.05], origin: [50, 45] },
  // "porque yo ya tengo las mías."
  sync(lip2, "mias", 3, "IMG_8949", w("porque"), T.voiceEnd, { zoom: [1.16, 1.2], origin: [30, 20] }),
  // CTA card over her lying full length in the red set
  { name: "cta", src: "IMG_8933", from: T.voiceEnd, to: T.total / 30, at: 0.5, rate: 0.8, zoom: [1.02, 1.08], xf: 6 },
];

/** hook graphic: visible on frame 0 — what it is, who it's for, what it costs */
export const HOOK = { lines: ["Mismo estampado,", "adulto y niños"], to: P[1] + 0.6 };
export const TAGS = [
  { text: "Modelo rojo", from: w("esta,"), to: w("tu", 1) },
  { text: "Modelo verde", from: w("tu", 1), to: w("se") },
  { text: "Modelo claro", from: w("la", 1), to: w("y") },
];
export const END = { logo: "brand/reset-logo-white.png", title: "Encuentra sus pijamas de Navidad" };
export const CAPTION_HL = new Set(["Navidad", "RE:SET", "familia", "verde", "blanca", "matching"]);
/** licensed music goes here (e.g. "campana/musica/familia.wav"); null = voice only */
export const MUSIC: Music = { src: null, bed: 0.3, duck: 0.08 };
