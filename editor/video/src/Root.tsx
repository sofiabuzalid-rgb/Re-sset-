import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { FPS, TOTAL } from "./recreacion/config";
import { Recreacion } from "./recreacion/Recreacion";
import { Cajon } from "./cajon/Cajon";
import { Regalo01 } from "./regalo01/Regalo01";
import { Tonos } from "./tonos/Tonos";
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
