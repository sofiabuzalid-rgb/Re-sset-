// 25% OFF — cuatro anuncios para testear en Meta Ads. Solo material de Outlet y las playeras NFL; dos pistas.
// Todo se mide en beats: cada corte, golpe y cambio de texto cae en un golpe de la música (B = segundos por golpe).
// Música A: "Make It Sound Cool" (Where's LuLu?, Artlist), grabada de la app por el cliente → ~114.8 BPM. Sin licencia de pauta confirmada.
// Música F: afro house (Pixabay, subida por el cliente) → ~104.8 BPM. Licencia Pixabay (uso comercial permitido).
// Cada ad empieza en un golpe de su pista (startM). Clips: [beat inicio, beat fin, clip, segundo de inicio en el clip, zoom?].

export const BA = 0.5225;
export const BF = 0.5725;

export type Row = [number, number, string, number, [number, number]?];
export type Pan = { b0: number; b1: number; panels: [string, number][] };
export type AdCfg = { B: number; beats: number; startM: number; music: string; hits: number[]; rows: Row[]; pans: Pan[] };

export const AD: Record<"ad1" | "ad2" | "ad3" | "ad4", AdCfg> = {
  // 1 · ESTA ES TU SEÑAL — rápido, directo. Artlist desde el inicio de la grabación.
  ad1: {
    B: BA, beats: 50, startM: 1.115, music: "ads4/music_artlist.wav", hits: [4, 10, 24, 36, 44],
    rows: [
      [0, 4, "IMG_2861", 0.2, [1.05, 1.12]],
      [4, 6, "IMG_2863", 0.1, [1.1, 1.0]],
      [6, 8, "IMG_2852", 0.6],
      [8, 10, "IMG_2866", 0.4],
      [10, 14, "IMG_2851", 3.5, [1.0, 1.08]],
      [14, 18, "IMG_2857", 1.0],
      [18, 20, "IMG_2840", 0.4],
      [20, 24, "IMG_2862", 2.0],
      [24, 28, "IMG_2846", 0.5],
      [28, 32, "IMG_2848", 0.6],
      [32, 36, "IMG_2865", 0.5],
      [36, 40, "IMG_2842", 1.0],
      [40, 44, "IMG_2869", 0.8],
      [44, 50, "IMG_2839", 0.3, [1, 1.05]],
    ],
    pans: [],
  },
  // 2 · POV — montaje juguetón. Artlist desde su segunda sección (otra edición de la misma pista).
  ad2: {
    B: BA, beats: 48, startM: 1.115 + 8 * BA, music: "ads4/music_artlist.wav", hits: [6, 12, 18, 30, 36, 42],
    rows: [
      [0, 6, "IMG_2848", 0.4, [1.06, 1.0]],
      [6, 8, "IMG_2862", 0.3],
      [8, 10, "IMG_2839", 0.2],
      [10, 12, "IMG_2857", 0.8],
      [12, 14, "IMG_2866", 0.4],
      [14, 16, "IMG_2851", 2.0, [1, 1.08]],
      [16, 18, "IMG_2865", 0.5],
      [18, 22, "IMG_2840", 0.6],
      [22, 24, "IMG_2842", 0.9],
      [24, 27, "IMG_2846", 0.3],
      [27, 30, "IMG_2861", 0.5],
      [30, 36, "IMG_2852", 0.6],
      [36, 42, "IMG_2869", 0.6],
      [42, 48, "IMG_2863", 0.3, [1, 1.05]],
    ],
    pans: [],
  },
  // 3 · NO PAGUES PRECIO COMPLETO — minimal, más producto. Afro house desde su intro, el golpe 33 es el drop.
  ad3: {
    B: BF, beats: 46, startM: 14.338 - 25 * BF, music: "ads4/music_afrohouse.mp3", hits: [4, 14, 22, 33, 40],
    rows: [
      [0, 4, "IMG_2857", 0.8, [1, 1.04]],
      [4, 14, "IMG_2865", 0.5, [1, 1.05]],
      [14, 18, "IMG_2852", 0.6],
      [18, 22, "IMG_2866", 0.4],
      [22, 26, "IMG_2863", 0.3],
      [26, 33, "IMG_2846", 0.8],
      [33, 40, "IMG_2851", 1.5, [1, 1.08]],
      [40, 46, "IMG_2862", 2.0],
    ],
    pans: [],
  },
  // 4 · 25% OFF EN PIJAMAS NAVIDEÑAS — todo junto: grilla 2×2 con cada estampado (rojo de pinos, duendes, esquí, osos, verde de pinos y playeras NFL) que cambia cada 2 golpes. Afro house desde el drop.
  ad4: {
    B: BF, beats: 52, startM: 14.338 + 8 * BF, music: "ads4/music_afrohouse.mp3", hits: [4, 8, 14, 24, 34, 40, 46],
    rows: [],
    pans: [
      { b0: 0, b1: 4, panels: [["IMG_2861", 0.2], ["IMG_2839", 0.5], ["IMG_2848", 0.5], ["IMG_2857", 0.5]] },
      { b0: 4, b1: 6, panels: [["IMG_2862", 0.3], ["IMG_2840", 0.8], ["IMG_2852", 0.6], ["IMG_2865", 0.4]] },
      { b0: 6, b1: 8, panels: [["IMG_2863", 0.2], ["IMG_2846", 0.4], ["IMG_2851", 1.0], ["IMG_2866", 0.5]] },
      { b0: 8, b1: 10, panels: [["IMG_2861", 1.0], ["IMG_2842", 0.5], ["IMG_2848", 0.9], ["IMG_2857", 1.0]] },
      { b0: 10, b1: 12, panels: [["IMG_2862", 0.9], ["IMG_2839", 0.8], ["IMG_2852", 1.2], ["IMG_2865", 1.0]] },
      { b0: 12, b1: 14, panels: [["IMG_2863", 1.0], ["IMG_2846", 0.9], ["IMG_2851", 0.6], ["IMG_2866", 1.0]] },
      { b0: 14, b1: 16, panels: [["IMG_2037", 0.4], ["IMG_2038", 0.4], ["IMG_2039", 0.5], ["IMG_2040", 0.4]] },
      { b0: 16, b1: 18, panels: [["IMG_2040", 1.0], ["IMG_2039", 1.0], ["IMG_2038", 1.0], ["IMG_2037", 1.0]] },
      { b0: 18, b1: 20, panels: [["IMG_2038", 0.6], ["IMG_2037", 0.6], ["IMG_2040", 0.6], ["IMG_2039", 0.6]] },
      { b0: 20, b1: 22, panels: [["IMG_2839", 0.3], ["IMG_2861", 0.5], ["IMG_2857", 0.5], ["IMG_2848", 0.5]] },
      { b0: 22, b1: 24, panels: [["IMG_2842", 0.4], ["IMG_2862", 0.9], ["IMG_2865", 0.6], ["IMG_2852", 0.6]] },
      { b0: 24, b1: 26, panels: [["IMG_2846", 0.2], ["IMG_2863", 0.5], ["IMG_2851", 0.6], ["IMG_2866", 0.9]] },
      { b0: 26, b1: 28, panels: [["IMG_2840", 0.6], ["IMG_2861", 1.2], ["IMG_2852", 0.9], ["IMG_2857", 0.7]] },
      { b0: 28, b1: 30, panels: [["IMG_2839", 0.9], ["IMG_2862", 0.4], ["IMG_2848", 1.1], ["IMG_2865", 0.2]] },
      { b0: 30, b1: 32, panels: [["IMG_2842", 0.8], ["IMG_2863", 0.9], ["IMG_2851", 0.9], ["IMG_2866", 0.4]] },
      { b0: 32, b1: 34, panels: [["IMG_2846", 0.5], ["IMG_2861", 0.6], ["IMG_2852", 0.3], ["IMG_2857", 1.5]] },
      { b0: 34, b1: 36, panels: [["IMG_2840", 0.2], ["IMG_2862", 0.2], ["IMG_2848", 0.4], ["IMG_2865", 0.4]] },
      { b0: 36, b1: 38, panels: [["IMG_2839", 0.6], ["IMG_2863", 0.6], ["IMG_2851", 0.3], ["IMG_2866", 0.6]] },
      { b0: 38, b1: 40, panels: [["IMG_2846", 0.7], ["IMG_2861", 0.7], ["IMG_2852", 0.9], ["IMG_2857", 0.9]] },
      { b0: 40, b1: 42, panels: [["IMG_2842", 0.1], ["IMG_2862", 0.8], ["IMG_2848", 0.8], ["IMG_2865", 0.8]] },
      { b0: 42, b1: 44, panels: [["IMG_2840", 1.0], ["IMG_2863", 1.0], ["IMG_2851", 1.0], ["IMG_2866", 1.0]] },
      { b0: 44, b1: 46, panels: [["IMG_2839", 0.4], ["IMG_2861", 0.4], ["IMG_2852", 0.4], ["IMG_2857", 0.4]] },
      { b0: 46, b1: 48, panels: [["IMG_2846", 0.6], ["IMG_2862", 0.6], ["IMG_2848", 0.6], ["IMG_2865", 0.6]] },
      { b0: 48, b1: 50, panels: [["IMG_2842", 0.6], ["IMG_2863", 0.6], ["IMG_2851", 0.6], ["IMG_2866", 0.6]] },
      { b0: 50, b1: 52, panels: [["IMG_2840", 0.6], ["IMG_2861", 0.6], ["IMG_2852", 0.6], ["IMG_2857", 0.6]] },
    ],
  },
};
