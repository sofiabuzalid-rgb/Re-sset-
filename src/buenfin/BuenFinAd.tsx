import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
loadFont({family: 'Playfair Display', url: staticFile('fonts/PlayfairDisplay-Variable.woff2'), weight: '400 900'});
const SANS = 'Montserrat, Helvetica, Arial, sans-serif';
const SERIF = '"Playfair Display", Georgia, serif';
const C = {ivory: '#FBF7F2', cream: '#F3ECE3', ink: '#2B2623', rose: '#D9A3A9', roseDeep: '#A8727A'};
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

/** Spoken subtitles: small ink type on the empty wall above Ilana — never over the pajama. */
const Subtitle: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 4, dur - 3, dur], [0, 1, 1, 0], clamp);
	const parts = text.split('*');
	return (
		<div style={{position: 'absolute', left: 110, right: 110, bottom: 1920 - 660, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 4}px)`}}>
			<div style={{maxWidth: 860, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 40, lineHeight: 1.3, color: C.ink, textShadow: '0 0 14px rgba(251,247,242,0.9)'}}>
				{parts.map((p, i) =>
					i % 2 ? (
						<span key={i} style={{color: C.roseDeep, fontWeight: 600}}>
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

const Kicker: React.FC<{children: React.ReactNode; o?: number}> = ({children, o = 1}) => (
	<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: '0.36em', color: C.ink, opacity: 0.85 * o}}>{children}</div>
);

/** Opening: product + offer from frame 0, quiet editorial type (no boxes). */
const Hook: React.FC<{dur: number}> = ({dur}) => {
	const {f, o} = useEnv(dur);
	const k = easeOut(Math.min(1, (f + 6) / 10));
	return (
		<div style={{position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o * k, transform: `translateY(${(1 - k) * 10}px)`}}>
			<Kicker>{edit.hook.title}</Kicker>
			<div style={{marginTop: 6, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 120, lineHeight: 1, color: C.ink}}>{edit.hook.offer.split('·')[0].trim().replace('OFF', 'off')}</div>
			<div style={{marginTop: 10, fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: '0.36em', color: C.roseDeep}}>{edit.hook.offer.split('·')[1]?.trim()}</div>
		</div>
	);
};

/** Product picture-in-picture: small ivory card, lower-left over the rack (off the pajama). */
const ProductCard: React.FC<{dur: number}> = ({dur}) => {
	const {k, o} = useEnv(dur, 12, 8);
	return (
		<div
			style={{
				position: 'absolute',
				left: 44,
				top: 1170,
				width: 214,
				background: C.ivory,
				borderRadius: 14,
				padding: '10px 10px 12px',
				boxShadow: '0 10px 28px rgba(0,0,0,0.12)',
				border: '1px solid rgba(30,27,26,0.08)',
				opacity: Math.min(k, o),
				transform: `translateY(${(1 - k) * 16}px)`,
			}}
		>
			<div style={{width: '100%', height: 230, borderRadius: 8, background: '#fff', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
				<Img src={staticFile(edit.card.image)} style={{height: '100%', objectFit: 'contain'}} />
			</div>
			<div style={{marginTop: 8, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 23, color: C.ink}}>{edit.card.name}</div>
			<div style={{marginTop: 2, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 15, letterSpacing: '0.24em', color: C.roseDeep}}>{edit.card.offer}</div>
		</div>
	);
};

/** Commercial reinforcement — quiet type on the wall. */
const Promo: React.FC<{dur: number}> = ({dur}) => {
	const {f, o} = useEnv(dur);
	const k = easeOut(Math.min(1, f / 10));
	const k2 = easeOut(Math.min(1, Math.max(0, (f - 5) / 10)));
	return (
		<div style={{position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o}}>
			<div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 104, lineHeight: 1, color: C.roseDeep, opacity: k, transform: `translateY(${(1 - k) * 10}px)`}}>{edit.promo.title.replace('OFF', 'off')}</div>
			<div style={{marginTop: 10, opacity: k2}}>
				<Kicker>{edit.promo.sub}</Kicker>
			</div>
			<div style={{marginTop: 10, fontFamily: SANS, fontSize: 17, color: C.ink, opacity: 0.6 * k2}}>{edit.promo.legal}</div>
		</div>
	);
};

/** CTA over a real shot (no black screen): light veil, logo, one line, one link. */
const CloseCard: React.FC = () => {
	const f = useCurrentFrame();
	const g = easeOut(Math.min(1, f / 14));
	const lg = easeOut(Math.min(1, Math.max(0, (f - 4) / 14)));
	const t1 = easeOut(Math.min(1, Math.max(0, (f - 10) / 14)));
	const cta = easeOut(Math.min(1, Math.max(0, (f - 20) / 12)));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: g, background: 'linear-gradient(180deg, rgba(251,247,242,0.9) 0%, rgba(251,247,242,0.75) 26%, rgba(251,247,242,0) 40%)'}} />
			<div style={{position: 'absolute', top: 200, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{opacity: lg}}>
					<Img src={staticFile('brand/reset-logo-black.png')} style={{width: 250}} />
				</div>
				<div style={{marginTop: 20, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 60, color: C.ink, opacity: t1, transform: `translateY(${(1 - t1) * 10}px)`}}>{edit.close.title}</div>
				<div style={{marginTop: 16, opacity: cta, borderBottom: `1px solid ${C.ink}`, paddingBottom: 6}}>
					<Kicker>{edit.close.cta}</Kicker>
				</div>
				<div style={{marginTop: 12, fontFamily: SANS, fontSize: 20, letterSpacing: '0.08em', color: C.ink, opacity: 0.7 * cta}}>{edit.close.url}</div>
			</div>
		</AbsoluteFill>
	);
};

const win = (o: {a: number; b: number}) => ({from: fr(o.a), dur: fr(o.b) - fr(o.a)});

export const BuenFinAd: React.FC = () => {
	const hook = win(edit.hook);
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
			<Sequence from={card.from} durationInFrames={card.dur}>
				<ProductCard dur={card.dur} />
			</Sequence>
			<Sequence from={promo.from} durationInFrames={promo.dur}>
				<Promo dur={promo.dur} />
			</Sequence>
			{edit.subtitles.map((s) => (
				<Sequence key={s.text} from={fr(s.a)} durationInFrames={fr(s.b) - fr(s.a)}>
					<Subtitle text={s.text} dur={fr(s.b) - fr(s.a)} />
				</Sequence>
			))}
			<Sequence from={close}>
				<CloseCard />
			</Sequence>
			<Audio src={staticFile('buenfin/mix.wav')} />
		</AbsoluteFill>
	);
};
