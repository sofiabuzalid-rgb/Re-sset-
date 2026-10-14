import React from 'react';
import {Composition} from 'remotion';
import {ChristmasReel} from './ChristmasReel';
import {EssentialAd, essentialDefaults, ESSENTIAL_TOTAL} from './essential/EssentialAd';
import {MagicReel} from './magic/MagicReel';
import {TOTAL as MAGIC_TOTAL} from './magic/timeline';
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
		{/* "The Magic of Christmas": four sets, snow-vortex reveals, no on-screen text */}
		<Composition id="MagicChristmas" component={MagicReel} durationInFrames={MAGIC_TOTAL} fps={FPS} width={1080} height={1920} />
		{/* Meta Ads: "Essential de Botones" — real narration, feature tags, end card */}
		<Composition
			id="EssentialDeBotones"
			component={EssentialAd}
			durationInFrames={ESSENTIAL_TOTAL}
			fps={FPS}
			width={1080}
			height={1920}
			defaultProps={essentialDefaults}
		/>
	</>
);
