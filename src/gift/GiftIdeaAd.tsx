import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
loadFont({family: 'Playfair Display', url: staticFile('fonts/PlayfairDisplay-Variable.woff2'), weight: '400 900'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const SERIF = '"Playfair Display", Georgia, serif';
const X = {cherry: '#C8102E', pine: '#0F3D2E', cream: '#F5EFE4', gold: '#D2B377'};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const FPS = edit.fps;
const fr = (s: number) => Math.round(s * FPS);

type Shot = (typeof edit.shots)[number] & {from: number};
const shots: Shot[] = [];
{
	let t = 0;
	for (const s of edit.shots) {
		shots.push({...s, from: t});
		t += s.frames;
	}
}
export const GIFT_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;
const close = shots.find((s) => s.id === 'close')!;

const ShotView: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
	const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<OffthreadVideo muted src={staticFile(`gift/${s.id}.mp4`)} style={{width: '100%', height: '100%', transform: `scale(${z})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`}} />
		</AbsoluteFill>
	);
};

/** Subtitle with *highlighted* words on a cherry tag. */
const Subtitle: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 3, dur - 2, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const y = (1 - easeOut(Math.min(1, f / 6))) * 8;
	const parts = text.split('*');
	return (
		<div style={{position: 'absolute', left: 70, right: 70, bottom: 1920 - 1330, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${y}px)`}}>
			<div
				style={{
					maxWidth: 920,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 50,
					lineHeight: 1.24,
					color: '#fff',
					textShadow: '0 0 2px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.6), 0 3px 14px rgba(0,0,0,0.5)',
					WebkitTextStroke: '2px rgba(0,0,0,0.35)',
					paintOrder: 'stroke fill',
				}}
			>
				{parts.map((p, i) =>
					i % 2 ? (
						<span key={i} style={{color: '#fff', background: X.cherry, padding: '0 10px 2px', borderRadius: 6, WebkitTextStroke: '0px', textShadow: 'none', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>
							{p}
						</span>
					) : (
						<span key={i}>{p}</span>
					),
				)}
			</div>
		</div>
	);
};

const CloseCard: React.FC = () => {
	const f = useCurrentFrame();
	const g = easeOut(Math.min(1, f / 14));
	const k = easeOut(Math.min(1, Math.max(0, (f - 4) / 14)));
	const t1 = easeOut(Math.min(1, Math.max(0, (f - 10) / 16)));
	const lg = easeOut(Math.min(1, Math.max(0, (f - 22) / 16)));
	const cta = easeOut(Math.min(1, Math.max(0, (f - 34) / 14)));
	const pulse = 1 + 0.03 * Math.max(0, Math.sin(((f - 50) / 15) * Math.PI));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: g, background: 'linear-gradient(180deg, rgba(15,61,46,0.96) 0%, rgba(15,61,46,0.9) 34%, rgba(15,61,46,0) 50%)'}} />
			<div style={{position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.34em', color: X.gold, opacity: k, transform: `translateY(${(1 - k) * 10}px)`}}>{edit.close.kicker}</div>
				<div
					style={{
						fontFamily: SERIF,
						fontStyle: 'italic',
						fontWeight: 500,
						fontSize: 74,
						lineHeight: 1.08,
						color: X.cream,
						textAlign: 'center',
						maxWidth: 860,
						marginTop: 18,
						opacity: t1,
						transform: `translateY(${(1 - t1) * 16}px)`,
					}}
				>
					{edit.close.title}
				</div>
				<div style={{height: 3, width: 200 * lg, background: X.cherry, margin: '22px 0 24px'}} />
				<div style={{opacity: lg, transform: `scale(${0.96 + 0.04 * lg})`}}>
					<Img src={staticFile('brand/reset-logo-white.png')} style={{width: 320}} />
				</div>
				<div
					style={{
						marginTop: 26,
						padding: '16px 40px 14px',
						borderRadius: 999,
						background: X.cherry,
						fontFamily: SANS,
						fontWeight: 700,
						fontSize: 30,
						letterSpacing: '0.14em',
						color: '#fff',
						opacity: cta,
						transform: `translateY(${(1 - cta) * 10}px) scale(${pulse})`,
						boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
					}}
				>
					{edit.close.cta}
				</div>
				<div style={{marginTop: 16, fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: '0.06em', color: X.cream, opacity: cta}}>{edit.close.url}</div>
			</div>
		</AbsoluteFill>
	);
};

export const GiftIdeaAd: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		{shots.map((s) => (
			<Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
				<ShotView s={s} />
			</Sequence>
		))}
		{edit.subtitles.map((s) => (
			<Sequence key={s.text} from={fr(s.a)} durationInFrames={fr(s.b) - fr(s.a)}>
				<Subtitle text={s.text} dur={fr(s.b) - fr(s.a)} />
			</Sequence>
		))}
		<Sequence from={close.from}>
			<CloseCard />
		</Sequence>
		<Audio src={staticFile('gift/mix.wav')} />
	</AbsoluteFill>
);
