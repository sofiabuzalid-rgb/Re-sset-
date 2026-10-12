import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

type SparkleFadeProps = {glow: string};

/** Cross-dissolve through a warm golden bloom. */
const SparkleFade: React.FC<TransitionPresentationComponentProps<SparkleFadeProps>> = ({
	children,
	presentationDirection,
	presentationProgress: p,
	passedProps,
}) => {
	if (presentationDirection === 'exiting') {
		return <AbsoluteFill>{children}</AbsoluteFill>;
	}
	const bloom = interpolate(p, [0, 0.5, 1], [0, 0.85, 0]);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: p}}>{children}</AbsoluteFill>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 45%, ${passedProps.glow} 0%, rgba(255,220,160,0) 70%)`,
					opacity: bloom,
					mixBlendMode: 'screen',
				}}
			/>
		</AbsoluteFill>
	);
};

export const sparkleFade = (props: SparkleFadeProps): TransitionPresentation<SparkleFadeProps> => ({
	component: SparkleFade,
	props,
});
