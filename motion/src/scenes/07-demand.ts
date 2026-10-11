// 07 DEMAND: "We bring in demand from Meta, Google, SEO and AI search."
// Four live channel panels build left to right, joined by the ribbon into one engine.
import { C, F, W, H } from "../core/brand";
import { background, card, text, eyebrow, rr, icon, chip, cover, lineChart, glow } from "../core/draw";
import { clamp, ep, outBack, outExpo, outQuart, inOutCubic, lerp, prog, rgba, hash, outCubic } from "../core/ease";
import { ws, we } from "../core/words";
import { img } from "../core/assets";
import { kline } from "../components/kinetic";
import { toggle, avatar, lines, mixHex } from "../components/ui";
import { ribbon } from "../components/ribbon";

const PW = 400, PH = 470, PY = 290;
const PX = [110, 545, 980, 1415];

export function drawDemand(ctx: any, t: number) {
  const t0 = ws("we bring in") - 0.2;
  const cues = [ws("meta"), ws("google"), ws("seo"), ws("ai search")];
  background(ctx, t, { grid: 0.45 });
  // headline
  kline(ctx, t, {
    x: 110, y: 200, size: 70, words: [
      { s: "WE", t: ws("we bring in") }, { s: "BRING", t: ws("bring") }, { s: "IN", t: ws("in demand") },
      { s: "DEMAND.", t: ws("demand"), grad: true, anim: "slam" },
    ],
  });
  const labels = ["META", "GOOGLE", "SEO", "AI SEARCH"];
  // ribbon under panels joining them
  const path: [number, number][] = [[60, 800], [310, 820], [745, 790], [1180, 820], [1615, 790], [1880, 810]];
  ribbon(ctx, path, { to: inOutCubic(prog(t, cues[0], cues[3] + 0.6)), width: 6, flow: t, speed: 0.6 });

  const panels = [meta, google, seo, ai];
  panels.forEach((fn, i) => {
    const c = Math.min(cues[i] - 0.2, t0 + 0.35 + i * 0.12);
    const p = ep(t, c, 0.6, outQuart);
    if (p <= 0) return;
    const x = PX[i], y = PY + (1 - p) * 80;
    ctx.save();
    ctx.globalAlpha *= clamp(p * 1.5);
    const live = t > cues[i];
    card(ctx, x, y, PW, PH, { r: 24, stroke: live ? rgba(C.elec, 0.55) : undefined });
    // panel label
    text(ctx, labels[i], x + 26, y + 46, { size: 24, weight: 800, family: F.head, color: C.navy, ls: 1 });
    chip(ctx, ["Paid social", "Paid search", "Organic", "Answer engines"][i], x + PW - 26 - [124, 128, 104, 160][i], y + 22, { size: 15, fg: C.blue, bg: rgba(C.elec, 0.1) });
    if (t >= cues[i] - 0.05) fn(ctx, t, t - cues[i], x + 26, y + 80, PW - 52);
    else { lines(ctx, x + 26, y + 100, PW - 52, 5, { gap: 30, h: 12, color: "#EDF2F8" }); }
    ctx.restore();
    // connector dot onto the ribbon
    const dp = ep(t, cues[i] + 0.3, 0.4);
    if (dp > 0) {
      ctx.save();
      ctx.strokeStyle = rgba(C.elec, 0.6 * dp); ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(x + PW / 2, y + PH); ctx.lineTo(x + PW / 2, lerp(y + PH, 805, dp)); ctx.stroke();
      ctx.restore();
    }
  });
}

// META: campaign setup -> audience -> creative -> OFF/ACTIVE -> leads arrive
function meta(ctx: any, t: number, lt: number, x: number, y: number, w: number) {
  text(ctx, "Campaign · Leads", x, y + 18, { size: 17, weight: 600, color: C.slate });
  const on = ep(t, ws("google") - 0.35, 0.25);
  toggle(ctx, x + w - 60, y - 2, on);
  text(ctx, on > 0.5 ? "ACTIVE" : "OFF", x + w - 72, y + 20, { size: 14, weight: 700, color: on > 0.5 ? C.green : C.mute, align: "right", family: F.mono });
  // audience chips
  ["Business owners", "30–55", "25 km"].forEach((c, k) => {
    const a = ep(t, ws("meta") + 0.05 + k * 0.08, 0.3, outBack);
    chip(ctx, c, x + [0, 172, 248][k], y + 44, { size: 15, alpha: a, bg: C.tint });
  });
  // creative
  const cr = ep(t, ws("meta") + 0.25, 0.4, outQuart);
  ctx.save(); ctx.globalAlpha *= cr;
  rr(ctx, x, y + 100, w, 170, 14); ctx.save(); ctx.clip();
  cover(ctx, img("s07"), x, y + 100 + (1 - cr) * 30, w, 170, 0.6, 0.45);
  ctx.restore(); ctx.restore();
  // budget + leads
  text(ctx, "Daily budget", x, y + 304, { size: 15, weight: 600, color: C.slate });
  rr(ctx, x, y + 316, w, 10, 5); ctx.fillStyle = "#E3EBF5"; ctx.fill();
  rr(ctx, x, y + 316, w * 0.65 * ep(t, ws("meta") + 0.4, 0.5), 10, 5); ctx.fillStyle = C.elec; ctx.fill();
  for (let k = 0; k < 3; k++) {
    const a = ep(t, ws("google") - 0.1 + k * 0.32, 0.35, outBack);
    if (a > 0) chip(ctx, "+1 lead", x + k * 116, y + 344, { size: 15, fg: "#05834F", bg: rgba(C.green, 0.12), dot: C.green, alpha: a });
  }
}

// GOOGLE: query typed, sponsored result, click
function google(ctx: any, t: number, lt: number, x: number, y: number, w: number) {
  rr(ctx, x, y, w, 50, 25); ctx.fillStyle = "#F2F6FB"; ctx.fill();
  icon(ctx, "search", x + 16, y + 13, 24, C.slate);
  const q = "commercial cleaning near me";
  const n = Math.floor(clamp(lt / 0.45) * q.length);
  text(ctx, q.slice(0, n), x + 50, y + 32, { size: 17, weight: 500, color: C.ink });
  const r = ep(t, ws("google") + 0.4, 0.4, outQuart);
  if (r > 0) {
    ctx.save(); ctx.globalAlpha *= r;
    rr(ctx, x, y + 70 + (1 - r) * 20, w, 120, 14); ctx.fillStyle = rgba(C.elec, 0.07); ctx.fill(); ctx.strokeStyle = rgba(C.elec, 0.5); ctx.lineWidth = 2; ctx.stroke();
    text(ctx, "Sponsored", x + 18, y + 100, { size: 14, weight: 700, color: C.ink });
    text(ctx, "yourbusiness.com", x + 104, y + 100, { size: 14, weight: 500, color: "#0F8A4C" });
    text(ctx, "Your Business — Book Today", x + 18, y + 134, { size: 20, weight: 700, color: "#1A4FD0" });
    lines(ctx, x + 18, y + 152, w - 60, 2, { gap: 16, h: 8 });
    ctx.restore();
  }
  for (let k = 0; k < 2; k++) {
    const a = ep(t, ws("google") + 0.55 + k * 0.08, 0.3);
    ctx.save(); ctx.globalAlpha *= a * 0.7;
    rr(ctx, x, y + 210 + k * 70, w, 58, 12); ctx.fillStyle = "#FAFCFE"; ctx.fill();
    lines(ctx, x + 18, y + 228 + k * 70, w - 80, 2, { gap: 14, h: 8 });
    ctx.restore();
  }
  // click
  const cl = prog(t, ws("seo") - 0.1, ws("seo") + 0.4);
  if (cl > 0) {
    const cx = lerp(x + w - 30, x + 200, outCubic(Math.min(1, cl * 2))), cy = lerp(y + 330, y + 134, outCubic(Math.min(1, cl * 2)));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = C.navy; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 24); ctx.lineTo(7, 18); ctx.lineTo(11, 27); ctx.lineTo(15, 25); ctx.lineTo(11, 17); ctx.lineTo(19, 17); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (cl > 0.5) { ctx.beginPath(); ctx.arc(x + 206, y + 140, 10 + (cl - 0.5) * 60, 0, 7); ctx.strokeStyle = rgba(C.elec, 1 - (cl - 0.5) * 2); ctx.lineWidth = 3; ctx.stroke(); }
  }
}

// SEO: listing climbs to #1, organic traffic rises
function seo(ctx: any, t: number, lt: number, x: number, y: number, w: number) {
  const climb = ep(t, ws("seo") + 0.1, 1.0, inOutCubic);
  const pos = lerp(5, 0, climb); // your row index
  for (let k = 0; k < 6; k++) {
    let row = k < 5 ? k + (k >= Math.ceil(pos) ? 1 : 0) : 0;
    if (k === 5) continue;
    const others = [0, 1, 2, 3, 4].map((i) => (i >= pos ? i + 1 : i));
    row = others[k];
    const ry = y + row * 46;
    ctx.save(); ctx.globalAlpha *= 0.75;
    text(ctx, `${row + 1}`, x, ry + 26, { size: 15, weight: 700, color: C.mute, family: F.mono });
    rr(ctx, x + 30, ry + 12, (w - 90) * (0.9 - k * 0.1), 18, 9); ctx.fillStyle = "#E7EEF7"; ctx.fill();
    ctx.restore();
  }
  const yy = y + pos * 46;
  rr(ctx, x - 8, yy + 2, w + 16, 40, 10); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = C.elec; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, `${Math.round(pos) + 1}`, x, yy + 28, { size: 15, weight: 800, color: C.blue, family: F.mono });
  text(ctx, "yourbusiness.com", x + 30, yy + 28, { size: 17, weight: 700, color: C.blue });
  if (climb > 0.95) chip(ctx, "↑ Top result", x + w - 130, yy + 6, { size: 13, fg: "#05834F", bg: rgba(C.green, 0.12), h: 30 });
  text(ctx, "Organic traffic", x, y + 300, { size: 15, weight: 600, color: C.slate });
  lineChart(ctx, x, y + 310, w, 64, [0.1, 0.14, 0.12, 0.22, 0.3, 0.38, 0.5, 0.62, 0.78, 0.92], ep(t, ws("seo") + 0.3, 1.2, inOutCubic), { lw: 3 });
}

// AI SEARCH: question -> answer that recommends you, with citation
function ai(ctx: any, t: number, lt: number, x: number, y: number, w: number) {
  const q = "Who should I hire for office cleaning?";
  rr(ctx, x + 40, y, w - 40, 58, 18); ctx.fillStyle = C.navy; ctx.fill();
  text(ctx, q.slice(0, Math.floor(clamp(lt / 0.35) * q.length)), x + 58, y + 36, { size: 15.5, weight: 500, color: "#fff" });
  const a = ep(t, ws("ai search") + 0.35, 0.3);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(x, y + 80, x + 40, y + 120);
  g.addColorStop(0, C.blue); g.addColorStop(1, C.cyan);
  ctx.beginPath(); ctx.arc(x + 18, y + 98, 16, 0, 7); ctx.fillStyle = g; ctx.fill();
  icon(ctx, "spark", x + 8, y + 88, 20, "#fff", 2);
  const ans = "A strong local option is Your Business — well reviewed, fast to respond and easy to book.";
  const n = Math.floor(clamp((t - ws("ai search") - 0.45) / 1.0) * ans.length);
  wrap(ctx, ans.slice(0, n), x + 48, y + 104, w - 50, 26, 17);
  const c = ep(t, ws("ai search") + 1.4, 0.3, outBack);
  chip(ctx, "Source: yourbusiness.com", x + 48, y + 210, { size: 14, fg: C.blue, bg: rgba(C.elec, 0.1), alpha: c });
  ctx.restore();
  glow(ctx, x + 18, y + 98, 60, C.cyan, 0.3 * a);
}

function wrap(ctx: any, s: string, x: number, y: number, w: number, lh: number, size: number) {
  ctx.save();
  ctx.font = `500 ${size}px ${F.body}`;
  ctx.letterSpacing = "0px";
  ctx.fillStyle = C.ink;
  let line = "", yy = y;
  for (const word of s.split(" ")) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > w && line) { ctx.fillText(line, x, yy); line = word; yy += lh; } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
  ctx.restore();
}
