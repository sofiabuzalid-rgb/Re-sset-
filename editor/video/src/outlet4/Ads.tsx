import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AdKey, ADS, frames } from "./config";
import {
  At, BeatProvider, Block, BlurDefs, C, Chat, cl, Collage, EndCard, FreezeShot, Grid4, Leak, Mask25, Music, Note, outE, Phone, Sfx, Shade, Shake, Shot, Split3, T, Tag25, Ticker, useBeat, Vid, Words,
} from "./fx";

/** every ad: its beat clock, the motion-blur filters, its music */
const Frame: React.FC<{ k: AdKey; children: React.ReactNode }> = ({ k, children }) => {
  const A = ADS[k];
  return (
    <BeatProvider B={A.B}>
      <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
        <BlurDefs />
        {children}
        <Music src={A.music} startS={A.startS} total={frames(k)} />
      </AbsoluteFill>
    </BeatProvider>
  );
};

/** the corner 25% OFF tag between two beats */
const Corner: React.FC<{ b0: number; b1: number }> = ({ b0, b1 }) => (
  <At b0={b0} b1={b1}>
    <Tag25 />
  </At>
);

/* =====================================================================================
   AD 01 · YA LLEGÓ EL OUTLET — fashion drop, 124 BPM, 60 beats (29.0 s)
   ===================================================================================== */
export const OutletAd01: React.FC = () => (
  <Frame k="ad1">
    {/* 0–3 s · hook: OK… YA LLEGÓ → PIJAMAS / OUTLET RE:SET → 25% OFF on the drop */}
    <At b0={0} b1={2}><Shot src="IMG_2861" at={0.3} z={[1.0, 1.2]} o={[50, 55]} fout="zoom" /></At>
    <At b0={2} b1={4}><Shot src="IMG_2842" at={0.8} z={[1.14, 1.0]} fin="zoom" fout="zoom" /></At>
    <At b0={4} b1={7}><Shot src="IMG_2984" at={7.6} z={[1.16, 1.02]} fin="zoom" dim={0.18} /></At>
    <At b0={0} b1={2}><Shade top={560} h={560} /><Block top={640}><Words text={"OK…\nYA LLEGÓ."} style={{ ...T.mega, fontSize: 168 }} delay={-10} step={2} exit={2} /></Block></At>
    <At b0={2} b1={4}><Shade top={520} h={640} /><Block top={600}><Words text="PIJAMAS" style={{ ...T.kicker, fontSize: 64, color: C.lime }} step={0} exit={2} /><Words text={"OUTLET\nRE:SET"} style={{ ...T.mega, fontSize: 178, marginTop: 18 }} delay={2} step={2} exit={2} /></Block></At>
    <At b0={4} b1={7}><Block top={500}><Words text={"25%\nOFF"} style={{ ...T.mega, fontSize: 360, color: C.lime }} step={2} /></Block></At>

    {/* 3–8 s · montage: one pajama per 0.5–0.75 s, every cut a different move */}
    <At b0={7} b1={8.5}><Shot src="IMG_2988" at={0.6} fin="snap" z={[1.1, 1.0]} /></At>
    <At b0={8.5} b1={10} pre={6}><Shot src="IMG_2857" at={0.6} fin="whip" /></At>
    <At b0={10} b1={11}><Shot src="IMG_2994" at={2.2} fin="zoom" z={[1.35, 1.15]} /></At>
    <At b0={11} b1={12.5} pre={7}><Shot src="IMG_2985" at={0.5} fin="push" /></At>
    <At b0={12.5} b1={14}><Shot src="IMG_2852" at={0.5} fin="snap" /></At>
    <At b0={14} b1={16} pre={6}><Shot src="IMG_2995" at={1.8} fin="whipL" fout="zoom" /></At>

    {/* 8–14 s · grid: ¿Cuál te llevas? */}
    <At b0={16} b1={22}><Grid4 stagger={7} cells={[{ src: "IMG_2861", at: 0.4 }, { src: "IMG_2846", at: 1.0 }, { src: "IMG_2982", at: 0.4 }, { src: "IMG_2989", at: 1.0 }]} /></At>
    <At b0={22} b1={28}><Grid4 stagger={3} cells={[{ src: "IMG_2848", at: 0.8 }, { src: "IMG_2986", at: 0.5 }, { src: "IMG_2994", at: 0.3 }, { src: "IMG_2857", at: 1.5 }]} /></At>
    <At b0={16.5} b1={28}><Note top={850} size={100}>¿Cuál te llevas?</Note></At>

    {/* 14–20 s · close-ups + 25% OFF ticker (freeze on the RE:SET label, speed ramp out) */}
    <At b0={28} b1={30}><FreezeShot src="IMG_2838" at={1.6} holdF={9} z={[1.15, 1.05]} /></At>
    <At b0={30} b1={32}><Shot src="IMG_2851" at={3.0} fin="zoom" z={[1.3, 1.2]} /></At>
    <At b0={32} b1={34} pre={6}><Shot src="IMG_2862" at={1.0} fin="whip" z={[1.2, 1.1]} /></At>
    <At b0={34} b1={36}><Shot src="IMG_2994" at={3.6} fin="snap" z={[1.2, 1.1]} /></At>
    <At b0={36} b1={38} pre={7}><Shot src="IMG_2986" at={1.0} fin="push" z={[1.35, 1.25]} o={[50, 35]} /></At>
    <At b0={38} b1={40}><Shot src="IMG_2839" at={0.6} fin="zoom" fout="zoom" ramp={[0.8, 2.6]} /></At>
    <At b0={28} b1={40}><Ticker text="25% OFF" top={880} size={86} bg={C.ink} fg={C.lime} rot={-4} /></At>

    {/* 20–26 s · burst of variety: a pajama per beat + split screens */}
    <At b0={40} b1={41}><Shot src="IMG_2979" at={1.0} fin="zoom" z={[1.2, 1.1]} /></At>
    <At b0={41} b1={42}><Shot src="IMG_2987" at={1.6} fin="snap" /></At>
    <At b0={42} b1={43} pre={5}><Shot src="IMG_2848" at={1.0} fin="whip" /></At>
    <At b0={43} b1={44}><Shot src="IMG_2984" at={8.0} fin="snap" /></At>
    <At b0={44} b1={46}><Split3 cells={[{ src: "IMG_2861", at: 0.4 }, { src: "IMG_2985", at: 0.6 }, { src: "IMG_2846", at: 0.8 }]} /></At>
    <At b0={46} b1={47}><Shot src="IMG_2991" at={0.3} fin="zoom" /></At>
    <At b0={47} b1={48}><Shot src="IMG_2840" at={0.8} fin="snap" /></At>
    <At b0={48} b1={50}><Split3 cells={[{ src: "IMG_2988", at: 1.0 }, { src: "IMG_2857", at: 1.0 }, { src: "IMG_2989", at: 1.0 }]} /></At>
    <At b0={50} b1={51} pre={5}><Shot src="IMG_2865" at={0.5} fin="whip" /></At>
    <At b0={51} b1={52}><Shot src="IMG_2995" at={3.0} fin="snap" fout="zoom" /></At>
    <At b0={44} b1={52}>
      <Shade top={600} h={560} o={0.6} />
      <Block top={660}>
        <Words text="Tus favoritas están en" style={{ ...T.serif, fontSize: 82 }} step={2} />
        <Words text="OUTLET." style={{ ...T.mega, fontSize: 210, color: C.lime, marginTop: 10 }} delay={8} />
      </Block>
    </At>
    <Corner b0={7} b1={52} />

    {/* 26–29 s · CTA */}
    <At b0={52} b1={60}>
      <Grid4 instant cells={[{ src: "IMG_2842", at: 2.0 }, { src: "IMG_2989", at: 2.0 }, { src: "IMG_2852", at: 1.2 }, { src: "IMG_2995", at: 1.6 }]} />
      <EndCard logoTop={790} storeTop={990}>
        <Block top={300}><Words text={"25%\nOFF"} style={{ ...T.mega, fontSize: 200, color: C.lime }} step={2} /></Block>
        <Block top={640}><Words text={"Compra antes\nde que se vayan."} style={{ ...T.serif, fontSize: 76 }} delay={6} step={2} /></Block>
      </EndCard>
    </At>

    {/* sound design */}
    <Sfx b={2} name="whoosh" off={-5} vol={0.45} />
    <Sfx b={4} name="whoosh" off={-5} vol={0.4} />
    <Sfx b={7} name="click" vol={0.4} />
    <Sfx b={8.5} name="swipe" off={-6} vol={0.4} />
    <Sfx b={10} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={11} name="swipe" off={-7} vol={0.35} />
    <Sfx b={12.5} name="click" vol={0.35} />
    <Sfx b={14} name="swipe" off={-6} vol={0.35} />
    {[16, 16.5, 17, 17.5, 22, 22.2, 22.4, 22.6].map((b) => <Sfx key={b} b={b} name="pop" vol={0.22} />)}
    <Sfx b={28} name="snap" vol={0.6} />
    {[30, 38].map((b) => <Sfx key={b} b={b} name="whoosh" off={-4} vol={0.35} />)}
    {[32, 36, 42, 50].map((b) => <Sfx key={b} b={b} name="swipe" off={-6} vol={0.3} />)}
    <Sfx b={40} name="whoosh" off={-5} vol={0.45} />
    <Sfx b={52} name="whoosh" off={-5} vol={0.4} />
    <Sfx b={52.5} name="pop" vol={0.3} />
  </Frame>
);

/* =====================================================================================
   AD 02 · CHAT DE AMIGAS — playful cool-girl, 100 BPM, 52 beats (31.2 s)
   ===================================================================================== */
const PhoneDive: React.FC = () => {
  // the chat, then the phone dives into the link preview (zoom-blur) and smash-cuts to the pajamas
  const f = useCurrentFrame();
  const { f: bf } = useBeat();
  const p = interpolate(f, [bf(6.4), bf(8)], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(24px) brightness(0.55)", transform: "scale(1.2)" }}>
        <Vid src="IMG_2842" at={0.5} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1 + 3.2 * p})`, transformOrigin: "41.9% 48.2%", filter: p > 0.05 ? `blur(${(p * 14).toFixed(1)}px)` : undefined }}>
        <Phone x={110} y={270} w={860} h={1290}>
          <Chat
            name="Majo"
            typing={[-1, 2.25]}
            tap={6}
            msgs={[
              { b: -0.5, side: "in", text: "¿Ya viste el outlet?" }, // already on screen in the first frame
              { b: 1.75, side: "out", text: "¿Cuál outlet?" },
              { b: 3.25, side: "in", text: "RE:SET. 25% OFF.", link: { src: "IMG_2981", at: 0.6, title: "Outlet de pijamas · RE:SET", domain: "resetwear.com.mx" } },
              { b: 4.75, side: "out", text: "ABRIENDO LA PÁGINA YA." },
            ]}
          />
        </Phone>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [bf(7.6), bf(8)], [0, 0.8], cl) }} />
    </AbsoluteFill>
  );
};

export const OutletAd02: React.FC = () => (
  <Frame k="ad2">
    {/* 0–4.8 s · the chat */}
    <At b0={0} b1={8}><PhoneDive /></At>

    {/* 4.8–10 s · zoom blur → whip → cut, 25% OFF over the pajamas */}
    <At b0={8} b1={9.5}><Shot src="IMG_2846" at={0.6} fin="zoom" /></At>
    <At b0={9.5} b1={11} pre={6}><Shot src="IMG_2984" at={7.6} fin="whip" /></At>
    <At b0={11} b1={12.5}><Shot src="IMG_2852" at={0.4} fin="snap" /></At>
    <At b0={12.5} b1={14}><Shot src="IMG_2994" at={2.5} fin="zoom" z={[1.3, 1.15]} /></At>
    <At b0={14} b1={15.5} pre={6}><Shot src="IMG_2988" at={0.7} fin="whip" /></At>
    <At b0={15.5} b1={17}><Shot src="IMG_2861" at={0.3} fin="snap" fout="zoom" /></At>
    <At b0={8.5} b1={16.5}><Block top={480}><Words text={"25%\nOFF"} style={{ ...T.mega, fontSize: 330, color: C.lime }} step={3} /></Block></At>

    {/* 10–16.8 s · collage + "Yo diciendo que solo iba a ver…" */}
    <At b0={17} b1={28}>
      <Collage
        bg={{ src: "IMG_2979", at: 1.0 }}
        cards={[
          { src: "IMG_2985", at: 6.0, b: 0, x: 70, y: 520, w: 440, h: 720, r: -4 },
          { src: "IMG_2857", at: 0.8, b: 1, x: 570, y: 480, w: 440, h: 730, r: 3 },
          { src: "IMG_2989", at: 1.0, b: 2, x: 310, y: 760, w: 460, h: 740, r: -2, depth: 1.4 },
          { src: "IMG_2840", at: 0.8, b: 3, x: 50, y: 880, w: 430, h: 640, r: 5 },
          { src: "IMG_2995", at: 1.6, b: 4, x: 600, y: 860, w: 420, h: 650, r: -5 },
          { src: "IMG_2986", at: 0.6, b: 5.5, x: 150, y: 560, w: 470, h: 760, r: 2 },
          { src: "IMG_2991", at: 0.3, b: 6.5, x: 520, y: 620, w: 470, h: 760, r: -3 },
          { src: "IMG_2865", at: 0.5, b: 7.5, x: 80, y: 780, w: 440, h: 700, r: -6 },
          { src: "IMG_2992", at: 0.4, b: 8.5, x: 560, y: 800, w: 430, h: 700, r: 4 },
          { src: "IMG_2862", at: 1.0, b: 9.5, x: 300, y: 690, w: 480, h: 790, r: -1, depth: 1.6 },
        ]}
      />
    </At>
    <At b0={17.5} b1={28}><Shade top={250} h={330} o={0.5} /><Block top={290}><Words text={"Yo diciendo que\nsolo iba a ver…"} style={{ ...T.serif, fontSize: 92 }} step={2} /></Block></At>

    {/* 16.8–22.8 s · …y ahora quiero todas. */}
    <At b0={28} b1={30}><Grid4 stagger={2} cells={[{ src: "IMG_2982", at: 0.4 }, { src: "IMG_2846", at: 1.2 }, { src: "IMG_2985", at: 0.7 }, { src: "IMG_2852", at: 1.0 }]} /></At>
    <At b0={30} b1={31}><Shot src="IMG_2989" at={2.0} fin="zoom" /></At>
    <At b0={31} b1={32}><Shot src="IMG_2861" at={1.0} fin="snap" /></At>
    <At b0={32} b1={34}><Split3 cells={[{ src: "IMG_2994", at: 2.5 }, { src: "IMG_2987", at: 2.0 }, { src: "IMG_2857", at: 1.5 }]} /></At>
    <At b0={34} b1={35} pre={5}><Shot src="IMG_2984" at={8.2} fin="whip" /></At>
    <At b0={35} b1={36}><Shot src="IMG_2988" at={2.0} fin="snap" /></At>
    <At b0={36} b1={38}><Grid4 stagger={2} cells={[{ src: "IMG_2995", at: 2.5 }, { src: "IMG_2848", at: 1.5 }, { src: "IMG_2866", at: 0.5 }, { src: "IMG_2839", at: 1.2 }]} /></At>
    <At b0={28.5} b1={37.5}>
      <Shade top={640} h={520} o={0.6} />
      <Block top={700}>
        <Words text="…y ahora" style={{ ...T.serif, fontSize: 96 }} step={2} />
        <Words text={"QUIERO\nTODAS."} style={{ ...T.mega, fontSize: 170, color: C.lime, marginTop: 6 }} delay={6} step={3} />
      </Block>
    </At>

    {/* 22.8–28.2 s · hero product: OUTLET RE:SET / 25% OFF */}
    <At b0={38} b1={41}><FreezeShot src="IMG_2842" at={1.0} holdF={8} z={[1.0, 1.1]} /></At>
    <At b0={41} b1={44} pre={6}><Shot src="IMG_2989" at={0.8} fin="whip" z={[1.08, 1.0]} /></At>
    <At b0={44} b1={47}><Shot src="IMG_2861" at={0.4} fin="zoom" z={[1.0, 1.12]} /></At>
    <At b0={38.5} b1={46.5}>
      <Shade top={250} h={640} o={0.5} />
      <Block top={300}>
        <Words text="OUTLET RE:SET" style={{ ...T.mega, fontSize: 104 }} step={2} />
        <Words text="25% OFF" style={{ ...T.mega, fontSize: 200, color: C.lime, marginTop: 8 }} delay={5} step={3} />
      </Block>
    </At>
    <Corner b0={17} b1={38} />

    {/* 28.2–31.2 s · CTA */}
    <At b0={47} b1={52}>
      <Shot src="IMG_2852" at={1.0} z={[1.05, 1.15]} />
      <EndCard logoTop={800} storeTop={1000}>
        <Block top={330}><Words text={"Ve por\nla tuya."} style={{ ...T.serif, fontSize: 150 }} step={2} /></Block>
        <Block top={690}><Words text="25% OFF" style={{ ...T.kicker, fontSize: 46, color: C.lime }} delay={6} /></Block>
      </EndCard>
    </At>

    {/* sound design */}
    <Sfx b={0} name="notif" vol={0.5} />
    <Sfx b={1.75} name="pop" vol={0.45} />
    <Sfx b={3.25} name="notif" vol={0.5} />
    <Sfx b={4.75} name="pop" vol={0.45} />
    <Sfx b={6} name="click" vol={0.55} />
    <Sfx b={6.6} name="whoosh" vol={0.5} />
    <Sfx b={9.5} name="swipe" off={-6} vol={0.4} />
    <Sfx b={11} name="click" vol={0.35} />
    <Sfx b={12.5} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={14} name="swipe" off={-6} vol={0.4} />
    <Sfx b={15.5} name="click" vol={0.35} />
    {[17, 18, 19, 20, 21, 22.5, 23.5, 24.5, 25.5, 26.5].map((b) => <Sfx key={b} b={b} name="pop" vol={0.2} />)}
    <Sfx b={28} name="whoosh" off={-4} vol={0.4} />
    <Sfx b={30} name="whoosh" off={-4} vol={0.3} />
    {[32, 34].map((b) => <Sfx key={b} b={b} name="swipe" off={-5} vol={0.3} />)}
    <Sfx b={36} name="pop" vol={0.3} />
    <Sfx b={38} name="snap" vol={0.6} />
    <Sfx b={41} name="swipe" off={-6} vol={0.35} />
    <Sfx b={44} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={47} name="pop" vol={0.35} />
  </Frame>
);

/* =====================================================================================
   AD 03 · 25% OFF DROP — editorial fashion, afro house 104.8 BPM from the drop, 52 beats (29.8 s)
   ===================================================================================== */
/** RE:SET wordmark (white), fades up out of a blur */
const Logo: React.FC<{ top: number; w: number; dark?: boolean }> = ({ top, w, dark }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 12], [0, 1], { ...cl, easing: outE });
  return <Img src={staticFile(`brand/reset-logo-${dark ? "black" : "white"}.png`)} style={{ position: "absolute", top, left: "50%", width: w, marginLeft: -w / 2, opacity: p, filter: `blur(${(1 - p) * 10}px)${dark ? "" : " drop-shadow(0 4px 24px rgba(0,0,0,0.45))"}`, transform: `scale(${1.08 - 0.08 * p})` }} />;
};

const Opener25: React.FC = () => {
  // ivory page, a pajama rising behind a giant 25 cut out of red fabric, then % OFF
  const f = useCurrentFrame();
  const { f: bf } = useBeat();
  const off = interpolate(f, [bf(2), bf(2) + 9], [0, 1], { ...cl, easing: outE });
  const rise = interpolate(f, [bf(0.5), bf(0.5) + 12], [0, 1], { ...cl, easing: outE });
  return (
    <AbsoluteFill style={{ backgroundColor: C.ivory }}>
      <div style={{ position: "absolute", left: 250, top: 400, width: 580, height: 800, overflow: "hidden", opacity: rise, transform: `translateY(${(1 - rise) * 320}px)`, boxShadow: "0 30px 80px rgba(0,0,0,0.25)" }}>
        <Vid src="IMG_2842" at={0.8} />
      </div>
      <Mask25 id="m25open" size={900} cy={860} enter={-10}>
        <Vid src="IMG_2862" at={1.0} />
      </Mask25>
      <div style={{ position: "absolute", top: 1250, left: 0, right: 0, textAlign: "center", opacity: off, transform: `translateY(${(1 - off) * 40}px)`, fontFamily: "Montserrat", fontWeight: 800, fontSize: 128, letterSpacing: "0.12em", color: C.ink }}>% OFF</div>
    </AbsoluteFill>
  );
};

const MaskIntoCollage: React.FC = () => {
  // the last close-up plays on while a "25" full of the new collage grows over it and swallows the frame
  const { f: bf } = useBeat();
  return (
    <AbsoluteFill>
      <At b0={0} b1={1.4}><Shot src="IMG_2862" at={2.0} z={[1.1, 1.2]} /></At>
      <Mask25 id="m25trans" size={760} cy={900} grow={[bf(0.2), bf(1.4)]}>
        <Collage
          cards={[
            { src: "IMG_2842", at: 1.0, b: 0, x: 72, y: 290, w: 560, h: 820 },
            { src: "IMG_2991", at: 0.3, b: 1.5, x: 610, y: 420, w: 400, h: 560 },
            { src: "IMG_2995", at: 2.0, b: 2.5, x: 560, y: 1010, w: 450, h: 520 },
            { src: "IMG_2865", at: 0.5, b: 3.5, x: 72, y: 1150, w: 450, h: 390 },
            { src: "IMG_2848", at: 1.0, b: 5.5, x: 300, y: 640, w: 480, h: 690, depth: 1.3 },
          ]}
        />
      </Mask25>
    </AbsoluteFill>
  );
};

export const OutletAd03: React.FC = () => (
  <Frame k="ad3">
    {/* 0–2.3 s · a giant 25 full of fabric, then % OFF */}
    <At b0={0} b1={4}><Opener25 /></At>
    <At b0={0.5} b1={4}><Block top={290}><Words text="RE:SET · PIJAMAS" style={{ ...T.kicker, fontSize: 42, color: C.ink, textShadow: "none" }} step={0} /></Block></At>

    {/* 2.3–5.2 s · three pajamas on the beat */}
    <At b0={4} b1={5.5}><Shot src="IMG_2989" at={0.5} fin="zoom" /></At>
    <At b0={5.5} b1={7}><Shot src="IMG_2857" at={0.6} fin="snap" /></At>
    <At b0={7} b1={9} pre={6}><Shot src="IMG_2852" at={0.4} fin="whip" /></At>

    {/* 5.2–9.7 s · vertical split, three products moving */}
    <At b0={9} b1={13}><Split3 cells={[{ src: "IMG_2982", at: 0.3 }, { src: "IMG_2861", at: 0.4 }, { src: "IMG_2984", at: 7.6 }]} /></At>
    <At b0={13} b1={17} pre={8}><Split3 cells={[{ src: "IMG_2846", at: 1.0 }, { src: "IMG_2988", at: 1.0 }, { src: "IMG_2848", at: 0.8 }]} /></At>

    {/* 9.7–13.7 s · close-ups, small OUTLET */}
    <At b0={17} b1={18.5}><FreezeShot src="IMG_2838" at={1.6} holdF={7} z={[1.2, 1.1]} /></At>
    <At b0={18.5} b1={20}><Shot src="IMG_2994" at={3.2} fin="snap" z={[1.15, 1.05]} /></At>
    <At b0={20} b1={21.5} pre={5}><Shot src="IMG_2851" at={4.0} fin="whip" z={[1.25, 1.15]} /></At>
    <At b0={21.5} b1={23}><Shot src="IMG_2986" at={0.6} fin="snap" z={[1.4, 1.3]} o={[50, 30]} /></At>
    <At b0={17.5} b1={23}><Block top={300}><Words text="OUTLET" style={{ ...T.kicker, fontSize: 40, letterSpacing: "0.6em" }} step={0} /></Block></At>

    {/* 13.2–18.9 s · the 25 opens onto a new collage */}
    <At b0={23} b1={33}><MaskIntoCollage /></At>

    {/* 18.9–24 s · full pajama + RE:SET */}
    <At b0={33} b1={37.5}><Shot src="IMG_2861" at={0.4} fin="zoom" z={[1.0, 1.12]} /></At>
    <At b0={37.5} b1={42} pre={6}><Shot src="IMG_2987" at={1.8} fin="whip" z={[1.1, 1.0]} /></At>
    <At b0={33} b1={34}><Leak at={0} len={16} /></At>
    <At b0={34} b1={41.5}><Logo top={300} w={520} dark /></At>
    <Corner b0={9} b1={42} />

    {/* 24–27.5 s · 25% OFF / SHOP THE OUTLET */}
    <At b0={42} b1={48}>
      <Shot src="IMG_2865" at={0.3} fin="zoom" z={[1.15, 1.0]} dim={0.3} />
      <Block top={520}>
        <Words text="25% OFF" style={{ ...T.didone, fontSize: 210, color: C.lime }} step={3} />
        <Words text="SHOP THE OUTLET" style={{ ...T.kicker, fontSize: 44, marginTop: 40 }} delay={7} step={2} />
      </Block>
    </At>

    {/* 27.5–29.8 s · logo + Compra ahora. */}
    <At b0={48} b1={52}>
      <Shot src="IMG_2852" at={2.0} z={[1.05, 1.12]} />
      <EndCard logoTop={560} storeTop={1000}>
        <Block top={330}><Words text="Compra ahora." style={{ ...T.serif, fontSize: 120 }} step={2} /></Block>
        <Block top={760}><Words text="25% OFF" style={{ ...T.kicker, fontSize: 46, color: C.lime }} delay={6} /></Block>
      </EndCard>
    </At>

    {/* sound design: sparse, editorial */}
    <Sfx b={2} name="click" vol={0.45} />
    <Sfx b={4} name="whoosh" off={-5} vol={0.4} />
    <Sfx b={7} name="swipe" off={-6} vol={0.35} />
    <Sfx b={9} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={13} name="swipe" off={-8} vol={0.35} />
    <Sfx b={17} name="snap" vol={0.55} />
    <Sfx b={20} name="swipe" off={-5} vol={0.3} />
    <Sfx b={23.2} name="whoosh" vol={0.45} />
    {[24.5, 25.5, 26.5, 28.5].map((b) => <Sfx key={b} b={b} name="pop" vol={0.2} />)}
    <Sfx b={33} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={37.5} name="swipe" off={-6} vol={0.35} />
    <Sfx b={42} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={48} name="pop" vol={0.3} />
  </Frame>
);

/* =====================================================================================
   AD 04 · NO TE DUERMAS — lullaby, alarm, pop drop, 128 BPM, 72 beats (33.75 s)
   ===================================================================================== */
const Sleepy: React.FC = () => {
  // night: slow-motion pajama, dim and cool, music box; the alarm shakes the frame awake
  const { f: bf } = useBeat();
  return (
    <Shake from={bf(2.6)} to={bf(4)} amp={12}>
      <Shot src="IMG_2861" at={0.2} rate={0.5} z={[1.06, 1.16]} grade="brightness(0.6) saturate(0.75)" />
      <AbsoluteFill style={{ background: "radial-gradient(70% 55% at 50% 45%, rgba(20,30,70,0) 0%, rgba(8,10,30,0.7) 100%)" }} />
      <AbsoluteFill style={{ background: "rgba(40,60,140,0.18)", mixBlendMode: "multiply" }} />
    </Shake>
  );
};

export const OutletAd04: React.FC = () => (
  <Frame k="ad4">
    {/* 0–3.3 s · NO TE DUERMAS. → alarm → 25% OFF EN RE:SET. */}
    <At b0={0} b1={4}><Sleepy /></At>
    <At b0={0} b1={4}><Block top={680}><Words text={"NO TE\nDUERMAS."} style={{ ...T.mega, fontSize: 172 }} delay={-10} step={2} exit={3} /></Block></At>
    <At b0={4} b1={7}><Shot src="IMG_2984" at={7.6} fin="zoom" z={[1.16, 1.02]} dim={0.3} /></At>
    <At b0={4} b1={7}>
      <Block top={440}>
        <Words text="OUTLET DE PIJAMAS" style={{ ...T.kicker, fontSize: 40, color: C.lime }} step={0} />
        <Words text={"25%\nOFF"} style={{ ...T.mega, fontSize: 300, color: C.lime, marginTop: 20 }} step={2} />
        <Words text="EN RE:SET." style={{ ...T.mega, fontSize: 130, marginTop: 14 }} delay={4} />
      </Block>
    </At>

    {/* 3.3–7 s · fast montage */}
    <At b0={7} b1={8.5}><Shot src="IMG_2988" at={0.6} fin="snap" /></At>
    <At b0={8.5} b1={10} pre={6}><Shot src="IMG_2846" at={0.8} fin="whip" /></At>
    <At b0={10} b1={11}><Shot src="IMG_2994" at={2.4} fin="zoom" z={[1.3, 1.15]} /></At>
    <At b0={11} b1={12.5} pre={7}><Shot src="IMG_2985" at={0.6} fin="push" /></At>
    <At b0={12.5} b1={14}><Shot src="IMG_2852" at={0.6} fin="snap" /></At>
    <At b0={14} b1={15} pre={6}><Shot src="IMG_2995" at={2.2} fin="whipL" fout="zoom" /></At>

    {/* 7–12.2 s · Porque tus favoritas están en outlet. */}
    <At b0={15} b1={19}><Shot src="IMG_2989" at={0.8} fin="zoom" z={[1.12, 1.0]} /></At>
    <At b0={19} b1={23} pre={6}><Shot src="IMG_2857" at={1.0} fin="whip" z={[1.0, 1.1]} /></At>
    <At b0={23} b1={26}><Shot src="IMG_2991" at={0.2} fin="snap" z={[1.0, 1.08]} /></At>
    <At b0={15.5} b1={25.5}>
      <Shade top={280} h={600} o={0.55} />
      <Block top={330}>
        <Words text="Porque tus favoritas" style={{ ...T.serif, fontSize: 84 }} step={2} />
        <Words text={"ESTÁN EN\nOUTLET."} style={{ ...T.mega, fontSize: 150, color: C.lime, marginTop: 10 }} delay={8} step={3} />
      </Block>
    </At>

    {/* 12.2–17.8 s · close-up → full outfit, matched by print */}
    <At b0={26} b1={27.5}><Shot src="IMG_2862" at={1.0} fin="snap" z={[1.3, 1.2]} /></At>
    <At b0={27.5} b1={29}><Shot src="IMG_2861" at={0.6} z={[1.0, 1.06]} /></At>
    <At b0={29} b1={30.5} pre={5}><Shot src="IMG_2851" at={4.0} fin="whip" z={[1.3, 1.2]} /></At>
    <At b0={30.5} b1={32}><Shot src="IMG_2848" at={1.0} z={[1.0, 1.06]} /></At>
    <At b0={32} b1={33.5}><Shot src="IMG_2994" at={3.0} fin="zoom" z={[1.2, 1.1]} /></At>
    <At b0={33.5} b1={35}><Shot src="IMG_2992" at={0.6} z={[1.0, 1.12]} /></At>
    <At b0={35} b1={36.5} pre={5}><Shot src="IMG_2838" at={2.6} fin="whip" z={[1.15, 1.05]} /></At>
    <At b0={36.5} b1={38}><Shot src="IMG_2842" at={1.4} fout="zoom" /></At>

    {/* 17.8–22.5 s · grid, elige rápido 👀 (build-up) */}
    <At b0={38} b1={42}><Grid4 stagger={3} cells={[{ src: "IMG_2986", at: 0.6 }, { src: "IMG_2852", at: 1.5 }, { src: "IMG_2865", at: 0.5 }, { src: "IMG_2982", at: 0.5 }]} /></At>
    <At b0={42} b1={48}><GridChoose /></At>
    <At b0={38.5} b1={48}><Note top={860} size={90}>elige rápido 👀</Note></At>

    {/* 22.5–26.3 s · drop: a pajama on every beat */}
    {(
      [
        ["IMG_2984", 8.6, "zoom"], ["IMG_2988", 2.5, "snap"], ["IMG_2861", 1.6, "snap"], ["IMG_2846", 2.5, "snap"],
        ["IMG_2852", 2.5, "snap"], ["IMG_2995", 3.5, "snap"], ["IMG_2989", 4.0, "snap"], ["IMG_2857", 2.6, "snap"],
      ] as const
    ).map(([src, at, fin], i) => (
      <At key={i} b0={48 + i} b1={49 + i}><Shot src={src} at={at} fin={fin} z={[1.1, 1.0]} /></At>
    ))}
    <Corner b0={7} b1={56} />

    {/* 26.3–30 s · 25% OFF / OUTLET RE:SET */}
    <At b0={56} b1={64}>
      <Shot src="IMG_2979" at={2.5} fin="zoom" z={[1.0, 1.12]} dim={0.4} />
      <Block top={380}>
        <Words text={"25%\nOFF"} style={{ ...T.mega, fontSize: 300, color: C.lime }} step={2} />
        <Words text="OUTLET RE:SET" style={{ ...T.mega, fontSize: 110, marginTop: 20 }} delay={6} step={2} />
      </Block>
      <Ticker text="25% OFF" top={1290} size={60} bg={C.lime} fg={C.ink} rot={-3} />
    </At>

    {/* 30–33.75 s · CTA */}
    <At b0={64} b1={72}>
      <Grid4 instant cells={[{ src: "IMG_2842", at: 2.0 }, { src: "IMG_2989", at: 3.0 }, { src: "IMG_2852", at: 1.2 }, { src: "IMG_2995", at: 1.6 }]} />
      <EndCard logoTop={800} storeTop={1000}>
        <Block top={330}><Words text={"Compra la tuya\nantes de que se vaya."} style={{ ...T.serif, fontSize: 84 }} step={2} /></Block>
        <Block top={600}><Words text="25% OFF" style={{ ...T.mega, fontSize: 120, color: C.lime }} delay={8} /></Block>
      </EndCard>
    </At>

    {/* sound design */}
    <Sfx b={2.6} name="alarm" vol={0.55} />
    <Sfx b={3.6} name="whoosh" vol={0.4} />
    <Sfx b={7} name="click" vol={0.4} />
    <Sfx b={8.5} name="swipe" off={-6} vol={0.4} />
    <Sfx b={10} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={11} name="swipe" off={-7} vol={0.35} />
    <Sfx b={12.5} name="click" vol={0.35} />
    <Sfx b={14} name="swipe" off={-6} vol={0.35} />
    <Sfx b={15} name="whoosh" off={-4} vol={0.35} />
    <Sfx b={19} name="swipe" off={-6} vol={0.3} />
    {[23, 26, 32].map((b) => <Sfx key={b} b={b} name="click" vol={0.3} />)}
    {[29, 35].map((b) => <Sfx key={b} b={b} name="swipe" off={-5} vol={0.3} />)}
    {[38, 38.4, 38.8, 39.2, 42, 42.3, 42.6, 42.9].map((b) => <Sfx key={b} b={b} name="pop" vol={0.22} />)}
    {[46, 46.5, 47, 47.5].map((b) => <Sfx key={b} b={b} name="click" vol={0.3} />)}
    <Sfx b={48} name="whoosh" off={-5} vol={0.45} />
    <Sfx b={56} name="whoosh" off={-5} vol={0.4} />
    <Sfx b={64} name="pop" vol={0.35} />
  </Frame>
);

/** the second grid: new pajamas, and in the last bar a lime frame jumps between them on every half beat ("elige rápido") */
const GridChoose: React.FC = () => {
  const { f: bf } = useBeat();
  const half = bf(0.5);
  return (
    <Grid4
      stagger={2}
      cells={[{ src: "IMG_2985", at: 6.0 }, { src: "IMG_2846", at: 2.0 }, { src: "IMG_2989", at: 2.5 }, { src: "IMG_2857", at: 2.0 }]}
      hi={(fr) => (fr >= bf(4) ? [0, 3, 1, 2][Math.floor((fr - bf(4)) / half) % 4] : -1)}
    />
  );
};
