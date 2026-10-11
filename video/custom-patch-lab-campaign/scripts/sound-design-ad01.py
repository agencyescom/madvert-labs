"""Custom Patch Lab — Ad 01 TEMP score + sound design (original, synthesized).

Everything here is generated from oscillators and noise in this file: no
samples, no third-party music. It is a preview bed so the cut can be timed and
reviewed; swap the music stem for a commercially licensed instrumental
hip-hop/trap track before the campaign goes live (see README).

120 BPM, F minor. One beat = 0.5 s, so every 3 s cut lands on a kick (3, 9, 15)
or a snare (6, 12). Writes a 48 kHz stereo float WAV; loudness is normalised
afterwards with ffmpeg (see render notes in README).
"""
import os
import sys

import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sfxlib  # noqa: E402
from sfxlib import *  # noqa: E402,F401,F403

DUR = 19.0
sfxlib.configure(DUR)
N = sfxlib.N
SR = sfxlib.SR
BPM = 120
BEAT = 60 / BPM
STEP = BEAT / 4  # 16th note
rng = sfxlib.rng

# All event times in seconds, shared with the picture edit (src/ad01/edl.json).
CUTS = [3.0, 6.0, 9.0, 12.0, 15.0, 16.0]
TEXT_HITS = [0.5, 4.0, 6.5, 10.0, 12.5, 15.25, 16.5, 17.0]


# ---------------------------------------------------------------- arrangement
music = bus()
drums = bus()
sfx = bus()
pads = bus()

F1, Db1, Ab0, Eb1 = note(29), note(25), note(20), note(27)
chords = [  # (start, end, 808 root, pad voicing)
    (3.0, 6.0, F1, [note(53), note(56), note(60), note(63)]),
    (6.0, 9.0, Db1, [note(49), note(53), note(56), note(60)]),
    (9.0, 12.0, note(32), [note(48), note(51), note(56), note(60)]),
    (12.0, 15.0, Eb1, [note(51), note(55), note(58), note(62)]),
    (15.0, 16.0, F1, [note(53), note(56), note(60), note(63)]),
]

# Intro pad (0-3): dark F minor drone under the macro shot.
place(pads, pad([note(41), note(48), note(53), note(56)], 3.4), 0.0, 0.9)
for s, e, root, voicing in chords:
    place(pads, pad(voicing, e - s + 0.5), s - 0.1, 0.75)
# Outro pad: Db maj7 -> resolves warm under the logo.
place(pads, pad([note(49), note(53), note(56), note(60), note(65)], 3.3), 15.9, 1.0)

# Groove: half-time trap from the 3.0 s drop to the 16.0 s logo.
for k in range(int((16.0 - 3.0) / STEP)):
    t = 3.0 + k * STEP
    step = k % 16
    if 14.5 <= t < 15.0:  # breath before the benefit hit
        continue
    if 15.5 <= t < 16.0:  # breath before the logo
        continue
    if step in (0, 7, 10) or (step == 13 and (k // 16) % 2 == 1):
        place(drums, kick(1.0 if step == 0 else 0.8), t, 0.9)
        root = next(r for s, e, r, _ in chords if s <= t < e + 1e-6)
        length = min(STEP * (7 if step == 0 else 3), 1.0)
        place(music, sub808(root, length, glide_from=root * 1.5 if step == 7 else None), t, 1.0)
    if step in (8,):
        place(drums, clap(), t, 0.75, pan=0.0)
    # hats: 8ths, with 16th/32nd rolls into each cut
    near_cut = any(0 < c - t <= 0.5 for c in CUTS)
    if step % 2 == 0:
        place(drums, hat(open_=(step == 14)), t, 0.8 if step % 4 == 0 else 0.55, pan=0.25)
    elif near_cut:
        place(drums, hat(), t, 0.45, pan=0.25)
        place(drums, hat(), t + STEP / 2, 0.35, pan=0.25)
    if step == 12 and (k // 16) % 2 == 0:
        place(drums, rim(), t + STEP, 0.6, pan=-0.3)

# Pluck motif (F minor pentatonic), sparse, from 4.0 to 14.0.
motif = [(0, 72), (0.75, 75), (1.5, 77), (2.25, 75), (3.0, 80), (3.75, 77)]
for bar0 in (4.0, 8.0, 12.0):
    for off, n in motif:
        if bar0 + off < 14.4:
            place(music, pluck(note(n)), bar0 + off, 0.55, pan=-0.25 if n % 2 else 0.25)

# Opening: deep bass impact + fabric texture + riser into the drop.
place(sfx, impact(1.25, 70, 28, 2.8), 0.0, 1.0)
place(sfx, fabric(2.9, density=70, level=0.20), 0.05, 1.0, pan=-0.15)
for i in range(4):  # clock ticks counting into the drop
    place(drums, rim(), 1.0 + i * 0.5, 0.35 + i * 0.08, pan=0.35)
place(sfx, riser(1.5), 1.5, 0.75)
place(sfx, reverse_swell(0.6), 2.4, 0.5)

# Transitions.
place(sfx, impact(0.75, 90, 40, 1.4), 3.0, 0.75)
place(sfx, whoosh(0.55, 300, 6500), 3.0 - 0.55 * 0.75, 0.9, pan=-0.2)
place(sfx, whoosh(0.5, 4000, 400, peak=0.7), 6.0 - 0.35, 0.85, pan=0.3)  # vertical whip
place(sfx, fabric(2.8, density=90, bright=(500, 3200), level=0.32), 6.15, 1.0, pan=0.2)  # gloves on chenille
place(sfx, whoosh(0.7, 500, 9000, peak=0.65, q=1.1), 9.0 - 0.45, 0.85, pan=-0.4)  # cream streak wipe
place(sfx, impact(0.6, 80, 42, 1.2), 12.0, 0.6)
place(sfx, whoosh(0.4, 200, 3000, peak=0.8), 12.0 - 0.32, 0.6)
place(sfx, riser(1.0, 300, 9000), 14.0, 0.7)
place(sfx, impact(0.7, 110, 45, 1.0), 15.0, 0.8)  # benefit stamp
place(sfx, whoosh(0.45, 600, 7000, peak=0.7), 15.0 - 0.31, 0.6, pan=0.4)
place(sfx, reverse_swell(0.5), 15.5, 0.7)

# Logo reveal: impact, bell chord strum, sparkle.
place(sfx, impact(1.1, 75, 30, 2.6), 16.0, 0.95)
place(music, sub808(F1, 2.2), 16.0, 0.9)
place(drums, kick(1.1), 16.0, 0.9)
for i, n in enumerate((65, 68, 72, 75, 77)):
    place(music, bell(note(n), 2.8), 16.0 + i * 0.045, 0.9, pan=-0.4 + i * 0.2)
place(sfx, sparkle(1.8), 16.05, 1.0)
# CTA beats in the outro: soft kick + hats, then a final low button.
for t in (17.0, 18.0):
    place(drums, kick(0.6), t, 0.55)
for k in range(int(2.4 / (BEAT / 2))):
    place(drums, hat(), 16.5 + k * BEAT / 2, 0.35 if k % 2 else 0.5, pan=0.25)
place(music, bell(note(72), 1.6, 0.6), 17.0, 0.55, pan=0.2)
place(music, bell(note(77), 1.4, 0.6), 17.5, 0.45, pan=-0.2)
place(sfx, impact(0.5, 70, 38, 1.0), 18.5, 0.45)

# Text entrance swishes (very low, just air on the beat).
for t in TEXT_HITS:
    place(sfx, text_swish(), t - 0.08, 0.55, pan=rng.uniform(-0.3, 0.3))

# ---------------------------------------------------------------- mix
ir_room = reverb_ir(1.6, 4.0, 5000)
ir_hall = reverb_ir(3.0, 2.2, 7000)

kick_env = np.zeros(N)
for k in range(int((16.0 - 3.0) / STEP)):
    t = 3.0 + k * STEP
    if (k % 16) in (0, 7, 10):
        i = int(t * SR)
        e = np.exp(-t_axis(0.25) / 0.08)
        kick_env[i:i + len(e)] = np.maximum(kick_env[i:i + len(e)], e[: max(0, N - i)])
duck = (1 - 0.45 * kick_env)[:, None]

mix = (
    drums * 0.95
    + reverb(drums, ir_room) * 0.08
    + music * 0.9 * duck
    + reverb(music, ir_hall) * 0.22 * duck
    + pads * duck
    + reverb(pads, ir_hall) * 0.3
    + sfx * 0.85
    + reverb(sfx, ir_hall) * 0.18
)
mix = filt(mix, 'highpass', 24)
# gentle glue + soft clip
mix = np.tanh(mix * 1.15) / 1.15
fade = int(0.35 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) / 0.89

out = sys.argv[1] if len(sys.argv) > 1 else 'public/audio/ad01-temp-score.wav'
wavfile.write(out, SR, mix.astype(np.float32))
print('wrote', out, f'{DUR}s', 'peak', float(np.max(np.abs(mix))))
