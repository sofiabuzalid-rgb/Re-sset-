import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, goldFoil} from '../theme';

const ease = Easing.bezier(0.16, 1, 0.3, 1); // expo-out

/**
 * Editorial title block:
 *   ── KICKER ──        wide-tracked small caps that "breathe" in
 *   Gold italic         lines rise out of invisible masks, gold foil with a moving shine
 */
export const LuxText: React.FC<{
	kicker?: string;
	title: string;
	size?: number;
	delay?: number;
	/** frames before the end of the parent sequence to start the exit (0 = no exit) */
	exitAt?: number;
}> = ({kicker, title, size = 128, delay = 0, exitAt = 0}) => {
	const frame = useCurrentFrame() - delay;
	const {durationInFrames} = useVideoConfig();
	const exitStart = exitAt ? durationInFrames - delay - exitAt : Infinity;
	const exit = ease(Math.min(1, Math.max(0, (frame - exitStart) / 8)));

	const k = ease(Math.min(1, Math.max(0, frame / 16)));
	const lines = title ? title.split('\n') : [];
	const shine = interpolate(frame, [6, 46], [-60, 160], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<div style={{textAlign: 'center', opacity: 1 - exit, transform: `translateY(${-exit * 40}px)`}}>
			{kicker ? (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 24,
						marginBottom: 18,
						opacity: k,
					}}
				>
					<div style={{height: 2, width: 70 * k, background: colors.gold}} />
					<div
						style={{
							fontFamily: fonts.sans,
							fontWeight: 600,
							fontSize: 38,
							textTransform: 'uppercase',
							letterSpacing: `${0.55 - 0.23 * k}em`,
							marginRight: `-${0.55 - 0.23 * k}em`,
							color: colors.cream,
							textShadow: '0 2px 12px rgba(0,0,0,0.6)',
						}}
					>
						{kicker}
					</div>
					<div style={{height: 2, width: 70 * k, background: colors.gold}} />
				</div>
			) : null}
			{lines.map((line, i) => {
				const p = ease(Math.min(1, Math.max(0, (frame - 3 - i * 4) / 18)));
				return (
					<div key={i} style={{overflow: 'hidden', paddingBottom: size * 0.12, marginBottom: -size * 0.12}}>
						<div
							style={{
								transform: `translateY(${(1 - p) * 105}%) skewY(${(1 - p) * 4}deg)`,
								fontFamily: fonts.serif,
								fontStyle: 'italic',
								fontWeight: 600,
								fontSize: size,
								lineHeight: 1.04,
								letterSpacing: '-0.01em',
								backgroundImage: goldFoil(100, 0),
								backgroundSize: '100% 100%',
								WebkitBackgroundClip: 'text',
								backgroundClip: 'text',
								color: 'transparent',
								filter: 'drop-shadow(0 4px 2px rgba(40,0,8,0.55)) drop-shadow(0 10px 30px rgba(0,0,0,0.45))',
								position: 'relative',
							}}
						>
							{line}
							{/* moving shine */}
							<span
								aria-hidden
								style={{
									position: 'absolute',
									inset: 0,
									backgroundImage: `linear-gradient(100deg, transparent ${shine - 18}%, rgba(255,255,255,0.95) ${shine}%, transparent ${shine + 18}%)`,
									WebkitBackgroundClip: 'text',
									backgroundClip: 'text',
									color: 'transparent',
								}}
							>
								{line}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
};
