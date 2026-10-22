// RE:SET — Anuncio 02 · CHRISTMAS AT HOME · "Mi único plan esta Navidad: quedarme en casa con esta pijama". Todo lo editable aquí.
// Voz: python3 editor/campana/voz.py casa → timing.json (+ ambient.wav: sonido real de las páginas en IMG_9039).
import { anchors, Music, Shot, Snow, sync, Timing } from "../shared";
import timingJson from "./timing.json";
import track9025 from "./track_9025.json";
import track9039 from "./track_9039.json";

export const T = timingJson as Timing;
const { w, P, lip } = anchors(T);

/* snow lives only behind the window glass: polygons in output px at source frame 15, moved by the background track */
const SNOW_9039: Snow = { poly: [[[0, 0], [228, 0], [238, 560], [0, 615]]], track: track9039 as [number, number][], refFrame: 15, density: 300 };
const SNOW_9025: Snow = {
  poly: [
    [[136, 196], [448, 236], [450, 1005], [136, 1035]],
    [[0, 190], [68, 190], [68, 1035], [0, 1035]],
  ],
  track: track9025 as [number, number][],
  refFrame: 15,
  density: 260,
};

export const BASE = "campana/media";
const XF = 8; // dissolve frames: this piece breathes
export const SHOTS: Shot[] = [
  // OPEN — reading at home, snow outside, the real sound of the pages (no voice: the hook is graphic)
  { name: "lee", src: "IMG_9039", from: 0, to: P[1], at: 0.0, zoom: [1.0, 1.06], origin: [40, 45], snow: SNOW_9039 },
  // "Aparte lo padre es que a pesar de que tenga el" — coffee on the balcony
  { name: "balcon", src: "IMG_9006", from: P[1], to: w("estampado"), at: 1.0, zoom: [1.0, 1.05], origin: [50, 50], xf: XF },
  // "estampado de Navidad," — the print
  { name: "estampado", src: "IMG_9022", from: w("estampado"), to: w("no"), at: 2.0, zoom: [1.02, 1.08], xf: XF },
  // "no es la típica pijama que nada más"
  { name: "cafe", src: "IMG_9009", from: w("no"), to: w("ocupas"), at: 0.5, zoom: [1.0, 1.05], origin: [50, 40], xf: XF },
  // "ocupas una vez en tu vida,"
  { name: "camina", src: "IMG_9020", from: w("ocupas"), to: w("sino"), at: 3.0, zoom: [1.0, 1.04], origin: [50, 35], xf: XF },
  // "sino lo puedes ocupar" — another design, another day, snow outside
  { name: "ventana", src: "IMG_9025", from: w("sino"), to: w("todo"), at: 0.3, zoom: [1.0, 1.04], origin: [40, 40], xf: XF, snow: SNOW_9025 },
  // "todo el tiempo"
  { name: "libreros", src: "IMG_9045", from: w("todo"), to: w("porque"), at: 2.6, zoom: [1.0, 1.04], xf: XF },
  // "porque está súper cómoda."
  { name: "estira", src: "IMG_9035", from: w("porque"), to: P[2], at: 0.2, zoom: [1.0, 1.05], origin: [50, 35], xf: XF },
  // "Hay dos sucursales para que las puedas adquirir ya mismo."
  sync(lip, "tiendas", 2, "IMG_9015", P[2], P[3], { zoom: [1.06, 1.1], origin: [50, 35], xf: XF }),
  // "Hay una en Perisur y otra en Avenida Stim, así que ve por ellas ya mismo." (same take, tighter: a deliberate jump cut)
  sync(lip, "tiendas2", 3, "IMG_9015", P[3], T.voiceEnd, { zoom: [1.16, 1.2], origin: [50, 35] }),
  // close: back to the window, snow
  { name: "cierre", src: "IMG_9039", from: T.voiceEnd, to: T.total / 30, at: 3.5, zoom: [1.04, 1.1], origin: [40, 45], xf: 12, snow: SNOW_9039 },
];

/** graphic hook (brand copy, never attributed to her) */
export const HOOK = { lines: ["Yo cancelando todos mis planes", "por quedarme en casa con esta pijama"], to: P[1] + 0.3 };
/** stores appear exactly when she names them */
export const STORE_CUES = [
  { name: "Perisur", detail: "Kiosco, planta baja", from: w("Perisur"), to: T.voiceEnd },
  { name: "Av. Stim 39", detail: "Planta baja, local 4", from: w("Avenida"), to: T.voiceEnd },
];
export const END = { logo: "brand/reset-logo-white.png", title: "Tu Navidad empieza en casa." };
export const CAPTION_HL = new Set(["Navidad", "cómoda", "Perisur", "Stim"]);
export const MUSIC: Music = { src: null, bed: 0.28, duck: 0.07 }; // cinematic, cozy: see ENTREGA
