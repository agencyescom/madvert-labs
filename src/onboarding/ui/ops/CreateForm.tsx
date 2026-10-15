"use client";

import Link from "next/link";
import { useState } from "react";
import { Btn, Choices, CopyButton, Field, Icon } from "../kit";
import { Msg, opsCall, useBusy } from "./OpsKit";

export function CreateForm({
  services,
  defaults,
  emailEnabled,
}: {
  services: { key: string; label: string }[];
  defaults: { accountManager: string; accountManagerEmail: string; strategist: string };
  emailEnabled: boolean;
}) {
  const [f, setF] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    accountManager: defaults.accountManager,
    accountManagerEmail: defaults.accountManagerEmail,
    strategist: defaults.strategist,
    assignedOwner: "",
  });
  const [svc, setSvc] = useState<string[]>([]);
  const [flags, setFlags] = useState({ ecommerce: false, localBusiness: false, sendEmail: emailEnabled });
  const [done, setDone] = useState<{ id: string; url: string; emailed: boolean } | null>(null);
  const { busy, msg, run } = useBusy();
  const labels = services.map((s) => s.label);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  if (done)
    return (
      <div className="mx-auto max-w-2xl">
        <section className="ob-navy p-8">
          <p className="ob-eyebrow !text-[#7fdcff]">Onboarding created</p>
          <h1 className="ob-h1 mt-4 text-white">{f.companyName} is ready.</h1>
          <p className="mt-3 text-[15px] text-[#b4c2d6]">
            {done.emailed ? `We emailed the secure link to ${f.email}.` : "Send this secure link to the client (WhatsApp or email). It is shown in full only here and on the client page."}
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-white/10 p-3">
            <code className="min-w-0 flex-1 truncate text-[13px] text-white">{done.url}</code>
            <CopyButton value={done.url} label="Copy link" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/ops/onboarding/${done.id}`} className="ob-btn ob-btn-white">
              Open client onboarding <Icon name="arrow" />
            </Link>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Welcome to Madvert Labs, ${f.firstName}! Your onboarding portal: ${done.url}`)}`} target="_blank" rel="noopener noreferrer" className="ob-btn !bg-white/10 !text-white">
              <Icon name="chat" /> Share on WhatsApp
            </a>
          </div>
        </section>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <p className="ob-eyebrow">Payment confirmed</p>
      <h1 className="ob-h1 mt-3">
        New client <span className="ob-grad-text">onboarding</span>
      </h1>
      <p className="ob-lead mt-3">Create the secure personalised link after the proposal is accepted, the contract is signed and the initial payment is received.</p>
      <div className="ob-card ob-card-pad mt-8 grid gap-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company name" required htmlFor="c-co">
            <input id="c-co" className="ob-input" value={f.companyName} onChange={set("companyName")} />
          </Field>
          <Field label="Client first name" required htmlFor="c-fn">
            <input id="c-fn" className="ob-input" value={f.firstName} onChange={set("firstName")} />
          </Field>
          <Field label="Last name" htmlFor="c-ln">
            <input id="c-ln" className="ob-input" value={f.lastName} onChange={set("lastName")} />
          </Field>
          <Field label="Client email" required htmlFor="c-em">
            <input id="c-em" type="email" className="ob-input" value={f.email} onChange={set("email")} />
          </Field>
          <Field label="Phone" htmlFor="c-ph">
            <input id="c-ph" className="ob-input" value={f.phone} onChange={set("phone")} />
          </Field>
          <Field label="Assigned owner" htmlFor="c-ow">
            <input id="c-ow" className="ob-input" placeholder="Defaults to you" value={f.assignedOwner} onChange={set("assignedOwner")} />
          </Field>
        </div>
        <Field label="Engagement services" required help="Onboarding adapts to these: only the relevant access, assets and questions are requested.">
          <Choices options={labels} multi value={svc.map((k) => services.find((s) => s.key === k)!.label)} onChange={(v) => setSvc((v as string[]).map((l) => services.find((s) => s.label === l)!.key))} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="ob-chip !h-9" onClick={() => setSvc(services.map((s) => s.key))}>
              Full stack
            </button>
            <button type="button" className="ob-chip !h-9" onClick={() => setSvc(["meta_ads", "website", "crm_automation", "branding"])}>
              Meta Ads client
            </button>
            <button type="button" className="ob-chip !h-9" onClick={() => setSvc(["seo", "website"])}>
              SEO client
            </button>
            <button type="button" className="ob-chip !h-9" onClick={() => setSvc(["development"])}>
              Development client
            </button>
          </div>
        </Field>
        <div className="flex flex-wrap gap-5">
          {(
            [
              ["ecommerce", "E-commerce business (Merchant Center, catalogs)"],
              ["localBusiness", "Local business (Google Business Profile)"],
            ] as const
          ).map(([k, l]) => (
            <label key={k} className="flex cursor-pointer items-center gap-2.5 text-[14px]">
              <input type="checkbox" className="h-5 w-5 accent-[#00a2ff]" checked={flags[k]} onChange={(e) => setFlags({ ...flags, [k]: e.target.checked })} />
              {l}
            </label>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Account manager" htmlFor="c-am">
            <input id="c-am" className="ob-input" value={f.accountManager} onChange={set("accountManager")} />
          </Field>
          <Field label="Account manager email" htmlFor="c-ame">
            <input id="c-ame" className="ob-input" value={f.accountManagerEmail} onChange={set("accountManagerEmail")} />
          </Field>
          <Field label="Strategist" htmlFor="c-st">
            <input id="c-st" className="ob-input" value={f.strategist} onChange={set("strategist")} />
          </Field>
        </div>
        <label className={`flex items-center gap-2.5 text-[14px] ${emailEnabled ? "cursor-pointer" : "opacity-60"}`}>
          <input type="checkbox" className="h-5 w-5 accent-[#00a2ff]" disabled={!emailEnabled} checked={flags.sendEmail} onChange={(e) => setFlags({ ...flags, sendEmail: e.target.checked })} />
          Email the welcome link to the client {emailEnabled ? "" : "(Configuration Required: RESEND_API_KEY + EMAIL_FROM)"}
        </label>
        <Msg msg={msg} />
        <Btn
          size="lg"
          arrow
          disabled={busy}
          onClick={async () => {
            const r = await run(() => opsCall<{ id: string; url: string; emailed: boolean }>("create", { ...f, services: svc, ...flags }));
            if (!r.error) setDone({ id: r.id, url: r.url, emailed: r.emailed });
          }}
        >
          {busy ? "Creating…" : "Create secure onboarding link"}
        </Btn>
      </div>
    </div>
  );
}
