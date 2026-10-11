import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../brand';
import {easeInOut, mix, prog} from '../motion';

type Props = {
  shot: string;
  /** Static framing: scale about centre and vertical offset (px) to keep the face clear of type. */
  scale?: number;
  y?: number;
  /** Slow push across the whole shot (multiplies `scale`). */
  drift?: [number, number];
  /** Legibility shading behind type, 0–1. */
  shadeTop?: number;
  shadeBottom?: number;
  /** Extra transform/filter injected by a transition. */
  fx?: React.CSSProperties;
  fxFilter?: string;
};

/**
 * A conformed shot (public/segments/<id>.mp4, exact length, 30 fps) with the
 * campaign grade: gentle contrast/saturation, teal-navy shadows, warm
 * highlights, vignette and optional shading where type sits.
 */
export const Footage: React.FC<Props> = ({
  shot,
  scale = 1,
  y = 0,
  drift = [1, 1.04],
  shadeTop = 0,
  shadeBottom = 0,
  fx,
  fxFilter,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const d = mix(drift[0], drift[1], prog(frame, 0, durationInFrames, easeInOut));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.navyDeep, ...fx}}>
      <AbsoluteFill style={{filter: fxFilter}}>
        <AbsoluteFill
          style={{
            transform: `translateY(${y}px) scale(${scale * d})`,
            filter: 'contrast(1.07) saturate(1.1) brightness(1.01)',
          }}
        >
          <OffthreadVideo muted src={staticFile(`segments/${shot}.mp4`)} style={{width: '100%', height: '100%'}} />
        </AbsoluteFill>
        {/* split-tone: cool teal-navy into the shadows, warmth stays in the thread colours */}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,124,138,0.16), rgba(8,46,59,0.22))', mixBlendMode: 'soft-light'}} />
        <AbsoluteFill
          style={{background: 'radial-gradient(120% 75% at 50% 46%, rgba(0,0,0,0) 55%, rgba(3,20,27,0.62) 100%)'}}
        />
        {shadeTop > 0 && (
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, rgba(4,26,34,${0.86 * shadeTop}) 0%, rgba(4,26,34,${0.55 * shadeTop}) 22%, rgba(4,26,34,0) 42%)`,
            }}
          />
        )}
        {shadeBottom > 0 && (
          <AbsoluteFill
            style={{
              background: `linear-gradient(0deg, rgba(4,26,34,${0.9 * shadeBottom}) 0%, rgba(4,26,34,${0.62 * shadeBottom}) 26%, rgba(4,26,34,0) 48%)`,
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
