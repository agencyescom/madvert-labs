"use client";

import { useState } from "react";
import { offerText, type GeneratedOffer } from "@/onboarding/offer/generate";
import { Btn, CopyButton, GlowMark, Icon } from "../kit";

/** The generated offer, presented as a premium one-page offer. Used in the workshop, the public builder and shared links. */
export function OfferCard({
  offer,
  onShare,
  shareUrl,
  readOnly = false,
  footer,
}: {
  offer: GeneratedOffer;
  onShare?: () => Promise<string | null>;
  shareUrl?: string | null;
  readOnly?: boolean;
  footer?: React.ReactNode;
}) {
  const [h, setH] = useState(0);
  const [url, setUrl] = useState<string | null>(shareUrl ?? null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="ob-offer grid gap-5">
      <article className="ob-navy ob-offer-card relative overflow-hidden">
        <div className="ob-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="ob-aurora-local" aria-hidden="true" />
        <div className="relative p-6 sm:p-10 lg:p-14">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-[#9ff0ff]">
              <Icon name="sparkle" size={13} /> {offer.name.toUpperCase()}
            </span>
            <GlowMark size={44} />
          </div>
          <h2 className="ob-display ob-rise mt-8 max-w-4xl text-[clamp(30px,4.6vw,58px)] text-white" key={h}>
            {offer.headlines[h]}
          </h2>
          <p className="ob-rise mt-5 max-w-3xl text-[17px] leading-relaxed text-[#c4d1e2]" style={{ animationDelay: "80ms" }}>
            {offer.subheadline}
          </p>
          {!readOnly ? (
            <div className="mt-5 flex flex-wrap gap-2 print:hidden">
              {offer.headlines.map((_, n) => (
                <button key={n} type="button" onClick={() => setH(n)} className={`rounded-full px-3 py-1 text-[12px] font-semibold ${n === h ? "bg-[#00b4ff] text-[#03101d]" : "bg-white/10 text-[#c4d1e2]"}`}>
                  Headline {n + 1}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
            <div>
              <p className="text-[11px] font-bold tracking-[0.22em] text-[#4fd8ff]">WHAT YOU GET</p>
              <div className="mt-4 grid">
                {offer.stack.map((s, n) => (
                  <div key={s.label + n} className="ob-rise" style={{ animationDelay: `${140 + n * 90}ms` }}>
                    {n > 0 ? <div className="ob-stack-plus">+</div> : null}
                    <div className="ob-stack-item">
                      <span className="w-24 flex-none text-[10.5px] font-bold tracking-[0.16em] text-[#4fd8ff]">{s.label}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15.5px] font-semibold text-white">{s.title}</span>
                        <span className="block text-[13px] text-[#9fb0c6]">{s.detail}</span>
                      </span>
                      {s.value ? <span className="text-[14px] font-semibold text-[#9ff0ff]">{s.value}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
              {offer.totalValue || offer.price ? (
                <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2 rounded-2xl bg-white/[0.06] p-5">
                  {offer.totalValue ? (
                    <span>
                      <span className="block text-[11px] font-bold tracking-[0.18em] text-[#7f90a8]">TOTAL VALUE</span>
                      <span className={`text-[26px] font-bold ${offer.price ? "text-[#7f90a8] line-through decoration-[#00e5ff]/70" : "text-white"}`}>{offer.totalValue}</span>
                    </span>
                  ) : null}
                  {offer.price ? (
                    <span>
                      <span className="block text-[11px] font-bold tracking-[0.18em] text-[#4fd8ff]">YOUR INVESTMENT</span>
                      <span className="bg-[linear-gradient(95deg,#3db4ff,#00e5ff)] bg-clip-text text-[34px] font-bold text-transparent">{offer.price}</span>
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="grid content-start gap-4">
              <div className="rounded-2xl bg-white/[0.05] p-5">
                <p className="text-[11px] font-bold tracking-[0.2em] text-[#4fd8ff]">THE PROMISE</p>
                <p className="mt-2 text-[15px] leading-relaxed text-white">{offer.promise}</p>
              </div>
              {offer.guarantee ? (
                <div className="flex items-center gap-4 rounded-2xl bg-[linear-gradient(135deg,rgb(0_180_255/0.25),rgb(0_229_255/0.08))] p-5 shadow-[inset_0_0_0_1px_rgb(0_229_255/0.35)]">
                  <span className="ob-seal" aria-hidden="true">
                    <Icon name="shield" size={22} />
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold tracking-[0.2em] text-[#9ff0ff]">GUARANTEE</span>
                    <span className="block text-[15px] font-semibold text-white">{offer.guarantee}</span>
                  </span>
                </div>
              ) : null}
              <div className="rounded-2xl bg-white/[0.05] p-5">
                <p className="text-[11px] font-bold tracking-[0.2em] text-[#4fd8ff]">PERFECT FOR</p>
                <ul className="mt-2 grid gap-1.5">
                  {offer.forWho.map((f) => (
                    <li key={f} className="flex gap-2 text-[14px] text-[#dbe5f1]">
                      <Icon name="check" size={15} className="mt-0.5 flex-none text-[#00e5ff]" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              {offer.proof.length ? (
                <div className="rounded-2xl bg-white/[0.05] p-5">
                  <p className="text-[11px] font-bold tracking-[0.2em] text-[#4fd8ff]">PROOF</p>
                  <ul className="mt-2 grid gap-1.5">
                    {offer.proof.map((f) => (
                      <li key={f} className="flex gap-2 text-[14px] text-[#dbe5f1]">
                        <Icon name="sparkle" size={14} className="mt-0.5 flex-none text-[#00e5ff]" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          {offer.objections.length ? (
            <div className="mt-10">
              <p className="text-[11px] font-bold tracking-[0.22em] text-[#4fd8ff]">QUESTIONS PEOPLE ASK</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {offer.objections.map((o) => (
                  <div key={o.q} className="rounded-2xl bg-white/[0.05] p-4">
                    <p className="text-[14px] font-semibold text-white">“{o.q}”</p>
                    <p className="mt-1 text-[13.5px] text-[#b4c2d6]">{o.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-10 flex flex-col items-start gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {offer.urgency ? <p className="text-[13px] font-semibold text-[#ffd27a]">{offer.urgency}</p> : null}
              <p className="mt-1 max-w-xl text-[13.5px] italic text-[#9fb0c6]">{offer.ps}</p>
            </div>
            <span className="ob-btn ob-btn-primary ob-btn-lg pointer-events-none">
              {offer.cta} <Icon name="arrow" className="arrow" />
            </span>
          </div>
        </div>
      </article>

      {!readOnly ? (
        <div className="ob-card flex flex-wrap items-center gap-2 p-3 print:hidden">
          <CopyButton value={offerText({ ...offer, headlines: [offer.headlines[h], ...offer.headlines.filter((_, n) => n !== h)] })} label="Copy offer text" />
          <Btn variant="ghost" size="xs" icon="download" onClick={() => window.print()}>
            Save as PDF
          </Btn>
          {onShare ? (
            url ? (
              <span className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[var(--ob-card-2)] px-3 py-1.5">
                <code className="min-w-0 flex-1 truncate text-[12px]">{url}</code>
                <CopyButton value={url} label="Copy link" />
              </span>
            ) : (
              <Btn
                size="xs"
                icon="link"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setUrl(await onShare());
                  setBusy(false);
                }}
              >
                {busy ? "Creating link…" : "Create share link"}
              </Btn>
            )
          ) : null}
          {footer}
        </div>
      ) : null}
    </div>
  );
}
