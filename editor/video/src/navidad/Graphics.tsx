// Motion graphics and Buen Fin texts (campaign messages, visually distinct from her subtitles). Copy lives in copy.ts.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, COPY } from "./copy";
import { Frame, Shot, srcFrame } from "./Footage";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** spring in at `from`, fade out over the last `d` frames */
const useIn = (from: number, len: number, d = 10) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - from, fps, config: { damping: 16, stiffness: 170 } });
  return Math.min(s, interpolate(f, [from + len - d, from + len], [1, 0], clamp));
};

// warm, consistent look over all the footage: soft-light warmth, vignette, fine moving grain
export const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,186,120,0.07), rgba(150,40,20,0.06))", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(125% 85% at 50% 45%, rgba(0,0,0,0) 58%, rgba(14,8,4,0.42) 100%)" }} />
      <AbsoluteFill
        style={{
          opacity: 0.06,
          mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${f % 9}'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        }}
      />
    </>
  );
};

/** warm light leak on a cut (screen blend, ~8 frames) */
export const Leak: React.FC<{ at: number; side?: "l" | "r"; peak?: number }> = ({ at, side = "l", peak = 0.75 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 1, at, at + 2, at + 9], [0, peak, peak * 0.8, 0], clamp);
  if (o <= 0) return null;
  const x = side === "l" ? "12%" : "88%";
  return <AbsoluteFill style={{ opacity: o, mixBlendMode: "screen", background: `radial-gradient(70% 55% at ${x} 30%, rgba(255,214,150,0.95), rgba(255,140,80,0.45) 45%, rgba(255,120,60,0) 75%)` }} />;
};

// 0.7–3.0 s · hook, word by word on a deep-green card
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const a = useIn(21, 72, 8);
  const words = COPY.hook.split(" ");
  return (
    <div style={{ position: "absolute", top: 560, left: 70, right: 70, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ background: "rgba(22,53,40,0.9)", borderRadius: 26, padding: "26px 40px 32px", textAlign: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 70, lineHeight: 1.08, color: C.cream, letterSpacing: "-0.01em" }}>
          {words.map((w, i) => {
            const k = interpolate(f, [21 + i * 2, 29 + i * 2], [0, 1], { ...clamp, easing: ease });
            const hot = /Navidad|pijamas/.test(w);
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.24em", opacity: k, transform: `translateY(${(1 - k) * 18}px)`, color: hot ? C.gold : C.cream }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 2.0–6.0 s · RE:SET CHRISTMAS COLLECTION + BUEN FIN · 15% OFF badge
export const Collection: React.FC = () => {
  const a = useIn(60, 60);
  const b = useIn(64, 116);
  return (
    <>
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>
        <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 300, filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.5))" }} />
        <div style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 40, letterSpacing: "0.36em", paddingLeft: "0.36em", color: C.white, marginTop: 10, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
          {COPY.collection}
        </div>
      </div>
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: b, transform: `scale(${0.9 + 0.1 * b})` }}>
        <div style={{ background: C.red, color: C.white, fontFamily: "Montserrat", fontWeight: 800, fontSize: 46, letterSpacing: "0.12em", padding: "16px 36px 18px 42px", borderRadius: 999, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
          {COPY.badge.event} · <span style={{ color: C.gold }}>{COPY.badge.offer}</span>
        </div>
      </div>
    </>
  );
};

// 6.5–9 s · her "15% de descuento en toda la tienda"
export const Offer: React.FC = () => {
  const f = useCurrentFrame();
  const a = useIn(195, 75);
  const flash = interpolate(f, [194, 195, 197, 205], [0, 0.45, 0.35, 0], clamp);
  return (
    <>
      <AbsoluteFill style={{ background: "#FFF6E8", opacity: flash }} />
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `scale(${0.85 + 0.15 * a})` }}>
        <div style={{ background: C.green, color: C.cream, borderRadius: 26, padding: "24px 56px 30px", textAlign: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
          <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 150, lineHeight: 1, color: C.gold, letterSpacing: "-0.03em" }}>{COPY.offer.pct}</div>
          <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 40, letterSpacing: "0.16em", paddingLeft: "0.16em", marginTop: 8 }}>{COPY.offer.scope}</div>
        </div>
      </div>
    </>
  );
};

// 20–23.3 s · campaign claim (not hers)
export const Claim: React.FC = () => {
  const a = useIn(600, 100, 12);
  return (
    <div style={{ position: "absolute", top: 230, left: 60, right: 60, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * -14}px)` }}>
      <div style={{ display: "inline-block", background: "rgba(246,240,228,0.94)", padding: "20px 44px 26px", borderRadius: 20, fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 74, lineHeight: 1.02, color: C.green }}>
        {COPY.claim[0]}
        <br />
        {COPY.claim[1]}
      </div>
    </div>
  );
};

// 26.9–29.9 s · her "Visítanos en Avenida Stim 39, y en Perisur."
export const Stores: React.FC = () => {
  const a = useIn(808, 90);
  return (
    <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * -14}px)` }}>
      <div style={{ background: C.green, color: C.cream, borderRadius: 22, padding: "22px 46px 26px", textAlign: "center" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 30, letterSpacing: "0.32em", paddingLeft: "0.32em", color: C.gold }}>VISÍTANOS</div>
        {COPY.stores.map((s) => (
          <div key={s} style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 56, marginTop: 4 }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

// 30.5–32.4 s · Buen Fin reveal over the grid, on her 'Este Buen Fin'
export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const a = useIn(917, 55, 6);
  const pct = interpolate(f, [920, 930], [0.6, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: a }}>
      <div style={{ background: C.red, color: C.white, borderRadius: 30, padding: "30px 64px 38px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.35)", marginTop: -160 }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 44, letterSpacing: "0.3em", paddingLeft: "0.3em" }}>
          {COPY.reveal.event} <span style={{ color: C.gold }}>RE:SET</span>
        </div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 176, lineHeight: 1, letterSpacing: "-0.03em", transform: `scale(${pct})` }}>{COPY.reveal.pct}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 44, letterSpacing: "0.16em", paddingLeft: "0.16em", marginTop: 8 }}>{COPY.reveal.scope}</div>
      </div>
    </AbsoluteFill>
  );
};

// 33.8–37 s · close: best product shot, logo, line, 15% OFF (pulses on her second "15%"), CTA — all above the Reels/Stories UI
export const EndCard: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame(); // local
  const head = interpolate(f, [4, 18], [0, 1], { ...clamp, easing: ease });
  const cta = interpolate(f, [14, 28], [0, 1], { ...clamp, easing: ease });
  const z = interpolate(f, [0, 105], [1.0, 1.06], clamp);
  const pulse = f >= 17 ? 1 + 0.1 * Math.exp(-(f - 17) / 5) : 1;
  return (
    <AbsoluteFill>
      <Frame src={shot.src} frame={srcFrame(shot, Math.round(f * 0.6))} cx={shot.cx} z={z} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,24,17,0.78) 0%, rgba(10,24,17,0.35) 38%, rgba(10,24,17,0.15) 55%, rgba(10,24,17,0.55) 100%)" }} />
      <div style={{ position: "absolute", top: 250, left: 50, right: 50, textAlign: "center", opacity: head, transform: `translateY(${(1 - head) * -14}px)` }}>
        <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 340 }} />
        <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 90, lineHeight: 1.04, color: C.cream, marginTop: 30, textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>{COPY.end.line}</div>
      </div>
      <div style={{ position: "absolute", top: 880, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: cta, transform: `translateY(${(1 - cta) * 14}px)` }}>
        <div style={{ background: C.red, color: C.white, fontFamily: "Montserrat", fontWeight: 800, fontSize: 50, padding: "18px 44px 20px", borderRadius: 999, boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>{COPY.end.cta}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 40, color: C.cream, marginTop: 22, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>{COPY.end.stores}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 36, letterSpacing: "0.12em", color: C.gold, marginTop: 12, textShadow: "0 2px 10px rgba(0,0,0,0.6)", transform: `scale(${pulse})` }}>BUEN FIN · 15% OFF EN TODA LA TIENDA</div>
      </div>
    </AbsoluteFill>
  );
};
