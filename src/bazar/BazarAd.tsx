import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import tl from '../../public/bazar/timeline.json';

// Gotham (Montserrat stands in until licensed files are added) for subtitles and the end card.
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const FPS = 30;

type Shot = {id: string; kind?: string; from: number; frames: number; zoom?: number[]; focus?: number[]};
type Word = {w: string; s: number; e: number};
const shots = tl.shots as unknown as Shot[];
const phrases = tl.phrases as Word[][];
export const BAZAR_TOTAL = tl.total;

const VideoShot: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const z = s.zoom!;
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<OffthreadVideo muted src={staticFile(`bazar/${s.id}.mp4`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z[0] + (z[1] - z[0]) * (f / s.frames)})`, transformOrigin: `${s.focus![0] * 100}% ${s.focus![1] * 100}%`}} />
		</AbsoluteFill>
	);
};

/** 1 s end card: warm blush panel over the softly blurred pajama; clean sans type, official logo, handle. */
const EndCard: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const k = (d: number) => easeOut(Math.min(1, Math.max(0, (f - d) / 8)));
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img src={staticFile('bazar/end.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.15 + 0.03 * (f / s.frames)})`, transformOrigin: '50% 70%', filter: 'blur(14px)'}} />
			<AbsoluteFill style={{background: 'rgba(88,58,56,0.55)'}} />
			<div style={{position: 'absolute', top: 760, left: 110, right: 110, textAlign: 'center', color: '#fff'}}>
				<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 62, lineHeight: 1.22, letterSpacing: '-0.005em', opacity: k(0), transform: `translateY(${(1 - k(0)) * 14}px)`}}>
					Tu nueva parte favorita
					<br />
					de llegar a casa.
				</div>
				<div style={{width: 80, height: 3, background: 'rgba(255,255,255,0.8)', margin: '48px auto 44px', opacity: k(3)}} />
				<div style={{opacity: k(5)}}>
					<Img src={staticFile('brand/reset-logo-white.png')} style={{width: 330}} />
					<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, letterSpacing: '0.08em', marginTop: 18}}>@re.setmx</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** Discreet lower subtitles: one natural phrase at a time, soft fade, no karaoke. */
const Subtitles: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const idx = phrases.findIndex((p, i) => {
		const next = phrases[i + 1];
		return t >= p[0].s - 0.06 && t < Math.min(p[p.length - 1].e + 0.3, next ? next[0].s - 0.03 : Infinity);
	});
	if (idx < 0) return null;
	const p = phrases[idx];
	const k = easeOut(Math.min(1, (t - (p[0].s - 0.06)) / 0.15));
	return (
		<div style={{position: 'absolute', left: 90, right: 90, top: 1300, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 8}px)`}}>
			<div style={{maxWidth: 860, padding: '16px 30px 18px', borderRadius: 18, background: 'rgba(20,16,16,0.58)', textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 46, lineHeight: 1.28, color: '#fff'}}>
				{p.map((w) => w.w).join(' ')}
			</div>
		</div>
	);
};

export const BazarAd: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		{shots.map((s) => (
			<Sequence key={s.id} from={s.from} durationInFrames={s.frames}>
				{s.kind === 'end' ? <EndCard s={s} /> : <VideoShot s={s} />}
			</Sequence>
		))}
		{/* faint warm vignette for the "best find of the weekend" feel */}
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 75% at 50% 45%, rgba(0,0,0,0) 60%, rgba(40,20,10,0.22) 100%)'}} />
		<Subtitles />
		<Audio src={staticFile('bazar/mix.wav')} />
	</AbsoluteFill>
);
