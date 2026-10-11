import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, CLAIMS} from '../shared/brand';
import {AccentBar, BenefitBadge, StitchTag, WordCaption} from '../shared/components/Badges';
import {FilmGrain} from '../shared/components/FilmGrain';
import {Footage} from '../shared/components/Footage';
import {GoldRule} from '../shared/components/GoldRule';
import {KineticText, words} from '../shared/components/KineticText';
import {LogoBadge} from '../shared/components/LogoBadge';
import {MotionBlur} from '../shared/components/MotionBlur';
import {DiagonalReveal, WipeStreaks} from '../shared/components/Transitions';
import {easeInOut, easeOut, mix, prog} from '../shared/motion';
import edl from './edl.json';
import vo from './vo-timing.json';

/* --------------------------------------------------------------- timing
 * The voiceover (assets/source/ad02/audio) is the timeline driver. Every cue
 * below is looked up from vo-timing.json, which scripts/vo-timing.py measures
 * from the recording, so a re-recorded take re-times the graphics.          */
const VO_OFFSET = edl.voOffsetFrames; // VO starts at 0.4 s, after the opening impact
const sf = (s: number) => Math.round(s * edl.fps) + VO_OFFSET;
const phrase = (i: number) => vo.phrases[i];
const word = (i: number, w: string) => {
  const hit = phrase(i).words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w);
  if (!hit) throw new Error(`"${w}" not in VO phrase ${i}`);
  return sf(hit.start);
};

const shot = (id: string) => {
  const s = edl.shots.find((x) => x.id === id);
  if (!s) throw new Error(`Shot ${id} missing from edl.json`);
  return s;
};
const seg = (id: string) => `segments/ad02/${id}.mp4`;

// Cuts (edl.json, shared with scripts/sound-design-ad02.py) sit on the 100 BPM
// grid (18 frames / beat) inside the VO's natural pauses:
// 3.6 s punch → needle · 5.4 s whip → laptop · 6.6 s streak wipe → hands ·
// 8.4 s punch → inspection · 12.0 s vertical whip → jacket + cap · 13.8 s navy wipe → outro
const [CUT_1, CUT_2, CUT_3, CUT_4, CUT_5, CUT_6] = edl.cuts;

export const Ad02: React.FC = () => {
  const f = useCurrentFrame();

  const t1 = prog(f, CUT_1, 9, easeOut);
  const t2 = prog(f, CUT_2 - 5, 10, easeInOut);
  const t3 = prog(f, CUT_3 - 5, 10, easeInOut);
  const t3Edge = mix(-260, 1340, t3);
  const t4 = prog(f, CUT_4, 8, easeOut);
  const t5 = prog(f, CUT_5 - 5, 10, easeInOut);
  const t6 = prog(f, CUT_6 - 4, 10, easeInOut);
  const pop = (cut: number, peak: number, len: number) =>
    f < cut - 2 ? 0 : peak * prog(f, cut - 2, 2) * (1 - prog(f, cut, len));
  const flash = Math.max(pop(CUT_1, 0.34, 7), pop(CUT_4, 0.2, 6));

  // design-01 split: finished patch wipes into the right half on "premium"
  const premium = word(1, 'premium');
  const split = prog(f, premium - 8, 10, easeOut);
  const splitX = mix(1080, 540, split);

  return (
    <AbsoluteFill style={{background: C.navyDeep}}>
      <MotionBlur id="a2-t1" x={(1 - t1) * 9} y={(1 - t1) * 9} />
      <MotionBlur id="a2-t2" x={Math.sin(Math.PI * t2) * 55} y={0} />
      <MotionBlur id="a2-t3" x={Math.sin(Math.PI * t3) * 40} y={0} />
      <MotionBlur id="a2-t4" x={(1 - t4) * 5} y={(1 - t4) * 5} />
      <MotionBlur id="a2-t5" x={0} y={Math.sin(Math.PI * t5) * 55} />

      {/* ------------------------------------------- S1 hook: sketch → premium */}
      <Sequence from={shot('a1').from} durationInFrames={shot('a1').frames} name="S1 Sketch">
        <Footage src={seg('a1')} scale={1.06} y={0} drift={[1, 1.06]} shadeTop={0.9} shadeBottom={0.9} />
      </Sequence>
      <Sequence from={shot('a2').from} durationInFrames={shot('a2').frames} name="S1 Patch half">
        <AbsoluteFill style={{clipPath: `inset(0 0 0 ${splitX}px)`}}>
          <Footage src={seg('a2')} scale={1.12} y={40} drift={[1.04, 1]} shadeTop={0.9} shadeBottom={0.9} />
        </AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: splitX - 2,
            width: 4,
            background: `linear-gradient(180deg, rgba(248,103,60,0), ${C.orange} 30%, ${C.orange} 70%, rgba(248,103,60,0))`,
            boxShadow: '0 0 18px rgba(248,103,60,0.8)',
            opacity: split > 0 ? 1 : 0,
          }}
        />
      </Sequence>
      <Sequence from={0} durationInFrames={CUT_1} name="S1 Type">
        <KineticText
          id="hook"
          style={{top: 226}}
          exitAt={100}
          lines={[
            {words: words('GOT A'), at: word(0, 'got'), size: 196, font: 'condensed', stagger: 4, lineHeight: 0.98, tracking: [0.06, 0.0]},
            {words: words('LOGO?'), at: word(0, 'logo'), size: 236, font: 'condensed', lineHeight: 0.98, tracking: [0.08, 0.0]},
          ]}
        />
        <KineticText
          id="premium"
          style={{top: 1176}}
          exitAt={100}
          lines={[
            {words: words('MAKE IT'), at: word(1, 'something'), size: 92, font: 'condensed', weight: 600, stagger: 4, tracking: [0.5, 0.3]},
            {words: words('PREMIUM', true), at: premium, size: 206, font: 'condensed', lineHeight: 1.0, tracking: [0.12, 0.0]},
          ]}
        />
        <AccentBar at={premium + 6} top={1478} width={690} height={26} exitAt={100} />
      </Sequence>

      {/* ------------------------------------------- S2 manufacturing */}
      <Sequence from={shot('b1').from} durationInFrames={shot('b1').frames} name="S2 Needle">
        <Footage
          src={seg('b1')}
          scale={1.14}
          y={70}
          drift={[1, 1.07]}
          shadeBottom={1}
          fx={{transform: `scale(${1.15 - 0.15 * t1}) translateX(${-t2 * 1080}px)`}}
          fxFilter={t1 < 0.99 ? 'url(#a2-t1)' : t2 > 0.01 ? 'url(#a2-t2)' : undefined}
        />
      </Sequence>
      <Sequence from={shot('b2').from} durationInFrames={shot('b2').frames} name="S2 Artwork to patch">
        <Footage
          src={seg('b2')}
          scale={1.08}
          y={-30}
          drift={[1, 1.05]}
          shadeBottom={1}
          fx={{transform: `translateX(${(1 - t2) * 1080 + t3 * 90}px)`}}
          fxFilter={t2 < 0.99 ? 'url(#a2-t2)' : t3 > 0.01 ? 'url(#a2-t3)' : undefined}
        />
      </Sequence>
      <Sequence from={CUT_1} durationInFrames={CUT_3 - CUT_1} name="S2 Type">
        <KineticText
          id="stitch"
          style={{top: 1218}}
          exitAt={84}
          lines={[
            {words: words('DETAIL IN'), at: word(2, 'detailed') - CUT_1, size: 128, font: 'condensed', stagger: 4, lineHeight: 1.0, tracking: [0.14, 0.02]},
            {words: words('EVERY STITCH.', true), at: word(2, 'embroidery') - CUT_1, size: 128, font: 'condensed', stagger: 5, lineHeight: 1.0, tracking: [0.14, 0.02]},
          ]}
        />
        <GoldRule at={word(2, 'embroidery') - CUT_1 + 14} top={1490} width={300} exitAt={84} />
      </Sequence>
      <Sequence from={shot('b3').from} durationInFrames={shot('b3').frames} name="S2 Hands lift">
        <AbsoluteFill
          style={{
            WebkitMaskImage: `linear-gradient(90deg, #000 ${t3Edge - 140}px, transparent ${t3Edge + 40}px)`,
            maskImage: `linear-gradient(90deg, #000 ${t3Edge - 140}px, transparent ${t3Edge + 40}px)`,
          }}
        >
          <Footage
            src={seg('b3')}
            scale={1.08}
            y={-60}
            drift={[1, 1.05]}
            shadeBottom={1}
            fx={{transform: `translateX(${(1 - t3) * -90}px)`}}
            fxFilter={t3 > 0 && t3 < 0.99 ? 'url(#a2-t3)' : undefined}
          />
        </AbsoluteFill>
        <WordCaption
          top={1392}
          exitAt={CUT_4 - shot('b3').from - 8}
          words={phrase(3).words.map((w) => ({w: w.w.replace(/[.,]/g, ''), start: sf(w.start) - shot('b3').from}))}
        />
      </Sequence>
      {t3 > 0 && t3 < 1 && <WipeStreaks edge={t3Edge} strength={Math.sin(Math.PI * t3)} />}

      {/* ------------------------------------------- S3 inspection + benefits */}
      <Sequence from={shot('c').from} durationInFrames={shot('c').frames} name="S3 Inspection">
        <Footage
          src={seg('c')}
          scale={1.06}
          y={-70}
          drift={[1, 1.05]}
          shadeBottom={1}
          fx={{transform: `scale(${1.07 - 0.07 * t4}) translateY(${-t5 * 1920}px)`}}
          fxFilter={t4 < 0.99 ? 'url(#a2-t4)' : t5 > 0.01 ? 'url(#a2-t5)' : undefined}
        />
        {/* Benefit claims are spoken in the VO. $0 setup fees still needs client sign-off (see CLAIMS). */}
        <BenefitBadge id="b-art" at={word(4, 'free') - CUT_4} exitAt={word(5, 'zero') - CUT_4 - 8} top={1318} icon="pen" lead="FREE" rest="ARTWORK SUPPORT" />
        <BenefitBadge id="b-fee" at={word(5, 'zero') - CUT_4} exitAt={CUT_5 - CUT_4 - 10} top={1318} icon="check" lead="$0" rest="SETUP FEES" />
      </Sequence>

      {/* ------------------------------------------- S4 finished products */}
      <Sequence from={shot('d').from} durationInFrames={shot('d').frames} name="S4 Jacket + cap">
        <Footage
          src={seg('d')}
          scale={1.08}
          y={70}
          drift={[1.06, 1]}
          shadeTop={1}
          fx={{transform: `translateY(${(1 - t5) * 1920}px)`}}
          fxFilter={t5 < 0.99 ? 'url(#a2-t5)' : undefined}
        />
        <KineticText
          id="standout"
          style={{top: 236}}
          exitAt={CUT_6 - shot('d').from - 6}
          lines={[
            {words: words('MAKE YOUR BRAND'), at: word(6, 'ready') - shot('d').from, size: 104, font: 'condensed', stagger: 4, lineHeight: 1.05, tracking: [0.16, 0.03]},
            {words: words('STAND OUT.', true), at: word(6, 'make') - shot('d').from, size: 176, font: 'condensed', stagger: 5, lineHeight: 1.0, tracking: [0.1, 0.0]},
          ]}
        />
      </Sequence>

      {flash > 0.001 && (
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #FFF3D6, #F4B942 70%)', opacity: flash, mixBlendMode: 'screen'}} />
      )}

      {/* ------------------------------------------- S5 branded outro (design-03) */}
      <Sequence from={shot('e').from} durationInFrames={shot('e').frames} name="S5 Outro">
        <DiagonalReveal p={t6}>
          <Outro />
        </DiagonalReveal>
      </Sequence>

      <FilmGrain />
      <Audio src={staticFile('audio/ad02-mix.wav')} />
    </AbsoluteFill>
  );
};

/** Local frame 0 = shot e start (13.67 s). */
const Outro: React.FC = () => {
  const local = useCurrentFrame();
  const g = local + shot('e').from;
  const at = (globalFrame: number) => globalFrame - shot('e').from;
  const zoom = mix(1, 1.03, prog(g, CUT_6, 186, easeInOut));
  return (
    <AbsoluteFill>
      {/* the machine keeps running behind the brand, softened and pushed into navy */}
      <AbsoluteFill style={{filter: 'blur(7px) brightness(0.62) saturate(0.8)', transform: 'scale(1.08)'}}>
        <Footage src={seg('e')} scale={1.1} y={-260} drift={[1.05, 1.0]} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(8,46,59,0.35) 0%, rgba(8,46,59,0.78) 30%, rgba(5,34,44,0.94) 55%, ${C.navyDeep} 100%)`,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(70% 35% at 50% 26%, rgba(15,124,138,0.35), rgba(0,0,0,0))'}} />
      {/* thin brand corner brackets from the styleframe */}
      <Brackets at={at(CUT_6 + 10)} />
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <LogoBadge at={at(CUT_6 + 4)} size={430} top={262} />
        <KineticText
          id="cta"
          style={{top: 790}}
          lines={[
            {words: words('GET YOUR'), at: at(word(7, 'get')), size: 96, font: 'condensed', weight: 600, stagger: 4, lineHeight: 1.1, tracking: [0.4, 0.2]},
            {words: words('FREE MOCKUP', true), at: at(word(7, 'free')), size: 168, font: 'condensed', stagger: 5, lineHeight: 1.0, tracking: [0.1, 0.0]},
            {words: words('WITHIN 24 HOURS'), at: at(word(7, 'within')), size: 84, font: 'condensed', weight: 600, stagger: 4, lineHeight: 1.3, tracking: [0.3, 0.12]},
          ]}
        />
        <GoldRule at={at(word(7, 'within')) + 16} top={1290} width={420} />
        {CLAIMS.websiteConfirmed && <StitchTag at={at(word(7, 'hours')) + 6} top={1340} text="CUSTOMPATCHLAB.COM" />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Brackets: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 20, easeOut);
  const len = 120 * p;
  const corner = (x: number, y: number, dx: number, dy: number, color: string) => (
    <g stroke={color} strokeWidth={3} fill="none" opacity={0.85}>
      <line x1={x} y1={y} x2={x + dx * len} y2={y} />
      <line x1={x} y1={y} x2={x} y2={y + dy * len} />
    </g>
  );
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {corner(70, 150, 1, 1, C.teal)}
      {corner(1010, 150, -1, 1, C.mustard)}
      {corner(70, 1560, 1, -1, C.mustard)}
      {corner(1010, 1560, -1, -1, C.teal)}
    </svg>
  );
};
