import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { At, Block, BeatProvider, BlurDefs, C, cl, EndCard, Grid4, Music, Note, outE, overE, Shade, Shot, Split3, Sfx, T, Vid, Words, useBeat, type Cell } from "../outlet4/fx";

/** second wave · five ads, each one its own idea; every cut and reveal lands on its own track. Beats are counted from 0. */
export const OUTLET2 = {
  ad06: { B: 0.5, beats: 48, music: "outlet4/audio/outlet2_ad06_pop.wav" },
  ad07: { B: 0.6, beats: 40, music: "outlet4/audio/outlet2_ad07_beat.wav" },
  ad08: { B: 0.625, beats: 37, music: "outlet4/audio/outlet2_ad08_editorial.wav" },
  ad09: { B: 60 / 112, beats: 50, music: "outlet4/audio/outlet2_ad09_playful.wav" },
  ad10: { B: 60 / 124, beats: 26, music: "outlet4/audio/outlet2_ad10_energetic.wav" },
} as const;
export type Key2 = keyof typeof OUTLET2;
export const frames2 = (k: Key2) => Math.round(OUTLET2[k].beats * OUTLET2[k].B * 30);

const CREAM = "#F4F1EA";
const SANS = "Montserrat";

/** shared frame: beat clock, motion-blur filters, the track from its beat 0 */
const Frame2: React.FC<{ k: Key2; bg?: string; children: React.ReactNode }> = ({ k, bg = C.ink, children }) => (
  <BeatProvider B={OUTLET2[k].B} off={0}>
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      <BlurDefs />
      {children}
      <Music src={OUTLET2[k].music} startS={0} total={frames2(k)} />
    </AbsoluteFill>
  </BeatProvider>
);

/** two full-height panels that slide in from the edges on the block's first beat */
const Split2: React.FC<{ a: Cell; b: Cell }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const { d } = useBeat();
  const p = interpolate(f, [0, d(0.5)], [0, 1], { ...cl, easing: outE });
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 540, height: 1920, overflow: "hidden", transform: `translateX(${(p - 1) * 540}px)` }}>
        <Vid src={a.src} at={a.at} />
      </div>
      <div style={{ position: "absolute", left: 540, top: 0, width: 540, height: 1920, overflow: "hidden", transform: `translateX(${(1 - p) * 540}px)` }}>
        <Vid src={b.src} at={b.at} />
      </div>
    </AbsoluteFill>
  );
};

/** framed product cards that land on their own beat (relative to the block) and sit like a pile of prints */
type Pc = Cell & { b: number; x: number; y: number; w: number; h: number; r: number };
const Pile: React.FC<{ cards: Pc[] }> = ({ cards }) => {
  const f = useCurrentFrame();
  const { d } = useBeat();
  return (
    <AbsoluteFill>
      {cards.map((c, k) => {
        const s = d(c.b);
        if (f < s - 1) return null;
        const p = interpolate(f, [s, s + 8], [0, 1], { ...cl, easing: overE });
        return (
          <div key={k} style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, padding: 10, boxSizing: "border-box", background: "#FFFBF2", boxShadow: "0 24px 50px rgba(0,0,0,0.35)", transform: `translateY(${(1 - p) * 220}px) rotate(${c.r + (1 - p) * 6}deg)`, opacity: Math.min(1, p * 2) }}>
            <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
              <Sequence from={s} layout="none">
                <AbsoluteFill>
                  <Vid src={c.src} at={c.at} />
                </AbsoluteFill>
              </Sequence>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** a small label for a product cell: ink chip, Montserrat, placed inside the safe area */
const Chip: React.FC<{ left: number; top: number; from: number; children: React.ReactNode }> = ({ left, top, from, children }) => {
  const f = useCurrentFrame();
  const { d } = useBeat();
  if (f < d(from)) return null;
  const p = interpolate(f, [d(from), d(from) + 6], [0, 1], { ...cl, easing: outE });
  return <div style={{ position: "absolute", left, top, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, background: C.ink, color: C.ivory, fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: "0.06em", padding: "12px 26px" }}>{children}</div>;
};

/* =====================================================================================
   06 · YO SOLO IBA A VER… — pop, 120 BPM, 24 s
   ===================================================================================== */
export const Ad06: React.FC = () => (
  <Frame2 k="ad06">
    <At b0={0} b1={8}>
      <Shot src="IMG_2861" at={0.3} z={[1.0, 1.18]} fout="zoom" />
      <Shade top={250} h={560} o={0.5} />
      <Block top={300}>
        <Words text={"POV: entras al outlet\ndiciendo que no vas a comprar nada"} style={{ ...T.serif, fontSize: 70 }} step={2} exit={4} />
      </Block>
    </At>
    <At b0={8} b1={16}>
      <Split2 a={{ src: "IMG_2839", at: 0.5 }} b={{ src: "IMG_2857", at: 0.5 }} />
    </At>
    <At b0={16} b1={26} pre={0}>
      <Shot src="IMG_2842" at={0.8} fin="snap" z={[1.1, 1.0]} />
    </At>
    <At b0={18} b1={20}><Shot src="IMG_2865" at={0.4} fin="whip" /></At>
    <At b0={20} b1={22}><Shot src="IMG_2988" at={0.7} fin="snap" /></At>
    <At b0={22} b1={24}><Shot src="IMG_2852" at={0.4} fin="whip" /></At>
    <At b0={24} b1={26}><Shot src="IMG_2862" at={0.6} fin="snap" fout="zoom" /></At>

    <At b0={26} b1={34}>
      <Shade top={220} h={520} o={0.5} />
      <Block top={260}><Words text="Ok, pero VEAN ESTAS" style={{ ...T.serif, fontSize: 96 }} step={2} exit={4} /></Block>
      <Pile cards={[
        { src: "IMG_2846", at: 1.0, b: 0, x: 60, y: 720, w: 420, h: 560, r: -4 },
        { src: "IMG_2851", at: 1.0, b: 1, x: 560, y: 660, w: 440, h: 600, r: 3 },
        { src: "IMG_2986", at: 0.6, b: 2, x: 230, y: 1040, w: 480, h: 640, r: -2 },
        { src: "IMG_2989", at: 1.0, b: 3, x: 80, y: 1260, w: 360, h: 480, r: 5 },
        { src: "IMG_2992", at: 0.4, b: 4, x: 640, y: 1220, w: 380, h: 500, r: -5 },
      ]} />
    </At>

    <At b0={34} b1={40}>
      <Shot src="IMG_2862" at={0.6} z={[1.0, 1.1]} dim={0.55} />
      <Block top={650}>
        <Words text={"25%\nOFF"} style={{ ...T.mega, fontSize: 340, color: C.lime }} step={3} exit={3} />
      </Block>
    </At>
    <Sfx b={34} name="impact" vol={0.6} />

    <At b0={40} b1={44}>
      <Shot src="IMG_2839" at={0.5} fin="snap" z={[1.05, 1.0]} />
    </At>
    <At b0={44} b1={48}>
      <Shot src="IMG_2852" at={1.0} z={[1.0, 1.06]} />
      <EndCard logoTop={780} storeTop={960}>
        <Block top={300}><Words text={"OUTLET RE:SET"} style={{ ...T.mega, fontSize: 116 }} step={2} /></Block>
        <Block top={560}><Words text="Elige tu favorita." style={{ ...T.serif, fontSize: 84 }} delay={8} step={2} /></Block>
      </EndCard>
    </At>
  </Frame2>
);

/* =====================================================================================
   07 · HAZ LAS CUENTAS — beat, 100 BPM, 24 s · motion typography
   ===================================================================================== */
const Big25: React.FC = () => {
  const f = useCurrentFrame();
  const { d } = useBeat();
  const s = interpolate(f, [0, d(2.4)], [2.6, 1], { ...cl, easing: outE });
  const o = interpolate(f, [d(2.4), d(2.8)], [0, 1], cl);
  return (
    <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 200, lineHeight: 1, letterSpacing: "-0.03em", color: C.ink, whiteSpace: "nowrap", transform: `scale(${s})` }}>
      25<span style={{ opacity: o }}>% OFF</span>
    </div>
  );
};

export const Ad07: React.FC = () => (
  <Frame2 k="ad07" bg={CREAM}>
    <At b0={0} b1={6}>
      <Block top={330}><Words text="La matemática que sí me interesa:" style={{ ...T.serif, fontSize: 56, color: C.ink, textShadow: "none" }} step={2} exit={2} /></Block>
      <Big25 />
    </At>
    <Sfx b={0} name="whoosh" vol={0.4} />

    <At b0={6} b1={10}><Split2 a={{ src: "IMG_2857", at: 0.5 }} b={{ src: "IMG_2861", at: 0.4 }} /></At>
    <At b0={6} b1={10}>
      <div style={{ position: "absolute", top: 900, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: C.lime, color: C.ink, fontFamily: SANS, fontWeight: 900, fontSize: 110, padding: "14px 40px 20px" }}>25% OFF</div>
      </div>
    </At>

    <At b0={10} b1={20}>
      <BarShrink />
    </At>

    <At b0={20} b1={28}><Shot src="IMG_2848" at={0.8} fin="snap" z={[1.1, 1.0]} /></At>
    <At b0={22} b1={24}><Shot src="IMG_2984" at={3.0} fin="snap" /></At>
    <At b0={24} b1={26}><Shot src="IMG_2839" at={0.4} fin="whip" /></At>
    <At b0={26} b1={28}><Shot src="IMG_2862" at={0.7} fin="snap" /></At>

    <At b0={28} b1={35}>
      <Shot src="IMG_2852" at={1.0} z={[1.0, 1.06]} dim={0.4} />
      <Block top={600}><Words text={"Las cuentas salen\nmejor en RE:SET"} style={{ ...T.serif, fontSize: 92 }} step={2} exit={4} /></Block>
    </At>

    <At b0={35} b1={40}>
      <EndCard logoTop={820} storeTop={1000}>
        <Block top={460}><Words text="Aprovecha el 25% OFF." style={{ ...T.serif, fontSize: 100 }} step={2} /></Block>
        <Block top={720}><Words text="OUTLET RE:SET" style={{ ...T.kicker, fontSize: 52 }} delay={6} /></Block>
      </EndCard>
    </At>
  </Frame2>
);

/** a full-width bar that shrinks to 75% on the beat: 100% → 75%, with its two labels */
const BarShrink: React.FC = () => {
  const f = useCurrentFrame();
  const { d } = useBeat();
  const w = interpolate(f, [d(1), d(3)], [1, 0.75], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const labels = interpolate(f, [d(0.5), d(1)], [0, 1], cl);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <div style={{ position: "absolute", top: 700, left: 64, right: 64, fontFamily: SANS, fontWeight: 800, fontSize: 48, color: C.ink, opacity: labels, display: "flex", justifyContent: "space-between" }}>
        <span>100%</span><span>75%</span>
      </div>
      <div style={{ position: "absolute", top: 780, left: 64, width: 952 * w, height: 120, background: C.ink, transformOrigin: "left center" }} />
      <div style={{ position: "absolute", top: 1000, left: 64, right: 64, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 220, letterSpacing: "-0.03em", color: C.ink, opacity: interpolate(f, [d(3), d(3.6)], [0, 1], cl) }}>25% OFF</div>
    </AbsoluteFill>
  );
};

/* =====================================================================================
   08 · ELIGE TU PERSONALIDAD — editorial, 96 BPM, 23 s · interactive 2×2
   ===================================================================================== */
const STYLES = [
  { src: "IMG_2839", at: 0.5, label: "Colorida" },
  { src: "IMG_2857", at: 0.5, label: "Divertida" },
  { src: "IMG_2861", at: 0.4, label: "Clásica" },
  { src: "IMG_2865", at: 0.5, label: "Minimalista" },
];
const CELL_LABELS = [
  { left: 40, top: 270 }, { left: 580, top: 270 }, { left: 40, top: 1230 }, { left: 580, top: 1230 },
];

export const Ad08: React.FC = () => {
  return (
    <Frame2 k="ad08" bg={CREAM}>
      <At b0={0} b1={4}>
        <Block top={520}><Words text={"Tu pijama dice\nmucho de ti."} style={{ ...T.serif, fontSize: 96, color: C.ink, textShadow: "none" }} step={3} exit={3} /></Block>
        <Block top={1000}><Words text="¿Cuál eres?" style={{ fontFamily: SANS, fontWeight: 900, fontSize: 130, color: C.ink, textShadow: "none" }} delay={10} step={2} exit={3} /></Block>
      </At>

      <At b0={4} b1={14}>
        <Grid4 stagger={2} cells={STYLES.map((s) => ({ src: s.src, at: s.at }))} />
        {STYLES.map((s, k) => <Chip key={s.label} left={CELL_LABELS[k].left} top={CELL_LABELS[k].top} from={1 + k}>{s.label}</Chip>)}
      </At>

      <At b0={14} b1={20}>
        <Grid4 instant cells={STYLES.map((s) => ({ src: s.src, at: s.at }))} hi={(fr) => Math.floor(fr / 9) % 4} />
      </At>

      {STYLES.map((s, k) => (
        <At key={s.label} b0={20 + k * 2} b1={22 + k * 2}>
          <Shot src={s.src} at={s.at} fin="snap" z={[1.06, 1.0]} />
          <Chip left={64} top={260} from={0}>{s.label}</Chip>
        </At>
      ))}

      <At b0={28} b1={34}>
        <Grid4 instant cells={STYLES.map((s) => ({ src: s.src, at: s.at }))} />
        <Shade top={700} h={520} o={0.55} />
        <Block top={800}>
          <Words text="Todas con 25% OFF" style={{ ...T.mega, fontSize: 108, color: C.lime }} step={2} exit={3} />
        </Block>
      </At>

      <At b0={34} b1={37}>
        <EndCard logoTop={800} storeTop={1000}>
          <Block top={400}><Words text={"Encuentra la\nque va contigo."} style={{ ...T.serif, fontSize: 100 }} step={2} /></Block>
          <Block top={680}><Words text="OUTLET RE:SET." style={{ ...T.kicker, fontSize: 50 }} delay={6} /></Block>
        </EndCard>
      </At>
    </Frame2>
  );
};

/* =====================================================================================
   09 · EL ALGORITMO ME CONOCE — playful, 112 BPM, 27 s · social-first, original feed cards
   ===================================================================================== */
const FeedCard: React.FC<{ src: string; at: number; x: number; y: number; w: number; h: number; from: number }> = ({ src, at, x, y, w, h, from }) => {
  const f = useCurrentFrame();
  const { d } = useBeat();
  if (f < d(from)) return null;
  const p = interpolate(f, [d(from), d(from) + 8], [0, 1], { ...cl, easing: overE });
  return (
    <div style={{ position: "absolute", left: x, top: y + (1 - p) * 180, width: w, height: h, borderRadius: 44, overflow: "hidden", background: "#FFFBF2", boxShadow: "0 22px 48px rgba(0,0,0,0.3)", opacity: Math.min(1, p * 2), transform: `scale(${0.92 + 0.08 * p})` }}>
      <Vid src={src} at={at} />
    </div>
  );
};

export const Ad09: React.FC = () => (
  <Frame2 k="ad09" bg={C.ink}>
    <At b0={0} b1={6}>
      <Shot src="IMG_2862" at={0.6} z={[1.0, 1.12]} dim={0.6} />
      <Block top={330}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: "0.3em", color: C.lime, marginBottom: 24 }}>POV</div>
        <Words text={"Mi algoritmo cuando\ndescubre que RE:SET\ntiene 25% OFF"} style={{ ...T.serif, fontSize: 78 }} step={3} exit={3} />
      </Block>
    </At>

    <At b0={6} b1={14}>
      <Shot src="IMG_2857" at={0.5} z={[1.0, 1.05]} dim={0.7} />
      <FeedCard src="IMG_2857" at={0.5} x={70} y={520} w={940} h={700} from={0} />
      <FeedCard src="IMG_2839" at={0.5} x={70} y={1240} w={940} h={520} from={2} />
    </At>

    <At b0={14} b1={22}>
      <Shot src="IMG_2865" at={0.5} z={[1.0, 1.05]} dim={0.75} />
      <FeedCard src="IMG_2848" at={0.8} x={60} y={320} w={450} h={600} from={0} />
      <FeedCard src="IMG_2865" at={0.5} x={570} y={320} w={450} h={600} from={1} />
      <FeedCard src="IMG_2984" at={3.0} x={60} y={960} w={450} h={600} from={2} />
      <FeedCard src="IMG_2862" at={0.7} x={570} y={960} w={450} h={600} from={3} />
    </At>

    <At b0={22} b1={30}><Split3 cells={[{ src: "IMG_2988", at: 0.8 }, { src: "IMG_2846", at: 1.0 }, { src: "IMG_2852", at: 1.0 }]} /></At>

    <At b0={30} b1={36}>
      <Shade top={760} h={420} o={0.6} />
      <Note top={820} size={80}>Ok, mensaje recibido</Note>
    </At>

    <At b0={36} b1={50}>
      <Shot src="IMG_2852" at={1.0} z={[1.0, 1.06]} />
      <EndCard logoTop={800} storeTop={1040}>
        <Block top={260}><Words text="RE:SET OUTLET" style={{ ...T.mega, fontSize: 104 }} step={2} /></Block>
        <Block top={440}><Words text="25% OFF" style={{ ...T.mega, fontSize: 200, color: C.lime }} delay={4} step={3} /></Block>
        <Block top={660}><Words text="Compra ahora." style={{ ...T.serif, fontSize: 80 }} delay={12} /></Block>
      </EndCard>
    </At>
  </Frame2>
);

/* =====================================================================================
   10 · DIEZ SEGUNDOS PARA ENAMORARTE — energetic, 124 BPM, 13 s
   ===================================================================================== */
export const Ad10: React.FC = () => (
  <Frame2 k="ad10">
    <At b0={0} b1={4}>
      <Shot src="IMG_2979" at={0.5} z={[1.0, 1.15]} fout="zoom" />
      <Shade top={420} h={680} o={0.7} />
      <Block top={520}><Words text={"Dame 10 segundos\npara enseñarte\neste outlet."} style={{ ...T.serif, fontSize: 80 }} step={2} exit={3} /></Block>
    </At>

    <At b0={4} b1={6}><Shot src="IMG_2842" at={0.8} fin="snap" z={[1.1, 1.0]} /></At>
    <At b0={6} b1={8}><Shot src="IMG_2846" at={1.0} fin="whip" /></At>
    <At b0={8} b1={10}><Shot src="IMG_2852" at={1.0} fin="zoom" z={[1.15, 1.0]} /></At>
    <At b0={10} b1={12}><Shot src="IMG_2862" at={0.4} fin="snap" /></At>
    <At b0={12} b1={14}><Shot src="IMG_2861" at={0.3} fin="whip" /></At>
    <At b0={14} b1={16}><Shot src="IMG_2865" at={0.4} fin="snap" z={[1.1, 1.0]} /></At>

    <At b0={16} b1={20}>
      <Shot src="IMG_2988" at={0.6} z={[1.0, 1.08]} dim={0.4} />
      <Block top={560}><Words text={"25% OFF"} style={{ ...T.mega, fontSize: 200, color: C.lime }} step={3} exit={3} /></Block>
    </At>

    <At b0={20} b1={26}>
      <EndCard logoTop={800} storeTop={1000}>
        <Block top={380}><Words text="OUTLET RE:SET" style={{ ...T.mega, fontSize: 100 }} step={2} /></Block>
        <Block top={620}><Words text="Descúbrelo ahora." style={{ ...T.serif, fontSize: 80 }} delay={6} /></Block>
      </EndCard>
    </At>
    <Sfx b={16} name="impact" vol={0.6} />
  </Frame2>
);

