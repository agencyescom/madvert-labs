"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CustomQuestion, TemplateOverride } from "@/onboarding/types";
import { Btn, Field, Icon } from "../kit";
import { opsCall } from "./OpsKit";

type Section = { key: string; title: string; intro: string; questions: { key: string; label: string; type: string; required: boolean; help: string }[] };

export function TemplateEditor({ sections, overrides, custom }: { sections: Section[]; overrides: TemplateOverride[]; custom: CustomQuestion[] }) {
  const router = useRouter();
  const ov = new Map(overrides.map((o) => [o.id, o]));
  const [sec, setSec] = useState(sections[0].key);
  const s = sections.find((x) => x.key === sec)!;
  const save = async (id: string, patch: Partial<TemplateOverride>) => {
    await opsCall("template", { id, ...patch });
    router.refresh();
  };
  const merged = [
    ...s.questions.map((q, i) => {
      const o = ov.get(`${s.key}.${q.key}`);
      return { id: `${s.key}.${q.key}`, label: o?.label || q.label, help: o?.help ?? q.help, required: o?.required ?? q.required, hidden: o?.hidden ?? false, order: o?.order ?? i * 10, type: q.type, custom: false };
    }),
    ...custom
      .filter((c) => c.sectionKey === s.key)
      .map((c) => {
        const o = ov.get(`${s.key}.custom_${c.id}`);
        return { id: `${s.key}.custom_${c.id}`, customId: c.id, label: o?.label || c.label, help: o?.help ?? c.help ?? "", required: o?.required ?? c.required, hidden: o?.hidden ?? false, order: o?.order ?? c.order, type: c.type, custom: true };
      }),
  ].sort((a, b) => a.order - b.order);
  const secOv = ov.get(`section:${s.key}`);

  return (
    <div className="grid gap-8">
      <div>
        <p className="ob-eyebrow">Onboarding template</p>
        <h1 className="ob-h1 mt-3">
          Questions & <span className="ob-grad-text">sections</span>
        </h1>
        <p className="ob-lead mt-3 max-w-3xl">Add, hide, reorder and edit questions without code. Changes apply to every client’s portal on their next load. Answers already given are kept.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav className="ob-card grid content-start gap-1 p-2">
          {sections.map((x) => (
            <button key={x.key} type="button" onClick={() => setSec(x.key)} className={`rounded-xl px-3 py-2 text-left text-[13.5px] font-medium ${sec === x.key ? "bg-[var(--ob-card-2)] text-[var(--ob-blue)]" : ""}`}>
              <span className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--ob-ink-3)]">{x.key.split(".")[0]}</span>
              {ov.get(`section:${x.key}`)?.label || x.title}
              {ov.get(`section:${x.key}`)?.hidden ? " (hidden)" : ""}
            </button>
          ))}
        </nav>
        <div className="grid content-start gap-4">
          <section className="ob-card ob-card-pad grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Section title" htmlFor="st">
              <input id="st" className="ob-input !min-h-[42px]" defaultValue={secOv?.label || s.title} onBlur={(e) => save(`section:${s.key}`, { label: e.target.value })} key={`t${s.key}`} />
            </Field>
            <Field label="Section intro" htmlFor="si">
              <input id="si" className="ob-input !min-h-[42px]" defaultValue={secOv?.help ?? s.intro} onBlur={(e) => save(`section:${s.key}`, { help: e.target.value })} key={`i${s.key}`} />
            </Field>
            <label className="flex items-center gap-2 pb-3 text-[13.5px]">
              <input type="checkbox" className="h-5 w-5 accent-[#00a2ff]" checked={secOv?.hidden ?? false} onChange={(e) => save(`section:${s.key}`, { hidden: e.target.checked })} />
              Hide section
            </label>
          </section>
          {merged.map((q, i) => (
            <section key={q.id} className={`ob-card p-4 ${q.hidden ? "opacity-60" : ""}`}>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <Field label={`Question${q.custom ? " (custom)" : ""} · ${q.type}`} htmlFor={`ql-${q.id}`}>
                  <input id={`ql-${q.id}`} className="ob-input !min-h-[42px]" defaultValue={q.label} onBlur={(e) => e.target.value !== q.label && save(q.id, { label: e.target.value })} />
                </Field>
                <Field label="Helper text" htmlFor={`qh-${q.id}`}>
                  <input id={`qh-${q.id}`} className="ob-input !min-h-[42px]" defaultValue={q.help} onBlur={(e) => e.target.value !== q.help && save(q.id, { help: e.target.value })} />
                </Field>
                <div className="flex items-center gap-1 pb-1">
                  <button type="button" className="ob-icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => save(q.id, { order: merged[i - 1].order - 1 })}>
                    <Icon name="arrow" className="-rotate-90" />
                  </button>
                  <button type="button" className="ob-icon-btn" aria-label="Move down" disabled={i === merged.length - 1} onClick={() => save(q.id, { order: merged[i + 1].order + 1 })}>
                    <Icon name="arrow" className="rotate-90" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-5 text-[13.5px]">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 accent-[#00a2ff]" checked={q.required} onChange={(e) => save(q.id, { required: e.target.checked })} /> Required
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 accent-[#00a2ff]" checked={q.hidden} onChange={(e) => save(q.id, { hidden: e.target.checked })} /> Hidden
                </label>
                {ov.has(q.id) ? (
                  <button
                    type="button"
                    className="font-semibold text-[var(--ob-ink-3)] hover:text-[var(--ob-blue)]"
                    onClick={async () => {
                      await opsCall("template-reset", { id: q.id });
                      router.refresh();
                    }}
                  >
                    Reset to default
                  </button>
                ) : null}
                {"customId" in q && q.customId ? (
                  <button
                    type="button"
                    className="font-semibold text-[var(--ob-danger)]"
                    onClick={async () => {
                      if (!confirm("Delete this custom question?")) return;
                      await opsCall("custom-question", { remove: q.customId });
                      router.refresh();
                    }}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </section>
          ))}
          <AddQuestion sectionKey={s.key} questions={merged.map((q) => ({ key: q.id.split(".").pop()!, label: q.label }))} onAdded={() => router.refresh()} />
        </div>
      </div>
    </div>
  );
}

function AddQuestion({ sectionKey, questions, onAdded }: { sectionKey: string; questions: { key: string; label: string }[]; onAdded: () => void }) {
  const [f, setF] = useState({ label: "", type: "text", options: "", required: false, help: "", ifKey: "", ifEquals: "" });
  return (
    <section className="ob-card ob-card-pad grid gap-4">
      <h2 className="ob-h3">Add question</h2>
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <Field label="Question" htmlFor="aq-l">
          <input id="aq-l" className="ob-input !min-h-[42px]" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
        </Field>
        <Field label="Type" htmlFor="aq-t">
          <select id="aq-t" className="ob-select !min-h-[42px]" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            <option value="text">Short text</option>
            <option value="textarea">Long text</option>
            <option value="select">Single choice</option>
            <option value="multi">Multiple choice</option>
          </select>
        </Field>
      </div>
      {f.type === "select" || f.type === "multi" ? (
        <Field label="Options (comma separated)" htmlFor="aq-o">
          <input id="aq-o" className="ob-input !min-h-[42px]" value={f.options} onChange={(e) => setF({ ...f, options: e.target.value })} />
        </Field>
      ) : null}
      <Field label="Helper text" htmlFor="aq-h">
        <input id="aq-h" className="ob-input !min-h-[42px]" value={f.help} onChange={(e) => setF({ ...f, help: e.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Show only if (conditional logic)" htmlFor="aq-if">
          <select id="aq-if" className="ob-select !min-h-[42px]" value={f.ifKey} onChange={(e) => setF({ ...f, ifKey: e.target.value })}>
            <option value="">Always show</option>
            {questions.map((q) => (
              <option key={q.key} value={q.key}>
                {q.label}
              </option>
            ))}
          </select>
        </Field>
        {f.ifKey ? (
          <Field label="…equals" htmlFor="aq-eq">
            <input id="aq-eq" className="ob-input !min-h-[42px]" value={f.ifEquals} onChange={(e) => setF({ ...f, ifEquals: e.target.value })} />
          </Field>
        ) : null}
      </div>
      <label className="flex items-center gap-2 text-[14px]">
        <input type="checkbox" className="h-5 w-5 accent-[#00a2ff]" checked={f.required} onChange={(e) => setF({ ...f, required: e.target.checked })} /> Required
      </label>
      <Btn
        icon="plus"
        disabled={!f.label.trim()}
        onClick={async () => {
          const r = await opsCall("custom-question", {
            sectionKey,
            label: f.label,
            type: f.type,
            options: f.options.split(",").map((o) => o.trim()).filter(Boolean),
            required: f.required,
            help: f.help,
            showIf: f.ifKey ? { key: f.ifKey, equals: f.ifEquals } : undefined,
            order: 10_000,
          });
          if (r.error) alert(r.error);
          else {
            setF({ label: "", type: "text", options: "", required: false, help: "", ifKey: "", ifEquals: "" });
            onAdded();
          }
        }}
      >
        Add question
      </Btn>
    </section>
  );
}
