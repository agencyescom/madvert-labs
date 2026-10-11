// 14 END CARD: "Madvert Labs. Beyond advertising. We build growth systems."
import { C, F, W, H } from "../core/brand";
import { background, card, text, rr, glow, icon } from "../core/draw";
import { clamp, ep, outExpo, inOutCubic, prog, lerp, outBack, rgba } from "../core/ease";
import { ws, we } from "../core/words";
import { kline } from "../components/kinetic";
import { ribbon } from "../components/ribbon";
import { logo } from "../components/brand";

export function drawEnd(ctx: any, t: number) {
  const tM = ws("madvert labs beyond") , tLabs = we("madvert labs beyond") - 0.4;
  const t0 = tM - 0.3;
  const tEnd = we("growth systems");
  background(ctx, t, { grid: 0.25, glowA: 1.3 });
  const settle = ep(t, t0, 1.0, outExpo);
  const sc = lerp(1.08, 1, settle);
  glow(ctx, W / 2, 330, 800, C.cyan, 0.14);
  ctx.save();
  ctx.translate(W / 2, 330); ctx.scale(sc, sc); ctx.translate(-W / 2, -330);
  const pulse = Math.max(prog(t, tLabs, tLabs + 1.0), prog(t, tEnd + 1.2, tEnd + 2.2));
  logo(ctx, W / 2, 230, 980, { reveal: ep(t, t0, 0.7, inOutCubic), pulse: pulse > 0 && pulse < 1 ? pulse : 0, alpha: clamp(settle * 2) });
  ctx.restore();
  ribbon(ctx, [[W / 2 - 600, 520], [W / 2 - 200, 505], [W / 2 + 200, 512], [W / 2 + 600, 498]], { to: ep(t, t0 + 0.2, 0.9, inOutCubic), width: 5, flow: t, speed: 0.35, alpha: 0.9 });
  kline(ctx, t, {
    x: W / 2, y: 650, size: 74, align: "center", weight: 700, color: C.ink,
    words: [{ s: "BEYOND", t: ws("beyond") }, { s: "ADVERTISING.", t: ws("advertising") }],
  });
  kline(ctx, t, {
    x: W / 2, y: 755, size: 74, align: "center",
    words: [
      { s: "WE", t: ws("we build growth") }, { s: "BUILD", t: ws("build growth") },
      { s: "GROWTH", t: ws("growth systems"), grad: true }, { s: "SYSTEMS.", t: ws("systems"), grad: true },
    ],
  });
  // CTA row after the line lands
  const c = ep(t, tEnd + 0.35, 0.6, outExpo);
  if (c > 0) {
    ctx.save();
    ctx.globalAlpha *= c;
    ctx.translate(0, (1 - c) * 20);
    const bw = 470, gap = 28, uw = 330, tot = bw + gap + uw, x0 = W / 2 - tot / 2, y = 830;
    rr(ctx, x0, y, bw, 70, 35); ctx.fillStyle = C.navy; ctx.fill();
    text(ctx, "Book a Business Strategy Call", x0 + bw / 2, y + 44, { size: 22, weight: 700, color: "#fff", align: "center" });
    card(ctx, x0 + bw + gap, y, uw, 70, { r: 35, shadow: 0.5, stroke: rgba(C.elec, 0.6) });
    icon(ctx, "globe", x0 + bw + gap + 26, y + 20, 30, C.blue);
    text(ctx, "madvertlabs.com", x0 + bw + gap + 68, y + 45, { size: 24, weight: 800, family: F.head, color: C.navy });
    ctx.restore();
  }
}
