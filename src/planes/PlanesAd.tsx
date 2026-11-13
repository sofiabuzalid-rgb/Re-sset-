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
 * META ADS — "Planes cancelados, pijama puesta" (red/white Christmas set).
 * Shots, her voice and subtitles live in src/planes/edit.json; media from scripts/build-planes-media.py.
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
export const PLANES_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;
const closeFrom = shots.find((s) => s.id === "close")!.from;

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#fff" }}>
      <OffthreadVideo
        muted
        src={staticFile(`planes/${s.id}.mp4`)}
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${z})`,
          transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
};

export const PlanesAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fff" }}>
    {shots.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
        <ShotView s={s} />
      </Sequence>
    ))}
    <MinimalHook text={edit.minimal.hook} dur={edit.minimal.hookFrames} top={edit.minimal.hookTop} tone={edit.minimal.hookTone} align={"hookAlign" in edit.minimal ? String(edit.minimal.hookAlign) : "center"} />
    <MinimalCaptions subs={edit.subs} top={edit.minimal.captionTop} />
    <MinimalEndTag promo={edit.minimal.promo} from={closeFrom + 6} top={edit.minimal.endTop} tone={edit.minimal.endTone} />
    <Audio src={staticFile("planes/mix.wav")} />
  </AbsoluteFill>
);
