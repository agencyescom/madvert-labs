// 04 REFRAME: "You don't have a marketing problem. You have a growth system problem."
// Scattered grey nodes snap into a connected system on "system".
import { C, F, W, H } from "../core/brand";
import { background, text, glow } from "../core/draw";
import { clamp, ep, outExpo, inOutCubic, hash, lerp, prog, spring, rgba, outCubic } from "../core/ease";
import { ws, we } from "../core/words";
import { kline } from "../components/kinetic";
import { ribbon } from "../components/ribbon";

const N = 18;
export function drawReframe(ctx: any, t: number) {
  const t0 = ws("you don't have") - 0.15;
  const tYou2 = ws("you have a growth");
  const tSys = ws("system problem");
  background(ctx, t, { grid: 0.4 });
  // nodes: chaos -> order (ring around the type)
  const snap = clamp(spring(Math.max(0, t - tSys) * 1.4, 8, 5));
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
    const ox = W / 2 + Math.cos(ang) * 780, oy = H / 2 - 30 + Math.sin(ang) * 380;
    const cx = 120 + hash(i * 3) * (W - 240), cy = 100 + hash(i * 3 + 1) * (H - 260);
    const jx = Math.sin(t * 1.3 + i) * 8, jy = Math.cos(t * 1.1 + i * 2) * 8;
    pts.push([lerp(cx + jx, ox, snap), lerp(cy + jy, oy, snap)]);
  }
  const appear = ep(t, t0, 0.6);
  // connections once ordered
  if (snap > 0.05) {
    ctx.save();
    ctx.lineWidth = 2;
    for (let i = 0; i < N; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % N];
      const p = clamp(snap * 1.5 - (i / N) * 0.5);
      ctx.strokeStyle = rgba(C.elec, 0.55 * p);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, bx, p), lerp(ay, by, p)); ctx.stroke();
    }
    ctx.restore();
    ribbon(ctx, [...pts.slice(12), ...pts.slice(0, 7)], { to: inOutCubic(prog(t, tSys, tSys + 0.9)), width: 5, flow: t, alpha: 0.8, speed: 0.4 });
  }
  pts.forEach(([x, y], i) => {
    ctx.save();
    ctx.globalAlpha = appear;
    const c = snap > 0.5 ? C.elec : "#B9C6D6";
    if (snap > 0.5) glow(ctx, x, y, 34, C.cyan, 0.4 * snap);
    ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fillStyle = c; ctx.fill();
    ctx.restore();
  });

  // typography: replacement
  const out1 = tYou2 - 0.15;
  kline(ctx, t, {
    x: W / 2, y: 430, size: 66, align: "center", weight: 600, color: C.slate, out: out1, outAnim: "up", outDur: 0.35,
    words: [
      { s: "YOU", t: ws("you don't") }, { s: "DON'T", t: ws("don't") }, { s: "HAVE", t: ws("have") }, { s: "A", t: ws("a marketing") },
    ],
  });
  const strike = ep(t, we("marketing problem") - 0.15, 0.4);
  const b = kline(ctx, t, {
    x: W / 2, y: 590, size: 132, align: "center", out: out1 + 0.08, outAnim: "down", outDur: 0.4,
    words: [
      { s: "MARKETING", t: ws("marketing"), grey: we("marketing problem") - 0.1 },
      { s: "PROBLEM.", t: ws("problem") },
    ],
  });
  if (strike > 0 && t < out1 + 0.1) {
    ctx.save();
    ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(b[0].x - 10, 545); ctx.lineTo(b[0].x - 10 + (b[0].w + 20) * outExpo(strike), 545); ctx.stroke();
    ctx.restore();
  }
  kline(ctx, t, {
    x: W / 2, y: 430, size: 66, align: "center", weight: 600, color: C.slate,
    words: [{ s: "YOU", t: tYou2 }, { s: "HAVE", t: ws("have", 1) }, { s: "A", t: ws("a growth") }],
  });
  kline(ctx, t, {
    x: W / 2, y: 590, size: 132, align: "center",
    words: [
      { s: "GROWTH", t: ws("growth system"), grad: true, anim: "rise" },
      { s: "SYSTEM", t: tSys, grad: true, anim: "slam" },
    ],
  });
  kline(ctx, t, { x: W / 2, y: 735, size: 132, align: "center", words: [{ s: "PROBLEM.", t: ws("problem", 1), anim: "rise" }] });
}
