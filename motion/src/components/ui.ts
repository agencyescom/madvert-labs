// Device and interface mockups. All UI is drawn live (no screenshots) so it can animate.
import { C, F } from "../core/brand";
import { card, chip, rr, text, icon } from "../core/draw";
import { clamp, lerp, outCubic, rgba } from "../core/ease";
import type { Ctx } from "../core/draw";

export type Rect = { x: number; y: number; w: number; h: number };

/** Browser window; returns the content rect. */
export function browser(ctx: Ctx, x: number, y: number, w: number, h: number, url = "", o: { alpha?: number; shadow?: number } = {}): Rect {
  card(ctx, x, y, w, h, { r: 16, shadow: o.shadow ?? 0.8, alpha: o.alpha });
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  const bar = 46;
  ctx.beginPath();
  ctx.roundRect(x, y, w, bar, [16, 16, 0, 0]);
  ctx.fillStyle = "#F3F7FC";
  ctx.fill();
  ["#FF6B6B", "#FFC14D", "#3DD68C"].forEach((c, i) => {
    ctx.beginPath(); ctx.arc(x + 24 + i * 20, y + bar / 2, 6, 0, 7); ctx.fillStyle = c; ctx.fill();
  });
  if (url) {
    const uw = Math.min(420, w * 0.5);
    rr(ctx, x + w / 2 - uw / 2, y + 10, uw, 26, 13);
    ctx.fillStyle = "#fff"; ctx.fill();
    text(ctx, url, x + w / 2, y + 28, { size: 14, weight: 500, color: C.slate, align: "center" });
  }
  ctx.restore();
  return { x, y: y + bar, w, h: h - bar };
}

/** Phone; returns screen rect. */
export function phone(ctx: Ctx, x: number, y: number, w: number, h: number, o: { alpha?: number } = {}): Rect {
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.shadowColor = "rgba(20,60,120,0.22)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  rr(ctx, x, y, w, h, w * 0.16);
  ctx.fillStyle = C.navy; ctx.fill();
  ctx.shadowColor = "transparent";
  const b = w * 0.035;
  rr(ctx, x + b, y + b, w - 2 * b, h - 2 * b, w * 0.13);
  ctx.fillStyle = "#fff"; ctx.fill();
  rr(ctx, x + w / 2 - w * 0.15, y + b + 8, w * 0.3, w * 0.075, w * 0.04);
  ctx.fillStyle = C.navy; ctx.fill();
  ctx.restore();
  return { x: x + b, y: y + b + w * 0.13, w: w - 2 * b, h: h - 2 * b - w * 0.13 };
}

/** Laptop: screen with thin bezel and base. Returns screen rect. */
export function laptop(ctx: Ctx, x: number, y: number, w: number, o: { alpha?: number } = {}): Rect {
  const h = w * 0.62;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.shadowColor = "rgba(20,60,120,0.2)"; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
  rr(ctx, x, y, w, h, 18); ctx.fillStyle = "#1A2236"; ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.beginPath(); ctx.roundRect(x - w * 0.07, y + h - 2, w * 1.14, w * 0.035, [0, 0, 14, 14]);
  const g = ctx.createLinearGradient(0, y + h, 0, y + h + w * 0.035);
  g.addColorStop(0, "#DCE4EE"); g.addColorStop(1, "#AEBBCB");
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  const b = w * 0.018;
  return { x: x + b, y: y + b, w: w - 2 * b, h: h - 2 * b };
}

/** iOS-like toggle; on = 0..1. */
export function toggle(ctx: Ctx, x: number, y: number, on: number, s = 1) {
  const w = 56 * s, h = 32 * s;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = on > 0.5 ? C.green : "#CBD5E1";
  ctx.fillStyle = mixHex("#CBD5E1", "#00C27A", on);
  ctx.fill();
  ctx.beginPath(); ctx.arc(x + h / 2 + (w - h) * on, y + h / 2, h / 2 - 3 * s, 0, 7);
  ctx.fillStyle = "#fff"; ctx.fill();
}

export function mixHex(a: string, b: string, t: number) {
  const h = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(t))).join(",")})`;
}

/** Placeholder text lines (skeleton). */
export function lines(ctx: Ctx, x: number, y: number, w: number, n: number, o: { gap?: number; h?: number; color?: string; p?: number } = {}) {
  const gap = o.gap ?? 18, h = o.h ?? 9, p = o.p ?? 1;
  for (let i = 0; i < n; i++) {
    const lw = w * (i === n - 1 ? 0.6 : 0.92 - (i % 3) * 0.08) * clamp(p * n - i);
    if (lw <= 0) continue;
    rr(ctx, x, y + i * gap, lw, h, h / 2);
    ctx.fillStyle = o.color ?? "#E3EBF5"; ctx.fill();
  }
}

/** Initials avatar (no faces). */
export function avatar(ctx: Ctx, x: number, y: number, r: number, initials: string, bg = C.blue) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
  ctx.fillStyle = bg; ctx.fill();
  text(ctx, initials, x, y + r * 0.36, { size: r * 0.9, weight: 700, color: "#fff", align: "center", family: F.body });
}

/** Primary CTA button. press = 0..1 */
export function button(ctx: Ctx, x: number, y: number, w: number, h: number, label: string, o: { press?: number; dark?: boolean; size?: number; alpha?: number } = {}) {
  const pr = o.press ?? 0;
  const sc = 1 - Math.sin(clamp(pr) * Math.PI) * 0.05;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(sc, sc); ctx.translate(-x - w / 2, -y - h / 2);
  ctx.shadowColor = rgba(C.blue, 0.35); ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  rr(ctx, x, y, w, h, h / 2);
  if (o.dark) ctx.fillStyle = C.navy;
  else { const g = ctx.createLinearGradient(x, y, x + w, y); g.addColorStop(0, C.blue); g.addColorStop(1, C.elec); ctx.fillStyle = g; }
  ctx.fill();
  ctx.shadowColor = "transparent";
  const size = o.size ?? h * 0.36;
  text(ctx, label, x + w / 2, y + h / 2 + size * 0.36, { size, weight: 700, color: "#fff", align: "center" });
  ctx.restore();
}

/** Labelled form field that fills with typed text (p 0..1). */
export function field(ctx: Ctx, x: number, y: number, w: number, label: string, value: string, p: number, active = false) {
  text(ctx, label, x, y, { size: 15, weight: 600, color: C.slate });
  rr(ctx, x, y + 10, w, 46, 10);
  ctx.fillStyle = "#fff"; ctx.fill();
  ctx.lineWidth = active ? 2.5 : 1.5;
  ctx.strokeStyle = active ? C.elec : C.line; ctx.stroke();
  const n = Math.round(clamp(p) * value.length);
  if (n > 0) text(ctx, value.slice(0, n), x + 16, y + 40, { size: 18, weight: 500, color: C.ink });
}

/** Status pill with check. */
export function okPill(ctx: Ctx, x: number, y: number, label: string, p: number, color = C.green) {
  if (p <= 0) return 0;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 3);
  const s = lerp(0.6, 1, outCubic(clamp(p)));
  ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y);
  const w = chip(ctx, label, x, y, { size: 18, fg: color === C.green ? "#05834F" : C.ink, bg: rgba(color, 0.12), dot: color });
  ctx.restore();
  return w;
}

export { icon };
