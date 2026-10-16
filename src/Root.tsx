import React from 'react';
import {Composition} from 'remotion';
import {ChristmasReel} from './ChristmasReel';
import {EssentialAd, essentialDefaults, ESSENTIAL_TOTAL} from './essential/EssentialAd';
import {HanukkahAd, HANUKKAH_TOTAL} from './hanukkah/HanukkahAd';
import {MagicReel} from './magic/MagicReel';
import {XmasAd, XMAS_TOTAL} from './xmas/XmasAd';
import {FeelAd, FEEL_TOTAL} from './feel/FeelAd';
import {HolidayAd, HOLIDAY_TOTAL} from './holiday/HolidayAd';
import {LookbookAd, LOOKBOOK_TOTAL} from './lookbook/LookbookAd';
import {SoftWinterAd, SOFTWINTER_TOTAL} from './softwinter/SoftWinterAd';
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
		{/* Meta Ads: "Soft Winter" — six clips, one narrative, logo only at the end */}
		<Composition id="SoftWinter" component={SoftWinterAd} durationInFrames={SOFTWINTER_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="Hanukkah" component={HanukkahAd} durationInFrames={HANUKKAH_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="Christmas2026" component={XmasAd} durationInFrames={XMAS_TOTAL} fps={FPS} width={1080} height={1920} />
		{/* "Mini Lookbook" — editorial Reel: best takes of the loungewear set, original music, logo at the close */}
		<Composition id="MiniLookbook" component={LookbookAd} durationInFrames={LOOKBOOK_TOTAL} fps={FPS} width={1080} height={1920} />
		{/* "Your Holiday RE:SET" — Meta ad: Christmas + Hanukkah collections, photo sequences, CTA close */}
		<Composition id="HolidayReset" component={HolidayAd} durationInFrames={HOLIDAY_TOTAL} fps={FPS} width={1080} height={1920} />
		{/* "Feel the Difference" — Meta ad: the material in her own words, the eight colours, CTA close */}
		<Composition id="FeelTheDifference" component={FeelAd} durationInFrames={FEEL_TOTAL} fps={FPS} width={1080} height={1920} />
	</>
);
