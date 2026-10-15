"use client";

import type { Question } from "@/onboarding/template/questions";
import { isVisible } from "@/onboarding/template/questions";
import type { AnswerValue } from "@/onboarding/types";
import { Choices, Field } from "./kit";

export function QuestionField({ q, value, onChange, idPrefix }: { q: Question; value: AnswerValue | undefined; onChange: (v: AnswerValue) => void; idPrefix: string }) {
  const id = `${idPrefix}-${q.key}`;
  const str = typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
  let control;
  switch (q.type) {
    case "textarea":
      control = <textarea id={id} className="ob-textarea" value={str} placeholder={q.placeholder} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "select":
      control = (
        <select id={id} className="ob-select" value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {q.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
      break;
    case "radio":
      control = <Choices options={q.options ?? []} value={str} onChange={(v) => onChange(v as string)} />;
      break;
    case "multi":
      control = <Choices options={q.options ?? []} value={Array.isArray(value) ? value : []} onChange={(v) => onChange(v as string[])} multi max={q.key === "primary_goal" ? 3 : undefined} />;
      break;
    default:
      control = (
        <input
          id={id}
          className="ob-input"
          type={q.type === "number" ? "text" : q.type}
          inputMode={q.type === "number" ? "numeric" : q.type === "tel" ? "tel" : q.type === "email" ? "email" : q.type === "url" ? "url" : undefined}
          autoComplete={q.type === "email" ? "email" : q.type === "tel" ? "tel" : q.type === "url" ? "url" : "off"}
          value={str}
          placeholder={q.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
  return (
    <Field label={q.label} required={q.required} help={q.help} htmlFor={q.type === "radio" || q.type === "multi" ? undefined : id}>
      {control}
    </Field>
  );
}

export function QuestionGrid({ questions, values, onChange, idPrefix }: { questions: Question[]; values: Record<string, AnswerValue>; onChange: (k: string, v: AnswerValue) => void; idPrefix: string }) {
  return (
    <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
      {questions
        .filter((q) => isVisible(q, values))
        .map((q) => (
          <div key={q.key} className={q.half && q.type !== "radio" && q.type !== "multi" ? "" : "sm:col-span-2"}>
            <QuestionField q={q} value={values[q.key]} onChange={(v) => onChange(q.key, v)} idPrefix={idPrefix} />
          </div>
        ))}
    </div>
  );
}
