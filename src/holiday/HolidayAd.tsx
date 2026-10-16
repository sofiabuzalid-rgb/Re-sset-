import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';

// Gotham Book / Bold is the institutional face; Montserrat (400 / 700) stands in until the licensed files are added.
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
const SANS = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
// RE:SET brand palette (brand manual) + the navy measured on the Hanukkah print for the transition.
const P = {white: '#FFFFFF', bone: '#E5E5E3', rose: '#B07E7F', blue: '#7B95AB', lime: '#E2EC95', navy: '#1F2B4A', ink: '#141414'};
const SHADOW = '0 1px 2px rgba(0,0,0,0.35), 0 3px 22px rgba(0,0,0,0.38)';
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const FPS = edit.fps;
const W = 1080;
const H = 1920;
const fr = (s: number) => Math.round(s * FPS);

const PHOTO: Record<string, [number, number]> = {
	red: [1312, 1199],
	green: [1600, 900],
	bear: [1145, 1374],
	bear_detail: [900, 1600],
	bear_rack: [1600, 900],
};

type Raw = (typeof edit.shots)[number];
type Shot = Raw & {from0: number; dur0: number};
const shots: Shot[] = [];
{
	let t = 0;
	for (const s of edit.shots) {
		const d = s.kind === 'video' ? fr((s as {out: number}).out) - fr((s as {in: number}).in) : fr((s as {dur: number}).dur);
		shots.push({...s, from0: t, dur0: d});
		t += d;
	}
}
export const HOLIDAY_TOTAL = shots[shots.length - 1].from0 + shots[shots.length - 1].dur0;
const T = (id: string) => {
	const x = edit.texts.find((k) => k.id === id)!;
	return {from: fr(x.from), dur: fr(x.to) - fr(x.from)};
};
const lerp = (a: number[], b: number[], p: number) => a.map((v, i) => v + (b[i] - v) * p);

// ------------------------------------------------------------------ picture

const VideoShot: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const z = s.zoom as number[];
	const fo = s.focus as number[];
	const k = z[0] + (z[1] - z[0]) * (f / s.dur0);
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<OffthreadVideo muted src={staticFile(`holiday/${s.id}.mp4`)} style={{width: '100%', height: '100%', transform: `scale(${k})`, transformOrigin: `${fo[0] * 100}% ${fo[1] * 100}%`}} />
		</AbsoluteFill>
	);
};

/** Photo as a moving camera: cover-fit, then a keyframed focus point + zoom (always clamped, never shows an edge). */
const Cover: React.FC<{src: string; cam: number[]; blur?: number; dim?: number}> = ({src, cam, blur = 0, dim = 0}) => {
	const [w, h] = PHOTO[src];
	const sc = Math.max(W / w, H / h) * cam[2];
	const dw = w * sc;
	const dh = h * sc;
	const left = Math.min(0, Math.max(W - dw, W / 2 - cam[0] * dw));
	const top = Math.min(0, Math.max(H - dh, H / 2 - cam[1] * dh));
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<Img src={staticFile(`holiday/${src}.jpg`)} style={{position: 'absolute', left, top, width: dw, height: dh, filter: blur ? `blur(${blur}px)` : undefined}} />
			{dim ? <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} /> : null}
		</AbsoluteFill>
	);
};

const PhotoShot: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const p = Easing.inOut(Easing.sin)(Math.min(1, f / s.dur0));
	return <Cover src={s.src as string} cam={lerp(s.from as number[], s.to as number[], p)} />;
};

/** Catalogue composition: the whole photo as a print on a soft, blurred version of itself. */
const CardShot: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const [w, h] = PHOTO[s.src as string];
	const [x0, y0, x1, y1] = s.crop as number[];
	const k = easeOut(Math.min(1, f / 12));
	const cw = 1000;
	const sc = cw / (x1 - x0);
	const ch = (y1 - y0) * sc;
	const z = 1 + 0.05 * (f / s.dur0);
	return (
		<AbsoluteFill>
			<Cover src={s.src as string} cam={[0.5, 0.5, 1.15 + 0.05 * (f / s.dur0)]} blur={38} dim={0.3} />
			<div
				style={{
					position: 'absolute',
					left: (W - cw) / 2,
					top: 1030 - ch / 2,
					width: cw,
					height: ch,
					overflow: 'hidden',
					boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
					opacity: k,
					transform: `translateY(${(1 - k) * 40}px)`,
				}}
			>
				<Img
					src={staticFile(`holiday/${s.src}.jpg`)}
					style={{position: 'absolute', left: -x0 * sc, top: -y0 * sc, width: w * sc, height: h * sc, transform: `scale(${z})`, transformOrigin: `${((x0 + x1) / 2 / w) * 100}% ${((y0 + y1) / 2 / h) * 100}%`}}
				/>
			</div>
		</AbsoluteFill>
	);
};

/** "¿Cuál es tu favorita?": the three designs side by side, landing one per half-beat. */
const Triptych: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const panels: {src: string; cam: number[]; n: string; label: string; c: string}[] = [
		{src: 'red', cam: [0.3, 0.5, 1.0], n: '01', label: 'NAVIDAD', c: P.rose},
		{src: 'green', cam: [0.66, 0.5, 1.0], n: '02', label: 'NAVIDAD', c: P.rose},
		{src: 'bear', cam: [0.5, 0.5, 1.0], n: '03', label: 'HANUKKAH', c: P.blue},
	];
	const gap = 10;
	const pw = (W - gap * 2) / 3;
	return (
		<AbsoluteFill style={{backgroundColor: P.bone}}>
			{panels.map((p, i) => {
				const k = easeOut(Math.min(1, Math.max(0, (f - i * 7) / 14)));
				const [w, h] = PHOTO[p.src];
				const sc = (H / h) * (1.02 + 0.03 * (f / s.dur0));
				const dw = w * sc;
				const left = Math.min(0, Math.max(pw - dw, pw / 2 - p.cam[0] * dw));
				return (
					<div key={p.src} style={{position: 'absolute', top: 0, left: i * (pw + gap), width: pw, height: H, overflow: 'hidden', transform: `translateY(${(1 - k) * 120}%)`}}>
						<Img src={staticFile(`holiday/${p.src}.jpg`)} style={{position: 'absolute', left, top: (H - h * sc) / 2, width: dw, height: h * sc}} />
						<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 900, opacity: k, background: 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0) 100%)'}} />
						<div style={{position: 'absolute', left: 0, right: 0, bottom: 470, textAlign: 'center', fontFamily: SANS, color: P.white, textShadow: SHADOW, opacity: k}}>
							<div style={{fontWeight: 700, fontSize: 64, lineHeight: 1}}>{p.n}</div>
							<div style={{width: 46, height: 4, background: p.c, margin: '14px auto 12px'}} />
							<div style={{fontWeight: 400, fontSize: 24, letterSpacing: '0.3em', paddingLeft: '0.3em'}}>{p.label}</div>
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

const Stripe: React.FC<{w: number; p?: number}> = ({w, p = 1}) => (
	<div style={{display: 'flex', width: w * p, height: 5, margin: '0 auto'}}>
		{[P.rose, P.blue, P.lime].map((c) => (
			<div key={c} style={{flex: 1, background: c}} />
		))}
	</div>
);

/** Close: both collections behind the brand (Christmas left, Hanukkah right), logo + CTA in the safe centre. */
const EndCard: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const p = f / s.dur0;
	const k = (d: number) => easeOut(Math.min(1, Math.max(0, (f - d) / 16)));
	const half = (src: string, cam: number[], side: 'l' | 'r') => {
		const [w, h] = PHOTO[src];
		const sc = (H / h) * cam[2];
		const dw = w * sc;
		const hw = W / 2;
		const left = Math.min(0, Math.max(hw - dw, hw / 2 - cam[0] * dw));
		return (
			<div style={{position: 'absolute', top: 0, left: side === 'l' ? 0 : hw, width: hw, height: H, overflow: 'hidden'}}>
				<Img src={staticFile(`holiday/${src}.jpg`)} style={{position: 'absolute', left, top: (H - h * sc) / 2, width: dw, height: h * sc}} />
			</div>
		);
	};
	return (
		<AbsoluteFill>
			{half('red', [0.32 + 0.04 * p, 0.5, 1.06 + 0.04 * p], 'l')}
			{half('bear', [0.5, 0.5, 1.04 + 0.05 * p], 'r')}
			<div style={{position: 'absolute', top: 0, bottom: 0, left: W / 2 - 1, width: 2, background: 'rgba(255,255,255,0.7)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 34% at 50% 46%, rgba(10,10,14,0.7) 0%, rgba(10,10,14,0.42) 60%, rgba(10,10,14,0.16) 100%)'}} />
			<div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, color: P.white}}>
				<div style={{opacity: k(0), transform: `translateY(${(1 - k(0)) * 20}px)`, fontWeight: 400, fontSize: 30, letterSpacing: '0.42em', paddingLeft: '0.42em', textShadow: SHADOW}}>YOUR HOLIDAY</div>
				<div style={{opacity: k(4), transform: `scale(${0.94 + 0.06 * k(4)})`, marginTop: 26}}>
					<Img src={staticFile('brand/reset-logo-white.png')} style={{width: 560, filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.35))'}} />
				</div>
				<div style={{marginTop: 34}}>
					<Stripe w={220} p={k(10)} />
				</div>
				<div style={{marginTop: 70, opacity: k(16), transform: `translateY(${(1 - k(16)) * 24}px)`}}>
					<span style={{display: 'inline-block', padding: '26px 54px', background: P.white, color: P.ink, fontWeight: 700, fontSize: 34, letterSpacing: '0.16em', paddingLeft: 'calc(54px + 0.16em)'}}>
						DESCUBRE LA COLECCIÓN
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ type

const TopShade: React.FC<{strength?: number}> = ({strength = 1}) => (
	<AbsoluteFill style={{opacity: strength, background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 24%, rgba(0,0,0,0) 38%)'}} />
);

const fadeOut = (f: number, dur: number, n = 6) => interpolate(f, [dur - n, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** A word that lands on the beat: drops in from slight scale + blur, with its colour rule drawing underneath. */
const Word: React.FC<{text: string; at: number; size: number; weight?: number; rule?: string}> = ({text, at, size, weight = 700, rule}) => {
	const f = useCurrentFrame() - at;
	const k = easeOut(Math.min(1, Math.max(0, f / 9)));
	const r = easeOut(Math.min(1, Math.max(0, (f - 4) / 10)));
	return (
		<div style={{display: 'inline-block', margin: '0 0.14em', opacity: k, transform: `scale(${1.18 - 0.18 * k})`, filter: `blur(${(1 - k) * 8}px)`}}>
			<div style={{fontWeight: weight, fontSize: size, lineHeight: 1.04, letterSpacing: '0.02em'}}>{text}</div>
			{rule ? <div style={{height: 7, background: rule, width: `${r * 100}%`, margin: '8px auto 0'}} /> : null}
		</div>
	);
};

const HookQ: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	return (
		<>
			<TopShade />
			<div style={{position: 'absolute', top: 285, left: 40, right: 40, textAlign: 'center', fontFamily: SANS, color: P.white, textShadow: SHADOW, opacity: fadeOut(f, dur, 3)}}>
				<div>
					<Word text="¿NAVIDAD" at={0} size={124} rule={P.rose} />
				</div>
				<div style={{marginTop: 18, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 22}}>
					<Word text="O" at={15} size={124} weight={400} />
					<Word text="HANUKKAH?" at={30} size={124} rule={P.blue} />
				</div>
			</div>
		</>
	);
};

const HookA: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const k = (d: number) => easeOut(Math.min(1, Math.max(0, (f - d) / 10)));
	return (
		<>
			<TopShade />
			<div style={{position: 'absolute', top: 300, left: 40, right: 40, textAlign: 'center', fontFamily: SANS, color: P.white, textShadow: SHADOW, opacity: fadeOut(f, dur, 4)}}>
				<div style={{fontWeight: 400, fontSize: 52, letterSpacing: '0.12em', opacity: k(0), transform: `translateY(${(1 - k(0)) * 26}px)`}}>TENEMOS TU PIJAMA</div>
				<div style={{fontWeight: 700, fontSize: 92, letterSpacing: '0.02em', marginTop: 8, opacity: k(4), transform: `translateY(${(1 - k(4)) * 26}px)`}}>PARA CELEBRAR.</div>
			</div>
		</>
	);
};

/** Collection label: top-left, small and editorial; the accent rule carries the collection colour. */
const CollectionTag: React.FC<{title: string; accent: string; dur: number; sub: string}> = ({title, accent, dur, sub}) => {
	const f = useCurrentFrame();
	const k = easeOut(Math.min(1, f / 14));
	const r = easeOut(Math.min(1, Math.max(0, (f - 6) / 14)));
	return (
		<>
			<TopShade strength={0.85 * fadeOut(f, dur, 8)} />
			<div style={{position: 'absolute', left: 72, top: 290, fontFamily: SANS, color: P.white, textShadow: SHADOW, opacity: k * fadeOut(f, dur, 8), transform: `translateX(${(1 - k) * -30}px)`}}>
				<div style={{fontWeight: 400, fontSize: 26, letterSpacing: '0.42em'}}>RE:SET · {sub}</div>
				<div style={{fontWeight: 700, fontSize: 88, letterSpacing: '0.04em', lineHeight: 1.02, marginTop: 14}}>{title}</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14}}>
					<div style={{width: 90 * r, height: 6, background: accent}} />
					<div style={{fontWeight: 400, fontSize: 32, letterSpacing: '0.5em'}}>COLLECTION</div>
				</div>
			</div>
		</>
	);
};

const TwoLine: React.FC<{a: string; b: string; dur: number; top?: number}> = ({a, b, dur, top = 300}) => {
	const f = useCurrentFrame();
	const k = (d: number) => easeOut(Math.min(1, Math.max(0, (f - d) / 11)));
	return (
		<>
			<TopShade />
			<div style={{position: 'absolute', top, left: 40, right: 40, textAlign: 'center', fontFamily: SANS, color: P.white, textShadow: SHADOW, opacity: fadeOut(f, dur, 5)}}>
				<div style={{fontWeight: 400, fontSize: 52, letterSpacing: '0.12em', opacity: k(0), transform: `translateY(${(1 - k(0)) * 24}px)`}}>{a}</div>
				<div style={{fontWeight: 700, fontSize: 96, letterSpacing: '0.02em', marginTop: 6, opacity: k(4), transform: `translateY(${(1 - k(4)) * 24}px)`}}>{b}</div>
			</div>
		</>
	);
};

/** Christmas → Hanukkah: a navy panel sweeps up through the cut (8 frames each way). */
const NavySweep: React.FC = () => {
	const f = useCurrentFrame();
	const y = interpolate(f, [0, 8, 16], [100, 0, -100], {easing: Easing.inOut(Easing.cubic)});
	return (
		<AbsoluteFill style={{transform: `translateY(${y}%)`}}>
			<AbsoluteFill style={{background: P.navy}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 14, background: P.white, opacity: 0.9}} />
		</AbsoluteFill>
	);
};

export const HolidayAd: React.FC = () => {
	const t = {q: T('hookQ'), a: T('hookA'), x: T('christmas'), h: T('hanukkah'), fav: T('favorite'), find: T('find')};
	const hanuStart = shots.find((s) => s.id === 'k1')!.from0;
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{shots.map((s) => (
				<Sequence key={s.id} from={s.from0} durationInFrames={s.dur0}>
					{s.kind === 'video' ? <VideoShot s={s} /> : null}
					{s.kind === 'photo' ? <PhotoShot s={s} /> : null}
					{s.kind === 'card' ? <CardShot s={s} /> : null}
					{s.kind === 'triptych' ? <Triptych s={s} /> : null}
					{s.kind === 'endcard' ? <EndCard s={s} /> : null}
				</Sequence>
			))}
			<Sequence from={hanuStart - 8} durationInFrames={16}>
				<NavySweep />
			</Sequence>
			<Sequence from={t.q.from} durationInFrames={t.q.dur}>
				<HookQ dur={t.q.dur} />
			</Sequence>
			<Sequence from={t.a.from} durationInFrames={t.a.dur}>
				<HookA dur={t.a.dur} />
			</Sequence>
			<Sequence from={t.x.from} durationInFrames={t.x.dur}>
				<CollectionTag title="CHRISTMAS" sub="HOLIDAY" accent={P.rose} dur={t.x.dur} />
			</Sequence>
			<Sequence from={t.h.from} durationInFrames={t.h.dur}>
				<CollectionTag title="HANUKKAH" sub="HOLIDAY" accent={P.blue} dur={t.h.dur} />
			</Sequence>
			<Sequence from={t.fav.from} durationInFrames={t.fav.dur}>
				<TwoLine a="¿CUÁL ES" b="TU FAVORITA?" dur={t.fav.dur} />
			</Sequence>
			<Sequence from={t.find.from} durationInFrames={t.find.dur}>
				<TwoLine a="ENCUENTRA TU" b="HOLIDAY RE:SET" dur={t.find.dur} />
			</Sequence>
			<Audio src={staticFile('holiday/music.wav')} />
		</AbsoluteFill>
	);
};
