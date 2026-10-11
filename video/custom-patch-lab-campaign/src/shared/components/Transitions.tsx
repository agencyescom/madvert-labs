import React from 'react';
import {AbsoluteFill} from 'remotion';
import {mix} from '../motion';

/** Bright cream bars riding the leading edge of a left→right light-streak wipe. */
export const WipeStreaks: React.FC<{edge: number; strength: number}> = ({edge, strength}) => (
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
export const DiagonalReveal: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => {
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
