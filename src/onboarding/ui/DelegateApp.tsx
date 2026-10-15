"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { assetSectionDone } from "@/onboarding/progress";
import type { ClientState } from "@/onboarding/server/views";
import { ACCESS_BY_KEY } from "@/onboarding/template/access";
import { WizardFor } from "./AccessStep";
import { AssetCard } from "./AssetsStep";
import { Btn, Confetti, Field, GlowMark, Icon, ThemeSwitch, Waves } from "./kit";
import { PortalProvider, progressInputFrom, usePortal, type PortalMode } from "./store";

type Task = Extract<PortalMode, { kind: "delegate" }>["task"];

export function DelegateApp({ initial, token, task, from }: { initial: ClientState; token: string; task: Task; from: string }) {
  return (
    <PortalProvider initial={initial} mode={{ kind: "delegate", token, task }}>
      <Delegate task={task} from={from} />
    </PortalProvider>
  );
}

function Delegate({ task, from }: { task: Task; from: string }) {
  const { state, call, answers, setAnswer, flush } = usePortal();
  const [done, setDone] = useState(task.status === "completed");
  const [kind, key] = task.taskKey.split(":");
  const input = progressInputFrom(state, answers);
  const answerKey = `delegated.${task.id}`;

  return (
    <div className="ob">
      <Waves />
      <header className="ob-header">
        <div className="ob-wrap flex h-16 items-center justify-between">
          <Logo href={null} height={24} />
          <ThemeSwitch />
        </div>
      </header>
      <main className="ob-wrap relative pb-24 pt-8 sm:pt-12">
        <section className="ob-navy ob-enter p-6 sm:p-10">
          <div className="ob-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <GlowMark size={64} />
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-[#7fdcff]">ONE TASK FOR {state.onboarding.companyName.toUpperCase()}</p>
              <h1 className="ob-h1 mt-2 text-white">
                Hi {task.name}, {from} asked for your help.
              </h1>
              <p className="mt-3 text-[16px] text-[#c4d1e2]">{task.taskLabel}</p>
              {task.message ? <p className="mt-4 rounded-2xl bg-white/[0.06] px-4 py-3 text-[14.5px] text-[#dbe5f1]">“{task.message}”</p> : null}
            </div>
          </div>
          <p className="relative mt-6 flex items-center gap-2 text-[13px] text-[#8a9ab2]">
            <Icon name="lock" size={14} /> This secure link only opens this task. You will not see the rest of their onboarding, and no passwords need to be shared.
          </p>
        </section>

        <div className="mt-8">
          {kind === "access" && ACCESS_BY_KEY[key] ? (
            <div className="ob-card ob-card-pad">
              <WizardFor platform={key} />
            </div>
          ) : null}
          {kind === "asset" ? <AssetCard k={key} required done={assetSectionDone(input, key)} /> : null}
          {kind === "question" ? (
            <div className="ob-card ob-card-pad">
              <Field label="Your answer" htmlFor="dq">
                <textarea id="dq" className="ob-textarea" value={String(answers[answerKey]?.answer ?? "")} onChange={(e) => setAnswer(answerKey, "answer", e.target.value)} />
              </Field>
            </div>
          ) : null}
        </div>

        <div className="ob-card relative mt-8 flex flex-col items-center gap-4 overflow-hidden p-6 text-center sm:p-8">
          {done ? (
            <>
              <Confetti />
              <p className="ob-h2">Thank you, {task.name}.</p>
              <p className="ob-lead">We’ve let {from} and the Madvert team know. You can close this page.</p>
            </>
          ) : (
            <>
              <p className="text-[15px] text-[var(--ob-ink-2)]">Finished? Let {from} and Madvert know.</p>
              <Btn
                size="lg"
                icon="check"
                onClick={async () => {
                  await flush();
                  const r = await call("delegate-complete");
                  if (!r.error) setDone(true);
                }}
              >
                Mark task as done
              </Btn>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
