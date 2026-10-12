import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';

type Flake = {
	x: number;
	size: number;
	speed: number;
	sway: number;
	swaySpeed: number;
	phase: number;
	opacity: number;
	blur: number;
	offset: number;
};

// Three depth layers: tiny/slow/blurred far flakes, crisp mid flakes, big soft foreground flakes.
const LAYERS = [
	{count: 70, size: [3, 6], speed: [1.2, 2.2], blur: [1, 2], opacity: [0.35, 0.6]},
	{count: 45, size: [6, 11], speed: [2.4, 3.8], blur: [0, 1], opacity: [0.6, 0.9]},
	{count: 12, size: [16, 26], speed: [4.5, 6.5], blur: [3, 6], opacity: [0.35, 0.6]},
] as const;

const lerp = (r: readonly [number, number], t: number) => r[0] + (r[1] - r[0]) * t;

export const Snowfall: React.FC<{seed?: string; intensity?: number}> = ({seed = 'snow', intensity = 1}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	const flakes = useMemo(() => {
		const out: Flake[] = [];
		LAYERS.forEach((layer, li) => {
			const count = Math.round(layer.count * intensity);
			for (let i = 0; i < count; i++) {
				const r = (k: string) => random(`${seed}-${li}-${i}-${k}`);
				out.push({
					x: r('x') * width,
					size: lerp(layer.size, r('s')),
					speed: lerp(layer.speed, r('v')),
					sway: 10 + r('w') * 40,
					swaySpeed: 0.02 + r('ws') * 0.04,
					phase: r('p') * Math.PI * 2,
					opacity: lerp(layer.opacity, r('o')),
					blur: lerp(layer.blur, r('b')),
					offset: r('y') * (height + 100),
				});
			}
		});
		return out;
	}, [seed, intensity, width, height]);

	return (
		<AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
			{flakes.map((f, i) => {
				const y = ((f.offset + frame * f.speed) % (height + 100)) - 50;
				const x = f.x + Math.sin(frame * f.swaySpeed + f.phase) * f.sway;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: f.size,
							height: f.size,
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0) 72%)',
							opacity: f.opacity,
							filter: f.blur > 0.5 ? `blur(${f.blur}px)` : undefined,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
