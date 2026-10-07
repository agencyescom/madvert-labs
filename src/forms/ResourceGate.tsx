"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { track, trackConversion } from "@/analytics/track";
import { Button, Cta } from "@/components/ui/Button";
import type { GatingType } from "@/types/content";
import { resourceRequestFields } from "./schemas";
import { Honeypot, TextArea, TextField, Turnstile, useFormMeta } from "./Fields";
import { postJson } from "./submit";

const baseSchema = resourceRequestFields.extend({ website_confirm: z.string().optional() });
type Values = z.input<typeof baseSchema>;

function schemaFor(gating: GatingType) {
  if (gating === "form") return baseSchema.extend({ name: z.string().trim().min(2, "Please enter your name"), business: z.string().trim().min(2, "Please enter your business") });
  if (gating === "qualified")
    return baseSchema.extend({
      name: z.string().trim().min(2, "Please enter your name"),
      business: z.string().trim().min(2, "Please enter your business"),
      challenge: z.string().trim().min(5, "Tell us briefly"),
    });
  return baseSchema;
}

/** Download gate whose depth follows the CMS gating setting: open, email, form or qualified. */
export function ResourceGate({ slug, title, gating, openUrl }: { slug: string; title: string; gating: GatingType; openUrl?: string }) {
  const [done, setDone] = useState<{ url?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [token, setToken] = useState<string>();
  const { startedAtRef, eventIdRef } = useFormMeta();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schemaFor(gating)) as never });

  if (gating === "open") {
    return openUrl ? (
      <Cta href={openUrl} size="lg" track="resource_download" trackLabel={slug} target={openUrl.startsWith("http") ? "_blank" : undefined}>
        Open the {title}
      </Cta>
    ) : (
      <p className="rounded-2xl border border-dashed border-line-strong p-5 text-[14.5px] text-ink-3">[REAL RESOURCE FILE] is being finalised. Check back soon.</p>
    );
  }

  if (done) {
    return (
      <div className="panel p-7" aria-live="polite">
        <p className="t-eyebrow">Unlocked</p>
        {done.url ? (
          <>
            <p className="t-h3 mt-3">Your copy is ready.</p>
            <div className="mt-6">
              <Cta href={done.url} track="resource_download" trackLabel={slug} target="_blank" rel="noopener">
                Download the {title}
              </Cta>
            </div>
          </>
        ) : (
          <p className="t-h3 mt-3">{gating === "qualified" ? "Thanks. We review every request and will send it personally." : "Request received. We will email it to you."}</p>
        )}
      </div>
    );
  }

  const needsForm = gating === "form" || gating === "qualified";
  const onSubmit = (e?: React.BaseSyntheticEvent) =>
    handleSubmit(async (values) => {
    setSending(true);
    setError(null);
    const res = await postJson("/api/leads", { ...values, type: "resource", resourceSlug: slug, eventId: eventIdRef.current, startedAt: startedAtRef.current, turnstileToken: token });
    setSending(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    trackConversion("Lead", eventIdRef.current, { content_name: slug });
    track("resource_download", { resource: slug, gating });
    setDone({ url: res.downloadUrl as string | undefined });
    })(e);

  return (
    <form onSubmit={onSubmit} noValidate className="panel grid grid-cols-1 gap-5 p-6 sm:p-8">
      <Honeypot register={register as never} />
      <TextField label="Work email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      {needsForm ? (
        <>
          <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <TextField label="Business" autoComplete="organization" error={errors.business?.message} {...register("business")} />
          <TextField label="Website" optional autoComplete="url" error={errors.website?.message} {...register("website")} />
        </>
      ) : null}
      {gating === "qualified" ? (
        <TextArea label="What do you want to solve?" rows={3} error={errors.challenge?.message} {...register("challenge")} />
      ) : null}
      <Turnstile onToken={setToken} />
      {error ? (
        <p role="alert" className="text-[14px] text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" arrow disabled={sending} className="justify-self-start">
        {sending ? "Sending…" : gating === "qualified" ? "Request Access" : "Get the Resource"}
      </Button>
      <p className="text-[12.5px] text-ink-3">No spam. Useful follow ups only, and you can opt out any time.</p>
    </form>
  );
}
