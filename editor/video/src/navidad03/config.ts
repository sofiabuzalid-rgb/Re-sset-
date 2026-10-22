// RE:SET — Meta Ads Navidad: "Esta Navidad, todos tienen una pijama favorita". Everything editable lives here.
// Voice + word times: `python3 editor/navidad03/build.py` → timing.json (her real voice only). Shots are anchored to her words.
import timing from "./timing.json";

export const FPS = timing.fps;
export const TOTAL = timing.total;
export const WORDS = timing.words;
export const VOICE = "navidad03/voice.wav";

export const COLORS = {
  lime: "#E2EC95", // brand
  ivory: "#FFFBF2",
  ink: "#151515",
  rose: "#B07E7F", // Pantone 679 U
};

const P = timing.pieceStarts;
const SRC = timing.pieceSrc as (number | null)[];
/** output start time of the n-th occurrence of a subtitle word */
const w = (text: string, n = 0) => WORDS.filter((x) => x.w === text)[n].s - 0.03;
/** source second that keeps her lips in sync with voice piece k at output time t */
const lip = (k: number, t: number) => (SRC[k] as number) + (t - P[k]);

/** src clip in public/navidad03; from/to output seconds; at = clip second; zoom drift [start,end]; origin = transform-origin %.
 *  Zooms stay ≤ 1.3: the sources are 720×1280 and anything tighter goes soft. */
export type Shot = { name: string; src: string; from: number; to: number; at: number; zoom: [number, number]; origin: [number, number] };
const sync = (name: string, k: number, src: string, from: number, to: number, zoom: [number, number], origin: [number, number]): Shot => ({ name, src, from, to, at: lip(k, from), zoom, origin });

export const SHOTS: Shot[] = [
  // 1 · HOOK — her, red pajama, to camera: "Les tengo una idea buenísima, por si no saben qué"
  sync("hook", 0, "IMG_8931", 0, w("regalar"), [1.12, 1.22], [40, 38]),
  // "regalar esta Navidad." — the full look, standing on the bed
  { name: "look", src: "IMG_8943", from: w("regalar"), to: P[1], at: 4.3, zoom: [1.0, 1.05], origin: [50, 45] },
  // 2 · PRODUCT — "Por favor quiero que vean"
  sync("presenta", 1, "IMG_8944", P[1], w("estas"), [1.15, 1.2], [30, 40]),
  // "estas pijamas de RE:SET" — shirt + pants, lying full length
  { name: "conjunto", src: "IMG_8933", from: w("estas"), to: w("y"), at: 0.6, zoom: [1.0, 1.05], origin: [50, 50] },
  // "y lo mejor de todo es que lo puedes"
  sync("mejor", 1, "IMG_8944", w("y"), w("combinar"), [1.2, 1.26], [30, 40]),
  // "combinar con toda tu familia." — the other designs on the bed
  { name: "modelos", src: "IMG_8964", from: w("combinar"), to: P[2], at: 3.0, zoom: [1.04, 1.1], origin: [50, 60] },
  // 3 · MODELS — "Tú te pones" (her own, the red one)
  sync("tu", 2, "IMG_8946", P[2], w("esta,"), [1.1, 1.14], [45, 40]),
  // "esta," — close-up of the red print she is wearing
  { name: "roja", src: "IMG_8934", from: w("esta,"), to: w("hijo"), at: 0.5, zoom: [1.0, 1.06], origin: [50, 50] },
  // "tu hijo o tu hermano" — she is holding up the green one in this take
  sync("verde-sync", 2, "IMG_8946", w("hijo"), w("se", 0), [1.12, 1.16], [40, 55]),
  // "se pone a lo mejor la verde," — the green one, laid on the bed (in her own take she is already reaching for the light one here)
  { name: "verde", src: "IMG_8964", from: w("se", 0), to: w("la", 1), at: 4.6, zoom: [1.3, 1.36], origin: [8, 100] },
  // "la blanca se la puede poner tu esposo" — she lifts the light one on exactly these words
  sync("blanca", 2, "IMG_8946", w("la", 1), w("y", 1), [1.08, 1.14], [50, 55]),
  // "y todos van a estar matching y"
  { name: "todos", src: "IMG_8964", from: w("y", 1), to: w("súper"), at: 6.0, zoom: [1.02, 1.08], origin: [50, 55] },
  // "súper cómodos esta Navidad." — comfort: her, relaxed
  { name: "comoda", src: "IMG_8935", from: w("súper"), to: P[3], at: 0.2, zoom: [1.0, 1.06], origin: [50, 40] },
  // 4 · DESIRE — the breath: copy line over her modelling
  { name: "estira", src: "IMG_8936", from: P[3], to: P[3] + 0.8, at: 2.2, zoom: [1.0, 1.04], origin: [50, 40] },
  { name: "descansa", src: "IMG_8937", from: P[3] + 0.8, to: P[4], at: 1.0, zoom: [1.0, 1.04], origin: [50, 50] },
  // 5 · CLOSE — "Así que en serio, si todavía no saben qué regalar esta Navidad,"
  sync("cierre", 4, "IMG_8949", P[4], w("dense"), [1.1, 1.16], [30, 20]),
  // "dense una vuelta por RE:SET" — the look again, moving
  { name: "vuelta", src: "IMG_8943", from: w("dense"), to: w("porque"), at: 1.3, zoom: [1.0, 1.05], origin: [50, 45] },
  // "porque yo ya tengo las mías."
  sync("mias", 4, "IMG_8949", w("porque"), timing.voiceEnd, [1.16, 1.2], [30, 20]),
  // 6 · CTA
  { name: "cta", src: "IMG_8964", from: timing.voiceEnd, to: TOTAL / FPS, at: 6.8, zoom: [1.0, 1.05], origin: [50, 40] },
];

/** on-screen copy (graphic, never attributed to her) */
export const HOOK = { text: ["¿Todavía no sabes", "qué pijamas van a usar", "esta Navidad?"], to: P[1] - 0.4 };
export const BRAND_CHIP = { text: "Pijamas navideñas RE:SET", from: w("estas"), to: w("y") };
/** model tags follow what she names: red (hers), green, light */
export const TAGS = [
  { text: "Modelo rojo", from: w("esta,"), to: w("hijo") },
  { text: "Modelo verde", from: w("hijo"), to: w("la", 1) },
  { text: "Modelo claro", from: w("la", 1), to: w("y", 1) },
];
export const COPY = { text: ["Haz que esta Navidad", "también se viva en pijama"], from: w("súper"), to: P[4] };
export const END = {
  logo: "brand/reset-logo-white.png",
  line: "Descubre nuestra colección de Navidad",
  cta: "Compra tus favoritas",
};
