"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, CalendarCheck, Check, Loader2, Lock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { DISCOVERY_OPTIONS, EMPTY_DISCOVERY, validateDiscovery, type DiscoveryAnswers, type DiscoveryErrors } from "@/lib/application";
import { submitLead } from "@/lib/submit";
import { BOOKING_SECTION_IDS, scrollToBooking, useBooking, type BookingInstance } from "../BookingContext";
import { EASE, Reveal } from "../ui/motion";
import { Choice, Multi, Text } from "../forms/Fields";
import { GhlCalendar } from "./GhlCalendar";

type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "error"; message: string };

export function BookingSection({ instance = "book-call" }: { instance?: BookingInstance }) {
  const { saved, calendarIn, showCalendarIn } = useBooking();
  const here = calendarIn === instance;
  const elsewhere = calendarIn !== null && !here;
  const step2 = calendarIn !== null;
  const top = instance === "book-call";

  return (
    <section
      id={instance}
      aria-labelledby={`${instance}-title`}
      className={`section-y relative overflow-clip ${top ? "" : "border-t border-line"} bg-bg-2`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,var(--glow),transparent_65%)]" />
      </div>
      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow justify-center">Discovery call</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id={`${instance}-title`} className="display h2 mt-4">
              Book Your <span className="text-grad">Discovery Call</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead mx-auto mt-5 max-w-2xl">
              Let&rsquo;s discuss your production capacity, target customers and whether the Madvert Labs Patches Partnership is a good
              fit for your business.
            </p>
          </Reveal>
        </div>

        {/* Two steps: your details → pick a time */}
        <ol className="mx-auto mt-10 flex max-w-md items-center justify-center gap-3 text-[0.8rem] font-semibold" aria-label="Booking steps">
          <li className={`flex items-center gap-2 ${step2 ? "text-muted" : "text-fg"}`} aria-current={!step2 ? "step" : undefined}>
            <span className={`grid h-6 w-6 place-items-center rounded-full text-[0.7rem] ${step2 ? "bg-accent-soft text-accent" : "bg-grad text-navy"}`}>
              {step2 ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : "1"}
            </span>
            Your details
          </li>
          <li aria-hidden className="h-px w-10 bg-line-strong" />
          <li className={`flex items-center gap-2 ${step2 ? "text-fg" : "text-subtle"}`} aria-current={step2 ? "step" : undefined}>
            <span className={`grid h-6 w-6 place-items-center rounded-full text-[0.7rem] ${step2 ? "bg-grad text-navy" : "bg-surface-3 text-subtle"}`}>2</span>
            Pick a time
          </li>
        </ol>

        <div className="mx-auto mt-6 max-w-4xl">
          <AnimatePresence mode="wait" initial={false}>
            {here ? (
              <motion.div
                key="calendar"
                className="card p-2 shadow-lg sm:p-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {saved ? (
                  <p className="px-2 pb-3 pt-1 text-center text-[0.88rem] text-muted sm:pt-0">
                    Thanks{saved.name ? `, ${saved.name.split(" ")[0]}` : ""} — we have your details. Choose a time that suits you.
                  </p>
                ) : (
                  <p className="px-2 pb-3 pt-1 text-center text-[0.88rem] text-muted sm:pt-0">
                    Your form details weren&rsquo;t saved, so please complete the booking form below.
                  </p>
                )}
                <GhlCalendar />
              </motion.div>
            ) : elsewhere ? (
              // The calendar is already open in the other booking section; don't load it twice.
              <motion.div key="elsewhere" className="card p-6 text-center shadow-md sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-lg font-bold">You&rsquo;re one step away — pick a time for your call.</p>
                <button
                  type="button"
                  className="btn btn-primary mt-5"
                  onClick={() => scrollToBooking(BOOKING_SECTION_IDS.find((id) => id !== instance))}
                >
                  <CalendarCheck className="h-4 w-4" aria-hidden /> Go to the calendar
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={false} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                <DiscoveryForm instance={instance} onSkip={() => showCalendarIn(instance)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function DiscoveryForm({ instance, onSkip }: { instance: BookingInstance; onSkip: () => void }) {
  // Field ids must be unique: this form is on the page twice.
  const p = instance === "book-call" ? "d" : "d2";
  const [d, setD] = useState<DiscoveryAnswers>(EMPTY_DISCOVERY);
  const [errors, setErrors] = useState<DiscoveryErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [honeypot, setHoneypot] = useState("");
  const started = useRef(false);
  const startedAt = useRef(0);
  const { markSaved } = useBooking();

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const set = useCallback(<K extends keyof DiscoveryAnswers>(k: K, v: DiscoveryAnswers[K]) => {
    if (!started.current) {
      started.current = true;
      track("DiscoveryFormStarted");
    }
    setD((p) => ({ ...p, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  }, []);
  const toggle = (k: "customerChannels" | "markets", v: string) => set(k, d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === "submitting") return;
    const errs = validateDiscovery(d);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`f-${p}_${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus({ kind: "submitting" });
    try {
      await submitLead("discovery", d, { startedAt: startedAt.current, honeypot });
      track("DiscoveryFormSubmitted");
      markSaved({ name: d.fullName, email: d.email, business: d.businessName }, instance);
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "We couldn't save your details. Please try again." });
    }
  };

  return (
    <form noValidate onSubmit={submit} className="card relative overflow-hidden shadow-lg">
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0 [clip:rect(0,0,0,0)]">
        <label>
          Leave this field empty
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website_confirm" />
        </label>
      </div>

      <div className="grid gap-5 px-5 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Text id={`${p}_fullName`} label="Your name" value={d.fullName} onChange={(v) => set("fullName", v)} error={errors.fullName} autoComplete="name" />
          <Text id={`${p}_businessName`} label="Business name" value={d.businessName} onChange={(v) => set("businessName", v)} error={errors.businessName} autoComplete="organization" />
          <Text id={`${p}_email`} label="Business email" type="email" inputMode="email" value={d.email} onChange={(v) => set("email", v)} error={errors.email} autoComplete="email" />
          <Text id={`${p}_phone`} label="Phone / WhatsApp" type="tel" inputMode="tel" value={d.phone} onChange={(v) => set("phone", v)} error={errors.phone} autoComplete="tel" placeholder="+1 …" />
        </div>
        <Text id={`${p}_website`} label="Website" inputMode="url" value={d.website} onChange={(v) => set("website", v)} error={errors.website} placeholder="yourcompany.com" autoComplete="url" />
        <Choice id={`${p}_monthlyRevenue`} label="Current monthly revenue" options={DISCOVERY_OPTIONS.monthlyRevenue} value={d.monthlyRevenue} onChange={(v) => set("monthlyRevenue", v)} error={errors.monthlyRevenue} cols={3} />
        <Multi id={`${p}_customerChannels`} label="How are customers currently coming to you?" options={DISCOVERY_OPTIONS.customerChannels} values={d.customerChannels} onToggle={(v) => toggle("customerChannels", v)} error={errors.customerChannels} cols={2} />
        <Choice id={`${p}_rfqsPerMonth`} label="How many RFQs do you want per month?" options={DISCOVERY_OPTIONS.rfqsPerMonth} value={d.rfqsPerMonth} onChange={(v) => set("rfqsPerMonth", v)} error={errors.rfqsPerMonth} cols={5} />
        <Multi id={`${p}_markets`} label="Which markets do you serve?" options={DISCOVERY_OPTIONS.markets} values={d.markets} onToggle={(v) => toggle("markets", v)} error={errors.markets} />
        <Choice id={`${p}_manufacturing`} label="Do you manufacture in-house or outsource?" options={DISCOVERY_OPTIONS.manufacturing} value={d.manufacturing} onChange={(v) => set("manufacturing", v)} error={errors.manufacturing} cols={3} />
      </div>

      <AnimatePresence>
        {status.kind === "error" && (
          <motion.div
            role="alert"
            className="mx-5 mb-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[0.9rem] sm:mx-8"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="flex items-start gap-2 font-semibold text-red-600 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {status.message}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-6">
              <button type="submit" className="font-semibold text-fg underline underline-offset-4">
                Try again
              </button>
              <button type="button" onClick={onSkip} className="font-semibold text-fg underline underline-offset-4">
                Continue to the calendar without saving
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="flex items-center justify-center gap-1.5 text-[0.75rem] text-subtle sm:justify-start">
          <Lock className="h-3.5 w-3.5" aria-hidden /> Your information is private. Next: pick a time.
        </p>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status.kind === "submitting"}>
          {status.kind === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving…
            </>
          ) : (
            <>
              <CalendarCheck className="h-4 w-4" aria-hidden /> Continue to the calendar
              <ArrowRight className="arrow h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
