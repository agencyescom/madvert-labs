# motion/ — Motion as Code video projects

Read `GUIDE.md` in this folder before changing anything here. It documents the pipeline
(voiceover → align → plates → stills → sound → render → mux), the API, and the QC checklist.

Rules:
- Every frame is a pure function of `t`; take times from the voiceover via `ws()/we()/cut()`, never hard-coded seconds, never `Math.random()`.
- Use the official logo files in `assets/brand/` as-is; brand colours/fonts only from `src/core/brand.ts`.
- Review with `bun scripts/render.ts stills --t …` + `scripts/sheet.sh` before any full render; full renders take ~15–20 min.
- Don't edit `src/` while a render is running.
- No fabricated client names/results; men only if people appear (brand brief).
