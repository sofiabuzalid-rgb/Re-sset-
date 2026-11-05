// RE:SET · ESSENTIALS · BUEN FIN — AD01 (Meta Ads: Reels, Stories, Feed). 1080×1920, 30 fps, 34.5 s.
// Voz real (nota de voz de ella, editor/essentials/voz.py) subtitulada palabra por palabra; música original a 120 BPM
// (editor/essentials/music.py): cada corte cae en un golpe (15 cuadros) y su "15%" cae en el golpe 34 (17.0 s).
// Los clips son horizontales (1920×1080, HDR de iPhone convertido a SDR): cada plano elige su encuadre vertical (cx).
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Freeze, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import VOZ from "./voz.json";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Cormorant", url: staticFile("fonts/Cormorant-500.woff2"), weight: "500" });
loadFont({ family: "Cormorant", url: staticFile("fonts/Cormorant-500-italic.woff2"), weight: "500", style: "italic" });

export const FPS = 30;
export const ESS_FRAMES = 1035;
const W = 1080;
const H = 1920;
const GREEN = "#163528";
const IVORY = "#F6F0E4";
const LIME = "#E2EC95";
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------------------------------------------------------------- campaign copy (editable)
export const COPY = {
  badge: "BUEN FIN · 15% OFF",
  title: "ESSENTIALS",
  favorite: ["Tu nueva favorita", "para estar en casa"],
  offer: { event: "BUEN FIN", pct: "15% OFF", scope: "EN TODA LA TIENDA" },
  adult: { label: "ADULTO", from: "$999", to: "$849" },
  kids: { label: "NIÑOS", from: "$699", to: "$594" },
  stores: ["Av. Stim 39", "Perisur, planta baja"],
  cta: "Ven a conocerlas a RE:SET.",
  ctaStores: "Te esperamos en Perisur y Av. Stim 39",
};

// ---------------------------------------------------------------- shots
type Shot = { from: number; len: number; src: string; at: number; cx: number; cx1?: number; z?: [number, number]; rate?: number };
const DUR: Record<string, number> = { e2675: 26.1, e2676: 5.05, e2677: 7.0, e2678: 7.8, e2679: 2.58 };
export const SHOTS: Shot[] = [
  // 0–4 s · hook: she holds the brown set up to camera, then the detail of the top
  { from: 0, len: 60, src: "e2676", at: 0.3, cx: 0.3, z: [1.0, 1.05] },
  { from: 60, len: 60, src: "e2677", at: 0.5, cx: 0.4, z: [1.04, 1.1] },
  // 4–7 s · "Sí, este Buen Fin." she turns to camera / "Conoce a nuestras Essentials"
  { from: 120, len: 45, src: "e2679", at: 1.05, cx: 0.17 },
  { from: 165, len: 45, src: "e2675", at: 3.0, cx: 0.33, z: [1.02, 1.06] },
  // 7–14 s · the product: finishes, designs, sleeves, models and colours
  { from: 210, len: 60, src: "e2677", at: 2.6, cx: 0.45, z: [1.0, 1.08] },
  { from: 270, len: 45, src: "e2675", at: 9.0, cx: 0.72, cx1: 0.78, z: [1.05, 1.05] },
  { from: 315, len: 60, src: "e2675", at: 7.0, cx: 0.33 },
  { from: 375, len: 45, src: "e2678", at: 0.3, cx: 0.4, cx1: 0.44 },
  { from: 420, len: 45, src: "e2675", at: 11.0, cx: 0.17, z: [1.04, 1.0] },
  { from: 465, len: 45, src: "e2678", at: 4.2, cx: 0.42 },
  // 17–26.5 s · offer and prices
  { from: 510, len: 75, src: "e2676", at: 2.6, cx: 0.3, z: [1.0, 1.06] },
  { from: 585, len: 60, src: "e2675", at: 17.2, cx: 0.35 },
  { from: 645, len: 60, src: "e2675", at: 21.5, cx: 0.33, z: [1.03, 1.0] },
  { from: 705, len: 90, src: "e2677", at: 3.0, cx: 0.42, z: [1.0, 1.08] },
  // 26.5–30.5 s · where
  { from: 795, len: 60, src: "e2678", at: 5.0, cx: 0.38, cx1: 0.42 },
  { from: 855, len: 60, src: "e2675", at: 0.4, cx: 0.3 },
];

/** one exact source frame (Freeze clamps to the composition length, so freeze at 0 and shift the clip) */
const Frame: React.FC<{ src: string; frame: number; cx: number; z: number }> = ({ src, frame, cx, z }) => {
  const vw = (H * 16) / 9 * z;
  const vh = H * z;
  const left = Math.min(0, Math.max(W - vw, W / 2 - cx * vw));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Freeze frame={0}>
        <Sequence from={-frame} layout="none">
          <OffthreadVideo
            muted
            src={staticFile(`essentials/${src}.mp4`)}
            style={{ position: "absolute", left, top: (H - vh) / 2, width: vw, height: vh, filter: "contrast(1.03) saturate(1.04)" }}
          />
        </Sequence>
      </Freeze>
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, s.len], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const frame = Math.min(Math.floor(DUR[s.src] * FPS) - 2, Math.round(s.at * FPS + f * (s.rate ?? 1)));
  const z = s.z ? s.z[0] + (s.z[1] - s.z[0]) * p : 1;
  const cx = s.cx1 !== undefined ? s.cx + (s.cx1 - s.cx) * p : s.cx;
  const fadeIn = interpolate(f, [0, 3], [0.75, 1], clamp); // 3-frame soft cut
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Frame src={s.src} frame={frame} cx={cx} z={z} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- subtitles (her words only)
type Wd = { w: string; s: number; e: number; hl: boolean; end_sentence: boolean };
const WORDS = (VOZ as { words: Wd[] }).words;

/** blocks of up to 2 lines (≤ 48 characters), never across a sentence end; long blocks break at commas or before "y"/"o" */
const BLOCKS: Wd[][] = (() => {
  const out: Wd[][] = [];
  let cur: Wd[] = [];
  const len = (ws: Wd[]) => ws.reduce((n, w) => n + w.w.length + 1, 0);
  WORDS.forEach((w, i) => {
    const next = WORDS[i + 1];
    if (cur.length && (len(cur) + w.w.length > 48 || (["y", "o"].includes(w.w) && len(cur) > 22))) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
    if (w.end_sentence || (/,$/.test(w.w) && len(cur) > 18) || !next) {
      out.push(cur);
      cur = [];
    }
  });
  return out;
})();

const SHADOW = "0 2px 12px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.7)";

const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const k = BLOCKS.findIndex((b, i) => t >= b[0].s - 0.08 && (i + 1 === BLOCKS.length || t < BLOCKS[i + 1][0].s - 0.08));
  if (k < 0) return null;
  const b = BLOCKS[k];
  if (t > b[b.length - 1].e + 0.5) return null;
  const hook = b[0].s < 3.8; // the first question is the hook: bigger and higher
  const pop = interpolate(t, [b[0].s - 0.08, b[0].s + 0.08], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: hook ? "flex-start" : "flex-end", alignItems: "center", paddingTop: hook ? 690 : 0, paddingBottom: hook ? 0 : 470 }}>
      <div
        style={{
          maxWidth: hook ? 900 : 860,
          padding: hook ? "18px 30px 22px" : "12px 24px 14px",
          borderRadius: 22,
          background: "rgba(18,18,18,0.38)",
          backdropFilter: "blur(6px)",
          textAlign: "center",
          opacity: pop,
          transform: `translateY(${(1 - pop) * 10}px)`,
        }}
      >
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: hook ? 74 : 54, lineHeight: 1.16, color: "#FFFFFF", textShadow: SHADOW, letterSpacing: "-0.005em" }}>
          {b.map((w, i) => {
            const a = interpolate(t, [w.s - 0.05, w.s + 0.06], [0, 1], clamp);
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.26em", opacity: 0.25 + 0.75 * a, color: w.hl && a > 0.5 ? LIME : "#FFFFFF" }}>
                {w.w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- campaign graphics (distinct look: brand green cards, serif titles)
const useIn = (from: number, len: number, d = 10) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - from, fps, config: { damping: 16, stiffness: 170 } });
  const out = interpolate(f, [from + len - d, from + len], [1, 0], clamp);
  return Math.min(s, out);
};

const Badge: React.FC = () => {
  const a = useIn(0, 165);
  return (
    <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `scale(${0.9 + 0.1 * a})` }}>
      <div style={{ background: GREEN, color: IVORY, fontFamily: "Montserrat", fontWeight: 800, fontSize: 44, letterSpacing: "0.14em", padding: "16px 34px 18px 40px", borderRadius: 999, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
        BUEN FIN · <span style={{ color: LIME }}>15% OFF</span>
      </div>
    </div>
  );
};

const Title: React.FC = () => {
  const a = useIn(196, 82);
  return (
    <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * -16}px)` }}>
      <div style={{ display: "inline-block", background: "rgba(22,53,40,0.9)", padding: "26px 54px 30px", borderRadius: 18 }}>
        <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 300 }} />
        <div style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 52, letterSpacing: "0.42em", paddingLeft: "0.42em", color: IVORY, marginTop: 14 }}>{COPY.title}</div>
      </div>
    </div>
  );
};

const Favorite: React.FC = () => {
  const a = useIn(420, 90);
  return (
    <div style={{ position: "absolute", top: 240, left: 60, right: 60, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * -14}px)` }}>
      <div style={{ display: "inline-block", background: "rgba(246,240,228,0.92)", padding: "18px 40px 22px", borderRadius: 18, fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 68, lineHeight: 1.02, color: GREEN }}>
        {COPY.favorite[0]}
        <br />
        {COPY.favorite[1]}
      </div>
    </div>
  );
};

const Offer: React.FC = () => {
  const f = useCurrentFrame();
  const a = useIn(510, 75);
  const flash = interpolate(f, [509, 510, 512, 520], [0, 0.5, 0.4, 0], clamp);
  return (
    <>
      <AbsoluteFill style={{ background: "#FFF8EC", opacity: flash }} />
      <div style={{ position: "absolute", top: 220, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `scale(${0.85 + 0.15 * a})` }}>
        <div style={{ background: GREEN, color: IVORY, borderRadius: 26, padding: "26px 56px 32px", textAlign: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
          <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 40, letterSpacing: "0.3em", paddingLeft: "0.3em" }}>{COPY.offer.event}</div>
          <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 150, lineHeight: 1, color: LIME, letterSpacing: "-0.03em" }}>{COPY.offer.pct}</div>
          <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 38, letterSpacing: "0.16em", paddingLeft: "0.16em", marginTop: 6 }}>{COPY.offer.scope}</div>
        </div>
      </div>
    </>
  );
};

const Price: React.FC<{ from: number; len: number; p: { label: string; from: string; to: string } }> = ({ from, len, p }) => {
  const f = useCurrentFrame();
  const a = useIn(from, len);
  const strike = interpolate(f, [from + 18, from + 30], [0, 1], { ...clamp, easing: ease });
  const newIn = interpolate(f, [from + 26, from + 38], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * -16}px)` }}>
      <div style={{ background: "rgba(246,240,228,0.95)", borderRadius: 22, padding: "20px 44px 24px", textAlign: "center", color: GREEN, boxShadow: "0 12px 34px rgba(0,0,0,0.22)" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 34, letterSpacing: "0.3em", paddingLeft: "0.3em" }}>PIJAMA {p.label}</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 28, marginTop: 6 }}>
          <span style={{ position: "relative", fontFamily: "Montserrat", fontWeight: 600, fontSize: 64, opacity: 0.55 }}>
            {p.from}
            <span style={{ position: "absolute", left: 0, top: "52%", height: 6, width: `${strike * 100}%`, background: "#C0392B", borderRadius: 3 }} />
          </span>
          <span style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 104, opacity: newIn, transform: `translateX(${(1 - newIn) * 20}px)` }}>{p.to}</span>
        </div>
      </div>
    </div>
  );
};

const Stores: React.FC = () => {
  const a = useIn(805, 110);
  return (
    <div style={{ position: "absolute", top: 240, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * -14}px)` }}>
      <div style={{ background: GREEN, color: IVORY, borderRadius: 22, padding: "22px 44px 26px", textAlign: "center" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 30, letterSpacing: "0.32em", paddingLeft: "0.32em", color: LIME }}>VISÍTANOS</div>
        {COPY.stores.map((s) => (
          <div key={s} style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 52, marginTop: 6 }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- end card (30.5–34.5 s)
const EndCard: React.FC = () => {
  const f = useCurrentFrame(); // local
  const tiles: Shot[] = [
    { from: 0, len: 120, src: "e2676", at: 4.0, cx: 0.3 },
    { from: 0, len: 120, src: "e2677", at: 4.0, cx: 0.45 },
    { from: 0, len: 120, src: "e2675", at: 9.5, cx: 0.75 },
  ];
  const head = interpolate(f, [4, 18], [0, 1], { ...clamp, easing: ease });
  const cta = interpolate(f, [16, 30], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: IVORY }}>
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", opacity: head }}>
        <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 240, filter: "invert(1) brightness(0.25) sepia(1) hue-rotate(80deg) saturate(3)" }} />
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 40, letterSpacing: "0.3em", paddingLeft: "0.3em", color: GREEN, marginTop: 18 }}>{COPY.offer.event}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 132, lineHeight: 1, color: GREEN, letterSpacing: "-0.03em" }}>{COPY.offer.pct}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 36, letterSpacing: "0.16em", paddingLeft: "0.16em", color: GREEN }}>{COPY.offer.scope}</div>
      </div>
      <div style={{ position: "absolute", top: 590, left: 70, right: 70, height: 480, display: "flex", gap: 18 }}>
        {tiles.map((s, i) => {
          const a = interpolate(f, [i * 4, i * 4 + 14], [0, 1], { ...clamp, easing: ease });
          return (
            <div key={i} style={{ position: "relative", flex: 1, overflow: "hidden", borderRadius: 160, opacity: a, transform: `translateY(${(1 - a) * 40}px)`, boxShadow: "0 14px 30px rgba(0,0,0,0.18)" }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", width: W, height: H, transform: "translate(-50%,-50%) scale(0.3)" }}>
                <Frame src={s.src} frame={Math.round(s.at * FPS + f * 0.5)} cx={s.cx} z={1} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1105, left: 40, right: 40, textAlign: "center", opacity: cta, transform: `translateY(${(1 - cta) * 14}px)` }}>
        <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 80, color: GREEN, lineHeight: 1.05 }}>{COPY.cta}</div>
        <div style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 32, letterSpacing: "0.06em", color: GREEN, marginTop: 18 }}>{COPY.ctaStores}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- main
export const Essentials: React.FC = () => {
  // music: up in the gaps, down under every word (ducking driven by her word timings)
  const music = (f: number) => {
    const t = f / FPS;
    let near = 99;
    for (const w of WORDS) {
      if (t >= w.s - 0.15 && t <= w.e + 0.2) {
        near = 0;
        break;
      }
      near = Math.min(near, Math.abs(t - w.s), Math.abs(t - w.e));
    }
    const under = near === 0 ? 0.12 : interpolate(near, [0, 0.35], [0.12, 0.6], clamp);
    const outro = f > 1000 ? 0.45 : under;
    return outro * interpolate(f, [ESS_FRAMES - 12, ESS_FRAMES], [1, 0], clamp);
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.len}>
          <ShotView s={s} />
        </Sequence>
      ))}
      <Sequence from={915} durationInFrames={ESS_FRAMES - 915}>
        <EndCard />
      </Sequence>
      <Sequence durationInFrames={915}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.28) 100%)" }} />
      </Sequence>
      <Badge />
      <Title />
      <Favorite />
      <Offer />
      <Price from={588} len={117} p={COPY.adult} />
      <Price from={708} len={87} p={COPY.kids} />
      <Stores />
      <Subtitles />
      <Audio src={staticFile("essentials/voz.wav")} />
      <Audio src={staticFile("essentials/musica.wav")} volume={music} />
    </AbsoluteFill>
  );
};
