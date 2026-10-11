import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GOLD_LINE} from '../brand';
import {easeIn, prog} from '../motion';

/** Hairline gold accent that draws out from the centre, with a glint travelling across it. */
export const GoldRule: React.FC<{
  at: number;
  width: number;
  top: number;
  exitAt?: number;
  thickness?: number;
}> = ({at, width, top, exitAt, thickness = 3}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 20);
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 8, easeIn);
  const glint = prog(frame, at + 6, 26);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 540 - width / 2,
        width,
        height: thickness,
        transform: `scaleX(${p * (1 - q)})`,
        background: GOLD_LINE,
        boxShadow: '0 0 14px rgba(244,185,66,0.55)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -2,
          bottom: -2,
          width: 90,
          left: -90 + glint * (width + 180),
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)',
          opacity: glint < 1 ? 1 : 0,
        }}
      />
    </div>
  );
};
