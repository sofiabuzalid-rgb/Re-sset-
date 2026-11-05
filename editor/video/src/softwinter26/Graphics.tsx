// Motion typography + Buen Fin texts for AD03 (campaign copy, visually separate from her subtitles). Copy lives in copy.ts.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, COPY } from "./copy";
import { Frame, Shot, srcFrame } from "./Footage";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const soft = "0 2px 18px rgba(25,16,10,0.55), 0 0 2px rgba(25,16,10,0.4)";

/** words drift up out of a blur, one after another */
const Words: React.FC<{ text: string; from: number; step?: number; style: React.CSSProperties }> = ({ text, from, step = 2.5, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={style}>
      {text.split(" ").map((w, i) => {
        const a = interpolate(f, [from + i * step, from + i * step + 12], [0, 1], { ...clamp, easing: ease });
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.22em", opacity: a, transform: `translateY(${(1 - a) * 16}px)`, filter: `blur(${(1 - a) * 6}px)` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// 0–2.5 s · hook in two beats
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const o1 = interpolate(f, [30, 37], [1, 0], clamp);
  const o2 = interpolate(f, [70, 78], [1, 0], clamp);
  const veil = interpolate(f, [0, 6, 70, 80], [0, 1, 1, 0], clamp);
  const big: React.CSSProperties = { fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 104, lineHeight: 1.02, color: C.cream, textAlign: "center", textShadow: soft };
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 70px" }}>
      <AbsoluteFill style={{ background: "radial-gradient(80% 30% at 50% 47%, rgba(30,20,12,0.42), rgba(30,20,12,0) 100%)", opacity: veil }} />
      {f < 38 && <div style={{ opacity: o1, position: "absolute", top: 800, left: 70, right: 70 }}><Words text={COPY.hook[0]} from={3} style={big} /></div>}
      {f >= 34 && f < 80 && <div style={{ opacity: o2, position: "absolute", top: 760, left: 70, right: 70 }}><Words text={COPY.hook[1]} from={36} step={2.2} style={big} /></div>}
    </AbsoluteFill>
  );
};

// 2.5–4.7 s · SOFT WINTER BY RE:SET (lands as she says "Soft Winter") + BUEN FIN · 15% OFF
export const Title: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [75, 92, 132, 142], [0, 1, 1, 0], { ...clamp, easing: ease });
  const track = interpolate(f, [75, 140], [0.5, 0.36], clamp);
  const b = interpolate(f, [82, 94, 190, 200], [0, 1, 1, 0], clamp);
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(85% 22% at 50% 45%, rgba(30,20,12,0.55), rgba(30,20,12,0) 100%)", opacity: a }} />
      <div style={{ position: "absolute", top: 760, left: 0, right: 0, textAlign: "center", opacity: a }}>
        <div style={{ fontFamily: "Cormorant", fontWeight: 500, fontSize: 132, letterSpacing: `${track}em`, paddingLeft: `${track}em`, color: C.cream, textShadow: soft, lineHeight: 1 }}>
          {COPY.title.name}
        </div>
        <div style={{ fontFamily: "Manrope", fontWeight: 600, fontSize: 34, letterSpacing: "0.5em", paddingLeft: "0.5em", color: C.cream, marginTop: 18, textShadow: soft }}>{COPY.title.by}</div>
      </div>
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: b, transform: `translateY(${(1 - b) * -12}px)` }}>
        <div style={{ background: "rgba(74,58,48,0.88)", color: C.cream, fontFamily: "Manrope", fontWeight: 700, fontSize: 40, letterSpacing: "0.18em", padding: "14px 34px 16px 40px", borderRadius: 999, backdropFilter: "blur(6px)" }}>
          {COPY.badge}
        </div>
      </div>
    </>
  );
};

// 13.3–16.5 s · the insight line (her "perfectas para dormir cómodo… en casa" plays under it)
export const Claim: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [402, 418, 482, 494], [0, 1, 1, 0], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", top: 250, left: 80, right: 80, textAlign: "center", opacity: a }}>
      <div style={{ display: "inline-block", background: "rgba(239,230,216,0.93)", borderRadius: 24, padding: "18px 40px 24px" }}>
        <Words text={COPY.claim} from={402} step={2} style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 76, lineHeight: 1.04, color: C.cocoa }} />
      </div>
    </div>
  );
};

// 26.0–28.3 s · Buen Fin reveal: oat stage, three models in arches, an editorial 15%
export const Reveal: React.FC<{ tiles: Shot[] }> = ({ tiles }) => {
  const f = useCurrentFrame(); // local, starts on her "15%"
  const bg = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: ease });
  const pct = interpolate(f, [2, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const txt = interpolate(f, [8, 20], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: C.oat, opacity: bg }}>
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, textAlign: "center", opacity: txt }}>
        <div style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 40, letterSpacing: "0.32em", paddingLeft: "0.32em", color: C.cocoa }}>{COPY.reveal.event}</div>
      </div>
      <div style={{ position: "absolute", top: 270, left: 0, right: 0, textAlign: "center", transform: `scale(${0.7 + 0.3 * pct})`, opacity: Math.min(1, pct * 1.4) }}>
        <span style={{ fontFamily: "Cormorant", fontWeight: 500, fontSize: 300, lineHeight: 1, color: C.cocoa, letterSpacing: "-0.03em" }}>{COPY.reveal.pct}</span>
        <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 92, color: C.cocoa, marginLeft: 16 }}>{COPY.reveal.off}</span>
      </div>
      <div style={{ position: "absolute", top: 600, left: 0, right: 0, textAlign: "center", opacity: txt }}>
        <div style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 40, letterSpacing: "0.2em", paddingLeft: "0.2em", color: C.cocoa }}>{COPY.reveal.scope}</div>
      </div>
      <div style={{ position: "absolute", top: 720, left: 70, right: 70, height: 560, display: "flex", gap: 22 }}>
        {tiles.map((s, i) => {
          const a = interpolate(f, [6 + i * 4, 20 + i * 4], [0, 1], { ...clamp, easing: ease });
          return (
            <div key={i} style={{ position: "relative", flex: 1, overflow: "hidden", borderRadius: "160px 160px 18px 18px", opacity: a, transform: `translateY(${(1 - a) * 50}px)`, boxShadow: "0 16px 36px rgba(74,58,48,0.2)" }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 1080, height: 1920, transform: "translate(-50%,-50%) scale(0.36)" }}>
                <Frame src={s.src} frame={srcFrame(s, f)} cx={s.cx} z={1.1} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 28.3–32 s · CTA over the hero shot (all above the Reels/Stories UI)
export const CTA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame(); // local
  const a = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const head = interpolate(f, [6, 22], [0, 1], { ...clamp, easing: ease });
  const sub = interpolate(f, [16, 30], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <Frame src={shot.src} frame={srcFrame(shot, Math.round(f * 0.5))} cx={shot.cx} z={interpolate(f, [0, 110], [1.04, 1.1], clamp)} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(40,28,20,0.82) 0%, rgba(40,28,20,0.45) 30%, rgba(40,28,20,0.05) 50%, rgba(40,28,20,0.35) 100%)" }} />
      <div style={{ position: "absolute", top: 230, left: 60, right: 60, textAlign: "center", opacity: head, transform: `translateY(${(1 - head) * -12}px)` }}>
        <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 320 }} />
        <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 88, lineHeight: 1.04, color: C.cream, marginTop: 28, textShadow: soft }}>{COPY.cta.line}</div>
      </div>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: sub, transform: `translateY(${(1 - sub) * 12}px)` }}>
        <div style={{ background: C.oat, color: C.cocoa, fontFamily: "Manrope", fontWeight: 800, fontSize: 40, letterSpacing: "0.1em", padding: "16px 36px 18px", borderRadius: 999 }}>{COPY.cta.offer}</div>
        <div style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 38, color: C.cream, textShadow: soft }}>{COPY.cta.stores}</div>
      </div>
    </AbsoluteFill>
  );
};
