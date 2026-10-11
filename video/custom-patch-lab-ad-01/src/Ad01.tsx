import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BENEFIT_LINES, C} from './brand';
import {BlueprintGrid, NavyField, SpeedStreaks} from './components/BrandBackdrop';
import {FilmGrain} from './components/FilmGrain';
import {Footage} from './components/Footage';
import {GoldFramePanel} from './components/GoldFramePanel';
import {GoldRule} from './components/GoldRule';
import {KineticText, words} from './components/KineticText';
import {LogoBadge} from './components/LogoBadge';
import {MotionBlur} from './components/MotionBlur';
import edl from './edl.json';
import {easeIn, easeInOut, easeOut, mix, prog} from './motion';

const shot = (id: string) => {
  const s = edl.shots.find((x) => x.id === id);
  if (!s) throw new Error(`Shot ${id} missing from edl.json`);
  return s;
};

/* ------------------------------------------------------------------ cut points
 * 120 BPM → 15 frames per beat. Every cut sits on a kick or snare of the score
 * (scripts/sound-design.py uses the same seconds).                            */
const CUT_1 = 90; // 3.0 s  speed-ramp punch, macro → reveal
const CUT_2 = 180; // 6.0 s  vertical whip → gloved hands
const CUT_3 = 270; // 9.0 s  cream light-streak wipe → jacket
const CUT_4 = 360; // 12.0 s speed-ramp punch → lifestyle
const CUT_5 = 450; // 15.0 s navy diagonal wipe → benefit
const CUT_6 = 480; // 16.0 s logo reveal / outro

export const Ad01: React.FC = () => {
  const f = useCurrentFrame();

  // T1 — zoom punch through the cut at 3.0 s
  const t1Out = prog(f, CUT_1 - 8, 8, easeIn);
  const t1In = prog(f, CUT_1, 9, easeOut);
  // T2 — vertical whip (both shots on screen for 10 frames)
  const t2 = prog(f, CUT_2 - 5, 10, easeInOut);
  const t2Blur = Math.sin(Math.PI * t2) * 55;
  // T3 — light-streak wipe left → right
  const t3 = prog(f, CUT_3 - 5, 11, easeInOut);
  const t3Edge = mix(-260, 1340, t3);
  // T4 — punch into the lifestyle reveal
  const t4 = prog(f, CUT_4, 8, easeOut);
  // T5 — diagonal navy wipe with a gold edge
  const t5 = prog(f, CUT_5 - 4, 10, easeInOut);

  // exposure pops on the two speed-ramp punches
  const pop = (cut: number, peak: number, len: number) =>
    f < cut - 2 ? 0 : peak * prog(f, cut - 2, 2) * (1 - prog(f, cut, len));
  const flash = Math.max(pop(CUT_1, 0.38, 7), pop(CUT_4, 0.2, 6));

  return (
    <AbsoluteFill style={{background: C.navyDeep}}>
      <MotionBlur id="t1out" x={t1Out * 9} y={t1Out * 9} />
      <MotionBlur id="t1in" x={(1 - t1In) * 9} y={(1 - t1In) * 9} />
      <MotionBlur id="t2" x={0} y={t2Blur} />
      <MotionBlur id="t3" x={Math.sin(Math.PI * t3) * 40} y={0} />
      <MotionBlur id="t4" x={(1 - t4) * 5} y={(1 - t4) * 5} />

      {/* ------------------------------------------------ 0–3 s  extreme macro */}
      <Sequence from={shot('s1').from} durationInFrames={shot('s1').frames} name="S1 Macro">
        <Footage
          shot="s1"
          scale={1.15}
          y={100}
          drift={[1, 1.06]}
          shadeTop={1}
          fx={{transform: `scale(${1 + 0.2 * t1Out})`}}
          fxFilter={t1Out > 0.01 ? 'url(#t1out)' : undefined}
        />
        <KineticText
          id="s1"
          style={{top: 262}}
          exitAt={74}
          lines={[
            {words: words('YOUR LOGO'), at: 13, size: 116, stagger: 4},
            {words: words('DESERVES'), at: 21, size: 116},
            {words: words('BETTER.', true), at: 29, size: 128, tracking: [0.16, 0.02]},
          ]}
        />
        <GoldRule at={38} top={660} width={200} exitAt={74} />
      </Sequence>

      {/* ------------------------------------------------ 3–6 s  full reveal */}
      <Sequence from={shot('s2').from} durationInFrames={shot('s2').frames} name="S2 Reveal">
        <Footage
          shot="s2"
          scale={1.12}
          y={-105}
          drift={[1.03, 1]}
          shadeBottom={prog(f, 110, 20)}
          fx={{
            transform: `scale(${1.14 - 0.14 * t1In}) translateY(${-t2 * 1920}px)`,
          }}
          fxFilter={t1In < 0.99 ? 'url(#t1in)' : t2 > 0.01 ? 'url(#t2)' : undefined}
        />
        <KineticText
          id="s2"
          style={{top: 1262}}
          exitAt={78}
          lines={[
            {words: words('PREMIUM', true), at: 36, size: 50, font: 'sans', weight: 800, tracking: [0.75, 0.34]},
            {words: words('CUSTOM PATCHES.'), at: 42, size: 84, stagger: 5, lineHeight: 1.25},
          ]}
        />
        <GoldRule at={52} top={1458} width={260} exitAt={78} />
      </Sequence>

      {/* ------------------------------------------------ 6–9 s  gloved hands */}
      <Sequence from={shot('s3').from} durationInFrames={shot('s3').frames} name="S3 Hands">
        <Footage
          shot="s3"
          scale={1.12}
          y={150}
          drift={[1, 1.05]}
          shadeTop={1}
          fx={{
            transform: `translateY(${(1 - t2) * 1920}px) translateX(${t3 * 90}px)`,
          }}
          fxFilter={t2 > 0 && t2 < 0.99 ? 'url(#t2)' : t3 > 0.01 ? 'url(#t3)' : undefined}
        />
        <KineticText
          id="s3"
          style={{top: 238}}
          exitAt={86}
          lines={[
            {words: words('DETAILS'), at: 20, size: 122, tracking: [0.22, 0.04]},
            {words: words('YOU CAN FEEL.', ['FEEL.']), at: 28, size: 88, stagger: 4, lineHeight: 1.12},
          ]}
        />
      </Sequence>

      {/* ------------------------------------------------ 9–12 s  varsity jacket */}
      <Sequence from={shot('s4').from} durationInFrames={shot('s4').frames} name="S4 Jacket">
        <AbsoluteFill
          style={{
            WebkitMaskImage: `linear-gradient(90deg, #000 ${t3Edge - 140}px, transparent ${t3Edge + 40}px)`,
            maskImage: `linear-gradient(90deg, #000 ${t3Edge - 140}px, transparent ${t3Edge + 40}px)`,
          }}
        >
          <Footage
            shot="s4"
            scale={1.1}
            y={-92}
            drift={[1, 1.03]}
            shadeBottom={prog(f, 290, 20)}
            fx={{transform: `translateX(${(1 - t3) * -90}px)`}}
            fxFilter={t3 > 0 && t3 < 0.99 ? 'url(#t3)' : undefined}
          />
        </AbsoluteFill>
        <KineticText
          id="s4"
          style={{top: 1240}}
          exitAt={83}
          lines={[
            {words: words('YOUR ARTWORK.'), at: 35, size: 84, stagger: 4, lineHeight: 1.1},
            {words: words('OUR CRAFT.', true), at: 50, size: 112, stagger: 5, tracking: [0.14, 0.02]},
          ]}
        />
        <GoldRule at={60} top={1478} width={220} exitAt={83} />
      </Sequence>

      {/* light streaks riding the T3 wipe edge */}
      {t3 > 0 && t3 < 1 && <WipeStreaks edge={t3Edge} strength={Math.sin(Math.PI * t3)} />}

      {/* ------------------------------------------------ 12–15 s  lifestyle */}
      <Sequence from={shot('s5').from} durationInFrames={shot('s5').frames} name="S5 Lifestyle">
        <Footage
          shot="s5"
          scale={1.05}
          y={-46}
          drift={[1, 1.04]}
          shadeBottom={1}
          fx={{transform: `scale(${1.07 - 0.07 * t4})`}}
          fxFilter={t4 < 0.99 ? 'url(#t4)' : undefined}
        />
        <KineticText
          id="s5"
          style={{top: 1128}}
          exitAt={84}
          exit="blur"
          lines={[
            {words: words('FREE', true), at: 15, size: 112, tracking: [0.3, 0.06]},
            {words: words('ARTWORK'), at: 21, size: 104, lineHeight: 1.04},
            {words: words('SUPPORT.'), at: 28, size: 104, lineHeight: 1.04},
          ]}
        />
      </Sequence>

      {flash > 0.001 && (
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #FFF3D6, #F4B942 70%)', opacity: flash, mixBlendMode: 'screen'}} />
      )}

      {/* ------------------------------------------------ 15–19 s  branded close */}
      <Sequence from={CUT_5 - 4} durationInFrames={edl.durationInFrames - CUT_5 + 4} name="Brand layer">
        <DiagonalReveal p={t5}>
          <BrandClose />
        </DiagonalReveal>
      </Sequence>

      <FilmGrain />
      <Audio src={staticFile('audio/ad01-temp-score.wav')} />
    </AbsoluteFill>
  );
};

/** Bright cream bars that ride the leading edge of the T3 wipe. */
const WipeStreaks: React.FC<{edge: number; strength: number}> = ({edge, strength}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: edge - 120,
        width: 160,
        background: 'linear-gradient(90deg, rgba(255,240,210,0), rgba(255,240,210,0.55), rgba(255,240,210,0))',
        opacity: strength,
        filter: 'blur(18px)',
      }}
    />
    {[180, 420, 610, 960, 1130, 1380, 1590, 1760].map((y, i) => (
      <div
        key={y}
        style={{
          position: 'absolute',
          top: y,
          left: edge - 420 - (i % 3) * 90,
          width: 460 + (i % 2) * 200,
          height: 6 + (i % 3) * 4,
          borderRadius: 8,
          background: 'linear-gradient(90deg, rgba(255,249,243,0), rgba(255,249,243,0.95))',
          filter: 'blur(3px)',
          opacity: strength * (0.55 + (i % 2) * 0.4),
        }}
      />
    ))}
  </AbsoluteFill>
);

/** Reveals children behind a diagonal edge sweeping up from the bottom-right, traced in gold. */
const DiagonalReveal: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => {
  const d = mix(-0.05, 1.15, p);
  const x0 = 1080 - d * 2600;
  const y0 = 1920 - d * 3400;
  const vx = 1080 - x0;
  const vy = y0 - 1920;
  const a = {x: x0 - vx * 2, y: 1920 - vy * 2};
  const b = {x: 1080 + vx * 2, y: y0 + vy * 2};
  const clip = p >= 1 ? 'none' : `polygon(${a.x}px ${a.y}px, ${b.x}px ${b.y}px, 6000px ${b.y}px, 6000px 6000px, ${a.x}px 6000px)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: clip}}>{children}</AbsoluteFill>
      {p > 0 && p < 1 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <line
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#F4B942"
            strokeWidth={5}
            style={{filter: 'drop-shadow(0 0 12px rgba(244,185,66,0.9))'}}
          />
        </svg>
      )}
    </AbsoluteFill>
  );
};

/** 15–19 s: benefit beat (design-02 language) handing over to the outro (design-03). Local frame 0 = 446. */
const BrandClose: React.FC = () => {
  const f = useCurrentFrame() + CUT_5 - 4; // back to global frames for readability
  const patchIn = prog(f, CUT_5 - 2, 16, easeOut);
  const patchOut = prog(f, CUT_6 - 8, 9, easeIn);
  const outroZoom = mix(1, 1.025, prog(f, CUT_6, 90, easeInOut));
  return (
    <AbsoluteFill>
      <NavyField />
      <Sequence from={0} name="Benefit grid">
        <BlueprintGrid at={4} top={420} height={600} opacity={1 - prog(f, CUT_6 - 4, 10)} />
      </Sequence>
      <Sequence from={0} name="Streaks">
        <SpeedStreaks
          seed="close"
          at={0}
          speed={16}
          bands={[
            {y: 470, side: 'right'},
            {y: 930, side: 'left'},
            {y: 1260, side: 'left'},
          ]}
          opacity={0.75}
        />
      </Sequence>

      {/* benefit beat, 15–16 s */}
      <MotionBlur id="patchblur" x={(1 - patchIn) * 14 + patchOut * 20} y={(1 - patchIn) * 8 + patchOut * 14} />
      <Img
        src={staticFile('brand/lion-patch.png')}
        style={{
          position: 'absolute',
          width: 880,
          left: 300,
          top: 1010,
          transform: `translate(${(1 - patchIn) * 320 + patchOut * 520}px, ${(1 - patchIn) * 300 + patchOut * 420}px) rotate(${mix(9, -4, patchIn)}deg)`,
          filter: `${patchIn < 0.99 || patchOut > 0.01 ? 'url(#patchblur) ' : ''}drop-shadow(0 40px 60px rgba(0,0,0,0.6))`,
          opacity: 1 - prog(f, CUT_6 - 3, 4),
        }}
      />
      <Sequence from={0} durationInFrames={CUT_6 + 6 - (CUT_5 - 4)} name="Benefit pill">
        <BenefitPill />
      </Sequence>

      {/* outro, 16–19 s — design-03 */}
      <Sequence from={CUT_6 - (CUT_5 - 4)} name="Outro">
        <AbsoluteFill style={{transform: `scale(${outroZoom})`}}>
          <Outro />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const BenefitPill: React.FC = () => (
  <GoldFramePanel at={6} top={560} width={800} height={316} exitAt={30}>
    <KineticText
      id="benefit"
      style={{position: 'relative'}}
      lines={[
        {words: words(BENEFIT_LINES[0]), at: 10, size: 86, stagger: 3, lineHeight: 1.08},
        {words: words(BENEFIT_LINES[1], true), at: 14, size: 98, stagger: 3, lineHeight: 1.08},
      ]}
    />
  </GoldFramePanel>
);

/** Local frame 0 = 16.0 s. Logo → name → CTA, each on a beat. */
const Outro: React.FC = () => (
  <AbsoluteFill>
    <BlueprintGrid at={4} top={660} height={360} opacity={0.9} />
    <LogoBadge at={0} size={380} top={268} />
    <KineticText
      id="name"
      style={{top: 712}}
      lines={[
        {words: words('CUSTOM'), at: 14, size: 124, tracking: [0.24, 0.03]},
        {words: words('PATCH LAB'), at: 19, size: 124, stagger: 4, tracking: [0.24, 0.03]},
      ]}
    />
    <GoldFramePanel at={26} top={1048} width={820} height={396}>
      <KineticText
        id="cta"
        style={{position: 'relative'}}
        lines={[
          {words: words('GET YOUR'), at: 30, size: 72, stagger: 4, lineHeight: 1.12},
          {words: words('FREE MOCKUP', true), at: 38, size: 100, stagger: 4, lineHeight: 1.12},
          {words: words('WITHIN 24 HOURS'), at: 46, size: 50, font: 'sans', weight: 800, stagger: 3, lineHeight: 1.45, tracking: [0.3, 0.12]},
        ]}
      />
    </GoldFramePanel>
  </AbsoluteFill>
);
