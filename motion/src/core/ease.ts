export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Progress of t through [a, b], clamped to 0..1. */
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
/** 0 -> 1 -> 0 window: rises over `inDur` from a, falls over `outDur` ending at b. */
export const win = (t: number, a: number, b: number, inDur = 0.3, outDur = 0.3) =>
  Math.min(prog(t, a, a + inDur), 1 - prog(t, b - outDur, b));

export const linear = (t: number) => t;
export const inCubic = (t: number) => t * t * t;
export const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const outQuart = (t: number) => 1 - Math.pow(1 - t, 4);
export const outQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const outExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const inExpo = (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10));
export const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const inOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2);
export const inOutExpo = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
export const outBack = (t: number, s = 1.4) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
/** Critically-damped-ish spring settle: overshoots once, gently. */
export const spring = (t: number, k = 9, d = 5) => (t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(k * t));

/** Eased progress helper: e(t, start, dur, easing). */
export const ep = (t: number, a: number, dur: number, f: (x: number) => number = outExpo) => f(prog(t, a, a + dur));

/** Deterministic hash noise in 0..1. */
export function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
/** Smooth 1D value noise in -1..1. */
export function noise(x: number) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i), hash(i + 1), u) * 2 - 1;
}

export function mixColor(a: string, b: string, t: number) {
  const pa = parse(a), pb = parse(b);
  const r = Math.round(lerp(pa[0], pb[0], t)), g = Math.round(lerp(pa[1], pb[1], t)), bl = Math.round(lerp(pa[2], pb[2], t));
  return `rgb(${r},${g},${bl})`;
}
export function rgba(hex: string, a: number) {
  const p = parse(hex);
  return `rgba(${p[0]},${p[1]},${p[2]},${a})`;
}
function parse(c: string): number[] {
  if (c.startsWith("rgb")) return c.replace(/[^\d,.]/g, "").split(",").map(Number);
  const h = c.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
