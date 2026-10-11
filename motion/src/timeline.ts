// When each plate plays. Cuts sit in the breath just before each line, found by
// phrase from the aligned voiceover (data/words.json), never hard-coded seconds.
import type { Scene } from "./core/scene";
import { DURATION } from "./core/brand";
import { cut } from "./core/words";
import { drawHook } from "./scenes/01-hook";
import { drawProblems } from "./scenes/02-problems";
import { drawMoney } from "./scenes/03-money";
import { drawReframe } from "./scenes/04-reframe";
import { drawSolution } from "./scenes/05-solution";
import { drawBrand } from "./scenes/06-brand";
import { drawDemand } from "./scenes/07-demand";
import { drawConvert } from "./scenes/08-convert";
import { drawStudio } from "./scenes/09-studio";
import { drawAutomate } from "./scenes/10-automate";
import { drawBuild } from "./scenes/11-build";
import { drawPosition } from "./scenes/12-position";
import { drawCTA } from "./scenes/13-cta";
import { drawEnd } from "./scenes/14-end";

export function timeline(): Scene[] {
  const S: Omit<Scene, "end">[] = [
    { id: "hook", start: 0, draw: drawHook },
    { id: "problems", start: cut("leads go cold", 0, 0.2), in: { type: "swipe", dur: 0.45 }, draw: drawProblems },
    { id: "money", start: cut("every gap", 0, 0.3), in: { type: "wipeUp", dur: 0.5 }, draw: drawMoney },
    { id: "reframe", start: cut("you don't have", 0, 0.25), in: { type: "zoom", dur: 0.45 }, draw: drawReframe },
    { id: "solution", start: cut("madvert labs fixes", 0, 0.35), in: { type: "flash", dur: 0.3 }, draw: drawSolution },
    { id: "brand", start: cut("we build brands", 0, 0.25), in: { type: "swipe", dur: 0.45 }, draw: drawBrand },
    { id: "demand", start: cut("we bring in", 0, 0.25), in: { type: "swipe", dur: 0.45 }, draw: drawDemand },
    { id: "convert", start: cut("we turn", 0, 0.25), in: { type: "wipeUp", dur: 0.45 }, draw: drawConvert },
    { id: "studio", start: cut("our studio", 0, 0.3), in: { type: "cut", dur: 0 }, draw: drawStudio },
    { id: "automate", start: cut("then every", 0, 0.25), in: { type: "swipe", dur: 0.45 }, draw: drawAutomate },
    { id: "build", start: cut("and when growth", 0, 0.25), in: { type: "zoom", dur: 0.4 }, draw: drawBuild },
    { id: "position", start: cut("one partner", 0, 0.25), in: { type: "flash", dur: 0.3 }, draw: drawPosition },
    { id: "cta", start: cut("book your", 0, 0.25), in: { type: "swipe", dur: 0.45 }, draw: drawCTA },
    { id: "end", start: cut("madvert labs beyond", 0, 0.3), in: { type: "fade", dur: 0.5 }, draw: drawEnd },
  ];
  return S.map((s, i) => ({ ...s, end: i < S.length - 1 ? S[i + 1].start : DURATION }));
}
