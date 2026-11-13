import React from "react";
import { MinEdit, MinSub, MinimalAd, minimalTotal } from "../components/MinimalAd";
import ad01 from "./football-ad01.json";
import ad01Subs from "./football-ad01.subs.json";
import ad02 from "./football-ad02.json";
import ad02Subs from "./football-ad02.subs.json";

// Football outlet ads on the shared minimal system: the designs first, her literal subtitles, a discreet sign-off.
export const FOOTBALL_ADS = {
  ad01: { edit: ad01 as unknown as MinEdit, subs: ad01Subs as MinSub[], dir: "football-ad01" },
  ad02: { edit: ad02 as unknown as MinEdit, subs: ad02Subs as MinSub[], dir: "football-ad02" },
};
export type FootballAdId = keyof typeof FOOTBALL_ADS;
export const footballTotal = (ad: FootballAdId) => minimalTotal(FOOTBALL_ADS[ad].edit);

export const FootballAd: React.FC<{ ad: FootballAdId; bare?: boolean }> = ({ ad, bare }) => <MinimalAd {...FOOTBALL_ADS[ad]} bare={bare} />;
