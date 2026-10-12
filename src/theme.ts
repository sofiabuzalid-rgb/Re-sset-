import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fonts are bundled in public/fonts (SIL Open Font License) so renders work offline.
loadFont({family: 'Great Vibes', url: staticFile('fonts/GreatVibes-Regular.woff2'), weight: '400'});
loadFont({family: 'Playfair Display', url: staticFile('fonts/PlayfairDisplay-Variable.woff2'), weight: '400 900'});
loadFont({family: 'Montserrat', url: staticFile('fonts/Montserrat-Variable.woff2'), weight: '100 900'});

export const fonts = {
	script: '"Great Vibes", cursive',
	serif: '"Playfair Display", Georgia, serif',
	sans: 'Montserrat, Helvetica, Arial, sans-serif',
};

export const colors = {
	cranberry: '#B3122E',
	cranberryDeep: '#6E0A1C',
	pine: '#0F3D2E',
	pineDeep: '#08241B',
	cream: '#FFF6EA',
	gold: '#E8C27A',
	goldBright: '#FFE3A3',
};
