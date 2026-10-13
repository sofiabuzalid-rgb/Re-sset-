import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {colors, fonts, goldFoil} from '../theme';
import {LuxText} from './LuxText';
import {SparkleField} from './Sparkle';

const W = 1080;
const H = 1920;
const RIBBON_Y = 1040; // horizontal ribbon center
const RIBBON = 120; // ribbon width
const inCubic = Easing.bezier(0.55, 0, 0.9, 0.4);
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

/** Torn-paper edge: jagged polygon points along a vertical line at x. */
const tornEdge = (x: number, side: 1 | -1, seed: string) => {
	const pts: string[] = [];
	const steps = 48;
	for (let i = 0; i <= steps; i++) {
		const y = (i / steps) * H;
		const j = (random(`${seed}-${i}`) - 0.5) * 34;
		pts.push(`${x + j * side}px ${y}px`);
	}
	return pts;
};

const Paper: React.FC<{id: string}> = ({id}) => (
	<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
		<defs>
			<radialGradient id={`${id}-bg`} cx="50%" cy="45%" r="75%">
				<stop offset="0%" stopColor="#C2152F" />
				<stop offset="60%" stopColor="#8E0C22" />
				<stop offset="100%" stopColor="#4A0512" />
			</radialGradient>
			<pattern id={`${id}-pat`} width="180" height="180" patternUnits="userSpaceOnUse">
				{/* foil snowflake + dots motif */}
				<g transform="translate(45 45)" stroke="#E8C77A" strokeWidth="3" strokeLinecap="round" opacity="0.32">
					{[0, 60, 120].map((a) => (
						<g key={a} transform={`rotate(${a})`}>
							<line x1="-22" y1="0" x2="22" y2="0" />
							<line x1="14" y1="0" x2="20" y2="-6" />
							<line x1="14" y1="0" x2="20" y2="6" />
							<line x1="-14" y1="0" x2="-20" y2="-6" />
							<line x1="-14" y1="0" x2="-20" y2="6" />
						</g>
					))}
				</g>
				<g transform="translate(135 135)" fill="#E8C77A" opacity="0.3">
					<path d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4 Z" />
				</g>
				<circle cx="135" cy="45" r="4" fill="#E8C77A" opacity="0.25" />
				<circle cx="45" cy="135" r="4" fill="#E8C77A" opacity="0.25" />
			</pattern>
			<linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stopColor="#fff" stopOpacity="0.14" />
				<stop offset="45%" stopColor="#fff" stopOpacity="0" />
				<stop offset="100%" stopColor="#000" stopOpacity="0.25" />
			</linearGradient>
		</defs>
		<rect width={W} height={H} fill={`url(#${id}-bg)`} />
		<rect width={W} height={H} fill={`url(#${id}-pat)`} />
		<rect width={W} height={H} fill={`url(#${id}-sheen)`} />
	</svg>
);

const Ribbon: React.FC<{vertical: boolean; style?: React.CSSProperties}> = ({vertical, style}) => (
	<div
		style={{
			position: 'absolute',
			...(vertical
				? {left: W / 2 - RIBBON / 2, top: -40, width: RIBBON, height: H + 80}
				: {top: RIBBON_Y - RIBBON / 2, left: -40, height: RIBBON, width: W + 80}),
			background: `${vertical ? 'linear-gradient(90deg' : 'linear-gradient(180deg'}, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 12%, rgba(255,255,255,0.35) 30%, rgba(0,0,0,0) 50%, rgba(255,255,255,0.2) 75%, rgba(0,0,0,0.35) 100%), ${goldFoil(vertical ? 180 : 90)}`,
			boxShadow: '0 0 30px rgba(0,0,0,0.45)',
			...style,
		}}
	/>
);

const Bow: React.FC<{style?: React.CSSProperties}> = ({style}) => (
	<svg width={520} height={420} viewBox="-260 -230 520 420" style={{position: 'absolute', overflow: 'visible', ...style}}>
		<defs>
			<linearGradient id="bow-gold" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stopColor="#FFF4D0" />
				<stop offset="35%" stopColor="#D9B25F" />
				<stop offset="65%" stopColor="#F3D98F" />
				<stop offset="100%" stopColor="#8C6420" />
			</linearGradient>
			<linearGradient id="bow-shade" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#000" stopOpacity="0" />
				<stop offset="100%" stopColor="#000" stopOpacity="0.35" />
			</linearGradient>
		</defs>
		<g style={{filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.5))'}}>
			{/* tails */}
			<path d="M-20 10 L-150 180 L-110 185 L-95 215 L10 20 Z" fill="url(#bow-gold)" />
			<path d="M20 10 L150 180 L110 185 L95 215 L-10 20 Z" fill="url(#bow-gold)" />
			{/* loops */}
			<path d="M-10 -10 C-120 -200 -270 -120 -200 -30 C-160 20 -60 10 -10 -10 Z" fill="url(#bow-gold)" stroke="#8C6420" strokeWidth="4" />
			<path d="M10 -10 C120 -200 270 -120 200 -30 C160 20 60 10 10 -10 Z" fill="url(#bow-gold)" stroke="#8C6420" strokeWidth="4" />
			<path d="M-40 -20 C-110 -120 -190 -90 -160 -45" fill="none" stroke="#8C6420" strokeWidth="5" opacity="0.6" />
			<path d="M40 -20 C110 -120 190 -90 160 -45" fill="none" stroke="#8C6420" strokeWidth="5" opacity="0.6" />
			<path d="M-10 -10 C-120 -200 -270 -120 -200 -30 C-160 20 -60 10 -10 -10 Z" fill="url(#bow-shade)" />
			<path d="M10 -10 C120 -200 270 -120 200 -30 C160 20 60 10 10 -10 Z" fill="url(#bow-shade)" />
			{/* knot */}
			<ellipse cx="0" cy="-5" rx="48" ry="42" fill="url(#bow-gold)" stroke="#8C6420" strokeWidth="4" />
			<ellipse cx="-12" cy="-18" rx="16" ry="10" fill="#fff" opacity="0.45" />
		</g>
	</svg>
);

const Tag: React.FC<{style?: React.CSSProperties}> = ({style}) => (
	<div style={{position: 'absolute', transformOrigin: '50% 0%', ...style}}>
		{/* string */}
		<div style={{position: 'absolute', left: 168, top: -110, width: 3, height: 130, background: '#E8C77A', transform: 'rotate(-18deg)', transformOrigin: 'top'}} />
		<div
			style={{
				width: 340,
				height: 200,
				background: colors.cream,
				borderRadius: 18,
				clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 14% 100%, 0 50%)',
				boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				paddingLeft: 40,
				border: `4px solid ${colors.gold}`,
			}}
		>
			<div style={{position: 'absolute', left: 26, top: 88, width: 22, height: 22, borderRadius: '50%', background: colors.cranberryDeep}} />
			<div style={{fontFamily: fonts.script, fontSize: 92, lineHeight: 1, color: colors.cranberry}}>Para ti</div>
			<div style={{fontFamily: fonts.caps, fontWeight: 700, fontSize: 24, letterSpacing: '0.25em', color: colors.goldDark, marginTop: 4}}>
				DE RE:SET
			</div>
		</div>
	</div>
);

/**
 * HOOK: the whole screen is a wrapped present. The bow wiggles on the beat,
 * the ribbons are pulled off, and the paper tears open down the middle.
 */
export const GiftWrap: React.FC = () => {
	const f = useCurrentFrame();
	const intro = outExpo(Math.min(1, f / 10));
	// anticipation wiggles on beats 10 and 20
	const wig = (at: number) => (f >= at && f < at + 10 ? Math.sin(((f - at) / 10) * Math.PI * 2) * (1 - (f - at) / 10) : 0);
	const wiggle = wig(10) + wig(20);
	// ribbons pulled off (frames 27-37)
	const pull = inCubic(interpolate(f, [27, 37], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	// paper tears open (frames 34-50)
	const tear = inCubic(interpolate(f, [34, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	const glow = interpolate(f, [33, 38, 52], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	if (f > 52) return null;

	const leftEdge = tornEdge(W / 2, -1, 'tear');
	const leftClip = `polygon(0 0, ${leftEdge.join(', ')}, 0 ${H}px)`;
	const rightClip = `polygon(${leftEdge.join(', ')}, ${W}px ${H}px, ${W}px 0)`;

	return (
		<AbsoluteFill style={{transform: `scale(${1.08 - intro * 0.08})`}}>
			{/* light from inside the gift */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 30% 70% at 50% 50%, rgba(255,236,190,${glow}) 0%, rgba(255,200,120,${glow * 0.6}) 40%, rgba(255,200,120,0) 75%)`,
					zIndex: 0,
				}}
			/>
			{/* paper halves */}
			{(['left', 'right'] as const).map((side) => (
				<AbsoluteFill
					key={side}
					style={{
						clipPath: side === 'left' ? leftClip : rightClip,
						transform: `translateX(${(side === 'left' ? -1 : 1) * tear * 115}%) rotate(${(side === 'left' ? -1 : 1) * tear * 8}deg)`,
						transformOrigin: side === 'left' ? '0% 100%' : '100% 100%',
						filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.6))',
					}}
				>
					<Paper id={`paper-${side}`} />
				</AbsoluteFill>
			))}
			{/* ribbons */}
			<Ribbon vertical style={{transform: `translateY(${-pull * 115}%)`}} />
			<Ribbon vertical={false} style={{transform: `translateX(${pull * 115}%)`}} />
			{/* bow + tag */}
			<div
				style={{
					position: 'absolute',
					left: W / 2,
					top: RIBBON_Y,
					transform: `translate(0, ${-pull * 900}px) scale(${1 + pull * 0.6}) rotate(${wiggle * 6 + pull * 30}deg)`,
					opacity: 1 - pull,
				}}
			>
				<Bow style={{left: -260, top: -230, transform: 'scale(1.3)'}} />
				<Tag style={{left: 60, top: 190, transform: `rotate(${10 + Math.sin(f * 0.25) * 4 + wiggle * 8}deg)`}} />
			</div>
			{/* headline */}
			<div
				style={{
					position: 'absolute',
					top: 300,
					left: 0,
					right: 0,
					opacity: 1 - pull,
					transform: `translateY(${-pull * 60}px)`,
				}}
			>
				<LuxText kicker="Tienes un regalo" title="Ábrelo..." size={176} delay={-14} />
			</div>
			<SparkleField count={14} seed="wrap" area={{x: 60, y: 200, w: 960, h: 1400}} maxSize={56} />
		</AbsoluteFill>
	);
};
