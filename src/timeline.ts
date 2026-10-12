// Music is 150 BPM @ 30 fps -> 1 beat = 12 frames, 1 bar = 48 frames.
// Every scene starts on a beat, so every cut lands on the music.
//   bars 0-1  (0-96)    HOOK: "¿QUÉ HAY DENTRO?" + rapid bag montage + build-up
//   bar  2    (96)      DROP: the big reveal
//   bars 2-13 (96-672)  chorus: product scenes
//   bar  14   (672)     final hit on the end card
export const FPS = 30;
export const BEAT = 12;
export const BAR = 4 * BEAT;
export const DROP = 2 * BAR;
export const FINAL_HIT = 14 * BAR;
export const TOTAL_FRAMES = FINAL_HIT + 48;

/** A piece of source footage: [from, to] seconds squeezed/stretched into `frames` (speed ramps). */
export type Segment = {from: number; to: number; frames: number};

export type Enter = 'impact' | 'punch' | 'whip' | 'slideUp' | 'spin';

export type Caption = {
	/** Small line on top (white). */
	top: string;
	/** Big sticker line (gold). Use \n for line breaks. */
	main: string;
	/** Frame (relative to scene start) the caption appears. */
	at?: number;
	/** Frame (relative to scene start) the caption disappears. */
	until?: number;
	/** Big centered reveal with a sunburst behind it. */
	burst?: boolean;
};

export type Scene = {
	id: string;
	src: string;
	start: number;
	segments: Segment[];
	enter: Enter;
	zoom?: 'in' | 'out' | 'rush';
	captions?: Caption[];
};

const seg = (from: number, to: number, frames: number): Segment => ({from, to, frames});

export const scenes: Scene[] = [
	// ---------- HOOK ----------
	{id: 'hook-green', src: 'clips/green-bag.mp4', start: 0, segments: [seg(0.2, 3.2, 48)], enter: 'impact', zoom: 'in'},
	{id: 'hook-white', src: 'clips/white-bag.mp4', start: 48, segments: [seg(1.0, 1.8, 12)], enter: 'punch'},
	{id: 'hook-red', src: 'clips/red-bag.mp4', start: 60, segments: [seg(3.0, 3.8, 12)], enter: 'punch'},
	{id: 'hook-striped', src: 'clips/striped-bag.mp4', start: 72, segments: [seg(3.0, 3.8, 12)], enter: 'punch'},
	{id: 'hook-rush', src: 'clips/green-bag.mp4', start: 84, segments: [seg(2.4, 3.4, 12)], enter: 'punch', zoom: 'rush'},
	// ---------- DROP: the reveal ----------
	{
		id: 'reveal-green',
		src: 'clips/green-unwrap.mp4',
		start: DROP,
		segments: [seg(6.4, 7.9, 12), seg(7.9, 10.1, 84)],
		enter: 'impact',
		zoom: 'out',
		captions: [
			{top: '', main: '¡SORPRESA!', at: 0, until: 46, burst: true},
			{top: '¡son', main: 'PIJAMAS\nNAVIDEÑAS! 🎄', at: 48},
		],
	},
	{
		id: 'reveal-white',
		src: 'clips/white-unwrap.mp4',
		start: DROP + 2 * BAR,
		segments: [seg(0.8, 3.2, 18), seg(3.2, 5.0, 18), seg(5.0, 7.4, 60)],
		enter: 'whip',
		zoom: 'in',
		captions: [{top: 'estampados', main: 'SÚPER\nFESTIVOS ✨', at: 30}],
	},
	{
		id: 'pants',
		src: 'clips/striped-pants.mp4',
		start: DROP + 4 * BAR,
		segments: [seg(0.5, 4.0, 48)],
		enter: 'slideUp',
		zoom: 'out',
		captions: [{top: 'comodidad', main: 'NIVEL: SOFÁ 🛋️'}],
	},
	{
		id: 'pack',
		src: 'clips/striped-bag.mp4',
		start: DROP + 5 * BAR,
		segments: [seg(0.5, 4.5, 48)],
		enter: 'punch',
		zoom: 'in',
		captions: [{top: '...y viene en su', main: 'BOLSITA 🎁'}],
	},
	{
		id: 'ready',
		src: 'clips/red-bag.mp4',
		start: DROP + 6 * BAR,
		segments: [seg(1.0, 4.6, 48)],
		enter: 'spin',
		zoom: 'in',
		captions: [{top: '¡lista para', main: 'REGALAR! 🎀'}],
	},
	{
		id: 'tree',
		src: 'clips/tree-shirt.mp4',
		start: DROP + 7 * BAR,
		segments: [seg(0.3, 2.3, 48)],
		enter: 'slideUp',
		zoom: 'in',
		captions: [{top: 'combina con', main: 'TU ÁRBOL 🎄'}],
	},
	{
		id: 'lineup',
		src: 'clips/gift-lineup.mp4',
		start: DROP + 8 * BAR,
		segments: [seg(1.0, 5.6, 96)],
		enter: 'whip',
		zoom: 'out',
		captions: [
			{top: 'el regalo que', main: 'SÍ VAN\nA USAR 😍', until: 46},
			{top: '', main: '¿CUÁL\nELIGES? 👇', at: 48},
		],
	},
	// ---------- END CARD (background footage; content lives in <EndCard/>) ----------
	{id: 'end', src: 'clips/gift-lineup.mp4', start: DROP + 10 * BAR, segments: [seg(3.5, 6.1, 144)], enter: 'punch', zoom: 'in'},
];

export const sceneDuration = (i: number) => (scenes[i + 1]?.start ?? TOTAL_FRAMES) - scenes[i].start;
export const END_START = scenes[scenes.length - 1].start;
