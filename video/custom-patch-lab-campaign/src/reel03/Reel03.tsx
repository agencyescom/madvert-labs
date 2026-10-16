import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_BODY, FONT_CONDENSED} from '../shared/brand';
import {FilmGrain} from '../shared/components/FilmGrain';
import {Footage} from '../shared/components/Footage';
import {LogoBadge} from '../shared/components/LogoBadge';
import {easeIn, easeInOut, easeOut, mix, prog} from '../shared/motion';
import edl from './edl.json';

/* ------------------------------------------------------------------ system
 * CHOOSE YOUR FIGHTER — PATCH EDITION. 720 frames @ 30 fps, 120 BPM (15 f/beat).
 * 0 intro · 60/150/240/330/420 fighters (90 f = 6 beats each) · 510 select · 600 end.
 * Hyperframes (edl.hyperframes): 32 title impact · 60…420 fighter numbers · 600 brand.
 * scripts/sound-design-reel03.py reads the same edl.                         */
export const NAVY = '#10253D';
export const NAVY_DEEP = '#0A1828';
export const IVORY = '#F6F0E5';
export const TEAL = '#0E8993';
export const ORANGE = '#F28B38';
export const GOLD = '#F3C45B';
const ORANGE_GRAD = `linear-gradient(180deg, ${GOLD} 0%, ${ORANGE} 70%, #E0662A 100%)`;
const WIZARD_GRAD = 'linear-gradient(90deg, #F3C45B 0%, #F28B38 30%, #EE4A8B 62%, #8C5BF0 100%)';

type Entry = 'slash' | 'plush' | 'dimension' | 'scan' | 'spectrum';
type Fighter = {
  n: string;
  name: string[];
  type: string;
  desc: string;
  stat: string;
  value: number;
  entry: Entry;
  shots: string[];
  card: number;
  cardLabel: string;
  cardPos: [number, number]; // patch centre in the card still (px in 1080x1920)
};

export const FIGHTERS: Fighter[] = [
  {n: '01', name: ['THE CLASSIC'], type: 'EMBROIDERED', desc: 'TIMELESS. TEXTURED. VERSATILE.', stat: 'STYLE', value: 95, entry: 'slash', shots: ['f1'], card: 1, cardLabel: 'CLASSIC', cardPos: [520, 1000]},
  {n: '02', name: ['THE SHOWSTOPPER'], type: 'CHENILLE', desc: 'BOLD. PLUSH. ICONIC.', stat: 'TEXTURE', value: 99, entry: 'plush', shots: ['f2a', 'f2b'], card: 2, cardLabel: 'SHOWSTOPPER', cardPos: [520, 960]},
  {n: '03', name: ['THE TOUGH ONE'], type: 'PVC', desc: 'RUGGED. DIMENSIONAL. READY.', stat: 'TOUGHNESS', value: 98, entry: 'dimension', shots: ['f3a', 'f3b'], card: 3, cardLabel: 'TOUGH ONE', cardPos: [540, 980]},
  {n: '04', name: ['THE PRECISION', 'MASTER'], type: 'WOVEN', desc: 'FINE DETAIL. CLEAN FINISH.', stat: 'DETAIL', value: 99, entry: 'scan', shots: ['f4'], card: 4, cardLabel: 'PRECISION', cardPos: [560, 820]},
  {n: '05', name: ['THE COLOR WIZARD'], type: 'PRINTED', desc: 'VIBRANT. CREATIVE. FULL COLOR.', stat: 'COLOR', value: 100, entry: 'spectrum', shots: ['f5'], card: 5, cardLabel: 'COLOR WIZARD', cardPos: [540, 1080]},
];

const shot = (id: string) => {
  const s = edl.shots.find((x) => x.id === id);
  if (!s) throw new Error(`Shot ${id} missing from edl.json`);
  return s;
};
const seg = (id: string) => `segments/reel03/${id}.mp4`;

export const Reel03: React.FC = () => {
  return (
    <AbsoluteFill style={{background: NAVY_DEEP}}>
      <Sequence from={0} durationInFrames={edl.fighters[0] + 2} name="01 Intro">
        <Intro />
      </Sequence>

      {FIGHTERS.map((ft, i) => (
        <Sequence key={ft.n} from={edl.fighters[i]} durationInFrames={90} name={`Fighter ${ft.n}`}>
          <FighterScene ft={ft} index={i} />
        </Sequence>
      ))}

      <Sequence from={edl.select} durationInFrames={edl.end - edl.select + 2} name="07 Select">
        <SelectScreen />
      </Sequence>

      <Sequence from={edl.end} name="08 End card">
        <EndCard />
      </Sequence>

      {/* hyperframes */}
      <HyperTitle at={edl.hyperframes[0]} />
      {FIGHTERS.map((ft, i) => (
        <HyperNumber key={ft.n} at={edl.fighters[i]} n={ft.n} entry={ft.entry} />
      ))}
      <HyperBrand at={edl.hyperframes[6]} />

      <FilmGrain opacity={0.05} />
      <Audio src={staticFile('audio/reel03-mix.wav')} />
    </AbsoluteFill>
  );
};

/* ================================================================== intro */

const SIL_PATHS = [
  // bolt
  'M 60 0 L 10 95 L 48 95 L 28 170 L 100 62 L 60 62 L 82 0 Z',
  // M
  'M 0 160 L 0 10 L 38 10 L 60 70 L 82 10 L 120 10 L 120 160 L 90 160 L 90 75 L 68 130 L 52 130 L 30 75 L 30 160 Z',
  // hexagon
  'M 60 0 L 116 32 L 116 128 L 60 160 L 4 128 L 4 32 Z',
  // circle (woven)
  'M 60 10 A 70 70 0 1 1 59.9 10 Z',
  // oval (printed)
  'M 60 18 A 64 62 0 1 1 59.9 18 Z',
];

/** 0–59: arcade boot — scan line, five fighter silhouettes in slots, two title beats. */
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scan = prog(f, 0, 16, easeInOut);
  const gridIn = prog(f, 2, 18, easeOut);
  const t1 = spring({frame: f - 12, fps, config: {damping: 13, stiffness: 230, mass: 0.7}});
  const t2 = spring({frame: f - 33, fps, config: {damping: 12, stiffness: 240, mass: 0.7}});
  const out = prog(f, 54, 6, easeIn);
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 45%, #183A5C 0%, ${NAVY} 45%, ${NAVY_DEEP} 100%)`, opacity: 1 - out * 0.4}}>
      {/* perspective floor grid */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.35 * gridIn}}>
        {Array.from({length: 13}, (_, i) => (
          <line key={`v${i}`} x1={540} y1={1180} x2={-900 + i * 240} y2={1920} stroke={TEAL} strokeWidth={2} />
        ))}
        {Array.from({length: 8}, (_, i) => {
          const y = 1180 + Math.pow(i / 7, 1.8) * 740;
          return <line key={`h${i}`} x1={0} x2={1080} y1={y} y2={y} stroke={TEAL} strokeWidth={2} />;
        })}
      </svg>
      {/* orange scan line */}
      {scan > 0 && scan < 1 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: mix(-20, 1940, scan), height: 6, background: ORANGE, boxShadow: `0 0 30px 8px ${ORANGE}`}} />
      )}
      {/* five selection slots with silhouettes */}
      <div style={{position: 'absolute', top: 1010, left: 60, right: 60, display: 'flex', justifyContent: 'space-between'}}>
        {SIL_PATHS.map((d, i) => {
          const p = prog(f, 8 + i * 4, 10, easeOut);
          const lit = f >= 40 + i * 3 && f < 46 + i * 3;
          return (
            <div
              key={i}
              style={{
                width: 172,
                height: 230,
                borderRadius: 14,
                border: `3px solid ${lit ? ORANGE : 'rgba(246,240,229,0.35)'}`,
                background: 'linear-gradient(180deg, rgba(14,137,147,0.18), rgba(10,24,40,0.6))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                transform: `translateY(${(1 - p) * 80}px)`,
                opacity: p,
                boxShadow: lit ? `0 0 26px ${ORANGE}` : 'none',
              }}
            >
              <svg width={110} height={150} viewBox="-10 -10 140 190">
                <path d={d} fill={lit ? ORANGE : '#1E3B5A'} stroke={IVORY} strokeWidth={3} strokeOpacity={0.5} />
              </svg>
              <div style={{fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 30, color: lit ? ORANGE : IVORY, opacity: 0.85}}>0{i + 1}</div>
            </div>
          );
        })}
      </div>
      <Logo at={4} size={150} top={230} x={150} />
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center'}}>
        <div
          style={{
            fontFamily: FONT_CONDENSED,
            fontWeight: 700,
            fontSize: 150,
            lineHeight: 0.98,
            color: IVORY,
            letterSpacing: `${mix(0.3, 0.01, t1)}em`,
            transform: `scale(${mix(1.6, 1, t1)})`,
            opacity: f >= 12 ? Math.min(1, t1 * 2) : 0,
            textShadow: '0 10px 30px rgba(0,0,0,0.6)',
          }}
        >
          CHOOSE YOUR
          <br />
          <span style={{backgroundImage: ORANGE_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>FIGHTER.</span>
        </div>
        <div
          style={{
            marginTop: 26,
            display: 'inline-block',
            padding: '10px 34px',
            background: ORANGE,
            transform: `skewX(-12deg) scale(${mix(1.8, 1, t2)})`,
            opacity: f >= 33 ? Math.min(1, t2 * 2) : 0,
            fontFamily: FONT_CONDENSED,
            fontWeight: 700,
            fontSize: 64,
            letterSpacing: '0.16em',
            color: NAVY_DEEP,
          }}
        >
          PATCH EDITION
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== fighter */

const FighterScene: React.FC<{ft: Fighter; index: number}> = ({ft, index}) => {
  const f = useCurrentFrame();
  const base = edl.fighters[index];
  const reveal = prog(f, 3, 11, easeInOut);
  const exit = prog(f, 84, 6, easeIn);
  return (
    <AbsoluteFill>
      {/* footage */}
      {ft.shots.map((id) => (
        <Sequence key={id} from={shot(id).from - base} durationInFrames={shot(id).frames}>
          <ShotPlate id={id} entry={ft.entry} />
        </Sequence>
      ))}
      <AbsoluteFill
        style={{background: `linear-gradient(180deg, rgba(10,24,40,0.92) 0%, rgba(10,24,40,0.7) 22%, rgba(10,24,40,0) 40%, rgba(10,24,40,0) 66%, rgba(10,24,40,0.85) 82%, ${NAVY_DEEP} 100%)`}}
      />
      {/* per-fighter flourishes */}
      {ft.entry === 'plush' && <GoldSweep at={30} />}
      {ft.entry === 'dimension' && <DimensionFrames at={14} />}
      {ft.entry === 'scan' && <PrecisionCrosshair at={14} />}
      <ArcadeHUD ft={ft} />
      <FighterTitle ft={ft} />
      <StatBar ft={ft} at={26} />
      {/* entry wipe sits above everything for its 11 frames */}
      <EntryWipe kind={ft.entry} p={reveal} />
      {exit > 0 && <AbsoluteFill style={{background: NAVY_DEEP, opacity: exit * 0.3}} />}
    </AbsoluteFill>
  );
};

/** One footage shot with a per-type camera treatment. */
const ShotPlate: React.FC<{id: string; entry: Entry}> = ({id, entry}) => {
  const f = useCurrentFrame();
  const punch = entry === 'dimension' && id === 'f3b' ? 1 - prog(f, 0, 7, easeOut) : 0;
  const macro = entry === 'scan' ? mix(1.12, 1, prog(f, 0, 40, easeOut)) : 1;
  const drift: [number, number] = entry === 'scan' ? [1, 1] : [1, 1.05];
  return <Footage src={seg(id)} scale={macro * (1 + punch * 0.12)} drift={drift} />;
};

/** Small arcade HUD: P1 tag, fighter index dots, corner brackets. */
const ArcadeHUD: React.FC<{ft: Fighter}> = ({ft}) => {
  const f = useCurrentFrame();
  const p = prog(f, 6, 10, easeOut);
  const idx = Number(ft.n) - 1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: p}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[
          [60, 180, 1, 1],
          [1020, 180, -1, 1],
          [60, 1600, 1, -1],
          [1020, 1600, -1, -1],
        ].map(([x, y, dx, dy], i) => (
          <path key={i} d={`M ${x + dx * 60} ${y} L ${x} ${y} L ${x} ${y + dy * 60}`} fill="none" stroke={IVORY} strokeWidth={4} opacity={0.8} />
        ))}
      </svg>
      <div style={{position: 'absolute', top: 1612, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14}}>
        {FIGHTERS.map((_, i) => (
          <div key={i} style={{width: i === idx ? 54 : 18, height: 10, borderRadius: 5, background: i === idx ? ORANGE : 'rgba(246,240,229,0.35)'}} />
        ))}
      </div>
    </div>
  );
};

/** "01 / 05", THE + NAME (masked, staggered), type chip and descriptor. */
const FighterTitle: React.FC<{ft: Fighter}> = ({ft}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const nIn = prog(f, 5, 8, easeOut);
  const chip = prog(f, 20, 10, easeOut);
  const desc = prog(f, 26, 14, easeOut);
  const words = ft.name.join(' ').split(' ');
  const twoLines = ft.name.length > 1;
  const grad = ft.entry === 'spectrum' ? WIZARD_GRAD : ORANGE_GRAD;
  const nameSize = twoLines ? 128 : words.join(' ').length > 12 ? 128 : 150;
  let wi = 0;
  return (
    <div style={{position: 'absolute', top: 212, left: 78, right: 60}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 12, overflow: 'hidden'}}>
        <span style={{fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 92, lineHeight: 1, color: ORANGE, transform: `translateY(${(1 - nIn) * 100}%)`, display: 'inline-block'}}>{ft.n}</span>
        <span style={{fontFamily: FONT_CONDENSED, fontWeight: 600, fontSize: 48, color: IVORY, opacity: nIn}}>/ 05</span>
        <div style={{height: 4, flex: 1, marginLeft: 16, alignSelf: 'center', background: `linear-gradient(90deg, ${ORANGE}, transparent)`, transform: `scaleX(${nIn})`, transformOrigin: 'left'}} />
      </div>
      {ft.name.map((line, li) => (
        <div key={li} style={{display: 'flex', flexWrap: 'nowrap', alignItems: 'baseline', gap: `0 ${nameSize * 0.2}px`, marginTop: li ? -6 : 4}}>
          {line.split(' ').map((w) => {
            const k = wi++;
            const at = 8 + k * 4;
            const s = spring({frame: f - at, fps, config: {damping: 14, stiffness: 230, mass: 0.7}});
            const isThe = w === 'THE';
            return (
              <span key={k} style={{display: 'inline-block', overflow: 'hidden', padding: '0.02em 0.04em 0.08em'}}>
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: FONT_CONDENSED,
                    fontWeight: 700,
                    fontSize: isThe ? nameSize * 0.62 : nameSize,
                    lineHeight: 1,
                    letterSpacing: `${mix(0.2, 0.0, s)}em`,
                    transform: `translateY(${(1 - s) * 105}%) skewX(-8deg)`,
                    ...(isThe
                      ? {color: IVORY}
                      : {backgroundImage: grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}),
                    filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.6))',
                  }}
                >
                  {w}
                </span>
              </span>
            );
          })}
        </div>
      ))}
      <div style={{marginTop: 14, display: 'flex', alignItems: 'center', gap: 20}}>
        <div
          style={{
            padding: '8px 22px',
            border: `3px solid ${ORANGE}`,
            borderRadius: 8,
            background: 'rgba(10,24,40,0.7)',
            fontFamily: FONT_CONDENSED,
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: '0.12em',
            color: IVORY,
            transform: `translateX(${(1 - chip) * -80}px)`,
            opacity: chip,
          }}
        >
          {ft.type}
        </div>
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: `${mix(0.4, 0.14, desc)}em`,
          color: IVORY,
          clipPath: `inset(0 ${(1 - desc) * 100}% 0 0)`,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        }}
      >
        {ft.desc}
      </div>
      {/* embroidered thread line under the title */}
      <svg width={900} height={30} style={{marginTop: 10, overflow: 'visible'}}>
        <line x1={0} y1={12} x2={760 * prog(f, 14, 20, easeOut)} y2={12} stroke={ft.entry === 'spectrum' ? '#EE4A8B' : ORANGE} strokeWidth={5} strokeDasharray="18 10" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/** Fictional game stat: label, segmented bar filling, counting number. */
const StatBar: React.FC<{ft: Fighter; at: number}> = ({ft, at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 24, easeOut);
  const inP = prog(f, at - 6, 8, easeOut);
  const v = Math.round(ft.value * p);
  const segs = 20;
  const lit = Math.round(segs * (ft.value / 100) * p);
  return (
    <div style={{position: 'absolute', top: 1440, left: 90, right: 90, opacity: inP, transform: `translateY(${(1 - inP) * 30}px)`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: FONT_CONDENSED, fontWeight: 700, color: IVORY}}>
        <span style={{fontSize: 46, letterSpacing: '0.14em'}}>{ft.stat}</span>
        <span style={{fontSize: 72, color: ORANGE, fontVariantNumeric: 'tabular-nums'}}>{v}</span>
      </div>
      <div style={{marginTop: 8, display: 'flex', gap: 6}}>
        {Array.from({length: segs}, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 26,
              transform: 'skewX(-14deg)',
              background: i < lit ? (ft.entry === 'spectrum' ? `hsl(${30 + i * 13}, 85%, 60%)` : i > segs - 4 ? GOLD : ORANGE) : 'rgba(246,240,229,0.18)',
              boxShadow: i === lit - 1 ? `0 0 14px ${ORANGE}` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/** Five distinct entry wipes, each motivated by its patch type. p: 0 covered → 1 revealed. */
const EntryWipe: React.FC<{kind: Entry; p: number}> = ({kind, p}) => {
  if (p >= 1) return null;
  if (kind === 'slash') {
    // orange diagonal panel slashes off to the right with a stitched edge
    const x = mix(0, 1500, p);
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', top: -200, bottom: -200, left: x - 300, width: 2200, background: ORANGE_GRAD, transform: 'skewX(-18deg)'}} />
        <div style={{position: 'absolute', top: -200, bottom: -200, left: x - 330, width: 8, background: `repeating-linear-gradient(180deg, ${IVORY} 0 22px, transparent 22px 34px)`, transform: 'skewX(-18deg)'}} />
      </AbsoluteFill>
    );
  }
  if (kind === 'plush') {
    // soft iris that opens with a fuzzy (chenille) edge
    const r = mix(0, 1250, p);
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <svg width={1080} height={1920}>
          <defs>
            <filter id="fuzz">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={3} />
              <feDisplacementMap in="SourceGraphic" scale={60} />
            </filter>
            <mask id="iris">
              <rect width={1080} height={1920} fill="#fff" />
              <circle cx={540} cy={1000} r={r} fill="#000" filter="url(#fuzz)" />
            </mask>
          </defs>
          <rect width={1080} height={1920} fill="#C8862A" mask="url(#iris)" />
        </svg>
      </AbsoluteFill>
    );
  }
  if (kind === 'dimension') {
    // orange and teal plates split apart with an offset shadow layer (depth)
    const d = mix(0, 1000, p);
    const plate = (color: string, dir: number, offset: number) => (
      <div style={{position: 'absolute', left: 0, right: 0, height: 980, top: dir < 0 ? -20 - d + offset : 960 + d + offset, background: color}} />
    );
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {plate(NAVY_DEEP, -1, 24)}
        {plate(NAVY_DEEP, 1, 24)}
        {plate(ORANGE, -1, 0)}
        {plate(TEAL, 1, 0)}
      </AbsoluteFill>
    );
  }
  if (kind === 'scan') {
    // technical scan: navy cover wiped by a precise ivory line with tick marks
    const y = mix(0, 1920, p);
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: y, bottom: 0, background: NAVY}} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <line x1={0} x2={1080} y1={y} y2={y} stroke={IVORY} strokeWidth={4} />
          {Array.from({length: 28}, (_, i) => (
            <line key={i} x1={i * 40} x2={i * 40} y1={y} y2={y + (i % 5 === 0 ? 30 : 14)} stroke={IVORY} strokeWidth={2} />
          ))}
        </svg>
      </AbsoluteFill>
    );
  }
  // spectrum: colourful gradient panel sweeps off upward
  const y = mix(0, -2100, p);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -100, right: -100, top: y, height: 2100, background: 'linear-gradient(0deg, #F3C45B 0%, #F28B38 25%, #EE4A8B 55%, #8C5BF0 80%, #2D6CF0 100%)', transform: 'skewY(-8deg)'}} />
    </AbsoluteFill>
  );
};

/** Golden-orange light sweep across the chenille (fighter 02). */
const GoldSweep: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 26, easeInOut);
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(110deg, transparent ${mix(-30, 100, p)}%, rgba(255,205,120,0.45) ${mix(-15, 115, p)}%, transparent ${mix(0, 130, p)}%)`,
        mixBlendMode: 'soft-light',
      }}
    />
  );
};

/** Layered offset hexagon outlines around the PVC patch (fighter 03): dimensional graphics. */
const DimensionFrames: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 16, easeOut);
  const q = prog(f, 50, 6, easeIn);
  const hex = (r: number) => {
    const cx = 540;
    const cy = 1060;
    return Array.from({length: 6}, (_, i) => {
      const a = Math.PI / 3 * i - Math.PI / 2;
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r * 1.05}`;
    }).join(' ');
  };
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: (1 - q) * p}}>
      <polygon points={hex(mix(380, 470, p))} fill="none" stroke={TEAL} strokeWidth={5} transform={`translate(${14 * p} ${14 * p})`} />
      <polygon points={hex(mix(380, 470, p))} fill="none" stroke={ORANGE} strokeWidth={5} />
      <polygon points={hex(mix(420, 520, p))} fill="none" stroke={IVORY} strokeWidth={2} strokeDasharray="14 12" opacity={0.7} />
    </svg>
  );
};

/** Precision crosshair + measurement ticks around (not over) the woven wolf (fighter 04). */
const PrecisionCrosshair: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 18, easeOut);
  const q = prog(f, 80, 6, easeIn);
  const cx = 540;
  const cy = 1050;
  const r = mix(560, 470, p);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: p * (1 - q)}}>
      <g stroke={IVORY} strokeWidth={3} fill="none">
        <circle cx={cx} cy={cy} r={r} strokeDasharray="4 14" />
        {[0, 90, 180, 270].map((a) => {
          const rad = (a * Math.PI) / 180;
          return <line key={a} x1={cx + Math.cos(rad) * (r + 10)} y1={cy + Math.sin(rad) * (r + 10)} x2={cx + Math.cos(rad) * (r + 60)} y2={cy + Math.sin(rad) * (r + 60)} stroke={ORANGE} strokeWidth={5} />;
        })}
      </g>
      <text x={70} y={cy + 12} fill={IVORY} transform={`rotate(-90 70 ${cy + 12})`} textAnchor="middle" style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 28, letterSpacing: '0.2em'}}>
        FINE WEAVE
      </text>
    </svg>
  );
};

/* ================================================================== select */

const CARD_W = 300;
const CARD_H = 400;
const CARD_POS: Array<[number, number]> = [
  [60, 520],
  [390, 520],
  [720, 520],
  [225, 960],
  [555, 960],
];

/** A fighter card: real still of the patch, label, number. */
export const FighterCard: React.FC<{ft: Fighter; x: number; y: number; selected: number; enter: number}> = ({ft, x, y, selected, enter}) => {
  const zoom = 0.42;
  const [px, py] = ft.cardPos;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: CARD_W,
        height: CARD_H,
        borderRadius: 18,
        overflow: 'hidden',
        background: NAVY,
        border: `4px solid ${selected > 0 ? ORANGE : 'rgba(246,240,229,0.3)'}`,
        boxShadow: selected > 0 ? `0 0 ${34 * selected}px ${ORANGE}` : '0 18px 40px rgba(0,0,0,0.5)',
        transform: `translateY(${(1 - enter) * 120}px) scale(${mix(0.9, 1, enter) * (1 + 0.04 * selected)})`,
        opacity: enter,
      }}
    >
      <Img
        src={staticFile(`brand/reel03-card-${ft.card}.jpg`)}
        style={{position: 'absolute', width: 1080 * zoom, height: 1920 * zoom, left: CARD_W / 2 - px * zoom, top: CARD_H * 0.44 - py * zoom, maxWidth: 'none'}}
      />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, background: `linear-gradient(0deg, ${NAVY_DEEP} 30%, rgba(10,24,40,0))`}} />
      <div style={{position: 'absolute', top: 10, left: 14, fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 40, color: ORANGE, textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{ft.n}</div>
      <div style={{position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: ft.cardLabel.length > 10 ? 38 : 44, letterSpacing: '0.04em', color: IVORY}}>
        {ft.cardLabel}
      </div>
    </div>
  );
};

/** 510–599: selection screen. Cursor clicks through 5 fighters, then the full lineup lights up. */
const SelectScreen: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const head = prog(f, 0, 10, easeOut);
  const cursor = Math.min(4, Math.floor(Math.max(0, f - 6) / 9));
  const allLit = f >= 52;
  const q1 = spring({frame: f - 52, fps, config: {damping: 13, stiffness: 220, mass: 0.7}});
  const q2 = prog(f, 64, 10, easeOut);
  const out = prog(f, 86, 4, easeIn);
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 55% at 50% 45%, #183A5C 0%, ${NAVY} 50%, ${NAVY_DEEP} 100%)`, opacity: 1 - out * 0.3}}>
      <div style={{position: 'absolute', top: 230, left: 0, right: 0, textAlign: 'center', overflow: 'hidden'}}>
        <div style={{fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 110, lineHeight: 1, color: IVORY, transform: `translateY(${(1 - head) * 100}%)`}}>
          SELECT YOUR <span style={{color: ORANGE}}>FIGHTER</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 800, fontSize: 30, letterSpacing: '0.3em', color: GOLD, opacity: head}}>
        5 PATCH TYPES · 1 BRAND
      </div>
      {FIGHTERS.map((ft, i) => {
        const [x, y] = CARD_POS[i];
        const enter = prog(f, 2 + i * 3, 10, easeOut);
        const selected = allLit ? 0.7 + 0.3 * Math.sin((f - 52) / 4) ** 2 : f >= 6 && cursor === i ? 1 : 0;
        return <FighterCard key={ft.n} ft={ft} x={x} y={y} selected={selected} enter={enter} />;
      })}
      {/* moving selector frame */}
      {!allLit && f >= 6 && (
        <div
          style={{
            position: 'absolute',
            left: CARD_POS[cursor][0] - 14,
            top: CARD_POS[cursor][1] - 14,
            width: CARD_W + 28,
            height: CARD_H + 28,
            border: `5px solid ${GOLD}`,
            borderRadius: 24,
          }}
        >
          <div style={{position: 'absolute', top: -46, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', background: GOLD, borderRadius: 6, fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 28, color: NAVY_DEEP}}>P1</div>
        </div>
      )}
      <div style={{position: 'absolute', top: 1405, left: 0, right: 0, textAlign: 'center'}}>
        <div
          style={{
            fontFamily: FONT_CONDENSED,
            fontWeight: 700,
            fontSize: 110,
            lineHeight: 1,
            color: IVORY,
            transform: `scale(${mix(1.6, 1, q1)})`,
            opacity: f >= 52 ? Math.min(1, q1 * 2) : 0,
          }}
        >
          WHICH ONE <span style={{color: ORANGE}}>WINS?</span>
        </div>
        <div
          style={{
            marginTop: 18,
            display: 'inline-block',
            padding: '12px 30px',
            borderRadius: 999,
            border: `3px solid ${GOLD}`,
            fontFamily: FONT_BODY,
            fontWeight: 800,
            fontSize: 38,
            letterSpacing: '0.08em',
            color: GOLD,
            transform: `translateY(${(1 - q2) * 40}px)`,
            opacity: q2,
          }}
        >
          COMMENT YOUR PICK ↓
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== end card */

const Logo: React.FC<{at: number; size: number; top: number; x?: number}> = ({at, size, top, x = 540}) => (
  // LogoBadge centres itself on x=540; shift to the requested centre
  <div style={{position: 'absolute', inset: 0, transform: `translateX(${x - 540}px)`}}>
    <LogoBadge at={at} size={size} top={top} />
  </div>
);

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bg = prog(f, 0, 8, easeOut);
  const l1 = prog(f, 8, 10, easeOut);
  const s2 = spring({frame: f - 16, fps, config: {damping: 13, stiffness: 220, mass: 0.75}});
  const sub = prog(f, 32, 14, easeOut);
  const btn = prog(f, 42, 12, easeOut);
  const stitch = prog(f, 50, 34, easeInOut);
  const url = prog(f, 58, 12, easeOut);
  const row = prog(f, 66, 14, easeOut);
  const bw = 860;
  const bh = 150;
  const perim = 2 * (bw + bh);
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 55% at 50% 40%, #183A5C 0%, ${NAVY} 50%, ${NAVY_DEEP} 100%)`, opacity: bg}}>
      <Logo at={4} size={220} top={210} />
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', overflow: 'hidden', padding: '0.04em 0 0.1em'}}>
        <div style={{fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 140, lineHeight: 1, color: IVORY, transform: `translateY(${(1 - l1) * 110}%)`}}>YOUR DESIGN.</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 618,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_CONDENSED,
          fontWeight: 700,
          fontSize: 140,
          lineHeight: 1,
          letterSpacing: `${mix(0.28, 0.01, s2)}em`,
          transform: `scale(${mix(1.5, 1, s2)})`,
          opacity: f >= 16 ? Math.min(1, s2 * 2) : 0,
          backgroundImage: ORANGE_GRAD,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        YOUR FIGHTER.
      </div>
      <div
        style={{
          position: 'absolute',
          top: 810,
          left: 90,
          right: 90,
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: `${mix(0.2, 0.04, sub)}em`,
          whiteSpace: 'nowrap',
          color: IVORY,
          clipPath: `inset(0 ${(1 - sub) * 50}% 0 ${(1 - sub) * 50}%)`,
        }}
      >
        TURN YOUR ARTWORK INTO A CUSTOM PATCH.
      </div>
      {/* CTA button with a stitch path sewing around it */}
      <div
        style={{
          position: 'absolute',
          top: 920,
          left: 540 - bw / 2,
          width: bw,
          height: bh,
          borderRadius: 24,
          background: ORANGE_GRAD,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT_CONDENSED,
          fontWeight: 700,
          fontSize: 54,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          color: NAVY_DEEP,
          transform: `translateY(${(1 - btn) * 60}px) scale(${mix(0.92, 1, btn)})`,
          opacity: btn,
          boxShadow: '0 24px 50px rgba(242,139,56,0.35)',
        }}
      >
        GET YOUR ARTWORK PATCHED →
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={540 - bw / 2 - 18} y={902} width={bw + 36} height={bh + 36} rx={36} fill="none" stroke={IVORY} strokeWidth={4} strokeDasharray="18 11" pathLength={perim} style={{clipPath: `inset(0 ${(1 - stitch) * 100}% 0 0)`}} />
      </svg>
      <div style={{position: 'absolute', top: 1120, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 800, fontSize: 44, color: GOLD, opacity: url, transform: `translateY(${(1 - url) * 24}px)`}}>
        quote.custompatchlab.com
      </div>
      {/* the five fighters, small, as a closing lineup */}
      <div style={{position: 'absolute', top: 1240, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16}}>
        {FIGHTERS.map((ft, i) => {
          const p = prog(f, 66 + i * 3, 10, easeOut);
          const zoom = 0.2;
          const [px, py] = ft.cardPos;
          return (
            <div key={ft.n} style={{position: 'relative', width: 170, height: 210, borderRadius: 14, overflow: 'hidden', border: `3px solid rgba(246,240,229,0.35)`, opacity: p * row, transform: `translateY(${(1 - p) * 40}px)`}}>
              <Img src={staticFile(`brand/reel03-card-${ft.card}.jpg`)} style={{position: 'absolute', width: 1080 * zoom, height: 1920 * zoom, left: 85 - px * zoom, top: 105 - py * zoom, maxWidth: 'none'}} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== hyperframes */

/** f32: title impact — 2-frame ivory frame with oversized navy "FIGHT". */
const HyperTitle: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 1) return null;
  return (
    <AbsoluteFill style={{background: f === at ? IVORY : ORANGE, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 520, lineHeight: 1, color: NAVY_DEEP, transform: `skewX(-10deg) scale(${f === at ? 1.1 : 1})`}}>FIGHT</div>
    </AbsoluteFill>
  );
};

/** Fighter entries — 3-frame navy frame with a huge cropped fighter number. */
const HyperNumber: React.FC<{at: number; n: string; entry: Entry}> = ({at, n, entry}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 2) return null;
  const k = f - at;
  return (
    <AbsoluteFill style={{background: k === 1 ? ORANGE : NAVY_DEEP, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
      <div
        style={{
          fontFamily: FONT_CONDENSED,
          fontWeight: 700,
          fontSize: 1150,
          lineHeight: 0.8,
          color: k === 1 ? NAVY_DEEP : 'transparent',
          WebkitTextStroke: k === 1 ? undefined : `10px ${entry === 'spectrum' ? '#EE4A8B' : ORANGE}`,
          transform: `translateX(${(k - 1) * 70}px) scale(${1.15 - k * 0.06})`,
        }}
      >
        {n}
      </div>
    </AbsoluteFill>
  );
};

/** f600: 2-frame brand flash — orange frame with the five fighter silhouettes in a row. */
const HyperBrand: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 1) return null;
  return (
    <AbsoluteFill style={{background: f === at ? ORANGE : NAVY_DEEP, justifyContent: 'center', alignItems: 'center'}}>
      <svg width={1000} height={260} viewBox="0 0 1000 260">
        {SIL_PATHS.map((d, i) => (
          <path key={i} d={d} transform={`translate(${30 + i * 196} 40) scale(1.15)`} fill={f === at ? NAVY_DEEP : ORANGE} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* ================================================================== cover */

/** Cover still: lineup + headline + original logo. */
export const Reel03Cover: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(90% 55% at 50% 45%, #183A5C 0%, ${NAVY} 50%, ${NAVY_DEEP} 100%)`}}>
    <LogoBadge at={-100} size={170} top={120} />
    <div style={{position: 'absolute', top: 320, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 170, lineHeight: 0.95, color: IVORY, textShadow: '0 10px 30px rgba(0,0,0,0.6)'}}>
      CHOOSE YOUR
      <br />
      <span style={{backgroundImage: ORANGE_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>FIGHTER.</span>
    </div>
    <div style={{position: 'absolute', top: 680, left: 0, right: 0, textAlign: 'center'}}>
      <span style={{display: 'inline-block', padding: '8px 30px', background: ORANGE, transform: 'skewX(-12deg)', fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 56, letterSpacing: '0.16em', color: NAVY_DEEP}}>PATCH EDITION</span>
    </div>
    {FIGHTERS.map((ft, i) => {
      const [x, y] = CARD_POS[i];
      return <FighterCard key={ft.n} ft={ft} x={x} y={y + 300} selected={0} enter={1} />;
    })}
    <div style={{position: 'absolute', top: 1720, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, color: GOLD}}>quote.custompatchlab.com</div>
  </AbsoluteFill>
);

