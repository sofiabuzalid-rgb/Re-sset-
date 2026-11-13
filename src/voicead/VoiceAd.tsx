import React from "react";
import { MinEdit, MinSub, MinimalAd, minimalTotal } from "../components/MinimalAd";
import familia from "./familia.json";
import familiaSubs from "./familia.subs.json";
import favorita from "./favorita.json";
import favoritaSubs from "./favorita.subs.json";
import viaje from "./viaje.json";
import viajeSubs from "./viaje.subs.json";

// Voice-led ads on the shared minimal system: the pajamas first, her literal subtitles, a discreet sign-off.
export const VOICE_ADS = {
  familia: { edit: familia as unknown as MinEdit, subs: familiaSubs as MinSub[], dir: "familia" },
  favorita: { edit: favorita as unknown as MinEdit, subs: favoritaSubs as MinSub[], dir: "favorita" },
  viaje: { edit: viaje as unknown as MinEdit, subs: viajeSubs as MinSub[], dir: "viaje" },
};
export type VoiceAdId = keyof typeof VOICE_ADS;
export const voiceAdTotal = (ad: VoiceAdId) => minimalTotal(VOICE_ADS[ad].edit);

export const VoiceAd: React.FC<{ ad: VoiceAdId; bare?: boolean }> = ({ ad, bare }) => <MinimalAd {...VOICE_ADS[ad]} bare={bare} />;
