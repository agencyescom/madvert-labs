"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

/* Shared form fields: large, thumb-friendly controls with inline validation messages. */

/* ───────────── Fields ───────────── */

export function FieldError({ id, error }: { id: string; error?: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          id={`e-${id}`}
          role="alert"
          className="mt-1.5 text-[0.8rem] font-semibold text-red-600 dark:text-red-300"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function Text({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const valid = value.trim().length > 0 && !error;
  return (
    <div>
      <label htmlFor={`f-${id}`} className="mb-2 block text-[0.9rem] font-bold">
        {label} <span className="text-accent" aria-hidden>*</span>
      </label>
      <div className="relative">
        <input
          id={`f-${id}`}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required
          aria-invalid={!!error}
          aria-describedby={error ? `e-${id}` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="field-input pr-10"
        />
        <AnimatePresence>
          {valid && (
            <motion.span
              className="pointer-events-none absolute right-3 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-accent-soft text-accent"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <FieldError id={id} error={error} />
    </div>
  );
}

const colClass: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-5",
};

function OptionButton({ selected, label, onClick, role, multi }: { selected: boolean; label: string; onClick: () => void; role: "radio" | "checkbox"; multi?: boolean }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={`relative flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-center text-[0.9rem] font-semibold transition-all duration-200 ${
        selected
          ? "border-transparent bg-accent-soft text-fg shadow-[0_0_0_2px_var(--accent)]"
          : "border-line-strong bg-surface text-muted hover:border-[var(--accent-line)] hover:text-fg"
      }`}
    >
      {multi && (
        <span className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors ${selected ? "border-transparent bg-grad text-navy" : "border-line-strong"}`}>
          {selected && <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden />}
        </span>
      )}
      <span className="leading-tight">{label}</span>
    </button>
  );
}

export function Choice({
  id,
  label,
  options,
  value,
  onChange,
  error,
  cols = 3,
}: {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  cols?: number;
}) {
  return (
    <div>
      <p id={`l-${id}`} className="mb-2.5 text-[0.9rem] font-bold leading-snug">
        {label} <span className="text-accent" aria-hidden>*</span>
      </p>
      <div id={`f-${id}`} tabIndex={-1} role="radiogroup" aria-labelledby={`l-${id}`} aria-describedby={error ? `e-${id}` : undefined} className={`grid gap-2 outline-none ${colClass[cols] ?? colClass[3]}`}>
        {options.map((o) => (
          <OptionButton key={o} role="radio" selected={value === o} label={o} onClick={() => onChange(o)} />
        ))}
      </div>
      <FieldError id={id} error={error} />
    </div>
  );
}

export function Multi({
  id,
  label,
  options,
  values,
  onToggle,
  error,
  cols = 4,
}: {
  id: string;
  label: string;
  options: readonly string[];
  values: string[];
  onToggle: (v: string) => void;
  error?: string;
  cols?: 2 | 4;
}) {
  return (
    <div>
      <p id={`l-${id}`} className="mb-2.5 text-[0.9rem] font-bold">
        {label} <span className="font-normal text-subtle">(select all that apply)</span> <span className="text-accent" aria-hidden>*</span>
      </p>
      <div id={`f-${id}`} tabIndex={-1} role="group" aria-labelledby={`l-${id}`} aria-describedby={error ? `e-${id}` : undefined} className={`grid gap-2 outline-none ${cols === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        {options.map((o) => (
          <OptionButton key={o} role="checkbox" multi selected={values.includes(o)} label={o} onClick={() => onToggle(o)} />
        ))}
      </div>
      <FieldError id={id} error={error} />
    </div>
  );
}
