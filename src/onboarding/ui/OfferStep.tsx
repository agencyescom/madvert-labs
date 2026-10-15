"use client";

import { Art3D } from "./art3d";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateOffer, inputFromWorkshop } from "@/onboarding/offer/generate";
import { OfferCard } from "./offer/OfferCard";
import { BONUS_IDEAS, GUARANTEE_TYPES, OBJECTION_CATEGORIES } from "@/onboarding/template/questions";
import type { ClientState } from "@/onboarding/server/views";
import { Btn, Chips, Confetti, Field, GlowMark, Icon, Sheet, StatusPill } from "./kit";
import type { View } from "./PortalApp";
import { QuestionGrid } from "./QuestionField";
import { StepFooter, StepHeader } from "./StepLayout";
import { usePortal } from "./store";

type Offer = ClientState["offer"];
type Lists = {
  bonuses: { name: string; description?: string; perceivedValue?: string; actualCost?: string; conditions?: string }[];
  guarantees: { type: string; terms: string; clientApproved: boolean }[];
  objections: { category?: string; objection: string; currentResponse?: string; evidence?: string }[];
  competitors: { name: string; website?: string; strengths?: string; weaknesses?: string; difference?: string }[];
};

export function OfferStep({ go }: { go: (v: View) => void }) {
  const { state, call } = usePortal();
  const status = state.offer.status;
  const [mode, setMode] = useState<"intro" | "workshop" | "done">(status === "completed" ? "done" : status === "in_progress" ? "workshop" : "intro");

  if (mode === "intro" || status === "skipped")
    return (
      <div>
        <section className="ob-navy ob-enter">
          <div className="ob-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative grid grid-cols-1 gap-8 p-6 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center [&>*]:min-w-0">
            <div>
              <p className="ob-eyebrow !text-[#7fdcff]">Step 04 · Offer Creation Workshop · Optional</p>
              <h1 className="ob-display mt-5 text-[clamp(32px,5vw,60px)] text-white">
                LET’S BUILD AN OFFER <span className="bg-[linear-gradient(95deg,#3db4ff,#00e5ff)] bg-clip-text text-transparent">PEOPLE ACTUALLY WANT</span>
              </h1>
              <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-[#b4c2d6]">
                If you already have time, answer these questions now and our strategy team will prepare before kickoff.
              </p>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#8a9ab2]">If not, skip this section and we’ll work through it together during your kickoff call.</p>
              {status === "skipped" ? (
                <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13.5px] font-semibold text-[#9ff0ff]">
                  <Icon name="check" size={15} /> You chose to complete this with Madvert during kickoff
                </p>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Btn
                  size="lg"
                  arrow
                  onClick={async () => {
                    await call("offer", { status: "in_progress" });
                    setMode("workshop");
                  }}
                >
                  BUILD MY OFFER NOW
                </Btn>
                {status !== "skipped" ? (
                  <Btn
                    size="lg"
                    variant="ghost"
                    className="!bg-white/5 !text-white !shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)]"
                    onClick={async () => {
                      await call("offer", { status: "skipped" });
                      go("kickoff");
                    }}
                  >
                    COMPLETE WITH MADVERT DURING KICKOFF
                  </Btn>
                ) : (
                  <Btn size="lg" variant="ghost" className="!bg-white/5 !text-white !shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)]" onClick={() => go("kickoff")}>
                    Continue to Kickoff
                  </Btn>
                )}
              </div>
            </div>
            <div className="hidden justify-center lg:flex">
              <div className="relative">
                <Art3D name="offer" size={190} />
                <div className="absolute -bottom-8 left-1/2 h-6 w-40 -translate-x-1/2 rounded-full bg-[#00b4ff]/30 blur-xl" />
              </div>
            </div>
          </div>
        </section>
        <p className="mt-5 text-center text-[13.5px] text-[var(--ob-ink-3)]">Skipping never blocks your kickoff booking.</p>
      </div>
    );

  if (mode === "done") return <OfferDone go={go} onEdit={() => setMode("workshop")} />;
  return <Workshop go={go} onDone={() => setMode("done")} />;
}

function useGenerated() {
  const { state } = usePortal();
  return useMemo(
    () =>
      generateOffer(
        inputFromWorkshop(state.onboarding.companyName, state.offer.values, {
          bonuses: state.offer.bonuses,
          guarantees: state.offer.guarantees,
          objections: state.offer.objections,
        }),
      ),
    [state.onboarding.companyName, state.offer],
  );
}

function GeneratedOfferView() {
  const { state, call } = usePortal();
  const offer = useGenerated();
  const pendingGuarantees = state.offer.guarantees.filter((g) => !g.clientApproved).length;
  return (
    <div className="grid gap-4">
      <OfferCard
        offer={offer}
        onShare={async () => {
          const r = await call<{ url: string }>("offer-share");
          if (r.error) {
            alert(r.error);
            return null;
          }
          return r.url;
        }}
      />
      <p className="text-[13px] text-[var(--ob-ink-3)]">
        Built only from your answers. {pendingGuarantees ? `${pendingGuarantees} guarantee(s) are left out until you tick “Client Approved Claim”. ` : ""}Your strategy team will refine it with you before kickoff.
      </p>
    </div>
  );
}

function GenerateButton() {
  const { state, flush } = usePortal();
  const [open, setOpen] = useState(false);
  const v = state.offer.values;
  const ready = Boolean((v.primary_offer || v.selling) && (v.outcome || v.end_result));
  return (
    <>
      <Btn icon="sparkle" className="ob-build-glow" disabled={!ready} title={ready ? "" : "Answer Foundation first"} onClick={async () => (await flush(), setOpen(true))}>
        {ready ? "Generate my offer" : "Answer Foundation to generate"}
      </Btn>
      <Sheet open={open} onClose={() => setOpen(false)} label="Your generated offer">
        <div className="pt-4">
          <GeneratedOfferView />
        </div>
      </Sheet>
    </>
  );
}

function OfferDone({ go, onEdit }: { go: (v: View) => void; onEdit: () => void }) {
  return (
    <section className="ob-card ob-card-pad relative overflow-hidden text-center">
      <Confetti />
      <div className="mx-auto grid max-w-xl justify-items-center gap-4 py-8">
        <GlowMark size={84} />
        <h1 className="ob-h1">
          Offer workshop <span className="ob-grad-text">complete.</span>
        </h1>
        <p className="ob-lead">Our strategy team will turn your answers into a draft offer before kickoff. Anything we suggest will be clearly marked as a Madvert idea for you to approve.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <GenerateButton />
          <Btn arrow onClick={() => go("kickoff")}>
            Book your kickoff
          </Btn>
          <Btn variant="ghost" icon="edit" onClick={onEdit}>
            Review answers
          </Btn>
        </div>
      </div>
    </section>
  );
}

function Workshop({ go, onDone }: { go: (v: View) => void; onDone: () => void }) {
  const { state, answers, setAnswer, call, flush } = usePortal();
  const sections = state.template.offer;
  const [idx, setIdx] = useState(0);
  const s = sections[idx];
  const values = state.offer.values;
  const [lists, setLists] = useState<Lists>(() => ({
    bonuses: state.offer.bonuses,
    guarantees: state.offer.guarantees,
    objections: state.offer.objections.length ? state.offer.objections : [{ objection: "", category: "Too expensive" }],
    competitors: state.offer.competitors.length ? state.offer.competitors : [{ name: "" }],
  }));
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Partial<Lists>>({});
  const saveLists = (patch: Partial<Lists>) => {
    setLists((l) => ({ ...l, ...patch }));
    pending.current = { ...pending.current, ...patch };
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => {
      const p = pending.current;
      pending.current = {};
      void call("offer", { lists: p });
    }, 900);
  };
  useEffect(
    () => () => {
      if (t.current) clearTimeout(t.current);
      if (Object.keys(pending.current).length) void call("offer", { lists: pending.current });
    },
    [call],
  );
  void answers;

  const goTo = async (i: number) => {
    await flush();
    setIdx(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <StepHeader
        phase="offer"
        title="Offer Creation"
        accent="Workshop"
        intro="Answer what you can. Short answers are fine. Everything saves automatically, and one click turns your answers into a complete offer."
        aside={<GenerateButton />}
      />
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-40 lg:flex-col lg:self-start" aria-label="Workshop sections">
          {sections.map((sec, i) => (
            <button
              key={sec.key}
              type="button"
              onClick={() => goTo(i)}
              className={`flex flex-none items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-[14px] font-semibold transition-all ${i === idx ? "bg-[var(--ob-card-solid)] shadow-[0_0_0_1.5px_rgb(0_160_255/0.45),var(--ob-shadow)]" : "text-[var(--ob-ink-2)] hover:bg-[var(--ob-card)]"}`}
              aria-current={i === idx ? "step" : undefined}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg text-[11px] font-bold" style={i === idx ? { background: "var(--ob-grad)", color: "#fff" } : { background: "var(--ob-card-2)", color: "var(--ob-ink-3)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {sec.title}
            </button>
          ))}
        </nav>

        <section className="ob-card ob-card-pad ob-enter" key={s.key}>
          <p className="text-[12px] font-bold tracking-[0.2em] text-[var(--ob-blue)]">
            {String(idx + 1).padStart(2, "0")} / {sections.length}
          </p>
          <h2 className="ob-h2 mt-1">{s.title}</h2>
          {s.intro ? <p className="mt-2 text-[15px] text-[var(--ob-ink-2)]">{s.intro}</p> : null}
          <div className="mt-7 grid gap-8">
            {s.questions.length ? <QuestionGrid questions={s.key === "offer.stack" ? [] : s.questions} values={values} onChange={(k, v) => setAnswer(s.key, k, v)} idPrefix={s.key} /> : null}
            {s.key === "offer.risk" ? <Guarantees items={lists.guarantees} onChange={(guarantees) => saveLists({ guarantees })} /> : null}
            {s.key === "offer.bonuses" ? <Bonuses items={lists.bonuses} onChange={(bonuses) => saveLists({ bonuses })} /> : null}
            {s.key === "offer.stack" ? (
              <>
                <ValueStack values={values} lists={lists} />
                <QuestionGrid questions={s.questions} values={values} onChange={(k, v) => setAnswer(s.key, k, v)} idPrefix={s.key} />
              </>
            ) : null}
            {s.key === "offer.objections" ? <Objections items={lists.objections} onChange={(objections) => saveLists({ objections })} /> : null}
            {s.key === "offer.competitors" ? <Competitors items={lists.competitors} onChange={(competitors) => saveLists({ competitors })} /> : null}
          </div>
          <div className="mt-9 flex flex-wrap justify-between gap-3">
            <Btn variant="ghost" size="sm" icon="back" disabled={idx === 0} onClick={() => goTo(idx - 1)}>
              Previous
            </Btn>
            {idx < sections.length - 1 ? (
              <Btn size="sm" arrow onClick={() => goTo(idx + 1)}>
                Next: {sections[idx + 1].title}
              </Btn>
            ) : (
              <Btn
                size="sm"
                icon="check"
                onClick={async () => {
                  await flush();
                  if (Object.keys(pending.current).length) await call("offer", { lists: pending.current });
                  pending.current = {};
                  await call("offer", { status: "completed" });
                  onDone();
                }}
              >
                Complete workshop
              </Btn>
            )}
          </div>
        </section>
      </div>
      <StepFooter back="assets" next="kickoff" nextLabel="Continue to Kickoff" go={go} />
    </div>
  );
}

/* ───────── List editors ───────── */

function Row({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-[18px] bg-[var(--ob-card-2)] p-4 shadow-[inset_0_0_0_1px_var(--ob-line)] sm:p-5">
      <button type="button" className="ob-icon-btn absolute right-2 top-2" aria-label="Remove" onClick={onRemove}>
        <Icon name="trash" />
      </button>
      {children}
    </div>
  );
}

function input(label: string, value: string | undefined, onChange: (v: string) => void, opts: { area?: boolean; placeholder?: string; id: string }) {
  return (
    <Field label={label} htmlFor={opts.id}>
      {opts.area ? (
        <textarea id={opts.id} className="ob-textarea !min-h-[84px]" value={value ?? ""} placeholder={opts.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={opts.id} className="ob-input" value={value ?? ""} placeholder={opts.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function Bonuses({ items, onChange }: { items: Lists["bonuses"]; onChange: (v: Lists["bonuses"]) => void }) {
  const upd = (i: number, p: Partial<Lists["bonuses"][number]>) => onChange(items.map((x, n) => (n === i ? { ...x, ...p } : x)));
  return (
    <div className="grid gap-5">
      <div>
        <p className="mb-3 text-[14px] font-semibold">Ideas (tap to add)</p>
        <Chips options={BONUS_IDEAS} value={items.map((b) => b.name)} onChange={(v) => onChange(v.map((name) => items.find((b) => b.name === name) ?? { name }))} />
      </div>
      {items.map((b, i) => (
        <Row key={i} onRemove={() => onChange(items.filter((_, n) => n !== i))}>
          <p className="mb-3 text-[12px] font-bold tracking-[0.16em] text-[var(--ob-blue)]">BONUS {i + 1}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {input("Name", b.name, (v) => upd(i, { name: v }), { id: `b-n-${i}` })}
            {input("Perceived value", b.perceivedValue, (v) => upd(i, { perceivedValue: v }), { id: `b-p-${i}`, placeholder: "e.g. AED 1,500" })}
            <div className="sm:col-span-2">{input("Description", b.description, (v) => upd(i, { description: v }), { id: `b-d-${i}`, area: true })}</div>
            {input("Actual cost to you", b.actualCost, (v) => upd(i, { actualCost: v }), { id: `b-c-${i}` })}
            {input("Conditions", b.conditions, (v) => upd(i, { conditions: v }), { id: `b-k-${i}`, placeholder: "e.g. first 20 customers" })}
          </div>
        </Row>
      ))}
      <Btn variant="ghost" icon="plus" onClick={() => onChange([...items, { name: "" }])}>
        + ADD BONUS
      </Btn>
    </div>
  );
}

function Guarantees({ items, onChange }: { items: Lists["guarantees"]; onChange: (v: Lists["guarantees"]) => void }) {
  const upd = (i: number, p: Partial<Lists["guarantees"][number]>) => onChange(items.map((x, n) => (n === i ? { ...x, ...p } : x)));
  return (
    <div className="grid gap-5">
      <p className="ob-callout">
        <strong>Only offer guarantees you can responsibly keep.</strong> Madvert will not use any guarantee publicly until you tick <em>Client Approved Claim</em>.
      </p>
      <div>
        <p className="mb-3 text-[14px] font-semibold">What guarantees can you responsibly offer?</p>
        <Chips
          options={GUARANTEE_TYPES}
          value={items.map((g) => g.type)}
          onChange={(v) => onChange(v.map((type) => items.find((g) => g.type === type) ?? { type, terms: "", clientApproved: false }))}
        />
      </div>
      {items.map((g, i) => (
        <Row key={i} onRemove={() => onChange(items.filter((_, n) => n !== i))}>
          <p className="mb-3 text-[12px] font-bold tracking-[0.16em] text-[var(--ob-blue)]">{g.type.toUpperCase()}</p>
          {input("Terms", g.terms, (v) => upd(i, { terms: v }), { id: `g-t-${i}`, area: true, placeholder: "Exactly what is guaranteed, and the conditions" })}
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-[var(--ob-card-solid)] p-3 text-[14px] shadow-[inset_0_0_0_1px_var(--ob-line)]">
            <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[#00a2ff]" checked={g.clientApproved} onChange={(e) => upd(i, { clientApproved: e.target.checked })} />
            <span>
              <strong>Client Approved Claim.</strong> I confirm we can honour this and Madvert may use it publicly.
            </span>
          </label>
        </Row>
      ))}
    </div>
  );
}

function Objections({ items, onChange }: { items: Lists["objections"]; onChange: (v: Lists["objections"]) => void }) {
  const upd = (i: number, p: Partial<Lists["objections"][number]>) => onChange(items.map((x, n) => (n === i ? { ...x, ...p } : x)));
  return (
    <div className="grid gap-5">
      <p className="text-[15px] font-semibold">What are the five most common reasons prospects don’t buy?</p>
      {items.map((o, i) => (
        <Row key={i} onRemove={() => onChange(items.filter((_, n) => n !== i))}>
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <Field label="Category" htmlFor={`o-c-${i}`}>
              <select id={`o-c-${i}`} className="ob-select" value={o.category ?? ""} onChange={(e) => upd(i, { category: e.target.value })}>
                {OBJECTION_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            {input("Objection", o.objection, (v) => upd(i, { objection: v }), { id: `o-o-${i}`, placeholder: "What prospects say" })}
            {input("Current response", o.currentResponse, (v) => upd(i, { currentResponse: v }), { id: `o-r-${i}`, area: true })}
            {input("Evidence / proof", o.evidence, (v) => upd(i, { evidence: v }), { id: `o-e-${i}`, area: true })}
          </div>
        </Row>
      ))}
      {items.length < 8 ? (
        <Btn variant="ghost" icon="plus" onClick={() => onChange([...items, { objection: "", category: "Need to think" }])}>
          Add objection
        </Btn>
      ) : null}
    </div>
  );
}

function Competitors({ items, onChange }: { items: Lists["competitors"]; onChange: (v: Lists["competitors"]) => void }) {
  const upd = (i: number, p: Partial<Lists["competitors"][number]>) => onChange(items.map((x, n) => (n === i ? { ...x, ...p } : x)));
  return (
    <div className="grid gap-5">
      <p className="text-[15px] font-semibold">Who are your top competitors?</p>
      {items.map((c, i) => (
        <Row key={i} onRemove={() => onChange(items.filter((_, n) => n !== i))}>
          <div className="grid gap-4 sm:grid-cols-2">
            {input("Competitor name", c.name, (v) => upd(i, { name: v }), { id: `c-n-${i}` })}
            {input("Website", c.website, (v) => upd(i, { website: v }), { id: `c-w-${i}`, placeholder: "https://" })}
            {input("What they do well", c.strengths, (v) => upd(i, { strengths: v }), { id: `c-s-${i}`, area: true })}
            {input("What customers may dislike", c.weaknesses, (v) => upd(i, { weaknesses: v }), { id: `c-x-${i}`, area: true })}
            <div className="sm:col-span-2">{input("How you differ", c.difference, (v) => upd(i, { difference: v }), { id: `c-d-${i}`, area: true })}</div>
          </div>
        </Row>
      ))}
      <Btn variant="ghost" icon="plus" onClick={() => onChange([...items, { name: "" }])}>
        Add competitor
      </Btn>
    </div>
  );
}

/* ───────── Value stack ───────── */

function ValueStack({ values, lists }: { values: Offer["values"]; lists: Lists }) {
  const s = (k: string) => (Array.isArray(values[k]) ? (values[k] as string[]).join(", ") : String(values[k] ?? "")).trim();
  const speed = s("speed_possible") || s("speed_delivery") || s("speed_response");
  const proof = [s("years") && `${s("years")} years`, s("rating"), s("customers_served") && `${s("customers_served")} customers`].filter(Boolean).join(" · ");
  const rows: { tag: string; text: string; empty: string }[] = [
    { tag: "CORE OFFER", text: s("primary_offer") || s("selling"), empty: "Add your primary offer in Foundation" },
    ...lists.bonuses.filter((b) => b.name).map((b, i) => ({ tag: `BONUS ${i + 1}`, text: [b.name, b.perceivedValue && `(${b.perceivedValue} value)`].filter(Boolean).join(" "), empty: "" })),
    ...(lists.bonuses.filter((b) => b.name).length ? [] : [{ tag: "BONUS", text: "", empty: "Add bonuses in the Bonuses section" }]),
    { tag: "GUARANTEE", text: lists.guarantees.map((g) => `${g.type}${g.clientApproved ? "" : " (pending approval)"}`).join(" · "), empty: "Add a guarantee in Risk reversal" },
    { tag: "SPEED", text: speed, empty: "Add turnaround times in Speed" },
    { tag: "PROOF", text: proof, empty: "Add proof in Proof & certainty" },
  ];
  return (
    <div className="ob-navy p-5 sm:p-8">
      <p className="ob-eyebrow !text-[#7fdcff]">Your value stack</p>
      <div className="mt-6 grid">
        {rows.map((r, i) => (
          <div key={r.tag + i}>
            {i > 0 ? <div className="ob-stack-plus">+</div> : null}
            <div className="ob-stack-item">
              <span className="w-28 flex-none text-[11px] font-bold tracking-[0.16em] text-[#4fd8ff]">{r.tag}</span>
              <span className={`text-[15px] ${r.text ? "font-semibold text-white" : "italic text-[#7f90a8]"}`}>{r.text || r.empty}</span>
              {r.text ? <StatusPill status="completed" label="Added" /> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
