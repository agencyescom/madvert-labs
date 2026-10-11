/**
 * Hyper-motion toolkit (Ad 04): fast typographic moves, stitch-path
 * illustrations, technical callouts and graphic bar wipes. Every piece is
 * frame-driven and deterministic; timings are scene-local frames.
 */
import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_BODY, FONT_CONDENSED, FONT_SANS} from '../brand';
import {easeIn, easeInOut, easeOut, mix, prog} from '../motion';
import {MotionBlur} from './MotionBlur';

export const COBALT = '#3A6CEB'; // cobalt thread, lifted a touch so it reads on navy at phone size
export const IVORY = '#F6EFE2';

type Font = 'wide' | 'condensed' | 'body';
const family = (f: Font) => (f === 'wide' ? FONT_SANS : f === 'condensed' ? FONT_CONDENSED : FONT_BODY);

/**
 * One line of type with a choreographed entrance:
 *  rise   — masked vertical rise (preset A, fast masked reveal)
 *  snapL / snapR — horizontal snap with directional motion blur (preset D)
 *  impact — damped scale slam, tiny overshoot, no bounce train (preset C)
 *  wipe   — left-to-right clip wipe led by a cobalt bar (preset D)
 * Exits are fast and directional (up, or along the entry axis).
 */
export const HyperLine: React.FC<{
  id: string;
  text: string;
  at: number;
  mode: 'rise' | 'snapL' | 'snapR' | 'impact' | 'wipe';
  top: number;
  size: number;
  font?: Font;
  weight?: number;
  color?: string;
  tracking?: number;
  exitAt?: number;
  dur?: number;
  shadow?: boolean;
}> = ({id, text, at, mode, top, size, font = 'wide', weight = 900, color = IVORY, tracking = -0.01, exitAt, dur = 9, shadow = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = prog(frame, at, dur, easeOut);
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 7, easeIn);
  let transform = '';
  let clip: string | undefined;
  let blurX = 0;
  let blurY = 0;
  let opacity = 1;
  if (mode === 'rise') {
    transform = `translateY(${(1 - p) * 105}%)`;
    blurY = (1 - p) ** 1.5 * 18;
  } else if (mode === 'snapL' || mode === 'snapR') {
    const dir = mode === 'snapL' ? -1 : 1;
    transform = `translateX(${dir * (1 - p) * 900}px)`;
    blurX = (1 - p) ** 1.3 * 40;
    opacity = Math.min(1, p * 3);
  } else if (mode === 'impact') {
    const s = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 230, mass: 0.7}});
    transform = `scale(${mix(1.9, 1, s)})`;
    blurX = blurY = (1 - prog(frame, at, 6)) * 10;
    opacity = Math.min(1, prog(frame, at, 3) * 1.4);
  } else {
    clip = `inset(-20% ${(1 - p) * 100}% -20% 0)`;
  }
  if (q > 0) {
    transform += mode === 'snapL' || mode === 'snapR' ? ` translateX(${(mode === 'snapL' ? 1 : -1) * q * 1100}px)` : ` translateY(${-q * 130}%)`;
    blurY += mode.startsWith('snap') ? 0 : q * 16;
    blurX += mode.startsWith('snap') ? q * 40 : 0;
  }
  const blurred = blurX > 0.3 || blurY > 0.3;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        overflow: mode === 'rise' ? 'hidden' : 'visible',
        padding: '0.06em 0 0.12em',
        filter: shadow ? 'drop-shadow(0 10px 26px rgba(0,0,0,0.5))' : undefined,
      }}
    >
      <MotionBlur id={`hl-${id}`} x={blurX} y={blurY} />
      <div style={{position: 'relative', display: 'inline-block'}}>
        <div
          style={{
            fontFamily: family(font),
            fontWeight: weight,
            fontSize: size,
            lineHeight: 0.92,
            letterSpacing: `${tracking}em`,
            color,
            whiteSpace: 'nowrap',
            transform,
            opacity,
            clipPath: clip,
            filter: blurred ? `url(#hl-${id})` : undefined,
          }}
        >
          {text}
        </div>
        {mode === 'wipe' && p > 0 && p < 1 && (
          <div
            style={{
              position: 'absolute',
              top: '-8%',
              bottom: '-8%',
              left: `calc(${p * 100}% - 6px)`,
              width: 12,
              background: COBALT,
              boxShadow: `0 0 18px ${COBALT}`,
            }}
          />
        )}
      </div>
    </div>
  );
};

/** Small tracked label that types on with a sliding cursor bar. */
export const TrackedLabel: React.FC<{text: string; at: number; top: number; size?: number; color?: string; exitAt?: number}> = ({
  text,
  at,
  top,
  size = 34,
  color = IVORY,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 14, easeOut);
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 6, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONT_BODY,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: `${mix(0.6, 0.22, p)}em`,
        color,
        opacity: 1 - q,
        clipPath: `inset(0 ${(1 - p) * 50}% 0 ${(1 - p) * 50}%)`,
        filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.65))',
      }}
    >
      {text}
    </div>
  );
};

/** Oversized outline type drifting across the frame (parallax layer). */
export const OutlineSweep: React.FC<{text: string; at: number; dur: number; top: number; size: number; dir?: 1 | -1; opacity?: number}> = ({
  text,
  at,
  dur,
  top,
  size,
  dir = 1,
  opacity = 0.35,
}) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / dur;
  if (t < 0 || t > 1) return null;
  const x = mix(dir > 0 ? -900 : 900, dir > 0 ? 300 : -300, t);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        whiteSpace: 'nowrap',
        transform: `translateX(${x}px)`,
        fontFamily: FONT_CONDENSED,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: `3px ${IVORY}`,
        opacity: opacity * Math.min(1, t * 6, (1 - t) * 6),
      }}
    >
      {text}
    </div>
  );
};

/**
 * Stitch path: a running-stitch line that sews itself along an SVG path, with
 * a small needle-head dot leading it.
 */
export const ThreadPath: React.FC<{d: string; at: number; dur: number; color?: string; width?: number; exitAt?: number; length?: number}> = ({
  d,
  at,
  dur,
  color = COBALT,
  width = 5,
  exitAt,
  length = 2400,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur, easeInOut);
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 8, easeIn);
  if (p <= 0) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: 1 - q}}>
      <mask id={`tp-${at}-${dur}`}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={width * 3} strokeDasharray={length} strokeDashoffset={length * (1 - p)} />
      </mask>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray="18 12"
        mask={`url(#tp-${at}-${dur})`}
        style={{filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.45))`}}
      />
    </svg>
  );
};

/** Process step tag: index, label and a progress rule that fills over `dur`. */
export const StepTag: React.FC<{index: string; label: string; at: number; dur: number; exitAt?: number}> = ({index, label, at, dur, exitAt}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 10, easeOut);
  const fill = prog(frame, at, dur, (x) => x);
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 6, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        top: 240,
        left: 84,
        transform: `translateX(${(1 - p) * -60 - q * 80}px)`,
        opacity: p * (1 - q),
        fontFamily: FONT_BODY,
        filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.6))',
      }}
    >
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
        <span style={{fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 64, color: COBALT, WebkitTextStroke: `1px ${IVORY}`}}>{index}</span>
        <span style={{fontWeight: 800, fontSize: 36, letterSpacing: '0.28em', color: IVORY}}>{label}</span>
      </div>
      <div style={{marginTop: 8, width: 300, height: 4, background: 'rgba(246,239,226,0.25)'}}>
        <div style={{width: `${fill * 100}%`, height: '100%', background: IVORY}} />
      </div>
    </div>
  );
};

/**
 * Technical dimension callout: two parallel contour ticks with an arrow
 * between them (thread height), a leader line and a small label.
 */
export const DimensionCallout: React.FC<{x: number; y: number; at: number; label: string; exitAt?: number; flip?: boolean}> = ({x, y, at, label, exitAt, flip}) => {
  const frame = useCurrentFrame();
  const a = prog(frame, at, 10, easeOut);
  const b = prog(frame, at + 6, 12, easeOut);
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 6, easeIn);
  const dir = flip ? -1 : 1;
  const lead = 170 * b;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: 1 - q}}>
      <g stroke={IVORY} strokeWidth={3} fill="none" style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))'}}>
        <line x1={x - 34 * a} x2={x + 34 * a} y1={y - 40} y2={y - 40} />
        <line x1={x - 34 * a} x2={x + 34 * a} y1={y + 40} y2={y + 40} />
        <line x1={x} x2={x} y1={y - 40 * a} y2={y + 40 * a} />
        <path d={`M ${x - 9} ${y - 40 * a + 14} L ${x} ${y - 40 * a} L ${x + 9} ${y - 40 * a + 14}`} />
        <path d={`M ${x - 9} ${y + 40 * a - 14} L ${x} ${y + 40 * a} L ${x + 9} ${y + 40 * a - 14}`} />
        <line x1={x + dir * 40} x2={x + dir * (40 + lead)} y1={y} y2={y} strokeDasharray="8 6" />
      </g>
      <circle cx={x} cy={y} r={7 * a} fill={COBALT} stroke={IVORY} strokeWidth={2} />
      <text
        x={x + dir * (54 + lead)}
        y={y + 12}
        textAnchor={flip ? 'end' : 'start'}
        fill={IVORY}
        opacity={b}
        style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 32, letterSpacing: '0.16em', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))'}}
      >
        {label}
      </text>
    </svg>
  );
};

/**
 * Graphic transition: skewed cobalt / ivory / navy bars sweep across the frame.
 * `p` 0→1 drives the sweep; the cut should sit at p≈0.5 (frame fully covered).
 */
export const BarWipe: React.FC<{p: number; vertical?: boolean}> = ({p, vertical}) => {
  if (p <= 0 || p >= 1) return null;
  const bars = [
    {c: C.navy, delay: 0},
    {c: COBALT, delay: 0.08},
    {c: IVORY, delay: 0.16},
  ];
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {bars.map((b, i) => {
        const t = Math.min(1, Math.max(0, (p - b.delay) / (1 - 0.16)));
        const pos = mix(-130, 130, t); // percent
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: '-30%',
              background: b.c,
              transform: vertical
                ? `translateY(${-pos}%) skewY(-12deg)`
                : `translateX(${pos}%) skewX(-14deg)`,
              width: vertical ? '160%' : '60%',
              height: vertical ? '60%' : '160%',
              left: vertical ? '-30%' : '20%',
              top: vertical ? '20%' : '-30%',
              opacity: i === 2 ? 0.95 : 1,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Thin horizontal speed lines for whips (ivory, blurred). */
export const SpeedLinesFx: React.FC<{strength: number; seed?: number}> = ({strength, seed = 1}) => {
  if (strength <= 0.01) return null;
  const rows = [140, 380, 520, 760, 980, 1180, 1390, 1600, 1780];
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {rows.map((y, i) => (
        <div
          key={y}
          style={{
            position: 'absolute',
            top: y + ((i * 37 * seed) % 60),
            left: ((i * 173 * seed) % 600) - 200,
            width: 520 + ((i * 91) % 300),
            height: 4 + (i % 3) * 2,
            borderRadius: 6,
            background: `linear-gradient(90deg, transparent, ${IVORY}, transparent)`,
            filter: 'blur(2px)',
            opacity: strength * (0.4 + (i % 2) * 0.4),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
