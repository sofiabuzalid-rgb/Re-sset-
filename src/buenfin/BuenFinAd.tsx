import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';
import {MinimalHook, MinimalSignOff, MinimalSubtitle} from '../components/MinimalSubtitle';

loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
loadFont({family: 'Playfair Display', url: staticFile('fonts/PlayfairDisplay-Variable.woff2'), weight: '400 900'});
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
				padding: 10,
				boxShadow: '0 10px 28px rgba(0,0,0,0.12)',
				border: '1px solid rgba(30,27,26,0.08)',
				opacity: Math.min(k, o),
				transform: `translateY(${(1 - k) * 16}px)`,
			}}
		>
			<div style={{width: '100%', height: 230, borderRadius: 8, background: '#fff', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
				<Img src={staticFile(edit.card.image)} style={{height: '100%', objectFit: 'contain'}} />
			</div>
		</div>
	);
};

const win = (o: {a: number; b: number}) => ({from: fr(o.a), dur: fr(o.b) - fr(o.a)});

export const BuenFinAd: React.FC = () => {
	const hook = win(edit.hook);
	const card = win(edit.card);
	const close = fr(edit.close.a);
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{shots.map((s) => (
				<Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
					<ShotView s={s} />
				</Sequence>
			))}
			<Sequence from={hook.from} durationInFrames={hook.dur}>
				<MinimalHook text={edit.hook.text} dur={hook.dur} />
			</Sequence>
			<Sequence from={card.from} durationInFrames={card.dur}>
				<ProductCard dur={card.dur} />
			</Sequence>
			{edit.subtitles.map((s) => (
				<Sequence key={s.text} from={fr(s.a)} durationInFrames={fr(s.b) - fr(s.a)}>
					<MinimalSubtitle text={s.text} dur={fr(s.b) - fr(s.a)} y={(s as {y?: number}).y} />
				</Sequence>
			))}
			<Sequence from={close}>
				<MinimalSignOff logo="brand/reset-logo-white.png" line={edit.close.line} note={edit.close.note} at="top" y={0.12} dark />
			</Sequence>
			<Audio src={staticFile('buenfin/mix.wav')} />
		</AbsoluteFill>
	);
};
