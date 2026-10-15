import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

loadFont({family: 'Bebas Neue', url: staticFile('fonts/BebasNeue-Regular.woff2'), weight: '400'});
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const DISPLAY = '"Bebas Neue", Gotham, Montserrat, sans-serif';
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
export const XMAS_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;
const shot = (id: string) => shots.find((s) => s.id === id)!;

// voice segments placed back to back on the output timeline
const vStart: number[] = [];
{
	let o = 0;
	for (const v of edit.voice) {
		vStart.push(o);
		o += fr(v.b - v.a);
	}
}
const subs = edit.subtitles.map((s) => {
	const v = edit.voice[s.v];
	return {text: s.text, from: vStart[s.v] + fr(s.a - v.a), to: vStart[s.v] + fr(s.b - v.a)};
});

const ShotView: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
	const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<OffthreadVideo muted src={staticFile(`xmas/${s.id}.mp4`)} style={{width: '100%', height: '100%', transform: `scale(${z})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`}} />
		</AbsoluteFill>
	);
};

/** Subtitle with *highlighted* words in cherry red. */
const Subtitle: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const y = (1 - easeOut(Math.min(1, f / 6))) * 8;
	const parts = text.split('*');
	return (
		<div style={{position: 'absolute', left: 80, right: 80, bottom: 1920 - 1255, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${y}px)`}}>
			<div
				style={{
					maxWidth: 900,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 52,
					lineHeight: 1.22,
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

const Label: React.FC<{kicker: string; text: string; dur: number}> = ({kicker, text, dur}) => {
	const f = useCurrentFrame();
	const o = Math.min(easeOut(Math.min(1, f / 10)), interpolate(f, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	const k = easeOut(Math.min(1, f / 14));
	return (
		<div style={{position: 'absolute', left: 70, top: 1020, opacity: o, transform: `translateX(${(1 - k) * -26}px)`}}>
			<div style={{borderLeft: `5px solid ${X.cherry}`, background: 'linear-gradient(90deg, rgba(15,61,46,0.82), rgba(15,61,46,0.55))', padding: '14px 30px 14px 24px'}}>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: X.gold}}>{kicker}</div>
				<div style={{fontFamily: DISPLAY, fontSize: 92, lineHeight: 1.02, letterSpacing: '0.03em', color: X.cream, marginTop: 4}}>{text}</div>
			</div>
		</div>
	);
};

const CloseCard: React.FC = () => {
	const f = useCurrentFrame();
	const g = easeOut(Math.min(1, f / 14));
	const t1 = easeOut(Math.min(1, Math.max(0, (f - 6) / 14)));
	const lg = easeOut(Math.min(1, Math.max(0, (f - 20) / 16)));
	const cta = easeOut(Math.min(1, Math.max(0, (f - 32) / 14)));
	const pulse = 1 + 0.03 * Math.max(0, Math.sin(((f - 46) / 15) * Math.PI));
	return (
		<AbsoluteFill>
			{/* pine-green fade from the top — the pajama stays fully visible below */}
			<AbsoluteFill style={{opacity: g, background: 'linear-gradient(180deg, rgba(15,61,46,0.97) 0%, rgba(15,61,46,0.9) 30%, rgba(15,61,46,0) 44%)'}} />
			<div style={{position: 'absolute', top: 285, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{fontFamily: DISPLAY, fontSize: 88, letterSpacing: '0.03em', color: X.cream, opacity: t1, transform: `translateY(${(1 - t1) * 16}px)`, textAlign: 'center', lineHeight: 1}}>
					{edit.close.title}
				</div>
				<div style={{height: 3, width: 220 * lg, background: X.cherry, margin: '16px 0 20px'}} />
				<div style={{opacity: lg, transform: `scale(${0.96 + 0.04 * lg})`}}>
					<Img src={staticFile('brand/reset-logo-white.png')} style={{width: 340}} />
				</div>
				<div
					style={{
						marginTop: 20,
						padding: '16px 36px 14px',
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
			</div>
		</AbsoluteFill>
	);
};

export const XmasAd: React.FC = () => {
	const close = shot('close');
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{shots.map((s) => (
				<Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
					<ShotView s={s} />
				</Sequence>
			))}
			{subs.map((s) => (
				<Sequence key={s.text} from={s.from} durationInFrames={s.to - s.from}>
					<Subtitle text={s.text} dur={s.to - s.from} />
				</Sequence>
			))}
			{edit.labels.map((l) => {
				const a = shot(l.from);
				const b = shot(l.to);
				const dur = b.from + b.frames - a.from;
				return (
					<Sequence key={l.text} from={a.from} durationInFrames={dur}>
						<Label kicker={l.kicker} text={l.text} dur={dur} />
					</Sequence>
				);
			})}
			<Sequence from={close.from}>
				<CloseCard />
			</Sequence>
			<Audio src={staticFile('xmas/mix.wav')} />
		</AbsoluteFill>
	);
};
