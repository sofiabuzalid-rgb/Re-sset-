import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

// Gotham is the institutional face of RE:SET; Montserrat stands in until the licensed files are provided.
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const WHITE_U = '#E5E5E3';

const FPS = edit.fps;
const f = (s: number) => Math.round(s * FPS);

/** Output timeline: cuts are concatenated in order; each keeps its source in/out (lip-sync preserved). */
type Cut = (typeof edit.cuts)[number] & {from: number; dur: number};
const cuts: Cut[] = [];
{
	let t = 0;
	for (const c of edit.cuts) {
		const dur = f(c.out) - f(c.in);
		cuts.push({...c, from: t, dur});
		t += dur;
	}
}
const CUTS_END = cuts[cuts.length - 1].from + cuts[cuts.length - 1].dur;
const LOGO = f(edit.logoSeconds);
export const SOFTWINTER_TOTAL = CUTS_END + LOGO;
const DISSOLVE = 8; // last shot dissolves into the logo card

/** source time (s) of a clip -> output frame, using the cut that contains it */
const toOut = (src: string, s: number) => {
	const c = cuts.find((k) => k.src === src && s >= k.in - 0.001 && s <= k.out + 0.001)!;
	return c.from + f(s) - f(c.in);
};
const subtitles = edit.subtitles.map((s) => ({text: s.text, from: toOut(s.src, s.a), to: toOut(s.src, s.b)}));

const Shot: React.FC<{cut: Cut}> = ({cut}) => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		<OffthreadVideo
			muted
			src={staticFile(`softwinter/${cut.src}.mp4`)}
			trimBefore={f(cut.in)}
			style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${cut.zoom})`, transformOrigin: '50% 38%'}}
		/>
	</AbsoluteFill>
);

const Subtitle: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const fr = useCurrentFrame();
	const o = interpolate(fr, [0, 3, dur - 3, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', left: 90, right: 90, bottom: 1920 - 1270, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div
				style={{
					maxWidth: 880,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: 50,
					lineHeight: 1.24,
					letterSpacing: '0.005em',
					color: '#FFFFFF',
					textShadow: '0 0 2px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.6), 0 3px 14px rgba(0,0,0,0.55)',
					WebkitTextStroke: '2px rgba(0,0,0,0.38)',
					paintOrder: 'stroke fill',
				}}
			>
				{text}
			</div>
		</div>
	);
};

/** Closing card: clean White U background, official logo, soft fade in / fade out. */
const LogoCard: React.FC = () => {
	const fr = useCurrentFrame();
	const bg = interpolate(fr, [0, DISSOLVE], [0, 1], {extrapolateRight: 'clamp'});
	const logo = interpolate(fr, [DISSOLVE - 2, DISSOLVE + 12, LOGO + DISSOLVE - 12, LOGO + DISSOLVE - 1], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill style={{backgroundColor: WHITE_U, opacity: bg, justifyContent: 'center', alignItems: 'center'}}>
			<Img src={staticFile('brand/reset-logo-black.png')} style={{width: 560, opacity: logo, transform: `translateY(${(1 - logo) * 8}px)`}} />
		</AbsoluteFill>
	);
};

export const SoftWinterAd: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		{cuts.map((c, i) => (
			<Sequence key={c.id} from={c.from} durationInFrames={c.dur + (i === cuts.length - 1 ? DISSOLVE : 0)} premountFor={15}>
				<Shot cut={c} />
			</Sequence>
		))}
		{subtitles.map((s) => (
			<Sequence key={s.text} from={s.from} durationInFrames={s.to - s.from}>
				<Subtitle text={s.text} dur={s.to - s.from} />
			</Sequence>
		))}
		<Sequence from={CUTS_END - DISSOLVE}>
			<LogoCard />
		</Sequence>
		<Audio src={staticFile('softwinter/mix.wav')} />
	</AbsoluteFill>
);
