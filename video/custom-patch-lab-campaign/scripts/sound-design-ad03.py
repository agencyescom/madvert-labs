"""Custom Patch Lab — Ad 03 mix: voiceover-led commercial with an original TEMP
music bed and sound design (all synthesized in scripts/sfxlib.py, no samples).

The recorded voiceover is the master. It sits at edl.voOffsetFrames, lightly
levelled, and the music (~14 dB) and effects (~9 dB) are side-chain ducked
under it. Every effect is placed from the cut list (src/ad03/edl.json) or a
spoken word (src/ad03/vo-timing.json), so picture and sound share one clock.

Writes a 48 kHz stereo float WAV plus <out>-vo.wav / <out>-bed.wav stems.
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
EDL = json.load(open(os.path.join(ROOT, 'src/ad03/edl.json')))
VO_MAP = json.load(open(os.path.join(ROOT, 'src/ad03/vo-timing.json')))
VO_FILE = os.path.join(ROOT, 'assets/source/ad03/audio/voiceover-elevenlabs.mp3')

FPS = EDL['fps']
DUR = EDL['durationInFrames'] / FPS
sfxlib.configure(DUR, seed=3003)
N, SR, rng = sfxlib.N, sfxlib.SR, sfxlib.rng
BEAT = 60 / EDL['bpm']
STEP = BEAT / 4
BAR = 4 * BEAT
VO_AT = EDL['voOffsetFrames'] / FPS
C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11 = [c / FPS for c in EDL['cuts']]


def w(i, word):
    for x in VO_MAP['phrases'][i]['words']:
        if x['w'].lower().replace('-', '').strip('.,?!') == word:
            return x['start'] + VO_AT
    raise KeyError(word)


VO_END = VO_MAP['phrases'][-1]['end'] + VO_AT


# ---------------------------------------------------------------- voiceover + side-chain
def load_vo():
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VO_FILE, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = filt(np.frombuffer(raw, np.float32).astype(float), 'highpass', 75)
    win = int(0.3 * SR)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode='same') + 1e-9)
    target = np.percentile(rms[rms > 0.01], 60)
    gain = np.clip(target / np.maximum(rms, 1e-4), 10 ** (-4 / 20), 10 ** (4 / 20))
    return x * np.convolve(gain, np.ones(win) / win, mode='same')


vo = bus()
place(vo, load_vo(), VO_AT, 1.0)
env = np.abs(vo[:, 0])
att, rel = np.exp(-1 / (0.012 * SR)), np.exp(-1 / (0.28 * SR))
side = np.zeros(N)
lvl = 0.0
for i in range(0, N, 48):
    v = env[i:i + 48].max(initial=0)
    lvl = att * lvl + (1 - att) * v if v > lvl else rel * lvl + (1 - rel) * v
    side[i:i + 48] = lvl
side = np.clip(side / (np.percentile(side[side > 1e-3], 90) + 1e-9), 0, 1)


def duck(db):
    return (10 ** (-db * side / 20))[:, None]


# ---------------------------------------------------------------- Ad 03 instruments
def needle_clatter(dur, rate=14.0):
    out = np.zeros(int(dur * SR))
    t = np.arange(len(out)) / SR
    tt = t_axis(0.03)
    for k in range(int(dur * rate)):
        i = max(0, int((k / rate + rng.uniform(-0.003, 0.003)) * SR))
        s = (filt(noise(0.03), 'bandpass', [2500, 7000]) * np.exp(-tt / 0.004) * 0.9
             + np.sin(2 * np.pi * rng.uniform(1900, 2300) * tt) * np.exp(-tt / 0.006) * 0.35
             + np.sin(2 * np.pi * 180 * tt) * np.exp(-tt / 0.01) * 0.4) * rng.uniform(0.75, 1.0)
        if 0 <= i < len(out):
            out[i:i + len(s)] += s[: len(out) - i]
    hum = (np.sin(2 * np.pi * 50 * t) * 0.5 + np.sin(2 * np.pi * 100 * t) * 0.3) * (1 + 0.15 * np.sin(2 * np.pi * rate * t))
    whirr = filt(noise(dur), 'bandpass', [600, 1800]) * (0.5 + 0.5 * np.sin(2 * np.pi * rate * t) ** 2) * 0.12
    fade = np.minimum(1, np.minimum(t / 0.06, (dur - t) / 0.2))
    return (out * 0.5 + hum * 0.08 + whirr) * fade


def thread_zip(dur=0.45):
    """Thread pulled through fabric: bright, fast upward noise sweep with grain."""
    t = t_axis(dur)
    x = svf_sweep(noise(dur), 1500, 9000, q=4.0, curve=0.8)
    grain = 0.6 + 0.4 * (np.sin(2 * np.pi * 90 * t) > 0)
    return norm(x * grain * np.sin(np.pi * t / dur) ** 1.5) * 0.4


def pencil(dur):
    return fabric(dur, density=45, bright=(2200, 9000), level=0.2)


def tick_hit(weight=1.0):
    t = t_axis(0.3)
    return (np.sin(2 * np.pi * 62 * t) * np.exp(-t / 0.1) * 0.8 * weight
            + filt(noise(0.3), 'bandpass', [1500, 6000]) * np.exp(-t / 0.008) * 0.25)


def keys(freqs, dur):
    t = t_axis(dur)
    x = sum(np.sin(2 * np.pi * f * t + 0.9 * np.exp(-t / 0.4) * np.sin(2 * np.pi * f * t)) for f in freqs)
    return x * np.exp(-t / (dur * 0.6)) * np.minimum(1, t / 0.006) * 0.08


# ---------------------------------------------------------------- music (100 BPM, E minor → resolve to G)
music, drums, sfx, pads = bus(), bus(), bus(), bus()
prog = [(note(28), [64, 67, 71, 74]), (note(24), [60, 64, 67, 71]), (note(31), [62, 67, 71, 74]), (note(26), [62, 66, 69, 72])]

place(pads, pad([note(52), note(59), note(64), note(67)], C1 + 0.5), 0.0, 0.8)
t, k = C1, 0
while t < DUR - 0.1:
    root, ch = prog[k % 4]
    place(music, keys([note(n) for n in ch], BAR + 0.3), t, 0.85, pan=0.1)
    place(pads, pad([note(n - 12) for n in ch], BAR + 0.5), t - 0.1, 0.5)
    t += BAR
    k += 1

for j in range(int((VO_END + 0.4 - C1) / STEP)):
    t = C1 + j * STEP
    step = j % 16
    root = prog[int((t - C1) // BAR) % 4][0]
    build = t >= C9  # 25.2 s on: denser hats into the CTA
    if C11 - 0.5 <= t < C11:  # breath before the brand reveal
        continue
    if step in (0, 10) or (build and step == 7):
        place(drums, kick(1.0 if step == 0 else 0.85), t, 0.85)
        place(music, sub808(root, min(STEP * (8 if step == 0 else 4), 1.2)), t, 0.8)
    if step in (4, 12):
        place(drums, clap(), t, 0.6)
    if step % 2 == 0 or (build and t < C11):
        place(drums, hat(open_=(step == 14)), t, 0.55 if step % 4 == 0 else 0.38, pan=0.25)
    elif any(0 < c - t <= 0.3 for c in (C1, C4, C5, C7, C9, C11)):
        place(drums, hat(), t, 0.35, pan=0.25)

for i in range(int((C1 - 1.0) / (BEAT / 2))):  # ticking into the first drop
    place(drums, hat(), 1.0 + i * BEAT / 2, 0.28 + 0.03 * i, pan=0.3)
place(sfx, riser(1.2, 250, 8000), C1 - 1.2, 0.5)
place(sfx, riser(1.6, 200, 9000), C11 - 1.6, 0.55)
# resolve: final G chord rings under the end card
place(music, keys([note(n) for n in (55, 62, 67, 71, 74)], DUR - VO_END), VO_END + 0.1, 1.0)
place(pads, pad([note(n) for n in (43, 50, 55, 59)], DUR - VO_END + 0.3), VO_END, 0.7)

# ---------------------------------------------------------------- sound design on picture
place(sfx, impact(1.2, 70, 28, 2.6), 0.0, 1.0)                       # opening impact, first frame
place(sfx, fabric(3.2, density=70, bright=(500, 3200), level=0.24), 0.15, 1.0, pan=0.15)  # gloves on the patch
place(sfx, text_swish(), w(1, 'something') - 0.1, 0.5)
place(sfx, tick_hit(0.7), w(1, 'amazing'), 0.45)
place(sfx, whoosh(0.5, 300, 7000), C1 - 0.36, 0.75, pan=-0.6)        # lateral match cut
place(sfx, needle_clatter(C3 - C1 + 0.2), C1, 0.55, pan=0.05)        # active stitching
place(sfx, impact(0.5, 100, 45, 0.9), C2, 0.4)
place(sfx, impact(0.55, 90, 42, 1.0), C3, 0.45)
place(sfx, text_swish(), w(3, 'stand') - 0.1, 0.55)
place(sfx, tick_hit(1.0), w(3, 'stand'), 0.6)                         # STAND OUT punch
place(sfx, thread_zip(0.5), C4 - 0.35, 0.8, pan=0.4)                 # stitched-thread reveal
place(sfx, pencil(1.3), C4, 0.9, pan=-0.2)                           # the sketch
place(sfx, impact(0.75, 85, 38, 1.4), w(5, 'no') + 0.05, 0.7)        # NO PROBLEM!
place(sfx, whoosh(0.4, 700, 8000, peak=0.7), w(5, 'no') - 0.1, 0.45, pan=0.5)  # sketch → patch wipe
place(sfx, whoosh(0.35, 3000, 400, peak=0.6), C5 - 0.25, 0.5)        # scale match
place(sfx, fabric(2.4, density=80, bright=(500, 3000), level=0.28), C5 + 0.05, 1.0, pan=-0.2)
place(sfx, text_swish(), w(8, 'unlimited') - 0.1, 0.5)
place(sfx, needle_clatter(C7 - C6), C6, 0.3, pan=0.1)
place(sfx, impact(0.85, 60, 30, 1.6), w(9, 'zero'), 0.75)             # low hit on $0
place(sfx, whoosh(0.6, 500, 9000, peak=0.65, q=1.1), C7 - 0.4, 0.65, pan=-0.4)  # editorial wipe
place(sfx, needle_clatter(C9 - C7), C7, 0.22, pan=0.1)                # machine under the trust lines
place(sfx, whoosh(0.5, 4000, 400, peak=0.7), C9 - 0.35, 0.7, pan=0.3)  # vertical whip
for i, wd in ((14, 'hats'), (14, 'jackets'), (15, 'uniforms'), (15, 'clothing')):
    place(sfx, tick_hit(0.6), w(i, wd), 0.4)                          # word montage
place(sfx, impact(0.45, 100, 50, 0.8), C10, 0.4)
place(sfx, whoosh(0.4, 700, 8000, peak=0.7), w(16, 'life') - 0.25, 0.5, pan=-0.5)  # ideas → life
place(sfx, sparkle(1.0), w(16, 'life'), 0.6)
place(sfx, thread_zip(0.5), C11 - 0.3, 0.7, pan=-0.3)
place(sfx, impact(1.05, 75, 30, 2.6), C11, 0.85)                      # brand reveal
for i, n in enumerate((67, 71, 74, 79)):
    place(music, bell(note(n), 2.4), C11 + 0.05 + i * 0.045, 0.7, pan=-0.3 + i * 0.2)
place(sfx, impact(0.6, 80, 40, 1.4), w(18, 'get'), 0.45)              # CTA lands
place(sfx, sparkle(1.2), w(18, 'free'), 0.5)
place(sfx, impact(0.5, 70, 36, 1.8), VO_END + 0.1, 0.45)              # resolve

# ---------------------------------------------------------------- mix
ir_room = reverb_ir(1.4, 4.0, 5000)
ir_hall = reverb_ir(2.6, 2.4, 7000)
bed = (drums * 0.8 + reverb(drums, ir_room) * 0.06 + music * 0.75 + reverb(music, ir_hall) * 0.18
       + pads * 0.9 + reverb(pads, ir_hall) * 0.25) * duck(14.0)
fx = (sfx + reverb(sfx, ir_hall) * 0.15) * duck(9.0)
vo_bus = vo + reverb(vo, ir_room) * 0.035

mix = vo_bus * 1.9 + bed * 0.5 + fx * 0.6
mix = filt(mix, 'highpass', 24)
mix = np.tanh(mix * 1.05) / 1.05
fade = int(0.9 * SR)  # music rings out, no abrupt stop
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.6
peak = np.max(np.abs(mix)) / 0.89
mix /= peak

out = sys.argv[1]
wavfile.write(out, SR, mix.astype(np.float32))
wavfile.write(out[:-4] + '-vo.wav', SR, (vo_bus * 1.9 / peak).astype(np.float32))
wavfile.write(out[:-4] + '-bed.wav', SR, ((bed * 0.5 + fx * 0.6) / peak).astype(np.float32))
print('wrote', out, f'{DUR}s', 'VO', VO_AT, '->', round(VO_END, 2), 's')
