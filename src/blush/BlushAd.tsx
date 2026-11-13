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
 * RE:SET BUEN FIN 15% · Soft Winter Blush — aesthetic cut.
 * Ilana always on screen talking (one uncut take). Type only accompanies: small serif + tracked sans set on the bare
 * wall between the store sign and her head, never on the pajama; quiet captions; a small side picture-in-picture of real
 * close-ups only while she talks about warmth, feel and details. All copy and timings in src/blush/edit.json.
 */

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Playfair Display", url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"), weight: "400 900", style: "italic" });
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";
const INK = "#2B2523";
const ROSE = "#9C4552"; // muted rose for the offer, sampled to sit with the blush
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.out(Easing.cubic);
const appear = (f: number, a = 0, d = 8) => ease(Math.min(1, Math.max(0, (f - a) / d)));

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

const serif = (size: number, color = INK): React.CSSProperties => ({ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: size, lineHeight: 1, color, letterSpacing: "-0.01em" });
const tracked = (size: number, color = INK, weight = 600): React.CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: "0.32em", paddingLeft: "0.32em", color, lineHeight: 1 });

/** Wall line: the bare strip of wall between the store sign and her head (no box, ink on white). */
const WallText: React.FC<{ dur: number; top?: number; right?: number; children: React.ReactNode }> = ({ dur, top = 348, right = 150, children }) => {
  const f = useCurrentFrame();
  const k = Math.min(appear(f, 0, 8), interpolate(f, [dur - 8, dur], [1, 0], clamp));
  return (
    <div style={{ position: "absolute", left: 0, right, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: k, transform: `translateY(${(1 - appear(f, 0, 10)) * 8}px)` }}>
      {children}
    </div>
  );
};

const Hook: React.FC<{ dur: number }> = ({ dur }) => (
  <WallText dur={dur}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
      <span style={serif(64)}>{edit.hook.l1}</span>
      <span style={{ ...tracked(44, ROSE, 700), letterSpacing: "0.08em", paddingLeft: 0 }}>{edit.hook.l2}</span>
    </div>
    <div style={tracked(24)}>{edit.hook.l3}</div>
  </WallText>
);

/** Single line in the clean strip between the sign and the wall hooks. */
const ModelLine: React.FC<{ dur: number }> = ({ dur }) => (
  <WallText dur={dur} top={326} right={0}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
      <span style={tracked(20, "#8C7A78")}>{edit.modelCard.kicker}</span>
      <span style={serif(54)}>{edit.model}</span>
    </div>
  </WallText>
);

/** Reinforcement as a fine line under the captions (the wall strip is taken by the sign as the camera drifts). */
const Reinforce: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const k = Math.min(appear(f, 0, 10), interpolate(f, [dur - 8, dur], [1, 0], clamp));
  const shadow = { textShadow: "0 1px 10px rgba(0,0,0,0.45), 0 0 2px rgba(0,0,0,0.3)" };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1412, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 14, opacity: k }}>
      <span style={{ ...serif(38, "#FFFFFF"), ...shadow }}>{edit.model}</span>
      <span style={{ ...tracked(20, "#FFFFFF", 700), letterSpacing: "0.2em", paddingLeft: 0, ...shadow }}>
        · {edit.reinforce.l2} · {edit.reinforce.l3}
      </span>
    </div>
  );
};

/** Quiet verbatim captions: small, white, sentence case, low enough to leave the outfit readable. */
const Sub: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const o = Math.min(appear(f, 0, 3), interpolate(f, [dur - 3, dur], [1, 0], clamp));
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 1335, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 42, lineHeight: 1.2, textAlign: "center", color: "#FFFFFF", letterSpacing: "0.005em", textShadow: "0 1px 10px rgba(0,0,0,0.45), 0 0 2px rgba(0,0,0,0.35)" }}>
        {text}
      </div>
    </div>
  );
};

/** Small side picture-in-picture (left, beside her), thin edge, tiny label; content swaps without the card leaving. */
type Pip = (typeof edit.pips)[number];
const PIP = { w: 270, h: 340, left: 46, top: 900 };
const PipCard: React.FC<{ group: Pip[] }> = ({ group }) => {
  const f = useCurrentFrame();
  const start = group[0].from;
  const dur = group[group.length - 1].to - start;
  const k = Math.min(appear(f, 0, 9), interpolate(f, [dur - 7, dur], [1, 0], clamp));
  return (
    <div
      style={{
        position: "absolute",
        left: PIP.left,
        top: PIP.top,
        width: PIP.w,
        height: PIP.h,
        borderRadius: 16,
        overflow: "hidden",
        border: "2px solid rgba(255,255,255,0.9)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        opacity: k,
        transform: `translateY(${(1 - k) * 12}px)`,
        background: "#e8e2de",
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
  const dur = p.to - p.from;
  return (
    <AbsoluteFill style={{ opacity: appear(f, 0, 5) }}>
      <OffthreadVideo
        muted
        src={staticFile(`blush/${p.id}.mp4`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${p.focus[0] * 100}% ${p.focus[1] * 100}%`, transform: `scale(${1.02 + 0.03 * (f / dur)})` }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.38) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center", ...serif(30, "#FFFFFF"), opacity: appear(f, 4, 8) }}>{p.label}</div>
    </AbsoluteFill>
  );
};

/** CTA over her held frame: offer on the wall strip, call to action + logo low and small. */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const c = edit.cta;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 352, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: appear(f, 2, 10) }}>
        <div style={serif(58)}>{c.l1}</div>
        <div style={tracked(24)}>{c.l2}</div>
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,0.28) 100%)", opacity: appear(f, 6, 12) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: appear(f, 12, 10) }}>
        <div style={{ ...serif(46, "#FFFFFF"), textShadow: "0 1px 10px rgba(0,0,0,0.4)" }}>{c.button}</div>
        <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 170, filter: "drop-shadow(0 1px 6px rgba(0,0,0,0.35))" }} />
      </div>
    </>
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
      <ModelLine dur={edit.modelCard.to - edit.modelCard.from} />
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
