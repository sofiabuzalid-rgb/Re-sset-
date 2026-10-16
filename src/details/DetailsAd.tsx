import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import tl from '../../public/details/timeline.json';

// Brand type: Gotham (Montserrat stands in until licensed files are added) for subtitles and copy, Bebas Neue (the
// logotype face) for product labels. Miller Text is not in the repo; Playfair Display Italic stands in for the one serif line.
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
loadFont({family: 'Bebas Neue', url: staticFile('fonts/BebasNeue-Regular.woff2'), weight: '400'});
loadFont({family: 'Playfair Display', url: staticFile('fonts/PlayfairDisplay-Italic-Variable.woff2'), weight: '400 900', style: 'italic'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const DISPLAY = '"Bebas Neue", Gotham, Montserrat, sans-serif';
const SERIF = '"Miller Text", "Playfair Display", Georgia, serif';
const P = {white: '#FFFFFF', bone: '#E5E5E3', rose: '#B07E7F', blue: '#7B95AB', lime: '#E2EC95', ink: '#141414'};
const SHADOW = '0 1px 2px rgba(0,0,0,0.35), 0 3px 20px rgba(0,0,0,0.35)';
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const FPS = 30;

type Panel = {src: string; in: number; zoom?: number; focus: number[]; label?: string};
type Shot = {id: string; kind?: string; from: number; frames: number; zoom?: number[]; focus?: number[]; panels?: Panel[]};
type Word = {w: string; hl: boolean; s: number; e: number};
const shots = tl.shots as unknown as Shot[];
const phrases = tl.phrases as Word[][];
export const DETAILS_TOTAL = tl.total;

const rise = (f: number, d = 0, n = 12) => {
	const k = easeOut(Math.min(1, Math.max(0, (f - d) / n)));
	return {opacity: k, transform: `translateY(${(1 - k) * 20}px)`};
};
const TopShade: React.FC<{o?: number}> = ({o = 1}) => (
	<AbsoluteFill style={{opacity: o, background: 'linear-gradient(180deg, rgba(0,0,0,0.46) 0%, rgba(0,0,0,0.18) 25%, rgba(0,0,0,0) 40%)'}} />
);

// ------------------------------------------------------------------ picture

const Clip: React.FC<{name: string; zoom: number; focus: number[]}> = ({name, zoom, focus}) => (
	<OffthreadVideo muted src={staticFile(`details/${name}.mp4`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`}} />
);

const VideoShot: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const z = s.zoom!;
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<Clip name={s.id} zoom={z[0] + (z[1] - z[0]) * (f / s.frames)} focus={s.focus!} />
		</AbsoluteFill>
	);
};

/** Manga corta / manga larga: the two garments side by side, the second sliding in on its word. */
const Split: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: P.bone}}>
			{s.panels!.map((p, i) => {
				const k = easeOut(Math.min(1, Math.max(0, (f - i * 4) / 8)));
				return (
					<div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: i * 545, width: 535, overflow: 'hidden', transform: `translateY(${(1 - k) * (i ? 100 : 0)}%)`}}>
						<Clip name={`${s.id}_${i}`} zoom={p.zoom ?? 1} focus={p.focus} />
						<div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: DISPLAY, fontSize: 64, letterSpacing: '0.06em', color: P.white, textShadow: SHADOW, ...rise(f, 6 + i * 5)}}>
							{p.label}
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/** "¿Cuál es más tu estilo?": the three full sets, landing one after another. */
const Grid: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const pw = (1080 - 20) / 3;
	return (
		<AbsoluteFill style={{backgroundColor: P.bone}}>
			{s.panels!.map((p, i) => {
				const k = easeOut(Math.min(1, Math.max(0, (f - i * 3) / 8)));
				return (
					<div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: i * (pw + 10), width: pw, overflow: 'hidden', transform: `translateY(${(1 - k) * 110}%)`}}>
						<Clip name={`${s.id}_${i}`} zoom={1} focus={p.focus} />
					</div>
				);
			})}
			<TopShade />
			<div style={{position: 'absolute', top: 290, left: 40, right: 40, textAlign: 'center', fontFamily: SANS, color: P.white, textShadow: SHADOW}}>
				<div style={{fontWeight: 400, fontSize: 50, letterSpacing: '0.12em', ...rise(f, 8)}}>¿CUÁL ES MÁS</div>
				<div style={{fontWeight: 700, fontSize: 100, lineHeight: 1.02, marginTop: 6, ...rise(f, 13)}}>TU ESTILO?</div>
			</div>
		</AbsoluteFill>
	);
};

const EndCard: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const z = s.zoom!;
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img src={staticFile(`details/${s.id}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z[0] + (z[1] - z[0]) * (f / s.frames)})`, transformOrigin: `${s.focus![0] * 100}% ${s.focus![1] * 100}%`}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 40% at 50% 44%, rgba(12,12,12,0.6) 0%, rgba(12,12,12,0.36) 60%, rgba(12,12,12,0.16) 100%)'}} />
			<div style={{position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, color: P.white}}>
				<div style={{fontWeight: 400, fontSize: 32, letterSpacing: '0.4em', paddingLeft: '0.4em', textShadow: SHADOW, ...rise(f, 0)}}>DESCUBRE TU</div>
				<div style={{marginTop: 26, ...rise(f, 5)}}>
					<Img src={staticFile('brand/reset-logo-white.png')} style={{width: 560, filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.35))'}} />
				</div>
				<div style={{display: 'flex', justifyContent: 'center', margin: '36px auto 0', width: 220 * easeOut(Math.min(1, Math.max(0, (f - 12) / 14))), height: 5}}>
					{[P.rose, P.blue, P.lime].map((c) => (
						<div key={c} style={{flex: 1, background: c}} />
					))}
				</div>
				<div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 44, marginTop: 34, textShadow: SHADOW, ...rise(f, 18)}}>Your RE:SET, your way.</div>
			</div>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ type

const Intro: React.FC = () => {
	const f = useCurrentFrame();
	const out = interpolate(f, [62, 72], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<>
			<TopShade o={out} />
			<div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', color: P.white, textShadow: SHADOW, opacity: out}}>
				<div style={{fontFamily: SANS, fontWeight: 400, fontSize: 26, letterSpacing: '0.5em', paddingLeft: '0.5em', ...rise(f, 0)}}>RE:SET</div>
				<div style={{fontFamily: DISPLAY, fontSize: 132, letterSpacing: '0.04em', lineHeight: 1, marginTop: 12, ...rise(f, 4)}}>THE DETAILS EDIT</div>
			</div>
		</>
	);
};

/** Product label: Bebas Neue, top-left, a thin lime rule; one at a time, only for features the voice names. */
const Label: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const k = easeOut(Math.min(1, f / 12));
	const out = interpolate(f, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<>
			<TopShade o={out * 0.9} />
			<div style={{position: 'absolute', left: 72, top: 300, color: P.white, textShadow: SHADOW, opacity: k * out, transform: `translateX(${(1 - k) * -24}px)`}}>
				<div style={{width: 70 * k, height: 4, background: P.lime, marginBottom: 16}} />
				<div style={{fontFamily: DISPLAY, fontSize: 84, letterSpacing: '0.05em', lineHeight: 1}}>{text}</div>
			</div>
		</>
	);
};

/** Subtitles: whole phrase, each word brightens as spoken; named features in Bold + brand lime. */
const Subtitles: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const idx = phrases.findIndex((p, i) => {
		const next = phrases[i + 1];
		const end = Math.min(p[p.length - 1].e + 0.35, next ? next[0].s - 0.04 : Infinity);
		return t >= p[0].s - 0.08 && t < end;
	});
	if (idx < 0) return null;
	const p = phrases[idx];
	const k = easeOut(Math.min(1, (t - (p[0].s - 0.08)) / 0.18));
	return (
		<div style={{position: 'absolute', left: 70, right: 70, top: 1310, display: 'flex', justifyContent: 'center'}}>
			<div style={{maxWidth: 900, padding: '18px 30px 20px', borderRadius: 20, background: 'rgba(16,16,16,0.62)', textAlign: 'center', fontFamily: SANS, fontSize: 46, lineHeight: 1.3, color: P.white, opacity: k, transform: `translateY(${(1 - k) * 10}px)`}}>
				{p.map((w, i) => (
					<span key={i} style={{fontWeight: w.hl ? 700 : 500, color: w.hl ? P.lime : P.white, opacity: t >= w.s - 0.03 ? 1 : 0.5}}>
						{w.w}
						{i < p.length - 1 ? ' ' : ''}
					</span>
				))}
			</div>
		</div>
	);
};

export const DetailsAd: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		{shots.map((s) => (
			<Sequence key={s.id} from={s.from} durationInFrames={s.frames}>
				{s.kind === 'split' ? <Split s={s} /> : s.kind === 'grid' ? <Grid s={s} /> : s.kind === 'end' ? <EndCard s={s} /> : <VideoShot s={s} />}
			</Sequence>
		))}
		<Sequence from={0} durationInFrames={72}>
			<Intro />
		</Sequence>
		{tl.labels.map((l) => (
			<Sequence key={l.text} from={l.from} durationInFrames={l.to - l.from}>
				<Label text={l.text} dur={l.to - l.from} />
			</Sequence>
		))}
		<Subtitles />
		<Audio src={staticFile('details/mix.wav')} />
	</AbsoluteFill>
);
