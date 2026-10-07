"use client";

import { forwardRef, useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

const control =
  "w-full rounded-2xl border border-line-strong bg-[var(--surface-glass-strong)] px-4 py-3.5 text-[16px] text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-200 outline-none focus:border-[color:var(--accent)] focus:shadow-[0_0_0_4px_rgb(0_180_255/0.15)] aria-[invalid=true]:border-[color:var(--danger)]";

export function FieldShell({ id, label, hint, error, children, optional }: { id: string; label: ReactNode; hint?: string; error?: string; children: ReactNode; optional?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-[14px] font-medium text-ink">
        <span>{label}</span>
        {optional ? <span className="text-[12px] font-normal text-ink-3">Optional</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-2 text-[13px] text-ink-3">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-[13px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; error?: string; hint?: string; optional?: boolean };

export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField({ id, label, error, hint, optional, className = "", ...rest }, ref) {
  const auto = useId();
  const fid = id ?? `${String(rest.name)}${auto.replace(/:/g, "")}`;
  return (
    <FieldShell id={fid} label={label} error={error} hint={hint} optional={optional}>
      <input
        ref={ref}
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={`${control} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
});

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: ReactNode; error?: string; hint?: string; optional?: boolean };

export const TextArea = forwardRef<HTMLTextAreaElement, AreaProps>(function TextArea({ id, label, error, hint, optional, className = "", rows = 4, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? `${String(rest.name)}${auto.replace(/:/g, "")}`;
  return (
    <FieldShell id={fid} label={label} error={error} hint={hint} optional={optional}>
      <textarea
        ref={ref}
        id={fid}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={`${control} resize-y ${className}`}
        {...rest}
      />
    </FieldShell>
  );
});

/** Hidden honeypot. Real visitors never see or fill it. */
export function Honeypot({ register }: { register: (name: "website_confirm") => object }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Leave this field empty
        <input type="text" tabIndex={-1} autoComplete="off" {...register("website_confirm")} />
      </label>
    </div>
  );
}

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; remove: (id: string) => void };
  }
}

/** Cloudflare Turnstile, rendered only when a site key is configured. */
export function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!key || !ref.current) return;
    let id: string | undefined;
    const render = () => {
      if (window.turnstile && ref.current) id = window.turnstile.render(ref.current, { sitekey: key, callback: onToken, theme: "auto" });
    };
    if (window.turnstile) render();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = render;
      document.head.appendChild(s);
    }
    return () => {
      if (id) window.turnstile?.remove(id);
    };
  }, [key, onToken]);
  if (!key) return null;
  return <div ref={ref} className="min-h-[65px]" />;
}

export function newEventId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Spam timing + conversion dedupe id, created on mount (never during prerender). */
export function useFormMeta() {
  const startedAtRef = useRef(0);
  const eventIdRef = useRef("");
  useEffect(() => {
    startedAtRef.current = Date.now();
    eventIdRef.current = newEventId();
  }, []);
  return { startedAtRef, eventIdRef };
}
