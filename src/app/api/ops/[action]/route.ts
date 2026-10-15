import type { CompanySettings, CustomQuestion, GuideStep, InternalNote, Onboarding, Objection, OfferWorkshop, SecretRecord, ServiceKey, TeamRole, TeamUser, TemplateOverride } from "@/onboarding/types";
import { SERVICE_KEYS } from "@/onboarding/template/services";
import { checkOpsLogin, endOpsSession, hashPassword, opsConfigured, passwordProblem, requireOpsSession, roleAtLeast, startOpsSession, teamUserByEmail, verifyPassword } from "@/onboarding/server/auth";
import { decrypt, hashToken, newId, newToken } from "@/onboarding/server/crypto";
import { createClientInCrm } from "@/onboarding/server/crm";
import { db } from "@/onboarding/server/db";
import { sendOnboardingLink, sendTeamInvite } from "@/onboarding/server/emails";
import { audit } from "@/onboarding/server/events";
import { body, handle, json, sameOrigin } from "@/onboarding/server/http";
import { addNote, afterChange, createOnboarding, loadContext, recordBooking, regenerateLink, revokeLink, saveOfferLists, updateAccess } from "@/onboarding/server/repo";
import { getSettings } from "@/onboarding/server/settings";
import { putLocal, safeName, storageDriver } from "@/onboarding/server/storage";
import { clientIp, rateLimit } from "@/integrations/rate-limit";

type Ctx = { params: Promise<{ action: string }> };

async function onboardingOr404(id: unknown) {
  const o = await db().get<Onboarding>("onboardings", String(id ?? ""));
  if (!o) throw Object.assign(new Error("Unknown onboarding"), { status: 404 });
  return o;
}

export async function POST(req: Request, { params }: Ctx) {
  return handle(async () => {
    const { action } = await params;
    if (!sameOrigin(req)) return json({ error: "Invalid origin" }, 403);

    if (action === "login") {
      if (!(await opsConfigured())) return json({ error: "Operations sign-in is not configured. Set OPS_ADMIN_PASSWORD to create the first owner.", configurationRequired: true }, 503);
      const ip = clientIp(req);
      if (!(await rateLimit(`ops-login:${ip}`, 8, 900)).ok) return json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
      const b = await body<{ email: string; password: string }>(req);
      const u = await checkOpsLogin(String(b.email ?? ""), String(b.password ?? ""));
      if (!u) {
        await audit({ actor: `team:${String(b.email ?? "").slice(0, 120)}`, action: "ops.login_failed", ip });
        return json({ error: "Email or password is incorrect." }, 401);
      }
      await startOpsSession(u);
      await audit({ actor: `team:${u.email}`, action: "ops.login", ip });
      return json({ ok: true });
    }
    if (action === "logout") {
      await endOpsSession();
      return json({ ok: true });
    }
    if (action === "invite-accept") {
      const ip = clientIp(req);
      if (!(await rateLimit(`ops-invite:${ip}`, 10, 900)).ok) return json({ error: "Too many attempts. Try again later." }, 429);
      const b = await body<{ token: string; name?: string; password: string }>(req);
      const [u] = await db().find<TeamUser>("team_users", { inviteHash: hashToken(String(b.token ?? "")) });
      if (!u || !u.inviteExpiresAt || Date.parse(u.inviteExpiresAt) < Date.now() || u.status === "disabled") return json({ error: "This invite link is invalid or has expired. Ask an admin for a new one." }, 400);
      const problem = passwordProblem(String(b.password ?? ""));
      if (problem) return json({ error: problem }, 400);
      const next: TeamUser = {
        ...u,
        name: String(b.name ?? "").trim().slice(0, 80) || u.name,
        passwordHash: await hashPassword(String(b.password)),
        status: "active",
        inviteHash: undefined,
        inviteExpiresAt: undefined,
        sessionVersion: u.sessionVersion + 1,
        updatedAt: new Date().toISOString(),
      };
      await db().put("team_users", next);
      await startOpsSession(next);
      await audit({ actor: `team:${u.email}`, action: "team.invite_accepted", ip });
      return json({ ok: true });
    }

    const session = await requireOpsSession();
    const user = session.email;
    const actor = `team:${user}`;
    const ADMIN_ONLY = ["settings", "guide-save", "guide-image", "template", "template-reset", "custom-question", "secret-reveal", "team-invite", "team-update", "team-reset", "team-delete"];
    if (ADMIN_ONLY.includes(action) && !roleAtLeast(session.role, "admin")) return json({ error: "Only admins can do this." }, 403);

    switch (action) {
      case "create": {
        const b = await body<Record<string, unknown>>(req);
        const services = (Array.isArray(b.services) ? b.services : []).filter((s): s is ServiceKey => SERVICE_KEYS.includes(s as ServiceKey));
        const email = String(b.email ?? "").trim();
        if (!String(b.companyName ?? "").trim() || !String(b.firstName ?? "").trim()) return json({ error: "Company and first name are required." }, 400);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Please enter a valid client email." }, 400);
        if (!services.length) return json({ error: "Select at least one engagement service." }, 400);
        const res = await createOnboarding(
          {
            companyName: String(b.companyName),
            firstName: String(b.firstName),
            lastName: b.lastName ? String(b.lastName) : undefined,
            email,
            phone: b.phone ? String(b.phone) : undefined,
            services,
            ecommerce: b.ecommerce === true,
            localBusiness: b.localBusiness === true,
            accountManager: b.accountManager ? String(b.accountManager) : undefined,
            accountManagerEmail: b.accountManagerEmail ? String(b.accountManagerEmail) : undefined,
            strategist: b.strategist ? String(b.strategist) : undefined,
            assignedOwner: b.assignedOwner ? String(b.assignedOwner) : undefined,
          },
          user,
        );
        const emailed = b.sendEmail === true ? await sendOnboardingLink(email, res.onboarding.contact.firstName, res.onboarding.companyName, res.url) : false;
        return json({ ok: true, id: res.onboarding.id, url: res.url, emailed });
      }

      case "regenerate":
      case "send-link": {
        const b = await body<{ id: string; days?: number }>(req);
        const o = await onboardingOr404(b.id);
        const res = await regenerateLink(o, actor, b.days ? Math.min(365, Math.max(1, Number(b.days))) : undefined);
        const emailed = action === "send-link" ? await sendOnboardingLink(o.contact.email, o.contact.firstName, o.companyName, res.url) : false;
        return json({ ok: true, url: res.url, emailed });
      }

      case "revoke": {
        const b = await body<{ id: string }>(req);
        await revokeLink(await onboardingOr404(b.id), actor);
        return json({ ok: true });
      }

      case "access": {
        const b = await body<{ id: string; platform: string; status: Parameters<typeof updateAccess>[2]["status"] }>(req);
        const ctx = await loadContext(String(b.id));
        if (!ctx) return json({ error: "Not found" }, 404);
        await updateAccess(ctx, String(b.platform), { status: b.status }, "team", actor);
        await afterChange(ctx.onboarding.id, { client: false });
        return json({ ok: true });
      }

      case "note": {
        const b = await body<{ id: string; sectionKey: string; body: string; tag?: string }>(req);
        await onboardingOr404(b.id);
        if (!String(b.body ?? "").trim()) return json({ error: "Write a note first." }, 400);
        const n = await addNote(String(b.id), String(b.sectionKey || "general"), String(b.body), user, b.tag);
        return json({ ok: true, note: n });
      }

      case "note-delete": {
        const b = await body<{ noteId: string }>(req);
        const n = await db().get<InternalNote>("internal_notes", String(b.noteId));
        if (n) await db().remove("internal_notes", n.id);
        return json({ ok: true });
      }

      case "assign": {
        const b = await body<{ id: string; assignedOwner?: string; strategist?: string; accountManager?: string }>(req);
        const o = await onboardingOr404(b.id);
        await db().put<Onboarding>("onboardings", {
          ...o,
          assignedOwner: b.assignedOwner?.slice(0, 120) ?? o.assignedOwner,
          strategist: b.strategist?.slice(0, 120) ?? o.strategist,
          accountManager: b.accountManager ? { ...o.accountManager, name: b.accountManager.slice(0, 120) } : o.accountManager,
          updatedAt: new Date().toISOString(),
        });
        return json({ ok: true });
      }

      case "booking": {
        const b = await body<{ id: string; startsAt?: string; timezone?: string; meetingUrl?: string }>(req);
        const ctx = await loadContext(String(b.id));
        if (!ctx) return json({ error: "Not found" }, 404);
        await recordBooking(ctx, { startsAt: b.startsAt, timezone: b.timezone, meetingUrl: b.meetingUrl, source: "team" });
        await afterChange(ctx.onboarding.id, { client: false });
        return json({ ok: true });
      }

      case "offer-notes": {
        const b = await body<{ id: string; strategyNotes?: string; objections?: Partial<Objection>[] }>(req);
        const ctx = await loadContext(String(b.id));
        if (!ctx) return json({ error: "Not found" }, 404);
        if (b.strategyNotes !== undefined) {
          const w: OfferWorkshop = ctx.workshop ?? { id: ctx.onboarding.id, onboardingId: ctx.onboarding.id, status: "not_started", values: {}, updatedAt: "" };
          await db().put("offer_workshops", { ...w, strategyNotes: String(b.strategyNotes).slice(0, 8000), updatedAt: new Date().toISOString() });
        }
        if (b.objections) await saveOfferLists((await loadContext(ctx.onboarding.id))!, { objections: b.objections }, true);
        return json({ ok: true });
      }

      case "settings": {
        const b = await body<Partial<CompanySettings>>(req);
        const cur = await getSettings();
        const str = (v: unknown, n = 300) => (typeof v === "string" ? v.trim().slice(0, n) : undefined);
        const integ = Object.fromEntries(Object.entries(cur.integrations).map(([k, v]) => [k, str((b.integrations as Record<string, unknown> | undefined)?.[k]) ?? v]));
        const bookingUrl = String(integ.bookingUrl);
        if (bookingUrl && !/^https:\/\//.test(bookingUrl)) return json({ error: "Booking URL must start with https://" }, 400);
        const defs = b.defaults ?? cur.defaults;
        const next: CompanySettings = {
          id: "company",
          integrations: integ as CompanySettings["integrations"],
          defaults: {
            accountManager: str(defs.accountManager, 120) ?? cur.defaults.accountManager,
            accountManagerEmail: str(defs.accountManagerEmail, 200) ?? cur.defaults.accountManagerEmail,
            strategist: str(defs.strategist, 120) ?? cur.defaults.strategist,
            linkLifetimeDays: Math.min(365, Math.max(1, Number(defs.linkLifetimeDays) || cur.defaults.linkLifetimeDays)),
          },
          updatedAt: new Date().toISOString(),
          updatedBy: user,
        };
        await db().put("settings", next);
        await audit({ actor, action: "settings.updated" });
        return json({ ok: true, settings: next });
      }

      case "guide-save": {
        const b = await body<Partial<GuideStep> & { remove?: boolean }>(req);
        const platform = String(b.platform ?? "").replace(/[^a-z_]/g, "");
        if (!platform) return json({ error: "Platform required" }, 400);
        const stepNumber = Math.max(1, Math.min(30, Number(b.stepNumber) || 1));
        const id = b.id ? String(b.id) : `${platform}:custom-${newId()}`;
        const prev = await db().get<GuideStep>("guides", id);
        const step: GuideStep = {
          ...(prev ?? {}),
          id,
          platform,
          stepNumber,
          title: String(b.title ?? prev?.title ?? "").slice(0, 160),
          instruction: b.remove ? "__removed__" : String(b.instruction ?? prev?.instruction ?? "").slice(0, 2000),
          externalHelpUrl: b.externalHelpUrl && /^https:\/\//.test(b.externalHelpUrl) ? b.externalHelpUrl.slice(0, 500) : b.externalHelpUrl === "" ? undefined : prev?.externalHelpUrl,
          lastReviewedAt: b.lastReviewedAt ? String(b.lastReviewedAt).slice(0, 10) : prev?.lastReviewedAt,
          illustration: b.illustration ?? prev?.illustration,
          updatedBy: user,
          updatedAt: new Date().toISOString(),
        };
        await db().put("guides", step);
        await audit({ actor, action: b.remove ? "guide.removed" : "guide.saved", target: id });
        return json({ ok: true, step });
      }

      case "guide-image": {
        const form = await req.formData();
        const id = String(form.get("id") ?? "");
        const file = form.get("file");
        if (!(file instanceof File) || !/^image\/(png|jpe?g|webp)$/.test(file.type) || file.size > 4 * 1024 * 1024)
          return json({ error: "Upload a PNG, JPG or WebP under 4 MB." }, 400);
        const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const key = `guides/${safeName(id)}-${Date.now()}.${ext}`;
        const driver = storageDriver();
        if (driver === "local") await putLocal(key, Buffer.from(await file.arrayBuffer()));
        else if (driver === "vercel-blob") {
          const { put } = await import("@vercel/blob");
          await put(key, file, { access: "private", contentType: file.type, addRandomSuffix: false });
        } else return json({ error: "File storage is not configured (BLOB_READ_WRITE_TOKEN).", configurationRequired: true }, 503);
        const { DEFAULT_GUIDES } = await import("@/onboarding/guides/defaults");
        const prev = (await db().get<GuideStep>("guides", id)) ?? DEFAULT_GUIDES.find((g) => g.id === id);
        if (!prev) return json({ error: "Unknown step" }, 404);
        await db().put<GuideStep>("guides", { ...prev, screenshotKey: key, updatedBy: user, updatedAt: new Date().toISOString() });
        await audit({ actor, action: "guide.screenshot", target: id });
        return json({ ok: true });
      }

      case "template": {
        const b = await body<Partial<TemplateOverride> & { id: string }>(req);
        if (!/^[\w.:-]{2,120}$/.test(String(b.id ?? ""))) return json({ error: "Invalid id" }, 400);
        const prev = await db().get<TemplateOverride>("template_overrides", b.id);
        const next: TemplateOverride = {
          ...(prev ?? {}),
          id: b.id,
          hidden: b.hidden ?? prev?.hidden,
          required: b.required ?? prev?.required,
          label: b.label !== undefined ? String(b.label).slice(0, 300) : prev?.label,
          help: b.help !== undefined ? String(b.help).slice(0, 600) : prev?.help,
          order: b.order !== undefined ? Number(b.order) : prev?.order,
          updatedAt: new Date().toISOString(),
        };
        await db().put("template_overrides", next);
        await audit({ actor, action: "template.override", target: b.id });
        return json({ ok: true });
      }

      case "template-reset": {
        const b = await body<{ id: string }>(req);
        await db().remove("template_overrides", String(b.id));
        return json({ ok: true });
      }

      case "custom-question": {
        const b = await body<Partial<CustomQuestion> & { remove?: string }>(req);
        if (b.remove) {
          await db().remove("custom_questions", String(b.remove));
          return json({ ok: true });
        }
        if (!String(b.label ?? "").trim() || !String(b.sectionKey ?? "").match(/^(business|offer)\.\w+$/)) return json({ error: "Section and label are required." }, 400);
        const type = (["text", "textarea", "select", "multi"] as const).find((t) => t === b.type) ?? "text";
        const q: CustomQuestion = {
          id: newId(),
          sectionKey: String(b.sectionKey),
          label: String(b.label).slice(0, 300),
          type,
          options: type === "select" || type === "multi" ? (b.options ?? []).map((o) => String(o).slice(0, 100)).filter(Boolean).slice(0, 20) : undefined,
          required: b.required === true,
          help: b.help ? String(b.help).slice(0, 400) : undefined,
          showIf: b.showIf?.key ? { key: String(b.showIf.key).slice(0, 80), equals: String(b.showIf.equals ?? "").slice(0, 100) } : undefined,
          order: Number(b.order ?? 1000),
          createdAt: new Date().toISOString(),
        };
        await db().put("custom_questions", q);
        await audit({ actor, action: "template.question_added", target: q.id });
        return json({ ok: true, question: q });
      }

      case "account-password": {
        const b = await body<{ current: string; next: string }>(req);
        const u = await db().get<TeamUser>("team_users", session.id);
        if (!u || !(await verifyPassword(String(b.current ?? ""), u.passwordHash))) return json({ error: "Your current password is incorrect." }, 400);
        const problem = passwordProblem(String(b.next ?? ""));
        if (problem) return json({ error: problem }, 400);
        const next = { ...u, passwordHash: await hashPassword(String(b.next)), sessionVersion: u.sessionVersion + 1, updatedAt: new Date().toISOString() };
        await db().put("team_users", next);
        await startOpsSession(next);
        await audit({ actor, action: "team.password_changed" });
        return json({ ok: true });
      }

      case "team-invite":
      case "team-reset": {
        const b = await body<{ id?: string; email?: string; name?: string; role?: TeamRole }>(req);
        let u: TeamUser | null = b.id ? await db().get<TeamUser>("team_users", String(b.id)) : null;
        const now = new Date().toISOString();
        if (action === "team-invite") {
          const email = String(b.email ?? "").trim().toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Enter a valid email." }, 400);
          if (await teamUserByEmail(email)) return json({ error: "That person already has an account. Use Reset to send a new link." }, 400);
          const role: TeamRole = b.role === "admin" || (b.role === "owner" && session.role === "owner") ? b.role : "member";
          u = { id: newId("usr_"), email, name: String(b.name ?? "").trim().slice(0, 80) || email.split("@")[0], role, status: "invited", sessionVersion: 1, invitedBy: user, createdAt: now, updatedAt: now };
        }
        if (!u) return json({ error: "Not found" }, 404);
        if (u.role === "owner" && session.role !== "owner") return json({ error: "Only an owner can reset another owner." }, 403);
        const token = newToken();
        u = { ...u, inviteHash: hashToken(token), inviteExpiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(), updatedAt: now };
        await db().put("team_users", u);
        const base = (process.env.ONBOARDING_BASE_URL ?? (process.env.ONBOARDING_HOST ? `https://${process.env.ONBOARDING_HOST}` : undefined) ?? process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin).replace(/\/$/, "");
        const link = `${base}/ops/invite/${token}`;
        const emailed = await sendTeamInvite(u.email, u.name, session.name || user, link, action === "team-reset");
        await audit({ actor, action: action === "team-invite" ? "team.invited" : "team.reset_link", target: u.email });
        return json({ ok: true, link, emailed });
      }

      case "team-update": {
        const b = await body<{ id: string; role?: TeamRole; status?: "active" | "disabled"; name?: string }>(req);
        const u = await db().get<TeamUser>("team_users", String(b.id));
        if (!u) return json({ error: "Not found" }, 404);
        if (u.id === session.id && (b.role || b.status)) return json({ error: "You can’t change your own role or status." }, 400);
        if ((u.role === "owner" || b.role === "owner") && session.role !== "owner") return json({ error: "Only an owner can change owners." }, 403);
        const next: TeamUser = { ...u, updatedAt: new Date().toISOString() };
        if (b.role && ["owner", "admin", "member"].includes(b.role)) next.role = b.role;
        if (b.name) next.name = String(b.name).slice(0, 80);
        if (b.status === "disabled") {
          next.status = "disabled";
          next.sessionVersion = u.sessionVersion + 1;
        } else if (b.status === "active" && u.passwordHash) next.status = "active";
        const all = await db().find<TeamUser>("team_users");
        const owners = all.map((x) => (x.id === next.id ? next : x)).filter((x) => x.role === "owner" && x.status === "active");
        if (!owners.length) return json({ error: "There must always be at least one active owner." }, 400);
        await db().put("team_users", next);
        await audit({ actor, action: "team.updated", target: `${u.email}:${next.role}:${next.status}` });
        return json({ ok: true });
      }

      case "team-delete": {
        if (session.role !== "owner") return json({ error: "Only an owner can remove accounts." }, 403);
        const b = await body<{ id: string }>(req);
        const u = await db().get<TeamUser>("team_users", String(b.id));
        if (!u) return json({ error: "Not found" }, 404);
        if (u.id === session.id) return json({ error: "You can’t remove yourself." }, 400);
        await db().remove("team_users", u.id);
        await audit({ actor, action: "team.removed", target: u.email });
        return json({ ok: true });
      }

      case "crm": {
        const b = await body<{ id: string }>(req);
        try {
          const res = await createClientInCrm(String(b.id), user);
          return json(res, res.ok ? 200 : "configurationRequired" in res ? 503 : 400);
        } catch (e) {
          console.error("[crm]", e);
          return json({ error: e instanceof Error ? e.message : "CRM sync failed" }, 502);
        }
      }

      case "secret-reveal": {
        const b = await body<{ secretId: string }>(req);
        const s = await db().get<SecretRecord>("secrets", String(b.secretId));
        if (!s) return json({ error: "Not found" }, 404);
        const value = decrypt(s.cipher);
        await db().put<SecretRecord>("secrets", { ...s, revealedCount: s.revealedCount + 1 });
        await audit({ onboardingId: s.onboardingId, actor, action: "secret.revealed", target: s.id, ip: clientIp(req) });
        return json({ ok: true, value }, 200);
      }
    }
    return json({ error: "Not found" }, 404);
  });
}
