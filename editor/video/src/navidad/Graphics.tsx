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

// 7.0–9.6 s · her "15% de descuento en toda la tienda"
export const Offer: React.FC = () => {
  const f = useCurrentFrame();
  const a = useIn(210, 78);
  const flash = interpolate(f, [209, 210, 212, 220], [0, 0.45, 0.35, 0], clamp);
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

// 21–24.5 s · campaign claim (not hers)
export const Claim: React.FC = () => {
  const a = useIn(630, 105, 12);
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

// 28.3–31.3 s · her "Visítanos en Avenida Stim 39 o en Perisur."
export const Stores: React.FC = () => {
  const a = useIn(849, 92);
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

// 31.5–33.5 s · Buen Fin reveal over the grid
export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const a = useIn(948, 57, 6);
  const pct = interpolate(f, [952, 962], [0.6, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
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

// 33.5–37 s · close: best product shot, logo, line + CTA (kept above the Reels/Stories UI)
export const EndCard: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame(); // local
  const head = interpolate(f, [4, 18], [0, 1], { ...clamp, easing: ease });
  const cta = interpolate(f, [14, 28], [0, 1], { ...clamp, easing: ease });
  const z = interpolate(f, [0, 105], [1.0, 1.06], clamp);
  return (
    <AbsoluteFill>
      <Frame src={shot.src} frame={srcFrame(shot, Math.round(f * 0.6))} cx={shot.cx} z={z} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,24,17,0.78) 0%, rgba(10,24,17,0.35) 38%, rgba(10,24,17,0.15) 55%, rgba(10,24,17,0.55) 100%)" }} />
      <div style={{ position: "absolute", top: 250, left: 50, right: 50, textAlign: "center", opacity: head, transform: `translateY(${(1 - head) * -14}px)` }}>
        <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 340 }} />
        <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 90, lineHeight: 1.04, color: C.cream, marginTop: 30, textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>{COPY.end.line}</div>
      </div>
      <div style={{ position: "absolute", top: 1090, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: cta, transform: `translateY(${(1 - cta) * 14}px)` }}>
        <div style={{ background: C.red, color: C.white, fontFamily: "Montserrat", fontWeight: 800, fontSize: 50, padding: "18px 44px 20px", borderRadius: 999, boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>{COPY.end.cta}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 40, color: C.cream, marginTop: 22, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>{COPY.end.stores}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 36, letterSpacing: "0.12em", color: C.gold, marginTop: 12, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>BUEN FIN · 15% OFF EN TODA LA TIENDA</div>
      </div>
    </AbsoluteFill>
  );
};
