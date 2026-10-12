import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';
import {BAR, BEAT} from '../timeline';
import {Bokeh} from './Bokeh';
import {Confetti} from './Confetti';
import {Garland} from './Garland';
import {Logo} from './Logo';
import {SparkleField} from './Sparkle';
import {StickerText} from './StickerText';

/** Closing card (drawn over blurred footage): logo, bouncing CTA, confetti on the final hit. */
export const EndCard: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cta = spring({frame: frame - BAR, fps, config: {damping: 8, stiffness: 140}});
	const bounce = 1 + 0.06 * Math.exp(-((frame % BEAT) / 4)); // pumps on every beat
	const shimmer = interpolate(frame % 36, [0, 36], [-120, 220]);
	const bg = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					opacity: bg,
					background: 'linear-gradient(170deg, rgba(150,10,35,0.9) 0%, rgba(110,10,28,0.78) 50%, rgba(8,50,32,0.92) 100%)',
				}}
			/>
			<Bokeh count={18} opacity={0.7} seed="end" />
			<Garland y={150} sag={70} delay={2} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 140}}>
				<div style={{position: 'relative', textAlign: 'center'}}>
					<StickerText top="¡feliz navidad con" main="" size={120} delay={2} />
					<div style={{marginTop: -10}}>
						<Logo size={250} delay={8} />
					</div>
					<div
						style={{
							marginTop: 10,
							fontFamily: fonts.sans,
							fontWeight: 700,
							fontSize: 40,
							letterSpacing: 10,
							color: colors.cream,
							opacity: interpolate(frame, [20, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
						}}
					>
						PIJAMAS Y ROPA DE CASA
					</div>
					<div
						style={{
							position: 'relative',
							overflow: 'hidden',
							display: 'inline-block',
							marginTop: 80,
							padding: '30px 70px 22px',
							borderRadius: 999,
							background: `linear-gradient(180deg, ${colors.sunny}, ${colors.gold})`,
							border: `6px solid ${colors.outline}`,
							boxShadow: `0 12px 0 ${colors.outline}, 0 20px 50px rgba(0,0,0,0.4)`,
							fontFamily: fonts.fun,
							fontSize: 78,
							color: colors.cranberry,
							opacity: frame < BAR ? 0 : 1,
							transform: `scale(${cta * bounce}) rotate(-3deg)`,
						}}
					>
						¡PIDE LA TUYA! 🎁
						<div
							style={{
								position: 'absolute',
								top: 0,
								bottom: 0,
								left: `${shimmer}%`,
								width: '30%',
								background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
								transform: 'skewX(-20deg)',
							}}
						/>
					</div>
					<div style={{marginTop: 40}}>
						<StickerText main="link en la bio 👆" size={56} color={colors.cream} delay={BAR + 10} stagger={2} />
					</div>
					<SparkleField count={12} start={6} seed="end" area={{x: -80, y: -60, w: 1000, h: 900}} maxSize={60} />
				</div>
			</AbsoluteFill>
			<Confetti start={2 * BAR} x={540} y={1250} count={160} seed="final" power={1.1} />
		</AbsoluteFill>
	);
};
