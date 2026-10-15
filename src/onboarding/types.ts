/**
 * Madvert Operations · Client Onboarding domain model.
 * Every record is linked to an Onboarding, which is linked to a Client and an Engagement.
 * Each type maps to one collection (one table in Postgres, see server/db.ts).
 */

export type ISODate = string;

/* ───────── Services / engagement ───────── */

export type ServiceKey =
  | "meta_ads"
  | "google_ads"
  | "seo"
  | "website"
  | "branding"
  | "studios"
  | "crm_automation"
  | "development"
  | "strategy";

export interface Client {
  id: string;
  name: string;
  slug: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Engagement {
  id: string;
  clientId: string;
  services: ServiceKey[];
  ecommerce: boolean;
  localBusiness: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ───────── Onboarding ───────── */

export type OnboardingStatus = "active" | "completed" | "revoked" | "expired";

export interface Onboarding {
  id: string;
  clientId: string;
  engagementId: string;
  /** sha256 of the secure client token. The token itself is never stored. */
  tokenHash: string;
  /** Last 4 characters, so the team can tell links apart. */
  tokenHint: string;
  /** Encrypted copy of the link token (see server/crypto sealToken) so the team can resend it. */
  tokenSealed?: string;
  status: OnboardingStatus;
  expiresAt: ISODate;
  contact: { firstName: string; lastName?: string; email: string; phone?: string };
  companyName: string;
  accountManager: { name: string; email?: string; title?: string };
  strategist?: string;
  assignedOwner?: string;
  estimatedMinutes: [number, number];
  startedAt?: ISODate;
  lastClientActivityAt?: ISODate;
  completedAt?: ISODate;
  /** Offer workshop decision. */
  offerMode?: "now" | "kickoff";
  reminders: { key: string; sentAt: ISODate }[];
  /** Cached progress so the ops list does not recompute everything. */
  progressCache?: { overall: number; phases: Record<string, number> };
  createdBy: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type AnswerValue = string | string[] | boolean | number | null;

/** One answer document per section: { questionKey: value }. */
export interface OnboardingAnswer {
  id: string; // `${onboardingId}:${sectionKey}`
  onboardingId: string;
  sectionKey: string;
  values: Record<string, AnswerValue>;
  updatedAt: ISODate;
  updatedBy: "client" | "delegate" | "team";
}

/** Per-section state the team or client sets explicitly (e.g. completed, skipped). */
export interface OnboardingSection {
  id: string; // `${onboardingId}:${sectionKey}`
  onboardingId: string;
  sectionKey: string;
  status: "not_started" | "in_progress" | "completed" | "skipped";
  updatedAt: ISODate;
}

/* ───────── Access ───────── */

export type AccessStatus =
  | "not_started"
  | "pending" // client says access was sent, awaiting Madvert verification
  | "connected" // verified by Madvert
  | "not_required"
  | "need_help"
  | "kickoff"; // complete during kickoff

export interface AccessConnection {
  id: string; // `${onboardingId}:${platform}`
  onboardingId: string;
  platform: string;
  status: AccessStatus;
  /** Wizard answers for this platform (has portfolio, website platform, registrar, etc.). */
  details: Record<string, AnswerValue>;
  clientNote?: string;
  verifiedBy?: string;
  verifiedAt?: ISODate;
  updatedAt: ISODate;
}

/** Encrypted credential (AES-256-GCM). Never returned to the client and never put in PDFs, events or logs. */
export interface SecretRecord {
  id: string;
  onboardingId: string;
  platform: string;
  label: string;
  username?: string;
  cipher: string; // base64(iv|tag|ciphertext)
  createdAt: ISODate;
  createdBy: "client" | "delegate" | "team";
  revealedCount: number;
}

/* ───────── Assets ───────── */

export interface ClientAsset {
  id: string;
  onboardingId: string;
  category: string;
  kind: "file" | "link";
  name: string;
  /** Storage key (files) — never a public URL. */
  storageKey?: string;
  storageDriver?: "local" | "vercel-blob";
  mimeType?: string;
  size?: number;
  url?: string; // links only (Drive / Dropbox / OneDrive / folder)
  linkProvider?: "google_drive" | "dropbox" | "onedrive" | "other";
  note?: string;
  folder: string; // e.g. "01 Brand"
  uploadedBy: "client" | "delegate" | "team";
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface CloudFolder {
  id: string;
  onboardingId: string;
  provider: "internal" | "google_drive";
  name: string;
  path: string;
  externalId?: string;
  externalUrl?: string;
  createdAt: ISODate;
}

export interface SocialProfile {
  id: string;
  onboardingId: string;
  platform: string;
  url: string;
  username?: string;
  accessStatus: "shared" | "need_help" | "not_required";
  createdAt: ISODate;
}

export interface ProofAsset {
  id: string;
  onboardingId: string;
  type: string; // google_reviews, trustpilot, award, certification, ...
  title: string;
  url?: string;
  assetId?: string;
  createdAt: ISODate;
}

/* ───────── Offer workshop ───────── */

export interface OfferWorkshop {
  id: string; // = onboardingId
  onboardingId: string;
  status: "not_started" | "in_progress" | "completed" | "skipped";
  values: Record<string, AnswerValue>;
  /** Strategy ideas the team writes or approves. Always labelled MADVERT STRATEGY IDEA. */
  strategyNotes?: string;
  updatedAt: ISODate;
}

export interface OfferBonus {
  id: string;
  onboardingId: string;
  name: string;
  description?: string;
  perceivedValue?: string;
  actualCost?: string;
  conditions?: string;
  order: number;
}

export interface OfferGuarantee {
  id: string;
  onboardingId: string;
  type: string;
  terms: string;
  /** Must be true before Madvert uses the claim publicly. */
  clientApproved: boolean;
  order: number;
}

export interface Objection {
  id: string;
  onboardingId: string;
  category?: string;
  objection: string;
  currentResponse?: string;
  evidence?: string;
  strategyNotes?: string; // team only
  order: number;
}

export interface Competitor {
  id: string;
  onboardingId: string;
  name: string;
  website?: string;
  strengths?: string;
  weaknesses?: string;
  difference?: string;
  order: number;
}

/* ───────── Tasks, delegation, kickoff ───────── */

export interface OnboardingTask {
  id: string; // `${onboardingId}:${key}`
  onboardingId: string;
  key: string; // access:meta, asset:logos, business, ...
  label: string;
  phase: PhaseKey;
  required: boolean;
  status: "open" | "pending" | "done" | "not_required" | "kickoff";
  note?: string;
  updatedAt: ISODate;
}

export interface DelegatedTask {
  id: string;
  onboardingId: string;
  taskKey: string; // e.g. access:meta, access:domain, asset:logos, question:billing
  taskLabel: string;
  name: string;
  email: string;
  role?: string;
  message?: string;
  tokenHash: string;
  status: "sent" | "opened" | "completed" | "revoked";
  emailDelivered: boolean;
  expiresAt: ISODate;
  openedAt?: ISODate;
  completedAt?: ISODate;
  createdAt: ISODate;
}

export interface KickoffBooking {
  id: string; // = onboardingId
  onboardingId: string;
  status: "booked" | "cancelled";
  startsAt?: ISODate;
  timezone?: string;
  meetingUrl?: string;
  strategist?: string;
  source: "widget" | "client_confirmed" | "webhook" | "team";
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface InternalNote {
  id: string;
  onboardingId: string;
  sectionKey: string; // business, access, assets, offer, kickoff, general, or access:meta ...
  body: string;
  tag?: string;
  author: string;
  createdAt: ISODate;
}

/* ───────── Guides, events, audit, settings, template ───────── */

export interface GuideStep {
  id: string; // `${platform}:${n}` for defaults
  platform: string;
  stepNumber: number;
  title: string;
  instruction: string;
  /** Uploaded screenshot (storage key, served through /api/onboarding/guide-image). */
  screenshotKey?: string;
  /** Built-in illustration spec used when no screenshot is uploaded. */
  illustration?: GuideIllustration;
  externalHelpUrl?: string;
  lastReviewedAt?: ISODate;
  updatedBy?: string;
  updatedAt?: ISODate;
}

export interface GuideIllustration {
  chrome: string; // product name in the top bar
  nav: string[]; // left navigation items
  active?: string; // highlighted nav item
  title?: string; // content title
  rows?: string[];
  button?: string; // highlighted primary button
  field?: { label: string; value: string };
  checks?: string[];
}

export type EventName =
  | "ONBOARDING_STARTED"
  | "BUSINESS_INFO_COMPLETED"
  | "ACCESS_STARTED"
  | "META_CONNECTED"
  | "GOOGLE_CONNECTED"
  | "WEBSITE_CONNECTED"
  | "ASSETS_UPLOADED"
  | "OFFER_COMPLETED"
  | "OFFER_SKIPPED"
  | "KICKOFF_BOOKED"
  | "ONBOARDING_COMPLETE"
  | "MISSING_ACCESS"
  | "DELEGATED_TASK_SENT"
  | "DELEGATED_TASK_COMPLETED"
  | "REMINDER_SENT";

export interface OnboardingEvent {
  id: string;
  onboardingId: string;
  name: EventName;
  data: Record<string, string | number | boolean | null>;
  delivered: number;
  createdAt: ISODate;
}

export interface AuditLog {
  id: string;
  onboardingId?: string;
  actor: string; // client | delegate:<id> | team:<email> | system
  action: string;
  target?: string;
  ip?: string;
  createdAt: ISODate;
}

export interface CompanySettings {
  id: "company";
  integrations: {
    metaPartnerBusinessId: string;
    googleAdsManagerId: string;
    googleAccessEmail: string;
    websiteAccessEmail: string;
    dnsAccessEmail: string;
    crmAccessEmail: string;
    shopifyCollaboratorCode?: string;
    bookingUrl: string;
    supportEmail: string;
    supportWhatsApp: string;
  };
  defaults: { accountManager: string; accountManagerEmail: string; strategist: string; linkLifetimeDays: number };
  updatedAt?: ISODate;
  updatedBy?: string;
}

export interface TemplateOverride {
  id: string; // question key or `section:${key}`
  hidden?: boolean;
  required?: boolean;
  label?: string;
  help?: string;
  order?: number;
  updatedAt: ISODate;
}

export interface CustomQuestion {
  id: string;
  sectionKey: string;
  label: string;
  type: "text" | "textarea" | "select" | "multi";
  options?: string[];
  required: boolean;
  help?: string;
  showIf?: { key: string; equals: string };
  order: number;
  createdAt: ISODate;
}

/* ───────── Progress ───────── */

export type PhaseKey = "business" | "access" | "assets" | "offer" | "kickoff";
export type PhaseStatus = "incomplete" | "in_progress" | "completed" | "optional" | "blocked";

export interface PhaseProgress {
  key: PhaseKey;
  label: string;
  percent: number;
  status: PhaseStatus;
  note?: string;
}

export interface MissingItem {
  key: string;
  label: string;
  phase: PhaseKey;
  state: "Pending" | "Awaiting verification" | "Needs help" | "During kickoff" | "Create before launch" | "Not started";
  required: boolean;
}
