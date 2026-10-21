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
    // 2 · 2.47-4.80 s (cut on the beat): full body during the dialogue "can I please scan your outfit? … I guess so"
    src: "recreacion/IMG_8491.mp4",
    from: 74,
    frames: 70,
    startFrom: 59, // source 1.97 s
    zoom: [[0, 1.36], [70, 1.4]] as [number, number][], // >= 1.33 keeps the wall sign wholly out of frame
    origin: [[0, 0, 100], [70, 0, 100]] as [number, number, number][],
  },
  {
    // 3 · 4.80-9.27 s: one steady take so the tags stay readable. Full body for the scan (4.80-6.0 s),
    //     fast push ending exactly on the first click-pum (6.26 s), then medium while the tags pile up.
    src: "recreacion/IMG_8492.mp4",
    from: 144,
    frames: 134,
    startFrom: 85, // source 2.83 s: the hits land while she stands still (4.3-6.6 s) and lifts a hand to her hair, before she turns away
    zoom: [[0, 1.46], [36, 1.46], [44, 1.85], [134, 1.9]] as [number, number][], // 1.46 keeps the wall sign out
    fastPush: [36, 44],
    origin: [[0, 25, 100], [36, 25, 100], [44, 22, 90], [134, 22, 90]] as [number, number, number][],
  },
];

/** Audio cues (reference audio): dialogue by Whisper word times, hits by percussive-onset analysis.
 *  "I guess so" ends 4.76 s -> the scan runs 4.80-5.93 s; two soft clicks at 5.54 / 5.75 s blink the viewfinder.
 *  Five click+pum doubles (a ~5.5 kHz click, then the low pum 0.11 s later) at 6.26 · 6.76 · 7.45 · 8.11 · 8.85 s. */
export const SCAN = {
  box: { x: 320, y: 440, w: 440, h: 1400 }, // around her full body in shot 3 before the push
  bracketsIn: 144,
  sweep: [146, 178] as [number, number],
  clicks: [166, 172], // soft clicks: the viewfinder blinks
  out: [178, 186] as [number, number],
};

export const PUMPS = [188, 203, 223, 243, 265]; // frames of the five click+pum hits
export const FINALE = 265; // last click+pum: every tag bounces together

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
 *  One pops on each click+pum and they all stay to the end so they can be read. */
export const LABELS = [
  { text: "RE:SET", from: 188, to: 278, pos: [[188, 540, 960]] }, // click-pum 1 — chest
  { text: "cuello redondo", from: 203, to: 278, pos: [[203, 560, 760]] }, // click-pum 2 — neckline
  { text: "manga larga", from: 223, to: 278, pos: [[223, 800, 1080]] }, // click-pum 3 — sleeve
  { text: "cordón ajustable", from: 243, to: 278, pos: [[243, 600, 1460]] }, // click-pum 4 — drawstring
];

// Audio of the reference reel (requested by the client). Its commercial licence is NOT verified.
export const MUSIC: string | null = "recreacion/music.wav";
export const LOGO: string | null = null; // the real RE:SET wall sign is in shot; set "brand/reset-logo-black.png" to add a discreet bug
