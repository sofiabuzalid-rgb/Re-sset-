// RE:SET · OUTLET 25% OFF — the four ads. Frames at 30 fps. Voice cut points sit in measured silences (editor/outlet25/voz.py).
// All offer copy is limited to the OUTLET (never "toda la tienda").
import React from "react";
import { AdConfig, Badge, Hook, Num, OfferCard, OutletAd } from "./engine";

// ---------------------------------------------------------------- AD01 · ¿PIJAMAS NAVIDEÑAS CON 25% OFF?
// Her own hook: "Todas estas pijamas navideñas con 25% de descuento." (4101) in sync, rack of real pajamas behind her.
export const AD01: AdConfig = {
  frames: 724,
  voices: [
    { clip: "4101", a: 5.235, b: 9.04, at: 0 }, // Todas estas pijamas navideñas con 25% de descuento.
    { clip: "4100", a: 0.15, b: 6.43, at: 120 }, // Miren esta pijama padrísima para toda la familia, la tenemos de hombre, de mujer y de niño en esta temporada para ti.
    { clip: "4105", a: 0.63, b: 9.025, at: 412 }, // Pijamas más cómodas, increíbles y con descuento sí existen. En el outlet de RE:SET ven a conocerlo.
  ],
  shots: [
    { from: 0, len: 114, src: "4101", at: 5.235, z: 1.3, ox: 35, oy: 62 }, // tighter on the rack so the pajamas read at once
    { from: 114, len: 6, src: "4100", at: 0.0 },
    { from: 120, len: 100, src: "4100", at: 0.15 }, // she shows the white Christmas print
    { from: 220, len: 92, src: "4086", at: 2.4, z: 1.05 }, // the same print up close while she keeps talking (L-cut)
    { from: 312, len: 25, src: "4096", at: 0.6 }, // variety: green elves, full
    { from: 337, len: 25, src: "4087", at: 2.0 }, // green elves, print
    { from: 362, len: 25, src: "4098", at: 2.5 }, // light blue, full
    { from: 387, len: 25, src: "4088", at: 3.4 }, // dark green with pink trees, print
    { from: 412, len: 252, src: "4105", at: 0.63 }, // she, by the outlet rack
  ],
  end: { from: 664, shot: { from: 0, len: 60, src: "4101", at: 6.8 }, lines: ["OUTLET RE:SET", "25% OFF"], cta: "Descubre tus favoritas en RE:SET." },
  music: "m_ad01",
  overlays: (
    <>
      <Hook lines={["¿PIJAMAS NAVIDEÑAS", "CON 25% OFF?"]} to={114} ratio={1} size={70} />
      <Badge to={114} top={60} />
      <Badge from={312} to={412} />
      <OfferCard from={540} to={664} />
    </>
  ),
};

// ---------------------------------------------------------------- AD02 · ¿CUÁL TE LLEVARÍAS?
export const AD02: AdConfig = {
  frames: 630,
  voices: [
    { clip: "4099", a: 1.45, b: 4.6, at: 270 }, // Miren esta pijama, padrísima para toda la familia.
    { clip: "4101", a: 5.235, b: 9.04, at: 430 }, // Todas estas pijamas navideñas con 25% de descuento.
  ],
  shots: [
    { from: 0, len: 60, src: "4096", at: 0.3 }, // 1 · green elves, full
    { from: 60, len: 60, src: "4087", at: 9.0, z: 1.05 }, // its print
    { from: 120, len: 60, src: "4098", at: 4.8 }, // 2 · light blue, full
    { from: 180, len: 45, src: "4091", at: 3.8 }, // its print and collar
    { from: 225, len: 45, src: "4090", at: 13.6 },
    { from: 270, len: 100, src: "4099", at: 1.45 }, // 3 · white print, she shows it (in sync)
    { from: 370, len: 30, src: "4088", at: 0.4 }, // 4 · dark green, full
    { from: 400, len: 30, src: "4088", at: 4.2 }, // its print
    { from: 430, len: 115, src: "4101", at: 5.235 }, // she with the rack of all of them
  ],
  end: { from: 545, shot: { from: 0, len: 85, src: "4105", at: 6.4 }, lines: ["PIJAMAS RE:SET", "OUTLET 25% OFF"], cta: "¿Cuál es tu favorita?" },
  music: "m_ad02",
  overlays: (
    <>
      <Hook lines={["¿CUÁL DE ESTAS PIJAMAS", "te llevarías con 25% OFF?"]} to={60} size={66} />
      <Badge to={545} top={60} />
      <Num n={1} from={60} to={120} />
      <Num n={2} from={120} to={270} />
      <Num n={3} from={270} to={370} />
      <Num n={4} from={370} to={430} />
    </>
  ),
};

// ---------------------------------------------------------------- AD03 · TU PIJAMA DE NAVIDAD
export const AD03: AdConfig = {
  frames: 680,
  voices: [
    { clip: "4101", a: 0.25, b: 5.235, at: 90 }, // En RE:SET creamos una nueva área de outlet solamente para ti en esta temporada.
    { clip: "4101", a: 5.235, b: 9.04, at: 245 }, // Todas estas pijamas navideñas con 25% de descuento. (over the prints: a general line)
    { clip: "4105", a: 0.63, b: 6.05, at: 420 }, // Pijamas más cómodas, increíbles y con descuento sí existen.
  ],
  shots: [
    { from: 0, len: 90, src: "4087", at: 0.5, z: 1.04 }, // green elves print
    { from: 90, len: 155, src: "4101", at: 0.25 }, // she presents the outlet area
    { from: 245, len: 45, src: "4088", at: 1.0 }, // prints: dark green trees
    { from: 290, len: 45, src: "4090", at: 4.7 }, // light blue
    { from: 335, len: 45, src: "4086", at: 7.5 }, // white
    { from: 380, len: 40, src: "4087", at: 13.3 }, // green elves
    { from: 420, len: 163, src: "4105", at: 0.63 }, // she, second line
  ],
  end: { from: 583, shot: { from: 0, len: 97, src: "4096", at: 1.2 }, lines: ["PIJAMAS NAVIDEÑAS", "OUTLET RE:SET · 25% OFF"], cta: "Ven a descubrirlas." },
  music: "m_ad03",
  overlays: (
    <>
      <Hook lines={["¿TODAVÍA NO TIENES TUS", "PIJAMAS PARA NAVIDAD?"]} to={90} size={64} />
      <Badge to={583} text="OUTLET" top={60} />
    </>
  ),
};

// ---------------------------------------------------------------- AD04 · TE ENSEÑO EL OUTLET (the most natural one)
export const AD04: AdConfig = {
  frames: 735,
  voices: [
    { clip: "4100", a: 0.15, b: 13.9, at: 0 }, // Miren esta pijama… Suavecita, suavecita, suavecita, de botones, cuello en ve, manga larga, una delicia.
    { clip: "4101", a: 5.235, b: 12.19, at: 420 }, // Todas estas pijamas navideñas con 25% de descuento. ¿Qué esperas para comprar las tuyas en la página web?
  ],
  shots: [
    { from: 0, len: 196, src: "4100", at: 0.15 },
    { from: 196, len: 62, src: "4086", at: 2.6, z: 1.04 }, // "Suavecita…": her hand on the same white print
    { from: 258, len: 155, src: "4100", at: 8.75 }, // back to her: "de botones, cuello en ve, manga larga, una delicia"
    { from: 413, len: 7, src: "4101", at: 5.0 },
    { from: 420, len: 115, src: "4101", at: 5.235 }, // other options: the rack
    { from: 535, len: 40, src: "4096", at: 8.5 }, // green elves
    { from: 575, len: 54, src: "4098", at: 9.5 }, // light blue
  ],
  end: { from: 629, shot: { from: 0, len: 106, src: "4105", at: 2.0 }, lines: ["OUTLET RE:SET", "25% OFF"], cta: "Descubre los modelos participantes." },
  music: "m_ad04",
  musicLevel: 0.32,
  overlays: (
    <>
      <Hook lines={["Les quiero enseñar estas PIJAMAS", "del outlet de RE:SET con 25% OFF"]} to={96} size={56} />
      <Badge to={629} top={60} />
    </>
  ),
};

export const AD01View: React.FC = () => <OutletAd cfg={AD01} />;
export const AD02View: React.FC = () => <OutletAd cfg={AD02} />;
export const AD03View: React.FC = () => <OutletAd cfg={AD03} />;
export const AD04View: React.FC = () => <OutletAd cfg={AD04} />;
