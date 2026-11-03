// RE:SET · BUEN FIN CDMX — recreación del reel del helicóptero que retira la tela del espectacular.
// La escena (Paseo de la Reforma, helicóptero, tela) viene de un generador de video con el espectacular en VERDE CROMA;
// editor/buenfin/composite.py coloca el diseño de RE:SET con perspectiva y seguimiento → buenfin_cdmx/plate_comp.mp4.
// Aquí solo: la escena compuesta, el audio sincronizado y un cierre discreto. Todo editable.
import React from "react";
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";

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

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [CDMX.closeFrom * 30, CDMX.closeFrom * 30 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 1330, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>
      <div style={{ background: "rgba(22,53,40,0.92)", color: "#F6F0E4", fontFamily: "Montserrat", fontWeight: 800, fontSize: 40, letterSpacing: "0.12em", padding: "16px 34px 18px", borderRadius: 10, textAlign: "center" }}>
        BUEN FIN · <span style={{ color: "#E2EC95" }}>15% OFF</span> EN TODA LA TIENDA
        <div style={{ fontWeight: 600, fontSize: 30, letterSpacing: "0.3em", marginTop: 8 }}>VEN A CONOCERNOS</div>
      </div>
    </div>
  );
};

export const Cdmx: React.FC<{ audio: { src: string; startS: number } }> = ({ audio }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <OffthreadVideo muted src={staticFile(CDMX.plate)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <Close />
    <Audio src={staticFile(audio.src)} startFrom={Math.round(audio.startS * 30)} volume={(f) => interpolate(f, [CDMX.seconds * 30 - 15, CDMX.seconds * 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
  </AbsoluteFill>
);
