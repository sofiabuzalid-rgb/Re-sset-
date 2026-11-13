import React from "react";
import { MinCaption, MinEdit, MinSub, MinimalAd, minimalTotal } from "../components/MinimalAd";
import edit from "./ilana.json";
import subs from "./ilana.subs.json";
import captions from "./ilana.captions.json";

// Buen Fin 15% OFF with Ilana: her pink set, the Christmas print in kids' and adult sizes, her own close.
// Original framing (no zoom, no blur), Inter subtitles, one discreet sign-off on the last real shot.
const E = edit as unknown as MinEdit;
export const ILANA_TOTAL = minimalTotal(E);
export const IlanaAd: React.FC<{ bare?: boolean }> = ({ bare }) => <MinimalAd edit={E} subs={subs as MinSub[]} dir="ilana" bare={bare} captions={captions as MinCaption[]} />;
