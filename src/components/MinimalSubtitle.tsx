import {loadFont} from '@remotion/fonts';
import React from 'react';
import {interpolate, staticFile, useCurrentFrame} from 'remotion';

loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});

/**
 * Shared editorial subtitle for every RE:SET ad: one clean sans, white, very soft shadow,
 * whole phrase at once with a short fade, max two lines. No boxes, colours, highlights or bounce.
 * `y` = text baseline position as a fraction of the frame height (default 0.78).
 */
export const MinimalSubtitle: React.FC<{text: string; dur: number; y?: number}> = ({text, dur, y = 0.78}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 3, dur - 3, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', left: 110, right: 110, bottom: 1920 * (1 - y), display: 'flex', justifyContent: 'center', opacity: o}}>
			<div
				style={{
					maxWidth: 860,
					textAlign: 'center',
					fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
					fontWeight: 500,
					fontSize: 38,
					lineHeight: 1.32,
					color: '#fff',
					textShadow: '0 1px 3px rgba(0,0,0,0.6), 0 0 16px rgba(0,0,0,0.3)',
				}}
			>
				{text.replace(/\*/g, '')}
			</div>
		</div>
	);
};

/** Discreet brand sign-off used at the end of every ad. */
export const MinimalSignOff: React.FC<{logo: string; line: string; note?: string; dark?: boolean; at?: 'top' | 'bottom'; y?: number}> = ({logo, line, note, dark, at = 'bottom', y}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
	const color = dark ? '#2B2623' : '#fff';
	const shadow = dark ? 'none' : '0 1px 3px rgba(0,0,0,0.45)';
	return (
		<div style={{position: 'absolute', left: 0, right: 0, ...(at === 'top' ? {top: 1920 * (y ?? 0.1)} : {bottom: 1920 * (y ?? 0.17)}), display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o}}>
			<img src={staticFile(dark ? logo.replace('white', 'black') : logo)} style={{width: 200, filter: dark ? 'none' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))'}} />
			<div style={{marginTop: 14, fontFamily: 'Montserrat, Helvetica, Arial, sans-serif', fontWeight: 500, fontSize: 26, letterSpacing: '0.18em', color, textShadow: shadow}}>{line}</div>
			{note && <div style={{marginTop: 8, fontFamily: 'Montserrat, Helvetica, Arial, sans-serif', fontSize: 16, color, opacity: 0.75, textShadow: shadow}}>{note}</div>}
		</div>
	);
};

/** Short opening line that names the product; small and quiet, top of frame. */
export const MinimalHook: React.FC<{text: string; dur: number}> = ({text, dur}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 4, dur - 6, dur], [0.4, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', top: 230, left: 80, right: 80, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div style={{fontFamily: 'Montserrat, Helvetica, Arial, sans-serif', fontWeight: 500, fontSize: 30, letterSpacing: '0.2em', color: '#fff', textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 0 14px rgba(0,0,0,0.2)'}}>{text}</div>
		</div>
	);
};
