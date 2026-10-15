import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ACCESS_BY_KEY } from "@/onboarding/template/access";
import { ALLOWED_EXT, ASSET_CATEGORY_BY_KEY, MAX_FILE_BYTES } from "@/onboarding/template/assets";
import type { AccessStatus, ClientAsset, DelegatedTask } from "@/onboarding/types";
import { actorName, actorRole, assertScope, AuthError, portalActor, type PortalActor } from "@/onboarding/server/auth";
import { hashToken, newId, newToken, vaultConfigured } from "@/onboarding/server/crypto";
import { db } from "@/onboarding/server/db";
import { sendDelegateInvite } from "@/onboarding/server/emails";
import { audit, emit } from "@/onboarding/server/events";
import { body, handle, json, sameOrigin } from "@/onboarding/server/http";
import {
  addAsset,
  afterChange,
  delegateUrl,
  ensureWorkspace,
  loadContext,
  recordBooking,
  replaceSocial,
  saveAnswers,
  saveOfferLists,
  setOfferStatus,
  storeSecret,
  updateAccess,
} from "@/onboarding/server/repo";
import { deleteObject, headObject, keyPrefix, putLocal, safeName, storageDriver } from "@/onboarding/server/storage";
import { clientState, delegateState } from "@/onboarding/server/views";
import { clientIp, rateLimit } from "@/integrations/rate-limit";
import { inputFromWorkshop } from "@/onboarding/offer/generate";
import { createOfferShare, sanitizeOfferInput, shareBase } from "@/onboarding/server/offers";

type Ctx = { params: Promise<{ action: string }> };

async function context(actor: PortalActor) {
  const ctx = await loadContext(actor.onboarding.id);
  if (!ctx) throw new AuthError(404, "Onboarding not found.");
  return ctx;
}

function clientOnly(actor: PortalActor) {
  if (actor.kind !== "client") throw new AuthError(403, "This link only allows the task it was sent for.");
}

/** Return fresh state after a change (the delegate view filters what it shows). */
async function respond(actor: PortalActor) {
  const res = await afterChange(actor.onboarding.id);
  if (!res) throw new AuthError(404, "Onboarding not found.");
  return json({ ok: true, state: await stateFor(actor, res.ctx) });
}

async function stateFor(actor: PortalActor, ctx: Parameters<typeof clientState>[0]) {
  const full = await clientState(ctx);
  return actor.kind === "delegate" ? delegateState(full, actor.task) : full;
}

export async function GET(req: Request, { params }: Ctx) {
  return handle(async () => {
    const { action } = await params;
    if (action !== "state") return json({ error: "Not found" }, 404);
    const actor = await portalActor(req);
    return json({ state: await stateFor(actor, await context(actor)) });
  });
}

export async function POST(req: Request, { params }: Ctx) {
  return handle(async () => {
    const { action } = await params;

    // Vercel Blob client uploads: token generation for a direct browser → private blob upload.
    if (action === "upload-token") {
      const actor = await portalActor(req);
      const b = await body<HandleUploadBody>(req);
      const result = await handleUpload({
        body: b,
        request: req,
        onBeforeGenerateToken: async (pathname, payload) => {
          const category = (JSON.parse(payload ?? "{}") as { category?: string }).category ?? "";
          const cat = ASSET_CATEGORY_BY_KEY[category];
          if (!cat) throw new Error("Unknown category");
          assertScope(actor, `asset:${cat.section}`);
          if (!pathname.startsWith(keyPrefix(actor.onboarding.id)) || pathname.includes("..")) throw new Error("Invalid upload path");
          if (!ALLOWED_EXT.test(pathname)) throw new Error("File type not allowed");
          return { maximumSizeInBytes: MAX_FILE_BYTES, addRandomSuffix: true, validUntil: Date.now() + 3600_000 };
        },
      });
      return json(result);
    }

    if (!sameOrigin(req)) return json({ error: "Invalid origin" }, 403);
    const ip = clientIp(req);
    if (!(await rateLimit(`onb:${ip}`, 240, 60)).ok) return json({ error: "Too many requests. Please wait a moment." }, 429);
    const actor = await portalActor(req);
    const by = actorRole(actor);
    const who = actorName(actor);

    switch (action) {
      case "answers": {
        const b = await body<{ sectionKey: string; values: Record<string, unknown> }>(req);
        const key = String(b.sectionKey ?? "");
        if (key.startsWith("assets.")) assertScope(actor, `asset:${key.slice(7)}`);
        else if (key.startsWith("delegated.")) {
          if (actor.kind === "delegate" && key !== `delegated.${actor.task.id}`) throw new AuthError(403, "This link only allows the task it was sent for.");
        } else clientOnly(actor);
        const ctx = await context(actor);
        await saveAnswers(ctx, key, b.values ?? {}, by);
        return respond(actor);
      }

      case "access": {
        const b = await body<{ platform: string; status?: AccessStatus; details?: Record<string, unknown>; clientNote?: string }>(req);
        if (!ACCESS_BY_KEY[b.platform]) return json({ error: "Unknown platform" }, 400);
        assertScope(actor, `access:${b.platform}`);
        const ctx = await context(actor);
        await updateAccess(ctx, b.platform, { status: b.status, details: b.details, clientNote: b.clientNote }, by, who);
        return respond(actor);
      }

      case "social": {
        assertScope(actor, "access:social");
        const b = await body<{ profiles: { platform: string; url: string; username?: string; accessStatus?: string }[]; done?: boolean }>(req);
        const ctx = await context(actor);
        await replaceSocial(ctx, Array.isArray(b.profiles) ? b.profiles : []);
        if (b.done !== undefined) await updateAccess(ctx, "social", { status: b.done ? "pending" : "not_started" }, by, who);
        return respond(actor);
      }

      case "assets": {
        const ctx = await context(actor);
        await ensureWorkspace(ctx.onboarding);
        const type = req.headers.get("content-type") ?? "";
        if (type.startsWith("multipart/form-data")) {
          // Direct upload (local driver). Large files go to Vercel Blob in production.
          if (storageDriver() !== "local") return json({ error: "Upload through cloud storage" }, 400);
          const form = await req.formData();
          const file = form.get("file");
          const category = String(form.get("category") ?? "");
          const cat = ASSET_CATEGORY_BY_KEY[category];
          if (!cat) return json({ error: "Unknown category" }, 400);
          assertScope(actor, `asset:${cat.section}`);
          if (!(file instanceof File)) return json({ error: "File missing" }, 400);
          if (file.size > MAX_FILE_BYTES) return json({ error: "File is too large. Paste a cloud folder link instead." }, 400);
          if (!ALLOWED_EXT.test(file.name)) return json({ error: "File type not allowed. Zip it or paste a folder link." }, 400);
          const key = `${keyPrefix(ctx.onboarding.id)}${cat.folder}/${newId()}-${safeName(file.name)}`;
          await putLocal(key, Buffer.from(await file.arrayBuffer()));
          await addAsset(
            ctx,
            { category, kind: "file", name: file.name, storageKey: key, storageDriver: "local", mimeType: file.type, size: file.size, note: String(form.get("note") ?? "") },
            by,
          );
          return respond(actor);
        }
        const b = await body<{ kind: "link" | "blob"; category: string; url?: string; name?: string; pathname?: string; note?: string }>(req);
        const cat = ASSET_CATEGORY_BY_KEY[b.category];
        if (!cat) return json({ error: "Unknown category" }, 400);
        assertScope(actor, `asset:${cat.section}`);
        if (b.kind === "link") {
          await addAsset(ctx, { category: b.category, kind: "link", name: b.name || String(b.url), url: b.url, note: b.note }, by);
        } else if (b.kind === "blob") {
          const key = String(b.pathname ?? "");
          if (!key.startsWith(keyPrefix(ctx.onboarding.id))) return json({ error: "Invalid upload" }, 400);
          const head = await headObject(key);
          if (!head) return json({ error: "Upload not found" }, 400);
          await addAsset(
            ctx,
            { category: b.category, kind: "file", name: b.name || key.split("/").pop()!, storageKey: key, storageDriver: "vercel-blob", mimeType: head.contentType, size: head.size, note: b.note },
            by,
          );
        } else return json({ error: "Invalid request" }, 400);
        return respond(actor);
      }

      case "asset-update":
      case "asset-delete": {
        const b = await body<{ id: string; note?: string; category?: string }>(req);
        const asset = await db().get<ClientAsset>("assets", String(b.id));
        if (!asset || asset.onboardingId !== actor.onboarding.id) return json({ error: "Not found" }, 404);
        assertScope(actor, `asset:${ASSET_CATEGORY_BY_KEY[asset.category]?.section}`);
        if (action === "asset-delete") {
          if (asset.storageKey && asset.storageDriver) await deleteObject(asset.storageKey, asset.storageDriver);
          await db().remove("assets", asset.id);
          await audit({ onboardingId: asset.onboardingId, actor: who, action: "asset.deleted", target: asset.id });
        } else {
          const cat = b.category ? ASSET_CATEGORY_BY_KEY[b.category] : null;
          if (b.category && (!cat || cat.section !== ASSET_CATEGORY_BY_KEY[asset.category]?.section)) return json({ error: "Invalid category" }, 400);
          await db().put<ClientAsset>("assets", {
            ...asset,
            note: b.note !== undefined ? String(b.note).slice(0, 1000) : asset.note,
            category: cat ? b.category! : asset.category,
            folder: cat ? cat.folder : asset.folder,
            updatedAt: new Date().toISOString(),
          });
        }
        return respond(actor);
      }

      case "offer": {
        clientOnly(actor);
        const b = await body<{ sectionKey?: string; values?: Record<string, unknown>; lists?: Record<string, unknown[]>; status?: "in_progress" | "completed" | "skipped" }>(req);
        let ctx = await context(actor);
        if (b.sectionKey && b.values) {
          if (!b.sectionKey.startsWith("offer.")) return json({ error: "Invalid section" }, 400);
          await saveAnswers(ctx, b.sectionKey, b.values, by);
          ctx = await context(actor);
        }
        if (b.lists) {
          await saveOfferLists(ctx, b.lists as Parameters<typeof saveOfferLists>[1]);
          ctx = await context(actor);
        }
        if (b.status) await setOfferStatus(ctx, b.status);
        return respond(actor);
      }

      case "kickoff": {
        clientOnly(actor);
        const b = await body<{ startsAt?: string; timezone?: string; source?: "widget" | "client_confirmed" }>(req);
        const ctx = await context(actor);
        await recordBooking(ctx, { startsAt: b.startsAt, timezone: b.timezone, source: b.source === "widget" ? "widget" : "client_confirmed" });
        return respond(actor);
      }

      case "secret": {
        if (!vaultConfigured()) return json({ error: "Secure credential storage is not configured yet. Please choose another option.", configurationRequired: true }, 503);
        const b = await body<{ platform: string; label: string; username?: string; secret: string }>(req);
        assertScope(actor, `access:${b.platform}`);
        const ctx = await context(actor);
        await storeSecret(ctx, { platform: String(b.platform), label: String(b.label ?? ""), username: b.username, secret: String(b.secret ?? "") }, by, who);
        return respond(actor);
      }

      case "delegate": {
        clientOnly(actor);
        if (!(await rateLimit(`onb-delegate:${actor.onboarding.id}`, 20, 3600)).ok) return json({ error: "Too many tasks sent in the last hour." }, 429);
        const b = await body<{ taskKey: string; taskLabel: string; name: string; email: string; role?: string; message?: string }>(req);
        const email = String(b.email ?? "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Please enter a valid email address." }, 400);
        if (!String(b.name ?? "").trim()) return json({ error: "Please enter their name." }, 400);
        const key = String(b.taskKey ?? "");
        const valid =
          (key.startsWith("access:") && ACCESS_BY_KEY[key.slice(7)]) || (key.startsWith("asset:") && Object.values(ASSET_CATEGORY_BY_KEY).some((c) => c.section === key.slice(6))) || key === "question";
        if (!valid) return json({ error: "Unknown task" }, 400);
        const token = newToken();
        const task: DelegatedTask = {
          id: newId("dlg_"),
          onboardingId: actor.onboarding.id,
          taskKey: key,
          taskLabel: String(b.taskLabel ?? "").slice(0, 160) || key,
          name: String(b.name).trim().slice(0, 120),
          email,
          role: b.role ? String(b.role).slice(0, 80) : undefined,
          message: b.message ? String(b.message).slice(0, 1500) : undefined,
          tokenHash: hashToken(token),
          status: "sent",
          emailDelivered: false,
          expiresAt: new Date(Date.now() + 14 * 86400_000).toISOString(),
          createdAt: new Date().toISOString(),
        };
        const url = delegateUrl(token);
        task.emailDelivered = await sendDelegateInvite({
          to: email,
          name: task.name,
          fromName: actor.onboarding.contact.firstName,
          company: actor.onboarding.companyName,
          task: task.taskLabel,
          message: task.message,
          url,
        });
        await db().put("delegated_tasks", task);
        await emit(actor.onboarding, "DELEGATED_TASK_SENT", { task: task.taskKey, role: task.role ?? null });
        await audit({ onboardingId: task.onboardingId, actor: who, action: "delegate.sent", target: `${task.taskKey}:${task.id}` });
        const res = await afterChange(actor.onboarding.id);
        // The link is shown once so the client can share it if email is not configured or does not arrive.
        return json({ ok: true, link: url, emailDelivered: task.emailDelivered, state: await clientState(res!.ctx) });
      }

      case "delegate-complete": {
        if (actor.kind !== "delegate") return json({ error: "Not allowed" }, 403);
        await db().put<DelegatedTask>("delegated_tasks", { ...actor.task, status: "completed", completedAt: new Date().toISOString() });
        await emit(actor.onboarding, "DELEGATED_TASK_COMPLETED", { task: actor.task.taskKey });
        await audit({ onboardingId: actor.onboarding.id, actor: who, action: "delegate.completed", target: actor.task.taskKey });
        return respond(actor);
      }

      case "delegate-revoke": {
        clientOnly(actor);
        const b = await body<{ id: string }>(req);
        const t = await db().get<DelegatedTask>("delegated_tasks", String(b.id));
        if (!t || t.onboardingId !== actor.onboarding.id) return json({ error: "Not found" }, 404);
        await db().put<DelegatedTask>("delegated_tasks", { ...t, status: "revoked" });
        await audit({ onboardingId: t.onboardingId, actor: who, action: "delegate.revoked", target: t.id });
        return respond(actor);
      }

      case "offer-share": {
        clientOnly(actor);
        const ctx = await context(actor);
        const input = inputFromWorkshop(ctx.onboarding.companyName, ctx.workshop?.values ?? {}, {
          bonuses: ctx.bonuses,
          guarantees: ctx.guarantees,
          objections: ctx.objections,
        });
        if (!input.outcome || !input.product) return json({ error: "Please answer the Foundation questions (what you sell and the outcome) first." }, 400);
        const rec = await createOfferShare(sanitizeOfferInput(input), "client", ctx.onboarding.id);
        await audit({ onboardingId: ctx.onboarding.id, actor: who, action: "offer.shared", target: rec.id });
        return json({ ok: true, url: `${shareBase(req)}/offer/${rec.id}` });
      }

      case "start": {
        clientOnly(actor);
        const ctx = await context(actor);
        await ensureWorkspace(ctx.onboarding);
        return respond(actor);
      }
    }
    return json({ error: "Not found" }, 404);
  });
}
