"""Shared synthesis toolkit for the Custom Patch Lab temp scores: oscillators,
filters, drums, risers, whooshes, fabric foley, bells, reverb. Everything is
generated from scratch (no samples), so the output is wholly original.

Call configure(duration) first; place() writes into buses of that length."""
import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
rng = np.random.default_rng(1901)
N = 0  # set by configure()


def configure(duration, seed=1901):
    """Set the mix length (seconds) and reseed the noise generator."""
    global N, rng
    N = int(SR * duration)
    rng = np.random.default_rng(seed)



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


