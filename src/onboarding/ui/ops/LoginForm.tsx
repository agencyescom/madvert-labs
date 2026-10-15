"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Btn, Field, GlowMark, Waves } from "../kit";
import { opsCall } from "./OpsKit";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="ob grid min-h-[100dvh] place-items-center px-4">
      <Waves />
      <div className="relative z-[1] w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo href={null} height={26} />
        </div>
        <form
          className="ob-card ob-card-pad"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr("");
            const r = await opsCall("login", f);
            setBusy(false);
            if (r.error) setErr(r.error);
            else router.push("/ops/onboarding");
          }}
        >
          <div className="flex items-center gap-4">
            <GlowMark size={52} />
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-[var(--ob-blue)]">MADVERT OPERATIONS</p>
              <h1 className="ob-h2">Team sign in</h1>
            </div>
          </div>
          {!configured ? (
            <p className="ob-callout mt-6">
              <strong>Configuration required.</strong> Set <code>OPS_ADMIN_PASSWORD</code> (10+ characters) and optionally <code>OPS_ADMIN_EMAILS</code>, then redeploy.
            </p>
          ) : null}
          <div className="mt-6 grid gap-5">
            <Field label="Work email" htmlFor="ops-email">
              <input id="ops-email" type="email" autoComplete="username" className="ob-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
            </Field>
            <Field label="Password" htmlFor="ops-pass">
              <input id="ops-pass" type="password" autoComplete="current-password" className="ob-input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
            </Field>
            {err ? (
              <p className="ob-callout" data-tone="danger" role="alert">
                {err}
              </p>
            ) : null}
            <Btn type="submit" arrow disabled={busy || !configured}>
              {busy ? "Signing in…" : "Sign in"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
