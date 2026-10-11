// 06 BRANDING: "We build brands people remember." Editorial identity system builds on a grid.
import { C, F, W, H } from "../core/brand";
import { background, card, text, eyebrow, rr, icon, cover } from "../core/draw";
import { clamp, ep, outExpo, outQuart, inOutCubic, lerp, outBack } from "../core/ease";
import { ws } from "../core/words";
import { img } from "../core/assets";
import { kline } from "../components/kinetic";
import { ribbon } from "../components/ribbon";

export function drawBrand(ctx: any, t: number) {
  const t0 = ws("we build brands") - 0.2;
  const drift = (t - t0) * 14;
  background(ctx, t, { grid: 0.5, gx: drift });
  // kinetic (left)
  kline(ctx, t, { x: 140, y: 330, size: 46, weight: 600, color: C.slate, family: F.body, ls: 0, words: [{ s: "We", t: ws("we build brands") }, { s: "build", t: ws("build brands") }] });
  kline(ctx, t, { x: 136, y: 470, size: 150, words: [{ s: "BRANDS", t: ws("brands"), anim: "slam" }] });
  kline(ctx, t, { x: 140, y: 580, size: 88, weight: 700, words: [{ s: "PEOPLE", t: ws("people") }] });
  kline(ctx, t, { x: 140, y: 690, size: 88, weight: 800, words: [{ s: "REMEMBER.", t: ws("remember"), grad: true }] });
  ribbon(ctx, [[140, 730], [400, 742], [640, 722]], { to: ep(t, ws("remember") + 0.15, 0.5, inOutCubic), width: 5, flow: t, speed: 0, strands: 1 });

  // identity collage (right), each piece slides in on its own vector
  const piece = (i: number, x: number, y: number, w: number, h: number, dx: number, dy: number, fn: (x: number, y: number) => void) => {
    const p = ep(t, t0 + 0.06 + i * 0.09, 0.7, outQuart);
    if (p <= 0) return;
    const par = (t - t0) * (6 + i * 3);
    const X = x + (1 - p) * dx, Y = y + (1 - p) * dy - par;
    ctx.save();
    ctx.globalAlpha *= clamp(p * 1.6);
    fn(X, Y);
    ctx.restore();
  };
  // logo lockup on navy
  piece(0, 880, 150, 560, 300, 300, 0, (x, y) => {
    card(ctx, x, y, 560, 300, { r: 24, fill: C.navy, stroke: null });
    const im = img("logoDark");
    if (im) { const w = 420, h = im.height * w / im.width; ctx.drawImage(im, x + 70, y + 150 - h / 2, w, h); }
  });
  // palette
  piece(1, 1470, 150, 330, 300, 0, -260, (x, y) => {
    card(ctx, x, y, 330, 300, { r: 24 });
    eyebrow(ctx, "Palette", x + 26, y + 44, 1, C.slate);
    [["#0084FF", "Primary"], ["#00E5FF", "Cyan"], ["#0A0F1C", "Navy"], ["#F5FAFF", "Light"]].forEach(([c, n], k) => {
      const yy = y + 70 + k * 54;
      rr(ctx, x + 26, yy, 44, 40, 10); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
      text(ctx, n, x + 86, yy + 18, { size: 18, weight: 700, color: C.ink });
      text(ctx, c, x + 86, yy + 37, { size: 14, weight: 500, color: C.slate, family: F.mono });
    });
  });
  // typography
  piece(2, 880, 480, 300, 300, 0, 260, (x, y) => {
    card(ctx, x, y, 300, 300, { r: 24 });
    eyebrow(ctx, "Typography", x + 26, y + 44, 1, C.slate);
    text(ctx, "Aa", x + 26, y + 170, { size: 120, weight: 800, family: F.head, color: C.navy });
    text(ctx, "Sora · Inter", x + 26, y + 252, { size: 20, weight: 600, color: C.slate });
  });
  // social grid
  piece(3, 1210, 480, 290, 300, 200, 200, (x, y) => {
    card(ctx, x, y, 290, 300, { r: 24 });
    eyebrow(ctx, "Social", x + 24, y + 44, 1, C.slate);
    for (let k = 0; k < 4; k++) {
      const cx = x + 24 + (k % 2) * 124, cy = y + 64 + Math.floor(k / 2) * 112;
      const g = ctx.createLinearGradient(cx, cy, cx + 116, cy + 104);
      g.addColorStop(0, k % 2 ? "#0A0F1C" : "#0084FF"); g.addColorStop(1, k % 2 ? "#13305A" : "#00E5FF");
      rr(ctx, cx, cy, 116, 104, 12); ctx.fillStyle = g; ctx.fill();
      const ic = img("icon");
      if (ic && k === 1) { ctx.save(); rr(ctx, cx, cy, 116, 104, 12); ctx.clip(); cover(ctx, ic, cx, cy, 116, 104); ctx.restore(); }
      if (k !== 1) rr(ctx, cx + 14, cy + 70, 60, 10, 5), (ctx.fillStyle = "rgba(255,255,255,0.8)"), ctx.fill();
    }
  });
  // business card
  piece(4, 1530, 480, 270, 300, 260, 0, (x, y) => {
    ctx.save();
    ctx.translate(x + 135, y + 150); ctx.rotate(-0.06); ctx.translate(-x - 135, -y - 150);
    card(ctx, x, y + 40, 270, 160, { r: 14 });
    const im = img("logo");
    if (im) { const w = 170; ctx.drawImage(im, x + 22, y + 66, w, im.height * w / im.width); }
    text(ctx, "Growth Systems", x + 22, y + 160, { size: 15, weight: 600, color: C.slate });
    rr(ctx, x + 22, y + 172, 120, 6, 3); ctx.fillStyle = C.elec; ctx.fill();
    ctx.restore();
    card(ctx, x + 30, y + 214, 240, 70, { r: 14, fill: C.navy, stroke: null });
    text(ctx, "madvertlabs.com", x + 150, y + 257, { size: 17, weight: 600, color: "#fff", align: "center" });
  });
  // website snippet
  piece(5, 880, 810, 920, 90, 0, 200, (x, y) => {
    card(ctx, x, y, 920, 76, { r: 18 });
    const im = img("logo");
    if (im) { const w = 150; ctx.drawImage(im, x + 26, y + 24, w, im.height * w / im.width); }
    ["Services", "Studios", "Systems", "About"].forEach((n, k) => text(ctx, n, x + 330 + k * 120, y + 45, { size: 17, weight: 600, color: C.slate }));
    rr(ctx, x + 770, y + 18, 124, 40, 20); ctx.fillStyle = C.navy; ctx.fill();
    text(ctx, "Get started", x + 832, y + 44, { size: 15, weight: 700, color: "#fff", align: "center" });
  });
}
