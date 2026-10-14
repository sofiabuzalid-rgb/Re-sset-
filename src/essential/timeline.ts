import edit from './edit.json';

/**
 * Output timeline for the "Essential de Botones" ad.
 * Everything is derived from edit.json (the same cut list used to build voice.wav),
 * so voice, picture, subtitles and feature tags can never drift apart.
 */
export const FPS = edit.fps;
export const W = 1080;
export const H = 1920;

type VoiceSeg = (typeof edit.voice)[number];
const startOf: Record<string, number> = {};
let acc = 0;
for (const s of edit.voice) {
	startOf[s.id] = acc;
	acc += s.b - s.a;
}
export const VOICE_END = acc;
export const END_CARD = VOICE_END; // end card starts when the voice ends
export const TOTAL = VOICE_END + edit.endHold;
const seg = (id: string): VoiceSeg => edit.voice.find((s) => s.id === id)!;
/** output frame for a SOURCE frame inside a voice segment */
const at = (id: string, srcFrame: number) => startOf[id] + (srcFrame - seg(id).a);

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

const voiceShot = (id: string, cam: Shot['cam']): Shot => ({
	id,
	from: startOf[id],
	dur: seg(id).b - seg(id).a,
	src: seg(id).a,
	rate: 1,
	cam,
});

// last shot: price + CTA + end card play as one continuous slow-motion take (J-cut under the voice)
const tailFrom = startOf['precio'];
const tailDur = TOTAL - tailFrom;
const TAIL_SRC_IN = 412;
const TAIL_SRC_OUT = 558;

export const shots: Shot[] = [
	voiceShot('belleza', {from: {x: 600, y: 860, s: 1.24}, to: {x: 600, y: 860, s: 1.28}, t0: 0, t1: 23}),
	voiceShot('nombre', {from: base, to: {...base, s: 1.2}, t0: 0, t1: 62}),
	// cuello: push in on the collar as the hand points at it
	voiceShot('cuello', {from: base, to: {x: 575, y: 600, s: 1.6}, t0: 6, t1: 24}),
	// manga: same take, glide down to the sleeve cuff
	voiceShot('manga', {from: {x: 575, y: 600, s: 1.6}, to: {x: 432, y: 1180, s: 1.25}, t0: 0, t1: 10}),
	// jareta: the pants, push in on the drawstring
	voiceShot('jareta', {from: {x: 560, y: 900, s: 1.16}, to: {x: 545, y: 610, s: 1.45}, t0: 4, t1: 22}),
	// pantalón abierto: whole leg, hands at the opening
	voiceShot('pantalon', {from: {x: 560, y: 1060, s: 1.12}, to: {x: 550, y: 1080, s: 1.16}, t0: 0, t1: 35}),
	{
		id: 'tail',
		from: tailFrom,
		dur: tailDur,
		src: TAIL_SRC_IN,
		rate: (TAIL_SRC_OUT - TAIL_SRC_IN) / tailDur,
		cam: {from: base, to: {x: 590, y: 960, s: 1.12}, t0: tailDur - 70, t1: tailDur - 50},
	},
];

/** Burned-in subtitles: verbatim narration, split into readable lines. */
export const subtitles: {text: string; from: number; to: number}[] = [
	{text: 'Es una belleza.', from: at('belleza', 66), to: at('belleza', 89)},
	{text: 'Esta pijama es la', from: at('nombre', 0), to: at('nombre', 28)},
	{text: 'Essential de Botones.', from: at('nombre', 28), to: at('nombre', 62)},
	{text: 'Tiene su cuello en V,', from: at('cuello', 90), to: at('cuello', 140)},
	{text: 'manga larga,', from: at('manga', 140), to: at('manga', 170)},
	{text: 'jareta para que te acomode.', from: at('jareta', 212), to: at('jareta', 262)},
	{text: 'El pantalón es abierto.', from: at('pantalon', 266), to: at('pantalon', 301)},
	{text: 'Y esta pijama puede ser tuya', from: at('precio', 370), to: at('precio', 417)},
	{text: 'por solo $999 pesos.', from: at('precio', 417), to: at('precio', 476)},
	{text: '¿Qué esperas para llevarte la tuya?', from: at('cta', 481), to: at('cta', 542)},
];

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
	{text: 'Cuello en V', from: at('cuello', 112), to: at('cuello', 139), rect: [300, 390, 850, 800], side: 'above'},
	{text: 'Manga larga', from: at('manga', 144), to: at('manga', 169), rect: [10, 1110, 240, 1320], side: 'above'},
	{text: 'Cintura con jareta', from: at('jareta', 222), to: at('jareta', 261), rect: [420, 380, 680, 640], side: 'below'},
	{text: 'Pantalón abierto', from: at('pantalon', 272), to: at('pantalon', 300), side: 'above', labelAt: [600, 860]},
];

/** Product title shown during the hook. */
export const TITLE = {kicker: 'RE:SET', text: 'Essential de Botones', from: 3, to: startOf['cuello'] - 1};

/** Frames that contain voice (for music ducking). */
export const voiceRanges = edit.voice.map((s) => [startOf[s.id], startOf[s.id] + s.b - s.a] as const);
