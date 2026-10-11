// The Madvert Growth Ribbon: a flowing electric-blue/cyan data path. It is the film's
// connective device (connector, signal, graph, pipeline, underline, transition).
import { C } from "../core/brand";
import { clamp, rgba } from "../core/ease";
import type { Ctx } from "../core/draw";

export type Pt = [number, number];

type Sampled = { xy: Pt[]; u: number[] };

/** Catmull-Rom through the points, resampled by arc length into n segments. */
export function sample(pts: Pt[], n = 160): Sampled {
  const raw: Pt[] = [];
  const P = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const per = Math.max(4, Math.ceil(n / Math.max(1, pts.length - 1)));
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      raw.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  raw.push(pts[pts.length - 1]);
  const len = [0];
  for (let i = 1; i < raw.length; i++) len.push(len[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  const total = len[len.length - 1] || 1;
  return { xy: raw, u: len.map((l) => l / total) };
}

export function pointAt(s: Sampled, u: number): { x: number; y: number; a: number } {
  u = clamp(u);
  let i = 1;
  while (i < s.u.length - 1 && s.u[i] < u) i++;
  const u0 = s.u[i - 1], u1 = s.u[i];
  const f = u1 > u0 ? (u - u0) / (u1 - u0) : 0;
  const [ax, ay] = s.xy[i - 1], [bx, by] = s.xy[i];
  return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, a: Math.atan2(by - ay, bx - ax) };
}

export type RibbonOpts = {
  from?: number;
  to?: number;
  width?: number;
  alpha?: number;
  /** time, drives the travelling light and strand drift */
  flow?: number;
  /** speed of travelling light pulses (cycles/s); 0 disables */
  speed?: number;
  gaps?: [number, number][];
  strands?: number; // extra thin parallel strands (ribbon body)
  amp?: number; // strand spread
  glow?: number;
  grey?: number; // 0..1 desaturate towards cold grey (broken system)
  pulses?: number;
};

function visible(u: number, o: RibbonOpts) {
  if (u < (o.from ?? 0) || u > (o.to ?? 1)) return false;
  for (const [a, b] of o.gaps ?? []) if (u > a && u < b) return false;
  return true;
}

export function ribbon(ctx: Ctx, pts: Pt[] | Sampled, o: RibbonOpts = {}) {
  const s = Array.isArray(pts) ? sample(pts) : pts;
  const from = o.from ?? 0, to = o.to ?? 1;
  if (to <= from) return s;
  const width = o.width ?? 6, alpha = o.alpha ?? 1, t = o.flow ?? 0, grey = o.grey ?? 0;
  const first = s.xy[0], last = s.xy[s.xy.length - 1];
  const grad = ctx.createLinearGradient(first[0], first[1], last[0], last[1]);
  const A = grey > 0 ? mix(C.blue, C.cold, grey) : C.blue;
  const B = grey > 0 ? mix(C.cyan, C.cold, grey) : C.cyan;
  grad.addColorStop(0, A);
  grad.addColorStop(0.5, grey > 0 ? mix(C.elec, C.cold, grey) : C.elec);
  grad.addColorStop(1, B);

  const runs = (off: (i: number) => number) => {
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i < s.xy.length; i++) {
      const u = s.u[i];
      if (!visible(u, o)) { pen = false; continue; }
      const [x, y] = s.xy[i];
      let nx = 0, ny = 0;
      const d = off(i);
      if (d !== 0) {
        const j = Math.min(i + 1, s.xy.length - 1), k = Math.max(i - 1, 0);
        const dx = s.xy[j][0] - s.xy[k][0], dy = s.xy[j][1] - s.xy[k][1], L = Math.hypot(dx, dy) || 1;
        nx = -dy / L; ny = dx / L;
      }
      const px = x + nx * d, py = y + ny * d;
      if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
    }
  };

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha *= alpha;
  // glow pass
  const gl = o.glow ?? 1;
  if (gl > 0) {
    runs(() => 0);
    ctx.strokeStyle = grad;
    ctx.globalAlpha = alpha * 0.12 * gl;
    ctx.lineWidth = width * 5;
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.22 * gl;
    ctx.lineWidth = width * 2.4;
    ctx.stroke();
    ctx.globalAlpha = alpha;
  }
  // strands: thin lines weaving around the core
  const strands = o.strands ?? 2, amp = o.amp ?? width * 2.2;
  for (let k = 0; k < strands; k++) {
    const ph = k * 2.1 + 0.7;
    runs((i) => Math.sin(s.u[i] * 9 + t * 1.6 + ph) * amp * (k % 2 ? 1 : -0.8));
    ctx.strokeStyle = grad;
    ctx.globalAlpha = alpha * 0.55;
    ctx.lineWidth = Math.max(1.2, width * 0.28);
    ctx.stroke();
  }
  ctx.globalAlpha = alpha;
  // core
  runs(() => 0);
  ctx.strokeStyle = grad;
  ctx.lineWidth = width;
  ctx.stroke();
  // bright centre line
  runs(() => 0);
  ctx.strokeStyle = `rgba(255,255,255,${0.55 * (1 - grey)})`;
  ctx.lineWidth = Math.max(1, width * 0.3);
  ctx.stroke();

  // travelling light pulses
  const sp = o.speed ?? 0.5, np = o.pulses ?? 2;
  if (sp > 0 && grey < 0.8) {
    for (let k = 0; k < np; k++) {
      const u = from + (((t * sp + k / np) % 1) + 1) % 1 * (to - from);
      if (!visible(u, o)) continue;
      const p = pointAt(s, u);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, width * 5);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(0.3, rgba(C.cyan, 0.6));
      g.addColorStop(1, "rgba(0,229,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(p.x - width * 5, p.y - width * 5, width * 10, width * 10);
    }
  }
  // leading head glow while drawing on
  if (to < 1 && to > from) {
    const p = pointAt(s, to);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, width * 6);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, rgba(C.cyan, 0.55));
    g.addColorStop(1, "rgba(0,229,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(p.x - width * 6, p.y - width * 6, width * 12, width * 12);
  }
  ctx.restore();
  return s;
}

function mix(a: string, b: string, t: number) {
  const h = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
}
