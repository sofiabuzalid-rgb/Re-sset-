import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import edit from './edit.json';
import {MinimalHook, MinimalSignOff, MinimalSubtitle} from '../components/MinimalSubtitle';
const FPS = edit.fps;
const fr = (s: number) => Math.round(s * FPS);

type Shot = (typeof edit.shots)[number] & {from: number};
const shots: Shot[] = [];
{
	let t = 0;
	for (const s of edit.shots) {
		shots.push({...s, from: t});
		t += s.frames;
	}
}
export const TRAVEL_TOTAL = shots[shots.length - 1].from + shots[shots.length - 1].frames;
const close = shots.find((s) => s.id === 'close')!;

const ShotView: React.FC<{s: Shot}> = ({s}) => {
	const f = useCurrentFrame();
	const p = Easing.inOut(Easing.quad)(Math.min(1, f / s.frames));
	const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * p;
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<OffthreadVideo muted src={staticFile(`travel/${s.id}.mp4`)} style={{width: '100%', height: '100%', transform: `scale(${z})`, transformOrigin: `${s.focus[0] * 100}% ${s.focus[1] * 100}%`}} />
		</AbsoluteFill>
	);
};

export const TravelBagAd: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		{shots.map((s) => (
			<Sequence key={s.id} from={s.from} durationInFrames={s.frames} premountFor={10}>
				<ShotView s={s} />
			</Sequence>
		))}
		<Sequence from={fr(edit.hook.a)} durationInFrames={fr(edit.hook.b) - fr(edit.hook.a)}>
			<MinimalHook text={edit.hook.text} dur={fr(edit.hook.b) - fr(edit.hook.a)} />
		</Sequence>
		{edit.subtitles.map((s) => (
			<Sequence key={s.text} from={fr(s.a)} durationInFrames={fr(s.b) - fr(s.a)}>
				<MinimalSubtitle text={s.text} dur={fr(s.b) - fr(s.a)} y={(s as {y?: number}).y} />
			</Sequence>
		))}
		<Sequence from={close.from + 6}>
			<MinimalSignOff logo="brand/reset-logo-white.png" line={edit.close.line} note={edit.close.note} at="bottom" y={0.055} dark />
		</Sequence>
		<Audio src={staticFile('travel/mix.wav')} />
	</AbsoluteFill>
);
