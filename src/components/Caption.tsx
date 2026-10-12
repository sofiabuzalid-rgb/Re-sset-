import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';
import type {Caption as CaptionT} from '../timeline';
import {BEAT} from '../timeline';
import {SparkleField} from './Sparkle';

/**
 * Two-tier festive caption: a gold script line, then the headline with
 * word-by-word spring pops that land on the beat.
 */
export const Caption: React.FC<{caption: CaptionT; delay?: number}> = ({caption, delay = BEAT}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	const scriptIn = spring({frame: frame - delay, fps, config: {damping: 14, mass: 0.6}});
	const exit = interpolate(frame, [durationInFrames - BEAT - 8, durationInFrames - BEAT + 2], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const lines = caption.main.split('\n');
	let wordIndex = 0;

	return (
		<div
			style={{
				position: 'absolute',
				top: 250,
				left: 70,
				right: 70,
				textAlign: 'center',
				opacity: exit,
				transform: `translateY(${(1 - exit) * -30}px)`,
			}}
		>
			<div
				style={{
					fontFamily: fonts.script,
					fontSize: 96,
					color: colors.goldBright,
					lineHeight: 1,
					marginBottom: 6,
					opacity: scriptIn,
					transform: `translateY(${(1 - scriptIn) * 30}px) rotate(-4deg)`,
					textShadow: '0 0 24px rgba(255,200,120,0.55), 0 4px 14px rgba(0,0,0,0.5)',
				}}
			>
				{caption.script}
			</div>
			{lines.map((line, li) => (
				<div key={li} style={{lineHeight: 1.04}}>
					{line.split(' ').map((word, wi) => {
						const i = wordIndex++;
						// Words pop on eighth notes after the script line
						const s = spring({
							frame: frame - delay - 8 - i * (BEAT / 2),
							fps,
							config: {damping: 11, stiffness: 160, mass: 0.6},
						});
						return (
							<span
								key={wi}
								style={{
									display: 'inline-block',
									margin: '0 12px',
									fontFamily: fonts.serif,
									fontWeight: 900,
									fontSize: 104,
									letterSpacing: -1,
									color: colors.cream,
									opacity: Math.min(1, s * 1.4),
									transform: `translateY(${(1 - s) * 60}px) scale(${0.7 + s * 0.3})`,
									textShadow: '0 6px 24px rgba(40,0,10,0.65), 0 2px 4px rgba(0,0,0,0.45)',
								}}
							>
								{word}
							</span>
						);
					})}
				</div>
			))}
			<SparkleField
				count={6}
				start={delay + 10}
				seed={caption.script}
				maxSize={50}
				area={{x: -20, y: -40, w: 960, h: 380}}
			/>
		</div>
	);
};
