// Everything replaceable in the "outfit of the day" recreation lives here.
// Timings are frames at 30 fps and copy the reference reel (editor/estilo.md, editor/recreacion/ESCALETA.md).

export const FPS = 30;
export const TOTAL = 278; // 9.27 s = exactly one pass of the reference audio (never looped)

export const COLORS = {
  title: "#F6D7E3", // pink/lilac sampled from the reference title
  labelBg: "#CFCCCC", // sampled from the reference's Instagram-style product tags
  labelText: "#141414",
  scan: "#F6D7E3", // scanner brackets/trail share the title's pink
  scanGlow: "rgba(236,150,196,0.95)",
};

export const FONTS = {
  title: { family: "Fraunces", file: "fonts/Fraunces-full.woff2", weight: 900, variation: '"SOFT" 100, "WONK" 0, "opsz" 144' },
  label: { family: "Open Sans", file: "fonts/OpenSans-400-italic.woff2", weight: 400 }, // humanist italic like the reference tags
};

/** Shots. zoom: [frame, scale][] keyframes (linear between, ease-out on the fast push); origin = transform origin in % of frame. */
export const SHOTS = [
  {
    // 1 · 0.00-2.47 s: wide entrance under the title (head-to-thigh like the reference); camera follows her in from the right
    src: "recreacion/IMG_8492.mp4",
    from: 0,
    frames: 74,
    startFrom: 3, // source 0.10 s
    zoom: [[0, 1.52], [74, 1.52]] as [number, number][],
    origin: [[0, 88, 100], [8, 88, 100], [45, 15, 100], [74, 15, 100]] as [number, number, number][], // [frame, x%, y%]
  },
  {
    // 2 · 2.47-4.80 s (cut on the beat): full-body, centred, for the scan — "can I please scan your outfit?"
    src: "recreacion/IMG_8491.mp4",
    from: 74,
    frames: 70,
    startFrom: 59, // source 1.97 s
    zoom: [[0, 1.36], [70, 1.4]] as [number, number][], // >= 1.33 keeps the wall sign wholly out of frame
    origin: [[0, 0, 100], [70, 0, 100]] as [number, number, number][],
  },
  {
    // 3 · 4.80-7.77 s: main take again (hand in pocket), fast push at 5.30-5.55 s like the reference, then medium: hand to hair
    src: "recreacion/IMG_8492.mp4",
    from: 144,
    frames: 89,
    startFrom: 147, // source 4.90 s (same clock as shot 1: source = output + 0.1 s)
    zoom: [[0, 1.52], [15, 1.52], [23, 1.85], [89, 1.92]] as [number, number][],
    fastPush: [15, 23],
    origin: [[0, 15, 100], [15, 15, 100], [23, 22, 90], [89, 22, 90]] as [number, number, number][],
  },
  {
    // 4 · 7.77-9.27 s: hard cut on the beat to the close shot — 3/4 profile turning to camera, smiling (as the reference ends);
    //     the frame follows her as she drifts left, like the reference's handheld camera, so the labels stay on the garment
    src: "recreacion/IMG_8491.mp4",
    from: 233,
    frames: 45,
    startFrom: 54, // source 1.80 s
    zoom: [[0, 2.0], [45, 2.06]] as [number, number][],
    origin: [[0, 72, 78], [3, 72, 78], [17, 45, 78], [32, 26, 78], [45, 26, 78]] as [number, number, number][],
  },
];

/** Outfit scanner, synced to the dialogue in the reference audio (Whisper word times):
 *  "can" 2.50 s -> viewfinder in · "scan" 3.18 s -> line sweeps down to the end of "outfit" 3.96 s · "I guess so" 4.18-4.76 s -> out. */
export const SCAN = {
  box: { x: 330, y: 560, w: 520, h: 1320 }, // around her full body in shot 2
  bracketsIn: 75,
  sweep: [95, 119] as [number, number],
  out: [128, 142] as [number, number],
};

export const TITLE = {
  lines: ["outfit", "of the", "day"],
  x: 520, // centre x of the block on 1080 (measured on the reference)
  tops: [505, 775, 1045], // top of each line (reference: line centres at 31 / 45 / 59 % of the height)
  size: 228,
  // Exit measured frame by frame on the reference (template match of the title, px converted to 1080 wide):
  // it starts 0.05 s after the model enters and accelerates out of frame in ~0.95 s.
  // Frame 11 = 1 frame after Michelle enters (frame 10). [frame, px travelled]
  motion: [[0, 0], [11, 0], [12, 14], [14, 36], [15, 53], [17, 89], [18, 111], [20, 161], [21, 186], [23, 244], [24, 277], [26, 307], [27, 377], [29, 415], [30, 490], [32, 529], [33, 612], [35, 656], [36, 742], [38, 900], [40, 1100]] as [number, number][],
  direction: -1, // the reference title leaves away from the side the model enters; Michelle enters from the right, so it leaves left. Set 1 to copy the original's rightward exit.
};

/** Instagram-style product tags: only visible, verifiable facts, lowercase like the reference (brand keeps its spelling).
 *  During the scan each tag pops when the scan line reaches it (from = scan frame at its y). pos = [fromFrame, x, y][] re-pins after a cut. */
export const LABELS = [
  { text: "cuello redondo", from: 0, to: 144, pos: [[0, 590, 905]], scan: true },
  { text: "RE:SET", from: 0, to: 144, pos: [[0, 590, 1080]], scan: true },
  { text: "manga larga", from: 0, to: 144, pos: [[0, 760, 1250]], scan: true },
  { text: "cordón ajustable", from: 0, to: 144, pos: [[0, 560, 1430]], scan: true },
  { text: "bolsillos laterales", from: 146, to: 159, pos: [[146, 400, 1180]] }, // hands in pockets, before the push
  { text: "RE:SET", from: 180, to: 278, pos: [[180, 540, 960], [233, 540, 1300]] }, // 6.0 s, as the reference's brand tag
  { text: "manga larga", from: 219, to: 278, pos: [[219, 790, 860], [233, 830, 1520]] }, // 7.3 s
  { text: "cuello redondo", from: 233, to: 278, pos: [[233, 560, 1080]] }, // 7.78 s, with the cut
];

// Audio of the reference reel (requested by the client). Its commercial licence is NOT verified.
export const MUSIC: string | null = "recreacion/music.wav";
export const LOGO: string | null = null; // the real RE:SET wall sign is in shot; set "brand/reset-logo-black.png" to add a discreet bug
