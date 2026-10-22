// RE:SET — Anuncio 03 · TU NUEVA PIJAMA FAVORITA (básica verde olivo) · "Tan bonita que la quieres usar todo el día".
// Voz: python3 editor/campana/voz.py favorita → timing.json. Las tomas se anclan a sus palabras.
import { anchors, Music, Shot, sync, Timing } from "../shared";
import timingJson from "./timing.json";

export const T = timingJson as Timing;
const { w, P, lip } = anchors(T);

export const BASE = "campana/media";
export const SHOTS: Shot[] = [
  // HOOK — moving, the full set on frame 0: "Por favor vean este modelo de pijama,"
  sync(lip, "hook", 0, "IMG_9047", 0, w("está"), { zoom: [1.0, 1.06], origin: [50, 45] }),
  // "está súper padre," — the silhouette, hands on hips (cut on her movement)
  { name: "silueta", src: "IMG_9050", from: w("está"), to: w("el"), at: 0.0, zoom: [1.0, 1.03] },
  // "el color está increíble," — color, short sleeve, V-neck up close
  { name: "color", src: "IMG_9049", from: w("el"), to: w("y"), at: 0.0, zoom: [1.0, 1.04], origin: [50, 40] },
  // "y aparte no saben la calidad" — the waist tie, then the drape
  { name: "lazo", src: "IMG_9052", from: w("y"), to: w("y") + 1.05, at: 0.0, zoom: [1.0, 1.04] },
  { name: "caida", src: "IMG_9051", from: w("y") + 1.05, to: w("y", 1), at: 2.0, zoom: [1.0, 1.03] },
  // "y lo cómodo que está." — moving in it, full length
  { name: "mueve", src: "IMG_9051", from: w("y", 1), to: P[1], at: 4.3, zoom: [1.0, 1.03] },
  // "Aparte es el color de la temporada, verde militar."
  sync(lip, "temporada", 1, "IMG_9048", P[1], P[2], { zoom: [1.0, 1.06], origin: [50, 40] }),
  // "¿Qué opina?" — from the neckline out to the full look
  sync(lip, "opina", 2, "IMG_9049", P[2], P[3], { zoom: [1.0, 1.03], origin: [50, 45] }),
  // the beat after her question
  { name: "baila", src: "IMG_9051", from: P[3], to: P[4], at: 4.9, zoom: [1.0, 1.03] },
  // "Tiene que correr al RE:SET por este set en nuestras dos sucursales, en la Avenida Stim y Perisur."
  sync(lip, "tiendas", 4, "IMG_9054", P[4], T.voiceEnd, { zoom: [1.0, 1.05], origin: [50, 40] }),
  // end card over her standing in the set (slowed)
  { name: "cierre", src: "IMG_9051", from: T.voiceEnd, to: T.total / 30, at: 0.0, rate: 0.3, zoom: [1.0, 1.04], origin: [50, 45], xf: 6 },
];

/** graphic hook (brand copy): the territory, on her chest so face and waist stay clear */
export const HOOK = { eyebrow: "Básicos RE:SET", lines: ["La pijama que", "no te quieres quitar"], to: w("está") + 0.25 };
/** design details, each while that part is on screen (only what the footage shows) */
export const DETAILS = [
  { text: "Manga corta", from: w("el"), to: w("color") + 0.75 },
  { text: "Cuello en V", from: w("color") + 0.75, to: w("y") },
  { text: "Lazo en la cintura", from: w("y"), to: w("y", 1) },
  { text: "Pantalón largo", from: w("y", 1), to: P[1] },
];
export const STORE_CUES = [
  { name: "Av. Stim 39", detail: "Planta baja, local 4", from: w("Avenida"), to: T.voiceEnd },
  { name: "Perisur", detail: "Kiosco, planta baja", from: w("Perisur."), to: T.voiceEnd },
];
export const END = { logo: "brand/reset-logo-white.png", title: "Encuentra tu próxima", title2: "pijama favorita." };
export const CAPTION_HL = new Set(["RE:SET", "verde", "militar"]);
export const MUSIC: Music = { src: null, bed: 0.3, duck: 0.08 }; // fashion lifestyle, fresh: see ENTREGA
