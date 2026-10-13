import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {EndCard} from './components/EndCard';
import {Footage} from './components/Footage';
import {GiftWrap} from './components/GiftWrap';
import {Framed, Triptych} from './components/Layouts';
import {GoldFlare, LightLeak} from './components/Light';
import {LuxText} from './components/LuxText';
import {Grain, TopScrim, Vignette} from './components/Overlays';
import {Snowfall} from './components/Snowfall';
import {colors} from './theme';
import type {Enter, Scene, Text} from './timeline';
import {BAR, DROP, END_START, FINAL_HIT, sceneDuration, scenes, TOTAL_FRAMES} from './timeline';

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Motion on the first frames after a cut. */
const EnterAnim: React.FC<{type: Enter; children: React.ReactNode}> = ({type, children}) => {
	const f = useCurrentFrame();
	const len = type === 'flare' ? 16 : type === 'slideUp' ? 12 : 9;
	const q = 1 - ease(Math.min(1, f / len));
	let transform = '';
	let blur = 0;
	if (type === 'zoom') {
		transform = `scale(${1 + q * 0.18})`;
		blur = q * 10;
	} else if (type === 'slideUp') {
		transform = `translateY(${q * 100}%)`;
		blur = q * 14;
	} else if (type === 'flare') {
		transform = `scale(${1 + q * 0.1})`;
		blur = q * 6;
	}
	return <AbsoluteFill style={{transform, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};

/** Subtle camera life: a soft push on each downbeat after the drop, a short shake on the big hits. */
const CameraRig: React.FC<{children: React.ReactNode}> = ({children}) => {
	const f = useCurrentFrame();
	const since = f >= DROP ? (f - DROP) % BAR : 99;
	const bump = 1 + 0.014 * Math.exp(-since / 5);
	const shakeFor = (at: number, len: number, amp: number) => (f >= at && f < at + len ? amp * (1 - (f - at) / len) : 0);
	const shake = shakeFor(DROP, 14, 12) + shakeFor(FINAL_HIT, 10, 6);
	const dx = (random(`cx-${f}`) - 0.5) * 2 * shake;
	const dy = (random(`cy-${f}`) - 0.5) * 2 * shake;
	return <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${bump})`}}>{children}</AbsoluteFill>;
};

const TextBlock: React.FC<{text: Text}> = ({text}) => {
	if (text.position === 'center') {
		return (
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 120}}>
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 30% at 50% 46%, rgba(30,0,8,0.65), rgba(30,0,8,0) 100%)'}} />
				<LuxText kicker={text.kicker} title={text.title} size={140} exitAt={6} />
			</AbsoluteFill>
		);
	}
	return (
		<>
			<TopScrim />
			<div style={{position: 'absolute', top: 250, left: 40, right: 40}}>
				<LuxText kicker={text.kicker} title={text.title} size={132} exitAt={6} />
			</div>
		</>
	);
};

const SceneView: React.FC<{scene: Scene; index: number}> = ({scene, index}) => {
	const duration = sceneDuration(index);
	let picture: React.ReactNode;
	if (scene.layout === 'triptych') picture = <Triptych footage={scene.footage} />;
	else if (scene.layout === 'framed') picture = <Framed footage={scene.footage[0]} />;
	else picture = <Footage src={scene.footage[0].src} segments={scene.footage[0].segments} zoom={scene.zoom} blur={scene.blur} />;
	return (
		<AbsoluteFill>
			<EnterAnim type={scene.enter}>{picture}</EnterAnim>
			{scene.text?.map((t, i) => {
				const at = t.at ?? 0;
				return (
					<Sequence key={i} from={at} durationInFrames={(t.until ?? duration) - at} layout="none">
						<TextBlock text={t} />
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

const Sfx: React.FC<{src: string; at: number; volume?: number; len?: number}> = ({src, at, volume = 1, len = 60}) => (
	<Sequence from={Math.max(0, at)} durationInFrames={len} layout="none">
		<Audio src={staticFile(`audio/${src}`)} volume={volume} />
	</Sequence>
);

export const ChristmasReel: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: colors.wine}}>
			<CameraRig>
				{scenes.map((scene, i) => (
					<Sequence key={scene.id} from={scene.start} durationInFrames={sceneDuration(i)} premountFor={20}>
						<SceneView scene={scene} index={i} />
					</Sequence>
				))}
			</CameraRig>

			{/* HOOK title over the montage, after the gift opens */}
			<Sequence from={48} durationInFrames={DROP - 48}>
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 32% at 50% 36%, rgba(30,0,8,0.7), rgba(30,0,8,0) 100%)'}} />
				<div style={{position: 'absolute', top: 470, left: 30, right: 30}}>
					<LuxText kicker="Esta Navidad" title={'¿Qué hay\ndentro?'} size={176} exitAt={5} />
				</div>
			</Sequence>

			<Snowfall intensity={0.6} />

			<Sequence from={END_START}>
				<EndCard />
			</Sequence>

			{/* the wrapped-screen opener sits on top of everything */}
			<Sequence from={0} durationInFrames={54}>
				<GiftWrap />
			</Sequence>

			<GoldFlare at={DROP} pre={6} post={24} />
			<GoldFlare at={END_START} pre={6} post={18} strength={0.6} />
			<GoldFlare at={FINAL_HIT} pre={3} post={20} strength={0.7} y="40%" />
			<LightLeak at={scenes.find((s) => s.id === 'triptych')!.start} />
			<LightLeak at={scenes.find((s) => s.id === 'lineup')!.start} />
			<Vignette strength={0.5} />
			<Grain opacity={0.05} />

			{/* SOUND */}
			<Audio
				src={staticFile('audio/music.wav')}
				volume={(fr) => interpolate(fr, [TOTAL_FRAMES - 12, TOTAL_FRAMES - 1], [1, 0], {extrapolateLeft: 'clamp'})}
			/>
			<Sfx src="whoosh.wav" at={25} volume={0.5} len={15} />
			<Sfx src="rip.wav" at={34} volume={0.55} len={17} />
			<Sfx src="shimmer.wav" at={36} volume={0.35} len={60} />
			{scenes
				.filter((s) => s.start > 0 && s.enter !== 'none')
				.map((s) => (
					<Sfx key={s.id} src="whoosh.wav" at={s.start - 6} volume={0.32} len={15} />
				))}
			<Sfx src="shimmer.wav" at={DROP - 2} volume={0.4} len={70} />
			<Sfx src="sparkle.wav" at={END_START + 8} volume={0.45} len={60} />
		</AbsoluteFill>
	);
};
