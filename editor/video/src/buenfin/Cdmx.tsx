// RE:SET · BUEN FIN CDMX — recreación del reel del helicóptero que retira la tela del espectacular.
// La escena sale de editor/buenfin/heli_scene.py (foto de Reforma con el espectacular en VERDE CROMA + helicóptero recortado
// + tela simulada con física; el diseño de RE:SET se coloca con perspectiva) → buenfin_cdmx/plate_comp.mp4.
// Si después llega una toma de video real, editor/buenfin/composite.py produce el mismo archivo.
// Aquí solo: la escena compuesta, el audio sincronizado y un cierre discreto. Todo editable.
import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const CDMX = {
  plate: "buenfin_cdmx/plate_comp.mp4",
  seconds: 12.0, // set to the plate's length after compositing
  closeFrom: 9.6, // the lower-third appears once the billboard is fully revealed
};
/** review: the reference reel's audio (no licence for paid media). paid: the client's Pixabay afro house from its drop */
export const CDMX_AUDIO = {
  review: { src: "buenfin_cdmx/ref_audio.wav", startS: 0 },
  paid: { src: "outlet4/audio/afrohouse.mp3", startS: 18.918 - 5.3 }, // the drop lands on the reveal (5.3 s)
};

const CARTEL_FROM = 5.5; // the Buen Fin poster lands right after the reveal and stays to the end

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - CARTEL_FROM * 30, fps, config: { damping: 10, stiffness: 150 } });
  const a = interpolate(f, [CDMX.closeFrom * 30, CDMX.closeFrom * 30 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      {/* cuadro oficial de El Buen Fin, grande y fijo en pantalla abajo a la izquierda */}
      <Img
        src={staticFile("buenfin_cdmx/buenfin_cartel.png")}
        style={{ position: "absolute", top: 1330, left: 44, width: 400, transform: `scale(${pop}) rotate(${-6 + (1 - pop) * -14}deg)`, transformOrigin: "40% 85%", filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.5))" }}
      />
      <div style={{ position: "absolute", top: 1420, right: 40, opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>
        <div style={{ background: "rgba(22,53,40,0.93)", color: "#F6F0E4", fontFamily: "Montserrat", textAlign: "center", padding: "18px 26px 20px", borderRadius: 12, whiteSpace: "nowrap" }}>
          <div style={{ fontWeight: 900, fontSize: 64, lineHeight: 1, color: "#E2EC95" }}>15% OFF</div>
          <div style={{ fontWeight: 700, fontSize: 28, letterSpacing: "0.12em", marginTop: 8 }}>EN TODA LA TIENDA</div>
          <div style={{ fontWeight: 600, fontSize: 21, letterSpacing: "0.28em", marginTop: 12, opacity: 0.85 }}>VEN A CONOCERNOS</div>
        </div>
      </div>
    </>
  );
};

export const Cdmx: React.FC<{ audio: { src: string; startS: number } }> = ({ audio }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <OffthreadVideo muted src={staticFile(CDMX.plate)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <Close />
    <Audio src={staticFile(audio.src)} startFrom={Math.round(audio.startS * 30)} volume={(f) => interpolate(f, [CDMX.seconds * 30 - 15, CDMX.seconds * 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
  </AbsoluteFill>
);
