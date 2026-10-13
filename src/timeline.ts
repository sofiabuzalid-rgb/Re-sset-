// Music: "Carol of the Bells" in 3/4 at 180 BPM @ 30 fps -> 1 bar = 30 frames (1 s), 1 beat = 10 frames.
//   bars 0-3   (0-120)    HOOK: gift-wrapped screen tears open, "¿Qué hay dentro?" montage, build-up
//   bar  4     (120)      DROP: the reveal
//   bars 4-15  (120-480)  product scenes, one cut per 2 bars
//   bars 16-20 (480-630)  end card, final hit on bar 20 (600)
export const FPS = 30;
export const BEAT = 10;
export const BAR = 30;
export const DROP = 4 * BAR;
export const FINAL_HIT = 20 * BAR;
export const TOTAL_FRAMES = FINAL_HIT + 30;

/** A slice of a clip: [from, to] seconds squeezed/stretched into `frames` (speed ramps). */
export type Segment = {from: number; to: number; frames: number};
export type Footage = {src: string; segments: Segment[]};
export type Enter = 'none' | 'zoom' | 'slideUp' | 'flare';
export type Layout = 'full' | 'triptych' | 'framed';

export type Text = {
	kicker: string;
	/** Gold italic headline; \n = line break. */
	title: string;
	/** Frame (relative to the scene) the text appears / leaves. */
	at?: number;
	until?: number;
	position?: 'top' | 'center';
};

export type Scene = {
	id: string;
	start: number;
	layout: Layout;
	/** One footage for full/framed; three for triptych. */
	footage: Footage[];
	enter: Enter;
	zoom?: 'in' | 'out' | 'rush';
	text?: Text[];
	blur?: number;
};

const s = (from: number, to: number, frames: number): Segment => ({from, to, frames});
const f = (src: string, ...segments: Segment[]): Footage => ({src: `clips/${src}.mp4`, segments});

export const scenes: Scene[] = [
	// ---------- HOOK (under the gift wrap, then a montage on the beat) ----------
	{id: 'hook-green', start: 0, layout: 'full', footage: [f('green-bag', s(0.2, 3.2, 60))], enter: 'none', zoom: 'in'},
	{id: 'hook-white', start: 60, layout: 'full', footage: [f('white-bag', s(1.0, 1.75, 15))], enter: 'zoom'},
	{id: 'hook-red', start: 75, layout: 'full', footage: [f('red-bag', s(3.0, 3.75, 15))], enter: 'zoom'},
	{id: 'hook-striped', start: 90, layout: 'full', footage: [f('striped-bag', s(3.0, 3.75, 15))], enter: 'zoom'},
	{id: 'hook-rush', start: 105, layout: 'full', footage: [f('green-bag', s(2.4, 3.4, 15))], enter: 'zoom', zoom: 'rush'},
	// ---------- DROP ----------
	{
		id: 'reveal-green',
		start: DROP,
		layout: 'full',
		footage: [f('green-unwrap', s(6.4, 7.9, 10), s(7.9, 10.1, 50))],
		enter: 'flare',
		zoom: 'out',
		text: [{kicker: 'Navidad 2026', title: 'Pijamas\nnavideñas', at: 6}],
	},
	{
		id: 'reveal-white',
		start: DROP + 2 * BAR,
		layout: 'full',
		footage: [f('white-unwrap', s(0.8, 3.2, 15), s(3.2, 5.0, 15), s(5.0, 7.4, 30))],
		enter: 'zoom',
		zoom: 'in',
		text: [{kicker: 'Estampados', title: 'que enamoran', at: 20}],
	},
	{
		id: 'triptych',
		start: DROP + 4 * BAR,
		layout: 'triptych',
		footage: [f('green-unwrap', s(8.0, 10.0, 60)), f('white-unwrap', s(5.2, 7.4, 60)), f('red-bag', s(1.0, 3.4, 60))],
		enter: 'none',
		text: [{kicker: 'Déjalo en comentarios', title: '¿Cuál es\ntu favorita?', at: 8, position: 'center'}],
	},
	{
		id: 'framed-pack',
		start: DROP + 6 * BAR,
		layout: 'framed',
		footage: [f('striped-bag', s(0.5, 4.5, 60))],
		enter: 'none',
		text: [{kicker: 'Lista para regalar', title: 'con su propia\nbolsa de regalo', at: 4}],
	},
	{
		id: 'lineup',
		start: DROP + 8 * BAR,
		layout: 'full',
		footage: [f('gift-lineup', s(1.0, 5.0, 60))],
		enter: 'flare',
		zoom: 'out',
		text: [{kicker: 'El regalo que', title: 'sí van a usar', at: 4}],
	},
	{
		id: 'tree',
		start: DROP + 10 * BAR,
		layout: 'full',
		footage: [f('tree-shirt', s(0.3, 2.3, 60))],
		enter: 'slideUp',
		zoom: 'in',
		text: [{kicker: 'Hechas para', title: 'noches de\npelícula', at: 4}],
	},
	// ---------- END CARD background (content in <EndCard/>) ----------
	{id: 'end', start: 16 * BAR, layout: 'full', footage: [f('gift-lineup', s(3.5, 6.1, 150))], enter: 'flare', zoom: 'in', blur: 16},
];

export const sceneDuration = (i: number) => (scenes[i + 1]?.start ?? TOTAL_FRAMES) - scenes[i].start;
export const END_START = scenes[scenes.length - 1].start;
