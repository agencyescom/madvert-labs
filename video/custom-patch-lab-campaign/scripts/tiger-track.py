"""Reel 02: extract the tiger silhouette and track it through the footage.

    python3 -I scripts/tiger-track.py

- outline: outer contour of the tiger, from the supplied digital artwork
  (reference/tiger-artwork-tablet-still.webp, navy outline on a white canvas).
  The stylus touches the right cheek in that image, so the left half is
  mirrored about the nose to rebuild the (symmetric) silhouette. Simplified
  and normalised to its own bounding box (0..1000).
- tracks: per-frame silhouette box (x, y, w, h in the 1080x1920 frame) in the
  conformed shots. Tracking keys on the orange thread only (navy jackets and
  caps would merge with the navy border) and converts the orange box to the
  full silhouette box with ratios measured on the same photo.
Writes src/reel02/tiger-track.json.
"""
import json
import subprocess
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SEG = ROOT / 'public/segments/reel02'
W, H = 540, 960  # analysis resolution (half); boxes are scaled back ×2


def frames(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)


def hsv(img):
    x = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    return (x[..., i].astype(int) for i in range(3))


def orange_box(img, close=15):
    """Box of the tiger's orange fur: the largest roughly-square orange blob (skips wood tables, spools)."""
    h, s, v = hsv(img)
    m = ((h >= 6) & (h <= 20) & (s > 170) & (v > 140)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((close, close), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    best = None
    for i in range(1, n):
        x, y, w, hh, area = st[i]
        if area < 1500 or not (0.55 < hh / max(w, 1) < 1.8):
            continue
        if best is None or area > best[4]:
            best = (x, y, w, hh, area)
    return None if best is None else [float(t) for t in best[:4]]


def still_silhouette(path):
    img = cv2.imread(str(path))
    h, s, v = hsv(img)
    navy = (h >= 95) & (h <= 135) & (v < 120)
    orange = (h >= 6) & (h <= 20) & (s > 170) & (v > 140)
    white = (s < 45) & (v > 185)
    m = (navy | orange | white).astype(np.uint8) * 255
    roi = np.zeros_like(m)
    roi[60:805, 110:865] = 1  # the patch itself; keeps the denim/spools at the photo edges out of the silhouette
    m = m * roi
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    hh, ww = m.shape
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    i = lab[hh // 2, ww // 2] or 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    comp = (lab == i).astype(np.uint8) * 255
    cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    return img, max(cnts, key=cv2.contourArea)


def smooth(rows, k=5):
    a = np.array([r[1:] for r in rows])
    out = []
    for i, r in enumerate(rows):
        lo, hi = max(0, i - k // 2), min(len(rows), i + k // 2 + 1)
        out.append([r[0]] + [round(float(v), 1) for v in a[lo:hi].mean(0)])
    return out


edl = json.loads((ROOT / 'src/reel02/edl.json').read_text())
start = {s['id']: s['from'] for s in edl['shots']}

def art_outline(path):
    art = cv2.imread(str(path))
    h, s_, v = hsv(art)
    m = (((h >= 95) & (h <= 135) & (v < 130)) | (v < 70) | ((h >= 5) & (h <= 22) & (s_ > 150) & (v > 120))).astype(np.uint8) * 255
    roi = np.zeros_like(m)
    roi[105:700, 170:760] = 1  # drawing canvas only
    m = cv2.morphologyEx(m * roi, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    comp = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8) * 255
    cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    filled = np.zeros_like(comp)
    cv2.drawContours(filled, cnts, -1, 255, -1)
    x, y, w, hh = cv2.boundingRect(max(cnts, key=cv2.contourArea))
    axis = x + w // 2
    left = filled[:, :axis]
    sym = np.concatenate([left, left[:, ::-1]], axis=1)
    cnts, _ = cv2.findContours(sym, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cnts, key=cv2.contourArea)
    c = cv2.approxPolyDP(c, 1.2, True)[:, 0, :].astype(float)
    x0, y0 = c.min(0)
    ww, hh = c.max(0) - c.min(0)
    pts = (c - [x0, y0]) / [ww, hh] * 1000
    ob = orange_box(art, close=9)
    art_ratio = [(x0 - ob[0]) / ob[2], (y0 - ob[1]) / ob[3], ww / ob[2], hh / ob[3]]
    return 'M ' + ' L '.join(f'{p[0]:.1f} {p[1]:.1f}' for p in pts) + ' Z', float(hh / ww), art_ratio


outline, aspect, art_ratio = art_outline(ROOT / 'assets/source/reel02/reference/tiger-artwork-tablet-still.webp')
# placement ratios come from the patch photo (embroidered silhouette incl. merrowed border)
img, c = still_silhouette(ROOT / 'assets/source/reel02/reference/tiger-patch-still.webp')
c2 = c[:, 0, :].astype(float)
sx, sy = c2.min(0)
sw, sh = c2.max(0) - c2.min(0)
ob = orange_box(img, close=9)
ratio = [(sx - ob[0]) / ob[2], (sy - ob[1]) / ob[3], sw / ob[2], sh / ob[3]]
print('silhouette', [round(t) for t in (sx, sy, sw, sh)], 'orange', [round(t) for t in ob], 'ratio', [round(r, 3) for r in ratio])

tracks = {}
# s1 (digital tiger on the tablet): the tiger runs off the left edge of frame and the
# tablet bezel touches it, so automatic boxes fail. Hand-measured on frames 0/30/60
# (nose axis, right cheek, ear tips, chin; see README) and interpolated — the shot
# is a smooth push, and the hook graphics only use it until frame 66.
S1_KEYS = [[0, 47, 300, 1016, 1355], [30, 45, 295, 1024, 1360], [60, 15, 288, 1050, 1382]]
tracks['s1'] = [[f] + [round(float(np.interp(f, [k[0] for k in S1_KEYS], [k[i] for k in S1_KEYS])), 1) for i in range(1, 5)] for f in range(0, 87)]
for sid in ('s4', 's5', 's6', 's7'):
    rows = []
    for k, im in enumerate(frames(SEG / f'{sid}.mp4')):
        b = orange_box(im)
        if b:
            x, y, w, hh = (t * 2 for t in b)
            rows.append([start[sid] + k, x + ratio[0] * w, y + ratio[1] * hh, ratio[2] * w, ratio[3] * hh])
    tracks[sid] = smooth(rows)
    print(sid, len(rows), 'frames tracked')


def ear_trace(img):
    """Hook trace (s1): the real outer edge of the digital tiger's right ear and cheek, per frame.
    Navy/orange silhouette below the tablet toolbar; outer contour points right of the nose,
    ordered top → bottom, in full-resolution px."""
    h, s_, v = hsv(img)
    m = (((h >= 95) & (h <= 135) & (v < 130)) | ((h >= 5) & (h <= 22) & (s_ > 150) & (v > 120))).astype(np.uint8) * 255
    m[: int(0.135 * H)] = 0
    m[int(0.75 * H):] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    i = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    comp = (lab == i).astype(np.uint8) * 255
    cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cnts, key=cv2.contourArea)[:, 0, :]
    # start at the right ear tip and walk down the right-hand side (ear → cheek → jaw),
    # which stays clear of the headline at the top of frame
    right = c[:, 0] > 0.6 * W
    top = int(np.argmin(np.where(right, c[:, 1], 10 ** 6)))
    c = np.roll(c, -top, axis=0)
    if c[min(8, len(c) - 1), 0] < c[0, 0]:  # make sure we walk outward/right, not back over the head
        c = np.roll(c[::-1], 1, axis=0)
    y_stop = int(0.5 * H)  # stop above the stylus, which breaks the silhouette lower down
    out = []
    for x, y in c:
        if y > y_stop:
            break
        if x < 0.5 * W:
            break
        out.append((x, y))
    if len(out) < 10:
        return None
    pts = cv2.approxPolyDP(np.array(out, np.int32).reshape(-1, 1, 2), 1.0, False)[:, 0, :] * 2
    return 'M ' + ' L '.join(f'{x} {y}' for x, y in pts)


trace = {}
for k, im in enumerate(frames(SEG / 's1.mp4')):
    if k > 70:
        break
    d = ear_trace(im)
    if d:
        trace[k] = d
print('ear trace frames', len(trace))
(ROOT / 'src/reel02/tiger-track.json').write_text(json.dumps({'outline': outline, 'aspect': aspect, 'tracks': tracks, 'earTrace': trace}))
print('outline points', outline.count('L') + 1)
