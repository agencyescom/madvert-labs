// Asset access shared by the offline renderer (Node canvas) and the browser preview.
// Plates call img()/video() synchronously; a miss is recorded so the host can load it
// and redraw (the renderer never writes a frame that had a miss).

export interface AssetHost {
  img(key: string): any | undefined;
  /** Frame of a clip at local time `t` seconds (loops). */
  video(key: string, t: number): any | undefined;
  /** Scratch canvas for compositing (reused per key). */
  canvas(key: string, w: number, h: number): any;
}

export const VIDEOS: Record<string, { frames: number; fps: number; w: number; h: number }> = {
  car: { frames: 192, fps: 24, w: 960, h: 640 },
  "talking-head": { frames: 192, fps: 24, w: 640, h: 960 },
  watch: { frames: 192, fps: 24, w: 1280, h: 720 },
};

export const IMAGES: Record<string, string> = {
  logo: "brand/logo-light.png",
  logoDesc: "brand/logo-light-descriptor.png",
  logoDark: "brand/logo-dark.png",
  icon: "brand/app-icon-512.png",
  s01: "images/studio-01-product-ad.png",
  s04: "images/studio-04-product-video.png",
  s05: "images/studio-05-ai-commercial.png",
  s06: "images/studio-06-boring-ad.png",
  s07: "images/studio-07-premium-ad.png",
};

export const videoFrameIndex = (key: string, t: number) => {
  const v = VIDEOS[key];
  const n = Math.floor(Math.max(0, t) * v.fps) % v.frames;
  return n + 1;
};
export const videoFramePath = (key: string, idx: number) =>
  `video/${key}/${String(idx).padStart(3, "0")}.jpg`;

let host: AssetHost;
export const setHost = (h: AssetHost) => (host = h);
export const img = (k: string) => host.img(k);
export const video = (k: string, t: number) => host.video(k, t);
export const scratch = (k: string, w: number, h: number) => host.canvas(k, w, h);
