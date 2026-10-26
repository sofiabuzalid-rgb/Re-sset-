// RE:SET — PICK YOUR COLOR. Escenas reutilizables; Main (15 s), Short (7.5 s) y Cover (portada) las combinan.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { b, COPY, Cut, CUTS, DETAILS, FPS, MUSIC, NAMES, PALETTE, SCENES, SFX, Tone } from "./config";

loadFont({ family: "Playfair", url: staticFile("fonts/PlayfairDisplay-Variable.woff2"), weight: "400 900" });
loadFont({ family: "Playfair", url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"), weight: "400 900", style: "italic" });
loadFont({ family: "Manrope", url: staticFile("fonts/Manrope-Variable.woff2"), weight: "200 800" });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE = Easing.bezier(0.22, 1, 0.36, 1); // fast-out, long settle: editorial, never bouncy
const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);
const P = PALETTE;
const SERIF: React.CSSProperties = { fontFamily: "Playfair", color: P.ink };
const SANS: React.CSSProperties = { fontFamily: "Manrope", color: P.ink, textTransform: "uppercase" };
const W = 1080;

/* ---------- primitives ---------- */

/** the model, cut out (transparent VP9), anchored to the top so her chin stays out of frame */
const Cutout: React.FC<{ c: Cut; at?: number; style?: React.CSSProperties }> = ({ c, at, style }) => {
  const s = c.scale ?? 1;
  return (
    <OffthreadVideo
      transparent
      muted
      src={staticFile(`pyc/${c.src}.webm`)}
      startFrom={Math.round((at ?? c.at) * FPS)}
      style={{ position: "absolute", top: c.y ?? 0, left: (W - W * s) / 2 + (c.x ?? 0), width: W * s, height: 1920 * s, filter: "drop-shadow(0 26px 40px rgba(70,50,40,0.10))", ...style }}
    />
  );
};

/** a vertical strip of a cut-out look (used for the triptychs and the split screen) */
const Strip: React.FC<{ c: Cut; at?: number; left: number; width: number; reveal: number; from?: "top" | "bottom" }> = ({ c, at, left, width, reveal, from = "bottom" }) => {
  const r = 100 * (1 - reveal);
  return (
    <div style={{ position: "absolute", top: 0, left, width, height: 1920, overflow: "hidden", background: P.paper, clipPath: from === "bottom" ? `inset(${r}% 0 0 0)` : `inset(0 0 ${r}% 0)` }}>
      <div style={{ position: "absolute", left: (width - W) / 2, top: 0, width: W, height: 1920, transform: `translateY(${(1 - reveal) * (from === "bottom" ? 60 : -60)}px)` }}>
        <Cutout c={c} at={at} />
      </div>
    </div>
  );
};

/** type that rises out of an invisible mask */
const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number; out?: number }> = ({ at, children, style, dur = 9, out }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], { ...clamp, easing: EASE });
  const o = out === undefined ? 1 : interpolate(f, [out - 5, out], [1, 0], clamp);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 105}%)`, opacity: o }}>{children}</div>
    </div>
  );
};

const Swatch: React.FC<{ tone: Tone; size?: number; active?: boolean }> = ({ tone, size = 22, active = true }) => (
  <div style={{ width: size, height: size, borderRadius: size, background: active ? P[tone] : "transparent", border: `1.5px solid ${active ? P[tone] : "rgba(31,29,27,0.35)"}`, boxShadow: active ? "0 0 0 4px rgba(246,243,238,0.9)" : "none" }} />
);

/* ---------- scenes (each starts at its own frame 0) ---------- */

/** 0–2.25 s · WARNING → blush/sage/grey on the beat → the three side by side */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const looks: Cut[] = [{ ...CUTS.blushFront, at: 0.2 }, { ...CUTS.sageFront, at: 0.3 }, { ...CUTS.greyFront, at: 0.4 }];
  const k = f < b(1) ? 0 : f < b(2) ? 1 : 2;
  const tri = f >= b(3);
  const rv = (i: number) => interpolate(f, [b(3) + i * 2, b(3) + i * 2 + 8], [0, 1], { ...clamp, easing: EASE });
  const punch = interpolate(f % b(1), [0, 5], [1.04, 1], { ...clamp, easing: EASE }); // a tiny settle on every cut
  return (
    <AbsoluteFill style={{ background: P.paper }}>
      {!tri && (
        <AbsoluteFill style={{ transform: `scale(${punch})`, transformOrigin: "50% 40%" }}>
          <Cutout c={looks[k]} />
        </AbsoluteFill>
      )}
      {tri && [CUTS.blushFront, CUTS.sageFront, CUTS.greyFront].map((c, i) => <Strip key={i} c={c} at={0.9} left={i * 360} width={360} reveal={rv(i)} from={i === 1 ? "top" : "bottom"} />)}
      {tri && [1, 2].map((i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: i * 360 - 1, width: 2, background: P.paper, opacity: rv(i) }} />)}
      {/* headline: WARNING is already there on frame 0 (thumbnail), the line follows the first switch */}
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ ...SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 156, lineHeight: 1, letterSpacing: "-0.02em", transform: `scale(${interpolate(f, [0, 6], [1.06, 1], { ...clamp, easing: EASE })})`, textShadow: "0 0 30px rgba(246,243,238,0.9)" }}>{COPY.warning}</div>
        {COPY.hook.map((l, i) => (
          <Rise key={l} at={b(1) + i * 3} style={{ marginTop: i ? 4 : 22 }}>
            <div style={{ ...SANS, fontWeight: 800, fontSize: 54, letterSpacing: "0.06em", lineHeight: 1.12, textShadow: "0 0 24px rgba(246,243,238,0.95)" }}>{l}</div>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** 2.25–4.5 s · BLUSH / SAGE / GREY, each a lateral mask reveal over the last */
export const Meet: React.FC = () => {
  const f = useCurrentFrame();
  const items: { c: Cut; at: number; tone: Tone; n: string }[] = [
    { c: CUTS.blushArms, at: 0.2, tone: "blush", n: "01" },
    { c: CUTS.sageFront2, at: 0.2, tone: "sage", n: "02" },
    { c: { ...CUTS.greyFront, at: 1.2 }, at: 1.2, tone: "grey", n: "03" },
  ];
  return (
    <AbsoluteFill style={{ background: P.paper }}>
      {items.map((it, i) => {
        const start = i * b(2);
        if (f < start - 1) return null;
        const r = i === 0 ? 1 : interpolate(f, [start, start + 7], [0, 1], { ...clamp, easing: EASE_IO });
        const local = f - start;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(0 0 0 ${100 * (1 - r)}%)` }}>
            <AbsoluteFill style={{ background: P.paper }} />
            <AbsoluteFill style={{ transform: `scale(${interpolate(local, [0, b(2)], [1.0, 1.04], clamp)})`, transformOrigin: "50% 30%" }}>
              <Cutout c={it.c} at={it.at} />
            </AbsoluteFill>
            {/* label: index + name in high-contrast serif + a swatch of the real tone */}
            <div style={{ position: "absolute", left: 0, top: 1000, padding: "22px 60px 18px 72px", background: "linear-gradient(90deg, rgba(246,243,238,0.94) 0%, rgba(246,243,238,0.88) 70%, rgba(246,243,238,0) 100%)" }}>
              <Rise at={start + 3}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Swatch tone={it.tone} size={26} />
                  <div style={{ ...SANS, fontWeight: 600, fontSize: 26, letterSpacing: "0.28em" }}>{it.n} — {COPY.meetSub}</div>
                </div>
              </Rise>
              <Rise at={start + 5}>
                <div style={{ ...SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 190, lineHeight: 1.0, letterSpacing: "-0.02em", textShadow: "0 0 30px rgba(246,243,238,0.85)" }}>{NAMES[it.tone]}</div>
              </Rise>
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** 4.5–7.5 s · split screen: fabric on the left, the full look on the right, a loupe on the seam */
export const Details: React.FC = () => {
  const f = useCurrentFrame();
  const pairs = [
    { d: DETAILS.stripes, c: { ...CUTS.blushFront, at: 1.0 } },
    { d: DETAILS.vneck, c: { ...CUTS.sageFront2, at: 1.0 } },
    { d: DETAILS.cord, c: { ...CUTS.greyCord, at: 0.4 } },
    { d: DETAILS.trio, c: { ...CUTS.blushArms, at: 1.0 }, label: "Three colors" },
  ];
  const seg = b(2);
  return (
    <AbsoluteFill style={{ background: P.paper }}>
      {pairs.map((p, i) => {
        const start = i * seg;
        if (f < start - 1 || f >= start + seg + 8) return null;
        const r = i === 0 ? 1 : interpolate(f, [start, start + 8], [0, 1], { ...clamp, easing: EASE_IO });
        const r2 = i === 0 ? 1 : interpolate(f, [start + 2, start + 10], [0, 1], { ...clamp, easing: EASE_IO });
        const local = f - start;
        return (
          <AbsoluteFill key={i}>
            {/* left: the fabric, real take */}
            <div style={{ position: "absolute", left: 0, top: 0, width: 540, height: 1920, overflow: "hidden", clipPath: `inset(${100 * (1 - r)}% 0 0 0)` }}>
              <OffthreadVideo muted src={staticFile(p.d.src)} startFrom={Math.round(p.d.at * FPS)} style={{ width: 1080, height: 1920, marginLeft: -270, objectFit: "cover", transform: `scale(${interpolate(local, [0, seg], [1.06, 1.12], clamp)})` }} />
            </div>
            {/* right: the complete look */}
            <div style={{ position: "absolute", left: 540, top: 0, width: 540, height: 1920, overflow: "hidden", background: P.paper, clipPath: `inset(0 0 ${100 * (1 - r2)}% 0)` }}>
              <div style={{ position: "absolute", left: -270, top: 0, width: 1080, height: 1920 }}>
                <Cutout c={p.c} />
              </div>
            </div>
            {/* loupe: the same fabric magnified, sitting on the seam */}
            <div style={{ position: "absolute", left: 540 - 170, top: 700, width: 340, height: 340, borderRadius: 340, overflow: "hidden", border: `3px solid ${P.paper}`, boxShadow: "0 18px 40px rgba(60,40,30,0.18)", transform: `scale(${interpolate(f, [start + 3, start + 12], [0.6, 1], { ...clamp, easing: EASE })})`, opacity: interpolate(f, [start + 3, start + 8], [0, 1], clamp) }}>
              <OffthreadVideo muted src={staticFile(p.d.src)} startFrom={Math.round(p.d.at * FPS)} style={{ width: 1080 * 1.1, height: 1920 * 1.1, marginLeft: -(1080 * 1.1 - 340) / 2, marginTop: -(1920 * 1.1 - 340) / 2, objectFit: "cover" }} />
            </div>
            <Rise at={start + 4} style={{ position: "absolute", left: 60, top: 300 }}>
              <div style={{ ...SANS, fontWeight: 700, fontSize: 26, letterSpacing: "0.26em", color: P.paper, textShadow: "0 1px 12px rgba(0,0,0,0.35)" }}>{p.label ?? p.d.label}</div>
            </Rise>
          </AbsoluteFill>
        );
      })}
      {/* the three lines stack up on a paper card, bottom left */}
      <div style={{ position: "absolute", left: 0, top: 1040, width: 540, padding: "26px 0 22px 60px", background: "rgba(246,243,238,0.92)" }}>
        {COPY.details.map((l, i) => (
          <Rise key={l} at={4 + i * Math.round(b(8) / 3)}>
            <div style={{ ...SERIF, fontWeight: 600, fontSize: 54, lineHeight: 1.12, letterSpacing: "-0.01em" }}>{l}</div>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** 7.5–10.5 s · the colour switch: same frame, the set changes colour under a wipe; indicator dots follow */
export const Swap: React.FC<{ beats?: number }> = ({ beats = SCENES.swap }) => {
  const f = useCurrentFrame();
  const seq: Cut[] = [
    { ...CUTS.blushFront, at: 0.9 },
    { ...CUTS.sageFront, at: 1.1 },
    { ...CUTS.greyFront, at: 1.6 },
    { ...CUTS.blushArms, at: 0.2 },
  ];
  const seg = Math.round(b(beats) / seq.length);
  const k = Math.min(seq.length - 1, Math.floor(f / seg));
  return (
    <AbsoluteFill style={{ background: P.paper }}>
      {seq.map((c, i) => {
        const start = i * seg;
        if (f < start - 1 || f >= start + seg + 6) return null;
        const r = i === 0 ? 1 : interpolate(f, [start, start + 6], [0, 1], { ...clamp, easing: EASE_IO });
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${100 * (1 - r)}% 0 0 0)` }}>
            <AbsoluteFill style={{ background: P.paper }} />
            <Cutout c={c} at={c.at + (f - start) / FPS * 0} />
            {/* the wipe's leading edge: a hairline in the incoming tone */}
            {r < 1 && <div style={{ position: "absolute", left: 0, right: 0, top: `${100 * (1 - r)}%`, height: 3, background: P[c.tone] }} />}
          </AbsoluteFill>
        );
      })}
      {/* colour indicator, bottom right, inside the safe zone */}
      <div style={{ position: "absolute", right: 64, top: 1120, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-end" }}>
        {(["blush", "sage", "grey"] as Tone[]).map((t) => {
          const on = seq[k].tone === t;
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ ...SANS, fontWeight: on ? 800 : 500, fontSize: 24, letterSpacing: "0.24em", opacity: on ? 1 : 0.45 }}>{NAMES[t]}</div>
              <Swatch tone={t} size={on ? 26 : 18} active={on} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** 10.5–12.4 s · the decision: three looks, three names */
export const Decision: React.FC = () => {
  const f = useCurrentFrame();
  const order: Tone[] = ["grey", "sage", "blush"];
  const cuts: Record<Tone, Cut> = { grey: { ...CUTS.greyFront, at: 0.6 }, sage: { ...CUTS.sageFront, at: 1.4 }, blush: { ...CUTS.blushFront, at: 0.5 } };
  return (
    <AbsoluteFill style={{ background: P.paper }}>
      {order.map((t, i) => (
        <Strip key={t} c={cuts[t]} left={i * 360} width={360} reveal={interpolate(f, [i * 2, i * 2 + 9], [0, 1], { ...clamp, easing: EASE })} from={i === 1 ? "top" : "bottom"} />
      ))}
      {[1, 2].map((i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: i * 360 - 1, width: 2, background: P.paper }} />)}
      <div style={{ position: "absolute", top: 290, left: 0, right: 0, padding: "34px 0 30px", textAlign: "center", background: "linear-gradient(180deg, rgba(246,243,238,0.94), rgba(246,243,238,0.86))" }}>
        <Rise at={3}>
          <div style={{ ...SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 84, lineHeight: 1.05, letterSpacing: "-0.015em" }}>{COPY.which}</div>
        </Rise>
      </div>
      {order.map((t, i) => (
        <Rise key={t} at={8 + i * 2} style={{ position: "absolute", top: 1150, left: i * 360, width: 360 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "rgba(246,243,238,0.92)", margin: "0 36px", padding: "14px 0", borderRadius: 999 }}>
            <Swatch tone={t} size={20} />
            <div style={{ ...SANS, fontWeight: 800, fontSize: 28, letterSpacing: "0.24em" }}>{NAMES[t]}</div>
          </div>
        </Rise>
      ))}
    </AbsoluteFill>
  );
};

/** 12.4–15 s · CTA: the three tops in an editorial window, the line, the brand */
export const Cta: React.FC<{ beats?: number }> = ({ beats = SCENES.cta }) => {
  const f = useCurrentFrame();
  const open = interpolate(f, [0, 10], [0, 1], { ...clamp, easing: EASE });
  const second = Math.round(b(beats) * 0.45);
  return (
    <AbsoluteFill style={{ background: P.paper }}>
      <div style={{ position: "absolute", left: 100, right: 100, top: 520, height: 560, overflow: "hidden", borderRadius: 6, clipPath: `inset(${50 * (1 - open)}% 0 ${50 * (1 - open)}% 0)` }}>
        <OffthreadVideo muted src={staticFile(DETAILS.trio.src)} startFrom={Math.round(1.6 * FPS)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%", transform: `scale(${interpolate(f, [0, b(beats)], [1.08, 1.0], clamp)})` }} />
      </div>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center" }}>
        {COPY.fav.map((l, i) => (
          <Rise key={l} at={2 + i * 3}>
            <div style={{ ...SERIF, fontStyle: i ? "italic" : "normal", fontWeight: i ? 600 : 500, fontSize: i ? 92 : 62, lineHeight: 1.04, letterSpacing: i ? "-0.015em" : "0.08em" }}>{l}</div>
          </Rise>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1110, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Rise at={second}>
          <div style={{ ...SANS, fontWeight: 700, fontSize: 30, letterSpacing: "0.3em" }}>{COPY.discover}</div>
        </Rise>
        <div style={{ display: "flex", gap: 14, opacity: interpolate(f, [second + 4, second + 12], [0, 1], clamp) }}>
          {(["grey", "sage", "blush"] as Tone[]).map((t) => <Swatch key={t} tone={t} size={18} />)}
        </div>
      </div>
      <Img src={staticFile(COPY.logo)} style={{ position: "absolute", top: 1205, left: (W - 230) / 2, width: 230, opacity: interpolate(f, [second + 6, second + 16], [0, 1], { ...clamp, easing: EASE }) }} />
    </AbsoluteFill>
  );
};

/* ---------- sound: SFX on every switch, licensed music slot ---------- */
const Sfx: React.FC<{ whoosh: number[]; tick: number[] }> = ({ whoosh, tick }) => !SFX.enabled ? null : (
  <>
    {whoosh.map((t, i) => (
      <Sequence key={`w${i}`} from={Math.max(0, t - 3)} durationInFrames={12}>
        <Audio src={staticFile(SFX.whoosh)} volume={SFX.volume} />
      </Sequence>
    ))}
    {tick.map((t, i) => (
      <Sequence key={`t${i}`} from={t} durationInFrames={4}>
        <Audio src={staticFile(SFX.tick)} volume={SFX.volume * 0.8} />
      </Sequence>
    ))}
  </>
);
const Music: React.FC<{ frames: number }> = ({ frames }) =>
  MUSIC.src ? <Audio src={staticFile(MUSIC.src)} volume={(f) => MUSIC.volume * interpolate(f, [frames - 12, frames], [1, 0], clamp)} /> : null;

/* ---------- cuts ---------- */
const Track: React.FC<{ parts: { s: React.FC<any>; beats: number; props?: object }[] }> = ({ parts }) => {
  let at = 0;
  return (
    <>
      {parts.map((p, i) => {
        const from = at;
        at += b(p.beats);
        const S = p.s;
        return (
          <Sequence key={i} from={from} durationInFrames={b(p.beats)}>
            <S {...(p.props ?? {})} />
          </Sequence>
        );
      })}
    </>
  );
};

export const MAIN_FRAMES = b(Object.values(SCENES).reduce((a, x) => a + x, 0));
export const Main: React.FC = () => {
  const s = SCENES;
  const o = { meet: b(s.hook), det: b(s.hook + s.meet), swap: b(s.hook + s.meet + s.details), dec: b(s.hook + s.meet + s.details + s.swap), cta: b(s.hook + s.meet + s.details + s.swap + s.decision) };
  return (
    <AbsoluteFill style={{ background: P.paper }}>
      <Track parts={[{ s: Hook, beats: s.hook }, { s: Meet, beats: s.meet }, { s: Details, beats: s.details }, { s: Swap, beats: s.swap }, { s: Decision, beats: s.decision }, { s: Cta, beats: s.cta }]} />
      <Sfx
        whoosh={[b(1), b(2), b(3), o.meet, o.meet + b(2), o.meet + b(4), o.det, o.det + b(2), o.det + b(4), o.det + b(6), o.swap, o.swap + b(2), o.swap + b(4), o.swap + b(6), o.dec, o.cta]}
        tick={[0, b(1), o.dec + 3, o.cta + b(s.cta) * 0.45]}
      />
      <Music frames={MAIN_FRAMES} />
    </AbsoluteFill>
  );
};

export const SHORT_BEATS = { hook: 6, swap: 8, cta: 6 };
export const SHORT_FRAMES = b(SHORT_BEATS.hook + SHORT_BEATS.swap + SHORT_BEATS.cta);
export const Short: React.FC = () => {
  const s = SHORT_BEATS;
  const sw = b(s.hook);
  const cta = b(s.hook + s.swap);
  return (
    <AbsoluteFill style={{ background: P.paper }}>
      <Track parts={[{ s: Hook, beats: s.hook }, { s: Swap, beats: s.swap, props: { beats: s.swap } }, { s: Cta, beats: s.cta, props: { beats: s.cta } }]} />
      <Sfx whoosh={[b(1), b(2), b(3), sw, sw + b(2), sw + b(4), sw + b(6), cta]} tick={[0, b(1), cta + b(s.cta) * 0.45]} />
      <Music frames={SHORT_FRAMES} />
    </AbsoluteFill>
  );
};
