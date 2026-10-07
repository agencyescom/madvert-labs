"use client";

import { useId, useState } from "react";

/** Example of a customer facing calculator. Lets visitors model their own numbers; nothing here is a claim. */
export function LeadValueCalculator() {
  const [leads, setLeads] = useState(120);
  const [contact, setContact] = useState(60);
  const [close, setClose] = useState(20);
  const [value, setValue] = useState(2500);
  const id = useId();
  const revenue = Math.round(leads * (contact / 100) * (close / 100) * value);
  const better = Math.round(leads * (Math.min(contact + 20, 100) / 100) * (close / 100) * value);
  const fmt = (n: number) => new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(n);

  const field = (label: string, v: number, set: (n: number) => void, min: number, max: number, step: number, suffix = "") => (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={`${id}-${label}`} className="text-[13.5px] text-ink-2">
          {label}
        </label>
        <span className="font-display text-[15px] font-semibold">
          {fmt(v)}
          {suffix}
        </span>
      </div>
      <input id={`${id}-${label}`} type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} className="mt-2 w-full accent-[#00b4ff]" />
    </div>
  );

  return (
    <div className="panel grid grid-cols-1 gap-8 p-6 sm:p-10 md:grid-cols-2">
      <div className="space-y-5">
        <p className="t-label">Example calculator</p>
        {field("Monthly enquiries", leads, setLeads, 10, 1000, 10)}
        {field("Enquiries you actually reach", contact, setContact, 10, 100, 5, "%")}
        {field("Close rate when reached", close, setClose, 1, 60, 1, "%")}
        {field("Average deal value", value, setValue, 100, 20000, 100)}
      </div>
      <div className="flex flex-col justify-center rounded-2xl border border-line bg-bg p-6">
        <p className="t-label">Monthly revenue from enquiries</p>
        <p className="mt-3 font-display text-[40px] font-semibold tracking-tight" aria-live="polite">
          {fmt(revenue)}
        </p>
        <div className="hairline my-6" />
        <p className="text-[14px] text-ink-2">If you reached 20 percentage points more of the same enquiries:</p>
        <p className="t-grad mt-2 font-display text-[30px] font-semibold tracking-tight">{fmt(better)}</p>
        <p className="mt-6 text-[12px] text-ink-3">Your inputs, your currency. A model, not a promise.</p>
      </div>
    </div>
  );
}
