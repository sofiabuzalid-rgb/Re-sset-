import { loadFont } from "@remotion/fonts";
import React, { createContext, CSSProperties, useContext } from "react";
import { AbsoluteFill, Audio, Easing, Freeze, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StoreBlock } from "../campana/shared";
import { CLIP_DUR, FPS } from "./config";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Playfair", url: staticFile("fonts/PlayfairDisplay-Variable.woff2"), weight: "400 900" });
loadFont({ family: "Playfair", url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"), weight: "400 900", style: "italic" });

export const C = { ink: "#141414", ivory: "#FFFBF2", lime: "#E2EC95", shade: "rgba(20,20,20,0.82)" };
/** Reels/Stories safe area: nothing important above 250 px, below 1540 px or closer than 72 px to the sides */
export const SAFE = { top: 250, bottom: 1540, x: 72 };
export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const outE = Easing.out(Easing.cubic);
export const overE = Easing.bezier(0.34, 1.56, 0.64, 1);
const SH = "0 4px 30px rgba(0,0,0,0.45)";

/* ---------- beat clock + segment length ---------- */
const BeatCtx = createContext(0.5);
const SegCtx = createContext(30);
export const BeatProvider: React.FC<{ B: number; children: React.ReactNode }> = ({ B, children }) => <BeatCtx.Provider value={B}>{children}</BeatCtx.Provider>;
export const useBeat = () => {
  const B = useContext(BeatCtx);
  return { B, f: (b: number) => Math.round(b * B * FPS) };
};
export const useSeg = () => useContext(SegCtx);

/** a block of the edit between two beats; `pre` starts it a few frames early so it can slide over the previous one */
export const At: React.FC<{ b0: number; b1: number; pre?: number; children: React.ReactNode }> = ({ b0, b1, pre = 0, children }) => {
  const { f } = useBeat();
  const from = f(b0) - pre;
  const d = f(b1) - from;
  return (
    <Sequence from={from} durationInFrames={d} layout="none">
      <SegCtx.Provider value={d}>{children}</SegCtx.Provider>
    </Sequence>
  );
};

/* ---------- footage ---------- */
export type Cell = { src: string; at: number; z?: [number, number]; o?: [number, number]; rot?: number };

/** one clip, frame-exact: time is remapped by hand so speed ramps and freeze frames are just maths */
export const Vid: React.FC<{ src: string; at: number; rate?: number; ramp?: [number, number]; hold?: number; style?: CSSProperties }> = ({ src, at, rate = 1, ramp, hold = 0, style }) => {
  const f = useCurrentFrame();
  const d = useSeg();
  const g = Math.max(0, f - hold);
  const s = ramp ? ramp[0] * g + ((ramp[1] - ramp[0]) * g * g) / (2 * d) : rate * g;
  const sf = Math.max(0, Math.min(Math.floor((CLIP_DUR[src] ?? 2) * FPS) - 2, Math.round(at * FPS + s)));
  return (
    <Freeze frame={sf}>
      <OffthreadVideo muted src={staticFile(`outlet4/${src}.mp4`)} style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />
    </Freeze>
  );
};

/** directional (horizontal / vertical) motion-blur filters for whips and pushes */
export const BlurDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      {[1, 2, 3, 4].map((i) => (
        <filter key={i} id={`hb${i}`} x="-30%" y="0" width="160%" height="100%">
          <feGaussianBlur stdDeviation={`${i * 16} 0`} />
        </filter>
      ))}
      {[1, 2, 3, 4].map((i) => (
        <filter key={i} id={`vb${i}`} x="0" y="-30%" width="100%" height="160%">
          <feGaussianBlur stdDeviation={`0 ${i * 16}`} />
        </filter>
      ))}
    </defs>
  </svg>
);

export type Fx = "cut" | "zoom" | "whip" | "whipL" | "push" | "snap" | "flash";

/** a full-frame shot with Ken Burns and its transition in/out:
 *  zoom = zoom-blur in, whip = horizontal whip with motion blur, push = vertical push, snap = snap zoom, flash = white flash;
 *  out "zoom" pairs with the next shot's zoom-in into one zoom-blur transition */
export const Shot: React.FC<
  Cell & { rate?: number; ramp?: [number, number]; hold?: number; fin?: Fx; fout?: "zoom" | "whip"; dim?: number; flip?: boolean; grade?: string; children?: React.ReactNode }
> = ({ src, at, z = [1.0, 1.07], o = [50, 50], rot = 0, rate, ramp, hold, fin = "cut", fout, dim = 0, flip, grade = "", children }) => {
  const f = useCurrentFrame();
  const d = useSeg();
  const zoom = interpolate(f, [0, d], z, { ...cl, easing: Easing.inOut(Easing.quad) });
  let s = 1;
  let tx = 0;
  let ty = 0;
  let blur = 0;
  let bright = 1;
  let hb = 0;
  let vb = 0;
  if (fin === "zoom") {
    const k = interpolate(f, [0, 7], [1, 0], { ...cl, easing: outE });
    s *= 1 + 0.38 * k;
    blur += 16 * k;
    bright += 0.3 * k;
  }
  if (fin === "snap") s *= 1 + 0.16 * interpolate(f, [0, 5], [1, 0], { ...cl, easing: outE });
  if (fin === "whip" || fin === "whipL") {
    const k = interpolate(f, [0, 6], [1, 0], { ...cl, easing: outE });
    tx = (fin === "whip" ? 1 : -1) * 1080 * k;
    hb = k;
  }
  if (fin === "push") {
    const k = interpolate(f, [0, 7], [1, 0], { ...cl, easing: outE });
    ty = 1920 * k;
    vb = k;
  }
  if (fout === "zoom") {
    const k = interpolate(f, [d - 5, d], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
    s *= 1 + 0.45 * k;
    blur += 16 * k;
    bright += 0.3 * k;
  }
  if (fout === "whip") {
    const k = interpolate(f, [d - 4, d], [0, 1], cl);
    tx -= 280 * k;
    hb = Math.max(hb, k);
  }
  const filter = [grade, blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "", bright !== 1 ? `brightness(${bright.toFixed(2)})` : "", hb > 0.05 ? `url(#hb${Math.ceil(hb * 4)})` : "", vb > 0.05 ? `url(#vb${Math.ceil(vb * 4)})` : ""]
    .filter(Boolean)
    .join(" ");
  const flash = fin === "flash" ? interpolate(f, [0, 5], [0.85, 0], cl) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${zoom * s}) rotate(${rot + (flip ? 180 : 0)}deg)`, transformOrigin: `${o[0]}% ${o[1]}%`, filter: filter || undefined }}>
        <Vid src={src} at={at} rate={rate} ramp={ramp} hold={hold} />
      </AbsoluteFill>
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(10,10,10,${dim})` }} />}
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash }} />}
      {children}
    </AbsoluteFill>
  );
};

/** freeze frame: the shot holds its first frame with a camera-flash, then plays on */
export const FreezeShot: React.FC<Cell & { holdF: number; fin?: Fx }> = ({ holdF, ...p }) => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 4], [0.9, 0], cl);
  const bump = 1 + 0.04 * interpolate(f, [0, holdF], [1, 0], { ...cl, easing: outE });
  return (
    <AbsoluteFill style={{ transform: `scale(${bump})` }}>
      <Shot {...p} hold={holdF} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ---------- multi-frame layouts ---------- */
const CellView: React.FC<{ c: Cell; delay: number; d: number; flipIn?: boolean; instant?: boolean }> = ({ c, delay, d, flipIn, instant }) => {
  const f = useCurrentFrame();
  const p = instant ? 1 : interpolate(f, [delay, delay + 8], [0, 1], { ...cl, easing: overE });
  const z = interpolate(f, [0, d], c.z ?? [1.0, 1.09], cl);
  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%", opacity: Math.min(1, p * 1.6), transform: `scale(${0.82 + 0.18 * p}) translateY(${(flipIn ? -1 : 1) * (1 - p) * 60}px)` }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${(c.o ?? [50, 50])[0]}% ${(c.o ?? [50, 50])[1]}%` }}>
        <Vid src={c.src} at={c.at} />
      </AbsoluteFill>
    </div>
  );
};

/** 2×2 product grid; cells pop in on a stagger (or are there from the first frame with `instant`) and drift; `hi` outlines one cell (frame → index, -1 = none) */
export const Grid4: React.FC<{ cells: Cell[]; stagger?: number; gap?: number; hi?: (f: number) => number; instant?: boolean }> = ({ cells, stagger = 4, gap = 8, hi, instant }) => {
  const f = useCurrentFrame();
  const d = useSeg();
  const h = hi ? hi(f) : -1;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ivory, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap, padding: gap, transform: `scale(${interpolate(f, [0, d], [1, 1.04], cl)})` }}>
      {cells.slice(0, 4).map((c, k) => (
        <div key={k} style={{ position: "relative", outline: h === k ? `8px solid ${C.lime}` : "none", outlineOffset: -8, zIndex: h === k ? 2 : 1 }}>
          <CellView c={c} delay={k * stagger} d={d} instant={instant} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** three vertical panels, each drifting in the opposite direction to its neighbour */
export const Split3: React.FC<{ cells: Cell[]; stagger?: number }> = ({ cells, stagger = 3 }) => {
  const f = useCurrentFrame();
  const d = useSeg();
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "row", gap: 8 }}>
      {cells.slice(0, 3).map((c, k) => {
        const p = interpolate(f, [k * stagger, k * stagger + 9], [0, 1], { ...cl, easing: outE });
        const drift = interpolate(f, [0, d], k % 2 ? [50, -50] : [-50, 50], cl);
        return (
          <div key={k} style={{ flex: 1, position: "relative", overflow: "hidden", transform: `translateY(${(k % 2 ? -1 : 1) * (1 - p) * 1920}px)` }}>
            <AbsoluteFill style={{ transform: `translateY(${drift}px) scale(1.12)` }}>
              <Vid src={c.src} at={c.at} />
            </AbsoluteFill>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export type Card = Cell & { b: number; x: number; y: number; w: number; h: number; r?: number; depth?: number };

/** fashion collage: framed product cards land on the beat over a blurred backdrop, with a little parallax */
export const Collage: React.FC<{ bg?: Cell; bgColor?: string; cards: Card[]; frame?: string }> = ({ bg, bgColor = C.ivory, cards, frame = C.ivory }) => {
  const f = useCurrentFrame();
  const { f: bf } = useBeat();
  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      {bg && (
        <AbsoluteFill style={{ filter: "blur(26px) brightness(0.62)", transform: "scale(1.2)" }}>
          <Vid src={bg.src} at={bg.at} />
        </AbsoluteFill>
      )}
      {cards.map((c, k) => {
        const s = bf(c.b);
        const landed = cards.filter((x) => bf(x.b) <= f).length;
        if (f < s - 1 || k < landed - 6) return null; // cards buried under six newer ones are not drawn
        const p = interpolate(f, [s, s + 9], [0, 1], { ...cl, easing: overE });
        const drift = -(f - s) * 0.5 * (c.depth ?? 1);
        return (
          <div
            key={k}
            style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, padding: 10, background: frame, boxShadow: "0 24px 60px rgba(0,0,0,0.35)", opacity: Math.min(1, p * 1.8), transform: `translateY(${(1 - p) * 260 + drift}px) rotate(${(c.r ?? 0) + (1 - p) * 6}deg) scale(${0.9 + 0.1 * p})` }}
          >
            <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
              <Sequence from={s} layout="none">
                <AbsoluteFill style={{ transform: `scale(${1.06 + 0.0012 * (f - s)})`, transformOrigin: `${(c.o ?? [50, 50])[0]}% ${(c.o ?? [50, 50])[1]}%` }}>
                  <Vid src={c.src} at={c.at} />
                </AbsoluteFill>
              </Sequence>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** a giant number used as a window onto whatever is inside it; `grow` (frames) blows it up until the content fills the frame
 *  (the clip is dropped once the number is big enough to cover the screen, so the content is never rendered twice) */
export const Mask25: React.FC<{ id: string; text?: string; size?: number; cy?: number; grow?: [number, number]; enter?: number; children: React.ReactNode }> = ({ id, text = "25", size = 900, cy = 880, grow, enter = 0, children }) => {
  const f = useCurrentFrame();
  const g = grow ? interpolate(f, [grow[0], grow[1]], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) }) : 0;
  const pin = interpolate(f, [enter, enter + 10], [0, 1], { ...cl, easing: outE });
  const sc = (0.86 + 0.14 * pin) * (1 + g * 16);
  const open = grow !== undefined && f >= grow[1];
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <clipPath id={id} clipPathUnits="userSpaceOnUse">
            <text x={540} y={cy + size * 0.36} textAnchor="middle" fontFamily="Playfair" fontWeight={900} fontSize={size} letterSpacing={-size * 0.04} transform={`translate(540 ${cy}) scale(${sc}) translate(-540 ${-cy})`}>
              {text}
            </text>
          </clipPath>
        </defs>
      </svg>
      <AbsoluteFill style={{ clipPath: open ? undefined : `url(#${id})`, opacity: pin, filter: g > 0.2 && !open ? `blur(${(g * 8).toFixed(1)}px)` : undefined }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** soft dark band behind a line of type over busy footage */
export const Shade: React.FC<{ top: number; h: number; o?: number }> = ({ top, h, o = 0.55 }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, height: h, background: `linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,${o}) 22%, rgba(10,10,10,${o}) 78%, rgba(10,10,10,0) 100%)` }} />
);

/** ivory card for questions / asides */
export const Note: React.FC<{ top: number; children: React.ReactNode; size?: number }> = ({ top, children, size = 84 }) => {
  const f = useCurrentFrame();
  const d = useSeg();
  const p = interpolate(f, [0, 8], [0, 1], { ...cl, easing: overE });
  const o = interpolate(f, [d - 5, d], [1, 0], cl);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: C.ivory, color: C.ink, fontFamily: "Playfair", fontStyle: "italic", fontWeight: 600, fontSize: size, padding: "18px 44px 26px", boxShadow: "0 20px 60px rgba(0,0,0,0.35)", transform: `scale(${0.7 + 0.3 * p}) rotate(${(1 - p) * -4}deg)`, opacity: Math.min(1, p * 1.6) }}>{children}</div>
    </div>
  );
};

/* ---------- phone + chat (original UI, not any real app) ---------- */
export const Phone: React.FC<{ x?: number; y?: number; w?: number; h?: number; scale?: number; origin?: string; children: React.ReactNode }> = ({ x = 220, y = 300, w = 640, h = 1220, scale = 1, origin = "50% 50%", children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 92, background: "#0d0d0d", padding: 16, boxShadow: "0 40px 120px rgba(0,0,0,0.55), inset 0 0 0 3px #2a2a2a", transform: `scale(${scale})`, transformOrigin: origin }}>
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 78, overflow: "hidden", background: "#F4F1EA" }}>
      {children}
      <div style={{ position: "absolute", top: 20, left: "50%", width: 190, height: 52, marginLeft: -95, borderRadius: 30, background: "#0d0d0d" }} />
    </div>
  </div>
);

export type Msg = { b: number; side: "in" | "out"; text: string; link?: { src: string; at: number; title: string; domain: string } };

const Typing: React.FC<{ show: boolean }> = ({ show }) => {
  const f = useCurrentFrame();
  if (!show) return null;
  return (
    <div style={{ alignSelf: "flex-start", background: "#fff", borderRadius: 40, padding: "28px 34px", display: "flex", gap: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: "#9a968d", transform: `translateY(${Math.sin((f / 3 + i) * 1.4) * 4}px)` }} />
      ))}
    </div>
  );
};

/** a chat thread: header, bubbles that pop in on their beat, typing dots before each incoming message, optional link-preview card */
export const Chat: React.FC<{ msgs: Msg[]; name: string; typing: number[]; tap?: number }> = ({ msgs, name, typing, tap }) => {
  const f = useCurrentFrame();
  const { f: bf } = useBeat();
  const shown = msgs.filter((m) => f >= bf(m.b));
  const isTyping = typing.some((b, k) => f >= bf(b) && f < bf(msgs.filter((m) => m.side === "in")[k]?.b ?? b));
  const tapF = tap !== undefined ? f - bf(tap) : -1;
  return (
    <AbsoluteFill style={{ fontFamily: "Montserrat" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 220, background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #e4e0d6", display: "flex", alignItems: "flex-end", padding: "0 36px 24px", gap: 22 }}>
        <div style={{ fontSize: 56, color: "#6d6a63", marginBottom: 6 }}>‹</div>
        <div style={{ width: 86, height: 86, borderRadius: 43, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 40, color: C.ink }}>{name[0]}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 40, color: C.ink }}>{name}</div>
          <div style={{ fontWeight: 500, fontSize: 26, color: "#8a867d" }}>en línea</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 240, left: 26, right: 26, bottom: 30, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 20 }}>
        {shown.map((m, k) => {
          const s = bf(m.b);
          const p = interpolate(f, [s, s + 7], [0, 1], { ...cl, easing: overE });
          const out = m.side === "out";
          return (
            <div key={k} style={{ alignSelf: out ? "flex-end" : "flex-start", maxWidth: "82%", transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 30}px)`, transformOrigin: out ? "right bottom" : "left bottom", opacity: Math.min(1, p * 2) }}>
              {m.link && (
                <div style={{ background: "#fff", borderRadius: "40px 40px 0 0", overflow: "hidden", width: 600, boxShadow: "0 4px 14px rgba(0,0,0,0.06)", outline: tapF >= 0 && tapF < 12 ? `5px solid ${C.lime}` : "none" }}>
                  <div style={{ position: "relative", width: 600, height: 320, overflow: "hidden" }}>
                    <Sequence from={s} layout="none">
                      <Vid src={m.link.src} at={m.link.at} />
                    </Sequence>
                  </div>
                  <div style={{ padding: "18px 30px 6px" }}>
                    <div style={{ fontWeight: 800, fontSize: 34, color: C.ink }}>{m.link.title}</div>
                    <div style={{ fontWeight: 500, fontSize: 28, color: "#8a867d", marginTop: 4 }}>{m.link.domain}</div>
                  </div>
                </div>
              )}
              <div style={{ background: out ? C.lime : "#fff", color: C.ink, fontWeight: 600, fontSize: 46, lineHeight: 1.22, padding: "22px 32px", borderRadius: m.link ? "0 0 40px 40px" : out ? "40px 40px 10px 40px" : "40px 40px 40px 10px", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", width: m.link ? 600 : undefined, boxSizing: "border-box" }}>
                {m.text}
              </div>
            </div>
          );
        })}
        <Typing show={isTyping} />
      </div>
      {tapF >= 0 && tapF < 14 && (
        <div style={{ position: "absolute", left: 281, top: 595, width: 90, height: 90, borderRadius: 45, border: "6px solid rgba(20,20,20,0.6)", transform: `scale(${0.5 + tapF * 0.08})`, opacity: interpolate(tapF, [0, 13], [1, 0], cl) }} />
      )}
    </AbsoluteFill>
  );
};

/* ---------- type ---------- */
export const T = {
  mega: { fontFamily: "Montserrat", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 0.92, textTransform: "uppercase" as const, color: C.ivory, textShadow: SH },
  serif: { fontFamily: "Playfair", fontStyle: "italic" as const, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.05, color: C.ivory, textShadow: SH },
  didone: { fontFamily: "Playfair", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.86, color: C.ivory },
  kicker: { fontFamily: "Montserrat", fontWeight: 700, letterSpacing: "0.34em", textTransform: "uppercase" as const, color: C.ivory, textShadow: SH },
};

/** words rise out of a mask one after another; `exit` (frames before the segment ends) slides them away */
export const Words: React.FC<{ text: string; style: CSSProperties; delay?: number; step?: number; exit?: number; center?: boolean }> = ({ text, style, delay = 0, step = 3, exit = 5, center = true }) => {
  const f = useCurrentFrame();
  const d = useSeg();
  const o = interpolate(f, [d - exit, d], [1, 0], cl);
  const lines = text.split("\n");
  let w = 0;
  return (
    <div style={{ textAlign: center ? "center" : "left", opacity: o, ...style }}>
      {lines.map((ln, li) => (
        <div key={li}>
          {ln.split(" ").map((word, wi) => {
            const k = w++;
            const p = interpolate(f, [delay + k * step, delay + k * step + 8], [0, 1], { ...cl, easing: outE });
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em", marginRight: "0.22em" }}>
                <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 105}%)` }}>{word}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** a positioned text block inside the safe area */
export const Block: React.FC<{ top: number; children: React.ReactNode; style?: CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", top, left: SAFE.x, right: SAFE.x, display: "flex", flexDirection: "column", alignItems: "center", ...style }}>{children}</div>
);

/** quiet "25% OFF" tag in the top-right corner (inside the safe area) */
export const Tag25: React.FC<{ from?: number }> = ({ from = 0 }) => {
  const f = useCurrentFrame() - from;
  const p = interpolate(f, [0, 8], [0, 1], { ...cl, easing: overE });
  return <div style={{ position: "absolute", top: 262, right: SAFE.x + 8, background: C.lime, color: C.ink, fontFamily: "Montserrat", fontWeight: 800, fontSize: 34, letterSpacing: "0.02em", padding: "10px 22px", borderRadius: 999, opacity: Math.min(1, p * 1.5), transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: "right top" }}>25% OFF</div>;
};

/** endless band of repeated copy */
export const Ticker: React.FC<{ text: string; top: number; size?: number; bg?: string; fg?: string; speed?: number; rot?: number }> = ({ text, top, size = 64, bg = C.ink, fg = C.ivory, speed = 0.9, rot = 0 }) => {
  const f = useCurrentFrame();
  const x = (f * speed) % 50;
  const unit = Array.from({ length: 6 }, () => text).join("   ·   ") + "   ·   ";
  return (
    <div style={{ position: "absolute", top, left: -60, right: -60, background: bg, overflow: "hidden", transform: `rotate(${rot}deg)`, padding: `${size * 0.28}px 0` }}>
      <div style={{ display: "flex", width: "max-content", transform: `translateX(-${x}%)` }}>
        {[0, 1].map((k) => (
          <div key={k} style={{ whiteSpace: "nowrap", fontFamily: "Montserrat", fontWeight: 900, fontSize: size, letterSpacing: "-0.01em", color: fg, paddingRight: "0.4em" }}>{unit}</div>
        ))}
      </div>
    </div>
  );
};

/** warm light leak across a cut (screen blend) */
export const Leak: React.FC<{ at: number; len?: number }> = ({ at, len = 12 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > len) return null;
  const p = f / len;
  return <AbsoluteFill style={{ mixBlendMode: "screen", opacity: Math.sin(Math.PI * p) * 0.75, background: `radial-gradient(60% 45% at ${20 + 70 * p}% ${30 + 25 * p}%, rgba(255,170,90,0.95), rgba(255,90,60,0.35) 45%, rgba(0,0,0,0) 75%)`, pointerEvents: "none" }} />;
};

/** camera shake (alarm) */
export const Shake: React.FC<{ from: number; to: number; amp?: number; children: React.ReactNode }> = ({ from, to, amp = 14, children }) => {
  const f = useCurrentFrame();
  const on = f >= from && f < to;
  const x = on ? Math.sin(f * 2.9) * amp : 0;
  const y = on ? Math.cos(f * 3.7) * amp * 0.6 : 0;
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${on ? Math.sin(f * 2.1) * 0.6 : 0}deg)` }}>{children}</AbsoluteFill>;
};

/** the closing card: dimmed footage, headline lines, logo, store addresses and web */
export const EndCard: React.FC<{ children: React.ReactNode; logoTop?: number; storeTop?: number }> = ({ children, logoTop = 820, storeTop = 1010 }) => {
  const f = useCurrentFrame();
  const a = (s: number) => interpolate(f, [s, s + 10], [0, 1], { ...cl, easing: outE });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(14,14,14,0.62)", opacity: a(0) }} />
      {children}
      <Img src={staticFile("brand/reset-logo-white.png")} style={{ position: "absolute", top: logoTop, left: "50%", width: 360, marginLeft: -180, opacity: a(8), transform: `translateY(${(1 - a(8)) * 16}px)` }} />
      <div style={{ position: "absolute", top: storeTop, left: 0, right: 0 }}>
        <StoreBlock delay={12} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- sound ---------- */
export const Sfx: React.FC<{ b: number; name: string; vol?: number; off?: number }> = ({ b, name, vol = 0.5, off = 0 }) => {
  const { f } = useBeat();
  return (
    <Sequence from={Math.max(0, f(b) + off)} durationInFrames={60} layout="none">
      <Audio src={staticFile(`outlet4/audio/sfx_${name}.wav`)} volume={vol} />
    </Sequence>
  );
};

export const Music: React.FC<{ src: string; startS: number; total: number }> = ({ src, startS, total }) => (
  <Audio src={staticFile(src)} startFrom={Math.round(startS * FPS)} volume={(fr) => interpolate(fr, [total - 10, total], [1, 0], cl)} />
);
