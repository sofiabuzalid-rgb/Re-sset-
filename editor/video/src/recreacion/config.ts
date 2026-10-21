// Everything replaceable in the "outfit of the day" recreation lives here.
// Timings are frames at 30 fps and copy the reference reel (editor/estilo.md, editor/recreacion/ESCALETA.md).

export const FPS = 30;
export const TOTAL = 278; // 9.27 s = exactly one pass of the reference audio (never looped)

export const COLORS = {
  title: "#F6D7E3", // pink/lilac sampled from the reference title
  labelBg: "rgba(236,236,236,0.92)",
  labelBorder: "rgba(0,0,0,0.06)",
  labelText: "#1A1A1A",
};

export const FONTS = {
  title: { family: "Fraunces", file: "fonts/Fraunces-full.woff2", weight: 900, variation: '"SOFT" 100, "WONK" 0, "opsz" 144' },
  label: { family: "Montserrat", file: "fonts/Montserrat-500-italic.woff2", weight: 500 },
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
    // 2 · 2.47-3.57 s (beat to beat): detail — she pulls the drawstring
    src: "recreacion/IMG_8491.mp4",
    from: 74,
    frames: 33,
    startFrom: 102, // source 3.40 s
    zoom: [[0, 2.0], [33, 2.06]] as [number, number][],
    origin: [[0, 31, 65], [33, 31, 65]] as [number, number, number][],
  },
  {
    // 3 · 3.57-7.77 s: back on the main take (hair, hands in pockets), fast push at 5.30-5.55 s like the reference, then medium: hand to hair
    src: "recreacion/IMG_8492.mp4",
    from: 107,
    frames: 126,
    startFrom: 110, // source 3.67 s (same clock as shot 1: source = output + 0.1 s)
    zoom: [[0, 1.52], [52, 1.52], [60, 1.85], [126, 1.92]] as [number, number][],
    fastPush: [52, 60],
    origin: [[0, 15, 100], [52, 15, 100], [60, 22, 90], [126, 22, 90]] as [number, number, number][],
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

/** Editorial labels: only visible, verifiable facts about the garment, lowercase like the reference (brand keeps its spelling).
 *  pos = [fromFrame, x, y][]: re-pinned to the garment after a cut. */
export const LABELS = [
  { text: "cordón ajustable", from: 76, to: 107, pos: [[76, 560, 1560]] }, // on the drawstring detail
  { text: "bolsillos laterales", from: 140, to: 159, pos: [[140, 400, 1180]] }, // hands in pockets, before the push
  { text: "RE:SET", from: 180, to: 278, pos: [[180, 540, 960], [233, 540, 1300]] }, // 6.0 s, as the reference's brand tag
  { text: "manga larga", from: 219, to: 278, pos: [[219, 790, 860], [233, 830, 1520]] }, // 7.3 s
  { text: "cuello redondo", from: 233, to: 278, pos: [[233, 560, 1080]] }, // 7.78 s, with the cut
];

// Audio of the reference reel (requested by the client). Its commercial licence is NOT verified.
export const MUSIC: string | null = "recreacion/music.wav";
export const LOGO: string | null = null; // the real RE:SET wall sign is in shot; set "brand/reset-logo-black.png" to add a discreet bug
