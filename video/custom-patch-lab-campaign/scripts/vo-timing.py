"""Build a phrase- and word-level timing map from the ACTUAL voiceover recording.

    python3 -I scripts/vo-timing.py <voiceover audio> <script.txt> <out.json>

Phrase boundaries come from measured silences in the recording (energy gate).
The script supplies the words of each phrase; word boundaries inside a phrase
are first placed by syllable weight, then snapped to the nearest energy dip
(±90 ms). The phrase count must match the script's phrase count or the script
fails loudly, which is how a re-read / changed take gets caught.
"""
import json
import re
import subprocess
import sys

import numpy as np

SR = 16000
HOP = 0.01  # 10 ms analysis frames


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def envelope(x):
    n = int(SR * HOP)
    frames = len(x) // n
    rms = np.sqrt(np.mean(x[: frames * n].reshape(frames, n) ** 2, 1) + 1e-12)
    db = 20 * np.log10(rms)
    return np.convolve(db, np.ones(3) / 3, mode='same')


def phrases_from_silence(db, gate_db=-38, min_gap=0.12, min_len=0.25):
    voiced = db > gate_db
    segs, start = [], None
    for i, v in enumerate(voiced):
        if v and start is None:
            start = i
        if not v and start is not None:
            segs.append([start, i])
            start = None
    if start is not None:
        segs.append([start, len(voiced)])
    merged = []
    for s in segs:  # bridge gaps shorter than min_gap (stops, breaths inside a phrase)
        if merged and (s[0] - merged[-1][1]) * HOP < min_gap:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    return [(a * HOP, b * HOP) for a, b in merged if (b - a) * HOP >= min_len]


def syllables(word):
    w = re.sub(r'[^a-z0-9]', '', word.lower())
    if w.isdigit():
        return {'24': 4}.get(w, len(w) * 2)  # "twenty-four"
    groups = re.findall(r'[aeiouy]+', w)
    n = len(groups) - (1 if w.endswith('e') and len(groups) > 1 and not w.endswith('le') else 0)
    return max(1, n)


def main():
    audio, script_path, out = sys.argv[1:4]
    lines = [l.strip() for l in open(script_path) if l.strip()]
    x = load(audio)
    db = envelope(x)
    phrases = phrases_from_silence(db)
    if len(phrases) != len(lines):
        sys.exit(f'Found {len(phrases)} spoken phrases but the script has {len(lines)} lines: {phrases}')
    result = {'source': audio, 'duration': round(len(x) / SR, 3), 'phrases': []}
    for (t0, t1), line in zip(phrases, lines):
        words = line.split()
        wts = np.array([syllables(w) for w in words], float)
        edges = t0 + np.concatenate([[0], np.cumsum(wts)]) / wts.sum() * (t1 - t0)
        for k in range(1, len(edges) - 1):  # snap inner boundaries to local energy minima
            c = int(edges[k] / HOP)
            lo, hi = max(c - 9, int(t0 / HOP) + 1), min(c + 9, int(t1 / HOP) - 1)
            if hi > lo:
                edges[k] = (lo + int(np.argmin(db[lo:hi]))) * HOP
        edges = np.maximum.accumulate(edges)
        result['phrases'].append({
            'text': line,
            'start': round(t0, 3),
            'end': round(t1, 3),
            'words': [{'w': w, 'start': round(a, 3), 'end': round(b, 3)} for w, a, b in zip(words, edges[:-1], edges[1:])],
        })
    json.dump(result, open(out, 'w'), indent=1)
    for p in result['phrases']:
        print(f"{p['start']:6.2f}-{p['end']:5.2f}  " + ' '.join(f"{w['w']}@{w['start']:.2f}" for w in p['words']))


main()
