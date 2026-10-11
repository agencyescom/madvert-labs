import React from 'react';

/**
 * Directional (per-axis) gaussian blur as an inline SVG filter. Reference it
 * with `filter: url(#id)`. CSS blur() is isotropic; this gives real motion blur
 * along the direction of travel.
 */
export const MotionBlur: React.FC<{id: string; x: number; y: number}> = ({id, x, y}) => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <filter id={id} x="-30%" y="-60%" width="160%" height="220%" colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={`${Math.max(0, x)} ${Math.max(0, y)}`} />
    </filter>
  </svg>
);
