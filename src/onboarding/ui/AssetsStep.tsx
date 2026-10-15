"use client";

import { useState } from "react";
import { assetSectionDone } from "@/onboarding/progress";
import { ASSET_SECTION_BY_KEY, PROOF_LINKS } from "@/onboarding/template/assets";
import { Tile3D } from "./art3d";
import { DelegateDialog } from "./Guides";
import { Choices, Field, Icon, StatusPill, WhyWeNeedThis } from "./kit";
import type { View } from "./PortalApp";
import { StepFooter, StepHeader } from "./StepLayout";
import { progressInputFrom, usePortal } from "./store";
import { Uploader } from "./Uploader";

const SECTION_ICON: Record<string, [string, "blue" | "cyan" | "navy" | "violet"]> = {
  logos: ["palette", "blue"],
  brand_guidelines: ["book", "violet"],
  brand_assets: ["camera", "cyan"],
  marketing: ["megaphone", "blue"],
  social_proof: ["star", "violet"],
  business_media: ["film", "navy"],
};

const ORDER = ["logos", "brand_guidelines", "brand_assets", "marketing", "social_proof", "business_media"];

export function AssetsStep({ go }: { go: (v: View) => void }) {
  const { state, answers } = usePortal();
  const input = progressInputFrom(state, answers);
  const req = Object.fromEntries(state.template.assets.map((a) => [a.key, a.required]));
  return (
    <div>
      <StepHeader
        phase="assets"
        title="GIVE US WHAT"
        accent="ALREADY EXISTS"
        intro={
          <>
            Do not worry about organising everything perfectly. Upload what you have and our team will take it from there.
            <span className="mt-1 block text-[14.5px] text-[var(--ob-ink-3)]">Already have a cloud folder? Paste the link instead of re-uploading hundreds of files.</span>
          </>
        }
      />
      <nav className="mb-6 flex gap-2 overflow-x-auto pb-1" aria-label="Asset sections">
        {ORDER.map((k) => {
          const done = assetSectionDone(input, k);
          return (
            <button key={k} type="button" className="ob-chip flex-none" aria-pressed={done} onClick={() => document.getElementById(`asset-${k}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              {done ? <Icon name="check" size={14} stroke={2.4} /> : null}
              {ASSET_SECTION_BY_KEY[k].title}
            </button>
          );
        })}
      </nav>
      <div className="grid gap-6">
        {ORDER.map((k) => (
          <AssetCard key={k} k={k} required={Boolean(req[k])} done={assetSectionDone(input, k)} />
        ))}
      </div>
      <StepFooter back="access" next="offer" nextLabel="Continue to Strategy" go={go} />
    </div>
  );
}

export function AssetCard({ k, required, done }: { k: string; required: boolean; done: boolean }) {
  const { answers, setAnswer, state, mode } = usePortal();
  const [delegate, setDelegate] = useState(false);
  const section = ASSET_SECTION_BY_KEY[k];
  const sk = `assets.${k}`;
  const a = answers[sk] ?? {};
  const set = (key: string, v: string | boolean | null) => setAnswer(sk, key, v);
  const count = state.assets.filter((x) => section.categories.some((c) => c.key === x.category)).length;

  return (
    <section id={`asset-${k}`} className="ob-card ob-card-pad scroll-mt-40">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-2xl gap-4">
          <Tile3D icon={SECTION_ICON[k]?.[0] ?? "file"} size={52} tone={SECTION_ICON[k]?.[1] ?? "blue"} />
          <div>
          <p className={`text-[11px] font-bold tracking-[0.16em] ${required ? "text-[var(--ob-blue)]" : "text-[var(--ob-ink-3)]"}`}>{required ? "REQUESTED" : "OPTIONAL"}</p>
          <h2 className="ob-h2 mt-1">{k === "social_proof" ? "SOCIAL PROOF" : k === "business_media" ? "BUSINESS MEDIA LIBRARY" : section.title}</h2>
          <p className="mt-2 text-[15px] text-[var(--ob-ink-2)]">{section.intro}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={done ? "completed" : count ? "in_progress" : "not_started"} label={done ? "Done" : count ? `${count} added` : undefined} />
          {mode.kind === "client" ? <button type="button" className="ob-icon-btn" title="Send this to someone" aria-label="Send this task to someone" onClick={() => setDelegate(true)}>
            <Icon name="send" />
          </button> : null}
        </div>
      </div>

      {k === "logos" ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {section.hints?.map((h) => (
            <span key={h} className="rounded-full bg-[var(--ob-card-2)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--ob-ink-2)] shadow-[inset_0_0_0_1px_var(--ob-line)]">
              {h}
            </span>
          ))}
        </div>
      ) : null}

      {k === "brand_guidelines" ? (
        <>
          <Field label="Do you have existing brand guidelines?">
            <Choices options={["Yes", "No"]} value={(a.has_guidelines as string) ?? null} onChange={(v) => set("has_guidelines", v as string)} />
          </Field>
          {a.has_guidelines === "Yes" ? (
            <div className="mt-6">
              <p className="mb-3 text-[15px] font-semibold">Upload Brand Guidelines / Brand Folder</p>
              <p className="mb-4 text-[13px] text-[var(--ob-ink-3)]">PDF, ZIP, Drive link or folder link.</p>
              <Uploader section={section} single={false} />
            </div>
          ) : a.has_guidelines === "No" ? (
            <p className="ob-callout mt-5" data-tone="success">
              No problem. We’ll work from your logo and what you share below.
            </p>
          ) : null}
        </>
      ) : null}

      {k === "social_proof" ? (
        <div className="mb-6 grid gap-6">
          <Field label="Do you have customer reviews or testimonials we can use?">
            <Choices options={["Yes", "No", "Some"]} value={(a.has_reviews as string) ?? null} onChange={(v) => set("has_reviews", v as string)} />
          </Field>
          {a.has_reviews && a.has_reviews !== "No" ? (
            <div className="grid gap-5 sm:grid-cols-3">
              {PROOF_LINKS.map((l) => (
                <Field key={l.key} label={l.label} htmlFor={`pl-${l.key}`}>
                  <input id={`pl-${l.key}`} className="ob-input" inputMode="url" placeholder="https://" value={(a[l.key] as string) ?? ""} onChange={(e) => set(l.key, e.target.value)} />
                </Field>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {k === "business_media" ? (
        <div className="mb-6">
          <WhyWeNeedThis title="Even imperfect footage is useful">
            Factory, office, team, behind the scenes, installation, before/after, events, raw phone footage. Real footage makes ads feel trustworthy; our studio turns it into content.
          </WhyWeNeedThis>
        </div>
      ) : null}

      {k !== "brand_guidelines" && !(k === "social_proof" && a.has_reviews === "No") ? <Uploader section={section} /> : null}

      {k === "social_proof" && a.has_reviews && a.has_reviews !== "No" ? (
        <div className="mt-6">
          <Field label="Are we allowed to use these assets publicly in marketing?" required>
            <Choices options={["Yes", "No", "Ask before use"]} value={(a.permission as string) ?? null} onChange={(v) => set("permission", v as string)} />
          </Field>
        </div>
      ) : null}

      {k !== "brand_guidelines" && k !== "social_proof" ? (
        <label className="mt-5 flex cursor-pointer items-center gap-3 text-[14px] text-[var(--ob-ink-2)]">
          <input type="checkbox" className="h-5 w-5 accent-[#00a2ff]" checked={a.none === true} onChange={(e) => set("none", e.target.checked)} />
          We don’t have {k === "logos" ? "logo files" : "any of these"} right now
        </label>
      ) : null}

      <DelegateDialog open={delegate} onClose={() => setDelegate(false)} taskKey={`asset:${k}`} taskLabel={`Upload ${section.title.toLowerCase()} for Madvert Labs`} />
    </section>
  );
}
