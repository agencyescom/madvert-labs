"use client";

import { Art3D } from "../art3d";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OpsDetail } from "@/onboarding/server/ops";
import type { AnswerValue, CloudFolder, DelegatedTask, Engagement, KickoffBooking, Objection, OfferGuarantee, SocialProfile } from "@/onboarding/types";
import { SERVICES } from "@/onboarding/template/services";
import { Btn, CopyButton, Field, Icon, Ring, StatusPill, fmtBytes } from "../kit";
import { Msg, opsCall, useBusy } from "./OpsKit";

type View = Omit<OpsDetail, "ctx"> & {
  onboarding: {
    id: string;
    companyName: string;
    contact: { firstName: string; lastName?: string; email: string; phone?: string };
    status: string;
    expiresAt: string;
    tokenHint: string;
    accountManager: { name: string; email?: string };
    strategist: string;
    assignedOwner: string;
    lastClientActivityAt: string | null;
    startedAt: string | null;
    createdAt: string;
    completedAt: string | null;
  };
  engagement: Engagement;
  answers: Record<string, Record<string, AnswerValue>>;
  template: { business: { key: string; title: string; questions: { key: string; label: string }[] }[] };
  social: SocialProfile[];
  folders: CloudFolder[];
  booking: KickoffBooking | null;
  delegated: Omit<DelegatedTask, "tokenHash">[];
  secrets: { id: string; platform: string; label: string; username: string; createdAt: string; revealedCount: number }[];
  guarantees: OfferGuarantee[];
  objections: Objection[];
  strategyNotes: string;
  offerStatus: string;
};

const NOTE_SECTIONS = ["general", "business", "access", "assets", "offer", "kickoff"];
const NOTE_TAGS = ["Needs new landing page", "No CRM", "Pixel appears broken", "Brand assets low quality", "Strong testimonials available", "Offer weak", "High potential upsell"];
const str = (v: AnswerValue | undefined) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v));
const dt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

export function Detail({ d }: { d: View }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const o = d.onboarding;
  const p = d.progress;
  const acc = Object.fromEntries(d.access.map((a) => [a.key, a]));
  const googleKeys = d.access.filter((a) => ["google_ads", "ga4", "gtm", "search_console", "gbp", "youtube", "merchant_center"].includes(a.key));
  const googleStatus = googleKeys.length ? (googleKeys.every((g) => g.status === "connected" || g.status === "not_required") ? "connected" : googleKeys.some((g) => g.status !== "not_started") ? "pending" : "not_started") : null;
  const tiles: [string, string | null][] = [
    ["Business", p.byKey.business.status],
    ["Meta", acc.meta?.status ?? null],
    ["Google", googleStatus],
    ["Website", acc.website?.status ?? null],
    ["WhatsApp", acc.whatsapp?.status ?? null],
    ["Offer", d.offerStatus],
    ["Kickoff", d.booking?.status === "booked" ? "booked" : "not_started"],
  ];

  return (
    <div className="grid gap-8">
      <Header d={d} refresh={refresh} />
      <CrmPanel d={d} refresh={refresh} />

      <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="ob-navy flex flex-col items-center justify-center gap-3 p-8 text-center">
          <Ring value={p.overall} size={150} stroke={12} dark>
            <span>
              <span className="ob-display block text-[36px] text-white">{p.overall}%</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f90a8]">Onboarding</span>
            </span>
          </Ring>
          <p className="text-[13px] text-[#9fb0c6]">Assets {p.byKey.assets.percent}% · Access {p.byKey.access.percent}%</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {tiles.map(([l, s]) => (
            <div key={l} className="ob-card flex flex-col gap-3 p-4">
              <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ob-ink-3)]">{l}</span>
              {s ? <StatusPill status={s} label={s === "skipped" ? "Skipped" : undefined} /> : <span className="text-[13px] text-[var(--ob-ink-3)]">Not in scope</span>}
            </div>
          ))}
          <div className="ob-card col-span-2 grid gap-1 p-4 sm:col-span-4 xl:col-span-7 xl:grid-cols-4">
            <Meta label="Assigned owner" value={o.assignedOwner || "—"} />
            <Meta label="Last client activity" value={dt(o.lastClientActivityAt)} />
            <Meta label="Kickoff date" value={d.booking?.status === "booked" ? (d.booking.startsAt ? dt(d.booking.startsAt) : "Booked (time pending)") : "Not booked"} />
            <Meta label="Services" value={d.engagement.services.map((s) => SERVICES[s]?.label ?? s).join(", ")} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Missing Access" empty="All access in.">
          {d.missing
            .filter((m) => m.phase === "access")
            .map((m) => (
              <Li key={m.key} label={m.label} right={<StatusPill status={m.state === "Awaiting verification" ? "pending" : m.state === "Needs help" ? "need_help" : "not_started"} label={m.state} />} />
            ))}
        </Panel>
        <Panel title="Missing Assets" empty="Assets complete.">
          {d.missing
            .filter((m) => m.phase === "assets" || m.phase === "business")
            .map((m) => (
              <Li key={m.key} label={m.label} right={<StatusPill status="not_started" label={m.state} />} />
            ))}
        </Panel>
        <Panel title="Risk Flags" empty="No flags.">
          {d.risks.map((r, i) => (
            <Li key={i} label={r.label} right={<StatusPill status={r.level === "high" ? "blocked" : r.level === "medium" ? "need_help" : "optional"} label={r.level} />} />
          ))}
        </Panel>
      </div>

      {d.questions.length ? (
        <Panel title="Client Questions & notes" empty="">
          {d.questions.map((q, i) => (
            <li key={i} className="py-3">
              <p className="text-[13px] font-semibold text-[var(--ob-ink-3)]">
                {q.q} · {q.by}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[14.5px]">{q.a}</p>
            </li>
          ))}
        </Panel>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-6">
          <AccessPanel d={d} refresh={refresh} />
          <BusinessPanel d={d} />
          <AssetsPanel d={d} />
          <OfferPanel d={d} refresh={refresh} />
        </div>
        <div className="grid content-start gap-6">
          <Notes d={d} refresh={refresh} />
          <Assign d={d} refresh={refresh} />
          <BookingPanel d={d} refresh={refresh} />
          <Delegated d={d} />
          <Timeline d={d} />
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ob-ink-3)]">{label}</p>
      <p className="text-[14px] font-semibold">{value}</p>
    </div>
  );
}

function Panel({ title, children, empty, action }: { title: string; children: React.ReactNode; empty: string; action?: React.ReactNode }) {
  const arr = Array.isArray(children) ? children.flat().filter(Boolean) : children ? [children] : [];
  return (
    <section className="ob-card ob-card-pad">
      <div className="flex items-center justify-between gap-3">
        <h2 className="ob-h3">{title}</h2>
        {action}
      </div>
      {arr.length ? <ul className="mt-3 divide-y divide-[var(--ob-line)]">{children}</ul> : empty ? <p className="mt-3 text-[14px] text-[var(--ob-ink-3)]">{empty}</p> : null}
    </section>
  );
}

function Li({ label, right }: { label: React.ReactNode; right?: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
      <span className="min-w-0">{label}</span>
      {right}
    </li>
  );
}

function Header({ d, refresh }: { d: View; refresh: () => void }) {
  const o = d.onboarding;
  const { busy, msg, run } = useBusy();
  const [link, setLink] = useState(d.link);
  return (
    <section className="ob-card ob-card-pad">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="ob-eyebrow">Client</p>
          <h1 className="ob-h1 mt-3">{o.companyName}</h1>
          <p className="mt-2 text-[14.5px] text-[var(--ob-ink-2)]">
            {o.contact.firstName} {o.contact.lastName ?? ""} · {o.contact.email}
            {o.contact.phone ? ` · ${o.contact.phone}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusPill status={o.status === "active" ? "in_progress" : o.status === "completed" ? "completed" : "blocked"} label={o.status} />
            <span className="text-[12.5px] text-[var(--ob-ink-3)]">
              Link ••••{o.tokenHint} · expires {new Date(o.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="ob-btn ob-btn-primary ob-btn-sm" href={`/api/ops/pdf/${o.id}`}>
            <Icon name="download" size={15} /> PDF summary
          </a>
          {link && o.status !== "revoked" ? <CopyButton value={link} label="Copy client link" /> : null}
          <Btn
            variant="ghost"
            size="xs"
            icon="refresh"
            disabled={busy}
            onClick={async () => {
              if (!confirm("Create a new link? The current link stops working.")) return;
              const r = await run(() => opsCall<{ url: string }>("regenerate", { id: o.id }), "New link created. The old link no longer works.");
              if (!r.error) {
                setLink(r.url);
                refresh();
              }
            }}
          >
            New link
          </Btn>
          <Btn
            variant="ghost"
            size="xs"
            icon="mail"
            disabled={busy}
            onClick={async () => {
              const r = await run(() => opsCall<{ url: string; emailed: boolean }>("send-link", { id: o.id }));
              if (!r.error) {
                setLink(r.url);
                alert(r.emailed ? "Fresh link emailed to the client." : "Fresh link created, but email is not configured. Copy it and send it manually.");
                refresh();
              }
            }}
          >
            Email fresh link
          </Btn>
          {o.status !== "revoked" ? (
            <Btn
              variant="ghost"
              size="xs"
              icon="x"
              disabled={busy}
              onClick={async () => {
                if (!confirm("Revoke this onboarding link and all delegated task links?")) return;
                await run(() => opsCall("revoke", { id: o.id }), "Link revoked.");
                refresh();
              }}
            >
              Revoke
            </Btn>
          ) : null}
        </div>
      </div>
      <Msg msg={msg} />
    </section>
  );
}

function AccessPanel({ d, refresh }: { d: View; refresh: () => void }) {
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const set = async (platform: string, status: string) => {
    await opsCall("access", { id: d.onboarding.id, platform, status });
    refresh();
  };
  return (
    <section className="ob-card ob-card-pad">
      <h2 className="ob-h3">Access & connections</h2>
      <ul className="mt-3 divide-y divide-[var(--ob-line)]">
        {d.access.map((a) => {
          const det = Object.entries(a.details).filter(([, v]) => v !== null && v !== "" && !(Array.isArray(v) && !v.length));
          return (
            <li key={a.key} className="grid gap-2 py-3.5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="min-w-0 flex-1 text-[14.5px] font-semibold">
                  {a.label} {a.required ? "" : <span className="text-[12px] font-normal text-[var(--ob-ink-3)]">(optional)</span>}
                </span>
                <StatusPill status={a.status} label={a.statusLabel} />
                <select className="ob-select !min-h-[34px] !w-auto !rounded-lg !py-1 !pl-3 !text-[12.5px]" value="" onChange={(e) => e.target.value && set(a.key, e.target.value)} aria-label={`Set ${a.label} status`}>
                  <option value="">Set status…</option>
                  <option value="connected">Verified · Connected</option>
                  <option value="pending">Pending</option>
                  <option value="need_help">Need help</option>
                  <option value="kickoff">During kickoff</option>
                  <option value="not_required">Not required</option>
                  <option value="not_started">Not started</option>
                </select>
              </div>
              {det.length ? (
                <p className="text-[12.5px] text-[var(--ob-ink-3)]">
                  {det.map(([k, v]) => `${k.replace(/_/g, " ")}: ${str(v)}`).join(" · ")}
                  {a.verifiedBy ? ` · verified by ${a.verifiedBy}` : ""}
                </p>
              ) : null}
              {d.secrets
                .filter((s) => s.platform === a.key)
                .map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-[var(--ob-card-2)] px-3 py-2 text-[12.5px]">
                    <Icon name="lock" size={14} className="text-[var(--ob-blue)]" />
                    <strong>Secure Credential</strong> · {s.label} {s.username ? `· ${s.username}` : ""} · revealed {s.revealedCount}×
                    {revealed[s.id] ? (
                      <code className="ml-auto rounded bg-[var(--ob-card-solid)] px-2 py-0.5">{revealed[s.id]}</code>
                    ) : (
                      <button
                        type="button"
                        className="ml-auto font-semibold text-[var(--ob-blue)]"
                        onClick={async () => {
                          if (!confirm("Reveal this credential? This is logged in the audit trail.")) return;
                          const r = await opsCall<{ value: string }>("secret-reveal", { secretId: s.id });
                          if (r.error) alert(r.error);
                          else {
                            setRevealed((x) => ({ ...x, [s.id]: r.value }));
                            setTimeout(() => setRevealed((x) => ({ ...x, [s.id]: "" })), 30000);
                          }
                        }}
                      >
                        Reveal (30s)
                      </button>
                    )}
                  </div>
                ))}
            </li>
          );
        })}
      </ul>
      {d.social.length ? (
        <div className="mt-4 rounded-2xl bg-[var(--ob-card-2)] p-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--ob-ink-3)]">Social profiles</p>
          <ul className="mt-2 grid gap-1 text-[13.5px]">
            {d.social.map((s) => (
              <li key={s.id}>
                <strong>{s.platform}</strong> · {s.url ? <a className="text-[var(--ob-blue)]" href={s.url} target="_blank" rel="noopener noreferrer">{s.url}</a> : s.username} · {s.accessStatus.replace("_", " ")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function BusinessPanel({ d }: { d: View }) {
  return (
    <section className="ob-card ob-card-pad">
      <h2 className="ob-h3">Business information</h2>
      <div className="mt-4 grid gap-6">
        {d.template.business.map((s) => (
          <div key={s.key}>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ob-blue)]">{s.title}</p>
            <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {s.questions.map((q) => (
                <div key={q.key}>
                  <dt className="text-[12px] text-[var(--ob-ink-3)]">{q.label}</dt>
                  <dd className="whitespace-pre-wrap text-[14px]">{str(d.answers[s.key]?.[q.key]) || <span className="text-[var(--ob-ink-3)]">—</span>}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

function AssetsPanel({ d }: { d: View }) {
  const drive = d.folders.find((f) => f.provider === "google_drive" && f.id.endsWith(":drive:root"));
  const byFolder = d.assets.reduce<Record<string, typeof d.assets>>((m, a) => ((m[a.folder] ??= []).push(a), m), {});
  return (
    <section className="ob-card ob-card-pad">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="ob-h3">Client workspace · {d.assets.length} item(s)</h2>
        {drive?.externalUrl ? (
          <a className="ob-btn ob-btn-ghost ob-btn-xs" href={drive.externalUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="external" size={14} /> Google Drive folder
          </a>
        ) : (
          <span className="ob-pill" data-tone="warn">
            <span className="dot" /> Drive: Configuration Required
          </span>
        )}
      </div>
      {Object.keys(byFolder).length ? (
        <div className="mt-4 grid gap-4">
          {Object.entries(byFolder)
            .sort()
            .map(([folder, items]) => (
              <div key={folder}>
                <p className="text-[12.5px] font-bold text-[var(--ob-ink-2)]">
                  {d.onboarding.companyName}/{folder}
                </p>
                <ul className="mt-1.5 grid gap-1">
                  {items.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-2 text-[13.5px]">
                      <Icon name={a.kind === "link" ? "link" : "file"} size={14} className="text-[var(--ob-blue)]" />
                      <a className="font-medium hover:text-[var(--ob-blue)]" href={a.url} target="_blank" rel="noopener noreferrer">
                        {a.name}
                      </a>
                      <span className="text-[12px] text-[var(--ob-ink-3)]">
                        {a.category}
                        {a.size ? ` · ${fmtBytes(a.size)}` : ""} · {a.by}
                        {a.note ? ` · “${a.note}”` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      ) : (
        <p className="mt-3 text-[14px] text-[var(--ob-ink-3)]">No assets yet.</p>
      )}
      {d.answers["assets.social_proof"]?.permission ? (
        <p className="mt-4 text-[13px] text-[var(--ob-ink-2)]">Public use of proof: <strong>{str(d.answers["assets.social_proof"].permission)}</strong></p>
      ) : null}
    </section>
  );
}

function OfferPanel({ d, refresh }: { d: View; refresh: () => void }) {
  const [notes, setNotes] = useState(d.strategyNotes);
  const [obj, setObj] = useState(d.objections);
  const { busy, msg, run } = useBusy();
  return (
    <section className="ob-card ob-card-pad">
      <div className="flex items-center justify-between">
        <h2 className="ob-h3">Offer summary (internal draft)</h2>
        <StatusPill status={d.offerStatus} label={d.offerStatus === "skipped" ? "During kickoff" : undefined} />
      </div>
      <p className="mt-2 flex flex-wrap gap-2 text-[12px]">
        <span className="ob-pill" data-tone="progress">CLIENT-PROVIDED FACT</span>
        <span className="ob-pill" data-tone="violet">MADVERT STRATEGY IDEA</span>
      </p>
      <div className="mt-4 grid gap-5">
        {d.offer.map((s) => (
          <div key={s.title}>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--ob-blue)]">{s.title}</p>
            <ul className="mt-2 grid gap-2">
              {s.items.map((i, n) => (
                <li key={n} className="rounded-xl bg-[var(--ob-card-2)] px-3 py-2 text-[13.5px]">
                  <span className="ob-pill mr-2 !h-5 !text-[10px]" data-tone={i.source.startsWith("MADVERT") ? "violet" : "progress"}>
                    {i.source}
                  </span>
                  <strong>{i.label}:</strong> {i.value}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!d.offer.length ? <p className="text-[14px] text-[var(--ob-ink-3)]">No workshop answers yet.</p> : null}
      </div>
      {obj.length ? (
        <div className="mt-6">
          <p className="text-[13px] font-semibold">Madvert strategy notes per objection (team only)</p>
          <div className="mt-2 grid gap-2">
            {obj.map((o, i) => (
              <Field key={o.id} label={o.objection} htmlFor={`obj-${o.id}`}>
                <input id={`obj-${o.id}`} className="ob-input !min-h-[42px]" value={o.strategyNotes ?? ""} onChange={(e) => setObj(obj.map((x, n) => (n === i ? { ...x, strategyNotes: e.target.value } : x)))} />
              </Field>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-6">
        <Field label="Madvert strategy notes (shown as MADVERT STRATEGY IDEA in the PDF)" htmlFor="sn">
          <textarea id="sn" className="ob-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Btn
          size="sm"
          className="mt-3"
          disabled={busy}
          onClick={async () => {
            await run(() => opsCall("offer-notes", { id: d.onboarding.id, strategyNotes: notes, objections: obj.length ? obj : undefined }), "Saved.");
            refresh();
          }}
        >
          Save strategy notes
        </Btn>
        <Msg msg={msg} />
      </div>
    </section>
  );
}

function Notes({ d, refresh }: { d: View; refresh: () => void }) {
  const [f, setF] = useState({ sectionKey: "general", body: "", tag: "" });
  const { busy, msg, run } = useBusy();
  return (
    <section className="ob-navy p-6">
      <p className="text-[11px] font-bold tracking-[0.2em] text-[#7fdcff]">INTERNAL NOTES · CLIENT CANNOT SEE THESE</p>
      <div className="mt-4 grid gap-3">
        <div className="flex gap-2">
          <select className="ob-select !min-h-[40px] !bg-white/5 !py-1.5 !text-white" value={f.sectionKey} onChange={(e) => setF({ ...f, sectionKey: e.target.value })} aria-label="Section">
            {NOTE_SECTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
            {d.access.map((a) => (
              <option key={a.key} value={`access:${a.key}`}>
                access: {a.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {NOTE_TAGS.map((t) => (
            <button key={t} type="button" onClick={() => setF({ ...f, tag: f.tag === t ? "" : t, body: f.body || t })} className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${f.tag === t ? "bg-[#00b4ff] text-[#03101d]" : "bg-white/10 text-[#c4d1e2]"}`}>
              {t}
            </button>
          ))}
        </div>
        <textarea className="ob-textarea !min-h-[80px] !bg-white/5 !text-white" placeholder="Pixel appears broken on checkout…" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} aria-label="Note" />
        <Btn
          size="sm"
          icon="plus"
          disabled={busy || !f.body.trim()}
          onClick={async () => {
            const r = await run(() => opsCall("note", { id: d.onboarding.id, ...f }));
            if (!r.error) {
              setF({ ...f, body: "", tag: "" });
              refresh();
            }
          }}
        >
          Add note
        </Btn>
        <Msg msg={msg} />
      </div>
      <ul className="mt-5 grid gap-2">
        {d.notes.map((n) => (
          <li key={n.id} className="rounded-2xl bg-white/[0.05] p-3 text-[13.5px] text-[#dbe5f1]">
            <div className="flex items-center justify-between gap-2 text-[11.5px] text-[#8a9ab2]">
              <span>
                <strong className="text-[#7fdcff]">{n.sectionKey}</strong>
                {n.tag ? ` · ${n.tag}` : ""} · {n.author} · {dt(n.createdAt)}
              </span>
              <button
                type="button"
                className="hover:text-white"
                aria-label="Delete note"
                onClick={async () => {
                  await opsCall("note-delete", { noteId: n.id });
                  refresh();
                }}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
            <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Assign({ d, refresh }: { d: View; refresh: () => void }) {
  const [f, setF] = useState({ assignedOwner: d.onboarding.assignedOwner, strategist: d.onboarding.strategist, accountManager: d.onboarding.accountManager.name });
  const { busy, msg, run } = useBusy();
  return (
    <section className="ob-card ob-card-pad">
      <h2 className="ob-h3">Team</h2>
      <div className="mt-4 grid gap-3">
        {(
          [
            ["assignedOwner", "Assigned owner"],
            ["accountManager", "Account manager"],
            ["strategist", "Strategist"],
          ] as const
        ).map(([k, l]) => (
          <Field key={k} label={l} htmlFor={`as-${k}`}>
            <input id={`as-${k}`} className="ob-input !min-h-[42px]" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
          </Field>
        ))}
        <Btn
          size="sm"
          disabled={busy}
          onClick={async () => {
            await run(() => opsCall("assign", { id: d.onboarding.id, ...f }), "Saved.");
            refresh();
          }}
        >
          Save
        </Btn>
        <Msg msg={msg} />
      </div>
    </section>
  );
}

function BookingPanel({ d, refresh }: { d: View; refresh: () => void }) {
  const b = d.booking;
  const [f, setF] = useState({ startsAt: b?.startsAt ? b.startsAt.slice(0, 16) : "", timezone: b?.timezone ?? "", meetingUrl: b?.meetingUrl ?? "" });
  const { busy, msg, run } = useBusy();
  return (
    <section className="ob-card ob-card-pad">
      <div className="flex items-center justify-between">
        <h2 className="ob-h3">Kickoff</h2>
        <StatusPill status={b?.status === "booked" ? "booked" : "not_started"} label={b?.status === "booked" ? `Booked · ${b.source}` : "Not booked"} />
      </div>
      <div className="mt-4 grid gap-3">
        <Field label="Date & time (UTC)" htmlFor="bk-at">
          <input id="bk-at" type="datetime-local" className="ob-input !min-h-[42px]" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Client timezone" htmlFor="bk-tz">
            <input id="bk-tz" className="ob-input !min-h-[42px]" placeholder="Asia/Dubai" value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })} />
          </Field>
          <Field label="Meeting link" htmlFor="bk-url">
            <input id="bk-url" className="ob-input !min-h-[42px]" placeholder="https://" value={f.meetingUrl} onChange={(e) => setF({ ...f, meetingUrl: e.target.value })} />
          </Field>
        </div>
        <Btn
          size="sm"
          disabled={busy}
          onClick={async () => {
            await run(() => opsCall("booking", { id: d.onboarding.id, ...f, startsAt: f.startsAt ? `${f.startsAt}:00Z` : undefined }), "Kickoff saved.");
            refresh();
          }}
        >
          {b ? "Update kickoff" : "Mark kickoff booked"}
        </Btn>
        <Msg msg={msg} />
      </div>
    </section>
  );
}

function Delegated({ d }: { d: View }) {
  if (!d.delegated.length) return null;
  return (
    <Panel title="Delegated tasks" empty="">
      {d.delegated.map((t) => (
        <Li
          key={t.id}
          label={
            <span>
              <span className="block font-semibold">{t.taskLabel}</span>
              <span className="block text-[12px] text-[var(--ob-ink-3)]">
                {t.name} {t.role ? `(${t.role})` : ""} · {t.email} · {t.emailDelivered ? "emailed" : "link shared manually"}
              </span>
            </span>
          }
          right={<StatusPill status={t.status === "completed" ? "completed" : t.status === "revoked" ? "blocked" : t.status} label={{ sent: "Task Sent", opened: "Opened", completed: "Completed", revoked: "Revoked" }[t.status]} />}
        />
      ))}
    </Panel>
  );
}

function Timeline({ d }: { d: View }) {
  const [tab, setTab] = useState<"events" | "audit">("events");
  return (
    <section className="ob-card ob-card-pad">
      <div className="flex gap-2">
        {(["events", "audit"] as const).map((t) => (
          <button key={t} type="button" className="ob-chip !h-8 !text-[12.5px]" aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t === "events" ? "Automation events" : "Audit log"}
          </button>
        ))}
      </div>
      <ul className="mt-4 grid max-h-[420px] gap-2 overflow-y-auto pr-1">
        {tab === "events"
          ? d.events.map((e) => (
              <li key={e.id} className="text-[13px]">
                <span className="font-mono text-[12px] font-semibold text-[var(--ob-blue)]">{e.name}</span>
                <span className="ml-2 text-[var(--ob-ink-3)]">
                  {dt(e.createdAt)} · delivered to {e.delivered} destination(s)
                </span>
              </li>
            ))
          : d.audits.map((a) => (
              <li key={a.id} className="text-[13px]">
                <span className="font-semibold">{a.action}</span>
                <span className="ml-2 text-[var(--ob-ink-3)]">
                  {a.actor} · {a.target ?? ""} · {dt(a.createdAt)}
                </span>
              </li>
            ))}
        {(tab === "events" ? d.events : d.audits).length === 0 ? <li className="text-[13px] text-[var(--ob-ink-3)]">Nothing yet.</li> : null}
      </ul>
    </section>
  );
}

function CrmPanel({ d, refresh }: { d: View; refresh: () => void }) {
  const { busy, msg, run } = useBusy();
  const c = d.crm;
  const synced = c.synced;
  const go = async () => {
    if (!c.complete && !synced && !confirm("Onboarding isn’t complete yet. Create the client in the CRM anyway?")) return;
    await run(() => opsCall("crm", { id: d.onboarding.id }), synced ? "CRM record updated." : "Client created in the CRM.");
    refresh();
  };
  return (
    <section className={`${c.complete && !synced ? "ob-navy" : "ob-card"} relative overflow-hidden p-5 sm:p-6`}>
      <div className="relative flex flex-wrap items-center gap-5">
        <Art3D name="crm" size={68} />
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-bold tracking-[0.2em] ${c.complete && !synced ? "text-[#7fdcff]" : "text-[var(--ob-blue)]"}`}>
            {synced ? "IN CRM" : c.complete ? "ONBOARDING COMPLETE" : "CRM"}
          </p>
          <p className={`text-[17px] font-semibold ${c.complete && !synced ? "text-white" : ""}`}>
            {synced
              ? `Synced ${new Date(synced.syncedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} by ${synced.syncedBy} · ${synced.provider === "gohighlevel" ? "GoHighLevel" : "automation webhook"}`
              : c.complete
                ? "Everything is in. Create the client in your CRM with one click."
                : "Create the client in your CRM once onboarding is complete."}
          </p>
          {c.mode === "none" ? <p className="mt-1 text-[13px] text-[var(--ob-warn)]">Configuration required: GHL_ACCESS_TOKEN + GHL_LOCATION_ID, or an automation webhook.</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {synced?.url ? (
            <a href={synced.url} target="_blank" rel="noopener noreferrer" className="ob-btn ob-btn-ghost ob-btn-sm">
              <Icon name="external" size={15} /> Open in CRM
            </a>
          ) : null}
          <Btn size="sm" icon={synced ? "refresh" : "plus"} disabled={busy || c.mode === "none"} onClick={go}>
            {busy ? "Working…" : synced ? "Sync again" : "Create client in CRM"}
          </Btn>
        </div>
      </div>
      <Msg msg={msg} />
    </section>
  );
}
