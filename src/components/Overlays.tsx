import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
	<AbsoluteFill
		style={{
			pointerEvents: 'none',
			background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(20,0,5,${strength}) 100%)`,
		}}
	/>
);

/** Top scrim so captions stay legible over busy footage. */
export const TopScrim: React.FC<{opacity?: number}> = ({opacity = 1}) => (
	<AbsoluteFill
		style={{
			pointerEvents: 'none',
			opacity,
			background: 'linear-gradient(180deg, rgba(40,4,10,0.72) 0%, rgba(40,4,10,0.35) 30%, rgba(40,4,10,0) 45%)',
		}}
	/>
);

/** Subtle animated film grain for a cozy, filmic texture. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
	const frame = useCurrentFrame();
	const seed = Math.floor(random(`grain-${frame}`) * 1000);
	return (
		<AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'overlay'}}>
			<svg width="100%" height="100%">
				<filter id={`grain-${frame}`}>
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
			</svg>
		</AbsoluteFill>
	);
};
