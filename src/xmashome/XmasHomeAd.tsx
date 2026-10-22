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
  white: "#FFFFFF",
};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, d: number) =>
  easeOut(Math.min(1, Math.max(0, (f - a) / d)));
const SHADOW = "0 1px 2px rgba(0,0,0,0.45), 0 2px 16px rgba(0,0,0,0.35)";
const FPS = edit.fps;

type Shot = {
  id: string;
  frames: number;
  zoom?: number[];
  focus?: number[];
  card?: boolean;
  from: number;
  xf: number;
};
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots as (Omit<Shot, "from" | "xf"> & { xf?: number })[]) {
    shots.push({ ...s, from: t, xf: s.xf ?? 0 });
    t += s.frames;
  }
}
export const XMASHOME_TOTAL =
  shots[shots.length - 1].from + shots[shots.length - 1].frames;

// subtitles are timed in voice-source seconds; place them on the edit timeline
const subs = (edit.subtitles as { a: number; b: number; text: string }[]).map(
  (s) => ({
    text: s.text,
    from: edit.voice.at + Math.round((s.a - edit.voice.a) * FPS),
    to: edit.voice.at + Math.round((s.b - edit.voice.a) * FPS),
  }),
);

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const dur = s.frames + s.xf;
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / dur));
  const z = s.zoom![0] + (s.zoom![1] - s.zoom![0]) * p;
  const o = s.xf ? interpolate(f, [0, s.xf], [0, 1], clamp) : 1;
  const origin = `${s.focus![0] * 100}% ${s.focus![1] * 100}%`;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: o }}>
      <OffthreadVideo
        muted
        src={staticFile(`xmashome/${s.id}.mp4`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${z})`,
          transformOrigin: origin,
        }}
      />
    </AbsoluteFill>
  );
};

/** Warm room glow + vignette over the footage: a whisper of gold from the lamps, never over the product's colour. */
const Finish: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 85% 8%, rgba(255,196,120,0.10) 0%, rgba(255,196,120,0) 70%), radial-gradient(ellipse 60% 35% at 10% 95%, rgba(255,180,100,0.08) 0%, rgba(255,180,100,0) 70%)",
        mixBlendMode: "screen",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 90% 75% at 50% 50%, rgba(0,0,0,0) 62%, rgba(20,10,4,0.32) 100%)",
      }}
    />
  </AbsoluteFill>
);

/** Hook: serif italic lead-in over a sans line; readable from frame ~8. Script lines: one calm serif line. */
const Headline: React.FC<{ t: (typeof edit.texts)[number] }> = ({ t }) => {
  const f = useCurrentFrame();
  const dur = t.to - t.from;
  const hook = t.kind === "hook";
  const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
  const top = hook ? 300 : 1180;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: -120,
          right: -120,
          top: top - 170,
          height: 520,
          opacity: out * ramp(f, 0, 6),
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(10,6,2,0.5) 0%, rgba(10,6,2,0.22) 55%, rgba(10,6,2,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: C.ivory,
          textShadow: SHADOW,
          opacity: out,
        }}
      >
        {t.lines.map((l, i) => {
          const p = hook ? ramp(f, i * 6, 10) : ramp(f, i * 8, 16);
          const serif = !hook || i === 0;
          return (
            <div key={l} style={{ overflow: "hidden", padding: "4px 16px" }}>
              <div
                style={{
                  fontFamily: serif ? SERIF : SANS,
                  fontStyle: serif ? "italic" : "normal",
                  fontWeight: serif ? 500 : 600,
                  fontSize: hook ? (i === 0 ? 62 : 66) : 64,
                  letterSpacing: serif ? "0" : "-0.01em",
                  lineHeight: 1.12,
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
        <div
          style={{
            marginTop: 16,
            width: 64 * ramp(f, 6, 14),
            height: 2,
            background: C.gold,
            opacity: 0.9,
          }}
        />
      </div>
    </>
  );
};

/** Dialogue subtitles: ivory, max two lines, a plain fade, kept in the upper safe area so the print stays clear. */
const Subtitle: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top: 290,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          maxWidth: 880,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 46,
          lineHeight: 1.25,
          color: C.ivory,
          textShadow: "0 1px 2px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** CTA 1, over the room: brand, line, invitation. */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const veil = ramp(f, 0, 18);
  const brand = ramp(f, 4, 16);
  const title = ramp(f, 12, 16);
  const sub = ramp(f, 22, 16);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: veil,
          background:
            "linear-gradient(180deg, rgba(7,26,18,0) 30%, rgba(7,26,18,0.55) 52%, rgba(7,26,18,0.82) 75%, rgba(7,26,18,0.6) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1010,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: C.ivory,
        }}
      >
        <Img
          src={staticFile("brand/reset-logo-white.png")}
          style={{
            width: 300,
            opacity: brand,
            transform: `translateY(${(1 - brand) * 10}px)`,
          }}
        />
        <div
          style={{
            marginTop: 34,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 68,
            lineHeight: 1.12,
            opacity: title,
            transform: `translateY(${(1 - title) * 12}px)`,
          }}
        >
          {edit.cta.title}
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 36,
            letterSpacing: "0.02em",
            opacity: sub,
          }}
        >
          {edit.cta.sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** CTA 2: where to buy, on deep pine. */
const EndCard: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const veil = interpolate(f, [0, s.xf], [0, 1], clamp);
  const logo = ramp(f, 4, 18);
  const title = ramp(f, 12, 16);
  const places = ramp(f, 24, 16);
  const url = ramp(f, 34, 16);
  const [p1, ...rest] = edit.cta.places.split(" · ");
  return (
    <AbsoluteFill
      style={{
        opacity: veil,
        background: `radial-gradient(ellipse 80% 60% at 50% 42%, ${C.pine} 0%, ${C.pineDeep} 100%)`,
        color: C.ivory,
        alignItems: "center",
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 560,
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
            width: 380,
            opacity: logo,
            transform: `translateY(${(1 - logo) * 10}px)`,
          }}
        />
        <div
          style={{
            marginTop: 40,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 60,
            opacity: title,
          }}
        >
          {edit.cta.title}
        </div>
        <div
          style={{
            marginTop: 56,
            width: 80 * places,
            height: 2,
            background: C.gold,
          }}
        />
        <div
          style={{
            marginTop: 44,
            fontWeight: 500,
            fontSize: 40,
            letterSpacing: "0.06em",
            lineHeight: 1.55,
            opacity: places,
          }}
        >
          <div>{[p1, rest[0]].join("  ·  ")}</div>
          <div>{rest.slice(1).join("  ·  ")}</div>
        </div>
        <div
          style={{
            marginTop: 40,
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: "0.08em",
            color: C.gold,
            opacity: url,
          }}
        >
          {edit.cta.url}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const XmasHomeAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {shots.map((s) => (
      <Sequence
        key={s.id}
        from={s.from - s.xf}
        durationInFrames={s.frames + s.xf}
        premountFor={15}
      >
        {s.card ? <EndCard s={s} /> : <ShotView s={s} />}
      </Sequence>
    ))}
    <Sequence durationInFrames={shots[shots.length - 1].from}>
      <Finish />
    </Sequence>
    {edit.texts.map((t) => (
      <Sequence key={t.from} from={t.from} durationInFrames={t.to - t.from}>
        <Headline t={t} />
      </Sequence>
    ))}
    {subs.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
        <Subtitle text={s.text} dur={s.to - s.from} />
      </Sequence>
    ))}
    <Sequence
      from={edit.cta.from}
      durationInFrames={shots[shots.length - 1].from - edit.cta.from}
    >
      <Cta />
    </Sequence>
    <Audio src={staticFile("xmashome/mix.wav")} />
  </AbsoluteFill>
);
