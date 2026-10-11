// 10 AUTOMATE: "Then every lead gets an instant reply, qualified by AI, booked and tracked. Automatically."
// One lead travels the ribbon; each module lights as it arrives.
import { C, F, W, H } from "../core/brand";
import { background, card, chip, text, rr, icon, glow, eyebrow } from "../core/draw";
import { clamp, ep, outExpo, inOutCubic, inOutExpo, prog, lerp, outBack, rgba, outCubic } from "../core/ease";
import { ws, we } from "../core/words";
import { kline, shake } from "../components/kinetic";
import { avatar, okPill } from "../components/ui";
import { ribbon, sample, pointAt } from "../components/ribbon";

const CW = 320, CH = 300, CY = 400;
const XS = [90, 445, 800, 1155, 1510];
const RY = CY + CH + 70;
const NAMES = ["New lead", "Instant reply", "AI qualified", "Booked", "Tracked"];
const ICONS = ["user", "chat", "spark", "calendar", "chart"];

export function drawAutomate(ctx: any, t: number) {
  const t0 = ws("then every") - 0.25;
  const cues = [ws("every lead"), ws("instant"), ws("qualified"), ws("booked", 1), ws("tracked")];
  const tAuto = ws("automatically");
  const [sx, sy] = shake(t, tAuto, 7);
  ctx.save(); ctx.translate(sx, sy);
  background(ctx, t, { grid: 0.5, gx: (t - t0) * 20 });
  // camera eases back slightly on "Automatically"
  const pb = ep(t, tAuto - 0.1, 0.8, inOutCubic);
  ctx.save();
  ctx.translate(W / 2, H / 2 + 40); ctx.scale(1 - pb * 0.06, 1 - pb * 0.06); ctx.translate(-W / 2, -H / 2 - 40);

  const path: [number, number][] = [[20, RY], ...XS.map((x) => [x + CW / 2, RY] as [number, number]), [1900, RY]];
  const s = sample(path, 200);
  const nodeU = XS.map((x) => (x + CW / 2 - 20) / 1880);
  // lead position along the ribbon: hops node to node on each cue
  let u = nodeU[0] * ep(t, cues[0] - 0.35, 0.35, inOutCubic);
  for (let i = 1; i < 5; i++) u = lerp(u, nodeU[i], ep(t, cues[i] - 0.32, 0.32, inOutExpo));
  if (t > tAuto) u = lerp(u, 1, ep(t, tAuto, 0.6, inOutCubic));
  ribbon(ctx, s, { to: ep(t, t0, 0.8, inOutCubic), width: 6, flow: t, speed: t > tAuto ? 1.6 : 0.45, pulses: t > tAuto ? 5 : 2 });

  XS.forEach((x, i) => {
    const a = ep(t, t0 + 0.08 * i, 0.5, outBack);
    if (a <= 0) return;
    const on = t >= cues[i];
    const flash = t > tAuto ? Math.max(0, 1 - Math.abs((t - tAuto) * 5 - i * 0.7)) : 0;
    ctx.save();
    ctx.globalAlpha *= clamp(a * 2);
    ctx.strokeStyle = on ? rgba(C.elec, 0.8) : "#CFDAE6"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + CW / 2, CY + CH); ctx.lineTo(x + CW / 2, RY); ctx.stroke();
    ctx.translate(x + CW / 2, CY + CH / 2); ctx.scale(lerp(0.7, 1, a), lerp(0.7, 1, a)); ctx.translate(-x - CW / 2, -CY - CH / 2);
    if (on) glow(ctx, x + CW / 2, CY + CH / 2, 260, C.cyan, 0.18 + flash * 0.4);
    card(ctx, x, CY, CW, CH, { r: 24, stroke: on ? rgba(C.elec, 0.7 + flash * 0.3) : undefined });
    // header
    const ic = on ? C.blue : C.mute;
    rr(ctx, x + 20, CY + 20, 44, 44, 12); ctx.fillStyle = on ? rgba(C.elec, 0.14) : "#F0F4F9"; ctx.fill();
    icon(ctx, ICONS[i], x + 30, CY + 30, 24, ic);
    text(ctx, NAMES[i], x + 78, CY + 50, { size: 21, weight: 800, family: F.head, color: on ? C.navy : C.mute });
    text(ctx, `0${i + 1}`, x + CW - 24, CY + 50, { size: 15, weight: 700, family: F.mono, color: C.mute, align: "right" });
    if (on) [lead, reply, qualify, booked, tracked][i](ctx, t, t - cues[i], x + 20, CY + 84, CW - 40);
    // completion tick
    const done = i < 4 ? ep(t, cues[i + 1] - 0.3, 0.3, outBack) : ep(t, tAuto, 0.3, outBack);
    if (done > 0) {
      ctx.save(); ctx.globalAlpha *= clamp(done * 2);
      ctx.beginPath(); ctx.arc(x + CW - 6, CY + 6, 18 * done, 0, 7); ctx.fillStyle = C.green; ctx.fill();
      icon(ctx, "check", x + CW - 17, CY - 5, 22, "#fff", 3);
      ctx.restore();
    }
    ctx.restore();
  });
  // the lead dot
  if (t > cues[0] - 0.35) {
    const p = pointAt(s, u);
    glow(ctx, p.x, p.y, 70, C.cyan, 0.6);
    ctx.beginPath(); ctx.arc(p.x, p.y, 13, 0, 7); ctx.fillStyle = "#fff"; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = C.elec; ctx.stroke();
  }
  ctx.restore();

  // headline: phrase replacement
  const Y = 250;
  const hd = (words: any[], tin: number, tout?: number, size = 96) =>
    kline(ctx, t, { x: W / 2, y: Y, size, align: "center", out: tout, outAnim: "up", outDur: 0.3, words: words.map((w) => ({ ...w, t: w.t ?? tin })) });
  hd([{ s: "EVERY", t: ws("every lead") }, { s: "LEAD.", t: ws("lead", 0), grad: true }], 0, cues[1] - 0.1);
  hd([{ s: "INSTANT", t: cues[1] }, { s: "REPLY.", t: ws("reply"), grad: true }], 0, cues[2] - 0.1);
  hd([{ s: "QUALIFIED", t: cues[2] }, { s: "BY", t: ws("by ai") }, { s: "AI.", t: ws("ai", 1), grad: true }], 0, cues[3] - 0.1);
  hd([{ s: "BOOKED", t: cues[3] }, { s: "&", t: ws("and tracked") }, { s: "TRACKED.", t: cues[4], grad: true }], 0, tAuto - 0.1);
  hd([{ s: "AUTOMATICALLY.", t: tAuto, anim: "slam", grad: true }], 0, undefined, 132);
  ctx.restore();
}

function lead(ctx: any, t: number, lt: number, x: number, y: number, w: number) {
  avatar(ctx, x + 28, y + 34, 28, "DR", C.blue);
  text(ctx, "Daniel Reed", x + 70, y + 30, { size: 20, weight: 700 });
  text(ctx, "Facility manager", x + 70, y + 54, { size: 15, weight: 500, color: C.slate });
  chip(ctx, "Source: Meta lead form", x, y + 92, { size: 15, bg: C.tint });
  okPill(ctx, x, y + 142, "New", ep(t, ws("every lead") + 0.2, 0.3), C.elec);
}
function reply(ctx: any, t: number, lt: number, x: number, y: number, w: number) {
  const p = ep(t, ws("instant") + 0.05, 0.35, outBack);
  ctx.save(); ctx.globalAlpha *= clamp(p * 2);
  rr(ctx, x, y + 4, w, 96, 18); ctx.fillStyle = "#DCF8E8"; ctx.fill();
  text(ctx, "Hi Daniel, thanks for", x + 16, y + 38, { size: 17, weight: 500, color: C.ink });
  text(ctx, "reaching out! Is Thursday", x + 16, y + 62, { size: 17, weight: 500, color: C.ink });
  text(ctx, "good for a quick call?", x + 16, y + 86, { size: 17, weight: 500, color: C.ink });
  ctx.restore();
  okPill(ctx, x, y + 120, "Sent instantly", ep(t, ws("reply") + 0.1, 0.3));
}
function qualify(ctx: any, t: number, lt: number, x: number, y: number, w: number) {
  const p = ep(t, ws("qualified"), 0.9, inOutCubic);
  const cx = x + 56, cy = y + 60;
  ctx.lineWidth = 12; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(cx, cy, 44, 0, 7); ctx.strokeStyle = "#E5EDF6"; ctx.stroke();
  const g = ctx.createLinearGradient(cx - 44, cy, cx + 44, cy); g.addColorStop(0, C.blue); g.addColorStop(1, C.cyan);
  ctx.beginPath(); ctx.arc(cx, cy, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.9 * p); ctx.strokeStyle = g; ctx.stroke();
  text(ctx, "Fit", cx, cy + 8, { size: 22, weight: 800, family: F.head, align: "center" });
  ["Budget", "Timeline", "Need"].forEach((s, i) => {
    const a = ep(t, ws("qualified") + 0.2 + i * 0.15, 0.3, outBack);
    okPill(ctx, x + 124, y + 6 + i * 44, s + " ✓", a);
  });
  okPill(ctx, x, y + 150, "Qualified by AI", ep(t, ws("ai", 1), 0.3), C.elec);
}
function booked(ctx: any, t: number, lt: number, x: number, y: number, w: number) {
  const days = ["M", "T", "W", "T", "F"];
  days.forEach((d, i) => text(ctx, d, x + 18 + i * 54, y + 18, { size: 14, weight: 700, color: C.mute, align: "center" }));
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
    const sel = r === 0 && c === 3 && ep(t, ws("booked", 1) + 0.1, 0.2) > 0.5;
    rr(ctx, x + c * 54, y + 32 + r * 46, 40, 38, 10);
    ctx.fillStyle = sel ? C.blue : "#F2F6FB"; ctx.fill();
    text(ctx, String(12 + r * 7 + c), x + 20 + c * 54, y + 57 + r * 46, { size: 15, weight: 700, color: sel ? "#fff" : C.ink, align: "center" });
  }
  okPill(ctx, x, y + 142, "Thu 10:30 · Booked", ep(t, ws("booked", 1) + 0.25, 0.3));
}
function tracked(ctx: any, t: number, lt: number, x: number, y: number, w: number) {
  const p = ep(t, ws("tracked"), 0.6, outExpo);
  [0.35, 0.5, 0.42, 0.68, 0.84].forEach((v, i) => {
    const h = 90 * v * clamp(p * 1.4 - i * 0.1);
    rr(ctx, x + i * 50, y + 100 - h, 34, h, 8);
    ctx.fillStyle = i === 4 ? C.elec : "#CFE4FA"; ctx.fill();
  });
  chip(ctx, "Meta → Call → Pipeline", x, y + 116, { size: 14, bg: C.tint });
  okPill(ctx, x, y + 158, "Attributed", ep(t, ws("tracked") + 0.3, 0.3), C.elec);
}
