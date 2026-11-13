import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

/**
 * RE:SET minimal text system, shared by every ad so they read as one brand:
 * one clean sans (Montserrat, standing in for Gotham), sentence case, no boxes, no colour highlights,
 * no per-word animation — each line simply fades in and out. The pajamas stay the subject.
 */
loadFont({ family: "Montserrat", url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });
loadFont({ family: "Inter", url: staticFile("fonts/Inter-Variable.woff2"), weight: "100 900" });

export const MIN_SANS = "Gotham, Montserrat, Helvetica, Arial, sans-serif";
export const INTER = "Inter, Helvetica, Arial, sans-serif";
const INK = "#1E1B18";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const fade = (f: number, dur: number, n = 4) => interpolate(f, [0, n, dur - n, dur], [0, 1, 1, 0], clamp);

/** Strip any legacy emphasis markers (*word*) so every word looks the same. */
const plain = (t: string) => t.replace(/\*/g, "");

/** Dialogue subtitle: white, discreet, one line where possible (two at most), lower safe area. */
export const MinimalSubtitle: React.FC<{ text: string; dur: number; top?: number; font?: string; size?: number }> = ({
  text,
  dur,
  top = 1410,
  font = MIN_SANS,
  size = 44,
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        top,
        display: "flex",
        justifyContent: "center",
        opacity: fade(f, dur),
      }}
    >
      <div
        style={{
          maxWidth: 860,
          textAlign: "center",
          fontFamily: font,
          fontWeight: 500,
          fontSize: size,
          lineHeight: 1.3,
          color: "#FFFFFF",
          textWrap: "balance",
          textShadow: "0 1px 2px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.32), 0 0 24px rgba(0,0,0,0.22)",
        }}
      >
        {plain(text)}
      </div>
    </div>
  );
};

/**
 * Short opening line, top of frame, never over the garment. "dark" sets ink on light walls; "light" sets white
 * with a faint top shade for darker or busy scenes.
 */
export const MinimalHook: React.FC<{ text: string; dur: number; tone?: "dark" | "light"; top?: number }> = ({
  text,
  dur,
  tone = "dark",
  top = 270,
}) => {
  const f = useCurrentFrame();
  const o = fade(f, dur, 6);
  return (
    <AbsoluteFill>
      {tone === "light" ? (
        <AbsoluteFill
          style={{ opacity: o, background: "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 22%, rgba(0,0,0,0) 34%)" }}
        />
      ) : null}
      <div style={{ position: "absolute", left: 90, right: 90, top, display: "flex", justifyContent: "center", opacity: o }}>
        <div
          style={{
            maxWidth: 900,
            textAlign: "center",
            fontFamily: MIN_SANS,
            fontWeight: 600,
            fontSize: 50,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: tone === "dark" ? INK : "#FFFFFF",
            textShadow: tone === "dark" ? "none" : "0 1px 3px rgba(0,0,0,0.45)",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Discreet sign-off: the RE:SET logo (left out when the real logo is already in shot) and one short line, e.g. "Buen Fin · 15% off en toda la tienda". */
export const MinimalEndTag: React.FC<{
  line: string;
  dur: number;
  tone?: "dark" | "light";
  top?: number;
  logo?: boolean;
  left?: number; // set to left-align the tag in a calm part of the frame ("\n" in the line breaks it)
  font?: string;
}> = ({ line, dur, tone = "dark", top = 300, logo = true, left, font = MIN_SANS }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, dur - 1, dur], [0, 1, 1, 1], clamp);
  return (
    <AbsoluteFill>
      {tone === "light" && top < 500 ? (
        <AbsoluteFill
          style={{ opacity: o, background: "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 24%, rgba(0,0,0,0) 36%)" }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: left ?? 0,
          right: left === undefined ? 0 : undefined,
          top,
          display: "flex",
          flexDirection: "column",
          alignItems: left === undefined ? "center" : "flex-start",
          opacity: o,
        }}
      >
        {logo ? (
          <Img
            src={staticFile(tone === "dark" ? "brand/reset-logo-black.png" : "brand/reset-logo-white.png")}
            style={{ width: 230, marginBottom: 20, filter: tone === "dark" ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }}
          />
        ) : null}
        <div
          style={{
            fontFamily: font,
            fontWeight: 500,
            fontSize: 34,
            letterSpacing: "0.04em",
            lineHeight: 1.35,
            whiteSpace: "pre-line",
            textAlign: left === undefined ? "center" : "left",
            color: tone === "dark" ? INK : "#FFFFFF",
            textShadow: tone === "dark" ? "none" : "0 1px 3px rgba(0,0,0,0.45)",
          }}
        >
          {line}
        </div>
      </div>
    </AbsoluteFill>
  );
};
