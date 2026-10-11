// Subtitle layer driven by the word timings. Sentence case, max two lines, one highlight.
import { C, F, W, font } from "../core/brand";
import { allWords } from "../core/words";
import { clamp, outCubic, rgba } from "../core/ease";
import { rr } from "../core/draw";
import type { Ctx } from "../core/draw";

// [caption text, highlighted phrase]
const CHUNKS: [string, string][] = [
  ["Stop running ads.", "Stop running ads."],
  ["Not until you fix this.", "fix this."],
  ["Leads go cold.", "cold."],
  ["Follow up is slow.", "slow."],
  ["Visitors leave without buying.", "leave"],
  ["Search can't find you.", "can't find you."],
  ["And none of your tools talk to each other.", "talk to each other."],
  ["Every gap is money walking out the door.", "money"],
  ["You don't have a marketing problem.", "marketing"],
  ["You have a growth system problem.", "growth system"],
  ["Madvert Labs fixes the system.", "fixes the system."],
  ["We build brands people remember.", "remember."],
  ["We bring in demand from Meta, Google, SEO and AI search.", "demand"],
  ["We turn attention into booked calls", "booked calls"],
  ["with websites and funnels that convert.", "convert."],
  ["Our studio makes ads people actually stop for.", "stop for."],
  ["Then every lead gets an instant reply,", "instant reply,"],
  ["qualified by AI, booked and tracked.", "qualified by AI,"],
  ["Automatically.", "Automatically."],
  ["And when growth needs technology?", "technology?"],
  ["We build it.", "We build it."],
  ["One partner. One system.", "One system."],
  ["No gaps. No excuses.", "No excuses."],
  ["Book your Business Strategy Call", "Business Strategy Call"],
  ["at madvertlabs.com", "madvertlabs.com"],
  ["Madvert Labs.", ""],
  ["Beyond advertising. We build growth systems.", "growth systems."],
];

type Cue = { text: string; hi: string; s: number; e: number };
let CUES: Cue[] | null = null;

function build(): Cue[] {
  const words = allWords();
  const out: Cue[] = [];
  let k = 0;
  for (const [txt, hi] of CHUNKS) {
    const n = txt.split(/\s+/).length;
    const ws = words.slice(k, k + n);
    k += n;
    out.push({ text: txt, hi, s: ws[0].s - 0.08, e: ws[ws.length - 1].e + 0.45 });
  }
  for (let i = 0; i < out.length - 1; i++) out[i].e = Math.min(out[i].e, out[i + 1].s - 0.02);
  return out;
}

const SIZE = 34;
const Y = 1002;

export function subtitles(ctx: Ctx, t: number, theme: "light" | "dark" | "hide" = "light") {
  if (theme === "hide") return;
  CUES ??= build();
  const c = CUES.find((q) => t >= q.s && t < q.e);
  if (!c) return;
  const pin = outCubic(clamp((t - c.s) / 0.22));
  const pout = clamp((c.e - t) / 0.14);
  const a = Math.min(pin, pout);
  const dy = (1 - pin) * 7;

  ctx.save();
  ctx.font = font(600, SIZE, F.body);
  ctx.letterSpacing = "0px";
  // split into words, mark highlight range
  const words = c.text.split(" ");
  const hiWords = c.hi ? c.hi.split(" ") : [];
  let hiStart = -1;
  for (let i = 0; i + hiWords.length <= words.length && hiWords.length; i++) {
    if (hiWords.every((h, k) => words[i + k] === h)) { hiStart = i; break; }
  }
  const space = ctx.measureText(" ").width;
  const ww = words.map((w) => ctx.measureText(w).width);
  // wrap to max two lines
  const maxW = 1240;
  const linesIdx: number[][] = [[]];
  let lw = 0;
  words.forEach((w, i) => {
    const add = ww[i] + (linesIdx[linesIdx.length - 1].length ? space : 0);
    if (lw + add > maxW && linesIdx.length < 2) { linesIdx.push([]); lw = 0; }
    linesIdx[linesIdx.length - 1].push(i);
    lw += ww[i] + space;
  });
  const lineH = SIZE * 1.3;
  const widths = linesIdx.map((L) => L.reduce((s, i) => s + ww[i], 0) + space * (L.length - 1));
  const boxW = Math.max(...widths) + 56, boxH = lineH * linesIdx.length + 22;
  const bx = W / 2 - boxW / 2, by = Y - boxH + 14 + dy;
  ctx.globalAlpha = a;
  const dark = theme === "dark";
  ctx.shadowColor = dark ? "rgba(0,0,0,0.3)" : "rgba(20,60,120,0.12)";
  ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
  rr(ctx, bx, by, boxW, boxH, 16);
  ctx.fillStyle = dark ? "rgba(10,15,28,0.72)" : "rgba(255,255,255,0.86)";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = 1;
  ctx.strokeStyle = dark ? "rgba(255,255,255,0.12)" : "rgba(160,190,225,0.5)";
  ctx.stroke();
  linesIdx.forEach((L, li) => {
    let x = W / 2 - widths[li] / 2;
    const y = by + 11 + lineH * (li + 1) - SIZE * 0.36;
    for (const i of L) {
      const hi = hiStart >= 0 && i >= hiStart && i < hiStart + hiWords.length;
      ctx.fillStyle = hi ? (dark ? C.cyan : C.blue) : dark ? "#fff" : C.navy;
      ctx.fillText(words[i], x, y);
      x += ww[i] + space;
    }
  });
  ctx.restore();
}

export function resetSubtitles() { CUES = null; }
export { rgba };
