import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
loadFont({family: 'Playfair Display', url: staticFile('fonts/PlayfairDisplay-Variable.woff2'), weight: '400 900'});
loadFont({family: 'Playfair Display Italic', url: staticFile('fonts/PlayfairDisplay-Italic-Variable.woff2'), weight: '400 900'});
const SANS = 'Montserrat, Helvetica, Arial, sans-serif';
const SERIF = '"Playfair Display Italic", "Playfair Display", Georgia, serif';
const C = {navy: '#141B2D', cream: '#F4EFE7', sand: '#D9C7AE', ink: '#1B1B1B'};
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
export const TRAVEL_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;
const close = shots.find((s) => s.id === 'close')!;

const ShotView: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
	const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<OffthreadVideo muted src={staticFile(`travel/${s.id}.mp4`)} style={{width: '100%', height: '100%', transform: `scale(${z})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`}} />
		</AbsoluteFill>
	);
};

/** Subtitle (max two lines) with occasional *highlighted* keywords. */
const Subtitle: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 3, dur - 2, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const parts = text.split('*');
	return (
		<div style={{position: 'absolute', left: 90, right: 90, bottom: 1920 - 1440, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div
				style={{
					maxWidth: 900,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: 46,
					lineHeight: 1.25,
					color: '#fff',
					textShadow: '0 0 2px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.55), 0 4px 18px rgba(0,0,0,0.45)',
				}}
			>
				{parts.map((p, i) =>
					i % 2 ? (
						<span key={i} style={{color: C.sand, fontWeight: 800}}>
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

const Hook: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const k = easeOut(Math.min(1, f / 9));
	const out = interpolate(f, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', top: 300, left: 70, right: 70, display: 'flex', justifyContent: 'center', opacity: Math.min(k, out)}}>
			<div
				style={{
					background: 'rgba(244,239,231,0.94)',
					padding: '26px 40px 30px',
					borderRadius: 8,
					boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
					transform: `translateY(${(1 - k) * 18}px) scale(${0.97 + 0.03 * k})`,
					textAlign: 'center',
					maxWidth: 900,
				}}
			>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 64, lineHeight: 1.1, color: C.navy}}>{text}</div>
			</div>
		</div>
	);
};

const Tag: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const k = easeOut(Math.min(1, f / 10));
	const out = interpolate(f, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: Math.min(k, out)}}>
			<div
				style={{
					background: C.navy,
					color: C.cream,
					padding: '18px 34px 18px',
					borderRadius: 999,
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 34,
					letterSpacing: '0.02em',
					transform: `translateY(${(1 - k) * 14}px)`,
					boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
				}}
			>
				{text}
			</div>
		</div>
	);
};

const CloseCard: React.FC = () => {
	const f = useCurrentFrame();
	const k = easeOut(Math.min(1, Math.max(0, (f - 8) / 18)));
	const lg = easeOut(Math.min(1, Math.max(0, (f - 18) / 16)));
	const t1 = easeOut(Math.min(1, Math.max(0, (f - 26) / 16)));
	const cta = easeOut(Math.min(1, Math.max(0, (f - 40) / 14)));
	const s = 1 - 0.4 * k; // full-bleed → inset card
	const dy = 330 * k;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: C.navy, opacity: k}} />
			<AbsoluteFill style={{transform: `translateY(${dy}px) scale(${s})`, transformOrigin: '50% 50%'}}>
				<div style={{position: 'absolute', inset: 0, borderRadius: 34 * k / s, overflow: 'hidden', boxShadow: `0 30px 80px rgba(0,0,0,${0.45 * k})`}}>
					<OffthreadVideo muted src={staticFile('travel/close.mp4')} style={{width: '100%', height: '100%'}} />
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{opacity: lg, transform: `scale(${0.96 + 0.04 * lg})`}}>
					<Img src={staticFile('brand/reset-logo-white.png')} style={{width: 300}} />
				</div>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 58, lineHeight: 1.12, color: C.cream, textAlign: 'center', maxWidth: 860, marginTop: 26, whiteSpace: 'pre-line', opacity: t1, transform: `translateY(${(1 - t1) * 14}px)`}}>
					{edit.close.title}
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 26, opacity: cta, transform: `translateY(${(1 - cta) * 10}px)`}}>
					<div style={{padding: '13px 30px 12px', borderRadius: 999, background: C.cream, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.14em', color: C.navy}}>{edit.close.cta}</div>
					<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: '0.04em', color: C.cream}}>{edit.close.url}</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const TravelBagAd: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		{shots.map((s) => (
			<Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
				<ShotView s={s} />
			</Sequence>
		))}
		{edit.graphics.map((g) => (
			<Sequence key={g.text} from={fr(g.a)} durationInFrames={fr(g.b) - fr(g.a)}>
				{g.style === 'hook' ? <Hook text={g.text} dur={fr(g.b) - fr(g.a)} /> : <Tag text={g.text} dur={fr(g.b) - fr(g.a)} />}
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
		<Audio src={staticFile('travel/mix.wav')} />
	</AbsoluteFill>
);
