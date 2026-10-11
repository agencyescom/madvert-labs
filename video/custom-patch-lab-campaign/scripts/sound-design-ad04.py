"""Custom Patch Lab — Ad 04 (3D puff / VYBE) music + sound design. No voiceover.

Original TEMP score (120 BPM, energetic streetwear bed) and effects, all
synthesized in scripts/sfxlib.py, no samples. Every hit is placed from the
picture's cut list (src/ad04/edl.json) or a physical action frame noted
below, so audio and animation share one clock.

Writes a 48 kHz stereo float WAV (normalised by build-audio.sh).
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
EDL = json.load(open(os.path.join(ROOT, 'src/ad04/edl.json')))
FPS = EDL['fps']
DUR = EDL['durationInFrames'] / FPS
sfxlib.configure(DUR, seed=4004)
N, SR, rng = sfxlib.N, sfxlib.SR, sfxlib.rng
BEAT = 60 / EDL['bpm']
STEP = BEAT / 4
BAR = 4 * BEAT
fr = lambda f: f / FPS  # noqa: E731
CUT_PRESS, CUT_PRESS2, CUT_LIFT, CUT_PEEL, CUT_MACRO, CUT_JACKET, CUT_TOUCH, CUT_MONTAGE, CUT_CTA = [fr(c) for c in EDL['cuts']]
PRESS_CLOSE = fr(105)  # platen meets the jacket (Ad04.tsx PRESS_CLOSE)
PUFF_PRESS = fr(450)   # fingers press the stitching (Ad04.tsx PUFF_PRESS)
END = DUR


# ---------------------------------------------------------------- Ad 04 effects
def press_click():
    """Heat-press handle latch: two-stage metallic click."""
    t = t_axis(0.12)
    a = filt(noise(0.12), 'bandpass', [2500, 8000]) * np.exp(-t / 0.004)
    b = np.sin(2 * np.pi * 1300 * t) * np.exp(-t / 0.012) * 0.5
    out = a + b
    out[int(0.035 * SR):] += (a[: len(out) - int(0.035 * SR)] * 0.6)
    return out * 0.6


def press_thump():
    """Platen closing on the jacket: padded low thump + mechanical clack."""
    t = t_axis(0.6)
    low = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.12)
    clack = filt(noise(0.6), 'bandpass', [800, 3500]) * np.exp(-t / 0.02) * 0.5
    return np.tanh((low + clack) * 1.6) * 0.8


def steam(dur):
    t = t_axis(dur)
    x = filt(noise(dur), 'highpass', 3500) * 0.25
    env = np.minimum(1, t / 0.08) * np.exp(-t / (dur * 0.5))
    return x * env


def peel(dur):
    """Carrier film peeling off: sticky crackle whose density follows a peel envelope."""
    t = t_axis(dur)
    out = np.zeros(len(t))
    speed = 0.4 + 0.6 * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.7
    n = int(dur * 260)
    for _ in range(n):
        at = rng.uniform(0, dur)
        if rng.uniform() > speed[int(at * SR) - 1]:
            continue
        ln = rng.uniform(0.002, 0.008)
        s = filt(noise(ln + 0.01), 'bandpass', [rng.uniform(1500, 3000), rng.uniform(5000, 9000)])
        s *= np.exp(-t_axis(ln + 0.01) / ln) * rng.uniform(0.3, 1.0)
        i = int(at * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    hiss = filt(noise(dur), 'bandpass', [2000, 6000]) * 0.05 * speed
    return (out * 0.35 + hiss)


def tap():
    t = t_axis(0.12)
    return (np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.025) * 0.6
            + filt(noise(0.12), 'bandpass', [600, 2500]) * np.exp(-t / 0.01) * 0.4) * 0.6


def cloth(dur):
    return fabric(dur, density=120, bright=(400, 2800), level=0.3)


def keys(freqs, dur):
    t = t_axis(dur)
    x = sum(np.sin(2 * np.pi * f * t + 0.8 * np.exp(-t / 0.3) * np.sin(2 * np.pi * f * t)) for f in freqs)
    return x * np.exp(-t / (dur * 0.5)) * np.minimum(1, t / 0.004) * 0.07


# ---------------------------------------------------------------- music: 120 BPM, A minor, energetic
music, drums, sfx, pads = bus(), bus(), bus(), bus()
chords = [(note(33), [69, 72, 76]), (note(29), [65, 69, 72]), (note(36), [67, 72, 76]), (note(31), [67, 71, 74])]
t, k = 0.0, 0
while t < END - 0.5:
    root, ch = chords[k % 4]
    for hit in (0, 1.5 * BEAT, 2.5 * BEAT):  # syncopated stabs
        place(music, keys([note(n) for n in ch], BEAT), t + hit, 0.75, pan=0.15)
    place(pads, pad([note(n - 12) for n in ch], BAR + 0.4), t - 0.1, 0.45)
    t += BAR
    k += 1

for j in range(int((END - 1.0) / STEP)):
    t = j * STEP
    step = j % 16
    root = chords[int(t // BAR) % 4][0]
    peel_break = CUT_PEEL <= t < CUT_MACRO  # thin the drums so the peel sound reads
    cta_tail = t >= END - 1.2
    if cta_tail:
        continue
    if step in (0, 6, 10) and not (peel_break and step != 0):
        place(drums, kick(1.0 if step == 0 else 0.85), t, 0.85)
        place(music, sub808(root, STEP * (5 if step == 0 else 3)), t, 0.75)
    if step in (4, 12) and not peel_break:
        place(drums, clap(), t, 0.65)
    if step % 2 == 0 or (CUT_MONTAGE <= t < CUT_CTA):
        place(drums, hat(open_=(step == 14 and not peel_break)), t, (0.5 if step % 4 == 0 else 0.34) * (0.55 if peel_break else 1), pan=0.25)
place(sfx, riser(1.4, 250, 9000), CUT_MONTAGE - 1.4, 0.5)
place(sfx, riser(0.9, 300, 9000), CUT_CTA - 0.9, 0.45)
# resolve chord under the CTA hold
place(music, keys([note(n) for n in (57, 64, 69, 72, 76)], END - (END - 1.2)), END - 1.2, 1.2)
place(pads, pad([note(n) for n in (45, 52, 57, 60)], 1.6), END - 1.5, 0.8)

# ---------------------------------------------------------------- picture-synced effects
place(sfx, impact(1.0, 80, 34, 1.6), 0.0, 0.85)                          # RAISE, first frame
place(sfx, whoosh(0.3, 600, 7000, peak=0.7), fr(7) - 0.2, 0.45, pan=0.6)  # YOUR snaps in
place(sfx, impact(0.8, 95, 40, 1.2), fr(15), 0.7)                         # STYLE. lands
place(sfx, whoosh(0.4, 400, 8000, peak=0.6), CUT_PRESS - 0.25, 0.6, pan=-0.5)  # bar wipe
place(sfx, cloth(0.7), CUT_PRESS + 0.02, 0.8, pan=0.2)                    # hands smooth the transfer
place(sfx, press_click(), CUT_PRESS2 + 0.08, 0.8, pan=0.2)                # handle latch
place(sfx, press_thump(), PRESS_CLOSE, 0.9)                               # platen closes (TURN UP THE TEXTURE)
place(sfx, steam(1.0), PRESS_CLOSE + 0.05, 0.6, pan=-0.2)
place(sfx, press_click(), CUT_LIFT + 0.05, 0.6, pan=-0.2)                 # release
place(sfx, whoosh(0.35, 300, 7000), CUT_PEEL - 0.25, 0.7, pan=-0.6)       # whip to the peel
place(sfx, peel(CUT_MACRO - CUT_PEEL - 0.15), CUT_PEEL + 0.05, 0.9, pan=0.15)
place(sfx, impact(0.45, 110, 50, 0.8), CUT_MACRO, 0.45)                   # match cut into macro
place(sfx, fabric(2.3, density=40, bright=(700, 4000), level=0.16), CUT_MACRO + 0.05, 1.0)  # texture
place(sfx, text_swish(), CUT_MACRO + 0.2, 0.45)
place(sfx, whoosh(0.3, 3000, 400, peak=0.6), CUT_JACKET - 0.2, 0.55)      # vertical push
place(sfx, sparkle(0.9), CUT_JACKET + 0.05, 0.6)                          # product reveal accent
place(sfx, impact(0.6, 90, 42, 1.0), fr(345 + 18), 0.55)                  # STAND OUT.
place(sfx, whoosh(0.4, 4000, 500, peak=0.6), CUT_TOUCH - 0.25, 0.55)      # bar wipe
for src_t in (0.75, 1.35, 2.1, 2.9):                                      # fingertip taps (shot t, src 0.4 → CUT_TOUCH)
    place(sfx, tap(), CUT_TOUCH + (src_t - 0.4), 0.7, pan=0.2)
place(sfx, impact(0.55, 100, 45, 0.9), PUFF_PRESS, 0.55)                  # PUFF.
for i in range(6):                                                        # montage cuts
    place(sfx, whoosh(0.22, 800, 7000, peak=0.75), CUT_MONTAGE + i * 0.5 - 0.15, 0.32, pan=(-0.5 if i % 2 else 0.5))
    place(sfx, cloth(0.35), CUT_MONTAGE + i * 0.5, 0.45, pan=(0.3 if i % 2 else -0.3))
place(sfx, impact(0.5, 100, 45, 0.8), CUT_MONTAGE + fr(2), 0.5)           # YOUR DESIGN.
place(sfx, impact(0.5, 100, 45, 0.8), CUT_MONTAGE + fr(45), 0.5)          # YOUR STYLE.
place(sfx, whoosh(0.4, 3000, 300, peak=0.7), CUT_CTA - 0.3, 0.6)          # navy panel rises
place(sfx, sparkle(1.2), CUT_CTA + fr(2), 0.55)                           # logo
place(sfx, impact(0.9, 80, 34, 1.5), CUT_CTA + fr(19), 0.75)              # OUR CRAFT.
place(sfx, tap(), CUT_CTA + fr(38), 0.5)                                  # FREE SHIPPING
place(sfx, tap(), CUT_CTA + fr(44), 0.5)                                  # FREE BACKING
place(sfx, whoosh(0.3, 300, 5000, peak=0.8), CUT_CTA + fr(52) - 0.1, 0.5)  # CTA panel slide-up
place(sfx, impact(0.7, 70, 34, 1.6), CUT_CTA + fr(56), 0.6)               # GET YOUR FREE MOCKUP
for i, n in enumerate((69, 72, 76, 81)):                                  # final resolve
    place(music, bell(note(n), 2.4, 0.7), CUT_CTA + fr(62) + i * 0.05, 0.5, pan=-0.3 + i * 0.2)

# ---------------------------------------------------------------- mix
ir_room = reverb_ir(1.2, 4.5, 6000)
ir_hall = reverb_ir(2.4, 2.6, 7000)
kick_env = np.zeros(N)
for j in range(int(END / STEP)):
    if j % 16 in (0, 6, 10):
        i = int(j * STEP * SR)
        e = np.exp(-t_axis(0.2) / 0.07)
        kick_env[i:i + len(e)] = np.maximum(kick_env[i:i + len(e)], e[: max(0, N - i)])
sc = (1 - 0.35 * kick_env)[:, None]
mix = (drums * 0.9 + reverb(drums, ir_room) * 0.05 + music * 0.8 * sc + reverb(music, ir_hall) * 0.15
       + pads * 0.8 * sc + reverb(pads, ir_hall) * 0.2 + sfx * 0.85 + reverb(sfx, ir_room) * 0.08)
mix = filt(mix, 'highpass', 24)
mix = np.tanh(mix * 1.1) / 1.1
fade = int(0.8 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) / 0.89
out = sys.argv[1]
wavfile.write(out, SR, mix.astype(np.float32))
print('wrote', out, f'{DUR}s')
