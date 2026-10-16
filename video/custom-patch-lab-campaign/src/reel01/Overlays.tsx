/**
 * Reel 01 v2 graphics layer (client note: "motion graphics not visible at the
 * start, middle or end"). Everything here is sized for a phone screen: 4–6 px
 * strokes, 32–44 px labels on navy pills, and it is continuous from frame 0
 * to 540.
 */
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {FONT_BODY, FONT_CONDENSED} from '../shared/brand';
import {easeIn, easeInOut, easeOut, mix, prog} from '../shared/motion';
import track from './patch-track.json';

const NAVY = '#0B1A33';
const IVORY = '#F7F0E3';
const ORANGE = '#F26A21';
const GOLD = '#F5B941';

/** Patch circle (centre + radius, px) in the final frame, tracked from video 2 (patch-track.json). */
export const patchAt = (f: number) => {
  const fs = track.map((k) => k[0]);
  const at = (i: number) => interpolate(f, fs, track.map((k) => k[i]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {x: at(1), y: at(2), r: at(3)};
};

/* ------------------------------------------------------------------ HUD */

const SCENES = [
  {from: 0, to: 60, n: '01', label: 'THE NEEDLE'},
  {from: 60, to: 180, n: '02', label: 'THREAD MAGIC'},
  {from: 180, to: 300, n: '03', label: 'THREAD BY THREAD'},
  {from: 300, to: 420, n: '04', label: 'THE REVEAL'},
];

/** Cinema-camera HUD: viewfinder brackets, REC + timecode, scene index with progress. 0–420. */
export const CameraHUD: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= 426) return null;
  const inP = prog(f, 0, 10, easeOut);
  const out = prog(f, 412, 12, easeIn);
  const scene = SCENES.find((s) => f >= s.from && f < s.to) ?? SCENES[SCENES.length - 1];
  const sp = prog(f, scene.from, scene.to - scene.from, (x) => x);
  const labelIn = prog(f, scene.from, 8, easeOut);
  const arm = 78;
  const inset = mix(-40, 0, inP);
  const tc = (() => {
    const fr = f % 30;
    const s = Math.floor(f / 30);
    return `00:00:${String(s).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
  })();
  const bracket = (x: number, y: number, dx: number, dy: number) => (
    <path d={`M ${x + dx * arm} ${y} L ${x} ${y} L ${x} ${y + dy * arm}`} fill="none" stroke={IVORY} strokeWidth={5} strokeLinecap="square" />
  );
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))'}}>
        {bracket(64 - inset, 150 - inset, 1, 1)}
        {bracket(1016 + inset, 150 - inset, -1, 1)}
        {bracket(64 - inset, 1640 + inset, 1, -1)}
        {bracket(1016 + inset, 1640 + inset, -1, -1)}
        {/* top progress rule across the whole reel */}
        <line x1={64} x2={64 + 952 * (f / 539)} y1={128} y2={128} stroke={ORANGE} strokeWidth={4} />
      </svg>
      {/* scene index block, bottom-left */}
      <div
        style={{
          position: 'absolute',
          left: 78,
          top: 1436,
          padding: '16px 24px 18px',
          borderRadius: 22,
          background: 'rgba(11,26,51,0.78)',
          border: '1.5px solid rgba(245,185,65,0.55)',
          fontFamily: FONT_BODY,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontWeight: 800, fontSize: 28, letterSpacing: '0.18em', color: IVORY}}>
          <span style={{width: 16, height: 16, borderRadius: 8, background: ORANGE, opacity: f % 30 < 18 ? 1 : 0.25}} />
          <span>REC</span>
          <span style={{fontVariantNumeric: 'tabular-nums', letterSpacing: '0.08em', color: GOLD}}>{tc}</span>
        </div>
        <div style={{marginTop: 12, overflow: 'hidden'}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              transform: `translateY(${(1 - labelIn) * 100}%)`,
              fontFamily: FONT_CONDENSED,
              fontWeight: 700,
              fontSize: 54,
              lineHeight: 1.05,
              color: IVORY,
            }}
          >
            <span style={{color: ORANGE}}>{scene.n}</span>
            <span>{scene.label}</span>
          </div>
        </div>
        <div style={{marginTop: 10, width: 360, height: 5, background: 'rgba(247,240,227,0.25)'}}>
          <div style={{width: `${sp * 100}%`, height: '100%', background: ORANGE}} />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ pills */

/** Callout pill (navy, orange dot, ivory label) on a leader line from (x,y). */
export const CalloutPill: React.FC<{at: number; exitAt: number; x: number; y: number; label: string; dx: number; dy: number}> = ({at, exitAt, x, y, label, dx, dy}) => {
  const f = useCurrentFrame();
  const a = prog(f, at, 8, easeOut);
  const b = prog(f, at + 4, 10, easeOut);
  const q = prog(f, exitAt, 7, easeIn);
  if (a <= 0 || q >= 1) return null;
  const ex = x + dx * b;
  const ey = y + dy * b;
  const size = 34;
  const w = label.length * size * 0.66 + 70;
  const h = 64;
  const px = ex - w / 2; // pill is centred on the end of its leader line
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - q, overflow: 'visible'}}>
      <g style={{filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.55))'}}>
        <circle cx={x} cy={y} r={18 * a} fill="none" stroke={IVORY} strokeWidth={4} />
        <circle cx={x} cy={y} r={7 * a} fill={ORANGE} />
        <line x1={x} y1={y} x2={ex} y2={ey + (dy < 0 ? h / 2 : -h / 2)} stroke={IVORY} strokeWidth={4} />
        <g opacity={b} transform={`translate(${px} ${ey - h / 2})`}>
          <rect width={w} height={h} rx={h / 2} fill={NAVY} stroke={GOLD} strokeWidth={2.5} />
          <circle cx={30} cy={h / 2} r={8} fill={ORANGE} />
          <text x={50} y={h / 2 + 12} fill={IVORY} style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: size, letterSpacing: '0.08em'}}>
            {label}
          </text>
        </g>
      </g>
    </svg>
  );
};

/* ------------------------------------------------------- patch tracking */

/** Stitched orbit ring locked to the patch: draws on, rotates, with orange quarter ticks. */
export const PatchOrbit: React.FC<{at: number; exitAt: number; pad?: number}> = ({at, exitAt, pad = 46}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 20, easeInOut);
  const q = prog(f, exitAt, 10, easeIn);
  if (p <= 0 || q >= 1) return null;
  const {x, y, r} = patchAt(f);
  const R = r + pad;
  const circ = 2 * Math.PI * R;
  const rot = (f - at) * 0.8;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - q, overflow: 'visible'}}>
      <g transform={`rotate(${rot - 90} ${x} ${y})`} style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))'}}>
        <circle cx={x} cy={y} r={R} fill="none" stroke={ORANGE} strokeWidth={5} strokeDasharray={`${circ * p} ${circ}`} />
        <circle cx={x} cy={y} r={R} fill="none" stroke={IVORY} strokeWidth={3} strokeDasharray="14 12" opacity={0.0 + p * 0.9} transform={`rotate(4 ${x} ${y})`} style={{mixBlendMode: 'normal'}} />
        {[0, 90, 180, 270].map((d) => {
          if (d / 360 > p) return null;
          const a = (d * Math.PI) / 180;
          return (
            <line
              key={d}
              x1={x + Math.cos(a) * (R + 10)}
              y1={y + Math.sin(a) * (R + 10)}
              x2={x + Math.cos(a) * (R + 40)}
              y2={y + Math.sin(a) * (R + 40)}
              stroke={GOLD}
              strokeWidth={6}
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </svg>
  );
};

/** Text ring orbiting the patch during the payoff. */
export const TextRing: React.FC<{at: number; text: string; pad?: number}> = ({at, text, pad = 60}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 18, easeOut);
  if (p <= 0) return null;
  const {x, y, r} = patchAt(f);
  const R = r + pad;
  const id = 'reel01-ring';
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: p * 0.95, overflow: 'visible'}}>
      <defs>
        <path id={id} d={`M ${x - R} ${y} a ${R} ${R} 0 1 1 ${2 * R} 0 a ${R} ${R} 0 1 1 ${-2 * R} 0`} />
      </defs>
      <g transform={`rotate(${(f - at) * 0.45 - 30 * (1 - p)} ${x} ${y})`} style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))'}}>
        <text fill={IVORY} style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 30, letterSpacing: '0.42em'}}>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ end */

/** Brand row in a glass pill with gold hairline; URL as an orange button chip. */
export const BrandPill: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 14, easeOut);
  const shine = prog(f, at + 40, 24, easeInOut);
  return (
    <div
      style={{
        position: 'absolute',
        top: 1400,
        left: 60,
        right: 60,
        height: 196,
        borderRadius: 40,
        background: 'linear-gradient(180deg, rgba(14,34,64,0.92), rgba(9,22,44,0.95))',
        border: `2.5px solid ${GOLD}`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,240,210,0.18)',
        transform: `translateY(${(1 - p) * 80}px) scale(${mix(0.94, 1, p)})`,
        opacity: p,
        overflow: 'hidden',
      }}
    >
      {children}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(110deg, transparent ${mix(-30, 110, shine)}%, rgba(255,240,210,0.18) ${mix(-15, 125, shine)}%, transparent ${mix(0, 140, shine)}%)`,
        }}
      />
    </div>
  );
};

export {NAVY, IVORY, ORANGE, GOLD};
