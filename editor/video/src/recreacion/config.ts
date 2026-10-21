// Everything replaceable in the "outfit of the day" recreation lives here.
// Timings are frames at 30 fps and copy the reference reel (editor/estilo.md, editor/recreacion/ESCALETA.md).

export const FPS = 30;
export const TOTAL = 278; // 9.27 s, the reference loop length

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
  { text: "RE:SET", from: 180, pos: [[180, 540, 960], [233, 500, 1200]] }, // 6.0 s, centre of the top (the reference shows the brand handle here)
  { text: "manga larga", from: 219, pos: [[219, 790, 860], [233, 860, 1250]] }, // 7.3 s, on the sleeve
  { text: "cordón ajustable", from: 233, pos: [[233, 560, 1560]] }, // 7.78 s, with the cut, at the drawstring
];

export const MUSIC: string | null = null; // e.g. "recreacion/music.mp3" once a licensed ~117 BPM track is supplied
export const LOGO: string | null = null; // the real RE:SET wall sign is in shot; set "brand/reset-logo-black.png" to add a discreet bug
