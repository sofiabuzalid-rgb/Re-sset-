import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { FPS, TOTAL } from "./recreacion/config";
import { Recreacion } from "./recreacion/Recreacion";
import { Cajon } from "./cajon/Cajon";
import { FPS as CAJON_FPS, TOTAL as CAJON_TOTAL } from "./cajon/config";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
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
