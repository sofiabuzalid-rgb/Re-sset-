// RE:SET — "New Collection" fashion reel (recreación de la referencia de estudio). Todo lo editable vive aquí.
// Clips: uploads IMG_25xx (HLG → SDR, 1080×1920 nativo) en public/tonos. Rejilla de 120 BPM (0.5 s) para la pista con licencia.
// Estructura de la referencia: ráfaga de looks completos con "New / Collection" → caída a oscuro → planos medios largos →
// paso con barrido a oscuro → looks completos y vuelve el texto → los tres tonos.
import { Music, Shot } from "../campana/shared";

export const BASE = "tonos";
export const B = 0.5;
const t = (beats: number) => +(beats * B).toFixed(2);
export const TOTAL_S = t(19); // 9.5 s

export const SHOTS: Shot[] = [
  // 0–2.0 · burst of full looks, text on (sage · pink · grey · sage back)
  { name: "salvia", src: "IMG_2515", from: 0, to: t(1), at: 1.2, zoom: [1.0, 1.02] },
  { name: "rosa", src: "IMG_2550", from: t(1), to: t(2), at: 0.3, zoom: [1.0, 1.02] },
  { name: "gris", src: "IMG_2573", from: t(2), to: t(3), at: 1.0, zoom: [1.0, 1.02] },
  { name: "salvia-espalda", src: "IMG_2517", from: t(3), to: t(4), at: 5.4, zoom: [1.0, 1.02] },
  // 2.0–3.5 · out of the dip: a held medium shot, hands at the waist (pink)
  { name: "rosa-medio", src: "IMG_2551", from: t(4), to: t(7), at: 2.6, zoom: [1.04, 1.08], origin: [50, 40] },
  // 3.5–4.5 · full figure, still
  { name: "salvia-full", src: "IMG_2510", from: t(7), to: t(9), at: 0.4, zoom: [1.0, 1.03] },
  // 4.5–5.75 · close: shoulder / neckline (grey)
  { name: "gris-cerca", src: "IMG_2574", from: t(9), to: t(11.5), at: 0.8, zoom: [1.02, 1.06] },
  // 5.75–6.0 · a step through frame, into dark
  { name: "paso", src: "IMG_2517", from: t(11.5), to: t(12), at: 4.1, zoom: [1.0, 1.0] },
  // 6.0–8.0 · full looks again, text returns
  { name: "rosa-2", src: "IMG_2550", from: t(12), to: t(13), at: 1.4, zoom: [1.0, 1.02] },
  { name: "salvia-2", src: "IMG_2515", from: t(13), to: t(14), at: 3.4, zoom: [1.0, 1.02] },
  { name: "gris-2", src: "IMG_2572", from: t(14), to: t(16), at: 0.3, zoom: [1.0, 1.03] },
  // 8.0–9.5 · the three tones together
  { name: "tonos", src: "IMG_2596", from: t(16), to: TOTAL_S, at: 0.5, rate: 0.8, zoom: [1.02, 1.06], xf: 6 },
];

/** dips to dark like the reference (seconds): [start, end] of each dip, peak in the middle */
export const DIPS: [number, number][] = [[t(3.6), t(4.4)], [t(11.4), t(12.2)]];
/** "New / Collection": on from frame 0, off at the first dip, back with the second burst */
export const TITLE = { top: "New", bottom: "Collection", on: [[0, t(3.8)], [t(12.4), TOTAL_S]] as [number, number][] };
export const LOGO = { src: "brand/reset-logo-white.png", from: t(16.5) };
/** licensed track (modern, elegant, rhythmic ~120 BPM) goes here; null = silent */
export const MUSIC: Music = { src: null, bed: 0.9, duck: 0.9 };
