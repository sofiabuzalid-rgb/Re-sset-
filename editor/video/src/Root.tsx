import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { FPS, TOTAL } from "./recreacion/config";
import { Recreacion } from "./recreacion/Recreacion";
import { Cajon } from "./cajon/Cajon";
import { Regalo01 } from "./regalo01/Regalo01";
import { Tonos } from "./tonos/Tonos";
import { Outlet } from "./outlet25/Outlet";
import { Promo } from "./promo/Promo";
import { Ad01, Ad02, Ad03, Ad04, DUR as ADS_DUR } from "./ads4/Ads";
import { OutletAd01, OutletAd02, OutletAd03, OutletAd04 } from "./outlet4/Ads";
import { Re12, RE_FRAMES } from "./re12/Re12";
import { Perisur, PERISUR_FRAMES } from "./perisur/Perisur";
import { Ad06, Ad07, Ad08, Ad09, Ad10, Ad11, frames2 } from "./outlet2/Ads2";
import { frames as outletFrames } from "./outlet4/config";
import { TOTAL_S as PROMO_S } from "./promo/config";
import { Outlet2 } from "./outlet25b/Outlet2";
import { TOTAL_S as OUT2_S } from "./outlet25b/config";
import { TOTAL_S as OUT_S } from "./outlet25/config";
import { Main as PycMain, MAIN_FRAMES as PYC_MAIN, Short as PycShort, SHORT_FRAMES as PYC_SHORT } from "./pyc/Pyc";
import { Coleccion } from "./coleccion/Coleccion";
import { TOTAL_S as COL_S } from "./coleccion/config";
import { TOTAL_S as TONOS_S } from "./tonos/config";
import { Familia } from "./campana/familia/Ad";
import { Casa } from "./campana/casa/Ad";
import { Favorita } from "./campana/favorita/Ad";
import { Viaje } from "./campana/viaje/Ad";
import { T as T_VIA } from "./campana/viaje/config";
import { T as T_FAV } from "./campana/favorita/config";
import { T as T_CASA } from "./campana/casa/config";
import { T as T_FAM } from "./campana/familia/config";
import { Olivo } from "./olivo04/Olivo";
import { FPS as O_FPS, TOTAL as O_TOTAL } from "./olivo04/config";
import { Navidad } from "./navidad03/Navidad";
import { FPS as N_FPS, TOTAL as N_TOTAL } from "./navidad03/config";
import { Pauta } from "./regalo01/Pauta";
import { FPS as P_FPS, TOTAL as P_TOTAL } from "./regalo01/pauta.config";
import { FPS as R1_FPS, TOTAL as R1_TOTAL } from "./regalo01/config";
import { FPS as CAJON_FPS, TOTAL as CAJON_TOTAL } from "./cajon/config";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="Regalo01Pauta"
        component={Pauta}
        durationInFrames={P_TOTAL}
        fps={P_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="NavidadMeta"
        component={Navidad}
        durationInFrames={N_TOTAL}
        fps={N_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="OlivoMeta"
        component={Olivo}
        durationInFrames={O_TOTAL}
        fps={O_FPS}
        width={1080}
        height={1920}
      />
      <Composition id="RESET-OUTLET-06-SOLO-IBA-A-VER" component={Ad06} durationInFrames={frames2("ad06")} fps={30} width={1080} height={1920} />
      <Composition id="RESET-OUTLET-07-HAZ-LAS-CUENTAS" component={Ad07} durationInFrames={frames2("ad07")} fps={30} width={1080} height={1920} />
      <Composition id="RESET-OUTLET-08-ELIGE-TU-PERSONALIDAD" component={Ad08} durationInFrames={frames2("ad08")} fps={30} width={1080} height={1920} />
      <Composition id="RESET-OUTLET-09-ALGORITMO" component={Ad09} durationInFrames={frames2("ad09")} fps={30} width={1080} height={1920} />
      <Composition id="RESET-FIESTAS-FAMILIA" component={Ad11} durationInFrames={frames2("ad11")} fps={30} width={1080} height={1920} />
      <Composition id="RESET-OUTLET-10-DIEZ-SEGUNDOS" component={Ad10} durationInFrames={frames2("ad10")} fps={30} width={1080} height={1920} />
      <Composition id="RESET-PERISUR-STORE-REVEAL" component={() => <Perisur music="outlet4/audio/perisur_music_original.wav" />} durationInFrames={PERISUR_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="RE-12-A-REF-AUDIO" component={() => <Re12 music="outlet4/audio/re12_ref.wav" />} durationInFrames={RE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="RE-12-B-LICENSED" component={() => <Re12 music="outlet4/audio/re12_b_original.wav" />} durationInFrames={RE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="OUTLET-AD01-YA-LLEGO" component={OutletAd01} durationInFrames={outletFrames("ad1")} fps={30} width={1080} height={1920} />
      <Composition id="OUTLET-AD02-CHAT" component={OutletAd02} durationInFrames={outletFrames("ad2")} fps={30} width={1080} height={1920} />
      <Composition id="OUTLET-AD03-25-DROP" component={OutletAd03} durationInFrames={outletFrames("ad3")} fps={30} width={1080} height={1920} />
      <Composition id="OUTLET-AD04-NO-TE-DUERMAS" component={OutletAd04} durationInFrames={outletFrames("ad4")} fps={30} width={1080} height={1920} />
      <Composition id="AD-01-SENAL" component={Ad01} durationInFrames={ADS_DUR.ad1} fps={30} width={1080} height={1920} />
      <Composition id="AD-02-POV" component={Ad02} durationInFrames={ADS_DUR.ad2} fps={30} width={1080} height={1920} />
      <Composition id="AD-03-PRECIO" component={Ad03} durationInFrames={ADS_DUR.ad3} fps={30} width={1080} height={1920} />
      <Composition id="AD-04-DROP" component={Ad04} durationInFrames={ADS_DUR.ad4} fps={30} width={1080} height={1920} />
      <Composition id="RE-RESET-DESCUENTO" component={Promo} durationInFrames={Math.round(PROMO_S * 30)} fps={30} width={1080} height={1920} />
      <Composition id="RE-RESET-OUTLET-25-v2" component={Outlet2} durationInFrames={Math.round(OUT2_S * 30)} fps={30} width={1080} height={1920} />
      <Composition id="RE-RESET-OUTLET-25" component={Outlet} durationInFrames={Math.round(OUT_S * 30)} fps={30} width={1080} height={1920} />
      <Composition id="PYC-Main" component={PycMain} durationInFrames={PYC_MAIN} fps={30} width={1080} height={1920} />
      <Composition id="PYC-Short" component={PycShort} durationInFrames={PYC_SHORT} fps={30} width={1080} height={1920} />
      <Composition id="Reel-NewCollection" component={Coleccion} durationInFrames={Math.round(COL_S * 30)} fps={30} width={1080} height={1920} />
      <Composition id="Reel-NuevoModelo3Tonos" component={Tonos} durationInFrames={Math.round(TONOS_S * 30)} fps={30} width={1080} height={1920} />
      <Composition id="C04-TuPijamaDeViaje" component={Viaje} durationInFrames={T_VIA.total} fps={30} width={1080} height={1920} />
      <Composition id="C03-TuNuevaPijamaFavorita" component={Favorita} durationInFrames={T_FAV.total} fps={30} width={1080} height={1920} />
      <Composition id="C02-ChristmasAtHome" component={Casa} durationInFrames={T_CASA.total} fps={30} width={1080} height={1920} />
      <Composition id="C01-NavidadEnFamilia" component={Familia} durationInFrames={T_FAM.total} fps={30} width={1080} height={1920} />
      <Composition
        id="Regalo01"
        component={Regalo01}
        durationInFrames={R1_TOTAL}
        fps={R1_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="CajonNavidad"
        component={Cajon}
        durationInFrames={CAJON_TOTAL}
        fps={CAJON_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Recreacion"
        component={Recreacion}
        durationInFrames={TOTAL}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
