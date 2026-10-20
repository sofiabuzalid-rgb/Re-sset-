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
import a1 from "./a1.json";
import a2 from "./a2.json";
import a3 from "./a3.json";
import a4 from "./a4.json";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Bebas Neue", url: staticFile("fonts/BebasNeue-Regular.woff2"), weight: "400" });
// Gotham is the brand face; Montserrat stands in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const DISPLAY = '"Bebas Neue", Gotham, Montserrat, sans-serif';
const CREAM = "#F7EFE3";
const INK = "#141414";
const SHADOW = "0 2px 4px rgba(0,0,0,0.45), 0 4px 24px rgba(0,0,0,0.38)";
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) => easeOut(Math.min(1, Math.max(0, (f - a) / d)));

/* eslint-disable @typescript-eslint/no-explicit-any */
type Ad = { id: string; accent: string; theme: string; shots: any[]; texts: any[] };
export const ADS: Record<string, Ad> = { a1, a2, a3, a4 } as any;
export const adTotal = (ad: Ad) => ad.shots.reduce((n: number, s: any) => n + s.frames, 0);

const Media: React.FC<{ ad: string; id: string; photo: boolean }> = ({ ad, id, photo }) =>
  photo ? (
    <Img src={staticFile(`meta4/${ad}/${id}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  ) : (
    <OffthreadVideo muted src={staticFile(`meta4/${ad}/${id}.mp4`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  );

const ShotView: React.FC<{ ad: Ad; s: any }> = ({ ad, s }) => {
  const f = useCurrentFrame();
  const photo = /\.(heic|jpe?g|png)$/i.test(s.src);
  const zoom = s.zoom ?? [1.0, 1.03];
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  // slow push/pull + a short settle on every cut so hard cuts feel intentional
  const z = (zoom[0] + (zoom[1] - zoom[0]) * p) * (1 + 0.03 * (1 - ramp(f, 0, 6)));
  if (s.kind === "split") {
    const half = (id: string, i: number) => {
      const q = ramp(f, i * 4, 12);
      return (
        <div style={{ position: "absolute", top: 0, bottom: 0, left: i ? 543 : 0, width: 537, overflow: "hidden", opacity: q }}>
          <div style={{ width: "100%", height: "100%", transform: `scale(${1.04 + 0.04 * p}) translateY(${(1 - q) * 40}px)` }}>
            <Media ad={ad.id} id={id} photo={false} />
          </div>
        </div>
      );
    };
    return (
      <AbsoluteFill style={{ backgroundColor: CREAM }}>
        {half(s.id, 0)}
        {half(`${s.id}r`, 1)}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: s.bg ?? "#000" }}>
      <div style={{ width: "100%", height: "100%", transform: `scale(${z})` }}>
        <Media ad={ad.id} id={s.id} photo={photo} />
      </div>
    </AbsoluteFill>
  );
};

/** Masked line reveal (rises from below its own baseline). */
const Rise: React.FC<{ f: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ f, at, children, style }) => {
  const p = ramp(f, at, 9);
  return (
    <div style={{ overflow: "hidden", paddingTop: 10, marginTop: -10 }}>
      <div style={{ transform: `translateY(${(1 - p) * 105}%)`, ...style }}>{children}</div>
    </div>
  );
};

const Hero: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: t.y, textAlign: "center" }}>
    {t.lines.map((l: string, i: number) => (
      <Rise key={i} f={f} at={i * 4}>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: t.size,
            lineHeight: 1.02,
            letterSpacing: "-0.01em",
            color: t.accent && i === t.lines.length - 1 ? accent : "#fff",
            textShadow: SHADOW,
          }}
        >
          {l}
        </div>
      </Rise>
    ))}
  </div>
);

const Kicker: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => {
  const k = ramp(f, 0, 10);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: t.y, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.34em",
          color: INK,
          background: accent,
          padding: "10px 22px 10px 30px",
          marginBottom: 22,
          opacity: k,
          transform: `scaleX(${0.6 + 0.4 * k})`,
        }}
      >
        {t.kick}
      </div>
      {t.lines.map((l: string, i: number) => (
        <Rise key={i} f={f} at={4 + i * 4}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 118, lineHeight: 1.02, color: "#fff", textShadow: SHADOW, textAlign: "center" }}>{l}</div>
        </Rise>
      ))}
    </div>
  );
};

const Price: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: t.y, display: "flex", justifyContent: "center", gap: 28 }}>
    {t.items.map(([who, pre, v]: string[], i: number) => {
      const p = ramp(f, i * 7, 12);
      return (
        <div
          key={who}
          style={{
            width: 440,
            background: "rgba(247,239,227,0.94)",
            borderRadius: 6,
            padding: "26px 0 18px",
            textAlign: "center",
            opacity: p,
            transform: `translateY(${(1 - p) * 40}px)`,
            boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: "0.3em", color: INK, paddingLeft: "0.3em" }}>{who}</div>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: "0.32em", color: "#6b6b6b", marginTop: 10, paddingLeft: "0.32em" }}>{pre}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 168, lineHeight: 0.95, color: INK, marginTop: 6 }}>{v}</div>
          <div style={{ height: 6, width: 90, background: accent, margin: "8px auto 0" }} />
        </div>
      );
    })}
  </div>
);

const Logo: React.FC<{ width: number; dark?: boolean; opacity?: number }> = ({ width, dark, opacity = 1 }) => (
  <Img src={staticFile(`brand/reset-logo-${dark ? "black" : "white"}.png`)} style={{ width, opacity }} />
);

const Button: React.FC<{ text: string; f: number; at: number; accent: string; size?: number }> = ({ text, f, at, accent, size = 40 }) => {
  const p = ramp(f, at, 12);
  const pulse = 1 + 0.025 * Math.max(0, Math.sin(((f - at - 20) / 30) * Math.PI * 2)) * (f > at + 20 ? 1 : 0);
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: "0.16em",
        color: INK,
        background: accent,
        padding: `${size * 0.6}px ${size * 1.3}px ${size * 0.6}px ${size * 1.46}px`,
        borderRadius: 999,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px) scale(${pulse})`,
        boxShadow: "0 14px 40px rgba(0,0,0,0.3)",
      }}
    >
      {text}
    </div>
  );
};

const End: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => {
  const d = interpolate(f, [0, 12], [0, t.dim ?? 0.5], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(10,10,10,${d})` }} />
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: ramp(f, 2, 14) }}>
        <Logo width={360} />
      </div>
      <div style={{ position: "absolute", top: 600, left: 70, right: 70, textAlign: "center" }}>
        {t.title.map((l: string, i: number) => (
          <Rise key={i} f={f} at={8 + i * 4}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, lineHeight: 1.06, color: "#fff", textShadow: SHADOW }}>{l}</div>
          </Rise>
        ))}
      </div>
      {t.price ? (
        <div style={{ position: "absolute", top: 830, left: 0, right: 0, textAlign: "center", opacity: ramp(f, 18, 12) }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1, color: accent, textShadow: SHADOW }}>{t.price}</div>
        </div>
      ) : null}
      {t.sub ? (
        <div
          style={{
            position: "absolute",
            top: t.price ? 1010 : 850,
            left: 90,
            right: 90,
            textAlign: "center",
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 30,
            lineHeight: 1.5,
            letterSpacing: "0.18em",
            color: CREAM,
            textShadow: SHADOW,
            opacity: ramp(f, 20, 12),
          }}
        >
          {t.sub}
        </div>
      ) : null}
      <div style={{ position: "absolute", top: 1120, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Button text={t.cta} f={f} at={26} accent={accent} />
      </div>
    </AbsoluteFill>
  );
};

const Label: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => {
  const p = ramp(f, 0, 10);
  return (
    <div style={{ position: "absolute", left: 70, top: t.y, display: "flex", alignItems: "stretch", opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 92, lineHeight: 1, color: INK, background: accent, padding: "14px 22px 6px" }}>{t.n}</div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 46,
          color: INK,
          background: CREAM,
          padding: "0 34px",
          display: "flex",
          alignItems: "center",
          clipPath: `inset(0 ${(1 - ramp(f, 3, 12)) * 100}% 0 0)`,
        }}
      >
        {t.text}
      </div>
    </div>
  );
};

const Split: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => (
  <>
    {[t.left, t.right].map((txt: string, i: number) => {
      const p = ramp(f, 6 + i * 6, 10);
      return (
        <div key={txt} style={{ position: "absolute", top: t.y, left: i ? 543 : 0, width: 537, display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: "0.12em", color: INK, background: i ? accent : CREAM, padding: "16px 26px" }}>{txt}</div>
        </div>
      );
    })}
  </>
);

const Sizes: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => {
  const p = ramp(f, 0, 12);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: t.y, display: "flex", flexDirection: "column", alignItems: "center", opacity: p }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: "0.34em", color: INK, background: accent, padding: "10px 20px 10px 30px" }}>{t.kick}</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1.05, color: "#fff", textShadow: SHADOW, marginTop: 10, transform: `translateY(${(1 - p) * 30}px)` }}>{t.text}</div>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: "0.06em", color: CREAM, textShadow: SHADOW, marginTop: 4 }}>{t.note}</div>
    </div>
  );
};

const BigPrice: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => {
  const slam = interpolate(f, [0, 7], [1.5, 1], { ...clamp, easing: easeOut });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: t.y, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, letterSpacing: "0.2em", color: INK, background: accent, padding: "8px 26px 8px 39px" }}>{t.kick}</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: "0.4em", color: "#fff", textShadow: SHADOW, marginTop: 26, paddingLeft: "0.4em" }}>{t.pre}</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 330, lineHeight: 0.9, color: "#fff", textShadow: "0 6px 40px rgba(0,0,0,0.45)", transform: `scale(${slam})` }}>{t.price}</div>
    </div>
  );
};

const Chip: React.FC<{ t: any; f: number }> = ({ t, f }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: t.y, display: "flex", justifyContent: "center" }}>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, letterSpacing: "0.2em", color: "#fff", background: INK, padding: "14px 30px 14px 40px", transform: `scale(${interpolate(f, [0, 4], [1.15, 1], clamp)})` }}>{t.text}</div>
  </div>
);

const Tag: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: t.y, display: "flex", justifyContent: "center", opacity: ramp(f, 0, 8) }}>
    <div style={{ fontFamily: DISPLAY, fontSize: 84, lineHeight: 1, color: INK, background: accent, padding: "14px 30px 6px" }}>{t.text}</div>
  </div>
);

const Stack: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: t.y, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Button text={t.lines[0]} f={f} at={0} accent={accent} size={50} />
    <div style={{ height: 34 }} />
    {t.lines.slice(1).map((l: string, i: number) => (
      <Rise key={i} f={f} at={26 + i * 5}>
        <div style={{ fontFamily: SANS, fontWeight: i ? 900 : 700, fontSize: i ? 92 : 44, lineHeight: 1.1, color: "#fff", textShadow: SHADOW, textAlign: "center" }}>{l}</div>
      </Rise>
    ))}
    <div
      style={{
        marginTop: 34,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: "0.22em",
        color: "#fff",
        border: "3px solid #fff",
        padding: "12px 22px 12px 29px",
        textShadow: SHADOW,
        opacity: ramp(f, 52, 12),
      }}
    >
      {t.badge}
    </div>
  </div>
);

const Cta: React.FC<{ t: any; f: number; accent: string }> = ({ t, f, accent }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: t.y, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Button text={t.cta} f={f} at={4} accent={accent} size={58} />
    <div style={{ marginTop: 40, fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: "0.12em", color: INK, background: CREAM, padding: "12px 24px", opacity: ramp(f, 16, 12) }}>{t.sub}</div>
  </div>
);

const TextView: React.FC<{ t: any; accent: string }> = ({ t, accent }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from;
  const out = t.type === "end" || t.keep ? 1 : interpolate(f, [dur - 4, dur], [1, 0], clamp);
  const C: Record<string, React.FC<any>> = { hero: Hero, kicker: Kicker, price: Price, end: End, label: Label, split: Split, sizes: Sizes, bigprice: BigPrice, chip: Chip, tag: Tag, stack: Stack, cta: Cta };
  const V = C[t.type];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <V t={t} f={f} accent={accent} />
    </AbsoluteFill>
  );
};

/** Gentle legibility scrims; each ad keeps its own look. */
const Grade: React.FC<{ theme: string }> = ({ theme }) => {
  const top = theme === "clean" ? 0.18 : theme === "bold" ? 0.25 : 0.32;
  const warm = theme === "warm" ? "rgba(255,170,120,0.06)" : theme === "soft" ? "rgba(250,205,200,0.06)" : "transparent";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: warm, mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${top}) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 58%, rgba(0,0,0,${top * 0.9}) 100%)` }} />
    </AbsoluteFill>
  );
};

export const MetaAd: React.FC<{ ad: string }> = ({ ad: id }) => {
  const ad = ADS[id];
  const f = useCurrentFrame();
  let t = 0;
  const seq = ad.shots.map((s: any) => {
    const from = t;
    t += s.frames;
    return (
      <Sequence key={s.id} from={from} durationInFrames={s.frames}>
        <ShotView ad={ad} s={s} />
      </Sequence>
    );
  });
  // brand signature in the first seconds (ads 1–3; ad 4 opens on the RE:SET wall itself)
  const sig = id === "a4" ? 0 : interpolate(f, [4, 14, 80, 92], [0, 0.9, 0.9, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {seq}
      <Grade theme={ad.theme} />
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: sig }}>
        <Logo width={190} />
      </div>
      {ad.texts.map((x: any, i: number) => (
        <Sequence key={i} from={x.from} durationInFrames={x.to - x.from + 1}>
          <TextView t={x} accent={ad.accent} />
        </Sequence>
      ))}
      <Audio src={staticFile(`meta4/${id}/music.wav`)} />
    </AbsoluteFill>
  );
};
