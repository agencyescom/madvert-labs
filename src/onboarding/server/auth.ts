import "server-only";
import { cookies } from "next/headers";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { DelegatedTask, Onboarding, TeamRole, TeamUser } from "../types";
import { hashToken, newId, safeEqual, seal, unseal } from "./crypto";
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

/* ───────── Madvert team (Operations) ─────────
 * Individual accounts (team_users). Passwords: scrypt with a per-user salt. Sessions: HMAC-sealed
 * cookie carrying the user id and a session version; every request re-reads the user, so disabling
 * someone or changing a password ends their sessions immediately.
 * Bootstrap: while no account exists, OPS_ADMIN_PASSWORD (+ OPS_ADMIN_EMAILS) signs in once and
 * becomes the first owner. After that the shared password no longer works.
 */

const OPS_COOKIE = "mv_ops";
const SESSION_HOURS = 12;
const RANK: Record<TeamRole, number> = { member: 1, admin: 2, owner: 3 };

export type TeamSession = { id: string; email: string; name: string; role: TeamRole };

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await new Promise<Buffer>((res, rej) => scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? rej(e) : res(k))));
  return `scrypt$16384$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored?: string) {
  if (!stored) return false;
  const [alg, n, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const got = await new Promise<Buffer>((res, rej) =>
    scrypt(password, Buffer.from(salt, "base64"), expected.length, { N: Number(n), r: 8, p: 1 }, (e, k) => (e ? rej(e) : res(k))),
  );
  return got.length === expected.length && timingSafeEqual(got, expected);
}

export const passwordProblem = (p: string) => (p.length < 10 ? "Use at least 10 characters." : p.length > 200 ? "That password is too long." : null);

async function teamUsers() {
  return db().find<TeamUser>("team_users");
}

export async function teamUserByEmail(email: string) {
  const e = email.trim().toLowerCase();
  return (await db().find<TeamUser>("team_users", { email: e }))[0] ?? null;
}

/** True when sign in can work: accounts exist, or the bootstrap password is set. */
export async function opsConfigured() {
  if ((await teamUsers()).some((u) => u.status === "active")) return true;
  return Boolean(process.env.OPS_ADMIN_PASSWORD && process.env.OPS_ADMIN_PASSWORD.length >= 10);
}

export async function checkOpsLogin(email: string, password: string): Promise<TeamUser | null> {
  const users = await teamUsers();
  const e = email.trim().toLowerCase();
  if (!users.length) {
    // First run: the shared bootstrap password creates the first owner.
    const expected = process.env.OPS_ADMIN_PASSWORD;
    const allowed = (process.env.OPS_ADMIN_EMAILS ?? "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);
    if (!expected || expected.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
    if (allowed.length && !allowed.includes(e)) return null;
    if (!safeEqual(password, expected)) return null;
    const now = new Date().toISOString();
    const owner: TeamUser = {
      id: newId("usr_"),
      email: e,
      name: e.split("@")[0],
      role: "owner",
      status: "active",
      passwordHash: await hashPassword(password),
      sessionVersion: 1,
      createdAt: now,
      updatedAt: now,
    };
    await db().put("team_users", owner);
    return owner;
  }
  const u = users.find((x) => x.email === e);
  // Always run one scrypt so response time does not reveal whether the email exists.
  const ok = await verifyPassword(password, u?.passwordHash ?? "scrypt$16384$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
  if (!u || !ok || u.status !== "active") return null;
  return u;
}

export async function startOpsSession(user: TeamUser) {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  await db().put<TeamUser>("team_users", { ...user, lastLoginAt: new Date().toISOString() });
  (await cookies()).set(OPS_COOKIE, seal(`${user.id}|${exp}|${user.sessionVersion}`), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function endOpsSession() {
  (await cookies()).delete(OPS_COOKIE);
}

export async function opsSession(): Promise<TeamSession | null> {
  const value = unseal((await cookies()).get(OPS_COOKIE)?.value);
  if (!value) return null;
  const [id, exp, ver] = value.split("|");
  if (!id || Number(exp) < Date.now()) return null;
  const u = await db().get<TeamUser>("team_users", id);
  if (!u || u.status !== "active" || String(u.sessionVersion) !== ver) return null;
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

/** Email of the signed-in team member (used as the audit actor). */
export async function opsUser(): Promise<string | null> {
  return (await opsSession())?.email ?? null;
}

export async function requireOpsSession(min: TeamRole = "member"): Promise<TeamSession> {
  const s = await opsSession();
  if (!s) throw new AuthError(401, "Sign in to Madvert Operations.");
  if (RANK[s.role] < RANK[min]) throw new AuthError(403, `This needs the ${min} role.`);
  return s;
}

export async function requireOps(min: TeamRole = "member"): Promise<string> {
  return (await requireOpsSession(min)).email;
}

export const roleAtLeast = (role: TeamRole, min: TeamRole) => RANK[role] >= RANK[min];
