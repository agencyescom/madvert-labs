# Custom Patch Lab — Ad 04 "3D Puff Embroidery — VYBE Denim Jacket"

**Files**
- Final: `custom-patch-lab-ad04-final.mp4`. 1080×1920 (9:16), 30 fps, 750 frames / 25.0 s, H.264 High (yuv420p, bt709), AAC-LC 48 kHz stereo, −14.0 LUFS, −3.7 dBFS peak.
- Upload copy: `custom-patch-lab-ad04-final_delivery.mp4`. 28 MB, same spec, two-pass 8.8 Mb/s, SSIM 0.992 against the final.
- Preview: `custom-patch-lab-ad04-preview.mp4` (540×960).
- Thumbnail: `custom-patch-lab-ad04-thumbnail.jpg` (1.6 s, RAISE YOUR STYLE.).

**Source**
- Composition: `CustomPatchLabAd04` (`src/ad04/Ad04.tsx`); edit list `src/ad04/edl.json`.
- Motion toolkit: `src/shared/components/Hyper.tsx`.
- Sound: `scripts/sound-design-ad04.py`.
- Render with `npm run render:ad04:final`.

## 1. Asset inspection report

All five clips are 720×1280, 24 fps, 8.00 s, H.264 with AAC, and decode cleanly. Clip audio (Google Flow output) is not used.

| Brief role | File (`assets/source/ad04/footage/`) | Content | Useful range | Notes |
|---|---|---|---|---|
| Shot 01: hand holds transfer | **missing** | — | — | Replaced by the supplied VYBE master still, animated (push and parallax), as the brief allows |
| Shot 02: heat press | `shot02-heat-press.mp4` | Hands place and smooth the transfer, press closes, opens | 0.2–1.0, 2.0–3.2 (platen down at about 2.7 s), 5.0–6.1 | Lettering consistent |
| Shot 03: carrier peel | `shot03-carrier-peel.mp4` | Uninterrupted peel, then clean embroidery | 2.27–6.4 peel; 6.3–8.0 clean | After 6.3 s the camera crops the left edge of the V |
| Shot 04: stitch macro | `shot04-stitch-macro.mp4` | Slow pan V → y → b → e | 0.3–2.9 | Lettering consistent |
| Shot 05: jacket reveal | `shot05-jacket-reveal.mp4` | Close back → full jacket pull-back | whole clip | Full word readable from about 1.5 s |
| Shot 06: finger press | `shot06-finger-press.mp4` | Red-nailed fingers press and stroke the stitching | 0.4–3.4; clean back 6.0–8.0 | Hands normal |
| Shot 07: male model | **missing** | — | — | No model footage was supplied, and none was invented. See §2, 17–20 s |

**References**
- VYBE master (`reference/vybe-master-hand-transfer.jpg`): this is the authoritative design, and the footage matches it. The lettering is connected brush script with a capital V and an extended underline flourish, in cobalt thread.
- Styleframes 01–03 (`styleframes/`): used as layout and type references. SF03 shows a *different* mascot (a man in a cap); the **original** Custom Patch Lab logo is used instead, unaltered.
- Logo: `assets/source/shared/brand/cpl-logo-circular.jpg`, byte-identical to the official logo used in Ads 01–03.

**VYBE check.** Every frame used was compared with the master: same spelling, letterforms, flourish and colour. No AI spelling glitches or morphing appear in any selected range.

## 2. Final edit decision list (120 BPM; 1 beat = 15 frames)

| Frames | Time | Shot / source in–out | On screen | Transition in |
|---|---|---|---|---|
| 0–60 | 0.0–2.0 | VYBE master still, push 1.16→1.04 + parallax | CUSTOM EMBROIDERY · RAISE / **YOUR** / STYLE. · stitch line · 3D PUFF EMBROIDERY | opens on product, frame 0 |
| 60–84 | 2.0–2.8 | press 0.2–1.0 (real time) | step tag 01 PLACE | navy/cobalt/ivory skewed bar wipe (10 f) |
| 84–120 | 2.8–4.0 | press 2.0–3.2 (real time) | 02 PRESS · TURN UP / **THE TEXTURE.** wipes land on the platen close (f105) | beat cut + 6 f punch, 4 f mechanical nudge at f105 |
| 120–150 | 4.0–5.0 | press 5.0–6.1 (real time) | — | beat cut + punch |
| 150–270 | 5.0–9.0 | peel 2.27–6.4 (real time, uninterrupted) | 03 PEEL tag only; nothing over the embroidery | horizontal whip, 8 f, x motion blur + speed lines |
| 270–345 | 9.0–11.5 | macro 0.3–2.9 | dimension callout "RAISED STITCH" · 3D PUFF / EMBROIDERY | match cut (embroidery → embroidery) + punch |
| 345–420 | 11.5–14.0 | jacket 1.9–4.5 | MADE TO / STAND OUT. | vertical push, 8 f, y motion blur |
| 420–510 | 14.0–17.0 | finger press 0.4–3.4 (real time) | TEXTURE YOU CAN FEEL · FEEL / THE / **PUFF.** (lands on the press, f450) · RAISED STITCHING. REAL DIMENSION. | vertical bar wipe (10 f) |
| 510–600 | 17.0–20.0 | six 0.5 s real-time cuts: touch 6.2, macro 5.5, peel 7.0, jacket 0.2, jacket 6.4, touch 7.2 | YOUR DESIGN. (snap L) · **YOUR STYLE.** (snap R) · outline type sweep | hard beat cuts, 5 f scale punch each |
| 600–750 | 20.0–25.0 | end card over jacket 4.5–8.0 (slow pull-back) | logo → YOUR DESIGN. → **OUR CRAFT.** → stitch underline → FREE SHIPPING • FREE BACKING → CTA panel GET YOUR FREE MOCKUP / WITHIN 24 HOURS → shine; full hold 2.9 s | navy panel rises (9 f) |

## 3. Motion graphics animation map

| Preset | Component | Used for |
|---|---|---|
| A: fast masked reveal | `HyperLine mode="rise"` | RAISE, FEEL, THE, 3D PUFF, YOUR DESIGN. (CTA) |
| B: staggered word entrance | sequential `HyperLine`s 7–8 f apart | RAISE→YOUR→STYLE., FEEL→THE→PUFF. |
| C: controlled impact scale | `HyperLine mode="impact"` (spring, damping 13, no bounce train) | STYLE., STAND OUT., PUFF., OUR CRAFT. |
| D: directional text wipe / snap | `mode="wipe"` (cobalt leading bar), `snapL/snapR` (40 px x motion blur) | TURN UP THE TEXTURE., YOUR → (hook), MADE TO, YOUR DESIGN. / YOUR STYLE., benefits |
| E: CTA slide-up | cobalt panel + masked line rises | GET YOUR FREE MOCKUP / WITHIN 24 HOURS |
| F: brand logo spring | `LogoBadge` (official asset, aspect locked) | end card |

**Illustrations**
- `ThreadPath`: running-stitch lines sewing themselves (hook, under OUR CRAFT.)
- `StepTag`: 01 PLACE / 02 PRESS / 03 PEEL with a progress rule
- `DimensionCallout`: raised-stitch height marker
- `OutlineSweep`: parallax outline type
- `BarWipe`: graphic transitions
- `SpeedLinesFx`: whips

**Layering:** footage → grade and navy fields → callouts / thread → headlines → transition layer → film grain.

## 4. Sound design map (all synthesized in this repo; no samples, no third-party music)

| Time | Event | Sound |
|---|---|---|
| 0.00 | RAISE / first frame | low impact |
| 0.23 / 0.50 | YOUR snap / STYLE. | air whoosh / impact |
| 1.8–2.2 | bar wipe | whoosh |
| 2.0 | hands smooth transfer | fabric rustle |
| 2.9 | press handle | metallic latch click |
| **3.50** | platen closes (f105) | padded thump + clack, steam hiss |
| 4.0 | press release | click |
| 4.75 | whip | whoosh |
| 5.0–8.9 | carrier peel | sticky film crackle following the peel speed; drums thinned underneath |
| 9.0 | match cut into macro | soft impact + texture brush |
| 11.3 / 11.5 / 12.1 | push / reveal / STAND OUT. | whoosh / sparkle / impact |
| 14.35, 14.95, 15.7, 16.5 | fingertip contacts | soft taps; PUFF. impact at 15.0 |
| 15.6–17.0 | build | riser |
| 17.0–19.5 | six montage cuts | quiet whooshes + clothing movement; impacts on YOUR DESIGN. / YOUR STYLE. |
| 20.0 | panel rises / logo | whoosh / sparkle |
| 20.63 | OUR CRAFT. | impact |
| 21.27 / 21.47 | benefits | taps |
| 21.73–21.87 | CTA panel | slide whoosh + impact |
| 22.07 | resolve | bell chord |
| 23.8–25.0 | ending | groove ends, chord rings, 0.8 s fade |

**Music** is a temporary original 120 BPM bed: kick/clap/808, syncopated key stabs, pads, and 16th hats in the montage. Mastered to −14 LUFS with a −3.7 dBFS peak, no clipping.

## 5. Quality control (performed on the rendered final, not the source)

**Passed**
- 1080×1920, 9:16, 30 fps, 750 frames (25.0 s; brief range 22–26 s), H.264 High yuv420p bt709, AAC 48 kHz. The whole file decodes without error.
- No black frames (`blackdetect`).
- Audio: −14.0 LUFS integrated, −3.7 dBFS peak, no clipping. Clean fade-out, no abrupt cut.
- VYBE spelling and design are consistent in every section, with no morphing frames used. The jacket colour is consistent.
- Hands look natural in all ranges used. The original logo is correct, with its aspect ratio locked.
- Copy is exact:
  - RAISE YOUR STYLE.
  - 3D PUFF EMBROIDERY
  - TURN UP THE TEXTURE.
  - MADE TO STAND OUT.
  - FEEL THE PUFF.
  - YOUR DESIGN. / YOUR STYLE.
  - YOUR DESIGN. OUR CRAFT.
  - FREE SHIPPING • FREE BACKING
  - GET YOUR FREE MOCKUP / WITHIN 24 HOURS
- Text stays inside 220–1500 px vertically and clear of the right-side controls. The only element below that is the decorative outline sweep. Nothing is cut off.
- Fixes made after review:
  - cobalt brightened for contrast on navy
  - PUFF. contrast (deeper navy field)
  - touch-shot label moved off the flourish
  - hook label contrast and stitch-line overlap

**Open items (need client action)**
1. **Shot 07 (male model) was not supplied.** The 17–20 s fashion beat uses real finished-jacket footage instead. When the clip arrives, add its ranges to `edl.json` as x1–x6; no other code changes.
2. **Shot 01 video was not supplied.** The hook animates the master still.
3. **Music is a TEMP original bed.** Replace it with a licensed instrumental before launch; the effects are timed to picture frames.
4. **Claims:** FREE SHIPPING and FREE BACKING (and the 24-hour mockup) are not in the Brand Identity System. They need client sign-off.
