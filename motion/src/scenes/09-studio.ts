// 09 STUDIO: "Our studio makes ads people actually stop for."
// Boring ad -> premium ad (before/after), camera pulls back to a moving wall of
// studio work, which freezes dead on the word "stop".
import { C, F, W, H } from "../core/brand";
import { background, card, chip, text, rr, cover, cursor, streak, icon } from "../core/draw";
import { clamp, ep, outExpo, inOutExpo, inOutCubic, prog, lerp, outBack, rgba, outCubic } from "../core/ease";
import { ws, we } from "../core/words";
import { img, video } from "../core/assets";
import { kline, shake } from "../components/kinetic";

const TW = 560, TH = 373, GAP = 26;
const ROW_Y = [92, 92 + TH + GAP];
type Tile = { k: string; v?: boolean; crop?: [number, number, number, number]; fx?: number; fy?: number };
const CAR: Tile = { k: "car", v: true, crop: [100, 0, 1080, 720] };
const TH_: Tile = { k: "talking-head", v: true, crop: [0, 100, 720, 1080], fy: 0.25 };
const WATCH: Tile = { k: "watch", v: true };
const ROWS: Tile[][] = [
  [{ k: "s05" }, CAR, { k: "s07", fx: 0.62 }, TH_, { k: "s01" }, { k: "s04" }],
  [{ k: "s04" }, WATCH, { k: "s01" }, { k: "s05" }, CAR, TH_],
];
const HERO_ROW = 0, HERO_IDX = 2;

export function drawStudio(ctx: any, t: number) {
  const t0 = ws("our studio") - 0.3;
  const tSwap = ws("studio") + 0.1;
  const tPull = ws("ads", 1) - 0.15;
  const tStop = ws("stop", 1);
  const [sx, sy] = shake(t, tStop, 12);
  ctx.save();
  ctx.translate(sx, sy);
  if (t < tSwap) boring(ctx, t, t0, tSwap);
  else wall(ctx, t, tSwap, tPull, tStop);
  // swap flash + streak
  const f = prog(t, tSwap - 0.06, tSwap + 0.22);
  if (f > 0 && f < 1) {
    ctx.fillStyle = `rgba(255,255,255,${Math.sin(f * Math.PI) * 0.8})`;
    ctx.fillRect(0, 0, W, H);
    streak(ctx, lerp(-200, W + 200, inOutExpo(f)), 1, 0.25);
  }
  ctx.restore();
}

function boring(ctx: any, t: number, t0: number, tSwap: number) {
  background(ctx, t, { grid: 0.3, glowA: 0.3 });
  ctx.fillStyle = "rgba(225,228,232,0.6)"; ctx.fillRect(0, 0, W, H);
  const p = ep(t, t0, 0.35, outExpo);
  const w = 1100, h = 733, x = W / 2 - w / 2, y = 120 + (1 - p) * 40;
  ctx.save();
  ctx.globalAlpha *= p;
  card(ctx, x, y, w, h, { r: 10, shadow: 0.3 });
  rr(ctx, x, y, w, h, 10); ctx.save(); ctx.clip(); cover(ctx, img("s06"), x, y, w, h); ctx.restore();
  chip(ctx, "BEFORE", x + 24, y + 24, { size: 18, fg: "#fff", bg: "rgba(10,15,28,0.75)" });
  // skip button + cursor drifting to it
  rr(ctx, x + w - 210, y + h - 90, 180, 58, 8); ctx.fillStyle = "rgba(10,15,28,0.78)"; ctx.fill();
  text(ctx, "Skip ad  ›", x + w - 120, y + h - 52, { size: 22, weight: 600, color: "#fff", align: "center" });
  const c = ep(t, t0 + 0.1, 0.45, inOutCubic);
  cursor(ctx, lerp(x + w - 420, x + w - 110, c), lerp(y + h - 220, y + h - 60, c), prog(t, t0 + 0.5, t0 + 0.8));
  ctx.restore();
}

function tileDraw(ctx: any, T: Tile, x: number, y: number, t: number, frozen: number) {
  rr(ctx, x, y, TW, TH, 18);
  ctx.save();
  ctx.clip();
  const im = T.v ? video(T.k, frozen) : img(T.k);
  if (im) cover(ctx, im, x, y, TW, TH, T.fx ?? 0.5, T.fy ?? 0.5, 1.04, T.crop);
  else { ctx.fillStyle = "#DCE6F2"; ctx.fillRect(x, y, TW, TH); }
  // light sweep across each tile
  const sw = ((t * 0.35 + x * 0.0007) % 1.6) - 0.3;
  const g = ctx.createLinearGradient(x + sw * TW - 120, y, x + sw * TW + 120, y + TH);
  g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,0.16)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(x, y, TW, TH);
  ctx.restore();
  if (T.v) {
    ctx.save();
    rr(ctx, x + 18, y + 18, 70, 30, 15); ctx.fillStyle = "rgba(10,15,28,0.55)"; ctx.fill();
    icon(ctx, "play", x + 26, y + 24, 18, "#fff");
    text(ctx, "Video", x + 47, y + 39, { size: 13, weight: 700, color: "#fff" });
    ctx.restore();
  }
}

function wall(ctx: any, t: number, tSwap: number, tPull: number, tStop: number) {
  background(ctx, t, { grid: 0.4 });
  // marquee scroll that stops dead on "stop"
  const v = 120;
  const run = (tt: number) => (tt < tPull ? 0 : tt < tStop ? v * (tt - tPull) : v * (tStop - tPull) + v * 0.08 * (1 - Math.exp(-(tt - tStop) / 0.08)));
  const scroll = run(t);
  const clock = t < tStop ? t - tSwap : tStop - tSwap; // video clocks freeze too
  const rowX = (r: number) => (r === 0 ? -380 - scroll : -620 + scroll);
  // camera: starts with the hero tile filling the frame, pulls back to the wall
  const hx = rowX(HERO_ROW) + HERO_IDX * (TW + GAP) + TW / 2, hy = ROW_Y[HERO_ROW] + TH / 2;
  const k0 = Math.max(W / TW, H / TH) * 1.02;
  const pull = ep(t, tPull, 0.75, inOutExpo);
  const push = 1 + (t - tSwap) * 0.03;
  const k = lerp(k0 * push, 1, pull);
  const cx = lerp(hx, W / 2, pull), cy = lerp(hy, H / 2, pull);
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-cx, -cy);
  ROWS.forEach((row, r) => {
    row.forEach((T, i) => {
      const x = rowX(r) + i * (TW + GAP);
      if (x > W + 50 || x + TW < -50) { if (pull > 0.02) return; }
      ctx.save();
      ctx.shadowColor = "rgba(20,60,120,0.18)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
      rr(ctx, x, ROW_Y[r], TW, TH, 18); ctx.fillStyle = "#fff"; ctx.fill();
      ctx.restore();
      tileDraw(ctx, T, x, ROW_Y[r], t, clock + i * 0.7);
    });
  });
  ctx.restore();
  // "AFTER" tag while full-bleed
  const after = 1 - pull;
  if (after > 0.01) chip(ctx, "AFTER", 60, 60, { size: 20, fg: "#fff", bg: rgba(C.blue, 0.85), alpha: after * ep(t, tSwap + 0.1, 0.3) });

  // statement panel
  const pp = ep(t, tPull + 0.25, 0.5, outExpo);
  if (pp > 0) {
    const pw = 1180, ph = 330, px = W / 2 - pw / 2, py = H / 2 - ph / 2 - 20 + (1 - pp) * 40;
    ctx.save();
    ctx.globalAlpha *= pp;
    card(ctx, px, py, pw, ph, { r: 28, fill: "rgba(255,255,255,0.93)", shadow: 1 });
    ctx.restore();
    kline(ctx, t, {
      x: W / 2, y: py + 112, size: 66, align: "center", weight: 700, color: C.ink,
      words: [
        { s: "ADS", t: ws("ads", 1) }, { s: "PEOPLE", t: ws("people", 1) }, { s: "ACTUALLY", t: ws("actually") },
      ],
    });
    kline(ctx, t, {
      x: W / 2, y: py + 262, size: 150, align: "center",
      words: [{ s: "STOP", t: tStop, anim: "slam", grad: true }, { s: "FOR.", t: ws("for", 0), anim: "slam" }],
    });
  }
}
