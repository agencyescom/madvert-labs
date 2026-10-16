# Custom Patch Lab — Reel 01 "Every Stitch Hits Different" (PATCH CULTURE)

| Deliverable | File | Spec |
|---|---|---|
| Final | `CustomPatchLab_Reel01_Final.mp4` | 1080×1920 9:16, 30 fps, **540 frames (18.0 s)**, H.264 High yuv420p bt709, AAC 48 kHz stereo 256 kb/s, −14.1 LUFS |
| No-captions version | `CustomPatchLab_Reel01_Final_NoCaptions.mp4` | same; kinetic captions removed, brand row (logo, tagline, URL) kept |
| Cover | `CustomPatchLab_Reel01_Cover.png` | 1080×1920 PNG (end-card frame 539) |
| Source | `src/reel01/Reel01.tsx`, `src/reel01/edl.json`, `scripts/sound-design-reel01.py` | Compositions `CustomPatchLabReel01`, `CustomPatchLabReel01NoCaptions`; `npm run render:reel01:final` |

## Asset manifest
| Asset | File (`assets/source/reel01/`) | Used |
|---|---|---|
| Video 01 — machine stitching | `footage/video1-machine-stitching.mp4` (720×1280, 24 fps, 8.0 s) | 0–10 s (all of it, incl. one 0.6 s re-crop) |
| Video 02 — finished patch reveal | `footage/video2-patch-reveal.mp4` (720×1280, 24 fps, 8.0 s) | 10–18 s, one continuous take (src 1.0–8.0 s) |
| Master artwork 01 (hand-held) | `reference/master-artwork-01-hand-held.webp` | design reference only |
| Master artwork 02 (machine) | `reference/master-artwork-02-machine.webp` | design reference only |
| Official logo | `assets/source/shared/brand/cpl-logo-circular.jpg` (byte-identical to the supplied file) | end card, unaltered |
| Fonts | Oswald, Inter (SIL OFL) | all type |

Both clips match the master artwork: same mountain/sun/trees/water patch in every frame used; no morphing seen. Clip audio is not used.

## Edit (frames)
| Frames | Source | Hyperframe / graphics | Type |
|---|---|---|---|
| 0–60 | V1 0.0–2.0 real time, push into needle | **H1 f3–4** orange macro flash + micro-shake on the first needle hit; needle reticle | WAIT FOR THE / FINAL STITCH… (letter stagger) + stitch dash |
| 60–96 | V1 2.0–3.2, snap zoom ×1.55 on needle | "SATIN FILL · SUN" callout | |
| 96–140 | V1 3.13–4.6 | **H2 f96–97** navy frame, white thread-line patch illustration; tracking reticle + stitch counter, circular hoop guide | PRECISION IN EVERY THREAD |
| 140–180 | V1 4.6–6.0 macro ×2.1 | "0.4 MM PITCH" callout | |
| 180–220 | V1 6.0–7.0 speed-ramped to 0.75× | lateral whip in, thread trail | THREAD |
| 220–240 | V1 0.6–1.3 crop on trees/water | rhythm cut | BY |
| 240–243 | V1 freeze crop ×3.4 | **H3** texture freeze + macro marker | |
| 243–300 | V1 7.0–8.0 slowed to 0.43× — "the final stitch", extreme macro ×2.5→3.0 | gold thread path into the needle, measurement ring | THREAD. |
| 299–314 | | **H4 f299–300** ivory flash on the thread-cut sound → embroidered-edge circular reveal from the needle point | (no text) |
| 300–420 | V2 1.0–5.0 macro pull-back to the finished patch, hand enters | light sweep across the patch | (no text — product speaks) |
| 420–540 | V2 5.0–8.0 patch lifted (0.75×), slow pull-back | **H5 f436–438** oversized outlined HITS | EVERY STITCH / HITS DIFFERENT. → logo (mask + glow) → Your Design. Our Craft. → quote.custompatchlab.com, hold to 18.0 s |

## Sound (all synthesized in this repo — no samples, no third-party music)
- Lead: embroidery machine — needle-bar clicks, thread pull, take-up rattle, motor hum. Stitch rate follows picture speed: 13 Hz → 9.75 Hz (0.75× ramp) → 5.6 Hz heavy "final stitch" → hard stop on the cut.
- Hits: tight impact + low accent on H1, H2, H3, H5; thread **snip** on H4 (f299); reveal shimmer + soft bell chord; fabric friction as the hand lifts the patch; whooshes on punch-in and whip; logo sparkle.
- Music: minimal original pad + sub pulse, opening up on the reveal and a soft kick under the payoff (TEMP — replace with licensed music if desired).
- Mix: −14.1 LUFS integrated, −0.8 dBFS peak (no clipping), 0.7 s fade-out.

## QA (performed on the rendered files)
- 540 frames exactly, 1080×1920, 9:16, 30 fps, yuv420p; both files decode end-to-end without error; no black frames.
- Beginning / middle / end inspected (contact sheet `out/qa/CustomPatchLab_Reel01_contact-sheet.jpg` + frame stills).
- Hyperframes: 5, each 2–3 frames, ≥3 s apart (no strobing).
- Logo: original asset, aspect locked (fixed one issue in review: it initially rendered off-box).
- Spelling: WAIT FOR THE FINAL STITCH… · PRECISION IN EVERY THREAD · THREAD BY THREAD. · EVERY STITCH HITS DIFFERENT. · Your Design. Our Craft. · quote.custompatchlab.com.
- Safe area: all type between y 214–1580 px, clear of the right-side controls.
- Not verifiable by me: listening. Audio was checked by measurement (loudness, peak, spectrogram/timing), not by ear.

## Notes
- "0.4 MM PITCH" and the stitch counter are decorative technical graphics, not product specs; remove the callout if you prefer no numeric claims (`DetailMarker` in Reel01.tsx).
