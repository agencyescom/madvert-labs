// Madvert Labs brand tokens. Every plate reads colours and fonts from here.
export const W = 1920;
export const H = 1080;
export const FPS = 60;

/** Voiceover starts this many seconds into the film (a beat of air before "Stop"). */
export const VO_OFFSET = 0.3;
/** Film length in seconds (VO is 57.9 s; the end card holds after it). */
export const DURATION = 60.5;

export const C = {
  navy: "#0A0F1C",
  navy2: "#0B172A",
  ink: "#1B2740",
  slate: "#64748B",
  mute: "#94A3B8",
  line: "#DCE6F2",
  hair: "#E8EFF7",
  bg0: "#F8FBFF",
  bg1: "#E9F2FB",
  panel: "#FFFFFF",
  tint: "#F1F7FE",
  blue: "#0084FF",
  elec: "#00B4FF",
  cyan: "#00E5FF",
  green: "#00C27A",
  red: "#F0506E",
  amber: "#F5A524",
  cold: "#A9B8CC",
};

export const F = {
  head: "Sora",
  body: "Inter",
  mono: "JetBrains Mono",
};

export const font = (weight: number, size: number, family: string = F.head) =>
  `${weight} ${size}px ${family}`;

/** Brand gradient #00B4FF -> #00E5FF (optionally starting from #0084FF). */
export function brandGrad(ctx: any, x0: number, y0: number, x1: number, y1: number, deep = true) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  if (deep) {
    g.addColorStop(0, C.blue);
    g.addColorStop(0.55, C.elec);
    g.addColorStop(1, C.cyan);
  } else {
    g.addColorStop(0, C.elec);
    g.addColorStop(1, C.cyan);
  }
  return g;
}
