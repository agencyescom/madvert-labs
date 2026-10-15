"use client";

import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import type { ClientState } from "@/onboarding/server/views";
import { PHASES } from "@/onboarding/progress";
import type { PhaseKey } from "@/onboarding/types";
import { AccessStep } from "./AccessStep";
import { AssetsStep } from "./AssetsStep";
import { BusinessStep } from "./BusinessStep";
import { KickoffStep } from "./KickoffStep";
import { Art3D, Tile3D } from "./art3d";
import { Bar, Btn, GlowMark, Icon, Ring, SaveBadge, StatusPill, ThemeSwitch, Waves } from "./kit";
import { OfferStep } from "./OfferStep";
import { PortalProvider, usePortal } from "./store";

export type View = "welcome" | "home" | PhaseKey;
const VIEWS: View[] = ["welcome", "home", "business", "access", "assets", "offer", "kickoff"];

export function PortalApp({ initial, token }: { initial: ClientState; token: string }) {
  return (
    <PortalProvider initial={initial} mode={{ kind: "client", token }}>
      <Portal />
    </PortalProvider>
  );
}

function useView(started: boolean, id: string) {
  const [view, setViewState] = useState<View>("welcome");
  useEffect(() => {
    const fromHash = window.location.hash.slice(1) as View;
    // The hash only exists in the browser, so it is read after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (VIEWS.includes(fromHash)) setViewState(fromHash);
    else if (started) setViewState("welcome");
    const onHash = () => {
      const h = window.location.hash.slice(1) as View;
      setViewState(VIEWS.includes(h) ? h : "welcome");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [started]);
  const setView = useCallback(
    (v: View) => {
      if (window.location.hash.slice(1) !== v) window.history.pushState(null, "", `#${v}`);
      setViewState(v);
      try {
        if (v !== "welcome") localStorage.setItem(`mv-onb-last:${id}`, v);
      } catch {}
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [id],
  );
  return [view, setView] as const;
}

function Portal() {
  const { state, flush, call } = usePortal();
  const [view, setView] = useView(Boolean(state.onboarding.startedAt), state.onboarding.id);
  const go = useCallback(
    async (v: View) => {
      await flush();
      if (v !== "welcome" && !state.onboarding.startedAt) void call("start");
      setView(v);
    },
    [flush, setView, call, state.onboarding.startedAt],
  );

  return (
    <div className="ob">
      <Waves />
      {view === "welcome" ? (
        <Welcome go={go} />
      ) : (
        <>
          <Header view={view} go={go} />
          <main className="ob-wrap relative pb-28 pt-6 sm:pt-10" key={view}>
            {view === "home" && <Home go={go} />}
            {view === "business" && <BusinessStep go={go} />}
            {view === "access" && <AccessStep go={go} />}
            {view === "assets" && <AssetsStep go={go} />}
            {view === "offer" && <OfferStep go={go} />}
            {view === "kickoff" && <KickoffStep go={go} />}
          </main>
        </>
      )}
      <Footer />
    </div>
  );
}

/* ───────── Header + stepper ───────── */

function Header({ view, go }: { view: View; go: (v: View) => void }) {
  const { progress, saveState, state } = usePortal();
  const [menu, setMenu] = useState(false);
  const current = PHASES.find((p) => p.key === view);
  return (
    <header className="ob-header">
      <div className="ob-wrap flex h-16 items-center gap-4">
        <button type="button" onClick={() => go("home")} className="flex items-center gap-3" aria-label="Onboarding home">
          <Logo href={null} height={24} />
        </button>
        <span className="hidden h-6 w-px bg-[var(--ob-line-2)] lg:block" />
        <span className="hidden truncate text-[13px] font-medium text-[var(--ob-ink-3)] lg:block">{state.onboarding.companyName}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden sm:block">
            <SaveBadge state={saveState} />
          </span>
          <button type="button" className="ob-btn ob-btn-ghost ob-btn-xs hidden sm:inline-flex" onClick={() => go("home")}>
            <Icon name="grid" size={14} /> Overview
          </button>
          <HelpMenu />
          <ThemeSwitch />
        </div>
      </div>
      {/* Desktop stepper */}
      <div className="ob-wrap hidden pb-3 md:block">
        <nav className="ob-stepper" aria-label="Onboarding steps">
          {PHASES.map((p, i) => {
            const pr = progress.byKey[p.key];
            const st = view === p.key ? "current" : pr.status === "completed" ? "completed" : pr.status === "blocked" ? "blocked" : "idle";
            return (
              <div key={p.key} className="contents">
                <button type="button" className="ob-step" data-state={st} onClick={() => go(p.key)} aria-current={view === p.key ? "step" : undefined}>
                  <span className="num">{pr.status === "completed" && view !== p.key ? <Icon name="check" size={14} stroke={2.6} /> : p.n}</span>
                  {p.label.toUpperCase()}
                  {p.key === "offer" && pr.status === "optional" ? <span className="text-[10px] font-semibold tracking-wide text-[var(--ob-violet)]">OPTIONAL</span> : null}
                </button>
                {i < PHASES.length - 1 ? <span className="ob-step-line" data-done={pr.status === "completed"} /> : null}
              </div>
            );
          })}
          <span className="ml-4 flex min-w-[150px] items-center gap-3 text-[12.5px] font-semibold text-[var(--ob-ink-2)]">
            <Bar value={progress.overall} className="flex-1" />
            {progress.overall}%
          </span>
        </nav>
      </div>
      {/* Mobile compact stepper */}
      <div className="ob-wrap pb-3 md:hidden">
        <button type="button" className="flex w-full items-center gap-3 text-left" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: "var(--ob-grad)" }}>
            {current?.n ?? "•"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between text-[13px] font-semibold">
              <span className="truncate">{current?.title ?? "Overview"}</span>
              <span className="text-[var(--ob-ink-3)]">Onboarding {progress.overall}% Complete</span>
            </span>
            <Bar value={progress.overall} className="mt-2" />
          </span>
          <Icon name="arrow" className={`transition-transform ${menu ? "rotate-90" : ""}`} />
        </button>
        {menu ? (
          <div className="ob-card mt-3 grid gap-1 p-2">
            {PHASES.map((p) => (
              <button
                key={p.key}
                type="button"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium hover:bg-[var(--ob-card-2)]"
                onClick={() => {
                  setMenu(false);
                  go(p.key);
                }}
              >
                <span className="w-6 text-[11px] font-bold text-[var(--ob-ink-3)]">{p.n}</span>
                <span className="flex-1">{p.title}</span>
                <StatusPill status={progress.byKey[p.key].status} />
              </button>
            ))}
            <button type="button" className="rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-[var(--ob-blue)]" onClick={() => (setMenu(false), go("home"))}>
              ← Onboarding overview
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function HelpMenu() {
  const { state } = usePortal();
  const [open, setOpen] = useState(false);
  const i = state.integrations;
  const wa = i.supportWhatsApp.replace(/[^\d]/g, "");
  return (
    <div className="relative">
      <button type="button" className="ob-icon-btn" aria-label="Contact Madvert" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="help" />
      </button>
      {open ? (
        <div className="ob-card absolute right-0 top-12 z-50 w-[270px] p-3" onMouseLeave={() => setOpen(false)}>
          <p className="px-2 pb-2 pt-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--ob-ink-3)]">Contact Madvert</p>
          <p className="px-2 pb-2 text-[13.5px] text-[var(--ob-ink-2)]">
            {state.onboarding.accountManager.name} is your account manager. We usually reply within a few business hours.
          </p>
          <a className="flex items-center gap-2 rounded-xl px-2 py-2 text-[14px] font-medium hover:bg-[var(--ob-card-2)]" href={`mailto:${state.onboarding.accountManager.email || i.supportEmail}?subject=${encodeURIComponent(`Onboarding question · ${state.onboarding.companyName}`)}`}>
            <Icon name="mail" /> Email us
          </a>
          {wa ? (
            <a className="flex items-center gap-2 rounded-xl px-2 py-2 text-[14px] font-medium hover:bg-[var(--ob-card-2)]" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" /> WhatsApp us
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Footer() {
  return (
    <footer className="ob-wrap relative z-[1] flex flex-col items-center gap-2 pb-10 pt-6 text-center text-[12px] text-[var(--ob-ink-3)]">
      <span className="inline-flex items-center gap-2">
        <Icon name="lock" size={13} /> Private onboarding link · Progress saves automatically · We never ask for your passwords
      </span>
      <span>© {new Date().getFullYear()} Madvert Labs · Digital Marketing & Growth Systems</span>
    </footer>
  );
}

/* ───────── Welcome ───────── */

function Welcome({ go }: { go: (v: View) => void }) {
  const { state, progress } = usePortal();
  const o = state.onboarding;
  const [last, setLast] = useState<View | null>(null);
  useEffect(() => {
    try {
      // Browser-only (localStorage), read after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLast((localStorage.getItem(`mv-onb-last:${o.id}`) as View) || null);
    } catch {}
  }, [o.id]);
  const resume = last && last !== "welcome" ? last : "home";
  const started = Boolean(o.startedAt);

  return (
    <main className="ob-wrap relative flex min-h-[100dvh] flex-col justify-center py-8 sm:py-14">
      <div className="mb-6 flex items-center justify-between">
        <Logo href={null} height={26} priority />
        <ThemeSwitch />
      </div>
      <section className="ob-navy ob-enter">
        <div className="ob-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle, #00b4ff 0%, transparent 65%)" }} aria-hidden="true" />
        <div className="relative grid grid-cols-1 gap-10 p-6 sm:p-12 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:p-16 [&>*]:min-w-0">
          <div>
            <p className="ob-eyebrow !text-[#7fdcff]">Welcome to Madvert Labs</p>
            <h1 className="ob-display mt-6 text-[clamp(40px,7vw,84px)]">
              Welcome,{" "}
              <span className="bg-[linear-gradient(95deg,#3db4ff,#00e5ff_60%,#b8f7ff)] bg-clip-text text-transparent">{o.firstName}.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[clamp(18px,1.7vw,22px)] font-semibold leading-snug text-white">We’re officially in.</p>
            <p className="mt-3 max-w-xl text-[16.5px] leading-relaxed text-[#b4c2d6]">
              The next few steps will give our team everything required to understand your business, connect the right systems and start building.
            </p>
            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[#8a9ab2]">
              You do not need to complete everything in one sitting. Your progress is saved automatically.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Btn size="lg" arrow onClick={() => go(started ? resume : "home")}>
                {started ? "CONTINUE WHERE I LEFT OFF" : "START ONBOARDING"}
              </Btn>
              {started ? (
                <Btn size="lg" variant="ghost" className="!bg-white/5 !text-white !shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18)]" onClick={() => go("home")}>
                  View overview
                </Btn>
              ) : (
                <Btn size="lg" variant="ghost" className="!bg-white/5 !text-white !shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18)]" onClick={() => go(resume)}>
                  Continue where I left off
                </Btn>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="mb-5 hidden items-center gap-4 lg:flex">
              <GlowMark size={64} className="ob-float" />
              <span className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#7fdcff]">Your onboarding</span>
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-[24px] bg-white/[0.04] p-4 [&>*]:min-w-0 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] backdrop-blur sm:p-5">
              <Info label="Company" value={o.companyName} icon="building" />
              <Info label="Your Madvert Team" value={o.team || o.services.join(" + ")} icon="team" />
              <Info label="Account Manager" value={o.accountManager.name} icon="user" photo={o.accountManagerPhoto} />
              <Info label="Estimated onboarding" value={`${o.estimatedMinutes[0]}–${o.estimatedMinutes[1]} minutes`} icon="clock" />
              {started ? (
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between text-[13px] font-semibold text-white">
                    <span>Your progress</span>
                    <span>{progress.overall}%</span>
                  </div>
                  <Bar value={progress.overall} className="mt-3 !bg-white/10" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-px border-t border-white/10 bg-white/[0.06] sm:grid-cols-5">
          {PHASES.map((p) => (
            <div key={p.key} className="bg-[#0a0f1c]/80 px-5 py-4">
              <p className="text-[11px] font-bold tracking-[0.2em] text-[#4fd8ff]">{p.n}</p>
              <p className="mt-1 text-[14px] font-semibold text-white">{p.label}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

function Info({ label, value, icon, photo }: { label: string; value: string; icon: string; photo?: string | null }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/[0.035] px-4 py-3.5">
      {photo ? (
        <span className="ob-avatar h-11 w-11">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="h-full w-full object-cover" />
        </span>
      ) : (
        <Tile3D icon={icon} size={44} tone={icon === "clock" ? "cyan" : "blue"} />
      )}
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f90a8]">{label}</span>
        <span className="block truncate text-[15.5px] font-semibold text-white">{value}</span>
      </span>
    </div>
  );
}

/* ───────── Command center ───────── */

const CARD_COPY: Record<PhaseKey, { title: string; body: string; time: string; icon: string }> = {
  business: { title: "BUSINESS INFORMATION", body: "Tell us how the business works.", time: "Estimated 5 minutes", icon: "flag" },
  access: { title: "ACCESS & CONNECTIONS", body: "Connect advertising, analytics, website and communication systems.", time: "Estimated 10–15 minutes", icon: "link" },
  assets: { title: "BRAND & MARKETING ASSETS", body: "Give our creative team what already exists.", time: "Estimated 5–10 minutes", icon: "upload" },
  offer: { title: "OFFER & STRATEGY", body: "Help us understand what customers should buy and why.", time: "Optional before kickoff", icon: "sparkle" },
  kickoff: { title: "KICKOFF CALL", body: "Meet the team and finalise the growth plan.", time: "45–60 minute call", icon: "calendar" },
};

function Home({ go }: { go: (v: View) => void }) {
  const { state, progress, missing } = usePortal();
  const o = state.onboarding;
  const next = PHASES.find((p) => p.key !== "offer" && progress.byKey[p.key].status !== "completed" && progress.byKey[p.key].status !== "blocked") ?? PHASES[4];
  return (
    <div className="grid gap-8">
      <section className="ob-card ob-card-pad ob-enter overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle,#00d9ff,transparent 65%)" }} aria-hidden="true" />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
          <Ring value={progress.overall} size={148} stroke={12}>
            <span>
              <span className="ob-display block text-[34px]">{progress.overall}%</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ob-ink-3)]">Complete</span>
            </span>
          </Ring>
          <div className="flex-1">
            <p className="ob-eyebrow">Onboarding command center</p>
            <h1 className="ob-h1 mt-4">
              {progress.overall >= 100 ? "Everything is in. " : "Let’s get you "}
              <span className="ob-grad-text">{progress.overall >= 100 ? "Thank you." : "launch-ready."}</span>
            </h1>
            <p className="ob-lead mt-3 max-w-2xl">
              {o.companyName} · {o.team}. Work in any order. We’ll show you what is complete, what remains and what happens next.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <span className="hidden md:block">
              <Art3D name={next.key} size={96} />
            </span>
            <Btn size="lg" arrow onClick={() => go(next.key)}>
              {progress.byKey[next.key].status === "incomplete" ? `Start ${next.label}` : `Continue ${next.label}`}
            </Btn>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {PHASES.map((p, i) => {
          const pr = progress.byKey[p.key];
          const c = CARD_COPY[p.key];
          const cta =
            p.key === "kickoff"
              ? state.booking
                ? "View booking"
                : "Book Kickoff"
              : pr.status === "completed"
                ? "Review"
                : pr.status === "incomplete" || (p.key === "offer" && pr.percent === 0)
                  ? "Start"
                  : "Continue";
          return (
            <button key={p.key} type="button" onClick={() => go(p.key)} className={`ob-card ob-card-hover ob-conn ob-enter`} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <Art3D name={p.key} size={76} className="-ml-1 -mt-1" />
                <span className="text-[12px] font-bold tracking-[0.18em] text-[var(--ob-ink-3)]">{p.n}</span>
              </div>
              <div>
                <p className="text-[13px] font-bold tracking-[0.12em]">{c.title}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--ob-ink-2)]">{c.body}</p>
              </div>
              <div className="mt-auto grid gap-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusPill status={pr.status} />
                  <span className="text-[12px] text-[var(--ob-ink-3)]">{c.time}</span>
                </div>
                <Bar value={pr.percent} />
                <div className="flex items-center justify-between text-[13px] font-semibold">
                  <span className="text-[var(--ob-ink-3)]">{pr.percent}%</span>
                  <span className="inline-flex items-center gap-1 text-[var(--ob-blue)]">
                    {cta} <Icon name="arrow" size={15} />
                  </span>
                </div>
                {pr.note ? <p className="text-[12px] text-[var(--ob-ink-3)]">{pr.note}</p> : null}
              </div>
            </button>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <MissingPanel items={missing} go={go} />
        <section className="ob-navy p-6 sm:p-8">
          <p className="ob-eyebrow !text-[#7fdcff]">What happens next</p>
          <ol className="mt-6 grid gap-4">
            {[
              ["Complete onboarding", "Business, access and assets. Work in any order."],
              ["Book your kickoff", "Pick a time that suits you once business information is in."],
              ["Madvert reviews everything", "Your business, tracking, assets and opportunities, before the call."],
              ["Kickoff call", "Decisions, not data collection. Then we move into active delivery."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full text-[12px] font-bold text-[#03101d]" style={{ background: "linear-gradient(135deg,#00b4ff,#00e5ff)" }}>
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-white">{t}</span>
                  <span className="block text-[13.5px] text-[#9fb0c6]">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <DelegatedList />
    </div>
  );
}

export function MissingPanel({ items, go, title = "Still needed" }: { items: ReturnType<typeof usePortal>["missing"]; go?: (v: View) => void; title?: string }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 6);
  const tone = (s: string) => (s === "Awaiting verification" ? "pending" : s === "Needs help" ? "need_help" : s === "During kickoff" ? "kickoff" : s === "Create before launch" ? "blocked" : "not_started");
  return (
    <section className="ob-card ob-card-pad">
      <div className="flex items-center justify-between">
        <h2 className="ob-h3">{title}</h2>
        <span className="text-[13px] text-[var(--ob-ink-3)]">{items.length ? `${items.length} item${items.length > 1 ? "s" : ""}` : "Nothing missing"}</span>
      </div>
      {items.length ? (
        <ul className="mt-4 divide-y divide-[var(--ob-line)]">
          {shown.map((m) => (
            <li key={m.key} className="flex items-center gap-3 py-3">
              <span className="h-2 w-2 flex-none rounded-full" style={{ background: "var(--ob-grad)" }} />
              <button type="button" className="flex-1 text-left text-[14.5px] font-medium hover:text-[var(--ob-blue)]" onClick={() => go?.(m.phase)}>
                {m.label}
              </button>
              <StatusPill status={tone(m.state)} label={m.state} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[14.5px] text-[var(--ob-ink-2)]">Everything we need is in. Thank you.</p>
      )}
      {items.length > 6 ? (
        <button type="button" className="mt-2 text-[13.5px] font-semibold text-[var(--ob-blue)]" onClick={() => setAll((a) => !a)}>
          {all ? "Show fewer" : `Show all ${items.length}`}
        </button>
      ) : null}
    </section>
  );
}

function DelegatedList() {
  const { state, call } = usePortal();
  if (!state.delegated.length) return null;
  return (
    <section className="ob-card ob-card-pad">
      <h2 className="ob-h3">Tasks you sent to others</h2>
      <ul className="mt-4 divide-y divide-[var(--ob-line)]">
        {state.delegated.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-3 py-3 text-[14px]">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{d.taskLabel}</span>
              <span className="block text-[13px] text-[var(--ob-ink-3)]">
                {d.name}
                {d.role ? ` · ${d.role}` : ""} · {d.email}
              </span>
            </span>
            <StatusPill status={d.status === "completed" ? "completed" : d.status} label={d.status === "sent" ? "Task Sent" : d.status === "opened" ? "Opened" : "Completed"} />
            {d.status !== "completed" ? (
              <button type="button" className="text-[12.5px] font-semibold text-[var(--ob-ink-3)] hover:text-[var(--ob-danger)]" onClick={() => call("delegate-revoke", { id: d.id })}>
                Cancel
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
