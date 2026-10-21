import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

/*
 * RE:SET — editorial sleepwear sheet + campaign moodboard (recreation of an Instagram carousel layout).
 * Scene A: "sleepwear collection" design sheet with hand-drawn annotations.
 * Scene B: lifestyle moodboard with the set as the centrepiece.
 * Product: Petal Essential Button Set For Her (official resetwear.com.mx imagery).
 */

for (const [w, s] of [
  [400, "normal"],
  [500, "normal"],
  [400, "italic"],
  [500, "italic"],
] as const) {
  loadFont({
    family: "Bodoni Moda",
    url: staticFile(`fonts/bodoni-moda-latin-${w}-${s}.woff2`),
    weight: String(w),
    style: s,
  });
}
const SERIF = "'Bodoni Moda', 'Playfair Display', Georgia, serif";
const INK = "#1b1917";
const SHEET_BG = "#C6BFB1"; // sampled from the reference sheet

export const EDITORIAL_FPS = 30;
const A_END = 150; // sheet holds until here
const SWIPE = 16; // carousel swipe, like the reference
const B_START = A_END;
const CLOSE = 282;
export const EDITORIAL_TOTAL = 315;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const soft = Easing.bezier(0.25, 0.1, 0.25, 1);
const fade = (f: number, a: number, d = 12) => interpolate(f, [a, a + d], [0, 1], { ...clamp, easing: soft });

/* ---------- product placement (cutout 1047 x 1334 px) ---------- */
const SET_W = 1047;
const SET_H = 1334;
const A_SCALE = 0.6747;
const A_X = 240;
const A_Y = 640;
const ap = (x: number, y: number) => [A_X + x * A_SCALE, A_Y + y * A_SCALE] as const;

/* Annotations: every point targets a detail visible in the official flat-lay photo. */
type Note = {
  lines: string[];
  x: number;
  y: number;
  align: "left" | "right";
  path: string; // hand-drawn arrow, drawn on
  head: [number, number, number]; // arrow tip x, y, angle (deg)
};
const [collarX, collarY] = ap(290, 124);
const [cuffX, cuffY] = ap(40, 702);
const [btnX, btnY] = ap(381, 681);
const [waistX, waistY] = ap(856, 206);
const [pocketX, pocketY] = ap(984, 304);
const [legX, legY] = ap(531, 960);
const [hemX, hemY] = ap(956, 1318);

const NOTES: Note[] = [
  {
    lines: ["cuello con solapa", "y ribete"],
    x: 300, y: 560, align: "right",
    path: `M 312 600 C 350 560, 400 590, 395 640 C 392 672, 410 700, ${collarX - 8} ${collarY - 10}`,
    head: [collarX - 8, collarY - 10, 50],
  },
  {
    lines: ["puños con", "ribete"],
    x: 236, y: 1180, align: "right",
    path: `M 246 1196 C 270 1196, 286 1180, 282 1166 C 278 1150, 262 1150, ${cuffX + 4} ${cuffY + 18}`,
    head: [cuffX + 4, cuffY + 18, -100],
  },
  {
    lines: ["botones al frente"],
    x: 300, y: 1236, align: "left",
    path: `M 390 1230 C 384 1200, 410 1176, 430 1186 C 452 1198, 440 1222, 424 1210 C 414 1190, 460 1140, ${btnX - 2} ${btnY + 16}`,
    head: [btnX - 2, btnY + 16, -60],
  },
  {
    lines: ["pretina con resorte", "y jareta"],
    x: 1050, y: 616, align: "right",
    path: `M 846 690 C 812 690, 790 708, 796 728 C 800 742, ${waistX - 14} 748, ${waistX - 10} ${waistY - 16}`,
    head: [waistX - 10, waistY - 16, 70],
  },
  {
    lines: ["bolsillo", "lateral"],
    x: 950, y: 905, align: "left",
    path: `M 960 900 C 948 884, 930 876, ${pocketX + 22} ${pocketY + 22}`,
    head: [pocketX + 22, pocketY + 22, -140],
  },
  {
    lines: ["pantalón de", "corte relajado"],
    x: 300, y: 1360, align: "left",
    path: `M 482 1372 C 512 1372, 540 1350, 556 1336 C 568 1326, 580 1318, ${legX - 10} ${legY + 6}`,
    head: [legX - 10, legY + 6, -30],
  },
  {
    lines: ["terminación abierta,", "sin resorte en el tobillo"],
    x: 1030, y: 1616, align: "right",
    path: `M 748 1626 C 722 1616, 718 1590, 738 1582 C 758 1574, 774 1590, 790 1582 C 812 1570, 832 1562, ${hemX - 30} ${hemY + 18}`,
    head: [hemX - 30, hemY + 18, -20],
  },
];

const Arrow: React.FC<{ note: Note; p: number }> = ({ note, p }) => {
  const [hx, hy, ang] = note.head;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={note.path} pathLength={1} fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round"
        strokeDasharray={1} strokeDashoffset={1 - p} />
      <g transform={`translate(${hx} ${hy}) rotate(${ang})`} opacity={p > 0.97 ? 1 : 0}>
        <path d="M 0 0 L -13 -7 M 0 0 L -13 7" stroke={INK} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

const NoteText: React.FC<{ note: Note; o: number }> = ({ note, o }) => (
  <div
    style={{
      position: "absolute",
      top: note.y,
      ...(note.align === "left" ? { left: note.x } : { right: 1080 - note.x }),
      textAlign: note.align,
      fontFamily: SERIF,
      fontSize: 29,
      lineHeight: 1.02,
      letterSpacing: -0.3,
      color: INK,
      opacity: o,
      transform: `translateY(${(1 - o) * 6}px)`,
      whiteSpace: "nowrap",
    }}
  >
    {note.lines.map((l) => (
      <div key={l}>{l}</div>
    ))}
  </div>
);

/* ---------- Scene A: editorial sheet ---------- */
const Sheet: React.FC<{ f: number }> = ({ f }) => {
  const t1 = fade(f, 2, 16);
  const t2 = fade(f, 10, 16);
  const g = fade(f, 18, 22);
  const tail = fade(f, 104, 16);
  return (
    <AbsoluteFill style={{ background: SHEET_BG }}>
      <div style={{ position: "absolute", top: 262, width: "100%", textAlign: "center", color: INK, fontFamily: SERIF }}>
        <div style={{ fontSize: 92, fontWeight: 400, letterSpacing: -2.5, lineHeight: 1, opacity: t1, transform: `translateY(${(1 - t1) * 10}px)` }}>
          sleepwear collection
        </div>
        <div style={{ fontSize: 88, fontStyle: "italic", fontWeight: 500, letterSpacing: -2, lineHeight: 1, marginTop: 4, opacity: t2, transform: `translateY(${(1 - t2) * 10}px)` }}>
          Set Petal
        </div>
      </div>
      <Img
        src={staticFile("editorial/petal-set.png")}
        style={{
          position: "absolute",
          left: A_X,
          top: A_Y,
          width: SET_W * A_SCALE,
          height: SET_H * A_SCALE,
          opacity: g,
          transform: `translateY(${(1 - g) * 14}px) scale(${1.015 - 0.015 * g})`,
          filter: "drop-shadow(0 10px 14px rgba(60,48,36,0.16)) drop-shadow(0 2px 3px rgba(60,48,36,0.10))",
        }}
      />
      {NOTES.map((n, i) => {
        const s = 44 + i * 8;
        const p = interpolate(f, [s, s + 14], [0, 1], { ...clamp, easing: soft });
        return (
          <React.Fragment key={i}>
            <Arrow note={n} p={p} />
            <NoteText note={n} o={fade(f, s + 6, 10)} />
          </React.Fragment>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 1532,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: 58,
          lineHeight: 1.04,
          letterSpacing: -1.2,
          color: INK,
          opacity: tail,
          transform: `translateY(${(1 - tail) * 8}px)`,
        }}
      >
        Una forma
        <br />
        más ligera
        <br />
        de descansar…
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scene B: campaign moodboard ---------- */
const QUADS = [
  { src: "editorial/q-tl.jpg", l: 0, t: 0, w: 540, h: 1070 },
  { src: "editorial/q-tr.jpg", l: 540, t: 0, w: 540, h: 1070 },
  { src: "editorial/q-bl.jpg", l: 0, t: 1070, w: 540, h: 850 },
  { src: "editorial/q-br.jpg", l: 540, t: 1070, w: 540, h: 850 },
];
const B_SET_W = 760;

const Moodboard: React.FC<{ f: number }> = ({ f }) => {
  const k = f - B_START;
  const drift = interpolate(k, [0, CLOSE - B_START], [1, 1.035], clamp);
  const float = Math.sin(k / 22) * 3;
  return (
    <AbsoluteFill style={{ background: "#2b2622", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        {QUADS.map((q) => (
          <Img
            key={q.src}
            src={staticFile(q.src)}
            style={{ position: "absolute", left: q.l, top: q.t, width: q.w, height: q.h, objectFit: "cover", filter: "saturate(0.55) brightness(0.86) contrast(0.96)" }}
          />
        ))}
        {/* moody greige wash, as in the reference */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(38,32,27,0.50) 0%, rgba(38,32,27,0.30) 40%, rgba(38,32,27,0.38) 100%)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 236, width: "100%", textAlign: "center", color: "#fff", fontFamily: SERIF }}>
        <div style={{ fontSize: 132, fontWeight: 400, letterSpacing: 2, lineHeight: 1, textTransform: "uppercase" }}>Soft Touch</div>
        <div style={{ fontSize: 112, fontStyle: "italic", fontWeight: 400, lineHeight: 1, letterSpacing: -2, marginTop: 6, paddingLeft: 280 }}>pijamas</div>
      </div>
      <Img
        src={staticFile("editorial/reset-bag-dune.png")}
        style={{
          position: "absolute",
          left: 58,
          top: 1418 + float * 0.6,
          width: 300,
          transform: "rotate(-7deg)",
          filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.30))",
        }}
      />
      <Img
        src={staticFile("editorial/petal-set.png")}
        style={{
          position: "absolute",
          left: (1080 - B_SET_W) / 2 + 30,
          top: 560 + float,
          width: B_SET_W,
          filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.32)) drop-shadow(0 3px 5px rgba(0,0,0,0.18))",
        }}
      />
      <Img
        src={staticFile("brand/reset-logo-white.png")}
        style={{ position: "absolute", left: (1080 - 230) / 2, top: 1716, width: 230, opacity: 0.95 }}
      />
    </AbsoluteFill>
  );
};

/* ---------- closing identity card ---------- */
const Close: React.FC<{ f: number }> = ({ f }) => {
  const o = fade(f, CLOSE, 14);
  const l = fade(f, CLOSE + 6, 14);
  return (
    <AbsoluteFill style={{ background: SHEET_BG, opacity: o, alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 520, opacity: l, transform: `translateY(${(1 - l) * 8}px)` }} />
      <div style={{ marginTop: 46, fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: INK, opacity: l, letterSpacing: -0.5 }}>
        Set Petal
      </div>
    </AbsoluteFill>
  );
};

export const PetalEditorial: React.FC = () => {
  const f = useCurrentFrame();
  // carousel swipe: the moodboard slides in from the left, the sheet exits right
  const s = interpolate(f, [A_END - SWIPE / 2, A_END + SWIPE / 2], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  return (
    <AbsoluteFill style={{ background: SHEET_BG }}>
      <Audio src={staticFile("editorial/music.wav")} />
      {s < 1 && (
        <AbsoluteFill style={{ transform: `translateX(${s * 1080}px)` }}>
          <Sheet f={f} />
        </AbsoluteFill>
      )}
      {s > 0 && (
        <AbsoluteFill style={{ transform: `translateX(${(s - 1) * 1080}px)` }}>
          <Moodboard f={f} />
        </AbsoluteFill>
      )}
      {f >= CLOSE && <Close f={f} />}
    </AbsoluteFill>
  );
};
