"""Conform every shot in src/edl.json to an exact-length 1080x1920 / 30 fps
segment in public/segments/. Retiming and 24->30 fps conversion use motion-
compensated interpolation for slow camera moves (interp: true); shots with
hands moving fast just drop/duplicate frames to avoid warping artefacts."""
import json, subprocess, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
edl = json.loads((root / 'src/edl.json').read_text())
out_dir = root / 'public/segments'
out_dir.mkdir(parents=True, exist_ok=True)
only = set(sys.argv[1:])
for s in edl['shots']:
    if only and s['id'] not in only:
        continue
    fps = edl['fps']
    span = s['srcOut'] - s['srcIn']
    speed = span / (s['frames'] / fps)
    retime = f"trim=start={s['srcIn']:.4f}:end={s['srcOut'] + 0.2:.4f},setpts=(PTS-STARTPTS)/{speed:.6f}"
    rate = (f"minterpolate=fps={fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" if s['interp'] else f"fps={fps}")
    vf = f"{retime},{rate},scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0.0,format=yuv420p"
    dst = out_dir / f"{s['id']}.mp4"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(root / 'assets/source/footage' / s['source']), '-an',
                    '-vf', vf, '-frames:v', str(s['frames']), '-r', str(fps),
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-g', '15', str(dst)], check=True)
    n = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries',
                        'stream=nb_read_frames', '-of', 'csv=p=0', str(dst)], capture_output=True, text=True).stdout.strip()
    print(f"{s['id']}: {s['srcIn']}-{s['srcOut']}s x{speed:.3f} -> {n}/{s['frames']} frames  {dst.relative_to(root)}")
    assert int(n) == s['frames'], f"{s['id']} has {n} frames, expected {s['frames']}"
