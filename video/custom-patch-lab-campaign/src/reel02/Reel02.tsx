import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_BODY, FONT_CONDENSED} from '../shared/brand';
import {FilmGrain} from '../shared/components/FilmGrain';
import {Footage} from '../shared/components/Footage';
import {LogoBadge} from '../shared/components/LogoBadge';
import {MotionBlur} from '../shared/components/MotionBlur';
import {easeIn, easeInOut, easeOut, mix, prog} from '../shared/motion';
import {CalloutPill} from '../reel01/Overlays';
import {LetterStagger} from '../reel01/Reel01';
import edl from './edl.json';
import tiger from './tiger-track.json';

/* ------------------------------------------------------------------ timing
 * 660 frames @ 30 fps. Story: DIGITAL IDEA → PHYSICAL PATCH → WEARABLE BRAND.
 * Hyperframes (edl.hyperframes): 5 UI click / orange tiger silhouette ·
 * 124 thread-texture frame on the eye match cut · 272 macro texture accent ·
 * 400 navy silhouette on the cap→jacket match cut · 540 REAL. brand hit.
 * scripts/sound-design-reel02.py reads the same edl.                       */
const NAVY = '#0B1A33';
const IVORY = '#F7F0E3';
const ORANGE = '#F26A21';
const GOLD = '#F5B941';
const [H1, H2, H3, H4, H5] = edl.hyperframes;
const EYE1 = edl.eye.v1; // digital eye in video 1 (measured)
const EYE2 = edl.eye.v2; // embroidered eye in video 2 (measured)
const CUT_EYE = 124;
const CUT_HERO = 210;
const CUT_CAP = 330;
const CUT_JACKET = 400;
const CUT_BAG = 470;
const CUT_END = 540;

const shot = (id: string) => {
  const s = edl.shots.find((x) => x.id === id);
  if (!s) throw new Error(`Shot ${id} missing from edl.json`);
  return s;
};
const seg = (id: string) => `segments/reel02/${id}.mp4`;
const Shot: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => (
  <Sequence from={shot(id).from} durationInFrames={shot(id).frames} name={id}>
    {children}
  </Sequence>
);

/** Tiger silhouette box (x, y, w, h) at a global frame, from the tracked shots. */
const tigerBox = (f: number, sid: 's1' | 's4' | 's5' | 's6' | 's7') => {
  const rows = (tiger.tracks as Record<string, number[][]>)[sid];
  const fs = rows.map((r) => r[0]);
  const at = (i: number) => interpolate(f, fs, rows.map((r) => r[i]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {x: at(1), y: at(2), w: at(3), h: at(4)};
};

export const Reel02: React.FC = () => {
  const f = useCurrentFrame();

  // digital push into the eye: by the freeze the V1 eye sits exactly where the V2 eye will be after the cut
  const k = prog(f, 87, 37, easeInOut);
  const eyeScale = mix(1, EYE2.r / EYE1.r, k);
  const eyeShift = {x: (EYE2.x - EYE1.x) * k, y: (EYE2.y - EYE1.y) * k};
  const pull = prog(f, CUT_EYE, 10, easeOut); // tiny settle after the match cut
  const punch = (cut: number, a = 0.07) => (f >= cut ? a * (1 - prog(f, cut, 7, easeOut)) : 0);
  const wipeBag = prog(f, CUT_BAG - 5, 10, easeInOut);
  const endIn = prog(f, CUT_END - 4, 12, easeInOut);

  return (
    <AbsoluteFill style={{background: NAVY}}>
      <MotionBlur id="r2-wipe" x={Math.sin(Math.PI * wipeBag) * 60} y={0} />

      {/* ============ 01 HOOK 0–2.9 s — digital tiger on the tablet */}
      <Shot id="s1">
        <Footage src={seg('s1')} drift={[1, 1.04]} shadeTop={1} />
      </Shot>

      {/* ============ 02 TRANSFORMATION 2.9–7 s */}
      <AbsoluteFill style={{transform: `translate(${eyeShift.x}px, ${eyeShift.y}px)`}}>
        <Shot id="s2">
          <Footage src={seg('s2')} origin={EYE1} scale={eyeScale} drift={[1, 1]} shadeTop={0.8} />
        </Shot>
        <Shot id="s2f">
          <Footage src={seg('s2f')} origin={EYE1} scale={eyeScale} drift={[1, 1]} shadeTop={0.8} />
        </Shot>
      </AbsoluteFill>
      <Shot id="s3">
        <Footage src={seg('s3')} origin={EYE2} scale={1 + 0.06 * (1 - pull)} drift={[1, 1]} shadeTop={0.8} />
      </Shot>

      {/* ============ 03 PRODUCT HERO 7–11 s */}
      <Shot id="s4">
        <Footage src={seg('s4')} scale={1 + punch(CUT_HERO)} drift={[1.03, 1]} shadeTop={0.7} />
        <LightSweep at={60} />
      </Shot>

      {/* ============ 04 STREETWEAR TAKEOVER 11–18 s */}
      <Shot id="s5">
        <Footage src={seg('s5')} scale={1 + punch(CUT_CAP)} drift={[1, 1.03]} shadeTop={1} />
      </Shot>
      <Shot id="s6">
        <Footage
          src={seg('s6')}
          scale={1 + punch(CUT_JACKET, 0.09)}
          drift={[1, 1.03]}
          shadeTop={1}
          fx={{transform: `translateX(${-wipeBag * 1080}px)`}}
          fxFilter={wipeBag > 0.01 ? 'url(#r2-wipe)' : undefined}
        />
      </Shot>
      <Shot id="s7">
        <Footage
          src={seg('s7')}
          drift={[1, 1.03]}
          shadeTop={1}
          fx={{transform: `translateX(${(1 - wipeBag) * 1080}px)`}}
          fxFilter={wipeBag < 0.99 ? 'url(#r2-wipe)' : undefined}
        />
      </Shot>
      {wipeBag > 0 && wipeBag < 1 && <EditorialBars p={wipeBag} />}

      {/* ============ 05 BRAND PAYOFF 18–22 s */}
      <Sequence from={CUT_END - 4} name="End card">
        <StitchedReveal p={endIn}>
          <EndCard />
        </StitchedReveal>
      </Sequence>

      {/* ============ graphics */}
      <Sequence from={0} durationInFrames={87} name="01 type">
        <EarTrace at={8} dur={34} exitAt={74} />
        <LayerChip at={14} exitAt={76} />
        <LetterStagger text="YOUR LOGO" at={2} top={226} size={156} color={IVORY} exitAt={78} />
        <ImpactLine text="DESERVES BETTER." at={14} top={392} size={118} color={ORANGE} exitAt={79} />
      </Sequence>

      <Sequence from={87} durationInFrames={CUT_HERO - 87} name="02 type">
        <MaskWords text="FROM FLAT" at={4} top={232} size={150} color={IVORY} exitAt={CUT_HERO - 87 - 10} />
        <MaskWords text="TO REAL." at={CUT_EYE - 87 + 3} top={384} size={150} color={ORANGE} exitAt={CUT_HERO - 87 - 9} outlineFirst />
        <EyeRing at={22} exitAt={70} />
        <ThreadStitch at={CUT_EYE - 87 - 2} />
      </Sequence>

      <Sequence from={CUT_HERO} durationInFrames={CUT_CAP - CUT_HERO} name="03 graphics">
        <HeroCallout at={CUT_HERO + 18} exitAt={CUT_HERO + 60} label="REAL TEXTURE" ax={0.5} ay={0.3} />
        <HeroCallout at={CUT_HERO + 64} exitAt={CUT_CAP - 6} label="RAISED DETAIL" ax={0.14} ay={0.55} />
      </Sequence>

      <Sequence from={CUT_CAP} durationInFrames={CUT_END - CUT_CAP} name="04 labels">
        <ProductLabel word="CAPS." sub="STRUCTURED CAP" at={4} exitAt={CUT_JACKET - CUT_CAP - 4} sid="s5" />
        <ProductLabel word="JACKETS." sub="VARSITY JACKET" at={CUT_JACKET - CUT_CAP + 3} exitAt={CUT_BAG - CUT_CAP - 7} sid="s6" />
        <ProductLabel word="BAGS." sub="CANVAS BACKPACK" at={CUT_BAG - CUT_CAP + 6} exitAt={CUT_END - CUT_CAP - 6} sid="s7" />
      </Sequence>

      {/* ============ hyperframes */}
      <HyperSilhouette at={H1} frames={3} bg={ORANGE} fg={NAVY} box={{x: 140, y: 470, w: 800, h: 800}} />
      <HyperTexture at={H2} src="h2" tint={ORANGE} />
      <HyperTexture at={H3} src="h3" tint={GOLD} marker />
      <HyperSilhouette at={H4} frames={2} bg={NAVY} fg={ORANGE} track="s6" />
      <HyperWord at={H5} />

      <FilmGrain opacity={0.05} />
      <Audio src={staticFile('audio/reel02-mix.wav')} />
    </AbsoluteFill>
  );
};

/* ================================================================ type */

/** Two-word line that slams in on a damped spring (controlled impact, tiny overshoot). */
const ImpactLine: React.FC<{text: string; at: number; top: number; size: number; color: string; exitAt: number}> = ({text, at, top, size, color, exitAt}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const s = spring({frame: f - at, fps, config: {damping: 13, stiffness: 240, mass: 0.7}});
  const q = prog(f, exitAt, 7, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONT_CONDENSED,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        color,
        letterSpacing: `${mix(0.25, 0.01, s)}em`,
        transform: `scale(${mix(1.5, 1, s)}) translateY(${-q * 60}px)`,
        opacity: Math.min(1, s * 2) * (1 - q),
        filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.55))',
      }}
    >
      {text}
    </div>
  );
};

/** Masked word-by-word reveal; optional outline-to-filled treatment. */
const MaskWords: React.FC<{text: string; at: number; top: number; size: number; color: string; exitAt: number; outlineFirst?: boolean}> = ({
  text,
  at,
  top,
  size,
  color,
  exitAt,
  outlineFirst,
}) => {
  const f = useCurrentFrame();
  const q = prog(f, exitAt, 7, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: '0 0.24em',
        fontFamily: FONT_CONDENSED,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        opacity: 1 - q,
        transform: `translateY(${-q * 50}px)`,
        filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.6))',
      }}
    >
      {text.split(' ').map((w, i) => {
        const p = prog(f, at + i * 5, 10, easeOut);
        const fill = outlineFirst ? prog(f, at + i * 5 + 8, 10, easeInOut) : 1;
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: '0.04em 0 0.1em'}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 110}%)`,
                letterSpacing: `${mix(0.18, 0.01, p)}em`,
                color: fill >= 1 ? color : 'transparent',
                WebkitTextStroke: fill < 1 ? `3px ${color}` : undefined,
                backgroundImage: fill > 0 && fill < 1 ? `linear-gradient(0deg, ${color} ${fill * 100}%, transparent ${fill * 100}%)` : undefined,
                WebkitBackgroundClip: fill > 0 && fill < 1 ? 'text' : undefined,
                backgroundClip: fill > 0 && fill < 1 ? 'text' : undefined,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Big product word (masked rise) with a tracked sub-label pill under the patch. */
const ProductLabel: React.FC<{word: string; sub: string; at: number; exitAt: number; sid: 's5' | 's6' | 's7'}> = ({word, sub, at, exitAt, sid}) => {
  const lf = useCurrentFrame();
  const p = prog(lf, at, 9, easeOut);
  const q = prog(lf, exitAt, 6, easeIn);
  const g = lf + CUT_CAP;
  const b = tigerBox(g, sid);
  if (lf < at - 1 || q >= 1) return null;
  return (
    <>
      <div style={{position: 'absolute', top: 226, left: 0, right: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: '0.04em 0 0.1em', opacity: 1 - q}}>
        <div
          style={{
            fontFamily: FONT_CONDENSED,
            fontWeight: 700,
            fontSize: 210,
            lineHeight: 1,
            color: IVORY,
            transform: `translateY(${(1 - p) * 110}%) translateX(${-q * 140}px)`,
            letterSpacing: `${mix(0.2, 0.01, p)}em`,
            filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.6))',
          }}
        >
          {word.slice(0, -1)}
          <span style={{color: ORANGE}}>.</span>
        </div>
      </div>
      <CalloutPill at={at + 8} exitAt={exitAt} x={b.x + b.w * 0.5} y={Math.min(1470, b.y + b.h * 0.96)} label={sub} dx={0} dy={Math.min(1470, b.y + b.h + 90) - Math.min(1470, b.y + b.h * 0.96)} />
    </>
  );
};

/* ============================================================ graphics */

/** Thin orange vector stroke tracing the real head outline of the digital tiger, frame-accurate. */
const EarTrace: React.FC<{at: number; dur: number; exitAt: number}> = ({at, dur, exitAt}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur, easeInOut);
  const q = prog(f, exitAt, 8, easeIn);
  const paths = tiger.earTrace as Record<string, string>;
  const d = paths[String(Math.min(f, 70))];
  if (!d || p <= 0) return null;
  const len = 3200;
  const head = p < 1;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - q}}>
      <path d={d} fill="none" stroke={ORANGE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={len} strokeDasharray={len} strokeDashoffset={len * (1 - p)} style={{filter: 'drop-shadow(0 0 8px rgba(242,106,33,0.75))'}} />
      {/* vector anchor points every ~1/8 of the path, appearing as the stroke passes */}
      {[0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88].map((t) =>
        t <= p ? <AnchorOnPath key={t} d={d} t={t} /> : null,
      )}
      {head && <AnchorOnPath d={d} t={p} big />}
    </svg>
  );
};

/** Square vector anchor drawn at fraction t along a polyline path. */
const AnchorOnPath: React.FC<{d: string; t: number; big?: boolean}> = ({d, t, big}) => {
  const pts = d.replace(/^M /, '').split(' L ').map((s) => s.split(' ').map(Number));
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let target = total * t;
  let x = pts[0][0];
  let y = pts[0][1];
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i]) {
      const r = segs[i] ? target / segs[i] : 0;
      x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r;
      y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r;
      break;
    }
    target -= segs[i];
  }
  const s = big ? 18 : 12;
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} fill={big ? ORANGE : IVORY} stroke={big ? IVORY : ORANGE} strokeWidth={3} />;
};

/** Design-app layer chip: makes the hook read as "your logo file". */
const LayerChip: React.FC<{at: number; exitAt: number}> = ({at, exitAt}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 10, easeOut);
  const q = prog(f, exitAt, 6, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        top: 1440,
        left: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 24px',
        borderRadius: 999,
        background: 'rgba(11,26,51,0.86)',
        border: `2px solid ${GOLD}`,
        fontFamily: FONT_BODY,
        fontWeight: 800,
        fontSize: 32,
        letterSpacing: '0.12em',
        color: IVORY,
        transform: `translateX(${(1 - p) * -60}px)`,
        opacity: p * (1 - q),
      }}
    >
      <span style={{width: 18, height: 18, border: `3px solid ${ORANGE}`}} />
      LAYER 01 · YOUR_LOGO.SVG
    </div>
  );
};

/** Orange ring that locks to the eye through the digital push, survives the match cut, then releases. */
const EyeRing: React.FC<{at: number; exitAt: number}> = ({at, exitAt}) => {
  const f = useCurrentFrame(); // local, 0 = frame 87
  const g = f + 87;
  const k = prog(g, 87, 37, easeInOut);
  const x = mix(EYE1.x, EYE2.x, k);
  const y = mix(EYE1.y, EYE2.y, k);
  const r = mix(EYE1.r, EYE2.r, k) + 42;
  const p = prog(f, at, 12, easeOut);
  const q = prog(f, exitAt, 8, easeIn);
  const circ = 2 * Math.PI * r;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - q}}>
      <g transform={`rotate(${g * 1.5} ${x} ${y})`} style={{filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.6))'}}>
        <circle cx={x} cy={y} r={r} fill="none" stroke={ORANGE} strokeWidth={6} strokeDasharray={`${circ * p} ${circ}`} />
        <circle cx={x} cy={y} r={r + 16} fill="none" stroke={IVORY} strokeWidth={3} strokeDasharray="14 10" opacity={p} />
      </g>
      <text x={x + r + 30} y={y - r + 10} fill={IVORY} opacity={p} style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 32, letterSpacing: '0.2em', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))'}}>
        {g < CUT_EYE ? 'PIXEL' : 'THREAD'}
      </text>
    </svg>
  );
};

/** A stitched thread line that sews across the frame on the match cut. */
const ThreadStitch: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 12, easeOut);
  const q = prog(f, at + 22, 10, easeIn);
  if (p <= 0 || q >= 1) return null;
  const d = 'M -40 1330 C 220 1260, 420 1400, 640 1300 S 980 1210, 1140 1250';
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - q}}>
      <path d={d} fill="none" stroke={IVORY} strokeWidth={6} strokeDasharray="22 12" strokeLinecap="round" pathLength={1000} style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))'}} />
    </svg>
  );
};

const HeroCallout: React.FC<{at: number; exitAt: number; label: string; ax: number; ay: number}> = ({at, exitAt, label, ax, ay}) => {
  const lf = useCurrentFrame();
  const g = lf + CUT_HERO;
  const b = tigerBox(g, 's4');
  const x = b.x + ax * b.w;
  const y = b.y + ay * b.h;
  const pillY = Math.max(270, b.y - 90);
  return <CalloutPill at={at - CUT_HERO} exitAt={exitAt - CUT_HERO} x={x} y={y} label={label} dx={540 - x} dy={pillY - y} />;
};

/** Soft light sweep across the hero patch. */
const LightSweep: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 28, easeInOut);
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(115deg, transparent ${mix(-30, 100, p)}%, rgba(255,236,205,0.35) ${mix(-15, 115, p)}%, transparent ${mix(0, 130, p)}%)`,
        mixBlendMode: 'soft-light',
      }}
    />
  );
};

/** Navy / orange / ivory editorial bars riding the jacket → bag wipe. */
const EditorialBars: React.FC<{p: number}> = ({p}) => (
  <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
    {[NAVY, ORANGE, IVORY].map((c, i) => {
      const t = Math.min(1, Math.max(0, (p - i * 0.07) / 0.86));
      return (
        <div
          key={c}
          style={{
            position: 'absolute',
            top: '-20%',
            height: '140%',
            width: 120 - i * 30,
            left: mix(1180, -260, t),
            background: c,
            transform: 'skewX(-14deg)',
            opacity: Math.sin(Math.PI * t),
          }}
        />
      );
    })}
  </AbsoluteFill>
);

/** Circular stitched reveal of the end card from the tiger's last position. */
const StitchedReveal: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => {
  const r = mix(0, 1500, p);
  const cx = 540;
  const cy = 1000;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: p >= 1 ? undefined : `circle(${r}px at ${cx}px ${cy}px)`}}>{children}</AbsoluteFill>
      {p > 0 && p < 1 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={ORANGE} strokeWidth={8} strokeDasharray="22 12" />
          <circle cx={cx} cy={cy} r={r + 16} fill="none" stroke={IVORY} strokeWidth={3} opacity={0.8} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

/* ================================================================ hyperframes */

/** Filled tiger silhouette (the real outline) on a flat colour — either centred or on the tracked patch. */
const HyperSilhouette: React.FC<{at: number; frames: number; bg: string; fg: string; box?: {x: number; y: number; w: number; h: number}; track?: 's6'}> = ({at, frames, bg, fg, box, track}) => {
  const f = useCurrentFrame();
  if (f < at || f >= at + frames) return null;
  const b = box ?? tigerBox(f, track ?? 's6');
  const k = f - at;
  const grow = 1 + k * 0.04;
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  return (
    <AbsoluteFill style={{background: bg}}>
      <svg width={1080} height={1920}>
        <g transform={`translate(${cx} ${cy}) scale(${grow}) translate(${-cx} ${-cy}) translate(${b.x} ${b.y}) scale(${b.w / 1000} ${b.h / 1000})`}>
          <path d={tiger.outline} fill={fg} />
          <path d={tiger.outline} fill="none" stroke={IVORY} strokeWidth={10} strokeDasharray="30 18" transform="translate(500 500) scale(1.06) translate(-500 -500)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Thread-texture flash: a macro thread frame, duotone-tinted, with an optional technical marker. */
const HyperTexture: React.FC<{at: number; src: 'h2' | 'h3'; tint: string; marker?: boolean}> = ({at, src, tint, marker}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 2) return null;
  return (
    <AbsoluteFill>
      <Sequence from={at} durationInFrames={3}>
        <Footage src={seg(src)} scale={2.2} drift={[1, 1.06]} />
      </Sequence>
      <AbsoluteFill style={{background: tint, mixBlendMode: 'color', opacity: 0.55}} />
      {marker && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <rect x={290} y={710} width={500} height={500} fill="none" stroke={IVORY} strokeWidth={5} />
          <line x1={290} y1={1250} x2={790} y2={1250} stroke={IVORY} strokeWidth={4} />
          <text x={540} y={1310} textAnchor="middle" fill={IVORY} style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, letterSpacing: '0.3em'}}>
            SATIN STITCH
          </text>
        </svg>
      )}
    </AbsoluteFill>
  );
};

/** Oversized outlined "REAL." crossing the frame for 3 frames as the brand card lands. */
const HyperWord: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 2) return null;
  const k = f - at;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: k === 0 ? 'rgba(242,106,33,0.85)' : 'transparent'}}>
      <div
        style={{
          fontFamily: FONT_CONDENSED,
          fontWeight: 700,
          fontSize: 640,
          lineHeight: 1,
          color: k === 0 ? NAVY : 'transparent',
          WebkitTextStroke: k === 0 ? undefined : `6px ${ORANGE}`,
          transform: `translateX(${(k - 1) * 80}px) scale(${1.1 - k * 0.05})`,
          opacity: 1 - k * 0.3,
        }}
      >
        REAL.
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================ end card */

/** Local frame 0 = CUT_END - 4. Logo → YOUR DESIGN. → OUR CRAFT. → product → line → URL → hold. */
const EndCard: React.FC = () => {
  const lf = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = (g: number) => g - (CUT_END - 4);
  const card = prog(lf, at(CUT_END + 4), 16, easeOut);
  const l1 = prog(lf, at(CUT_END + 10), 10, easeOut);
  const s2 = spring({frame: lf - at(CUT_END + 18), fps, config: {damping: 13, stiffness: 220, mass: 0.75}});
  const line = prog(lf, at(CUT_END + 40), 14, easeOut);
  const url = prog(lf, at(CUT_END + 50), 14, easeOut);
  const border = prog(lf, at(CUT_END + 20), 30, easeInOut);
  const zoom = mix(1.06, 1, prog(lf, 0, 124, easeOut));
  const perim = 2 * (700 + 656);
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 55% at 50% 52%, #16305A 0%, ${NAVY} 70%)`}}>
      <LogoBadge at={at(CUT_END + 2)} size={170} top={200} />
      <div style={{position: 'absolute', top: 398, left: 0, right: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: '0.04em 0 0.1em'}}>
        <div style={{fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 124, lineHeight: 1, color: IVORY, transform: `translateY(${(1 - l1) * 110}%)`}}>YOUR DESIGN.</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 528,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_CONDENSED,
          fontWeight: 700,
          fontSize: 124,
          lineHeight: 1,
          color: ORANGE,
          letterSpacing: `${mix(0.28, 0.01, s2)}em`,
          transform: `scale(${mix(1.5, 1, s2)})`,
          opacity: lf >= at(CUT_END + 18) ? Math.min(1, s2 * 2) : 0,
        }}
      >
        OUR CRAFT.
      </div>
      {/* product card: the supplied finished-patch photo, with a stitched border sewing around it */}
      <div
        style={{
          position: 'absolute',
          top: 690,
          left: 190,
          width: 700,
          height: 656,
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(0,0,0,0.55)',
          transform: `translateY(${(1 - card) * 70}px) scale(${mix(0.92, 1, card)})`,
          opacity: card,
        }}
      >
        <Img src={staticFile('brand/reel02-tiger-patch.webp')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={172} y={672} width={736} height={692} rx={38} fill="none" stroke={ORANGE} strokeWidth={5} strokeDasharray="20 12" pathLength={perim} style={{clipPath: `inset(0 ${(1 - border) * 100}% 0 0)`}} />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 1392,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: `${mix(0.3, 0.08, line)}em`,
          color: IVORY,
          clipPath: `inset(0 ${(1 - line) * 50}% 0 ${(1 - line) * 50}%)`,
        }}
      >
        TURN YOUR LOGO INTO SOMETHING REAL.
      </div>
      <div style={{position: 'absolute', top: 1456, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            padding: '14px 34px',
            borderRadius: 999,
            background: ORANGE,
            fontFamily: FONT_BODY,
            fontWeight: 800,
            fontSize: 36,
            color: NAVY,
            letterSpacing: '0.02em',
            transform: `translateY(${(1 - url) * 50}px)`,
            opacity: url,
            boxShadow: '0 12px 30px rgba(242,106,33,0.35)',
          }}
        >
          quote.custompatchlab.com →
        </div>
      </div>
    </AbsoluteFill>
  );
};
