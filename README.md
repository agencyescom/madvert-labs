# Madvert Labs website

**Beyond Advertising. We Build Growth Systems.**

Production website for Madvert Labs (Digital Marketing and Growth Systems), built with Next.js 16.3 (App Router, Cache Components), TypeScript strict, Tailwind CSS 4, GSAP ScrollTrigger and Framer Motion, with Sanity as the CMS.

**Hosting: Vercel** (standard Next.js deployment, no extra adapter or config).

## Quick start

Requires Node 20.9+.

```bash
npm install
cp .env.example .env.local   # every variable is optional for local development
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
npm run lint && npm run typecheck
```

Without any environment variables the site runs fully on clearly marked placeholder content. Forms validate and respond, and booking shows a "being connected" state instead of inventing availability.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home: intro, hero, problem story, fragmentation, philosophy, six pillar gallery, owned demand and AI search, AI leverage, growth loop, proof, case previews, why Madvert, Challenge Madvert, founder, about teaser, Vault, final CTA |
| `/services` | What We Do overview |
| `/services/branding-marketing` | Branding and Marketing |
| `/services/client-acquisition` | Client Acquisition |
| `/services/conversion` | Conversion |
| `/services/automation-revenue-systems` | Automation and Revenue Systems |
| `/services/tech-product-development` | Tech and Product Development |
| `/studios` | Madvert Studios (showreel at `#showreel`) |
| `/case-studies`, `/case-studies/[slug]` | Evidence Room with filters and dossier pages |
| `/resources`, `/resources/[slug]` | Madvert Vault and one landing page per lead magnet |
| `/about`, `/contact` (`#book`), `/challenge`, `/privacy` | |
| `/api/leads` | Growth brief, challenge (with optional upload) and resource requests |
| `/api/events` | Calendar opened / booked hooks for the CRM |
| `/api/revalidate` | Sanity publish webhook |
| `/onboarding/*`, `/ops/*` | Client Onboarding Portal and Madvert Operations (see below) |

Contact links accept `?service=<slug>` and `?intent=growth-systems-audit|tech-opportunity-audit`; both travel with the lead.

## Project structure

```
src/
  app/            routes, metadata, sitemap, robots, OG image, API routes
  components/     ui (Button, Icon3D, Logo, MadvertMark, Section), layout (Header, Footer, ThemeToggle), visuals (GrowthRibbon, PillarWorld, ResourceCover), story (StickyStory), seo (JsonLd)
  sections/       page sections: home/, services/, studios/, cases/, shared/
  animations/     lazy GSAP scene hook, scroll step hooks
  cms/            Sanity client, GROQ queries, cached readers, placeholder fallback content
  forms/          Zod schemas, fields, ContactFlow, BookingWidget, ChallengeForm, ResourceGate
  integrations/   CRM webhooks, Meta CAPI, GA4 MP, email, rate limit, spam
  analytics/      event names, track(), client boot (reveals, click tracking, scroll depth, attribution)
  lib/            site config, SEO helpers, theme boot script, attribution
  hooks/ types/
studio/           Sanity Studio config and schemas (separate install)
```

## Brand system

* Colour tokens are CSS variables in `src/app/globals.css`, defined for both themes (`[data-theme="dark"]` / `[data-theme="light"]`) and mapped into Tailwind with `@theme`.
* The theme is resolved before first paint by an inline script (stored choice, then system preference), so there is no flash. Visitors can switch with the header toggle; the choice persists in `localStorage`.
* Logo files in `public/brand/` were keyed out of the supplied master artwork (no redesign). `MadvertMark` is a trace of the supplied app icon.
* The **Growth Ribbon** (`components/visuals/GrowthRibbon.tsx`) is the recurring signature: hero band, footer, final CTAs, connectors, the pipeline repair in the problem story and the hero connection lines.
* `Icon3D` renders the dimensional icon system (extruded body plus a lit cyan accent) from one shared set of gradients.

## Motion and accessibility

* Content is server rendered and visible without JavaScript. Reveals only hide content once the client has booted, and the first screen of each page never waits for JavaScript.
* Scrollytelling uses CSS `position: sticky` and the reading position, not scroll hijacking. GSAP is loaded on demand after hydration and runs inside `gsap.matchMedia` so `prefers-reduced-motion` gets static, complete states.
* The opening intro plays at most once per 24 hours, can be skipped with any key or tap, and is skipped entirely under reduced motion.
* Skip link, visible focus states, labelled form controls, `aria-live` for status updates, and keyboard operable menus (Escape closes).

## CMS (Sanity)

1. Create a Sanity project, then set `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` and (for private datasets) `SANITY_API_READ_TOKEN`.
2. Studio: `cd studio && npm install && SANITY_STUDIO_PROJECT_ID=<id> npm run dev`.
3. Schemas cover Page, Service, Case Study, Resource, Lead Magnet, Portfolio Project, Testimonial, Client, Team Member, FAQ, Proof Item, Insight, SEO, Site Settings, Calendar Settings, Navigation and Footer.
4. Add a Sanity webhook to `POST /api/revalidate` with header `x-revalidate-secret: <SANITY_REVALIDATE_SECRET>` and projection `{_type}`. Content is cached per type and refreshes on publish.
5. Set `SANITY_API_WRITE_TOKEN` to enable file uploads on `/challenge` (otherwise visitors share a link).

Readers fall back to `src/cms/fallback.ts` when Sanity is not configured or returns nothing.

### Content placeholder rule

No testimonials, clients, metrics, certifications or awards are invented. Every proof slot shows a bracketed label such as `[REAL CLIENT TESTIMONIAL]` or `[REAL CASE STUDY METRIC]`. Placeholder case studies carry `placeholder: true`, show "Awaiting real data", are `noindex` and are left out of the sitemap. Testimonials only publish when "Client approved for publication" is ticked. Charts and models on the site (owned demand chart, interest temperature, visitor journey, calculator) are labelled as illustrations.

Founder photography is included (`public/images/usama-abbas-dahri*`) and used in the hero, founder sections and About; a Sanity upload in Site Settings overrides it. Replace before launch: showreel, portfolio, proof items, case studies, team photos, resource files and covers, and the privacy policy (`/privacy` is marked for legal review).

## Booking calendar

All booking CTAs lead to one calendar: the Madvert LeadConnector widget
(`https://api.madvertlabs.com/widget/booking/pvk8u6OhzYeIizvLDelx`, override with `NEXT_PUBLIC_BOOKING_URL`).

* `<MadvertBookingCalendar />` is the only component that embeds it (lazy loaded near the viewport, auto resized by the widget's `form_embed.js`).
* `<BookingSection />` ("Partner Up with MADVERT Labs") sits before the footer on the home, service, Studios, What We Do, case studies, resources, about, contact and every lead magnet page, with contextual copy.
* Any link to `#book` (header, mobile sticky CTA, service and final CTAs) smooth scrolls to that section, or opens the calendar in a modal (full screen sheet on mobile) on pages without one.
* `calendar_open` fires when the calendar loads; `calendar_booking_complete` fires when the widget reports a completed booking through `postMessage` (best effort; treat the CRM's own appointment record as the source of truth).

## Leads, CRM and conversions

Every form is validated with Zod on the client and again on the server, protected by a honeypot, a minimum completion time, rate limiting (Upstash Redis when configured, in memory otherwise) and optional Cloudflare Turnstile.

Each lead carries attribution: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, landing page, first page, referrer, first seen, timestamp and the last CTA clicked, plus the selected service, intent and resource.

After the response is sent, leads fan out to whichever destinations are configured: GoHighLevel, Zapier, Make, n8n or any generic webhook (flat JSON payload, see `integrations/webhooks.ts`), HubSpot Forms API, Slack, an internal notification email, Meta Conversions API (deduplicated with the Pixel through a shared event id) and GA4 Measurement Protocol. Google Ads enhanced conversions are set client side before the conversion fires.

## Analytics

GTM (`GTM-MDFSNH4H`) is the tag management layer and loads once. GA4 (`G-MNM7Y974JB`) loads once through gtag, **unless** `NEXT_PUBLIC_GA4_VIA_GTM=true`, in which case GA4 must be configured as a tag inside GTM. Use one or the other, never both, or page views double count. Route changes are measured by GA4 enhanced measurement ("page changes based on browser history events", on by default); the site never sends a manual page_view. Every event is also pushed to `dataLayer` (plus `virtual_page_view` on route changes) for GTM triggers. Google Ads, Meta Pixel and Clarity load only when their IDs are set.

`strategy_call_click`, `calendar_open`, `calendar_booking_complete`, `service_card_click`, `service_cta_click`, `service_page_view`, `lead_magnet_click`, `contact_form_start`, `contact_form_complete`, `case_study_open`, `resource_download`, `showreel_play`, `whatsapp_click`, `email_click` (both automatic for `wa.me` and `mailto:` links), `scroll_50`, `scroll_75`, `scroll_90`, `theme_switch`, and the lead magnet funnel: `lead_magnet_view`, `lead_magnet_form_start`, `lead_magnet_conversion`, `lead_magnet_download`, `lead_magnet_calendar_click`, `lead_magnet_related_resource_click` (each with `lead_magnet_name`, `page_path` and UTM source, medium and campaign). Add `data-track="<event>"` to any link to track it.

## Lead magnets (Madvert Vault)

Every resource has its own landing page at `/resources/<slug>`, built from one template and the list in `src/content/lead-magnets.ts` (Sanity `resource` documents can add or override entries without code). Cards never open a file directly.

| Slug | Resource | CRM source id |
| --- | --- | --- |
| `landing-pages-that-sell` | The Art of Building Landing Pages That Sell | `leadmagnet_landing_pages` |
| `seo-ai-search-playbook` | Get Found on Google. Get Discovered by AI. | `leadmagnet_seo_ai` |
| `meta-ads-pre-launch-checklist` | Ultimate Meta Ads Pre-Launch Checklist | `leadmagnet_meta_ads` |
| `ai-content-automation-playbook` | Never Run Out of Content Again | `leadmagnet_content_automation` |
| `automated-lead-engine` | Build Your Automated Lead Engine | `leadmagnet_lead_engine` |
| `build-that-offer` | Build That Offer Then Retire (artwork pending) | `leadmagnet_offer` |
| `growth-systems-audit`, `brand-perception-checklist`, `qualified-lead-generation-playbook`, `conversion-leak-checklist`, `revenue-leakage-audit`, `tech-opportunity-audit`, `madvert-studios-showreel` | Audits, checklists and showreel | `leadmagnet_*` |

Official cover artwork lives in `public/lead-magnets/<slug>.webp` (plus `.jpg` for email and social previews).

On submission (first name + email, plus company or website where useful) the lead is validated, then sent to the CRM webhooks with `lead_source` = the source id, `lead_magnet`, tags and full UTM attribution. Use that tag in the CRM to deliver the resource and start the matching nurture. If a resource has a `fileUrl` it is also unlocked on the page. Calendar opened / booked hooks are posted to `/api/events` and forwarded to the same webhooks (`madvert.calendar_opened`, `madvert.calendar_booked`) with the lead magnet attached.

## SEO and AI search

Unique titles, descriptions, canonicals, Open Graph and Twitter cards on every page; a generated OG image; sitemap and robots; JSON-LD for Organization and ProfessionalService, WebSite, WebPage, Person, BreadcrumbList, Service, FAQPage, Article and CreativeWork. Each service page ends with a direct answer block (who it is for, problem solved, process, measures) and real FAQs.

## Client Onboarding Portal (Madvert Operations)

After **proposal accepted → contract signed → initial payment received**, the team creates a secure personalised link in Madvert Operations and the client completes a guided, autosaving onboarding at `/onboarding/{secure-client-token}`.

The portal and Operations use their own root layout (`src/app/(portal)`): no marketing header, no analytics or tracking scripts, `noindex`, `no-referrer`, `no-store`. The marketing site moved into `src/app/(site)` (URLs unchanged); `app/global-not-found.tsx` serves 404s for both.

### Routes

| Route | Purpose |
| --- | --- |
| `/onboarding/[token]` | Client portal: Welcome → Command center → 01 Business → 02 Access → 03 Assets → 04 Strategy (optional Offer Workshop) → 05 Kickoff → confirmation + missing items |
| `/onboarding/task/[token]` | Delegated task link: shows **only** the one task that was sent (data for everything else is stripped server side) |
| `/ops/login` | Team sign in |
| `/ops/onboarding` | Dashboard: progress, Business / Meta / Google / Website / WhatsApp / Assets / Offer / Kickoff, last activity, owner, risk flags, "Configuration Required" panel |
| `/ops/onboarding/new` | Create onboarding (company, contact, engagement services, e-commerce / local flags, team), copy or email the link |
| `/ops/onboarding/[id]` | Client detail: missing access/assets, risk flags, client questions, access verification, secure credentials (reveal is audited), business answers, workspace files, offer summary (fact vs idea), internal notes, team, kickoff, delegated tasks, automation events, audit log, PDF, new link / revoke |
| `/ops/settings` | Settings → Company → Integrations (Meta Partner Business ID, Google Ads manager ID, access emails, booking calendar URL, support contacts, defaults) |
| `/ops/guides` | Admin-editable step guides: title, instruction, screenshot upload, external help URL, last reviewed date |
| `/ops/template` | Template editor: add / hide / reorder questions, required or optional, helper text, conditional logic, section titles |
| `POST /api/onboarding/portal/[action]` | Client + delegate API (`state`, `answers`, `access`, `social`, `assets`, `asset-update`, `asset-delete`, `upload-token`, `offer`, `kickoff`, `secret`, `delegate`, `delegate-complete`, `delegate-revoke`, `start`). Token in `x-onboarding-token` / `x-delegate-token` header, never in the API URL |
| `GET /api/onboarding/files/[id]` | Private files: short-lived signed URL, owning client/delegate header, or team session |
| `GET /api/onboarding/guide-image/[id]` | Admin-uploaded guide screenshots |
| `POST /api/onboarding/webhooks/booking` | Kickoff booked (GoHighLevel workflow webhook, `x-webhook-secret`) |
| `GET /api/onboarding/cron/reminders` | Daily reminders + `MISSING_ACCESS` (Vercel Cron, `Authorization: Bearer CRON_SECRET`) |
| `POST /api/ops/[action]`, `GET /api/ops/pdf/[id]` | Operations API and `Madvert-Onboarding-{ClientName}.pdf` |

### Code map

```
src/onboarding/
  types.ts                 every model (Client, Engagement, Onboarding, OnboardingSection, OnboardingAnswer, AccessConnection,
                           ClientAsset, CloudFolder, SocialProfile, OfferWorkshop, OfferBonus, OfferGuarantee, Competitor, ProofAsset,
                           OnboardingTask, DelegatedTask, KickoffBooking, InternalNote, OnboardingGuide (GuideStep), OnboardingEvent,
                           AuditLog, SecretRecord, CompanySettings, TemplateOverride, CustomQuestion)
  template/                config, not hardcoded UI: services.ts, questions.ts (business + offer), access.ts (platforms + service rules),
                           assets.ts (sections, categories, workspace folders), resolve.ts (engagement + admin overrides → template)
  progress.ts              phase progress, statuses, missing items (shared by server and browser)
  guides/defaults.ts       default step guides per platform
  server/                  db (Postgres | dev JSON), crypto, auth, repo, views (client / delegate redaction), storage, drive,
                           events, emails, reminders, insights (risk flags, offer summary), pdf, ops, settings, guides, schema.sql
  ui/                      portal (PortalApp, steps, Uploader, Guides, store with autosave) and ops/
```

### Service-based onboarding

The engagement's services decide what is requested (`template/access.ts`, `template/assets.ts`): a **Meta Ads** client gets Meta, website/landing page, CRM, tracking (GA4/GTM) and creative assets but no Search Console; an **SEO** client gets Search Console, GA4, website/CMS and Business Profile when local, no Meta ad account; a **Development** client gets domain, hosting/repository, website, technical docs and brand assets, no ad accounts; **Full stack** gets everything relevant. E-commerce adds Merchant Center, catalogs and commerce; local adds Google Business Profile.

### Data, storage and security model

* **Database**: Postgres via `DATABASE_URL` (one table per model, created on first use; reference DDL in `src/onboarding/server/schema.sql`). Local development without it uses `.data/onboarding-db.json`. On Vercel the portal refuses to run without Postgres and shows "Configuration Required".
* **Links**: 256-bit random tokens. Only a SHA-256 hash is used for lookup; an AES-GCM encrypted copy (key derived from `ONBOARDING_SECRET`) lets the team copy/resend it and reminders include it. Links expire (default 60 days), can be regenerated (old link stops working) and revoked (also revokes delegated links). Delegated links expire after 14 days and are scoped server side to one task.
* **Authorization**: every API call resolves the token on the server; delegates are limited by `assertScope` and receive a redacted state. Operations uses an HMAC-signed, httpOnly, SameSite=strict 12-hour session, a `proxy.ts` gate, per-page checks and login rate limiting.
* **Files**: private Vercel Blob (`access: "private"`, direct browser uploads, no function size limit) or local disk in development. Keys are prefixed `onboarding/{onboardingId}/{folder}/`; downloads go through `/api/onboarding/files/:id` with a 10 minute to 6 hour HMAC-signed URL or an auth header. SVG/HTML are forced to download; responses carry `nosniff` and a sandbox CSP.
* **Credentials**: only if platform access is impossible, through the "Secure Credential" vault (AES-256-GCM with `ONBOARDING_ENCRYPTION_KEY`). Never returned to the client, never in events, emails, analytics or the PDF; reveal is team-only, time-limited in the UI and written to the audit log.
* **Audit log**: link created/opened/regenerated/revoked, access status changes, credentials stored/revealed, files viewed/deleted, delegated tasks, settings and template changes, PDF generation, team sign-ins (including failures).
* Validation: unknown answer keys are dropped, sizes capped, allowed file types and 500 MB limit, same-origin checks, rate limits.

### Automation events

`ONBOARDING_STARTED`, `BUSINESS_INFO_COMPLETED`, `ACCESS_STARTED`, `META_CONNECTED`, `GOOGLE_CONNECTED`, `WEBSITE_CONNECTED` (when the team verifies), `ASSETS_UPLOADED`, `OFFER_COMPLETED`, `OFFER_SKIPPED`, `KICKOFF_BOOKED`, `ONBOARDING_COMPLETE`, `MISSING_ACCESS`, plus `DELEGATED_TASK_SENT`, `DELEGATED_TASK_COMPLETED`, `REMINDER_SENT`. Each is stored (visible in Operations) and POSTed as `onboarding.<NAME>` with ids, company, contact email and status fields to `ONBOARDING_WEBHOOK_URL` and the existing `GOHIGHLEVEL_WEBHOOK_URL` / `ZAPIER_WEBHOOK_URL` / `MAKE_WEBHOOK_URL` / `N8N_WEBHOOK_URL` / `GENERIC_WEBHOOK_URL`.

### Reminders

Daily cron (`vercel.json`): reminders 24 hours, 3 days and 5 days after onboarding started (at most three, never a backlog), skipped if the client was active in the last 12 hours, and stopped once only optional items or items awaiting Madvert remain.

### Guides and screenshots

Default guides cover Meta partner access and portfolio creation, Google Ads, GA4, Tag Manager, Search Console, Business Profile, YouTube, Merchant Center, WordPress, Shopify, Webflow, Wix, Squarespace, custom/Next.js, Cloudflare, GoDaddy, Namecheap, Google Domains (Squarespace), Hostinger, GoHighLevel, HubSpot, other CRMs and WhatsApp Business. Steps follow the official help pages linked on each step; pages that were checked carry a "last reviewed" date, the rest show "Review needed" in `/ops/guides`. The built-in visuals are original simplified diagrams with the relevant control highlighted, not copies of platform screenshots. To use current official screenshots, upload them per step in `/ops/guides` (stored privately, never hotlinked).

### Configuration still required (external credentials)

| Feature | What to set |
| --- | --- |
| Production database | `DATABASE_URL` (Postgres) |
| Signing / link encryption | `ONBOARDING_SECRET` (32+ chars) |
| Credential vault | `ONBOARDING_ENCRYPTION_KEY` (`openssl rand -hex 32`) |
| Team sign in | `OPS_ADMIN_PASSWORD`, optional `OPS_ADMIN_EMAILS` |
| File uploads in production | Vercel Blob store → `BLOB_READ_WRITE_TOKEN` |
| Emails (link, delegated tasks, reminders) | `RESEND_API_KEY`, `EMAIL_FROM` (verified domain) |
| Google Drive client folders | Service account (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`), parent folder in a Shared Drive shared with it as Content manager (`GOOGLE_DRIVE_PARENT_FOLDER_ID`), Drive API enabled |
| Exact kickoff times | GoHighLevel workflow "Appointment booked" → Webhook to `/api/onboarding/webhooks/booking` with header `x-webhook-secret: ONBOARDING_BOOKING_WEBHOOK_SECRET` (otherwise the widget's booking message or the client's own confirmation is used) |
| Reminders | `CRON_SECRET` (Vercel adds it to cron requests) |
| Company values | Meta Partner Business ID, Google Ads manager ID and access emails in `/ops/settings` |

Not built as live API integrations (by design, no credentials available): Meta, Google, GoHighLevel and e-sign APIs. Access is granted by the client inside each platform and verified by the team in Operations; nothing pretends to be connected automatically.

### Run locally

```bash
cp .env.example .env.local
# minimum: OPS_ADMIN_PASSWORD=<10+ chars>; optional DATABASE_URL, ONBOARDING_ENCRYPTION_KEY
npm run dev
# open http://localhost:3000/ops/login → New onboarding → open the generated link
```

## Deploying to Vercel

1. vercel.com → **Add New → Project** → import `agencyescom/madvert-labs` (give the Vercel GitHub app access to the repo if asked).
2. Framework preset **Next.js** is detected automatically. Leave the build command, output directory and root directory on their defaults.
3. **Environment Variables**: add `NEXT_PUBLIC_SITE_URL` (your live URL, e.g. `https://madvertlabs.com`) plus any values from `.env.example` you use. `NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.
4. **Deploy.** Every push to `main` redeploys; every other branch gets a preview URL.
5. **Domains**: Project → Settings → Domains → add your domain and follow the DNS instructions. Use the same URL for `NEXT_PUBLIC_SITE_URL`.

Notes:

* Next.js is pinned to 16.3.8 (tested). Upgrade deliberately and run `npm run build` before pushing.
* Images use Vercel's image optimization (AVIF/WebP, responsive sizes), including Sanity images.
* `after()` runs lead webhooks, CRM and conversion calls after the response, so visitors never wait on third parties.
* Rate limiting uses Upstash Redis when configured; otherwise it is per serverless instance.

## QA snapshot

Checked in this build: production build of all routes, ESLint and TypeScript clean, no console errors or horizontal overflow on any page at 1440px and 390px in both themes, end to end runs of the growth brief, booking (unconfigured state), challenge and resource gate, theme persistence, menus and reduced motion, and unit checks of slot generation across time zones and daylight saving. Lighthouse (mobile, simulated throttling, local server): inner pages about 95 performance; home about 90 including the first visit intro; accessibility 96 to 100; best practices and SEO 100.

## Not included yet

* Three.js / React Three Fiber scenes. The dimensional look uses CSS and SVG to keep the site fast; a WebGL moment can be added to a single section later.
* Smooth scrolling (Lenis) was left out to keep native scrolling and accessibility.
* A cookie consent banner. Add one before enabling analytics where consent is required.
* Insight/blog pages: the schema exists, the routes do not.
