// RE_RESET_OUTLET_25 · v2 "textura y precio" — hook de descuento + inmediatez, cada estampado en close-up con precio antes/después.
// Precio confirmado por el cliente: talla adulto $999 → $749 (25 % OFF, redondeado a la baja). Sin fechas.
import { Shot } from "../campana/shared";

export const BASE = "outlet";
// music: "Afro House" by jonasblakewood (uploaded by the client, Pixabay track), ~104.8 BPM → one beat = 0.5725 s.
// The track starts at 14.338 s so its drop (18.913 s) lands on the first print card (8 beats in). Every cut sits on a beat.
export const B = 0.5725;
const t = (beats: number) => +(beats * B).toFixed(3);
export const TOTAL_S = t(40); // 22.9 s
export const PRICE = { before: "$999", after: "$749", off: "-25%" };

/** texture/design close-ups, one per print; each gets the price card */
export const MODELS = [
  { n: "01", name: "Rojo · Pinos", from: t(8), to: t(12) },
  { n: "02", name: "Azul · Esquiadores", from: t(12), to: t(16) },
  { n: "03", name: "Olivo · Pinos", from: t(16), to: t(20) },
  { n: "04", name: "Blanco · Gorritos", from: t(20), to: t(24) },
  { n: "05", name: "Verde · Duendes", from: t(24), to: t(28) },
];

const PUSH: [number, number] = [1.0, 1.12]; // steady push into the fabric
export const SHOTS: Shot[] = [
  // HOOK — red fabric, close, price slams on frame 0
  { name: "hook", src: "IMG_2862", from: 0, to: t(4), at: 0.4, zoom: [1.18, 1.05] },
  // "Se están yendo rápido" — set being lifted off the bed
  { name: "rapido", src: "IMG_2861", from: t(4), to: t(8), at: 0.4, zoom: [1.08, 1.0] },
  // the five prints, texture first
  { name: "rojo", src: "IMG_2862", from: t(8), to: t(12), at: 2.3, zoom: PUSH },
  { name: "azul", src: "IMG_2851", from: t(12), to: t(16), at: 0.6, zoom: PUSH },
  { name: "olivo", src: "IMG_2865", from: t(16), to: t(20), at: 0.6, zoom: PUSH },
  { name: "blanco", src: "IMG_2857", from: t(20), to: t(24), at: 1.6, zoom: PUSH },
  { name: "verde", src: "IMG_2840", from: t(24), to: t(28), at: 0.4, zoom: PUSH },
  // scarcity — four sets at once
  {
    name: "pocas", src: "IMG_2861", from: t(28), to: t(32), at: 0.5,
    panels: [{ src: "IMG_2861", at: 0.8 }, { src: "IMG_2852", at: 1.0 }, { src: "IMG_2866", at: 0.6 }, { src: "IMG_2846", at: 1.5 }],
  },
  // CTA over the RE:SET bag
  { name: "cta", src: "IMG_2847", from: t(32), to: TOTAL_S, at: 0.3, rate: 0.5, zoom: [1.0, 1.06] },
];

export const COPY = {
  hookTop: "OUTLET",
  hookLine: "Se están yendo rápido.",
  limited: "EDICIÓN LIMITADA",
  scarcity: ["QUEDAN POCAS PIEZAS", "HASTA AGOTAR EXISTENCIAS"],
  cta: "CORRE POR LA TUYA",
  ctaSub: "Outlet 25% OFF hasta agotar existencias.",
  logo: "brand/reset-logo-white.png",
};
export const MUSIC = { src: "outlet/music_afrohouse.mp3" as string | null, startAt: 14.338, volume: 0.85 };
export const CUT = { hookEnd: t(8), line: t(4), scarcity: t(28), cta: t(32) };
