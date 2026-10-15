import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

// Institutional type is Gotham; Montserrat stands in until the licensed font files are added.
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const INK = '#FBF8F4';
const SHADOW = '0 1px 2px rgba(40,20,20,0.35), 0 2px 18px rgba(40,20,20,0.35)';
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const FPS = edit.fps;

type Shot = (typeof edit.shots)[number] & {from: number; dur: number};
const shots: Shot[] = [];
{
	let t = 0;
	for (const s of edit.shots) {
		const dur = Math.round((s.out - s.in) * FPS);
		shots.push({...s, from: t, dur});
		t += dur;
	}
}
const CUTS_END = shots[shots.length - 1].from + shots[shots.length - 1].dur;
const HOLD = Math.round(edit.holdSeconds * FPS);
export const LOOKBOOK_TOTAL = CUTS_END + HOLD;
const close = shots[shots.length - 1];
const text = (id: string) => {
	const t = edit.texts.find((x) => x.id === id)!;
	return {from: Math.round(t.from * FPS), dur: Math.round((t.to - t.from) * FPS)};
};

/** A barely-there push-in keeps each shot alive without drawing attention to itself. */
const ShotView: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const z = 1 + 0.025 * Easing.inOut(Easing.quad)(Math.min(1, f / s.dur));
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<OffthreadVideo muted src={staticFile(`lookbook/${s.id}.mp4`)} style={{width: '100%', height: '100%', transform: `scale(${z})`, transformOrigin: '50% 45%'}} />
		</AbsoluteFill>
	);
};

/** Last frame of the closing shot, held under the logo; the push continues so it never reads as a freeze. */
const Hold: React.FC = () => {
	const f = useCurrentFrame();
	const z = 1.025 + 0.02 * Easing.out(Easing.quad)(Math.min(1, f / HOLD));
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<Freeze frame={close.dur - 1}>
				<OffthreadVideo muted src={staticFile(`lookbook/${close.id}.mp4`)} style={{width: '100%', height: '100%', transform: `scale(${z})`, transformOrigin: '50% 45%'}} />
			</Freeze>
		</AbsoluteFill>
	);
};

const reveal = (f: number, dur: number, delay = 0, outF = 8) => {
	const k = easeOut(Math.min(1, Math.max(0, (f - delay) / 16)));
	const out = interpolate(f, [dur - outF, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return {opacity: k * out, transform: `translateY(${(1 - k) * 14}px)`, filter: `blur(${(1 - k) * 6}px)`};
};

/** Soft shade at the top so white type reads over the curtain light without a visible box. */
const TopShade: React.FC<{dur: number; hold?: boolean}> = ({dur, hold}) => {
	const f = useCurrentFrame();
	const o = hold ? Math.min(1, f / 12) : interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return <AbsoluteFill style={{opacity: o * 0.55, background: 'linear-gradient(180deg, rgba(35,18,18,0.55) 0%, rgba(35,18,18,0.18) 22%, rgba(35,18,18,0) 34%)'}} />;
};

const HookText: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'absolute', top: 268, left: 0, right: 0, textAlign: 'center', color: INK, textShadow: SHADOW, fontFamily: SANS}}>
			<div style={{fontWeight: 400, fontSize: 38, letterSpacing: '0.42em', paddingLeft: '0.42em', ...reveal(f, dur, 0)}}>YOUR EVERYDAY</div>
			<div style={{fontWeight: 500, fontSize: 112, letterSpacing: '0.14em', paddingLeft: '0.14em', lineHeight: 1.05, marginTop: 10, ...reveal(f, dur, 5)}}>RE:SET</div>
		</div>
	);
};

const LogoClose: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'absolute', top: 285, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...reveal(f, dur + 20, 0, 1)}}>
			<Img src={staticFile('brand/reset-logo-white.png')} style={{width: 330, filter: 'drop-shadow(0 2px 14px rgba(40,20,20,0.35))'}} />
		</div>
	);
};

const Tagline: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				top: 462,
				left: 0,
				right: 0,
				textAlign: 'center',
				fontFamily: SANS,
				fontWeight: 400,
				fontSize: 30,
				letterSpacing: '0.5em',
				paddingLeft: '0.5em',
				color: INK,
				textShadow: SHADOW,
				...reveal(f, dur + 20, 0, 1),
			}}
		>
			TIME TO BE YOU
		</div>
	);
};

export const LookbookAd: React.FC = () => {
	const hook = text('hook');
	const logo = text('logo');
	const tag = text('tagline');
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{shots.map((s) => (
				<Sequence key={s.id} from={s.from} durationInFrames={s.dur}>
					<ShotView s={s} />
				</Sequence>
			))}
			<Sequence from={CUTS_END} durationInFrames={HOLD}>
				<Hold />
			</Sequence>
			{/* gentle vignette, the only finishing layer */}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 48%, rgba(0,0,0,0) 60%, rgba(20,10,10,0.22) 100%)'}} />
			<Sequence from={hook.from} durationInFrames={hook.dur}>
				<TopShade dur={hook.dur} />
				<HookText dur={hook.dur} />
			</Sequence>
			<Sequence from={logo.from} durationInFrames={logo.dur}>
				<TopShade dur={logo.dur} hold />
				<LogoClose dur={logo.dur} />
			</Sequence>
			<Sequence from={tag.from} durationInFrames={tag.dur}>
				<Tagline dur={tag.dur} />
			</Sequence>
			<Audio src={staticFile('lookbook/music.wav')} />
		</AbsoluteFill>
	);
};
