"""Conform every shot in src/<ad>/edl.json to an exact-length 1080x1920 / 30 fps
segment in public/segments/<ad>/.

    python3 -I scripts/conform-shots.py ad02 [shot ids...]

Retiming and 24->30 fps conversion use motion-compensated interpolation for
slow camera moves (interp: true); shots with fast hand movement just drop or
duplicate frames to avoid warping artefacts. `pingpong: n` plays the source
range forward/back n times before retiming (for short periodic motion such as
an embroidery needle stroke). `look: "sketch"` renders the shot as a pencil
sketch of itself (edge lines on paper + pale colour-pencil wash), so an
"artwork to patch" reveal uses the exact patch artwork, not a substitute."""
import json, subprocess, sys
from pathlib import Path

SKETCH = ("split=2[so][ss];[ss]format=gray,gblur=sigma=1.1,edgedetect=low=0.035:high=0.12:mode=wires,negate,"
          "gblur=sigma=0.7,eq=gamma=0.6,format=gbrp[sl];[so]hue=s=0.9,eq=brightness=0.22:contrast=0.5:gamma=1.1,"
          "format=gbrp,colorchannelmixer=rr=1.0:gg=0.97:bb=0.88[sw];[sl][sw]blend=all_mode=multiply")

root = Path(__file__).resolve().parent.parent
ad = sys.argv[1]
edl = json.loads((root / f'src/{ad}/edl.json').read_text())
out_dir = root / f'public/segments/{ad}'
out_dir.mkdir(parents=True, exist_ok=True)
only = set(sys.argv[2:])
for s in edl['shots']:
    if only and s['id'] not in only:
        continue
    fps = edl['fps']
    reps = s.get('pingpong', 1)
    span = (s['srcOut'] - s['srcIn']) * reps
    src = root / f'assets/source/{ad}/footage' / s['source']
    src_dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(src)],
                                   capture_output=True, text=True).stdout)
    # ranges that end on the clip's last frame (and ping-pong legs) have no spare
    # source after them: play ~6% slower so the segment is never a frame short
    at_end = reps > 1 or s['srcOut'] >= src_dur - 0.05
    # (+ a 0.1 s last-frame pad below as a final guard against interpolation dropping a frame)
    speed = span / (s['frames'] / fps) * (0.94 if at_end else 1.0)
    tail = 0 if at_end else 0.2  # a little extra source so the last frame is never short
    trim = f"[0:v]trim=start={s['srcIn']:.4f}:end={s['srcOut'] + tail:.4f},setpts=PTS-STARTPTS"
    if reps > 1:
        parts = ''.join(f'[p{i}]' for i in range(reps))
        legs = ';'.join(f"[p{i}]{'reverse,' if i % 2 else ''}setpts=PTS-STARTPTS[q{i}]" for i in range(reps))
        trim += f",split={reps}{parts};{legs};{''.join(f'[q{i}]' for i in range(reps))}concat=n={reps}"
    rate = (f"minterpolate=fps={fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" if s['interp'] else f"fps={fps}")
    look = f",{SKETCH}" if s.get('look') == 'sketch' else ''
    vf = f"{trim},setpts=PTS/{speed:.6f},{rate},tpad=stop_mode=clone:stop_duration=0.1,scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0.0{look},format=yuv420p[v]"
    dst = out_dir / f"{s['id']}.mp4"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-an',
                    '-filter_complex', vf, '-map', '[v]', '-frames:v', str(s['frames']), '-r', str(fps),
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-g', '15', str(dst)], check=True)
    n = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries',
                        'stream=nb_read_frames', '-of', 'csv=p=0', str(dst)], capture_output=True, text=True).stdout.strip()
    print(f"{s['id']}: {s['srcIn']}-{s['srcOut']}s x{speed:.3f} -> {n}/{s['frames']} frames  {dst.relative_to(root)}")
    assert int(n) == s['frames'], f"{s['id']} has {n} frames, expected {s['frames']}"
