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
  staticFile,
  useCurrentFrame,
} from "remotion";
import edit from "./buenfin15-creative.json";
import subsJson from "./buenfin15-creative.subs.json";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Playfair Display", url: staticFile("fonts/PlayfairDisplay-Variable.woff2"), weight: "400 900" });
loadFont({
  family: "Playfair Display",
  url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"),
  weight: "400 900",
  style: "italic",
});
// Two families only: a contemporary sans (Montserrat, standing in for Gotham) and an editorial serif (Playfair).
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const SERIF = '"Playfair Display", Georgia, serif';
const CREAM = "#F2EBDF";
const INK = "#1C1917";
const RED = "#C8202F";
const DIR = "buenfin15-creative";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const ramp = (f: number, a: number, d: number) => easeOut(Math.min(1, Math.max(0, (f - a) / d)));
const SOFT = "0 0 2px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.55), 0 4px 20px rgba(0,0,0,0.45)";

type Shot = { id: string; frames: number; zoom: number[]; focus: number[]; freeze?: unknown };
type Win = { from: number; to: number; rect: number[]; in: number; out: number };
type G = { kind: string; from: number; to: number; [k: string]: unknown };
type Sub = { from: number; to: number; text: string; pos?: string };

const E = edit as unknown as { shots: Shot[]; windows: Win[]; graphics: G[]; punch: number[] };
const SUBS = subsJson as Sub[];
export const CREATIVE_TOTAL = E.shots.reduce((n, s) => n + s.frames, 0);

let acc = 0;
const SHOTS = E.shots.map((s) => {
  const o = { ...s, from: acc };
  acc += s.frames;
  return o;
});

/** 0 = full screen, 1 = inside the window rect (eased in and out). */
const windowAt = (f: number) => {
  for (const w of E.windows) {
    if (f >= w.from && f < w.to) {
      const p = Math.min(ramp(f, w.from, w.in), easeOut(Math.min(1, (w.to - f) / w.out)));
      return { p, rect: w.rect };
    }
  }
  return { p: 0, rect: [0, 0, 1080, 1920] };
};

// ───────────────────────── picture
const ShotView: React.FC<{ s: Shot & { from: number } }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  let z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  for (const at of E.punch) {
    const d = s.from + f - at;
    if (d >= 0 && d < 24) z *= 1 + 0.07 * Math.exp(-d / 5);
  }
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
    transform: `scale(${z})`,
    transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
  };
  return s.freeze ? (
    <Img src={staticFile(`${DIR}/${s.id}.jpg`)} style={style} />
  ) : (
    <OffthreadVideo muted src={staticFile(`${DIR}/${s.id}.mp4`)} style={style} />
  );
};

/** The video layer: full bleed, or shrunk into an editorial window over cream. */
const Picture: React.FC = () => {
  const f = useCurrentFrame();
  const { p, rect } = windowAt(f);
  const [x, y, w, h] = [0, 0, 1080, 1920].map((v, i) => v + (rect[i] - v) * p);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        overflow: "hidden",
        borderRadius: 10 * p,
        boxShadow: p > 0 ? `0 ${24 * p}px ${60 * p}px rgba(60,40,20,${0.28 * p})` : undefined,
      }}
    >
      {SHOTS.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={15}>
          <AbsoluteFill>
            <ShotView s={s} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </div>
  );
};

// ───────────────────────── type primitives
/** A line that rises out of its own mask. */
const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; d?: number }> = ({
  at,
  children,
  style,
  d = 9,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, d);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.06em" }}>
      <div style={{ transform: `translateY(${(1 - p) * 105}%)`, opacity: Math.min(1, p * 3), ...style }}>{children}</div>
    </div>
  );
};

/** Exit: everything in a graphic slides up and fades over the last frames. */
const useExit = (dur: number, n = 6) => {
  const f = useCurrentFrame();
  const q = interpolate(f, [dur - n, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return { opacity: 1 - q, transform: `translateY(${-q * 40}px)` } as React.CSSProperties;
};

const sans = (size: number, color = INK, weight = 900, ls = "-0.03em"): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: weight,
  fontSize: size,
  color,
  letterSpacing: ls,
  lineHeight: 0.95,
  whiteSpace: "nowrap",
});
const serif = (size: number, color = INK): React.CSSProperties => ({
  fontFamily: SERIF,
  fontStyle: "italic",
  fontWeight: 500,
  fontSize: size,
  color,
  lineHeight: 1.0,
  whiteSpace: "nowrap",
});
const kicker = (color = RED): React.CSSProperties => ({ ...sans(30, color, 700, "0.32em"), lineHeight: 1.2 });

// ───────────────────────── graphics
/** Editorial page header: a cream wash behind the big type, so the words never fight the store's wall lettering. */
const Wash: React.FC<{ dur: number; h: number }> = ({ dur, h }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 5, dur - 6, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        background: `linear-gradient(180deg, rgba(242,235,223,0.95) 0px, rgba(242,235,223,0.92) ${h - 220}px, rgba(242,235,223,0) ${h}px)`,
      }}
    />
  );
};
const Hook: React.FC<{ dur: number }> = ({ dur }) => (
  <>
  <Wash dur={dur} h={820} />
  <div style={{ position: "absolute", left: 70, top: 250, ...useExit(dur) }}>
    <Rise at={0}>
      <span style={sans(172)}>¿PIJAMAS</span>
    </Rise>
    <Rise at={3}>
      <span style={{ ...serif(128), marginRight: 22 }}>con</span>
      <span style={sans(138, RED)}>15% OFF?</span>
    </Rise>
    <Rise at={7}>
      <span style={{ ...kicker(INK), fontSize: 34 }}>BUEN FIN · RE:SET</span>
    </Rise>
  </div>
  </>
);

const Numeral: React.FC<{ n: string; dur: number }> = ({ n, dur }) => {
  const f = useCurrentFrame();
  const p = ramp(f, 0, 8);
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  return (
    <>
      <Wash dur={dur} h={1000} />
      <div style={{ position: "absolute", left: 90, top: 210, opacity: Math.min(1, p * 2) * out }}>
        <div style={{ ...kicker(), fontSize: 34, marginLeft: 20 }}>RAZÓN Nº</div>
        <div style={{ ...serif(780, RED), lineHeight: 0.8, transform: `scale(${1.25 - 0.25 * p})`, transformOrigin: "0% 0%" }}>{n}</div>
      </div>
    </>
  );
};

const Label: React.FC<{ text?: string; center?: boolean }> = ({ text, center }) =>
  text ? <div style={{ ...kicker(), fontSize: 28, marginBottom: 12, textAlign: center ? "center" : "left" }}>{text}</div> : null;

const Big15: React.FC<{ dur: number; subAt: number; label?: string }> = ({ dur, subAt, label }) => {
  const f = useCurrentFrame();
  const p = ramp(f, 0, 7);
  const s = 0.7 + 0.3 * Easing.out(Easing.back(1.6))(Math.min(1, f / 7));
  return (
    <>
    <Wash dur={dur} h={720} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", ...useExit(dur) }}>
      <Label text={label} center />
      <div style={{ ...sans(300, RED, 900, "-0.05em"), lineHeight: 0.85, opacity: Math.min(1, p * 2), transform: `scale(${s})` }}>15%</div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Rise at={subAt}>
          <span style={serif(88)}>de descuento</span>
        </Rise>
      </div>
    </div>
    </>
  );
};

const SerifLine: React.FC<{ dur: number; a: string; b: string; label?: string }> = ({ dur, a, b, label }) => (
  <>
  <Wash dur={dur} h={700} />
  <div style={{ position: "absolute", left: 70, top: 260, ...useExit(dur) }}>
    <Label text={label} />
    <Rise at={0}>
      <span style={serif(130)}>{a}</span>
    </Rise>
    <Rise at={3}>
      <span style={sans(118)}>{b}</span>
    </Rise>
  </div>
  </>
);

/** Window section: cream page, headline in her words, the family list set in the right-hand column. */
const Family: React.FC<{ dur: number; headAt: number[]; words: [string, number][]; from: number }> = ({ dur, headAt, words, from }) => {
  const f = useCurrentFrame();
  const page = Math.min(ramp(f, 0, 9), interpolate(f, [dur - 8, dur], [1, 0], clamp));
  return (
    <AbsoluteFill style={{ opacity: page }}>
      <div style={{ position: "absolute", left: 80, top: 250 }}>
        <div style={{ ...kicker(), fontSize: 28, marginBottom: 12, opacity: ramp(f, 2, 8) }}>RAZÓN Nº 2 DE 3</div>
        <Rise at={headAt[0] - from}>
          <span style={serif(104)}>Tallas para</span>
        </Rise>
        <Rise at={headAt[1] - from}>
          <span style={sans(92)}>TODA LA FAMILIA</span>
        </Rise>
      </div>
      <div style={{ position: "absolute", left: 712, top: 800 }}>
        {words.map(([w, at], i) => {
          const p = ramp(f, at - from, 7);
          return (
            <div
              key={w}
              style={{
                ...sans(i === 2 ? 70 : 66, i === 1 ? RED : INK),
                marginBottom: 46,
                opacity: Math.min(1, p * 2),
                transform: `translateX(${(1 - p) * 60}px)`,
              }}
            >
              {w}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Rush: React.FC<{ dur: number; at: number[]; from: number; label?: string }> = ({ dur, at, from, label }) => (
  <>
  <Wash dur={dur} h={880} />
  <div style={{ position: "absolute", left: 70, top: 260, ...useExit(dur, 5) }}>
    <Label text={label} />
    <Rise at={at[0] - from}>
      <span style={serif(104)}>antes del</span>
    </Rise>
    <Rise at={at[1] - from}>
      <span style={sans(150)}>RUSH DE</span>
    </Rise>
    <Rise at={at[2] - from}>
      <span style={sans(150, RED)}>DICIEMBRE</span>
    </Rise>
  </div>
  </>
);

const Apurate: React.FC = () => {
  const f = useCurrentFrame();
  const s = 0.6 + 0.4 * Easing.out(Easing.back(2.2))(Math.min(1, f / 6));
  const ring = [0, 60, 120, 180, 240, 300]
    .map((a) => `${(Math.cos((a * Math.PI) / 180) * 5).toFixed(1)}px ${(Math.sin((a * Math.PI) / 180) * 5).toFixed(1)}px 0 ${CREAM}`)
    .join(", ");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center" }}>
      <div
        style={{
          ...sans(168, RED, 900, "-0.04em"),
          display: "inline-block",
          textShadow: `${ring}, 0 10px 28px rgba(0,0,0,0.35)`,
          transform: `scale(${s}) rotate(-4deg)`,
          opacity: Math.min(1, f / 3),
        }}
      >
        ¡APÚRATE!
      </div>
    </div>
  );
};

const Reveal: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const page = interpolate(f, [0, 6, dur - 6, dur], [0, 1, 1, 0], clamp);
  const pop = 0.7 + 0.3 * Easing.out(Easing.back(1.6))(Math.min(1, Math.max(0, (f - 5) / 7)));
  return (
    <AbsoluteFill style={{ opacity: page }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center" }}>
        <div style={{ ...kicker(INK), fontSize: 34, opacity: ramp(f, 2, 8) }}>BUEN FIN · RE:SET</div>
        <div
          style={{
            ...sans(196, RED, 900, "-0.04em"),
            lineHeight: 1.0,
            marginTop: 18,
            opacity: Math.min(1, Math.max(0, (f - 5) / 3)),
            transform: `scale(${pop})`,
          }}
        >
          15% OFF
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1468, display: "flex", justifyContent: "center" }}>
        <Rise at={12}>
          <span style={serif(92)}>en toda la tienda</span>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const p = ramp(f, 2, 10);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1190, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: CREAM,
          borderRadius: 10,
          padding: "34px 50px 36px",
          textAlign: "center",
          boxShadow: "0 18px 50px rgba(0,0,0,0.25)",
          opacity: p,
          transform: `translateY(${(1 - p) * 30}px)`,
        }}
      >
        <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 230, opacity: ramp(f, 6, 8) }} />
        <Rise at={8}>
          <span style={serif(76)}>Encuentra tu favorita</span>
        </Rise>
        <Rise at={12}>
          <span style={sans(72)}>EN RE:SET.</span>
        </Rise>
        <div style={{ ...kicker(), fontSize: 24, marginTop: 18, opacity: ramp(f, 18, 8) }}>BUEN FIN · 15% OFF EN TODA LA TIENDA</div>
      </div>
    </div>
  );
};

const Graphic: React.FC<{ g: G }> = ({ g }) => {
  const dur = g.to - g.from;
  switch (g.kind) {
    case "hook":
      return <Hook dur={dur} />;
    case "numeral":
      return <Numeral n={g.n as string} dur={dur} />;
    case "big15":
      return <Big15 dur={dur} subAt={(g.sub_at as number) - g.from} label={g.label as string} />;
    case "serifline":
      return <SerifLine dur={dur} a={g.serif as string} b={g.sans as string} label={g.label as string} />;
    case "family":
      return <Family dur={dur} headAt={g.head_at as number[]} words={g.words as [string, number][]} from={g.from} />;
    case "rush":
      return <Rush dur={dur} at={g.at as number[]} from={g.from} label={g.label as string} />;
    case "apurate":
      return <Apurate />;
    case "reveal":
      return <Reveal dur={dur} />;
    default:
      return <Cta />;
  }
};

// ───────────────────────── captions: her words, a few at a time, mid-frame (or inside the window)
const Caption: React.FC<{ s: Sub }> = ({ s }) => {
  const f = useCurrentFrame();
  const dur = s.to - s.from;
  const o = interpolate(f, [0, 2, dur - 2, dur], [0, 1, 1, 0], clamp);
  const w = E.windows[0];
  const inWin = s.pos === "window";
  const box: React.CSSProperties = inWin
    ? { left: w.rect[0], width: w.rect[2], top: w.rect[1] + w.rect[3] - 150 }
    : { left: 60, right: 60, top: 1170 };
  return (
    <div style={{ position: "absolute", ...box, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: inWin ? 54 : 62,
          color: "#FFFFFF",
          textShadow: SOFT,
          letterSpacing: "-0.01em",
          transform: `translateY(${(1 - ramp(f, 0, 4)) * 10}px)`,
        }}
      >
        {s.text.split(/(\*[^*]+\*)/).filter(Boolean).map((part, i) =>
          part.startsWith("*") ? (
            <span key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: "1.12em" }}>
              {part.slice(1, -1)}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </div>
    </div>
  );
};

export const CreativeEdit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CREAM }}>
    <Picture />
    {E.graphics.map((g) => (
      <Sequence key={`${g.kind}-${g.from}`} from={g.from} durationInFrames={g.to - g.from}>
        <Graphic g={g} />
      </Sequence>
    ))}
    {SUBS.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
        <Caption s={s} />
      </Sequence>
    ))}
    <Audio src={staticFile(`${DIR}/mix.wav`)} />
  </AbsoluteFill>
);
