"""Word-level forced alignment of audio/voiceover.mp3 against SCRIPT.

Run:  uv run --no-project --with pocketsphinx python scripts/align.py
Writes data/words.json: [{"w": display word, "s": start sec, "e": end sec}, ...]

Uses PocketSphinx's bundled en-us acoustic model (no download needed).
SPOKEN maps display words to how they are pronounced, so acronyms align.
"""
import json, re, subprocess, wave, tempfile, os
from pocketsphinx import Decoder

SCRIPT = """
Stop running ads. Not until you fix this.
Leads go cold. Follow up is slow. Visitors leave without buying. Search can't find you. And none of your tools talk to each other.
Every gap is money walking out the door.
You don't have a marketing problem. You have a growth system problem.
Madvert Labs fixes the system.
We build brands people remember.
We bring in demand from Meta, Google, SEO and AI search.
We turn attention into booked calls with websites and funnels that convert.
Our studio makes ads people actually stop for.
Then every lead gets an instant reply, qualified by AI, booked and tracked. Automatically.
And when growth needs technology? We build it.
One partner. One system. No gaps. No excuses.
Book your Business Strategy Call at madvertlabs.com.
Madvert Labs. Beyond advertising. We build growth systems.
"""

# display word (lowercase, no punctuation) -> spoken tokens
SPOKEN = {"seo": "s e o", "ai": "a i", "madvertlabs.com": "madvert labs dot com"}
EXTRA_DICT = {"madvert": "M AE D V ER T"}

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
display = SCRIPT.split()
spoken, owner = [], []
for i, w in enumerate(display):
    key = re.sub(r"[^a-z0-9'.]", "", w.lower()).rstrip(".")
    for tok in SPOKEN.get(key, key).split():
        spoken.append(tok); owner.append(i)

with tempfile.TemporaryDirectory() as td:
    wav = os.path.join(td, "vo.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(root, "audio/voiceover.mp3"),
                    "-ar", "16000", "-ac", "1", wav], check=True)
    data = wave.open(wav).readframes(10**9)

d = Decoder(samprate=16000, bestpath=False, loglevel="FATAL")
for w, p in EXTRA_DICT.items():
    d.add_word(w, p, False)
d.set_align_text(" ".join(spoken))
d.start_utt(); d.process_raw(data, full_utt=True); d.end_utt()
segs = [(re.sub(r"\(\d+\)$", "", s.word), s.start_frame / 100, (s.end_frame + 1) / 100)
        for s in d.seg() if s.word not in ("<sil>", "<s>", "</s>", "[NOISE]")]
assert len(segs) == len(spoken), (len(segs), len(spoken))

out = []
for (tok, s, e), i in zip(segs, owner):
    if out and out[-1]["i"] == i:
        out[-1]["e"] = e
    else:
        out.append({"i": i, "w": display[i], "s": s, "e": e})
for o in out: del o["i"]
os.makedirs(os.path.join(root, "data"), exist_ok=True)
json.dump(out, open(os.path.join(root, "data/words.json"), "w"), indent=0)
print(f"{len(out)} words, last ends {out[-1]['e']:.2f}s")
