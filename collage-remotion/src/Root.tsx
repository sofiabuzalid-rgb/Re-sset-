import {Composition} from 'remotion';
import {ResetCollage, DURATION, FPS} from './ResetCollage';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ResetCollage"
    component={ResetCollage}
    durationInFrames={DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
