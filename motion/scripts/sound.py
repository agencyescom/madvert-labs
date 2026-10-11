"""Music bed, SFX cue sheet, sonic logo and final mix — all synthesized, all driven by
the same word timings as the picture (data/words.json + VO_OFFSET).

Run:  uv run --no-project --with numpy python scripts/sound.py
Writes out/music.wav, out/sfx.wav, out/mix.wav (VO + music + SFX, -14 LUFS).
"""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
VO_OFFSET = 0.3
DUR = 60.5
N = int(DUR * SR)
rng = np.random.default_rng(7)

# ---------------------------------------------------------------- word timings
WORDS = json.load(open(os.path.join(ROOT, "data/words.json")))
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())
for w in WORDS:
    w["n"] = norm(w["w"]); w["s"] += VO_OFFSET; w["e"] += VO_OFFSET

def phrase(p, nth=0):
    toks = [norm(x) for x in p.split()]
    hit = 0
    for i in range(len(WORDS) - len(toks) + 1):
        if all(WORDS[i + k]["n"] == toks[k] for k in range(len(toks))):
            if hit == nth: return WORDS[i]["s"], WORDS[i + len(toks) - 1]["e"]
            hit += 1
    raise KeyError(p)
ws = lambda p, n=0: phrase(p, n)[0]
we = lambda p, n=0: phrase(p, n)[1]
cut = lambda p, n=0, lead=0.25: ws(p, n) - lead

# ---------------------------------------------------------------- DSP helpers
def t_(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.005, r=None, curve=4.0):
    t = t_(d); r = d - a if r is None else r
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(r, 1e-4))
    return e
def lp(x, fc):
    """one-pole low-pass; fc may be an array (time-varying)."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s); y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)
def noise(d): return rng.standard_normal(int(d * SR))
def saw(f, t): return 2 * ((f * t) % 1) - 1
def note(n): return 440 * 2 ** ((n - 69) / 12)

def place(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= buf.shape[1] or i + len(x) <= 0: return
    j = min(buf.shape[1], i + len(x)); x = x[: j - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += x * gain * l * 1.414; buf[1, i:j] += x * gain * r * 1.414

# ---------------------------------------------------------------- SFX palette
def tick(f=3200, d=0.03):
    t = t_(d); return np.sin(2 * np.pi * f * t) * env(d, 0.001, d, 9)
def click():
    y = tick(2600, 0.025) * 0.8
    n = hp(noise(0.012), 3000) * env(0.012, 0.0005, 0.012, 8) * 0.25
    y[: len(n)] += n
    return y
def blip(f=1250, d=0.09):
    t = t_(d); return np.sin(2 * np.pi * f * t) * env(d, 0.003, d, 6)
def pop():
    d = 0.12; t = t_(d); f = 600 + 900 * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.004, d, 7)
def whoosh(d=0.5, up=True):
    n = noise(d); t = t_(d)
    shape = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    fc = (600 + 5000 * (t / d if up else 1 - t / d))
    y = lp(hp(n, 200), fc) * shape
    return y / (np.abs(y).max() + 1e-9)
def impact(d=1.1, f0=110, f1=42):
    t = t_(d); f = f1 + (f0 - f1) * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.002, d, 4.2)
    trans = lp(noise(0.08), 2500) * env(0.08, 0.001, 0.08, 10)
    y = body; y[: len(trans)] += trans * 0.6
    return y / np.abs(y).max()
def riser(d=1.2):
    t = t_(d); n = hp(noise(d), 400)
    y = lp(n, 300 + 7000 * (t / d) ** 2) * (t / d) ** 2
    y += 0.3 * np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / d) ** 2) / SR) * (t / d) ** 2
    return y / np.abs(y).max()
def chime(notes=(76, 83), gap=0.07, d=0.9):
    out = np.zeros(int((d + gap * len(notes)) * SR))
    for k, n in enumerate(notes):
        t = t_(d); f = note(n)
        y = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(d, 0.004, d, 5)
        i = int(k * gap * SR); out[i:i + len(y)] += y
    return out / np.abs(out).max()
def typing(d=0.6, rate=14):
    out = np.zeros(int(d * SR) + 2000)
    tt = 0.0
    while tt < d:
        y = tick(2200 + rng.uniform(-400, 400), 0.02) * rng.uniform(0.5, 1)
        i = int(tt * SR); out[i:i + len(y)] += y
        tt += rng.uniform(0.6, 1.4) / rate
    return out
def sub(d=0.9, f=48):
    t = t_(d); return np.sin(2 * np.pi * f * t) * env(d, 0.01, d, 3.5)
def sonic_logo():
    """Madvert sonic identity: low clean pulse + short bright harmonic + digital shimmer."""
    d = 2.6; t = t_(d); out = np.zeros(len(t))
    out += 0.9 * np.sin(2 * np.pi * 55 * t) * env(d, 0.02, d, 3.2)           # low pulse
    for k, n in enumerate((77, 81, 84, 89)):                                     # F A C F bright harmonic
        f = note(n); i = int(0.06 * k * SR); tt = t_(d - 0.06 * k)
        y = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt)) * env(d - 0.06 * k, 0.006, d, 3.4)
        out[i:i + len(y)] += 0.32 * y
    sh = hp(noise(d), 6000) * env(d, 0.25, d, 2.5) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * t))  # shimmer
    out += 0.18 * sh
    return out / np.abs(out).max()

# ---------------------------------------------------------------- music bed
BPM = 110; BEAT = 60 / BPM
def music():
    m = np.zeros((2, N))
    tl = np.arange(N) / SR
    t_solution = cut("madvert labs fixes", 0, 0.35)
    t_reframe = cut("you don't have")
    t_end = cut("madvert labs beyond", 0, 0.3)
    t_pos = cut("one partner"); t_cta = cut("book your")
    # chords (midi roots) — tension in D minor, lift through Bb F C Dm, resolve to F
    tension = [(50, 53, 57)]
    lift = [(46, 50, 53, 57), (41, 45, 48, 53), (48, 52, 55, 60), (50, 53, 57, 60)]
    def chord_at(tt):
        if tt < t_solution: return tension[0]
        if tt >= t_end: return (41, 45, 48, 53, 57)
        bar = int((tt - t_solution) / (BEAT * 4))
        return lift[(bar // 1) % 4]
    # --- pad: detuned saws, low-passed, block-wise chord changes
    blk = int(BEAT * SR)
    pad = np.zeros(N)
    for i0 in range(0, N, blk):
        i1 = min(N, i0 + blk); tt = tl[i0:i1]
        ch = chord_at(tl[i0])
        y = sum(saw(note(n + 12) * (1 + dt), tt) for n in ch for dt in (-0.004, 0.004)) / (2 * len(ch))
        pad[i0:i1] = y
    cutoff = np.interp(tl, [0, 3.5, t_reframe, t_reframe + 2, t_solution, 30, 45, t_end, DUR],
                       [500, 700, 900, 400, 1400, 1800, 2200, 1600, 900])
    pad = lp(pad, cutoff)
    lvl = np.interp(tl, [0, 0.3, 3.5, t_reframe, t_reframe + 0.4, t_solution - 0.3, t_solution, t_cta, t_end, DUR - 1.2, DUR],
                    [0, 0.5, 0.55, 0.6, 0.25, 0.15, 0.7, 0.6, 0.85, 0.6, 0])
    pad *= lvl
    # smooth chord-change clicks
    pad = lp(pad, 6000)
    m[0] += pad * 0.9; m[1] += pad * 0.9
    # --- bass: 8th-note pulse on chord root
    bass = np.zeros(N)
    eighth = BEAT / 2
    k = 0
    while k * eighth < DUR - 1:
        at = k * eighth; k += 1
        if at < 3.6 or (t_reframe < at < t_solution) or at > DUR - 2.5: continue
        r = chord_at(at)[0] - 12
        d = eighth * 0.95; tt = t_(d)
        y = (np.sin(2 * np.pi * note(r) * tt) + 0.35 * saw(note(r), tt)) * env(d, 0.004, d, 3)
        i = int(at * SR); bass[i:i + len(y)] += y * (0.55 if at < t_solution else 0.75)
    bass = lp(bass, 900)
    m += bass * 0.55
    # --- drums: soft kick (four-on-floor from the solution), hats in the services run
    kick = impact(0.35, 140, 45) * 0.9
    hat = hp(noise(0.05), 7000) * env(0.05, 0.001, 0.05, 8)
    b = 0
    while t_solution + b * BEAT < t_end:
        at = t_solution + b * BEAT; b += 1
        if t_pos - 0.1 < at < t_cta and (b % 2): continue  # half-time feel under the statement
        place(m, kick, at, 0.55 if at < 24 else 0.7)
        if at > cut("we bring in") and at < t_cta:
            place(m, hat, at + BEAT / 2, 0.16, 0.3)
            if cut("our studio") < at < cut("and when growth"):
                place(m, hat, at + BEAT / 4, 0.09, -0.3); place(m, hat, at + 3 * BEAT / 4, 0.09, 0.3)
    # tension ticks in the problem section
    q = 0
    while 3.8 + q * eighth < t_reframe:
        place(m, tick(1800, 0.02), 3.8 + q * eighth, 0.08, 0.4 if q % 2 else -0.4); q += 1
    # --- arp plucks from the solution
    s = 0; six = BEAT / 4
    while t_solution + s * six < t_end - 0.2:
        at = t_solution + s * six; s += 1
        if at < cut("we bring in") and s % 2: continue
        ch = chord_at(at); n = ch[(s * 3) % len(ch)] + 24
        d = 0.22; tt = t_(d)
        y = (np.sin(2 * np.pi * note(n) * tt) + 0.2 * np.sin(4 * np.pi * note(n) * tt)) * env(d, 0.002, d, 7)
        place(m, y, at, 0.12 if at < t_cta else 0.07, 0.5 * np.sin(s))
    # end resolve: long F major bloom
    return m

# ---------------------------------------------------------------- SFX cue sheet
def sfx():
    S = np.zeros((2, N))
    C = lambda x, at, g=1.0, pan=0.0: place(S, x, at, g, pan)
    # 01 hook — UI ticks, impact on STOP and on THIS
    for k in range(3): C(click(), 0.02 + k * 0.07, 0.5, -0.4 + 0.4 * k)
    C(impact(), ws("stop") - 0.01, 0.9); C(sub(1.0, 40), ws("stop"), 0.6)
    C(whoosh(0.35), ws("not until") - 0.25, 0.25)
    C(impact(0.8, 160, 60), ws("this"), 0.55)
    # 02 problems
    C(whoosh(0.45), cut("leads go cold", 0, 0.2), 0.35)
    C(blip(700, 0.25), ws("cold"), 0.25)
    C(pop(), ws("follow up") + 0.1, 0.35); C(typing(0.9), ws("follow up") + 0.6, 0.18)
    C(blip(500, 0.3), ws("slow") + 0.45, 0.3); C(pop(), ws("slow") + 0.6, 0.3)
    for k in range(5): C(tick(1500, 0.03), ws("visitors") + 0.3 + k * 0.12, 0.2, 0.6)
    C(whoosh(0.4, False), ws("leave") + 0.1, 0.25, 0.6)
    C(typing(0.55, 18), ws("search") + 0.05, 0.2)
    C(whoosh(0.8, False), ws("find"), 0.25)
    for k in range(6): C(tick(900, 0.03), ws("talk") - 0.05 + k * 0.06, 0.18, -0.6 + 0.25 * k)
    C(impact(0.5, 220, 120), ws("talk") + 0.1, 0.25)
    # 03 money — slow-mo drop
    C(whoosh(0.5), cut("every gap", 0, 0.3), 0.3)
    C(impact(1.2, 90, 38), ws("money"), 0.5)
    for k in range(8): C(blip(1800 - k * 120, 0.06), ws("money") + 0.2 + k * 0.17, 0.08, rng.uniform(-0.5, 0.5))
    # 04 reframe — zoom, silence, riser into "system"
    C(whoosh(0.45), cut("you don't have"), 0.3)
    C(blip(400, 0.2), we("marketing problem") - 0.15, 0.25)
    C(riser(1.2), ws("system problem") - 1.15, 0.35)
    C(impact(0.9, 130, 50), ws("system problem"), 0.45)
    # 05 solution — sonic logo
    C(whoosh(0.6), cut("madvert labs fixes", 0, 0.35), 0.35)
    C(sonic_logo(), ws("madvert labs fixes") + 0.05, 0.75)
    for k in range(6): C(blip(1400 + 120 * k, 0.07), ws("fixes") + k * 0.08, 0.12, -0.6 + 0.24 * k)
    # 06 brand
    C(whoosh(0.45), cut("we build brands"), 0.35)
    for k in range(6): C(click(), ws("we build brands") + 0.05 + k * 0.09, 0.22, rng.uniform(-0.6, 0.6))
    C(impact(0.5, 200, 90), ws("brands"), 0.3)
    # 07 demand
    C(whoosh(0.45), cut("we bring in"), 0.35)
    C(impact(0.6, 160, 70), ws("demand"), 0.3)
    C(click(), ws("google") - 0.35, 0.45, -0.6); C(chime((88,), 0, 0.3), ws("google") - 0.1, 0.12, -0.6)
    C(typing(0.45, 20), ws("google"), 0.18, -0.2)
    C(blip(1100, 0.1), ws("seo") + 0.1, 0.2, 0.2); C(whoosh(0.6), ws("seo") + 0.2, 0.15, 0.2)
    C(typing(0.35, 20), ws("ai search"), 0.15, 0.6); C(chime((81, 88), 0.05, 0.5), ws("ai search") + 0.4, 0.15, 0.6)
    # 08 convert
    C(whoosh(0.45, True), cut("we turn"), 0.35)
    C(whoosh(0.4), ws("booked calls") - 0.15, 0.25)
    C(click(), ws("websites") - 0.05, 0.6, 0.3)
    C(typing(0.6, 16), ws("websites") + 0.4, 0.18, 0.4)
    C(blip(1500, 0.08), ws("funnels"), 0.25, 0.4); C(click(), ws("funnels") + 0.35, 0.4, 0.4)
    C(chime((79, 86), 0.08, 0.9), ws("convert") - 0.05, 0.4, 0.2)
    # 09 studio
    C(blip(300, 0.3), cut("our studio", 0, 0.3) + 0.05, 0.15)
    C(click(), ws("studio") - 0.1, 0.4, 0.5)
    C(impact(0.7, 240, 80), ws("studio") + 0.1, 0.45); C(whoosh(0.4), ws("studio") + 0.05, 0.45)
    C(whoosh(0.9, False), ws("ads", 1) - 0.15, 0.35)
    C(impact(1.0, 120, 45), ws("stop", 1), 0.75); C(sub(0.8, 44), ws("stop", 1), 0.5)
    # 10 automate — precise chain reaction
    C(whoosh(0.45), cut("then every"), 0.35)
    for k, p in enumerate(["every lead", "instant", "qualified", "booked and", "tracked"]):
        at = ws(p) if p != "booked and" else ws("booked", 1)
        C(blip(900 + 180 * k, 0.09), at - 0.05, 0.3, -0.7 + 0.35 * k)
    C(pop(), ws("instant") + 0.1, 0.3); C(typing(0.5, 16), ws("qualified"), 0.12)
    C(chime((84,), 0, 0.4), ws("booked", 1) + 0.15, 0.2, 0.35); C(click(), ws("tracked") + 0.1, 0.3, 0.7)
    C(riser(0.6), ws("automatically") - 0.55, 0.25)
    for k in range(5): C(blip(1300 + 200 * k, 0.07), ws("automatically") + k * 0.07, 0.15, -0.6 + 0.3 * k)
    C(impact(0.8, 150, 55), ws("automatically"), 0.45)
    # 11 build — substantial bass impact on "we build it"
    C(whoosh(0.4), cut("and when growth"), 0.3)
    for k in range(10): C(tick(2800, 0.02), ws("and when growth") + k * 0.11, 0.1, rng.uniform(-0.7, 0.7))
    C(riser(1.0), ws("we build it") - 0.95, 0.3)
    C(impact(1.6, 100, 34), ws("we build it"), 1.0); C(sub(1.6, 36), ws("we build it"), 0.75)
    # 12 positioning
    C(whoosh(0.35), cut("one partner"), 0.3)
    C(impact(0.6, 180, 70), ws("one partner"), 0.3); C(impact(0.6, 180, 70), ws("one system"), 0.3)
    C(impact(0.6, 160, 60), ws("no gaps"), 0.35); C(click(), ws("gaps") + 0.1, 0.5)
    C(impact(1.2, 120, 40), ws("excuses"), 0.7); C(sub(1.0, 42), ws("excuses"), 0.45)
    # 13 CTA — calm, trust
    C(whoosh(0.45), cut("book your"), 0.3)
    C(click(), ws("strategy") + 0.1, 0.4, 0.4); C(click(), ws("call") + 0.3, 0.5, 0.4)
    C(chime((81, 88, 93), 0.07, 1.0), ws("call") + 0.5, 0.35, 0.3)
    C(typing(0.7, 18), ws("madvertlabs.com"), 0.2, -0.4)
    # 14 end — sonic logo returns, final orb pulse
    C(whoosh(0.7), cut("madvert labs beyond", 0, 0.3), 0.2)
    C(sonic_logo(), ws("madvert labs beyond") + 0.1, 0.8)
    C(impact(0.7, 130, 55), ws("growth systems"), 0.3)
    C(chime((89,), 0, 1.2), we("growth systems") + 1.2, 0.18)
    return S

# ---------------------------------------------------------------- mix
def read_vo():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "audio/voiceover.mp3"),
                          "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    v = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).T
    out = np.zeros((2, N)); i = int(VO_OFFSET * SR)
    j = min(N, i + v.shape[1]); out[:, i:j] = v[:, : j - i]
    return out

def envelope(x, ms=60):
    a = np.abs(x).mean(0)
    k = int(SR * ms / 1000)
    c = np.convolve(a, np.ones(k) / k, mode="same")
    return c / (c.max() + 1e-9)

def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x.T * 32767).astype(np.int16).tobytes())

if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    vo = read_vo()
    mu = music(); mu /= np.abs(mu).max() + 1e-9
    fx = sfx(); fx /= max(1.0, np.abs(fx).max())
    e = envelope(vo)
    duck_m = 10 ** (-9 * np.clip(e * 3, 0, 1) / 20)   # music ducks up to 9 dB under the voice
    duck_s = 10 ** (-4 * np.clip(e * 3, 0, 1) / 20)   # sfx duck up to 4 dB
    music_bus = mu * 0.30 * duck_m
    sfx_bus = fx * 0.55 * duck_s
    write(os.path.join(ROOT, "out/music.wav"), mu * 0.5)
    write(os.path.join(ROOT, "out/sfx.wav"), fx * 0.8)
    write(os.path.join(ROOT, "out/music_sfx.wav"), (music_bus + sfx_bus) * 1.5)
    pre = vo * 1.0 + music_bus + sfx_bus
    write(os.path.join(ROOT, "out/premix.wav"), pre / max(1.0, np.abs(pre).max()))
    # two-pass loudnorm to -14 LUFS, -1 dBTP
    a = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(ROOT, "out/premix.wav"), "-af",
                        "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(a[a.rindex("{"):a.rindex("}") + 1])
    f = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
         f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(ROOT, "out/premix.wav"), "-af", f,
                    "-ar", str(SR), os.path.join(ROOT, "out/mix.wav")], check=True)
    import shutil; shutil.copy(os.path.join(ROOT, "out/mix.wav"), os.path.join(ROOT, "audio/preview-mix.wav"))
    print("wrote out/mix.wav", m["input_i"], "->", -14)
