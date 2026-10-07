/** An editing timeline with a moving playhead. Decorative, CSS only. */
export function EditTimeline({ className = "" }: { className?: string }) {
  const tracks = [
    { label: "V2", clips: [[6, 18, "#a78bfa"], [40, 22, "#a78bfa"], [70, 14, "#a78bfa"]] },
    { label: "V1", clips: [[0, 26, "#00b4ff"], [27, 20, "#00b4ff"], [48, 30, "#00b4ff"], [79, 21, "#00b4ff"]] },
    { label: "A1", clips: [[0, 100, "#2dd4bf"]] },
    { label: "A2", clips: [[12, 40, "#f59e0b"], [60, 30, "#f59e0b"]] },
  ] as const;
  return (
    <div className={`panel overflow-hidden p-4 sm:p-5 ${className}`} aria-hidden="true">
      <div className="flex items-center justify-between text-[11px] text-ink-3">
        <span className="font-display tracking-[0.18em]">MADVERT STUDIOS · TIMELINE</span>
        <span className="font-mono">00:00:15:00</span>
      </div>
      <div className="relative mt-4 space-y-2">
        {tracks.map((t) => (
          <div key={t.label} className="flex items-center gap-3">
            <span className="w-6 font-mono text-[10px] text-ink-3">{t.label}</span>
            <div className="relative h-7 flex-1 rounded-md bg-bg">
              {t.clips.map(([x, w, c], i) => (
                <span
                  key={i}
                  className="absolute inset-y-1 rounded-[5px] border"
                  style={{ left: `${x}%`, width: `${w}%`, background: `${c}26`, borderColor: `${c}80` }}
                >
                  {t.label === "A1" ? (
                    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="h-full w-full">
                      <path d="M0 10 Q 2 2 4 10 T 8 10 T 12 10 T 16 10 T 20 10 T 24 10 T 28 10 T 32 10 T 36 10 T 40 10 T 44 10 T 48 10 T 52 10 T 56 10 T 60 10 T 64 10 T 68 10 T 72 10 T 76 10 T 80 10 T 84 10 T 88 10 T 92 10 T 96 10 T 100 10" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity=".7" />
                    </svg>
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        ))}
        <span className="timeline-playhead absolute -top-1 bottom-[-4px] left-9 w-[2px] bg-white shadow-[0_0_10px_#00e5ff]" />
      </div>
    </div>
  );
}
