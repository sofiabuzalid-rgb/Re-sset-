// RE:SET · VENTA SORPRESA BUEN FIN — the two ads. Frames at 30 fps; voice cut points sit in measured silences (editor/sorpresa/voz.py).
// Prices: only the campaign range ($49–$299 MXN, productos seleccionados) — never a price on a specific model.
import React from "react";
import { AdConfig, Header, Hook, Note, OutletAd, Pill, PriceCard } from "./engine";

// ---------------------------------------------------------------- AD01 · ¿PIJAMAS DESDE $49? (el descubrimiento)
export const AD01: AdConfig = {
  frames: 720,
  voices: [
    { clip: "4129", a: 0.46, b: 4.08, at: 0 }, // ¿Te gustan las pijamas espectaculares y sobre todo las de RE:SET?
    { clip: "4127b", a: 4.835, b: 9.77, at: 115, fo: 1 }, // RE:SET acaba de sacar una venta sorpresa Buen Fin 2026.
    { clip: "4138", a: 3.365, b: 9.865, at: 268 }, // Con pijamas desde 49 pesos en este Buen Fin para esta Navidad 2026.
    { clip: "4134", a: 0.22, b: 6.065, at: 470 }, // Esta venta espectacular solo está disponible en Avenida Stim 39 en la planta baja.
  ],
  shots: [
    { from: 0, len: 115, src: "4129", at: 0.46 }, // she, sitting among the bags of pajamas
    { from: 115, len: 153, src: "4127b", at: 4.835 }, // standing in front of all the stock
    { from: 268, len: 62, src: "4138", at: 3.365 }, // lying on the bags: "Con pijamas desde 49 pesos…"
    { from: 330, len: 45, src: "4131", at: 0.3 }, // printed pajamas in their bags
    { from: 375, len: 45, src: "4128", at: 2.4 }, // more bags, more prints
    { from: 420, len: 50, src: "4139", at: 2.6 }, // a stacked bundle
    { from: 470, len: 178, src: "4134", at: 0.22 }, // she, holding a Christmas piece
  ],
  end: {
    from: 648,
    shot: { from: 0, len: 72, src: "4129", at: 8.0 },
    lines: ["VENTA SORPRESA", "BUEN FIN RE:SET", "$49 – $299 MXN"],
    cta: "Descubre la venta sorpresa de RE:SET.",
    sub: "Aprovecha los precios especiales de Buen Fin",
  },
  music: "m_ad01",
  overlays: (
    <>
      <Hook lines={["PIJAMAS RE:SET", "VENTA SORPRESA DE BUEN FIN", "DESDE $49 MXN", "en productos seleccionados"]} sizes={[78, 50, 70, 32]} to={115} />
      <Pill from={115} to={648} />
      <PriceCard from={150} to={263} title="PRODUCTOS SELECCIONADOS" small="VENTA SORPRESA BUEN FIN" />
      <PriceCard from={470} to={560} title="VENTA SORPRESA · BUEN FIN RE:SET" />
      <Note from={535} to={648} text="Solo en Av. Stim 39 · planta baja" />
    </>
  ),
};

// ---------------------------------------------------------------- AD02 · ¡SORPRESA! ES BUEN FIN (la noticia, más corta y enérgica)
export const AD02: AdConfig = {
  frames: 500,
  voices: [
    { clip: "4138", a: 0.0, b: 3.365, at: 0 }, // ¡Sorpresa! Tenemos una venta especial para ti.
    { clip: "4130", a: 6.13, b: 12.36, at: 106 }, // Tenemos muchísimas navideñas para ti, para toda tu familia, a precios que no puedes creer.
    { clip: "4130", a: 16.2, b: 20.54, at: 298 }, // Córrele porque ya sabes que estas ventas vuelan.
  ],
  shots: [
    { from: 0, len: 60, src: "4138", at: 0.0 }, // her "¡Sorpresa!" on the bags
    { from: 60, len: 46, src: "4131", at: 0.4 }, // price reveal over real pajamas (her line carries on: L-cut)
    { from: 106, len: 44, src: "4128", at: 3.2 },
    { from: 150, len: 45, src: "4139", at: 3.0 },
    { from: 195, len: 103, src: "4130", at: 9.1 }, // back to her, in sync: "…para toda tu familia, a precios que no puedes creer"
    { from: 298, len: 82, src: "4130", at: 16.2 },
    { from: 380, len: 52, src: "4139", at: 5.4 },
  ],
  end: { from: 432, shot: { from: 0, len: 68, src: "4137", at: 0.3 }, lines: ["RE:SET BUEN FIN", "VENTA SORPRESA", "$49 – $299 MXN"], cta: "Descúbrela ahora.", sub: "Av. Stim 39 · planta baja" },
  music: "m_ad02",
  sfx: [{ at: 60, src: "outlet4/audio/sfx_swipe.wav", vol: 0.3 }],
  overlays: (
    <>
      <Hook lines={["¡SORPRESA!", "PIJAMAS RE:SET"]} sizes={[96, 74]} to={60} />
      <Pill to={60} text="VENTA SORPRESA DE BUEN FIN" />
      <PriceCard from={60} to={195} />
      <Pill from={195} to={432} />
      <Note from={298} to={432} text="Solo en Av. Stim 39 · planta baja" top={170} />
    </>
  ),
};

// ---------------------------------------------------------------- AD03 · LA VERSIÓN MÁS CLARA (blanco/negro, sin rosa)
// Script in her own words, in the order a viewer needs it: sorpresa → precio → variedad → dónde. One fixed white header with the whole
// offer; one store card; boxed subtitles; music kept low under her voice.
export const AD03: AdConfig = {
  frames: 750,
  boxedSubs: true,
  subBottom: 830, // subtitles sit just above the offer card
  musicLevel: 0.38,
  voices: [
    { clip: "4138", a: 0.0, b: 9.865, at: 0 }, // ¡Sorpresa! Tenemos una venta especial para ti. Con pijamas desde 49 pesos en este Buen Fin para esta Navidad 2026.
    { clip: "4130", a: 6.13, b: 12.36, at: 302 }, // Tenemos muchísimas pijamas navideñas para ti, para toda tu familia, a precios que no puedes creer.
    { clip: "4134", a: 0.22, b: 6.065, at: 495 }, // Esta venta espectacular solo está disponible en Avenida Stim 39 en la planta baja.
  ],
  shots: [
    { from: 0, len: 170, src: "4138", at: 0.0 }, // her on the bags, in sync through "…49 pesos"
    { from: 170, len: 45, src: "4131", at: 0.3 }, // the pajamas while she finishes the sentence
    { from: 215, len: 45, src: "4128", at: 2.4 },
    { from: 260, len: 42, src: "4139", at: 2.6 },
    { from: 302, len: 78, src: "4130", at: 6.13 }, // her, in sync: "Tenemos muchísimas pijamas navideñas para ti,"
    { from: 380, len: 45, src: "4131", at: 1.4 }, // "para toda tu familia," over the prints
    { from: 425, len: 70, src: "4130", at: 10.23 }, // back in sync: "a precios que no puedes creer."
    { from: 495, len: 180, src: "4134", at: 0.22 }, // her: where to buy
  ],
  end: { from: 675, shot: { from: 0, len: 75, src: "4130", at: 1.0 }, lines: ["VENTA SORPRESA", "PIJAMAS RE:SET", "$49 – $299 MXN"], cta: "Ven a Av. Stim 39 · planta baja", sub: "en productos seleccionados", neutral: true, low: true },
  music: "m_ad01",
  overlays: (
    <>
      <Header to={675} pulseAt={145} storeAt={596} />
    </>
  ),
};

export const AD03View: React.FC = () => <OutletAd cfg={AD03} />;
export const AD01View: React.FC = () => <OutletAd cfg={AD01} />;
export const AD02View: React.FC = () => <OutletAd cfg={AD02} />;
