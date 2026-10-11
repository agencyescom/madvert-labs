import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, DISPLAY_AXES, FONT_DISPLAY, FONT_SANS, GOLD_GRADIENT} from '../brand';
import {easeIn, mix, prog} from '../motion';
import {MotionBlur} from './MotionBlur';

export type Word = {text: string; gold?: boolean};

export type LineSpec = {
  words: Word[];
  /** Frame (scene-local) the first word starts rising. */
  at: number;
  size: number;
  font?: 'display' | 'sans';
  weight?: number;
  /** Letter-spacing in em, animated from → to as the line settles. */
  tracking?: [number, number];
  /** Frames between word entrances (8th note = 7.5f at 120 BPM). */
  stagger?: number;
  lineHeight?: number;
};

type Props = {
  id: string;
  lines: LineSpec[];
  /** Scene-local frame the block starts leaving; omit to hold. */
  exitAt?: number;
  exit?: 'up' | 'blur';
  style?: React.CSSProperties;
};

const ENTER = 17;
const EXIT = 9;

/**
 * Masked, staggered word reveal: each word rises out of its own clipping
 * mask with a vertical motion blur that resolves as it lands, while the
 * line's tracking tightens. Exit reverses upward on a faster ease-in.
 */
export const KineticText: React.FC<Props> = ({id, lines, exitAt, exit = 'up', style}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.55)) drop-shadow(0 2px 2px rgba(0,0,0,0.35))',
        ...style,
      }}
    >
      {lines.map((line, li) => {
        const stagger = line.stagger ?? 4;
        const t = prog(frame, line.at, 26);
        const [tr0, tr1] = line.tracking ?? [0.08, 0.01];
        const display = (line.font ?? 'display') === 'display';
        return (
          <div
            key={li}
            style={{
              display: 'flex',
              gap: `0 ${line.size * 0.26}px`,
              justifyContent: 'center',
              fontFamily: display ? FONT_DISPLAY : FONT_SANS,
              fontVariationSettings: display ? DISPLAY_AXES : undefined,
              fontWeight: line.weight ?? (display ? 760 : 700),
              fontSize: line.size,
              lineHeight: line.lineHeight ?? 1.0,
              letterSpacing: `${mix(tr0, tr1, t)}em`,
              color: C.text,
              whiteSpace: 'nowrap',
            }}
          >
            {line.words.map((w, wi) => {
              const start = line.at + wi * stagger;
              const p = prog(frame, start, ENTER);
              const q = exitAt === undefined ? 0 : prog(frame, exitAt + li * 2 + wi, EXIT, easeIn);
              const y = (1 - p) * 112 - q * (exit === 'up' ? 112 : 0);
              const blur = Math.pow(1 - p, 1.6) * 16 + q * 14;
              const fid = `${id}-${li}-${wi}`;
              return (
                <span
                  key={wi}
                  style={{
                    display: 'inline-block',
                    overflow: 'hidden',
                    padding: '0.1em 0.04em 0.16em',
                    margin: '-0.1em -0.04em -0.16em',
                  }}
                >
                  <MotionBlur id={fid} x={0} y={blur} />
                  <span
                    style={{
                      display: 'inline-block',
                      transform: `translateY(${y}%)`,
                      opacity: Math.min(1, p * 2.2) * (exit === 'blur' ? 1 - q : 1),
                      filter: blur > 0.3 ? `url(#${fid})` : undefined,
                      ...(w.gold
                        ? {
                            backgroundImage: GOLD_GRADIENT,
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                          }
                        : null),
                    }}
                  >
                    {w.text}
                  </span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** Helper: "YOUR LOGO" → [{text:'YOUR'},{text:'LOGO'}], with optional gold words. */
export const words = (s: string, gold: boolean | string[] = false): Word[] =>
  s.split(' ').map((text) => ({text, gold: Array.isArray(gold) ? gold.includes(text) : gold}));
