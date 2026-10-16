import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';
import subs from '../../public/feel/subs.json';

// Gotham Book / Bold is the institutional face; Montserrat (400 / 700) stands in until the licensed files are added.
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const P = {white: '#FFFFFF', bone: '#E5E5E3', rose: '#B07E7F', blue: '#7B95AB', lime: '#E2EC95', ink: '#141414'};
const SHADOW = '0 1px 2px rgba(0,0,0,0.35), 0 3px 20px rgba(0,0,0,0.35)';
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const FPS = edit.fps;
const fr = (s: number) => Math.round(s * FPS);

type Shot = (typeof edit.shots)[number] & {from0: number; dur0: number};
const shots: Shot[] = [];
{
	let t = 0;
	for (const s of edit.shots) {
		const d = fr(s.out) - fr(s.in);
		shots.push({...s, from0: t, dur0: d});
		t += d;
	}
}
const CUTS = shots[shots.length - 1].from0 + shots[shots.length - 1].dur0;
const END = fr(edit.endcard.seconds);
export const FEEL_TOTAL = CUTS + END;
const colorShots = shots.filter((s) => 'color' in s) as (Shot & {color: {name: string; hex: string}})[];
const COLORS_AT = shots.find((s) => (s as {part?: string}).part === 'colors')!.from0;
const CTA = shots.find((s) => s.id === 'cta')!;

type Word = {w: string; hl: boolean; s: number; e: number};
const phrases = subs.phrases as Word[][];
const allWords = phrases.flat();
const claims = edit.claims.map((c, i) => ({...c, i, at: fr(allWords.find((w) => w.w === c.anchor)!.s)}));

// ------------------------------------------------------------------ picture

const VideoShot: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const k = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * (f / s.dur0);
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<OffthreadVideo muted src={staticFile(`feel/${s.id}.mp4`)} style={{width: '100%', height: '100%', transform: `scale(${k})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`}} />
		</AbsoluteFill>
	);
};

const TopShade: React.FC<{o?: number}> = ({o = 1}) => (
	<AbsoluteFill style={{opacity: o, background: 'linear-gradient(180deg, rgba(0,0,0,0.46) 0%, rgba(0,0,0,0.2) 25%, rgba(0,0,0,0) 40%)'}} />
);
const rise = (f: number, d = 0, n = 12) => {
	const k = easeOut(Math.min(1, Math.max(0, (f - d) / n)));
	return {opacity: k, transform: `translateY(${(1 - k) * 22}px)`};
};

// ------------------------------------------------------------------ type

const Hook: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const out = interpolate(f, [dur - 5, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<>
			<TopShade />
			<div style={{position: 'absolute', top: 290, left: 60, right: 60, textAlign: 'center', fontFamily: SANS, color: P.white, textShadow: SHADOW, opacity: out}}>
				<div style={{fontWeight: 400, fontSize: 54, letterSpacing: '0.1em', ...rise(f, 0)}}>LA DIFERENCIA ESTÁ</div>
				<div style={{fontWeight: 700, fontSize: 104, lineHeight: 1.02, marginTop: 10, ...rise(f, 6)}}>EN CÓMO</div>
				<div style={{fontWeight: 700, fontSize: 104, lineHeight: 1.02, ...rise(f, 11)}}>SE SIENTE.</div>
			</div>
		</>
	);
};

/** Subtitles: the whole phrase is on screen; each word brightens as it is spoken, key words in Bold + brand lime. */
const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const idx = phrases.findIndex((p, i) => {
		const next = phrases[i + 1];
		const end = Math.min(p[p.length - 1].e + 0.35, next ? next[0].s - 0.04 : Infinity);
		return t >= p[0].s - 0.08 && t < end;
	});
	if (idx < 0) return null;
	const p = phrases[idx];
	const k = easeOut(Math.min(1, (t - (p[0].s - 0.08)) / 0.18));
	return (
		<div style={{position: 'absolute', left: 70, right: 70, top: 1300, display: 'flex', justifyContent: 'center'}}>
			<div
				style={{
					maxWidth: 900,
					padding: '18px 30px 20px',
					borderRadius: 20,
					background: 'rgba(16,16,16,0.62)',
					textAlign: 'center',
					fontFamily: SANS,
					fontSize: 46,
					lineHeight: 1.3,
					color: P.white,
					opacity: k,
					transform: `translateY(${(1 - k) * 10}px)`,
				}}
			>
				{p.map((w, i) => {
					const on = t >= w.s - 0.03;
					return (
						<span key={i} style={{fontWeight: w.hl ? 700 : 500, color: w.hl ? P.lime : P.white, opacity: on ? 1 : 0.5}}>
							{w.w}
							{i < p.length - 1 ? ' ' : ''}
						</span>
					);
				})}
			</div>
		</div>
	);
};

/** Material claim (only what she says): top-left, numbered, one at a time. */
const Claim: React.FC<{text: string; i: number; dur: number}> = ({text, i, dur}) => {
	const f = useCurrentFrame();
	const k = easeOut(Math.min(1, f / 12));
	const out = interpolate(f, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<>
			<TopShade o={out} />
			<div style={{position: 'absolute', left: 72, top: 290, fontFamily: SANS, color: P.white, textShadow: SHADOW, opacity: k * out, transform: `translateX(${(1 - k) * -26}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
					<div style={{fontWeight: 700, fontSize: 26, letterSpacing: '0.2em'}}>{String(i + 1).padStart(2, '0')}</div>
					<div style={{width: 60 * k, height: 3, background: P.lime}} />
					<div style={{fontWeight: 400, fontSize: 26, letterSpacing: '0.34em'}}>LA TELA</div>
				</div>
				<div style={{fontWeight: 700, fontSize: text.length > 16 ? 66 : 80, letterSpacing: '0.02em', lineHeight: 1.04, marginTop: 14, maxWidth: 900}}>{text}</div>
			</div>
		</>
	);
};

/** Colour chip: a swatch sampled from the garment itself + the name she says. */
const ColorChip: React.FC<{name: string; hex: string; n: number; dur: number}> = ({name, hex, n, dur}) => {
	const f = useCurrentFrame();
	const k = easeOut(Math.min(1, f / 9));
	return (
		<div style={{position: 'absolute', left: 72, top: 400, display: 'flex', alignItems: 'center', gap: 26, fontFamily: SANS, color: P.white, textShadow: SHADOW}}>
			<div style={{width: 104, height: 104, borderRadius: 52, background: hex, border: '4px solid rgba(255,255,255,0.95)', boxShadow: '0 6px 22px rgba(0,0,0,0.3)', transform: `scale(${0.6 + 0.4 * k})`, opacity: k}} />
			<div style={{opacity: k, transform: `translateX(${(1 - k) * -18}px)`}}>
				<div style={{fontWeight: 700, fontSize: 72, letterSpacing: '0.06em', lineHeight: 1}}>{name}</div>
				<div style={{fontWeight: 400, fontSize: 24, letterSpacing: '0.3em', marginTop: 10}}>{String(n).padStart(2, '0')} / {String(colorShots.length).padStart(2, '0')}</div>
			</div>
		</div>
	);
};

const ColorsHeader: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const out = interpolate(f, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<>
			<TopShade o={out} />
			<div style={{position: 'absolute', left: 72, top: 290, fontFamily: SANS, color: P.white, textShadow: SHADOW, ...rise(f, 0), opacity: out * rise(f, 0).opacity}}>
				<div style={{fontWeight: 400, fontSize: 30, letterSpacing: '0.34em'}}>
					DISPONIBLE EN <span style={{fontWeight: 700}}>{colorShots.length} COLORES</span>
				</div>
				<div style={{display: 'flex', gap: 8, marginTop: 14}}>
					{colorShots.map((c, i) => {
						const lit = f >= c.from0 - COLORS_AT;
						return <div key={c.id} style={{width: 34, height: 6, background: lit ? P.white : 'rgba(255,255,255,0.35)', transition: 'none'}} />;
					})}
				</div>
			</div>
		</>
	);
};

const Question: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	return (
		<>
			<TopShade />
			<div style={{position: 'absolute', top: 300, left: 40, right: 40, textAlign: 'center', fontFamily: SANS, color: P.white, textShadow: SHADOW}}>
				<div style={{fontWeight: 400, fontSize: 54, letterSpacing: '0.12em', ...rise(f, 0)}}>¿CUÁL ES</div>
				<div style={{fontWeight: 700, fontSize: 104, lineHeight: 1.02, marginTop: 6, ...rise(f, 5)}}>TU COLOR?</div>
			</div>
		</>
	);
};

/** Close: the rack with every colour, logo, the eight swatches and the CTA. */
const EndCard: React.FC = () => {
	const f = useCurrentFrame();
	const z = 1.04 + 0.04 * (f / END);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{overflow: 'hidden'}}>
				<Img src={staticFile('feel/rack.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 40% at 50% 47%, rgba(12,12,12,0.66) 0%, rgba(12,12,12,0.4) 60%, rgba(12,12,12,0.2) 100%)'}} />
			<div style={{position: 'absolute', top: 600, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, color: P.white}}>
				<div style={{fontWeight: 400, fontSize: 32, letterSpacing: '0.4em', paddingLeft: '0.4em', textShadow: SHADOW, ...rise(f, 0)}}>ENCUENTRA TU</div>
				<div style={{marginTop: 26, ...rise(f, 4)}}>
					<Img src={staticFile('brand/reset-logo-white.png')} style={{width: 540, filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.35))'}} />
				</div>
				<div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 40}}>
					{colorShots.map((c, i) => {
						const k = easeOut(Math.min(1, Math.max(0, (f - 8 - i * 2) / 10)));
						return <div key={c.id} style={{width: 56, height: 56, borderRadius: 28, background: c.color.hex, border: '3px solid rgba(255,255,255,0.95)', transform: `scale(${k})`}} />;
					})}
				</div>
				<div style={{marginTop: 64, ...rise(f, 20)}}>
					<span style={{display: 'inline-block', padding: '26px 54px', paddingLeft: 'calc(54px + 0.16em)', background: P.white, color: P.ink, fontWeight: 700, fontSize: 34, letterSpacing: '0.16em'}}>
						DESCUBRE LA COLECCIÓN
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const FeelAd: React.FC = () => {
	const hook = shots[0];
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{shots.map((s) => (
				<Sequence key={s.id} from={s.from0} durationInFrames={s.dur0}>
					<VideoShot s={s} />
				</Sequence>
			))}
			<Sequence from={CUTS} durationInFrames={END}>
				<EndCard />
			</Sequence>
			<Sequence from={0} durationInFrames={hook.dur0}>
				<Hook dur={hook.dur0} />
			</Sequence>
			{claims.map((c, i) => {
				const next = claims[i + 1]?.at ?? Math.min(c.at + 75, COLORS_AT - 15);
				return (
					<Sequence key={c.text} from={c.at} durationInFrames={Math.max(20, Math.min(next, c.at + 90) - c.at)}>
						<Claim text={c.text} i={i} dur={Math.max(20, Math.min(next, c.at + 90) - c.at)} />
					</Sequence>
				);
			})}
			<Sequence from={COLORS_AT} durationInFrames={CTA.from0 - COLORS_AT}>
				<ColorsHeader dur={CTA.from0 - COLORS_AT} />
			</Sequence>
			{colorShots.map((c, i) => (
				<Sequence key={c.id} from={c.from0} durationInFrames={c.dur0}>
					<ColorChip name={c.color.name} hex={c.color.hex} n={i + 1} dur={c.dur0} />
				</Sequence>
			))}
			<Sequence from={CTA.from0} durationInFrames={CTA.dur0}>
				<Question dur={CTA.dur0} />
			</Sequence>
			<Subtitles />
			<Audio src={staticFile('feel/mix.wav')} />
		</AbsoluteFill>
	);
};
