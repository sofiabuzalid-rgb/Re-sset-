// Everything replaceable in the "outfit of the day" recreation lives here.
// Timings are frames at 30 fps and copy the reference reel (editor/estilo.md, editor/recreacion/ESCALETA.md).

export const FPS = 30;
export const TOTAL = 422; // 14.07 s: the 9.27 s reference structure + 3 detail shots + an exit ending

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
    // A+B: one continuous take like the reference — wide entrance, fast push at 5.30 s, slow creep to 7.78 s
    src: "recreacion/IMG_8492.mp4",
    from: 0,
    frames: 233,
    startFrom: 3, // source 0.10 s: empty wall, she walks in at ~0.4 s
    zoom: [[0, 1.52], [159, 1.52], [167, 1.85], [233, 1.92]] as [number, number][],
    fastPush: [159, 167],
    // framed head-to-thigh like the reference (1.52 with origin y 100% keeps the wall sign wholly out of frame, never half-cut). Origin x 88% -> 15% is the camera following her in from the right
    // (88% keeps the pink curtain edge on the right of the source out of frame); then the push re-centres on her.
    origin: [[0, 88, 100], [8, 88, 100], [45, 15, 100], [159, 15, 100], [167, 22, 90], [233, 22, 90]] as [number, number, number][], // [frame, x%, y%]
  },
  {
    // C: hard cut on the beat (7.78 s) to the closer shot: her hands on the drawstring (touching the garment)
    src: "recreacion/IMG_8491.mp4",
    from: 233,
    frames: 45,
    startFrom: 102, // source 3.40 s
    zoom: [[0, 2.0], [45, 2.06]] as [number, number][],
    origin: [[0, 31, 65], [45, 31, 65]] as [number, number, number][],
  },
  // Detail shots (extension), 2 beats each at the reference tempo. origin = (0.5 - focus * zoom) / (1 - zoom).
  {
    // D1: crew neck and chest, she smiles to camera
    src: "recreacion/IMG_8491.mp4",
    from: 278,
    frames: 33,
    startFrom: 66, // source 2.20 s
    zoom: [[0, 2.0], [33, 2.08]] as [number, number][],
    origin: [[0, 40, 66], [33, 40, 66]] as [number, number, number][],
  },
  {
    // D2: hands in the side pockets
    src: "recreacion/IMG_8492.mp4",
    from: 311,
    frames: 30,
    startFrom: 147, // source 4.90 s
    zoom: [[0, 2.4], [30, 2.48]] as [number, number][],
    origin: [[0, 43, 100], [30, 43, 100]] as [number, number, number][],
  },
  {
    // D3: she holds the hem of the top: the two pieces together
    src: "recreacion/IMG_8492.mp4",
    from: 341,
    frames: 31,
    startFrom: 60, // source 2.00 s
    zoom: [[0, 2.0], [31, 2.08]] as [number, number][],
    origin: [[0, 42, 74], [31, 42, 74]] as [number, number, number][],
  },
  {
    // D4: ending — hair flip and she walks out, leaving the real RE:SET wall sign in frame
    src: "recreacion/IMG_8491.mp4",
    from: 372,
    frames: 50,
    startFrom: 204, // source 6.80 s: ends at 8.47 s on the empty wall (she re-enters at ~8.7 s)
    zoom: [[0, 1.0], [50, 1.04]] as [number, number][],
    origin: [[0, 50, 30], [50, 50, 30]] as [number, number, number][],
  },
];

export const TITLE = {
  lines: ["outfit", "of the", "day"],
  x: 520, // centre x of the block on 1080 (measured on the reference)
  tops: [505, 775, 1045], // top of each line (reference: line centres at 31 / 45 / 59 % of the height)
  size: 228,
  holdUntil: 9, // starts drifting at 0.3 s
  exitEnd: 36, // gone by 1.2 s
  exitDx: 1150, // the camera pans with her (she walks in from the right toward centre), so the wall — and the title — slide out right, as in the reference
};

/** Editorial labels: only visible, verifiable facts about the garment. pos = [fromFrame, x, y][]: re-pinned after the cut. */
export const LABELS = [
  { text: "RE:SET", from: 180, to: 278, pos: [[180, 540, 960], [233, 500, 1200]] }, // 6.0 s, centre of the top (the reference shows the brand handle here)
  { text: "manga larga", from: 219, to: 278, pos: [[219, 790, 860], [233, 860, 1250]] }, // 7.3 s, on the sleeve
  { text: "cordón ajustable", from: 233, to: 278, pos: [[233, 560, 1560]] }, // 7.78 s, with the cut, at the drawstring
  { text: "cuello redondo", from: 278, to: 311, pos: [[278, 520, 1000]] },
  { text: "bolsillos laterales", from: 311, to: 341, pos: [[311, 760, 980]] },
  { text: "conjunto de 2 piezas", from: 341, to: 372, pos: [[341, 540, 1270]] },
];

export const MUSIC: string | null = null; // e.g. "recreacion/music.mp3" once a licensed ~117 BPM track is supplied
export const LOGO: string | null = null; // the real RE:SET wall sign is in shot; set "brand/reset-logo-black.png" to add a discreet bug
