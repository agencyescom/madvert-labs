// 08 CONVERT: "We turn attention into booked calls with websites and funnels that convert."
// A landing page builds from wireframe, the visitor clicks, qualifies and books.
import { C, F, W, H } from "../core/brand";
import { background, card, text, eyebrow, rr, icon, chip, cover, cursor } from "../core/draw";
import { clamp, ep, outBack, outExpo, outQuart, inOutCubic, lerp, prog, rgba, hash, outCubic } from "../core/ease";
import { ws } from "../core/words";
import { img } from "../core/assets";
import { kline } from "../components/kinetic";
import { browser, button, field, lines, okPill } from "../components/ui";
import { ribbon } from "../components/ribbon";

export function drawConvert(ctx: any, t: number) {
  const t0 = ws("we turn") - 0.2;
  const tBook = ws("booked calls"), tWeb = ws("websites"), tFun = ws("funnels"), tConv = ws("convert");
  background(ctx, t, { grid: 0.45 });

  // ---- type (left)
  kline(ctx, t, { x: 110, y: 300, size: 44, weight: 600, family: F.body, ls: 0, color: C.slate, words: [{ s: "We turn", t: ws("we turn") }] });
  kline(ctx, t, { x: 106, y: 430, size: 104, out: tBook - 0.08, outAnim: "up", outDur: 0.3, words: [{ s: "ATTENTION", t: ws("attention"), anim: "rise" }] });
  kline(ctx, t, { x: 106, y: 430, size: 104, words: [{ s: "BOOKED", t: tBook, anim: "rise", grad: true }] });
  kline(ctx, t, { x: 106, y: 545, size: 104, words: [{ s: "CALLS.", t: ws("calls"), anim: "rise", grad: true }] });
  // arrow morph indicator
  const ar = ep(t, ws("into"), 0.4);
  if (ar > 0 && t < tBook) text(ctx, "→", 110, 545, { size: 90, weight: 700, family: F.body, color: C.elec, alpha: ar });
  kline(ctx, t, {
    x: 112, y: 650, size: 36, weight: 600, family: F.body, ls: 0, color: C.ink, gap: 11,
    words: [
      { s: "with", t: ws("with websites"), anim: "blur" }, { s: "websites", t: tWeb, anim: "blur" },
      { s: "&", t: ws("and funnels"), anim: "blur" }, { s: "funnels", t: tFun, anim: "blur" },
    ],
  });
  kline(ctx, t, { x: 112, y: 704, size: 36, weight: 700, family: F.body, ls: 0, color: C.blue, gap: 11, words: [{ s: "that", t: ws("that convert"), anim: "blur" }, { s: "convert.", t: tConv, anim: "slam" }] });

  // ---- browser (right)
  const bp = ep(t, t0, 0.7, outQuart);
  const bx = 860, by = 120 + (1 - bp) * 80, bw = 940, bh = 640;
  ctx.save(); ctx.globalAlpha *= bp;
  const r = browser(ctx, bx, by, bw, bh, "yourbusiness.com/book");
  const styled = ep(t, tBook - 0.15, 0.6, inOutCubic);
  page(ctx, r, styled, t);
  // incoming traffic (attention)
  for (let i = 0; i < 12; i++) {
    const q = prog(t, t0 + 0.2 + i * 0.09, t0 + 0.9 + i * 0.09);
    if (q <= 0 || q >= 1) continue;
    const sx = 760, sy = 260 + hash(i) * 400;
    const x = lerp(sx, r.x + 200, outCubic(q)), y = lerp(sy, r.y + 160, outCubic(q));
    ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fillStyle = rgba(C.elec, 1 - q * 0.6); ctx.fill();
  }
  // cursor -> CTA click
  const cm = ep(t, tWeb - 0.55, 0.5, inOutCubic);
  const click = prog(t, tWeb - 0.05, tWeb + 0.3);
  const ctaX = r.x + 60 + 120, ctaY = r.y + 270 + 30;
  // form slides in
  const fp = ep(t, tWeb + 0.15, 0.55, outQuart);
  if (fp > 0) form(ctx, r, fp, t);
  if (cm > 0 && fp < 0.5) cursor(ctx, lerp(r.x + r.w - 80, ctaX, cm), lerp(r.y + r.h - 60, ctaY, cm), click);
  // booked toast
  const bk = ep(t, tConv - 0.05, 0.5, outBack);
  if (bk > 0) {
    ctx.save();
    ctx.globalAlpha *= clamp(bk * 2);
    const tx = r.x + r.w / 2 - 210, ty = r.y + r.h - 120 + (1 - bk) * 30;
    card(ctx, tx, ty, 420, 84, { r: 20, shadow: 1 });
    ctx.beginPath(); ctx.arc(tx + 46, ty + 42, 22, 0, 7); ctx.fillStyle = C.green; ctx.fill();
    icon(ctx, "check", tx + 32, ty + 28, 28, "#fff", 3);
    text(ctx, "Call booked", tx + 84, ty + 38, { size: 22, weight: 800, family: F.head });
    text(ctx, "Thu · 10:30 AM · Strategy call", tx + 84, ty + 64, { size: 16, weight: 500, color: C.slate });
    ctx.restore();
  }
  ctx.restore();

  // ---- funnel steps under the browser with ribbon progress
  const steps = ["Visit", "Page", "Form", "Qualify", "Booked"];
  const sTimes = [t0 + 0.3, tBook, tWeb, tFun, tConv];
  const y = 830, x0 = 920, x1 = 1740;
  const prg = sTimes.slice(1).reduce((acc, st) => acc + 0.25 * ep(t, st, 0.45, inOutCubic), 0);
  ribbon(ctx, [[x0, y], [x1, y]], { to: Math.max(0.001, prg), width: 5, flow: t, strands: 1, speed: 0 });
  ctx.save(); ctx.globalAlpha *= bp;
  steps.forEach((s, i) => {
    const x = lerp(x0, x1, i / 4);
    const on = t >= sTimes[i];
    ctx.beginPath(); ctx.arc(x, y, on ? 13 : 9, 0, 7);
    ctx.fillStyle = on ? (i === 4 ? C.green : C.elec) : "#CFD9E6"; ctx.fill();
    if (on) { ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fillStyle = "#fff"; ctx.fill(); }
    text(ctx, s, x, y + 44, { size: 18, weight: 700, color: on ? C.ink : C.mute, align: "center" });
  });
  ctx.restore();
}

function page(ctx: any, r: any, styled: number, t: number) {
  const x = r.x + 60, y = r.y + 50;
  // wireframe layer
  if (styled < 1) {
    ctx.save();
    ctx.globalAlpha *= 1 - styled;
    ctx.setLineDash([8, 8]); ctx.strokeStyle = "#AFC3DA"; ctx.lineWidth = 2;
    [[x, y + 20, 380, 50], [x, y + 90, 360, 22], [x, y + 125, 320, 22], [x, y + 220, 240, 60], [r.x + 520, y, 360, 300], [x, y + 360, 820, 120]].forEach(([a, b, c, d]) => {
      ctx.beginPath(); ctx.roundRect(a, b, c, d, 10); ctx.stroke();
    });
    ctx.restore();
  }
  if (styled <= 0) return;
  ctx.save();
  ctx.globalAlpha *= styled;
  const lift = (1 - styled) * 16;
  eyebrow(ctx, "Free strategy call", x, y + 14 + lift, 1, C.blue);
  text(ctx, "Grow with a system", x, y + 70 + lift, { size: 40, weight: 800, family: F.head });
  text(ctx, "that books calls.", x, y + 118 + lift, { size: 40, weight: 800, family: F.head, color: C.blue });
  lines(ctx, x, y + 150 + lift, 360, 2, { gap: 18 });
  button(ctx, x, y + 220, 240, 60, "Book a call →", { size: 20 });
  // hero visual
  rr(ctx, r.x + 520, y, 360, 300, 18); ctx.save(); ctx.clip();
  cover(ctx, img("s01"), r.x + 520, y, 360, 300, 0.4, 0.5, 1 + (1 - styled) * 0.1);
  ctx.restore();
  // proof row
  ["Fast response", "Clear pricing", "Booked online"].forEach((s, i) => {
    chip(ctx, s, x + i * 230, y + 370, { size: 16, bg: C.tint, dot: C.elec });
  });
  ctx.restore();
}

function form(ctx: any, r: any, p: number, t: number) {
  const tF = ws("funnels"), tW = ws("websites");
  const w = 420, x = r.x + r.w - w - 30 + (1 - p) * 120, y = r.y + 24;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.4);
  card(ctx, x, y, w, 470, { r: 20, shadow: 1 });
  text(ctx, "Book your call", x + 28, y + 52, { size: 24, weight: 800, family: F.head });
  field(ctx, x + 28, y + 96, w - 56, "Name", "Daniel Reed", prog(t, tW + 0.4, tW + 0.75), t < tW + 0.8);
  field(ctx, x + 28, y + 176, w - 56, "Company", "Reed Facility Co.", prog(t, tW + 0.75, tW + 1.05), t >= tW + 0.8 && t < tF);
  // qualification
  okPill(ctx, x + 28, y + 252, "Qualified · budget & timeline fit", ep(t, tF, 0.4));
  // calendar slots
  const pick = ep(t, tF + 0.3, 0.3);
  ["9:00", "10:30", "1:00", "3:30"].forEach((s, i) => {
    const sx = x + 28 + i * 92, sy = y + 312;
    const sel = i === 1 && pick > 0.5;
    rr(ctx, sx, sy, 82, 48, 12);
    ctx.fillStyle = sel ? C.blue : "#F2F6FB"; ctx.fill();
    text(ctx, s, sx + 41, sy + 31, { size: 17, weight: 700, color: sel ? "#fff" : C.ink, align: "center" });
  });
  button(ctx, x + 28, y + 384, w - 56, 58, "Confirm booking", { size: 19, dark: true, press: prog(t, ws("convert") - 0.25, ws("convert") + 0.05) });
  ctx.restore();
}
