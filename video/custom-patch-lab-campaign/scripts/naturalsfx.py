"""No-music sound palette (client requirement from Reel 02 on): daf frame drum
(no jingles), unpitched UI clicks, and natural foley. Built on sfxlib; call
sfxlib.configure() before use. Nothing here is melodic or harmonic."""
import numpy as np

import sfxlib
from sfxlib import filt, noise, norm, pink, svf_sweep, t_axis, whoosh

SR = sfxlib.SR


def rng():
    return sfxlib.rng


# ---------------------------------------------------------------- daf
def daf_dum(weight=1.0):
    """Centre stroke: deep membrane boom with a soft skin attack."""
    t = t_axis(0.9)
    f = 68 + 24 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    over = np.sin(2 * np.pi * np.cumsum(f * 1.59) / SR) * np.exp(-t / 0.08) * 0.25
    skin = filt(noise(0.9), 'bandpass', [200, 1200]) * np.exp(-t / 0.012) * 0.35
    return (body + over + skin) * np.minimum(1, t / 0.002) * 0.8 * weight


def daf_tak(weight=1.0):
    """Rim stroke: dry slap near the frame edge."""
    t = t_axis(0.25)
    slap = filt(noise(0.25), 'bandpass', [900, 4500]) * np.exp(-t / 0.018)
    ring = np.sin(2 * np.pi * 410 * t) * np.exp(-t / 0.03) * 0.3 + np.sin(2 * np.pi * 690 * t) * np.exp(-t / 0.02) * 0.15
    return filt(slap * 0.7 + ring, 'lowpass', 7000) * 0.55 * weight


def daf_ka(weight=1.0):
    t = t_axis(0.12)
    return filt(noise(0.12), 'bandpass', [1200, 5000]) * np.exp(-t / 0.01) * 0.25 * weight


def daf_roll(dur=0.6):
    out = np.zeros(int(dur * SR))
    n = int(dur * 22)
    for i in range(n):
        s = daf_ka(0.4 + 0.6 * i / n)
        j = int(i / 22 * SR)
        out[j:j + len(s)] += s[: len(out) - j]
    return out


# ---------------------------------------------------------------- impacts / air
def soft_hit(size=1.0, dur=1.2):
    t = t_axis(dur)
    f = 46 + 38 * np.exp(-t / 0.06)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.33 * size)) * np.minimum(1, t / 0.006) * 0.7


def heavy_hit(dur=1.4):
    """Dense low body + rubbery thud (PVC)."""
    t = t_axis(dur)
    f = 40 + 55 * np.exp(-t / 0.04)
    body = np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * 2.2) * np.exp(-t / 0.4)
    thud = filt(noise(dur), 'lowpass', 600) * np.exp(-t / 0.05) * 0.6
    return (body + thud) * 0.6


def air(dur=0.45, f0=350, f1=3000):
    return filt(whoosh(dur, f0, f1, peak=0.65, q=0.9), 'lowpass', 5000) * 0.6


def air_swell(dur, lo=300, hi=3500):
    t = t_axis(dur)
    x = svf_sweep(noise(dur), lo, hi, q=0.8, curve=1.4)
    return filt(norm(x) * (t / dur) ** 2.2, 'lowpass', 5000) * 0.5


# ---------------------------------------------------------------- UI (unpitched)
def ui_click(bright=1.0):
    """Arcade selection click: tight filtered-noise tick + small body; no tone."""
    t = t_axis(0.05)
    x = filt(noise(0.05), 'bandpass', [1400 * bright, 6000]) * np.exp(-t / 0.003) * 0.6
    x += filt(noise(0.05), 'bandpass', [200, 700]) * np.exp(-t / 0.008) * 0.3
    return filt(x, 'lowpass', 8000)


def scan_sweep(dur=0.55):
    """Scan line: narrow band of noise sweeping up, airy."""
    t = t_axis(dur)
    x = svf_sweep(noise(dur), 600, 6000, q=5.0, curve=1.0)
    return filt(norm(x) * np.sin(np.pi * t / dur) ** 1.5, 'lowpass', 7000) * 0.35


def grain_shimmer(dur=0.9):
    """Bright 'digital shimmer' made of unpitched noise grains (Color Wizard)."""
    out = np.zeros(int(dur * SR))
    for _ in range(int(dur * 70)):
        at = rng().uniform(0, dur * 0.8)
        ln = rng().uniform(0.004, 0.012)
        s = filt(noise(ln + 0.01), 'bandpass', [3500, 11000]) * np.exp(-t_axis(ln + 0.01) / ln) * rng().uniform(0.3, 1)
        i = int(at * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    return out * np.exp(-t_axis(dur) / (dur * 0.5)) * 0.35


# ---------------------------------------------------------------- foley
def stitch_stroke(weight=1.0):
    t = t_axis(0.09)
    tick = filt(noise(0.09), 'bandpass', [900, 3600]) * np.exp(-t / 0.005) * 0.5
    thunk = np.sin(2 * np.pi * 150 * t) * np.exp(-t / 0.018) * 0.75 * weight
    pull = filt(noise(0.09), 'bandpass', [400, 1300]) * np.exp(-np.maximum(t - 0.025, 0) / 0.015) * (t > 0.025) * 0.25
    return filt(tick + thunk + pull, 'lowpass', 5000)


def cloth(dur=0.6, lo=250, hi=1800, level=0.3):
    t = t_axis(dur)
    return norm(filt(pink(dur), 'bandpass', [lo, hi])) * np.sin(np.pi * t / dur) ** 2 * level


def room_tone(dur, level=0.012):
    r = filt(pink(dur), 'bandpass', [120, 900])
    r = np.stack([r, np.roll(r, 977)], 1)
    return r / np.max(np.abs(r)) * level
