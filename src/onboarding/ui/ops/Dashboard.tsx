"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, Btn, Icon, StatusPill } from "../kit";

type Row = {
  id: string;
  company: string;
  contact: string;
  status: string;
  services: string[];
  overall: number;
  business: string;
  meta: string | null;
  google: string | null;
  website: string | null;
  whatsapp: string | null;
  assets: number;
  offer: string;
  kickoff: string | null;
  lastActivity: string | null;
  owner: string;
  risks: number;
};

const ago = (iso: string | null) => {
  if (!iso) return "Not opened";
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
};

export function Dashboard({ rows, config }: { rows: Row[]; config: { label: string; ok: boolean; note: string }[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "booked" | "risk">("all");
  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!q || `${r.company} ${r.contact} ${r.owner}`.toLowerCase().includes(q.toLowerCase())) &&
          (filter === "all" || (filter === "active" && r.status === "active") || (filter === "booked" && r.kickoff) || (filter === "risk" && r.risks > 0)),
      ),
    [rows, q, filter],
  );
  const missingConfig = config.filter((c) => !c.ok);
  const stats = [
    { label: "Active onboardings", value: rows.filter((r) => r.status === "active").length },
    { label: "Average progress", value: `${rows.length ? Math.round(rows.reduce((s, r) => s + r.overall, 0) / rows.length) : 0}%` },
    { label: "Kickoffs booked", value: rows.filter((r) => r.kickoff).length },
    { label: "Need attention", value: rows.filter((r) => r.risks > 0).length },
  ];
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ob-eyebrow">Madvert Operations</p>
          <h1 className="ob-h1 mt-3">
            Client <span className="ob-grad-text">Onboarding</span>
          </h1>
        </div>
        <Link href="/ops/onboarding/new" className="ob-btn ob-btn-primary">
          <Icon name="plus" /> New onboarding
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={i === 0 ? "ob-navy p-6" : "ob-card p-6"}>
            <p className={`text-[12px] font-semibold uppercase tracking-[0.16em] ${i === 0 ? "text-[#7fdcff]" : "text-[var(--ob-ink-3)]"}`}>{s.label}</p>
            <p className={`ob-display mt-2 text-[40px] ${i === 0 ? "text-white" : "ob-grad-text"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {missingConfig.length ? (
        <details className="ob-card ob-card-pad">
          <summary className="flex cursor-pointer items-center gap-3 text-[15px] font-semibold">
            <span className="ob-pill" data-tone="warn">
              <span className="dot" />
              Configuration Required
            </span>
            {missingConfig.length} integration{missingConfig.length > 1 ? "s" : ""} not configured. The portal works; these features are limited until set.
          </summary>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {config.map((c) => (
              <li key={c.label} className="flex items-start gap-3 rounded-xl bg-[var(--ob-card-2)] p-3 text-[13.5px]">
                <StatusPill status={c.ok ? "completed" : "blocked"} label={c.ok ? "Ready" : "Configure"} />
                <span>
                  <strong>{c.label}</strong>
                  <span className="block text-[var(--ob-ink-3)]">{c.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <section className="ob-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
          <input className="ob-input !min-h-[42px] max-w-xs !py-2" placeholder="Search clients…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          <div className="flex flex-wrap gap-2">
            {(["all", "active", "booked", "risk"] as const).map((f) => (
              <button key={f} type="button" className="ob-chip !h-9" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {{ all: "All", active: "Active", booked: "Kickoff booked", risk: "Risk flags" }[f]}
              </button>
            ))}
          </div>
        </div>
        {shown.length ? (
          <div className="overflow-x-auto">
            <table className="ob-table min-w-[1180px]">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Onboarding</th>
                  <th>Business</th>
                  <th>Meta</th>
                  <th>Google</th>
                  <th>Website</th>
                  <th>WhatsApp</th>
                  <th>Assets</th>
                  <th>Offer</th>
                  <th>Kickoff</th>
                  <th>Activity</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/ops/onboarding/${r.id}`} className="block font-semibold hover:text-[var(--ob-blue)]">
                        {r.company}
                        {r.risks ? <span className="ml-2 inline-grid h-5 min-w-5 place-items-center rounded-full bg-[var(--ob-danger-bg)] px-1.5 text-[11px] text-[var(--ob-danger)]">{r.risks}</span> : null}
                      </Link>
                      <span className="block text-[12px] text-[var(--ob-ink-3)]">{r.contact}</span>
                    </td>
                    <td className="min-w-[140px]">
                      <span className="text-[13px] font-semibold">{r.overall}%</span>
                      <Bar value={r.overall} className="mt-1.5" />
                    </td>
                    <td>
                      <StatusPill status={r.business} />
                    </td>
                    {[r.meta, r.google, r.website, r.whatsapp].map((s, i) => (
                      <td key={i}>{s ? <StatusPill status={s} /> : <span className="text-[12px] text-[var(--ob-ink-3)]">n/a</span>}</td>
                    ))}
                    <td className="text-[13px] font-semibold">{r.assets}%</td>
                    <td>
                      <StatusPill status={r.offer} label={r.offer === "skipped" ? "Skipped" : undefined} />
                    </td>
                    <td className="text-[13px]">{r.kickoff ? (r.kickoff === "booked" ? <StatusPill status="booked" /> : new Date(r.kickoff).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })) : "Not booked"}</td>
                    <td className="text-[13px] text-[var(--ob-ink-2)]">{ago(r.lastActivity)}</td>
                    <td className="text-[13px]">{r.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid place-items-center gap-4 p-14 text-center">
            <p className="ob-h3">{rows.length ? "No onboardings match." : "No onboardings yet."}</p>
            {!rows.length ? (
              <Link href="/ops/onboarding/new">
                <Btn arrow>Create the first one</Btn>
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
