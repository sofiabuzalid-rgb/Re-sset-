// RE:SET — "New Collection" fashion reel sobre la pista de la referencia. Todo lo editable vive aquí.
// Tomas: la modelo recortada con BiRefNet (editor/coleccion/shots.sh) y compuesta en estudio gris claro (compose.py) → public/coleccion.
// SIN ROSTRO (requisito del cliente): cada toma se encuadra desde abajo para que el borde superior quede bajo el mentón.
// Cada corte cae en un golpe medido de la pista (librosa, onsets percusivos y bombos):
//   golpes de intro 0.186 · 0.604 · 1.022 · 1.451 · 1.834 | bombos 2.287 · 3.181 · 4.029 · 4.888 · 5.747 | golpes finales 6.351 · 6.780 · 7.221
import { Music, Shot } from "../campana/shared";

export const BASE = "coleccion";
export const TOTAL_S = 7.4;
const FACE: [number, number] = [50, 100]; // crop from the bottom

export const SHOTS: Shot[] = [
  // intro hits — one look per hit, the three tones alternating, title on
  { name: "a", src: "a", from: 0, to: 0.186, at: 0, zoom: [1.06, 1.06], origin: FACE },
  { name: "b", src: "b", from: 0.186, to: 0.604, at: 0, zoom: [1.2, 1.21], origin: FACE },
  { name: "c", src: "c", from: 0.604, to: 1.022, at: 0, zoom: [1.04, 1.05], origin: FACE },
  { name: "d", src: "d", from: 1.022, to: 1.451, at: 0, zoom: [1.0, 1.01], origin: FACE },
  { name: "e", src: "e", from: 1.451, to: 2.287, at: 0, zoom: [1.0, 1.03], origin: FACE }, // dips to dark before the drop
  // the build — one shot per kick, slower and closer
  { name: "f", src: "f", from: 2.287, to: 3.181, at: 0, zoom: [1.07, 1.11], origin: FACE },
  { name: "g", src: "g", from: 3.181, to: 4.029, at: 0, zoom: [1.06, 1.1], origin: FACE },
  { name: "h", src: "h", from: 4.029, to: 4.888, at: 0, zoom: [1.06, 1.09], origin: FACE },
  { name: "i", src: "i", from: 4.888, to: 5.747, at: 0, zoom: [1.0, 1.04], origin: FACE },
  { name: "j", src: "j", from: 5.747, to: 6.351, at: 0, zoom: [1.04, 1.08], origin: FACE }, // dips to dark into the final hits
  // final hits — title returns
  { name: "k", src: "k", from: 6.351, to: 6.78, at: 0, zoom: [1.06, 1.07], origin: FACE },
  { name: "l", src: "l", from: 6.78, to: 7.221, at: 0, zoom: [1.2, 1.21], origin: FACE },
  { name: "m", src: "m", from: 7.221, to: TOTAL_S, at: 0, zoom: [1.05, 1.06], origin: FACE },
];

/** dips to dark like the reference: [start, end], darkest just before the next hit */
export const DIPS: [number, number][] = [[1.834, 2.287], [6.05, 6.351]];
export const TITLE = { top: "New", bottom: "Collection", on: [[0, 1.86], [6.351, TOTAL_S]] as [number, number][], color: "#3A3532" };
export const LOGO = { src: "brand/reset-logo-black.png", from: 6.78 };
/** the reference's own track */
export const MUSIC: Music = { src: "coleccion/ref_audio.wav", bed: 1.0, duck: 1.0 };
