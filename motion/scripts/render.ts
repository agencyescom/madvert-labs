// Offline renderer. Draws frames with Skia (@napi-rs/canvas), pipes raw RGBA to ffmpeg.
//
//   bun scripts/render.ts stills --t 1.2,14.5 [--out out/stills] [--subs 0]
//   bun scripts/render.ts video  [--samples 3] [--workers 4] [--crf 17] [--scale 1]
//                                [--from 0 --to 60.5] [--subs 0] [--out out/madvert-silent.mp4]
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { mkdirSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { W, H, FPS, DURATION } from "../src/core/brand";
import { setWords } from "../src/core/words";
import { setHost, IMAGES, VIDEOS, videoFrameIndex, videoFramePath } from "../src/core/assets";
import { renderFrame } from "../src/compose";

const ROOT = join(import.meta.dir, "..");
const A = join(ROOT, "assets");
const argv = process.argv.slice(2);
const mode = argv[0];
const arg = (k: string, d?: string) => {
  const i = argv.indexOf("--" + k);
  return i >= 0 ? argv[i + 1] : d;
};

// ---- fonts
for (const f of readdirSync(join(A, "fonts"))) {
  const fam = f.startsWith("Sora") ? "Sora" : f.startsWith("Inter") ? "Inter" : "JetBrains Mono";
  GlobalFonts.registerFromPath(join(A, "fonts", f), fam);
}

// ---- words
setWords(await Bun.file(join(ROOT, "data/words.json")).json());

// ---- assets
const images: Record<string, any> = {};
for (const [k, p] of Object.entries(IMAGES)) {
  if (existsSync(join(A, p))) images[k] = await loadImage(join(A, p));
}
const vcache = new Map<string, any>();
const misses = new Set<string>();
const canvases = new Map<string, any>();
setHost({
  img: (k) => images[k],
  video: (k, t) => {
    const p = videoFramePath(k, videoFrameIndex(k, t));
    const im = vcache.get(p);
    if (!im) misses.add(p);
    return im;
  },
  canvas: (k, w, h) => {
    let c = canvases.get(k);
    if (!c || c.width !== w * SCALE) { c = createCanvas(w * SCALE, h * SCALE); canvases.set(k, c); }
    const x = c.getContext("2d");
    x.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    return c;
  },
});
async function loadMisses() {
  for (const p of misses) vcache.set(p, await loadImage(join(A, p)));
  misses.clear();
  if (vcache.size > 400) {
    const keys = [...vcache.keys()].slice(0, vcache.size - 300);
    keys.forEach((k) => vcache.delete(k));
  }
}

const SCALE = Number(arg("scale", "1"));
const subs = arg("subs", "1") !== "0";
const canvas = createCanvas(W * SCALE, H * SCALE);
const ctx: any = canvas.getContext("2d");

async function draw(t: number) {
  for (let attempt = 0; attempt < 3; attempt++) {
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, W, H);
    renderFrame(ctx, t, { subtitles: subs });
    if (!misses.size) return;
    await loadMisses();
  }
}

/** Motion-blurred frame: average `samples` sub-frames across a 0.5 shutter. */
async function frameRGBA(f: number, samples: number): Promise<Uint8Array> {
  const t = f / FPS;
  if (samples <= 1) {
    await draw(t);
    return new Uint8Array(ctx.getImageData(0, 0, W * SCALE, H * SCALE).data.buffer);
  }
  const n = W * SCALE * H * SCALE * 4;
  const acc = new Uint16Array(n);
  for (let k = 0; k < samples; k++) {
    const st = t + ((k + 0.5) / samples - 0.5) * (0.5 / FPS);
    await draw(st);
    const d = ctx.getImageData(0, 0, W * SCALE, H * SCALE).data;
    for (let i = 0; i < n; i++) acc[i] += d[i];
  }
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = (acc[i] / samples + 0.5) | 0;
  return out;
}

if (mode === "stills") {
  const out = join(ROOT, arg("out", "out/stills")!);
  mkdirSync(out, { recursive: true });
  for (const ts of arg("t", "1")!.split(",")) {
    const t = Number(ts);
    await draw(t);
    const file = join(out, `t${t.toFixed(2).padStart(6, "0")}.png`);
    writeFileSync(file, await canvas.encode("png"));
    console.log(file);
  }
} else if (mode === "worker") {
  // internal: render frames [f0, f1) into a segment file
  const f0 = Number(arg("f0")), f1 = Number(arg("f1")), seg = arg("seg")!;
  const samples = Number(arg("samples", "3"));
  const ff = Bun.spawn(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba",
    "-s", `${W * SCALE}x${H * SCALE}`, "-r", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", arg("preset", "medium")!, "-crf", arg("crf", "17")!,
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", seg], { stdin: "pipe", stderr: "inherit" });
  const t0 = performance.now();
  for (let f = f0; f < f1; f++) {
    ff.stdin.write(await frameRGBA(f, samples));
    await ff.stdin.flush();
    if ((f - f0) % 60 === 0) {
      const el = (performance.now() - t0) / 1000;
      console.log(`[${f0}-${f1}] frame ${f} ${(el / Math.max(1, f - f0)).toFixed(3)}s/f`);
    }
  }
  ff.stdin.end();
  await ff.exited;
} else if (mode === "video") {
  const from = Number(arg("from", "0")), to = Number(arg("to", String(DURATION)));
  const workers = Number(arg("workers", "4"));
  const out = join(ROOT, arg("out", "out/madvert-silent.mp4")!);
  const tmp = join(ROOT, "out/segments");
  mkdirSync(tmp, { recursive: true });
  mkdirSync(dirname(out), { recursive: true });
  const F0 = Math.round(from * FPS), F1 = Math.round(to * FPS);
  const per = Math.ceil((F1 - F0) / workers);
  const segs: string[] = [];
  const procs = [];
  for (let w = 0; w < workers; w++) {
    const a = F0 + w * per, b = Math.min(F1, a + per);
    if (a >= b) break;
    const seg = join(tmp, `seg${w}.mp4`);
    segs.push(seg);
    procs.push(Bun.spawn(["bun", join(ROOT, "scripts/render.ts"), "worker", "--f0", String(a), "--f1", String(b),
      "--seg", seg, "--samples", arg("samples", "3")!, "--crf", arg("crf", "17")!, "--scale", String(SCALE),
      "--subs", subs ? "1" : "0", "--preset", arg("preset", "medium")!], { stdout: "inherit", stderr: "inherit" }));
  }
  const codes = await Promise.all(procs.map((p) => p.exited));
  if (codes.some((c) => c !== 0)) throw new Error("worker failed: " + codes);
  const list = join(tmp, "list.txt");
  writeFileSync(list, segs.map((s) => `file '${s}'`).join("\n"));
  const cat = Bun.spawnSync(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", out]);
  if (cat.exitCode !== 0) throw new Error(cat.stderr.toString());
  console.log("wrote", out);
} else {
  console.log("usage: render.ts stills|video ...");
}
