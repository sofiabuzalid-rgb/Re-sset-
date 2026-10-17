import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import tl from '../../public/bazar/timeline.json';

// Gotham (Montserrat stands in) for subtitles; Playfair Display Italic stands in for Miller Text on the closing line.
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
loadFont({family: 'Playfair Display', url: staticFile('fonts/PlayfairDisplay-Italic-Variable.woff2'), weight: '400 900', style: 'italic'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const SERIF = '"Miller Text", "Playfair Display", Georgia, serif';
const SHADOW = '0 1px 2px rgba(0,0,0,0.35), 0 3px 20px rgba(0,0,0,0.35)';
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

/** 1 s end card over the pink pajama (blurred), soft warm veil, line + logo + handle. */
const EndCard: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const k = (d: number) => easeOut(Math.min(1, Math.max(0, (f - d) / 9)));
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img src={staticFile('bazar/end.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.15 + 0.03 * (f / s.frames)})`, transformOrigin: '50% 70%', filter: 'blur(6px)'}} />
			<AbsoluteFill style={{background: 'rgba(60,35,35,0.38)'}} />
			<div style={{position: 'absolute', top: 700, left: 90, right: 90, textAlign: 'center', color: '#fff', textShadow: SHADOW}}>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 70, lineHeight: 1.2, opacity: k(0), transform: `translateY(${(1 - k(0)) * 16}px)`}}>Tu nueva parte favorita de llegar a casa.</div>
				<div style={{marginTop: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: k(4)}}>
					<Img src={staticFile('brand/reset-logo-white.png')} style={{width: 250}} />
					<span style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, opacity: 0.9}}>·</span>
					<span style={{fontFamily: SANS, fontWeight: 500, fontSize: 38, letterSpacing: '0.04em'}}>@re.setmx</span>
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
		<div style={{position: 'absolute', left: 80, right: 80, top: 1330, textAlign: 'center', opacity: k}}>
			<span style={{fontFamily: SANS, fontWeight: 600, fontSize: 48, lineHeight: 1.3, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.55), 0 4px 24px rgba(0,0,0,0.35)'}}>
				{p.map((w) => w.w).join(' ')}
			</span>
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
