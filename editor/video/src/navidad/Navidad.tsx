// RE:SET · CHRISTMAS COLLECTION × BUEN FIN — AD02 (Meta Ads: Reels, Stories, Feed). 1080×1920, 30 fps, 37 s.
// Her voice (editor/navidad/voz.py, take "The_Fit_Pilates_2_2") is the spine; the original 120 BPM score (editor/navidad/music.py)
// puts every cut on a beat (15 frames), her first "15%" on beat 13 (6.5 s), the Buen Fin reveal on beat 61 (30.5 s, her
// "Este Buen Fin…") and the final hit on her last "RE:SET" (35.6 s). Fast cuts with punch-ins and whips in the hook and the
// variety section; slower, warmer shots while she describes the designs.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { BlurDefs, FPS, Grid, Shot, ShotView, Split } from "./Footage";
import { Claim, Collection, EndCard, Hook, Leak, Look, Offer, Reveal, Stores } from "./Graphics";
import { Subtitles, WORDS } from "./Subtitles";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Cormorant", url: staticFile("fonts/Cormorant-500-italic.woff2"), weight: "500", style: "italic" });

export const XMAS_FRAMES = 1110;

export const SHOTS: Shot[] = [
  // 0–2 s · hook: four models in four beats, then hold on the red reindeer set (hook text 0.7 s, collection 2 s)
  { from: 0, len: 15, src: "n2686", at: 9.0, cx: 0.33, punch: true },
  { from: 15, len: 15, src: "n2683", at: 12.6, cx: 0.5, whip: 1 },
  { from: 30, len: 15, src: "n2684", at: 2.4, cx: 0.36, punch: true },
  { from: 45, len: 15, src: "n2685", at: 5.4, cx: 0.47, whip: -1 },
  { from: 60, len: 45, src: "n2686", at: 10.6, cx: 0.33, z: [1.0, 1.07] },
  // 3.5–12 s · "Este Buen Fin es el momento. En RE:SET (RE:SET print) tenemos 15% (hit)… colección… para toda la familia."
  { from: 105, len: 45, src: "n2683", at: 1.0, cx: 0.3, punch: true },
  { from: 150, len: 45, src: "n2685", at: 4.0, cx: 0.46, whip: 1 },
  { from: 195, len: 45, src: "n2686", at: 18.0, cx: 0.32, punch: true },
  { from: 240, len: 30, src: "n2683", at: 13.6, cx: 0.5, whip: -1 },
  { from: 270, len: 30, src: "n2684", at: 3.6, cx: 0.38, punch: true },
  { from: 300, len: 30, src: "n2685", at: 9.9, cx: 0.4 },
  { from: 330, len: 38, src: "n2686", at: 21.0, cx: 0.32, punch: true },
  // 12.3–13.2 s · "Tenemos pijamas para…" → split builds on mamá / papá / niños / niñas (395–465)
  { from: 368, len: 27, src: "n2686", at: 8.1, cx: 0.35 },
  // 15.5–20 s · "…con modelos y estampados navideños para que toda la familia pueda combinar esta Navidad."
  { from: 465, len: 45, src: "n2683", at: 14.0, cx: 0.5, whip: 1 },
  { from: 510, len: 30, src: "n2684", at: 5.0, cx: 0.4, punch: true },
  { from: 540, len: 30, src: "n2685", at: 8.6, cx: 0.45, whip: -1 },
  { from: 570, len: 30, src: "n2686", at: 12.6, cx: 0.36, punch: true },
  // 20–26.5 s · warmer, slower: "Desde los clásicos tonos rojos hasta diseños llenos de color, con detalles cuidados, acabados de calidad…"
  { from: 600, len: 60, src: "n2686", at: 8.2, cx: 0.35, z: [1.0, 1.07] },
  { from: 660, len: 45, src: "n2684", at: 1.6, cx: 0.38, z: [1.04, 1.0] },
  { from: 705, len: 45, src: "n2683", at: 10.2, cx: 0.5, z: [1.0, 1.06] },
  { from: 750, len: 45, src: "n2685", at: 6.4, cx: 0.46, z: [1.05, 1.0] },
  // 26.5–30.5 s · "Visítanos en Avenida Stim 39, y en Perisur."
  { from: 795, len: 60, src: "n2686", at: 22.0, cx: 0.33, punch: true },
  { from: 855, len: 45, src: "n2684", at: 4.6, cx: 0.38, whip: 1 },
  { from: 900, len: 15, src: "n2683", at: 15.0, cx: 0.5, punch: true },
];
const FAMILY: Shot[] = [
  { from: 0, len: 70, src: "n2686", at: 12.1, cx: 0.45 },
  { from: 0, len: 70, src: "n2683", at: 3.5, cx: 0.45 },
  { from: 0, len: 70, src: "n2684", at: 4.5, cx: 0.42 },
  { from: 0, len: 70, src: "n2685", at: 1.5, cx: 0.42 },
];
const TRIO: Shot[] = [
  { from: 0, len: 45, src: "n2686", at: 12.1, cx: 0.45 },
  { from: 0, len: 45, src: "n2683", at: 3.5, cx: 0.45 },
  { from: 0, len: 45, src: "n2684", at: 4.5, cx: 0.42 },
];
const GRID: Shot[] = [
  { from: 0, len: 55, src: "n2686", at: 8.5, cx: 0.4 },
  { from: 0, len: 55, src: "n2683", at: 12.6, cx: 0.5 },
  { from: 0, len: 55, src: "n2684", at: 3.4, cx: 0.4 },
  { from: 0, len: 55, src: "n2685", at: 5.3, cx: 0.47 },
];
const END: Shot = { from: 0, len: 95, src: "n2686", at: 9.0, cx: 0.33 };

export const Navidad: React.FC = () => {
  // music: up in the gaps, down to 12 % under every word
  const music = (f: number) => {
    const t = f / FPS;
    let near = 99;
    for (const w of WORDS) {
      if (t >= w.s - 0.15 && t <= w.e + 0.2) {
        near = 0;
        break;
      }
      near = Math.min(near, Math.abs(t - w.s), Math.abs(t - w.e));
    }
    const g = near === 0 ? 0.12 : interpolate(near, [0, 0.35], [0.12, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (f > 1066 ? 0.5 : g) * interpolate(f, [XMAS_FRAMES - 12, XMAS_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <BlurDefs />
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.len}>
          <ShotView s={s} />
        </Sequence>
      ))}
      <Sequence from={395} durationInFrames={70}>
        <Split shots={FAMILY} at={[3, 19, 40, 49]} />
      </Sequence>
      <Sequence from={915} durationInFrames={55}>
        <Grid shots={GRID} />
      </Sequence>
      <Sequence from={970} durationInFrames={45}>
        <Split shots={TRIO} />
      </Sequence>
      <Sequence durationInFrames={1015}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.3) 100%)" }} />
      </Sequence>
      <Sequence from={1015} durationInFrames={XMAS_FRAMES - 1015}>
        <EndCard shot={END} />
      </Sequence>
      <Look />
      {[0, 60, 195, 600, 795, 915, 1015].map((at, i) => (
        <Leak key={at} at={at} side={i % 2 ? "r" : "l"} peak={at === 915 || at === 195 ? 0.85 : 0.6} />
      ))}
      <Hook />
      <Collection />
      <Offer />
      <Claim />
      <Stores />
      <Reveal />
      <Subtitles />
      <Audio src={staticFile("navidad/voz.wav")} />
      <Audio src={staticFile("navidad/musica.wav")} volume={music} />
    </AbsoluteFill>
  );
};
