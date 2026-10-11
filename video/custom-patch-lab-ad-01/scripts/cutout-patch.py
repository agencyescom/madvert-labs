"""Cut the lion patch out of its dark studio background (flood fill from the
image border, stopped by the merrowed edge) and save it as a transparent PNG."""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
src, out = sys.argv[1:3]
preview = sys.argv[3] if len(sys.argv) > 3 else None
img = Image.open(src).convert('RGB')
a = np.asarray(img).astype(float)
lum = a.mean(2)
sat = a.max(2) - a.min(2)
g = np.asarray(img.convert('L').filter(ImageFilter.GaussianBlur(1.2))).astype(float)
gy, gx = np.gradient(g)
grad = np.hypot(gx, gy)
cand = (sat < 18) & (lum > 14) & (lum < 80) & (grad < 4.5)
# flood from image border
lab, n = ndi.label(cand)
border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
bg = np.isin(lab, list(border))
bg = ndi.binary_opening(bg, iterations=2)
fg = ~bg
fg = ndi.binary_fill_holes(fg)
# keep largest component
lab, n = ndi.label(fg)
sizes = ndi.sum(fg, lab, range(1, n + 1))
fg = lab == (np.argmax(sizes) + 1)
fg = ndi.binary_closing(fg, iterations=4)
fg = ndi.binary_fill_holes(fg)
fg = ndi.binary_erosion(fg, iterations=1)
alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))
rgba = img.copy(); rgba.putalpha(alpha)
bbox = alpha.getbbox(); rgba = rgba.crop(bbox)
rgba.save(out)
if preview:
    pv = Image.new('RGB', rgba.size, (8, 46, 59)); pv.paste(rgba, (0, 0), rgba); pv.save(preview)
print('bbox', bbox, 'size', rgba.size)
