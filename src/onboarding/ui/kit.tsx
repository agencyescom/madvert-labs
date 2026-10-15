"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MadvertMark } from "@/components/ui/MadvertMark";
import { PORTAL_THEME_KEY } from "./theme";

/* ───────── Icons ───────── */

const paths: Record<string, ReactNode> = {
  arrow: <path d="M4 10h11m-4-5 5 5-5 5" />,
  back: <path d="M16 10H5m4-5-5 5 5 5" />,
  check: <path d="m4.5 10.5 3.5 3.5 7.5-8" />,
  plus: <path d="M10 4v12M4 10h12" />,
  x: <path d="m5 5 10 10M15 5 5 15" />,
  info: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 9v5M10 6.2v.1" />
    </>
  ),
  help: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M7.8 7.8a2.3 2.3 0 1 1 3.2 2.1c-.7.3-1 .8-1 1.5v.4M10 14.2v.1" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="8.5" width="11" height="8" rx="2" />
      <path d="M7 8.5V6.5a3 3 0 0 1 6 0v2" />
    </>
  ),
  shield: <path d="M10 2.8 4 5v4.6c0 3.8 2.6 6.4 6 7.6 3.4-1.2 6-3.8 6-7.6V5z" />,
  send: <path d="m3 10 14-6-5 13-2.5-5.5z M9.5 11.5 17 4" />,
  upload: <path d="M10 13V4m-4 4 4-4 4 4M4 13v2.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V13" />,
  link: <path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.4-2.4a3 3 0 0 0-4.2-4.2l-.8.8M11.5 8.5a3 3 0 0 0-4.2 0L4.9 10.9a3 3 0 0 0 4.2 4.2l.8-.8" />,
  camera: (
    <>
      <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h1.8l1.2-2h4l1.2 2H15a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 15 16H5a1.5 1.5 0 0 1-1.5-1.5z" />
      <circle cx="10" cy="11" r="2.8" />
    </>
  ),
  trash: <path d="M4.5 6h11M8 6V4.5h4V6m-6 0 .7 9.5a1.5 1.5 0 0 0 1.5 1.4h3.6a1.5 1.5 0 0 0 1.5-1.4L14 6" />,
  copy: (
    <>
      <rect x="7" y="7" width="9" height="9" rx="2" />
      <path d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4h-6A1.5 1.5 0 0 0 4 5.5v6A1.5 1.5 0 0 0 5.5 13H7" />
    </>
  ),
  external: <path d="M11 4h5v5M16 4l-7 7M14 11.5V15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3.5" />,
  calendar: (
    <>
      <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
      <path d="M3.5 8.5h13M7 3v3M13 3v3" />
    </>
  ),
  clock: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 2" />
    </>
  ),
  user: (
    <>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 16.5c.8-3 3.2-4.5 6-4.5s5.2 1.5 6 4.5" />
    </>
  ),
  sparkle: <path d="M10 2.5c.6 3.8 2.7 5.9 6.5 6.5-3.8.6-5.9 2.7-6.5 6.5-.6-3.8-2.7-5.9-6.5-6.5 3.8-.6 5.9-2.7 6.5-6.5Z" />,
  file: <path d="M6 3h5.5L15 6.5V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm5 0v4h4" />,
  play: <path d="M7 5.5v9l7.5-4.5z" />,
  edit: <path d="M4 16h3l8.5-8.5-3-3L4 13zm7-10.5 3 3" />,
  sun: (
    <>
      <circle cx="10" cy="10" r="3.4" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" />
    </>
  ),
  moon: <path d="M15.8 12.6A6.6 6.6 0 0 1 7.4 4.2a6.6 6.6 0 1 0 8.4 8.4z" />,
  grid: <path d="M4 4h5v5H4zM11 4h5v5h-5zM4 11h5v5H4zM11 11h5v5h-5z" />,
  chat: <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 3v-3h0A1.5 1.5 0 0 1 4 11.5z" />,
  mail: (
    <>
      <rect x="3" y="5" width="14" height="10" rx="2" />
      <path d="m3.5 6 6.5 5 6.5-5" />
    </>
  ),
  flag: <path d="M5 17V3.5m0 0h9l-2 3.5 2 3.5H5" />,
  building: <path d="M4 17V5.5L10 3v14M10 7.5l6 2V17M2.5 17h15M6.5 7.5v.1M6.5 10.5v.1M6.5 13.5v.1M13 11.5v.1M13 14v.1" />,
  team: (
    <>
      <circle cx="7.5" cy="7" r="2.6" />
      <path d="M2.8 16c.6-2.7 2.4-4.2 4.7-4.2s4.1 1.5 4.7 4.2" />
      <circle cx="13.8" cy="7.6" r="2.1" />
      <path d="M13.2 11.9c2 .1 3.4 1.4 4 3.6" />
    </>
  ),
  megaphone: <path d="M3.5 8.5v3a1 1 0 0 0 1 1h2l6 3.5v-12l-6 3.5h-2a1 1 0 0 0-1 1ZM6.5 12.5l1 4h2l-1-4M15 7.5a3.5 3.5 0 0 1 0 5" />,
  star: <path d="m10 3 2.1 4.4 4.8.6-3.5 3.3.9 4.8L10 13.8 5.7 16.1l.9-4.8L3.1 8l4.8-.6Z" />,
  film: (
    <>
      <rect x="3" y="4.5" width="14" height="11" rx="2" />
      <path d="M3 8h14M3 12h14M7 4.5v11M13 4.5v11" />
    </>
  ),
  palette: <path d="M10 3a7 7 0 0 0 0 14c1.2 0 1.7-.8 1.4-1.7-.4-1.1.3-2.3 1.6-2.3H15a2.5 2.5 0 0 0 2-2.8C16.6 6.3 13.6 3 10 3ZM6.5 9.5v.1M8.5 6.5v.1M12 6.5v.1" />,
  book: <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H16v12H5.5A1.5 1.5 0 0 0 4 16.5v-12ZM4 16.5A1.5 1.5 0 0 0 5.5 18H16M7.5 6.5h5" />,
  rocket: <path d="M11.5 3.5c2.6.2 4.8 2.4 5 5-1.2 2.7-3.6 5-6.6 6.4l-2.8-2.8C8.5 9.1 10.8 6.7 11.5 3.5ZM7.1 12.1 4.5 11l1.6-2.6 2.6-.2M8 13l1.1 2.6 2.6-1.6.2-2.6M5.2 14.8 3.5 16.5" />,
  download: <path d="M10 4v9m-4-4 4 4 4-4M4 15.5h12" />,
  refresh: <path d="M15.5 8A6 6 0 0 0 4.6 6.5M4.5 12a6 6 0 0 0 10.9 1.5M15.5 3.5V8H11M4.5 16.5V12H9" />,
  eye: (
    <>
      <path d="M2.5 10s2.8-5 7.5-5 7.5 5 7.5 5-2.8 5-7.5 5-7.5-5-7.5-5Z" />
      <circle cx="10" cy="10" r="2.3" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 18, className = "", stroke = 1.8 }: { name: IconName | string; size?: number; className?: string; stroke?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] ?? paths.info}
    </svg>
  );
}

/* ───────── Brand ───────── */

export function GlowMark({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`relative inline-grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-[28%]"
        style={{
          background: "linear-gradient(150deg,#0d1628,#060a14)",
          boxShadow: "0 0 0 1.5px rgb(0 210 255 / 0.85), 0 0 24px rgb(0 190 255 / 0.55), inset 0 0 18px rgb(0 180 255 / 0.25)",
        }}
      />
      <MadvertMark className="relative w-[64%] text-white" orbClassName="ob-orb-glow" />
    </span>
  );
}

/** Two flowing silk waves in the page background (pure SVG, no images). */
export function Waves() {
  const id = useId().replace(/:/g, "");
  const wave = (cls: string) => (
    <svg className={cls} viewBox="0 0 1600 500" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}${cls}`} x1="0" x2="1">
          <stop offset="0" stopColor="#00b4ff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#00b4ff" stopOpacity="0.35" />
          <stop offset="0.7" stopColor="#00e5ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#0a6cff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 14 }, (_, i) => {
        const o = i * 9;
        return (
          <path
            key={i}
            d={`M-50 ${330 - o} C 300 ${120 - o * 0.4}, 650 ${470 - o}, 1000 ${250 - o * 0.6} S 1500 ${90 + o * 0.5}, 1700 ${210 - o * 0.3}`}
            fill="none"
            stroke={`url(#${id}${cls})`}
            strokeWidth={i === 7 ? 2.4 : 1}
            opacity={0.25 + (1 - Math.abs(i - 7) / 7) * 0.55}
          />
        );
      })}
    </svg>
  );
  return (
    <>
      <div className="ob-aurora" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="ob-particles" aria-hidden="true" />
      <div className="ob-waves" aria-hidden="true">
        {wave("w1")}
        {wave("w2")}
      </div>
    </>
  );
}

export function ThemeSwitch() {
  const [dark, setDark] = useState(false);
  // The theme attribute is set by the boot script before hydration; read it once mounted.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDark(document.documentElement.getAttribute("data-theme") === "dark"), []);
  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(PORTAL_THEME_KEY, next);
    } catch {}
    setDark(!dark);
  };
  return (
    <button type="button" className="ob-icon-btn" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title="Switch theme">
      <Icon name={dark ? "sun" : "moon"} />
    </button>
  );
}

/* ───────── Progress ───────── */

export function Bar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`ob-bar ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Ring({ value, size = 120, stroke = 10, children, dark = false }: { value: number; size?: number; stroke?: number; children?: ReactNode; dark?: boolean }) {
  const id = useId().replace(/:/g, "");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="ob-ring" aria-hidden="true">
        <defs>
          <linearGradient id={`rg${id}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#0a5cff" />
            <stop offset="0.5" stopColor="#00b4ff" />
            <stop offset="1" stopColor="#00e5ff" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "rgb(255 255 255 / 0.1)" : "rgb(0 120 200 / 0.1)"} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#rg${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(100, value)) / 100)}
          style={{ filter: "drop-shadow(0 0 6px rgb(0 200 255 / 0.6))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/* ───────── Status ───────── */

const TONE: Record<string, { tone: string; label: string }> = {
  completed: { tone: "success", label: "Completed" },
  connected: { tone: "success", label: "Connected" },
  done: { tone: "success", label: "Done" },
  booked: { tone: "success", label: "Booked" },
  in_progress: { tone: "progress", label: "In progress" },
  pending: { tone: "progress", label: "Pending" },
  sent: { tone: "progress", label: "Task sent" },
  opened: { tone: "progress", label: "Opened" },
  incomplete: { tone: "", label: "Not started" },
  not_started: { tone: "", label: "Not started" },
  optional: { tone: "violet", label: "Optional" },
  skipped: { tone: "violet", label: "During kickoff" },
  blocked: { tone: "warn", label: "Blocked" },
  need_help: { tone: "warn", label: "Need help" },
  kickoff: { tone: "violet", label: "During kickoff" },
  not_required: { tone: "", label: "Not required" },
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const t = TONE[status] ?? { tone: "", label: status };
  return (
    <span className="ob-pill" data-tone={t.tone}>
      <span className="dot" />
      {label ?? t.label}
    </span>
  );
}

/* ───────── Buttons ───────── */

export function Btn({
  children,
  variant = "primary",
  size,
  icon,
  arrow,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "white" | "link"; size?: "sm" | "xs" | "lg"; icon?: string; arrow?: boolean }) {
  return (
    <button type="button" className={`ob-btn ob-btn-${variant} ${size ? `ob-btn-${size}` : ""} ${className}`} {...rest}>
      {icon ? <Icon name={icon} size={size === "xs" ? 14 : 17} /> : null}
      {children}
      {arrow ? <Icon name="arrow" className="arrow" size={17} /> : null}
    </button>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Btn
      variant="ghost"
      size="xs"
      icon={done ? "check" : "copy"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {}
      }}
    >
      {done ? "Copied" : label}
    </Btn>
  );
}

/* ───────── Fields ───────── */

export function Field({ label, required, help, children, htmlFor }: { label: ReactNode; required?: boolean; help?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label className="ob-label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="req" aria-label="required">
            *
          </span>
        ) : null}
      </label>
      {children}
      {help ? <p className="ob-help">{help}</p> : null}
    </div>
  );
}

export function Choices({
  options,
  value,
  onChange,
  multi = false,
  columns = 3,
  max,
}: {
  options: readonly string[];
  value: string | string[] | null | undefined;
  onChange: (v: string | string[]) => void;
  multi?: boolean;
  columns?: number;
  max?: number;
}) {
  const sel = multi ? (Array.isArray(value) ? value : []) : value;
  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${columns >= 3 ? 150 : 200}px, 1fr))` }} role={multi ? "group" : "radiogroup"}>
      {options.map((o) => {
        const on = multi ? (sel as string[]).includes(o) : sel === o;
        return (
          <button
            key={o}
            type="button"
            className="ob-choice"
            data-multi={multi}
            role={multi ? undefined : "radio"}
            aria-checked={multi ? undefined : on}
            aria-pressed={multi ? on : undefined}
            onClick={() => {
              if (!multi) return onChange(o);
              const cur = sel as string[];
              if (on) onChange(cur.filter((x) => x !== o));
              else if (!max || cur.length < max) onChange([...cur, o]);
            }}
          >
            <span className="tick">{on ? <Icon name="check" size={13} stroke={2.6} /> : null}</span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function Chips({ options, value, onChange }: { options: readonly string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" className="ob-chip" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}>
            {on ? <Icon name="check" size={14} stroke={2.4} /> : null}
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* ───────── WhyWeNeedThis ───────── */

export function WhyWeNeedThis({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="ob-why">
      <span className="ob-tile3d" style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(150deg,#6fb8ff 0%,#1f7bff 45%,#0a3fb8 100%)" }}>
        <span className="ob-tile3d-shine" style={{ borderRadius: 12 }} />
        <Icon name="shield" size={19} stroke={2.1} className="relative" />
      </span>
      <div>
        <h4>{title}</h4>
        <p>{children}</p>
      </div>
    </aside>
  );
}

/* ───────── Sheet / modal ───────── */

export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  // Portaled to <body> (inside an .ob scope) so it always sits above the sticky header.
  return createPortal(
    <div className="ob !min-h-0 !bg-none" style={{ background: "none" }}>
      <div className="ob-overlay" onClick={onClose} />
      <div className="ob-sheet" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={ref}>
        <div className="sticky top-0 z-10 flex justify-end p-3">
          <button type="button" className="ob-icon-btn bg-[var(--ob-card)]" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="-mt-12 px-4 pb-8 sm:px-8 sm:pb-10">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function SaveBadge({ state }: { state: "idle" | "saving" | "saved" | "error" | "offline" }) {
  if (state === "idle") return null;
  const map = {
    saving: { t: "Saving…", c: "text-[var(--ob-ink-3)]" },
    saved: { t: "All changes saved", c: "text-[var(--ob-success)]" },
    error: { t: "Couldn’t save. Retrying…", c: "text-[var(--ob-danger)]" },
    offline: { t: "Offline. Saved on this device", c: "text-[var(--ob-warn)]" },
  } as const;
  const m = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium ${m.c}`} aria-live="polite">
      {state === "saving" ? <span className="ob-spin inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent" /> : <Icon name={state === "saved" ? "check" : "info"} size={14} />}
      {m.t}
    </span>
  );
}

export function Confetti() {
  const colors = ["#00b4ff", "#00e5ff", "#0a5cff", "#7dd3fc", "#10b981"];
  return (
    <div className="ob-confetti pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible" aria-hidden="true">
      {Array.from({ length: 34 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length], animationDelay: `${(i % 9) * 0.07}s` }} />
      ))}
    </div>
  );
}

export const fmtBytes = (n?: number | null) => (!n ? "" : n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
