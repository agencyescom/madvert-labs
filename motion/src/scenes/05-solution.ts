// 05 SOLUTION: "Madvert Labs fixes the system." Ribbon draws the logo on; system map connects.
import { C, F, W, H } from "../core/brand";
import { background, card, text, icon, glow } from "../core/draw";
import { clamp, ep, outBack, outExpo, inOutCubic, prog, lerp, inOutExpo } from "../core/ease";
import { ws, we } from "../core/words";
import { kline } from "../components/kinetic";
import { ribbon, sample, pointAt } from "../components/ribbon";
import { logo } from "../components/brand";

const MODS: [string, string, number, number][] = [
  ["Brand", "layers", 330, 300], ["Demand", "target", 260, 560], ["Convert", "globe", 400, 800],
  ["Studio", "play", 1590, 300], ["Automate", "bolt", 1660, 560], ["Build", "gear", 1520, 800],
];

export function drawSolution(ctx: any, t: number) {
  const t0 = ws("madvert labs fixes") - 0.25;
  const tFix = ws("fixes");
  background(ctx, t, { grid: 0.35, glowA: 1.3 });
  // sweep ribbon across centre, logo revealed behind its head
  const sw = ep(t, t0, 0.75, inOutExpo);
  const path: [number, number][] = [[-100, 520], [400, 470], [960, 500], [1500, 455], [2050, 500]];
  const s = sample(path);
  const head = pointAt(s, sw);
  const lw = 1000;
  glow(ctx, W / 2, 420, 700, C.cyan, 0.12 * sw);
  const o = logo(ctx, W / 2, 330, lw, { desc: true, reveal: clamp((head.x - (W / 2 - lw / 2)) / lw), pulse: prog(t, ws("labs", 0) + 0.15, ws("labs", 0) + 1.05) });
  const fade = ep(t, t0 + 0.7, 0.5);
  ribbon(ctx, s, { to: sw, width: 6, flow: t, alpha: 1 - fade, speed: 0 });

  // system map: modules + connectors build on "fixes the system"
  MODS.forEach(([name, ic, x, y], i) => {
    const a = ep(t, tFix + i * 0.08, 0.5, outBack);
    if (a <= 0) return;
    const ax = x < W / 2 ? W / 2 - lw / 2 - 20 : W / 2 + lw / 2 + 20;
    const ay = 440;
    const cp: [number, number][] = [[x + (x < W / 2 ? 110 : -110), y], [lerp(x, ax, 0.6), lerp(y, ay, 0.4)], [ax, ay]];
    ribbon(ctx, cp, { to: ep(t, tFix + i * 0.08, 0.6, inOutCubic), width: 3, flow: t + i, strands: 0, glow: 0.6, speed: 0.7, pulses: 1 });
    ctx.save();
    ctx.globalAlpha *= clamp(a * 2);
    ctx.translate(x, y); ctx.scale(lerp(0.6, 1, a), lerp(0.6, 1, a));
    card(ctx, -110, -40, 220, 80, { r: 40 });
    icon(ctx, ic, -86, -16, 32, C.blue);
    text(ctx, name, -40, 9, { size: 24, weight: 700, color: C.ink });
    ctx.restore();
  });
  kline(ctx, t, {
    x: W / 2, y: 760, size: 72, align: "center",
    words: [
      { s: "FIXES", t: tFix, anim: "rise" },
      { s: "THE", t: ws("the system"), anim: "rise" },
      { s: "SYSTEM.", t: ws("system", 1), anim: "rise", grad: true },
    ],
  });
}
