"use client";

import { useEffect, useState } from "react";
import type { ResolvedGuide } from "@/onboarding/server/guides";
import type { GuideIllustration } from "@/onboarding/types";
import { Btn, CopyButton, Field, Icon, Sheet } from "./kit";
import { usePortal } from "./store";

/* ───────── Illustration (original diagram of the settings screen) ───────── */

export function GuideMock({ ill }: { ill: GuideIllustration }) {
  return (
    <div className="ob-mock" role="img" aria-label={`Illustration: ${ill.chrome}${ill.active ? `, ${ill.active.trim()} highlighted` : ""}`}>
      <div className="bar">
        <i />
        <i />
        <i />
        <span className="ml-2 truncate">{ill.chrome}</span>
      </div>
      <div className="flex min-h-[210px]">
        <div className="side">
          {ill.nav.map((n) => (
            <div key={n} className={n === ill.active ? "hl" : ""} style={{ paddingLeft: n.startsWith("  ") ? 18 : 8 }}>
              {n.trim()}
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-3.5">
          {ill.title ? <div className="text-[13px] font-bold text-[#1c2434]">{ill.title}</div> : null}
          {ill.rows?.map((r) => (
            <div key={r} className="rounded-md border border-[#e6ebf2] px-2.5 py-2 text-[11.5px] text-[#4b5567]">
              {r}
            </div>
          ))}
          {ill.field ? (
            <div>
              <div className="mb-1 text-[10.5px] font-semibold text-[#6b7588]">{ill.field.label}</div>
              <div className="field hl">{ill.field.value}</div>
            </div>
          ) : null}
          {ill.checks?.map((c) => (
            <div key={c} className="flex items-center gap-2 text-[11.5px] text-[#2b3445]">
              <span className="grid h-4 w-4 place-items-center rounded bg-[#0a66ff] text-white">
                <Icon name="check" size={11} stroke={3} />
              </span>
              {c}
            </div>
          ))}
          {ill.button ? (
            <div className="mt-auto flex justify-end">
              <span className="btn hl">{ill.button}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StepVisual({ g }: { g: ResolvedGuide }) {
  if (g.screenshotUrl)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={g.screenshotUrl} alt={`${g.title} screenshot`} className="w-full rounded-2xl shadow-[0_0_0_1px_var(--ob-line-2),0_22px_50px_-26px_rgb(0_60_140/0.5)]" loading="lazy" />;
  if (g.illustration) return <GuideMock ill={g.illustration} />;
  return null;
}

export function GuideSteps({ platform, compact = false }: { platform: string; compact?: boolean }) {
  const { state } = usePortal();
  const steps = state.guides.filter((g) => g.platform === platform).sort((a, b) => a.stepNumber - b.stepNumber);
  if (!steps.length) return null;
  return (
    <ol className="grid gap-5">
      {steps.map((g) => (
        <li key={g.id} className="ob-card p-4 sm:p-5">
          <div className={`ob-guide-step ${compact ? "!grid-cols-1" : ""}`}>
            <div>
              <span className="ob-step-badge">STEP {g.stepNumber}</span>
              <h4 className="ob-h3 mt-3">{g.title}</h4>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ob-ink-2)]">{g.instruction}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--ob-ink-3)]">
                {g.externalHelpUrl ? (
                  <a href={g.externalHelpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[var(--ob-blue)]">
                    Official help <Icon name="external" size={13} />
                  </a>
                ) : null}
                {g.lastReviewedAt ? <span>Reviewed {new Date(g.lastReviewedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span> : null}
              </div>
            </div>
            <StepVisual g={g} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/** "Watch Guide": the same steps as a self-advancing walkthrough. */
export function GuidePlayer({ platform, open, onClose }: { platform: string; open: boolean; onClose: () => void }) {
  const { state } = usePortal();
  const steps = state.guides.filter((g) => g.platform === platform).sort((a, b) => a.stepNumber - b.stepNumber);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!open || !playing || steps.length < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % steps.length), 6000);
    return () => clearTimeout(t);
  }, [open, playing, i, steps.length]);
  const close = () => {
    setI(0);
    onClose();
  };
  const g = steps[i];
  return (
    <Sheet open={open} onClose={close} label="Guide walkthrough">
      {g ? (
        <div className="grid gap-5 pt-4">
          <div className="flex items-center gap-2">
            {steps.map((s, n) => (
              <button key={s.id} type="button" aria-label={`Step ${n + 1}`} onClick={() => setI(n)} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--ob-line-2)]">
                <span className="block h-full rounded-full" style={{ width: n < i ? "100%" : n === i ? "100%" : "0%", background: "var(--ob-grad)", opacity: n <= i ? 1 : 0 }} />
              </button>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-[1fr_1.3fr] md:items-center">
            <div>
              <span className="ob-step-badge">
                STEP {g.stepNumber} OF {steps.length}
              </span>
              <h3 className="ob-h2 mt-3">{g.title}</h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--ob-ink-2)]">{g.instruction}</p>
            </div>
            <StepVisual g={g} />
          </div>
          <div className="flex items-center justify-between">
            <Btn variant="ghost" size="sm" icon="back" disabled={i === 0} onClick={() => setI(i - 1)}>
              Previous
            </Btn>
            <Btn variant="ghost" size="sm" icon={playing ? "clock" : "play"} onClick={() => setPlaying((p) => !p)}>
              {playing ? "Pause" : "Play"}
            </Btn>
            {i < steps.length - 1 ? (
              <Btn size="sm" arrow onClick={() => setI(i + 1)}>
                Next
              </Btn>
            ) : (
              <Btn size="sm" icon="check" onClick={close}>
                Done
              </Btn>
            )}
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}

/* ───────── Send this task to someone ───────── */

export function DelegateDialog({ open, onClose, taskKey, taskLabel }: { open: boolean; onClose: () => void; taskKey: string; taskLabel: string }) {
  const { call } = usePortal();
  const [f, setF] = useState({ name: "", email: "", role: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ link: string; emailDelivered: boolean } | null>(null);
  const close = () => {
    setResult(null);
    setErr("");
    onClose();
  };
  const submit = async () => {
    setBusy(true);
    setErr("");
    const r = await call<{ link: string; emailDelivered: boolean }>("delegate", { taskKey, taskLabel, ...f });
    setBusy(false);
    if (r.error) setErr(r.error);
    else setResult({ link: r.link, emailDelivered: r.emailDelivered });
  };
  return (
    <Sheet open={open} onClose={close} label="Send this task to someone">
      <div className="mx-auto max-w-xl pt-4">
        <p className="ob-eyebrow">Send this task to someone</p>
        <h3 className="ob-h2 mt-3">{taskLabel}</h3>
        <p className="mt-2 text-[15px] text-[var(--ob-ink-2)]">They get a secure link that opens only this task, with the same step by step instructions. They cannot see the rest of your onboarding.</p>
        {result ? (
          <div className="mt-6 grid gap-4">
            <p className="ob-callout" data-tone="success">
              {result.emailDelivered ? `Sent to ${f.email}. We’ll track when it is opened and completed.` : "Task created. Email delivery is not available right now, so copy the secure link below and send it to them directly."}
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-[var(--ob-card-2)] p-3">
              <code className="min-w-0 flex-1 truncate text-[12.5px]">{result.link}</code>
              <CopyButton value={result.link} />
            </div>
            <p className="text-[12.5px] text-[var(--ob-ink-3)]">The link expires in 14 days. You can cancel it from your onboarding overview.</p>
            <Btn onClick={close}>Done</Btn>
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" required htmlFor="dl-name">
                <input id="dl-name" className="ob-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </Field>
              <Field label="Role" htmlFor="dl-role">
                <input id="dl-role" className="ob-input" placeholder="Developer, marketing manager…" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} />
              </Field>
            </div>
            <Field label="Email" required htmlFor="dl-email">
              <input id="dl-email" type="email" inputMode="email" className="ob-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </Field>
            <Field label="Message (optional)" htmlFor="dl-msg">
              <textarea id="dl-msg" className="ob-textarea !min-h-[90px]" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Hi, could you give Madvert Labs access to…" />
            </Field>
            {err ? (
              <p className="ob-callout" data-tone="danger" role="alert">
                {err}
              </p>
            ) : null}
            <Btn icon="send" disabled={busy || !f.name || !f.email} onClick={submit}>
              {busy ? "Sending…" : "Send secure task"}
            </Btn>
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* ───────── NEED HELP? ───────── */

export function NeedHelp({
  guidePlatform,
  taskKey,
  taskLabel,
  onKickoff,
  onShowMe,
}: {
  guidePlatform?: string | null;
  taskKey: string;
  taskLabel: string;
  onKickoff?: () => void;
  onShowMe?: () => void;
}) {
  const { state, mode } = usePortal();
  const [player, setPlayer] = useState(false);
  const [delegate, setDelegate] = useState(false);
  const i = state.integrations;
  const wa = i.supportWhatsApp.replace(/[^\d]/g, "");
  const contact = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Hi Madvert, I need help with: ${taskLabel}`)}` : `mailto:${i.supportEmail}?subject=${encodeURIComponent(`Help with ${taskLabel}`)}`;
  const opts = [
    onShowMe && guidePlatform ? { icon: "eye", label: "Show me how", run: onShowMe } : null,
    guidePlatform ? { icon: "play", label: "Watch guide", run: () => setPlayer(true) } : null,
    mode.kind === "client" ? { icon: "send", label: "Send instructions to my technical person", run: () => setDelegate(true) } : null,
    onKickoff ? { icon: "calendar", label: "Complete during kickoff", run: onKickoff } : null,
    { icon: "chat", label: "Contact Madvert", href: contact },
  ].filter(Boolean) as { icon: string; label: string; run?: () => void; href?: string }[];
  return (
    <div className="rounded-[20px] bg-[var(--ob-card-2)] p-4 shadow-[inset_0_0_0_1px_var(--ob-line)] sm:p-5">
      <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--ob-blue)]">
        <Icon name="help" size={16} /> Need help?
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {opts.map((o) =>
          o.href ? (
            <a key={o.label} href={o.href} target="_blank" rel="noopener noreferrer" className="ob-choice !min-h-[48px] text-[14px]">
              <Icon name={o.icon} className="text-[var(--ob-blue)]" /> {o.label}
            </a>
          ) : (
            <button key={o.label} type="button" onClick={o.run} className="ob-choice !min-h-[48px] text-[14px]">
              <Icon name={o.icon} className="text-[var(--ob-blue)]" /> {o.label}
            </button>
          ),
        )}
      </div>
      {guidePlatform ? <GuidePlayer platform={guidePlatform} open={player} onClose={() => setPlayer(false)} /> : null}
      <DelegateDialog open={delegate} onClose={() => setDelegate(false)} taskKey={taskKey} taskLabel={taskLabel} />
    </div>
  );
}
