"use client";

import { useState } from "react";
import type { CompanySettings } from "@/onboarding/types";
import { Btn, Field, StatusPill } from "../kit";
import { Msg, opsCall, useBusy } from "./OpsKit";

const FIELDS: { key: keyof CompanySettings["integrations"]; label: string; help: string }[] = [
  { key: "metaPartnerBusinessId", label: "Madvert Partner Business ID (Meta)", help: "Shown to clients in the Meta partner access wizard. Business settings → Business info in Madvert’s own portfolio." },
  { key: "googleAdsManagerId", label: "Google Ads manager account ID", help: "e.g. 123-456-7890. Shown on the Google Ads link step." },
  { key: "googleAccessEmail", label: "Google access email", help: "Invited to GA4, Tag Manager, Search Console, Business Profile, YouTube, Merchant Center." },
  { key: "websiteAccessEmail", label: "Website access email", help: "WordPress admin, Webflow, Wix, Squarespace, hosting." },
  { key: "dnsAccessEmail", label: "DNS / registrar access email", help: "Cloudflare, GoDaddy, Namecheap, Hostinger delegate access." },
  { key: "crmAccessEmail", label: "CRM access email", help: "GoHighLevel, HubSpot and other CRMs." },
  { key: "bookingUrl", label: "Kickoff booking calendar URL", help: "Embedded on the Kickoff step." },
  { key: "supportEmail", label: "Support email", help: "Contact Madvert / Need help." },
  { key: "supportWhatsApp", label: "Support WhatsApp number", help: "International format, e.g. +971500000000. Optional." },
];

export function SettingsForm({ initial, config }: { initial: CompanySettings; config: { label: string; ok: boolean; note: string }[] }) {
  const [s, setS] = useState(initial);
  const { busy, msg, run } = useBusy();
  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <div>
        <p className="ob-eyebrow">Settings → Company → Integrations</p>
        <h1 className="ob-h1 mt-3">
          Company <span className="ob-grad-text">integrations</span>
        </h1>
        <p className="ob-lead mt-3">Values shared with clients during onboarding. Nothing here is hardcoded in the portal.</p>
      </div>
      <section className="ob-card ob-card-pad grid gap-5 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.key === "bookingUrl" ? "sm:col-span-2" : ""}>
            <Field label={f.label} help={f.help} htmlFor={`s-${f.key}`}>
              <input id={`s-${f.key}`} className="ob-input" value={s.integrations[f.key] ?? ""} onChange={(e) => setS({ ...s, integrations: { ...s.integrations, [f.key]: e.target.value } })} />
            </Field>
          </div>
        ))}
      </section>
      <section className="ob-card ob-card-pad grid gap-5 sm:grid-cols-2">
        <h2 className="ob-h3 sm:col-span-2">Defaults for new onboardings</h2>
        {(
          [
            ["accountManager", "Account manager"],
            ["accountManagerEmail", "Account manager email"],
            ["strategist", "Strategist"],
          ] as const
        ).map(([k, l]) => (
          <Field key={k} label={l} htmlFor={`d-${k}`}>
            <input id={`d-${k}`} className="ob-input" value={s.defaults[k]} onChange={(e) => setS({ ...s, defaults: { ...s.defaults, [k]: e.target.value } })} />
          </Field>
        ))}
        <Field label="Link lifetime (days)" htmlFor="d-days">
          <input id="d-days" type="number" min={1} max={365} className="ob-input" value={s.defaults.linkLifetimeDays} onChange={(e) => setS({ ...s, defaults: { ...s.defaults, linkLifetimeDays: Number(e.target.value) } })} />
        </Field>
      </section>
      <div>
        <Btn size="lg" disabled={busy} onClick={() => run(() => opsCall("settings", s), "Settings saved.")}>
          {busy ? "Saving…" : "Save settings"}
        </Btn>
        <Msg msg={msg} />
      </div>
      <section className="ob-card ob-card-pad">
        <h2 className="ob-h3">Environment & external credentials</h2>
        <p className="mt-1 text-[13.5px] text-[var(--ob-ink-3)]">Set in Vercel → Project → Settings → Environment Variables. See README “Client Onboarding Portal”.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {config.map((c) => (
            <li key={c.label} className="flex items-start gap-3 rounded-xl bg-[var(--ob-card-2)] p-3 text-[13.5px]">
              <StatusPill status={c.ok ? "completed" : "blocked"} label={c.ok ? "Ready" : "Configuration Required"} />
              <span>
                <strong>{c.label}</strong>
                <span className="block text-[var(--ob-ink-3)]">{c.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
