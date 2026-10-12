// Every duration is a multiple of one beat (120 BPM @ 30 fps = 15 frames),
// and every transition is exactly one beat long, so every cut lands on the music.
export const FPS = 30;
export const BEAT = 15;
export const TRANSITION = BEAT;

export type TransitionKind = 'ribbon' | 'whip' | 'slide' | 'clock' | 'wipe' | 'sparkleFade';

export type Caption = {
	script: string;
	main: string;
};

export type ClipScene = {
	kind: 'clip';
	id: string;
	src: string;
	/** Seconds into the (pre-trimmed) clip to start from. */
	from: number;
	playbackRate: number;
	durationInFrames: number;
	caption?: Caption;
	/** Ken Burns direction: zoom in or out over the scene. */
	zoom: 'in' | 'out';
	/** Transition used to enter this scene. */
	enter?: TransitionKind;
};

export type SpecialScene = {
	kind: 'intro' | 'endcard';
	id: string;
	src: string;
	from: number;
	playbackRate: number;
	durationInFrames: number;
	enter?: TransitionKind;
};

export type Scene = ClipScene | SpecialScene;

export const scenes: Scene[] = [
	{kind: 'intro', id: 'hook', src: 'clips/red-bag.mp4', from: 0.3, playbackRate: 1, durationInFrames: 8 * BEAT},
	{
		kind: 'clip',
		id: 'green-bag',
		src: 'clips/green-bag.mp4',
		from: 0,
		playbackRate: 1,
		durationInFrames: 6 * BEAT,
		zoom: 'in',
		enter: 'ribbon',
		caption: {script: 'This Christmas', main: 'Comfort comes\ngift-wrapped'},
	},
	{
		kind: 'clip',
		id: 'green-unwrap',
		src: 'clips/green-unwrap.mp4',
		from: 0.5,
		playbackRate: 1.9,
		durationInFrames: 10 * BEAT,
		zoom: 'out',
		enter: 'whip',
		caption: {script: 'untie the bow', main: 'Unwrap pure\ncoziness'},
	},
	{
		kind: 'clip',
		id: 'white-unwrap',
		src: 'clips/white-unwrap.mp4',
		from: 0.5,
		playbackRate: 2,
		durationInFrames: 9 * BEAT,
		zoom: 'in',
		enter: 'slide',
		caption: {script: 'festive prints', main: 'Made for slow\nholiday mornings'},
	},
	{
		kind: 'clip',
		id: 'striped-pants',
		src: 'clips/striped-pants.mp4',
		from: 0.5,
		playbackRate: 1,
		durationInFrames: 6 * BEAT,
		zoom: 'out',
		enter: 'clock',
		caption: {script: 'fold it', main: 'Soft, easy\nloungewear'},
	},
	{
		kind: 'clip',
		id: 'striped-bag',
		src: 'clips/striped-bag.mp4',
		from: 0.5,
		playbackRate: 4 / 3,
		durationInFrames: 6 * BEAT,
		zoom: 'in',
		enter: 'whip',
		caption: {script: '& pack it', main: 'Every set in its\nown gift bag'},
	},
	{
		kind: 'clip',
		id: 'tree-shirt',
		src: 'clips/tree-shirt.mp4',
		from: 0.3,
		playbackRate: 1,
		durationInFrames: 7 * BEAT,
		zoom: 'in',
		enter: 'wipe',
		caption: {script: 'cozy season', main: 'Nights in\nby the tree'},
	},
	{
		kind: 'clip',
		id: 'gift-lineup',
		src: 'clips/gift-lineup.mp4',
		from: 0.5,
		playbackRate: 1,
		durationInFrames: 10 * BEAT,
		zoom: 'out',
		enter: 'ribbon',
		caption: {script: 'the gift', main: "they'll actually\nwear"},
	},
	{
		kind: 'endcard',
		id: 'endcard',
		src: 'clips/tree-shirt.mp4',
		from: 0,
		playbackRate: 0.5,
		durationInFrames: 10 * BEAT,
		enter: 'sparkleFade',
	},
];

/** Absolute start frame of each scene, accounting for transition overlap. */
export const sceneStarts: number[] = scenes.reduce<number[]>((acc, s, i) => {
	if (i === 0) return [0];
	const prev = scenes[i - 1];
	return [...acc, acc[i - 1] + prev.durationInFrames - TRANSITION];
}, []);

export const TOTAL_FRAMES =
	scenes.reduce((sum, s) => sum + s.durationInFrames, 0) - TRANSITION * (scenes.length - 1);

/** Frames at which a transition begins — used to drop whooshes. */
export const transitionStarts = sceneStarts.slice(1);
