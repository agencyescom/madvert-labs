import React from 'react';
import {Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {easeOut, mix, prog} from '../motion';
import {MotionBlur} from './MotionBlur';

// cpl-logo.png is the original circular badge, masked to its own outline by
// scripts/mask-logo.py. Native size 880x894 — always rendered at that ratio.
const RATIO = 894 / 880;

/** Official circular Custom Patch Lab logo: spring-in, gold ripple ring, light sweep. */
export const LogoBadge: React.FC<{at: number; size: number; top: number}> = ({at, size, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 120, mass: 0.9}});
  const appear = prog(frame, at, 10);
  const blur = (1 - prog(frame, at, 14)) * 12;
  const ripple = prog(frame, at + 2, 26, easeOut);
  const sweep = prog(frame, at + 48, 22);
  const h = size * RATIO;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 540 - size / 2,
        width: size,
        height: h,
        transform: `scale(${mix(0.55, 1, s)}) rotate(${mix(-10, 0, s)}deg)`,
        opacity: appear,
      }}
    >
      {/* ripple */}
      <div
        style={{
          position: 'absolute',
          inset: -6,
          borderRadius: '50%',
          border: '3px solid #F4B942',
          transform: `scale(${mix(0.95, 1.45, ripple)})`,
          opacity: (1 - ripple) * 0.9,
          boxShadow: '0 0 24px rgba(244,185,66,0.7)',
        }}
      />
      {/* soft glow behind */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(244,185,66,0.22), rgba(15,124,138,0.12) 60%, rgba(0,0,0,0))',
        }}
      />
      <MotionBlur id="logo-blur" x={blur} y={blur} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          filter: blur > 0.3 ? 'url(#logo-blur)' : undefined,
          boxShadow: '0 26px 60px rgba(0,0,0,0.55), 0 0 0 4px rgba(244,185,66,0.35)',
        }}
      >
        <Img src={staticFile('brand/cpl-logo.png')} style={{width: '100%', height: '100%', display: 'block'}} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${mix(-40, 100, sweep)}%, rgba(255,255,255,0.55) ${mix(-30, 110, sweep)}%, rgba(255,255,255,0) ${mix(-20, 120, sweep)}%)`,
            mixBlendMode: 'soft-light',
            opacity: sweep > 0 && sweep < 1 ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};
