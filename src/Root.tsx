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
import {HotbookRecap, HOTBOOK_TOTAL} from './hotbook/HotbookRecap';
import {XmasHomeAd, XMASHOME_TOTAL} from './xmashome/XmasHomeAd';
import {VoiceAd, voiceAdTotal} from './voicead/VoiceAd';
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
		{/* Event recap: "Así vivimos HOTBOOK BAZAR" — all bazaar clips, stand photo close, logo only at the end */}
		<Composition id="HotbookBazar" component={HotbookRecap} durationInFrames={HOTBOOK_TOTAL} fps={FPS} width={1080} height={1920} />
		{/* Meta Ads: "Christmas at Home" — snow VFX behind the windows, the friend's real voice on the print, two-step CTA */}
		<Composition id="ChristmasAtHome" component={XmasHomeAd} durationInFrames={XMASHOME_TOTAL} fps={FPS} width={1080} height={1920} />
		{/* Meta Ads 01: "Navidad en familia" — her real words on coordinated prints, literal subtitles, store card */}
		<Composition id="NavidadEnFamilia" component={VoiceAd} durationInFrames={voiceAdTotal('familia')} fps={FPS} width={1080} height={1920} defaultProps={{ad: 'familia' as const}} />
		{/* Meta Ads 03: "Tu nueva pijama favorita" — olive basic set, her review, detail cutaways on each word */}
		<Composition id="PijamaFavorita" component={VoiceAd} durationInFrames={voiceAdTotal('favorita')} fps={FPS} width={1080} height={1920} defaultProps={{ad: 'favorita' as const}} />
	</>
);
