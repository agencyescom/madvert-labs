import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT_BODY} from '../shared/brand';
import {NavyField} from '../shared/components/BrandBackdrop';
import {FilmGrain} from '../shared/components/FilmGrain';
import {Footage} from '../shared/components/Footage';
import {GoldFramePanel} from '../shared/components/GoldFramePanel';
import {GoldRule} from '../shared/components/GoldRule';
import {KineticText, words} from '../shared/components/KineticText';
import {LogoBadge} from '../shared/components/LogoBadge';
import {MotionBlur} from '../shared/components/MotionBlur';
import {NumberPop} from '../shared/components/NumberPop';
import {DiagonalReveal, WipeStreaks} from '../shared/components/Transitions';
import {WordStack} from '../shared/components/WordStack';
import {easeIn, easeInOut, easeOut, mix, prog} from '../shared/motion';
import edl from './edl.json';
import vo from './vo-timing.json';

/* ------------------------------------------------------------------ timing
 * The recorded voiceover is the master clock. Every cue is a word looked up in
 * vo-timing.json (forced-aligned from the recording by scripts/vo-timing.py).
 * Phrase indices follow assets/source/ad03/audio/voiceover-transcript.txt.   */
const VO = edl.voOffsetFrames;
const sf = (s: number) => Math.round(s * edl.fps) + VO;
const word = (phrase: number, w: string) => {
  const hit = vo.phrases[phrase].words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w);
  if (!hit) throw new Error(`"${w}" not in VO phrase ${phrase}`);
  return sf(hit.start);
};
const shot = (id: string) => {
  const s = edl.shots.find((x) => x.id === id);
  if (!s) throw new Error(`Shot ${id} missing from edl.json`);
  return s;
};
const seg = (id: string) => `segments/ad03/${id}.mp4`;
const [CUT_1, CUT_2, CUT_3, CUT_4, CUT_5, CUT_6, CUT_7, CUT_8, CUT_9, CUT_10, CUT_11] = edl.cuts;

/** A shot placed at its EDL position; children render in shot-local frames. */
const Shot: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => (
  <Sequence from={shot(id).from} durationInFrames={shot(id).frames} name={id}>
    {children}
  </Sequence>
);

export const Ad03: React.FC = () => {
  const f = useCurrentFrame();
  const local = (id: string, g: number) => g - shot(id).from;

  // transition curves (global frames)
  const t1 = prog(f, CUT_1 - 5, 10, easeInOut); // lateral match cut: tiger texture → needle
  const punch2 = prog(f, CUT_2, 8, easeOut);
  const punch3 = prog(f, CUT_3, 9, easeOut);
  const t4 = prog(f, CUT_4 - 5, 10, easeInOut); // stitched-thread diagonal reveal
  const t5Out = prog(f, CUT_5 - 8, 8, easeIn); // scale match out of the reveal…
  const t5In = prog(f, CUT_5, 10, easeOut); // …into the presented patch
  const punch6 = prog(f, CUT_6, 8, easeOut);
  const t7 = prog(f, CUT_7 - 5, 11, easeInOut); // editorial lateral wipe
  const t7Edge = mix(-260, 1340, t7);
  const t8 = prog(f, CUT_8, 8, easeInOut); // soft dissolve machine → machine (s08 has an 8-frame tail)
  const t9 = prog(f, CUT_9 - 5, 10, easeInOut); // vertical whip
  const punch10 = prog(f, CUT_10, 8, easeOut);
  const t11 = prog(f, CUT_11 - 4, 10, easeInOut); // branded outro reveal

  return (
    <AbsoluteFill style={{background: C.navyDeep}}>
      <MotionBlur id="a3-t1" x={Math.sin(Math.PI * t1) * 60} y={0} />
      <MotionBlur id="a3-p" x={(1 - Math.min(punch2, punch3, punch6, punch10)) * 6} y={(1 - Math.min(punch2, punch3, punch6, punch10)) * 6} />
      <MotionBlur id="a3-t5" x={(t5Out + (1 - t5In)) * 8} y={(t5Out + (1 - t5In)) * 8} />
      <MotionBlur id="a3-t7" x={Math.sin(Math.PI * t7) * 40} y={0} />
      <MotionBlur id="a3-t9" x={0} y={Math.sin(Math.PI * t9) * 60} />

      {/* ============================================ 01 HOOK — "Got a logo? Let's turn it into something amazing." */}
      <Shot id="s01">
        <Footage
          src={seg('s01')}
          scale={1.08}
          y={60}
          drift={[1.02, 1.1]}
          shadeTop={1}
          fx={{transform: `translateX(${-t1 * 1080}px)`}}
          fxFilter={t1 > 0.01 ? 'url(#a3-t1)' : undefined}
        />
        <KineticText
          id="hook1"
          style={{top: 236}}
          exitAt={word(1, 'something') - 9}
          lines={[{words: words('GOT A LOGO?', ['LOGO?']), at: word(0, 'got'), size: 150, font: 'condensed', stagger: 3, tracking: [0.12, 0.01]}]}
        />
        <KineticText
          id="hook2"
          style={{top: 222}}
          exitAt={CUT_1 - 12}
          lines={[
            {words: words('SOMETHING'), at: word(1, 'something'), size: 120, font: 'condensed', weight: 600, tracking: [0.4, 0.14]},
            {words: words('AMAZING.', true), at: word(1, 'amazing'), size: 180, font: 'condensed', impact: true, lineHeight: 0.98},
          ]}
        />
      </Shot>

      {/* ============================================ 02 CRAFT — "At Custom Patch Lab, we create premium custom patches that make your brand stand out." */}
      <Shot id="s02">
        <Footage
          src={seg('s02')}
          scale={1.1}
          y={40}
          drift={[1.06, 1]}
          shadeTop={0.8}
          fx={{transform: `translateX(${(1 - t1) * 1080}px)`}}
          fxFilter={t1 < 0.99 ? 'url(#a3-t1)' : undefined}
        />
        <Eyebrow text="CUSTOM PATCH LAB" at={local('s02', word(2, 'custom'))} top={300} exitAt={local('s02', CUT_2) - 4} />
      </Shot>
      <Shot id="s03">
        <Footage
          src={seg('s03')}
          scale={1.08}
          y={-20}
          drift={[1, 1.06]}
          shadeBottom={1}
          fx={{transform: `scale(${1.08 - 0.08 * punch2})`}}
          fxFilter={punch2 < 0.99 ? 'url(#a3-p)' : undefined}
        />
        <KineticText
          id="premium"
          style={{top: 1214}}
          exitAt={local('s03', CUT_3) - 9}
          lines={[
            {words: words('PREMIUM', true), at: local('s03', word(3, 'premium')), size: 150, font: 'condensed', tracking: [0.5, 0.06]},
            {words: words('CUSTOM PATCHES'), at: local('s03', word(3, 'custom')), size: 104, font: 'condensed', weight: 600, stagger: 5, lineHeight: 1.08, tracking: [0.3, 0.1]},
          ]}
        />
      </Shot>
      <Shot id="s04">
        <Footage
          src={seg('s04')}
          scale={1.04}
          y={90}
          drift={[1, 1.07]}
          shadeTop={1}
          fx={{transform: `scale(${1.08 - 0.08 * punch3})`}}
          fxFilter={punch3 < 0.99 ? 'url(#a3-p)' : undefined}
        />
        <KineticText
          id="standout"
          style={{top: 226}}
          lines={[
            {words: words('MAKE YOUR BRAND'), at: local('s04', word(3, 'make')), size: 104, font: 'condensed', weight: 600, stagger: 4, tracking: [0.24, 0.08]},
            {words: words('STAND OUT.', true), at: local('s04', word(3, 'stand')), size: 184, font: 'condensed', impact: true, stagger: 4, lineHeight: 0.98},
          ]}
        />
        <GoldRule at={local('s04', word(3, 'out')) + 4} top={552} width={360} />
      </Shot>

      {/* ============================================ 03 OBJECTION — "No design? No problem! We'll create one for you." */}
      <Shot id="s05k">
        <DiagonalReveal p={t4} stitch>
          <SketchToPatch sketch={seg('s05k')} real={seg('s05')} at={local('s05k', word(5, 'no')) + 2} fx={{transform: `scale(${1 + 0.1 * t5Out})`}} fxFilter={t5Out > 0.01 ? 'url(#a3-t5)' : undefined} />
        </DiagonalReveal>
        <KineticText
          id="nodesign"
          style={{top: 232}}
          exitAt={local('s05k', CUT_5) - 10}
          lines={[
            {words: words('NO DESIGN?'), at: local('s05k', word(4, 'no')), size: 150, font: 'condensed', stagger: 6, tracking: [0.32, 0.04]},
            {words: words('NO PROBLEM!', true), at: local('s05k', word(5, 'no')), size: 168, font: 'condensed', impact: true, stagger: 3, lineHeight: 0.98},
          ]}
        />
        {/* styleframe copy; matches the spoken "We'll create one for you." */}
        <KineticText
          id="create"
          style={{top: 1404}}
          exitAt={local('s05k', CUT_5) - 10}
          lines={[{words: words('WE CAN CREATE IT FOR YOU.'), at: local('s05k', word(6, "we'll")), size: 74, font: 'condensed', weight: 600, stagger: 2, tracking: [0.2, 0.05]}]}
        />
      </Shot>

      {/* ============================================ 04 BENEFITS — "Get free artwork support, unlimited artwork revisions, and zero setup fees." */}
      <Shot id="s06">
        <Footage
          src={seg('s06')}
          scale={1.08}
          y={120}
          drift={[1, 1.06]}
          shadeTop={1}
          fx={{transform: `scale(${1.18 - 0.18 * t5In})`}}
          fxFilter={t5In < 0.99 ? 'url(#a3-t5)' : undefined}
        />
        <KineticText
          id="artsupport"
          style={{top: 236}}
          exitAt={local('s06', word(8, 'unlimited')) - 10}
          lines={[
            {words: words('FREE', true), at: local('s06', word(7, 'free')), size: 170, font: 'condensed', tracking: [0.3, 0.04]},
            {words: words('ARTWORK SUPPORT'), at: local('s06', word(7, 'artwork')), size: 104, font: 'condensed', weight: 600, stagger: 5, lineHeight: 1.06, tracking: [0.24, 0.06]},
          ]}
        />
      </Shot>
      <Shot id="s07">
        <Footage
          src={seg('s07')}
          scale={1.06}
          y={-60}
          drift={[1, 1.05]}
          shadeTop={1}
          shadeBottom={1}
          fx={{transform: `scale(${1.07 - 0.07 * punch6}) translateX(${t7 * 90}px)`}}
          fxFilter={punch6 < 0.99 ? 'url(#a3-p)' : t7 > 0.01 ? 'url(#a3-t7)' : undefined}
        />
        <NumberPop
          id="zero"
          value="$0"
          at={local('s07', word(9, 'zero'))}
          labelAt={local('s07', word(9, 'setup'))}
          label={['SETUP', 'FEES']}
          top={1290}
          size={290}
          band
          exitAt={local('s07', CUT_7) - 8}
        />
      </Shot>

      <Sequence from={shot('s06').from} durationInFrames={CUT_7 - shot('s06').from} name="Revisions type (above s07)">
        <KineticText
          id="unlimited"
          style={{top: 226}}
          exitAt={CUT_7 - shot('s06').from - 12}
          lines={[
            {words: words('UNLIMITED', true), at: word(8, 'unlimited') - shot('s06').from, size: 200, font: 'condensed', tracking: [0.08, 0.0], lineHeight: 0.96},
            {words: words('ARTWORK REVISIONS'), at: word(8, 'artwork') - shot('s06').from, size: 98, font: 'condensed', weight: 600, stagger: 6, lineHeight: 1.1, tracking: [0.3, 0.06]},
          ]}
        />
      </Sequence>

      {/* ============================================ 05 TRUST — USA-based · US-to-US · free backing + shipping · prices */}
      <Shot id="s08">
        <AbsoluteFill
          style={{
            WebkitMaskImage: `linear-gradient(90deg, #000 ${t7Edge - 140}px, transparent ${t7Edge + 40}px)`,
            maskImage: `linear-gradient(90deg, #000 ${t7Edge - 140}px, transparent ${t7Edge + 40}px)`,
          }}
        >
          <Footage
            src={seg('s08')}
            scale={1.06}
            y={-40}
            drift={[1.04, 1]}
            shadeBottom={1}
            fx={{transform: `translateX(${(1 - t7) * -90}px)`}}
            fxFilter={t7 < 0.99 ? 'url(#a3-t7)' : undefined}
          />
        </AbsoluteFill>
      </Shot>
      {t7 > 0 && t7 < 1 && <WipeStreaks edge={t7Edge} strength={Math.sin(Math.PI * t7)} />}
      <Shot id="s09">
        <AbsoluteFill style={{opacity: t8}}>
          <Footage
            src={seg('s09')}
            scale={1.06}
            y={-40}
            drift={[1, 1.05]}
            shadeBottom={1}
            fx={{transform: `translateY(${-t9 * 1920}px)`}}
            fxFilter={t9 > 0.01 ? 'url(#a3-t9)' : undefined}
          />
        </AbsoluteFill>
      </Shot>
      <Sequence from={CUT_7} durationInFrames={CUT_9 - CUT_7} name="Trust type">
        <TrustLedger from={CUT_7} />
      </Sequence>

      {/* ============================================ 06 RANGE — "From hats to jackets, uniforms to clothing brands, we bring your ideas to life." */}
      <Shot id="s10">
        <Footage
          src={seg('s10')}
          scale={1.12}
          y={260}
          drift={[1, 1.06]}
          shadeTop={1}
          fx={{transform: `translateY(${(1 - t9) * 1920}px)`, filter: 'brightness(0.78)'}}
          fxFilter={t9 < 0.99 ? 'url(#a3-t9)' : undefined}
        />
        <WordStack
          id="range"
          top={226}
          size={124}
          exitAt={local('s10', CUT_10) - 8}
          items={[
            {text: 'HATS.', at: local('s10', word(14, 'hats'))},
            {text: 'JACKETS.', at: local('s10', word(14, 'jackets'))},
            {text: 'UNIFORMS.', at: local('s10', word(15, 'uniforms'))},
            {text: 'CLOTHING BRANDS.', at: local('s10', word(15, 'clothing'))},
          ]}
        />
      </Shot>
      <Shot id="s11k">
        <SketchToPatch
          sketch={seg('s11k')}
          real={seg('s11')}
          at={local('s11k', word(16, 'life')) - 4}
          fx={{transform: `scale(${1.08 - 0.08 * punch10})`}}
          fxFilter={punch10 < 0.99 ? 'url(#a3-p)' : undefined}
        />
        <KineticText
          id="ideas"
          style={{top: 232}}
          lines={[
            {words: words('WE BRING YOUR'), at: local('s11k', word(16, 'we')), size: 100, font: 'condensed', weight: 600, stagger: 4, tracking: [0.26, 0.08]},
            {words: words('IDEAS TO LIFE.', ['LIFE.']), at: local('s11k', word(16, 'ideas')), size: 168, font: 'condensed', stagger: 6, lineHeight: 0.98},
          ]}
        />
      </Shot>

      {/* ============================================ 07 CTA — "Stop settling for ordinary. Get your free custom patch mockup within 24 hours." */}
      <Sequence from={CUT_11 - 4} name="Outro">
        <DiagonalReveal p={t11} stitch>
          <Outro start={CUT_11 - 4} />
        </DiagonalReveal>
      </Sequence>

      <FilmGrain />
      <Audio src={staticFile('audio/ad03-mix.wav')} />
    </AbsoluteFill>
  );
};

/** Small tracked label between two gold hairlines. */
const Eyebrow: React.FC<{text: string; at: number; top: number; exitAt?: number}> = ({text, at, top, exitAt}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 18);
  const q = exitAt === undefined ? 0 : prog(f, exitAt, 8, easeIn);
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
        opacity: p * (1 - q),
        fontFamily: FONT_BODY,
        fontWeight: 700,
        fontSize: 40,
        letterSpacing: `${mix(0.6, 0.34, p)}em`,
        color: C.text,
        filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.7))',
      }}
    >
      <div style={{width: 90 * p, height: 2, background: C.mustard}} />
      <span style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>{text}</span>
      <div style={{width: 90 * p, height: 2, background: C.mustard}} />
    </div>
  );
};

/** Pencil sketch of the exact patch; the stitched patch wipes across it behind a glowing needle line. */
const SketchToPatch: React.FC<{
  sketch: string;
  real: string;
  at: number;
  fx?: React.CSSProperties;
  fxFilter?: string;
}> = ({sketch, real, at, fx, fxFilter}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 12, easeInOut);
  const edge = mix(-160, 1240, p);
  const mask = `linear-gradient(90deg, #000 ${edge - 70}px, transparent ${edge + 10}px)`;
  return (
    <AbsoluteFill style={{...fx, filter: fxFilter}}>
      <Footage src={sketch} scale={1.06} y={40} drift={[1, 1.05]} shadeTop={0.55} shadeBottom={0.55} />
      <AbsoluteFill style={{WebkitMaskImage: mask, maskImage: mask}}>
        <Footage src={real} scale={1.06} y={40} drift={[1, 1.05]} shadeTop={1} shadeBottom={1} />
      </AbsoluteFill>
      {p > 0 && p < 1 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: edge - 30,
            width: 4,
            background: 'linear-gradient(180deg, rgba(244,185,66,0), #FFE29A 20%, #F4B942 80%, rgba(244,185,66,0))',
            boxShadow: '0 0 22px 6px rgba(244,185,66,0.55)',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/** Trust benefits, two at a time, each line on its spoken word. Local frame 0 = CUT_7. */
const TrustLedger: React.FC<{from: number}> = ({from}) => {
  const at = (g: number) => g - from;
  return (
    <AbsoluteFill>
      <Eyebrow text="WHY CUSTOM PATCH LAB" at={at(word(10, "we're"))} top={1104} exitAt={at(CUT_9) - 10} />
      <KineticText
        id="usa"
        style={{top: 1176}}
        exitAt={at(word(12, 'free')) - 9}
        lines={[
          {words: words('USA-BASED BUSINESS'), at: at(word(10, 'usabased')), size: 98, font: 'condensed', stagger: 5, tracking: [0.2, 0.03]},
          {words: words('US-TO-US SHIPPING', true), at: at(word(11, 'ustous')), size: 98, font: 'condensed', stagger: 5, lineHeight: 1.04, tracking: [0.2, 0.03]},
        ]}
      />
      <KineticText
        id="backing"
        style={{top: 1176}}
        exitAt={at(word(13, 'and')) - 6}
        lines={[
          {words: words('FREE BACKING', ['FREE']), at: at(word(12, 'free')), size: 104, font: 'condensed', stagger: 5, tracking: [0.2, 0.03]},
          {words: words('+ SHIPPING'), at: at(word(12, 'shipping')), size: 104, font: 'condensed', stagger: 4, lineHeight: 1.04, tracking: [0.2, 0.03]},
        ]}
      />
      {/* spoken: "some of the best prices on custom patches" — comparative claim, see README */}
      <KineticText
        id="prices"
        style={{top: 1176}}
        exitAt={at(CUT_9) - 10}
        lines={[
          {words: words('COMPETITIVE', true), at: at(word(13, 'best')), size: 104, font: 'condensed', tracking: [0.2, 0.03]},
          {words: words('PRICES'), at: at(word(13, 'prices')), size: 104, font: 'condensed', lineHeight: 1.04, tracking: [0.2, 0.03]},
        ]}
      />
    </AbsoluteFill>
  );
};

/** Design-05 end card. Local frame 0 = `start` (global). */
const Outro: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame();
  const g = f + start;
  const at = (gf: number) => gf - start;
  const band = prog(g, CUT_11 + 2, 16, easeOut);
  const ctaIn = word(18, 'get');
  const zoom = mix(1, 1.025, prog(g, CUT_11, 213, easeInOut));
  return (
    <AbsoluteFill>
      <NavyField />
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <LogoBadge at={at(CUT_11 + 4)} size={236} top={226} />
        {/* headline slot: the spoken line first, then the campaign line once the CTA has landed */}
        <KineticText
          id="ordinary"
          style={{top: 496}}
          exitAt={at(word(18, 'hours'))}
          lines={[
            {words: words('STOP SETTLING'), at: at(word(17, 'stop')), size: 104, font: 'condensed', stagger: 4, tracking: [0.22, 0.04]},
            {words: words('FOR ORDINARY.', ['ORDINARY.']), at: at(word(17, 'for')), size: 104, font: 'condensed', stagger: 4, lineHeight: 1.02, tracking: [0.22, 0.04]},
          ]}
        />
        <KineticText
          id="nextpatch"
          style={{top: 496}}
          lines={[
            {words: words('YOUR NEXT PATCH'), at: at(word(18, 'hours')) + 10, size: 104, font: 'condensed', stagger: 4, tracking: [0.22, 0.04]},
            {words: words('STARTS HERE.'), at: at(word(18, 'hours')) + 18, size: 104, font: 'condensed', stagger: 4, lineHeight: 1.02, tracking: [0.22, 0.04]},
          ]}
        />
        {/* product band */}
        <AbsoluteFill
          style={{
            clipPath: `inset(${mix(960, 736, band)}px 60px ${mix(960, 736, band)}px 60px round 26px)`,
          }}
        >
          <Footage src={seg('s12')} scale={1} y={-20} drift={[1.06, 1]} />
        </AbsoluteFill>
        <GoldFramePanel at={at(ctaIn) - 2} top={1218} width={920} height={272} radius={26}>
          <KineticText
            id="cta"
            style={{position: 'relative'}}
            lines={[
              {words: words('GET YOUR FREE MOCKUP', false, ['FREE', 'MOCKUP']), at: at(ctaIn), size: 86, font: 'condensed', stagger: 4, lineHeight: 1.1, tracking: [0.16, 0.02]},
              {words: words('WITHIN 24 HOURS'), at: at(word(18, 'within')), size: 86, font: 'condensed', stagger: 4, lineHeight: 1.1, tracking: [0.16, 0.02]},
            ]}
          />
        </GoldFramePanel>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
