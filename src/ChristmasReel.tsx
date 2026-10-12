import {clockWipe} from '@remotion/transitions/clock-wipe';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {linearTiming, springTiming, TransitionSeries} from '@remotion/transitions';
import type {TransitionPresentation} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Bokeh} from './components/Bokeh';
import {Caption} from './components/Caption';
import {EndCard} from './components/EndCard';
import {Footage} from './components/Footage';
import {Intro} from './components/Intro';
import {Grain, TopScrim, Vignette} from './components/Overlays';
import {Snowfall} from './components/Snowfall';
import {colors} from './theme';
import {BEAT, sceneStarts, scenes, TRANSITION, transitionStarts} from './timeline';
import type {Scene, TransitionKind} from './timeline';
import {ribbon} from './transitions/ribbon';
import {sparkleFade} from './transitions/sparkleFade';
import {whip} from './transitions/whip';

const presentationFor = (kind: TransitionKind, index: number): TransitionPresentation<any> => {
	switch (kind) {
		case 'ribbon':
			return index % 2
				? ribbon({color: colors.cranberry, stripe: colors.gold})
				: ribbon({color: colors.pine, stripe: colors.cranberry});
		case 'whip':
			return whip();
		case 'slide':
			return slide({direction: 'from-right'});
		case 'clock':
			return clockWipe({width: 1080, height: 1920});
		case 'wipe':
			return wipe({direction: 'from-top-left'});
		case 'sparkleFade':
			return sparkleFade({glow: 'rgba(255,225,160,1)'});
	}
};

const timingFor = (kind: TransitionKind) =>
	kind === 'whip' || kind === 'slide'
		? springTiming({config: {damping: 200}, durationInFrames: TRANSITION})
		: linearTiming({durationInFrames: TRANSITION});

const SceneView: React.FC<{scene: Scene}> = ({scene}) => {
	if (scene.kind !== 'clip') return scene.kind === 'intro' ? <Intro {...scene} /> : <EndCard {...scene} />;
	return (
		<AbsoluteFill>
			<Footage src={scene.src} from={scene.from} playbackRate={scene.playbackRate} zoom={scene.zoom} />
			<TopScrim />
			{scene.caption ? <Caption caption={scene.caption} /> : null}
		</AbsoluteFill>
	);
};

export const ChristmasReel: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	const endcardStart = sceneStarts[sceneStarts.length - 1];

	return (
		<AbsoluteFill style={{backgroundColor: colors.cranberryDeep}}>
			<TransitionSeries>
				{scenes.flatMap((scene, i) => {
					const items = [];
					if (i > 0 && scene.enter) {
						items.push(
							<TransitionSeries.Transition
								key={`t-${scene.id}`}
								presentation={presentationFor(scene.enter, i)}
								timing={timingFor(scene.enter)}
							/>,
						);
					}
					items.push(
						<TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames} premountFor={30}>
							<SceneView scene={scene} />
						</TransitionSeries.Sequence>,
					);
					return items;
				})}
			</TransitionSeries>

			{/* Global festive layers */}
			<Bokeh count={10} opacity={0.35} />
			<Snowfall />
			<Vignette />
			<Grain />

			{/* Soundtrack: synthesized Jingle Bells @ 120 BPM, cut grid = 1 beat = 15 frames */}
			<Audio
				src={staticFile('audio/jingle.wav')}
				volume={(f) =>
					interpolate(f, [0, 4, durationInFrames - 24, durationInFrames - 1], [0, 0.9, 0.9, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})
				}
			/>
			{transitionStarts.map((start, i) => (
				<Sequence key={`whoosh-${i}`} from={Math.max(0, start - 4)} durationInFrames={24}>
					<Audio src={staticFile('audio/whoosh.wav')} volume={0.55} />
				</Sequence>
			))}
			<Sequence from={4} durationInFrames={66}>
				<Audio src={staticFile('audio/sparkle.wav')} volume={0.6} />
			</Sequence>
			<Sequence from={endcardStart + BEAT + 6} durationInFrames={66}>
				<Audio src={staticFile('audio/sparkle.wav')} volume={0.6} />
			</Sequence>
		</AbsoluteFill>
	);
};
