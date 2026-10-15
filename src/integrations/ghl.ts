import "server-only";

/**
 * Minimal GoHighLevel (LeadConnector API v2) client for the Patches Partnership application.
 * Server-only: the access token is read from the environment here and never leaves the server.
 */

const API_BASE = process.env.GHL_API_BASE || "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";
const TIMEOUT_MS = 10_000;

/** Existing GHL configuration (custom field IDs are not secrets; they stay server-side anyway). */
export const PATCHES_GHL = {
  source: "Madvert Labs Patches Partnership Landing Page",
  applicationTag: "patches-partnership-application",
  customFields: {
    productionLocation: "IscjkYCnE6YKBY79MT8i",
    marketsServed: "esMyG8WQK1zXHBebaABo",
    patchTypesOffered: "FIC0eFhfxipnTvf5kQOL",
    currentMonthlyOrderVolume: "cy0HdM392jNFTLKxF5Gj",
    averageOrderValue: "SXeqJkP6GIIhGtupmWzE",
    extraOrdersCapacity: "iRbVcV8lFbkOzW7V7GA2",
    currentlyRunningAds: "s0n3ALvJIxXLYKrSTOE9",
    salesQuotingResponsibility: "4jba43BNKcdteDp2pe2w",
    leadResponseSpeed: "qRl1iuaFCXUErIS81gcd",
    currentCrm: "sUSkKMq5pgM4GWFlaXT9",
    desiredRfqVolume: "RkC8qWzlkZNsFfmMTM5i",
    canAllocateBudget: "phPk0PwuyAF9NmWNzwxx",
    partnershipSuccessGoal: "5JGqCBEYSMcFpIl4bAuO",
  },
} as const;

export type GhlConfig = {
  token: string;
  locationId: string;
  pipelineId: string;
  newApplicationStageId: string;
};

/** Reads the required Vercel variables. Returns the names of any that are missing (never their values). */
export function ghlConfig(): { ok: true; config: GhlConfig } | { ok: false; missing: string[] } {
  const env = {
    GHL_ACCESS_TOKEN: process.env.GHL_ACCESS_TOKEN,
    GHL_LOCATION_ID: process.env.GHL_LOCATION_ID,
    GHL_PIPELINE_ID: process.env.GHL_PIPELINE_ID,
    GHL_STAGE_NEW_APPLICATION_ID: process.env.GHL_STAGE_NEW_APPLICATION_ID,
  };
  const missing = Object.entries(env)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) return { ok: false, missing };
  return {
    ok: true,
    config: {
      token: env.GHL_ACCESS_TOKEN!,
      locationId: env.GHL_LOCATION_ID!,
      pipelineId: env.GHL_PIPELINE_ID!,
      newApplicationStageId: env.GHL_STAGE_NEW_APPLICATION_ID!,
    },
  };
}

export class GhlError extends Error {
  constructor(
    public step: string,
    public status: number,
    public detail: string,
  ) {
    super(`GHL ${step} failed (${status})`);
  }
}

async function ghl<T>(cfg: GhlConfig, step: string, method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Version: API_VERSION,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      cache: "no-store",
    });
  } catch (e) {
    throw new GhlError(step, 0, e instanceof Error ? e.message : "network error");
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text();
  if (!res.ok) throw new GhlError(step, res.status, text.slice(0, 500));
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new GhlError(step, res.status, "invalid JSON response");
  }
}

export type CustomFieldValue = { id: string; field_value: string | number | string[] };

/** Contact Upsert: GHL matches on email/phone per the location's duplicate settings. */
export async function upsertContact(
  cfg: GhlConfig,
  contact: {
    firstName: string;
    lastName?: string;
    name: string;
    email: string;
    phone: string;
    companyName?: string;
    website?: string;
    customFields: CustomFieldValue[];
  },
) {
  const res = await ghl<{ new?: boolean; contact?: { id?: string } }>(cfg, "contact_upsert", "POST", "/contacts/upsert", {
    locationId: cfg.locationId,
    ...contact,
    source: PATCHES_GHL.source,
  });
  const id = res.contact?.id;
  if (!id) throw new GhlError("contact_upsert", 200, "response had no contact id");
  return { id, isNew: !!res.new };
}

/** Adds tags without touching the contact's existing tags (Upsert would replace them). */
export async function addTags(cfg: GhlConfig, contactId: string, tags: string[]) {
  await ghl(cfg, "add_tags", "POST", `/contacts/${encodeURIComponent(contactId)}/tags`, { tags });
}

export async function addNote(cfg: GhlConfig, contactId: string, body: string) {
  await ghl(cfg, "add_note", "POST", `/contacts/${encodeURIComponent(contactId)}/notes`, { body });
}

type Opportunity = { id: string; status?: string; pipelineId?: string; pipelineStageId?: string; name?: string };

export async function findOpenOpportunity(cfg: GhlConfig, contactId: string): Promise<Opportunity | null> {
  const q = new URLSearchParams({ location_id: cfg.locationId, pipeline_id: cfg.pipelineId, contact_id: contactId, status: "open" });
  const res = await ghl<{ opportunities?: Opportunity[] }>(cfg, "opportunity_search", "GET", `/opportunities/search?${q}`);
  return (res.opportunities ?? []).find((o) => (!o.pipelineId || o.pipelineId === cfg.pipelineId) && (!o.status || o.status === "open")) ?? null;
}

export async function createOpportunity(cfg: GhlConfig, contactId: string, name: string): Promise<Opportunity> {
  const res = await ghl<{ opportunity?: Opportunity }>(cfg, "opportunity_create", "POST", "/opportunities/", {
    locationId: cfg.locationId,
    pipelineId: cfg.pipelineId,
    pipelineStageId: cfg.newApplicationStageId,
    contactId,
    name,
    status: "open",
    source: PATCHES_GHL.source,
  });
  if (!res.opportunity?.id) throw new GhlError("opportunity_create", 200, "response had no opportunity id");
  return res.opportunity;
}

type RawField = {
  id: string;
  name?: string;
  fieldKey?: string;
  dataType?: string;
  parentId?: string;
  model?: string;
  picklistOptions?: (string | { label?: string; key?: string })[];
};
export type FieldDef = { id: string; name: string; dataType: string; parentId?: string; options: string[] };

/** All contact custom fields of the location (type + dropdown options), cached per server instance. Null when unreadable. */
let fieldCache: { at: number; defs: FieldDef[] | null } | null = null;
export async function contactFieldDefs(cfg: GhlConfig): Promise<FieldDef[] | null> {
  if (fieldCache && Date.now() - fieldCache.at < 5 * 60_000) return fieldCache.defs;
  let defs: FieldDef[] | null = null;
  try {
    const res = await ghl<{ customFields?: RawField[] }>(
      cfg,
      "custom_fields_list",
      "GET",
      `/locations/${encodeURIComponent(cfg.locationId)}/customFields?model=contact`,
    );
    defs = (res.customFields ?? []).map((f) => ({
      id: f.id,
      name: f.name ?? f.fieldKey ?? f.id,
      dataType: (f.dataType ?? "TEXT").toUpperCase(),
      parentId: f.parentId,
      options: (f.picklistOptions ?? []).map((o) => (typeof o === "string" ? o : (o.label ?? o.key ?? ""))).filter(Boolean),
    }));
  } catch (e) {
    console.warn("[apply] could not read the location's custom fields:", e instanceof GhlError ? `${e.step} HTTP ${e.status} ${e.detail.slice(0, 200)}` : e);
  }
  fieldCache = { at: Date.now(), defs };
  return defs;
}

const MULTI_TYPES = new Set(["CHECKBOX", "MULTIPLE_OPTIONS"]);
const SINGLE_TYPES = new Set(["SINGLE_OPTIONS", "RADIO", "DROPDOWN"]);
const norm = (v: string) =>
  v
    .toLowerCase()
    .replace(/[‒-―−-]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();

/**
 * One questionnaire answer bound for a custom field. `id` is the known field; `match` finds a field
 * by name (in the Patches Partnership folder) when no ID is configured. Each value lists the labels
 * that count as the same option (e.g. "United States" / "USA").
 */
export type AnswerMapping = { answer: string; id?: string; match?: RegExp; values: string[][] };
export type MappingReport = { answer: string; field?: string; fieldId?: string; sent?: string | string[]; problem?: string };

/** Turns answers into GHL customFields, shaped for each field's type: option fields get exact option labels. */
export async function buildCustomFields(cfg: GhlConfig, mappings: AnswerMapping[]) {
  const defs = await contactFieldDefs(cfg);
  const byId = new Map((defs ?? []).map((d) => [d.id, d]));
  const folder = mappings.map((m) => (m.id ? byId.get(m.id)?.parentId : undefined)).find(Boolean);
  const used = new Set(mappings.map((m) => m.id).filter(Boolean));
  const customFields: { id: string; field_value: string | string[] }[] = [];
  const report: MappingReport[] = [];

  for (const m of mappings) {
    let def = m.id ? byId.get(m.id) : undefined;
    if (!def && !m.id && m.match && defs) {
      const pool = defs.filter((d) => !used.has(d.id) && m.match!.test(d.name));
      def = pool.find((d) => folder && d.parentId === folder) ?? (folder ? undefined : pool[0]);
    }
    const id = def?.id ?? m.id;
    if (!id) {
      report.push({ answer: m.answer, problem: "no matching custom field in GHL (kept in the contact note)" });
      continue;
    }
    used.add(id);
    const preferred = m.values.map((v) => v[0]);
    let value: string | string[] = preferred.join(", ");
    let problem: string | undefined;
    if (def && (MULTI_TYPES.has(def.dataType) || SINGLE_TYPES.has(def.dataType))) {
      const pick = (labels: string[]) => def!.options.find((o) => labels.some((l) => norm(l) === norm(o)));
      const picked = m.values.map(pick);
      const missing = m.values.filter((_, i) => !picked[i]).map((v) => v[0]);
      const found = picked.filter((o): o is string => !!o);
      if (missing.length) problem = `answer not among the field's options [${def.options.join(" | ")}]: ${missing.join(", ")}`;
      if (!found.length) {
        report.push({ answer: m.answer, field: def.name, fieldId: id, problem });
        continue;
      }
      value = MULTI_TYPES.has(def.dataType) ? found : found[0];
    }
    customFields.push({ id, field_value: value });
    report.push({ answer: m.answer, field: def?.name, fieldId: id, sent: value, problem });
  }
  return { customFields, report };
}

/** Reads the saved contact back and returns the IDs of sent custom fields that are still empty. */
export async function blankCustomFields(cfg: GhlConfig, contactId: string, ids: string[]): Promise<string[]> {
  const res = await ghl<{ contact?: { customFields?: { id: string; value?: unknown; field_value?: unknown }[] } }>(
    cfg,
    "contact_read",
    "GET",
    `/contacts/${encodeURIComponent(contactId)}`,
  );
  const saved = new Map((res.contact?.customFields ?? []).map((f) => [f.id, f.value ?? f.field_value]));
  const empty = (v: unknown) => v == null || v === "" || (Array.isArray(v) && v.length === 0);
  return ids.filter((id) => empty(saved.get(id)));
}
