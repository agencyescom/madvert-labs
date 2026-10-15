import "server-only";
import { booking } from "@/lib/site";
import type { CompanySettings } from "../types";
import { db } from "./db";

/** Settings → Company → Integrations. Stored in the database; environment variables provide the first defaults. */
export function defaultSettings(): CompanySettings {
  const env = process.env;
  return {
    id: "company",
    integrations: {
      metaPartnerBusinessId: env.MADVERT_META_PARTNER_ID ?? "977388997110589",
      googleAdsManagerId: env.MADVERT_GOOGLE_ADS_MANAGER_ID ?? "",
      googleAccessEmail: env.MADVERT_GOOGLE_ACCESS_EMAIL ?? "info@madvertlabs.com",
      websiteAccessEmail: env.MADVERT_WEBSITE_ACCESS_EMAIL ?? "info@madvertlabs.com",
      dnsAccessEmail: env.MADVERT_DNS_ACCESS_EMAIL ?? "info@madvertlabs.com",
      crmAccessEmail: env.MADVERT_CRM_ACCESS_EMAIL ?? "info@madvertlabs.com",
      shopifyCollaboratorCode: "",
      bookingUrl: env.ONBOARDING_BOOKING_URL ?? booking.url,
      supportEmail: env.MADVERT_SUPPORT_EMAIL ?? "hello@madvertlabs.com",
      supportWhatsApp: env.MADVERT_SUPPORT_WHATSAPP ?? "",
    },
    defaults: {
      accountManager: env.MADVERT_DEFAULT_ACCOUNT_MANAGER ?? "Usama Abbas Dahri",
      accountManagerEmail: env.MADVERT_DEFAULT_ACCOUNT_MANAGER_EMAIL ?? "info@madvertlabs.com",
      strategist: env.MADVERT_DEFAULT_STRATEGIST ?? "Usama Abbas Dahri",
      linkLifetimeDays: Number(env.ONBOARDING_LINK_DAYS ?? 60),
    },
  };
}

export async function getSettings(): Promise<CompanySettings> {
  const base = defaultSettings();
  const saved = await db().get<CompanySettings>("settings", "company");
  if (!saved) return base;
  const pick = <T extends object>(a: T, b?: Partial<T>) =>
    Object.fromEntries(Object.entries(a).map(([k, v]) => [k, (b as Record<string, unknown> | undefined)?.[k] || v])) as T;
  return { ...saved, integrations: pick(base.integrations, saved.integrations), defaults: pick(base.defaults, saved.defaults) };
}

/** What the client UI may see. Everything here is meant to be shared with clients. */
export function publicIntegrations(s: CompanySettings) {
  const i = s.integrations;
  return {
    metaPartnerId: i.metaPartnerBusinessId,
    googleAdsManagerId: i.googleAdsManagerId,
    googleAccessEmail: i.googleAccessEmail,
    websiteAccessEmail: i.websiteAccessEmail,
    dnsAccessEmail: i.dnsAccessEmail,
    crmAccessEmail: i.crmAccessEmail,
    bookingUrl: i.bookingUrl,
    supportEmail: i.supportEmail,
    supportWhatsApp: i.supportWhatsApp,
  };
}
export type PublicIntegrations = ReturnType<typeof publicIntegrations>;

/** Settings the team still has to fill in, shown as "Configuration Required". */
export function missingSettings(s: CompanySettings) {
  const i = s.integrations;
  const out: string[] = [];
  if (!i.metaPartnerBusinessId) out.push("Meta Partner Business ID");
  if (!i.googleAccessEmail) out.push("Google access email");
  if (!i.websiteAccessEmail) out.push("Website access email");
  if (!i.dnsAccessEmail) out.push("DNS access email");
  if (!i.crmAccessEmail) out.push("CRM access email");
  return out;
}
