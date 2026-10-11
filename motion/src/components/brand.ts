// Official Madvert Labs logo (supplied PNGs, never redrawn) plus orb activation pulse.
import { C } from "../core/brand";
import { img } from "../core/assets";
import { orb } from "../core/draw";

// orb centre within logo-light(-descriptor).png (1206 px wide), measured from the file
const ORB = { x: 318, y: 117, r: 27 };

/** Draws the logo centred at (cx, top) with width w. reveal 0..1 wipes left->right. Returns orb pos. */
export function logo(ctx: any, cx: number, top: number, w: number, o: { desc?: boolean; reveal?: number; pulse?: number; alpha?: number } = {}) {
  const im = img(o.desc ? "logoDesc" : "logo");
  if (!im) return { x: cx, y: top, r: 10 };
  const s = w / im.width, h = im.height * s, x = cx - w / 2;
  const rv = o.reveal ?? 1;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (rv < 1) { ctx.beginPath(); ctx.rect(x - 20, top - 20, (w + 40) * rv, h + 40); ctx.clip(); }
  ctx.drawImage(im, x, top, w, h);
  ctx.restore();
  const p = { x: x + ORB.x * s, y: top + ORB.y * s, r: ORB.r * s };
  if ((o.pulse ?? 0) > 0 && (o.pulse ?? 0) < 1) orb(ctx, p.x, p.y, p.r, o.pulse, 1 - (o.pulse ?? 0) * 0.3);
  return p;
}
export { C };
