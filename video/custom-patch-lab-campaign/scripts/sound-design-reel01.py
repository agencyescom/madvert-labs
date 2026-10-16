"""Custom Patch Lab — Reel 01 "Every Stitch Hits Different": cinematic embroidery ASMR.

The embroidery machine is the lead instrument: needle-bar clicks at the stitch
rate, take-up rattle, motor hum. The stitch rate follows the picture's speed
(real time 13 Hz → 0.75x ramp → 0.43x "final stitch" → stop on the cut).
Music is a minimal original pad + sub pulse underneath (TEMP; everything here
is synthesized in scripts/sfxlib.py, no samples). Hits are placed from
src/reel01/edl.json so sound and picture share one clock. No voiceover.
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
EDL = json.load(open(os.path.join(ROOT, 'src/reel01/edl.json')))
FPS = EDL['fps']
DUR = EDL['durationInFrames'] / FPS
sfxlib.configure(DUR, seed=1801)
N, SR, rng = sfxlib.N, sfxlib.SR, sfxlib.rng
fr = lambda f: f / FPS  # noqa: E731
H1, H2, H3, H4, H5 = [fr(h) for h in EDL['hyperframes']]
REVEAL, PAYOFF = fr(300), fr(420)


# ---------------------------------------------------------------- machine (lead)
def stitch_click(weight=1.0, bright=1.0):
    t = t_axis(0.06)
    tick = filt(noise(0.06), 'bandpass', [2200 * bright, 7500]) * np.exp(-t / 0.0035)
    ping = np.sin(2 * np.pi * rng.uniform(1900, 2250) * t) * np.exp(-t / 0.008) * 0.3
    thunk = np.sin(2 * np.pi * 170 * t) * np.exp(-t / 0.012) * 0.55 * weight  # needle bar bottoming out
    pull = filt(noise(0.06), 'bandpass', [500, 1600]) * np.exp(-np.maximum(t - 0.018, 0) / 0.01) * (t > 0.018) * 0.25  # thread pull-through
    return (tick * 0.8 + ping + thunk + pull) * rng.uniform(0.8, 1.0)


def machine(segments):
    """segments: list of (start s, end s, stitch rate Hz, weight). Clicks + hum whose pitch follows the rate."""
    out = bus()
    for t0, t1, rate, wgt in segments:
        t = t0
        while t < t1:
            place(out, stitch_click(wgt, 1.0 if rate > 8 else 0.8), t + rng.uniform(-0.002, 0.002), 0.55, pan=rng.uniform(-0.08, 0.08))
            t += 1 / rate
        n = int((t1 - t0) * SR)
        tt = np.arange(n) / SR
        base = 48 * rate / 13
        hum = (np.sin(2 * np.pi * base * tt) * 0.5 + np.sin(2 * np.pi * 2 * base * tt) * 0.3 + np.sin(2 * np.pi * 3 * base * tt) * 0.1)
        hum *= 1 + 0.2 * np.sin(2 * np.pi * rate * tt)
        whirr = filt(noise(t1 - t0), 'bandpass', [500, 1700]) * (0.4 + 0.6 * np.sin(np.pi * rate * tt) ** 2) * 0.12
        fade = np.minimum(1, np.minimum(tt / 0.03, (t1 - t0 - tt) / 0.03))
        place(out, (hum * 0.07 + whirr) * fade, t0, 1.0)
    return out


mach = machine([
    (0.0, fr(180), 13.0, 1.0),          # real time
    (fr(180), fr(220), 9.75, 1.0),       # 0.75x ramp
    (fr(220), fr(240), 13.0, 0.9),       # rhythm cut, real time
    (fr(243), fr(296), 5.6, 1.25),       # the final stitch, slowed: heavier, slower thunks
])


# ---------------------------------------------------------------- effects
def snip():
    """Thread cut: two blade clicks + a tight high snap."""
    t = t_axis(0.25)
    a = filt(noise(0.25), 'bandpass', [3000, 11000]) * np.exp(-t / 0.003)
    blade = np.sin(2 * np.pi * 3400 * t) * np.exp(-t / 0.02) * 0.35 + np.sin(2 * np.pi * 5100 * t) * np.exp(-t / 0.012) * 0.2
    out = a + blade
    out[int(0.04 * SR):] += (a[: len(out) - int(0.04 * SR)] * 0.8)
    return out * 0.8


def low_hit(size=1.0, dur=1.6):
    t = t_axis(dur)
    f = 38 + 50 * np.exp(-t / 0.08)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.5 * size)) * 0.8


def tight_impact():
    t = t_axis(0.35)
    return (np.tanh(np.sin(2 * np.pi * np.cumsum(60 + 90 * np.exp(-t / 0.02)) / SR) * 2) * np.exp(-t / 0.08)
            + filt(noise(0.35), 'bandpass', [1200, 6000]) * np.exp(-t / 0.01) * 0.3) * 0.75


fx = bus()
place(fx, tight_impact(), H1, 0.9)                                    # H1 orange impact on first needle hit
place(fx, low_hit(1.0, 1.4), H1, 0.6)
place(fx, whoosh(0.25, 600, 6000, peak=0.7), fr(60) - 0.18, 0.45)     # punch-in
place(fx, tight_impact(), H2, 0.6)                                    # H2 navy thread frame
place(fx, whoosh(0.22, 4000, 900, peak=0.5), H2 + 0.07, 0.3, pan=0.4)
place(fx, whoosh(0.35, 300, 7000), fr(176) - 0.1, 0.55, pan=-0.6)     # lateral whip
place(fx, tight_impact(), fr(220), 0.45)                              # rhythm cut
place(fx, tight_impact(), H3, 0.7)                                    # H3 freeze
place(fx, low_hit(0.8, 1.2), H3, 0.45)
place(fx, fabric(1.2, density=30, bright=(1500, 7000), level=0.12), fr(243), 1.0)  # thread movement
place(fx, riser(1.4, 200, 6000), H4 - 1.4, 0.35)                      # quiet build to the cut
place(fx, snip(), H4 - 0.02, 1.0)                                     # THREAD CUT on the ivory flash
place(fx, low_hit(1.3, 2.4), H4 + 0.03, 0.7)
place(fx, reverse_swell(0.5), REVEAL - 0.5, 0.25)
place(fx, sparkle(1.6), REVEAL + 0.05, 0.5)                           # delicate reveal shimmer
for i, n in enumerate((62, 66, 69, 74)):
    place(fx, bell(note(n), 2.6, 0.5), REVEAL + 0.1 + i * 0.06, 0.35, pan=-0.3 + i * 0.2)
place(fx, fabric(4.0, density=50, bright=(400, 2600), level=0.22), fr(375), 1.0, pan=0.25)  # hand lifts the patch
place(fx, whoosh(0.3, 500, 6000, peak=0.75), H5 - 0.2, 0.45)          # HITS DIFFERENT.
place(fx, tight_impact(), H5, 0.75)
place(fx, low_hit(0.9, 1.4), H5, 0.5)
place(fx, sparkle(1.2), fr(468), 0.45)                                # logo
place(fx, bell(note(74), 2.0, 0.4), fr(470), 0.35)
place(fx, low_hit(0.6, 1.4), fr(480), 0.3)

# ---------------------------------------------------------------- minimal music (TEMP, original)
music = bus()
BEAT = 60 / EDL['bpm']
place(music, pad([note(n) for n in (50, 57, 62, 65)], REVEAL + 0.3), 0.0, 0.55)
place(music, pad([note(n) for n in (46, 53, 58, 62, 65)], DUR - REVEAL + 0.2), REVEAL - 0.1, 0.7)
t = 0.0
while t < H4 - 0.2:                      # sub pulse on the beat under the machine
    place(music, sub808(note(26), 0.3), t, 0.35)
    t += BEAT
t = PAYOFF
while t < DUR - 0.9:
    place(music, kick(0.7), t, 0.45)
    place(music, sub808(note(22), 0.45), t, 0.4)
    t += BEAT * 2

# ---------------------------------------------------------------- mix + automation
ir_room = reverb_ir(1.0, 5.0, 6000)
ir_hall = reverb_ir(2.6, 2.2, 7000)
tt = np.arange(N) / SR
mach_gain = np.where(tt < H4, 1.0, 0.0)
mach_gain = np.convolve(mach_gain, np.ones(int(0.02 * SR)) / int(0.02 * SR), mode='same')[:, None]  # hard stop on the cut, de-clicked
music_gain = (0.55 + 0.45 * np.clip((tt - REVEAL) / 0.6, 0, 1))[:, None]  # music opens up on the reveal
mix = (mach * 1.0 * mach_gain + reverb(mach, ir_room) * 0.08 * mach_gain
       + fx * 0.85 + reverb(fx, ir_hall) * 0.16
       + music * music_gain + reverb(music, ir_hall) * 0.2)
mix = filt(mix, 'highpass', 26)
mix = np.tanh(mix * 1.05) / 1.05
fade = int(0.7 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) / 0.89
out = sys.argv[1]
wavfile.write(out, SR, mix.astype(np.float32))
print('wrote', out, f'{DUR}s')
