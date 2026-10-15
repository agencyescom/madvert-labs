import type { Engagement, ServiceKey } from "../types";

export type AccessGroup = "meta" | "google" | "website" | "domain" | "crm" | "whatsapp" | "social" | "development";

export interface AccessPlatform {
  key: string;
  group: AccessGroup;
  label: string;
  short: string;
  /** Short line on the connection card. */
  blurb: string;
  why: { title: string; body: string };
  /** Services that make this platform required / optional. */
  required: ServiceKey[];
  optional: ServiceKey[];
  when?: (e: Pick<Engagement, "ecommerce" | "localBusiness">) => boolean;
  /** Technical steps that show the "Need help?" experience and can be sent to someone else. */
  technical: boolean;
  /** Event emitted when the team verifies the connection. */
  connectedEvent?: "META_CONNECTED" | "GOOGLE_CONNECTED" | "WEBSITE_CONNECTED";
}

export const ACCESS_PLATFORMS: AccessPlatform[] = [
  {
    key: "meta",
    group: "meta",
    label: "Meta Business Portfolio",
    short: "Meta",
    blurb: "Facebook Page, Instagram, Ad Account, Pixel / Dataset and Catalog through partner access.",
    why: {
      title: "Why we need Meta access",
      body: "This allows our team to review existing campaign history, configure tracking, build campaigns and manage optimisation without taking ownership of your accounts. You stay the owner and can remove partner access at any time.",
    },
    required: ["meta_ads"],
    optional: ["branding", "studios", "crm_automation", "strategy"],
    technical: true,
    connectedEvent: "META_CONNECTED",
  },
  {
    key: "google_ads",
    group: "google",
    label: "Google Ads",
    short: "Google Ads",
    blurb: "Link your Ads account to the Madvert manager account.",
    why: {
      title: "Why we need Google Ads access",
      body: "Linking to our manager account lets us review campaign history, conversion setup and search terms, then build and optimise campaigns. Billing stays on your account and you can unlink at any time.",
    },
    required: ["google_ads"],
    optional: ["strategy"],
    technical: true,
    connectedEvent: "GOOGLE_CONNECTED",
  },
  {
    key: "ga4",
    group: "google",
    label: "Google Analytics 4",
    short: "GA4",
    blurb: "Add the Madvert access email to your GA4 property.",
    why: {
      title: "Why we need Analytics access",
      body: "Analytics shows where qualified visitors come from and where they drop off. We use it to set up conversion tracking and report on real outcomes rather than clicks.",
    },
    required: ["google_ads", "meta_ads", "seo", "website"],
    optional: ["strategy", "crm_automation", "branding"],
    technical: true,
    connectedEvent: "GOOGLE_CONNECTED",
  },
  {
    key: "gtm",
    group: "google",
    label: "Google Tag Manager",
    short: "Tag Manager",
    blurb: "Container access for tracking and conversion tags.",
    why: {
      title: "Why we need Tag Manager access",
      body: "Tag Manager is where tracking for Meta, Google and your CRM is installed. Access lets us fix and add conversion tracking without editing your website code.",
    },
    required: ["google_ads", "meta_ads"],
    optional: ["website", "seo", "crm_automation"],
    technical: true,
    connectedEvent: "GOOGLE_CONNECTED",
  },
  {
    key: "search_console",
    group: "google",
    label: "Google Search Console",
    short: "Search Console",
    blurb: "Full user access to your website property.",
    why: {
      title: "Why we need Search Console access",
      body: "Search Console shows which searches already find you, indexing problems and technical issues. It is the starting point for SEO and AI search work.",
    },
    required: ["seo"],
    optional: ["website", "google_ads", "development"],
    technical: true,
    connectedEvent: "GOOGLE_CONNECTED",
  },
  {
    key: "gbp",
    group: "google",
    label: "Google Business Profile",
    short: "Business Profile",
    blurb: "Manager access to your local listing.",
    why: {
      title: "Why we need Business Profile access",
      body: "For local businesses, your Business Profile drives calls, directions and reviews. Manager access lets us optimise it without becoming the owner.",
    },
    required: ["seo"],
    optional: ["google_ads", "meta_ads", "strategy"],
    when: (e) => e.localBusiness,
    technical: true,
    connectedEvent: "GOOGLE_CONNECTED",
  },
  {
    key: "youtube",
    group: "google",
    label: "YouTube",
    short: "YouTube",
    blurb: "Channel permissions for uploads and video ads.",
    why: {
      title: "Why we need YouTube access",
      body: "Channel permissions let our studio upload and optimise videos and link the channel for video campaigns, without sharing your Google password.",
    },
    required: [],
    optional: ["studios", "google_ads"],
    technical: true,
    connectedEvent: "GOOGLE_CONNECTED",
  },
  {
    key: "merchant_center",
    group: "google",
    label: "Google Merchant Center",
    short: "Merchant Center",
    blurb: "Product feed access for Shopping and Performance Max.",
    why: {
      title: "Why we need Merchant Center access",
      body: "Merchant Center holds your product feed. We need it to fix feed issues and run Shopping and Performance Max campaigns.",
    },
    required: ["google_ads"],
    optional: ["seo"],
    when: (e) => e.ecommerce,
    technical: true,
    connectedEvent: "GOOGLE_CONNECTED",
  },
  {
    key: "website",
    group: "website",
    label: "Website",
    short: "Website",
    blurb: "Admin, collaborator or developer access depending on your platform.",
    why: {
      title: "Why we need website access",
      body: "We may need to install tracking, improve landing pages, fix conversion leaks or connect forms to your CRM. Platform user access is safer than sharing a password.",
    },
    required: ["website", "seo", "meta_ads", "google_ads", "development", "crm_automation"],
    optional: ["branding", "strategy"],
    technical: true,
    connectedEvent: "WEBSITE_CONNECTED",
  },
  {
    key: "domain",
    group: "domain",
    label: "Domain & DNS",
    short: "Domain / DNS",
    blurb: "Delegated access to your registrar or DNS provider.",
    why: {
      title: "Why we need DNS access",
      body: "We may need DNS access for tracking, email authentication, landing pages, CRM integrations or website deployment. Delegated access means you never share your registrar password, and nothing changes without a reason.",
    },
    required: ["website", "development", "crm_automation"],
    optional: ["seo", "meta_ads", "google_ads"],
    technical: true,
  },
  {
    key: "crm",
    group: "crm",
    label: "CRM",
    short: "CRM",
    blurb: "Where your leads and customers live today.",
    why: {
      title: "Why we need CRM access",
      body: "Leads are only valuable if they are followed up. CRM access lets us connect campaigns to your pipeline, automate follow-up and report on revenue rather than form fills.",
    },
    required: ["crm_automation"],
    optional: ["meta_ads", "google_ads", "website", "strategy"],
    technical: true,
  },
  {
    key: "whatsapp",
    group: "whatsapp",
    label: "WhatsApp Business",
    short: "WhatsApp",
    blurb: "Your business number for follow-up and automation.",
    why: {
      title: "Why we ask about WhatsApp",
      body: "Madvert may use your business WhatsApp number for customer communication, lead follow-up, appointment confirmations, sales automation, notifications and marketing workflows where legally permitted.",
    },
    required: ["crm_automation"],
    optional: ["meta_ads", "strategy"],
    technical: true,
  },
  {
    key: "social",
    group: "social",
    label: "Social Profiles",
    short: "Social",
    blurb: "Every profile your customers can find you on.",
    why: {
      title: "Why we need your social profiles",
      body: "Your profiles are where prospects check you out before they buy. We review them for consistency, proof and content opportunities. We prefer platform permissions and never ask for passwords by default.",
    },
    required: ["branding", "studios", "meta_ads"],
    optional: ["seo", "strategy", "google_ads", "crm_automation"],
    technical: false,
  },
  {
    key: "repository",
    group: "development",
    label: "Code, Hosting & Documentation",
    short: "Repository",
    blurb: "Repository, hosting and technical documentation if they exist.",
    why: {
      title: "Why we need repository and hosting access",
      body: "For development work we need to understand what already exists: the code, where it is hosted and how it is deployed, so we build on it rather than around it.",
    },
    required: ["development"],
    optional: [],
    technical: true,
  },
];

export const ACCESS_BY_KEY = Object.fromEntries(ACCESS_PLATFORMS.map((p) => [p.key, p])) as Record<string, AccessPlatform>;

export const GOOGLE_KEYS = ACCESS_PLATFORMS.filter((p) => p.group === "google").map((p) => p.key);

export type AccessRequirement = { platform: AccessPlatform; required: boolean };

/** Which access items this engagement needs. Platforms that are neither required nor optional are not shown. */
export function accessPlan(e: Pick<Engagement, "services" | "ecommerce" | "localBusiness">): AccessRequirement[] {
  const out: AccessRequirement[] = [];
  for (const p of ACCESS_PLATFORMS) {
    if (p.when && !p.when(e)) continue;
    const required = p.required.some((s) => e.services.includes(s));
    const optional = p.optional.some((s) => e.services.includes(s));
    if (required || optional) out.push({ platform: p, required });
  }
  return out;
}

/** Options used inside the wizards. */
export const WEBSITE_PLATFORMS = ["WordPress", "Shopify", "Webflow", "Wix", "Squarespace", "Custom", "Next.js", "Other", "I Don't Know"] as const;
export const REGISTRARS = ["Cloudflare", "GoDaddy", "Namecheap", "Google", "Hostinger", "Other", "I Don't Know"] as const;
export const CRMS = ["GoHighLevel", "HubSpot", "Salesforce", "Zoho", "Pipedrive", "Custom CRM", "Spreadsheet", "None"] as const;
export const SOCIAL_PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "TikTok", "YouTube", "X", "Pinterest", "Other"] as const;
export const META_ASSETS = ["Facebook Page", "Instagram Account", "Ad Account", "Meta Pixel / Dataset", "Catalog", "Commerce Account"] as const;
