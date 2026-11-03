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
