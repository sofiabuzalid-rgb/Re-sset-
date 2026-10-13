import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {colors} from '../theme';

/** A four-point twinkle star. */
export const Star: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({
	size,
	color = colors.goldLight,
	style,
}) => (
	<svg width={size} height={size} viewBox="-50 -50 100 100" style={{overflow: 'visible', ...style}}>
		<defs>
			<radialGradient id="star-glow">
				<stop offset="0%" stopColor="#fff" stopOpacity="1" />
				<stop offset="100%" stopColor={color} stopOpacity="0" />
			</radialGradient>
		</defs>
		<circle r="22" fill="url(#star-glow)" opacity={0.8} />
		<path d="M0,-50 C4,-8 8,-4 50,0 C8,4 4,8 0,50 C-4,8 -8,4 -50,0 C-8,-4 -4,-8 0,-50 Z" fill={color} />
		<circle r="6" fill="#fff" />
	</svg>
);

/**
 * A cluster of stars that twinkle around a region (e.g. the logo or a caption).
 * `start` is the frame they begin to appear.
 */
export const SparkleField: React.FC<{
	count?: number;
	area: {x: number; y: number; w: number; h: number};
	start?: number;
	seed?: string;
	maxSize?: number;
}> = ({count = 10, area, start = 0, seed = 'spark', maxSize = 54}) => {
	const frame = useCurrentFrame();
	return (
		<>
			{new Array(count).fill(0).map((_, i) => {
				const r = (k: string) => random(`${seed}-${i}-${k}`);
				const delay = start + r('d') * 20;
				const period = 24 + r('p') * 30;
				const local = frame - delay;
				if (local < 0) return null;
				const cycle = (local % period) / period;
				const s = Math.sin(cycle * Math.PI);
				const size = (0.35 + r('s') * 0.65) * maxSize;
				const appear = interpolate(local, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
				return (
					<Star
						key={i}
						size={size}
						style={{
							position: 'absolute',
							left: area.x + r('x') * area.w - size / 2,
							top: area.y + r('y') * area.h - size / 2,
							transform: `scale(${0.2 + s * 0.8}) rotate(${local * 2}deg)`,
							opacity: s * appear,
						}}
					/>
				);
			})}
		</>
	);
};
