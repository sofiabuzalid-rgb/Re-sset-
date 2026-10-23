// RE:SET — Reel "Nuevo modelo, 3 tonos" (18–20 s, sin voz). Todo lo editable vive aquí.
// Clips: uploads IMG_25xx (HLG → SDR, 1080×1920 nativo) en public/tonos. Cortes sobre una rejilla de 100 BPM (0.6 s)
// para que la pista con licencia caiga a tiempo. Tonos: 01 salvia, 02 malva, 03 gris (sin nombres de color en pantalla).
import { Music, Shot } from "../campana/shared";

export const BASE = "tonos";
export const B = 0.6; // one beat at 100 BPM
const at = (beats: number) => +(beats * B).toFixed(2);
export const TOTAL_S = at(33); // 19.8 s

export const SHOTS: Shot[] = [
  // 0–2.4 · HOOK: hands on the striped cuff (motion + fabric), then the full look turning at the mirror
  { name: "puño", src: "IMG_2552", from: 0, to: at(2), at: 2.2, zoom: [1.12, 1.0] },
  { name: "espejo", src: "IMG_2538", from: at(2), to: at(4), at: 0.6, zoom: [1.06, 1.0] },
  // 2.4–4.8 · the new design, complete
  { name: "salvia-full", src: "IMG_2515", from: at(4), to: at(6), at: 1.2, zoom: [1.0, 1.04] },
  { name: "malva-full", src: "IMG_2550", from: at(6), to: at(8), at: 0.3, zoom: [1.0, 1.04] },
  // 4.8–7.8 · details, drape, fit
  { name: "lazo", src: "IMG_2510", from: at(8), to: at(9.5), at: 6.6, zoom: [1.04, 1.0] },
  { name: "rayas", src: "IMG_2552", from: at(9.5), to: at(11), at: 8.6, zoom: [1.0, 1.05] },
  { name: "manga", src: "IMG_2578", from: at(11), to: at(13), at: 2.6, zoom: [1.04, 1.0] },
  // 7.8–12.6 · three tones: the rack, then 01 / 02 / 03 with clean dissolves
  { name: "rack", src: "IMG_2601", from: at(13), to: at(15), at: 1.5, zoom: [1.0, 1.05] },
  { name: "tono-01", src: "IMG_2510", from: at(15), to: at(17), at: 0.6, zoom: [1.0, 1.04], xf: 6 },
  { name: "tono-02", src: "IMG_2551", from: at(17), to: at(19), at: 3.4, zoom: [1.0, 1.04], xf: 6 },
  { name: "tono-03", src: "IMG_2573", from: at(19), to: at(21), at: 1.0, zoom: [1.0, 1.04], xf: 6 },
  // 12.6–16.8 · the three mixed
  { name: "malva-espalda", src: "IMG_2553", from: at(21), to: at(22.5), at: 1.6, zoom: [1.0, 1.03] },
  { name: "gris-camina", src: "IMG_2576", from: at(22.5), to: at(24), at: 0.2, zoom: [1.0, 1.03] },
  { name: "salvia-borde", src: "IMG_2510", from: at(24), to: at(25.5), at: 11.6, zoom: [1.0, 1.04] },
  { name: "malva-giro", src: "IMG_2552", from: at(25.5), to: at(27), at: 16.6, zoom: [1.0, 1.03] },
  { name: "gris-cuello", src: "IMG_2574", from: at(27), to: at(28), at: 1.0, zoom: [1.04, 1.0] },
  // 16.8–19.8 · close: the three on the rail ("ALL DAY."), slowed
  { name: "cierre", src: "IMG_2597", from: at(28), to: TOTAL_S, at: 0.8, rate: 0.7, zoom: [1.02, 1.08], xf: 8 },
];

/** on-screen copy: [text, from, to, style] — big = statement, serif = editorial line, num = tone index */
export const TEXTS = [
  { kind: "big", lines: ["NO ES UNA", "PIJAMA MÁS ✨"], from: 0, to: at(4) },
  { kind: "serif", lines: ["Es el nuevo", "modelo de RE:SET"], from: at(4), to: at(8) },
  { kind: "serif", lines: ["Ya está disponible"], from: at(8), to: at(13) },
  { kind: "big", lines: ["DISPONIBLE", "EN 3 TONOS"], from: at(13), to: at(15) },
  { kind: "num", lines: ["01"], from: at(15), to: at(17) },
  { kind: "num", lines: ["02"], from: at(17), to: at(19) },
  { kind: "num", lines: ["03"], from: at(19), to: at(21) },
  { kind: "serif", lines: ["Para quedarte en casa,", "verte increíble", "y no querer quitártela"], from: at(21), to: at(28) },
];
/** close: the three hangers on the rail get their numbers (x in px at the slowed frame) */
export const RAIL = [{ n: "01", x: 215 }, { n: "02", x: 625 }, { n: "03", x: 940 }];
export const END = { q: "¿Cuál es tu favorito?", line: "Nuevo modelo · RE:SET", logo: "brand/reset-logo-white.png" };
/** licensed track (soft, rhythmic, chic/cozy ~100 BPM) goes here; null = silent */
export const MUSIC: Music = { src: null, bed: 0.9, duck: 0.9 };
