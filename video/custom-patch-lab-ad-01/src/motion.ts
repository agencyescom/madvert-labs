import {Easing, interpolate} from 'remotion';

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1); // expo-like settle
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 progress of an animation that starts at `start` and lasts `dur` frames. */
export const prog = (frame: number, start: number, dur: number, easing = easeOut) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Seconds → frames at 30 fps (the whole edit is authored on the 120 BPM grid). */
export const sec = (s: number) => Math.round(s * 30);
