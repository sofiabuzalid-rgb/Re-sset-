import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { FPS, TOTAL } from "./recreacion/config";
import { Recreacion } from "./recreacion/Recreacion";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition id="Recreacion" component={Recreacion} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    </>
  );
};
