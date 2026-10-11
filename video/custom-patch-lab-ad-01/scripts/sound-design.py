"""Custom Patch Lab — Ad 01 TEMP score + sound design (original, synthesized).

Everything here is generated from oscillators and noise in this file: no
samples, no third-party music. It is a preview bed so the cut can be timed and
reviewed; swap the music stem for a commercially licensed instrumental
hip-hop/trap track before the campaign goes live (see README).

120 BPM, F minor. One beat = 0.5 s, so every 3 s cut lands on a kick (3, 9, 15)
or a snare (6, 12). Writes a 48 kHz stereo float WAV; loudness is normalised
afterwards with ffmpeg (see render notes in README).
"""
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
DUR = 19.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM
STEP = BEAT / 4  # 16th note
rng = np.random.default_rng(1901)

# All event times in seconds, shared with the picture edit (src/timeline.ts).
CUTS = [3.0, 6.0, 9.0, 12.0, 15.0, 16.0]
TEXT_HITS = [0.5, 4.0, 6.5, 10.0, 12.5, 15.25, 16.5, 17.0]


def note(n):
    """MIDI note number -> Hz."""
    return 440.0 * 2 ** ((n - 69) / 12)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def bus():
    return np.zeros((N, 2))


def place(dst, sig, at, gain=1.0, pan=0.0):
    """Add mono or stereo `sig` into stereo `dst` at time `at` (equal-power pan)."""
    i = int(round(at * SR))
    if i >= N:
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], 1) * np.sqrt(2)
    j = min(N, i + len(sig))
    s0 = max(0, -i)
    dst[max(i, 0):j] += sig[s0:j - i] * gain


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output='sos')
    return sosfilt(sos, x, axis=0)


def svf_sweep(x, f0, f1, q=2.0, curve=2.0, mode='bp'):
    """Chamberlin state-variable filter with an exponential cutoff sweep."""
    n = len(x)
    pos = np.linspace(0, 1, n) ** curve
    fc = f0 * (f1 / f0) ** pos
    g = 2 * np.sin(np.pi * np.minimum(fc, SR / 6) / SR)
    damp = 1.0 / q
    low = band = 0.0
    out = np.empty(n)
    for k in range(n):
        high = x[k] - low - damp * band
        band += g[k] * high
        low += g[k] * band
        out[k] = band if mode == 'bp' else (low if mode == 'lp' else high)
    return out


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def pink(dur):
    w = np.fft.rfft(noise(dur))
    f = np.fft.rfftfreq(int(dur * SR), 1 / SR)
    f[0] = 1
    return np.fft.irfft(w / np.sqrt(f), int(dur * SR))


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


def reverb_ir(dur=2.4, decay=3.2, bright=6000):
    t = t_axis(dur)
    ir = np.stack([noise(dur), noise(dur)], 1) * np.exp(-decay * t)[:, None]
    ir = filt(ir, 'lowpass', bright)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt(np.sum(ir ** 2, 0))


def reverb(x, ir):
    return np.stack([fftconvolve(x[:, c], ir[:, c])[:N] for c in range(2)], 1)


# ---------------------------------------------------------------- instruments
def kick(punch=1.0):
    t = t_axis(0.55)
    f = 46 + 110 * np.exp(-t / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.28)
    click = filt(noise(0.55), 'highpass', 2500) * np.exp(-t / 0.004) * 0.35
    return np.tanh((body + click) * 1.6 * punch) * 0.9


def sub808(freq, dur, glide_from=None):
    t = t_axis(dur)
    f = np.full_like(t, freq)
    if glide_from:
        f = freq + (glide_from - freq) * np.exp(-t / 0.06)
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(1, t / 0.004) * np.exp(-t / (dur * 0.55))
    env[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    # saturation adds upper harmonics so the bass still reads on phone speakers
    return np.tanh(np.sin(ph) * 2.6) * env * 0.55


def clap():
    t = t_axis(0.45)
    n = filt(noise(0.45), 'bandpass', [900, 4200])
    env = np.zeros_like(t)
    for off in (0, 0.011, 0.022):
        env += (t >= off) * np.exp(-np.maximum(t - off, 0) / (0.012 if off < 0.02 else 0.16))
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05) * 0.5
    return norm(n * env + body) * 0.75


def hat(open_=False):
    d = 0.25 if open_ else 0.06
    t = t_axis(d)
    x = filt(noise(d), 'highpass', 7200, 4)
    return x * np.exp(-t / (0.07 if open_ else 0.012)) * 0.32


def rim():
    t = t_axis(0.08)
    return (np.sin(2 * np.pi * 1700 * t) * 0.6 + filt(noise(0.08), 'bandpass', [2000, 5000])) * np.exp(-t / 0.01) * 0.3


def bell(freq, dur=2.6, bright=1.0):
    t = t_axis(dur)
    idx = 2.2 * bright * np.exp(-t / 0.35)
    mod = np.sin(2 * np.pi * freq * 3.5 * t) * idx
    car = np.sin(2 * np.pi * freq * t + mod)
    shimmer = np.sin(2 * np.pi * freq * 2.0 * t + 0.5 * mod) * 0.25 * np.exp(-t / 0.5)
    env = np.minimum(1, t / 0.003) * np.exp(-t / (dur * 0.33))
    return (car + shimmer) * env * 0.22


def pluck(freq, dur=0.6):
    t = t_axis(dur)
    x = sum(np.sin(2 * np.pi * freq * h * t) * np.exp(-t * (6 + 5 * h)) / h for h in range(1, 7))
    return x * np.minimum(1, t / 0.002) * 0.3


def pad(freqs, dur):
    t = t_axis(dur)
    x = np.zeros((len(t), 2))
    for i, f in enumerate(freqs):
        for c, det in enumerate((-0.12, 0.12)):
            ff = f * 2 ** (det / 12 + (i % 2) * 0.0007)
            saw = sum(np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28)) / h for h in range(1, 14))
            x[:, c] += saw
    x = filt(x, 'lowpass', 1100)
    fade = int(0.6 * SR)
    env = np.ones(len(t))
    env[:fade] = np.linspace(0, 1, fade) ** 2
    env[-fade:] = np.linspace(1, 0, fade) ** 2
    return x * env[:, None] * 0.05


# ---------------------------------------------------------------- sound design
def impact(size=1.0, drop_from=62, drop_to=30, dur=2.2):
    t = t_axis(dur)
    f = drop_to + (drop_from - drop_to) * np.exp(-t / 0.35)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.9 * size))
    thud = filt(noise(dur), 'lowpass', 900) * np.exp(-t / 0.07)
    crack = filt(noise(dur), 'bandpass', [1500, 7000]) * np.exp(-t / 0.018) * 0.35
    return np.tanh((sub * 1.4 + thud * 0.5 + crack) * 1.5 * size) * 0.85


def whoosh(dur=0.7, f0=250, f1=5000, peak=0.75, q=1.6):
    t = t_axis(dur)
    x = svf_sweep(noise(dur), f0, f1, q=q, curve=1.3)
    env = np.where(t < peak * dur, (t / (peak * dur)) ** 2.2, np.exp(-(t - peak * dur) / (0.09 * dur / 0.7)))
    return norm(x * env) * 0.55


def riser(dur, f0=180, f1=7000):
    t = t_axis(dur)
    x = svf_sweep(noise(dur), f0, f1, q=3.5, curve=1.6)
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * t / dur)) / SR) * 0.12
    env = (t / dur) ** 2.4
    return (norm(x) * 0.5 + tone) * env


def reverse_swell(dur):
    t = t_axis(dur)
    x = filt(noise(dur), 'highpass', 3000) * 0.4 + pink(dur) * 0.002
    return x * (t / dur) ** 3


def fabric(dur, density=55, bright=(700, 4200), level=0.22):
    """Tactile chenille/fabric foley: dense micro-grains of band-limited noise."""
    out = np.zeros(int(dur * SR))
    base = filt(pink(dur), 'bandpass', list(bright))
    base = norm(base)
    nseg = int(dur * density)
    for _ in range(nseg):
        c = rng.uniform(0, dur)
        w = rng.uniform(0.01, 0.06)
        i0, i1 = int(max(0, c - w) * SR), int(min(dur, c + w) * SR)
        if i1 - i0 < 8:
            continue
        g = np.hanning(i1 - i0) * rng.uniform(0.2, 1.0)
        out[i0:i1] += base[i0:i1] * g
    slow = 0.6 + 0.4 * np.sin(2 * np.pi * rng.uniform(0.5, 1.3) * t_axis(dur) + rng.uniform(0, 6))
    return out * slow * level


def text_swish():
    return whoosh(0.32, 1800, 9000, peak=0.6, q=1.2) * 0.35


def sparkle(dur=1.6):
    out = np.zeros(int(dur * SR))
    for _ in range(26):
        f = rng.uniform(2400, 7200)
        at = rng.uniform(0, dur * 0.7)
        s = np.sin(2 * np.pi * f * t_axis(0.25)) * np.exp(-t_axis(0.25) / 0.05) * rng.uniform(0.2, 0.6)
        i = int(at * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    return out * np.exp(-t_axis(dur) / 0.8) * 0.12


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
