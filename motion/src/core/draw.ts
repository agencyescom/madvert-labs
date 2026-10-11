// Drawing primitives shared by every plate.
import { C, F, W, H, font, brandGrad } from "./brand";
import { clamp, lerp, noise, rgba } from "./ease";

export type Ctx = any;

export function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
}

export type CardOpts = {
  r?: number;
  fill?: string | any;
  stroke?: string | null;
  shadow?: number; // 0..1 elevation
  alpha?: number;
};
/** Elevated light-theme panel with a soft, blue-tinted shadow. */
export function card(ctx: Ctx, x: number, y: number, w: number, h: number, o: CardOpts = {}) {
  const r = o.r ?? 18, sh = o.shadow ?? 0.6;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (sh > 0) {
    ctx.shadowColor = `rgba(20,60,120,${0.16 * sh})`;
    ctx.shadowBlur = 50 * sh;
    ctx.shadowOffsetY = 18 * sh;
  }
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = o.fill ?? C.panel;
  ctx.fill();
  ctx.shadowColor = "transparent";
  if (o.stroke !== null) {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = o.stroke ?? "rgba(160,190,225,0.45)";
    ctx.stroke();
  }
  ctx.restore();
}

export type TextOpts = {
  size: number;
  weight?: number;
  family?: string;
  color?: string | any;
  align?: "left" | "center" | "right";
  baseline?: string;
  ls?: number; // letter spacing px
  alpha?: number;
  maxW?: number;
};
export function text(ctx: Ctx, s: string, x: number, y: number, o: TextOpts) {
  ctx.save();
  ctx.font = font(o.weight ?? 600, o.size, o.family ?? F.body);
  ctx.letterSpacing = `${o.ls ?? 0}px`;
  ctx.textAlign = o.align ?? "left";
  ctx.textBaseline = o.baseline ?? "alphabetic";
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.fillStyle = o.color ?? C.navy;
  ctx.fillText(s, x, y);
  ctx.restore();
}
export function measure(ctx: Ctx, s: string, size: number, weight = 600, family = F.body, ls = 0) {
  ctx.save();
  ctx.font = font(weight, size, family);
  ctx.letterSpacing = `${ls}px`;
  const w = ctx.measureText(s).width;
  ctx.restore();
  return w;
}

/** Small uppercase mono label, e.g. section eyebrows. */
export function eyebrow(ctx: Ctx, s: string, x: number, y: number, alpha = 1, color = C.blue, align: any = "left") {
  text(ctx, s.toUpperCase(), x, y, { size: 18, weight: 700, family: F.mono, ls: 4, color, alpha, align });
}

/** Rounded pill label. */
export function chip(ctx: Ctx, s: string, x: number, y: number, o: { size?: number; fg?: string; bg?: string; stroke?: string; alpha?: number; dot?: string; h?: number } = {}) {
  const size = o.size ?? 20, h = o.h ?? size * 1.9;
  const tw = measure(ctx, s, size, 600, F.body);
  const pad = size * 0.8, dotW = o.dot ? size * 0.9 : 0;
  const w = tw + pad * 2 + dotW;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = o.bg ?? C.tint;
  ctx.fill();
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  if (o.dot) {
    ctx.beginPath(); ctx.arc(x + pad + size * 0.25, y + h / 2, size * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = o.dot; ctx.fill();
  }
  text(ctx, s, x + pad + dotW, y + h / 2 + size * 0.36, { size, weight: 600, color: o.fg ?? C.ink });
  ctx.restore();
  return w;
}

/** Soft radial light. */
export function glow(ctx: Ctx, x: number, y: number, r: number, color: string, a: number) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(0.45, rgba(color, a * 0.35));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** The cyan orb from the Madvert A, used as a motif. */
export function orb(ctx: Ctx, x: number, y: number, r: number, pulse = 0, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  glow(ctx, x, y, r * (3.2 + pulse * 3), C.elec, 0.35 + pulse * 0.4);
  if (pulse > 0) {
    ctx.beginPath(); ctx.arc(x, y, r * (1 + pulse * 2.4), 0, Math.PI * 2);
    ctx.strokeStyle = rgba(C.cyan, 0.6 * (1 - pulse)); ctx.lineWidth = 3; ctx.stroke();
  }
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, "#7FF4FF");
  g.addColorStop(0.5, C.elec);
  g.addColorStop(1, C.blue);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
}

export type BgOpts = { grid?: number; glowA?: number; tone?: number; gx?: number; gy?: number };
/** Premium light backdrop: cool white gradient, drifting soft lights, faint grid. */
export function background(ctx: Ctx, t: number, o: BgOpts = {}) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#FBFDFF");
  g.addColorStop(0.55, C.bg0);
  g.addColorStop(1, C.bg1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const ga = o.glowA ?? 1;
  glow(ctx, 1500 + noise(t * 0.15) * 160, 160 + noise(t * 0.12 + 9) * 80, 900, C.cyan, 0.16 * ga);
  glow(ctx, 260 + noise(t * 0.1 + 3) * 140, 980 + noise(t * 0.13 + 5) * 60, 900, C.blue, 0.10 * ga);
  const grid = o.grid ?? 0.55;
  if (grid > 0) {
    const step = 64, ox = (o.gx ?? 0) % step, oy = (o.gy ?? 0) % step;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(C.blue, 0.055 * grid);
    ctx.beginPath();
    for (let x = -ox; x <= W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = -oy; y <= H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    // fade grid towards the centre so type sits on clean white
    const m = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 900);
    m.addColorStop(0, "rgba(250,252,255,0.85)");
    m.addColorStop(1, "rgba(250,252,255,0)");
    ctx.fillStyle = m;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

/** Draw an image covering a rect (object-fit: cover) with optional focus point. */
export function cover(ctx: Ctx, im: any, x: number, y: number, w: number, h: number, fx = 0.5, fy = 0.5, zoom = 1, crop?: [number, number, number, number]) {
  if (!im) return;
  const [cx, cy, cw, ch] = crop ?? [0, 0, im.width, im.height];
  const s = Math.max(w / cw, h / ch) * zoom;
  const sw = w / s, sh = h / s;
  const sx = cx + clamp((cw - sw) * fx, 0, cw - sw), sy = cy + clamp((ch - sh) * fy, 0, ch - sh);
  ctx.drawImage(im, sx, sy, sw, sh, x, y, w, h);
}

/** Simple line icons drawn in a size x size box at (x, y). */
export function icon(ctx: Ctx, name: string, x: number, y: number, size: number, color: string, lw = 2.4) {
  const s = size / 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw / s * (s > 1 ? 1 : 1);
  ctx.lineWidth = lw / Math.max(s, 0.5);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const P = new Path2DShim(ctx);
  switch (name) {
    case "check": P.poly([[5, 12.5], [10, 17], [19, 7.5]]); break;
    case "user":
      ctx.beginPath(); ctx.arc(12, 8.5, 4, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(4.5, 20); ctx.quadraticCurveTo(12, 11, 19.5, 20); ctx.stroke(); break;
    case "chat":
      rr(ctx, 3, 4, 18, 13, 4); ctx.stroke();
      P.poly([[8, 17], [7, 21], [12, 17]]); break;
    case "calendar":
      rr(ctx, 3.5, 5, 17, 15, 3); ctx.stroke();
      P.poly([[3.5, 10], [20.5, 10]]); P.poly([[8, 3], [8, 7]]); P.poly([[16, 3], [16, 7]]); break;
    case "search":
      ctx.beginPath(); ctx.arc(10.5, 10.5, 6, 0, 7); ctx.stroke(); P.poly([[15, 15], [20, 20]]); break;
    case "bolt": P.poly([[13, 2.5], [5, 13.5], [11.5, 13.5], [10.5, 21.5], [19, 10], [12.5, 10], [13, 2.5]]); break;
    case "chart": P.poly([[4, 19], [4, 4]]); P.poly([[4, 19], [20, 19]]); P.poly([[7, 15], [11, 11], [14, 13], [19, 7]]); break;
    case "globe":
      ctx.beginPath(); ctx.arc(12, 12, 8.5, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(12, 12, 4, 8.5, 0, 0, 7); ctx.stroke(); P.poly([[3.5, 12], [20.5, 12]]); break;
    case "spark":
      P.poly([[12, 3], [13.6, 10.4], [21, 12], [13.6, 13.6], [12, 21], [10.4, 13.6], [3, 12], [10.4, 10.4], [12, 3]]); break;
    case "target":
      ctx.beginPath(); ctx.arc(12, 12, 8.5, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(12, 12, 4.5, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.arc(12, 12, 1.2, 0, 7); ctx.fill(); break;
    case "phone": rr(ctx, 7, 2.5, 10, 19, 2.5); ctx.stroke(); P.poly([[11, 18.5], [13, 18.5]]); break;
    case "mail": rr(ctx, 3, 5.5, 18, 13, 2.5); ctx.stroke(); P.poly([[3.5, 7], [12, 13], [20.5, 7]]); break;
    case "gear":
      ctx.beginPath(); ctx.arc(12, 12, 3.2, 0, 7); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; P.poly([[12 + Math.cos(a) * 6, 12 + Math.sin(a) * 6], [12 + Math.cos(a) * 8.6, 12 + Math.sin(a) * 8.6]]); }
      ctx.beginPath(); ctx.arc(12, 12, 6, 0, 7); ctx.stroke(); break;
    case "layers": P.poly([[12, 3.5], [21, 8.5], [12, 13.5], [3, 8.5], [12, 3.5]]); P.poly([[3, 12.5], [12, 17.5], [21, 12.5]]); P.poly([[3, 16.5], [12, 21.5], [21, 16.5]]); break;
    case "cursor": ctx.beginPath(); ctx.moveTo(5, 3); ctx.lineTo(5, 19); ctx.lineTo(9.5, 14.5); ctx.lineTo(13, 21); ctx.lineTo(15.5, 20); ctx.lineTo(12, 13.5); ctx.lineTo(18.5, 13.5); ctx.closePath(); ctx.fill(); break;
    case "play": ctx.beginPath(); ctx.moveTo(8, 5); ctx.lineTo(19, 12); ctx.lineTo(8, 19); ctx.closePath(); ctx.fill(); break;
    case "dollar": P.poly([[12, 3], [12, 21]]); ctx.beginPath(); ctx.moveTo(16.5, 7.5); ctx.bezierCurveTo(15, 5, 7.5, 5, 7.5, 8.8); ctx.bezierCurveTo(7.5, 12.5, 16.5, 11, 16.5, 15.2); ctx.bezierCurveTo(16.5, 19, 9, 19, 7, 16.5); ctx.stroke(); break;
    case "link": rr(ctx, 2.5, 8.5, 10, 7, 3.5); ctx.stroke(); rr(ctx, 11.5, 8.5, 10, 7, 3.5); ctx.stroke(); break;
    case "pen": P.poly([[4, 20], [5, 15], [16, 4], [20, 8], [9, 19], [4, 20]]); break;
    case "store": P.poly([[4, 10], [4, 20], [20, 20], [20, 10]]); P.poly([[3, 10], [5, 4], [19, 4], [21, 10], [3, 10]]); break;
  }
  ctx.restore();
}
class Path2DShim {
  constructor(private ctx: Ctx) {}
  poly(pts: number[][]) {
    const c = this.ctx;
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
  }
}

/** UI cursor with click ripple (click = 0..1 progress of the press). */
export function cursor(ctx: Ctx, x: number, y: number, click = 0, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (click > 0 && click < 1) {
    ctx.beginPath(); ctx.arc(x + 6, y + 6, 10 + click * 34, 0, 7);
    ctx.strokeStyle = rgba(C.elec, 0.7 * (1 - click)); ctx.lineWidth = 3; ctx.stroke();
  }
  const sc = 1.45 - (click > 0 && click < 0.5 ? Math.sin(click * Math.PI * 2) * 0.12 : 0);
  ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.shadowColor = "rgba(10,20,40,0.35)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 17); ctx.lineTo(4.5, 13); ctx.lineTo(7.6, 19.5); ctx.lineTo(10.4, 18.3); ctx.lineTo(7.4, 12); ctx.lineTo(13, 12); ctx.closePath();
  ctx.fillStyle = C.navy; ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.restore();
}

/** Area/line chart that draws on with progress p. pts are 0..1 values. */
export function lineChart(ctx: Ctx, x: number, y: number, w: number, h: number, pts: number[], p: number, o: { color?: string; fill?: boolean; lw?: number; dot?: boolean; grey?: number } = {}) {
  const n = pts.length - 1;
  const upto = clamp(p) * n;
  const col = o.color ?? C.elec;
  const P = (i: number) => [x + (i / n) * w, y + h - pts[i] * h];
  const pathTo = () => {
    ctx.beginPath();
    for (let i = 0; i <= Math.floor(upto); i++) { const [px, py] = P(i); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    const fi = Math.floor(upto), fr = upto - fi;
    if (fi < n && fr > 0) { const [ax, ay] = P(fi), [bx, by] = P(fi + 1); ctx.lineTo(lerp(ax, bx, fr), lerp(ay, by, fr)); }
  };
  const fi = Math.floor(upto), fr = upto - fi;
  const [ex, ey] = fi < n ? [lerp(P(fi)[0], P(fi + 1)[0], fr), lerp(P(fi)[1], P(fi + 1)[1], fr)] : P(n);
  ctx.save();
  if (o.fill !== false && p > 0) {
    pathTo(); ctx.lineTo(ex, y + h); ctx.lineTo(x, y + h); ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, rgba(col.startsWith("#") ? col : C.elec, 0.22)); g.addColorStop(1, rgba(C.elec, 0));
    ctx.fillStyle = g; ctx.fill();
  }
  pathTo();
  ctx.strokeStyle = col; ctx.lineWidth = o.lw ?? 4; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
  if (o.dot !== false && p > 0) {
    ctx.beginPath(); ctx.arc(ex, ey, 7, 0, 7); ctx.fillStyle = "#fff"; ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = col; ctx.stroke();
  }
  ctx.restore();
  return [ex, ey];
}

/** Light-streak used on swipe edges and transitions. */
export function streak(ctx: Ctx, x: number, a = 1, angle = 0.18) {
  if (a <= 0) return;
  ctx.save();
  ctx.translate(x, H / 2);
  ctx.rotate(angle);
  const g = ctx.createLinearGradient(-80, 0, 80, 0);
  g.addColorStop(0, "rgba(0,229,255,0)");
  g.addColorStop(0.45, rgba(C.cyan, 0.35 * a));
  g.addColorStop(0.5, `rgba(255,255,255,${0.95 * a})`);
  g.addColorStop(0.55, rgba(C.elec, 0.35 * a));
  g.addColorStop(1, "rgba(0,180,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(-80, -H, 160, H * 2);
  ctx.restore();
}

export { brandGrad, rgba };
