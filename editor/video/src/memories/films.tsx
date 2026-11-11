// RE:SET · THE MEMORIES WE WEAR — the two cuts. Frames are tied to the music (editor/memories/music.py):
// 01 at 90 BPM, one bar = 80 frames; 02 is a 72 BPM waltz, one bar = 75 frames. Every world change lands on a downbeat.
import React from "react";
import { Big, Block, Caps, CELL, Film, Italic, Label, Logo, MemoriesFilm, Product, TEXT_TOP } from "./Memories";

const INK = "#2A1F1A";
const WINE = "#6E1F1F";
const PINE = "#23402F";

// ---------------------------------------------------------------- 01 · LOS RECUERDOS QUE VAS A CREAR (18.7 s)
const Text01: React.FC = () => (
  <>
    <Block a={0} b={78} w={CELL}>
      <Big>PIJAMAS</Big>
      <Caps mt={16}>PARA LOS MOMENTOS<br />QUE IMPORTAN.</Caps>
      <Label mt={22}>RE:SET CHRISTMAS</Label>
    </Block>
    <Block a={84} b={158}><Italic>Las cenas en familia.</Italic></Block>
    <Block a={164} b={238}><Italic>Decorar el árbol juntos.</Italic></Block>
    <Block a={244} b={318}><Italic>Los recuerdos que se quedan.</Italic></Block>
    <Block a={324} b={398}><Italic>La magia de diciembre.</Italic></Block>
    <Block a={408} b={561} w={CELL}>
      <Big c={INK} size={56}>NO SON SOLO<br />PIJAMAS.</Big>
    </Block>
    <Block a={480} b={561} top={TEXT_TOP + 142} w={CELL}>
      <Caps c={WINE} size={40}>SON MOMENTOS</Caps>
      <Logo w={250} mt={12} />
    </Block>
    <Block a={496} b={561} top={TEXT_TOP + 318} w={CELL}>
      <Italic c={INK} size={42}>Descubre la colección navideña.</Italic>
    </Block>
  </>
);

export const FILM01: Film = {
  frames: 560,
  music: "music01",
  wallAt: 400,
  wallXf: 0,
  seamColor: WINE,
  leaks: [80, 160, 240, 320],
  bgs: [
    { img: "bg_bokeh", from: 0, len: 80 },
    { img: "bg_cena", from: 80, len: 80, xf: 8 },
    { img: "bg_decorar", from: 160, len: 80, xf: 8, fx: 0.55 },
    { img: "bg_baile", from: 240, len: 40, xf: 8, fx: 0.45 },
    { img: "bg_foto", from: 280, len: 40, fx: 0.5 },
    { img: "bg_calle", from: 320, len: 40, xf: 8, fx: 0.5 },
    // burst: one world per eighth note, the reference's signature
    { img: "bg_pasillo", from: 360, len: 10 },
    { img: "bg_escalera", from: 370, len: 10 },
    { img: "bg_nina", from: 380, len: 10, fx: 0.6 },
    { img: "bg_bokeh", from: 390, len: 10 },
  ],
  text: Text01,
};

// ---------------------------------------------------------------- 02 · UNA PIJAMA, MIL RECUERDOS (16 s)
const Text02: React.FC = () => (
  <>
    <Block a={0} b={72} w={CELL}>
      <Caps size={38}>¿Y SI ESTA</Caps>
      <Big>PIJAMA</Big>
      <Caps size={38} mt={12}>SE CONVIERTE<br />EN UN RECUERDO?</Caps>
    </Block>
    <Block a={384} b={481} w={CELL}>
      <Big c={INK} size={76}>PIJAMAS</Big>
      <Logo w={280} mt={18} />
    </Block>
    <Block a={408} b={481} top={TEXT_TOP + 236} w={CELL}>
      <Caps c={PINE} size={30}>HECHAS PARA COMPARTIR<br />MOMENTOS.</Caps>
    </Block>
  </>
);

export const FILM02: Film = {
  frames: 480,
  music: "music02",
  wallAt: 375,
  wallXf: 24,
  seamColor: PINE,
  leaks: [],
  bgs: [
    { img: "bg_nina", from: 0, len: 75, fx: 0.62 },
    { img: "bg_decorar", from: 75, len: 75, xf: 22, fx: 0.55 },
    { img: "bg_cena", from: 150, len: 75, xf: 22 },
    { img: "bg_escalera", from: 225, len: 75, xf: 22 },
    { img: "bg_baile", from: 300, len: 75, xf: 22, fx: 0.45 },
  ],
  text: Text02,
};

export const Memories01: React.FC<{ product: Product }> = ({ product }) => <MemoriesFilm film={FILM01} product={product} />;
export const Memories02: React.FC<{ product: Product }> = ({ product }) => <MemoriesFilm film={FILM02} product={product} />;
