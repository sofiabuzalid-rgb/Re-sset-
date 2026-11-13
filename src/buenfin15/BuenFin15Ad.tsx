import React from "react";
import { MinCaption, MinEdit, MinSub, MinimalAd, minimalTotal } from "../components/MinimalAd";
import ad02 from "./buenfin15-ad02.json";
import ad02Subs from "./buenfin15-ad02.subs.json";
import ad02Captions from "./buenfin15-ad02.captions.json";

// Buen Fin 15% ads on the shared minimal system: footage first, the official Buen Fin badge, Ilana's word-by-word captions, sign-off.
export const BUENFIN15_ADS = {
  ad02: {
    edit: ad02 as unknown as MinEdit,
    subs: ad02Subs as MinSub[],
    captions: ad02Captions as MinCaption[],
    dir: "buenfin15-ad02",
  },
};
export type BuenFin15AdId = keyof typeof BUENFIN15_ADS;
export const buenFin15Total = (ad: BuenFin15AdId) => minimalTotal(BUENFIN15_ADS[ad].edit);

export const BuenFin15Ad: React.FC<{ ad: BuenFin15AdId; bare?: boolean }> = ({ ad, bare }) => <MinimalAd {...BUENFIN15_ADS[ad]} bare={bare} />;
