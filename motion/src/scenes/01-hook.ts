// 01 HOOK: "Stop running ads. Not until you fix this."
// Busy marketing UI bustles, then freezes and recedes as the type slams in.
import { C, F, W, H } from "../core/brand";
import { background, card, chip, text, eyebrow, lineChart, icon, glow } from "../core/draw";
import { clamp, ep, outBack, outExpo, prog, inOutCubic, rgba, hash, outCubic } from "../core/ease";
import { ws, we } from "../core/words";
import { kline, shake, underline } from "../components/kinetic";
import { toggle, avatar, lines } from "../components/ui";
import { ribbon } from "../components/ribbon";

export function drawHook(ctx: any, t: number) {
  const tStop = ws("stop"), tNot = ws("not until"), tFix = ws("fix"), tThis = ws("this");
  const frz = t >= tStop ? tStop : t; // UI clock freezes on "Stop"
  const recede = ep(t, tStop, 0.5, outExpo);
  const [sx, sy] = shake(t, tStop + 0.02, 14);
  const [sx2, sy2] = shake(t, tThis, 8);
  ctx.save();
  ctx.translate(sx + sx2, sy + sy2);
  background(ctx, t, { grid: 0.8 });

  // ---- busy marketing fragments (behind the type)
  ctx.save();
  ctx.translate(W / 2, H / 2);
  const s = 1 - recede * 0.06 + (1 - ep(t, 0, 0.6)) * 0.08;
  ctx.scale(s, s);
  ctx.translate(-W / 2, -H / 2);
  ctx.globalAlpha = 1 - recede * 0.62;
  const pop = (i: number) => outBack(prog(t, i * 0.05, i * 0.05 + 0.35), 1.3);
  const drift = (i: number) => (frz * 22 * (hash(i) - 0.5));

  // campaign card
  frag(ctx, 110, 120 + drift(1), pop(0), () => {
    card(ctx, 110, 120 + drift(1), 420, 168, { r: 18 });
    eyebrow(ctx, "Campaign", 138, 160, 1, C.slate);
    text(ctx, "Spring Leads — Broad", 138, 200, { size: 24, weight: 700 });
    const on = t < tStop ? 1 : 1 - ep(t, tStop, 0.25);
    toggle(ctx, 440, 140, on, 1);
    chip(ctx, on > 0.5 ? "Active" : "Paused", 138, 222, { size: 17, dot: on > 0.5 ? C.green : C.red, bg: on > 0.5 ? rgba(C.green, 0.1) : rgba(C.red, 0.1) });
    text(ctx, `Spend  $${(1840 + Math.floor(frz * 173)).toLocaleString("en-US")}`, 300, 250, { size: 18, weight: 600, color: C.slate, family: F.mono });
  });
  // chart card
  frag(ctx, 1390, 110 + drift(2), pop(1), () => {
    card(ctx, 1390, 110 + drift(2), 420, 250);
    eyebrow(ctx, "Traffic", 1418, 150, 1, C.slate);
    const pts = [0.2, 0.32, 0.28, 0.45, 0.4, 0.58, 0.52, 0.7, 0.66, 0.8];
    lineChart(ctx, 1420, 175 + drift(2), 360, 150, pts, clamp(frz / 1.2), { color: t >= tStop ? C.cold : C.elec });
  });
  // social post
  frag(ctx, 150, 640 + drift(3), pop(2), () => {
    card(ctx, 150, 600 + drift(3), 320, 250);
    avatar(ctx, 192, 645 + drift(3), 20, "B", C.elec);
    lines(ctx, 225, 635 + drift(3), 200, 2, { gap: 16 });
    const g = ctx.createLinearGradient(170, 680, 450, 820);
    g.addColorStop(0, "#DDEBFA"); g.addColorStop(1, "#BFE6FF");
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(170, 680 + drift(3), 280, 150, 12); ctx.fill();
    icon(ctx, "play", 290, 735 + drift(3), 40, "#fff");
    text(ctx, `♥ ${120 + Math.floor(frz * 37)}`, 170, 865 + drift(3), { size: 18, weight: 600, color: C.slate });
  });
  // lead card
  frag(ctx, 1420, 640 + drift(4), pop(3), () => {
    const y = 610 + drift(4);
    const fade = t > tNot ? 1 - ep(t, tNot, 0.8, outCubic) : 1;
    ctx.globalAlpha *= 0.25 + 0.75 * fade;
    card(ctx, 1420, y, 390, 140);
    avatar(ctx, 1468, y + 50, 24, "DR", t >= tStop ? C.cold : C.blue);
    text(ctx, "New lead", 1506, y + 44, { size: 22, weight: 700 });
    text(ctx, "Waiting for reply…", 1506, y + 72, { size: 17, weight: 500, color: C.slate });
    chip(ctx, t >= tStop ? "No response" : "Just now", 1448, y + 90, { size: 15, bg: t >= tStop ? rgba(C.red, 0.1) : C.tint });
  });
  // email card
  frag(ctx, 640, 70 + drift(5), pop(4), () => {
    card(ctx, 640, 60 + drift(5), 300, 92);
    icon(ctx, "mail", 662, 86 + drift(5), 34, C.elec);
    text(ctx, "Newsletter sent", 712, 100 + drift(5), { size: 20, weight: 700 });
    text(ctx, "Open rate tracking", 712, 126 + drift(5), { size: 15, weight: 500, color: C.slate });
  });
  frag(ctx, 1010, 790 + drift(6), pop(5), () => {
    card(ctx, 1010, 770 + drift(6), 300, 92);
    icon(ctx, "globe", 1032, 796 + drift(6), 34, C.elec);
    text(ctx, "Website live", 1082, 810 + drift(6), { size: 20, weight: 700 });
    text(ctx, "Visitors: browsing", 1082, 836 + drift(6), { size: 15, weight: 500, color: C.slate });
  });
  ctx.restore();

  // freeze wash
  if (t >= tStop) {
    ctx.fillStyle = `rgba(248,251,255,${0.55 * recede})`;
    ctx.fillRect(0, 0, W, H);
    glow(ctx, W / 2, H / 2 - 40, 700, C.cyan, 0.08 * recede);
  }

  // ---- type
  const out1 = tNot - 0.12;
  kline(ctx, t, {
    x: W / 2, y: 585, size: 150, align: "center", out: out1, outAnim: "up", outDur: 0.35,
    words: [
      { s: "STOP", t: tStop, anim: "slam", dur: 0.28 },
      { s: "RUNNING", t: ws("running"), anim: "rise" },
      { s: "ADS.", t: ws("ads"), anim: "rise", grad: true },
    ],
  });
  if (t >= tNot - 0.05) {
    kline(ctx, t, {
      x: W / 2, y: 470, size: 96, align: "center", weight: 700, color: C.ink,
      words: [
        { s: "NOT", t: tNot, anim: "rise" },
        { s: "UNTIL", t: ws("until"), anim: "rise" },
      ],
    });
    const b = kline(ctx, t, {
      x: W / 2, y: 650, size: 168, align: "center",
      words: [
        { s: "YOU", t: ws("you", 0), anim: "rise" },
        { s: "FIX", t: tFix, anim: "slam", grad: true },
        { s: "THIS.", t: tThis, anim: "slam", grad: true },
      ],
    });
    const x0 = b[1].x, x1 = b[2].x + b[2].w;
    ribbon(ctx, [[x0 - 260, 760], [x0 + 80, 712], [x1 - 80, 712], [x1 + 260, 680]], {
      to: inOutCubic(prog(t, tThis, tThis + 0.6)), width: 4, flow: t, alpha: 0.85, speed: 0,
    });
  }
  ctx.restore();
}

function frag(ctx: any, x: number, y: number, p: number, fn: () => void) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  const s = 0.85 + 0.15 * p;
  ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y);
  fn();
  ctx.restore();
}
