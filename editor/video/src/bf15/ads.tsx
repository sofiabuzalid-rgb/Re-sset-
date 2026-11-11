// RE:SET · BUEN FIN 15% EN TODA LA TIENDA — four ads. Frames at 30 fps.
// Voice segments are in seconds of her memos (m_<memo>.wav); every edge is a measured silence (see editor/bf15/voz.py and ENTREGA).
// Footage: this round's clips (bf15/), plus the same uploads already converted for earlier ads (essentials/, navidad/, softwinter26/, teaser/).
import React from "react";
import { AdConfig, BuenFinAd, Cartel, Offer, Tag } from "./engine";

// ---------------------------------------------------------------- AD01 · ¡LLEGÓ EL BUEN FIN! (navidad, para regalar)
export const AD01: AdConfig = {
  frames: 540,
  voices: [{ memo: "xmas", a: 1.08, b: 12.925, at: 9 }], // ¿Quieres adelantarte a tus regalos de Navidad y aprovechar un súper descuento? Este Buen Fin es el momento. En RE:SET tenemos 15% de descuento en toda la tienda, incluyendo nuestra colección de pijamas navideñas para toda la familia.
  shots: [
    { from: 0, len: 60, src: "navidad/n2683", at: 1.5, cx: 0.32 }, // she holds the Grinch print
    { from: 60, len: 60, src: "bf15/b2688", at: 9.6, cx: 0.5 }, // red nordic + Christmas sets on the chair
    { from: 120, len: 60, src: "teaser/s4", at: 20.3 }, // the showroom's Christmas pajamas
    { from: 180, len: 60, src: "navidad/n2683", at: 12.6, cx: 0.5 }, // print close-up
    { from: 240, len: 50, src: "bf15/b2688", at: 1.5, cx: 0.45 }, // she picks pajamas off the rack
    { from: 290, len: 74, src: "teaser/s4", at: 25.0, rate: 0.9 }, // "…pijamas navideñas para toda la familia."
    { from: 364, len: 56, src: "bf15/b2688", at: 12.5, cx: 0.5 },
  ],
  end: { from: 420, shot: { from: 0, len: 120, src: "navidad/n2683", at: 2.0, cx: 0.32 }, cta: "Ven por tus pijamas navideñas" },
  music: "t_ad01",
  overlays: (
    <>
      <Cartel to={420} />
      <Offer to={420} pulses={[199]} />
    </>
  ),
};

// ---------------------------------------------------------------- AD02 · ESSENTIALS CON 15% (producto + precio)
export const AD02: AdConfig = {
  frames: 690,
  voices: [
    { memo: "face", a: 0.7, b: 9.51, at: 6 }, // Es una belleza esta pijama, es la Essential de botones, tiene su cuello V, manga larga, jareta para que te acomode, el pantalón es abierto.
    { memo: "ess", a: 16.415, b: 26.865, at: 282 }, // Y lo mejor, 15% de descuento en toda la tienda. Las de adulto bajan de 999 a 849 y las de niños de 699 a 594.
  ],
  shots: [
    { from: 0, len: 75, src: "essentials/e2676", at: 0.3, cx: 0.3 }, // she holds the set up to camera
    { from: 75, len: 60, src: "essentials/e2677", at: 0.5, cx: 0.4 }, // the top, close
    { from: 135, len: 60, src: "essentials/e2675", at: 7.0, cx: 0.33 }, // long sleeve
    { from: 195, len: 75, src: "essentials/e2676", at: 2.6, cx: 0.3 }, // the full set: top + pants
    { from: 270, len: 112, src: "essentials/e2675", at: 9.0, cx: 0.72 }, // "…15% en toda la tienda": the rack of colours
    { from: 382, len: 132, src: "essentials/e2675", at: 17.2, cx: 0.35 }, // adult set
    { from: 514, len: 86, src: "essentials/e2677", at: 3.0, cx: 0.42 }, // big top + small top (kids)
  ],
  end: { from: 600, shot: { from: 0, len: 90, src: "essentials/e2679", at: 1.0, cx: 0.17 }, cta: "Ven por tu Essentials" },
  music: "t_ad02",
  overlays: (
    <>
      <Cartel to={600} />
      <Offer to={600} pulses={[310]} />
      <Tag from={382} to={514} text="Adulto: $999 → $849" top={620} />
      <Tag from={514} to={600} text="Niños: $699 → $594" top={620} />
    </>
  ),
};

// ---------------------------------------------------------------- AD03 · SOFT WINTER + BOLSITA DE VIAJE
export const AD03: AdConfig = {
  frames: 640,
  voices: [
    { memo: "sw", a: 4.835, b: 9.87, at: 6 }, // Te presentamos nuestra Soft Winter, una colección pensada para los días más fríos del año.
    { memo: "sw", a: 23.83, b: 31.565, at: 166 }, // Además vienen con su práctica bolsita de viaje para llevarlas contigo a donde vayas. Y aprovecha porque este Buen Fin tenemos 15% de descuento en la tienda.
    { memo: "sw", a: 38.505, b: 42.87, at: 408 }, // Prepárate para diciembre con la Soft Winter de RE:SET y aprovecha el Buen Fin.
  ],
  shots: [
    { from: 0, len: 80, src: "bf15/b2700", at: 0.3 }, // the knit bags and pajamas on the table
    { from: 80, len: 77, src: "softwinter26/w2697", at: 2.0 },
    { from: 157, len: 53, src: "bf15/b2681", at: 9.0, cx: 0.5 }, // "…su práctica bolsita de viaje"
    { from: 210, len: 90, src: "softwinter26/w2698", at: 4.0 }, // she picks one up
    { from: 300, len: 98, src: "bf15/b2700", at: 6.5 }, // "…15% de descuento en la tienda."
    { from: 398, len: 72, src: "bf15/b2681", at: 12.5, cx: 0.5 },
    { from: 470, len: 75, src: "softwinter26/w2698", at: 8.0 },
  ],
  end: { from: 545, shot: { from: 0, len: 95, src: "softwinter26/w2697", at: 3.5 }, cta: "Ven por tu Soft Winter" },
  music: "t_ad03",
  overlays: (
    <>
      <Cartel to={545} />
      <Offer to={545} pulses={[346]} />
      <Tag from={157} to={300} text="Incluye bolsita de viaje" top={620} />
    </>
  ),
};

// ---------------------------------------------------------------- AD04 · ADELANTA TUS REGALOS
export const AD04: AdConfig = {
  frames: 530,
  voices: [
    { memo: "xmas", a: 21.62, b: 28.49, at: 6 }, // Desde los clásicos tonos rojos hasta diseños llenos de color, con detalles cuidados, acabados de calidad y opciones perfectas para regalar.
    { memo: "xmas", a: 37.53, b: 43.3, at: 222 }, // Este Buen Fin adelanta tus regalos, combina a toda la familia y aprovecha el 15% OFF en RE:SET.
  ],
  shots: [
    { from: 0, len: 66, src: "bf15/b2688", at: 10.5, cx: 0.5 }, // "los clásicos tonos rojos": the red nordic set
    { from: 66, len: 60, src: "teaser/s4", at: 27.4 }, // "diseños llenos de color"
    { from: 126, len: 90, src: "navidad/n2683", at: 12.6, cx: 0.5 }, // "detalles cuidados, acabados de calidad"
    { from: 216, len: 66, src: "bf15/b2688", at: 3.0, cx: 0.45 }, // she picks one: "adelanta tus regalos"
    { from: 282, len: 60, src: "teaser/s4", at: 24.6 },
    { from: 342, len: 58, src: "navidad/n2683", at: 1.5, cx: 0.32 }, // "…aprovecha el 15% OFF en RE:SET."
    { from: 400, len: 40, src: "bf15/b2688", at: 12.0, cx: 0.5 },
  ],
  end: { from: 440, shot: { from: 0, len: 90, src: "bf15/b2688", at: 13.0, cx: 0.5 }, cta: "Adelanta tus regalos en RE:SET" },
  music: "t_ad04",
  overlays: (
    <>
      <Cartel to={440} />
      <Offer to={440} pulses={[343]} />
    </>
  ),
};

export const AD01View: React.FC = () => <BuenFinAd cfg={AD01} />;
export const AD02View: React.FC = () => <BuenFinAd cfg={AD02} />;
export const AD03View: React.FC = () => <BuenFinAd cfg={AD03} />;
export const AD04View: React.FC = () => <BuenFinAd cfg={AD04} />;
