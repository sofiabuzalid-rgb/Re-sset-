import React from "react";
import { MinEdit, MinSub, MinimalAd, minimalTotal } from "../components/MinimalAd";
import ad02 from "./buenfin15-ad02.json";
import ad02Subs from "./buenfin15-ad02.subs.json";

// Buen Fin 15% ads on the shared minimal system: footage first, a short hook, Ilana's literal subtitles, sign-off.
export const BUENFIN15_ADS = {
  ad02: { edit: ad02 as unknown as MinEdit, subs: ad02Subs as MinSub[], dir: "buenfin15-ad02" },
};
export type BuenFin15AdId = keyof typeof BUENFIN15_ADS;
export const buenFin15Total = (ad: BuenFin15AdId) => minimalTotal(BUENFIN15_ADS[ad].edit);

export const BuenFin15Ad: React.FC<{ ad: BuenFin15AdId; bare?: boolean }> = ({ ad, bare }) => <MinimalAd {...BUENFIN15_ADS[ad]} bare={bare} />;
