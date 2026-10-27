// RE:SET OUTLET 25% OFF — cuatro anuncios para Meta Ads (1080×1920, 30 fps).
// Todo se mide en beats (B = segundos por beat de la pista de cada anuncio): cortes, textos, drops y SFX caen en la música.
// Clips: editor/video/public/outlet4 (SDR 1080×1920, no versionados; ver editor/outlet4/prepare.sh).

export const FPS = 30;

/** each ad: its own tempo and track. AD1, AD2, AD4 are original (editor/outlet4/music.py); AD3 is the client's Pixabay afro house from its drop. */
export const ADS = {
  ad1: { B: 60 / 124, beats: 60, music: "outlet4/audio/ad1_ya_llego.wav", startS: 0 },
  ad2: { B: 0.6, beats: 52, music: "outlet4/audio/ad2_chat.wav", startS: 0 },
  ad3: { B: 0.5725, beats: 52, music: "outlet4/audio/afrohouse.mp3", startS: 18.918 },
  ad4: { B: 60 / 128, beats: 72, music: "outlet4/audio/ad4_no_te_duermas.wav", startS: 0 },
} as const;

export type AdKey = keyof typeof ADS;
export const frames = (k: AdKey) => Math.round(ADS[k].beats * ADS[k].B * FPS);

/** seconds of usable footage per clip (seeks are clamped to this) */
export const CLIP_DUR: Record<string, number> = {
  // nuevos (Drive "OUTLET RE:SET", 27 oct)
  IMG_2838: 4.6, IMG_2847: 2.9, IMG_2979: 7.76, IMG_2980: 1.73, IMG_2981: 2.56, IMG_2982: 4.73, IMG_2983: 6.26, IMG_2984: 9.46,
  IMG_2985: 9.06, IMG_2986: 3.46, IMG_2987: 4.26, IMG_2988: 7.63, IMG_2989: 7.53, IMG_2991: 2.3, IMG_2992: 2.6, IMG_2994: 5.73, IMG_2995: 5.0,
  // outlet navideño + NFL (ya usados en campañas anteriores)
  IMG_2839: 3.2, IMG_2840: 3.26, IMG_2842: 7.16, IMG_2846: 5.56, IMG_2848: 3.86, IMG_2851: 8.26, IMG_2852: 5.23, IMG_2857: 4.33,
  IMG_2861: 3.2, IMG_2862: 4.66, IMG_2863: 2.3, IMG_2865: 3.63, IMG_2866: 3.13, IMG_2037: 6.73, IMG_2038: 6.43, IMG_2039: 6.16, IMG_2040: 5.53,
};

/*
Clasificación del material (pijama · plano · uso):
  Duendes verde ......... 2838 macro con etiqueta "RE:SET Loungewear" (movimiento, hero de detalle) · 2839/2840 macro · 2842 conjunto extendido · 2846 conjunto
  Esquí azul ............ 2847 doblada con etiqueta (se gira 180°) · 2848/2852 conjunto · 2851 macro de estampado
  Gorros/osos blanco .... 2857 conjunto completo
  Rojo de pinos ......... 2861 conjunto + scrunchie (hero) · 2862/2863 macro
  Verde olivo de pinos .. 2865/2866 close
  Smiley amarillo ....... 2992 empaquetada (push-in) · 2994 scrunchie + macro de tela (movimiento rápido)
  Fútbol (playera+short)  2982/2991 Brasil · 2984 "10" azulgrana · 2985 celeste · 2983 blanca/verde · 2986/2987 rayas rojas · 2988 roja "19" · 2989 rayas "10"
                          2979 grupo empaquetado (paneo) · 2980 paneo rápido (transición) · 2981 cuatro conjuntos en grilla
  SF .................... 2995 conjunto rojo · NFL en gancho 2037/2038/2039/2040
  Manos en cuadro (revisado cada 0.4 s): tramos limpios 2983 4.8–6.2 · 2984 2.0–3.4 y 7.6–9.4 · 2985 0–2.6 y 6.0–8.8 · 2987 1.6– · 2988 0–4.0 y 6.4– · 2995 1.6–
  Duplicados: 2979≈2980, 2982≈2991, 2986≈2987, 2839≈2840, 2848≈2852, 2861/2862/2863, 2865≈2866; en Drive, copy_86ECF4FC es el video de referencia.
*/
