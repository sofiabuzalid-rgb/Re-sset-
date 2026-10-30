import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { STORES, WEB } from "../campana/shared";
import { At, BeatProvider, cl, Music, Sfx, useBeat, useSeg, Vid } from "../outlet4/fx";

/** second wave v3 · in the language of the reference reel (Owen's Black Friday): full-bleed footage cut on every beat,
 *  the offer locked in the middle of the frame, a reveal on the drop. Soundtrack = the reference reel's own music
 *  (140 BPM, drop on beat 5), looped to length by editor/outlet2/reel_music.py — not licensed for paid media. */
const B = 0.42852;

/** track N = intro (5 beats) + N grooves of 8 + ending (10 beats); each ad runs the whole track, its closing sits on the ending */
export const OUTLET2 = {
  ad06: { beats: 47, track: 4 },
  ad07: { beats: 47, track: 4 },
  ad08: { beats: 47, track: 4 },
  ad09: { beats: 55, track: 5 },
  ad10: { beats: 31, track: 2 },
} as const;
export type Key2 = keyof typeof OUTLET2;
export const frames2 = (k: Key2) => Math.round(OUTLET2[k].beats * B * 30);

const LIME = "#E2EC95";
const INK = "#141414";
const CREAM = "#F4F1EA";
const WHITE = "#FFFFFF";
const SANS = "Montserrat";
const SH = "0 4px 30px rgba(0,0,0,0.55)";
const GRADE = "brightness(1.06) contrast(1.08) saturate(1.12)";
const over = Easing.bezier(0.34, 1.56, 0.64, 1);
const outE = Easing.out(Easing.cubic);

/** pajamas in the promo, clean in-points (no hands) */
const P: [string, number][] = [
  ["IMG_2861", 0.4], ["IMG_3189", 1.0], ["IMG_2842", 1.0], ["IMG_2857", 0.5], ["IMG_3186", 1.5], ["IMG_2848", 0.8], ["IMG_2862", 0.6], ["IMG_3187", 1.5],
  ["IMG_2846", 1.0], ["IMG_2995", 1.8], ["IMG_2852", 1.0], ["IMG_2989", 1.0], ["IMG_2865", 0.4], ["IMG_2988", 0.6], ["IMG_2851", 1.5], ["IMG_2992", 0.6],
  ["IMG_2839", 0.5], ["IMG_2994", 3.0],
];
const rot = (k: number, n: number) => Array.from({ length: n }, (_, i) => P[(i * 5 + k) % P.length]);

const useF = () => {
  const f = useCurrentFrame();
  const { d } = useBeat();
  return { f, d };
};
const punch = (f: number, d: (b: number) => number, amt: number) => 1 + amt * Math.exp(-(f % d(1)) / 3.5);
const fit = (t: string, max: number) => Math.min(max, Math.floor(960 / (Math.max(3, t.length) * 0.68)));

const Frame2: React.FC<{ k: Key2; children: React.ReactNode }> = ({ k, children }) => (
  <BeatProvider B={B} off={0}>
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      {children}
      <Music src={`outlet4/audio/reel3_n${OUTLET2[k].track}.wav`} startS={0} total={frames2(k)} />
    </AbsoluteFill>
  </BeatProvider>
);

/** full-bleed shot: snaps in, alternating push, a small punch on every beat */
const Full: React.FC<{ src: string; at: number; i?: number }> = ({ src, at, i = 0 }) => {
  const { f, d } = useF();
  const seg = useSeg();
  const snap = interpolate(f, [0, 4], [1.14, 1], { ...cl, easing: outE });
  const z = interpolate(f, [0, seg], i % 2 ? [1.1, 1.0] : [1.0, 1.1], cl);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <AbsoluteFill style={{ transform: `scale(${snap * z * punch(f, d, 0.015)})`, filter: GRADE }}>
        <Vid src={src} at={at} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** one cut per `step` beats from b0 */
const Cuts: React.FC<{ b0: number; shots: [string, number][]; step?: number }> = ({ b0, shots, step = 1 }) => (
  <>
    {shots.map(([src, at], i) => (
      <At key={i} b0={b0 + i * step} b1={b0 + (i + 1) * step}>
        <Full src={src} at={at} i={i} />
      </At>
    ))}
  </>
);

/** the offer, locked in the centre like the reference: logo, OUTLET, 25% OFF */
const Lockup: React.FC<{ top?: number; from?: number }> = ({ top = 640, from = 0 }) => {
  const { f, d } = useF();
  const p = interpolate(f, [d(from), d(from) + 7], [0, 1], { ...cl, easing: over });
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, p * 1.5), transform: `scale(${1.25 - 0.25 * p})` }}>
      <Img src={staticFile("brand/reset-logo-white.png")} style={{ width: 330, filter: "drop-shadow(0 3px 18px rgba(0,0,0,0.55))" }} />
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, letterSpacing: "0.5em", marginLeft: "0.5em", color: WHITE, textShadow: SH, marginTop: 18 }}>OUTLET</div>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 196, lineHeight: 0.95, letterSpacing: "-0.035em", color: WHITE, textShadow: SH, whiteSpace: "nowrap", transform: `scale(${punch(f, d, 0.05)})` }}>25% OFF</div>
    </div>
  );
};

/** giant uppercase lines slammed in on their beats (relative to the block) */
type Line = { t: string; b: number; c?: string; bg?: string; size?: number };
const Slam: React.FC<{ lines: Line[]; top: number; size?: number; out?: number; shadow?: boolean }> = ({ lines, top, size = 170, out, shadow = true }) => {
  const { f, d } = useF();
  const o = out === undefined ? 1 : interpolate(f, [d(out) - 3, d(out)], [1, 0], cl);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: o }}>
      {lines.map((L, i) => {
        const s = d(L.b);
        const on = f >= s;
        const p = on ? interpolate(f, [s, s + 5], [0, 1], { ...cl, easing: over }) : 0;
        return (
          <div key={i} style={{ fontFamily: SANS, fontWeight: 900, fontSize: fit(L.t, L.size ?? size), lineHeight: 0.95, letterSpacing: "-0.025em", textTransform: "uppercase", whiteSpace: "nowrap", color: L.c ?? WHITE, background: L.bg, padding: L.bg ? "8px 26px 14px" : 0, textShadow: L.bg || !shadow ? "none" : SH, opacity: on ? Math.min(1, p * 1.6) : 0, transform: `scale(${on ? 1.4 - 0.4 * p : 1})` }}>
            {L.t}
          </div>
        );
      })}
    </div>
  );
};

/** a hand-held looking white sign with the punchline (the American Outlet reference), lands with overshoot and sways */
const Sign: React.FC<{ lines: string[]; b: number; top?: number }> = ({ lines, b, top = 560 }) => {
  const { f, d } = useF();
  if (f < d(b)) return null;
  const p = interpolate(f, [d(b), d(b) + 9], [0, 1], { ...cl, easing: over });
  return (
    <div style={{ position: "absolute", top, left: 80, right: 80, background: WHITE, padding: "54px 40px 60px", boxShadow: "0 30px 70px rgba(0,0,0,0.45)", transform: `translateY(${(1 - p) * 900}px) rotate(${-2 + 1.2 * Math.sin((f - d(b)) / 10)}deg)` }}>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, lineHeight: 1.08, letterSpacing: "-0.02em", textAlign: "center", color: INK }}>{l}</div>
      ))}
    </div>
  );
};

/** round 25% OFF sticker in the corner, pulsing on the beat */
const Badge: React.FC<{ b?: number }> = ({ b = 0 }) => {
  const { f, d } = useF();
  if (f < d(b)) return null;
  const p = interpolate(f, [d(b), d(b) + 8], [0, 1], { ...cl, easing: over });
  return (
    <div style={{ position: "absolute", left: 790, top: 1290, width: 220, height: 220, borderRadius: "50%", background: LIME, color: INK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, boxShadow: "0 18px 40px rgba(0,0,0,0.3)", transform: `scale(${p * punch(f, d, 0.08)}) rotate(-12deg)` }}>
      <div style={{ fontSize: 78, lineHeight: 0.9, letterSpacing: "-0.03em" }}>25%</div>
      <div style={{ fontSize: 38, letterSpacing: "0.14em", marginLeft: "0.14em" }}>OFF</div>
    </div>
  );
};

/** closing: footage keeps cutting every two beats, the lockup moves up, the CTA and the stores land */
const Close: React.FC<{ cta: string; k: number }> = ({ cta, k }) => {
  const { f, d } = useF();
  const a = (b: number) => interpolate(f, [d(b), d(b) + 7], [0, 1], { ...cl, easing: outE });
  return (
    <AbsoluteFill>
      <Cuts b0={0} shots={rot(k, 5)} step={2} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.55) 100%)" }} />
      <Lockup top={330} />
      <div style={{ position: "absolute", top: 1060, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a(1), transform: `scale(${(0.7 + 0.3 * a(1)) * punch(f, d, 0.03)})` }}>
        <div style={{ background: LIME, color: INK, fontFamily: SANS, fontWeight: 900, fontSize: 62, padding: "22px 60px 26px", borderRadius: 999, boxShadow: "0 14px 34px rgba(0,0,0,0.35)" }}>{cta}</div>
      </div>
      <div style={{ position: "absolute", top: 1230, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 40, color: WHITE, textShadow: SH, opacity: a(2) }}>{WEB}</div>
      <div style={{ position: "absolute", top: 1295, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 30, color: WHITE, textShadow: SH, opacity: a(2.5) }}>{STORES.map((s) => `${s.name} · ${s.detail}`).join("   |   ")}</div>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   06 · YO SOLO IBA A VER… — the counter of pajamas you "were only looking at" runs on every beat
   ===================================================================================== */
const Counter: React.FC<{ n0: number }> = ({ n0 }) => {
  const { f, d } = useF();
  const n = n0 + Math.floor(f / d(1));
  const k = punch(f, d, 0.22);
  return (
    <div style={{ position: "absolute", top: 270, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: "0.04em", color: WHITE, textShadow: SH }}>PIJAMAS QUE "SOLO IBA A VER":</div>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 300, lineHeight: 1, color: LIME, textShadow: SH, transform: `scale(${k})` }}>{n}</div>
    </div>
  );
};

export const Ad06: React.FC = () => (
  <Frame2 k="ad06">
    <At b0={0} b1={5}>
      <Full src="IMG_2861" at={0.3} />
      <Slam top={640} lines={[{ t: "YO SOLO", b: 0, size: 210 }, { t: "IBA A VER…", b: 1.5, size: 210 }]} />
      <Slam top={1080} lines={[{ t: "ENTRANDO AL OUTLET DE RE:SET", b: 3, c: INK, bg: WHITE, size: 50 }]} />
    </At>
    <Cuts b0={5} shots={rot(1, 16)} />
    <At b0={5} b1={21}><Counter n0={1} /><Badge b={0} /></At>
    <Cuts b0={21} shots={rot(7, 16)} />
    <At b0={21} b1={29}><Slam top={330} lines={[{ t: "OK, PERO", b: 0, c: INK, bg: LIME, size: 150 }, { t: "VEAN ESTAS", b: 0.5, c: INK, bg: LIME, size: 150 }]} /></At>
    <At b0={29} b1={37}><Lockup /></At>
    <At b0={37} b1={47}><Close cta="Elige tu favorita" k={3} /></At>
    <Sfx b={5} name="impact" vol={0.35} />
  </Frame2>
);

/* =====================================================================================
   07 · HAZ LAS CUENTAS — the equation, the sign, the offer
   ===================================================================================== */
export const Ad07: React.FC = () => (
  <Frame2 k="ad07">
    <At b0={0} b1={5}>
      <AbsoluteFill style={{ background: CREAM }} />
      <Slam top={300} shadow={false} lines={[{ t: "LA MATEMÁTICA QUE SÍ ME INTERESA:", b: 0, c: INK, size: 46 }]} />
      <Slam top={430} shadow={false} lines={[{ t: "100%", b: 1, c: INK, size: 300 }, { t: "− 25%", b: 2, c: INK, bg: LIME, size: 300 }, { t: "=", b: 3, c: INK, size: 200 }, { t: "TU FAVORITA", b: 4, c: INK, size: 160 }]} />
    </At>
    <Cuts b0={5} shots={rot(2, 8)} />
    <At b0={5} b1={13}><Slam top={330} lines={[{ t: "100% − 25% =", b: 0, size: 110 }, { t: "TU FAVORITA", b: 0, c: INK, bg: LIME, size: 140 }]} /><Badge b={0} /></At>
    <Cuts b0={13} shots={rot(9, 8)} />
    <At b0={13} b1={21}><Sign b={0} lines={["EL DINERO", "VA Y VIENE…", "PERO TU PIJAMA", "FAVORITA NO TE", "VA A ESPERAR."]} /></At>
    <Cuts b0={21} shots={rot(4, 16)} />
    <At b0={21} b1={37}><Lockup /></At>
    <At b0={37} b1={47}><Close cta="Aprovecha el 25% OFF" k={6} /></At>
    {[1, 2, 3, 4].map((b) => <Sfx key={b} b={b} name="click" vol={0.35} />)}
    <Sfx b={13} name="swipe" vol={0.35} />
  </Frame2>
);

/* =====================================================================================
   08 · ELIGE TU PERSONALIDAD — a style slams in on every beat
   ===================================================================================== */
const STYLE: Record<string, [string, string]> = {
  COLORIDA: [LIME, INK], DIVERTIDA: [WHITE, INK], CLÁSICA: [INK, LIME], DEPORTIVA: ["#F3D6CF", INK],
};
const PERSONAS: [string, string, number][] = [
  ["COLORIDA", "IMG_2842", 1.0], ["DIVERTIDA", "IMG_2857", 0.5], ["CLÁSICA", "IMG_2861", 0.4], ["DEPORTIVA", "IMG_3189", 1.0],
  ["COLORIDA", "IMG_2846", 1.0], ["DIVERTIDA", "IMG_2848", 0.8], ["CLÁSICA", "IMG_2865", 0.4], ["DEPORTIVA", "IMG_3186", 1.5],
  ["COLORIDA", "IMG_2839", 0.5], ["DIVERTIDA", "IMG_2852", 1.0], ["CLÁSICA", "IMG_2862", 0.6], ["DEPORTIVA", "IMG_3187", 1.5],
  ["COLORIDA", "IMG_2994", 3.0], ["DIVERTIDA", "IMG_2851", 1.5], ["CLÁSICA", "IMG_2861", 1.4], ["DEPORTIVA", "IMG_2989", 1.0],
];
const Label: React.FC<{ w: string }> = ({ w }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 5], [0, 1], { ...cl, easing: over });
  const [bg, fg] = STYLE[w];
  return (
    <div style={{ position: "absolute", top: 780, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: bg, color: fg, fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: "-0.02em", padding: "10px 40px 18px", boxShadow: "0 20px 50px rgba(0,0,0,0.35)", transform: `scale(${1.5 - 0.5 * p}) rotate(${(1 - p) * -6}deg)`, opacity: Math.min(1, p * 2) }}>{w}</div>
    </div>
  );
};
const Grid: React.FC<{ shots: [string, number][] }> = ({ shots }) => {
  const { f, d } = useF();
  return (
    <AbsoluteFill style={{ background: INK, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8, padding: 8 }}>
      {shots.map(([src, at], i) => {
        const p = interpolate(f, [d(i * 0.5), d(i * 0.5) + 6], [0, 1], { ...cl, easing: over });
        return (
          <div key={i} style={{ position: "relative", overflow: "hidden", opacity: Math.min(1, p * 2), transform: `scale(${0.6 + 0.4 * p})` }}>
            <Sequence from={d(i * 0.5)} layout="none"><AbsoluteFill style={{ filter: GRADE }}><Vid src={src} at={at} /></AbsoluteFill></Sequence>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Ad08: React.FC = () => (
  <Frame2 k="ad08">
    <At b0={0} b1={5}>
      <AbsoluteFill style={{ background: INK }} />
      <Slam top={420} lines={[{ t: "TU PIJAMA", b: 0 }, { t: "DICE MUCHO", b: 1 }, { t: "DE TI.", b: 2, c: LIME }]} />
      <Slam top={1050} lines={[{ t: "¿CUÁL ERES?", b: 3, c: INK, bg: LIME, size: 120 }]} />
    </At>
    {PERSONAS.map(([w, src, at], i) => (
      <At key={i} b0={5 + i} b1={6 + i}>
        <Full src={src} at={at} i={i} />
        <Label w={w} />
      </At>
    ))}
    <At b0={21} b1={29}>
      <Grid shots={[["IMG_2842", 1.0], ["IMG_2857", 0.5], ["IMG_2861", 0.4], ["IMG_3189", 1.0]]} />
      <Slam top={760} lines={[{ t: "TODAS CON", b: 2, c: INK, bg: WHITE, size: 110 }, { t: "25% OFF", b: 2.5, c: INK, bg: LIME, size: 200 }]} />
    </At>
    <Cuts b0={29} shots={rot(5, 8)} />
    <At b0={29} b1={37}><Lockup /></At>
    <At b0={37} b1={47}><Close cta="Encuentra la tuya" k={11} /></At>
  </Frame2>
);

/* =====================================================================================
   09 · EL ALGORITMO ME CONOCE — a feed (original design) that fills up with pajamas on the beat
   ===================================================================================== */
const FEED = ["IMG_2842", "IMG_3189", "IMG_2857", "IMG_2861", "IMG_3186", "IMG_2848", "IMG_3187", "IMG_2995", "IMG_2852", "IMG_2846", "IMG_2862", "IMG_2988", "IMG_2989", "IMG_2865"];
const FEED_AT: Record<string, number> = { IMG_2995: 1.8, IMG_2988: 0.5, IMG_2861: 0.4, IMG_2865: 0.4 };
const NOTES: [number, string][] = [[6, "Para ti: pijamas con 25% OFF"], [10, "Te puede gustar: otra pijama RE:SET"], [14, "Sigues viendo pijamas…"]];

const Feed: React.FC = () => {
  const { f, d } = useF();
  const grow = interpolate(f, [d(4), d(6)], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  // scrolls one post per beat after the drop, with a quick snap like a thumb flick
  const beats = Math.max(0, f / d(1) - 5);
  const whole = Math.floor(beats);
  const frac = beats - whole;
  const scroll = (whole + Easing.out(Easing.cubic)(Math.min(1, frac * 2.2))) * 780;
  return (
    <div style={{ position: "absolute", left: 190 - 190 * grow, top: 860 - 860 * grow, width: 700 + 380 * grow, height: 1240 + 680 * grow, borderRadius: 70 * (1 - grow), background: INK, padding: 16 * (1 - grow), boxSizing: "border-box", boxShadow: "0 40px 90px rgba(0,0,0,0.35)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 56 * (1 - grow), overflow: "hidden", background: WHITE }}>
        {[...FEED, ...FEED].map((src, i) => {
          const y = 40 + 250 * grow + i * 780 - scroll;
          if (y > 1920 || y < -780) return null;
          return (
            <div key={i} style={{ position: "absolute", left: 24, right: 24, top: y, height: 740 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, height: 80 }}>
                <div style={{ width: 60, height: 60, borderRadius: 30, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 24, color: INK }}>RE</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: INK }}>re:set</div>
                <div style={{ marginLeft: "auto", background: INK, color: LIME, fontFamily: SANS, fontWeight: 800, fontSize: 26, padding: "8px 18px", borderRadius: 999 }}>25% OFF</div>
              </div>
              <div style={{ position: "absolute", top: 90, left: 0, right: 0, bottom: 0, borderRadius: 26, overflow: "hidden", filter: GRADE }}>
                <Vid src={src} at={FEED_AT[src] ?? 1.0} />
              </div>
            </div>
          );
        })}
        {NOTES.map(([b, t]) => {
          const p = interpolate(f, [d(b), d(b) + 5, d(b + 3), d(b + 3) + 5], [0, 1, 1, 0], { ...cl, easing: outE });
          if (p <= 0) return null;
          return (
            <div key={b} style={{ position: "absolute", left: 40, right: 40, top: 260 - (1 - p) * 260, background: "rgba(255,255,255,0.97)", borderRadius: 34, padding: "26px 30px", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 18px 40px rgba(0,0,0,0.3)" }}>
              <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 22, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 28, color: INK }}>RE</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: INK }}>{t}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Ad09: React.FC = () => (
  <Frame2 k="ad09">
    <At b0={0} b1={21}>
      <AbsoluteFill style={{ background: LIME }} />
      <Slam top={270} out={4.5} shadow={false} size={120} lines={[{ t: "MI ALGORITMO", b: 0, c: INK }, { t: "CUANDO VE QUE", b: 1, c: INK }, { t: "RE:SET TIENE", b: 2, c: INK }, { t: "25% OFF", b: 3, c: LIME, bg: INK }]} />
      <Feed />
    </At>
    <At b0={21} b1={25}>
      <AbsoluteFill style={{ background: INK }} />
      <Slam top={560} lines={[{ t: "OK,", b: 0, size: 230 }, { t: "MENSAJE", b: 1, c: LIME, size: 230 }, { t: "RECIBIDO.", b: 2, c: LIME, size: 230 }]} />
    </At>
    <Cuts b0={25} shots={rot(8, 20)} />
    <At b0={25} b1={45}><Lockup /></At>
    <At b0={45} b1={55}><Close cta="Compra ahora" k={14} /></At>
    {NOTES.map(([b]) => <Sfx key={b} b={b} name="notif" vol={0.35} />)}
  </Frame2>
);

/* =====================================================================================
   10 · DIEZ SEGUNDOS PARA ENAMORARTE — the reference's envelope: it opens, the flyer fills the frame,
   ten pajamas count down on the beat, and everything goes back into the envelope
   ===================================================================================== */
const Envelope: React.FC<{ open: number; card: number; ribbon: number; fade: number }> = ({ open, card, ribbon, fade }) => {
  // open 0→1 = flap angle, card 0→1 = flyer rising out, ribbon 1→0 = ribbon untied
  const W = 700;
  const H = 460;
  return (
    <div style={{ position: "absolute", left: (1080 - W) / 2, top: 900, width: W, height: H, perspective: 1600 }}>
      <div style={{ position: "absolute", inset: 0, background: "#ECEAE4", boxShadow: "0 40px 80px rgba(0,0,0,0.45)", opacity: fade }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: -1200, height: 1200 + H, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 1200 + 30 - card * 560, height: 600, background: WHITE, padding: 14, boxSizing: "border-box", boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          <AbsoluteFill style={{ filter: GRADE }}><Vid src="IMG_2861" at={0.4} /></AbsoluteFill>
          <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", fontFamily: SANS, color: WHITE, textShadow: SH }}>
            <div style={{ fontWeight: 700, fontSize: 30, letterSpacing: "0.5em", marginLeft: "0.5em" }}>RE:SET</div>
            <div style={{ fontWeight: 700, fontSize: 46, letterSpacing: "0.4em", marginLeft: "0.4em", marginTop: 8 }}>OUTLET</div>
            <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1, letterSpacing: "-0.03em" }}>25%</div>
            <div style={{ fontWeight: 900, fontSize: 110, lineHeight: 1, letterSpacing: "-0.03em" }}>OFF</div>
          </div>
        </div>
      </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "#F7F5F0", clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)", opacity: fade }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: H * 0.56, background: "#F1EFEA", clipPath: "polygon(0 0, 100% 0, 50% 100%)", transformOrigin: "50% 0%", transform: `rotateX(${open * 178}deg)`, zIndex: open > 0.5 ? 0 : 2, boxShadow: "0 6px 18px rgba(0,0,0,0.12)", opacity: fade }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: H / 2 - 22, height: 44, background: LIME, opacity: ribbon, transform: `scaleX(${ribbon})`, zIndex: 3 }} />
      <div style={{ position: "absolute", left: W / 2 - 22, top: 0, width: 44, height: H, background: LIME, opacity: ribbon, transform: `scaleY(${ribbon})`, zIndex: 3 }} />
      <div style={{ position: "absolute", left: W / 2 - 90, top: H / 2 - 60, width: 180, height: 120, opacity: ribbon, transform: `scale(${ribbon}) rotate(${(1 - ribbon) * 90}deg)`, zIndex: 4 }}>
        <div style={{ position: "absolute", left: 0, top: 10, width: 90, height: 100, borderRadius: "50% 10% 10% 50%", border: `22px solid ${LIME}`, boxSizing: "border-box" }} />
        <div style={{ position: "absolute", right: 0, top: 10, width: 90, height: 100, borderRadius: "10% 50% 50% 10%", border: `22px solid ${LIME}`, boxSizing: "border-box" }} />
      </div>
    </div>
  );
};

/** the envelope scene: forward (open, flyer out, dive into the flyer) or backward (out of the flyer, flyer in, close, tie) */
const EnvelopeScene: React.FC<{ back?: boolean }> = ({ back }) => {
  const { f, d } = useF();
  const t = back ? Math.max(0, d(5) - f) : f; // the closing plays the opening in reverse, then holds
  const ribbon = interpolate(t, [d(0.6), d(1.6)], [1, 0], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const open = interpolate(t, [d(1.6), d(2.6)], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const card = interpolate(t, [d(2.6), d(3.8)], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.4)) });
  const dive = interpolate(t, [d(4), d(5)], [1, 3.4], { ...cl, easing: Easing.in(Easing.cubic) });
  const fade = interpolate(t, [d(4), d(4.6)], [1, 0], cl);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "brightness(0.9) saturate(1.1)", transform: `scale(${1.05 + 0.03 * Math.sin(f / 20)})` }}>
        <Vid src="IMG_2851" at={2.0} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${dive})`, transformOrigin: "50% 35%" }}>
        <Envelope open={open} card={card} ribbon={ribbon} fade={fade} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Countdown: React.FC = () => {
  const { f, d } = useF();
  const n = 10 - Math.min(9, Math.floor(f / d(1)));
  return <div style={{ position: "absolute", top: 260, left: 72, fontFamily: SANS, fontWeight: 900, fontSize: 200, lineHeight: 1, color: LIME, textShadow: SH, transform: `scale(${punch(f, d, 0.25)})`, transformOrigin: "left top" }}>{n}</div>;
};

export const Ad10: React.FC = () => (
  <Frame2 k="ad10">
    <At b0={0} b1={5}>
      <EnvelopeScene />
      <Slam top={300} out={4} lines={[{ t: "DAME 10 SEGUNDOS", b: 0, size: 110 }, { t: "PARA ENAMORARTE", b: 0.5, c: INK, bg: LIME, size: 90 }]} />
    </At>
    <Cuts b0={5} shots={rot(0, 16)} />
    <At b0={5} b1={15}><Countdown /></At>
    <At b0={5} b1={21}><Lockup top={700} /></At>
    <At b0={21} b1={31}>
      <EnvelopeScene back />
      <Slam top={280} lines={[{ t: "OUTLET RE:SET", b: 5, size: 120 }, { t: "DESCÚBRELO AHORA", b: 5.5, c: INK, bg: LIME, size: 80 }]} />
      <div style={{ position: "absolute", top: 1420, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 40, color: WHITE, textShadow: SH }}>{WEB}</div>
    </At>
    <Sfx b={1} name="swipe" vol={0.3} />
    <Sfx b={2} name="whoosh" vol={0.3} />
  </Frame2>
);
