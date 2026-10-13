import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, goldFoil} from '../theme';
import {BAR, FINAL_HIT, END_START} from '../timeline';
import {Bokeh} from './Bokeh';
import {Confetti} from './Confetti';
import {Garland} from './Garland';
import {Logo} from './Logo';
import {LuxText} from './LuxText';
import {SparkleField} from './Sparkle';

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const GOLDS = ['#F8E7B0', '#D9B25F', '#FFF4D0', '#B88A35', '#FFFFFF'];

/** Closing card over blurred footage: gold wordmark, tagline, call to action, gold burst on the final hit. */
export const EndCard: React.FC = () => {
	const frame = useCurrentFrame();
	const bg = ease(Math.min(1, frame / 12));
	const sub = ease(Math.min(1, Math.max(0, (frame - 30) / 16)));
	const ctaP = ease(Math.min(1, Math.max(0, (frame - 2 * BAR) / 16)));
	const final = FINAL_HIT - END_START;
	const pulse = frame >= final ? 1 + 0.05 * Math.exp(-(frame - final) / 6) : 1;
	const shine = interpolate((frame - 2 * BAR) % 45, [0, 45], [-40, 160]);

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					opacity: bg,
					background: `linear-gradient(180deg, rgba(58,4,14,0.86) 0%, rgba(94,7,22,0.72) 45%, rgba(6,36,26,0.9) 100%)`,
				}}
			/>
			<Bokeh count={18} opacity={0.6} seed="end" />
			<Garland y={140} sag={60} delay={4} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 160}}>
				<div style={{textAlign: 'center', transform: `scale(${pulse})`}}>
					<LuxText kicker="Feliz Navidad" title="" size={10} delay={2} />
					<Logo size={240} delay={6} />
					<div
						style={{
							fontFamily: fonts.caps,
							fontWeight: 600,
							fontSize: 34,
							letterSpacing: '0.3em',
							marginRight: '-0.3em',
							color: colors.cream,
							opacity: sub,
							transform: `translateY(${(1 - sub) * 16}px)`,
						}}
					>
						PIJAMAS & ROPA DE CASA
					</div>
					<div
						style={{
							marginTop: 90,
							display: 'inline-block',
							position: 'relative',
							overflow: 'hidden',
							padding: '30px 76px',
							borderRadius: 999,
							background: goldFoil(100),
							boxShadow: '0 16px 40px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.5)',
							fontFamily: fonts.sans,
							fontWeight: 700,
							fontSize: 38,
							letterSpacing: '0.24em',
							color: colors.wine,
							whiteSpace: 'nowrap',
							opacity: ctaP,
							transform: `translateY(${(1 - ctaP) * 40}px)`,
						}}
					>
						<span style={{marginRight: '-0.24em'}}>COMPRA AHORA</span>
						<div
							style={{
								position: 'absolute',
								inset: 0,
								background: `linear-gradient(100deg, transparent ${shine - 15}%, rgba(255,255,255,0.75) ${shine}%, transparent ${shine + 15}%)`,
							}}
						/>
					</div>
					<div
						style={{
							marginTop: 28,
							fontFamily: fonts.serif,
							fontStyle: 'italic',
							fontSize: 40,
							color: colors.goldLight,
							opacity: ctaP,
						}}
					>
						link en la bio
					</div>
				</div>
				<SparkleField count={12} start={8} seed="end" area={{x: 80, y: 500, w: 920, h: 800}} maxSize={56} />
			</AbsoluteFill>
			<Confetti start={final} x={540} y={1150} count={130} seed="gold" power={1} palette={GOLDS} emoji={false} />
		</AbsoluteFill>
	);
};
