// RE:SET — "La Navidad empieza cuando mis cajones se ven así…" (Christmas drawer story).
// Everything editable lives here. Frames at 30 fps. Audio = the reference reel's track ("Santa Claus Is Comin' to Town"),
// taken from 1.02 s of the screen recording (its first downbeat) for 12.1 s: output t = audio t − 1.02.
// Beats every ~0.42 s; the strongest accent (audio 3.37 s) lands at frame 70 (2.35 s) = the drawer finishing its pull.

export const FPS = 30;
export const TOTAL = 363; // 12.1 s, ends on "…comin' to town"

export const COLORS = {
  ink: "#2A2422", // warm near-black for the serif on the white drawer/wall
  light: "#FFFDFB",
};

export const FONTS = {
  serif: "Cormorant Garamond",
  sans: "Montserrat",
};

/** Shots (colour-matched SDR intermediates in public/cajon). zoom: [frame, scale][]; origin: [frame, x%, y%][] — linear. */
export const SHOTS = [
  // Only the front/above takes (IMG_2122, 2124, 2125): the drawer always reads horizontal, the sets side by side.
  {
    // 1-2 · 0.00-3.27 s: closed drawer -> the pull (IMG_2122 1.6-2.75 s) ends on the accent (frame 70) showing the three sets
    name: "apertura",
    src: "cajon/IMG_2122.mp4",
    from: 0,
    frames: 98,
    startFrom: 12, // source 0.40 s
    zoom: [[0, 1.12], [70, 1.16], [98, 1.19]] as [number, number][],
    origin: [[0, 50, 55], [98, 50, 58]] as [number, number, number][],
    // soft local exposure lift (dodge) over the phone's shadow on the white bag once the drawer is open: [frame, x, y][]
    dodge: { from: 58, rx: 250, ry: 280, gain: 1.6, path: [[58, 720, 1240], [80, 700, 1195], [98, 690, 1260]] as [number, number, number][] },
  },
  {
    // 3a · 3.27-4.17 s: green gingerbread print (IMG_2124 0.0-0.9 s)
    name: "verde",
    src: "cajon/IMG_2124.mp4",
    from: 98,
    frames: 27,
    startFrom: 0,
    zoom: [[0, 1.95], [27, 2.0]] as [number, number][], // tight on the fabric: no drawer edge in frame
    origin: [[0, 96, 45], [27, 96, 45]] as [number, number, number][],
  },
  {
    // 3b · 4.17-5.03 s: white print with the printed RE:SET, upper half above the phone shadow (IMG_2125 5.0 s)
    name: "blanco",
    src: "cajon/IMG_2125.mp4",
    from: 125,
    frames: 26,
    startFrom: 150,
    zoom: [[0, 2.1], [26, 2.16]] as [number, number][], // >= 2.1 keeps the shadow below the frame
    origin: [[0, 60, 0], [26, 60, 0]] as [number, number, number][],
  },
  {
    // 3c · 5.03-5.87 s: red Nordic print, framed on its upper half above the phone shadow (IMG_2125 5.83 s)
    name: "rojo",
    src: "cajon/IMG_2125.mp4",
    from: 151,
    frames: 25,
    startFrom: 175, // source 5.83 s: continues the white shot's glide onto the red
    zoom: [[0, 2.05], [25, 2.1]] as [number, number][], // keeps the shadow below the frame
    origin: [[0, 82, 0], [25, 82, 0]] as [number, number, number][],
  },
  {
    // 3d · 5.87-6.70 s: the camera glides in over the gingerbread print (IMG_2125 2.45 s), upper part, above the shadow
    name: "verde-mov",
    src: "cajon/IMG_2125.mp4",
    from: 176,
    frames: 25,
    startFrom: 74,
    zoom: [[0, 1.4], [25, 1.46]] as [number, number][],
    origin: [[0, 35, 30], [25, 35, 30]] as [number, number, number][],
  },
  {
    // 4 · 6.70-9.17 s: hero — the three sets side by side from the front (IMG_2122 3.67 s), gentle pan; hand cropped out
    name: "hero",
    src: "cajon/IMG_2122.mp4",
    from: 201,
    frames: 74,
    startFrom: 110,
    zoom: [[0, 1.36], [74, 1.4]] as [number, number][],
    origin: [[0, 50, 20], [74, 50, 20]] as [number, number, number][],
    dodge: { from: 0, rx: 280, ry: 300, gain: 1.25, path: [[0, 640, 1380], [74, 640, 1380]] as [number, number, number][] },
  },
  {
    // 5 · 9.17-12.1 s: the drawer closes (IMG_2125 6.65-9.58 s): it slides shut and is closed at 11.29 s, on a beat
    name: "cierre",
    src: "cajon/IMG_2125.mp4",
    from: 275,
    frames: 88,
    startFrom: 200, // source 6.65 s
    zoom: [[0, 1.12], [88, 1.16]] as [number, number][],
    origin: [[0, 50, 40], [88, 50, 40]] as [number, number, number][],
  },
];

export const TEXT = {
  line1: { text: "La Navidad empieza cuando…", from: 6, top: 300 },
  line2: { text: "…mis cajones se ven así.", emoji: "🎄", from: 70 }, // on the accent, as the drawer finishes opening
  textOut: 96, // both lines leave just before the first detail cut (frame 98)
  brand: { from: 304, top: 260, logo: "brand/reset-logo-black.png" }, // 10.13 s, on "Santa Claus…", over the white wall as the drawer shuts
  cta: { text: "Descubre nuestras pijamas de Navidad", from: 314 }, // 10.47 s, next beat
};

export const MUSIC = "cajon/music.wav"; // reference audio — commercial licence NOT verified: internal / organic use only
