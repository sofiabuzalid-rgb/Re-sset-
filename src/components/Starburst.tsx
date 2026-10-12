import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

/** Rotating comic-book sunburst behind big reveal text. */
export const Starburst: React.FC<{size?: number; delay?: number; colorA?: string; colorB?: string}> = ({
	size = 1500,
	delay = 0,
	colorA = '#FFD84D',
	colorB = '#E3243B',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 160}});
	const rays = 18;
	return (
		<svg
			width={size}
			height={size}
			viewBox="-100 -100 200 200"
			style={{
				position: 'absolute',
				left: '50%',
				top: '50%',
				transform: `translate(-50%, -50%) scale(${s}) rotate(${frame * 1.2}deg)`,
				opacity: 0.9,
			}}
		>
			<defs>
				<radialGradient id="burst-fade">
					<stop offset="0%" stopColor="#fff" stopOpacity="1" />
					<stop offset="65%" stopColor="#fff" stopOpacity="0.8" />
					<stop offset="100%" stopColor="#fff" stopOpacity="0" />
				</radialGradient>
				<mask id="burst-mask">
					<circle r="100" fill="url(#burst-fade)" />
				</mask>
			</defs>
			<g mask="url(#burst-mask)">
				<circle r="100" fill={colorB} />
				{new Array(rays).fill(0).map((_, i) => {
					const a0 = (i / rays) * Math.PI * 2;
					const a1 = a0 + Math.PI / rays;
					return (
						<path
							key={i}
							d={`M0 0 L${Math.cos(a0) * 140} ${Math.sin(a0) * 140} L${Math.cos(a1) * 140} ${Math.sin(a1) * 140} Z`}
							fill={colorA}
						/>
					);
				})}
			</g>
		</svg>
	);
};
