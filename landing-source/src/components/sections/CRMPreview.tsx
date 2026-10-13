"use client";

import { LayoutGroup, motion } from "framer-motion";
import { BarChart3, FileText, Inbox, LayoutDashboard, RotateCcw, Settings, SquareKanban, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DemoTag } from "../ui/primitives";
import { CountUp, Reveal, useSequence } from "../ui/motion";

const STAGES = [
  "New RFQ",
  "Contact Attempted",
  "Connected",
  "Quote Prepared",
  "Quote Sent",
  "Proof Sent",
  "Won",
  "Lost",
  "Unqualified",
];
/** Path the featured opportunity travels: New RFQ → … → Won */
const PATH = [0, 1, 2, 3, 4, 5, 6];

const FILLER: Record<number, { qty: string; type: string }[]> = {
  0: [{ qty: "300", type: "Woven" }, { qty: "1,000", type: "PVC" }],
  1: [{ qty: "750", type: "Chenille" }],
  2: [{ qty: "250", type: "Embroidered" }],
  3: [{ qty: "400", type: "Leather" }],
  4: [{ qty: "600", type: "PVC" }, { qty: "350", type: "Printed" }],
  5: [{ qty: "500", type: "Woven" }],
  6: [{ qty: "1,200", type: "Embroidered" }],
  7: [{ qty: "250", type: "PVC" }],
  8: [{ qty: "40", type: "Embroidered" }],
};

const METRICS = [
  { label: "Total RFQs", to: 128 },
  { label: "Qualified RFQs", to: 112 },
  { label: "Quotes Sent", to: 74 },
  { label: "Orders Won", to: 31 },
  { label: "Pipeline Value", to: 48600, prefix: "$" },
  { label: "Avg. Response", to: 4, suffix: "m 12s" },
];

export function CRMPreview() {
  const [run, setRun] = useState(0);
  return (
    <section aria-labelledby="crm-title" className="section-y relative border-t border-line bg-bg-2">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow">CRM &amp; sales pipeline</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 id="crm-title" className="display h2 mt-4">
                Every opportunity.
                <br />
                <span className="text-grad">Visible in one place.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="lead">
              Each accepted RFQ becomes a contact and an opportunity, with stage tracking from first contact to won — and the
              artwork one click away.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="mt-12">
          <Dashboard key={run} onReplay={() => setRun((r) => r + 1)} />
        </Reveal>
      </div>
    </section>
  );
}

function Dashboard({ onReplay }: { onReplay: () => void }) {
  const { ref, step, done } = useSequence(PATH.length - 1, { interval: 1250, startDelay: 900, amount: 0.3 });
  const pos = PATH[Math.min(step, PATH.length - 1)];
  const scroller = useRef<HTMLDivElement>(null);
  const cols = useRef<(HTMLDivElement | null)[]>([]);

  // Keep the moving opportunity in view on narrow screens (scrolls the board only, never the page).
  useEffect(() => {
    const sc = scroller.current;
    const col = cols.current[pos];
    if (!sc || !col || sc.scrollWidth <= sc.clientWidth) return;
    sc.scrollTo({ left: Math.max(0, col.offsetLeft - sc.clientWidth / 2 + col.clientWidth / 2), behavior: "smooth" });
  }, [pos]);

  return (
    <div ref={ref} className="overflow-hidden rounded-[1.4rem] border border-line bg-surface shadow-lg">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          </span>
          <span className="text-[0.85rem] font-bold">Sales Pipeline</span>
        </div>
        <div className="flex items-center gap-2">
          <DemoTag>Demo dashboard · example view</DemoTag>
          {done && (
            <button type="button" onClick={onReplay} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-muted hover:text-fg">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Replay
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-line p-3 lg:block" aria-hidden>
          {[
            [LayoutDashboard, "Dashboard"],
            [SquareKanban, "Pipeline"],
            [Inbox, "RFQs"],
            [Users, "Contacts"],
            [FileText, "Quotes"],
            [BarChart3, "Reports"],
            [Settings, "Settings"],
          ].map(([I, t], i) => {
            const Icon = I as typeof Inbox;
            return (
              <div
                key={t as string}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.82rem] font-semibold ${i === 1 ? "bg-accent-soft text-accent" : "text-subtle"}`}
              >
                <Icon className="h-4 w-4" />
                {t as string}
              </div>
            );
          })}
        </aside>

        <div className="min-w-0 p-4 sm:p-5">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {METRICS.map((m) => (
              <div key={m.label} className="rounded-xl border border-line bg-surface-2 px-3.5 py-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-subtle">{m.label}</p>
                <p className="mt-1 font-mono text-lg font-bold">
                  <CountUp to={m.to} prefix={m.prefix} suffix={m.suffix} />
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[0.7rem] text-subtle">Sample figures for illustration only — not Madvert Labs results.</p>

          {/* Kanban */}
          <div ref={scroller} className="no-scrollbar -mx-4 mt-4 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
            <LayoutGroup>
              <div className="flex gap-2.5">
                {STAGES.map((s, ci) => {
                  const fillers = FILLER[ci] ?? [];
                  const muted = ci >= 7;
                  return (
                    <div
                      key={s}
                      ref={(el) => {
                        cols.current[ci] = el;
                      }}
                      className={`w-[172px] shrink-0 rounded-xl border p-2 transition-colors duration-500 ${
                        ci === pos ? "border-[var(--accent-line)] bg-accent-soft" : "border-line bg-surface-2"
                      }`}
                    >
                      <div className="flex items-center justify-between px-1 pb-2">
                        <span className={`text-[0.66rem] font-bold uppercase tracking-[0.08em] ${muted ? "text-subtle" : "text-fg"}`}>{s}</span>
                        <span className="font-mono text-[0.66rem] text-subtle">{fillers.length + (ci === pos ? 1 : 0)}</span>
                      </div>
                      <div className="grid min-h-[150px] content-start gap-1.5">
                        {ci === pos && (
                          <motion.div
                            layoutId="featured-rfq"
                            className="rounded-lg border border-[var(--accent-line)] bg-surface p-2.5 shadow-md"
                            transition={{ type: "spring", stiffness: 260, damping: 30 }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="grid h-6 w-6 place-items-center rounded-full bg-grad text-[0.55rem] font-extrabold text-navy">JD</span>
                              <div className="min-w-0 leading-tight">
                                <p className="truncate text-[0.72rem] font-bold">John Davis</p>
                                <p className="truncate text-[0.62rem] text-subtle">Apex Apparel Co.</p>
                              </div>
                            </div>
                            <p className="mt-1.5 text-[0.66rem] font-semibold text-muted">500 · Embroidered</p>
                            <span
                              className={`mt-1.5 inline-block rounded px-1.5 py-0.5 text-[0.56rem] font-extrabold uppercase tracking-wide ${
                                pos === 6 ? "bg-ok/15 text-ok" : "bg-accent-soft text-accent"
                              }`}
                            >
                              {pos === 6 ? "Won" : STAGES[pos]}
                            </span>
                          </motion.div>
                        )}
                        {fillers.map((f, k) => (
                          <div key={k} className={`rounded-lg border border-line bg-surface p-2.5 ${muted ? "opacity-60" : ""}`}>
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-6 rounded-full bg-surface-3" />
                              <div className="grid flex-1 gap-1">
                                <span className="h-1.5 w-4/5 rounded bg-surface-3" />
                                <span className="h-1.5 w-1/2 rounded bg-surface-3" />
                              </div>
                            </div>
                            <p className="mt-1.5 text-[0.64rem] font-semibold text-subtle">
                              {f.qty} · {f.type}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
