# Custom Patch Lab — Reel 03 "Choose Your Fighter: Patch Edition"

| Deliverable | File | Spec |
|---|---|---|
| Final | `CustomPatchLab_Reel03_ChooseYourFighter.mp4` | 1080×1920 9:16, 30 fps, **720 frames (24.0 s)**, H.264 yuv420p bt709, AAC 48 kHz, −15.1 LUFS / −1.5 dBFS |
| Cover | `CustomPatchLab_Reel03_Cover.png` | 1080×1920: original logo, CHOOSE YOUR FIGHTER. / PATCH EDITION, all five fighter cards, URL |
| Source | `src/reel03/Reel03.tsx`, `src/reel03/edl.json`, `scripts/sound-design-reel03.py`, `scripts/naturalsfx.py` | Compositions `CustomPatchLabReel03`, `CustomPatchLabReel03Cover`; `npm run render:reel03:final` |

## Asset manifest
| Fighter | Footage (`assets/source/reel03/footage/`) | Used range | Notes |
|---|---|---|---|
| 01 The Classic, embroidered | `v1-classic-embroidered-bolt.mp4` (Video 1) | 3.0–6.0 s | built-in cuts at 1.92 s / 6.08 s avoided |
| 02 The Showstopper, chenille | `v2-showstopper-chenille-m.mp4` (Video 2) | 2.0–3.95 s + 6.05–7.05 s | hand covering the M (4–5.7 s) skipped |
| 03 The Tough One, PVC | `v3-tough-pvc-explore.mp4` (Video 3) | 1.6–3.6 s + 6.4–7.4 s | EXPLORE pan, then backpack |
| 04 The Precision Master, woven | `v4-precision-woven-wolf.mp4` (Video 4) | 3.3–6.3 s | macro pull-back |
| 05 The Color Wizard, printed | `v5-color-printed-astronaut.mp4` (Video 5) | 5.3–8.0 s (0.9×) | soft/out-of-focus part (0–5 s) skipped |

All five clips are 720×1280, 24 fps, 8.0 s and decode cleanly. They have no baked-in text, and each patch's design stays consistent; clip audio is not used. The five supplied posters (`styleframes/`) were used as art direction only. Fighter card stills (`public/brand/reel03-card-*.jpg`) are frames from the footage. The logo is the original asset (`assets/source/shared/brand/cpl-logo-circular.jpg`), unchanged.

## Timeline (120 BPM, 15 f/beat)
| Frames | Scene | Motion / hyperframe |
|---|---|---|
| 0–59 | Intro | orange scan line, perspective grid, 5 silhouette slots (bolt, M, hexagon, circle, oval); CHOOSE YOUR FIGHTER. (spring) → **H f32–33** FIGHT impact → PATCH EDITION; slots light up |
| 60–149 | 01 THE CLASSIC | **H f60–62** giant 01 → orange slash wipe with stitched edge; title / EMBROIDERED / descriptor; STYLE 95 bar |
| 150–239 | 02 THE SHOWSTOPPER | **H f150** 02 → plush fuzzy-edged iris; gold light sweep; TEXTURE 99 |
| 240–329 | 03 THE TOUGH ONE | **H f240** 03 → orange/teal plates split (depth layer); hexagon outlines; punch-in on the backpack; TOUGHNESS 98 |
| 330–419 | 04 THE PRECISION MASTER | **H f330** 04 → technical scan-line wipe; macro settle; dotted precision ring with ticks around the patch; DETAIL 99 |
| 420–509 | 05 THE COLOR WIZARD | **H f420** 05 → spectrum gradient sweep; gradient title; rainbow stat; COLOR 100 |
| 510–599 | Select screen | 5 real-patch cards drop in; P1 cursor clicks through all five; full lineup lights; WHICH ONE WINS? / COMMENT YOUR PICK ↓ |
| 600–719 | End card | **H f600–601** silhouette lineup flash; logo; YOUR DESIGN. / YOUR FIGHTER.; TURN YOUR ARTWORK INTO A CUSTOM PATCH.; GET YOUR ARTWORK PATCHED → with a stitch path sewing around it; quote.custompatchlab.com; lineup row; ~1.5 s full hold |

That is 7 hyperframes, each 2–3 frames, at least 1 s apart. Stat values are fictional game UI, not product claims.

## Audio: NO MUSIC (standing client requirement)
The brief asks for music, but the client cannot use music, so there is none: no melody, harmony, synth pads or bass notes. Everything is synthesized in this repo, with no samples and no third-party audio, so there are no licensing obligations.
- **Daf** (frame drum, no jingles): a maqsum pattern from 2 s to 17 s; rolls and a dum on every fighter entry; dum on the title, WHICH ONE WINS?, the brand flash and YOUR FIGHTER.; a final stroke, then silence for the read.
- **Arcade layer (unpitched):** selection clicks, scan-line noise sweep, stat ticks, cursor clicks.
- **Fighter signatures:**
  - Classic: stitched impact (needle strokes)
  - Showstopper: plush low thump and felt brush
  - Tough One: heavy rubbery hit
  - Precision: sharp double click and scan
  - Color Wizard: shimmer made of noise grains
- **End card:** a stitching rhythm as the stitch path sews around the CTA; quiet room tone throughout.

## QA (performed on the rendered file)
- 720 frames, 24.000 s, 1080×1920, 30 fps, yuv420p; full decode OK; no black frames; −15.1 LUFS, −1.5 dBFS peak (no clipping).
- Contact sheet `out/qa/CustomPatchLab_Reel03_contact-sheet.jpg` + full-res checks of fighter titles, the select screen, the end card and the cover.
- Fixed in review:
  - title words running together ("THE TOUGHONE")
  - CTA text wrapping, then clipped
  - "FINE WEAVE" label off-screen, then colliding with the stat bar (now vertical at the left edge)
  - PVC hexagon lingering over the backpack shot
- Labels: CLASSIC, SHOWSTOPPER, TOUGH ONE, PRECISION, COLOR WIZARD, and every headline from the brief; spelling checked.
- Not verifiable by me: listening (audio checked by measurement only).
