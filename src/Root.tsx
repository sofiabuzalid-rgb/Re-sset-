import React from 'react';
import {Composition} from 'remotion';
import {ChristmasReel} from './ChristmasReel';
import {EssentialAd, essentialDefaults, ESSENTIAL_TOTAL} from './essential/EssentialAd';
import {HanukkahAd, HANUKKAH_TOTAL} from './hanukkah/HanukkahAd';
import {MagicReel} from './magic/MagicReel';
import {XmasAd, XMAS_TOTAL} from './xmas/XmasAd';
import {XmasListAd, XMAS_LIST_TOTAL} from './xmas2/XmasListAd';
import {BtsFilm, BTS_TOTAL} from './bts/BtsFilm';
import {ComfyAd, COMFY_TOTAL} from './comfy/ComfyAd';
import {PinkDetail, PINK_TOTAL} from './pink/PinkDetail';
import {BlueDetail, BLUE_TOTAL} from './blue/BlueDetail';
import {BrownDetail, BROWN_TOTAL} from './brown/BrownDetail';
import {GreyDetail, GREY_TOTAL} from './grey/GreyDetail';
import {BazarReel, BAZAR_TOTAL} from './bazar/BazarReel';
import {Day2Reel, DAY2_TOTAL} from './day2/Day2Reel';
import {RotationReel, ROTATION_TOTAL} from './rotation/RotationReel';
import {NflAd, NFL_TOTAL} from './nfl/NflAd';
import {MatchAd, MATCH_TOTAL} from './match/MatchAd';
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
		<Composition id="Christmas2026B" component={XmasListAd} durationInFrames={XMAS_LIST_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="LoQueNoVes" component={BtsFilm} durationInFrames={BTS_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="YourComfyEra" component={ComfyAd} durationInFrames={COMFY_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="PinkDetail" component={PinkDetail} durationInFrames={PINK_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="BlueDetail" component={BlueDetail} durationInFrames={BLUE_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="BrownDetail" component={BrownDetail} durationInFrames={BROWN_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="GreyDetail" component={GreyDetail} durationInFrames={GREY_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="HotbookBazar" component={BazarReel} durationInFrames={BAZAR_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="HotbookDay2" component={Day2Reel} durationInFrames={DAY2_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="MyRotation" component={RotationReel} durationInFrames={ROTATION_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="NflFamily" component={NflAd} durationInFrames={NFL_TOTAL} fps={FPS} width={1080} height={1920} />
		<Composition id="MatchEnCasa" component={MatchAd} durationInFrames={MATCH_TOTAL} fps={FPS} width={1080} height={1920} />
	</>
);
