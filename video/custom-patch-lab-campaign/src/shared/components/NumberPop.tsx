import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_BODY, FONT_CONDENSED, ORANGE_GRADIENT} from '../brand';
import {easeIn, mix, prog} from '../motion';
import {MotionBlur} from './MotionBlur';

/**
 * Big figure that pops in on a damped spring (slight overshoot, no bounce
 * train), with a stacked supporting label wiping in beside it — the "$0 SETUP
 * FEES" lock-up from the design-03 styleframe.
 */
export const NumberPop: React.FC<{
  id: string;
  value: string;
  at: number;
  labelAt: number;
  label: [string, string];
  top: number;
  exitAt?: number;
  size?: number;
  /** Navy band behind the lock-up (design-03), sliding up from the bottom edge. */
  band?: boolean;
}> = ({id, value, at, labelAt, label, top, exitAt, size = 330, band}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 190, mass: 0.9}});
  const blur = (1 - prog(frame, at, 8)) * 14;
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 9, easeIn);
  const bandIn = prog(frame, at - 4, 12);
  return (
    <>
      {band && (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          top: top - 70,
          transform: `translateY(${(1 - bandIn) * 100}%)`,
          background: `linear-gradient(180deg, ${C.navy}, ${C.navyDeep})`,
          borderTop: `6px solid ${C.teal}`,
          boxShadow: '0 -20px 50px rgba(0,0,0,0.45)',
          opacity: 1 - q,
        }}
      />
    )}
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 34,
        opacity: 1 - q,
        transform: `translateY(${-q * 40}px)`,
        filter: 'drop-shadow(0 14px 34px rgba(0,0,0,0.6))',
      }}
    >
      <MotionBlur id={`${id}-b`} x={0} y={blur} />
      <div
        style={{
          fontFamily: FONT_CONDENSED,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 0.86,
          letterSpacing: '-0.02em',
          backgroundImage: ORANGE_GRADIENT,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          transform: `scale(${mix(0.35, 1, s)})`,
          opacity: Math.min(1, prog(frame, at, 4) * 1.5),
          filter: blur > 0.3 ? `url(#${id}-b)` : undefined,
        }}
      >
        {value.startsWith('$') ? (
          <>
            {/* currency sign set smaller in Inter: Oswald's $ loses its bar at display size and reads as "S" */}
            <span
              style={{
                fontFamily: FONT_BODY,
                fontWeight: 800,
                fontSize: size * 0.48,
                verticalAlign: size * 0.3,
                marginRight: size * 0.02,
                backgroundImage: ORANGE_GRADIENT,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              $
            </span>
            {value.slice(1)}
          </>
        ) : (
          value
        )}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        {label.map((l, i) => {
          const p = prog(frame, labelAt + i * 4, 12);
          return (
            <div key={l} style={{overflow: 'hidden', padding: '0.06em 0'}}>
              <div
                style={{
                  fontFamily: FONT_CONDENSED,
                  fontWeight: 700,
                  fontSize: size * 0.4,
                  lineHeight: 0.98,
                  color: C.text,
                  letterSpacing: `${mix(0.18, 0.03, p)}em`,
                  transform: `translateX(${(1 - p) * -40}px)`,
                  clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
                }}
              >
                {l}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
};
