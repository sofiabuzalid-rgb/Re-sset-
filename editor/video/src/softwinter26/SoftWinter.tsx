// RE:SET · SOFT WINTER × BUEN FIN — AD03 (Meta Ads: Reels, Stories, Feed). 1080×1920, 30 fps, 32 s.
// Her voice (editor/softwinter26/voz.py) leads from 2.8 s; the original cozy-pop score (editor/softwinter26/music.py, 120 BPM)
// opens on frame 0, lands the title on beat 5, her "15%" + the Buen Fin reveal on beat 52 (26.0 s) and the CTA on beat 56.
// Cozy-luxury grammar (different from AD01/AD02): soft blur dissolves, slow pushes, one discreet speed ramp, colour panels in
// arches, oat/cocoa typography — no whips, flashes or grain.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { FPS, Panels, Shot, ShotView } from "./Footage";
import { C } from "./copy";
import { Claim, CTA, Hook, Reveal, Title } from "./Graphics";
import { Subtitles, WORDS } from "./Subtitles";

loadFont({ family: "Manrope", url: staticFile("fonts/Manrope-Variable.woff2"), weight: "200 800" });
loadFont({ family: "Cormorant", url: staticFile("fonts/Cormorant-500.woff2"), weight: "500" });
loadFont({ family: "Cormorant", url: staticFile("fonts/Cormorant-500-italic.woff2"), weight: "500", style: "italic" });

export const SW_FRAMES = 960;

export const SHOTS: Shot[] = [
  // 0–2.5 s · hook: knit close-up with the RE:SET mark → the full sage set against the RE:SET wall
  { from: 0, len: 36, src: "w2692", at: 4.3, cx: 0.5, z: [1.25, 1.1] },
  { from: 36, len: 39, src: "w2692", at: 8.6, cx: 0.5, z: [1.0, 1.06] },
  // 2.5–7.9 s · "Te presentamos nuestra Soft Winter, una colección pensada para los días más fríos del año."
  { from: 75, len: 60, src: "w2691", at: 3.0, cx: 0.5, soft: 8 },
  { from: 135, len: 45, src: "w2693", at: 5.6, cx: 0.55, soft: 8 },
  { from: 180, len: 56, src: "w2691", at: 5.4, cx: 0.5, z: [1.0, 1.06] },
  // 7.9–13.3 s · "Lo que las hace especiales es su tela más gruesa, su textura suave y lo calientitas que son," — the knit as she names it
  { from: 236, len: 34, src: "w2693", at: 1.2, cx: 0.5, ramp: [1.6, 0.6] },
  { from: 270, len: 45, src: "w2692", at: 3.6, cx: 0.5, z: [1.08, 1.18] },
  { from: 315, len: 37, src: "w2692", at: 5.0, cx: 0.5, z: [1.18, 1.08] },
  { from: 352, len: 46, src: "w2693", at: 3.0, cx: 0.5, z: [1.05, 1.12] },
  // 13.3–16.8 s · "perfectas para dormir cómodo y disfrutar esos días de invierno en casa." — slower, softer
  { from: 398, len: 52, src: "w2691", at: 7.2, cx: 0.5, soft: 10, rate: 0.8 },
  { from: 450, len: 55, src: "w2692", at: 9.0, cx: 0.5, soft: 10, rate: 0.7, z: [1.0, 1.08] },
  // 16.8–20 s · colour panels (below): "Tenemos diferentes modelos de manga larga, colores súper lindos."
  // 20–24.2 s · "Además vienen con su práctica bolsita de viaje para llevarlas contigo a donde vayas."
  { from: 600, len: 45, src: "w2694", at: 0.6, cx: 0.5, soft: 8 },
  { from: 645, len: 35, src: "w2696", at: 4.3, cx: 0.5 },
  { from: 680, len: 45, src: "w2698", at: 4.6, cx: 0.5, z: [1.0, 1.06] },
  // 24.2–26 s · "Y aprovecha porque este Buen Fin tenemos…"
  { from: 725, len: 55, src: "w2693", at: 5.8, cx: 0.55, soft: 6 },
];
const PANELS: Shot[] = [
  { from: 0, len: 95, src: "w2691", at: 4.4, cx: 0.45 },
  { from: 0, len: 95, src: "w2692", at: 9.2, cx: 0.5, cy: 0.66 },
  { from: 0, len: 95, src: "w2693", at: 2.2, cx: 0.5, rate: 0.4 },
];
const TILES: Shot[] = [
  // product only: the garment fills each arch (no faces)
  { from: 0, len: 70, src: "w2691", at: 6.6, cx: 0.45, cy: 0.66, z: [1.5, 1.5] },
  { from: 0, len: 70, src: "w2692", at: 4.5, cx: 0.5, z: [1.1, 1.1] },
  { from: 0, len: 70, src: "w2693", at: 2.4, cx: 0.5, z: [1.2, 1.2] },
];
const HERO: Shot = { from: 0, len: 110, src: "w2692", at: 8.4, cx: 0.5 };

export const SoftWinter: React.FC = () => {
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
    const g = near === 0 ? 0.13 : interpolate(near, [0, 0.35], [0.13, 0.62], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (f > 935 ? 0.55 : g) * interpolate(f, [SW_FRAMES - 10, SW_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={s.from - (s.soft ?? 0)} durationInFrames={s.len + (s.soft ?? 0)}>
          <ShotView s={s} />
        </Sequence>
      ))}
      <Sequence from={505} durationInFrames={95}>
        <Panels shots={PANELS} at={[0, 18, 40]} bg={C.oat} />
      </Sequence>
      <Sequence from={780} durationInFrames={80}>
        <Reveal tiles={TILES} />
      </Sequence>
      <Sequence from={850} durationInFrames={SW_FRAMES - 850}>
        <CTA shot={HERO} />
      </Sequence>
      <AbsoluteFill style={{ background: "radial-gradient(130% 90% at 50% 45%, rgba(0,0,0,0) 62%, rgba(40,26,16,0.3) 100%)", pointerEvents: "none" }} />
      <Hook />
      <Title />
      <Claim />
      <Subtitles />
      <Audio src={staticFile("softwinter26/voz.wav")} />
      <Audio src={staticFile("softwinter26/musica.wav")} volume={music} />
    </AbsoluteFill>
  );
};
