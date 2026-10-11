import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT_CONDENSED, GOLD_GRADIENT} from '../brand';
import {easeIn, mix, prog} from '../motion';
import {MotionBlur} from './MotionBlur';

/**
 * Rhythmic word montage: each word punches in on its spoken frame (masked rise
 * + scale settle + motion blur) and the stack builds line by line. The newest
 * word carries the accent; earlier words step back to cream.
 */
export const WordStack: React.FC<{
  id: string;
  items: Array<{text: string; at: number}>;
  top: number;
  size?: number;
  exitAt?: number;
}> = ({id, items, top, size = 128, exitAt}) => {
  const frame = useCurrentFrame();
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 9, easeIn);
  const current = items.reduce((acc, it, i) => (frame >= it.at ? i : acc), -1);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: FONT_CONDENSED,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.02,
        filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.6))',
        opacity: 1 - q,
        transform: `translateY(${-q * 50}px)`,
      }}
    >
      {items.map((it, i) => {
        const p = prog(frame, it.at, 12);
        const blur = Math.pow(1 - p, 1.5) * 16;
        const accent = i === current;
        return (
          <div key={it.text} style={{overflow: 'hidden', padding: '0.04em 0.05em 0.1em'}}>
            <MotionBlur id={`${id}-${i}`} x={0} y={blur} />
            <div
              style={{
                transform: `translateY(${(1 - p) * 105}%) scale(${mix(1.25, 1, p)})`,
                letterSpacing: `${mix(0.2, 0.02, p)}em`,
                filter: blur > 0.3 ? `url(#${id}-${i})` : undefined,
                ...(accent
                  ? {backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}
                  : {color: C.text}),
              }}
            >
              {it.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
