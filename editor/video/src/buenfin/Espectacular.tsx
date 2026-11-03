// RE:SET · BUEN FIN 2026 — el espectacular (capa gráfica controlada). Se renderiza como imagen fija y después se coloca
// con perspectiva sobre la toma de la ciudad (editor/buenfin/composite.py): así el texto nunca se deforma ni cambia.
// Todo el texto es editable aquí. Producto: fotos reales de tienda (roja nórdica, verde de galletas) y la de esquí.
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Playfair", url: staticFile("fonts/PlayfairDisplay-Italic-Variable.woff2"), weight: "400 900", style: "italic" });

export const BILLBOARD = { width: 1100, height: 1800 };
export const COPY = {
  event: "EL BUEN FIN",
  pct: "15%",
  off: "OFF",
  scope: "EN TODA LA TIENDA",
  tagline: "Pijamas para todos tus momentos",
  cta: "DESCUBRE LA COLECCIÓN",
};
const GREEN = "#163528";
const GREEN2 = "#1F4635";
const IVORY = "#F6F0E4";
const LIME = "#E2EC95";

const Photo: React.FC<{ src: string; pos: string; rot: number; top: number; left: number }> = ({ src, pos, rot, top, left }) => (
  <div style={{ position: "absolute", top, left, width: 330, height: 560, background: IVORY, padding: 12, boxShadow: "0 22px 46px rgba(0,0,0,0.45)", transform: `rotate(${rot}deg)` }}>
    <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "160px 160px 6px 6px" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
    </div>
  </div>
);

export const Espectacular: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 25%, ${GREEN2} 0%, ${GREEN} 70%)`, fontFamily: "Montserrat", color: IVORY }}>
    {/* inner frame line, like a printed vinyl */}
    <div style={{ position: "absolute", inset: 34, border: `3px solid rgba(246,240,228,0.35)` }} />
    <Img src={staticFile("brand/reset-logo-white.png")} style={{ position: "absolute", top: 92, left: "50%", width: 520, marginLeft: -260 }} />
    <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center", fontWeight: 700, fontSize: 66, letterSpacing: "0.32em", paddingLeft: "0.32em" }}>{COPY.event}</div>
    <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-start", fontWeight: 900, lineHeight: 0.84 }}>
      <span style={{ fontSize: 360, letterSpacing: "-0.05em" }}>{COPY.pct}</span>
      <span style={{ fontSize: 150, color: LIME, marginLeft: 18, marginTop: 26, letterSpacing: "-0.02em" }}>{COPY.off}</span>
    </div>
    <div style={{ position: "absolute", top: 732, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: LIME, color: GREEN, fontWeight: 800, fontSize: 52, letterSpacing: "0.16em", padding: "12px 34px 14px 42px" }}>{COPY.scope}</div>
    </div>
    <Photo src="buenfin_cdmx/IMG_2041.jpg" pos="50% 45%" rot={-4} top={880} left={70} />
    <Photo src="buenfin_cdmx/IMG_2848.jpg" pos="50% 40%" rot={0} top={860} left={385} />
    <Photo src="buenfin_cdmx/IMG_2052.jpg" pos="40% 45%" rot={4} top={880} left={700} />
    <div style={{ position: "absolute", top: 1490, left: 0, right: 0, textAlign: "center", fontFamily: "Playfair", fontStyle: "italic", fontWeight: 500, fontSize: 70 }}>{COPY.tagline}</div>
    <div style={{ position: "absolute", top: 1620, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
      <div style={{ width: 90, height: 2, background: IVORY, opacity: 0.6 }} />
      <div style={{ fontWeight: 700, fontSize: 32, letterSpacing: "0.3em" }}>{COPY.cta}</div>
      <div style={{ width: 90, height: 2, background: IVORY, opacity: 0.6 }} />
    </div>
  </AbsoluteFill>
);

// Formato alto (building wrap): mismas palabras y fotos, acomodadas para el espectacular de la toma de Reforma (~1:3.3),
// así el diseño entra en el panel sin estirarse ni aplastarse.
export const BILLBOARD_ALTO = { width: 720, height: 2400 };
const PhotoA: React.FC<{ src: string; pos: string; top: number; left: number; w: number; h: number; arch?: boolean }> = ({ src, pos, top, left, w, h, arch }) => (
  <div style={{ position: "absolute", top, left, width: w, height: h, background: IVORY, padding: 10, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>
    <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: arch ? `${w / 2}px ${w / 2}px 6px 6px` : 6 }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
    </div>
  </div>
);
export const EspectacularAlto: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(140% 60% at 50% 18%, ${GREEN2} 0%, ${GREEN} 70%)`, fontFamily: "Montserrat", color: IVORY }}>
    <div style={{ position: "absolute", inset: 26, border: `3px solid rgba(246,240,228,0.35)` }} />
    <Img src={staticFile("brand/reset-logo-white.png")} style={{ position: "absolute", top: 72, left: "50%", width: 420, marginLeft: -210 }} />
    {/* cartel oficial de El Buen Fin (en lugar del texto) */}
    <Img src={staticFile("buenfin_cdmx/buenfin_cartel.png")} style={{ position: "absolute", top: 262, left: "50%", width: 480, marginLeft: -240, filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.45))" }} />
    <div style={{ position: "absolute", top: 742, left: 0, right: 0, textAlign: "center", fontWeight: 900, fontSize: 300, lineHeight: 1, letterSpacing: "-0.05em" }}>{COPY.pct}</div>
    <div style={{ position: "absolute", top: 1022, left: 0, right: 0, textAlign: "center", fontWeight: 900, fontSize: 190, lineHeight: 1, color: LIME, letterSpacing: "-0.02em" }}>{COPY.off}</div>
    <div style={{ position: "absolute", top: 1238, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: LIME, color: GREEN, fontWeight: 800, fontSize: 52, lineHeight: 1.08, letterSpacing: "0.08em", padding: "14px 30px 16px 36px", textAlign: "center" }}>
        EN TODA<br />LA TIENDA
      </div>
    </div>
    <PhotoA src="buenfin_cdmx/IMG_2848.jpg" pos="50% 38%" top={1440} left={70} w={580} h={410} arch />
    <PhotoA src="buenfin_cdmx/IMG_2041.jpg" pos="50% 45%" top={1876} left={70} w={280} h={240} />
    <PhotoA src="buenfin_cdmx/IMG_2052.jpg" pos="40% 45%" top={1876} left={370} w={280} h={240} />
    <div style={{ position: "absolute", top: 2140, left: 0, right: 0, textAlign: "center", fontFamily: "Playfair", fontStyle: "italic", fontWeight: 500, fontSize: 52, lineHeight: 1.05 }}>
      Pijamas para todos<br />tus momentos
    </div>
    <div style={{ position: "absolute", top: 2272, left: 0, right: 0, textAlign: "center", fontWeight: 700, fontSize: 32, letterSpacing: "0.18em", paddingLeft: "0.18em" }}>{COPY.cta}</div>
  </AbsoluteFill>
);

// El espectacular ES el cuadro de El Buen Fin: página blanca de calendario con marco negro y franja roja,
// el cartel oficial arriba (sin deformar) y la oferta de RE:SET debajo.
const BF_RED = "#E3141B";
const INK = "#111111";
export const EspectacularBuenFin: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFFFFF", fontFamily: "Montserrat", color: INK }}>
    <div style={{ position: "absolute", inset: 0, border: `18px solid ${INK}`, borderRightWidth: 26, borderBottomWidth: 30 }} />
    <Img src={staticFile("buenfin_cdmx/buenfin_cartel.png")} style={{ position: "absolute", top: 40, left: 36, width: 640 }} />
    <Img src={staticFile("brand/reset-logo-white.png")} style={{ position: "absolute", top: 712, left: "50%", width: 380, marginLeft: -190, filter: "invert(1)" }} />
    <div style={{ position: "absolute", top: 868, left: 0, right: 0, textAlign: "center", fontWeight: 900, fontSize: 300, lineHeight: 1, letterSpacing: "-0.05em" }}>{COPY.pct}</div>
    <div style={{ position: "absolute", top: 1146, left: 0, right: 0, textAlign: "center", fontWeight: 900, fontSize: 186, lineHeight: 1, color: BF_RED, letterSpacing: "-0.02em" }}>{COPY.off}</div>
    <div style={{ position: "absolute", top: 1356, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: INK, color: "#FFFFFF", fontWeight: 800, fontSize: 52, lineHeight: 1.08, letterSpacing: "0.08em", padding: "14px 30px 16px 36px", textAlign: "center" }}>
        EN TODA<br />LA TIENDA
      </div>
    </div>
    {[["buenfin_cdmx/IMG_2041.jpg", "50% 45%"], ["buenfin_cdmx/IMG_2848.jpg", "50% 40%"], ["buenfin_cdmx/IMG_2052.jpg", "40% 45%"]].map(([src, pos], i) => (
      <div key={src} style={{ position: "absolute", top: 1560, left: 44 + i * 214, width: 196, height: 300, border: `6px solid ${INK}`, overflow: "hidden", borderRadius: 6 }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
      </div>
    ))}
    {/* franja roja del calendario */}
    <div style={{ position: "absolute", left: 18, right: 26, bottom: 30, height: 460, background: BF_RED }} />
    <div style={{ position: "absolute", top: 1960, left: 0, right: 0, textAlign: "center", color: "#FFFFFF", fontFamily: "Playfair", fontStyle: "italic", fontWeight: 600, fontSize: 58, lineHeight: 1.05 }}>
      Pijamas para todos<br />tus momentos
    </div>
    <div style={{ position: "absolute", top: 2125, left: 0, right: 0, textAlign: "center", color: "#FFFFFF", fontWeight: 800, fontSize: 34, letterSpacing: "0.16em", paddingLeft: "0.16em" }}>{COPY.cta}</div>
    {/* esquina doblada, como el cartel */}
    <div style={{ position: "absolute", right: 26, bottom: 30, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 0 130px 130px", borderColor: `transparent transparent ${INK} transparent` }} />
    <div style={{ position: "absolute", right: 40, bottom: 44, width: 104, height: 104, background: "linear-gradient(135deg, #FFFFFF 0%, #DADADA 100%)", clipPath: "polygon(0 0, 100% 0, 0 100%)", boxShadow: "0 0 0 4px #111" }} />
  </AbsoluteFill>
);
