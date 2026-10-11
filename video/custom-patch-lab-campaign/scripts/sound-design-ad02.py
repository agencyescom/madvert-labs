"""Custom Patch Lab — Ad 02 mix: voiceover-led, with an original TEMP music bed
and sound design (all synthesized in scripts/sfxlib.py, no samples).

The voiceover is the primary element. It is placed at edl.voOffsetFrames,
lightly cleaned (high-pass, gentle levelling), and every other bus is ducked
under it with a smoothed sidechain so the narration always sits on top.
Cut times and the VO timing map are read from src/ad02/, so picture and sound
cannot drift apart.

Writes a 48 kHz stereo float WAV (normalised afterwards by build-audio.sh) and
stems next to it: <out>-vo.wav and <out>-bed.wav.
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sfxlib  # noqa: E402
from sfxlib import *  # noqa: E402,F401,F403

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDL = json.load(open(os.path.join(ROOT, 'src/ad02/edl.json')))
VO_MAP = json.load(open(os.path.join(ROOT, 'src/ad02/vo-timing.json')))
VO_FILE = os.path.join(ROOT, 'assets/source/ad02/audio/voiceover-elevenlabs.mp3')

FPS = EDL['fps']
DUR = EDL['durationInFrames'] / FPS
sfxlib.configure(DUR, seed=2002)
N = sfxlib.N
SR = sfxlib.SR
rng = sfxlib.rng
BPM = EDL['bpm']
BEAT = 60 / BPM
STEP = BEAT / 4
VO_AT = EDL['voOffsetFrames'] / FPS
CUTS = [c / FPS for c in EDL['cuts']]  # 3.6 5.4 6.6 8.4 12.0 13.8
DROP, OUTRO = CUTS[0], CUTS[5]


def vo_word(i, w):
    for x in VO_MAP['phrases'][i]['words']:
        if x['w'].lower().strip('.,?!') == w:
            return x['start'] + VO_AT
    raise KeyError(w)


# ---------------------------------------------------------------- voiceover
def load_vo():
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VO_FILE, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(float)
    x = filt(x, 'highpass', 75)
    # gentle levelling: slow RMS follower, max 4 dB of gain change
    win = int(0.3 * SR)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode='same') + 1e-9)
    target = np.percentile(rms[rms > 0.01], 60)
    gain = np.clip(target / np.maximum(rms, 1e-4), 10 ** (-4 / 20), 10 ** (4 / 20))
    gain = np.convolve(gain, np.ones(win) / win, mode='same')
    return x * gain


vo = bus()
vo_mono = load_vo()
place(vo, vo_mono, VO_AT, 1.0)

# sidechain from the VO: fast attack, slow release
env = np.abs(vo[:, 0])
att, rel = np.exp(-1 / (0.012 * SR)), np.exp(-1 / (0.28 * SR))
side = np.zeros(N)
lvl = 0.0
for i in range(0, N, 48):  # 1 ms control rate
    v = env[i:i + 48].max(initial=0)
    lvl = att * lvl + (1 - att) * v if v > lvl else rel * lvl + (1 - rel) * v
    side[i:i + 48] = lvl
side = np.clip(side / (np.percentile(side[side > 1e-3], 90) + 1e-9), 0, 1)


def duck(depth_db):
    return (10 ** (-depth_db * side / 20))[:, None]


# ---------------------------------------------------------------- instruments (Ad 02 only)
def needle_clatter(dur, rate=14.0, level=1.0):
    """Embroidery head: needle-bar ticks at ~840 stitches/min, take-up lever
    rattle, and the motor hum under it."""
    out = np.zeros(int(dur * SR))
    t = np.arange(len(out)) / SR
    tick_t = t_axis(0.03)
    for k in range(int(dur * rate)):
        at = k / rate + rng.uniform(-0.003, 0.003)
        i = int(at * SR)
        tick = (filt(noise(0.03), 'bandpass', [2500, 7000]) * np.exp(-tick_t / 0.004) * 0.9
                + np.sin(2 * np.pi * rng.uniform(1900, 2300) * tick_t) * np.exp(-tick_t / 0.006) * 0.35)
        thunk = np.sin(2 * np.pi * 180 * tick_t) * np.exp(-tick_t / 0.01) * 0.4  # needle bar bottoming out
        s = (tick + thunk) * rng.uniform(0.75, 1.0)
        out[i:i + len(s)] += s[: len(out) - i]
    hum = (np.sin(2 * np.pi * 50 * t) * 0.5 + np.sin(2 * np.pi * 100 * t) * 0.3 + np.sin(2 * np.pi * 150 * t) * 0.12)
    hum *= 1 + 0.15 * np.sin(2 * np.pi * rate * t)
    whirr = filt(noise(dur), 'bandpass', [600, 1800]) * (0.5 + 0.5 * np.sin(2 * np.pi * rate * t) ** 2) * 0.12
    fade = np.minimum(1, np.minimum(t / 0.05, (dur - t) / 0.12))
    return (out * 0.5 + hum * 0.08 + whirr) * fade * level


def pencil(dur):
    """Graphite on paper: bright, dry granular scratches."""
    return fabric(dur, density=40, bright=(2200, 9000), level=0.18)


def pop_tick():
    t = t_axis(0.25)
    return (np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.02) * 0.3
            + np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.09) * 0.7
            + filt(noise(0.25), 'highpass', 5000) * np.exp(-t / 0.006) * 0.25)


def keys(freqs, dur):
    """Soft electric-piano chord (FM, low index) for the bed."""
    t = t_axis(dur)
    x = np.zeros(len(t))
    for f in freqs:
        idx = 0.9 * np.exp(-t / 0.4)
        x += np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) * np.exp(-t / (dur * 0.6))
    return x * np.minimum(1, t / 0.006) * 0.08


# ---------------------------------------------------------------- music bed (100 BPM, D minor)
music, drums, sfx, pads = bus(), bus(), bus(), bus()
D1, Bb0, F1, C1 = note(26), note(22), note(29), note(24)
prog = [(D1, [62, 65, 69, 72]), (Bb0, [58, 62, 65, 69]), (F1, [60, 65, 69, 72]), (C1, [60, 64, 67, 72])]
BAR = 4 * BEAT

place(pads, pad([note(50), note(57), note(62), note(65)], DROP + 0.4), 0.0, 0.8)
t = DROP
k = 0
while t < DUR - 0.2:  # one chord per bar from the drop
    root, ch = prog[k % 4]
    place(music, keys([note(n) for n in ch], BAR + 0.3), t, 0.9, pan=0.1)
    place(pads, pad([note(n - 12) for n in ch], BAR + 0.4), t - 0.1, 0.55)
    t += BAR
    k += 1

for j in range(int((DUR - DROP) / STEP)):
    t = DROP + j * STEP
    step = j % 16
    root = prog[int((t - DROP) // BAR) % 4][0]
    if OUTRO - 0.4 <= t < OUTRO:  # breath before the logo
        continue
    soft = t >= OUTRO + 3.0  # last bars thin out under the end card
    if step in (0, 10) and not soft:
        place(drums, kick(1.0 if step == 0 else 0.85), t, 0.85)
        place(music, sub808(root, min(STEP * (8 if step == 0 else 5), 1.2)), t, 0.85)
    if step in (4, 12) and not soft:
        place(drums, clap(), t, 0.6)
    if step % 2 == 0:
        place(drums, hat(open_=(step == 14)), t, (0.6 if step % 4 == 0 else 0.4) * (0.6 if soft else 1), pan=0.25)
    elif any(0 < c - t <= 0.3 for c in CUTS):
        place(drums, hat(), t, 0.35, pan=0.25)

# pre-drop: ticking hats, then a riser into the needle
for i in range(int((DROP - 1.2) / (BEAT / 2))):
    place(drums, hat(), 1.2 + i * BEAT / 2, 0.3 + 0.03 * i, pan=0.3)
place(sfx, riser(1.3, 250, 8000), DROP - 1.3, 0.55)

# ---------------------------------------------------------------- sound design on picture
place(sfx, impact(1.25, 70, 28, 2.6), 0.0, 1.0)                      # opening bass impact
place(sfx, pencil(2.3), 0.15, 0.9, pan=-0.2)                           # sketching
place(sfx, whoosh(0.4, 900, 6000, peak=0.7), vo_word(1, 'premium') - 0.45, 0.5, pan=0.5)  # split wipe
place(sfx, impact(0.8, 90, 40, 1.3), DROP, 0.75)                       # punch into the needle
place(sfx, needle_clatter(CUTS[1] - DROP + 0.15, level=1.0), DROP, 0.6, pan=0.05)
place(sfx, whoosh(0.5, 300, 7000), CUTS[1] - 0.36, 0.8, pan=-0.6)      # horizontal whip
place(sfx, fabric(1.0, density=60, bright=(800, 5000), level=0.18), CUTS[1] + 0.1, 1.0)
place(sfx, whoosh(0.65, 500, 9000, peak=0.65, q=1.1), CUTS[2] - 0.42, 0.7, pan=-0.4)  # streak wipe
place(sfx, fabric(1.8, density=90, bright=(500, 3200), level=0.3), CUTS[2] + 0.05, 1.0, pan=0.2)  # gloves lift patch
place(sfx, impact(0.6, 80, 42, 1.1), CUTS[3], 0.55)                    # punch into macro
place(sfx, fabric(3.4, density=70, bright=(500, 3000), level=0.26), CUTS[3] + 0.1, 1.0, pan=-0.15)
for w_i, w in ((4, 'free'), (5, 'zero')):                               # benefit badges
    place(sfx, pop_tick(), vo_word(w_i, w) - 0.02, 0.6)
    place(sfx, text_swish(), vo_word(w_i, w) - 0.1, 0.5)
place(sfx, whoosh(0.5, 4000, 400, peak=0.7), CUTS[4] - 0.35, 0.8, pan=0.3)  # vertical whip
place(sfx, impact(0.45, 100, 50, 0.8), CUTS[4] + 0.05, 0.45)
place(sfx, reverse_swell(0.45), OUTRO - 0.45, 0.6)
place(sfx, impact(1.1, 75, 30, 2.6), OUTRO, 0.9)                       # logo reveal
place(drums, kick(1.1), OUTRO, 0.8)
for i, n in enumerate((62, 65, 69, 72, 74)):
    place(music, bell(note(n), 2.6), OUTRO + 0.04 + i * 0.045, 0.75, pan=-0.4 + i * 0.2)
place(sfx, sparkle(1.8), OUTRO + 0.05, 0.9)
place(sfx, needle_clatter(DUR - OUTRO, level=0.22), OUTRO, 0.6, pan=0.1)   # machine behind the end card
place(sfx, pop_tick(), vo_word(7, 'free') - 0.02, 0.45)                     # CTA accent
place(sfx, impact(0.5, 70, 38, 1.0), DUR - 1.1, 0.4)                        # final button

# ---------------------------------------------------------------- mix
ir_room = reverb_ir(1.4, 4.0, 5000)
ir_hall = reverb_ir(2.6, 2.4, 7000)

bed = (
    drums * 0.8
    + reverb(drums, ir_room) * 0.06
    + music * 0.75
    + reverb(music, ir_hall) * 0.18
    + pads * 0.9
    + reverb(pads, ir_hall) * 0.25
)
bed = bed * duck(14.0)                        # music sits well under the voice
fx = (sfx + reverb(sfx, ir_hall) * 0.15) * duck(9.0)
vo_bus = vo * 1.0 + reverb(vo, ir_room) * 0.035  # a touch of room so it sits in the space

mix = vo_bus * 1.9 + bed * 0.5 + fx * 0.6
mix = filt(mix, 'highpass', 24)
mix = np.tanh(mix * 1.05) / 1.05
fade = int(0.4 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
peak = np.max(np.abs(mix)) / 0.89
mix /= peak

out = sys.argv[1]
wavfile.write(out, SR, mix.astype(np.float32))
stem = out[:-4]
wavfile.write(stem + '-vo.wav', SR, (vo_bus * 1.9 / peak).astype(np.float32))
wavfile.write(stem + '-bed.wav', SR, ((bed * 0.5 + fx * 0.6) / peak).astype(np.float32))
print('wrote', out, f'{DUR}s', 'VO at', VO_AT, 's')
