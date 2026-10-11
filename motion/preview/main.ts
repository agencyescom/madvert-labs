// Live preview: same renderFrame() as the offline renderer, drawn into a browser canvas.
import { DURATION, FPS } from "../src/core/brand";
import { setWords } from "../src/core/words";
import { setHost, IMAGES, videoFrameIndex, videoFramePath } from "../src/core/assets";
import { renderFrame, scenes } from "../src/compose";
import words from "../data/words.json";

setWords(words as any);
const images: Record<string, HTMLImageElement> = {};
const frames = new Map<string, HTMLImageElement>();
const canv = new Map<string, HTMLCanvasElement>();
const load = (src: string) => { const i = new Image(); i.src = "/assets/" + src; return i; };
for (const [k, p] of Object.entries(IMAGES)) images[k] = load(p);
setHost({
  img: (k) => (images[k]?.complete ? images[k] : undefined),
  video: (k, t) => {
    const p = videoFramePath(k, videoFrameIndex(k, t));
    let i = frames.get(p);
    if (!i) { i = load(p); frames.set(p, i); }
    return i.complete ? i : undefined;
  },
  canvas: (k, w, h) => {
    let c = canv.get(k);
    if (!c) { c = document.createElement("canvas"); c.width = w; c.height = h; canv.set(k, c); }
    return c;
  },
});

const c = document.getElementById("c") as HTMLCanvasElement;
const ctx = c.getContext("2d")!;
const scrub = document.getElementById("scrub") as HTMLInputElement;
const audio = new Audio("/audio/preview-mix.wav");
let t = Number(new URLSearchParams(location.search).get("t") ?? 0);
let playing = false, subs = true, last = performance.now();

function frame(now: number) {
  if (playing) { t = audio.currentTime || t + (now - last) / 1000; if (t >= DURATION) { playing = false; audio.pause(); } }
  last = now;
  renderFrame(ctx, t, { subtitles: subs });
  scrub.value = String(t);
  (document.getElementById("tc") as HTMLElement).textContent = t.toFixed(2);
  (document.getElementById("sc") as HTMLElement).textContent = scenes().find((s) => t >= s.start && t < s.end)?.id ?? "";
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
const seek = (v: number) => { t = Math.max(0, Math.min(DURATION, v)); audio.currentTime = t; };
scrub.oninput = () => seek(Number(scrub.value));
addEventListener("keydown", (e) => {
  if (e.key === " ") { playing = !playing; audio.currentTime = t; playing ? audio.play() : audio.pause(); e.preventDefault(); }
  if (e.key === "ArrowRight") seek(t + (e.shiftKey ? 5 : 1));
  if (e.key === "ArrowLeft") seek(t - (e.shiftKey ? 5 : 1));
  if (e.key === ".") seek(t + 1 / FPS);
  if (e.key === ",") seek(t - 1 / FPS);
  if (e.key === "s") subs = !subs;
  const S = scenes(), i = S.findIndex((s) => t >= s.start && t < s.end);
  if (e.key === "]" && i < S.length - 1) seek(S[i + 1].start);
  if (e.key === "[") seek(S[Math.max(0, t - S[i].start < 0.3 ? i - 1 : i)].start);
});
