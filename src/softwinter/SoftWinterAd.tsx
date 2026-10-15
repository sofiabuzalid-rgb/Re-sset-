import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit-v3.json';

// Brand: Bebas Neue (logotype face) for headlines, Gotham for text (Montserrat stands in until licensed files are added).
loadFont({family: 'Bebas Neue', url: staticFile('fonts/BebasNeue-Regular.woff2'), weight: '400'});
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const DISPLAY = '"Bebas Neue", Gotham, Montserrat, sans-serif';
const P = {black: '#000000', white: '#E5E5E3', p679: '#B07E7F', p536: '#7B95AB', p386: '#E2EC95'};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const FPS = edit.fps;
const fr = (s: number) => Math.round(s * FPS);

type Seg = (typeof edit.segments)[number] & {from: number; dur: number; zoom?: number; rate?: number};
const segs: Seg[] = [];
{
	let t = 0;
	for (const s of edit.segments) {
		const dur = Math.round((fr(s.out) - fr(s.in)) / ((s as {rate?: number}).rate ?? 1));
		segs.push({...s, from: t, dur});
		t += dur;
	}
}
const seg = (id: string) => segs.find((s) => s.id === id)!;
const CUTS_END = segs[segs.length - 1].from + segs[segs.length - 1].dur;
const END = fr(edit.endCardSeconds);
export const SOFTWINTER_TOTAL = CUTS_END + END;

const toOut = (src: string, s: number) => {
	const c = segs.find((k) => k.src === src && k.part !== 'look' && k.part !== 'recap' && s >= k.in - 0.001 && s <= k.out + 0.001)!;
	return c.from + fr(s) - fr(c.in);
};
const subtitles = edit.subtitles.map((s) => ({text: s.text, from: toOut(s.src, s.a), to: toOut(s.src, s.b)}));

const fadeInOut = (f: number, dur: number, inF = 10, outF = 8) =>
	Math.min(easeOut(Math.min(1, f / inF)), interpolate(f, [dur - outF, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

// ------------------------------------------------------------------ picture

const Shot: React.FC<{s: Seg}> = ({s}) => {
	const f = useCurrentFrame();
	// lookbook shots get a subtle push-in; talk shots keep their framing (alternating zoom hides jump cuts)
	const push = s.part === 'look' || s.part === 'question' ? 1 + 0.04 * (f / s.dur) : 1;
	const z = (s.zoom ?? 1) * push;
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<OffthreadVideo
				muted
				src={staticFile(`softwinter/${s.src}.mp4`)}
				trimBefore={fr(s.in)}
				playbackRate={s.rate ?? 1}
				style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, transformOrigin: '50% 40%'}}
			/>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ type

const Stripe: React.FC<{w: number; p?: number}> = ({w, p = 1}) => (
	<div style={{display: 'flex', width: w * p, height: 5}}>
		{[P.p679, P.p536, P.p386].map((c) => (
			<div key={c} style={{flex: 1, background: c}} />
		))}
	</div>
);

const Subtitle: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', left: 90, right: 90, bottom: 1920 - 1265, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div
				style={{
					maxWidth: 880,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: 50,
					lineHeight: 1.24,
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

/** Editorial route caption: thin frame, Bebas headline, small address line. */
const RouteText: React.FC<{title: string; sub?: string; dur: number}> = ({title, sub, dur}) => {
	const f = useCurrentFrame();
	const o = fadeInOut(f, dur, 12, 10);
	const k = easeOut(Math.min(1, f / 14));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 1035, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - k) * 16}px)`}}>
			<div
				style={{
					padding: '22px 34px 20px',
					border: '1.5px solid rgba(229,229,227,0.85)',
					background: 'rgba(0,0,0,0.42)',
					backdropFilter: 'blur(8px)',
					WebkitBackdropFilter: 'blur(8px)',
					textAlign: 'center',
					minWidth: 560,
				}}
			>
				<div style={{fontFamily: DISPLAY, fontSize: 72, letterSpacing: '0.06em', color: '#fff', lineHeight: 1}}>{title}</div>
				{sub ? (
					<>
						<div style={{display: 'flex', justifyContent: 'center', margin: '14px 0 12px'}}>
							<Stripe w={160} p={k} />
						</div>
						<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: '0.04em', color: P.white}}>{sub}</div>
					</>
				) : null}
			</div>
		</div>
	);
};

/** Lookbook label: top-left, never over the face or the outfit. */
const LookText: React.FC<{kicker: string; title: string; sub: string; dur: number; accent: string}> = ({kicker, title, sub, dur, accent}) => {
	const f = useCurrentFrame();
	const o = fadeInOut(f, dur, 8, 6);
	const k = easeOut(Math.min(1, f / 12));
	return (
		<div style={{position: 'absolute', left: 72, top: 600, opacity: o, transform: `translateX(${(1 - k) * -24}px)`}}>
			<div style={{borderLeft: `4px solid ${accent}`, padding: '6px 0 8px 22px', background: 'linear-gradient(90deg, rgba(0,0,0,0.38), rgba(0,0,0,0))'}}>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.28em', color: P.white}}>{kicker}</div>
				<div style={{fontFamily: DISPLAY, fontSize: 100, letterSpacing: '0.03em', color: '#fff', lineHeight: 1.05, marginTop: 6}}>{title}</div>
				{sub ? <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 32, color: P.white, marginTop: 10}}>{sub}</div> : null}
			</div>
		</div>
	);
};

/** "¿CUÁL ESCOGERÍAS TÚ?" — lands on the downbeat, words rise in on the beat. */
const Question: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const dim = interpolate(f, [0, 8], [0, 0.5], {extrapolateRight: 'clamp'});
	const words = ['¿CUÁL', 'ESCOGERÍAS', 'TÚ?'];
	const sub = easeOut(Math.min(1, Math.max(0, (f - 22) / 12)));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />
			<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 540}}>
				<div style={{textAlign: 'center'}}>
					{words.map((w, i) => {
						const p = easeOut(Math.min(1, Math.max(0, (f - i * 7) / 10)));
						return (
							<div key={w} style={{overflow: 'hidden', paddingTop: 14, marginTop: -14}}>
								<div style={{fontFamily: DISPLAY, fontSize: 160, lineHeight: 1.0, letterSpacing: '0.02em', color: '#fff', transform: `translateY(${(1 - p) * 100}%)`}}>{w}</div>
							</div>
						);
					})}
					<div style={{display: 'flex', justifyContent: 'center', margin: '28px 0 22px'}}>
						<Stripe w={260} p={sub} />
					</div>
					<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: P.white, opacity: sub}}>Descubre Soft Winter en RE:SET.</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** End card: official logo, invitation and confirmed address (logo appears only here). */
const EndCard: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const bg = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
	const o = interpolate(f, [6, 18, dur - 10, dur - 1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{backgroundColor: P.white, opacity: bg, justifyContent: 'center', alignItems: 'center'}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o, transform: `translateY(${(1 - o) * 8}px)`, marginBottom: 120}}>
				<Img src={staticFile('brand/reset-logo-black.png')} style={{width: 540}} />
				<div style={{margin: '34px 0 30px'}}>
					<Stripe w={300} />
				</div>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.06em', color: P.black}}>Te esperamos en RE:SET</div>
				<div style={{fontFamily: SANS, fontWeight: 500, fontSize: 30, color: '#333', marginTop: 14}}>{edit.address}</div>
			</div>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ composition

const ACCENTS = [P.p679, P.p536, P.p386];

export const SoftWinterAd: React.FC = () => {
	const route = edit.routeTexts.map((r, i) => {
		const s = seg(r.seg);
		// "VEN A CONOCER" spans the whole walk (both walk shots); the storefront caption spans the entrance
		const u = seg((r as {until?: string}).until ?? r.seg);
		const until = u.from + u.dur;
		return {key: `r${i}`, from: s.from + 4, dur: until - s.from - 4, title: r.title, sub: r.sub === 'address' ? edit.address : r.sub};
	});
	const looks = edit.lookTexts.map((l, i) => {
		const a = seg(l.segs[0]);
		const b = seg(l.segs[l.segs.length - 1]);
		return {key: `l${i}`, from: a.from, dur: b.from + b.dur - a.from, ...l, accent: ACCENTS[i % 3]};
	});
	const q = segs.find((s) => s.part === 'question')!;
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{segs.map((s) => (
				// the last shot keeps playing under the end-card fade (no black frames)
				<Sequence key={s.id} from={s.from} durationInFrames={s.dur + (s.part === 'question' ? 12 : 0)} premountFor={15}>
					<Shot s={s} />
				</Sequence>
			))}
			{subtitles.map((s) => (
				<Sequence key={s.text} from={s.from} durationInFrames={s.to - s.from}>
					<Subtitle text={s.text} dur={s.to - s.from} />
				</Sequence>
			))}
			{route.map((r) => (
				<Sequence key={r.key} from={r.from} durationInFrames={r.dur}>
					<RouteText title={r.title} sub={r.sub} dur={r.dur} />
				</Sequence>
			))}
			{looks.map((l) => (
				<Sequence key={l.key} from={l.from} durationInFrames={l.dur}>
					<LookText kicker={l.kicker} title={l.title} sub={l.sub} dur={l.dur} accent={l.accent} />
				</Sequence>
			))}
			<Sequence from={q.from} durationInFrames={q.dur + 12}>
				<Question dur={q.dur} />
			</Sequence>
			<Sequence from={CUTS_END} durationInFrames={END}>
				<EndCard dur={END} />
			</Sequence>
			<Audio src={staticFile('softwinter/mix-v3.wav')} />
		</AbsoluteFill>
	);
};
