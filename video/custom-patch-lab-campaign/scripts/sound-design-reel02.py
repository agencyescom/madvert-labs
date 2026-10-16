"""Custom Patch Lab — Reel 02 "From Logo to Legend": daf rhythm + natural sound design.

NO MUSIC (client requirement): no melodic or harmonic instruments, no synth
pads, bass notes, bells, chimes or tonal risers. The only rhythm is a daf
(frame drum, without jingles); everything else is natural foley — stylus
taps, stitching, thread cut, fabric, air — plus soft low impacts.

Built in the Reel 01 v2 style the client approved: soft, rounded hits (no
crack transients), low-passed whooshes. Everything is synthesized here and in
scripts/sfxlib.py (no samples). Hits are placed from src/reel02/edl.json so
picture and sound share one clock. No voiceover.
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
    """Stylus on glass: a short unpitched tick (filtered noise only, no ringing tone)."""
    t = t_axis(0.06)
    x = filt(noise(0.06), 'bandpass', [1800, 6000]) * np.exp(-t / 0.0035) * 0.6
    x += filt(noise(0.06), 'bandpass', [300, 900]) * np.exp(-t / 0.008) * 0.25
    return filt(x, 'lowpass', 7000) * 0.6


def ui_click():
    """Soft tap-click (non-tonal): two short filtered noise ticks, like a fingertip on glass."""
    out = np.zeros(int(0.15 * SR))
    for at in (0.0, 0.05):
        t = t_axis(0.03)
        x = filt(noise(0.03), 'bandpass', [1500, 5000]) * np.exp(-t / 0.003) * 0.45
        i = int(at * SR)
        out[i:i + len(x)] += x[: len(out) - i]
    return filt(out, 'lowpass', 6500)


def air_swell(dur, lo=300, hi=3500):
    """Breath-like noise swell (replaces tonal risers): band-limited noise rising in level and brightness."""
    t = t_axis(dur)
    x = svf_sweep(noise(dur), lo, hi, q=0.8, curve=1.4)
    return filt(norm(x) * (t / dur) ** 2.2, 'lowpass', 5000) * 0.5


# ---------------------------------------------------------------- daf (frame drum, no jingles)
def daf_dum(weight=1.0):
    """Centre stroke: deep membrane boom with a soft skin attack."""
    t = t_axis(0.9)
    f = 68 + 24 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    over = np.sin(2 * np.pi * np.cumsum(f * 1.59) / SR) * np.exp(-t / 0.08) * 0.25  # membrane mode
    skin = filt(noise(0.9), 'bandpass', [200, 1200]) * np.exp(-t / 0.012) * 0.35
    return (body + over + skin) * np.minimum(1, t / 0.002) * 0.8 * weight


def daf_tak(weight=1.0):
    """Rim stroke: dry, bright slap near the frame edge."""
    t = t_axis(0.25)
    slap = filt(noise(0.25), 'bandpass', [900, 4500]) * np.exp(-t / 0.018)
    ring = np.sin(2 * np.pi * 410 * t) * np.exp(-t / 0.03) * 0.3 + np.sin(2 * np.pi * 690 * t) * np.exp(-t / 0.02) * 0.15
    return filt(slap * 0.7 + ring, 'lowpass', 7000) * 0.55 * weight


def daf_ka(weight=1.0):
    """Light finger tap / ghost note."""
    t = t_axis(0.12)
    return filt(noise(0.12), 'bandpass', [1200, 5000]) * np.exp(-t / 0.01) * 0.25 * weight


def daf_roll(dur=0.6):
    """Finger roll building into a stroke."""
    out = np.zeros(int(dur * SR))
    n = int(dur * 22)
    for i in range(n):
        at = i / 22
        s_ = daf_ka(0.4 + 0.6 * i / n)
        j = int(at * SR)
        out[j:j + len(s_)] += s_[: len(out) - j]
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
place(fx, daf_dum(1.0), H1, 0.7)                                      # H1: daf stroke on the click
for t in (fr(34), fr(48), fr(61)):                                     # stylus taps while the designer works
    place(fx, stylus_tap(), t, 0.6, pan=0.35)
place(fx, air(0.5, 300, 2600), fr(87) - 0.3, 0.35)                     # cut to the eye
place(fx, air_swell(1.1, 250, 3000), fr(87), 0.3)                     # digital push into the eye (breath-like swell)
place(fx, stitch_stroke(1.3), CUT_EYE, 0.9)                            # H2: the crisp stitch on the match cut
place(fx, soft_hit(1.1, 1.6), CUT_EYE, 0.5)
place(fx, machine(CUT_EYE + 0.05, CUT_HERO - 0.1, 12.0) * 1.0, 0.0, 0.5)  # embroidery rhythm under the macro
place(fx, snip(), CUT_HERO - 0.03, 0.7)                                # thread cut into the hero
place(fx, soft_hit(0.8, 1.2), CUT_HERO, 0.4)
place(fx, cloth(0.8, 220, 1600, 0.25), CUT_HERO + 0.15, 1.0, pan=0.2)  # hand holds the patch
place(fx, soft_hit(0.6, 0.9), H3, 0.35)                                # H3 macro accent
place(fx, cloth(0.35, 600, 3500, 0.18), H3, 1.0)                      # thread texture brush
place(fx, air(0.4, 400, 3200), CUT_CAP - 0.25, 0.4, pan=-0.4)          # into CAPS
place(fx, soft_hit(0.8, 1.0), CUT_CAP, 0.45)
place(fx, soft_hit(1.0, 1.2), CUT_JACKET, 0.55)                        # H4 match cut → JACKETS
place(fx, cloth(0.9, 250, 1800, 0.22), CUT_JACKET + 0.2, 1.0, pan=0.25)  # jacket moves
place(fx, air(0.5, 300, 3500), CUT_BAG - 0.3, 0.5, pan=0.5)            # editorial wipe → BAGS
place(fx, soft_hit(0.7, 1.0), CUT_BAG, 0.4)
place(fx, cloth(0.7, 200, 1400, 0.2), CUT_BAG + 0.3, 1.0, pan=-0.2)
place(fx, air_swell(1.0, 250, 3200), CUT_END - 1.0, 0.3)
place(fx, soft_hit(1.3, 2.0), CUT_END, 0.6)                            # H5 brand hit
place(fx, cloth(0.5, 400, 2500, 0.18), CUT_END + fr(2), 1.0)          # logo: soft fabric reveal
place(fx, ui_click(), CUT_END + fr(50), 0.4)                           # URL chip

# ---------------------------------------------------------------- daf rhythm (the only rhythm; no music)
daf = bus()
STEP = BEAT / 2  # 8th notes at 112 BPM
# maqsum-style bar: DUM tak . tak DUM . tak .   (D = dum, T = tak, k = ghost)
BAR_PATTERN = ['D', 'T', 'k', 'T', 'D', 'k', 'T', 'k']
SPARSE = ['D', None, None, None, 'D', None, None, None]
t0 = CUT_EYE  # the hook stays natural sound only; the daf enters on the transformation
for j in range(int((DUR - t0) / STEP)):
    t = t0 + j * STEP
    if t > DUR - 1.3 or (CUT_END - 0.5 <= t < CUT_END):
        continue  # breath before the brand hit, and silence under the final read
    pat = SPARSE if t < CUT_HERO else BAR_PATTERN  # sparse under the eye macro, full groove from the hero
    hit = pat[j % 8]
    pan = rng.uniform(-0.12, 0.12)
    if hit == 'D':
        place(daf, daf_dum(1.0 if j % 8 == 0 else 0.8), t, 0.75, pan=pan)
    elif hit == 'T':
        place(daf, daf_tak(0.9), t, 0.6, pan=pan)
    elif hit == 'k' and t >= CUT_CAP:
        place(daf, daf_ka(1.0), t, 0.5, pan=pan)
# accents on the product cuts and the brand payoff
for c in (CUT_CAP, CUT_JACKET, CUT_BAG):
    place(daf, daf_roll(0.45), c - 0.45, 0.6)
place(daf, daf_roll(0.6), CUT_END - 0.6, 0.7)
place(daf, daf_dum(1.2), CUT_END, 0.85)                                 # brand hit
place(daf, daf_tak(1.0), CUT_END + fr(18), 0.6)                         # OUR CRAFT.
place(daf, daf_dum(0.9), CUT_END + fr(18) + 0.02, 0.5)
place(daf, daf_dum(0.8), DUR - 1.2, 0.5)                                # final stroke under the read

# natural room tone under everything (quiet workshop air)
room = filt(pink(DUR), 'bandpass', [120, 900])
room = np.stack([room, np.roll(room, 977)], 1)
room = room / np.max(np.abs(room)) * 0.012

# ---------------------------------------------------------------- mix
ir_room = reverb_ir(1.1, 4.5, 5000)
ir_hall = reverb_ir(2.5, 2.3, 6000)
tt = np.arange(N) / SR
daf_gain = (0.55 + 0.15 * np.clip((tt - CUT_CAP) / 1.0, 0, 1))[:, None]
mix = fx * 0.85 + reverb(fx, ir_hall) * 0.13 + daf * daf_gain + reverb(daf, ir_room) * 0.12 * daf_gain + room
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
