// RE_RESET_OUTLET_25 — "Si te gustó, este es el momento." Todo lo editable vive aquí.
// Material: 16 clips de producto (sin modelo, sin voz, sin precios) → public/outlet. Sin cifras de precio: no fueron confirmadas.
// Rejilla de 120 BPM (0.5 s) para que la pista con licencia entre a tiempo.
import { Shot } from "../campana/shared";

export const BASE = "outlet";
export const TOTAL_S = 27;

/** each print in the outlet: on-screen description is only what is visible (colour + motif) */
export const MODELS = [
  { n: "01", name: "Rojo · Pinos", from: 3.0, to: 7.5 },
  { n: "02", name: "Azul · Esquiadores", from: 7.5, to: 11.0 },
  { n: "03", name: "Olivo · Pinos", from: 11.0, to: 14.0 },
  { n: "04", name: "Blanco · Gorritos", from: 14.0, to: 15.8 },
  { n: "05", name: "Verde · Duendes", from: 15.8, to: 18.5 },
];

export const SHOTS: Shot[] = [
  // HOOK — the red set, full, from frame 0
  { name: "hook", src: "IMG_2861", from: 0, to: 3.0, at: 0.1, zoom: [1.1, 1.0] },
  // 01 rojo
  { name: "rojo-detalle", src: "IMG_2862", from: 3.0, to: 5.5, at: 0.6, zoom: [1.0, 1.08] },
  { name: "rojo-set", src: "IMG_2863", from: 5.5, to: 7.5, at: 0.1, zoom: [1.06, 1.0] },
  // 02 azul
  { name: "azul-set", src: "IMG_2852", from: 7.5, to: 9.5, at: 0.6, zoom: [1.0, 1.05] },
  { name: "azul-detalle", src: "IMG_2851", from: 9.5, to: 11.0, at: 3.6, zoom: [1.05, 1.0] },
  // 03 olivo
  { name: "olivo-set", src: "IMG_2866", from: 11.0, to: 12.8, at: 0.3, zoom: [1.0, 1.05] },
  { name: "olivo-detalle", src: "IMG_2865", from: 12.8, to: 14.0, at: 1.2, zoom: [1.05, 1.0] },
  // 04 blanco
  { name: "blanco-set", src: "IMG_2857", from: 14.0, to: 15.8, at: 0.4, zoom: [1.0, 1.05] },
  // 05 verde
  { name: "verde-set", src: "IMG_2842", from: 15.8, to: 17.3, at: 4.0, zoom: [1.0, 1.04] },
  { name: "verde-detalle", src: "IMG_2840", from: 17.3, to: 18.5, at: 0.6, zoom: [1.05, 1.0] },
  // URGENCY — four prints at once
  {
    name: "pocas", src: "IMG_2863", from: 18.5, to: 22.5, at: 0.3,
    panels: [{ src: "IMG_2863", at: 0.3 }, { src: "IMG_2848", at: 0.5 }, { src: "IMG_2869", at: 0.2 }, { src: "IMG_2857", at: 2.0 }],
  },
  // CTA — the bag with the RE:SET mark, then the card
  { name: "bolsa", src: "IMG_2847", from: 22.5, to: TOTAL_S, at: 0.6, rate: 0.6, zoom: [1.0, 1.06] },
];

export const COPY = {
  hookTop: "FINAL SALE",
  hookLine: "Lo que queda, se va.",
  badge: ["OUTLET", "25% OFF"],
  urgency: ["POCAS PIEZAS", "FINAL SALE"],
  cta: ["Encuentra los modelos", "disponibles en RE:SET."],
  ctaSub: "Hasta agotar existencias.",
  logo: "brand/reset-logo-white.png",
};
/** licensed track (dynamic, marked beat, ~120 BPM) goes here; null = silent */
export const MUSIC = { src: null as string | null, volume: 0.9 };
