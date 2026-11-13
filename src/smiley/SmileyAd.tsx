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
import ad01 from "./ad01.json";
import ad02 from "./ad02.json";
import { MinimalCaptions, MinimalEndTag, MinimalHook } from "../components/Minimal";

/*
 * RE:SET Smiley Pajamas (Happy Vibes Women) — OUTLET 25% OFF UGC ads.
 * Each ad = src/smiley/<ad>.json (shots, her voice, hook, verbatim subtitles, CTA) + media from
 * scripts/build-smiley-media.py. Minimal text system (src/components/Minimal.tsx): short hook, verbatim captions,
 * discreet OUTLET 25% OFF end tag.
 */


type Edit = typeof ad01;

const makeSmileyAd = (edit: Edit, dir: string) => {
  type Shot = Edit["shots"][number] & { from: number };
  const shots: Shot[] = [];
  let t = 0;
  for (const s of edit.shots) {
    shots.push({ ...s, from: t });
    t += s.frames;
  }
  const total = t;
  const cta = shots[shots.length - 1];

  const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
    const f = useCurrentFrame();
    const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
    const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#fff" }}>
        <OffthreadVideo
          muted
          src={staticFile(`smiley/${dir}/${s.id}.mp4`)}
          style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%` }}
        />
      </AbsoluteFill>
    );
  };

  const Component: React.FC = () => (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      {shots.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
          <ShotView s={s} />
        </Sequence>
      ))}
      <MinimalHook text={edit.minimal.hook} dur={edit.minimal.hookFrames} top={edit.minimal.hookTop} tone={edit.minimal.hookTone} align={"hookAlign" in edit.minimal ? String(edit.minimal.hookAlign) : "center"} />
      <MinimalCaptions subs={edit.subs} top={edit.minimal.captionTop} />
      <MinimalEndTag promo={edit.minimal.promo} from={cta.from + 6} top={edit.minimal.endTop} tone={edit.minimal.endTone} scale={"endScale" in edit.minimal ? Number(edit.minimal.endScale) : 1} />
      <Audio src={staticFile(`smiley/${dir}/mix.wav`)} />
    </AbsoluteFill>
  );

  return { Component, total };
};

const a1 = makeSmileyAd(ad01, "ad01");
const a2 = makeSmileyAd(ad02 as Edit, "ad02");
export const SmileyAd01 = a1.Component;
export const SMILEY_AD01_TOTAL = a1.total;
export const SmileyAd02 = a2.Component;
export const SMILEY_AD02_TOTAL = a2.total;
