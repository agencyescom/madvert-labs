// Frame compositor: picks the plate(s) for time t, applies the transition, then overlays
// subtitles. Every frame is a pure function of t.
import { W, H } from "./core/brand";
import { clamp, inOutCubic, inOutExpo, outExpo } from "./core/ease";
import { scratch } from "./core/assets";
import { streak } from "./core/draw";
import { subtitles } from "./components/subtitles";
import { timeline } from "./timeline";
import type { Scene } from "./core/scene";
import type { Ctx } from "./core/draw";

let SCENES: Scene[] | null = null;
export const scenes = () => (SCENES ??= timeline());
export const resetScenes = () => (SCENES = null);

export type RenderOpts = { subtitles?: boolean };

export function renderFrame(ctx: Ctx, t: number, o: RenderOpts = {}) {
  const S = scenes();
  let i = S.findIndex((s) => t >= s.start && t < s.end);
  if (i < 0) i = t < S[0].start ? 0 : S.length - 1;
  const cur = S[i];
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  const tr = cur.in;
  const lt = t - cur.start;
  if (tr && i > 0 && lt < tr.dur && tr.type !== "cut") {
    const prev = S[i - 1];
    const p = clamp(lt / tr.dur);
    transition(ctx, tr.type, p, prev, cur, t);
  } else {
    cur.draw(ctx, t);
  }
  ctx.restore();
  if (o.subtitles !== false) {
    ctx.save();
    subtitles(ctx, t, cur.subs ?? "light");
    ctx.restore();
  }
}

function layer(scene: Scene, t: number) {
  const c = scratch("layer-" + scene.id, W, H);
  const x = c.getContext("2d");
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1;
  x.clearRect(0, 0, W, H);
  scene.draw(x, t);
  return c;
}

function transition(ctx: Ctx, type: string, p: number, prev: Scene, cur: Scene, t: number) {
  switch (type) {
    case "swipe": {
      const e = inOutExpo(p);
      const edge = W * (1 - e);
      const slant = 160;
      ctx.save();
      ctx.translate(-e * 260, 0);
      prev.draw(ctx, t);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(edge + slant, 0); ctx.lineTo(W + slant + 400, 0); ctx.lineTo(W + 400, H); ctx.lineTo(edge - slant, H); ctx.closePath();
      ctx.clip();
      ctx.translate((1 - e) * 260, 0);
      cur.draw(ctx, t);
      ctx.restore();
      streak(ctx, edge, Math.sin(p * Math.PI), -Math.atan2(2 * slant, H));
      break;
    }
    case "wipeUp": {
      const e = inOutExpo(p);
      const edge = H * (1 - e);
      ctx.save(); ctx.translate(0, -e * 160); prev.draw(ctx, t); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(0, edge, W, H - edge + 2); ctx.clip();
      ctx.translate(0, (1 - e) * 160); cur.draw(ctx, t); ctx.restore();
      ctx.save(); ctx.translate(W / 2, edge); ctx.rotate(Math.PI / 2); ctx.translate(-W / 2, -H / 2);
      streak(ctx, W / 2, Math.sin(p * Math.PI), 0); ctx.restore();
      break;
    }
    case "fade": {
      prev.draw(ctx, t);
      const c = layer(cur, t);
      ctx.globalAlpha = inOutCubic(p);
      ctx.drawImage(c, 0, 0, W, H);
      ctx.globalAlpha = 1;
      break;
    }
    case "zoom": {
      // previous plate pushes in and dissolves into the next, which settles from 1.06
      const e = inOutCubic(p);
      const a = layer(prev, t);
      ctx.save();
      const s0 = 1 + e * 0.12;
      ctx.translate(W / 2, H / 2); ctx.scale(s0, s0); ctx.translate(-W / 2, -H / 2);
      ctx.drawImage(a, 0, 0, W, H);
      ctx.restore();
      const b = layer(cur, t);
      ctx.save();
      ctx.globalAlpha = e;
      const s1 = 1.06 - 0.06 * outExpo(p);
      ctx.translate(W / 2, H / 2); ctx.scale(s1, s1); ctx.translate(-W / 2, -H / 2);
      ctx.drawImage(b, 0, 0, W, H);
      ctx.restore();
      break;
    }
    case "flash": {
      // quick white light flash between two plates
      if (p < 0.5) prev.draw(ctx, t); else cur.draw(ctx, t);
      ctx.fillStyle = `rgba(255,255,255,${Math.sin(p * Math.PI) * 0.95})`;
      ctx.fillRect(0, 0, W, H);
      break;
    }
    default:
      cur.draw(ctx, t);
  }
}
