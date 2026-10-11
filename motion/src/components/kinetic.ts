// Kinetic typography. Each word animates on its own cue (usually the moment it is spoken).
import { C, F, font, brandGrad } from "../core/brand";
import { clamp, inCubic, inExpo, outBack, outCubic, outExpo, outQuart, mixColor, noise, prog } from "../core/ease";
import type { Ctx } from "../core/draw";

export type InAnim = "rise" | "slam" | "blur" | "slideL" | "slideR" | "drop" | "type" | "none" | "late";
export type OutAnim = "fall" | "up" | "fade" | "slideR" | "slideL" | "down" | "split" | "shrink";

export type KWord = {
  s: string;
  t: number;
  anim?: InAnim;
  dur?: number;
  color?: string;
  grad?: boolean;
  weight?: number;
  out?: number;
  outAnim?: OutAnim;
  outDur?: number;
  /** time at which the word cools to grey (problem words) */
  grey?: number;
  scale?: number;
};

export type KLine = {
  words: KWord[];
  x: number;
  y: number;
  size: number;
  align?: "left" | "center" | "right";
  weight?: number;
  ls?: number;
  family?: string;
  color?: string;
  gap?: number;
  /** shared exit for the whole line */
  out?: number;
  outAnim?: OutAnim;
  outDur?: number;
};

export type Box = { x: number; y: number; w: number; h: number; t: number };

export function kline(ctx: Ctx, t: number, L: KLine): Box[] {
  const fam = L.family ?? F.head, weight = L.weight ?? 800, ls = L.ls ?? -L.size * 0.02;
  const gap = L.gap ?? L.size * 0.26;
  const widths = L.words.map((w) => {
    ctx.font = font(w.weight ?? weight, L.size * (w.scale ?? 1), fam);
    ctx.letterSpacing = `${ls}px`;
    return ctx.measureText(w.s).width;
  });
  const total = widths.reduce((a, b) => a + b, 0) + gap * (L.words.length - 1);
  let x = L.align === "center" ? L.x - total / 2 : L.align === "right" ? L.x - total : L.x;
  const boxes: Box[] = [];
  const mid = (L.words.length - 1) / 2;
  L.words.forEach((w, i) => {
    const ww = widths[i];
    boxes.push({ x, y: L.y - L.size * 0.78, w: ww, h: L.size, t: w.t });
    drawWord(ctx, t, L, w, x, ww, i - mid, fam, weight, ls);
    x += ww + gap;
  });
  return boxes;
}

function drawWord(ctx: Ctx, t: number, L: KLine, w: KWord, x: number, ww: number, rel: number, fam: string, weight: number, ls: number) {
  if (t < w.t) return;
  const size = L.size * (w.scale ?? 1);
  const anim = w.anim ?? "rise";
  const dur = w.dur ?? (anim === "slam" ? 0.32 : anim === "type" ? 0.03 * w.s.length + 0.05 : 0.55);
  const p = clamp((t - w.t) / dur);
  let dx = 0, dy = 0, sc = 1, a = 1, rot = 0, blur = 0, clip = false, chars = w.s.length;
  switch (anim) {
    case "rise": dy = (1 - outExpo(p)) * size * 1.05; clip = true; break;
    case "late": dy = (1 - outBack(p, 1.2)) * size * 0.9; clip = true; break;
    case "slam": sc = 1 + (1 - outExpo(p)) * 0.38; a = clamp(p * 6); break;
    case "blur": sc = 1 + (1 - outCubic(p)) * 0.08; a = outCubic(p); blur = (1 - p) * 14; break;
    case "slideL": dx = -(1 - outQuart(p)) * 140; a = outCubic(p); break;
    case "slideR": dx = (1 - outQuart(p)) * 140; a = outCubic(p); break;
    case "drop": dy = -(1 - outBack(p, 1.6)) * size * 0.7; a = clamp(p * 4); break;
    case "type": chars = Math.ceil(p * w.s.length); break;
    case "none": break;
  }
  const out = w.out ?? L.out;
  if (out !== undefined && t > out) {
    const od = w.outDur ?? L.outDur ?? 0.4;
    const q = clamp((t - out) / od);
    switch (w.outAnim ?? L.outAnim ?? "up") {
      case "fall": dy += inCubic(q) * 420; rot = q * 0.35 * (rel >= 0 ? 1 : -1); a *= 1 - q; break;
      case "up": dy -= outExpo(q) * size * 1.1; clip = true; break;
      case "down": dy += inExpo(q) * size * 1.1; clip = true; break;
      case "fade": a *= 1 - q; break;
      case "slideR": dx += inExpo(q) * 1500; break;
      case "slideL": dx -= inExpo(q) * 1500; break;
      case "split": dx += rel * outQuart(q) * 150; dy += rel * outQuart(q) * 18; rot = rel * q * 0.05; break;
      case "shrink": sc *= 1 - outQuart(q) * 0.55; a *= 1 - q; break;
    }
    if (["fall", "slideR", "slideL", "split", "shrink"].includes(w.outAnim ?? L.outAnim ?? "up")) clip = false;
    if (q >= 1 && !["split"].includes(w.outAnim ?? L.outAnim ?? "up")) return;
  }
  if (a <= 0.001) return;

  ctx.save();
  ctx.globalAlpha *= a;
  if (clip) {
    ctx.beginPath();
    ctx.rect(x - size * 0.2, L.y - size * 1.0, ww + size * 0.4, size * 1.28);
    ctx.clip();
  }
  const cx = x + ww / 2, cy = L.y - size * 0.35;
  ctx.translate(cx + dx, cy + dy);
  if (rot) ctx.rotate(rot);
  if (sc !== 1) ctx.scale(sc, sc);
  ctx.translate(-cx, -cy);
  ctx.font = font(w.weight ?? weight, size, fam);
  ctx.letterSpacing = `${ls}px`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  let fill: any = w.color ?? L.color ?? C.navy;
  if (w.grad) fill = brandGrad(ctx, x, L.y - size, x + ww, L.y);
  if (w.grey !== undefined && t > w.grey) {
    const g = outCubic(prog(t, w.grey, w.grey + 0.6));
    fill = mixColor(typeof fill === "string" ? fill : C.blue, C.cold, g);
  }
  ctx.fillStyle = fill;
  if (blur > 0.5) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  ctx.fillText(chars < w.s.length ? w.s.slice(0, chars) : w.s, x, L.y);
  ctx.restore();
}

/** Camera-shake offset that decays after an impact at t0. */
export function shake(t: number, t0: number, amp = 10, dur = 0.35): [number, number] {
  if (t < t0 || t > t0 + dur) return [0, 0];
  const k = 1 - (t - t0) / dur;
  const e = k * k;
  return [noise((t - t0) * 60) * amp * e, noise((t - t0) * 60 + 50) * amp * e];
}

/** Animated underline / strike drawn with the brand gradient. */
export function underline(ctx: Ctx, x: number, y: number, w: number, p: number, thick = 8, color?: string) {
  if (p <= 0) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = thick;
  ctx.strokeStyle = color ?? brandGrad(ctx, x, y, x + w, y);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * outExpo(p), y);
  ctx.stroke();
  ctx.restore();
}
