"use client";

import { useEffect, useState } from "react";
import { Btn, Confetti, Field, GlowMark, Icon, StatusPill } from "./kit";
import { MissingPanel, type View } from "./PortalApp";
import { StepHeader } from "./StepLayout";
import { usePortal } from "./store";

const BOOKED = /(booking|appointment|event)[\s_-]*(complete|completed|success|confirmed|booked|created|scheduled)/i;

const REVIEW = ["Your business", "Your access", "Your current marketing", "Your assets", "Your offer", "Your customer journey", "Your tracking", "Your biggest growth opportunities"];

export function KickoffStep({ go }: { go: (v: View) => void }) {
  const { state } = usePortal();
  if (state.booking?.status === "booked") return <Booked go={go} />;
  return <BookKickoff go={go} />;
}

function BookKickoff({ go }: { go: (v: View) => void }) {
  const { state, progress, call } = usePortal();
  const [showCal, setShowCal] = useState(false);
  const [anyway, setAnyway] = useState(false);
  const [manual, setManual] = useState(false);
  const [when, setWhen] = useState("");
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  const businessDone = progress.byKey.business.status === "completed";
  const url = state.integrations.bookingUrl;

  useEffect(() => {
    if (!showCal) return;
    const s = document.createElement("script");
    s.src = "https://link.msgsndr.com/js/form_embed.js";
    s.async = true;
    document.body.appendChild(s);
    let host = "";
    try {
      host = new URL(url).hostname;
    } catch {}
    const onMessage = (e: MessageEvent) => {
      let origin = "";
      try {
        origin = new URL(e.origin).hostname;
      } catch {
        return;
      }
      if (origin !== host && !/(msgsndr|leadconnectorhq|gohighlevel)\.com$/.test(origin)) return;
      const text = typeof e.data === "string" ? e.data : JSON.stringify(e.data ?? "");
      if (BOOKED.test(text)) void call("kickoff", { source: "widget", timezone: tz });
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      s.remove();
    };
  }, [showCal, url, call, tz]);

  const checklist: { label: string; key: "business" | "access" | "assets" | "offer"; view: View }[] = [
    { label: "Business Information", key: "business", view: "business" },
    { label: "Access", key: "access", view: "access" },
    { label: "Assets", key: "assets", view: "assets" },
    { label: "Offer Workshop", key: "offer", view: "offer" },
  ];

  return (
    <div>
      <StepHeader phase="kickoff" title="YOU’RE ALMOST" accent="READY." intro="Kickoff is the finish line of onboarding. Book a time with the team to finalise your growth plan." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <section className="ob-card ob-card-pad">
          <h2 className="ob-h3">Your checklist</h2>
          <ul className="mt-5 grid gap-3">
            {checklist.map((c) => {
              const p = progress.byKey[c.key];
              const label = p.status === "completed" ? "Complete" : c.key === "offer" ? (state.offer.status === "skipped" ? "During kickoff" : "Optional") : "Pending";
              const tone = p.status === "completed" ? "completed" : c.key === "offer" ? "optional" : "pending";
              return (
                <li key={c.key}>
                  <button type="button" onClick={() => go(c.view)} className="flex w-full items-center gap-4 rounded-2xl bg-[var(--ob-card-2)] px-4 py-3.5 text-left shadow-[inset_0_0_0_1px_var(--ob-line)] transition-colors hover:shadow-[inset_0_0_0_1px_rgb(0_160_255/0.4)]">
                    <span
                      className="grid h-9 w-9 flex-none place-items-center rounded-full text-white"
                      style={{ background: p.status === "completed" ? "linear-gradient(135deg,#0ea5e9,#10b981)" : "var(--ob-line-2)" }}
                    >
                      {p.status === "completed" ? <Icon name="check" size={16} stroke={2.6} /> : <span className="text-[12px] font-bold text-[var(--ob-ink-3)]">{p.percent}%</span>}
                    </span>
                    <span className="flex-1 text-[15px] font-semibold">{c.label}</span>
                    <StatusPill status={tone} label={label} />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-8">
            <p className="ob-eyebrow">What happens next</p>
            <p className="mt-4 text-[15px] font-semibold">Our team will review:</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {REVIEW.map((r) => (
                <li key={r} className="flex items-center gap-2 text-[14px] text-[var(--ob-ink-2)]">
                  <span className="grid h-5 w-5 place-items-center rounded-full text-white" style={{ background: "var(--ob-grad)" }}>
                    <Icon name="check" size={11} stroke={3} />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[14.5px] text-[var(--ob-ink-2)]">Then the kickoff call will focus on decisions rather than collecting basic information.</p>
          </div>
        </section>

        <section className="ob-navy p-6 sm:p-8">
          <div className="ob-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <GlowMark size={56} />
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-[#7fdcff]">KICKOFF CALL</p>
                <p className="text-[19px] font-semibold text-white">Meet the team. Finalise the growth plan.</p>
              </div>
            </div>
            {!businessDone && !anyway ? (
              <div className="mt-6 rounded-2xl bg-white/[0.06] p-5">
                <p className="text-[15px] font-semibold text-white">Business Information comes first</p>
                <p className="mt-1 text-[14px] text-[#a9b6c9]">So the call can focus on decisions, please complete Business Information before booking ({progress.byKey.business.percent}% done).</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Btn size="sm" arrow onClick={() => go("business")}>
                    Finish Business Information
                  </Btn>
                  <Btn size="sm" variant="ghost" className="!bg-white/5 !text-white" onClick={() => setAnyway(true)}>
                    Book anyway
                  </Btn>
                </div>
              </div>
            ) : !showCal ? (
              <div className="mt-8">
                <Btn size="lg" icon="calendar" onClick={() => setShowCal(true)}>
                  BOOK YOUR KICKOFF CALL
                </Btn>
                {state.offer.status !== "completed" ? <p className="mt-3 text-[13px] text-[#8a9ab2]">The optional Offer Workshop does not need to be finished to book.</p> : null}
              </div>
            ) : null}
          </div>
          {showCal ? (
            <div className="relative mt-6">
              <iframe src={url} title="Book your Madvert kickoff call" className="block min-h-[900px] w-full rounded-[18px] border-0 bg-white sm:min-h-[760px]" style={{ overflow: "hidden" }} />
              <div className="mt-4 rounded-2xl bg-white/[0.06] p-4">
                {!manual ? (
                  <button type="button" className="text-[14px] font-semibold text-[#7fdcff]" onClick={() => setManual(true)}>
                    Booked already? Confirm your time here →
                  </button>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <Field label={<span className="text-white">Your kickoff date and time</span>} htmlFor="ko-when">
                      <input id="ko-when" type="datetime-local" className="ob-input" value={when} onChange={(e) => setWhen(e.target.value)} />
                    </Field>
                    <Btn icon="check" disabled={!when} onClick={() => call("kickoff", { startsAt: new Date(when).toISOString(), timezone: tz, source: "client_confirmed" })}>
                      Confirm booking
                    </Btn>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function Booked({ go }: { go: (v: View) => void }) {
  const { state, missing } = usePortal();
  const b = state.booking!;
  const start = b.startsAt ? new Date(b.startsAt) : null;
  const end = start ? new Date(start.getTime() + 60 * 60_000) : null;
  const title = `Madvert Labs kickoff · ${state.onboarding.companyName}`;
  const details = "Kickoff call with Madvert Labs. We’ll review everything you shared before the call.";
  const gcal = start && end ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${icsDate(start)}/${icsDate(end)}&details=${encodeURIComponent(details)}${b.meetingUrl ? `&location=${encodeURIComponent(b.meetingUrl)}` : ""}` : null;
  const ics = () => {
    if (!start || !end) return;
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Madvert Labs//Onboarding//EN",
      "BEGIN:VEVENT",
      `UID:${state.onboarding.id}@madvertlabs.com`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details}`,
      b.meetingUrl ? `LOCATION:${b.meetingUrl}` : "",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    a.download = "madvert-kickoff.ics";
    a.click();
  };
  const fmt = (o: Intl.DateTimeFormatOptions) => (start ? start.toLocaleString(undefined, { ...o, timeZone: b.timezone || undefined }) : "To be confirmed");

  return (
    <div className="grid gap-8">
      <section className="ob-navy relative overflow-hidden">
        <Confetti />
        <div className="ob-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle,#00b4ff,transparent 65%)" }} />
        <div className="relative grid grid-cols-1 gap-10 p-6 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center [&>*]:min-w-0">
          <div>
            <GlowMark size={72} />
            <h1 className="ob-display mt-6 text-[clamp(44px,7vw,88px)] text-white">
              YOU’RE <span className="bg-[linear-gradient(95deg,#3db4ff,#00e5ff)] bg-clip-text text-transparent">IN.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[#c4d1e2]">Your onboarding information has been received and your kickoff is booked.</p>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#8a9ab2]">
              Madvert Labs will review everything before the call so we can spend the meeting solving problems rather than collecting information.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-3 rounded-[24px] bg-white/[0.05] p-5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
            {[
              ["Date", fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }), "calendar"],
              ["Time", start ? fmt({ hour: "numeric", minute: "2-digit" }) : "We’ll confirm by email", "clock"],
              ["Timezone", b.timezone || "Your local time", "flag"],
              ["Assigned Strategist", b.strategist || state.onboarding.accountManager.name, "user"],
            ].map(([l, v, i]) => (
              <div key={l} className="flex items-center gap-4 rounded-2xl bg-white/[0.04] px-4 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl text-[#03101d]" style={{ background: "linear-gradient(135deg,#00b4ff,#00e5ff)" }}>
                  <Icon name={i} size={17} />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f90a8]">{l}</span>
                  <span className="block text-[15px] font-semibold text-white">{v}</span>
                </span>
              </div>
            ))}
            {b.meetingUrl ? (
              <a href={b.meetingUrl} target="_blank" rel="noopener noreferrer" className="ob-btn ob-btn-white ob-btn-sm">
                <Icon name="external" size={15} /> Meeting link
              </a>
            ) : null}
            {start ? (
              <div className="flex flex-wrap gap-2">
                {gcal ? (
                  <a href={gcal} target="_blank" rel="noopener noreferrer" className="ob-btn ob-btn-primary ob-btn-sm flex-1">
                    <Icon name="calendar" size={15} /> Add to Google Calendar
                  </a>
                ) : null}
                <button type="button" onClick={ics} className="ob-btn ob-btn-sm flex-1 !bg-white/10 !text-white">
                  <Icon name="download" size={15} /> Add to Calendar (.ics)
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <MissingPanel items={missing.filter((m) => m.key !== "kickoff")} go={go} title="MISSING ITEMS" />
        <section className="ob-card ob-card-pad">
          <h2 className="ob-h3">Before the call</h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ob-ink-2)]">
            Onboarding stays open after booking. Anything you add now, from access to product photos, helps us arrive with answers instead of questions.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Btn size="sm" variant="ghost" onClick={() => go("home")}>
              Onboarding overview
            </Btn>
            {state.offer.status !== "completed" ? (
              <Btn size="sm" variant="ghost" onClick={() => go("offer")}>
                Offer workshop (optional)
              </Btn>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
