import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import edit from "./edit.json";
import { MinimalCaptions, MinimalEndTag, MinimalHook } from "../components/Minimal";

/*
 * RE:SET BUEN FIN 2026 · 15% OFF · AD01 promo directa.
 * Ilana's real takes only; shots, voice and phrase captions live in src/buenfin/edit.json.
 * Minimal text system (src/components/Minimal.tsx): short hook, verbatim captions, discreet end tag.
 */


type Shot = (typeof edit.shots)[number] & { from: number };
const shots: Shot[] = [];
{
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
}
export const BUENFIN_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;
const ctaShot = shots[shots.length - 1];

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#fff" }}>
      <OffthreadVideo
        muted
        src={staticFile(`buenfin/${s.id}.mp4`)}
        style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%` }}
      />
    </AbsoluteFill>
  );
};

export const BuenFinAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fff" }}>
    {shots.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
        <ShotView s={s} />
      </Sequence>
    ))}
    <MinimalHook text={edit.minimal.hook} dur={edit.minimal.hookFrames} top={edit.minimal.hookTop} tone={edit.minimal.hookTone} align={"hookAlign" in edit.minimal ? String(edit.minimal.hookAlign) : "center"} />
    <MinimalCaptions subs={edit.subs} top={edit.minimal.captionTop} />
    <MinimalEndTag promo={edit.minimal.promo} from={ctaShot.from + 6} top={edit.minimal.endTop} tone={edit.minimal.endTone} />
    <Audio src={staticFile("buenfin/mix.wav")} />
  </AbsoluteFill>
);
