import {loadFont} from '@remotion/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import type {Cam, Shot, Tag} from './timeline';
import {END_CARD, H, shots, subtitles, tags, TITLE, TOTAL, voiceRanges, W} from './timeline';

loadFont({family: 'Manrope', url: staticFile('fonts/Manrope-Variable.woff2'), weight: '200 800'});
loadFont({family: 'Oswald', url: staticFile('fonts/Oswald-Variable.woff2'), weight: '200 700'});

const SANS = 'Manrope, Inter, Helvetica, Arial, sans-serif';
const C = {
	ink: '#1E1A17',
	cream: '#F5F1EB',
	paper: '#EFE9E1',
	line: 'rgba(250,246,240,0.92)',
	glass: 'rgba(24,20,18,0.58)',
	taupe: '#8C7B6E',
};
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
const FeatureTag: React.FC<{tag: Tag; shot: Shot}> = ({tag, shot}) => {
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
					padding: '13px 22px 13px 18px',
					borderRadius: 12,
					background: C.glass,
					border: '1.5px solid rgba(255,255,255,0.5)',
					backdropFilter: 'blur(10px)',
					WebkitBackdropFilter: 'blur(10px)',
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: 36,
					letterSpacing: '0.01em',
					color: C.cream,
					whiteSpace: 'nowrap',
				}}
			>
				<span style={{width: 9, height: 9, borderRadius: 2, background: C.cream, opacity: 0.85}} />
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
					background: 'rgba(20,17,15,0.62)',
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: 46,
					lineHeight: 1.25,
					color: '#FFFFFF',
					textAlign: 'center',
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
					padding: '22px 28px 24px',
					borderRadius: 14,
					background: C.glass,
					border: '1.5px solid rgba(255,255,255,0.45)',
					backdropFilter: 'blur(10px)',
					WebkitBackdropFilter: 'blur(10px)',
				}}
			>
				<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.32em', color: 'rgba(245,241,235,0.8)'}}>{TITLE.kicker}</div>
				<div style={{height: 1.5, width: 56, background: 'rgba(245,241,235,0.6)', margin: '14px 0 12px'}} />
				<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 56, letterSpacing: '-0.01em', color: C.cream, lineHeight: 1.1}}>{TITLE.text}</div>
			</div>
		</div>
	);
};

/** Wordmark set in a condensed, widely tracked sans to echo the printed RE:SET logo (replace with the official file). */
const Wordmark: React.FC<{size?: number; color?: string}> = ({size = 84, color = C.ink}) => (
	<div style={{textAlign: 'center', color}}>
		<div style={{fontFamily: 'Oswald, sans-serif', fontWeight: 300, fontSize: size, letterSpacing: '0.42em', marginRight: '-0.42em', lineHeight: 1}}>RE:SET</div>
		<div style={{fontFamily: SANS, fontWeight: 500, fontSize: size * 0.24, letterSpacing: '0.5em', marginRight: '-0.5em', marginTop: size * 0.28, opacity: 0.75}}>
			LOUNGEWEAR
		</div>
	</div>
);

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
					background: `linear-gradient(180deg, rgba(239,233,225,0.96) 0%, rgba(239,233,225,0.9) 16%, rgba(239,233,225,0) 25%)`,
				}}
			/>
			<div style={{position: 'absolute', top: 290, left: 0, right: 0, opacity: k, transform: `translateY(${(1 - k) * 10}px)`}}>
				<Wordmark size={72} />
			</div>
			<div style={{position: 'absolute', top: 1150, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 12}px)`}}>
				<div
					style={{
						padding: '20px 46px 22px',
						borderRadius: 999,
						background: C.paper,
						border: `1.5px solid ${C.ink}`,
						boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
						fontFamily: SANS,
						fontWeight: 600,
						fontSize: 38,
						letterSpacing: '0.03em',
						color: C.ink,
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

			{tags.map((t) => {
				const shot = shots.find((s) => t.from >= s.from && t.from < s.from + s.dur)!;
				return (
					<Sequence key={t.text} from={t.from} durationInFrames={t.to - t.from}>
						<FeatureTag tag={t} shot={shot} />
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
