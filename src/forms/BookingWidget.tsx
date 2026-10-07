"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { setEnhancedConversionData, track, trackConversion } from "@/analytics/track";
import { Button } from "@/components/ui/Button";
import { bookingFields } from "./schemas";
import { Honeypot, TextArea, TextField, Turnstile, useFormMeta } from "./Fields";
import { postJson } from "./submit";

export type BookingPrefill = z.input<typeof bookingFields>;
const clientSchema = bookingFields.extend({ website_confirm: z.string().optional() });
type Values = z.input<typeof clientSchema>;
type Slot = { start: string; end: string };

const COMMON_ZONES = [
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
  "UTC",
];

function detectZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function allZones(current: string) {
  let zones: string[] = COMMON_ZONES;
  try {
    const sv = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
    if (sv) zones = sv("timeZone");
  } catch {}
  return Array.from(new Set([current, ...zones]));
}

/**
 * Strategy call booking: short qualification → real free slots from Google Calendar → confirm.
 * Only free/busy derived slots are ever shown; no calendar details reach the browser.
 */
export function BookingWidget({ prefill, autoOpen = false }: { prefill?: Partial<BookingPrefill>; autoOpen?: boolean }) {
  const [phase, setPhase] = useState<"details" | "time" | "done">("details");
  const [tz, setTz] = useState(() => (typeof window === "undefined" ? "UTC" : detectZone()));
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [picked, setPicked] = useState<Slot | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ start: string; meetLink?: string } | null>(null);
  const [token, setToken] = useState<string>();
  const { startedAtRef, eventIdRef } = useFormMeta();
  const opened = useRef(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(clientSchema) as never, defaultValues: { ...prefill }, mode: "onTouched" });

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/calendar/availability", { cache: "no-store" });
      const data = (await res.json()) as { ok: boolean; configured?: boolean; slots: Slot[]; error?: string };
      setConfigured(data.configured ?? false);
      if (!data.ok) setLoadError(data.error ?? "Availability is temporarily unavailable.");
      setSlots(data.slots ?? []);
    } catch {
      setLoadError("Availability is temporarily unavailable.");
      setSlots([]);
    }
  }, []);

  const markOpen = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    track("calendar_open");
    void load();
  }, [load]);

  useEffect(() => {
    if (autoOpen) markOpen();
  }, [autoOpen, markOpen]);

  const dayKey = useCallback((iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso)), [tz]);

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots ?? []) {
      const k = dayKey(s.start);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return map;
  }, [slots, dayKey]);

  const activeDay = day && byDay.has(day) ? day : (byDay.keys().next().value ?? null);

  const fmtDay = (k: string) => {
    const [y, m, d] = k.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12));
    return {
      wd: new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(date),
      dm: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(date),
    };
  };
  const fmtTime = (iso: string) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));
  const fmtFull = (iso: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: tz }).format(new Date(iso));

  const toTime = (e: React.FormEvent<HTMLFormElement>) =>
    void handleSubmit(() => {
      setPhase("time");
      markOpen();
    })(e);

  const confirm = async () => {
    if (!picked) return;
    setSending(true);
    setError(null);
    const values = getValues();
    const res = await postJson("/api/calendar/book", {
      ...values,
      start: picked.start,
      timezone: tz,
      eventId: eventIdRef.current,
      startedAt: startedAtRef.current,
      turnstileToken: token,
    });
    setSending(false);
    if (!res.ok) {
      setError(res.error ?? "Booking failed.");
      if (res.code === "slot_taken") {
        setPicked(null);
        void load();
      }
      return;
    }
    setEnhancedConversionData({ email: values.email, phone: values.phone });
    trackConversion("Schedule", eventIdRef.current);
    track("calendar_booking_complete", { timezone: tz });
    setConfirmed({ start: String(res.start), meetLink: res.meetLink as string | undefined });
    setPhase("done");
  };

  if (phase === "done" && confirmed) {
    return (
      <div className="panel p-8 sm:p-10" aria-live="polite">
        <p className="t-eyebrow">Booked</p>
        <h3 className="t-h2 mt-4">Your strategy call is confirmed.</h3>
        <p className="t-lead mt-4">{fmtFull(confirmed.start)}</p>
        <p className="t-small mt-1">{tz.replace(/_/g, " ")}</p>
        <p className="t-body mt-6">A calendar invitation has been sent to your email{confirmed.meetLink ? " with the Google Meet link" : ""}. Bring the real numbers. We will bring the questions.</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden" onFocusCapture={markOpen} onPointerEnter={markOpen}>
      <ol className="grid grid-cols-2 border-b border-line text-[13px]">
        {["Your details", "Choose a time"].map((l, idx) => {
          const active = (phase === "details" && idx === 0) || (phase === "time" && idx === 1);
          return (
            <li key={l} className={`flex items-center gap-2.5 px-6 py-4 ${active ? "text-ink" : "text-ink-3"}`} aria-current={active ? "step" : undefined}>
              <span className={`grid h-6 w-6 place-items-center rounded-full border text-[11px] font-semibold ${active ? "border-[color:var(--accent)] text-accent-text" : "border-line"}`}>{idx + 1}</span>
              {l}
            </li>
          );
        })}
      </ol>

      {phase === "details" ? (
        <form onSubmit={toTime} noValidate className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <Honeypot register={register as never} />
          <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <TextField label="Phone or WhatsApp" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
          <TextField label="Business name" autoComplete="organization" error={errors.business?.message} {...register("business")} />
          <TextField label="Website" optional autoComplete="url" error={errors.website?.message} {...register("website")} />
          <TextField label="Market" placeholder="Where your customers are" error={errors.market?.message} {...register("market")} />
          <div className="sm:col-span-2">
            <TextArea label="Primary problem" rows={3} placeholder="What should we understand before the call?" error={errors.problem?.message} {...register("problem")} />
          </div>
          <div className="sm:col-span-2">
            <TextArea label="Notes" optional rows={2} error={errors.notes?.message} {...register("notes")} />
          </div>
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" size="lg" arrow>
              Choose a Time
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => setPhase("details")} className="self-start text-[14px] text-ink-3 hover:text-ink">
              ← Edit details
            </button>
            <label className="flex items-center gap-3 text-[13.5px] text-ink-2">
              Time zone
              <select value={tz} onChange={(e) => setTz(e.target.value)} className="max-w-[220px] rounded-xl border border-line-strong bg-surface px-3 py-2 text-[13.5px] text-ink">
                {allZones(tz).map((z) => (
                  <option key={z} value={z}>
                    {z.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {slots === null ? (
            <p className="mt-10 text-ink-3" aria-live="polite">
              Checking real availability…
            </p>
          ) : configured === false ? (
            <div className="mt-8 rounded-2xl border border-dashed border-line-strong p-6">
              <p className="font-display text-[17px] font-semibold">Online booking is being connected.</p>
              <p className="mt-2 text-[15px] text-ink-2">
                Send a growth brief above and we will reply by email to arrange a time. Nothing you entered here has been lost: your details stay on this page.
              </p>
            </div>
          ) : loadError ? (
            <div className="mt-8 rounded-2xl border border-line-strong p-6">
              <p className="text-[15px] text-ink-2">{loadError}</p>
              <button type="button" onClick={() => void load()} className="mt-3 text-[14px] font-medium text-accent-text">
                Try again
              </button>
            </div>
          ) : byDay.size === 0 ? (
            <p className="mt-8 text-[15px] text-ink-2">No open times in the next few weeks. Please send a growth brief and we will make time.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="t-label">Date</p>
                <div role="radiogroup" aria-label="Date" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3">
                  {[...byDay.keys()].map((k) => {
                    const f = fmtDay(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        role="radio"
                        aria-checked={activeDay === k}
                        onClick={() => {
                          setDay(k);
                          setPicked(null);
                        }}
                        className={`rounded-xl border px-2 py-3 text-center transition-colors ${activeDay === k ? "border-[color:var(--accent)] bg-accent-soft" : "border-line hover:border-line-strong"}`}
                      >
                        <span className="block text-[11.5px] uppercase tracking-[0.12em] text-ink-3">{f.wd}</span>
                        <span className="mt-1 block font-display text-[15px] font-semibold">{f.dm}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="t-label">Time</p>
                <div role="radiogroup" aria-label="Time" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {(activeDay ? byDay.get(activeDay) ?? [] : []).map((s) => (
                    <button
                      key={s.start}
                      type="button"
                      role="radio"
                      aria-checked={picked?.start === s.start}
                      onClick={() => setPicked(s)}
                      className={`rounded-xl border px-2 py-2.5 font-display text-[14.5px] font-medium transition-colors ${
                        picked?.start === s.start ? "border-transparent bg-[linear-gradient(100deg,#00b4ff,#00e5ff)] text-on-accent" : "border-line hover:border-line-strong"
                      }`}
                    >
                      {fmtTime(s.start)}
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <Turnstile onToken={setToken} />
                </div>
                {error ? (
                  <p role="alert" className="mt-4 text-[14px] text-danger">
                    {error}
                  </p>
                ) : null}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[13.5px] text-ink-2" aria-live="polite">
                    {picked ? fmtFull(picked.start) : "Pick a time"}
                  </p>
                  <Button type="button" size="lg" arrow disabled={!picked || sending} onClick={() => void confirm()}>
                    {sending ? "Booking…" : "Confirm Call"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
