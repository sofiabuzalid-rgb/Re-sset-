import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Confetti} from './components/Confetti';
import {EndCard} from './components/EndCard';
import {Footage} from './components/Footage';
import {HookTitle} from './components/HookTitle';
import {Grain, TopScrim, Vignette} from './components/Overlays';
import {Snowfall} from './components/Snowfall';
import {SparkleField} from './components/Sparkle';
import {Starburst} from './components/Starburst';
import {StickerText} from './components/StickerText';
import {colors} from './theme';
import type {Caption, Enter, Scene} from './timeline';
import {BEAT, DROP, END_START, FINAL_HIT, sceneDuration, scenes, TOTAL_FRAMES} from './timeline';

const ENTER_FRAMES = 7;

/** Motion on the first frames after a hard cut — this is what sells the "edit". */
const EnterAnim: React.FC<{type: Enter; children: React.ReactNode}> = ({type, children}) => {
	const frame = useCurrentFrame();
	const p = Easing.out(Easing.cubic)(Math.min(1, frame / ENTER_FRAMES));
	const q = 1 - p;
	let transform = '';
	let blur = 0;
	switch (type) {
		case 'impact':
			transform = `scale(${1 + q * 0.5})`;
			blur = q * 8;
			break;
		case 'punch':
			transform = `scale(${1 + q * 0.25})`;
			blur = q * 6;
			break;
		case 'whip':
			transform = `translateX(${q * 100}%) skewX(${-q * 12}deg)`;
			blur = q * 26;
			break;
		case 'slideUp':
			transform = `translateY(${q * 100}%)`;
			blur = q * 16;
			break;
		case 'spin':
			transform = `rotate(${-q * 25}deg) scale(${1 + q * 0.5})`;
			blur = q * 10;
			break;
	}
	return <AbsoluteFill style={{transform, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};

/** Camera feel on the whole picture: bump on every beat, shake on the drop and the final hit. */
const CameraRig: React.FC<{children: React.ReactNode}> = ({children}) => {
	const f = useCurrentFrame();
	const since = f % BEAT;
	const bumpAmt = f >= DROP ? 0.035 : 0.015;
	const bump = 1 + bumpAmt * Math.exp(-since / 3);
	const shakeFor = (at: number, len: number, amp: number) =>
		f >= at && f < at + len ? amp * (1 - (f - at) / len) : 0;
	const shake = shakeFor(DROP, 18, 26) + shakeFor(0, 10, 16) + shakeFor(FINAL_HIT, 14, 18);
	const dx = (random(`cx-${f}`) - 0.5) * 2 * shake;
	const dy = (random(`cy-${f}`) - 0.5) * 2 * shake;
	return <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${bump})`}}>{children}</AbsoluteFill>;
};

const CaptionView: React.FC<{caption: Caption}> = ({caption}) => {
	if (caption.burst) {
		return (
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 200}}>
				<Starburst size={1600} />
				<div style={{transform: 'rotate(-6deg)'}}>
					<StickerText main={caption.main} size={168} stagger={0} color={colors.cream} />
				</div>
				<SparkleField count={12} seed="sorpresa" area={{x: 40, y: 500, w: 1000, h: 700}} maxSize={80} />
			</AbsoluteFill>
		);
	}
	return (
		<>
			<TopScrim />
			<div style={{position: 'absolute', top: 230, left: 40, right: 40}}>
				<StickerText top={caption.top} main={caption.main} size={140} delay={1} />
			</div>
		</>
	);
};

const SceneView: React.FC<{scene: Scene; index: number}> = ({scene, index}) => {
	const duration = sceneDuration(index);
	return (
		<AbsoluteFill>
			<EnterAnim type={scene.enter}>
				<Footage src={scene.src} segments={scene.segments} zoom={scene.zoom} blur={scene.id === 'end' ? 18 : 0} />
			</EnterAnim>
			{scene.captions?.map((c, i) => {
				const at = c.at ?? 0;
				return (
					<Sequence key={i} from={at} durationInFrames={(c.until ?? duration) - at} layout="none">
						<CaptionView caption={c} />
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

const Flash: React.FC<{at: number; len?: number; color?: string}> = ({at, len = 5, color = '#fff'}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [at, at + len], [0.95, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	if (f < at || o <= 0) return null;
	return <AbsoluteFill style={{backgroundColor: color, opacity: o, pointerEvents: 'none'}} />;
};

const Sfx: React.FC<{src: string; at: number; volume?: number; len?: number}> = ({src, at, volume = 1, len = 60}) => (
	<Sequence from={Math.max(0, at)} durationInFrames={len} layout="none">
		<Audio src={staticFile(`audio/${src}`)} volume={volume} />
	</Sequence>
);

export const ChristmasReel: React.FC = () => {
	const captionCues = scenes.flatMap((s) => (s.captions ?? []).map((c) => ({at: s.start + (c.at ?? 0), burst: !!c.burst})));

	return (
		<AbsoluteFill style={{backgroundColor: colors.cranberryDeep}}>
			<CameraRig>
				{scenes.map((scene, i) => (
					<Sequence key={scene.id} from={scene.start} durationInFrames={sceneDuration(i)} premountFor={20}>
						<SceneView scene={scene} index={i} />
					</Sequence>
				))}
			</CameraRig>

			<Snowfall intensity={0.7} />

			{/* HOOK */}
			<Sequence from={0} durationInFrames={DROP}>
				<HookTitle duration={DROP} />
			</Sequence>

			{/* DROP */}
			<Sequence from={DROP} durationInFrames={95}>
				<Confetti start={0} x={540} y={1300} count={170} seed="drop" power={1.15} />
			</Sequence>

			{/* END CARD */}
			<Sequence from={END_START}>
				<EndCard />
			</Sequence>

			<Flash at={DROP} len={6} />
			<Flash at={FINAL_HIT} len={6} color={colors.goldBright} />
			<Vignette strength={0.45} />
			<Grain opacity={0.06} />

			{/* SOUND: music (150 BPM, drop at bar 2) + SFX layered on the edit */}
			<Audio
				src={staticFile('audio/music.wav')}
				volume={(f) => interpolate(f, [TOTAL_FRAMES - 10, TOTAL_FRAMES - 1], [1, 0], {extrapolateLeft: 'clamp'})}
			/>
			<Sfx src="impact.wav" at={DROP} volume={0.7} />
			{scenes
				.filter((s) => s.enter !== 'impact' && s.start > 0)
				.map((s) => (
					<Sfx key={`w-${s.id}`} src="whoosh.wav" at={s.start - 6} volume={0.45} len={15} />
				))}
			{captionCues.map((c, i) => (
				<Sfx key={`p-${i}`} src={c.burst ? 'sparkle.wav' : 'pop.wav'} at={c.at + 1} volume={c.burst ? 0.5 : 0.6} len={c.burst ? 50 : 6} />
			))}
			<Sfx src="sparkle.wav" at={END_START + 8} volume={0.5} len={50} />
			<Sfx src="pop.wav" at={END_START + 48} volume={0.7} len={6} />
		</AbsoluteFill>
	);
};
