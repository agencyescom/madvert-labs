import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT_CONDENSED, FONT_SANS, GOLD_GRADIENT} from '../brand';
import {easeIn, easeInOut, easeOut, mix, prog} from '../motion';
import {MotionBlur} from './MotionBlur';

/**
 * Premium benefit badge: navy capsule with a gold hairline that draws on, an
 * icon medallion that pops in, then the benefit text wipes out of a mask.
 * Centred horizontally at `top`.
 */
export const BenefitBadge: React.FC<{
  id: string;
  at: number;
  exitAt?: number;
  top: number;
  icon: 'pen' | 'check';
  lead: string;
  rest: string;
}> = ({id, at, exitAt, top, icon, lead, rest}) => {
  const frame = useCurrentFrame();
  const open = prog(frame, at, 16);
  const draw = prog(frame, at + 2, 20, easeInOut);
  const iconIn = prog(frame, at + 3, 14);
  const textIn = prog(frame, at + 7, 16);
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 9, easeIn);
  const width = 900;
  const height = 150;
  const perim = 2 * (width - height) + Math.PI * height;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 540 - width / 2,
        width,
        height,
        opacity: (1 - q) * Math.min(1, open * 2),
        transform: `translateY(${(1 - open) * 26 - q * 30}px) scale(${mix(0.94, 1, open)})`,
        filter: q > 0.01 ? `url(#${id}-x)` : undefined,
      }}
    >
      <MotionBlur id={`${id}-x`} x={0} y={q * 10} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: height / 2,
          background: 'linear-gradient(180deg, rgba(10,52,65,0.92), rgba(5,30,40,0.94))',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,236,190,0.16)',
        }}
      />
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id={`${id}-g`} x1="0" x2="1">
            <stop offset="0" stopColor="#D98A2B" />
            <stop offset="0.5" stopColor="#FFE29A" />
            <stop offset="1" stopColor="#D98A2B" />
          </linearGradient>
        </defs>
        <rect
          x={1.5}
          y={1.5}
          width={width - 3}
          height={height - 3}
          rx={(height - 3) / 2}
          fill="none"
          stroke={`url(#${id}-g)`}
          strokeWidth={3}
          strokeDasharray={perim}
          strokeDashoffset={perim * (1 - draw)}
          style={{filter: 'drop-shadow(0 0 8px rgba(244,185,66,0.45))'}}
        />
      </svg>
      {/* icon medallion */}
      <div
        style={{
          position: 'absolute',
          left: 22,
          top: 22,
          width: 106,
          height: 106,
          borderRadius: '50%',
          background: icon === 'check' ? `linear-gradient(160deg, ${C.orange}, #C9471F)` : `linear-gradient(160deg, ${C.teal}, #0A5560)`,
          boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.25), 0 8px 20px rgba(0,0,0,0.45)',
          border: '2px dashed rgba(255,226,154,0.75)',
          transform: `scale(${mix(0.4, 1, iconIn)}) rotate(${mix(-40, 0, iconIn)}deg)`,
          opacity: iconIn,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon === 'pen' ? (
          <svg width={58} height={58} viewBox="0 0 24 24" fill="none" stroke={C.cream} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
        ) : (
          <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke={C.cream} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray={24} strokeDashoffset={24 * (1 - prog(frame, at + 8, 12))} />
          </svg>
        )}
      </div>
      {/* text */}
      <div
        style={{
          position: 'absolute',
          left: 150,
          right: 30,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          fontFamily: FONT_CONDENSED,
          fontWeight: 700,
          fontSize: 62,
          letterSpacing: `${mix(0.1, 0.03, textIn)}em`,
          whiteSpace: 'nowrap',
          clipPath: `inset(0 ${(1 - textIn) * 100}% 0 0)`,
        }}
      >
        <span style={{backgroundImage: GOLD_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginRight: '0.28em'}}>
          {lead}
        </span>
        <span style={{color: C.text}}>{rest}</span>
      </div>
    </div>
  );
};

export type TimedWord = {w: string; start: number};

/**
 * One-line word-by-word caption that lights each word as it is spoken (frames
 * are scene-local). For sound-off viewers on lines with no headline.
 */
export const WordCaption: React.FC<{words: TimedWord[]; top: number; exitAt?: number}> = ({words, top, exitAt}) => {
  const frame = useCurrentFrame();
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 8, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 90,
        right: 90,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 0.32em',
        fontFamily: FONT_SANS,
        fontWeight: 800,
        fontSize: 54,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        opacity: 1 - q,
        filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.7))',
      }}
    >
      {words.map((w, i) => {
        const p = prog(frame, w.start - 2, 8, easeOut);
        const lit = prog(frame, w.start, 4);
        const isKey = /ARTWORK|LIFE/i.test(w.w);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${(1 - p) * 18}px)`,
              opacity: mix(0, 1, p) * mix(0.45, 1, lit),
              color: isKey ? C.mustard : C.text,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** Embroidered name-tape style tag (teal twill, gold satin-stitch border) for the URL. */
export const StitchTag: React.FC<{at: number; top: number; text: string}> = ({at, top, text}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 16);
  const stitch = prog(frame, at + 4, 22, easeInOut);
  const width = 700;
  const height = 116;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 540 - width / 2,
        width,
        height,
        borderRadius: 18,
        background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 3px, rgba(0,0,0,0.04) 3px 6px), linear-gradient(180deg, #13808E, ${C.teal} 50%, #0B5F6A)`,
        boxShadow: '0 18px 40px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.18), inset 0 -3px 0 rgba(0,0,0,0.25)',
        border: '5px solid #1B1B1B',
        transform: `translateY(${(1 - p) * 40}px) rotate(${mix(-4, 0, p)}deg)`,
        opacity: p,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_CONDENSED,
        fontWeight: 700,
        fontSize: 58,
        letterSpacing: '0.04em',
      }}
    >
      {/* satin-stitch border sews itself on left → right */}
      <svg
        width={width}
        height={height}
        style={{position: 'absolute', left: -5, top: -5, clipPath: `inset(0 ${(1 - stitch) * 100}% 0 0)`}}
      >
        <rect x={18} y={18} width={width - 36} height={height - 36} rx={8} fill="none" stroke="#F4B942" strokeWidth={2.5} strokeDasharray="10 7" opacity={0.9} />
      </svg>
      <span style={{color: '#F7D27A', textShadow: '0 2px 0 rgba(0,0,0,0.35)'}}>{text}</span>
    </div>
  );
};

/** Solid orange bar that wipes in under a word (design-01 "PREMIUM" underline). */
export const AccentBar: React.FC<{at: number; top: number; width: number; height?: number; exitAt?: number}> = ({
  at,
  top,
  width,
  height = 30,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 12, easeOut);
  const q = exitAt === undefined ? 0 : prog(frame, exitAt, 8, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 540 - width / 2,
        width,
        height,
        background: `linear-gradient(180deg, #FF7A45, ${C.orange} 55%, #D9501F)`,
        boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
        transformOrigin: q > 0 ? 'right center' : 'left center',
        transform: `scaleX(${p * (1 - q)})`,
      }}
    />
  );
};
