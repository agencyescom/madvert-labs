// 13 CTA: "Book your Business Strategy Call at madvertlabs dot com."
import { C, F, W, H } from "../core/brand";
import { background, card, chip, text, rr, icon, cursor, eyebrow, glow } from "../core/draw";
import { clamp, ep, outExpo, inOutCubic, prog, lerp, outBack, rgba, outQuart } from "../core/ease";
import { ws, we } from "../core/words";
import { img } from "../core/assets";
import { kline } from "../components/kinetic";
import { laptop, button } from "../components/ui";

export function drawCTA(ctx: any, t: number) {
  const t0 = ws("book your") - 0.25;
  const tUrl = ws("madvertlabs.com");
  background(ctx, t, { grid: 0.4, glowA: 1.2 });
  kline(ctx, t, { x: 110, y: 300, size: 52, weight: 600, family: F.body, ls: 0, color: C.slate, words: [{ s: "Book", t: ws("book your") }, { s: "your", t: ws("your business") }] });
  kline(ctx, t, { x: 106, y: 420, size: 104, words: [{ s: "BUSINESS", t: ws("business") }] });
  kline(ctx, t, { x: 106, y: 530, size: 104, words: [{ s: "STRATEGY", t: ws("strategy"), grad: true }] });
  kline(ctx, t, { x: 106, y: 640, size: 104, words: [{ s: "CALL.", t: ws("call"), grad: true, anim: "slam" }] });
  // url pill types on
  const up = ep(t, ws("at madvertlabs.com") - 0.05, 0.4, outBack);
  if (up > 0) {
    ctx.save();
    ctx.globalAlpha *= clamp(up * 2);
    const x = 110, y = 700;
    card(ctx, x, y, 520, 84, { r: 42, shadow: 0.8, stroke: rgba(C.elec, 0.6) });
    icon(ctx, "globe", x + 28, y + 24, 36, C.blue);
    const url = "madvertlabs.com";
    const n = Math.floor(clamp((t - tUrl) / 0.7) * url.length);
    text(ctx, url.slice(0, n), x + 82, y + 54, { size: 34, weight: 800, family: F.head, color: C.navy });
    if (n < url.length && Math.floor(t * 4) % 2) { rr(ctx, x + 84 + n * 21, y + 24, 3, 38, 1); ctx.fillStyle = C.elec; ctx.fill(); }
    ctx.restore();
  }

  // laptop with booking flow
  const lp = ep(t, t0, 0.7, outQuart);
  ctx.save();
  ctx.globalAlpha *= lp;
  ctx.translate((1 - lp) * 120, 0);
  glow(ctx, 1380, 480, 600, C.cyan, 0.15);
  const r = laptop(ctx, 1000, 210, 820);
  ctx.save(); rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.clip();
  ctx.fillStyle = "#F8FBFF"; ctx.fillRect(r.x, r.y, r.w, r.h);
  // header
  ctx.fillStyle = "#fff"; ctx.fillRect(r.x, r.y, r.w, 64);
  const lg = img("logo");
  if (lg) ctx.drawImage(lg, r.x + 24, r.y + 18, 140, lg.height * 140 / lg.width);
  text(ctx, "madvertlabs.com/book", r.x + r.w - 24, r.y + 40, { size: 14, weight: 500, color: C.slate, align: "right" });
  // left: call details
  text(ctx, "Business Strategy Call", r.x + 30, r.y + 120, { size: 26, weight: 800, family: F.head });
  text(ctx, "30 min · Video call", r.x + 30, r.y + 152, { size: 16, weight: 500, color: C.slate });
  ["Growth audit", "System roadmap", "Clear next steps"].forEach((s, i) => {
    icon(ctx, "check", r.x + 30, r.y + 182 + i * 36, 20, C.green, 3);
    text(ctx, s, r.x + 60, r.y + 198 + i * 36, { size: 16, weight: 600, color: C.ink });
  });
  // calendar
  const cx = r.x + 420, cy = r.y + 96;
  text(ctx, "Choose a time", cx, cy + 4, { size: 16, weight: 700 });
  const pick = ep(t, ws("strategy") + 0.1, 0.25);
  for (let row = 0; row < 3; row++) for (let c = 0; c < 5; c++) {
    const sel = row === 1 && c === 2 && pick > 0.5;
    rr(ctx, cx + c * 66, cy + 22 + row * 52, 56, 42, 10);
    ctx.fillStyle = sel ? C.blue : "#EEF3F9"; ctx.fill();
    text(ctx, String(6 + row * 7 + c), cx + 28 + c * 66, cy + 49 + row * 52, { size: 15, weight: 700, color: sel ? "#fff" : C.ink, align: "center" });
  }
  ["10:00", "11:30", "2:00"].forEach((s, i) => {
    const sel = i === 1 && ep(t, ws("call") - 0.2, 0.2) > 0.5;
    rr(ctx, cx + i * 110, cy + 190, 98, 40, 10); ctx.fillStyle = sel ? C.navy : "#fff"; ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
    text(ctx, s, cx + 49 + i * 110, cy + 216, { size: 15, weight: 700, color: sel ? "#fff" : C.ink, align: "center" });
  });
  const press = prog(t, ws("call") + 0.25, ws("call") + 0.55);
  button(ctx, r.x + 30, r.y + 330, r.w - 60, 62, "Book your Business Strategy Call", { size: 20, press });
  const ok = ep(t, ws("call") + 0.5, 0.45, outBack);
  if (ok > 0) {
    ctx.save(); ctx.globalAlpha *= clamp(ok * 2);
    rr(ctx, r.x + 30, r.y + 330, r.w - 60, 62, 31); ctx.fillStyle = C.green; ctx.fill();
    icon(ctx, "check", r.x + r.w / 2 - 110, r.y + 347, 28, "#fff", 3);
    text(ctx, "You're booked", r.x + r.w / 2 + 20, r.y + 370, { size: 21, weight: 700, color: "#fff", align: "center" });
    ctx.restore();
  }
  ctx.restore();
  // cursor
  const cm = ep(t, ws("strategy") - 0.3, 0.5, inOutCubic), cm2 = ep(t, ws("call") - 0.35, 0.45, inOutCubic);
  const px = lerp(lerp(r.x + r.w - 40, cx + 160, cm), r.x + r.w / 2 + 60, cm2), py = lerp(lerp(r.y + r.h - 20, cy + 95, cm), r.y + 360, cm2);
  cursor(ctx, px, py, Math.max(prog(t, ws("strategy") + 0.05, ws("strategy") + 0.35), press));
  ctx.restore();
}
