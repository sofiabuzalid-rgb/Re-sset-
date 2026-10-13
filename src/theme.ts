import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fonts are bundled in public/fonts (SIL Open Font License) so renders work offline.
loadFont({family: 'Playfair Display', url: staticFile('fonts/PlayfairDisplay-Variable.woff2'), weight: '400 900'});
loadFont({family: 'Playfair Display', url: staticFile('fonts/PlayfairDisplay-Italic-Variable.woff2'), weight: '400 900', style: 'italic'});
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});
loadFont({family: 'Cinzel', url: staticFile('fonts/Cinzel-Variable.woff2'), weight: '400 900'});
loadFont({family: 'Great Vibes', url: staticFile('fonts/GreatVibes-Regular.woff2'), weight: '400'});

export const fonts = {
	serif: '"Playfair Display", Georgia, serif',
	sans: 'Montserrat, Helvetica, Arial, sans-serif',
	caps: 'Cinzel, "Playfair Display", serif',
	script: '"Great Vibes", cursive',
};

export const colors = {
	cranberry: '#B3122E',
	cranberryDeep: '#5E0716',
	wine: '#3A040E',
	pine: '#0F3D2E',
	pineDeep: '#06241A',
	cream: '#FFF6EA',
	gold: '#D9B25F',
	goldLight: '#F8E7B0',
	goldDark: '#9C7326',
};

/** Metallic gold foil gradient (use with background-clip: text or as a fill). */
export const goldFoil = (angle = 100, shift = 0) =>
	`linear-gradient(${angle}deg, #9C7326 ${-20 + shift}%, #F8E7B0 ${15 + shift}%, #D9B25F ${35 + shift}%, #FFF4D0 ${50 + shift}%, #B88A35 ${70 + shift}%, #F3D98F ${95 + shift}%)`;
