// RE_RESET_OUTLET_25 · v2 "textura y precio" — hook de descuento + inmediatez, cada estampado en close-up con precio antes/después.
// Precio confirmado por el cliente: talla adulto $999 → $749 (25 % OFF, redondeado a la baja). Sin fechas.
import { Shot } from "../campana/shared";

export const BASE = "outlet";
export const TOTAL_S = 21;
export const PRICE = { before: "$999", after: "$749", off: "-25%" };

/** texture/design close-ups, one per print; each gets the price card */
export const MODELS = [
  { n: "01", name: "Rojo · Pinos", from: 4.5, to: 6.4 },
  { n: "02", name: "Azul · Esquiadores", from: 6.4, to: 8.3 },
  { n: "03", name: "Olivo · Pinos", from: 8.3, to: 10.2 },
  { n: "04", name: "Blanco · Gorritos", from: 10.2, to: 12.1 },
  { n: "05", name: "Verde · Duendes", from: 12.1, to: 14.0 },
];

const PUSH: [number, number] = [1.0, 1.12]; // steady push into the fabric
export const SHOTS: Shot[] = [
  // HOOK — red fabric, close, price slams on frame 0
  { name: "hook", src: "IMG_2862", from: 0, to: 2.5, at: 0.4, zoom: [1.18, 1.05] },
  // "Se están yendo rápido" — set being lifted off the bed
  { name: "rapido", src: "IMG_2863", from: 2.5, to: 4.5, at: 0.1, zoom: [1.08, 1.0] },
  // the five prints, texture first
  { name: "rojo", src: "IMG_2862", from: 4.5, to: 6.4, at: 2.6, zoom: PUSH },
  { name: "azul", src: "IMG_2851", from: 6.4, to: 8.3, at: 0.6, zoom: PUSH },
  { name: "olivo", src: "IMG_2865", from: 8.3, to: 10.2, at: 0.6, zoom: PUSH },
  { name: "blanco", src: "IMG_2857", from: 10.2, to: 12.1, at: 1.6, zoom: PUSH },
  { name: "verde", src: "IMG_2840", from: 12.1, to: 14.0, at: 0.4, zoom: PUSH },
  // scarcity — four sets at once
  {
    name: "pocas", src: "IMG_2861", from: 14.0, to: 17.0, at: 0.5,
    panels: [{ src: "IMG_2861", at: 0.8 }, { src: "IMG_2852", at: 1.0 }, { src: "IMG_2866", at: 0.6 }, { src: "IMG_2846", at: 1.5 }],
  },
  // CTA over the RE:SET bag
  { name: "cta", src: "IMG_2847", from: 17.0, to: TOTAL_S, at: 0.4, rate: 0.6, zoom: [1.0, 1.06] },
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
export const MUSIC = { src: null as string | null, volume: 0.9 };
