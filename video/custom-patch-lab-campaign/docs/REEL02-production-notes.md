# Custom Patch Lab — Reel 02 "From Logo to Legend" (PATCH CULTURE)

| Deliverable | File | Spec |
|---|---|---|
| Final | `CustomPatchLab_Reel02_Final.mp4` | 1080×1920 9:16, 30 fps, **660 frames (22.0 s)**, H.264 High yuv420p bt709, AAC 48 kHz stereo, −15.0 LUFS / −1.4 dBFS |
| Cover | `CustomPatchLab_Reel02_Cover.png` | 1080×1920 PNG (end card, frame 659) |
| Source | `src/reel02/Reel02.tsx`, `src/reel02/edl.json`, `src/reel02/tiger-track.json`, `scripts/tiger-track.py`, `scripts/sound-design-reel02.py` | Composition `CustomPatchLabReel02`; `npm run render:reel02:final` |

## Asset manifest
| Asset | File (`assets/source/reel02/`) | Content (all 720×1280, 24 fps, 8.0 s, decode OK) | Used |
|---|---|---|---|
| Video 01 | `footage/video1-designer-tablet.mp4` | internal cuts at 2.92 s and 3.96 s: tablet tiger → digital-eye close-up → over-shoulder stylus | 0.0–3.95 s |
| Video 02 | `footage/video2-tiger-patch.mp4` | embroidered-eye macro 0–4.04 s, then hand holding the patch | all |
| Video 03 | `footage/video3-cap-jacket-bag.mp4` | cap 0–2.46 s · jacket 2.46–4.8 s · built-in whip · backpack 5.05–8 s | 0–7.6 s (built-in whip replaced by an editorial wipe) |
| Tiger patch photo | `reference/tiger-patch-still.webp` | finished patch on the work table | end-card product card; tracking calibration |
| Tiger artwork (tablet) | `reference/tiger-artwork-tablet-still.webp` | digital artwork | source of the vector tiger silhouette |
| Official logo | `assets/source/shared/brand/cpl-logo-circular.jpg` (byte-identical to the supplied file) | | end card, unaltered |

Tiger artwork is the same design in all three videos and both stills. Clip audio is not used.

## Edit
| Frames | Source | Graphics / hyperframes | Type |
|---|---|---|---|
| 0–87 | V1 0.0–2.9 real time | **H1 f5–7** UI click: orange frame, navy tiger silhouette; orange vector trace locked to the real ear/cheek edge, per frame; "LAYER 01 · YOUR_LOGO.SVG" chip | YOUR LOGO (letter stagger) / DESERVES BETTER. (spring impact) |
| 87–124 | V1 2.92–3.95 (digital eye) | digital push 1×→2×; the eye is moved to exactly where the embroidered eye sits in V2; freeze f118–124; "PIXEL" eye ring | FROM FLAT |
| 124–210 | V2 0.0–4.0 | **H2 f124–126** thread-texture frame; **eye-to-eye match cut**; ring flips to "THREAD"; stitched thread line | TO REAL. (outline → filled) |
| 210–330 | V2 4.1–8.0 (0.78×) | light sweep; tracked callouts REAL TEXTURE, RAISED DETAIL; **H3 f272–274** macro texture + "SATIN STITCH" marker | |
| 330–400 | V3 cap | punch-in; tracked "STRUCTURED CAP" pill | CAPS. |
| 400–470 | V3 jacket | **H4 f400–401** navy frame with orange silhouette placed on the jacket patch position (match-cut accent) | JACKETS. + "VARSITY JACKET" |
| 470–540 | V3 backpack | navy/orange/ivory editorial bar wipe with motion blur | BAGS. + "CANVAS BACKPACK" |
| 540–660 | end card | **H5 f540–542** oversized REAL.; stitched circular reveal; original logo; product card with a stitched border sewing on; URL chip | YOUR DESIGN. / OUR CRAFT. · TURN YOUR LOGO INTO SOMETHING REAL. · quote.custompatchlab.com |

Tracking: `scripts/tiger-track.py` measures the tiger in every frame (orange-thread box → silhouette box, calibrated on the patch photo); the hook trace is the actual edge contour of the digital tiger per frame. Eye positions for the match cut were measured from both clips (`edl.json → eye`).

## Sound (all synthesized in this repo — no samples, no third-party music)
Built in the soft Reel 01 v2 style: rounded low hits (no crack transients), low-passed whooshes.
- Stylus glass taps (f34, 48, 61) · soft UI confirm click on H1 · rising tone through the digital push.
- Crisp stitch on the eye match cut + low embroidery-machine rhythm under the macro.
- Thread snip into the product hero · cloth/felt foley when the hand holds the patch and when the jacket moves.
- Soft hits on CAPS / JACKETS (H4) / BAGS; editorial-wipe air.
- Brand: soft low hit (H5), sparkle on the logo, bell chord on OUR CRAFT., click on the URL.
- Music: TEMP original low groove (pad from frame 0; soft kick + sub from the transformation; clap/hats from CAPS), kept under the effects; 0.9 s fade-out.

## QA (performed on the rendered file)
- 660 frames exactly, 1080×1920, 9:16, 30 fps, yuv420p; full decode OK; no black frames; −15.0 LUFS, −1.4 dBFS peak (no clipping).
- Contact sheet `out/qa/CustomPatchLab_Reel02_contact-sheet.jpg` + full-res frame checks (hook, hero, end card).
- Fixed in review: hook trace was hidden behind the headline (moved to the ear/cheek edge, stopped above the stylus); a tracked outline around the hand-held patch was slightly off (background orange spools) and was removed rather than shipped imprecise.
- Logo: original asset, aspect locked. Spelling checked. Type within 200–1520 px vertically; hyperframes 2–3 frames each, ≥2.8 s apart.
- Not verifiable by me: listening (audio checked by measurement only).

## Notes
- "STRUCTURED CAP", "VARSITY JACKET", "CANVAS BACKPACK" describe what is visible in the footage; adjust if the products should be named differently.
