"""Custom Patch Lab — Reel 02 "From Logo to Legend": sound design + low music bed.

Built in the Reel 01 v2 style the client approved: soft, rounded hits (no
crack transients), low-passed whooshes, realistic soft foley, and music kept
well underneath. Everything is synthesized in scripts/sfxlib.py (no samples,
no third-party music; the bed is TEMP). Hits are placed from
src/reel02/edl.json so picture and sound share one clock. No voiceover.
"""
import json
import os
import sys

import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sfxlib  # noqa: E402
from sfxlib import *  # noqa: E402,F401,F403

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDL = json.load(open(os.path.join(ROOT, 'src/reel02/edl.json')))
FPS = EDL['fps']
DUR = EDL['durationInFrames'] / FPS
sfxlib.configure(DUR, seed=2202)
N, SR, rng = sfxlib.N, sfxlib.SR, sfxlib.rng
fr = lambda f: f / FPS  # noqa: E731
H1, H2, H3, H4, H5 = [fr(h) for h in EDL['hyperframes']]
CUT_EYE, CUT_HERO, CUT_CAP, CUT_JACKET, CUT_BAG, CUT_END = (fr(x) for x in (124, 210, 330, 400, 470, 540))
BEAT = 60 / EDL['bpm']


# ---------------------------------------------------------------- soft palette
def soft_hit(size=1.0, dur=1.2):
    t = t_axis(dur)
    f = 46 + 38 * np.exp(-t / 0.06)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.33 * size)) * np.minimum(1, t / 0.006) * 0.7


def air(dur=0.45, f0=350, f1=3000):
    return filt(whoosh(dur, f0, f1, peak=0.65, q=0.9), 'lowpass', 5000) * 0.6


def stylus_tap():
    """Glass tap of a stylus: short, damped, low-passed."""
    t = t_axis(0.08)
    x = (np.sin(2 * np.pi * 1500 * t) * np.exp(-t / 0.006) * 0.35
         + filt(noise(0.08), 'bandpass', [1200, 4500]) * np.exp(-t / 0.004) * 0.5)
    return filt(x, 'lowpass', 6000) * 0.6


def ui_click():
    """Soft UI confirm: two quick sine blips, rounded."""
    out = np.zeros(int(0.2 * SR))
    for at, f0 in ((0.0, 880), (0.07, 1320)):
        t = t_axis(0.12)
        s = np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.03) * np.minimum(1, t / 0.003) * 0.35
        i = int(at * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    return out


def stitch_stroke(weight=1.0):
    t = t_axis(0.09)
    tick = filt(noise(0.09), 'bandpass', [900, 3600]) * np.exp(-t / 0.005) * 0.5
    thunk = np.sin(2 * np.pi * 150 * t) * np.exp(-t / 0.018) * 0.75 * weight
    pull = filt(noise(0.09), 'bandpass', [400, 1300]) * np.exp(-np.maximum(t - 0.025, 0) / 0.015) * (t > 0.025) * 0.25
    return filt(tick + thunk + pull, 'lowpass', 5000)


def machine(t0, t1, rate=12.0):
    out = bus()
    t = t0
    while t < t1:
        place(out, stitch_stroke(0.9) * rng.uniform(0.85, 1), t, 0.45)
        t += 1 / rate
    return out


def snip():
    t = t_axis(0.2)
    a = filt(noise(0.2), 'bandpass', [2000, 6500]) * np.exp(-t / 0.004)
    out = a + np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.015) * 0.15
    out[int(0.035 * SR):] += a[: len(out) - int(0.035 * SR)] * 0.7
    return filt(out, 'lowpass', 7000) * 0.5


def cloth(dur=0.6, lo=250, hi=1800, level=0.3):
    t = t_axis(dur)
    return norm(filt(pink(dur), 'bandpass', [lo, hi])) * np.sin(np.pi * t / dur) ** 2 * level


# ---------------------------------------------------------------- effects on picture
fx = bus()
place(fx, ui_click(), H1 - 0.01, 0.8)                                  # H1: crisp-but-soft digital click
place(fx, soft_hit(0.9, 1.2), H1, 0.45)
for t in (fr(34), fr(48), fr(61)):                                     # stylus taps while the designer works
    place(fx, stylus_tap(), t, 0.6, pan=0.35)
place(fx, air(0.5, 300, 2600), fr(87) - 0.3, 0.35)                     # cut to the eye
place(fx, filt(riser(1.1, 200, 3000), 'lowpass', 4000), fr(87), 0.22)  # digital push into the eye
place(fx, stitch_stroke(1.3), CUT_EYE, 0.9)                            # H2: the crisp stitch on the match cut
place(fx, soft_hit(1.1, 1.6), CUT_EYE, 0.5)
place(fx, machine(CUT_EYE + 0.05, CUT_HERO - 0.1, 12.0) * 1.0, 0.0, 0.5)  # embroidery rhythm under the macro
place(fx, snip(), CUT_HERO - 0.03, 0.7)                                # thread cut into the hero
place(fx, soft_hit(0.8, 1.2), CUT_HERO, 0.4)
place(fx, cloth(0.8, 220, 1600, 0.25), CUT_HERO + 0.15, 1.0, pan=0.2)  # hand holds the patch
place(fx, soft_hit(0.6, 0.9), H3, 0.35)                                # H3 macro accent
place(fx, filt(sparkle(1.0), 'lowpass', 7000), H3, 0.25)
place(fx, air(0.4, 400, 3200), CUT_CAP - 0.25, 0.4, pan=-0.4)          # into CAPS
place(fx, soft_hit(0.8, 1.0), CUT_CAP, 0.45)
place(fx, soft_hit(1.0, 1.2), CUT_JACKET, 0.55)                        # H4 match cut → JACKETS
place(fx, cloth(0.9, 250, 1800, 0.22), CUT_JACKET + 0.2, 1.0, pan=0.25)  # jacket moves
place(fx, air(0.5, 300, 3500), CUT_BAG - 0.3, 0.5, pan=0.5)            # editorial wipe → BAGS
place(fx, soft_hit(0.7, 1.0), CUT_BAG, 0.4)
place(fx, cloth(0.7, 200, 1400, 0.2), CUT_BAG + 0.3, 1.0, pan=-0.2)
place(fx, filt(riser(1.0, 200, 3500), 'lowpass', 4500), CUT_END - 1.0, 0.25)
place(fx, soft_hit(1.3, 2.0), CUT_END, 0.6)                            # H5 brand hit
place(fx, filt(sparkle(1.3), 'lowpass', 7000), CUT_END + fr(2), 0.3)   # logo
for i, n in enumerate((64, 68, 71, 76)):
    place(fx, bell(note(n), 2.4, 0.4), CUT_END + fr(18) + i * 0.05, 0.25, pan=-0.3 + i * 0.2)  # OUR CRAFT.
place(fx, ui_click(), CUT_END + fr(50), 0.4)                           # URL chip

# ---------------------------------------------------------------- music (low groove, TEMP, original)
music = bus()
chords = [(note(28), [64, 67, 71]), (note(24), [60, 64, 67]), (note(31), [62, 67, 71]), (note(26), [62, 66, 69])]
BAR = 4 * BEAT
t, k = 0.0, 0
while t < DUR:
    root, ch = chords[k % 4]
    place(music, pad([note(n - 12) for n in ch], BAR + 0.4), t - 0.1, 0.45)
    t += BAR
    k += 1
groove_from = CUT_EYE  # groove enters on the transformation; intro is pad only
for j in range(int((DUR - groove_from) / (BEAT / 4))):
    t = groove_from + j * BEAT / 4
    step = j % 16
    if t > DUR - 1.4:
        break
    root = chords[int(t // BAR) % 4][0]
    if step in (0, 10):
        place(music, kick(0.75), t, 0.5)
        place(music, sub808(root, BEAT * 0.9), t, 0.35)
    if step in (4, 12) and t >= CUT_CAP:
        place(music, clap(), t, 0.25)
    if step % 2 == 0 and t >= CUT_HERO:
        place(music, hat(), t, 0.22 if step % 4 == 0 else 0.14, pan=0.25)
music = filt(music, 'lowpass', 6000)

# ---------------------------------------------------------------- mix
ir_room = reverb_ir(1.1, 4.5, 5000)
ir_hall = reverb_ir(2.5, 2.3, 6000)
tt = np.arange(N) / SR
music_gain = (0.4 + 0.1 * np.clip((tt - CUT_CAP) / 1.0, 0, 1))[:, None]
mix = fx * 0.85 + reverb(fx, ir_hall) * 0.13 + music * music_gain + reverb(music, ir_room) * 0.08 * music_gain
mix = filt(mix, 'highpass', 30)
mix = filt(mix, 'lowpass', 12000)
mix = np.tanh(mix)
fi = int(0.2 * SR)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fade = int(0.9 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) / 0.89
out = sys.argv[1]
wavfile.write(out, SR, mix.astype(np.float32))
print('wrote', out, f'{DUR}s')
