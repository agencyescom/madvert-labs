import "server-only";
import { cookies } from "next/headers";
import type { DelegatedTask, Onboarding } from "../types";
import { hashToken, safeEqual, seal, unseal } from "./crypto";
import { db } from "./db";

export type PortalActor =
  | { kind: "client"; onboarding: Onboarding }
  | { kind: "delegate"; onboarding: Onboarding; task: DelegatedTask };

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const TOKEN_RE = /^[A-Za-z0-9_-]{32,64}$/;

/** Resolve the secure client token. Expired or revoked links never resolve. */
export async function onboardingByToken(token: string | null | undefined): Promise<{ onboarding: Onboarding | null; reason?: "expired" | "revoked" | "invalid" }> {
  if (!token || !TOKEN_RE.test(token)) return { onboarding: null, reason: "invalid" };
  const [o] = await db().find<Onboarding>("onboardings", { tokenHash: hashToken(token) });
  if (!o) return { onboarding: null, reason: "invalid" };
  if (o.status === "revoked") return { onboarding: null, reason: "revoked" };
  if (o.status === "expired" || Date.parse(o.expiresAt) < Date.now()) return { onboarding: null, reason: "expired" };
  return { onboarding: o };
}

export async function delegateByToken(token: string | null | undefined): Promise<{ task: DelegatedTask; onboarding: Onboarding } | null> {
  if (!token || !TOKEN_RE.test(token)) return null;
  const [task] = await db().find<DelegatedTask>("delegated_tasks", { tokenHash: hashToken(token) });
  if (!task || task.status === "revoked" || Date.parse(task.expiresAt) < Date.now()) return null;
  const onboarding = await db().get<Onboarding>("onboardings", task.onboardingId);
  if (!onboarding || onboarding.status === "revoked" || Date.parse(onboarding.expiresAt) < Date.now()) return null;
  return { task, onboarding };
}

/** API routes take the bearer token in a header, never in the URL. */
export async function portalActor(req: Request): Promise<PortalActor> {
  const client = req.headers.get("x-onboarding-token");
  if (client) {
    const { onboarding } = await onboardingByToken(client);
    if (onboarding) return { kind: "client", onboarding };
  }
  const delegate = req.headers.get("x-delegate-token");
  if (delegate) {
    const d = await delegateByToken(delegate);
    if (d) return { kind: "delegate", ...d };
  }
  throw new AuthError(401, "This onboarding link is invalid or has expired.");
}

/** Delegates can only touch the one task they were sent. */
export function assertScope(actor: PortalActor, scope: string) {
  if (actor.kind === "client") return;
  const key = actor.task.taskKey;
  if (scope === key || scope.startsWith(`${key}:`)) return;
  throw new AuthError(403, "This link only allows the task it was sent for.");
}

export const actorName = (a: PortalActor) => (a.kind === "client" ? "client" : `delegate:${a.task.id}`);
export const actorRole = (a: PortalActor) => (a.kind === "client" ? ("client" as const) : ("delegate" as const));

/* ───────── Madvert team (Operations) ───────── */

const OPS_COOKIE = "mv_ops";
const SESSION_HOURS = 12;

export function opsConfigured() {
  return Boolean(process.env.OPS_ADMIN_PASSWORD && process.env.OPS_ADMIN_PASSWORD.length >= 10);
}

export function checkOpsLogin(email: string, password: string) {
  const expected = process.env.OPS_ADMIN_PASSWORD;
  if (!expected || !opsConfigured()) return false;
  const allowed = (process.env.OPS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length && !allowed.includes(email.trim().toLowerCase())) return false;
  return safeEqual(password, expected);
}

export async function startOpsSession(email: string) {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  (await cookies()).set(OPS_COOKIE, seal(`${email.toLowerCase()}|${exp}`), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function endOpsSession() {
  (await cookies()).delete(OPS_COOKIE);
}

export async function opsUser(): Promise<string | null> {
  const value = unseal((await cookies()).get(OPS_COOKIE)?.value);
  if (!value) return null;
  const [email, exp] = value.split("|");
  if (!email || Number(exp) < Date.now()) return null;
  return email;
}

export async function requireOps(): Promise<string> {
  const u = await opsUser();
  if (!u) throw new AuthError(401, "Sign in to Madvert Operations.");
  return u;
}
