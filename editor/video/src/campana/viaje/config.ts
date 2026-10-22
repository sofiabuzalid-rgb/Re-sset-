// RE:SET — Anuncio 04 · TU PIJAMA DE VIAJE (básica azul marino + bolsita) · "Tu pijama favorita, lista para acompañarte".
// Voz: python3 editor/campana/voz.py viaje → timing.json. Demostración: PIJAMA → BOLSITA → MALETA → VIAJE.
import { anchors, Music, Shot, sync, Timing } from "../shared";
import timingJson from "./timing.json";

export const T = timingJson as Timing;
const { w, P, lip } = anchors(T);
const PUSH: [number, number] = [1.07, 1.0]; // quick settle on every cut: this one is fast and direct

export const BASE = "campana/media";
export const SHOTS: Shot[] = [
  // HOOK — she holds the set and its pouch: "Está súper cómoda y súper práctica"
  sync(lip, "hook", 0, "IMG_8974", 0, w("para"), { zoom: [1.08, 1.12], origin: [50, 55] }),
  // "para que la puedas llevar en cualquier parte" — the pouch, up close
  { name: "bolsita", src: "IMG_8972", from: w("para"), to: w("cuando"), at: 0.3, zoom: PUSH },
  // "cuando te vayas de viaje," — the suitcase opens
  { name: "abre", src: "IMG_8975", from: w("cuando"), to: w("en", 1), at: 0.0, zoom: PUSH },
  // "en tu maleta," — the pouch goes in
  { name: "maleta", src: "IMG_8976", from: w("en", 1), to: w("en", 2), at: 0.8, zoom: PUSH },
  // "en tu bolsa de mano,"
  sync(lip, "mano", 0, "IMG_8974", w("en", 2), w("donde"), { zoom: [1.12, 1.16], origin: [50, 50] }),
  // "donde tú quieras." — closed, ready
  { name: "cierra", src: "IMG_8979", from: w("donde"), to: P[1], at: 0.4, zoom: PUSH },
  // "Literales de esas cosas que te llevas para todos lados porque ya tienes todo junto."
  sync(lip, "junto", 1, "IMG_8982", P[1], P[2], { zoom: [1.0, 1.05], origin: [50, 40] }),
  // …she leaves with the suitcase
  { name: "sale", src: "IMG_8981", from: P[2], to: P[3], at: 0.0, zoom: [1.0, 1.04] },
  // "Es broma, no me fui, pero nada, nos quería decirles que esta pijama es de RE:SET y"
  sync(lip, "broma", 3, "IMG_8987", P[3], w("tienen"), { zoom: [1.0, 1.04], origin: [50, 45] }),
  // "tienen que correr por la suya" — the set with its pouch
  { name: "set", src: "IMG_8973", from: w("tienen"), to: w("porque", 1), at: 1.6, zoom: PUSH, origin: [50, 60] },
  // "porque yo lo estoy amando."
  sync(lip, "amando", 3, "IMG_8987", w("porque", 1), T.voiceEnd, { zoom: [1.04, 1.08], origin: [50, 45] }),
  // end card over her with the suitcase
  { name: "cierre", src: "IMG_8984", from: T.voiceEnd, to: T.total / 30, at: 1.0, rate: 0.8, zoom: [1.0, 1.05], xf: 5 },
];

/** graphic hook (brand copy, never attributed to her) */
export const HOOK = { lines: ["¿Ya viste la bolsita que trae", "esta pijama para viajar?"], to: w("para") + 0.2 };
/** the demonstration, step by step */
export const STEPS = [
  { n: "1", text: "Va en su bolsita", from: w("para"), to: w("cuando") },
  { n: "2", text: "A la maleta", from: w("cuando"), to: w("en", 2) },
  { n: "3", text: "Lista para viajar", from: w("donde"), to: P[1] },
];
export const END = { logo: "brand/reset-logo-white.png", title: "Tu pijama favorita,", title2: "también de viaje." };
export const CAPTION_HL = new Set(["viaje", "maleta", "RE:SET", "práctica"]);
export const MUSIC: Music = { src: null, bed: 0.32, duck: 0.09 }; // travel lifestyle, light and quick: see ENTREGA
