import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

type WhipProps = Record<string, never>;

/** Punchy zoom-through: outgoing scene rushes toward camera, incoming settles in. */
const Whip: React.FC<TransitionPresentationComponentProps<WhipProps>> = ({
	children,
	presentationDirection,
	presentationProgress: p,
}) => {
	if (presentationDirection === 'exiting') {
		const scale = interpolate(p, [0, 1], [1, 1.9]);
		const blur = interpolate(p, [0, 0.6, 1], [0, 14, 22]);
		const opacity = interpolate(p, [0.35, 0.65], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		return (
			<AbsoluteFill style={{transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity}}>{children}</AbsoluteFill>
		);
	}
	const scale = interpolate(p, [0, 1], [0.7, 1]);
	const blur = interpolate(p, [0, 0.5, 1], [22, 10, 0]);
	const opacity = interpolate(p, [0.3, 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return <AbsoluteFill style={{transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity}}>{children}</AbsoluteFill>;
};

export const whip = (): TransitionPresentation<WhipProps> => ({component: Whip, props: {}});
