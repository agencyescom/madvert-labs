"use client";

import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { generateOffer, type GeneratedOffer, type OfferInput } from "@/onboarding/offer/generate";
import { BONUS_IDEAS, GUARANTEE_TYPES, OBJECTION_CATEGORIES } from "@/onboarding/template/questions";
import { Art3D } from "../art3d";
import { Bar, Btn, Chips, Field, Icon, ThemeSwitch, Waves } from "../kit";
import { OfferCard } from "./OfferCard";

const EMPTY: OfferInput = { business: "", product: "", audience: "", outcome: "", problem: "", bonuses: [], objections: [] };
const EXAMPLE: OfferInput = {
  business: "Atelier Interiors",
  offerName: "The Turnkey Villa Programme",
  product: "Full villa interior design and fit-out, managed end to end",
  audience: "Villa owners in Dubai who want a finished home without managing contractors",
  outcome: "A move-in ready luxury villa",
  problem: "chasing five contractors, delays and budget surprises",
  timeframe: "12 weeks",
  price: "AED 180,000",
  coreValue: "AED 220,000",
  uniqueness: "One team designs, sources and builds, with a fixed price agreed before work starts",
  proof: "14 years in business\n320 homes completed\nRated 4.9 on Google from 140 reviews",
  guarantee: "Finished on the agreed date or we pay your rent for every week we are late",
  speed: "3D concept within 7 days",
  effort: "One weekly 20-minute call is all we need from you",
  bonuses: [
    { name: "Photorealistic 3D walkthrough", value: "AED 6,000" },
    { name: "Furniture and art styling", value: "AED 9,500" },
  ],
  objections: ["Too expensive", "Already have a contractor", "Don't trust the timeline"],
  scarcity: "We take on four villas per quarter",
};

const STEPS = [
  { title: "Your business", art: "business" as const },
  { title: "Your customer", art: "access" as const },
  { title: "Make it irresistible", art: "offer" as const },
  { title: "Value & bonuses", art: "assets" as const },
];

const KEY = "mv-offer-builder";

export function OfferBuilder({ bookingUrl }: { bookingUrl: string }) {
  const [v, setV] = useState<OfferInput>(EMPTY);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"form" | "building" | "done">("form");
  const [bonus, setBonus] = useState({ name: "", value: "" });
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // Restoring this browser's own draft after mount.
      if (saved) setV({ ...EMPTY, ...JSON.parse(saved) });
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch {}
  }, [v]);
  const set = (k: keyof OfferInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });
  const offer = useMemo<GeneratedOffer>(() => generateOffer(v), [v]);
  const ready = Boolean(v.product && v.outcome && v.audience);
  const filled = ["business", "product", "audience", "outcome", "problem", "timeframe", "price", "uniqueness", "proof", "guarantee", "speed"].filter((k) => String(v[k as keyof OfferInput] ?? "").trim()).length;

  const build = () => {
    setPhase("building");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setPhase("done"), 1900);
  };

  const share = async () => {
    const r = await fetch("/api/offer/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: v }) });
    const j = (await r.json()) as { url?: string; error?: string };
    if (j.error) alert(j.error);
    return j.url ?? null;
  };

  const input = (k: keyof OfferInput, label: string, placeholder: string, area = false, help?: string) => (
    <Field label={label} help={help} htmlFor={`ob-${k}`}>
      {area ? (
        <textarea id={`ob-${k}`} className="ob-textarea !min-h-[92px]" placeholder={placeholder} value={String(v[k] ?? "")} onChange={set(k)} />
      ) : (
        <input id={`ob-${k}`} className="ob-input" placeholder={placeholder} value={String(v[k] ?? "")} onChange={set(k)} />
      )}
    </Field>
  );

  return (
    <div className="ob">
      <Waves />
      <header className="ob-header">
        <div className="ob-wrap flex h-16 items-center justify-between">
          <a href="https://madvertlabs.com" aria-label="Madvert Labs">
            <Logo href={null} height={24} />
          </a>
          <div className="flex items-center gap-2">
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="ob-btn ob-btn-ghost ob-btn-xs hidden sm:inline-flex">
              Book a strategy call
            </a>
            <ThemeSwitch />
          </div>
        </div>
      </header>

      <main className="ob-wrap relative pb-24 pt-8 sm:pt-12">
        {phase === "form" ? (
          <>
            <section className="ob-enter grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="ob-eyebrow">Free Offer Builder · Madvert Labs</p>
                <h1 className="ob-display mt-5 text-[clamp(36px,5.6vw,72px)]">
                  Build an offer people <span className="ob-grad-text">actually want.</span>
                </h1>
                <p className="ob-lead mt-5 max-w-2xl">
                  Answer a few questions about your business. One click turns them into a complete offer: headline, value stack, bonuses, guarantee and answers to objections. Free, and
                  yours to share.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Btn variant="ghost" icon="sparkle" onClick={() => setV(EXAMPLE)}>
                    Fill with an example
                  </Btn>
                  {filled ? (
                    <Btn variant="ghost" icon="refresh" onClick={() => (setV(EMPTY), setStep(0))}>
                      Start over
                    </Btn>
                  ) : null}
                </div>
              </div>
              <div className="relative hidden justify-center lg:flex">
                <div className="absolute inset-0 m-auto h-64 w-64 rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle,#00d9ff,transparent 65%)" }} />
                <Art3D name="offer" size={260} />
              </div>
            </section>

            <div className="mt-10 grid gap-6 lg:grid-cols-[260px_1fr]">
              <nav className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:flex-col lg:self-start" aria-label="Steps">
                {STEPS.map((s, n) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => setStep(n)}
                    className={`flex flex-none items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[14px] font-semibold transition-all ${n === step ? "bg-[var(--ob-card-solid)] shadow-[0_0_0_1.5px_rgb(0_160_255/0.45),var(--ob-shadow)]" : "text-[var(--ob-ink-2)] hover:bg-[var(--ob-card)]"}`}
                  >
                    <Art3D name={s.art} size={36} float={false} />
                    {s.title}
                  </button>
                ))}
                <div className="hidden px-3 pt-3 lg:block">
                  <p className="text-[12px] font-semibold text-[var(--ob-ink-3)]">{Math.round((filled / 11) * 100)}% detailed</p>
                  <Bar value={(filled / 11) * 100} className="mt-2" />
                </div>
              </nav>

              <section className="ob-card ob-card-pad ob-enter" key={step}>
                <p className="text-[12px] font-bold tracking-[0.2em] text-[var(--ob-blue)]">
                  STEP {step + 1} / {STEPS.length}
                </p>
                <h2 className="ob-h2 mt-1">{STEPS[step].title}</h2>
                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                  {step === 0 ? (
                    <>
                      {input("business", "Business name", "e.g. Atelier Interiors")}
                      {input("offerName", "Offer name (optional)", "We can name it for you")}
                      <div className="sm:col-span-2">{input("product", "What exactly are you selling?", "e.g. Full villa interior design and fit-out", true)}</div>
                    </>
                  ) : null}
                  {step === 1 ? (
                    <>
                      <div className="sm:col-span-2">{input("audience", "Who is your best customer?", "e.g. Villa owners in Dubai who want a finished home", true)}</div>
                      {input("outcome", "What result do they really want?", "e.g. A move-in ready luxury villa")}
                      {input("timeframe", "How fast can they get it?", "e.g. 12 weeks")}
                      <div className="sm:col-span-2">{input("problem", "What are they tired of?", "e.g. chasing contractors, delays and budget surprises")}</div>
                    </>
                  ) : null}
                  {step === 2 ? (
                    <>
                      <div className="sm:col-span-2">{input("uniqueness", "Why choose you over a competitor?", "What you do that others don’t", true)}</div>
                      {input("speed", "Speed or convenience", "e.g. 3D concept within 7 days")}
                      {input("effort", "Effort you remove", "e.g. One 20-minute call a week")}
                      <div className="sm:col-span-2">
                        {input("guarantee", "Guarantee (only one you can keep)", "e.g. Finished on time or we pay your rent")}
                        <div className="mt-3">
                          <Chips options={GUARANTEE_TYPES.slice(0, 9)} value={[]} onChange={(x) => setV({ ...v, guarantee: x[0] ?? v.guarantee })} />
                        </div>
                      </div>
                      <div className="sm:col-span-2">{input("proof", "Proof (one per line)", "Years in business, customers served, ratings, awards…", true, "Only real, verifiable facts.")}</div>
                    </>
                  ) : null}
                  {step === 3 ? (
                    <>
                      {input("price", "Price", "e.g. AED 180,000")}
                      {input("coreValue", "Value of the core offer (optional)", "e.g. AED 220,000")}
                      <div className="sm:col-span-2">
                        <p className="ob-label">Bonuses</p>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {(v.bonuses ?? []).map((b, n) => (
                            <span key={n} className="inline-flex items-center gap-2 rounded-full bg-[var(--ob-card-2)] px-3 py-1.5 text-[13px] font-medium shadow-[inset_0_0_0_1px_var(--ob-line)]">
                              {b.name}
                              {b.value ? <span className="text-[var(--ob-blue)]">{b.value}</span> : null}
                              <button type="button" aria-label="Remove bonus" onClick={() => setV({ ...v, bonuses: v.bonuses!.filter((_, i) => i !== n) })}>
                                <Icon name="x" size={13} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input className="ob-input flex-1" placeholder="Bonus name" value={bonus.name} onChange={(e) => setBonus({ ...bonus, name: e.target.value })} aria-label="Bonus name" />
                          <input className="ob-input sm:w-40" placeholder="Value" value={bonus.value} onChange={(e) => setBonus({ ...bonus, value: e.target.value })} aria-label="Bonus value" />
                          <Btn
                            size="sm"
                            icon="plus"
                            disabled={!bonus.name}
                            onClick={() => {
                              setV({ ...v, bonuses: [...(v.bonuses ?? []), bonus] });
                              setBonus({ name: "", value: "" });
                            }}
                          >
                            Add
                          </Btn>
                        </div>
                        <div className="mt-3">
                          <Chips options={BONUS_IDEAS.slice(0, 10)} value={(v.bonuses ?? []).map((b) => b.name)} onChange={(x) => setV({ ...v, bonuses: x.map((name) => v.bonuses?.find((b) => b.name === name) ?? { name }) })} />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="ob-label">Why do people hesitate?</p>
                        <Chips options={OBJECTION_CATEGORIES.slice(0, 9)} value={v.objections ?? []} onChange={(x) => setV({ ...v, objections: x })} />
                      </div>
                      <div className="sm:col-span-2">{input("scarcity", "Real scarcity or urgency (optional)", "e.g. We take on four projects per quarter")}</div>
                    </>
                  ) : null}
                </div>

                <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
                  <Btn variant="ghost" size="sm" icon="back" disabled={step === 0} onClick={() => setStep(step - 1)}>
                    Back
                  </Btn>
                  {step < STEPS.length - 1 ? (
                    <div className="flex flex-wrap gap-2">
                      {ready ? (
                        <Btn variant="ghost" size="sm" icon="sparkle" onClick={build}>
                          Build now
                        </Btn>
                      ) : null}
                      <Btn size="sm" arrow onClick={() => setStep(step + 1)}>
                        Next: {STEPS[step + 1].title}
                      </Btn>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            <div className={`${ready ? "sticky bottom-4" : ""} z-30 mt-8 flex flex-col items-center gap-2`}>
              <Btn size="lg" icon="sparkle" disabled={!ready} onClick={build} className="ob-build-glow">
                BUILD MY OFFER
              </Btn>
              {!ready ? <p className="text-[13px] text-[var(--ob-ink-3)]">Add what you sell, who it’s for and the result they want, then build.</p> : null}
            </div>
          </>
        ) : null}

        {phase === "building" ? <Building /> : null}

        {phase === "done" ? (
          <div className="grid gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="ob-eyebrow">Your offer is ready</p>
                <h1 className="ob-h1 mt-3">
                  Here’s your <span className="ob-grad-text">offer.</span>
                </h1>
              </div>
              <Btn variant="ghost" icon="edit" onClick={() => setPhase("form")}>
                Edit answers
              </Btn>
            </div>
            <OfferCard offer={offer} onShare={share} />
            <BookCta bookingUrl={bookingUrl} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Building() {
  const lines = ["Positioning your dream outcome", "Stacking value and bonuses", "Adding risk reversal", "Answering objections", "Writing your headlines"];
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((x) => Math.min(x + 1, lines.length)), 340);
    return () => clearInterval(t);
  }, [lines.length]);
  return (
    <section className="ob-navy mx-auto grid max-w-2xl place-items-center gap-6 p-10 text-center">
      <div className="ob-aurora-local" />
      <div className="relative">
        <Art3D name="offer" size={150} />
      </div>
      <h2 className="ob-h2 relative text-white">Building your offer…</h2>
      <ul className="relative grid gap-2 text-left">
        {lines.map((l, i) => (
          <li key={l} className={`flex items-center gap-3 text-[15px] transition-opacity duration-300 ${i < n ? "text-white opacity-100" : "text-[#7f90a8] opacity-50"}`}>
            <span className="grid h-6 w-6 place-items-center rounded-full" style={{ background: i < n ? "linear-gradient(135deg,#00b4ff,#00e5ff)" : "rgb(255 255 255 / .1)" }}>
              {i < n ? <Icon name="check" size={13} stroke={3} className="text-[#03101d]" /> : null}
            </span>
            {l}
          </li>
        ))}
      </ul>
    </section>
  );
}

function BookCta({ bookingUrl }: { bookingUrl: string }) {
  return (
    <section className="ob-card ob-card-pad flex flex-col items-start gap-5 sm:flex-row sm:items-center print:hidden">
      <Art3D name="kickoff" size={84} />
      <div className="flex-1">
        <p className="ob-h3">Want Madvert Labs to turn this into a campaign?</p>
        <p className="mt-1 text-[14.5px] text-[var(--ob-ink-2)]">We build offers, funnels and the ads that sell them. Book a free strategy call and bring this offer.</p>
      </div>
      <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="ob-btn ob-btn-primary">
        Book a strategy call <Icon name="arrow" className="arrow" />
      </a>
    </section>
  );
}

/** Public, read-only page for a shared offer. */
export function SharedOffer({ offer, bookingUrl }: { offer: GeneratedOffer; bookingUrl: string }) {
  return (
    <div className="ob">
      <Waves />
      <header className="ob-header">
        <div className="ob-wrap flex h-16 items-center justify-between">
          <Logo href={null} height={24} />
          <ThemeSwitch />
        </div>
      </header>
      <main className="ob-wrap relative grid gap-6 pb-24 pt-8 sm:pt-12">
        <OfferCard offer={offer} readOnly />
        <section className="ob-card ob-card-pad flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Art3D name="offer" size={84} />
          <div className="flex-1">
            <p className="ob-h3">Built with the free Madvert Offer Builder</p>
            <p className="mt-1 text-[14.5px] text-[var(--ob-ink-2)]">Answer a few questions and get a complete offer like this one in two minutes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/offer-builder" className="ob-btn ob-btn-primary">
              Build your offer <Icon name="arrow" className="arrow" />
            </a>
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="ob-btn ob-btn-ghost">
              Talk to Madvert
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
