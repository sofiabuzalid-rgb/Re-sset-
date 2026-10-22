// RE:SET — Meta Ads "Tu nueva pijama favorita" (conjunto básico verde olivo). Everything editable lives here.
// Voice + word times: `python3 editor/olivo04/build.py` → timing.json (her real voice only). Shots are anchored to her words.
import timing from "./timing.json";

export const FPS = timing.fps;
export const TOTAL = timing.total;
export const WORDS = timing.words;
export const VOICE = "olivo04/voice.wav";

export const COLORS = {
  ivory: "#FFFBF2",
  ink: "#151515",
  lime: "#E2EC95", // brand accent, used sparingly
  olive: "#3E4430",
};

const P = timing.pieceStarts;
const SRC = timing.pieceSrc as (number | null)[];
/** output start time of the n-th occurrence of a subtitle word */
const w = (text: string, n = 0) => WORDS.filter((x) => x.w === text)[n].s - 0.03;
/** source second that keeps her lips in sync with voice piece k at output time t */
const lip = (k: number, t: number) => (SRC[k] as number) + (t - P[k]);

/** src clip in public/olivo04; from/to output seconds; at = clip second; zoom drift; origin = transform-origin %; rate = playback speed.
 *  Zooms stay ≤ 1.15: sources are 720×1280. */
export type Shot = { name: string; src: string; from: number; to: number; at: number; zoom: [number, number]; origin: [number, number]; rate?: number };
const sync = (name: string, k: number, src: string, from: number, to: number, zoom: [number, number] = [1.0, 1.05], origin: [number, number] = [50, 40]): Shot => ({ name, src, from, to, at: lip(k, from), zoom, origin });

export const SHOTS: Shot[] = [
  // 1 · HOOK — moving, full set on frame 0: "Por favor vean este modelo de pijama,"
  sync("hook", 0, "IMG_9047", 0, w("está", 0), [1.0, 1.06], [50, 45]),
  // 2 · PRESENTATION — "está súper padre," — the whole set, hands on hips
  { name: "silueta", src: "IMG_9050", from: w("está", 0), to: w("el", 0), at: 0.0, zoom: [1.0, 1.03], origin: [50, 50] },
  // 3 · DETAILS — "el color está increíble" — the color, short sleeve and neckline up close
  { name: "color", src: "IMG_9049", from: w("el", 0), to: w("y", 0), at: 0.0, zoom: [1.0, 1.04], origin: [50, 40] },
  // "y aparte no saben la calidad" — the waist tie and how the fabric falls
  { name: "lazo", src: "IMG_9052", from: w("y", 0), to: w("y", 0) + 1.05, at: 0.0, zoom: [1.0, 1.04], origin: [50, 50] },
  { name: "caida", src: "IMG_9051", from: w("y", 0) + 1.05, to: w("y", 1), at: 2.0, zoom: [1.0, 1.03], origin: [50, 50] },
  // "y lo cómodo que está." — moving in it, full length
  { name: "mueve", src: "IMG_9051", from: w("y", 1), to: P[1], at: 4.3, zoom: [1.0, 1.03], origin: [50, 50] },
  // 4 · DESIRE — "Aparte es el color de la temporada, verde militar."
  sync("temporada", 1, "IMG_9048", P[1], P[2], [1.0, 1.06], [50, 40]),
  // "¿Qué opina? ¿Le gusta o no le gusta?" — from the neckline out to the full look
  sync("opina", 2, "IMG_9049", P[2], P[3], [1.0, 1.03], [50, 45]),
  // the beat after her question: she dances in it
  { name: "baila", src: "IMG_9051", from: P[3], to: P[4], at: 4.9, zoom: [1.0, 1.03], origin: [50, 50] },
  // 5 · CTA — "Tiene que correr a RE:SET por este set en nuestras dos sucursales, en la Avenida Stim y Perisur."
  sync("tiendas", 4, "IMG_9054", P[4], timing.voiceEnd, [1.0, 1.05], [50, 40]),
  // end card over her, standing in the set (slowed so the take covers the card)
  { name: "cierre", src: "IMG_9051", from: timing.voiceEnd, to: TOTAL / FPS, at: 0.0, zoom: [1.0, 1.04], origin: [50, 45], rate: 0.3 },
];

/** graphic copy, never attributed to her */
export const HOOK = { text: ["¿Una pijama tan bonita", "que no te la quieres quitar?"], to: w("está", 0) + 0.2 };
/** design details, each shown while that part is on screen (only what is visible in the footage) */
export const DETAILS = [
  { text: "Manga corta", from: w("el", 0), to: w("color") + 0.75 },
  { text: "Cuello en V", from: w("color") + 0.75, to: w("y", 0) },
  { text: "Lazo en la cintura", from: w("y", 0), to: w("y", 1) },
  { text: "Pantalón largo", from: w("y", 1), to: P[1] },
];
export const END = {
  logo: "brand/reset-logo-white.png",
  tagline: "Tu próxima pijama favorita.",
  where: ["Encuéntrala en Perisur,", "Av. Stim 39 o en línea."],
  url: "resetwear.com.mx",
};
