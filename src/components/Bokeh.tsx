import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';

const PALETTE = ['255,214,140', '255,170,120', '255,90,90', '255,240,200'];

/** Soft drifting out-of-focus fairy lights. */
export const Bokeh: React.FC<{count?: number; opacity?: number; seed?: string}> = ({
	count = 14,
	opacity = 0.5,
	seed = 'bokeh',
}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const dots = useMemo(
		() =>
			new Array(count).fill(0).map((_, i) => {
				const r = (k: string) => random(`${seed}-${i}-${k}`);
				return {
					x: r('x') * width,
					y: r('y') * height,
					size: 60 + r('s') * 160,
					color: PALETTE[Math.floor(r('c') * PALETTE.length)],
					drift: 0.15 + r('d') * 0.35,
					pulse: 0.03 + r('p') * 0.05,
					phase: r('ph') * Math.PI * 2,
				};
			}),
		[count, seed, width, height],
	);

	return (
		<AbsoluteFill style={{mixBlendMode: 'screen', opacity, pointerEvents: 'none'}}>
			{dots.map((d, i) => {
				const twinkle = 0.55 + 0.45 * Math.sin(frame * d.pulse + d.phase);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: d.x - d.size / 2,
							top: d.y - d.size / 2 - frame * d.drift,
							width: d.size,
							height: d.size,
							borderRadius: '50%',
							background: `radial-gradient(circle, rgba(${d.color},0.75) 0%, rgba(${d.color},0.35) 40%, rgba(${d.color},0) 70%)`,
							opacity: twinkle,
							filter: 'blur(6px)',
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
