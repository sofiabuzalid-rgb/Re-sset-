import {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/inter/400.css';
import {PRODUCTS, Product} from './products';
import {Heart, Sparkle} from './Decor';

export const FPS = 30;
export const DURATION = 210; // 7 s

const INK = '#4A3F39';
const ROSE = '#D98CA3';

// Copy (one headline only, plus the "plan" typed in the bar)
const PLAN_TEXT = 'Mi plan de hoy: ponerme mi pijama favorita';
const HEADLINE = ['DESCANSAR TAMBIÉN PUEDE', 'SENTIRSE ESPECIAL'];

// Timeline (frames)
const T = {
  logo: 0,
  bar: 26,
  typeStart: 34,
  typeFramesPerChar: 1.1,
  send: 88,
  headline: 122,
};

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  // very slow drift so the linen feels alive without drawing attention
  const s = interpolate(frame, [0, DURATION], [1.0, 1.035]);
  const x = interpolate(frame, [0, DURATION], [-70, -95]);
  const y = interpolate(frame, [0, DURATION], [-130, -150]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#e9e1d6'}}>
      <Img
        src={staticFile('bg-linen.jpg')}
        style={{
          position: 'absolute',
          width: 1240,
          height: 2200,
          left: 0,
          top: 0,
          transform: `translate(${x}px, ${y}px) scale(${s})`,
          transformOrigin: '50% 40%',
        }}
      />
    </AbsoluteFill>
  );
};

const Sticker: React.FC<{p: Product; i: number}> = ({p, i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - p.enter;
  const pop = spring({frame: t, fps, config: {damping: 14, stiffness: 120, mass: 0.8}});
  const opacity = interpolate(t, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // gentle idle float once settled, each sticker on its own phase
  const idle = Math.max(0, t - 18);
  const floatY = Math.sin((idle / fps) * 1.6 + i * 1.3) * 4 * Math.min(1, idle / 20);
  const floatR = Math.sin((idle / fps) * 1.1 + i * 2.1) * 0.6 * Math.min(1, idle / 20);
  const scale = interpolate(pop, [0, 1], [0.82, 1]);
  const lift = interpolate(pop, [0, 1], [28, 0]);
  const rot = p.rot + interpolate(pop, [0, 1], [p.rot >= 0 ? 5 : -5, 0]) + floatR;
  const w = p.h * p.aspect;
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x - w / 2,
        top: p.y - p.h / 2,
        width: w,
        height: p.h,
        opacity,
        transform: `translateY(${lift + floatY}px) rotate(${rot}deg) scale(${scale})`,
        filter: 'drop-shadow(0 14px 16px rgba(70, 50, 38, 0.22)) drop-shadow(0 2px 3px rgba(70, 50, 38, 0.18))',
      }}
    >
      <Img src={staticFile(`stickers/${p.sticker}`)} style={{width: '100%', height: '100%'}} />
    </div>
  );
};

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [T.logo, T.logo + 18], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(frame, [T.logo, T.logo + 18], [-8, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <Img
      src={staticFile('reset-logo.svg')}
      style={{
        position: 'absolute',
        left: 540 - 105,
        top: 230 + y,
        width: 210,
        opacity: o * 0.92,
      }}
    />
  );
};

const PlanBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - T.bar;
  const enter = spring({frame: t, fps, config: {damping: 18, stiffness: 110}});
  const opacity = interpolate(t, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chars = Math.max(0, Math.floor((frame - T.typeStart) / T.typeFramesPerChar));
  const typed = PLAN_TEXT.slice(0, chars);
  const typing = chars > 0 && chars < PLAN_TEXT.length;
  const caretOn = typing || Math.floor(frame / 15) % 2 === 0;
  const showCaret = frame >= T.typeStart && frame < T.send + 6;
  const sendT = frame - T.send;
  const press = interpolate(sendT, [0, 4, 10], [1, 0.86, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glow = interpolate(sendT, [0, 6, 22], [0, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const W = 880;
  const H = 108;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - W / 2,
        top: 1010 - H / 2,
        width: W,
        height: H,
        borderRadius: H / 2,
        background: 'rgba(255, 255, 255, 0.96)',
        boxShadow: '0 10px 28px rgba(70, 50, 38, 0.16), 0 1px 2px rgba(70, 50, 38, 0.1)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px 0 28px',
        boxSizing: 'border-box',
        opacity,
        transform: `translateY(${interpolate(enter, [0, 1], [26, 0])}px) scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
      }}
    >
      <div style={{fontFamily: 'Inter', fontSize: 46, fontWeight: 400, color: INK, width: 44, lineHeight: 1, marginTop: -4}}>+</div>
      <div
        style={{
          flex: 1,
          marginLeft: 18,
          fontFamily: 'Inter',
          fontSize: 31,
          color: '#2f2724',
          letterSpacing: -0.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {typed}
        {showCaret && (
          <span style={{opacity: caretOn ? 1 : 0, color: ROSE, marginLeft: 2, fontWeight: 400}}>|</span>
        )}
      </div>
      <div
        style={{
          width: 76,
          height: 58,
          borderRadius: 29,
          background: ROSE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${press})`,
          boxShadow: `0 0 0 ${glow * 14}px rgba(217, 140, 163, ${glow * 0.35})`,
        }}
      >
        <svg width="26" height="30" viewBox="0 0 26 30">
          <path d="M13 27 V4 M3 13 L13 3 L23 13" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: 1080,
        top: 1690,
        textAlign: 'center',
        fontFamily: 'Cormorant Garamond',
        fontWeight: 500,
        fontSize: 47,
        lineHeight: 1.32,
        color: '#3B312C',
        textShadow: '0 0 22px rgba(255, 248, 240, 0.85), 0 0 6px rgba(255, 248, 240, 0.6)',
      }}
    >
      {HEADLINE.map((line, i) => {
        const t = frame - T.headline - i * 8;
        const o = interpolate(t, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const ls = interpolate(t, [0, 24], [7, 4], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div key={line} style={{opacity: o, letterSpacing: ls, transform: `translateY(${(1 - o) * 8}px)`}}>
            {line}
            {i === HEADLINE.length - 1 && (
              <span style={{display: 'inline-block', marginLeft: 12, verticalAlign: '-2px'}}>
                <Heart size={30} color={ROSE} outline={false} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Purely decorative graphics (not products): small die-cut hearts and sparkles.
const DECOR: {kind: 'heart' | 'sparkle'; x: number; y: number; size: number; rot: number; enter: number; color: string}[] = [
  {kind: 'sparkle', x: 368, y: 352, size: 40, rot: 0, enter: 26, color: '#ffffff'},
  {kind: 'heart', x: 1000, y: 455, size: 46, rot: 14, enter: 30, color: ROSE},
  {kind: 'sparkle', x: 640, y: 1188, size: 34, rot: 0, enter: 110, color: '#ffffff'},
  {kind: 'heart', x: 95, y: 1590, size: 40, rot: -12, enter: 116, color: '#EDC6CF'},
  {kind: 'sparkle', x: 1012, y: 1170, size: 28, rot: 0, enter: 118, color: '#ffffff'},
];

const DecorLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {DECOR.map((d, i) => {
        const t = frame - d.enter;
        const pop = spring({frame: t, fps, config: {damping: 10, stiffness: 140}});
        const tw = d.kind === 'sparkle' ? 0.85 + 0.15 * Math.sin((frame / fps) * 3 + i) : 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: d.x - d.size / 2,
              top: d.y - d.size / 2,
              width: d.size,
              height: d.size,
              transform: `rotate(${d.rot}deg) scale(${pop * tw})`,
              opacity: Math.min(1, Math.max(0, t / 5)),
              filter: 'drop-shadow(0 4px 6px rgba(70, 50, 38, 0.2))',
            }}
          >
            {d.kind === 'heart' ? <Heart size={d.size} color={d.color} /> : <Sparkle size={d.size} color={d.color} />}
          </div>
        );
      })}
    </>
  );
};

export const ResetCollage: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Background />
      <Logo />
      {PRODUCTS.map((p, i) => (
        <Sticker key={p.sticker} p={p} i={i} />
      ))}
      <DecorLayer />
      <PlanBar />
      <Headline />
      <Audio src={staticFile('music.wav')} volume={(f) => interpolate(f, [0, 10, DURATION - 24, DURATION], [0, 0.8, 0.8, 0], {extrapolateRight: 'clamp'})} />
    </AbsoluteFill>
  );
};
