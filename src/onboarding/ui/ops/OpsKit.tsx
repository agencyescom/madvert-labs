"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { Btn, Icon, ThemeSwitch, Waves } from "../kit";

export async function opsCall<T = Record<string, unknown>>(action: string, body?: unknown): Promise<T & { ok?: boolean; error?: string }> {
  const res = await fetch(`/api/ops/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
  return (await res.json().catch(() => ({ error: "Network error" }))) as T & { ok?: boolean; error?: string };
}

const NAV = [
  { href: "/ops/onboarding", label: "Onboarding", icon: "grid", admin: false },
  { href: "/ops/onboarding/new", label: "New onboarding", icon: "plus", admin: false },
  { href: "/ops/guides", label: "Guides", icon: "eye", admin: true },
  { href: "/ops/template", label: "Template", icon: "edit", admin: true },
  { href: "/ops/team", label: "Team", icon: "user", admin: true },
  { href: "/ops/settings", label: "Settings", icon: "shield", admin: true },
];

export type OpsUser = { name: string; email: string; role: "owner" | "admin" | "member" };

export function OpsShell({ user, children }: { user: OpsUser; children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const nav = NAV.filter((n) => !n.admin || user.role !== "member");
  return (
    <div className="ob">
      <Waves />
      <header className="ob-header">
        <div className="ob-wrap flex h-16 items-center gap-4 !max-w-[1400px]">
          <Link href="/ops/onboarding" className="flex items-center gap-3">
            <Logo href={null} height={22} />
            <span className="hidden rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-[0.18em] text-white sm:inline" style={{ background: "var(--ob-grad)" }}>
              OPERATIONS
            </span>
          </Link>
          <nav className="ml-4 hidden gap-1 lg:flex">
            {nav.map((n) => {
              const active = n.href === "/ops/onboarding" ? path === n.href || (path.startsWith("/ops/onboarding/") && !path.endsWith("/new")) : path.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-semibold ${active ? "bg-[var(--ob-card-solid)] shadow-[0_0_0_1px_rgb(0_160_255/0.35)]" : "text-[var(--ob-ink-2)] hover:text-[var(--ob-ink)]"}`}>
                  <Icon name={n.icon} size={15} /> {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/ops/account" className="hidden items-center gap-2 rounded-full px-2 py-1 text-[12.5px] text-[var(--ob-ink-2)] hover:bg-[var(--ob-card)] sm:flex" title="Your account">
              <span className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: "var(--ob-grad)" }}>
                {(user.name || user.email).slice(0, 1).toUpperCase()}
              </span>
              <span>
                {user.name} <span className="text-[var(--ob-ink-3)]">· {user.role}</span>
              </span>
            </Link>
            <ThemeSwitch />
            <Btn
              variant="ghost"
              size="xs"
              onClick={async () => {
                await opsCall("logout");
                router.push("/ops/login");
              }}
            >
              Sign out
            </Btn>
          </div>
        </div>
        <nav className="ob-wrap flex gap-1 overflow-x-auto pb-2 lg:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex-none rounded-full px-3 py-1.5 text-[13px] font-semibold text-[var(--ob-ink-2)]">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="ob-wrap relative !max-w-[1400px] pb-24 pt-8">{children}</main>
    </div>
  );
}

export function useBusy() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "danger" | "info"; text: string } | null>(null);
  const run = async <T,>(fn: () => Promise<T & { error?: string }>, ok?: string) => {
    setBusy(true);
    setMsg(null);
    const r = await fn();
    setBusy(false);
    if (r.error) setMsg({ tone: "danger", text: r.error });
    else if (ok) setMsg({ tone: "success", text: ok });
    return r;
  };
  return { busy, msg, setMsg, run };
}

export function Msg({ msg }: { msg: { tone: string; text: string } | null }) {
  if (!msg) return null;
  return (
    <p className="ob-callout mt-3" data-tone={msg.tone} role="status">
      {msg.text}
    </p>
  );
}
