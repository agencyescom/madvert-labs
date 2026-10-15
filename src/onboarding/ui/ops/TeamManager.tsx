"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Btn, CopyButton, Field, GlowMark, StatusPill, Waves } from "../kit";
import { Msg, opsCall, useBusy, type OpsUser } from "./OpsKit";

type Row = { id: string; email: string; name: string; role: OpsUser["role"]; status: "invited" | "active" | "disabled"; lastLoginAt: string | null; invitePending: boolean };

const ROLE_HELP: Record<OpsUser["role"], string> = {
  owner: "Everything, including other owners and removing accounts.",
  admin: "Onboardings, settings, guides, template, team and revealing secure credentials.",
  member: "Create and run onboardings, notes, verification, CRM and PDFs. No settings or credential reveal.",
};

export function TeamManager({ me, users, emailEnabled }: { me: OpsUser & { id: string }; users: Row[]; emailEnabled: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", role: "member" as OpsUser["role"] });
  const [link, setLink] = useState<{ email: string; url: string; emailed: boolean } | null>(null);
  const { busy, msg, run } = useBusy();
  const act = async (action: string, body: Record<string, unknown>, ok?: string) => {
    const r = await run(() => opsCall<{ link?: string; emailed?: boolean }>(action, body), ok);
    if (!r.error) router.refresh();
    return r;
  };
  return (
    <div className="mx-auto grid max-w-5xl gap-8">
      <div>
        <p className="ob-eyebrow">Madvert Operations</p>
        <h1 className="ob-h1 mt-3">
          Your <span className="ob-grad-text">team</span>
        </h1>
        <p className="ob-lead mt-3">Everyone signs in with their own account. Every action in onboarding is recorded against the person who did it.</p>
      </div>

      <section className="ob-card ob-card-pad grid gap-5">
        <h2 className="ob-h3">Invite a team member</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_1.3fr_180px]">
          <Field label="Name" htmlFor="ti-n">
            <input id="ti-n" className="ob-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Work email" htmlFor="ti-e">
            <input id="ti-e" type="email" className="ob-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </Field>
          <Field label="Role" htmlFor="ti-r">
            <select id="ti-r" className="ob-select" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as OpsUser["role"] })}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              {me.role === "owner" ? <option value="owner">Owner</option> : null}
            </select>
          </Field>
        </div>
        <p className="text-[13px] text-[var(--ob-ink-3)]">{ROLE_HELP[f.role]}</p>
        <div>
          <Btn
            icon="send"
            disabled={busy || !f.email}
            onClick={async () => {
              const r = await act("team-invite", f);
              if (!r.error && r.link) {
                setLink({ email: f.email, url: r.link, emailed: Boolean(r.emailed) });
                setF({ name: "", email: "", role: "member" });
              }
            }}
          >
            Send invite
          </Btn>
        </div>
        {link ? (
          <div className="rounded-2xl bg-[var(--ob-card-2)] p-4">
            <p className="text-[14px]">{link.emailed ? `Invite emailed to ${link.email}.` : `Email isn’t configured, so share this one-time link with ${link.email}:`}</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate text-[12.5px]">{link.url}</code>
              <CopyButton value={link.url} />
            </div>
          </div>
        ) : null}
        {!emailEnabled ? <p className="text-[12.5px] text-[var(--ob-ink-3)]">Tip: set RESEND_API_KEY + EMAIL_FROM so invites are emailed automatically.</p> : null}
        <Msg msg={msg} />
      </section>

      <section className="ob-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ob-table min-w-[760px]">
            <thead>
              <tr>
                <th>Person</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last sign in</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const self = u.id === me.id;
                const canEdit = !self && (u.role !== "owner" || me.role === "owner");
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: "var(--ob-grad)" }}>
                          {(u.name || u.email).slice(0, 1).toUpperCase()}
                        </span>
                        <span>
                          <span className="block font-semibold">
                            {u.name} {self ? <span className="text-[12px] font-normal text-[var(--ob-ink-3)]">(you)</span> : null}
                          </span>
                          <span className="block text-[12.5px] text-[var(--ob-ink-3)]">{u.email}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      {canEdit ? (
                        <select className="ob-select !min-h-[36px] !w-auto !py-1 !text-[13px]" value={u.role} onChange={(e) => act("team-update", { id: u.id, role: e.target.value })} aria-label={`Role for ${u.email}`}>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          {me.role === "owner" ? <option value="owner">Owner</option> : null}
                        </select>
                      ) : (
                        <span className="text-[13.5px] font-semibold capitalize">{u.role}</span>
                      )}
                    </td>
                    <td>
                      <StatusPill
                        status={u.status === "active" ? "completed" : u.status === "invited" ? "pending" : "blocked"}
                        label={u.status === "invited" ? (u.invitePending ? "Invite sent" : "Invite expired") : u.status === "active" ? "Active" : "Disabled"}
                      />
                    </td>
                    <td className="text-[13px] text-[var(--ob-ink-2)]">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Never"}</td>
                    <td>
                      {canEdit ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Btn
                            size="xs"
                            variant="ghost"
                            icon="refresh"
                            onClick={async () => {
                              const r = await act("team-reset", { id: u.id });
                              if (!r.error && r.link) setLink({ email: u.email, url: r.link, emailed: Boolean(r.emailed) });
                            }}
                          >
                            {u.status === "invited" ? "Resend" : "Reset password"}
                          </Btn>
                          {u.status !== "invited" ? (
                            <Btn size="xs" variant="ghost" onClick={() => act("team-update", { id: u.id, status: u.status === "disabled" ? "active" : "disabled" })}>
                              {u.status === "disabled" ? "Enable" : "Disable"}
                            </Btn>
                          ) : null}
                          {me.role === "owner" ? (
                            <Btn size="xs" variant="ghost" icon="trash" onClick={() => confirm(`Remove ${u.email}?`) && act("team-delete", { id: u.id })}>
                              Remove
                            </Btn>
                          ) : null}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="ob-card ob-card-pad grid gap-2 text-[13.5px] text-[var(--ob-ink-2)] sm:grid-cols-3">
        {(Object.keys(ROLE_HELP) as OpsUser["role"][]).map((r) => (
          <p key={r}>
            <strong className="capitalize text-[var(--ob-ink)]">{r}</strong>: {ROLE_HELP[r]}
          </p>
        ))}
      </section>
    </div>
  );
}

export function AccountForm({ me }: { me: OpsUser }) {
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const { busy, msg, setMsg, run } = useBusy();
  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <div>
        <p className="ob-eyebrow">Your account</p>
        <h1 className="ob-h1 mt-3">{me.name}</h1>
        <p className="ob-lead mt-2">
          {me.email} · <span className="capitalize">{me.role}</span>
        </p>
      </div>
      <section className="ob-card ob-card-pad grid gap-4">
        <h2 className="ob-h3">Change password</h2>
        <Field label="Current password" htmlFor="ac-c">
          <input id="ac-c" type="password" autoComplete="current-password" className="ob-input" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} />
        </Field>
        <Field label="New password" help="At least 10 characters. Changing it signs you out everywhere else." htmlFor="ac-n">
          <input id="ac-n" type="password" autoComplete="new-password" className="ob-input" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} />
        </Field>
        <Field label="Confirm new password" htmlFor="ac-x">
          <input id="ac-x" type="password" autoComplete="new-password" className="ob-input" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} />
        </Field>
        <Btn
          disabled={busy || !f.current || !f.next}
          onClick={async () => {
            if (f.next !== f.confirm) return setMsg({ tone: "danger", text: "The new passwords don’t match." });
            const r = await run(() => opsCall("account-password", { current: f.current, next: f.next }), "Password changed.");
            if (!r.error) setF({ current: "", next: "", confirm: "" });
          }}
        >
          Update password
        </Btn>
        <Msg msg={msg} />
      </section>
    </div>
  );
}

export function InviteForm({ token, valid, email, name, reset }: { token: string; valid: boolean; email: string; name: string; reset: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ name, password: "", confirm: "" });
  const { busy, msg, setMsg, run } = useBusy();
  return (
    <div className="ob grid min-h-[100dvh] place-items-center px-4">
      <Waves />
      <div className="relative z-[1] w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo href={null} height={26} />
        </div>
        <div className="ob-card ob-card-pad">
          <div className="flex items-center gap-4">
            <GlowMark size={52} />
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-[var(--ob-blue)]">MADVERT OPERATIONS</p>
              <h1 className="ob-h2">{valid ? (reset ? "Set a new password" : "Join the team") : "Link expired"}</h1>
            </div>
          </div>
          {!valid ? (
            <p className="ob-lead mt-5">This invite link is invalid or has expired. Ask an admin to send a new one.</p>
          ) : (
            <form
              className="mt-6 grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (f.password !== f.confirm) return setMsg({ tone: "danger", text: "Passwords don’t match." });
                const r = await run(() => opsCall("invite-accept", { token, name: f.name, password: f.password }));
                if (!r.error) router.push("/ops/onboarding");
              }}
            >
              <p className="text-[14px] text-[var(--ob-ink-2)]">{email}</p>
              {!reset ? (
                <Field label="Your name" htmlFor="iv-n">
                  <input id="iv-n" className="ob-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                </Field>
              ) : null}
              <Field label="Password" help="At least 10 characters." htmlFor="iv-p">
                <input id="iv-p" type="password" autoComplete="new-password" className="ob-input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
              </Field>
              <Field label="Confirm password" htmlFor="iv-c">
                <input id="iv-c" type="password" autoComplete="new-password" className="ob-input" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} />
              </Field>
              <Btn type="submit" arrow disabled={busy || !f.password}>
                {reset ? "Save password" : "Create account"}
              </Btn>
              <Msg msg={msg} />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
