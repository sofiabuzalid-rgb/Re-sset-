import React from 'react';
import {Composition} from 'remotion';
import {ChristmasReel} from './ChristmasReel';
import {FPS, TOTAL_FRAMES} from './timeline';

export const RemotionRoot: React.FC = () => (
	<>
		{/* 9:16 vertical Reel for Instagram Reels & TikTok */}
		<Composition
			id="ChristmasReel"
			component={ChristmasReel}
			durationInFrames={TOTAL_FRAMES}
			fps={FPS}
			width={1080}
			height={1920}
		/>
	</>
);
