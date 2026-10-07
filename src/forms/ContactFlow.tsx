"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { setEnhancedConversionData, track, trackConversion } from "@/analytics/track";
import { Button } from "@/components/ui/Button";
import { growthBriefFields, investmentOptions } from "./schemas";
import { Honeypot, TextArea, TextField, Turnstile, useFormMeta } from "./Fields";
import { postJson } from "./submit";
import { BookingWidget, type BookingPrefill } from "./BookingWidget";

const clientSchema = growthBriefFields.extend({ website_confirm: z.string().optional() });
type Values = z.input<typeof clientSchema>;

type Step = { key: keyof Values | "contact"; question: string; fields: (keyof Values)[] };

const steps: Step[] = [
  { key: "name", question: "What should we call you?", fields: ["name"] },
  { key: "business", question: "Tell us about your business.", fields: ["business"] },
  { key: "market", question: "Which market do you serve?", fields: ["market"] },
  { key: "stuck", question: "What feels stuck right now?", fields: ["stuck"] },
  { key: "tried", question: "What have you already tried?", fields: ["tried"] },
  { key: "greatResult", question: "What would a great result look like?", fields: ["greatResult"] },
  { key: "investment", question: "What level of investment are you comfortable making if the right solution exists?", fields: ["investment"] },
  { key: "contact", question: "Where should we send our reply?", fields: ["email", "phone", "website"] },
];

const intents: Record<string, string> = {
  "growth-systems-audit": "Free Growth Systems Audit",
  "tech-opportunity-audit": "Tech Opportunity Audit",
};

export function ContactFlow() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<BookingPrefill | null>(null);
  const [token, setToken] = useState<string>();
  const { startedAtRef, eventIdRef } = useFormMeta();
  const stepRef = useRef<HTMLDivElement>(null);

  const {
    register,
    trigger,
    handleSubmit,
    setValue,
    control,
    setError: setFieldError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(clientSchema) as never, mode: "onTouched", defaultValues: { tried: "" } });

  // Read ?service= and ?intent= without making the page dynamic; the server snapshot is empty.
  const search = useSyncExternalStore(
    () => () => {},
    () => window.location.search,
    () => "",
  );
  const ctx = useMemo(() => {
    const p = new URLSearchParams(search);
    return { service: p.get("service") ?? undefined, intent: p.get("intent") ?? undefined };
  }, [search]);
  const investment = useWatch({ control, name: "investment" });

  const begin = useCallback(() => {
    if (started) return;
    setStarted(true);
    startedAtRef.current = Date.now();
    track("contact_form_start", { intent: ctx.intent, service: ctx.service });
  }, [started, ctx, startedAtRef]);

  // Move focus to the new question for keyboard and screen reader users.
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => stepRef.current?.querySelector<HTMLElement>("input:not([type=hidden]),textarea,button[role=radio]")?.focus(), 260);
    return () => clearTimeout(t);
  }, [i, started]);

  const step = steps[i];
  const last = i === steps.length - 1;

  const next = async () => {
    const ok = await trigger(step.fields as (keyof Values)[], { shouldFocus: true });
    if (!ok) return;
    setDir(1);
    setI((v) => Math.min(v + 1, steps.length - 1));
  };
  const back = () => {
    setDir(-1);
    setI((v) => Math.max(v - 1, 0));
  };

  const onSubmit = (e?: React.BaseSyntheticEvent) =>
    handleSubmit(async (values) => {
    setStatus("sending");
    setError(null);
    const res = await postJson("/api/leads", {
      ...values,
      type: "contact",
      service: ctx.service,
      intent: ctx.intent,
      eventId: eventIdRef.current,
      startedAt: startedAtRef.current,
      turnstileToken: token,
    });
    if (!res.ok) {
      setStatus("idle");
      setError(res.error ?? "Something went wrong.");
      if (res.fields) {
        for (const [k, v] of Object.entries(res.fields)) setFieldError(k as keyof Values, { message: v[0] });
        const firstBad = steps.findIndex((s) => s.fields.some((f) => res.fields?.[f as string]));
        if (firstBad >= 0) setI(firstBad);
      }
      return;
    }
    setEnhancedConversionData({ email: values.email, phone: values.phone });
    trackConversion("Lead", eventIdRef.current, { content_name: "growth_brief" });
    track("contact_form_complete", { intent: ctx.intent, service: ctx.service, investment: values.investment });
    setPrefill({
      name: values.name,
      email: values.email,
      phone: values.phone ?? "",
      business: values.business.split(/[.\n]/)[0].slice(0, 120),
      website: values.website ?? "",
      problem: values.stuck,
      market: values.market,
    });
    setStatus("done");
    })(e);

  if (status === "done" && prefill) {
    return (
      <div className="space-y-10" aria-live="polite">
        <div className="panel p-8 sm:p-10">
          <p className="t-eyebrow">Growth brief received</p>
          <h2 className="t-h2 mt-4">Thank you, {prefill.name.split(" ")[0]}. We will review your business before we talk.</h2>
          <p className="t-body mt-4">A reply will come to {prefill.email}. If you would rather talk sooner, choose a time below.</p>
        </div>
        <div id="book-after-brief">
          <h3 className="t-h2">Prefer a Conversation?</h3>
          <p className="t-lead mt-3">Book a Business Strategy Call with Usama and bring the real numbers.</p>
          <div className="mt-8">
            <BookingWidget prefill={prefill} autoOpen />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (last) void onSubmit(e);
        else void next();
      }}
      onFocusCapture={begin}
      noValidate
      className="panel relative overflow-hidden p-6 sm:p-10"
      aria-labelledby="brief-q"
    >
      <Honeypot register={register as never} />
      <div className="flex items-center justify-between gap-4">
        <p className="t-label">
          {ctx.intent && intents[ctx.intent] ? <span className="mr-3 rounded-full bg-accent-soft px-2.5 py-1 text-accent-text">{intents[ctx.intent]}</span> : null}
          Question {i + 1} of {steps.length}
        </p>
        <span className="text-[12.5px] text-ink-3">About 2 minutes</span>
      </div>
      <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-[var(--line)]" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1} aria-label="Progress">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#00b4ff,#00e5ff)] transition-[width] duration-500 ease-[cubic-bezier(.16,1,.3,1)]" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
      </div>

      <div ref={stepRef} className="relative mt-10 min-h-[260px]">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step.key}
            custom={dir}
            initial={reduce ? false : { opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 id="brief-q" className="t-h2 !text-[clamp(24px,2.6vw,34px)]">
              {step.question}
            </h2>
            <div className="mt-8">
              {step.key === "name" && <TextField label="Your name" autoComplete="name" placeholder="First and last name" error={errors.name?.message} {...register("name")} />}
              {step.key === "business" && (
                <TextArea label="Your business" rows={4} placeholder="What you sell, who you sell to, roughly how big the team is." error={errors.business?.message} {...register("business")} />
              )}
              {step.key === "market" && <TextField label="Market" placeholder="Country, city or region. B2B or B2C." error={errors.market?.message} {...register("market")} />}
              {step.key === "stuck" && <TextArea label="What feels stuck" rows={4} placeholder="Symptoms are fine. We will look for the cause." error={errors.stuck?.message} {...register("stuck")} />}
              {step.key === "tried" && <TextArea label="What you have tried" optional rows={4} placeholder="Agencies, channels, tools, hires…" error={errors.tried?.message} {...register("tried")} />}
              {step.key === "greatResult" && (
                <TextArea label="A great result" rows={4} placeholder="In six months, what would make you say this worked?" error={errors.greatResult?.message} {...register("greatResult")} />
              )}
              {step.key === "investment" && (
                <fieldset>
                  <legend className="sr-only-focusable">Investment level</legend>
                  <div role="radiogroup" aria-label="Investment level" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {investmentOptions.map((o) => (
                      <button
                        key={o}
                        type="button"
                        role="radio"
                        aria-checked={investment === o}
                        onClick={() => setValue("investment", o, { shouldValidate: true })}
                        className={`rounded-2xl border px-4 py-4 text-left text-[15px] transition-colors ${
                          investment === o ? "border-[color:var(--accent)] bg-accent-soft text-ink" : "border-line-strong text-ink-2 hover:border-[color:var(--accent)]"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  {errors.investment ? (
                    <p role="alert" className="mt-3 text-[13px] text-danger">
                      {errors.investment.message}
                    </p>
                  ) : null}
                </fieldset>
              )}
              {step.key === "contact" && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <TextField label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register("email")} />
                  </div>
                  <TextField label="Phone or WhatsApp" optional type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
                  <TextField label="Website" optional autoComplete="url" placeholder="yourcompany.com" error={errors.website?.message} {...register("website")} />
                  <div className="sm:col-span-2">
                    <Turnstile onToken={setToken} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {error ? (
        <p role="alert" className="mt-6 rounded-xl border border-[color:var(--danger)] px-4 py-3 text-[14px] text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button type="button" onClick={back} disabled={i === 0} className="text-[14.5px] font-medium text-ink-3 transition-colors hover:text-ink disabled:invisible">
          Back
        </button>
        <Button type="submit" size="lg" arrow disabled={status === "sending"}>
          {last ? (status === "sending" ? "Sending…" : "Send My Growth Brief") : "Continue"}
        </Button>
      </div>
    </form>
  );
}
