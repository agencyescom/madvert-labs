"use client";

import { StickyStory } from "@/components/story/StickyStory";

const columns = ["New", "Qualified", "Booked", "Follow Up", "Proposal", "Closed", "Lost"];

const mechanism = [
  { name: "Capture", line: "Every enquiry lands in one place, with its source attached.", col: 0, log: "Enquiry received from a paid social form" },
  { name: "Respond", line: "A reply goes out in seconds, on the channel the lead prefers.", col: 0, log: "WhatsApp reply sent automatically" },
  { name: "Qualify", line: "The right questions are asked and answered before a human steps in.", col: 1, log: "Budget, timeline and location confirmed" },
  { name: "Nurture", line: "Not ready yet? Useful follow up keeps the conversation warm.", col: 3, log: "Follow up sequence running" },
  { name: "Book", line: "Qualified leads choose a time without the back and forth.", col: 2, log: "Strategy call booked in the calendar" },
  { name: "Track", line: "Every outcome is recorded, so you know what produced revenue.", col: 5, log: "Closed and attributed to its source campaign" },
];

function Board({ step }: { step: number }) {
  const m = mechanism[step];
  return (
    <div className="panel p-4 sm:p-6" role="img" aria-label={`Lead at stage ${m.name}: ${m.log}. Pipeline column ${columns[m.col]}.`}>
      <div className="flex items-center justify-between">
        <p className="t-label">Pipeline</p>
        <p className="font-display text-[12px] font-semibold text-accent-text">
          Step {step + 1} of {mechanism.length}: {m.name}
        </p>
      </div>
      <div className="relative mt-5 grid grid-cols-7 gap-1.5">
        {columns.map((c, i) => (
          <div key={c} className={`rounded-lg border px-1 py-2 text-center text-[10px] font-medium leading-tight sm:text-[11px] ${i === m.col ? "border-[rgb(0_200_255/0.5)] bg-accent-soft text-ink" : "border-line text-ink-3"}`}>
            {c}
          </div>
        ))}
        <div className="pointer-events-none absolute -bottom-3 h-[3px] rounded-full bg-[linear-gradient(90deg,#00b4ff,#00e5ff)] transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]" style={{ left: 0, width: `${((m.col + 1) / columns.length) * 100}%` }} />
      </div>
      <div className="mt-8 rounded-2xl border border-line bg-bg p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 font-display text-[13px] font-semibold">NL</span>
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold">New lead</p>
            <p className="text-[12.5px] text-ink-3">Example journey</p>
          </div>
          <span className="ml-auto rounded-full border border-[rgb(0_200_255/0.4)] px-2.5 py-0.5 text-[11.5px] text-accent-text">{columns[m.col]}</span>
        </div>
        <ol className="mt-5 space-y-2.5">
          {mechanism.slice(0, step + 1).map((s, i) => (
            <li key={s.name} className="flex items-start gap-3 text-[13.5px]">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i === step ? "bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" : "bg-[var(--line-strong)]"}`} />
              <span className={i === step ? "text-ink" : "text-ink-3"}>{s.log}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function LeadJourney() {
  const steps = mechanism.map((m, i) => (
    <div key={m.name}>
      <p className="font-display text-[13px] font-semibold tracking-[0.2em] text-accent-text">0{i + 1}</p>
      <h3 className="t-h1 mt-3">{m.name}</h3>
      <p className="t-lead mt-4 max-w-[420px]">{m.line}</p>
    </div>
  ));
  return <StickyStory steps={steps} stage={(a) => <Board step={a} />} />;
}
