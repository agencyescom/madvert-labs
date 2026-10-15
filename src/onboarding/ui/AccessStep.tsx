"use client";

import { useState, type ReactNode } from "react";
import { guidePlatformFor } from "@/onboarding/guides/defaults";
import { accessStatusOf } from "@/onboarding/progress";
import { ACCESS_BY_KEY, CRMS, META_ASSETS, REGISTRARS, SOCIAL_PLATFORMS, WEBSITE_PLATFORMS, type AccessGroup } from "@/onboarding/template/access";
import type { AccessStatus, AnswerValue } from "@/onboarding/types";
import { DelegateDialog, GuideSteps, NeedHelp } from "./Guides";
import { Btn, Choices, CopyButton, Field, Icon, Sheet, StatusPill, WhyWeNeedThis } from "./kit";
import { PlatformLogo } from "./logos";
import type { View } from "./PortalApp";
import { StepFooter, StepHeader } from "./StepLayout";
import { progressInputFrom, usePortal } from "./store";

const GROUPS: { group: AccessGroup; label: string; logo: string; blurb: string }[] = [
  { group: "meta", label: "Meta", logo: "meta", blurb: "Facebook, Instagram, Ad Account, Pixel and Catalog through partner access." },
  { group: "google", label: "Google", logo: "google", blurb: "Ads, Analytics, Tag Manager, Search Console, Business Profile, YouTube." },
  { group: "website", label: "Website", logo: "website", blurb: "Admin, collaborator or developer access for your platform." },
  { group: "domain", label: "Domain & DNS", logo: "domain", blurb: "Delegated access to your registrar or DNS provider." },
  { group: "crm", label: "CRM", logo: "crm", blurb: "Where leads and customers are managed today." },
  { group: "whatsapp", label: "WhatsApp Business", logo: "whatsapp", blurb: "Your business number for follow-up and automation." },
  { group: "social", label: "Social Media", logo: "social", blurb: "Every profile customers can find you on." },
  { group: "development", label: "Code & Hosting", logo: "repository", blurb: "Repository, hosting and technical documentation." },
];

const STATUS_LABEL: Record<AccessStatus, string> = {
  connected: "Connected",
  pending: "Pending",
  not_required: "Not Required",
  need_help: "Need Help",
  kickoff: "During kickoff",
  not_started: "Not started",
};

export function useAccess(platform: string) {
  const { state, call } = usePortal();
  const a = state.access[platform];
  const input = progressInputFrom(state, state.answers);
  const status = accessStatusOf(input, platform);
  const details = (a?.details ?? {}) as Record<string, AnswerValue>;
  const save = (patch: { status?: AccessStatus; details?: Record<string, AnswerValue>; clientNote?: string }) => call("access", { platform, ...patch });
  return { status, details, verified: a?.verified ?? false, save, required: state.template.access.find((x) => x.key === platform)?.required ?? false };
}

function groupStatus(statuses: AccessStatus[]): AccessStatus {
  if (!statuses.length) return "not_started";
  if (statuses.every((s) => s === "connected" || s === "not_required")) return statuses.some((s) => s === "connected") ? "connected" : "not_required";
  if (statuses.some((s) => s === "need_help")) return "need_help";
  if (statuses.every((s) => s !== "not_started")) return statuses.some((s) => s === "kickoff") ? "kickoff" : "pending";
  if (statuses.some((s) => s !== "not_started")) return "pending";
  return "not_started";
}

export function AccessStep({ go }: { go: (v: View) => void }) {
  const { state, progress } = usePortal();
  const [open, setOpen] = useState<AccessGroup | null>(null);
  const input = progressInputFrom(state, state.answers);
  const plan = state.template.access;
  const groups = GROUPS.map((g) => {
    const items = plan.filter((p) => ACCESS_BY_KEY[p.key]?.group === g.group);
    return { ...g, items, required: items.some((i) => i.required), status: groupStatus(items.map((i) => accessStatusOf(input, i.key))) };
  }).filter((g) => g.items.length);

  return (
    <div>
      <StepHeader
        phase="access"
        title="Connect your"
        accent="business."
        intro="Give Madvert Labs access the safe way: partner access and user invitations, never your passwords. Start with any card; required connections are marked."
        aside={<span className="text-[13px] font-semibold text-[var(--ob-ink-3)]">{progress.byKey.access.percent}% connected</span>}
      />
      <div className="mb-8">
        <WhyWeNeedThis title="How access works">
          You stay the owner of every account. We ask to be added as a partner or user with only the permissions we need, and you can remove us at any time. If someone else
          manages an account, send them the task: they get a link to that one step only.
        </WhyWeNeedThis>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {groups.map((g, i) => (
          <button key={g.group} type="button" className="ob-card ob-card-hover ob-conn ob-enter" style={{ animationDelay: `${i * 50}ms` }} data-status={g.status} onClick={() => setOpen(g.group)}>
            <div className="flex items-start justify-between gap-3">
              <span className="ob-logo-tile">
                <PlatformLogo platform={g.logo} />
              </span>
              <span className={`text-[11px] font-bold tracking-[0.14em] ${g.required ? "text-[var(--ob-blue)]" : "text-[var(--ob-ink-3)]"}`}>{g.required ? "REQUIRED" : "OPTIONAL"}</span>
            </div>
            <div>
              <p className="ob-h3">{g.label}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ob-ink-2)]">{g.blurb}</p>
            </div>
            {g.group === "google" ? (
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((it) => (
                  <span key={it.key} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ob-card-2)] px-2.5 py-1 text-[11.5px] font-medium shadow-[inset_0_0_0_1px_var(--ob-line)]">
                    <PlatformLogo platform={it.key} className="h-3.5 w-3.5" /> {ACCESS_BY_KEY[it.key].short}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-auto flex items-center justify-between pt-1">
              <StatusPill status={g.status} label={STATUS_LABEL[g.status]} />
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--ob-blue)]">
                {g.status === "not_started" ? "Connect" : "Review"} <Icon name="arrow" size={15} />
              </span>
            </div>
          </button>
        ))}
      </div>

      <Sheet open={open !== null} onClose={() => setOpen(null)} label="Connection">
        {open === "meta" ? <MetaWizard /> : null}
        {open === "google" ? <GoogleWizard keys={plan.filter((p) => ACCESS_BY_KEY[p.key]?.group === "google").map((p) => p.key)} /> : null}
        {open === "website" ? <WebsiteWizard /> : null}
        {open === "domain" ? <DomainWizard /> : null}
        {open === "crm" ? <CrmWizard /> : null}
        {open === "whatsapp" ? <WhatsAppWizard /> : null}
        {open === "social" ? <SocialWizard /> : null}
        {open === "development" ? <RepositoryWizard /> : null}
        {open ? (
          <div className="mt-8 flex justify-end">
            <Btn variant="ghost" onClick={() => setOpen(null)}>
              Back to all connections
            </Btn>
          </div>
        ) : null}
      </Sheet>

      <StepFooter back="business" next="assets" nextLabel="Continue to Assets" go={go} />
    </div>
  );
}

/* ───────── Shared wizard pieces ───────── */

function WizardHeader({ platform, logo, title }: { platform: string; logo?: string; title?: string }) {
  const { status, required } = useAccess(platform);
  const p = ACCESS_BY_KEY[platform];
  return (
    <div className="pt-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="ob-logo-tile !h-14 !w-14">
          <PlatformLogo platform={logo ?? platform} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-bold tracking-[0.16em] ${required ? "text-[var(--ob-blue)]" : "text-[var(--ob-ink-3)]"}`}>{required ? "REQUIRED FOR YOUR ENGAGEMENT" : "OPTIONAL"}</p>
          <h2 className="ob-h2">{title ?? p.label}</h2>
        </div>
        <StatusPill status={status} label={STATUS_LABEL[status]} />
      </div>
      <div className="mt-5">
        <WhyWeNeedThis title={p.why.title}>{p.why.body}</WhyWeNeedThis>
      </div>
    </div>
  );
}

function Q({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-7">
      <p className="mb-3 text-[16px] font-semibold">{title}</p>
      {children}
    </div>
  );
}

function TextDetail({ platform, field, label, placeholder, help, type = "text" }: { platform: string; field: string; label: string; placeholder?: string; help?: string; type?: string }) {
  const { details, save } = useAccess(platform);
  const saved = String(details[field] ?? "");
  const id = `${platform}-${field}`;
  return (
    <Field label={label} help={help} htmlFor={id}>
      <input
        key={saved}
        id={id}
        className="ob-input"
        type={type}
        defaultValue={saved}
        placeholder={placeholder}
        onBlur={(e) => e.target.value !== saved && save({ details: { [field]: e.target.value } })}
      />
    </Field>
  );
}

/** The status actions every connection ends with. */
function AccessActions({ platform, doneLabel = "I’ve given Madvert access", allowNotRequired }: { platform: string; doneLabel?: string; allowNotRequired?: boolean }) {
  const { status, save, required, verified } = useAccess(platform);
  const [busy, setBusy] = useState(false);
  const set = async (s: AccessStatus) => {
    setBusy(true);
    await save({ status: s });
    setBusy(false);
  };
  if (status === "connected")
    return (
      <p className="ob-callout mt-7 flex items-center gap-2" data-tone="success">
        <Icon name="check" /> Connected and verified by Madvert{verified ? "" : ""}. Nothing else to do here.
      </p>
    );
  if (status === "pending")
    return (
      <div className="ob-callout mt-7 flex flex-wrap items-center justify-between gap-3" data-tone="info">
        <span className="flex items-center gap-2">
          <Icon name="clock" /> Thanks! Madvert will verify access and mark this connected.
        </span>
        <button type="button" className="text-[13px] font-semibold text-[var(--ob-blue)]" onClick={() => set("not_started")}>
          Undo
        </button>
      </div>
    );
  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Btn icon="check" disabled={busy} onClick={() => set("pending")}>
        {doneLabel}
      </Btn>
      {(!required || allowNotRequired) && status !== "not_required" ? (
        <Btn variant="ghost" disabled={busy} onClick={() => set("not_required")}>
          Not required for us
        </Btn>
      ) : null}
      {status === "not_required" || status === "kickoff" || status === "need_help" ? (
        <span className="flex items-center gap-2 text-[13.5px] text-[var(--ob-ink-2)]">
          <StatusPill status={status} label={STATUS_LABEL[status]} />
          <button type="button" className="font-semibold text-[var(--ob-blue)]" onClick={() => set("not_started")}>
            Change
          </button>
        </span>
      ) : null}
    </div>
  );
}

function Help({ platform, guide, label }: { platform: string; guide?: string | null; label?: string }) {
  const { save } = useAccess(platform);
  const p = ACCESS_BY_KEY[platform];
  return (
    <div className="mt-7">
      <NeedHelp
        guidePlatform={guide}
        taskKey={`access:${platform}`}
        taskLabel={label ?? `Give Madvert Labs ${p.label} access`}
        onKickoff={() => save({ status: "kickoff" })}
        onShowMe={() => document.getElementById(`guide-${platform}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />
    </div>
  );
}

function ConfigRequired({ what }: { what: string }) {
  return (
    <p className="ob-callout mt-4 flex items-start gap-2">
      <Icon name="info" className="mt-0.5 flex-none" />
      <span>
        <strong>Configuration required.</strong> Madvert’s {what} is being finalised. Your account manager will share it, or you can continue and complete this during kickoff.
      </span>
    </p>
  );
}

export function SecureCredential({ platform }: { platform: string }) {
  const { state, call } = usePortal();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ label: "", username: "", secret: "" });
  const [msg, setMsg] = useState("");
  const stored = state.secrets.filter((s) => s.platform === platform);
  if (!state.vaultEnabled && !stored.length) return null;
  return (
    <div className="mt-6 rounded-[18px] p-4 shadow-[inset_0_0_0_1px_var(--ob-line-2)]">
      <button type="button" className="flex w-full items-center gap-3 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--ob-navy)] text-[#00e5ff]">
          <Icon name="lock" size={17} />
        </span>
        <span className="flex-1">
          <span className="block text-[14px] font-semibold">Secure Credential (only if user access is impossible)</span>
          <span className="block text-[12.5px] text-[var(--ob-ink-3)]">Encrypted with AES-256. Never shown back, never emailed, never in reports.</span>
        </span>
        <Icon name="arrow" className={`transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {stored.length ? (
        <ul className="mt-3 grid gap-1.5">
          {stored.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-[13px] text-[var(--ob-ink-2)]">
              <Icon name="shield" size={14} className="text-[var(--ob-success)]" /> {s.label} · stored securely {new Date(s.createdAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : null}
      {open && state.vaultEnabled ? (
        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="What is this for?" htmlFor={`sc-l-${platform}`}>
              <input id={`sc-l-${platform}`} className="ob-input" placeholder="e.g. Hosting control panel" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
            </Field>
            <Field label="Username / login" htmlFor={`sc-u-${platform}`}>
              <input id={`sc-u-${platform}`} className="ob-input" autoComplete="off" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
            </Field>
          </div>
          <Field label="Password or key" htmlFor={`sc-s-${platform}`} help="Tip: create a separate login for Madvert rather than sharing your own, so you can revoke it later.">
            <input id={`sc-s-${platform}`} className="ob-input" type="password" autoComplete="new-password" value={f.secret} onChange={(e) => setF({ ...f, secret: e.target.value })} />
          </Field>
          {msg ? <p className="ob-callout" data-tone={msg.startsWith("Stored") ? "success" : "danger"}>{msg}</p> : null}
          <Btn
            icon="lock"
            disabled={!f.secret}
            onClick={async () => {
              const r = await call("secret", { platform, ...f });
              if (r.error) setMsg(r.error);
              else {
                setMsg("Stored securely. Only the Madvert delivery team can access it.");
                setF({ label: "", username: "", secret: "" });
              }
            }}
          >
            Store securely
          </Btn>
        </div>
      ) : null}
    </div>
  );
}

/* ───────── Meta ───────── */

function MetaWizard() {
  const { state } = usePortal();
  const { details, save } = useAccess("meta");
  const has = details.has_portfolio as string | undefined;
  const partnerId = state.integrations.metaPartnerId;
  return (
    <div>
      <WizardHeader platform="meta" title="Meta Business Access" />
      <Q title="Do you currently have a Meta Business Portfolio?">
        <Choices options={["Yes", "No", "Not Sure"]} value={has ?? null} onChange={(v) => save({ details: { has_portfolio: v as string } })} />
      </Q>

      {has === "Yes" ? (
        <>
          <div className="ob-navy mt-7 p-5 sm:p-6">
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#7fdcff]">PREFERRED METHOD · PARTNER ACCESS</p>
            <p className="mt-2 text-[15px] text-[#c4d1e2]">Add Madvert Labs as a partner in your Business Settings. You stay the owner and never share a password.</p>
            {partnerId ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8ea0b8]">Madvert Partner Business ID</span>
                <code className="rounded-xl bg-white/10 px-4 py-2 font-mono text-[18px] font-bold tracking-wider text-white">{partnerId}</code>
                <CopyButton value={partnerId} label="Copy ID" />
              </div>
            ) : (
              <ConfigRequired what="Partner Business ID" />
            )}
          </div>
          <Q title="Which assets will you share?">
            <Choices options={META_ASSETS.filter((a) => a !== "Commerce Account" || state.onboarding.ecommerce)} value={(details.assets as string[]) ?? []} onChange={(v) => save({ details: { assets: v } })} multi />
          </Q>
          <div className="mt-6 max-w-md">
            <TextDetail platform="meta" field="portfolio_id" label="Your Business Portfolio ID (optional)" placeholder="e.g. 1234567890" help="Helps us find your request quickly. Settings → Business info." />
          </div>
          <div className="mt-8" id="guide-meta">
            <p className="mb-4 text-[16px] font-semibold">Step by step</p>
            <GuideSteps platform="meta" />
          </div>
          <AccessActions platform="meta" doneLabel="I’ve added Madvert as a partner" />
        </>
      ) : null}

      {has === "No" ? (
        <>
          <div className="ob-callout mt-7" data-tone="success">
            <strong>No problem. We’ll help you set it up.</strong> Creating a business portfolio takes about five minutes and keeps your Page, Instagram and ads under your business, not
            a personal profile.
          </div>
          <div className="mt-6" id="guide-meta">
            <GuideSteps platform="meta_create" />
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Btn icon="check" onClick={() => save({ details: { has_portfolio: "Yes" } })}>
              I created it
            </Btn>
            <Btn variant="ghost" icon="calendar" onClick={() => save({ status: "kickoff", details: { create_help: true } })}>
              I need help during kickoff
            </Btn>
          </div>
        </>
      ) : null}

      {has === "Not Sure" ? (
        <div className="ob-callout mt-7" data-tone="info">
          Open <strong>business.facebook.com</strong> while logged in to Facebook. If you can choose a business and see <em>Settings</em>, you have a portfolio, so choose “Yes”. If it
          asks you to create one, choose “No”. If your marketing person handles Meta, send them this task below.
        </div>
      ) : null}

      <Help platform="meta" guide={guidePlatformFor("meta", details)} label="Give Madvert Labs partner access in Meta Business Settings" />
    </div>
  );
}

/* ───────── Google ───────── */

function GoogleWizard({ keys }: { keys: string[] }) {
  const [openKey, setOpenKey] = useState<string | null>(keys.length === 1 ? keys[0] : null);
  return (
    <div className="pt-4">
      <div className="flex items-center gap-4">
        <span className="ob-logo-tile !h-14 !w-14">
          <PlatformLogo platform="google" />
        </span>
        <h2 className="ob-h2">Google access</h2>
      </div>
      <p className="mt-3 text-[15px] text-[var(--ob-ink-2)]">Which accounts do you currently use? We only show the steps for the ones that apply to you. Preferred access: invite the Madvert email or manager account.</p>
      <div className="mt-6 grid gap-3">
        {keys.map((k) => (
          <GoogleItem key={k} k={k} open={openKey === k} onToggle={() => setOpenKey(openKey === k ? null : k)} />
        ))}
      </div>
    </div>
  );
}

function GoogleItem({ k, open, onToggle }: { k: string; open: boolean; onToggle: () => void }) {
  const { state } = usePortal();
  const { status, details, save, required } = useAccess(k);
  const p = ACCESS_BY_KEY[k];
  const uses = details.uses as string | undefined;
  const email = state.integrations.googleAccessEmail;
  return (
    <div className="ob-card p-4 sm:p-5">
      <button type="button" className="flex w-full items-center gap-4 text-left" onClick={onToggle} aria-expanded={open}>
        <span className="ob-logo-tile !h-11 !w-11">
          <PlatformLogo platform={k} className="!h-6 !w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15.5px] font-semibold">{p.label}</span>
          <span className="block text-[12.5px] text-[var(--ob-ink-3)]">{required ? "Required" : "Optional"} · {p.blurb}</span>
        </span>
        <StatusPill status={status} label={STATUS_LABEL[status]} />
        <Icon name="arrow" className={`transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open ? (
        <div className="mt-5 border-t border-[var(--ob-line)] pt-5">
          <WhyWeNeedThis title={p.why.title}>{p.why.body}</WhyWeNeedThis>
          <Q title={`Do you currently use ${p.label}?`}>
            <Choices
              options={["Yes, we use it", "We don’t have it"]}
              value={uses === "yes" ? "Yes, we use it" : uses === "no" ? "We don’t have it" : null}
              onChange={(v) => save({ details: { uses: v === "Yes, we use it" ? "yes" : "no" }, ...(v === "Yes, we use it" ? {} : { status: required ? "need_help" : "not_required" }) })}
            />
          </Q>
          {uses === "yes" ? (
            <>
              {k === "google_ads" ? (
                <div className="mt-6 max-w-md">
                  <TextDetail platform={k} field="customer_id" label="Your Google Ads Customer ID" placeholder="123-456-7890" help="We’ll send a link request from the Madvert manager account." />
                  {!state.integrations.googleAdsManagerId ? <ConfigRequired what="Google Ads manager account ID" /> : null}
                </div>
              ) : email ? (
                <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--ob-card-2)] p-4">
                  <span className="text-[13px] font-semibold text-[var(--ob-ink-3)]">Invite this email</span>
                  <code className="font-mono text-[15px] font-semibold">{email}</code>
                  <CopyButton value={email} />
                </div>
              ) : (
                <ConfigRequired what="Google access email" />
              )}
              <div className="mt-6" id={`guide-${k}`}>
                <GuideSteps platform={k} />
              </div>
              <AccessActions platform={k} doneLabel={k === "google_ads" ? "I’ve shared my Customer ID / accepted the link" : "I’ve sent the invite"} />
              <Help platform={k} guide={k} />
            </>
          ) : uses === "no" ? (
            <p className="ob-callout mt-6" data-tone="info">
              {required ? "No problem. Madvert will set this up for you during onboarding." : "Noted. We’ll mark this as not required."}{" "}
              <button type="button" className="font-semibold text-[var(--ob-blue)]" onClick={() => save({ details: { uses: null }, status: "not_started" })}>
                Change
              </button>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ───────── Website ───────── */

function WebsiteWizard() {
  const { state } = usePortal();
  const { details, save } = useAccess("website");
  const platform = details.platform as string | undefined;
  const guide = guidePlatformFor("website", details);
  const email = state.integrations.websiteAccessEmail;
  const ask: Record<string, string> = {
    WordPress: "Create an Administrator user for Madvert.",
    Shopify: "Approve a collaborator request from Madvert.",
    Webflow: "Invite Madvert to your Workspace or site as a guest.",
    Wix: "Invite Madvert as a site collaborator.",
    Squarespace: "Invite Madvert as a contributor.",
    Custom: "Developer or admin access to code, hosting and CMS.",
    "Next.js": "Repository and hosting access (e.g. GitHub + Vercel).",
  };
  return (
    <div>
      <WizardHeader platform="website" />
      <div className="mt-7 max-w-lg">
        <TextDetail platform="website" field="url" label="Website address" placeholder="https://" type="url" />
      </div>
      <Q title="What platform is your website built on?">
        <Choices options={WEBSITE_PLATFORMS} value={platform ?? null} onChange={(v) => save({ details: { platform: v as string } })} />
      </Q>
      {platform && ask[platform] ? (
        <div className="ob-callout mt-6 flex flex-wrap items-center gap-3" data-tone="info">
          <strong>What we need:</strong> {ask[platform]}
          {email && platform !== "Shopify" ? (
            <span className="inline-flex items-center gap-2">
              <code className="font-semibold">{email}</code>
              <CopyButton value={email} />
            </span>
          ) : null}
        </div>
      ) : null}
      {platform === "Shopify" ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <TextDetail platform="website" field="shopify_store" label="Store address" placeholder="your-store.myshopify.com" />
          <TextDetail platform="website" field="shopify_code" label="Collaborator request code (if set)" placeholder="4 digits" />
        </div>
      ) : null}
      {platform === "Custom" || platform === "Next.js" ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <TextDetail platform="website" field="hosting" label="Where is it hosted?" placeholder="Vercel, AWS, cPanel…" />
          <TextDetail platform="website" field="repo" label="Code repository" placeholder="GitHub / GitLab URL" />
          <TextDetail platform="website" field="developer" label="Who maintains it?" placeholder="Name / agency / email" />
          <TextDetail platform="website" field="cms" label="CMS (if any)" placeholder="Sanity, Strapi, none…" />
        </div>
      ) : null}
      {platform === "Other" || platform === "I Don't Know" ? (
        <p className="ob-callout mt-6" data-tone="info">
          No problem. Share the website address above and we’ll identify the platform. If someone built it for you, send them this task and they can grant access directly.
        </p>
      ) : null}
      {guide ? (
        <div className="mt-8" id="guide-website">
          <p className="mb-4 text-[16px] font-semibold">Step by step · {platform}</p>
          <GuideSteps platform={guide} />
        </div>
      ) : null}
      {platform ? <AccessActions platform="website" doneLabel={platform === "Shopify" ? "Ready for the collaborator request" : "I’ve given Madvert access"} /> : null}
      {platform && platform !== "Shopify" ? <SecureCredential platform="website" /> : null}
      <Help platform="website" guide={guide} label="Give Madvert Labs website access" />
    </div>
  );
}

/* ───────── Domain / DNS ───────── */

function DomainWizard() {
  const { state } = usePortal();
  const { details, save } = useAccess("domain");
  const reg = details.registrar as string | undefined;
  const guide = guidePlatformFor("domain", details);
  return (
    <div>
      <WizardHeader platform="domain" />
      <div className="mt-7 max-w-lg">
        <TextDetail platform="domain" field="domain" label="Domain name" placeholder="yourbusiness.com" />
      </div>
      <Q title="Who manages your domain?">
        <Choices options={REGISTRARS} value={reg ?? null} onChange={(v) => save({ details: { registrar: v as string } })} />
      </Q>
      {reg ? (
        <div className="ob-callout mt-6" data-tone="info">
          <strong>We request:</strong> registrar access and DNS management access, through invite or delegated access where your provider supports it.
          {state.integrations.dnsAccessEmail ? (
            <span className="mt-2 flex flex-wrap items-center gap-2">
              Invite <code className="font-semibold">{state.integrations.dnsAccessEmail}</code> <CopyButton value={state.integrations.dnsAccessEmail} />
            </span>
          ) : null}
        </div>
      ) : null}
      {reg === "I Don't Know" ? (
        <p className="ob-callout mt-4">That’s common. Whoever set up your website or email usually knows. Send them this task and they can grant DNS access without involving you.</p>
      ) : null}
      {reg === "Other" ? (
        <div className="mt-6 max-w-lg">
          <TextDetail platform="domain" field="registrar_other" label="Provider name" />
        </div>
      ) : null}
      {guide ? (
        <div className="mt-8" id="guide-domain">
          <GuideSteps platform={guide} />
        </div>
      ) : null}
      {reg ? <AccessActions platform="domain" /> : null}
      <Help platform="domain" guide={guide} label="Give Madvert Labs DNS access for our domain" />
    </div>
  );
}

/* ───────── CRM ───────── */

function CrmWizard() {
  const { state } = usePortal();
  const { details, save } = useAccess("crm");
  const crm = details.crm as string | undefined;
  const guide = guidePlatformFor("crm", details);
  return (
    <div>
      <WizardHeader platform="crm" />
      <Q title="Do you currently use a CRM?">
        <Choices
          options={CRMS}
          value={crm ?? null}
          onChange={(v) => save({ details: { crm: v as string }, ...(v === "None" ? { status: "not_required" as AccessStatus } : {}) })}
        />
      </Q>
      {crm === "None" ? (
        <div className="ob-callout mt-6" data-tone="success">
          <strong>No CRM yet? That’s okay.</strong> Madvert can recommend or build the appropriate lead management setup based on your engagement.
        </div>
      ) : null}
      {crm === "Spreadsheet" ? (
        <p className="ob-callout mt-6" data-tone="info">
          Share the spreadsheet with {state.integrations.crmAccessEmail || "your Madvert account manager"} as an editor, or upload a copy in Assets → Marketing materials. We’ll recommend the right
          next step.
        </p>
      ) : null}
      {crm && crm !== "None" && crm !== "Spreadsheet" && state.integrations.crmAccessEmail ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--ob-card-2)] p-4">
          <span className="text-[13px] font-semibold text-[var(--ob-ink-3)]">Invite this email as an admin user</span>
          <code className="font-mono text-[15px] font-semibold">{state.integrations.crmAccessEmail}</code>
          <CopyButton value={state.integrations.crmAccessEmail} />
        </div>
      ) : null}
      {guide ? (
        <div className="mt-8" id="guide-crm">
          <GuideSteps platform={guide} />
        </div>
      ) : null}
      {crm && crm !== "None" ? <AccessActions platform="crm" doneLabel={crm === "Spreadsheet" ? "I’ve shared it" : "I’ve given Madvert access"} /> : null}
      {crm === "Custom CRM" ? <SecureCredential platform="crm" /> : null}
      {crm !== "None" ? <Help platform="crm" guide={guide} label="Give Madvert Labs CRM access" /> : null}
    </div>
  );
}

/* ───────── WhatsApp ───────── */

const WA_USES = ["Customer communication", "Lead follow-up", "Appointment confirmations", "Sales automation", "Notifications", "Marketing workflows where legally permitted"];

function WhatsAppWizard() {
  const { details, save } = useAccess("whatsapp");
  const has = details.has_number as string | undefined;
  return (
    <div>
      <WizardHeader platform="whatsapp" title="WhatsApp Business" />
      <Q title="Does your business currently have a dedicated WhatsApp Business number?">
        <Choices options={["Yes", "No", "Not Sure"]} value={has ?? null} onChange={(v) => save({ details: { has_number: v as string, plan: null } })} />
      </Q>
      {has === "Yes" ? (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-[140px_1fr]">
            <TextDetail platform="whatsapp" field="country_code" label="Country code" placeholder="+971" />
            <TextDetail platform="whatsapp" field="number" label="WhatsApp Business number" placeholder="50 123 4567" type="tel" />
          </div>
          <Q title="Is this currently connected to:">
            <Choices
              options={["WhatsApp Business App", "WhatsApp Business Platform / API", "GoHighLevel", "Another CRM", "Not Sure"]}
              value={(details.connected_to as string) ?? null}
              onChange={(v) => save({ details: { connected_to: v as string } })}
            />
          </Q>
          <div className="mt-6 rounded-2xl bg-[var(--ob-card-2)] p-5">
            <p className="text-[14px] font-semibold">Madvert may use your business WhatsApp number for:</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {WA_USES.map((u) => (
                <li key={u} className="flex items-center gap-2 text-[14px] text-[var(--ob-ink-2)]">
                  <Icon name="check" size={15} className="text-[var(--ob-success)]" /> {u}
                </li>
              ))}
            </ul>
          </div>
          <AccessActions platform="whatsapp" doneLabel="Save WhatsApp details" />
        </>
      ) : null}
      {has === "No" ? (
        <>
          <div className="ob-navy mt-7 p-5 sm:p-6">
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#7fdcff]">RECOMMENDATION</p>
            <p className="mt-2 text-[18px] font-semibold text-white">CREATE A DEDICATED BUSINESS WHATSAPP NUMBER</p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#b4c2d6]">
              We recommend using a dedicated WhatsApp Business number rather than a personal number. This allows your business communication and future automations to remain
              organised and scalable.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "I’ll create one before kickoff", status: "kickoff" as AccessStatus, plan: "create" },
              { label: "Help me set this up", status: "need_help" as AccessStatus, plan: "help" },
              { label: "Not required for this engagement", status: "not_required" as AccessStatus, plan: "none" },
            ].map((o) => (
              <button key={o.plan} type="button" className="ob-choice" aria-pressed={details.plan === o.plan} onClick={() => save({ status: o.status, details: { plan: o.plan } })}>
                <span className="tick">{details.plan === o.plan ? <Icon name="check" size={13} stroke={2.6} /> : null}</span>
                {o.label}
              </button>
            ))}
          </div>
          {details.plan === "create" ? (
            <div className="mt-6">
              <GuideSteps platform="whatsapp" />
            </div>
          ) : null}
        </>
      ) : null}
      {has === "Not Sure" ? (
        <p className="ob-callout mt-6" data-tone="info">
          Open WhatsApp on the business phone. If the app icon shows a “B” or Settings shows “Business tools”, it is a WhatsApp Business number, so choose “Yes”. If it is the same
          number you use personally, we recommend a dedicated one.
        </p>
      ) : null}
      <Help platform="whatsapp" guide={has === "No" ? "whatsapp" : null} label="Share our WhatsApp Business details with Madvert" />
    </div>
  );
}

/* ───────── Social ───────── */

function SocialWizard() {
  const { state, call } = usePortal();
  const [rows, setRows] = useState(state.social.length ? state.social : [{ platform: "Instagram", url: "", username: "", accessStatus: "shared" as const }]);
  const [saved, setSaved] = useState(false);
  const { status } = useAccess("social");
  const update = (i: number, patch: Partial<(typeof rows)[number]>) => {
    setSaved(false);
    setRows(rows.map((r, n) => (n === i ? { ...r, ...patch } : r)));
  };
  const persist = async (done?: boolean) => {
    await call("social", { profiles: rows, done });
    setSaved(true);
  };
  return (
    <div>
      <WizardHeader platform="social" title="Social media profiles" />
      <p className="mt-6 text-[15px] text-[var(--ob-ink-2)]">Add all existing profiles. We prefer platform permissions (e.g. Meta partner access) and do not ask for passwords.</p>
      <div className="mt-5 grid gap-3">
        {rows.map((r, i) => (
          <div key={i} className="ob-card grid gap-3 p-4 sm:grid-cols-[150px_1fr_170px_160px_auto] sm:items-end">
            <Field label="Platform" htmlFor={`soc-p-${i}`}>
              <select id={`soc-p-${i}`} className="ob-select" value={r.platform} onChange={(e) => update(i, { platform: e.target.value })}>
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Profile URL" htmlFor={`soc-u-${i}`}>
              <input id={`soc-u-${i}`} className="ob-input" inputMode="url" placeholder="https://" value={r.url} onChange={(e) => update(i, { url: e.target.value })} />
            </Field>
            <Field label="Business username" htmlFor={`soc-n-${i}`}>
              <input id={`soc-n-${i}`} className="ob-input" placeholder="@yourbusiness" value={r.username} onChange={(e) => update(i, { username: e.target.value })} />
            </Field>
            <Field label="Access status" htmlFor={`soc-s-${i}`}>
              <select id={`soc-s-${i}`} className="ob-select" value={r.accessStatus} onChange={(e) => update(i, { accessStatus: e.target.value as "shared" })}>
                <option value="shared">Access Shared</option>
                <option value="need_help">Need Help</option>
                <option value="not_required">Not Required</option>
              </select>
            </Field>
            <button type="button" className="ob-icon-btn mb-2" aria-label="Remove profile" onClick={() => (setSaved(false), setRows(rows.filter((_, n) => n !== i)))}>
              <Icon name="trash" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Btn variant="ghost" icon="plus" onClick={() => setRows([...rows, { platform: "Facebook", url: "", username: "", accessStatus: "shared" }])}>
          ADD SOCIAL PROFILE
        </Btn>
        <Btn variant="ghost" icon="check" onClick={() => persist()}>
          {saved ? "Saved" : "Save profiles"}
        </Btn>
        <Btn icon="check" onClick={() => persist(status === "not_started")}>
          {status === "not_started" ? "Save and mark done" : "Save"}
        </Btn>
      </div>
      <Help platform="social" guide={null} label="Add our social profiles and share access with Madvert" />
    </div>
  );
}

/* ───────── Repository / hosting ───────── */

function RepositoryWizard() {
  return (
    <div>
      <WizardHeader platform="repository" />
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <TextDetail platform="repository" field="repo_url" label="Repository URL (if existing)" placeholder="https://github.com/…" />
        <TextDetail platform="repository" field="hosting" label="Hosting provider" placeholder="Vercel, AWS, Netlify, cPanel…" />
        <TextDetail platform="repository" field="docs" label="Technical documentation link" placeholder="Notion, Drive, Confluence…" />
        <TextDetail platform="repository" field="integrations" label="Integrations in use" placeholder="Stripe, Zapier, ERP…" />
      </div>
      <div className="mt-8" id="guide-repository">
        <GuideSteps platform="website_custom" />
      </div>
      <AccessActions platform="repository" doneLabel="I’ve invited Madvert" allowNotRequired />
      <SecureCredential platform="repository" />
      <Help platform="repository" guide="website_custom" label="Give Madvert Labs repository and hosting access" />
    </div>
  );
}

export { DelegateDialog };

/** One connection on its own (used by delegated task links). */
export function WizardFor({ platform }: { platform: string }) {
  switch (ACCESS_BY_KEY[platform]?.group) {
    case "meta":
      return <MetaWizard />;
    case "google":
      return <GoogleWizard keys={[platform]} />;
    case "website":
      return <WebsiteWizard />;
    case "domain":
      return <DomainWizard />;
    case "crm":
      return <CrmWizard />;
    case "whatsapp":
      return <WhatsAppWizard />;
    case "social":
      return <SocialWizard />;
    case "development":
      return <RepositoryWizard />;
    default:
      return null;
  }
}
