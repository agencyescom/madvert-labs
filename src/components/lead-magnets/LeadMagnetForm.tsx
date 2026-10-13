"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { trackConversion, trackLeadMagnet } from "@/analytics/track";
import { Button, Cta } from "@/components/ui/Button";
import { Honeypot, TextField, Turnstile, useFormMeta } from "@/forms/Fields";
import { resourceRequestFields } from "@/forms/schemas";
import { postJson } from "@/forms/submit";
import type { Resource } from "@/types/content";

const clientSchema = resourceRequestFields.extend({ website_confirm: z.string().optional() });
type Values = z.input<typeof clientSchema>;

/** First name + email capture with a resource specific next step after submission. */
export function LeadMagnetForm({ resource }: { resource: Resource }) {
  const [done, setDone] = useState<{ url?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [token, setToken] = useState<string>();
  const startedRef = useRef(false);
  const { startedAtRef, eventIdRef } = useFormMeta();
  const extra = resource.extraFields ?? [];
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(clientSchema) as never });

  const onSubmit = (e?: React.BaseSyntheticEvent) =>
    handleSubmit(async (values) => {
      setSending(true);
      setError(null);
      const res = await postJson("/api/leads", {
        ...values,
        type: "resource",
        resourceSlug: resource.slug,
        eventId: eventIdRef.current,
        startedAt: startedAtRef.current,
        turnstileToken: token,
      });
      setSending(false);
      if (!res.ok) {
        setError(res.error ?? "Something went wrong. Please try again.");
        return;
      }
      trackConversion("Lead", eventIdRef.current, { content_name: resource.slug });
      trackLeadMagnet("lead_magnet_conversion", resource.title, { lead_source: resource.sourceId });
      const url = res.downloadUrl as string | undefined;
      if (url) trackLeadMagnet("lead_magnet_download", resource.title);
      setDone({ url });
    })(e);

  if (done) {
    return (
      <div className="panel p-7 sm:p-9" aria-live="polite">
        <p className="t-eyebrow">Done. Thank you.</p>
        <h3 className="t-h2 mt-4 !text-[clamp(24px,2.4vw,32px)]">{resource.successTitle ?? "Your resource is on its way."}</h3>
        <p className="t-body mt-4">{resource.successBody ?? "Check your inbox in the next few minutes."}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {done.url ? (
            <Cta href={done.url} variant="secondary" track="resource_download" trackLabel={resource.slug} target={done.url.startsWith("http") ? "_blank" : undefined}>
              Open the {resource.kind}
            </Cta>
          ) : null}
          <Cta href="#book" track="lead_magnet_calendar_click" trackLabel={resource.slug}>
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
        trackLeadMagnet("lead_magnet_form_start", resource.title);
      }}
      className="panel lm-form grid grid-cols-1 gap-4 p-6 sm:p-8"
      aria-label={`Get ${resource.title}`}
    >
      <Honeypot register={register as never} />
      <p className="font-display text-[17px] font-semibold">Get it free. Sent straight to your inbox.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="First name" autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
        <TextField label="Email address" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register("email")} />
        {extra.includes("company") ? <TextField label="Company" optional autoComplete="organization" error={errors.company?.message} {...register("company")} /> : null}
        {extra.includes("website") ? <TextField label="Website" optional autoComplete="url" error={errors.website?.message} {...register("website")} /> : null}
      </div>
      <Turnstile onToken={setToken} />
      {error ? (
        <p role="alert" className="text-[14px] text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" arrow disabled={sending} className="w-full sm:w-auto sm:justify-self-start">
        {sending ? "Sending…" : resource.formCta ?? "Send Me the Guide"}
      </Button>
      <p className="text-[12.5px] text-ink-3">No spam. Useful follow ups only. Unsubscribe any time.</p>
    </form>
  );
}
