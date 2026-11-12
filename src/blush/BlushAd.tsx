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
import edit from "./edit.json";

/*
 * RE:SET BUEN FIN 15% · Soft Winter Blush — Ilana always on screen, talking to camera (one uncut take),
 * with a lower picture-in-picture card of real fabric close-ups only while she talks about feel / warmth / details.
 * Everything editable in src/blush/edit.json (model name, copy, caption beats, PiP clips and windows).
 */

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Playfair Display", url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"), weight: "400 900", style: "italic" });
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";
const INK = "#1C1A19";
const RED = "#D7261E";
const CARD = "rgba(250,246,240,0.95)";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.out(Easing.cubic);
const appear = (f: number, a = 0, d = 6) => ease(Math.min(1, Math.max(0, (f - a) / d)));

const MAIN = edit.shots[0];
const FREEZE = edit.freeze;
export const BLUSH_TOTAL = MAIN.frames + FREEZE.frames;

const zoomStyle = (f: number, dur: number, z: number[], focus: number[]) => {
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / dur));
  return { transform: `scale(${z[0] + (z[1] - z[0]) * p})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%` };
};

const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo muted src={staticFile("blush/main.mp4")} style={{ width: "100%", height: "100%", ...zoomStyle(f, MAIN.frames, MAIN.zoom, MAIN.focus) }} />
    </AbsoluteFill>
  );
};

/** CTA hold: her last frame looking at camera, with a slow push. */
const Freeze: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile("blush/freeze.png")} style={{ width: "100%", height: "100%", ...zoomStyle(f, FREEZE.frames, FREEZE.zoom, FREEZE.focus) }} />
    </AbsoluteFill>
  );
};

/** Compact cream card in the top band, above her head. */
const TopCard: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const k = appear(f, 0, 5);
  const out = interpolate(f, [dur - 5, dur], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center", opacity: k * out }}>
      <div style={{ background: CARD, borderRadius: 18, padding: "18px 44px 20px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 12px 34px rgba(0,0,0,0.16)", transform: `translateY(${(1 - k) * 10}px)` }}>
        {children}
      </div>
    </div>
  );
};

const kicker = (t: string): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: t.length > 12 ? 30 : 34, letterSpacing: "0.34em", color: INK, paddingLeft: "0.34em" });
const big = (size: number, color = RED): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: "-0.04em", lineHeight: 0.95, color });

const Hook: React.FC<{ dur: number }> = ({ dur }) => (
  <TopCard dur={dur}>
    <div style={{ ...big(64, INK), letterSpacing: "0.04em" }}>{edit.hook.l1}</div>
    <div style={{ ...big(116), margin: "2px 0 8px" }}>{edit.hook.l2}</div>
    <div style={kicker(edit.hook.l3)}>{edit.hook.l3}</div>
  </TopCard>
);

const ModelCard: React.FC<{ dur: number }> = ({ dur }) => (
  <TopCard dur={dur}>
    <div style={{ ...kicker(edit.modelCard.kicker), fontSize: 24, color: "#8A6F72" }}>{edit.modelCard.kicker}</div>
    <div style={{ width: 54, height: 2, background: "#C98B95", margin: "10px 0 12px" }} />
    <div style={{ ...big(66, INK), letterSpacing: "-0.02em" }}>{edit.model}</div>
  </TopCard>
);

const Reinforce: React.FC<{ dur: number }> = ({ dur }) => (
  <TopCard dur={dur}>
    <div style={{ ...big(48, INK), letterSpacing: "-0.01em" }}>{edit.model}</div>
    <div style={{ ...big(100), margin: "4px 0 2px" }}>{edit.reinforce.l2}</div>
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 46, color: INK }}>{edit.reinforce.l3}</div>
  </TopCard>
);

/** Verbatim captions in short beats; ALL-CAPS words = her key words, set heavier in red. */
const Sub: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const o = Math.min(appear(f, 0, 3), interpolate(f, [dur - 2, dur], [1, 0], clamp));
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 985, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 16px", opacity: o }}>
      {text.split(" ").map((w, i) => {
        const key = w.replace(/[.,]/g, "").length > 1 && w === w.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(w);
        return (
          <span
            key={i}
            style={{
              fontFamily: SANS,
              fontWeight: key ? 900 : 800,
              fontSize: key ? 74 : 64,
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              color: key ? RED : "#FFFFFF",
              textShadow: key ? "0 2px 10px rgba(255,255,255,0.55)" : "0 2px 12px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.45)",
              WebkitTextStroke: key ? "1.5px #FFFFFF" : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Lower picture-in-picture: rounded card, thin white edge, small label; content swaps without the card leaving. */
type Pip = (typeof edit.pips)[number];
const PIP = { w: 460, h: 520, top: 1130 };
const PipCard: React.FC<{ group: Pip[] }> = ({ group }) => {
  const f = useCurrentFrame();
  const start = group[0].from;
  const dur = group[group.length - 1].to - start;
  const k = appear(f, 0, 7);
  const out = interpolate(f, [dur - 6, dur], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - PIP.w) / 2,
        top: PIP.top,
        width: PIP.w,
        height: PIP.h,
        borderRadius: 26,
        overflow: "hidden",
        border: "4px solid rgba(255,255,255,0.95)",
        boxShadow: "0 18px 44px rgba(0,0,0,0.28)",
        opacity: k * out,
        transform: `translateY(${(1 - k) * 22}px) scale(${0.95 + 0.05 * k})`,
        background: "#ddd",
      }}
    >
      {group.map((p) => (
        <Sequence key={p.id} from={p.from - start} durationInFrames={p.to - p.from} layout="none">
          <PipClip p={p} />
        </Sequence>
      ))}
    </div>
  );
};

const PipClip: React.FC<{ p: Pip }> = ({ p }) => {
  const f = useCurrentFrame();
  const fade = appear(f, 0, 4);
  const dur = p.to - p.from;
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <OffthreadVideo
        muted
        src={staticFile(`blush/${p.id}.mp4`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${p.focus[0] * 100}% ${p.focus[1] * 100}%`, transform: `scale(${1.02 + 0.04 * (f / dur)})` }}
      />
      <div style={{ position: "absolute", left: 18, top: 18, background: CARD, borderRadius: 999, padding: "10px 22px 11px", fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: "0.12em", color: INK, opacity: appear(f, 3, 6) }}>
        {p.label}
      </div>
    </AbsoluteFill>
  );
};

/** CTA over her held frame: lower card so her face stays clear. */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const c = edit.cta;
  const k = appear(f, 2, 8);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ background: CARD, borderRadius: 22, padding: "30px 46px 32px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 16px 44px rgba(0,0,0,0.2)", transform: `translateY(${(1 - k) * 16}px)` }}>
        <Img src={staticFile("brand/reset-logo-black.png")} style={{ width: 230, opacity: appear(f, 6, 8) }} />
        <div style={{ ...big(64), marginTop: 20, textAlign: "center", opacity: appear(f, 10, 8) }}>{c.l1}</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 44, color: INK, marginTop: 8, opacity: appear(f, 14, 8) }}>{c.l2}</div>
        <div style={{ marginTop: 22, background: INK, color: "#FFFFFF", borderRadius: 999, padding: "16px 40px 18px", fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: "0.02em", opacity: appear(f, 18, 8) }}>
          {c.button}
        </div>
      </div>
    </div>
  );
};

/** Consecutive PiPs (one ends where the next starts) share one card. */
const pipGroups: Pip[][] = [];
for (const p of edit.pips) {
  const g = pipGroups[pipGroups.length - 1];
  if (g && g[g.length - 1].to === p.from) g.push(p);
  else pipGroups.push([p]);
}

export const BlushAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence durationInFrames={MAIN.frames}>
      <Main />
    </Sequence>
    <Sequence from={MAIN.frames} durationInFrames={FREEZE.frames}>
      <Freeze />
    </Sequence>
    <Sequence from={edit.hook.from} durationInFrames={edit.hook.to - edit.hook.from}>
      <Hook dur={edit.hook.to - edit.hook.from} />
    </Sequence>
    <Sequence from={edit.modelCard.from} durationInFrames={edit.modelCard.to - edit.modelCard.from}>
      <ModelCard dur={edit.modelCard.to - edit.modelCard.from} />
    </Sequence>
    <Sequence from={edit.reinforce.from} durationInFrames={edit.reinforce.to - edit.reinforce.from}>
      <Reinforce dur={edit.reinforce.to - edit.reinforce.from} />
    </Sequence>
    {pipGroups.map((g) => (
      <Sequence key={g[0].id} from={g[0].from} durationInFrames={g[g.length - 1].to - g[0].from}>
        <PipCard group={g} />
      </Sequence>
    ))}
    {edit.subs.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
        <Sub text={s.text} dur={s.to - s.from} />
      </Sequence>
    ))}
    <Sequence from={MAIN.frames}>
      <Cta />
    </Sequence>
    <Audio src={staticFile("blush/mix.wav")} />
  </AbsoluteFill>
);
