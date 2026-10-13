import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

/**
 * Golden lens flare: hot center bloom + anamorphic horizontal streak + warm wash.
 * Peaks at `at`, rises over `pre` frames and decays over `post` frames.
 */
export const GoldFlare: React.FC<{at: number; pre?: number; post?: number; strength?: number; y?: string}> = ({
	at,
	pre = 6,
	post = 22,
	strength = 1,
	y = '45%',
}) => {
	const f = useCurrentFrame();
	const v = interpolate(f, [at - pre, at, at + post], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * strength;
	if (v <= 0.001) return null;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% ${y}, rgba(255,246,220,${v}) 0%, rgba(255,205,120,${v * 0.7}) 22%, rgba(255,140,60,${v * 0.25}) 50%, rgba(0,0,0,0) 75%)`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: '-20%',
					right: '-20%',
					top: `calc(${y} - 10px)`,
					height: 20,
					borderRadius: '50%',
					background: `radial-gradient(ellipse at center, rgba(255,250,235,${v}) 0%, rgba(255,215,140,${v * 0.6}) 35%, rgba(0,0,0,0) 70%)`,
					filter: 'blur(4px)',
					transform: `scaleX(${0.6 + v * 0.6})`,
				}}
			/>
		</AbsoluteFill>
	);
};

/** Warm film light-leak that sweeps across the frame around a cut. */
export const LightLeak: React.FC<{at: number; len?: number}> = ({at, len = 16}) => {
	const f = useCurrentFrame();
	const p = (f - (at - len / 2)) / len;
	if (p < 0 || p > 1) return null;
	const v = Math.sin(p * Math.PI);
	const x = -30 + p * 160;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 60% 80% at ${x}% 40%, rgba(255,150,70,${0.75 * v}) 0%, rgba(255,80,60,${0.35 * v}) 40%, rgba(0,0,0,0) 70%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 40% 50% at ${x + 20}% 70%, rgba(255,220,150,${0.5 * v}) 0%, rgba(0,0,0,0) 70%)`,
				}}
			/>
		</AbsoluteFill>
	);
};
