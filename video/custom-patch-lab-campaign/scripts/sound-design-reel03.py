"""Custom Patch Lab — Reel 03 "Choose Your Fighter": NO MUSIC.

Client requirement: no music. Rhythm is a daf (frame drum, no jingles) at
120 BPM; the arcade layer is unpitched UI clicks and noise sweeps; each fighter
has its own natural signature (stitch, plush thump, heavy PVC hit, sharp click,
noise-grain shimmer). All synthesized (sfxlib + naturalsfx), timed from
src/reel03/edl.json.
"""
import json
import os
import sys

import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sfxlib  # noqa: E402
from sfxlib import bus, filt, place, reverb, reverb_ir  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDL = json.load(open(os.path.join(ROOT, 'src/reel03/edl.json')))
FPS = EDL['fps']
DUR = EDL['durationInFrames'] / FPS
sfxlib.configure(DUR, seed=3303)
import naturalsfx as nx  # noqa: E402  (after configure: shares the rng)

N, SR = sfxlib.N, sfxlib.SR
fr = lambda f: f / FPS  # noqa: E731
BEAT = 60 / EDL['bpm']
FIGHT = [fr(x) for x in EDL['fighters']]
SELECT, END = fr(EDL['select']), fr(EDL['end'])

fx = bus()
daf = bus()

# ---------------------------------------------------------------- intro 0–2 s
place(fx, nx.scan_sweep(0.55), 0.0, 0.8)
for i in range(5):                                         # silhouettes slot in
    place(fx, nx.ui_click(0.8), fr(8 + i * 4), 0.45, pan=-0.5 + i * 0.25)
place(daf, nx.daf_dum(1.0), fr(12), 0.85)                  # CHOOSE YOUR FIGHTER.
place(fx, nx.soft_hit(1.0, 1.2), fr(12), 0.45)
place(daf, nx.daf_roll(0.4), fr(32) - 0.4, 0.55)
place(daf, nx.daf_dum(1.2), fr(32), 0.9)                   # title hyperframe
place(fx, nx.soft_hit(1.2, 1.4), fr(33), 0.5)              # PATCH EDITION
for i in range(5):                                         # slots light up
    place(fx, nx.ui_click(1.2), fr(40 + i * 3), 0.35)
place(fx, nx.air(0.35, 400, 3000), fr(60) - 0.25, 0.4)

# ---------------------------------------------------------------- daf groove 2–17 s (maqsum)
PATTERN = ['D', 'T', 'k', 'T', 'D', 'k', 'T', 'k']
STEP = BEAT / 2
for j in range(int((SELECT - FIGHT[0]) / STEP)):
    t = FIGHT[0] + j * STEP
    if any(0 <= ft - t < 0.26 for ft in FIGHT[1:]):        # breath right before each fighter entry
        continue
    hit = PATTERN[j % 8]
    pan = nx.rng().uniform(-0.12, 0.12)
    if hit == 'D':
        place(daf, nx.daf_dum(1.0 if j % 8 == 0 else 0.8), t, 0.7, pan=pan)
    elif hit == 'T':
        place(daf, nx.daf_tak(0.9), t, 0.55, pan=pan)
    else:
        place(daf, nx.daf_ka(1.0), t, 0.45, pan=pan)

# ---------------------------------------------------------------- fighter signatures
for i, t in enumerate(FIGHT):
    place(daf, nx.daf_roll(0.25), t - 0.25, 0.5)
    place(daf, nx.daf_dum(1.15), t, 0.85)                   # number hyperframe
    place(fx, nx.ui_click(1.0), t + fr(3), 0.6)             # select click as the wipe starts
    place(fx, nx.air(0.35, 400, 3200), t + fr(3), 0.4, pan=0.4 if i % 2 else -0.4)
    place(fx, nx.ui_click(1.3), t + fr(26), 0.3)            # stat bar starts
    for k in range(6):                                      # stat ticks
        place(fx, nx.ui_click(1.5), t + fr(28 + k * 3), 0.12)
t1, t2, t3, t4, t5 = FIGHT
# 01 Classic — crisp stitched impact
for k in range(4):
    place(fx, nx.stitch_stroke(1.2), t1 + fr(4) + k * 0.07, 0.75)
place(fx, nx.soft_hit(0.9, 1.0), t1 + fr(4), 0.45)
# 02 Showstopper — plush low thump + felt brush
place(fx, nx.soft_hit(1.5, 1.6), t2 + fr(4), 0.65)
place(fx, nx.cloth(0.9, 150, 900, 0.35), t2 + fr(4), 1.0)
place(fx, nx.cloth(0.8, 200, 1400, 0.2), t2 + fr(30), 1.0)  # gold sweep across the chenille
# 03 Tough One — heavy dimensional hit, punch on the backpack cut
place(fx, nx.heavy_hit(1.4), t3 + fr(4), 0.7)
place(fx, nx.heavy_hit(0.9), fr(300), 0.4)
# 04 Precision — sharp clean click + scan
place(fx, nx.ui_click(1.8), t4 + fr(4), 0.9)
place(fx, nx.ui_click(1.8), t4 + fr(7), 0.6)
place(fx, nx.scan_sweep(0.4), t4 + fr(3), 0.6)
# 05 Color Wizard — bright noise-grain shimmer
place(fx, nx.grain_shimmer(1.0), t5 + fr(3), 0.8)
place(fx, nx.soft_hit(0.8, 1.0), t5 + fr(4), 0.4)

# ---------------------------------------------------------------- select 17–20 s
place(fx, nx.air(0.35, 400, 3000), SELECT - 0.25, 0.4)
for i in range(5):                                          # cards drop in
    place(fx, nx.cloth(0.2, 300, 2000, 0.15), SELECT + fr(2 + i * 3), 1.0)
for i in range(5):                                          # cursor clicks (every 9 frames)
    place(fx, nx.ui_click(1.2), SELECT + fr(6 + i * 9), 0.65, pan=-0.4 + i * 0.2)
    place(daf, nx.daf_ka(1.2), SELECT + fr(6 + i * 9), 0.5)
place(daf, nx.daf_roll(0.3), SELECT + fr(52) - 0.3, 0.55)
place(daf, nx.daf_dum(1.2), SELECT + fr(52), 0.85)          # WHICH ONE WINS?
place(fx, nx.soft_hit(1.0, 1.2), SELECT + fr(52), 0.45)
place(daf, nx.daf_tak(1.0), SELECT + fr(64), 0.55)          # COMMENT YOUR PICK

# ---------------------------------------------------------------- end 20–24 s
place(fx, nx.air_swell(0.8, 300, 3200), END - 0.8, 0.35)
place(daf, nx.daf_dum(1.3), END, 0.9)                       # brand hyperframe
place(fx, nx.soft_hit(1.3, 1.8), END, 0.5)
place(daf, nx.daf_dum(1.0), END + fr(16), 0.7)              # YOUR FIGHTER.
place(daf, nx.daf_tak(1.0), END + fr(16), 0.5)
place(fx, nx.ui_click(1.0), END + fr(42), 0.5)              # CTA button
for k in range(int(34 / 3)):                                # stitch path sewing around the CTA
    place(fx, nx.stitch_stroke(0.7), END + fr(50 + k * 3), 0.35)
place(daf, nx.daf_dum(0.8), END + fr(84), 0.55)             # final stroke, then silence for the read
fx += nx.room_tone(DUR)

# ---------------------------------------------------------------- mix
ir_room = reverb_ir(1.0, 4.8, 5000)
mix = fx * 0.85 + reverb(fx, ir_room) * 0.08 + daf * 0.8 + reverb(daf, ir_room) * 0.12
mix = filt(mix, 'highpass', 30)
mix = filt(mix, 'lowpass', 12000)
mix = np.tanh(mix)
fi = int(0.05 * SR)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fade = int(0.8 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write(sys.argv[1], SR, mix.astype(np.float32))
print('wrote', sys.argv[1], f'{DUR}s')
