import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, goldFoil} from '../theme';

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** RE:SET wordmark in gold foil: letters rise from a mask with a soft blur, then a shine passes. */
export const Logo: React.FC<{size?: number; delay?: number}> = ({size = 230, delay = 0}) => {
	const frame = useCurrentFrame() - delay;
	const letters = ['R', 'E', ':', 'S', 'E', 'T'];
	const shine = interpolate(frame, [18, 50], [-40, 160], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div style={{display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: `0 0 ${size * 0.1}px`}}>
			{letters.map((ch, i) => {
				const p = ease(Math.min(1, Math.max(0, (frame - i * 2) / 18)));
				const colon = ch === ':';
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							fontFamily: fonts.serif,
							fontWeight: 800,
							fontSize: size,
							lineHeight: 1,
							margin: colon ? `0 ${size * 0.03}px` : 0,
							transform: `translateY(${(1 - p) * 100}%)`,
							filter: `blur(${(1 - p) * 8}px) drop-shadow(0 6px 3px rgba(40,0,8,0.5))`,
							backgroundImage: colon
								? `linear-gradient(${colors.cream}, ${colors.cream})`
								: `${`linear-gradient(100deg, transparent ${shine - 15 - i * 8}%, rgba(255,255,255,0.9) ${shine - i * 8}%, transparent ${shine + 15 - i * 8}%)`}, ${goldFoil(100)}`,
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
						}}
					>
						{ch}
					</span>
				);
			})}
		</div>
	);
};
