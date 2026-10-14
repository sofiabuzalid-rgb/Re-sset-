import vo from './voiceover.json';

/**
 * Output timeline for the "Essential de Botones" ad, driven by the studio voice-over
 * (public/essential/voice.wav, built by scripts/build-essential-voice.py).
 * Phrase times in voiceover.json are seconds in the ORIGINAL voice-over file; the WAV is trimmed
 * at `trimStart`, so output frame = (t - trimStart) * fps. Cuts land a few frames before each phrase.
 */
export const FPS = vo.fps;
export const W = 1080;
export const H = 1920;

type Phrase = (typeof vo.phrases)[number];
const ph = (id: string): Phrase => vo.phrases.find((p) => p.id === id)!;
const out = (t: number) => Math.round((t - vo.trimStart) * FPS);
const pIn = (id: string) => out(ph(id).a);
const pOut = (id: string) => out(ph(id).b);

export const VOICE_END = pOut('cta');
export const END_CARD = VOICE_END + 3;
export const TOTAL = END_CARD + vo.endHold;

/** camera = point of the source frame placed at screen centre, and zoom */
export type Cam = {x: number; y: number; s: number};
export type Shot = {
	id: string;
	from: number;
	dur: number;
	/** first source frame and playback rate */
	src: number;
	rate: number;
	cam: {from: Cam; to: Cam; t0: number; t1: number};
};

const base: Cam = {x: 600, y: 930, s: 1.16};
const CUT = 3; // cut this many frames before the phrase starts

const cuts = {
	cuello: pIn('cuello') - CUT,
	manga: pIn('manga') - CUT,
	jareta: pIn('jareta') - CUT,
	pantalon: pIn('pantalon') - CUT,
	tail: pIn('precio1') - CUT,
};

// last shot: price + CTA + end card as one continuous slowed take (avoids the board turning in the original)
const TAIL_SRC_IN = 412;
const TAIL_SRC_OUT = 558;
const tailDur = TOTAL - cuts.tail;

export const shots: Shot[] = [
	// "Es una belleza esta pijama, es la Essential de Botones" — the full top, slow push
	{id: 'intro', from: 0, dur: cuts.cuello, src: 0, rate: 1, cam: {from: {x: 600, y: 880, s: 1.26}, to: {...base, s: 1.18}, t0: 0, t1: cuts.cuello}},
	// "tiene su cuello V" — push in on the collar as the hand points at it (source 3.3–4.6 s)
	{id: 'cuello', from: cuts.cuello, dur: cuts.manga - cuts.cuello, src: 100, rate: 1, cam: {from: base, to: {x: 575, y: 600, s: 1.6}, t0: 3, t1: 18}},
	// "manga larga" — same take, glide down to the cuff the hand is holding
	{id: 'manga', from: cuts.manga, dur: cuts.jareta - cuts.manga, src: 100 + (cuts.manga - cuts.cuello), rate: 1, cam: {from: {x: 575, y: 600, s: 1.6}, to: {x: 432, y: 1180, s: 1.25}, t0: 0, t1: 10}},
	// "jareta para que te acomode" — the pants, push in on the drawstring (source 7.0–8.6 s)
	{id: 'jareta', from: cuts.jareta, dur: cuts.pantalon - cuts.jareta, src: 211, rate: 1, cam: {from: {x: 560, y: 900, s: 1.16}, to: {x: 545, y: 610, s: 1.45}, t0: 3, t1: 20}},
	// "el pantalón es abierto" — whole leg, hands opening it (source 8.6–10.1 s)
	{id: 'pantalon', from: cuts.pantalon, dur: cuts.tail - cuts.pantalon, src: 258, rate: 1, cam: {from: {x: 560, y: 1060, s: 1.12}, to: {x: 550, y: 1080, s: 1.16}, t0: 0, t1: 40}},
	{
		id: 'tail',
		from: cuts.tail,
		dur: tailDur,
		src: TAIL_SRC_IN,
		rate: (TAIL_SRC_OUT - TAIL_SRC_IN) / tailDur,
		cam: {from: base, to: {x: 590, y: 960, s: 1.12}, t0: tailDur - 70, t1: tailDur - 50},
	},
];

/** Burned-in subtitles: verbatim narration of the voice-over. */
export const subtitles: {text: string; from: number; to: number}[] = vo.phrases.map((p) => ({
	text: p.text,
	from: out(p.a),
	to: Math.max(out(p.b), out(p.a) + 18),
}));
// close tiny gaps so consecutive lines don't flicker
for (let i = 0; i < subtitles.length - 1; i++) {
	const gap = subtitles[i + 1].from - subtitles[i].to;
	if (gap > 0 && gap < 8) subtitles[i].to = subtitles[i + 1].from;
	if (gap < 0) subtitles[i].to = subtitles[i + 1].from;
}

/**
 * Feature tags: only what the narration says, shown while it is said.
 * rect = area of the SOURCE frame to outline (it follows the camera).
 */
export type Tag = {
	text: string;
	from: number;
	to: number;
	/** area of the source frame to outline; omit for a label without frame */
	rect?: [number, number, number, number];
	side: 'above' | 'below';
	/** fixed screen position for the label (when there is no frame) */
	labelAt?: [number, number];
};
export const tags: Tag[] = [
	{text: 'Cuello en V', from: pIn('cuello') + 3, to: cuts.manga - 1, rect: [300, 390, 850, 800], side: 'above'},
	{text: 'Manga larga', from: pIn('manga') + 2, to: cuts.jareta - 1, rect: [10, 1110, 240, 1320], side: 'above'},
	{text: 'Cintura con jareta', from: pIn('jareta') + 6, to: cuts.pantalon - 1, rect: [420, 380, 680, 640], side: 'below'},
	{text: 'Pantalón abierto', from: pIn('pantalon') + 4, to: cuts.tail - 1, side: 'above', labelAt: [600, 860]},
];

/** Product title shown during the hook, until the name has been said. */
export const TITLE = {kicker: 'RE:SET', text: 'Essential de Botones', from: 3, to: cuts.cuello - 1};

/** Frames that contain voice (for music ducking). */
export const voiceRanges = vo.phrases.map((p) => [out(p.a), out(p.b)] as const);
