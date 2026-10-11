import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FONT_CONDENSED} from '../shared/brand';
import {FilmGrain} from '../shared/components/FilmGrain';
import {Footage} from '../shared/components/Footage';
import {
  BarWipe,
  COBALT,
  DimensionCallout,
  HyperLine,
  IVORY,
  OutlineSweep,
  SpeedLinesFx,
  StepTag,
  ThreadPath,
  TrackedLabel,
} from '../shared/components/Hyper';
import {LogoBadge} from '../shared/components/LogoBadge';
import {MotionBlur} from '../shared/components/MotionBlur';
import {easeInOut, easeOut, mix, prog} from '../shared/motion';
import edl from './edl.json';

/* 120 BPM → one beat = 15 frames. Cuts and type hits sit on beats or on the
 * physical action they describe (press closing, finger press). Cue sheet:
 * docs/AD04-production-notes.md. */
const [CUT_PRESS, CUT_PRESS2, CUT_LIFT, CUT_PEEL, CUT_MACRO, CUT_JACKET, CUT_TOUCH, CUT_MONTAGE, CUT_CTA] = edl.cuts;
const PRESS_CLOSE = 105; // platen meets the jacket in shot p2
const PUFF_PRESS = 450; // fingers press the stitching in shot t

const shot = (id: string) => {
  const s = edl.shots.find((x) => x.id === id);
  if (!s) throw new Error(`Shot ${id} missing from edl.json`);
  return s;
};
const seg = (id: string) => `segments/ad04/${id}.mp4`;
const Shot: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => (
  <Sequence from={shot(id).from} durationInFrames={shot(id).frames} name={id}>
    {children}
  </Sequence>
);
/** Navy legibility gradient matching the styleframes' dark upper field. */
const NavyTop: React.FC<{to?: number; strength?: number}> = ({to = 44, strength = 1}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(10,22,40,${0.94 * strength}) 0%, rgba(10,22,40,${0.78 * strength}) ${to * 0.55}%, rgba(10,22,40,0) ${to}%)`,
    }}
  />
);
const NavyBottom: React.FC<{from?: number; strength?: number}> = ({from = 70, strength = 1}) => (
  <AbsoluteFill
    style={{background: `linear-gradient(0deg, rgba(10,22,40,${0.9 * strength}) 0%, rgba(10,22,40,0) ${100 - from}%)`}}
  />
);

export const Ad04: React.FC = () => {
  const f = useCurrentFrame();

  const t1 = prog(f, CUT_PRESS - 5, 10, easeInOut); // bar wipe still → press
  const punch = (cut: number) => (f >= cut ? 1 - prog(f, cut, 6, easeOut) : 0);
  const whip = prog(f, CUT_PEEL - 4, 8, easeInOut); // press → peel
  const push = prog(f, CUT_JACKET - 4, 8, easeInOut); // macro → jacket (vertical push)
  const t6 = prog(f, CUT_TOUCH - 5, 10, easeInOut); // jacket → touch (vertical bars)
  const ctaIn = prog(f, CUT_CTA - 4, 9, easeOut); // navy panel rises into the end card
  const pressNudge = f >= PRESS_CLOSE && f < PRESS_CLOSE + 4 ? [6, -4, 2, 0][f - PRESS_CLOSE] : 0;
  const montagePunch = f >= CUT_MONTAGE && f < CUT_CTA ? 1 - prog(f, CUT_MONTAGE + Math.floor((f - CUT_MONTAGE) / 15) * 15, 5, easeOut) : 0;

  return (
    <AbsoluteFill style={{background: '#0A1628'}}>
      <MotionBlur id="a4-whip" x={Math.sin(Math.PI * whip) * 70} y={0} />
      <MotionBlur id="a4-push" x={0} y={Math.sin(Math.PI * push) * 60} />
      <MotionBlur id="a4-punch" x={montagePunch * 6} y={montagePunch * 6} />

      {/* ================= 01 HOOK 0–2.0 s — the VYBE master transfer, styleframe 01 */}
      <Sequence from={0} durationInFrames={CUT_PRESS + 5} name="01 Hook (master still)">
        <HookStill />
        <NavyTop to={46} />
        <NavyBottom from={64} strength={1} />
        <TrackedLabel text="CUSTOM EMBROIDERY" at={3} top={236} size={32} exitAt={52} />
        <HyperLine id="raise" text="RAISE" at={0} mode="rise" top={300} size={182} exitAt={52} />
        <HyperLine id="your" text="YOUR" at={7} mode="snapR" top={458} size={182} color={COBALT} exitAt={53} shadow={false} />
        <HyperLine id="style" text="STYLE." at={15} mode="impact" top={616} size={182} exitAt={54} />
        <ThreadPath d="M -40 1350 C 220 1290, 470 1400, 760 1330 S 1060 1270, 1140 1290" at={20} dur={26} color={COBALT} width={6} exitAt={52} />
        <TrackedLabel text="3D PUFF EMBROIDERY" at={28} top={1446} size={40} exitAt={52} />
      </Sequence>

      {/* ================= 02 PROCESS 2.0–5.0 s — place · press · lift */}
      <Shot id="p1">
        <Footage src={seg('p1')} scale={1.06} drift={[1.04, 1]} shadeTop={0.8} />
      </Shot>
      <Shot id="p2">
        <Footage
          src={seg('p2')}
          scale={1.08}
          y={-40}
          drift={[1, 1.04]}
          shadeTop={1}
          fx={{transform: `translateY(${pressNudge}px) scale(${1 + 0.06 * punch(CUT_PRESS2)})`}}
          fxFilter={punch(CUT_PRESS2) > 0.02 ? 'url(#a4-punch)' : undefined}
        />
      </Shot>
      <Shot id="p3">
        <Footage
          src={seg('p3')}
          scale={1.06}
          drift={[1, 1.03]}
          shadeTop={1}
          fx={{transform: `scale(${1 + 0.06 * punch(CUT_LIFT)}) translateX(${-whip * 1080}px)`}}
          fxFilter={whip > 0.01 ? 'url(#a4-whip)' : undefined}
        />
      </Shot>
      <Sequence from={CUT_PRESS} durationInFrames={CUT_PEEL - CUT_PRESS} name="02 Type">
        <StepTag index="01" label="PLACE" at={2} dur={22} exitAt={CUT_PRESS2 - CUT_PRESS} />
        <StepTag index="02" label="PRESS" at={CUT_PRESS2 - CUT_PRESS + 1} dur={60} exitAt={CUT_PEEL - CUT_PRESS - 6} />
        <HyperLine id="turnup" text="TURN UP" at={PRESS_CLOSE - CUT_PRESS - 8} mode="wipe" top={380} size={150} font="condensed" weight={700} exitAt={CUT_PEEL - CUT_PRESS - 9} />
        <HyperLine id="texture" text="THE TEXTURE." at={PRESS_CLOSE - CUT_PRESS} mode="wipe" top={530} size={150} font="condensed" weight={700} color={COBALT} exitAt={CUT_PEEL - CUT_PRESS - 8} />
      </Sequence>

      {/* ================= 03 PEEL 5.0–9.0 s — let the reveal play clean */}
      <Shot id="pe">
        <Footage
          src={seg('pe')}
          scale={1.04}
          drift={[1, 1.04]}
          fx={{transform: `translateX(${(1 - whip) * 1080}px)`}}
          fxFilter={whip < 0.99 ? 'url(#a4-whip)' : undefined}
        />
        <StepTag index="03" label="PEEL" at={6} dur={110} exitAt={shot('pe').frames - 8} />
      </Shot>
      <SpeedLinesFx strength={Math.sin(Math.PI * whip)} />

      {/* ================= 04 MACRO 9.0–11.5 s — the raised stitch is the hero */}
      <Shot id="m">
        <Footage
          src={seg('m')}
          scale={1.04}
          drift={[1, 1.06]}
          shadeBottom={0.9}
          fx={{transform: `scale(${1 + 0.07 * punch(CUT_MACRO)}) translateY(${-push * 1920}px)`}}
          fxFilter={push > 0.01 ? 'url(#a4-push)' : punch(CUT_MACRO) > 0.02 ? 'url(#a4-punch)' : undefined}
        />
        <DimensionCallout x={330} y={560} at={12} label="RAISED STITCH" exitAt={66} />
        <HyperLine id="puff3d" text="3D PUFF" at={6} mode="rise" top={1250} size={120} font="condensed" weight={700} exitAt={68} />
        <TrackedLabel text="EMBROIDERY" at={12} top={1384} size={38} exitAt={68} />
      </Shot>

      {/* ================= 05 FINISHED JACKET 11.5–14.0 s */}
      <Shot id="j">
        <Footage
          src={seg('j')}
          scale={1.04}
          y={60}
          drift={[1.05, 1]}
          shadeTop={0.9}
          fx={{transform: `translateY(${(1 - push) * 1920}px)`}}
          fxFilter={push < 0.99 ? 'url(#a4-push)' : undefined}
        />
        <HyperLine id="made" text="MADE TO" at={10} mode="snapL" top={236} size={130} font="condensed" weight={600} tracking={0.06} exitAt={70} />
        <HyperLine id="standout" text="STAND OUT." at={18} mode="impact" top={370} size={170} font="condensed" weight={700} color={IVORY} exitAt={70} />
      </Shot>

      {/* ================= 06 TOUCH 14.0–17.0 s — FEEL THE PUFF, styleframe 02 */}
      <Shot id="t">
        <Footage src={seg('t')} scale={1.1} y={170} drift={[1, 1.05]} />
        <NavyTop to={50} />
        <NavyBottom from={78} />
        <TrackedLabel text="TEXTURE YOU CAN FEEL" at={4} top={226} size={32} exitAt={82} />
        <HyperLine id="feel" text="FEEL" at={8} mode="rise" top={282} size={150} exitAt={82} />
        <HyperLine id="the" text="THE" at={16} mode="rise" top={410} size={150} exitAt={83} />
        <HyperLine id="puff" text="PUFF." at={PUFF_PRESS - CUT_TOUCH} mode="impact" top={538} size={150} color={COBALT} exitAt={84} shadow={false} />
        <TrackedLabel text="RAISED STITCHING. REAL DIMENSION." at={38} top={1478} size={34} exitAt={84} />
      </Shot>
      <BarWipe p={t6} vertical />
      <BarWipe p={t1} />

      {/* ================= 07 STREETWEAR ENERGY 17.0–20.0 s — fast cuts (model footage not supplied) */}
      {['x1', 'x2', 'x3', 'x4', 'x5', 'x6'].map((id, i) => (
        <Shot key={id} id={id}>
          <Footage
            src={seg(id)}
            scale={[1.1, 1.04, 1.08, 1.06, 1.04, 1.1][i]}
            y={[120, 0, 40, 60, 0, 120][i]}
            drift={i % 2 ? [1.06, 1] : [1, 1.06]}
            shadeTop={0.9}
            shadeBottom={0.9}
            fx={{transform: `scale(${1 + 0.08 * montagePunch})`}}
            fxFilter={montagePunch > 0.02 ? 'url(#a4-punch)' : undefined}
          />
        </Shot>
      ))}
      <Sequence from={CUT_MONTAGE} durationInFrames={CUT_CTA - CUT_MONTAGE} name="07 Type">
        <OutlineSweep text="YOUR DESIGN  YOUR STYLE" at={0} dur={90} top={1560} size={150} dir={1} opacity={0.4} />
        <HyperLine id="ydesign" text="YOUR DESIGN." at={2} mode="snapL" top={250} size={150} font="condensed" weight={700} exitAt={84} />
        <HyperLine id="ystyle" text="YOUR STYLE." at={45} mode="snapR" top={1276} size={150} font="condensed" weight={700} color={COBALT} exitAt={84} />
      </Sequence>

      {/* ================= 08 CTA 20.0–25.0 s — styleframe 03 */}
      <Sequence from={CUT_CTA - 4} name="08 CTA">
        <AbsoluteFill style={{transform: `translateY(${(1 - ctaIn) * 100}%)`}}>
          <EndCard />
        </AbsoluteFill>
      </Sequence>

      <FilmGrain opacity={0.06} />
      <Audio src={staticFile('audio/ad04-mix.wav')} />
    </AbsoluteFill>
  );
};

/** The VYBE master still: a quick push with a hint of parallax so the hook is never static. */
const HookStill: React.FC = () => {
  const f = useCurrentFrame();
  const s = mix(1.16, 1.04, prog(f, 0, 64, easeOut));
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img
        src={staticFile('brand/ad04-vybe-master.jpg')}
        style={{
          width: 1080,
          height: 1935,
          objectFit: 'cover',
          transform: `translateY(${mix(40, 90, prog(f, 0, 64, easeOut))}px) scale(${s})`,
          filter: 'contrast(1.05) saturate(1.06)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Local frame 0 = CUT_CTA - 4. Logo → YOUR DESIGN. → OUR CRAFT. → benefits → CTA → hold. */
const EndCard: React.FC = () => {
  const lf = useCurrentFrame();
  const at = (g: number) => g - (CUT_CTA - 4);
  const panel = prog(lf, at(CUT_CTA + 52), 12, easeOut);
  const shine = prog(lf, at(CUT_CTA + 96), 20, easeInOut);
  const zoom = mix(1, 1.02, prog(lf, 0, 154, easeInOut));
  return (
    <AbsoluteFill style={{background: '#0A1628'}}>
      <AbsoluteFill>
        <Footage src={seg('cta')} scale={1.02} y={150} drift={[1.06, 1]} />
      </AbsoluteFill>
      {/* push the studio wall into navy so the jacket floats like the styleframe */}
      <AbsoluteFill style={{background: 'radial-gradient(60% 34% at 50% 52%, rgba(10,22,40,0) 55%, rgba(10,22,40,0.85) 100%)'}} />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, #0A1628 0%, #0A1628 22%, rgba(10,22,40,0.55) 34%, rgba(10,22,40,0) 42%, rgba(10,22,40,0) 60%, rgba(10,22,40,0.7) 66%, #0A1628 76%)',
        }}
      />
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <LogoBadge at={at(CUT_CTA + 2)} size={210} top={226} />
        <HyperLine id="cta-design" text="YOUR DESIGN." at={at(CUT_CTA + 10)} mode="rise" top={466} size={136} font="condensed" weight={700} />
        <HyperLine id="cta-craft" text="OUR CRAFT." at={at(CUT_CTA + 19)} mode="impact" top={600} size={136} font="condensed" weight={700} color={COBALT} shadow={false} />
        <ThreadPath d="M 250 760 C 420 790, 660 730, 830 765" at={at(CUT_CTA + 26)} dur={14} color={IVORY} width={4} length={700} />
        <BenefitRow at={at(CUT_CTA + 38)} top={1196} />
        {/* CTA panel slides up (preset E) */}
        <div
          style={{
            position: 'absolute',
            left: 90,
            right: 90,
            top: 1288,
            height: 196,
            background: COBALT,
            boxShadow: '0 22px 50px rgba(0,0,0,0.55)',
            transform: `translateY(${(1 - panel) * 120}px)`,
            opacity: panel,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CtaLine text="GET YOUR FREE MOCKUP" at={at(CUT_CTA + 56)} />
          <CtaLine text="WITHIN 24 HOURS" at={at(CUT_CTA + 62)} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(110deg, transparent ${mix(-30, 110, shine)}%, rgba(255,255,255,0.28) ${mix(-20, 120, shine)}%, transparent ${mix(-10, 130, shine)}%)`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** FREE SHIPPING • FREE BACKING — two benefits snapping in from opposite sides, 6 frames apart. */
const BenefitRow: React.FC<{at: number; top: number}> = ({at, top}) => {
  const f = useCurrentFrame();
  const item = (text: string, start: number, dir: number) => {
    const p = prog(f, start, 8, easeOut);
    return (
      <span style={{display: 'inline-block', transform: `translateX(${dir * (1 - p) * 420}px)`, opacity: Math.min(1, p * 3)}}>{text}</span>
    );
  };
  const dot = prog(f, at + 4, 6, easeOut);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 26,
        fontFamily: FONT_CONDENSED,
        fontWeight: 600,
        fontSize: 66,
        letterSpacing: '0.03em',
        color: IVORY,
        filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.55))',
      }}
    >
      {item('FREE SHIPPING', at, -1)}
      <span style={{width: 14, height: 14, borderRadius: 7, background: COBALT, transform: `scale(${dot})`}} />
      {item('FREE BACKING', at + 6, 1)}
    </div>
  );
};

const CtaLine: React.FC<{text: string; at: number}> = ({text, at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 9, easeOut);
  return (
    <div style={{overflow: 'hidden'}}>
      <div
        style={{
          fontFamily: FONT_CONDENSED,
          fontWeight: 700,
          fontSize: 80,
          lineHeight: 1.04,
          letterSpacing: `${mix(0.14, 0.02, p)}em`,
          color: IVORY,
          transform: `translateY(${(1 - p) * 105}%)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

