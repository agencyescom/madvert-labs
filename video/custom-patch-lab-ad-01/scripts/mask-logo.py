"""Crop the circular Custom Patch Lab logo out of its white square with an
anti-aliased elliptical alpha that follows the artwork's own bounds, so the
badge is never stretched or redrawn."""
import sys, numpy as np
from PIL import Image, ImageDraw
src, out = sys.argv[1:3]
img = Image.open(src).convert('RGB')
a = np.asarray(img).astype(int)
ys, xs = np.nonzero(a.sum(2) < 700)
box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
crop = img.crop(box)
ss = 4
w, h = crop.size
m = Image.new('L', (w * ss, h * ss), 0)
ImageDraw.Draw(m).ellipse((ss * 1.5, ss * 1.5, w * ss - ss * 1.5, h * ss - ss * 1.5), fill=255)
crop.putalpha(m.resize((w, h), Image.LANCZOS))
crop.save(out)
print('logo', box, crop.size)
