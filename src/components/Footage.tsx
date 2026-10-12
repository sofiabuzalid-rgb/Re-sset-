import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Product footage with a slow Ken Burns move and a warm, festive color grade.
 */
export const Footage: React.FC<{
	src: string;
	from: number;
	playbackRate: number;
	zoom?: 'in' | 'out';
	blur?: number;
	extraFilter?: string;
}> = ({src, from, playbackRate, zoom = 'in', blur = 0, extraFilter = ''}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const progress = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
	const scale = zoom === 'in' ? 1.04 + progress * 0.1 : 1.14 - progress * 0.1;

	return (
		<AbsoluteFill style={{backgroundColor: '#1a0b0b', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${scale})`}}>
				<OffthreadVideo
					muted
					src={staticFile(src)}
					trimBefore={Math.round(from * fps)}
					playbackRate={playbackRate}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						filter: `saturate(1.18) contrast(1.06) brightness(1.03) ${blur ? `blur(${blur}px)` : ''} ${extraFilter}`,
					}}
				/>
			</AbsoluteFill>
			{/* Warm candle-light grade */}
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at 50% 40%, rgba(255,190,120,0.18), rgba(120,20,30,0.22) 75%)',
					mixBlendMode: 'soft-light',
				}}
			/>
		</AbsoluteFill>
	);
};
