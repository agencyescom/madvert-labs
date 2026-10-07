"use client";

import { useId, useState } from "react";

const marks = [
  { v: 0, label: "1 min" },
  { v: 1, label: "5 min" },
  { v: 2, label: "1 hour" },
  { v: 3, label: "Same day" },
  { v: 4, label: "Tomorrow" },
];
const temps = [96, 82, 55, 32, 14];
const words = ["Hot. They are still on your website.", "Warm. They remember why they asked.", "Cooling. They are comparing options.", "Cold. Someone else already replied.", "Gone. You can guess how that story ends."];

/** Illustrative model: the longer the reply takes, the colder the interest. */
export function InterestTemperature() {
  const [v, setV] = useState(0);
  const id = useId();
  const t = temps[v];
  const hue = t > 70 ? "#00e5ff" : t > 40 ? "#38bdf8" : t > 20 ? "#94a3b8" : "#64748b";
  return (
    <div className="panel p-6 sm:p-8">
      <label htmlFor={id} className="t-label">
        Response time
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={4}
        step={1}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        aria-valuetext={marks[v].label}
        className="mt-5 w-full accent-[#00b4ff]"
      />
      <div className="mt-2 flex justify-between text-[11.5px] text-ink-3">
        {marks.map((m) => (
          <span key={m.v}>{m.label}</span>
        ))}
      </div>
      <div className="mt-8 flex items-end gap-5">
        <div className="relative h-40 w-10 overflow-hidden rounded-full border border-line-strong bg-bg" aria-hidden="true">
          <div className="absolute inset-x-0 bottom-0 rounded-full transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]" style={{ height: `${t}%`, background: `linear-gradient(to top, ${hue}, ${hue}88)`, boxShadow: `0 0 20px ${hue}66` }} />
        </div>
        <div>
          <p className="t-label">Interest</p>
          <p className="mt-2 font-display text-[44px] font-semibold leading-none tracking-tight" style={{ color: hue }}>
            {t}°
          </p>
          <p className="mt-3 max-w-[260px] text-[15px] text-ink-2" aria-live="polite">
            {words[v]}
          </p>
        </div>
      </div>
      <p className="mt-6 text-[12px] text-ink-3">Illustrative model, not client data.</p>
    </div>
  );
}
