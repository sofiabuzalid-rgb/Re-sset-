import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';
import {BEAT} from '../timeline';
import {Bokeh} from './Bokeh';
import {Footage} from './Footage';
import {Garland} from './Garland';
import {Logo} from './Logo';
import {SparkleField} from './Sparkle';

/** Closing card: blurred product backdrop, fairy lights, logo and call to action. */
export const EndCard: React.FC<{src: string; from: number; playbackRate: number}> = (props) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t0 = BEAT; // content enters after the transition beat

	const script = spring({frame: frame - t0, fps, config: {damping: 14}});
	const line = spring({frame: frame - t0 - BEAT * 2, fps, config: {damping: 14}});
	const cta = spring({frame: frame - t0 - BEAT * 3, fps, config: {damping: 9, stiffness: 120}});
	const pulse = 1 + 0.035 * Math.max(0, Math.sin(((frame - t0) / BEAT) * Math.PI)); // breathes on the beat
	const shimmer = interpolate((frame - t0 - BEAT * 3) % 45, [0, 45], [-120, 220]);

	return (
		<AbsoluteFill>
			<Footage {...props} zoom="out" blur={16} extraFilter="brightness(0.8)" />
			<AbsoluteFill
				style={{
					background: `linear-gradient(170deg, rgba(110,10,28,0.88) 0%, rgba(110,10,28,0.7) 45%, rgba(8,36,27,0.9) 100%)`,
				}}
			/>
			<Bokeh count={16} opacity={0.65} seed="end" />
			<Garland y={170} sag={70} delay={t0 - 4} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 80}}>
				<div style={{position: 'relative', textAlign: 'center'}}>
					<div
						style={{
							fontFamily: fonts.script,
							fontSize: 120,
							color: colors.goldBright,
							opacity: script,
							transform: `translateY(${(1 - script) * 40}px)`,
							textShadow: '0 0 30px rgba(255,200,120,0.6)',
							marginBottom: -10,
						}}
					>
						Feliz Navidad de
					</div>
					<Logo size={250} delay={t0 + 6} />
					<div
						style={{
							marginTop: 20,
							fontFamily: fonts.sans,
							fontWeight: 500,
							fontSize: 42,
							letterSpacing: 10,
							color: colors.cream,
							opacity: line,
							transform: `translateY(${(1 - line) * 20}px)`,
						}}
					>
						PIJAMAS Y ROPA DE CASA
					</div>
					<div
						style={{
							position: 'relative',
							overflow: 'hidden',
							display: 'inline-block',
							marginTop: 90,
							padding: '34px 70px',
							borderRadius: 999,
							background: `linear-gradient(180deg, ${colors.goldBright}, ${colors.gold})`,
							boxShadow: '0 12px 40px rgba(0,0,0,0.35), 0 0 40px rgba(255,210,130,0.45)',
							fontFamily: fonts.sans,
							fontWeight: 700,
							fontSize: 46,
							letterSpacing: 4,
							color: colors.cranberryDeep,
							opacity: Math.min(1, cta * 1.3),
							transform: `scale(${(0.6 + cta * 0.4) * pulse})`,
						}}
					>
						COMPRA LA COLECCIÓN
						<div
							style={{
								position: 'absolute',
								top: 0,
								bottom: 0,
								left: `${shimmer}%`,
								width: '35%',
								background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
								transform: 'skewX(-20deg)',
							}}
						/>
					</div>
					<div
						style={{
							marginTop: 34,
							fontFamily: fonts.sans,
							fontWeight: 500,
							fontSize: 38,
							letterSpacing: 6,
							color: colors.cream,
							opacity: cta * 0.9,
						}}
					>
						link en la bio
					</div>
					<SparkleField count={12} start={t0 + 8} seed="end" area={{x: -80, y: -80, w: 1000, h: 900}} maxSize={60} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
