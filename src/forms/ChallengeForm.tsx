"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { setEnhancedConversionData, track, trackConversion } from "@/analytics/track";
import { Button, Cta } from "@/components/ui/Button";
import { challengeFields } from "./schemas";
import { Honeypot, TextArea, TextField, Turnstile, useFormMeta } from "./Fields";
import { postMultipart } from "./submit";

const clientSchema = challengeFields.extend({ website_confirm: z.string().optional() });
type Values = z.input<typeof clientSchema>;

export function ChallengeForm({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>();
  const { startedAtRef, eventIdRef } = useFormMeta();
  const startedRef = useRef(false);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(clientSchema) as never, mode: "onTouched" });

  const onSubmit = (e?: React.BaseSyntheticEvent) =>
    handleSubmit(async (values) => {
    setStatus("sending");
    setError(null);
    const res = await postMultipart("/api/leads", { ...values, type: "challenge", eventId: eventIdRef.current, startedAt: startedAtRef.current, turnstileToken: token }, file);
    if (!res.ok) {
      setStatus("idle");
      setError(res.error ?? "Something went wrong.");
      if (res.fields) for (const [k, v] of Object.entries(res.fields)) setFieldError(k as keyof Values, { message: v[0] });
      return;
    }
    setEnhancedConversionData({ email: values.email, phone: values.phone });
    trackConversion("Lead", eventIdRef.current, { content_name: "challenge_madvert" });
    track("challenge_form_complete");
    setStatus("done");
    })(e);

  if (status === "done") {
    return (
      <div className="panel p-8 sm:p-12" aria-live="polite">
        <p className="t-eyebrow">Challenge received</p>
        <h2 className="t-h2 mt-4">Good. This is the interesting part.</h2>
        <p className="t-lead mt-4">We will look at the system and come back with what we think is actually happening.</p>
        <p className="t-body mt-8">Want to talk it through sooner?</p>
        <div className="mt-5">
          <Cta href="/contact#book" track="strategy_call_click" trackLabel="challenge_success">
            Book a Business Strategy Call
          </Cta>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      onFocusCapture={() => {
        if (startedRef.current) return;
        startedRef.current = true;
        startedAtRef.current = Date.now();
        track("contact_form_start", { form: "challenge" });
      }}
      className="panel grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-10"
    >
      <Honeypot register={register as never} />
      <TextField label="Your name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <TextField label="Business" autoComplete="organization" error={errors.business?.message} {...register("business")} />
      <TextField label="Website" optional autoComplete="url" error={errors.website?.message} {...register("website")} />
      <div className="sm:col-span-2">
        <TextArea label="The problem" rows={4} placeholder="Where does the business feel stuck?" error={errors.problem?.message} {...register("problem")} />
      </div>
      <div className="sm:col-span-2">
        <TextArea label="What has already been tried" optional rows={3} error={errors.tried?.message} {...register("tried")} />
      </div>
      <div className="sm:col-span-2">
        <TextArea label="Why it is difficult" optional rows={3} error={errors.whyDifficult?.message} {...register("whyDifficult")} />
      </div>
      <div className="sm:col-span-2">
        <TextArea label="Desired outcome" rows={3} error={errors.desiredOutcome?.message} {...register("desiredOutcome")} />
      </div>
      <TextField label="Phone or WhatsApp" optional type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
      {uploadsEnabled ? (
        <div>
          <label htmlFor="challenge-file" className="mb-2 flex items-baseline justify-between text-[14px] font-medium">
            Attach a file <span className="text-[12px] font-normal text-ink-3">Optional · 8 MB max</span>
          </label>
          <input
            id="challenge-file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv,.xlsx,.pptx,.docx"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFileError(f && f.size > 8 * 1024 * 1024 ? "Files must be 8 MB or smaller." : null);
              setFile(f && f.size <= 8 * 1024 * 1024 ? f : null);
            }}
            className="block w-full rounded-2xl border border-dashed border-line-strong px-4 py-3 text-[14px] text-ink-2 file:mr-4 file:rounded-full file:border-0 file:bg-accent-soft file:px-4 file:py-1.5 file:text-accent-text"
          />
          {fileError ? (
            <p role="alert" className="mt-2 text-[13px] text-danger">
              {fileError}
            </p>
          ) : null}
        </div>
      ) : (
        <TextField label="Link to a doc, deck or video" optional placeholder="Google Drive, Loom, Notion…" error={errors.link?.message} {...register("link")} />
      )}
      <div className="sm:col-span-2">
        <Turnstile onToken={setToken} />
      </div>
      {error ? (
        <p role="alert" className="rounded-xl border border-[color:var(--danger)] px-4 py-3 text-[14px] text-danger sm:col-span-2">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13.5px] text-ink-3">Show us the bottleneck. We will tell you what we would do about it.</p>
        <Button type="submit" size="lg" arrow disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Challenge Madvert"}
        </Button>
      </div>
    </form>
  );
}
