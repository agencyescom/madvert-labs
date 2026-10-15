"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { GuideStep } from "@/onboarding/types";
import { GuideMock } from "../Guides";
import { MetaScreen, hasMetaScreen } from "../MetaScreens";
import { Btn, Field, StatusPill } from "../kit";
import { Msg, opsCall, useBusy } from "./OpsKit";

type Step = GuideStep & { screenshotUrl?: string };

export function GuideEditor({ steps, platforms }: { steps: Step[]; platforms: Record<string, { label: string; officialSource: string }> }) {
  const [platform, setPlatform] = useState(Object.keys(platforms)[0]);
  const list = useMemo(() => steps.filter((s) => s.platform === platform).sort((a, b) => a.stepNumber - b.stepNumber), [steps, platform]);
  const router = useRouter();
  return (
    <div className="grid gap-8">
      <div>
        <p className="ob-eyebrow">Onboarding guides</p>
        <h1 className="ob-h1 mt-3">
          Step guides & <span className="ob-grad-text">screenshots</span>
        </h1>
        <p className="ob-lead mt-3 max-w-3xl">
          When a platform changes its UI, edit the step or upload a current screenshot from the official documentation. An uploaded screenshot replaces the built-in illustration. Files are
          stored privately in Madvert’s storage; nothing is hotlinked.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav className="ob-card grid content-start gap-1 p-2" aria-label="Platforms">
          {Object.entries(platforms).map(([k, v]) => {
            const stale = steps.filter((s) => s.platform === k).some((s) => !s.lastReviewedAt);
            return (
              <button key={k} type="button" onClick={() => setPlatform(k)} className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13.5px] font-medium ${platform === k ? "bg-[var(--ob-card-2)] text-[var(--ob-blue)]" : ""}`}>
                {v.label}
                {stale ? <span className="h-2 w-2 rounded-full bg-[var(--ob-warn)]" title="Review needed" /> : null}
              </button>
            );
          })}
        </nav>
        <div className="grid gap-5">
          <p className="text-[13.5px] text-[var(--ob-ink-3)]">Official source: {platforms[platform]?.officialSource}</p>
          {list.map((s) => (
            <StepEditor key={s.id + (s.updatedAt ?? "")} s={s} onSaved={() => router.refresh()} />
          ))}
          <Btn
            variant="ghost"
            icon="plus"
            onClick={async () => {
              await opsCall("guide-save", { platform, stepNumber: list.length + 1, title: "New step", instruction: "Describe the step." });
              router.refresh();
            }}
          >
            Add step
          </Btn>
        </div>
      </div>
    </div>
  );
}

function StepEditor({ s, onSaved }: { s: Step; onSaved: () => void }) {
  const [f, setF] = useState({ title: s.title, instruction: s.instruction, externalHelpUrl: s.externalHelpUrl ?? "", lastReviewedAt: s.lastReviewedAt ?? "", stepNumber: s.stepNumber });
  const { busy, msg, run } = useBusy();
  return (
    <section className="ob-card ob-card-pad grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="grid content-start gap-4">
        <div className="flex items-center gap-3">
          <span className="ob-step-badge">STEP {s.stepNumber}</span>
          {s.lastReviewedAt ? <StatusPill status="completed" label={`Reviewed ${s.lastReviewedAt}`} /> : <StatusPill status="need_help" label="Review needed" />}
        </div>
        <Field label="Step number" htmlFor={`n-${s.id}`}>
          <input id={`n-${s.id}`} type="number" className="ob-input !min-h-[42px]" value={f.stepNumber} onChange={(e) => setF({ ...f, stepNumber: Number(e.target.value) })} />
        </Field>
        <Field label="Title" htmlFor={`t-${s.id}`}>
          <input id={`t-${s.id}`} className="ob-input !min-h-[42px]" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        </Field>
        <Field label="Instruction" help="Placeholders: {{metaPartnerId}} {{googleAccessEmail}} {{googleAdsManagerId}} {{websiteAccessEmail}} {{dnsAccessEmail}} {{crmAccessEmail}}" htmlFor={`i-${s.id}`}>
          <textarea id={`i-${s.id}`} className="ob-textarea" value={f.instruction} onChange={(e) => setF({ ...f, instruction: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
          <Field label="External help URL" htmlFor={`u-${s.id}`}>
            <input id={`u-${s.id}`} className="ob-input !min-h-[42px]" value={f.externalHelpUrl} onChange={(e) => setF({ ...f, externalHelpUrl: e.target.value })} />
          </Field>
          <Field label="Last reviewed" htmlFor={`r-${s.id}`}>
            <input id={`r-${s.id}`} type="date" className="ob-input !min-h-[42px]" value={f.lastReviewedAt} onChange={(e) => setF({ ...f, lastReviewedAt: e.target.value })} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn
            size="sm"
            disabled={busy}
            onClick={async () => {
              const r = await run(() => opsCall("guide-save", { id: s.id, platform: s.platform, ...f }), "Saved.");
              if (!r.error) onSaved();
            }}
          >
            Save step
          </Btn>
          <Btn size="sm" variant="ghost" onClick={() => setF({ ...f, lastReviewedAt: new Date().toISOString().slice(0, 10) })}>
            Mark reviewed today
          </Btn>
          <Btn
            size="sm"
            variant="ghost"
            icon="trash"
            onClick={async () => {
              if (!confirm("Remove this step from the guide?")) return;
              await opsCall("guide-save", { id: s.id, platform: s.platform, stepNumber: s.stepNumber, remove: true });
              onSaved();
            }}
          >
            Remove
          </Btn>
        </div>
        <Msg msg={msg} />
      </div>
      <div className="grid content-start gap-3">
        {s.screenshotUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.screenshotUrl} alt="" className="w-full rounded-2xl shadow-[0_0_0_1px_var(--ob-line-2)]" />
        ) : hasMetaScreen(s.id) ? (
          <MetaScreen id={s.id} />
        ) : s.illustration ? (
          <GuideMock ill={s.illustration} />
        ) : (
          <p className="ob-callout">No visual yet.</p>
        )}
        <label className="ob-btn ob-btn-ghost ob-btn-sm cursor-pointer">
          Upload screenshot (PNG/JPG/WebP)
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const form = new FormData();
              form.append("id", s.id);
              form.append("file", file);
              const res = await fetch("/api/ops/guide-image", { method: "POST", body: form });
              const j = (await res.json()) as { error?: string };
              if (j.error) alert(j.error);
              else onSaved();
            }}
          />
        </label>
      </div>
    </section>
  );
}
