"""Conform every shot in src/<ad>/edl.json to an exact-length 1080x1920 / 30 fps
segment in public/segments/<ad>/.

    python3 -I scripts/conform-shots.py ad02 [shot ids...]

Retiming and 24->30 fps conversion use motion-compensated interpolation for
slow camera moves (interp: true); shots with fast hand movement just drop or
duplicate frames to avoid warping artefacts. `pingpong: n` plays the source
range forward/back n times before retiming (for short periodic motion such as
an embroidery needle stroke)."""
import json, subprocess, sys
from pathlib import Path

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
    speed = span / (s['frames'] / fps)
    tail = 0 if reps > 1 else 0.2  # a little extra source so the last frame is never short
    trim = f"[0:v]trim=start={s['srcIn']:.4f}:end={s['srcOut'] + tail:.4f},setpts=PTS-STARTPTS"
    if reps > 1:
        parts = ''.join(f'[p{i}]' for i in range(reps))
        legs = ';'.join(f"[p{i}]{'reverse,' if i % 2 else ''}setpts=PTS-STARTPTS[q{i}]" for i in range(reps))
        trim += f",split={reps}{parts};{legs};{''.join(f'[q{i}]' for i in range(reps))}concat=n={reps}"
    rate = (f"minterpolate=fps={fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" if s['interp'] else f"fps={fps}")
    vf = f"{trim},setpts=PTS/{speed:.6f},{rate},scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0.0,format=yuv420p[v]"
    dst = out_dir / f"{s['id']}.mp4"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(root / f'assets/source/{ad}/footage' / s['source']), '-an',
                    '-filter_complex', vf, '-map', '[v]', '-frames:v', str(s['frames']), '-r', str(fps),
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-g', '15', str(dst)], check=True)
    n = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries',
                        'stream=nb_read_frames', '-of', 'csv=p=0', str(dst)], capture_output=True, text=True).stdout.strip()
    print(f"{s['id']}: {s['srcIn']}-{s['srcOut']}s x{speed:.3f} -> {n}/{s['frames']} frames  {dst.relative_to(root)}")
    assert int(n) == s['frames'], f"{s['id']} has {n} frames, expected {s['frames']}"
