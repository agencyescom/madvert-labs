import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeInOut, easeIn, prog} from '../motion';

/**
 * Rounded navy panel with a thin gold border that draws itself on (stroke
 * dash), as on the CTA / benefit pills of the styleframes. Children are laid
 * out centred inside.
 */
export const GoldFramePanel: React.FC<{
  at: number;
  top: number;
  width: number;
  height: number;
  radius?: number;
  exitAt?: number;
  children: React.ReactNode;
}> = ({at, top, width, height, radius = 34, exitAt, children}) => {
  const frame = useCurrentFrame();
  const fill = prog(frame, at, 14);
  const draw = prog(frame, at + 2, 24, easeInOut);
  const glow = prog(frame, at + 20, 30);
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 10, easeIn);
  const perim = 2 * (width + height - 4 * radius) + 2 * Math.PI * radius;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 540 - width / 2,
        width,
        height,
        opacity: 1 - q,
        transform: `translateY(${-q * 40}px) scale(${0.96 + 0.04 * fill})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: 'linear-gradient(180deg, rgba(10,52,65,0.94), rgba(5,32,42,0.96))',
          boxShadow: `0 30px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,236,190,0.18)`,
          opacity: fill,
        }}
      />
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id={`gf-${at}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE29A" />
            <stop offset="50%" stopColor="#F4B942" />
            <stop offset="100%" stopColor="#D98A2B" />
          </linearGradient>
        </defs>
        <rect
          x={1.5}
          y={1.5}
          width={width - 3}
          height={height - 3}
          rx={radius}
          fill="none"
          stroke={`url(#gf-${at})`}
          strokeWidth={3}
          strokeDasharray={perim}
          strokeDashoffset={perim * (1 - draw)}
          style={{filter: `drop-shadow(0 0 ${4 + 8 * glow}px rgba(244,185,66,${0.35 + 0.25 * glow}))`}}
        />
      </svg>
      {/* top + bottom glints like the styleframe panel edges */}
      {[0, height].map((y, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: y - 2,
            left: width * 0.2,
            width: width * 0.6,
            height: 4,
            background: 'radial-gradient(closest-side, rgba(255,226,154,0.95), rgba(255,226,154,0))',
            opacity: glow * 0.9,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};
