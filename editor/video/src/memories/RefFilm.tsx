// RE:SET · THE MEMORIES WE WEAR — same concept, timing and audio as the client's reference reel, no text.
// Reference (measured frame by frame and on its audio):
//   0–5.0 s  calm wall; the sample is fixed; two vertical seams run along its sides from the first frame; the top seam slides
//            down (1.5→2.8 s) and the bottom seam slides up (3.5→4.7 s) until they close a frame around it. The music is soft
//            and goes almost silent at 4.0 s.
//   5.0 s    the beat drops: the world behind the sample changes every ~7 frames (16 cuts, 5.02→8.35 s), closer textures
//            first, then whole rooms; the sample never moves.
//   8.35 s   the last room holds to the end.
// Here the sample is a real RE:SET pajama photo (untouched) and the worlds are Christmas moments.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Product, PRODUCTS } from "./Memories";

const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const slide = Easing.bezier(0.33, 0, 0.2, 1);

// sample geometry (the reference keeps it centred, a little below the middle)
const PW = 440;
const PH = 660;
const MAT = 14;
const CW = PW + MAT * 2;
const CH = PH + MAT * 2;
const CL = (W - CW) / 2;
const CT = 610;
const CR = CL + CW;
const CB = CT + CH;

export const REF = { frames: 279, cuts: [151, 157, 164, 170, 176, 182, 188, 196, 203, 211, 218, 224, 230, 238, 245, 251] };

type World = { img: string; z?: number; fx?: number; fy?: number };
// 16 worlds on the cuts: close details first, whole rooms after (as in the reference); the last one holds
const WORLDS: World[] = [
  { img: "bg_nina", z: 1.9, fx: 0.82, fy: 0.42 },
  { img: "bg_cena", z: 1.8, fx: 0.5, fy: 0.52 },
  { img: "bg_calle", z: 1.7, fx: 0.15, fy: 0.5 },
  { img: "bg_decorar", z: 1.8, fx: 0.55, fy: 0.42 },
  { img: "bg_baile", z: 1.7, fx: 0.62, fy: 0.3 },
  { img: "bg_bokeh", z: 1.25 },
  { img: "bg_pasillo", z: 1.1 },
  { img: "bg_escalera", z: 1.1 },
  { img: "bg_cena", z: 1.1 },
  { img: "bg_calle", z: 1.1 },
  { img: "bg_foto", z: 1.1 },
  { img: "bg_baile", z: 1.1 },
  { img: "bg_nina", z: 1.1, fx: 0.6 },
  { img: "bg_escalera", z: 1.7, fx: 0.6, fy: 0.22 },
  { img: "bg_cena", z: 1.6, fx: 0.4, fy: 0.85 },
  { img: "bg_decorar", z: 1.08, fx: 0.55 },
];

const WorldView: React.FC<{ w: World; from: number }> = ({ w, from }) => {
  const f = useCurrentFrame();
  const t = f - from;
  const z = (w.z ?? 1.1) * (1 + 0.0012 * t); // slow, continuous push
  const fx = w.fx ?? 0.5;
  const fy = w.fy ?? 0.5;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`memories/${w.img}.jpg`)}
        style={{
          position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover", objectPosition: `${fx * 100}% ${fy * 100}%`,
          transform: `scale(${z})`, transformOrigin: `${fx * 100}% ${fy * 100}%`,
          filter: "saturate(0.95) sepia(0.12) contrast(0.96) brightness(0.86)",
        }}
      />
    </AbsoluteFill>
  );
};

const Wall: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {/* warm cream wall with the reference's curved window light, drifting slowly */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 60% at ${68 - 0.04 * f}% 36%, #FBF6EE 0%, #EEE4D5 55%, #DACCB7 100%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(98deg, rgba(110,80,50,0) ${56 + 0.03 * f}%, rgba(110,80,50,0.13) ${70 + 0.03 * f}%, rgba(110,80,50,0) ${86 + 0.03 * f}%)` }} />
    </AbsoluteFill>
  );
};

const Grain: React.FC<{ op: number }> = ({ op }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile(`memories/grain${Math.floor(f / 2) % 4}.png`)})`, backgroundSize: "512px 512px", backgroundPosition: `${(f * 137) % 512}px ${(f * 71) % 512}px`, opacity: op, mixBlendMode: "overlay" }} />
  );
};

const Seams: React.FC<{ color: string }> = ({ color }) => {
  const f = useCurrentFrame();
  const top = interpolate(f, [45, 84], [-4, CT], { ...clamp, easing: slide });
  const bot = interpolate(f, [105, 140], [H + 4, CB], { ...clamp, easing: slide });
  const L = 4;
  const s = (st: React.CSSProperties) => <div style={{ position: "absolute", background: color, ...st }} />;
  return (
    <AbsoluteFill>
      {s({ left: CL - L / 2, top: 0, width: L, height: H })}
      {s({ left: CR - L / 2, top: 0, width: L, height: H })}
      {f >= 45 && s({ left: 0, width: W, top: top - L / 2, height: L })}
      {f >= 105 && s({ left: 0, width: W, top: bot - L / 2, height: L })}
    </AbsoluteFill>
  );
};

export const RefFilm: React.FC<{ product: Product; seam?: string; audio?: boolean }> = ({ product, seam = "#5E1C1C", audio = true }) => {
  const f = useCurrentFrame();
  const cuts = REF.cuts;
  const k = cuts.filter((c) => f >= c).length - 1; // −1 = still on the wall
  const p = PRODUCTS[product];
  const onWall = k < 0;
  return (
    <AbsoluteFill style={{ background: "#1a120c" }}>
      {onWall ? <Wall /> : <WorldView w={WORLDS[k]} from={cuts[k]} />}
      <Grain op={onWall ? 0.05 : 0.1} />
      {onWall && <Seams color={seam} />}
      {/* the sample: same place, same size, every frame */}
      <div style={{ position: "absolute", left: CL, top: CT, width: CW, height: CH, background: "#FBF7F0", boxShadow: onWall ? "0 18px 40px rgba(70,45,25,0.18)" : "0 30px 70px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "absolute", left: MAT, top: MAT, width: PW, height: PH, overflow: "hidden" }}>
          <Img src={staticFile(p.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos }} />
        </div>
      </div>
      {audio && <Audio src={staticFile("memories/ref_audio.wav")} />}
    </AbsoluteFill>
  );
};
