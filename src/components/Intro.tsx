import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';
import {BEAT} from '../timeline';
import {Footage} from './Footage';
import {Logo} from './Logo';
import {SparkleField} from './Sparkle';

/** Hook: footage behind a cranberry glow, the RE:SET wordmark drops in on the downbeat. */
export const Intro: React.FC<{src: string; from: number; playbackRate: number}> = (props) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	// Tint starts heavy (title card) and opens up to reveal the product.
	const tint = interpolate(frame, [0, BEAT * 3, BEAT * 5], [0.78, 0.6, 0.15], {extrapolateRight: 'clamp'});
	const sub = spring({frame: frame - BEAT * 1.5, fps, config: {damping: 14}});
	// Logo floats up and shrinks once the footage opens up
	const lift = spring({frame: frame - BEAT * 4, fps, config: {damping: 16, mass: 0.8}});
	const exit = interpolate(frame, [durationInFrames - BEAT - 6, durationInFrames - BEAT + 4], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const flash = interpolate(frame, [0, 6], [0.9, 0], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill>
			<Footage {...props} zoom="in" />
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse at 50% 45%, rgba(179,18,46,${tint * 0.75}) 0%, rgba(70,6,18,${tint}) 70%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					opacity: exit,
					transform: `translateY(${lift * -560}px) scale(${1 - lift * 0.42})`,
				}}
			>
				<div style={{position: 'relative'}}>
					<div
						style={{
							fontFamily: fonts.script,
							fontSize: 110,
							color: colors.goldBright,
							textAlign: 'center',
							marginBottom: -20,
							opacity: sub,
							transform: `translateY(${(1 - sub) * 30}px)`,
							textShadow: '0 0 30px rgba(255,200,120,0.6)',
						}}
					>
						Merry & Cozy
					</div>
					<Logo size={240} delay={4} />
					<div
						style={{
							marginTop: 18,
							textAlign: 'center',
							fontFamily: fonts.sans,
							fontWeight: 700,
							fontSize: 40,
							letterSpacing: 18 * sub,
							color: colors.cream,
							opacity: sub,
						}}
					>
						THE HOLIDAY EDIT
					</div>
					<SparkleField count={9} start={10} seed="intro" area={{x: -60, y: -60, w: 860, h: 520}} maxSize={64} />
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{backgroundColor: colors.cream, opacity: flash}} />
		</AbsoluteFill>
	);
};
