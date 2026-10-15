"use client";

import type { ReactNode } from "react";
import { PHASES } from "@/onboarding/progress";
import type { PhaseKey } from "@/onboarding/types";
import { Btn, SaveBadge, StatusPill } from "./kit";
import type { View } from "./PortalApp";
import { usePortal } from "./store";

export function StepHeader({ phase, title, accent, intro, aside }: { phase: PhaseKey; title: string; accent?: string; intro?: ReactNode; aside?: ReactNode }) {
  const { progress } = usePortal();
  const p = PHASES.find((x) => x.key === phase)!;
  const pr = progress.byKey[phase];
  return (
    <div className="ob-enter mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="ob-eyebrow">
          Step {p.n} · {p.label}
        </p>
        <h1 className="ob-h1 mt-4">
          {title} {accent ? <span className="ob-grad-text">{accent}</span> : null}
        </h1>
        {intro ? <div className="ob-lead mt-4">{intro}</div> : null}
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        <StatusPill status={pr.status} />
        {aside}
      </div>
    </div>
  );
}

export function StepFooter({ back, next, nextLabel, go, onNext }: { back?: View; next?: View; nextLabel?: string; go: (v: View) => void; onNext?: () => void | Promise<void> }) {
  const { saveState } = usePortal();
  return (
    <div className="sticky bottom-3 z-30 mt-10">
      <div className="ob-card flex items-center gap-3 px-3 py-3 sm:px-4">
        {back ? (
          <Btn variant="ghost" size="sm" icon="back" onClick={() => go(back)}>
            Back
          </Btn>
        ) : null}
        <span className="ml-1 hidden flex-1 sm:block">
          <SaveBadge state={saveState === "idle" ? "saved" : saveState} />
        </span>
        <span className="flex-1 sm:hidden" />
        {next ? (
          <Btn size="sm" arrow onClick={async () => (onNext ? await onNext() : go(next))}>
            {nextLabel ?? "Save and continue"}
          </Btn>
        ) : null}
      </div>
    </div>
  );
}
