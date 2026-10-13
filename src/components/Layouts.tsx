import React from 'react';
import {AbsoluteFill, Easing, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, goldFoil} from '../theme';
import type {Footage as FootageT} from '../timeline';
import {Bokeh} from './Bokeh';
import {Footage} from './Footage';

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Deep red velvet backdrop with a soft spotlight and drifting bokeh. */
export const Velvet: React.FC = () => (
	<AbsoluteFill>
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse 80% 55% at 50% 42%, #A3122B 0%, ${colors.cranberryDeep} 55%, ${colors.wine} 100%)`,
			}}
		/>
		<AbsoluteFill
			style={{
				opacity: 0.18,
				backgroundImage:
					'repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 9px)',
			}}
		/>
		<Bokeh count={14} opacity={0.55} seed="velvet" />
	</AbsoluteFill>
);

/** Three prints side by side; strips slide in from alternating directions, split by gold rules. */
export const Triptych: React.FC<{footage: FootageT[]}> = ({footage}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const w = width / footage.length;
	return (
		<AbsoluteFill style={{backgroundColor: colors.wine}}>
			{footage.map((fo, i) => {
				const p = ease(Math.min(1, Math.max(0, (frame - i * 3) / 14)));
				const dir = i % 2 ? 1 : -1;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: i * w,
							top: 0,
							width: w,
							height,
							overflow: 'hidden',
							transform: `translateY(${(1 - p) * dir * 100}%)`,
						}}
					>
						<div style={{position: 'absolute', left: -(width - w) / 2, top: 0, width, height}}>
							<Footage src={fo.src} segments={fo.segments} zoom="in" />
						</div>
					</div>
				);
			})}
			{[1, 2].map((k) => {
				const p = ease(Math.min(1, Math.max(0, (frame - 8) / 14)));
				return (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: k * w - 4,
							top: 0,
							width: 8,
							height: height * p,
							background: goldFoil(180),
							boxShadow: '0 0 20px rgba(0,0,0,0.6)',
						}}
					/>
				);
			})}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(30,0,8,0.55), rgba(30,0,8,0) 65%)'}} />
		</AbsoluteFill>
	);
};

/** Footage presented as a framed print on velvet, swinging gently into place. */
export const Framed: React.FC<{footage: FootageT}> = ({footage}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: {damping: 14, stiffness: 90, mass: 0.9}});
	const W = 800;
	const H = 1080;
	return (
		<AbsoluteFill>
			<Velvet />
			<div
				style={{
					position: 'absolute',
					left: (1080 - W) / 2,
					top: 640,
					width: W,
					height: H,
					transform: `translateY(${(1 - s) * 900}px) rotate(${-3 + (1 - s) * 10}deg)`,
					padding: 22,
					background: goldFoil(135),
					borderRadius: 10,
					boxShadow: '0 40px 80px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.15) inset',
				}}
			>
				<div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 4, background: '#000'}}>
					<Sequence layout="none">
						<Footage src={footage.src} segments={footage.segments} zoom="in" />
					</Sequence>
					<AbsoluteFill style={{boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)'}} />
				</div>
			</div>
		</AbsoluteFill>
	);
};
