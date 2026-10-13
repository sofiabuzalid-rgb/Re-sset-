import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BagTrail, RealSnow, RevealShimmer, SnowVortex, WarmLight} from './effects';
import {FINAL_CHORD, MUSIC_TRIM, placed, TOTAL, VORTEX} from './timeline';
import type {Placed} from './timeline';

/** Original footage, untouched apart from a very light polish (colours stay true to the product). */
const Shot: React.FC<{clip: Placed; vortexOut: boolean}> = ({clip, vortexOut}) => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	// entering through a vortex: emerge from the swirl, slightly soft and close, then settle
	const inP = clip.enter === 'vortex' ? interpolate(f, [0, VORTEX], [0, 1], {extrapolateRight: 'clamp'}) : 1;
	// leaving through a vortex: drift softly into the swirl
	const outP = vortexOut ? interpolate(f, [durationInFrames - VORTEX, durationInFrames], [0, 1], {extrapolateLeft: 'clamp'}) : 0;
	const blur = (1 - inP) * 14 + outP * 12;
	const scale = 1 + (1 - inP) * 0.05 + outP * 0.04;
	return (
		<AbsoluteFill style={{opacity: inP, transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
			<OffthreadVideo
				muted
				src={staticFile(`magic/${clip.id}.mp4`)}
				trimBefore={clip.offset ?? 0}
				style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.04) brightness(1.02) saturate(1.03)'}}
			/>
		</AbsoluteFill>
	);
};

const Sfx: React.FC<{src: string; at: number; volume?: number; len?: number}> = ({src, at, volume = 1, len = 60}) => (
	<Sequence from={Math.max(0, at)} durationInFrames={len} layout="none">
		<Audio src={staticFile(`audio/${src}`)} volume={volume} />
	</Sequence>
);

export const MagicReel: React.FC = () => {
	const vortexes = placed.filter((c) => c.enter === 'vortex').map((c) => c.start + VORTEX / 2);
	return (
		<AbsoluteFill style={{backgroundColor: '#1b0f0a'}}>
			{placed.map((c, i) => (
				<Sequence key={c.id} from={c.start} durationInFrames={c.frames} premountFor={20}>
					<Shot clip={c} vortexOut={placed[i + 1]?.enter === 'vortex'} />
				</Sequence>
			))}

			<WarmLight />
			<RealSnow />

			{placed
				.filter((c) => c.bag)
				.map((c) => (
					<Sequence key={`trail-${c.id}`} from={c.start} durationInFrames={c.frames} layout="none">
						<BagTrail {...c.bag!} seed={c.id} />
					</Sequence>
				))}
			{placed
				.filter((c) => c.reveal)
				.map((c) => (
					<Sequence key={`shim-${c.id}`} from={c.start + (c.enter === 'vortex' ? VORTEX / 2 : 0)} durationInFrames={45} layout="none">
						<RevealShimmer seed={c.id} />
					</Sequence>
				))}
			{vortexes.map((at, i) => (
				<SnowVortex key={i} at={at} seed={`vortex-${i}`} />
			))}
			{/* the whole collection lands on the final chord */}
			<Sequence from={FINAL_CHORD} durationInFrames={50} layout="none">
				<RevealShimmer seed="finale" />
			</Sequence>

			{/* SOUND: cinematic Carol of the Bells (drop on the first reveal) + soft whooshes on each vortex */}
			<Audio
				src={staticFile('audio/music-magic.wav')}
				trimBefore={MUSIC_TRIM}
				volume={(f) => interpolate(f, [0, 3, TOTAL - 18, TOTAL - 1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
			/>
			{vortexes.map((at, i) => (
				<Sfx key={`w${i}`} src="whoosh.wav" at={at - 8} volume={0.45} len={16} />
			))}
			{placed
				.filter((c) => c.reveal)
				.map((c) => (
					<Sfx key={`s-${c.id}`} src="sparkle.wav" at={c.start + (c.enter === 'vortex' ? VORTEX / 2 : 0)} volume={0.28} len={50} />
				))}
		</AbsoluteFill>
	);
};
