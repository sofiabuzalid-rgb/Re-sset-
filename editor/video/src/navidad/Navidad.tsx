// RE:SET · CHRISTMAS COLLECTION × BUEN FIN — AD02 (Meta Ads: Reels, Stories, Feed). 1080×1920, 30 fps, 37 s.
// Timeline (frames). Her voice memo is the spine (editor/navidad/voz.py); the original 120 BPM score
// (editor/navidad/music.py) puts every cut on a beat (15 frames), her "15%" on beat 14 and the Buen Fin reveal on beat 63.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { FPS, Grid, Shot, ShotView, Split } from "./Footage";
import { Claim, Collection, EndCard, Hook, Offer, Reveal, Stores } from "./Graphics";
import { Subtitles, WORDS } from "./Subtitles";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Cormorant", url: staticFile("fonts/Cormorant-500-italic.woff2"), weight: "500", style: "italic" });

export const XMAS_FRAMES = 1110;

export const SHOTS: Shot[] = [
  // 0–4 s · hook: red reindeer set in her hands, Grinch print with the RE:SET mark, tree print, print close-up
  { from: 0, len: 30, src: "n2686", at: 9.0, cx: 0.33, z: [1.04, 1.0] },
  { from: 30, len: 30, src: "n2685", at: 4.3, cx: 0.45, z: [1.06, 1.0] },
  { from: 60, len: 30, src: "n2684", at: 2.9, cx: 0.36 },
  { from: 90, len: 30, src: "n2683", at: 12.0, cx: 0.5, z: [1.0, 1.06] },
  // 4–9 s · "Este Buen Fin es el momento. En RE:SET tenemos 15%…"
  { from: 120, len: 60, src: "n2686", at: 17.1, cx: 0.33 },
  { from: 180, len: 45, src: "n2685", at: 4.9, cx: 0.47, z: [1.0, 1.05] },
  { from: 225, len: 45, src: "n2686", at: 19.2, cx: 0.33 },
  // 9–13.5 s · "…nuestra colección de pijamas navideñas para toda la familia. Sí, para todos."
  { from: 270, len: 45, src: "n2683", at: 1.5, cx: 0.32 },
  { from: 315, len: 45, src: "n2684", at: 1.3, cx: 0.36 },
  { from: 360, len: 15, src: "n2683", at: 14.5, cx: 0.5 },
  { from: 375, len: 30, src: "n2686", at: 20.1, cx: 0.3 },
  // 13.5 s split (below) · 15–20.5 s variety: "…modelos y estampados navideños…"
  { from: 450, len: 45, src: "n2683", at: 13.0, cx: 0.5, z: [1.08, 1.0] },
  { from: 495, len: 45, src: "n2684", at: 4.5, cx: 0.4 },
  { from: 540, len: 45, src: "n2685", at: 8.5, cx: 0.45 },
  { from: 585, len: 30, src: "n2684", at: 6.1, cx: 0.4 },
  // 20.5–28 s · slower: "Desde los clásicos tonos rojos hasta diseños llenos de color, con detalles cuidados, acabados de calidad…"
  { from: 615, len: 75, src: "n2686", at: 11.6, cx: 0.36, z: [1.0, 1.05] },
  { from: 690, len: 45, src: "n2684", at: 2.1, cx: 0.4 },
  { from: 735, len: 45, src: "n2683", at: 10.5, cx: 0.5, z: [1.0, 1.06] },
  { from: 780, len: 45, src: "n2685", at: 6.0, cx: 0.45 },
  { from: 825, len: 45, src: "n2683", at: 0.5, cx: 0.3 },
  // 29–31.5 s · "Visítanos en Avenida Stim 39 o en Perisur."
  { from: 870, len: 75, src: "n2686", at: 22.1, cx: 0.33 },
];
const SPLIT: Shot[] = [
  { from: 0, len: 45, src: "n2686", at: 12.1, cx: 0.45 },
  { from: 0, len: 45, src: "n2683", at: 3.5, cx: 0.45 },
  { from: 0, len: 45, src: "n2684", at: 4.5, cx: 0.45 },
];
const GRID: Shot[] = [
  { from: 0, len: 60, src: "n2686", at: 8.5, cx: 0.4 },
  { from: 0, len: 60, src: "n2683", at: 12.6, cx: 0.5 },
  { from: 0, len: 60, src: "n2684", at: 3.4, cx: 0.4 },
  { from: 0, len: 60, src: "n2685", at: 5.3, cx: 0.47 },
];
const END: Shot = { from: 0, len: 105, src: "n2686", at: 9.0, cx: 0.33 };

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
    return (f > 1078 ? 0.5 : g) * interpolate(f, [XMAS_FRAMES - 12, XMAS_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.len}>
          <ShotView s={s} />
        </Sequence>
      ))}
      <Sequence from={405} durationInFrames={45}>
        <Split shots={SPLIT} />
      </Sequence>
      <Sequence from={945} durationInFrames={60}>
        <Grid shots={GRID} />
      </Sequence>
      <Sequence durationInFrames={1005}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.3) 100%)" }} />
      </Sequence>
      <Sequence from={1005} durationInFrames={XMAS_FRAMES - 1005}>
        <EndCard shot={END} />
      </Sequence>
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
