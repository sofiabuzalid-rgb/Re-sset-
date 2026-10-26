// RE:SET — PICK YOUR COLOR. Todo lo editable vive aquí: rejilla de tiempo, clips, textos, paleta, sonido.
// Rejilla: 160 BPM (un golpe = 0.375 s). Cada escena y cada cambio de color cae en un golpe, así la pista con licencia entra a tiempo.
// Recortes (modelo sobre transparente, BiRefNet): editor/pyc/matte.sh → editor/pyc/alpha.sh → public/pyc/<nombre>.webm (VP9 + alfa).
// SIN ROSTRO (requisito del cliente): todos los recortes se anclan arriba con el mentón fuera del cuadro.

export const FPS = 30;
export const BEAT = 0.375;
export const b = (beats: number) => Math.round(beats * BEAT * FPS); // beats → frames

/** colours sampled from the real garments (IMG_2599, median of the fabric) + the campaign neutrals */
export const PALETTE = {
  paper: "#F6F3EE", // warm white
  ink: "#1F1D1B", // soft black
  mist: "#E9E5DF", // soft grey surface
  blush: "#AF838B",
  sage: "#B9B58A",
  grey: "#BDC0BB",
};
export type Tone = "blush" | "sage" | "grey";
export const NAMES: Record<Tone, string> = { blush: "Blush", sage: "Sage", grey: "Grey" };

/** a cut-out model clip (transparent webm) and how it sits in frame: scale and offsets in px, anchored at the top */
export type Cut = { src: string; at: number; tone: Tone; scale?: number; x?: number; y?: number };
export const CUTS: Record<string, Cut> = {
  // y < 0 lifts the frame so the top edge sits below her chin; scale keeps the bottom covered (1920·scale + y ≥ 1920)
  blushFront: { src: "blush-front", at: 0.0, tone: "blush", scale: 1.14, y: -250 },
  sageFront: { src: "sage-front", at: 0.0, tone: "sage", scale: 1.1, y: -170 },
  greyFront: { src: "grey-front", at: 0.0, tone: "grey", scale: 1.1, y: -150 },
  blushArms: { src: "blush-arms", at: 0.0, tone: "blush", scale: 1.12, y: -210 },
  sageFront2: { src: "sage-front2", at: 0.0, tone: "sage", scale: 1.12, y: -210 },
  greyCord: { src: "grey-cord", at: 0.0, tone: "grey", scale: 1.0, y: 0 },
};
/** detail shots (original takes, garment fills the frame): file in public/tonos, in-point s */
export const DETAILS = {
  stripes: { src: "tonos/IMG_2552.mp4", at: 8.6, tone: "blush" as Tone, label: "Fine stripes" },
  vneck: { src: "tonos/IMG_2512.mp4", at: 4.4, tone: "sage" as Tone, label: "V-neck" },
  cord: { src: "tonos/IMG_2572.mp4", at: 6.8, tone: "grey" as Tone, label: "Drawstring waist" },
  sleeve: { src: "tonos/IMG_2578.mp4", at: 5.6, tone: "grey" as Tone, label: "Long sleeve" },
  trio: { src: "tonos/IMG_2599.mp4", at: 0.2, tone: "blush" as Tone, label: "" },
};

export const COPY = {
  warning: "WARNING:",
  hook: ["CHOOSING JUST ONE", "IS IMPOSSIBLE."],
  meetSub: "Fine stripe set",
  details: ["THE DETAILS.", "THE COLORS.", "THE COMFORT."],
  which: "OKAY, BUT WHICH ONE?",
  fav: ["YOUR NEW", "FAVORITE SET."],
  discover: "DISCOVER THE NEW COLLECTION",
  logo: "brand/reset-logo-black.png",
};

/** scene lengths in beats (main cut = 40 beats = 15.0 s) */
export const SCENES = { hook: 6, meet: 6, details: 8, swap: 8, decision: 5, cta: 7 };
/** licensed track (fashion editorial / minimal upbeat, ~160 BPM or 80 half-time) — null = SFX only */
export const MUSIC: { src: string | null; volume: number } = { src: null, volume: 0.9 };
export const SFX = { whoosh: "pyc/whoosh.wav", tick: "pyc/tick.wav", volume: 0.55 };
