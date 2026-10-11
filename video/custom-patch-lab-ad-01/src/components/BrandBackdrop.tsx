import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C} from '../brand';
import {easeInOut, mix, prog} from '../motion';

/** Deep navy → teal field from the USP / outro styleframes, with a soft top light. */
export const NavyField: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(85% 45% at 50% 22%, rgba(18,92,108,0.85) 0%, rgba(10,58,72,0.6) 40%, rgba(8,46,59,0) 75%),
        radial-gradient(120% 70% at 50% 100%, rgba(15,124,138,0.18) 0%, rgba(8,46,59,0) 60%),
        linear-gradient(180deg, ${C.navy} 0%, #072a35 55%, ${C.navyDeep} 100%)`,
    }}
  >
    <AbsoluteFill style={{background: 'radial-gradient(130% 80% at 50% 45%, rgba(0,0,0,0) 60%, rgba(2,14,19,0.55) 100%)'}} />
  </AbsoluteFill>
);

/**
 * Blueprint grid with red registration marks — the "lab" layer of the
 * styleframes. Lines draw in from the centre; marks pop on afterwards.
 */
export const BlueprintGrid: React.FC<{
  at: number;
  top: number;
  height: number;
  left?: number;
  width?: number;
  cell?: number;
  opacity?: number;
}> = ({at, top, height, left = 60, width = 960, cell = 60, opacity = 1}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 28, easeInOut);
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const marks = [
    [0.16, 0.0],
    [0.92, 0.12],
    [0.08, 0.83],
    [0.84, 0.66],
  ];
  return (
    <svg
      width={1080}
      height={1920}
      style={{position: 'absolute', inset: 0, opacity}}
      viewBox="0 0 1080 1920"
    >
      <defs>
        <radialGradient id="gridFade" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`gridMask-${top}-${height}`}>
          <rect x={left} y={top} width={width} height={height} fill="url(#gridFade)" />
        </mask>
      </defs>
      <g mask={`url(#gridMask-${top}-${height})`} stroke="#8FB7BE" strokeWidth={1} opacity={0.22}>
        {Array.from({length: cols + 1}, (_, i) => {
          const x = left + i * cell;
          const half = (height / 2) * p;
          return <line key={`v${i}`} x1={x} x2={x} y1={top + height / 2 - half} y2={top + height / 2 + half} />;
        })}
        {Array.from({length: rows + 1}, (_, i) => {
          const y = top + i * cell;
          const half = (width / 2) * p;
          return <line key={`h${i}`} y1={y} y2={y} x1={left + width / 2 - half} x2={left + width / 2 + half} />;
        })}
      </g>
      {/* red guide lines + registration diamonds */}
      {marks.map(([mx, my], i) => {
        const q = prog(frame, at + 12 + i * 3, 16);
        const x = left + Math.round((mx * width) / cell) * cell;
        const y = top + Math.round((my * height) / cell) * cell;
        const len = 150 * q;
        return (
          <g key={i} opacity={q}>
            <line x1={x} x2={x} y1={y - len} y2={y + len} stroke={C.red} strokeWidth={1.5} opacity={0.55} />
            <line x1={x - len} x2={x + len} y1={y} y2={y} stroke={C.red} strokeWidth={1.5} opacity={0.55} />
            <rect
              x={x - 5}
              y={y - 5}
              width={10}
              height={10}
              fill={C.red}
              transform={`rotate(45 ${x} ${y}) scale(1)`}
              style={{filter: 'drop-shadow(0 0 6px rgba(230,57,70,0.8))'}}
            />
          </g>
        );
      })}
    </svg>
  );
};

/**
 * Cream / teal speed streaks sliding across, as in the styleframes. `seed`
 * gives each use its own arrangement; `speed` in px/frame.
 */
export const SpeedStreaks: React.FC<{
  seed: string;
  at: number;
  bands: Array<{y: number; side: 'left' | 'right'}>;
  speed?: number;
  opacity?: number;
}> = ({seed, at, bands, speed = 14, opacity = 1}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const fadeIn = prog(frame, at, 10);
  return (
    <AbsoluteFill style={{opacity: opacity * fadeIn, pointerEvents: 'none'}}>
      {bands.flatMap((b, bi) =>
        Array.from({length: 4}, (_, k) => {
          const r = (n: string) => random(`${seed}-${bi}-${k}-${n}`);
          const w = mix(160, 420, r('w'));
          const h = mix(3, 10, r('h'));
          const dy = mix(-26, 26, r('y'));
          const travel = (t * speed * mix(0.6, 1.2, r('s')) + r('o') * 400) % 700;
          const x = b.side === 'left' ? -w - 80 + travel * 0.55 : 1080 + 80 - travel * 0.55;
          const cream = r('c') > 0.3;
          return (
            <div
              key={`${bi}-${k}`}
              style={{
                position: 'absolute',
                top: b.y + dy,
                left: x,
                width: w,
                height: h,
                borderRadius: h,
                background: cream
                  ? 'linear-gradient(90deg, rgba(255,249,243,0), rgba(255,249,243,0.85), rgba(255,249,243,0))'
                  : 'linear-gradient(90deg, rgba(15,124,138,0), rgba(120,200,210,0.6), rgba(15,124,138,0))',
                filter: `blur(${mix(1.5, 5, r('b'))}px)`,
                opacity: mix(0.35, 0.9, r('a')),
              }}
            />
          );
        }),
      )}
    </AbsoluteFill>
  );
};
