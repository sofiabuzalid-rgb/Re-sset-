import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('png');
Config.setCodec('h264');
Config.setCrf(14);
Config.setPixelFormat('yuv420p');
