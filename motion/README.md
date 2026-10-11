# Madvert Labs — 60s motion graphics ad (motion as code)

Every frame is a pure function of time, written in TypeScript and drawn with a 2D canvas
(Skia via `@napi-rs/canvas` offline, the browser canvas in the live preview). The voiceover
drives the timing: plates look up phrases in `data/words.json` (`ws("we build it")`), so a
new read re-times everything automatically.

```
audio/voiceover.mp3      ElevenLabs VO (source of truth for timing)
data/words.json          word timings  <- scripts/align.py (PocketSphinx forced alignment)
assets/brand/            official Madvert logo + app icon (used as-is, never redrawn)
assets/images/           studio artworks (studio-06-boring-ad.png is generated, see below)
assets/video/<clip>/     studio video clips as JPEG frame sequences (24 fps)
src/core/                brand tokens, easing, word lookup, drawing primitives
src/components/          GrowthRibbon, kinetic type, UI mockups, subtitles, logo
src/scenes/01..14        the 14 plates
src/timeline.ts          plate order + cut points (anchored to phrases)
src/compose.ts           compositor: transitions (swipe / wipe-up / zoom / flash / fade) + subtitles
scripts/render.ts        offline renderer (parallel workers -> ffmpeg, motion blur)
scripts/sound.py         music bed + SFX cue sheet + sonic logo + mix (-14 LUFS)
scripts/make-boring-ad.ts  builds the deliberately dull "before" ad from studio-07
preview/                 live preview (vite)
```

## Requirements
bun, ffmpeg (libx264), uv (Python) — no GPU, no browser needed to render.

## Workflow
```sh
bun install && scripts/extract-frames.sh
bun run preview                                   # http://localhost:5173/preview/  (space = play)
bun scripts/render.ts stills --t 12.5,40.2         # PNG stills -> out/stills
bun run render:draft                               # fast draft, no motion blur
bun run render                                     # final: 3 sub-frame motion blur, CRF 17 -> out/madvert-silent.mp4
bun run sound                                      # out/mix.wav (+ music.wav, sfx.wav, music_sfx.wav)
ffmpeg -i out/madvert-silent.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest out/madvert-labs-ad.mp4
```
Flags: `--subs 0` (clean version without subtitles), `--scale 2` (4K), `--workers N`,
`--samples N`, `--from/--to` seconds.

## New voiceover
Replace `audio/voiceover.mp3`, edit `SCRIPT`/`SPOKEN` in `scripts/align.py`, then
`bun run align && bun run sound`. If wording changed, update the phrases used in
`src/timeline.ts`, the plates and `src/components/subtitles.ts`.
