import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
loadFont({family: 'Playfair Display', url: staticFile('fonts/PlayfairDisplay-Variable.woff2'), weight: '400 900'});
const SANS = 'Montserrat, Helvetica, Arial, sans-serif';
const SERIF = '"Playfair Display", Georgia, serif';
const C = {ivory: '#FBF7F2', cream: '#F3ECE3', ink: '#1E1B1A', rose: '#D9A3A9', roseDeep: '#B9727B'};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const FPS = edit.fps;
const fr = (s: number) => Math.round(s * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Shot = (typeof edit.shots)[number] & {from: number};
const shots: Shot[] = [];
{
	let t = 0;
	for (const s of edit.shots) {
		shots.push({...s, from: t});
		t += s.frames;
	}
}
export const BUENFIN_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;

const ShotView: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
	const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<OffthreadVideo muted src={staticFile(`buenfin/${s.id}.mp4`)} style={{width: '100%', height: '100%', transform: `scale(${z})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`}} />
		</AbsoluteFill>
	);
};

/** In/out envelope for an overlay that lives `dur` frames. */
const useEnv = (dur: number, inF = 8, outF = 6) => {
	const f = useCurrentFrame();
	return {f, k: easeOut(Math.min(1, f / inF)), o: interpolate(f, [dur - outF, dur], [1, 0], clamp)};
};

/** Spoken subtitles: white on a soft shadow; shifts left (beside the card) while the product card is on screen. */
const Subtitle: React.FC<{text: string; dur: number; raised: boolean}> = ({text, dur, raised}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 3, dur - 2, dur], [0, 1, 1, 0], clamp);
	const parts = text.split('*');
	return (
		<div style={{position: 'absolute', left: raised ? 60 : 90, right: raised ? 420 : 90, bottom: 1920 - 1450, display: 'flex', justifyContent: raised ? 'flex-start' : 'center', opacity: o}}>
			<div style={{maxWidth: 900, textAlign: raised ? 'left' : 'center', fontFamily: SANS, fontWeight: 600, fontSize: raised ? 42 : 46, lineHeight: 1.25, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.55), 0 4px 18px rgba(0,0,0,0.45)'}}>
				{parts.map((p, i) =>
					i % 2 ? (
						<span key={i} style={{color: '#FFD9DC', fontWeight: 800}}>
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

/** Opening: the product and the offer from frame 0 (no long animation). */
const Hook: React.FC<{dur: number}> = ({dur}) => {
	const {f, o} = useEnv(dur);
	const k = easeOut(Math.min(1, (f + 5) / 8));
	const k2 = easeOut(Math.min(1, (f + 2) / 8));
	return (
		<div style={{position: 'absolute', top: 175, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o}}>
			<div style={{background: C.ivory, padding: '20px 44px 16px', borderRadius: 6, boxShadow: '0 14px 40px rgba(0,0,0,0.18)', opacity: k, transform: `translateY(${(1 - k) * 14}px)`}}>
				<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 84, lineHeight: 1, letterSpacing: '0.02em', color: C.ink}}>{edit.hook.title}</div>
			</div>
			<div style={{marginTop: 14, background: C.roseDeep, color: '#fff', padding: '12px 32px 11px', borderRadius: 999, fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: '0.08em', opacity: k2, transform: `translateY(${(1 - k2) * 12}px)`}}>
				{edit.hook.offer}
			</div>
		</div>
	);
};

/** Small persistent offer badge, top-centre (kept off the face). */
const Badge: React.FC<{dur: number}> = ({dur}) => {
	const {k, o} = useEnv(dur, 10, 8);
	return (
		<div style={{position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: Math.min(k, o)}}>
			<div style={{background: 'rgba(30,27,26,0.82)', color: C.ivory, padding: '10px 26px 9px', borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: '0.12em'}}>{edit.badge.text}</div>
		</div>
	);
};

/** Product picture-in-picture: official catalogue photo on an ivory card, bottom-right. */
const ProductCard: React.FC<{dur: number}> = ({dur}) => {
	const {k, o} = useEnv(dur, 12, 8);
	return (
		<div
			style={{
				position: 'absolute',
				right: 56,
				top: 1215,
				width: 330,
				background: C.ivory,
				borderRadius: 18,
				padding: '16px 16px 18px',
				boxShadow: '0 18px 44px rgba(0,0,0,0.22)',
				border: '1px solid rgba(0,0,0,0.06)',
				opacity: Math.min(k, o),
				transform: `translateX(${(1 - k) * 40}px) scale(${0.96 + 0.04 * k})`,
				transformOrigin: '100% 100%',
			}}
		>
			<div style={{width: '100%', height: 340, borderRadius: 10, background: '#fff', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
				<Img src={staticFile(edit.card.image)} style={{height: '100%', objectFit: 'contain'}} />
			</div>
			<div style={{marginTop: 12, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: '0.16em', color: C.ink}}>{edit.card.name}</div>
			<div style={{marginTop: 6, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: '0.08em', color: C.roseDeep}}>{edit.card.offer}</div>
		</div>
	);
};

/** Commercial reinforcement: 15% OFF EN TODA LA TIENDA (Ilana stays visible below). */
const Promo: React.FC<{dur: number}> = ({dur}) => {
	const {f, o} = useEnv(dur);
	const k = easeOut(Math.min(1, f / 9));
	const k2 = easeOut(Math.min(1, Math.max(0, (f - 5) / 9)));
	return (
		<div style={{position: 'absolute', top: 170, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o}}>
			<div style={{background: C.ivory, borderRadius: 8, padding: '18px 54px 22px', textAlign: 'center', boxShadow: '0 14px 40px rgba(0,0,0,0.18)', opacity: k, transform: `scale(${0.94 + 0.06 * k})`}}>
				<div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 120, lineHeight: 0.95, color: C.roseDeep}}>{edit.promo.title}</div>
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: '0.14em', color: C.ink, marginTop: 8, opacity: k2}}>{edit.promo.sub}</div>
			</div>
			<div style={{marginTop: 12, fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.ink, background: 'rgba(251,247,242,0.85)', padding: '6px 16px', borderRadius: 999, opacity: k2}}>{edit.promo.legal}</div>
		</div>
	);
};

/** CTA over a real shot (no black screen). */
const CloseCard: React.FC = () => {
	const f = useCurrentFrame();
	const g = easeOut(Math.min(1, f / 12));
	const lg = easeOut(Math.min(1, Math.max(0, (f - 4) / 14)));
	const t1 = easeOut(Math.min(1, Math.max(0, (f - 10) / 14)));
	const cta = easeOut(Math.min(1, Math.max(0, (f - 20) / 12)));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: g, background: 'linear-gradient(180deg, rgba(251,247,242,0.96) 0%, rgba(251,247,242,0.9) 30%, rgba(251,247,242,0) 46%)'}} />
			<div style={{position: 'absolute', top: 175, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{opacity: lg}}>
					<Img src={staticFile('brand/reset-logo-black.png')} style={{width: 300}} />
				</div>
				<div style={{marginTop: 22, fontFamily: SERIF, fontWeight: 700, fontSize: 66, color: C.ink, opacity: t1, transform: `translateY(${(1 - t1) * 12}px)`}}>{edit.close.title}</div>
				<div style={{marginTop: 18, background: C.roseDeep, color: '#fff', padding: '14px 36px 13px', borderRadius: 999, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.12em', opacity: cta, transform: `translateY(${(1 - cta) * 10}px)`}}>{edit.close.cta}</div>
				<div style={{marginTop: 14, fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: '0.05em', color: C.ink, opacity: cta}}>{edit.close.url}</div>
			</div>
		</AbsoluteFill>
	);
};

const win = (o: {a: number; b: number}) => ({from: fr(o.a), dur: fr(o.b) - fr(o.a)});

export const BuenFinAd: React.FC = () => {
	const hook = win(edit.hook);
	const badge = win(edit.badge);
	const card = win(edit.card);
	const promo = win(edit.promo);
	const close = fr(edit.close.a);
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{shots.map((s) => (
				<Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
					<ShotView s={s} />
				</Sequence>
			))}
			<Sequence from={hook.from} durationInFrames={hook.dur}>
				<Hook dur={hook.dur} />
			</Sequence>
			<Sequence from={badge.from} durationInFrames={badge.dur}>
				<Badge dur={badge.dur} />
			</Sequence>
			<Sequence from={card.from} durationInFrames={card.dur}>
				<ProductCard dur={card.dur} />
			</Sequence>
			<Sequence from={promo.from} durationInFrames={promo.dur}>
				<Promo dur={promo.dur} />
			</Sequence>
			{edit.subtitles.map((s) => (
				<Sequence key={s.text} from={fr(s.a)} durationInFrames={fr(s.b) - fr(s.a)}>
					<Subtitle text={s.text} dur={fr(s.b) - fr(s.a)} raised={s.a < edit.card.b && s.b > edit.card.a} />
				</Sequence>
			))}
			<Sequence from={close}>
				<CloseCard />
			</Sequence>
			<Audio src={staticFile('buenfin/mix.wav')} />
		</AbsoluteFill>
	);
};
