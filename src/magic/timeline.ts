// "The Magic of Christmas — RE:SET Edition"
// Segments are pre-cut by scripts/cut-magic-segments.py (already speed-adjusted, they play at 1x).

export const FPS = 30;
/** Overlap used by the snow-vortex transitions between pajama sets. */
export const VORTEX = 12;

export type Clip = {
	id: string;
	/** Frame offset into the segment file. */
	offset?: number;
	frames: number;
	/** A hard match cut on the motion, or a snow vortex from the previous set. */
	enter: 'cut' | 'vortex';
	/** Gift bag on screen: approximate position (start -> end) for the particle trail. */
	bag?: {x: number; y: number; toX?: number; toY?: number};
	/** The pajama reveal moment (golden shimmer). */
	reveal?: boolean;
};

export const clips: Clip[] = [
	// 1 — red nordic
	{id: 'red-enter', frames: 33, enter: 'cut', bag: {x: 560, y: 1500, toX: 560, toY: 1050}},
	{id: 'red-tie', frames: 38, enter: 'cut', bag: {x: 560, y: 1080}},
	{id: 'red-lift', frames: 29, enter: 'cut', bag: {x: 560, y: 1080, toX: 520, toY: 1650}},
	{id: 'red-reveal', frames: 60, enter: 'vortex', reveal: true},
	// 2 — green gingerbread
	{id: 'green-bag', frames: 36, enter: 'vortex', bag: {x: 520, y: 1150}},
	{id: 'green-open', frames: 39, enter: 'cut', bag: {x: 520, y: 1150, toX: 540, toY: 1000}},
	{id: 'green-reveal', offset: 2, frames: 48, enter: 'cut', reveal: true},
	// 3 — striped teddy
	{id: 'stripe-out', offset: 15, frames: 40, enter: 'vortex', bag: {x: 520, y: 1100}},
	{id: 'stripe-reveal', frames: 58, enter: 'cut', reveal: true},
	// 4 — white
	{id: 'white-enter', offset: 12, frames: 20, enter: 'vortex', bag: {x: 640, y: 1250, toX: 560, toY: 1300}},
	{id: 'white-open', frames: 33, enter: 'cut', bag: {x: 560, y: 1150}},
	{id: 'white-reveal', frames: 54, enter: 'cut', reveal: true},
	// finale — the whole collection
	{id: 'finale-close', frames: 44, enter: 'vortex', reveal: true},
	{id: 'finale-tower', frames: 60, enter: 'cut'},
];

export type Placed = Clip & {start: number};

export const placed: Placed[] = clips.reduce<Placed[]>((acc, c, i) => {
	const prev = acc[i - 1];
	const start = prev ? prev.start + prev.frames - (c.enter === 'vortex' ? VORTEX : 0) : 0;
	return [...acc, {...c, start}];
}, []);

const last = placed[placed.length - 1];
export const TOTAL = last.start + last.frames;

/** music-magic.wav: drop at 4.0 s (frame 120), final chord at bar 17 (frame 510). */
export const MUSIC_TRIM = 120 - placed.find((c) => c.id === 'red-reveal')!.start;
export const FINAL_CHORD = 510 - MUSIC_TRIM;
