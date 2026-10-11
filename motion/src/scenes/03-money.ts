// 03 COST: "Every gap is money walking out the door." A pipeline opens gaps; revenue falls out.
import { C, F, W, H } from "../core/brand";
import { background, card, text, icon, eyebrow, glow } from "../core/draw";
import { clamp, ep, outBack, outCubic, inOutCubic, prog, hash, lerp, rgba, inCubic } from "../core/ease";
import { ws, we } from "../core/words";
import { kline } from "../components/kinetic";
import { ribbon, sample, pointAt } from "../components/ribbon";

const NODES = [["Ad", "target"], ["Visit", "globe"], ["Lead", "user"], ["Follow up", "chat"], ["Sale", "dollar"]];
const PATH: [number, number][] = [[120, 640], [330, 620], [600, 650], [960, 610], [1320, 650], [1590, 620], [1800, 640]];

export function drawMoney(ctx: any, t: number) {
  const t0 = ws("every gap") - 0.12;
  background(ctx, t, { grid: 0.5 });
  const s = sample(PATH, 220);
  const nu = [0.1, 0.3, 0.5, 0.7, 0.9];
  const open = ep(t, ws("gap"), 0.7, inOutCubic);
  const gaps: [number, number][] = [0.2, 0.4, 0.6, 0.8].map((g) => [g - 0.045 * open, g + 0.045 * open]);
  const draw = ep(t, t0, 0.7, inOutCubic);
  ribbon(ctx, s, { to: draw, width: 7, flow: t, gaps, speed: 0, grey: open * 0.35 });
  // nodes
  NODES.forEach(([name, ic], i) => {
    const p = pointAt(s, nu[i]);
    const a = ep(t, t0 + 0.08 * i, 0.45, outBack);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= clamp(a * 2);
    ctx.translate(p.x, p.y); ctx.scale(lerp(0.6, 1, a), lerp(0.6, 1, a));
    card(ctx, -78, -62, 156, 124, { r: 22 });
    icon(ctx, ic, -20, -42, 40, i === 4 ? C.green : C.blue);
    text(ctx, name, 0, 40, { size: 20, weight: 700, align: "center", color: C.ink });
    ctx.restore();
  });
  // revenue coins: flow along the pipe, fall through the gaps (slow motion feel)
  const slow = 0.62;
  for (let i = 0; i < 22; i++) {
    const born = t0 + 0.2 + i * 0.14;
    const age = (t - born) * slow;
    if (age < 0) continue;
    const u = 0.02 + age * 0.42;
    const gi = [0.2, 0.4, 0.6, 0.8].findIndex((g) => u > g - 0.02 && open > 0.3);
    const fallAt = gi >= 0 && hash(i) < 0.8 ? [0.2, 0.4, 0.6, 0.8][gi] : 2;
    let x: number, y: number, a = 1;
    if (u < fallAt) {
      if (u > 0.98) continue;
      const p = pointAt(s, u); x = p.x; y = p.y - 46;
    } else {
      const p = pointAt(s, fallAt);
      const ft = (u - fallAt) / 0.42 / slow;
      x = p.x + ft * 40 * (hash(i + 7) - 0.3); y = p.y - 46 + ft * ft * 900;
      a = clamp(1 - (y - p.y) / 380);
    }
    if (a <= 0) continue;
    coin(ctx, x, y, 17, a);
  }
  // type
  kline(ctx, t, {
    x: W / 2, y: 250, size: 84, align: "center", weight: 700, color: C.ink,
    words: [
      { s: "EVERY", t: ws("every gap"), anim: "rise" },
      { s: "GAP", t: ws("gap"), anim: "rise", color: C.red },
      { s: "IS", t: ws("is money"), anim: "rise" },
    ],
  });
  kline(ctx, t, {
    x: W / 2, y: 380, size: 96, align: "center",
    words: [
      { s: "MONEY", t: ws("money"), anim: "slam", grad: true },
      { s: "WALKING", t: ws("walking"), anim: "rise" },
      { s: "OUT", t: ws("out"), anim: "rise" },
      { s: "THE", t: ws("the door"), anim: "rise" },
      { s: "DOOR.", t: ws("door"), anim: "rise" },
    ],
  });
  // revenue meter dropping
  const drop = ep(t, ws("money"), 1.4, inOutCubic);
  const mx = W / 2 - 220, my = 820;
  text(ctx, "Revenue captured", mx, my, { size: 18, weight: 600, color: C.slate, family: F.mono, ls: 2 });
  ctx.beginPath(); ctx.roundRect(mx, my + 16, 440, 12, 6); ctx.fillStyle = "#E3EBF5"; ctx.fill();
  ctx.beginPath(); ctx.roundRect(mx, my + 16, 440 * lerp(0.95, 0.22, drop), 12, 6);
  ctx.fillStyle = drop > 0.5 ? C.red : C.elec; ctx.fill();
}

function coin(ctx: any, x: number, y: number, r: number, a: number) {
  ctx.save();
  ctx.globalAlpha *= a;
  glow(ctx, x, y, r * 2.6, C.green, 0.25);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  g.addColorStop(0, "#3BE3A0"); g.addColorStop(1, "#00A868");
  ctx.fillStyle = g; ctx.fill();
  icon(ctx, "dollar", x - r * 0.62, y - r * 0.62, r * 1.24, "#fff", 2.6);
  ctx.restore();
}
