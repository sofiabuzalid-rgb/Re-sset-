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
    // 3a · 3.27-4.17 s: green gingerbread print, top-down, clean light (IMG_2124 0.0-0.9 s)
    name: "verde",
    src: "cajon/IMG_2124.mp4",
    from: 98,
    frames: 27,
    startFrom: 0,
    zoom: [[0, 1.5], [27, 1.56]] as [number, number][],
    origin: [[0, 82, 42], [27, 82, 42]] as [number, number, number][],
  },
  {
    // 3b · 4.17-5.03 s: white print with the RE:SET lettering, from the clean overhead take (IMG_2123), slow drift down
    name: "blanco",
    src: "cajon/IMG_2123.mp4",
    from: 125,
    frames: 26,
    startFrom: 102, // source 3.40 s
    zoom: [[0, 1.85], [26, 1.85]] as [number, number][],
    origin: [[0, 58, 40], [26, 58, 50]] as [number, number, number][],
  },
  {
    // 3c · 5.03-5.87 s: red Nordic print, framed on its upper half (above the phone shadow) as the camera glides (IMG_2125 6.3 s)
    name: "rojo",
    src: "cajon/IMG_2125.mp4",
    from: 151,
    frames: 25,
    startFrom: 189,
    zoom: [[0, 1.7], [25, 1.75]] as [number, number][],
    origin: [[0, 82, 0], [25, 82, 0]] as [number, number, number][],
  },
  {
    // 3d · 5.87-6.70 s: fabric + brand — the printed RE:SET where the green meets the white, from the clean overhead take
    name: "marca",
    src: "cajon/IMG_2123.mp4",
    from: 176,
    frames: 25,
    startFrom: 240, // source 8.00 s
    zoom: [[0, 2.0], [25, 2.0]] as [number, number][],
    origin: [[0, 74, 30], [25, 82, 30]] as [number, number, number][],
  },
  {
    // 3e · 6.70-7.57 s: the camera glides in over the gingerbread print (IMG_2125 2.45 s), upper part, above the shadow
    name: "verde-mov",
    src: "cajon/IMG_2125.mp4",
    from: 201,
    frames: 26,
    startFrom: 74,
    zoom: [[0, 1.4], [26, 1.46]] as [number, number][],
    origin: [[0, 35, 30], [26, 35, 30]] as [number, number, number][],
  },
  {
    // 4 · 7.57-10.03 s: hero — the three sets in the drawer from above (IMG_2123), centred on the drawer, slow push
    name: "hero",
    src: "cajon/IMG_2123.mp4",
    from: 227,
    frames: 74,
    startFrom: 135, // source 4.50 s
    zoom: [[0, 1.14], [74, 1.2]] as [number, number][],
    origin: [[0, 40, 47], [74, 40, 47]] as [number, number, number][],
  },
  {
    // 5 · 10.03-12.1 s: back to the front view of the open drawer (bookends the reveal), clean white wall above for the sign-off
    name: "cierre",
    src: "cajon/IMG_2122.mp4",
    from: 301,
    frames: 62,
    startFrom: 110, // source 3.67 s, right where the reveal shot left off
    zoom: [[0, 1.36], [62, 1.4]] as [number, number][], // tight enough that the hand on the handle stays out of frame
    origin: [[0, 50, 20], [62, 50, 20]] as [number, number, number][],
    dodge: { from: 0, rx: 280, ry: 300, gain: 1.25, path: [[0, 640, 1380], [62, 640, 1380]] as [number, number, number][] },
  },
];

export const TEXT = {
  line1: { text: "La Navidad empieza cuando…", from: 6, top: 300 },
  line2: { text: "…mis cajones se ven así.", emoji: "🎄", from: 70 }, // on the accent, as the drawer finishes opening
  textOut: 96, // both lines leave just before the first detail cut (frame 98)
  brand: { from: 304, top: 300, logo: "brand/reset-logo-black.png" }, // 10.13 s, on "Santa Claus…", over the white wall
  cta: { text: "Descubre nuestras pijamas de Navidad", from: 314 }, // 10.47 s, next beat
};

export const MUSIC = "cajon/music.wav"; // reference audio — commercial licence NOT verified: internal / organic use only
