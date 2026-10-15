import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

loadFont({family: 'Bebas Neue', url: staticFile('fonts/BebasNeue-Regular.woff2'), weight: '400'});
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const DISPLAY = '"Bebas Neue", Gotham, Montserrat, sans-serif';
const H = {blue: '#0E2140', ivory: '#F4EEE2', gold: '#D2B377'};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const FPS = edit.fps;

type Shot = (typeof edit.shots)[number] & {from: number; dur: number};
const shots: Shot[] = [];
{
	let t = 0;
	for (const s of edit.shots) {
		const dur = Math.round(((s.out - s.in) * FPS) / s.rate);
		shots.push({...s, from: t, dur});
		t += dur;
	}
}
export const HANUKKAH_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].dur;
const close = shots[shots.length - 1];

const ShotView: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.dur));
	const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: H.blue}}>
			<OffthreadVideo
				muted
				src={staticFile(`hanukkah/${s.id}.mp4`)}
				style={{width: '100%', height: '100%', transform: `scale(${z})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`}}
			/>
		</AbsoluteFill>
	);
};

/** Stylised hanukkiah: eight branches + the raised shamash. Shamash first, then the eight lights added from right to left, as tradition places them. */
const Hanukkiah: React.FC<{lit: number; w?: number}> = ({lit, w = 300}) => {
	const xs = [-120, -90, -60, -30, 30, 60, 90, 120];
	const flame = (x: number, y: number, on: number) => (
		<g opacity={on} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * on})`}>
			<ellipse cx={0} cy={-6} rx={9} ry={14} fill={H.gold} opacity={0.35} />
			<path d="M0 -16 C5 -8 6 -2 0 4 C-6 -2 -5 -8 0 -16 Z" fill="#FFE7B0" />
		</g>
	);
	return (
		<svg width={w} height={w * 0.55} viewBox="-150 -60 300 165" style={{overflow: 'visible'}}>
			<ellipse cx={0} cy={30} rx={175} ry={95} fill="rgba(14,33,64,0.55)" style={{filter: 'blur(18px)'}} />
			<g stroke={H.ivory} strokeWidth={4} fill="none" strokeLinecap="round">
				{xs.map((x) => (
					<path key={x} d={`M${x} 10 V40 Q${x} 70 0 70`} />
				))}
				<path d="M0 -14 V100" />
				<path d="M-40 100 H40" />
				{xs.map((x) => (
					<path key={`c${x}`} d={`M${x - 5} 10 H${x + 5}`} />
				))}
				<path d="M-6 -14 H6" />
			</g>
			{flame(0, -20, Math.min(1, lit))}
			{xs.map((x, i) => (
				<React.Fragment key={`f${x}`}>{flame(x, 4, Math.max(0, Math.min(1, lit - 1 - (7 - i))))}</React.Fragment>
			))}
		</svg>
	);
};

const HookText: React.FC<{text: string; dur: number; withMenorah?: boolean}> = ({text, dur, withMenorah}) => {
	const f = useCurrentFrame();
	const words = text.split(' ');
	const out = interpolate(f, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const line = easeOut(Math.min(1, Math.max(0, (f - 10) / 16)));
	return (
		<>
		{withMenorah ? (
			// shamash + 8 flames light on the 8th notes of the first bar — on the empty table, below the product
			<div style={{position: 'absolute', left: 0, right: 0, top: 1330, display: 'flex', justifyContent: 'center', opacity: out}}>
				<Hanukkiah lit={f / 6.5} w={440} />
			</div>
		) : null}
		<div style={{position: 'absolute', left: 50, right: 50, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: out}}>
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 22, background: 'rgba(14,33,64,0.55)', padding: '14px 28px 6px'}}>
				{words.map((w, i) => {
					const p = easeOut(Math.min(1, Math.max(0, (f - i * 3) / 12)));
					return (
						<div key={i} style={{overflow: 'hidden', paddingTop: 10, marginTop: -10}}>
							<div style={{fontFamily: DISPLAY, fontSize: 78, lineHeight: 1.0, letterSpacing: '0.03em', color: H.ivory, transform: `translateY(${(1 - p) * 105}%)`}}>{w}</div>
						</div>
					);
				})}
			</div>
			<div style={{height: 3, width: 220 * line, background: H.gold, marginTop: 4}} />
		</div>
		</>
	);
};

const Label: React.FC<{kicker: string; text: string; dur: number}> = ({kicker, text, dur}) => {
	const f = useCurrentFrame();
	const o = Math.min(easeOut(Math.min(1, f / 10)), interpolate(f, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	const k = easeOut(Math.min(1, f / 14));
	return (
		<div style={{position: 'absolute', left: 70, top: 1120, opacity: o, transform: `translateY(${(1 - k) * 14}px)`}}>
			<div style={{border: `1.5px solid rgba(210,179,119,0.9)`, background: 'rgba(14,33,64,0.62)', padding: '18px 26px 16px', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'}}>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.32em', color: H.gold}}>{kicker}</div>
				<div style={{fontFamily: DISPLAY, fontSize: 66, letterSpacing: '0.03em', lineHeight: 1.02, color: H.ivory, marginTop: 6}}>{text}</div>
			</div>
		</div>
	);
};

const CloseCard: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const g = easeOut(Math.min(1, f / 14));
	const logo = easeOut(Math.min(1, Math.max(0, (f - 8) / 16)));
	const t2 = easeOut(Math.min(1, Math.max(0, (f - 20) / 14)));
	const cta = easeOut(Math.min(1, Math.max(0, (f - 30) / 14)));
	const shine = interpolate((f - 30) % 45, [0, 45], [-40, 160]);
	return (
		<AbsoluteFill>
			{/* deep-blue fade from below: the pajama stays visible above */}
			<AbsoluteFill style={{opacity: g, background: `linear-gradient(180deg, rgba(14,33,64,0) 38%, rgba(14,33,64,0.82) 56%, rgba(14,33,64,0.95) 100%)`}} />
			<div style={{position: 'absolute', top: 905, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{opacity: logo, transform: `translateY(${(1 - logo) * 14}px) scale(${0.96 + 0.04 * logo})`}}>
					<Img src={staticFile('brand/reset-logo-white.png')} style={{width: 470}} />
				</div>
				<div style={{height: 2, width: 260 * logo, background: H.gold, margin: '22px 0 20px'}} />
				<div style={{fontFamily: DISPLAY, fontSize: 64, letterSpacing: '0.05em', color: H.ivory, opacity: t2, transform: `translateY(${(1 - t2) * 10}px)`}}>
					{edit.close.title}
				</div>
				<div
					style={{
						marginTop: 18,
						position: 'relative',
						overflow: 'hidden',
						padding: '16px 42px 14px',
						border: `1.5px solid ${H.gold}`,
						fontFamily: SANS,
						fontWeight: 700,
						fontSize: 28,
						letterSpacing: '0.2em',
						color: H.gold,
						opacity: cta,
						transform: `translateY(${(1 - cta) * 10}px)`,
					}}
				>
					{edit.close.cta}
					<div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${shine - 15}%, rgba(255,240,200,0.35) ${shine}%, transparent ${shine + 15}%)`}} />
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const HanukkahAd: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: H.blue}}>
		{shots.map((s) => (
			<Sequence key={s.id} from={s.from} durationInFrames={s.dur} premountFor={10}>
				<ShotView s={s} />
			</Sequence>
		))}
		{/* soft candle-light vignette, warm at the edges */}
		<AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(0,0,0,0) 60%, rgba(14,33,64,0.45) 100%)'}} />
		{edit.texts.map((t, i) => (
			<Sequence key={i} from={t.from} durationInFrames={t.to - t.from}>
				{t.kind === 'hook' ? <HookText text={t.text} dur={t.to - t.from} withMenorah={i === 0} /> : <Label kicker={t.kicker ?? ''} text={t.text} dur={t.to - t.from} />}
			</Sequence>
		))}
		<Sequence from={close.from}>
			<CloseCard dur={close.dur} />
		</Sequence>
		<Audio src={staticFile('hanukkah/music.wav')} />
	</AbsoluteFill>
);
