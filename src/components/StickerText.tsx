import React from 'react';
import {random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';

/** Thick sticker outline + hard drop shadow built from text-shadows (works on emoji too). */
const outline = (w: number, color: string, drop: number) => {
	const shadows: string[] = [];
	for (let a = 0; a < 360; a += 30) {
		const r = (a * Math.PI) / 180;
		shadows.push(`${(Math.cos(r) * w).toFixed(1)}px ${(Math.sin(r) * w).toFixed(1)}px 0 ${color}`);
	}
	shadows.push(`0 ${drop}px 0 ${color}`, `0 ${drop + 6}px 24px rgba(0,0,0,0.45)`);
	return shadows.join(', ');
};

/**
 * Bold, bouncy "sticker" caption: every word springs in (overshoot + tilt) one after another,
 * then keeps a subtle wobble on the beat.
 */
export const StickerText: React.FC<{
	top?: string;
	main: string;
	size?: number;
	delay?: number;
	stagger?: number;
	color?: string;
	seed?: string;
	beat?: number;
	/** Words start visible and slam down from oversized (no pop-in) — for frame-0 hooks. */
	slam?: boolean;
}> = ({top, main, size = 130, delay = 0, stagger = 3, color = colors.sunny, seed = main, beat = 12, slam = false}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	let idx = 0;

	const word = (w: string, fontSize: number, fill: string, key: string) => {
		const i = idx++;
		const local = frame - delay - i * stagger;
		const s = spring({frame: local, fps, config: {damping: 9, stiffness: 220, mass: 0.6}});
		const scale = slam ? 1 + (1 - spring({frame: Math.max(0, local), fps, config: {damping: 10, stiffness: 260}})) * 0.45 : s;
		const tilt = (random(`${seed}-${i}`) - 0.5) * 10;
		const wobble = local > 0 ? Math.sin((local / beat) * Math.PI) * 1.5 : 0;
		return (
			<span
				key={key}
				style={{
					display: 'inline-block',
					margin: `0 ${fontSize * 0.12}px`,
					fontFamily: fonts.fun,
					fontSize,
					lineHeight: 1.05,
					color: fill,
					opacity: local < 0 && !slam ? 0 : 1,
					transform: `scale(${scale}) rotate(${tilt * (1 - Math.min(1, s)) * 3 + tilt * 0.3 + wobble}deg)`,
					textShadow: outline(fontSize * 0.06, colors.outline, fontSize * 0.08),
					paddingTop: fontSize * 0.08,
				}}
			>
				{w}
			</span>
		);
	};

	return (
		<div style={{textAlign: 'center'}}>
			{top ? (
				<div>{top.split(' ').map((w, i) => word(w, size * 0.48, colors.cream, `t${i}`))}</div>
			) : null}
			{(main ? main.split('\n') : []).map((line, li) => (
				<div key={li}>{line.split(' ').map((w, wi) => word(w, size, color, `m${li}-${wi}`))}</div>
			))}
		</div>
	);
};
