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
import familia from "./familia.json";
import familiaSubs from "./familia.subs.json";

loadFont({
  family: "Montserrat",
  url: staticFile("fonts/Montserrat-Variable.woff2"),
  weight: "100 900",
});
loadFont({
  family: "Playfair Display",
  url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"),
  weight: "400 900",
  style: "italic",
});
// Gotham is the brand face; Montserrat is the closest available stand-in until the Gotham files are supplied.
const SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
const SERIF = '"Playfair Display", Georgia, serif';
const C = {
  ivory: "#FBF5EA",
  pine: "#0E2A1E",
  pineDeep: "#071A12",
  gold: "#D8B56A",
};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));
const SHADOW = "0 1px 2px rgba(0,0,0,0.55), 0 2px 12px rgba(0,0,0,0.4)";

type Shot = {
  id: string;
  frames: number;
  zoom?: number[];
  focus?: number[];
  card?: boolean;
  xf?: number;
};
type Edit = {
  texts: { from: number; to: number; kind: string; lines: string[] }[];
  subtitleTop: number;
  end: { title: string; places: string[][] };
  shots: Shot[];
};
type Sub = { from: number; to: number; text: string };

export const VOICE_ADS = {
  familia: { edit: familia as unknown as Edit, subs: familiaSubs as Sub[] },
};
export type VoiceAdId = keyof typeof VOICE_ADS;

const layout = (edit: Edit) => {
  let t = 0;
  return edit.shots.map((s) => {
    const o = { ...s, from: t, xf: s.xf ?? 0 };
    t += s.frames;
    return o;
  });
};
export const voiceAdTotal = (ad: VoiceAdId) =>
  VOICE_ADS[ad].edit.shots.reduce((n, s) => n + s.frames, 0);

const ShotView: React.FC<{ ad: string; s: Shot & { from: number } }> = ({
  ad,
  s,
}) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom![0] + (s.zoom![1] - s.zoom![0]) * p;
  const origin = `${s.focus![0] * 100}% ${s.focus![1] * 100}%`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        muted
        src={staticFile(`${ad}/${s.id}.mp4`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${z})`,
          transformOrigin: origin,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 90% 75% at 50% 50%, rgba(0,0,0,0) 62%, rgba(20,10,4,0.28) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Graphic kicker: a light serif line over a heavier sans line, never a logo. */
const Kicker: React.FC<{ lines: string[]; dur: number }> = ({ lines, dur }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  return (
    <>
    <AbsoluteFill
      style={{
        opacity: out * ramp(f, 0, 4),
        background:
          "linear-gradient(180deg, rgba(8,5,2,0.55) 0%, rgba(8,5,2,0.35) 22%, rgba(8,5,2,0) 36%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 226,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        color: C.ivory,
        textShadow: SHADOW,
        opacity: out,
      }}
    >
      {lines.map((l, i) => {
        const p = ramp(f, i * 5, 10);
        return (
          <div key={l} style={{ overflow: "hidden", padding: "2px 16px" }}>
            <div
              style={{
                fontFamily: i === 0 ? SERIF : SANS,
                fontStyle: i === 0 ? "italic" : "normal",
                fontWeight: i === 0 ? 500 : 700,
                fontSize: i === 0 ? 60 : 66,
                letterSpacing: i === 0 ? 0 : "-0.01em",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                opacity: p,
                transform: `translateY(${(1 - p) * 60}%)`,
              }}
            >
              {l}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
};

/** Her words, literally: ivory, two lines max, plain 3-frame fades, kept clear of the product. */
const Subtitle: React.FC<{ text: string; dur: number; top: number }> = ({
  text,
  dur,
  top,
}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          padding: "10px 22px 12px",
          borderRadius: 14,
          background: "rgba(10,6,3,0.34)",
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 46,
          lineHeight: 1.22,
          color: C.ivory,
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const EndCard: React.FC<{ edit: Edit; xf: number }> = ({ edit, xf }) => {
  const f = useCurrentFrame();
  const veil = interpolate(f, [0, xf], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: veil,
        background: `radial-gradient(ellipse 80% 60% at 50% 42%, ${C.pine} 0%, ${C.pineDeep} 100%)`,
        color: C.ivory,
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 470,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Img
          src={staticFile("brand/reset-logo-white.png")}
          style={{
            width: 360,
            opacity: ramp(f, 2, 14),
            transform: `translateY(${(1 - ramp(f, 2, 14)) * 10}px)`,
          }}
        />
        <div
          style={{
            marginTop: 40,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 60,
            lineHeight: 1.15,
            maxWidth: 860,
            opacity: ramp(f, 10, 14),
          }}
        >
          {edit.end.title}
        </div>
        <div
          style={{
            marginTop: 50,
            width: 80 * ramp(f, 18, 14),
            height: 2,
            background: C.gold,
          }}
        />
        <div style={{ marginTop: 34 }}>
          {edit.end.places.map(([place, detail], i) => {
            const p = ramp(f, 22 + i * 6, 14);
            return (
              <div
                key={place}
                style={{
                  marginTop: i ? 26 : 0,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 8}px)`,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 38,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: i === edit.end.places.length - 1 ? C.gold : C.ivory,
                  }}
                >
                  {place}
                </div>
                <div style={{ fontWeight: 400, fontSize: 34, marginTop: 4 }}>
                  {detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const VoiceAd: React.FC<{ ad: VoiceAdId }> = ({ ad }) => {
  const { edit, subs } = VOICE_ADS[ad];
  const shots = layout(edit);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {shots.map((s) => (
        <Sequence
          key={s.id}
          from={s.from - s.xf}
          durationInFrames={s.frames + s.xf}
          premountFor={15}
        >
          {s.card ? <EndCard edit={edit} xf={s.xf} /> : <ShotView ad={ad} s={s} />}
        </Sequence>
      ))}
      {edit.texts.map((t) => (
        <Sequence key={t.from} from={t.from} durationInFrames={t.to - t.from}>
          <Kicker lines={t.lines} dur={t.to - t.from} />
        </Sequence>
      ))}
      {subs.map((s) => (
        <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
          <Subtitle text={s.text} dur={s.to - s.from} top={edit.subtitleTop} />
        </Sequence>
      ))}
      <Audio src={staticFile(`${ad}/mix.wav`)} />
    </AbsoluteFill>
  );
};
