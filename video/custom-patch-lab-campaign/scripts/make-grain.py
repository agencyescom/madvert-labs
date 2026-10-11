"""Tileable monochrome film-grain texture (512x512, mid-grey centred) used as
an overlay; its offset is jittered per frame in src/components/FilmGrain.tsx."""
import sys
import numpy as np
from PIL import Image, ImageFilter

rng = np.random.default_rng(7)
g = rng.normal(128, 38, (512, 512)).clip(0, 255).astype(np.uint8)
img = Image.fromarray(g, 'L').filter(ImageFilter.GaussianBlur(0.6))
img.save(sys.argv[1])
