// 11 BUILD: "And when growth needs technology? We build it."
// Blueprint outlines draw, then live product UIs switch on across a device ecosystem.
import { C, F, W, H } from "../core/brand";
import { background, card, chip, text, rr, icon, glow, lineChart, eyebrow } from "../core/draw";
import { clamp, ep, outExpo, inOutCubic, inOutExpo, prog, lerp, outBack, rgba, outQuart, hash } from "../core/ease";
import { ws } from "../core/words";
import { img } from "../core/assets";
import { kline, shake } from "../components/kinetic";
import { laptop, phone, lines, avatar, button } from "../components/ui";

export function drawBuild(ctx: any, t: number) {
  const t0 = ws("and when growth") - 0.25;
  const tTech = ws("technology");
  const tBuild = ws("we build it");
  const [sx, sy] = shake(t, tBuild + 0.02, 16, 0.45);
  ctx.save(); ctx.translate(sx, sy);
  background(ctx, t, { grid: 0.9, glowA: 1.2 });
  const bp = ep(t, t0 + 0.15, 0.9, inOutCubic); // blueprint draws while the question is asked
  const live = ep(t, tTech + 0.2, 0.5, inOutCubic); // UI switches on
  const cam = (t - t0) * 6;

  const dev = (i: number, x: number, y: number, w: number, h: number, fn: () => void) => {
    const a = ep(t, t0 + 0.1 + i * 0.1, 0.7, outQuart);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= clamp(a * 1.5);
    ctx.translate(0, (1 - a) * 90 - cam * (0.5 + i * 0.25));
    // blueprint outline
    if (live < 1) {
      ctx.save();
      ctx.globalAlpha *= 1 - live;
      ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 40;
      ctx.strokeStyle = C.elec; ctx.lineWidth = 2.5;
      const per = 2 * (w + h), len = per * bp;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 16);
      ctx.setLineDash([len, per]); ctx.stroke();
      ctx.restore();
    }
    if (live > 0) { ctx.save(); ctx.globalAlpha *= live; fn(); ctx.restore(); }
    ctx.restore();
  };

  // tablet: customer portal (left)
  dev(0, 110, 420, 400, 300, () => {
    card(ctx, 110, 420, 400, 300, { r: 24 });
    eyebrow(ctx, "Customer portal", 136, 462, 1, C.blue);
    ["Onboarding", "Campaign live", "Monthly review"].forEach((s, i) => {
      const done = clamp((t - tTech - 0.6) * 3 - i);
      ctx.beginPath(); ctx.arc(150, 510 + i * 62, 14, 0, 7); ctx.fillStyle = done > 0.5 ? C.green : "#E5EDF6"; ctx.fill();
      if (done > 0.5) icon(ctx, "check", 141, 501 + i * 62, 18, "#fff", 3);
      text(ctx, s, 178, 517 + i * 62, { size: 19, weight: 600, color: C.ink });
    });
  });
  // laptop: analytics dashboard (centre)
  dev(1, 560, 330, 800, 496, () => {
    const r = laptop(ctx, 560, 330, 800);
    ctx.save(); rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.clip();
    ctx.fillStyle = "#F7FAFD"; ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = C.navy; ctx.fillRect(r.x, r.y, 150, r.h);
    const lg = img("logoDark");
    if (lg) ctx.drawImage(lg, r.x + 18, r.y + 22, 114, lg.height * 114 / lg.width);
    ["Overview", "Leads", "Pipeline", "Campaigns", "Reports"].forEach((s, i) => {
      if (i === 0) { rr(ctx, r.x + 10, r.y + 72 + i * 42, 130, 34, 8); ctx.fillStyle = rgba(C.elec, 0.25); ctx.fill(); }
      text(ctx, s, r.x + 24, r.y + 95 + i * 42, { size: 15, weight: 600, color: i ? "#9FB1C8" : "#fff" });
    });
    ["Leads", "Booked calls", "Pipeline"].forEach((s, i) => {
      const kx = r.x + 172 + i * 196;
      card(ctx, kx, r.y + 22, 180, 96, { r: 12, shadow: 0.2 });
      text(ctx, s, kx + 16, r.y + 50, { size: 14, weight: 600, color: C.slate });
      lineChart(ctx, kx + 16, r.y + 62, 148, 40, [0.2, 0.3, 0.26, 0.45, 0.5, 0.7, 0.85].map((v) => v * (0.8 + i * 0.07)), ep(t, tTech + 0.6 + i * 0.1, 0.9, inOutCubic), { lw: 2.5, dot: false });
    });
    card(ctx, r.x + 172, r.y + 136, 572, 300, { r: 12, shadow: 0.2 });
    text(ctx, "Revenue by channel", r.x + 192, r.y + 168, { size: 16, weight: 700 });
    [0.5, 0.72, 0.6, 0.88, 0.76, 0.95, 0.82, 1].forEach((v, i) => {
      const h = 210 * v * ep(t, tTech + 0.7 + i * 0.05, 0.6, outExpo);
      rr(ctx, r.x + 200 + i * 66, r.y + 420 - h, 38, h, 8);
      const g = ctx.createLinearGradient(0, r.y + 420 - h, 0, r.y + 420); g.addColorStop(0, C.cyan); g.addColorStop(1, C.blue);
      ctx.fillStyle = g; ctx.fill();
    });
    ctx.restore();
  });
  // phone: mobile app (right)
  dev(2, 1420, 350, 230, 470, () => {
    const r = phone(ctx, 1420, 350, 230, 470);
    ctx.save(); rr(ctx, r.x, r.y, r.w, r.h, 20); ctx.clip();
    const g = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + 140); g.addColorStop(0, C.blue); g.addColorStop(1, C.cyan);
    ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, 130);
    text(ctx, "Book & track", r.x + 16, r.y + 50, { size: 19, weight: 800, family: F.head, color: "#fff" });
    text(ctx, "Your app", r.x + 16, r.y + 76, { size: 14, weight: 500, color: "rgba(255,255,255,0.85)" });
    for (let i = 0; i < 3; i++) {
      const a = ep(t, tTech + 0.7 + i * 0.12, 0.4, outBack);
      ctx.save(); ctx.globalAlpha *= clamp(a);
      card(ctx, r.x + 12, r.y + 146 + i * 82 + (1 - a) * 20, r.w - 24, 70, { r: 14, shadow: 0.25 });
      avatar(ctx, r.x + 42, r.y + 181 + i * 82, 16, ["JM", "AK", "SL"][i], [C.blue, C.elec, C.navy][i]);
      lines(ctx, r.x + 68, r.y + 170 + i * 82, 120, 2, { gap: 16, h: 8 });
      ctx.restore();
    }
    ctx.restore();
  });
  // floating cards: ROI calculator + AI tool
  dev(3, 1600, 230, 260, 170, () => {
    card(ctx, 1600, 230, 260, 170, { r: 20 });
    eyebrow(ctx, "ROI calculator", 1620, 266, 1, C.blue);
    [0.7, 0.45].forEach((v, i) => {
      rr(ctx, 1620, 292 + i * 34, 220, 8, 4); ctx.fillStyle = "#E5EDF6"; ctx.fill();
      const k = v * ep(t, tTech + 0.8, 0.8, inOutCubic);
      rr(ctx, 1620, 292 + i * 34, 220 * k, 8, 4); ctx.fillStyle = C.elec; ctx.fill();
      ctx.beginPath(); ctx.arc(1620 + 220 * k, 296 + i * 34, 10, 0, 7); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.elec; ctx.lineWidth = 3; ctx.stroke();
    });
    text(ctx, "Projected return →", 1620, 382, { size: 15, weight: 700, color: C.ink });
  });
  dev(4, 150, 760, 330, 110, () => {
    card(ctx, 150, 760, 330, 100, { r: 20 });
    const g = ctx.createLinearGradient(170, 780, 220, 830); g.addColorStop(0, C.blue); g.addColorStop(1, C.cyan);
    ctx.beginPath(); ctx.arc(196, 810, 24, 0, 7); ctx.fillStyle = g; ctx.fill();
    icon(ctx, "spark", 182, 796, 28, "#fff", 2.2);
    text(ctx, "AI assistant", 236, 803, { size: 18, weight: 800, family: F.head });
    const s = "Drafting follow-up…";
    text(ctx, s.slice(0, Math.floor(clamp((t - tTech - 0.8) / 0.8) * s.length)), 236, 830, { size: 15, weight: 500, color: C.slate });
  });

  // type
  kline(ctx, t, {
    x: W / 2, y: 200, size: 66, align: "center", weight: 700, color: C.ink, out: tBuild - 0.1, outAnim: "up", outDur: 0.3,
    words: [
      { s: "WHEN", t: ws("when growth") }, { s: "GROWTH", t: ws("growth needs") }, { s: "NEEDS", t: ws("needs") },
      { s: "TECHNOLOGY?", t: tTech, grad: true },
    ],
  });
  kline(ctx, t, {
    x: W / 2, y: 232, size: 150, align: "center",
    words: [{ s: "WE", t: tBuild, anim: "slam" }, { s: "BUILD", t: ws("build it"), anim: "slam" }, { s: "IT.", t: ws("it", 0), anim: "slam", grad: true }],
  });
  ctx.restore();
}
