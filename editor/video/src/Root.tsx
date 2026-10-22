import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { FPS, TOTAL } from "./recreacion/config";
import { Recreacion } from "./recreacion/Recreacion";
import { Cajon } from "./cajon/Cajon";
import { Regalo01 } from "./regalo01/Regalo01";
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
