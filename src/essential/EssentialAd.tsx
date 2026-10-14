import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import type {Cam, Shot, Tag} from './timeline';
import {END_CARD, H, shots, subtitles, tags, TITLE, TOTAL, voiceRanges, W} from './timeline';

// RE:SET brand manual:
//  - Logotipo: official vector logo (public/brand/reset-logo-*.png, from RESET_LOGOTIPO.pdf) — Bebas Neue + Miller Text
//  - Tipografía institucional: Gotham Book / Bold. Gotham is a commercial font; until the licensed files are added,
//    Montserrat (its closest open equivalent) stands in. To switch, drop Gotham-Book/Bold.woff2 in public/fonts and
//    change INSTITUTIONAL below.
//  - Paleta: Pantone 386 U, 536 U, 679 U, Black U, White U (sRGB approximations).
loadFont({family: 'Bebas Neue', url: staticFile('fonts/BebasNeue-Regular.woff2'), weight: '400'});
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});

const INSTITUTIONAL = 'Gotham, Montserrat, Helvetica, Arial, sans-serif';
const SANS = INSTITUTIONAL;
const DISPLAY = '"Bebas Neue", Gotham, Montserrat, sans-serif';
export const PALETTE = {
	p386: '#E2EC95', // Pantone 386 U — lime
	p536: '#7B95AB', // Pantone 536 U — blue grey
	p679: '#B07E7F', // Pantone 679 U — dusty rose
	black: '#000000', // Pantone Black U
	white: '#E5E5E3', // Pantone White U
};
const C = {
	ink: PALETTE.black,
	cream: PALETTE.white,
	paper: PALETTE.white,
	line: 'rgba(229,229,227,0.95)',
	glass: 'rgba(0,0,0,0.55)',
};
const ACCENTS = [PALETTE.p679, PALETTE.p536, PALETTE.p386];

/** The three brand colours as a thin stripe — the visual signature used under the logo and the title. */
const BrandStripe: React.FC<{width: number; p?: number}> = ({width, p = 1}) => (
	<div style={{display: 'flex', width: width * p, height: 5, overflow: 'hidden'}}>
		{ACCENTS.map((c) => (
			<div key={c} style={{flex: 1, background: c}} />
		))}
	</div>
);

const Logo: React.FC<{variant: 'black' | 'white'; width: number}> = ({variant, width}) => (
	<Img src={staticFile(`brand/reset-logo-${variant}.png`)} style={{width, height: 'auto', display: 'block'}} />
);
const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// ---------------------------------------------------------------- camera

const clampCam = (c: Cam): Cam => {
	const hw = W / 2 / c.s;
	const hh = H / 2 / c.s;
	return {s: c.s, x: Math.min(W - hw, Math.max(hw, c.x)), y: Math.min(H - hh, Math.max(hh, c.y))};
};

const camAt = (shot: Shot, f: number): Cam => {
	const {from, to, t0, t1} = shot.cam;
	const p = ease(Math.min(1, Math.max(0, (f - t0) / Math.max(1, t1 - t0))));
	return clampCam({x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p, s: from.s + (to.s - from.s) * p});
};

/** source px -> screen px for a camera */
const toScreen = (c: Cam, x: number, y: number) => ({x: (x - c.x) * c.s + W / 2, y: (y - c.y) * c.s + H / 2});

const ShotView: React.FC<{shot: Shot; children?: (cam: Cam) => React.ReactNode}> = ({shot, children}) => {
	const f = useCurrentFrame();
	const cam = camAt(shot, f);
	const tx = W / 2 - cam.x * cam.s;
	const ty = H / 2 - cam.y * cam.s;
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${cam.s})`}}>
				<OffthreadVideo
					muted
					src={staticFile('essential/source.mp4')}
					trimBefore={shot.src}
					playbackRate={shot.rate}
					style={{width: W, height: H, display: 'block'}}
				/>
			</div>
			{children?.(cam)}
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- graphics

/** Thin rectangular focus frame around a detail + its label. Follows the camera. */
const FeatureTag: React.FC<{tag: Tag; shot: Shot; accent: string}> = ({tag, shot, accent}) => {
	const f = useCurrentFrame(); // relative to tag start
	const dur = tag.to - tag.from;
	const cam = camAt(shot, tag.from - shot.from + f);
	const r = tag.rect ?? [0, 0, 0, 0];
	const a = toScreen(cam, r[0], r[1]);
	const b = toScreen(cam, r[2], r[3]);
	const inP = easeOut(Math.min(1, f / 9));
	const outP = ease(Math.min(1, Math.max(0, (f - (dur - 6)) / 6)));
	const vis = inP * (1 - outP);
	const pad = 8 + (1 - inP) * 18; // frame settles onto the detail
	const left = a.x - pad;
	const top = a.y - pad;
	const width = b.x - a.x + pad * 2;
	const height = b.y - a.y + pad * 2;
	const labelY = tag.labelAt ? tag.labelAt[1] : tag.side === 'above' ? top - 74 : top + height + 18;
	const labelX = tag.labelAt ? tag.labelAt[0] : Math.min(Math.max(left, 64), W - 64 - 420);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{tag.rect ? (
			<div
				style={{
					position: 'absolute',
					left,
					top,
					width,
					height,
					border: `2px solid ${C.line}`,
					borderRadius: 6,
					boxShadow: '0 0 0 1px rgba(0,0,0,0.12), 0 2px 16px rgba(0,0,0,0.18)',
					opacity: vis,
				}}
			/>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: labelX,
					top: labelY + (1 - inP) * (tag.side === 'above' ? 10 : -10),
					opacity: vis,
					display: 'inline-flex',
					alignItems: 'center',
					gap: 14,
					padding: '10px 24px 8px 18px',
					borderRadius: 10,
					background: C.glass,
					border: '1.5px solid rgba(229,229,227,0.55)',
					backdropFilter: 'blur(10px)',
					WebkitBackdropFilter: 'blur(10px)',
					fontFamily: DISPLAY,
					fontWeight: 400,
					fontSize: 46,
					lineHeight: 1,
					letterSpacing: '0.08em',
					color: C.cream,
					whiteSpace: 'nowrap',
				}}
			>
				<span style={{width: 12, height: 12, borderRadius: 2, background: accent, marginTop: -4}} />
				{tag.text}
			</div>
		</AbsoluteFill>
	);
};

const Subtitle: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 3, dur - 2, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', left: 60, right: 60, bottom: H - 1235, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div
				style={{
					maxWidth: 880,
					padding: '12px 22px 14px',
					borderRadius: 12,
					background: 'rgba(0,0,0,0.6)',
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 44,
					lineHeight: 1.25,
					color: '#FFFFFF',
					textAlign: 'center',
					letterSpacing: '0.01em',
				}}
			>
				{text}
			</div>
		</div>
	);
};

const ProductTitle: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const inP = easeOut(Math.min(1, f / 12));
	const outP = ease(Math.min(1, Math.max(0, (f - (dur - 8)) / 8)));
	return (
		<div style={{position: 'absolute', left: 64, top: 300, opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 14}px)`}}>
			<div
				style={{
					display: 'inline-block',
					padding: '26px 30px 24px',
					borderRadius: 12,
					background: C.glass,
					border: '1.5px solid rgba(229,229,227,0.45)',
					backdropFilter: 'blur(10px)',
					WebkitBackdropFilter: 'blur(10px)',
				}}
			>
				<Logo variant="white" width={230} />
				<div style={{margin: '18px 0 16px'}}>
					<BrandStripe width={230} p={inP} />
				</div>
				<div style={{fontFamily: DISPLAY, fontSize: 76, letterSpacing: '0.05em', color: C.cream, lineHeight: 0.95}}>{TITLE.text}</div>
			</div>
		</div>
	);
};

/** End card: the full product stays on screen; wordmark on a soft paper fade at the top, CTA over the product (inside the Reels safe zone). */
const EndCard: React.FC = () => {
	const f = useCurrentFrame(); // relative to END_CARD
	const p = easeOut(Math.min(1, f / 14));
	const k = easeOut(Math.min(1, Math.max(0, (f - 6) / 14)));
	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					opacity: p,
					background: `linear-gradient(180deg, rgba(229,229,227,0.97) 0%, rgba(229,229,227,0.92) 17%, rgba(229,229,227,0) 26%)`,
				}}
			/>
			<div style={{position: 'absolute', top: 278, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: k, transform: `translateY(${(1 - k) * 10}px)`}}>
				<Logo variant="black" width={360} />
				<BrandStripe width={360} p={k} />
			</div>
			<div style={{position: 'absolute', top: 1150, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 12}px)`}}>
				<div
					style={{
						padding: '22px 48px 22px',
						borderRadius: 999,
						background: PALETTE.black,
						boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
						fontFamily: SANS,
						fontWeight: 700,
						fontSize: 34,
						letterSpacing: '0.12em',
						textTransform: 'uppercase',
						color: PALETTE.white,
					}}
				>
					Descubre la colección
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- composition

export type EssentialAdProps = {
	/** Licensed music file inside /public (e.g. "audio/licensed-track.mp3"). Empty = no music. */
	musicSrc: string;
	/** Music level under the voice (ducked) and in pauses. */
	musicUnderVoice: number;
	musicInGaps: number;
};

export const essentialDefaults: EssentialAdProps = {musicSrc: '', musicUnderVoice: 0.12, musicInGaps: 0.28};

const musicVolume = (f: number, under: number, gaps: number) => {
	const inVoice = voiceRanges.some(([a, b]) => f >= a - 4 && f < b + 4);
	const fadeIn = Math.min(1, f / 10);
	const fadeOut = Math.min(1, (TOTAL - f) / 20);
	return (inVoice ? under : gaps) * fadeIn * fadeOut;
};

export const EssentialAd: React.FC<EssentialAdProps> = ({musicSrc, musicUnderVoice, musicInGaps}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{shots.map((shot) => (
				<Sequence key={shot.id} from={shot.from} durationInFrames={shot.dur} premountFor={15}>
					<ShotView shot={shot} />
				</Sequence>
			))}

			<Sequence from={TITLE.from} durationInFrames={TITLE.to - TITLE.from}>
				<ProductTitle dur={TITLE.to - TITLE.from} />
			</Sequence>

			{tags.map((t, i) => {
				const shot = shots.find((s) => t.from >= s.from && t.from < s.from + s.dur)!;
				return (
					<Sequence key={t.text} from={t.from} durationInFrames={t.to - t.from}>
						<FeatureTag tag={t} shot={shot} accent={ACCENTS[i % ACCENTS.length]} />
					</Sequence>
				);
			})}

			{subtitles.map((s) => (
				<Sequence key={s.text} from={s.from} durationInFrames={s.to - s.from}>
					<Subtitle text={s.text} dur={s.to - s.from} />
				</Sequence>
			))}

			<Sequence from={END_CARD}>
				<EndCard />
			</Sequence>

			{/* AUDIO: original voice (cleaned + levelled) and an optional licensed music bed, ducked under the voice */}
			<Audio src={staticFile('essential/voice.wav')} />
			{musicSrc ? <Audio src={staticFile(musicSrc)} volume={(f) => musicVolume(f, musicUnderVoice, musicInGaps)} /> : null}
		</AbsoluteFill>
	);
};

export const ESSENTIAL_TOTAL = TOTAL;
