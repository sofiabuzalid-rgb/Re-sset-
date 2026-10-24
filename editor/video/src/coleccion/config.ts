// RE:SET — "New Collection" fashion reel: recreación cuadro a cuadro de la referencia (mismos cortes, misma pista).
// Tomas: la modelo recortada con BiRefNet sobre blanco de estudio (editor/coleccion/shots.sh → public/coleccion/*.mp4).
// Cortes sobre los golpes medidos de la pista de referencia (~143 BPM): 0.19 · 0.63 · 1.04 · 1.46 · 1.86 · 2.30 · 3.62 · 4.52 · 5.72 · 6.23 · 6.80
import { Music, Shot } from "../campana/shared";

export const BASE = "coleccion";
export const TOTAL_S = 7.3;

export const SHOTS: Shot[] = [
  // burst of full looks with the title (sage · pink · grey · sage back · pink)
  { name: "a-salvia", src: "a-salvia", from: 0, to: 0.19, at: 0, zoom: [1.0, 1.0] },
  { name: "b-rosa", src: "b-rosa", from: 0.19, to: 0.63, at: 0, zoom: [1.0, 1.01] },
  { name: "c-gris", src: "c-gris", from: 0.63, to: 1.04, at: 0, zoom: [1.0, 1.01] },
  { name: "d-salvia-espalda", src: "d-salvia-espalda", from: 1.04, to: 1.46, at: 0, zoom: [1.0, 1.01] },
  { name: "e-rosa", src: "e-rosa", from: 1.46, to: 2.3, at: 0, zoom: [1.0, 1.02] }, // dips to dark 1.86–2.30
  // the drop: held medium shot, hands at the waist
  { name: "f-rosa-medio", src: "f-rosa-medio", from: 2.3, to: 3.62, at: 0, zoom: [1.04, 1.08], origin: [50, 40] },
  // full figure, still
  { name: "g-salvia-full", src: "g-salvia-full", from: 3.62, to: 4.52, at: 0, zoom: [1.0, 1.02] },
  // close: neckline and stripes
  { name: "h-gris-cerca", src: "h-gris-cerca", from: 4.52, to: 5.72, at: 0, zoom: [1.02, 1.05] },
  // a turn through frame, into dark
  { name: "i-paso", src: "i-paso", from: 5.72, to: 6.23, at: 0, zoom: [1.0, 1.0] },
  // full looks again, title returns
  { name: "j-rosa", src: "j-rosa", from: 6.23, to: 6.8, at: 0, zoom: [1.0, 1.01] },
  { name: "k-salvia", src: "k-salvia", from: 6.8, to: TOTAL_S, at: 0, zoom: [1.0, 1.02] },
];

/** dips to dark exactly where the reference has them: [start, end], peak in the middle */
export const DIPS: [number, number][] = [[1.86, 2.3], [5.72, 6.23]];
/** "New / Collection": on from frame 0 until the first dip, back with the last burst */
export const TITLE = { top: "New", bottom: "Collection", on: [[0, 1.9], [6.23, TOTAL_S]] as [number, number][], color: "#3A3532" };
export const LOGO = { src: "brand/reset-logo-black.png", from: 6.6 };
/** the reference's own track, trimmed to the cut (7.3 s + fade) */
export const MUSIC: Music = { src: "coleccion/ref_audio.wav", bed: 1.0, duck: 1.0 };
