// Word timings from data/words.json (made by scripts/align.py). The voiceover is the
// source of truth: plates look up phrases by content, never by hard-coded seconds.
import { VO_OFFSET } from "./brand";

export type Word = { w: string; s: number; e: number };
let WORDS: (Word & { n: string })[] = [];

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

export function setWords(ws: Word[]) {
  memo.clear();
  WORDS = ws.map((w) => ({ ...w, s: w.s + VO_OFFSET, e: w.e + VO_OFFSET, n: norm(w.w) }));
}
export const allWords = () => WORDS;

/** Find the nth occurrence of a phrase; returns its start/end and word index. */
const memo = new Map<string, { s: number; e: number; i: number; j: number }>();
export function phrase(p: string, nth = 0): { s: number; e: number; i: number; j: number } {
  const key = p + "#" + nth;
  const m = memo.get(key);
  if (m) return m;
  const r = find(p, nth);
  memo.set(key, r);
  return r;
}
function find(p: string, nth: number) {
  const toks = p.split(/\s+/).map(norm).filter(Boolean);
  let hit = 0;
  for (let i = 0; i + toks.length <= WORDS.length; i++) {
    let ok = true;
    for (let k = 0; k < toks.length; k++) if (WORDS[i + k].n !== toks[k]) { ok = false; break; }
    if (ok) {
      if (hit === nth) return { s: WORDS[i].s, e: WORDS[i + toks.length - 1].e, i, j: i + toks.length - 1 };
      hit++;
    }
  }
  throw new Error(`phrase not found: "${p}" #${nth}`);
}
/** Start time of a phrase. */
export const ws = (p: string, nth = 0) => phrase(p, nth).s;
/** End time of a phrase. */
export const we = (p: string, nth = 0) => phrase(p, nth).e;
/** A cut point: just before the phrase's first word. */
export const cut = (p: string, nth = 0, lead = 0.12) => phrase(p, nth).s - lead;
