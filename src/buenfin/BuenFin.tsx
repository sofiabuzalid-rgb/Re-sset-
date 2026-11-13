import { loadFont } from "@remotion/fonts";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import edit from "./buenfin.json";

loadFont({
  family: "Bebas Neue",
  url: staticFile("fonts/BebasNeue-Regular.woff2"),
  weight: "400",
});
loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
loadFont({
  family: "Playfair Display",
  url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"),
  weight: "400 900",
  style: "italic",
});

// Bebas Neue is the RE:SET logotype face; Montserrat stands in for Gotham.
const DISPLAY = '"Bebas Neue", Montserrat, sans-serif';
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const SERIF = '"Playfair Display", Georgia, serif';
const C = {
  surface: "#EFE6DA",
  paper: "#FBF7F0",
  ink: "#1C1A17",
  pine: "#0E2A1E",
  cranberry: "#B3122E",
  gold: "#C9A45C",
};
const RED = staticFile("buenfin/print-red.jpg");
const GREEN = staticFile("buenfin/print-green.jpg");
const BEAT = 15;
export const BUENFIN_TOTAL = edit.total;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));
const PAPER_SHADOW =
  "0 1px 1px rgba(40,25,10,0.10), 0 8px 18px rgba(40,25,10,0.20), 0 26px 48px rgba(40,25,10,0.18)";
// fine paper grain (SVG noise), multiplied over every paper surface
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.30  0 0 0 0.55 0"/></filter><rect width="240" height="240" filter="url(#n)"/></svg>',
)}")`;

const useSpring = (from: number, cfg = { damping: 14, mass: 0.7 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - from, fps, config: cfg });
};

const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.35 }) => (
  <AbsoluteFill
    style={{
      backgroundImage: GRAIN,
      mixBlendMode: "multiply",
      opacity,
      pointerEvents: "none",
    }}
  />
);

/** A sheet of paper: cream stock or a pajama print, with real-feeling light and shadow. */
const Paper: React.FC<{
  w: number;
  h: number;
  print?: string;
  radius?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ w, h, print, radius = 6, shadow = true, style, children }) => (
  <div
    style={{
      position: "absolute",
      width: w,
      height: h,
      borderRadius: radius,
      background: print
        ? `url(${print}) center / cover`
        : `linear-gradient(160deg, #FFFCF6 0%, ${C.paper} 45%, #F2EADF 100%)`,
      boxShadow: shadow ? PAPER_SHADOW : undefined,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(155deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.06) 100%)",
        pointerEvents: "none",
      }}
    />
    <Grain opacity={print ? 0.12 : 0.3} />
  </div>
);

const BuenFinWord: React.FC<{ size: number; color?: string }> = ({
  size,
  color = C.ink,
}) => (
  <div
    style={{
      fontFamily: DISPLAY,
      fontSize: size,
      lineHeight: 0.86,
      letterSpacing: "0.01em",
      color,
      textAlign: "center",
    }}
  >
    BUEN
    <br />
    FIN
  </div>
);

// ───────────────────────── scene 1 — the envelope (hook)
const Envelope: React.FC = () => {
  const f = useCurrentFrame();
  const land = useSpring(0, { damping: 13, mass: 0.6 });
  const y = interpolate(land, [0, 1], [-1500, 0]);
  const flap = interpolate(f, [12, 24], [0, 178], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const slide = interpolate(f, [20, 38], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.3, 0.7, 0.2, 1),
  });
  const lift = ramp(f, 38, 14); // card comes forward, envelope drops away
  const away = interpolate(f, [44, 60], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const EW = 800;
  const EH = 540;
  const cardOut = slide > 0.62;
  const card = (
    <div
      style={{
        position: "absolute",
        left: (EW - 700) / 2,
        // the card stays put while the envelope drops away, then zooms through the frame into the next scene
        top: 20 - slide * 470 - lift * 40 - away * 1300,
        width: 700,
        height: 470,
        transform: `scale(${1 + lift * 0.18 + away * away * 1.6}) rotate(${-1.5 + lift * 1.5}deg)`,
        zIndex: cardOut ? 5 : 2,
        opacity: (flap > 100 ? 1 : 0) * (1 - away * away),
      }}
    >
      <Paper w={700} h={470} radius={4}>
        <div
          style={{
            position: "absolute",
            inset: 22,
            border: `2px solid ${C.gold}`,
            borderRadius: 2,
          }}
        />
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 42,
              color: C.ink,
              marginBottom: 6,
            }}
          >
            Las pijamas RE:SET te invitan al
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 210,
              lineHeight: 0.9,
              color: C.pine,
              letterSpacing: "0.01em",
            }}
          >
            BUEN FIN
          </div>
        </AbsoluteFill>
      </Paper>
    </div>
  );
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: (1080 - EW) / 2,
          top: 900,
          width: EW,
          height: EH,
          perspective: 1600,
          transform: `translateY(${y + away * 1300}px) rotate(${-3 + land * 2}deg)`,
        }}
      >
        {/* back of the envelope, lined with the red nordic print */}
        <Paper w={EW} h={EH} radius={8} style={{ zIndex: 1 }}>
          <div
            style={{
              position: "absolute",
              inset: "0 0 40% 0",
              background: `url(${RED}) center / cover`,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              opacity: 0.95,
            }}
          />
        </Paper>
        {card}
        {/* front pocket */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            clipPath: "polygon(0 22%, 50% 62%, 100% 22%, 100% 100%, 0 100%)",
            borderRadius: 8,
            background: `linear-gradient(175deg, #F7F0E5 0%, #EFE5D6 100%)`,
            boxShadow: "inset 0 2px 0 rgba(255,255,255,0.5)",
          }}
        >
          <Grain opacity={0.3} />
        </div>
        {/* flap with the RE:SET seal; folds back over the top edge */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: EW,
            height: EH * 0.62,
            transformOrigin: "50% 0%",
            transform: `rotateX(${flap}deg)`,
            zIndex: flap > 90 ? 0 : 4,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background:
                flap > 90
                  ? `url(${RED}) center / cover`
                  : "linear-gradient(180deg, #F4ECDF 0%, #E9DDCB 100%)",
              filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.15))",
            }}
          />
          {flap < 90 ? (
            <div
              style={{
                position: "absolute",
                left: EW / 2 - 62,
                top: EH * 0.62 - 120,
                width: 124,
                height: 124,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, #8E1E2C 0%, ${C.cranberry} 45%, #6E0B19 100%)`,
                boxShadow: "0 4px 10px rgba(0,0,0,0.35), inset 0 0 0 6px rgba(0,0,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: DISPLAY,
                fontSize: 40,
                color: "#F6E7D2",
                letterSpacing: "0.04em",
              }}
            >
              RE:SET
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── scene 2 — invitations falling onto the floor (after the reference)
type FloorCard = { x: number; y: number; r: number; t: number; kind: "paper" | "red" | "green"; w: number; h: number };
const FLOOR: FloorCard[] = [
  { x: 330, y: 1640, r: -14, t: 54, kind: "paper", w: 560, h: 400 },
  { x: 1140, y: 1580, r: 10, t: 75, kind: "red", w: 520, h: 380 },
  { x: 760, y: 2040, r: -4, t: 90, kind: "paper", w: 600, h: 430 },
  { x: 240, y: 2380, r: 12, t: 105, kind: "green", w: 540, h: 390 },
  { x: 1230, y: 2310, r: -9, t: 120, kind: "paper", w: 560, h: 400 },
];

const FloorSheet: React.FC<{ c: FloorCard }> = ({ c }) => {
  const s = useSpring(c.t, { damping: 15, mass: 0.55 });
  const z = interpolate(s, [0, 1], [1100, 0]);
  const shadow = interpolate(s, [0, 1], [0, 1], clamp);
  const label = (
    <div
      style={{
        position: "absolute",
        inset: c.kind === "paper" ? 0 : "22% 18%",
        background: c.kind === "paper" ? "transparent" : C.paper,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: c.kind === "paper" ? undefined : "0 2px 6px rgba(0,0,0,0.25)",
      }}
    >
      <BuenFinWord size={c.kind === "paper" ? 150 : 104} color={c.kind === "paper" ? C.ink : C.pine} />
    </div>
  );
  if (c.t > useCurrentFrame() + 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: c.x - c.w / 2,
        top: c.y - c.h / 2,
        width: c.w,
        height: c.h,
        transform: `translateZ(${z}px) rotate(${c.r + (1 - s) * 18}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateZ(${-z}px) translate(${18 + z * 0.08}px, ${22 + z * 0.1}px)`,
          background: "rgba(40,25,10,0.35)",
          filter: `blur(${10 + z * 0.04}px)`,
          opacity: shadow * 0.8,
          borderRadius: 6,
        }}
      />
      <Paper w={c.w} h={c.h} print={c.kind === "red" ? RED : c.kind === "green" ? GREEN : undefined} radius={4} shadow={false}>
        {label}
      </Paper>
    </div>
  );
};

const Floor: React.FC<{ blur: number }> = ({ blur }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [60, 270], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ perspective: 1500, filter: blur ? `blur(${blur}px)` : undefined }}>
      <div
        style={{
          position: "absolute",
          left: (1080 - 2400) / 2,
          top: -1000,
          width: 2400,
          height: 3300,
          transformStyle: "preserve-3d",
          transform: `rotateX(${46 - p * 6}deg) rotateZ(${-5 + p * 6}deg) translateY(${-p * 120}px) scale(${1 + p * 0.1})`,
          background: `radial-gradient(ellipse 70% 60% at 50% 45%, #F3EBE0 0%, ${C.surface} 60%, #E2D6C6 100%)`,
        }}
      >
        <Grain opacity={0.4} />
        {FLOOR.map((c) => (
          <FloorSheet key={c.t} c={{ ...c, x: c.x + 450 }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── scene 3 — the tent card: 15% OFF
const TentCard: React.FC = () => {
  const f = useCurrentFrame();
  const up = useSpring(0, { damping: 11, mass: 0.6 });
  const rot = interpolate(up, [0, 1], [88, 0]);
  const beat = f > 30 ? Math.exp(-((f - 30) % BEAT) / 4) * 0.012 : 0; // a light pulse on every beat
  const out = interpolate(f, [92, 108], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 540 - 380,
          top: 1290,
          width: 760,
          height: 80,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(40,25,10,0.45) 0%, rgba(40,25,10,0) 70%)",
          opacity: up * (1 - out),
          transform: `scaleX(${0.6 + up * 0.4})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - 390,
          top: 700,
          width: 780,
          height: 620,
          perspective: 1400,
          transform: `translateY(${-out * 1500}px) scale(${1 + beat})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "50% 100%",
            transform: `rotateX(${rot}deg)`,
          }}
        >
          <Paper w={780} h={620} radius={6}>
            <div style={{ position: "absolute", inset: 26, border: `2px solid ${C.gold}`, borderRadius: 2 }} />
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 30,
                  letterSpacing: "0.32em",
                  color: C.cranberry,
                  marginBottom: 10,
                }}
              >
                BUEN FIN · RE:SET
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 238,
                  lineHeight: 0.86,
                  color: C.ink,
                  letterSpacing: "0.005em",
                  whiteSpace: "nowrap",
                }}
              >
                {edit.offer.pct} {edit.offer.off}
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 38,
                  letterSpacing: "0.22em",
                  color: C.pine,
                  textTransform: "uppercase",
                }}
              >
                {edit.offer.scope}
              </div>
            </AbsoluteFill>
          </Paper>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── scene 4 — product invitations: the terrace card holds two beats, then one card per beat
const PRODUCTS = edit.products.map((p) => p.id);
const dealAt = (i: number) => 8 + (i === 0 ? 0 : 30 + (i - 1) * BEAT);
export const PRODUCTS_LEN = dealAt(PRODUCTS.length - 1) + 30;
const ProductCard: React.FC<{ clip: string; i: number }> = ({ clip, i }) => {
  const f = useCurrentFrame();
  const t0 = dealAt(i);
  const enter = useSpring(t0, { damping: 15, mass: 0.7 });
  // how many cards were dealt on top of this one (smooth); only the top three stay visible in the stack
  const k = PRODUCTS.reduce(
    (n, _, j) => (j > i ? n + spring({ frame: f - dealAt(j), fps: 30, config: { damping: 15, mass: 0.7 } }) : n),
    0,
  );
  const kk = Math.min(k, 3);
  const x = interpolate(enter, [0, 1], [1250, 0]) - kk * 46;
  const y = -kk * 38;
  const r = interpolate(enter, [0, 1], [22, i % 2 ? 2.5 : -2.5]) - kk * 3.5;
  if (f < t0 - 1 || k > 3.98) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 350,
        top: 560,
        width: 700,
        height: 960,
        transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${1 - kk * 0.035})`,
        filter: `brightness(${1 - kk * 0.1})`,
        opacity: interpolate(k, [3, 3.9], [1, 0], clamp),
        zIndex: i,
      }}
    >
      <Paper w={700} h={960} radius={8}>
        <div
          style={{
            position: "absolute",
            left: 32,
            top: 32,
            width: 636,
            height: 770,
            borderRadius: "318px 318px 14px 14px",
            overflow: "hidden",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
          }}
        >
          <OffthreadVideo
            muted
            src={staticFile(`buenfin/clip-${clip}.mp4`)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 34,
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: 70,
            letterSpacing: "0.04em",
            color: C.pine,
          }}
        >
          BUEN FIN
        </div>
      </Paper>
    </div>
  );
};

const PrintBackdrop: React.FC<{ print: string; from: "bottom" | "top"; dark: number }> = ({ print, from, dark }) => {
  const s = useSpring(0, { damping: 18, mass: 0.6 });
  const y = interpolate(s, [0, 1], [from === "bottom" ? 2000 : -2000, 0]);
  return (
    <AbsoluteFill style={{ transform: `translateY(${y}px)` }}>
      <AbsoluteFill style={{ background: `url(${print}) center / cover`, transform: "scale(1.15)" }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 70% at 50% 50%, rgba(10,6,3,${dark * 0.6}) 0%, rgba(10,6,3,${dark}) 100%)`,
        }}
      />
      <Grain opacity={0.15} />
    </AbsoluteFill>
  );
};

const Products: React.FC = () => {
  return (
    <AbsoluteFill>
      <PrintBackdrop print={RED} from="bottom" dark={0.45} />
      {PRODUCTS.map((c, i) => (
        <ProductCard key={c} clip={c} i={i} />
      ))}
    </AbsoluteFill>
  );
};

// ───────────────────────── scene 5 — the final invitation (CTA)
const TUCKED = [
  { x: -120, y: 260, r: -18, print: RED, t: 0 },
  { x: 760, y: 140, r: 14, print: GREEN, t: 3 },
  { x: -160, y: 1350, r: 12, print: GREEN, t: 6 },
  { x: 780, y: 1420, r: -10, print: RED, t: 9 },
];
const PineBackdrop: React.FC = () => {
  const s = useSpring(0, { damping: 18, mass: 0.6 });
  return (
    <AbsoluteFill style={{ transform: `translateY(${interpolate(s, [0, 1], [-2000, 0])}px)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 65% at 50% 45%, #17402E 0%, ${C.pine} 55%, #061710 100%)` }} />
      <Grain opacity={0.25} />
      {TUCKED.map((c) => (
        <TuckedCard key={c.t} {...c} />
      ))}
    </AbsoluteFill>
  );
};
const TuckedCard: React.FC<{ x: number; y: number; r: number; print: string; t: number }> = ({ x, y, r, print, t }) => {
  const s = useSpring(6 + t, { damping: 14, mass: 0.6 });
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${r + (1 - s) * 20}deg) scale(${0.6 + s * 0.4})`, opacity: s }}>
      <Paper w={440} h={320} print={print} radius={4} />
    </div>
  );
};
const FinalInvitation: React.FC = () => {
  const f = useCurrentFrame();
  const s = useSpring(4, { damping: 14, mass: 0.7 });
  const item = (k: number) => {
    const p = ramp(f, 10 + k * 7, 14);
    return { opacity: p, transform: `translateY(${(1 - p) * 18}px)` } as React.CSSProperties;
  };
  const pulse = f > 60 ? 1 + Math.exp(-((f - 60) % (BEAT * 2)) / 5) * 0.025 : 1;
  return (
    <AbsoluteFill>
      <PineBackdrop />
      <div
        style={{
          position: "absolute",
          left: 540 - 420,
          top: 330,
          width: 840,
          height: 1220,
          transform: `translateY(${interpolate(s, [0, 1], [1500, 0])}px) rotate(${interpolate(s, [0, 1], [8, -1])}deg)`,
        }}
      >
        <Paper w={840} h={1220} radius={8}>
          <div style={{ position: "absolute", inset: 28, border: `2px solid ${C.gold}` }} />
          <div style={{ position: "absolute", inset: 38, border: `1px solid ${C.gold}`, opacity: 0.6 }} />
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 110, flexDirection: "column", textAlign: "center" }}>
            <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 330, ...item(0) }} />
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: C.ink, marginTop: 40, ...item(1) }}>
              te invita al
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 200, lineHeight: 0.9, color: C.pine, ...item(2) }}>BUEN FIN</div>
            <div style={{ width: 120, height: 2, background: C.gold, margin: "26px 0 18px", ...item(3) }} />
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 230,
                lineHeight: 0.86,
                color: C.cranberry,
                ...item(3),
                transform: `${item(3).transform} scale(${pulse})`,
              }}
            >
              {edit.offer.pct} {edit.offer.off}
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 36,
                letterSpacing: "0.22em",
                color: C.ink,
                textTransform: "uppercase",
                marginTop: 14,
                ...item(4),
              }}
            >
              {edit.offer.scope}
            </div>
          </AbsoluteFill>
        </Paper>
      </div>
    </AbsoluteFill>
  );
};

export const BuenFin: React.FC = () => {
  const f = useCurrentFrame();
  const floorBlur = interpolate(f, [135, 151], [0, 7], clamp);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 65% at 50% 45%, #F5EEE4 0%, ${C.surface} 65%, #DFD2C1 100%)`,
      }}
    >
      <Grain opacity={0.35} />
      <Sequence durationInFrames={66}>
        <Img
          src={staticFile("brand/reset-logo-black.png")}
          style={{ position: "absolute", left: 540 - 130, top: 250, width: 260, opacity: 0.9 }}
        />
        <Envelope />
      </Sequence>
      <Sequence durationInFrames={250}>
        <AbsoluteFill style={{ opacity: interpolate(f, [56, 64], [0, 1], clamp) }}>
          <Floor blur={floorBlur} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={135} durationInFrames={110}>
        <TentCard />
      </Sequence>
      <Sequence from={225} durationInFrames={PRODUCTS_LEN + 12}>
        <Products />
      </Sequence>
      <Sequence from={225 + PRODUCTS_LEN + 6}>
        <FinalInvitation />
      </Sequence>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 90% 75% at 50% 50%, rgba(0,0,0,0) 65%, rgba(30,18,8,0.22) 100%)",
          pointerEvents: "none",
        }}
      />
      <Audio src={staticFile("buenfin/mix.wav")} />
    </AbsoluteFill>
  );
};
