import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BRAND_CHIP, COLORS, COPY, END, FPS, HOOK, Panel, PRICES, Shot, SHOTS, TAGS, VOICE, WORDS } from "./config";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const F = (s: number) => Math.round(s * FPS);
const SHADOW = "0 2px 14px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.5)";
// Meta Reels/Stories safe zone: text between y≈270 (top 14 %) and y≈1250 (bottom 35 %)

/* consistent grade on every clip: a touch of contrast and warmth, skin stays natural */
const GRADE = "contrast(1.05) saturate(1.06) brightness(1.02) sepia(0.05)";

/** size + price, big enough to read at a glance: "ADULTO" over "$999" */
const PriceTag: React.FC<{ size: Panel["size"]; scale?: number; delay?: number }> = ({ size, scale = 1, delay = 0 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 9], [0, 1], { ...clamp, easing: easeOut });
  const { label, price } = PRICES[size];
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px) scale(${scale})`, display: "flex", flexDirection: "column", alignItems: "center", background: size === "adulto" ? COLORS.ivory : COLORS.lime, color: COLORS.ink, borderRadius: 26, padding: "12px 30px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
      <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 32, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 84, lineHeight: 0.95, letterSpacing: "-0.02em" }}>{price}</div>
    </div>
  );
};

const Panels: React.FC<{ s: Shot; z: number }> = ({ s, z }) => {
  const four = s.panels!.length === 4;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ivory, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: four ? "1fr 1fr" : "1fr", gap: 6 }}>
      {s.panels!.map((p, k) => (
        <div key={k} style={{ position: "relative", overflow: "hidden" }}>
          <OffthreadVideo muted src={staticFile(`navidad03/${p.src}.mp4`)} startFrom={F(p.at)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: GRADE, transform: `scale(${z})` }} />
          {/* two panels: the tag sits over the hanger, just inside the safe zone, so it never covers the pajama.
              four panels: no tags (they would fall under the Reels UI); the prices were just shown twice */}
          {!four && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 275, display: "flex", justifyContent: "center" }}>
              <PriceTag size={p.size} delay={k * 4} />
            </div>
          )}
        </div>
      ))}
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ s: Shot; frames: number }> = ({ s, frames }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, frames], s.zoom, { ...clamp, easing: Easing.inOut(Easing.quad) });
  if (s.panels) return <Panels s={s} z={z} />;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo muted src={staticFile(`navidad03/${s.src}.mp4`)} startFrom={F(s.at)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: GRADE, transform: `scale(${z})`, transformOrigin: `${s.origin[0]}% ${s.origin[1]}%` }} />
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)" }} />;

/** fade a graphic in/out over its window */
const useWindow = (from: number, to: number, inF = 8, outF = 6) => {
  const f = useCurrentFrame();
  return Math.min(interpolate(f, [F(from), F(from) + inF], [0, 1], { ...clamp, easing: easeOut }), interpolate(f, [F(to) - outF, F(to)], [1, 0], clamp));
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [F(HOOK.to) - 8, F(HOOK.to)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 290, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", opacity: out }}>
      {HOOK.text.map((l, k) => (
        <div key={k} style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: k ? 70 : 76, lineHeight: 1.08, letterSpacing: "-0.02em", color: k ? COLORS.lime : COLORS.ivory, textShadow: SHADOW, textAlign: "center" }}>
          {l}
        </div>
      ))}
      {/* prices are on screen from the first frame: the thumbnail already says what it costs */}
      <div style={{ marginTop: 26, display: "flex", gap: 22 }}>
        <PriceTag size="ninos" scale={0.9} delay={-9} />
        <PriceTag size="adulto" scale={0.9} delay={-9} />
      </div>
    </div>
  );
};

const Chip: React.FC<{ text: string; from: number; to: number; top: number; strong?: boolean }> = ({ text, from, to, top, strong }) => {
  const o = useWindow(from, to);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: o, transform: `translateY(${(1 - o) * 10}px)`, fontFamily: "Montserrat", fontWeight: strong ? 800 : 700, fontSize: strong ? 44 : 38, letterSpacing: "0.04em", textTransform: "uppercase", color: COLORS.ink, background: strong ? COLORS.lime : "rgba(255,251,242,0.92)", padding: "14px 30px", borderRadius: 999 }}>
        {text}
      </div>
    </div>
  );
};

const Copy: React.FC = () => {
  const o = useWindow(COPY.from, COPY.to, 10, 8);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 300, left: 60, right: 60, textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
      {COPY.text.map((l, k) => (
        <div key={k} style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 64, lineHeight: 1.12, letterSpacing: "-0.015em", color: k ? COLORS.lime : COLORS.ivory, textShadow: SHADOW }}>
          {l}
        </div>
      ))}
    </div>
  );
};

/* Subtitles: her exact words, short blocks, max two lines, ivory; brand words in lime. No bouncing. */
type W = (typeof WORDS)[number];
const blocks: W[][] = [];
WORDS.forEach((w, i) => {
  const b = blocks[blocks.length - 1];
  const prev = b?.[b.length - 1];
  const len = b ? b.map((x) => x.w).join(" ").length + 1 + w.w.length : 0;
  // ~24 characters a block, but a phrase's last word never sits alone (up to 34)
  const nx = WORDS[i + 1];
  const endsPhrase = w.br || nx?.piece !== w.piece || nx?.w === "y" || nx?.w === "porque";
  const full = len > 24 && !(endsPhrase && len <= 34);
  if (!b || full || prev!.br || w.piece !== prev!.piece || w.w === "y" || w.w === "porque") blocks.push([w]);
  else b.push(w);
});
const HL = new Set(["Navidad.", "Navidad,", "Navidad", "RE:SET", "pijamas", "familia.", "verde,", "blanca", "matching", "cómodos"]);

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = blocks.findIndex((b, k) => t >= b[0].s - 0.06 && t < Math.min(blocks[k + 1]?.[0].s ?? 1e9, b[b.length - 1].e + 0.4));
  if (i < 0) return null;
  const b = blocks[i];
  const o = interpolate(t, [b[0].s - 0.06, b[0].s + 0.06], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: 1040, left: 90, right: 90, height: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ opacity: o, textAlign: "center", fontFamily: "Montserrat", fontWeight: 700, fontSize: 58, lineHeight: 1.18, color: COLORS.ivory, textShadow: SHADOW, background: "rgba(16,16,16,0.38)", padding: "10px 24px 14px", borderRadius: 16 }}>
        {b.map((w, k) => (
          <span key={k} style={{ color: HL.has(w.w) ? COLORS.lime : COLORS.ivory }}>
            {k ? " " : ""}
            {w.w}
          </span>
        ))}
      </div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = (s: number, d = 12) => interpolate(f, [s, s + d], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a(0, 14), background: "linear-gradient(180deg, rgba(12,12,12,0.05) 20%, rgba(12,12,12,0.62) 50%, rgba(12,12,12,0.72) 100%)" }} />
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={staticFile(END.logo)} style={{ width: 520, opacity: a(4), transform: `translateY(${(1 - a(4)) * 16}px)` }} />
        <div style={{ marginTop: 40, opacity: a(12), transform: `translateY(${(1 - a(12)) * 12}px)`, fontFamily: "Montserrat", fontWeight: 600, fontSize: 46, color: COLORS.ivory, textShadow: SHADOW, textAlign: "center" }}>{END.line}</div>
        <div style={{ marginTop: 36, display: "flex", gap: 24, opacity: a(16) }}>
          <PriceTag size="ninos" scale={0.85} delay={16} />
          <PriceTag size="adulto" scale={0.85} delay={19} />
        </div>
        <div style={{ marginTop: 36, opacity: a(24), transform: `scale(${0.92 + 0.08 * a(24)})`, background: COLORS.lime, color: COLORS.ink, fontFamily: "Montserrat", fontWeight: 800, fontSize: 46, padding: "22px 54px", borderRadius: 999 }}>{END.cta}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Navidad: React.FC = () => {
  const end = SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SHOTS.map((s) => {
        const from = F(s.from);
        const frames = F(s.to) - from;
        return (
          <Sequence key={s.name} name={s.name} from={from} durationInFrames={frames}>
            <ShotView s={s} frames={frames} />
          </Sequence>
        );
      })}
      <Vignette />
      <Hook />
      <Chip {...BRAND_CHIP} top={300} strong />
      {TAGS.map((t) => (
        <Chip key={t.text} {...t} top={300} />
      ))}
      <Copy />
      <Sequence from={0} durationInFrames={F(end.from)}>
        <Captions />
      </Sequence>
      <Sequence from={F(end.from)}>
        <EndCard />
      </Sequence>
      <Audio src={staticFile(VOICE)} />
    </AbsoluteFill>
  );
};
