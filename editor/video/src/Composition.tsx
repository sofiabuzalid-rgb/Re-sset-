import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import edit from "./edit.json";

// Every value below comes from ../estilo.md (measured on the reference reel).
loadFont({ family: "Fraunces", url: staticFile("fonts/Fraunces-full.woff2"), weight: "100 900" });
loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-500-italic.woff2"), weight: "500", style: "italic" });
loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-700-italic.woff2"), weight: "700", style: "italic" });

const PINK = "#F6D7E3";
const PILL = "rgba(233,233,233,0.9)";
const TEXT = "#1A1A1A";
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = edit.fps;

type Seg = (typeof edit.segs)[number];
type Word = (typeof edit.words)[number];

/* framing per shot (estilo.md §1, §6): general -> fast push -> medio -> hard cut -> corto, digital zoom capped at 1.35 */
const FRAMING: Record<string, { z0: number; z1: number; origin: string; punchAt?: number; pan?: number[] }> = {
  "8480-0": { z0: 1.0, z1: 1.0, origin: "50% 38%", punchAt: 103 }, // fast push 1.0 -> 1.25 in 8 f on "RE:SET"
  "8488-0": { z0: 1.15, z1: 1.15, origin: "0% 40%", pan: [0, 38, 0, 42] }, // follows her as she walks in from the left
  "8488-1": { z0: 1.16, z1: 1.2, origin: "45% 38%" }, // punch hides the jump cut after the removed pause
  "8495-0": { z0: 1.26, z1: 1.33, origin: "50% 40%" },
};

const Shot: React.FC<{ s: Seg }> = ({ s }) => {
  const f = useCurrentFrame();
  const fr = FRAMING[`${s.clip}-${s.part}`];
  let z = fr.z0 + (fr.z1 - fr.z0) * (f / s.frames);
  if (fr.punchAt !== undefined) z = interpolate(f, [fr.punchAt, fr.punchAt + 8], [1.0, 1.25], { ...clamp, easing: easeOut });
  const origin = fr.pan ? `${interpolate(f, [fr.pan[0], fr.pan[1]], [fr.pan[2], fr.pan[3]], { ...clamp, easing: Easing.inOut(Easing.cubic) })}% 40%` : fr.origin;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo muted src={staticFile(`IMG_${s.clip}.mp4`)} startFrom={s.in} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})`, transformOrigin: origin }} />
    </AbsoluteFill>
  );
};

/* opening title (§3): rounded serif, lowercase, pink, ~190 px, centred; holds 0.5 s then leaves to the right by 1.2 s */
const Title: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [15, 36], [0, 1170], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)` }}>
      {["soft", "winter"].map((l, i) => (
        <div key={l} style={{ position: "absolute", top: 480 + i * 280, left: 0, right: 0, textAlign: "center", fontFamily: "Fraunces", fontWeight: 800, fontVariationSettings: '"SOFT" 100, "WONK" 0, "opsz" 144', fontSize: 190, lineHeight: 1, color: PINK }}>
          {l}
        </div>
      ))}
    </AbsoluteFill>
  );
};

/* product labels (§3): small italic pills pinned to the garment, appear instantly, 0.5 s apart, max 3 */
const LABELS = [
  { text: "soft winter", from: 225, to: 315, x: 300, y: 1480 },
  { text: "nueva colección", from: 266, to: 315, x: 800, y: 900 },
  { text: "trae su bolsita", from: 345, to: 444, x: 600, y: 1420 },
];
const Label: React.FC<{ text: string; x: number; y: number }> = ({ text, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", background: PILL, borderRadius: 12, padding: "8px 22px", fontFamily: "Montserrat", fontStyle: "italic", fontWeight: 500, fontSize: 34, color: TEXT, whiteSpace: "nowrap" }}>{text}</div>
);

/* captions (§2): 1-3 words per block, break on pauses / 18 chars / phrase change; current word bold; keyword pill pink */
const blocks: Word[][] = [];
for (const w of edit.words) {
  const b = blocks[blocks.length - 1];
  const prev = b?.[b.length - 1];
  const len = b ? b.map((x) => x.w).join(" ").length + 1 + w.w.length : 0;
  if (!b || b.length >= 3 || len > 18 || w.phrase !== prev!.phrase || prev!.br || w.s - prev!.e > 0.25) blocks.push([w]);
  else b.push(w);
}

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = blocks.findIndex((b, k) => t >= b[0].s && t < (blocks[k + 1]?.[0].s ?? b[b.length - 1].e + 0.4));
  if (i < 0) return null;
  const b = blocks[i];
  const p = interpolate(f, [b[0].s * FPS, b[0].s * FPS + 4], [0, 1], { ...clamp, easing: easeOut });
  const key = b.some((w) => w.key);
  return (
    <div style={{ position: "absolute", top: 1180, left: 0, right: 0, display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
      <div style={{ opacity: p, transform: `scale(${0.92 + 0.08 * p})`, background: key ? PINK : PILL, borderRadius: 14, padding: "10px 26px", fontFamily: "Montserrat", fontStyle: "italic", fontSize: 58, color: TEXT, whiteSpace: "nowrap" }}>
        {b.map((w, k) => (
          <span key={k} style={{ fontWeight: t >= w.s && t < (b[k + 1]?.s ?? 1e9) ? 700 : 500 }}>
            {k ? " " : ""}
            {w.w}
          </span>
        ))}
      </div>
    </div>
  );
};

export const Edit: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {edit.segs.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.frames}>
        <Shot s={s} />
      </Sequence>
    ))}
    <Sequence durationInFrames={40}>
      <Title />
    </Sequence>
    {LABELS.map((l) => (
      <Sequence key={l.text} from={l.from} durationInFrames={l.to - l.from}>
        <Label {...l} />
      </Sequence>
    ))}
    <Captions />
    <Audio src={staticFile("voice.wav")} />
  </AbsoluteFill>
);

export const MyComposition = () => <Composition id="Edit" component={Edit} durationInFrames={edit.total} fps={FPS} width={1080} height={1920} />;
