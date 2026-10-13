import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';

const COLORS = ['#E3243B', '#FFD84D', '#1E8F5A', '#FFFFFF', '#FF8FA3', '#7FD3FF'];
const EMOJI = ['🎁', '⭐', '❄️', '🎄', '✨'];

/** Physics-y confetti + emoji burst fired from a point at `start`. */
export const Confetti: React.FC<{
	start: number;
	x?: number;
	y?: number;
	count?: number;
	seed?: string;
	power?: number;
	palette?: string[];
	emoji?: boolean;
}> = ({
	start,
	x = 540,
	y = 1000,
	count = 140,
	seed = 'confetti',
	power = 1,
	palette = COLORS,
	emoji = true,
}) => {
	const frame = useCurrentFrame();
	const {height} = useVideoConfig();
	const pieces = useMemo(
		() =>
			new Array(count).fill(0).map((_, i) => {
				const r = (k: string) => random(`${seed}-${i}-${k}`);
				const angle = -Math.PI / 2 + (r('a') - 0.5) * Math.PI * 1.5;
				const speed = (28 + r('v') * 42) * power;
				return {
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					rot: r('r') * 360,
					vr: (r('vr') - 0.5) * 30,
					w: 14 + r('w') * 18,
					h: 8 + r('h') * 26,
					color: palette[Math.floor(r('c') * palette.length)],
					round: r('s') > 0.7,
					emoji: emoji && r('e') > 0.88 ? EMOJI[Math.floor(r('em') * EMOJI.length)] : null,
					flutter: 2 + r('f') * 4,
					phase: r('p') * 6.28,
				};
			}),
		[count, seed, power, palette, emoji],
	);

	const t = frame - start;
	if (t < 0 || t > 90) return null;

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{pieces.map((p, i) => {
				// air drag + gravity, integrated analytically
				const drag = 0.9;
				const k = (1 - Math.pow(drag, t)) / (1 - drag);
				const px = x + p.vx * k + Math.sin(t * 0.25 + p.phase) * p.flutter * 4;
				const py = y + p.vy * k + 0.9 * t * t * 0.5 * 0.35 * (1 + (i % 3) * 0.2);
				if (py > height + 100) return null;
				const flip = Math.cos(t * 0.3 + p.phase);
				const fade = t > 70 ? 1 - (t - 70) / 20 : 1;
				if (p.emoji) {
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: px,
								top: py,
								fontSize: 64,
								transform: `rotate(${p.rot + p.vr * t * 0.5}deg)`,
								opacity: fade,
							}}
						>
							{p.emoji}
						</div>
					);
				}
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: px,
							top: py,
							width: p.w,
							height: p.round ? p.w : p.h,
							borderRadius: p.round ? '50%' : 3,
							background: p.color,
							transform: `rotate(${p.rot + p.vr * t}deg) scaleY(${flip})`,
							opacity: fade,
							boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
