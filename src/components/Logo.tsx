import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';

const LETTERS = ['R', 'E', ':', 'S', 'E', 'T'];

/** RE:SET wordmark — letters drop in like ornaments, the colon glows gold. */
export const Logo: React.FC<{size?: number; delay?: number; stagger?: number}> = ({
	size = 230,
	delay = 0,
	stagger = 3,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline'}}>
			{LETTERS.map((ch, i) => {
				const s = spring({
					frame: frame - delay - i * stagger,
					fps,
					config: {damping: 9, stiffness: 140, mass: 0.7},
				});
				const isColon = ch === ':';
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							fontFamily: fonts.serif,
							fontWeight: 900,
							fontSize: size,
							lineHeight: 1,
							letterSpacing: size * 0.02,
							color: isColon ? colors.gold : colors.cream,
							opacity: Math.min(1, s * 1.5),
							transform: `translateY(${(1 - s) * -size * 0.8}px) rotate(${(1 - s) * (i % 2 ? 12 : -12)}deg)`,
							textShadow: isColon
								? `0 0 ${size * 0.15}px rgba(255,210,130,0.9)`
								: '0 8px 30px rgba(40,0,10,0.6), 0 2px 6px rgba(0,0,0,0.4)',
							margin: isColon ? `0 ${size * 0.04}px` : 0,
						}}
					>
						{ch}
					</span>
				);
			})}
		</div>
	);
};
