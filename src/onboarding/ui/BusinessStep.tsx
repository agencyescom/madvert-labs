"use client";

import { useState } from "react";
import { sectionProgress } from "@/onboarding/progress";
import { Btn, Icon, WhyWeNeedThis } from "./kit";
import type { View } from "./PortalApp";
import { QuestionGrid } from "./QuestionField";
import { StepFooter, StepHeader } from "./StepLayout";
import { usePortal } from "./store";

export function BusinessStep({ go }: { go: (v: View) => void }) {
  const { state, answers, setAnswer, flush } = usePortal();
  const sections = state.template.business;
  const [idx, setIdx] = useState(() => {
    const firstOpen = sections.findIndex((s) => {
      const p = sectionProgress(state.template, s.key, answers[s.key]);
      return p.done < p.total;
    });
    return firstOpen < 0 ? 0 : firstOpen;
  });
  const s = sections[idx];
  const values = answers[s.key] ?? {};
  const p = sectionProgress(state.template, s.key, values);
  const missing = s.questions.filter((q) => q.required && !values[q.key]);

  const goSection = async (i: number) => {
    await flush();
    setIdx(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <StepHeader phase="business" title="Tell us how the" accent="business works." intro="Four short sections. Skip anything you are unsure about and come back later; every answer saves as you type." />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-40 lg:flex-col lg:self-start lg:overflow-visible" aria-label="Business sections">
          {sections.map((sec, i) => {
            const sp = sectionProgress(state.template, sec.key, answers[sec.key]);
            const done = sp.total > 0 && sp.done === sp.total;
            const active = i === idx;
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => goSection(i)}
                className={`ob-card flex min-w-[180px] items-center gap-3 px-4 py-3 text-left transition-all lg:min-w-0 ${active ? "shadow-[0_0_0_1.5px_rgb(0_160_255/0.5),var(--ob-shadow)]" : "opacity-90 hover:opacity-100"}`}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className="grid h-9 w-9 flex-none place-items-center rounded-xl text-[13px] font-bold"
                  style={done ? { background: "linear-gradient(135deg,#0ea5e9,#10b981)", color: "#fff" } : active ? { background: "var(--ob-grad)", color: "#fff" } : { background: "var(--ob-card-2)", color: "var(--ob-ink-3)" }}
                >
                  {done ? <Icon name="check" size={15} stroke={2.6} /> : sec.letter}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold">{sec.title}</span>
                  <span className="block text-[12px] text-[var(--ob-ink-3)]">
                    {sp.done}/{sp.total} required
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <section className="ob-card ob-card-pad ob-enter" key={s.key}>
          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold tracking-[0.2em] text-[var(--ob-blue)]">SECTION {s.letter}</p>
              <h2 className="ob-h2 mt-1">{s.title}</h2>
              {s.intro ? <p className="mt-2 text-[15px] text-[var(--ob-ink-2)]">{s.intro}</p> : null}
            </div>
            <span className="text-[13px] font-semibold text-[var(--ob-ink-3)]">
              {p.done} of {p.total} required answered
            </span>
          </div>
          {s.why ? (
            <div className="mb-7">
              <WhyWeNeedThis title={s.why.title}>{s.why.body}</WhyWeNeedThis>
            </div>
          ) : null}
          <QuestionGrid questions={s.questions} values={values} onChange={(k, v) => setAnswer(s.key, k, v)} idPrefix={s.key} />
          {missing.length && idx === sections.length - 1 ? (
            <p className="ob-callout mt-8" data-tone="info">
              You can continue now and finish the remaining required answers later.
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <Btn variant="ghost" size="sm" icon="back" disabled={idx === 0} onClick={() => goSection(idx - 1)}>
              Previous section
            </Btn>
            {idx < sections.length - 1 ? (
              <Btn size="sm" arrow onClick={() => goSection(idx + 1)}>
                Next: {sections[idx + 1].title}
              </Btn>
            ) : (
              <Btn size="sm" arrow onClick={async () => (await flush(), go("access"))}>
                Continue to Access
              </Btn>
            )}
          </div>
        </section>
      </div>
      <StepFooter back="home" next="access" nextLabel="Continue to Access" go={go} />
    </div>
  );
}
