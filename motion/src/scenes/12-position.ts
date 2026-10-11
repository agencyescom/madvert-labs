// 12 POSITIONING: "One partner. One system. No gaps. No excuses."
import { C, F, W, H } from "../core/brand";
import { background, glow } from "../core/draw";
import { clamp, ep, inOutCubic, lerp, rgba, outExpo, prog } from "../core/ease";
import { ws, we } from "../core/words";
import { kline, shake } from "../components/kinetic";
import { ribbon } from "../components/ribbon";

const N = 14;
export function drawPosition(ctx: any, t: number) {
  const t0 = ws("one partner") - 0.25;
  const cues = [ws("one partner"), ws("one system"), ws("no gaps"), ws("no excuses")];
  const tEx = ws("excuses");
  const [sx, sy] = shake(t, tEx, 12);
  ctx.save(); ctx.translate(sx, sy);
  background(ctx, t, { grid: 0.3, glowA: 1.2 });
  // network ring lights up a quarter per line; fully connected on "excuses"
  const lit = cues.reduce((a, c) => a + 0.25 * ep(t, c, 0.5, inOutCubic), 0);
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + t * 0.04;
    pts.push([W / 2 + Math.cos(a) * 860, H / 2 - 20 + Math.sin(a) * 430]);
  }
  ctx.save();
  for (let i = 0; i < N; i++) {
    const on = i / N < lit;
    const [x, y] = pts[i], [x2, y2] = pts[(i + 1) % N];
    ctx.strokeStyle = on ? rgba(C.elec, 0.5) : rgba(C.mute, 0.25); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    if (on) glow(ctx, x, y, 40, C.cyan, 0.35);
    ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fillStyle = on ? C.elec : "#C4CFDC"; ctx.fill();
  }
  ctx.restore();

  const ys = [300, 430, 560, 700];
  const lines = [
    [{ s: "ONE", t: cues[0] }, { s: "PARTNER.", t: ws("partner") }],
    [{ s: "ONE", t: cues[1] }, { s: "SYSTEM.", t: ws("system", 2), grad: true }],
    [{ s: "NO", t: cues[2] }, { s: "GAPS.", t: ws("gaps") }],
    [{ s: "NO", t: cues[3], anim: "slam" as const }, { s: "EXCUSES.", t: tEx, anim: "slam" as const, grad: true }],
  ];
  const lock = ep(t, we("excuses") + 0.15, 0.5);
  lines.forEach((ws_, i) => {
    // earlier lines step back while the current one speaks, then all lock up together
    const next = cues[i + 1];
    const dim = next !== undefined ? ep(t, next, 0.3) * (1 - lock) : 0;
    ctx.save();
    ctx.globalAlpha *= 1 - dim * 0.65;
    const b = kline(ctx, t, { x: W / 2, y: ys[i], size: i === 3 ? 124 : 108, align: "center", words: ws_ as any });
    ctx.restore();
    if (i === 2 && t > cues[2]) {
      // a ribbon with a gap that snaps shut on "gaps"
      const close = ep(t, ws("gaps") + 0.05, 0.45, outExpo);
      const g = 0.12 * (1 - close);
      ribbon(ctx, [[W / 2 - 420, ys[i] + 28], [W / 2, ys[i] + 22], [W / 2 + 420, ys[i] + 28]], {
        width: 5, flow: t, gaps: g > 0.002 ? [[0.5 - g, 0.5 + g]] : [], speed: 0.5, strands: 1, alpha: 1 - dim * 0.65,
        to: ep(t, cues[2], 0.4, inOutCubic),
      });
    }
  });
  ctx.restore();
}
