// 02 PROBLEM CASCADE: five pain points, each shown working (badly) in live UI.
import { C, F, W, H } from "../core/brand";
import { background, card, chip, text, eyebrow, icon, rr, glow, lineChart } from "../core/draw";
import { clamp, ep, outBack, outCubic, outExpo, prog, inOutCubic, inCubic, rgba, hash, lerp, mixColor, inOutExpo } from "../core/ease";
import { ws, we, phrase } from "../core/words";
import { kline, shake } from "../components/kinetic";
import { avatar, browser, lines, button, mixHex } from "../components/ui";
import { ribbon } from "../components/ribbon";

const PX = 900, PY = 150, PW = 900, PH = 680; // panel area

export function drawProblems(ctx: any, t: number) {
  const beats = [
    ws("leads go cold"), ws("follow up is slow"), ws("visitors leave"), ws("search can't"), ws("and none of"),
  ];
  const end = ws("every gap") - 0.12;
  background(ctx, t, { grid: 0.6 });
  let k = 0;
  for (let i = 0; i < beats.length; i++) if (t >= beats[i] - 0.15) k = i;
  const b0 = beats[k], b1 = k < 4 ? beats[k + 1] : end;
  const lt = t - b0;

  // progress rail
  for (let i = 0; i < 5; i++) {
    const on = i <= k;
    rr(ctx, 140 + i * 64, 250, 52, 6, 3);
    ctx.fillStyle = on ? (i === k ? C.red : rgba(C.red, 0.35)) : "#D9E2EE";
    ctx.fill();
  }
  eyebrow(ctx, `Leak 0${k + 1} / 05`, 140, 225, 1, C.red);

  // panel: slide transition between beats
  const pIn = ep(t, b0 - 0.15, 0.5, inOutExpo);
  const pOut = k < 4 ? ep(t, b1 - 0.2, 0.35, inCubic) : 0;
  ctx.save();
  ctx.translate(0, (1 - pIn) * 120 - pOut * 120);
  ctx.globalAlpha = Math.min(pIn, 1 - pOut);
  [leadCold, slowFollow, visitorsLeave, searchHidden, toolsSplit][k](ctx, t, lt, b1 - b0);
  ctx.restore();

  // headline per beat
  const sz = 100;
  const Y1 = 470, Y2 = 590;
  const o = b1 - 0.22;
  if (k === 0) {
    kline(ctx, t, { x: 140, y: Y1, size: sz, words: [{ s: "LEADS", t: ws("leads"), out: o }] });
    kline(ctx, t, { x: 140, y: Y2, size: sz, words: [{ s: "GO", t: ws("go"), out: o }, { s: "COLD.", t: ws("cold"), out: o, grey: ws("cold") + 0.1, color: C.blue }] });
  } else if (k === 1) {
    kline(ctx, t, { x: 140, y: Y1, size: sz, words: [{ s: "FOLLOW", t: ws("follow"), out: o }, { s: "UP", t: ws("up"), out: o }] });
    kline(ctx, t, { x: 140, y: Y2, size: sz, words: [{ s: "IS", t: ws("slow") + 0.25, anim: "late", dur: 0.8, out: o }, { s: "SLOW.", t: ws("slow") + 0.45, anim: "late", dur: 0.9, out: o, color: C.red }] });
  } else if (k === 2) {
    kline(ctx, t, { x: 140, y: Y1, size: sz, words: [{ s: "VISITORS", t: ws("visitors"), out: o }] });
    kline(ctx, t, { x: 140, y: Y2, size: sz, words: [{ s: "LEAVE.", t: ws("leave"), out: we("buying") - 0.1, outAnim: "slideR", outDur: 0.5, color: C.red }] });
    kline(ctx, t, { x: 144, y: 670, size: 40, weight: 600, color: C.slate, family: F.body, ls: 0, words: [{ s: "without", t: ws("without"), anim: "blur", out: o }, { s: "buying.", t: ws("buying"), anim: "blur", out: o }] });
  } else if (k === 3) {
    kline(ctx, t, { x: 140, y: Y1, size: sz, words: [{ s: "SEARCH", t: ws("search"), out: o }] });
    kline(ctx, t, { x: 140, y: Y2, size: sz, words: [{ s: "CAN'T", t: ws("can't"), out: o }, { s: "FIND", t: ws("find"), out: o }] });
    const ghost = 1 - 0.75 * ep(t, ws("you", 1) + 0.25, 0.6, outCubic);
    ctx.save(); ctx.globalAlpha *= ghost;
    kline(ctx, t, { x: 140, y: 710, size: sz, words: [{ s: "YOU.", t: ws("you", 1), out: o, color: C.red }] });
    ctx.restore();
  } else {
    const sp = ws("talk") + 0.05;
    kline(ctx, t, { x: 140, y: Y1, size: sz, words: [{ s: "YOUR", t: ws("your"), out: sp, outAnim: "split", outDur: 0.9 }, { s: "TOOLS", t: ws("tools"), out: sp, outAnim: "split", outDur: 0.9 }] });
    kline(ctx, t, { x: 140, y: Y2, size: sz, words: [{ s: "DON'T", t: ws("talk"), out: sp + 0.15, outAnim: "split", outDur: 0.9, color: C.red }, { s: "TALK.", t: ws("talk") + 0.12, out: sp + 0.15, outAnim: "split", outDur: 0.9, color: C.red }] });
  }
}

// ---- beat 1: lead goes cold
function leadCold(ctx: any, t: number, lt: number, d: number) {
  const cool = ep(t, ws("cold"), 0.9, inOutCubic);
  const x = PX + 120, y = PY + 140, w = 660, h = 330;
  card(ctx, x, y, w, h, { r: 22 });
  // frost tint
  ctx.save();
  rr(ctx, x, y, w, h, 22);
  ctx.fillStyle = rgba("#CFE3F7", 0.45 * cool); ctx.fill();
  ctx.restore();
  avatar(ctx, x + 70, y + 76, 38, "DR", mixHex(C.blue, "#AFC0D4", cool));
  text(ctx, "Daniel R.", x + 130, y + 70, { size: 32, weight: 700, color: mixColor(C.navy, "#7D8DA3", cool) });
  text(ctx, "New enquiry · Website form", x + 130, y + 104, { size: 20, weight: 500, color: C.slate });
  const hot = cool < 0.5;
  chip(ctx, hot ? "HOT" : "COLD", x + w - 150, y + 50, { size: 20, fg: hot ? "#B4570B" : "#47617F", bg: hot ? rgba(C.amber, 0.18) : rgba("#7FA6CF", 0.2), dot: hot ? C.amber : "#7FA6CF" });
  // intent meter draining
  text(ctx, "Buying intent", x + 40, y + 182, { size: 18, weight: 600, color: C.slate });
  rr(ctx, x + 40, y + 198, w - 80, 14, 7); ctx.fillStyle = "#E6EDF6"; ctx.fill();
  const lvl = lerp(0.92, 0.12, cool);
  rr(ctx, x + 40, y + 198, (w - 80) * lvl, 14, 7);
  ctx.fillStyle = mixHex(C.amber, "#9DB4CF", cool); ctx.fill();
  // waiting timer
  const days = Math.min(3, Math.floor(lt * 2.2));
  icon(ctx, "calendar", x + 40, y + 248, 30, C.slate);
  text(ctx, days === 0 ? "Last contact: today" : `No reply for ${days} day${days > 1 ? "s" : ""}`, x + 84, y + 271, { size: 22, weight: 600, color: days ? C.red : C.slate });
  // snow-like cold particles
  for (let i = 0; i < 26; i++) {
    const px = x + hash(i) * w, py = y - 40 + ((hash(i + 9) * 400 + lt * 60 * (0.5 + hash(i + 3))) % (h + 80));
    ctx.beginPath(); ctx.arc(px, py, 2 + hash(i + 5) * 2.5, 0, 7);
    ctx.fillStyle = rgba("#9CC3EA", 0.5 * cool); ctx.fill();
  }
}

// ---- beat 2: slow follow up
function slowFollow(ctx: any, t: number, lt: number, d: number) {
  const x = PX + 100, y = PY + 60, w = 700, h = 560;
  card(ctx, x, y, w, h, { r: 22 });
  rr(ctx, x, y, w, 76, 22); ctx.save(); ctx.clip(); ctx.fillStyle = "#F3F7FC"; ctx.fillRect(x, y, w, 76); ctx.restore();
  avatar(ctx, x + 44, y + 38, 20, "DR", C.slate);
  text(ctx, "Daniel R.", x + 76, y + 46, { size: 22, weight: 700 });
  // incoming message
  const m1 = ep(t, ws("follow") + 0.05, 0.4, outBack);
  bubble(ctx, x + 36, y + 110, "Hi — can I get a quote for this week?", "9:02 AM", false, m1);
  // typing dots that go on and on
  const typing = lt > 0.5 && t < ws("slow") + 0.6;
  if (typing) {
    rr(ctx, x + w - 150, y + 230, 110, 52, 26); ctx.fillStyle = "#E8F2FF"; ctx.fill();
    for (let i = 0; i < 3; i++) {
      const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 7 - i * 0.8));
      ctx.beginPath(); ctx.arc(x + w - 120 + i * 24, y + 256, 6, 0, 7); ctx.fillStyle = rgba(C.blue, a); ctx.fill();
    }
  }
  // clock jump
  const cj = ep(t, ws("slow") - 0.1, 0.6, outExpo);
  if (cj > 0) {
    chip(ctx, "2 days later", x + w / 2 - 80, y + 320, { size: 18, fg: C.red, bg: rgba(C.red, 0.1), alpha: cj });
  }
  const m2 = ep(t, ws("slow") + 0.6, 0.45, outBack);
  bubble(ctx, x + w - 36, y + 390, "Sorry for the late reply!", "Wed 4:47 PM", true, m2);
  const seen = ep(t, ws("slow") + 1.0, 0.4);
  if (seen > 0) text(ctx, "Lead already booked elsewhere", x + 36, y + h - 34, { size: 19, weight: 600, color: C.red, alpha: seen });
}
function bubble(ctx: any, x: number, y: number, msg: string, time: string, me: boolean, p: number) {
  if (p <= 0) return;
  ctx.save();
  ctx.font = `500 22px ${F.body}`;
  const w = ctx.measureText(msg).width + 48, h = 64;
  const bx = me ? x - w : x;
  ctx.globalAlpha *= clamp(p * 2);
  ctx.translate(bx + (me ? w : 0), y + h); ctx.scale(lerp(0.7, 1, p), lerp(0.7, 1, p)); ctx.translate(-(bx + (me ? w : 0)), -(y + h));
  rr(ctx, bx, y, w, h, 22);
  ctx.fillStyle = me ? C.blue : "#EEF3F9"; ctx.fill();
  text(ctx, msg, bx + 24, y + 40, { size: 22, weight: 500, color: me ? "#fff" : C.ink });
  text(ctx, time, me ? bx + w : bx, y + h + 24, { size: 15, weight: 500, color: C.mute, align: me ? "right" : "left" });
  ctx.restore();
}

// ---- beat 3: visitors leave without buying
function visitorsLeave(ctx: any, t: number, lt: number, d: number) {
  const r = browser(ctx, PX + 60, PY + 40, 780, 560, "yourbusiness.com");
  const cx = r.x + 40;
  rr(ctx, cx, r.y + 40, 300, 22, 8); ctx.fillStyle = C.ink; ctx.fill();
  lines(ctx, cx, r.y + 90, 360, 3, { gap: 22 });
  rr(ctx, r.x + 440, r.y + 30, 300, 210, 14); ctx.fillStyle = "#E4EEF9"; ctx.fill();
  icon(ctx, "store", r.x + 560, r.y + 105, 60, "#9FB7D3");
  button(ctx, cx, r.y + 180, 220, 54, "Add to cart", { size: 19 });
  // cart status
  text(ctx, "Checkouts today", r.x + 40, r.y + 320, { size: 18, weight: 600, color: C.slate });
  text(ctx, "0", r.x + 40, r.y + 380, { size: 54, weight: 800, family: F.head, color: C.red });
  // visitors stream in and bounce out
  for (let i = 0; i < 16; i++) {
    const st = i * 0.12;
    const q = (lt - st) / 1.4;
    if (q < 0 || q > 1) continue;
    const yy = r.y + 300 + (hash(i) - 0.5) * 140;
    const px = lerp(PX - 60, r.x + 380, outCubic(Math.min(1, q * 1.8)));
    const back = q > 0.55 ? inCubic((q - 0.55) / 0.45) : 0;
    const x = px + back * 900;
    const y = yy - back * 160 * (hash(i + 4) - 0.3);
    ctx.save();
    ctx.globalAlpha = 1 - back;
    ctx.beginPath(); ctx.arc(x, y, 11, 0, 7);
    ctx.fillStyle = back > 0 ? C.red : C.elec; ctx.fill();
    ctx.restore();
  }
  const ex = ep(t, ws("leave") + 0.2, 0.4, outBack);
  chip(ctx, "Bounce →", r.x + r.w - 170, r.y + 300, { size: 18, fg: C.red, bg: rgba(C.red, 0.1), alpha: ex });
}

// ---- beat 4: search can't find you
function searchHidden(ctx: any, t: number, lt: number, d: number) {
  const x = PX + 80, y = PY + 30, w = 740;
  card(ctx, x, y, w, 620, { r: 22 });
  rr(ctx, x + 30, y + 30, w - 60, 64, 32); ctx.fillStyle = "#F2F6FB"; ctx.fill();
  icon(ctx, "search", x + 54, y + 50, 26, C.slate);
  const q = "commercial cleaning near me";
  const n = Math.floor(clamp(lt / 0.6) * q.length);
  text(ctx, q.slice(0, n) + (lt < 0.7 && Math.floor(t * 4) % 2 ? "|" : ""), x + 96, y + 72, { size: 23, weight: 500, color: C.ink });
  const sink = ep(t, ws("find") , 1.2, inOutCubic);
  for (let i = 0; i < 5; i++) {
    const ry = y + 130 + i * 92;
    const a = ep(t, ws("search") + 0.5 + i * 0.06, 0.35);
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha *= a;
    rr(ctx, x + 30, ry, w - 60, 78, 12); ctx.fillStyle = "#FAFCFE"; ctx.fill();
    text(ctx, `competitor-${["one", "two", "three", "four", "five"][i]}.com`, x + 54, ry + 30, { size: 16, weight: 500, color: "#0F8A4C" });
    rr(ctx, x + 54, ry + 44, 360 - i * 30, 14, 7); ctx.fillStyle = "#3D6FD1"; ctx.globalAlpha *= 0.55; ctx.fill();
    ctx.restore();
  }
  // your listing sinks to page 4
  const yy = lerp(y + 130 + 5 * 92 - 10, y + 760, sink);
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y + 100, w, 520); ctx.clip();
  ctx.globalAlpha = 1 - sink * 0.7;
  rr(ctx, x + 30, yy, w - 60, 78, 12);
  ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = rgba(C.blue, 0.6); ctx.lineWidth = 2; ctx.stroke();
  text(ctx, "yourbusiness.com", x + 54, yy + 30, { size: 16, weight: 600, color: C.blue });
  text(ctx, "Your Business — Commercial Cleaning", x + 54, yy + 58, { size: 20, weight: 700, color: C.ink });
  ctx.restore();
  const pg = ep(t, ws("find") + 0.6, 0.4, outBack);
  chip(ctx, "Your listing: page 4", x + w - 270, y + 570, { size: 18, fg: C.red, bg: rgba(C.red, 0.1), alpha: pg });
}

// ---- beat 5: tools don't talk
const TOOLS = [
  ["CRM", "user"], ["Ads", "target"], ["Website", "globe"], ["Email", "mail"], ["Calendar", "calendar"], ["Chat", "chat"],
];
function toolsSplit(ctx: any, t: number, lt: number, d: number) {
  const brk = ep(t, ws("talk") - 0.1, 0.9, inOutCubic);
  const cx = PX + 450, cy = PY + 340;
  const pos = TOOLS.map((_, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const bx = cx + (col - 1) * 250, by = cy + (row - 0.5) * 220;
    const ang = Math.atan2(by - cy, bx - cx);
    return [bx + Math.cos(ang) * brk * 60 + (hash(i) - 0.5) * 30 * brk, by + Math.sin(ang) * brk * 50];
  });
  // links
  const links = [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4], [2, 5]];
  const la = ep(t, ws("tools") + 0.05, 0.4);
  links.forEach(([a, b], i) => {
    const [ax, ay] = pos[a], [bx, by] = pos[b];
    if (la <= 0) return;
    const gap = brk * 0.28;
    ctx.save();
    ctx.globalAlpha *= la;
    ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.strokeStyle = brk > 0.2 ? rgba(C.red, 0.55) : rgba(C.elec, 0.8);
    const seg = (u0: number, u1: number) => { ctx.beginPath(); ctx.moveTo(lerp(ax, bx, u0), lerp(ay, by, u0)); ctx.lineTo(lerp(ax, bx, u1), lerp(ay, by, u1)); ctx.stroke(); };
    if (gap > 0.01) { ctx.setLineDash([2, 10]); seg(0, 0.5 - gap); seg(0.5 + gap, 1); } else seg(0, 1);
    ctx.restore();
    if (brk > 0.3) {
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      ctx.save(); ctx.globalAlpha = clamp((brk - 0.3) * 3);
      ctx.strokeStyle = C.red; ctx.lineWidth = 3.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(mx - 9, my - 9); ctx.lineTo(mx + 9, my + 9); ctx.moveTo(mx + 9, my - 9); ctx.lineTo(mx - 9, my + 9); ctx.stroke();
      ctx.restore();
    }
  });
  TOOLS.forEach(([name, ic], i) => {
    const [x, y] = pos[i];
    const a = ep(t, ws("tools") - 0.3 + i * 0.05, 0.4, outBack);
    ctx.save();
    ctx.globalAlpha *= clamp(a * 2);
    ctx.translate(x, y); ctx.rotate((hash(i + 2) - 0.5) * 0.12 * brk); ctx.scale(lerp(0.7, 1, a), lerp(0.7, 1, a));
    card(ctx, -90, -70, 180, 140, { r: 20 });
    icon(ctx, ic, -22, -46, 44, brk > 0.5 ? "#9FB2C8" : C.blue);
    text(ctx, name, 0, 40, { size: 22, weight: 700, align: "center", color: C.ink });
    ctx.restore();
  });
}
