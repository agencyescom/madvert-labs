"""Custom Patch Lab — Reel 01 "Every Stitch Hits Different": cinematic embroidery ASMR.

v2 (client notes: "too loud / irritating at the start, patch sound weird,
music lower"): the machine is now soft and warm (low-passed clicks, no
metallic ping, fades in), every crack-style impact is replaced by soft low
thumps, the patch handling is realistic cloth/felt brushes timed to the hand,
and the music sits well underneath.

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


# ---------------------------------------------------------------- machine (lead, soft)
def stitch_click(weight=1.0):
    """Soft needle stroke: muted tick + warm needle-bar thump + thread pull. No metallic ping."""
    t = t_axis(0.07)
    tick = filt(noise(0.07), 'bandpass', [900, 3800]) * np.exp(-t / 0.004) * 0.45
    thunk = np.sin(2 * np.pi * 150 * t) * np.exp(-t / 0.016) * 0.7 * weight
    pull = filt(noise(0.07), 'bandpass', [400, 1300]) * np.exp(-np.maximum(t - 0.02, 0) / 0.012) * (t > 0.02) * 0.2
    return (tick + thunk + pull) * rng.uniform(0.85, 1.0)


def machine(segments):
    """segments: (start s, end s, stitch rate Hz, weight). Soft clicks + warm hum following the rate."""
    out = bus()
    for t0, t1, rate, wgt in segments:
        t = t0
        while t < t1:
            place(out, stitch_click(wgt), t + rng.uniform(-0.002, 0.002), 0.5, pan=rng.uniform(-0.06, 0.06))
            t += 1 / rate
        n = int((t1 - t0) * SR)
        tt = np.arange(n) / SR
        base = 46 * rate / 13
        hum = np.sin(2 * np.pi * base * tt) * 0.55 + np.sin(2 * np.pi * 2 * base * tt) * 0.2
        hum *= 1 + 0.12 * np.sin(2 * np.pi * rate * tt)
        whirr = filt(noise(t1 - t0), 'bandpass', [350, 1100]) * (0.5 + 0.5 * np.sin(np.pi * rate * tt) ** 2) * 0.07
        fade = np.minimum(1, np.minimum(tt / 0.05, (t1 - t0 - tt) / 0.05))
        place(out, (hum * 0.08 + whirr) * fade, t0, 1.0)
    return filt(out, 'lowpass', 5000)


mach = machine([
    (0.0, fr(180), 13.0, 1.0),
    (fr(180), fr(220), 9.75, 1.0),
    (fr(220), fr(240), 13.0, 0.9),
    (fr(243), fr(296), 5.6, 1.2),
])


# ---------------------------------------------------------------- effects (soft)
def soft_hit(size=1.0, dur=1.2):
    """Rounded low thump, no transient crack."""
    t = t_axis(dur)
    f = 44 + 36 * np.exp(-t / 0.06)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.35 * size))
    return body * np.minimum(1, t / 0.006) * 0.7


def air(dur=0.5, f0=400, f1=3000):
    """Gentle air swish, low-passed so it never hisses."""
    return filt(whoosh(dur, f0, f1, peak=0.6, q=0.9), 'lowpass', 5000) * 0.6


def snip():
    """Thread cut: two soft blade closes, low-passed."""
    t = t_axis(0.2)
    a = filt(noise(0.2), 'bandpass', [2000, 6500]) * np.exp(-t / 0.004)
    out = a + np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.015) * 0.15
    out[int(0.035 * SR):] += a[: len(out) - int(0.035 * SR)] * 0.7
    return filt(out, 'lowpass', 7000) * 0.55


def cloth(dur=0.6, lo=250, hi=1800, level=0.3):
    """Fabric / felt brush: smooth band-limited pink noise with a bell envelope (no grainy crackle)."""
    t = t_axis(dur)
    x = norm(filt(pink(dur), 'bandpass', [lo, hi]))
    env = np.sin(np.pi * t / dur) ** 2
    return x * env * level


def felt_tap():
    """Fingertips settling on the patch: soft low tap."""
    t = t_axis(0.12)
    return (np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.02) * 0.6 + filt(noise(0.12), 'bandpass', [300, 1200]) * np.exp(-t / 0.012) * 0.2)


fx = bus()
place(fx, soft_hit(1.0, 1.4), H1, 0.55)                               # H1: soft low accent, no crack
place(fx, air(0.4, 300, 2500), fr(60) - 0.28, 0.3)                     # punch-in
place(fx, soft_hit(0.7, 1.0), H2, 0.4)                                # H2
place(fx, air(0.45, 300, 3000), fr(176) - 0.2, 0.35, pan=-0.5)        # lateral whip
place(fx, soft_hit(0.6, 0.9), fr(220), 0.3)
place(fx, soft_hit(0.8, 1.1), H3, 0.4)                                # H3
place(fx, riser(1.2, 200, 3500), H4 - 1.2, 0.18)                      # quiet build
place(fx, snip(), H4 - 0.02, 0.8)                                     # thread cut
place(fx, soft_hit(1.2, 2.0), H4 + 0.03, 0.5)
place(fx, filt(sparkle(1.4), 'lowpass', 7000), REVEAL + 0.05, 0.35)   # reveal shimmer
for i, n in enumerate((62, 66, 69, 74)):
    place(fx, bell(note(n), 2.6, 0.4), REVEAL + 0.1 + i * 0.06, 0.25, pan=-0.3 + i * 0.2)
# patch handling, timed to the hand in video 2 (frames measured from the footage)
place(fx, cloth(0.7, 200, 1500, 0.25), fr(388), 1.0, pan=0.3)         # hand slides in on the table
place(fx, felt_tap(), fr(408), 0.5, pan=0.3)                          # fingertips touch the patch edge
place(fx, cloth(0.5, 300, 2000, 0.22), fr(412), 1.0, pan=0.25)        # grip
place(fx, cloth(0.9, 250, 1600, 0.22), fr(428), 1.0, pan=0.2)         # patch lifts off the surface
place(fx, felt_tap(), fr(455), 0.35, pan=0.2)                         # thumb settles
place(fx, cloth(1.2, 200, 1200, 0.14), fr(470), 1.0, pan=0.15)        # held, slight movement
place(fx, air(0.35, 400, 2800), H5 - 0.22, 0.3)                       # HITS DIFFERENT.
place(fx, soft_hit(0.9, 1.3), H5, 0.45)
place(fx, filt(sparkle(1.0), 'lowpass', 7000), fr(468), 0.3)          # logo
place(fx, bell(note(74), 2.0, 0.35), fr(470), 0.25)

# ---------------------------------------------------------------- music (low, TEMP, original)
music = bus()
BEAT = 60 / EDL['bpm']
place(music, pad([note(n) for n in (50, 57, 62, 65)], REVEAL + 0.3), 0.0, 0.5)
place(music, pad([note(n) for n in (46, 53, 58, 62, 65)], DUR - REVEAL + 0.2), REVEAL - 0.1, 0.6)
t = 0.0
while t < H4 - 0.2:
    place(music, sub808(note(26), 0.3), t, 0.18)
    t += BEAT * 2
music = filt(music, 'lowpass', 3500)

# ---------------------------------------------------------------- mix + automation
ir_room = reverb_ir(1.0, 5.0, 5000)
ir_hall = reverb_ir(2.6, 2.2, 6000)
tt = np.arange(N) / SR
mach_gain = np.where(tt < H4, 1.0, 0.0) * np.clip(tt / 0.5, 0, 1)  # fades in over 0.5 s, stops on the cut
w = int(0.02 * SR)
mach_gain = np.convolve(mach_gain, np.ones(w) / w, mode='same')[:, None]
music_gain = (0.35 + 0.15 * np.clip((tt - REVEAL) / 0.8, 0, 1))[:, None]
mix = (mach * 0.75 * mach_gain + reverb(mach, ir_room) * 0.07 * mach_gain
       + fx * 0.8 + reverb(fx, ir_hall) * 0.14
       + music * music_gain + reverb(music, ir_hall) * 0.12 * music_gain)
mix = filt(mix, 'highpass', 30)
mix = filt(mix, 'lowpass', 12000)
mix = np.tanh(mix * 1.0)
fade_in = int(0.25 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
fade = int(0.8 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) / 0.89
out = sys.argv[1]
wavfile.write(out, SR, mix.astype(np.float32))
print('wrote', out, f'{DUR}s')
