import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';

const W = 1080;
const H = 1920;

const flakeBg = (core: number) =>
	`radial-gradient(circle, rgba(255,255,255,${core}) 0%, rgba(255,255,255,${core * 0.75}) 35%, rgba(255,255,255,0) 70%)`;

/**
 * Photoreal indoor snowfall in 4 depth layers:
 * far (tiny, slow, soft), mid (crisp), near (large, motion-streaked), and a few huge
 * out-of-focus flakes drifting right past the lens.
 */
export const RealSnow: React.FC<{seed?: string; density?: number}> = ({seed = 'snow', density = 1}) => {
	const frame = useCurrentFrame();
	const layers = useMemo(() => {
		const L = [
			{n: 110, size: [2, 4], v: [1.2, 2.0], blur: 0.6, o: [0.45, 0.75], sway: 14},
			{n: 80, size: [5, 9], v: [2.4, 3.6], blur: 0, o: [0.8, 1], sway: 22},
			{n: 34, size: [10, 17], v: [4.5, 6.5], blur: 1.2, o: [0.75, 1], sway: 32},
			{n: 7, size: [36, 70], v: [7, 10], blur: 9, o: [0.25, 0.45], sway: 50},
		];
		return L.map((l, li) =>
			new Array(Math.round(l.n * density)).fill(0).map((_, i) => {
				const r = (k: string) => random(`${seed}-${li}-${i}-${k}`);
				return {
					li,
					x: r('x') * W,
					y0: r('y') * (H + 200),
					size: l.size[0] + r('s') * (l.size[1] - l.size[0]),
					v: l.v[0] + r('v') * (l.v[1] - l.v[0]),
					o: l.o[0] + r('o') * (l.o[1] - l.o[0]),
					blur: l.blur,
					sway: l.sway * (0.5 + r('w')),
					ws: 0.015 + r('ws') * 0.03,
					ph: r('p') * 6.28,
					tumble: r('t') * 6.28,
				};
			}),
		).flat();
	}, [seed, density]);

	return (
		<AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
			{layers.map((f, i) => {
				const y = ((f.y0 + frame * f.v) % (H + 200)) - 100;
				// gentle breeze from the left + individual sway
				const x = f.x + Math.sin(frame * f.ws + f.ph) * f.sway + frame * 0.35 * (f.li + 1) * 0.4;
				const xx = ((x % (W + 100)) + W + 100) % (W + 100) - 50;
				const stretch = f.li >= 2 ? 1 + f.v * 0.05 : 1; // subtle motion streak on near flakes
				const twinkle = 0.85 + 0.15 * Math.sin(frame * 0.2 + f.tumble);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: xx,
							top: y,
							width: f.size,
							height: f.size * stretch,
							borderRadius: '50%',
							background: flakeBg(1),
							opacity: f.o * twinkle,
							filter: f.blur ? `blur(${f.blur}px)` : undefined,
							// a whisper of shadow keeps white flakes readable over bright fabric
							boxShadow: f.li === 1 || f.li === 2 ? '0 0 3px rgba(90,70,60,0.35)' : undefined,
							transform: `rotate(${Math.sin(frame * f.ws + f.ph) * 12}deg)`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/**
 * A soft swirl of snow + golden glints that orbits and trails the gift bag.
 * The emitter moves from (x,y) to (toX,toY) over the clip.
 */
export const BagTrail: React.FC<{x: number; y: number; toX?: number; toY?: number; seed: string}> = ({
	x,
	y,
	toX = x,
	toY = y,
	seed,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const p = Math.min(1, frame / Math.max(1, durationInFrames - 1));
	const fadeIn = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
	const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
	const N = 90;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{new Array(N).fill(0).map((_, i) => {
				const r = (k: string) => random(`${seed}-${i}-${k}`);
				// each particle was emitted at some point in the past and lags behind the emitter
				const lag = r('lag') * 0.35;
				const pp = Math.max(0, p - lag);
				const cx = x + (toX - x) * pp;
				const cy = y + (toY - y) * pp;
				const radius = 180 + r('r') * 260;
				const speed = (0.025 + r('v') * 0.03) * (r('dir') > 0.5 ? 1 : -1);
				const a = r('a') * 6.28 + frame * speed;
				const rise = (frame * (0.6 + r('rise') * 1.4) + r('o') * 200) % 260;
				const px = cx + Math.cos(a) * radius;
				const py = cy + Math.sin(a) * radius * 0.45 - rise;
				const gold = r('g') > 0.72;
				const size = gold ? 4 + r('s') * 6 : 4 + r('s') * 9;
				const life = Math.sin((rise / 260) * Math.PI);
				const tw = gold ? 0.5 + 0.5 * Math.sin(frame * 0.5 + i) : 1;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: px - size / 2,
							top: py - size / 2,
							width: size,
							height: size,
							borderRadius: '50%',
							background: gold
								? 'radial-gradient(circle, rgba(255,250,225,1) 0%, rgba(255,214,130,0.85) 40%, rgba(255,200,100,0) 72%)'
								: flakeBg(0.95),
							boxShadow: gold ? '0 0 12px 4px rgba(255,205,120,0.65)' : '0 0 3px rgba(90,70,60,0.3)',
							opacity: life * tw * fadeIn * fadeOut,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/**
 * Snow vortex transition: a spiral of snow sweeps across the frame, whiting it out
 * softly at its peak so the next set appears from inside the swirl.
 * `at` = frame of the peak; spans ±span frames.
 */
export const SnowVortex: React.FC<{at: number; span?: number; seed: string}> = ({at, span = 14, seed}) => {
	const f = useCurrentFrame();
	const t = (f - at) / span; // -1 .. 1
	if (t < -1 || t > 1) return null;
	const peak = 1 - Math.abs(t);
	const sweepX = interpolate(t, [-1, 1], [-300, W + 300]); // vortex centre travels left -> right
	const cy = H * 0.52;
	const N = 260;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{/* frosty haze at the core of the vortex */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 75% 55% at ${(sweepX / W) * 100}% 52%, rgba(255,255,255,${0.92 * peak ** 1.4}) 0%, rgba(240,246,255,${0.6 * peak}) 35%, rgba(255,255,255,0) 75%)`,
				}}
			/>
			{new Array(N).fill(0).map((_, i) => {
				const r = (k: string) => random(`${seed}-${i}-${k}`);
				const arm = r('arm') > 0.5 ? 0 : Math.PI;
				const d = r('d'); // 0 = core, 1 = outer
				const radius = 60 + d * 900 * (0.6 + 0.4 * peak);
				const a = arm + d * 5.2 + t * (6 + r('v') * 3) + r('j') * 0.6;
				const px = sweepX + Math.cos(a) * radius;
				const py = cy + Math.sin(a) * radius * 0.85;
				const gold = r('g') > 0.85;
				const size = gold ? 4 + r('s') * 6 : 5 + r('s') * 16 * (1 - d * 0.5);
				const streak = 1 + (1 - d) * 2.2;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: px,
							top: py,
							width: size * streak,
							height: size,
							borderRadius: '50%',
							transform: `rotate(${(a * 180) / Math.PI + 90}deg)`,
							background: gold
								? 'radial-gradient(circle, rgba(255,250,225,1) 0%, rgba(255,210,120,0.8) 45%, rgba(255,200,100,0) 75%)'
								: flakeBg(1),
							opacity: Math.min(1, peak * 1.6) * (0.5 + 0.5 * r('o')),
							filter: d < 0.25 ? 'blur(2px)' : undefined,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/** Golden glints that bloom softly over a reveal, then settle. */
export const RevealShimmer: React.FC<{seed: string}> = ({seed}) => {
	const f = useCurrentFrame();
	const N = 26;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<AbsoluteFill
				style={{
					mixBlendMode: 'screen',
					background: `radial-gradient(ellipse 70% 45% at 50% 48%, rgba(255,225,160,${interpolate(f, [0, 6, 30], [0, 0.28, 0], {extrapolateRight: 'clamp'})}) 0%, rgba(255,200,120,0) 70%)`,
				}}
			/>
			{new Array(N).fill(0).map((_, i) => {
				const r = (k: string) => random(`${seed}-${i}-${k}`);
				const start = r('d') * 18;
				const life = 22 + r('l') * 14;
				const lt = (f - start) / life;
				if (lt < 0 || lt > 1) return null;
				const s = Math.sin(lt * Math.PI);
				const size = 22 + r('s') * 34;
				return (
					<svg
						key={i}
						width={size}
						height={size}
						viewBox="-50 -50 100 100"
						style={{
							position: 'absolute',
							left: 120 + r('x') * 840 - size / 2,
							top: 450 + r('y') * 1000 - size / 2 - lt * 40,
							opacity: s * 0.9,
							transform: `scale(${0.3 + s * 0.7}) rotate(${lt * 90}deg)`,
							overflow: 'visible',
						}}
					>
						<circle r="18" fill="rgba(255,226,160,0.35)" />
						<path d="M0,-50 C3,-6 6,-3 50,0 C6,3 3,6 0,50 C-3,6 -6,3 -50,0 C-6,-3 -3,-6 0,-50 Z" fill="#FFF1C9" />
						<circle r="5" fill="#fff" />
					</svg>
				);
			})}
		</AbsoluteFill>
	);
};

/** Warm, cinematic holiday light: soft window glow, subtle halation and vignette. */
export const WarmLight: React.FC = () => (
	<>
		<AbsoluteFill
			style={{
				pointerEvents: 'none',
				mixBlendMode: 'soft-light',
				background:
					'radial-gradient(ellipse 90% 60% at 20% 8%, rgba(255,200,130,0.55) 0%, rgba(255,170,100,0.15) 45%, rgba(0,0,0,0) 75%), radial-gradient(ellipse 80% 50% at 85% 95%, rgba(255,150,90,0.25) 0%, rgba(0,0,0,0) 70%)',
			}}
		/>
		<AbsoluteFill
			style={{
				pointerEvents: 'none',
				background: 'radial-gradient(ellipse 85% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(25,8,4,0.55) 100%)',
			}}
		/>
	</>
);
