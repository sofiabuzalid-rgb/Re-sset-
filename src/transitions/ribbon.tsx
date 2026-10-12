import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';

type RibbonProps = {color: string; stripe: string};

/**
 * A wide gift ribbon sweeps diagonally across the frame; the incoming scene
 * is revealed behind its trailing edge.
 */
const Ribbon: React.FC<TransitionPresentationComponentProps<RibbonProps>> = ({
	children,
	presentationDirection,
	presentationProgress,
	passedProps,
}) => {
	const p = Easing.inOut(Easing.cubic)(presentationProgress);
	// Ribbon center travels from fully off-screen left to fully off-screen right
	const center = interpolate(p, [0, 1], [-70, 170]);
	const band = 70; // ribbon width in % of the rotated frame
	// skewX(-17deg) on a 200%-tall band leans the edge ~27% of the width across the visible frame
	const lean = 27;
	const trailing = center - band / 2 + 5; // +5 keeps the reveal edge tucked under the ribbon

	if (presentationDirection === 'exiting') {
		return <AbsoluteFill>{children}</AbsoluteFill>;
	}

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					clipPath: `polygon(-100% 0%, ${trailing + lean}% 0%, ${trailing - lean}% 100%, -100% 100%)`,
				}}
			>
				{children}
			</AbsoluteFill>
			<AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
				<div
					style={{
						position: 'absolute',
						top: '-50%',
						height: '200%',
						left: `${center - band / 2}%`,
						width: `${band}%`,
						transform: 'skewX(-17deg)',
						background: `linear-gradient(90deg, ${passedProps.color} 0%, ${passedProps.color} 38%, ${passedProps.stripe} 38%, ${passedProps.stripe} 46%, ${passedProps.color} 46%, ${passedProps.color} 54%, ${passedProps.stripe} 54%, ${passedProps.stripe} 62%, ${passedProps.color} 62%)`,
						boxShadow: '0 0 60px rgba(0,0,0,0.45)',
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background: 'linear-gradient(90deg, rgba(0,0,0,0.25), rgba(255,255,255,0.18) 30%, rgba(0,0,0,0) 50%, rgba(255,255,255,0.15) 70%, rgba(0,0,0,0.3))',
						}}
					/>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const ribbon = (props: RibbonProps): TransitionPresentation<RibbonProps> => ({
	component: Ribbon,
	props,
});
