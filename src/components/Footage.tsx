import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Segment} from '../timeline';

/**
 * Product footage with speed ramps (each segment plays its own slice of the clip at
 * its own speed), a Ken Burns move and a punchy, warm color grade.
 */
export const Footage: React.FC<{
	src: string;
	segments: Segment[];
	zoom?: 'in' | 'out' | 'rush';
	blur?: number;
	extraFilter?: string;
}> = ({src, segments, zoom = 'in', blur = 0, extraFilter = ''}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const p = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
	const scale = zoom === 'rush' ? 1.05 + Math.pow(p, 2.2) * 0.9 : zoom === 'in' ? 1.04 + p * 0.1 : 1.14 - p * 0.1;

	let offset = 0;
	return (
		<AbsoluteFill style={{backgroundColor: '#1a0b0b', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${scale})`}}>
				{segments.map((s, i) => {
					const from = offset;
					offset += s.frames;
					const isLast = i === segments.length - 1;
					return (
						<Sequence key={i} from={from} durationInFrames={isLast ? Infinity : s.frames} layout="none">
							<OffthreadVideo
								muted
								src={staticFile(src)}
								trimBefore={Math.round(s.from * fps)}
								playbackRate={((s.to - s.from) * fps) / s.frames}
								style={{
									position: 'absolute',
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									filter: `saturate(1.3) contrast(1.1) brightness(1.04) ${blur ? `blur(${blur}px)` : ''} ${extraFilter}`,
								}}
							/>
						</Sequence>
					);
				})}
			</AbsoluteFill>
			{/* warm festive grade */}
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at 50% 40%, rgba(255,190,120,0.2), rgba(140,20,40,0.25) 80%)',
					mixBlendMode: 'soft-light',
				}}
			/>
		</AbsoluteFill>
	);
};
