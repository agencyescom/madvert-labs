import React from 'react';
import {AbsoluteFill, random, staticFile, useCurrentFrame} from 'remotion';

/** Fine moving grain over everything so footage and native graphics share one texture. */
export const FilmGrain: React.FC<{opacity?: number}> = ({opacity = 0.075}) => {
  const frame = useCurrentFrame();
  const x = Math.floor(random(`gx${frame}`) * 512);
  const y = Math.floor(random(`gy${frame}`) * 512);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('brand/grain.png')})`,
        backgroundPosition: `${x}px ${y}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};
