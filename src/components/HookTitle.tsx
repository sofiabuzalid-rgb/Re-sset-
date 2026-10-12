import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {BEAT} from '../timeline';
import {StickerText} from './StickerText';

/**
 * The scroll-stopper: a giant question that slams in on frame 0 and
 * shakes harder and harder as the build-up rises toward the drop.
 */
export const HookTitle: React.FC<{duration: number}> = ({duration}) => {
	const frame = useCurrentFrame();
	const tension = interpolate(frame, [48, duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const amp = 2 + tension * 14;
	const dx = (random(`hx-${frame}`) - 0.5) * amp;
	const dy = (random(`hy-${frame}`) - 0.5) * amp;
	// pulse on each beat during the montage
	const pulse = frame >= 48 ? 1 + 0.08 * Math.exp(-((frame % BEAT) / 3)) : 1;
	const grow = 1 + tension * 0.18;
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 220}}>
			<div style={{transform: `translate(${dx}px, ${dy}px) scale(${pulse * grow}) rotate(-4deg)`}}>
				<StickerText top="¿qué hay" main={'DENTRO? 👀'} size={190} slam stagger={0} />
			</div>
		</AbsoluteFill>
	);
};
