import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const BULB_COLORS = ['#FF4D5E', '#FFD27A', '#5BD38C', '#7FB8FF', '#FFB36B'];

/** A drooping string of fairy lights that twinkle in a chase pattern. */
export const Garland: React.FC<{y?: number; sag?: number; bulbs?: number; delay?: number}> = ({
	y = 0,
	sag = 110,
	bulbs = 13,
	delay = 0,
}) => {
	const frame = useCurrentFrame();
	const {width} = useVideoConfig();
	const draw = interpolate(frame - delay, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const path = `M -20 ${y} Q ${width / 2} ${y + sag * 2} ${width + 20} ${y}`;
	const pointAt = (t: number) => {
		const x0 = -20, x1 = width / 2, x2 = width + 20;
		const y0 = y, y1 = y + sag * 2, y2 = y;
		const u = 1 - t;
		return {x: u * u * x0 + 2 * u * t * x1 + t * t * x2, y: u * u * y0 + 2 * u * t * y1 + t * t * y2};
	};

	return (
		<svg width={width} height={y + sag * 2 + 80} style={{position: 'absolute', top: 0, left: 0, overflow: 'visible'}}>
			<path d={path} stroke="#1f2a1c" strokeWidth={5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
			{new Array(bulbs).fill(0).map((_, i) => {
				const t = (i + 0.5) / bulbs;
				if (t > draw) return null;
				const p = pointAt(t);
				const color = BULB_COLORS[i % BULB_COLORS.length];
				const chase = 0.45 + 0.55 * Math.max(0, Math.sin((frame - i * 4) * 0.22));
				return (
					<g key={i} transform={`translate(${p.x} ${p.y + 6}) rotate(${(t - 0.5) * 30})`}>
						<circle r={36} fill={color} opacity={0.35 * chase} style={{filter: 'blur(10px)'}} />
						<rect x={-7} y={-6} width={14} height={12} rx={2} fill="#2c3a2a" />
						<ellipse cx={0} cy={20} rx={11} ry={17} fill={color} opacity={0.55 + 0.45 * chase} />
						<ellipse cx={-3} cy={14} rx={3} ry={6} fill="#fff" opacity={0.7 * chase} />
					</g>
				);
			})}
		</svg>
	);
};
