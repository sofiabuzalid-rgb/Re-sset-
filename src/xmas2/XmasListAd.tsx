import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

loadFont({family: 'Bebas Neue', url: staticFile('fonts/BebasNeue-Regular.woff2'), weight: '400'});
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const DISPLAY = '"Bebas Neue", Gotham, Montserrat, sans-serif';
const X = {cherry: '#C8102E', pine: '#0F3D2E', cream: '#F5EFE4', warm: '#FBF7F0', gold: '#D2B377'};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FPS = edit.fps;
const fr = (s: number) => Math.round(s * FPS);
const ramp = (f: number, a: number, d: number) => easeOut(Math.min(1, Math.max(0, (f - a) / d)));

type Shot = (typeof edit.shots)[number] & {from: number; punch?: boolean};
const shots: Shot[] = [];
{
	let t = 0;
	for (const s of edit.shots) {
		shots.push({...s, from: t});
		t += s.frames;
	}
}
export const XMAS_LIST_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;
const shot = (id: string) => shots.find((s) => s.id === id)!;

const vStart: number[] = [];
{
	let o = 0;
	for (const v of edit.voice) {
		vStart.push(o);
		o += fr(v.b - v.a);
	}
}
const at = (v: number, s: number) => vStart[v] + fr(s - edit.voice[v].a);

/** Karaoke chunks: words timed proportionally to their length inside each subtitle line, max 3 words per chunk. */
type Word = {w: string; key: boolean; from: number};
const chunks: {words: Word[]; from: number; to: number; hook: boolean}[] = [];
for (const s of edit.subtitles) {
	const raw = s.text.split(' ');
	let on = false;
	const ws = raw.map((r) => {
		const open = r.startsWith('*');
		const close = r.endsWith('*');
		if (open) on = true;
		const w = {w: r.replace(/\*/g, ''), key: on};
		if (close) on = false;
		return w;
	});
	const a = at(s.v, s.a);
	const b = at(s.v, s.b);
	const total = ws.reduce((n, w) => n + w.w.length + 1, 0);
	let acc = 0;
	const timed: Word[] = ws.map((w) => {
		const from = a + Math.round(((b - a) * acc) / total);
		acc += w.w.length + 1;
		return {...w, from};
	});
	for (let i = 0; i < timed.length; i += 3) {
		const g = timed.slice(i, i + 3);
		const next = timed[i + 3];
		chunks.push({words: g, from: g[0].from, to: next ? next.from : b, hook: Boolean((s as {hook?: boolean}).hook)});
	}
}

const ShotView: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
	const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
	// montage: short zoom punch + 2-frame warm flash on every cut
	const punch = s.punch ? 1 + 0.07 * (1 - ramp(f, 0, 7)) : 1;
	const flash = s.punch ? interpolate(f, [0, 2], [0.55, 0], clamp) : 0;
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<OffthreadVideo
				muted
				src={staticFile(`xmas2/${s.id}.mp4`)}
				style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z * punch})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`}}
			/>
			{flash > 0 ? <AbsoluteFill style={{background: X.warm, opacity: flash}} /> : null}
		</AbsoluteFill>
	);
};

const Karaoke: React.FC<{c: (typeof chunks)[number]}> = ({c}) => {
	const f = useCurrentFrame() + c.from;
	const dur = c.to - c.from;
	const o = interpolate(f - c.from, [0, 2, dur - 2, dur], [0, 1, 1, 0], clamp);
	const size = c.hook ? 118 : 84;
	return (
		<div
			style={{
				position: 'absolute',
				left: 60,
				right: 60,
				...(c.hook ? {top: 700} : {bottom: 1920 - 1250}),
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				columnGap: c.hook ? 0 : 20,
				rowGap: 6,
				opacity: o,
			}}
		>
			{c.words.map((w, i) => {
				const p = ramp(f, w.from, 5);
				const active = f >= w.from;
				return (
					<div key={i} style={{overflow: 'hidden', paddingTop: 14, marginTop: -14}}>
						<div
							style={{
								fontFamily: DISPLAY,
								fontSize: size,
								lineHeight: 1.0,
								letterSpacing: '0.02em',
								color: w.key && active ? X.cream : '#fff',
								background: w.key && active ? X.cherry : c.hook ? 'rgba(15,61,46,0.88)' : 'transparent',
								padding: w.key || c.hook ? '4px 12px 0' : '4px 0 0',
								opacity: active ? 1 : 0.0,
								transform: `translateY(${(1 - p) * 60}%) scale(${0.92 + 0.08 * p})`,
								textShadow: w.key || c.hook ? 'none' : '0 0 3px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.6), 0 6px 26px rgba(0,0,0,0.55)',
								WebkitTextStroke: w.key || c.hook ? '0px' : '2px rgba(15,61,46,0.55)',
								paintOrder: 'stroke fill',
							}}
						>
							{w.w}
						</div>
					</div>
				);
			})}
		</div>
	);
};

/** Paper wish-list card; each item gets a hand-drawn cherry tick when she says the word. */
const WishList: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const L = edit.list;
	const inn = ramp(f, 0, 14);
	const out = interpolate(f, [dur - 8, dur], [1, 0], clamp);
	return (
		<div
			style={{
				position: 'absolute',
				right: 60,
				top: 300,
				width: 470,
				opacity: Math.min(inn, out),
				transform: `translateY(${(1 - inn) * -30}px) rotate(${2 - 0.5 * inn}deg)`,
				transformOrigin: '50% 0%',
			}}
		>
			<div style={{background: X.cream, padding: '26px 34px 24px', boxShadow: '0 18px 40px rgba(0,0,0,0.28)', borderTop: `10px solid ${X.cherry}`}}>
				<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: '0.34em', color: X.gold}}>RE:SET</div>
				<div style={{fontFamily: DISPLAY, fontSize: 56, lineHeight: 1.05, color: X.pine, marginTop: 4, paddingTop: 6}}>{L.title}</div>
				<div style={{height: 2, background: 'rgba(15,61,46,0.25)', margin: '10px 0 14px'}} />
				{L.items.map((it, i) => {
					const t = at(it.v, it.at) - L.from;
					const show = ramp(f, Math.min(t - 18, 6 + i * 6), 10);
					const tick = interpolate(f, [t, t + 8], [0, 1], clamp);
					return (
						<div key={it.text} style={{display: 'flex', alignItems: 'center', gap: 18, height: 64, opacity: 0.35 + 0.65 * show}}>
							<svg width={44} height={44} viewBox="0 0 44 44">
								<rect x={3} y={3} width={38} height={38} rx={6} fill="none" stroke={X.pine} strokeWidth={3} />
								<path d="M10 23 L19 32 L36 9" fill="none" stroke={X.cherry} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - tick)} />
							</svg>
							<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: '0.08em', color: X.pine}}>{it.text}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

const Label: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const o = Math.min(ramp(f, 0, 8), interpolate(f, [dur - 6, dur], [1, 0], clamp));
	const words = edit.label.text.split(' ');
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o}}>
			<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.34em', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>{edit.label.kicker}</div>
			<div style={{display: 'flex', gap: 22, marginTop: 8}}>
				{words.map((w, i) => {
					const p = ramp(f, 4 + i * 4, 10);
					return (
						<div key={i} style={{overflow: 'hidden', paddingTop: 14, marginTop: -14}}>
							<div style={{fontFamily: DISPLAY, fontSize: 112, lineHeight: 1, color: '#fff', background: i === 1 ? X.cherry : 'transparent', padding: i === 1 ? '6px 16px 0' : '6px 0 0', transform: `translateY(${(1 - p) * 105}%)`, textShadow: i === 1 ? 'none' : '0 4px 20px rgba(0,0,0,0.45)'}}>
								{w}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

/** Christmas-card close: the last shot shrinks into a tilted photo on cream paper, logo + title + CTA above it. */
const CloseCard: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const k = ramp(f, 0, 20);
	const W = 1080 + (620 - 1080) * k;
	const Hh = 1920 + (1100 - 1920) * k;
	const left = (1080 - W) / 2;
	const top = 0 + (730 - 0) * k;
	const logo = ramp(f, 14, 16);
	const t1 = ramp(f, 22, 14);
	const cta = ramp(f, 32, 14);
	const pulse = 1 + 0.03 * Math.max(0, Math.sin(((f - 46) / 15) * Math.PI));
	return (
		<AbsoluteFill style={{background: X.cream}}>
			<AbsoluteFill style={{opacity: k, border: `2px solid ${X.gold}`, margin: 34}} />
			<div
				style={{
					position: 'absolute',
					left,
					top,
					width: W,
					height: Hh,
					padding: 16 * k,
					background: '#fff',
					boxShadow: `0 ${24 * k}px ${50 * k}px rgba(15,61,46,${0.3 * k})`,
					transform: `rotate(${-2 * k}deg)`,
				}}
			>
				<div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden'}}>
					<ShotView s={s} />
				</div>
			</div>
			<div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{opacity: logo, transform: `translateY(${(1 - logo) * 12}px)`}}>
					<Img src={staticFile('brand/reset-logo-black.png')} style={{width: 330}} />
				</div>
				<div style={{fontFamily: DISPLAY, fontSize: 74, lineHeight: 1.05, paddingTop: 10, letterSpacing: '0.03em', color: X.pine, marginTop: 14, opacity: t1, transform: `translateY(${(1 - t1) * 12}px)`}}>
					{edit.close.title}
				</div>
				<div
					style={{
						marginTop: 14,
						padding: '16px 36px 14px',
						borderRadius: 999,
						background: X.cherry,
						fontFamily: SANS,
						fontWeight: 700,
						fontSize: 28,
						letterSpacing: '0.14em',
						color: '#fff',
						opacity: cta,
						transform: `translateY(${(1 - cta) * 10}px) scale(${pulse})`,
						boxShadow: '0 10px 24px rgba(200,16,46,0.25)',
					}}
				>
					{edit.close.cta}
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const XmasListAd: React.FC = () => {
	const close = shot('close');
	const la = shot(edit.label.from);
	const lb = shot(edit.label.to);
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{shots
				.filter((s) => s.id !== 'close')
				.map((s) => (
					<Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
						<ShotView s={s} />
					</Sequence>
				))}
			{chunks.map((c, i) => (
				<Sequence key={i} from={c.from} durationInFrames={c.to - c.from}>
					<Karaoke c={c} />
				</Sequence>
			))}
			<Sequence from={edit.list.from} durationInFrames={edit.list.to - edit.list.from}>
				<WishList dur={edit.list.to - edit.list.from} />
			</Sequence>
			<Sequence from={la.from} durationInFrames={lb.from + lb.frames - la.from}>
				<Label dur={lb.from + lb.frames - la.from} />
			</Sequence>
			<Sequence from={close.from} premountFor={10}>
				<CloseCard s={close} />
			</Sequence>
			<Audio src={staticFile('xmas2/mix.wav')} />
		</AbsoluteFill>
	);
};
