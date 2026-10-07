# Madvert Labs website

**Beyond Advertising. We Build Growth Systems.**

Production website for Madvert Labs (Digital Marketing and Growth Systems), built with Next.js 16.3 (App Router, Cache Components), TypeScript strict, Tailwind CSS 4, GSAP ScrollTrigger and Framer Motion, with Sanity as the CMS.

**Hosting: Cloudflare Workers** through the official OpenNext adapter (`@opennextjs/cloudflare`). No Vercel APIs or services are used.

## Quick start

Requires Node 20.9+.

```bash
npm install
cp .env.example .env.local   # every variable is optional for local development
npm run dev                  # http://localhost:3000 (Next.js dev server)
npm run preview              # build for Cloudflare and run it in the real Workers runtime (http://localhost:8787)
npm run deploy               # build and deploy to Cloudflare from your machine (needs `npx wrangler login`)
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
| `/resources`, `/resources/[slug]` | Madvert Vault with per resource gating |
| `/about`, `/contact` (`#book`), `/challenge`, `/privacy` | |
| `/api/leads` | Growth brief, challenge (with optional upload) and resource requests |
| `/api/calendar/availability`, `/api/calendar/book` | Strategy call booking |
| `/api/calendar/oauth/start`, `/api/calendar/oauth/callback` | One time calendar authorisation |
| `/api/revalidate` | Sanity publish webhook |

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
  integrations/   Google Calendar, CRM webhooks, Meta CAPI, GA4 MP, email, rate limit, spam
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

## Google Calendar booking

The initial calendar owner is Usama Abbas Dahri (`GOOGLE_CALENDAR_ID=usamaabbasdahri@gmail.com`). Everything is environment driven, so a dedicated Madvert calendar can replace it later.

1. Google Cloud console: enable the Google Calendar API, create an OAuth client of type "Web application" and add the redirect URI `https://<your-domain>/api/calendar/oauth/callback`.
2. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CALENDAR_SETUP_SECRET`, `GOOGLE_CALENDAR_ID`, `CALENDAR_TIMEZONE` and `CALENDAR_BUSINESS_HOURS` and deploy.
3. Signed in as the calendar owner, visit `/api/calendar/oauth/start?secret=<CALENDAR_SETUP_SECRET>`, approve, and copy the refresh token shown once into `GOOGLE_REFRESH_TOKEN`. Redeploy.

Business hours are never assumed. Example (Monday to Friday, 10:00 to 13:00 and 15:00 to 18:00 in `CALENDAR_TIMEZONE`):

```
CALENDAR_BUSINESS_HOURS={"1":[["10:00","13:00"],["15:00","18:00"]],"2":[["10:00","13:00"],["15:00","18:00"]],"3":[["10:00","13:00"],["15:00","18:00"]],"4":[["10:00","13:00"],["15:00","18:00"]],"5":[["10:00","13:00"],["15:00","18:00"]]}
```

Meeting length (default 30), buffers (default 15 before and 15 after), minimum notice and booking window are configurable. Only free/busy is read; visitors only ever receive computed free slots. Bookings re-check the slot, create "Madvert Labs Business Strategy Call" with the visitor as attendee, the form answers in the description and a Google Meet link, and Google sends the invitation. With `RESEND_API_KEY` set, a confirmation email is sent too. The visitor's time zone is detected and can be changed.

## Leads, CRM and conversions

Every form is validated with Zod on the client and again on the server, protected by a honeypot, a minimum completion time, rate limiting (Upstash Redis when configured, in memory otherwise) and optional Cloudflare Turnstile.

Each lead carries attribution: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`, landing page, first page, referrer, first seen, timestamp and the last CTA clicked, plus the selected service, intent and resource.

After the response is sent, leads fan out to whichever destinations are configured: GoHighLevel, Zapier, Make, n8n or any generic webhook (flat JSON payload, see `integrations/webhooks.ts`), HubSpot Forms API, Slack, an internal notification email, Meta Conversions API (deduplicated with the Pixel through a shared event id) and GA4 Measurement Protocol. Google Ads enhanced conversions are set client side before the conversion fires.

## Analytics

GTM, GA4, Google Ads, Meta Pixel and Microsoft Clarity each load only when their ID is set. Events: `hero_strategy_call_click`, `service_cta_click`, `free_value_click`, `case_study_open`, `resource_download`, `contact_form_start`, `contact_form_complete`, `calendar_open`, `calendar_booking_complete`, `showreel_play`, `portfolio_open`, `theme_switch`, `challenge_madvert_click`, plus `scroll_depth` at 25, 50, 75 and 90 percent and SPA page views. Add `data-track="<event>"` to any link to track it.

## SEO and AI search

Unique titles, descriptions, canonicals, Open Graph and Twitter cards on every page; a generated OG image; sitemap and robots; JSON-LD for Organization and ProfessionalService, WebSite, WebPage, Person, BreadcrumbList, Service, FAQPage, Article and CreativeWork. Each service page ends with a direct answer block (who it is for, problem solved, process, measures) and real FAQs.

## Deploying to Cloudflare (GitHub → Cloudflare Workers)

The site runs on **Cloudflare Workers** with static assets, using `@opennextjs/cloudflare`. This is Cloudflare's supported way to host a full Next.js app, including the API routes (forms, booking). Cloudflare Pages alone only hosts static files, so it cannot run the form and booking APIs; Workers Builds gives the same "connect a GitHub repo and it deploys on every push" experience.

### 1. Put the code on GitHub

Create a new repository and upload the **contents of this folder** (so `package.json` is at the repository root). `node_modules`, `.next`, `.open-next` and `.env*` files are already ignored.

```bash
git init && git add . && git commit -m "Madvert Labs website"
git branch -M main
git remote add origin https://github.com/<you>/madvert-labs.git
git push -u origin main
```

### 2. Connect Cloudflare

Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → choose the repo, then:

| Setting | Value |
| --- | --- |
| Project / Worker name | `madvert-labs` (must match `name` in `wrangler.jsonc`) |
| Root directory | `/` (or the folder name if the app is not at the repo root) |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Non-production branch deploy command | `npx opennextjs-cloudflare upload` (preview URLs per branch) |

Under **Build variables** add `NEXT_PUBLIC_SITE_URL` (for example `https://madvertlabs.com`) and any other `NEXT_PUBLIC_*` values you use. These are baked into the build.

### 3. Runtime settings and secrets

Worker → **Settings → Variables and Secrets**. Add the server side values from `.env.example` here as **Secrets** (Google OAuth, Sanity tokens, webhook URLs, Resend, Meta CAPI, GA4 secret, Turnstile secret, Upstash). Non secret calendar defaults are already in `wrangler.jsonc` → `vars`; dashboard values override them. You can also use `npx wrangler secret put NAME`.

### 4. Custom domain

Worker → **Settings → Domains & Routes → Add custom domain** (the domain must be on Cloudflare DNS). Use the same URL as `NEXT_PUBLIC_SITE_URL`, and use it in the Google OAuth redirect URI.

### Cloudflare specific notes

* Next.js is pinned to **16.3.8**, the newest version the OpenNext Cloudflare adapter fully supports. Upgrade Next only after the adapter's supported range includes the new version (`npm view @opennextjs/cloudflare peerDependencies`), then run `npm run preview` before deploying.
* Images: Vercel's image optimizer is not used. `src/lib/image-loader.ts` resizes Sanity images on Sanity's CDN; local images in `public/` are pre-sized WebP.
* Caching: prerendered pages are served from Workers static assets (`open-next.config.ts`). **Enable the R2 cache** when Sanity is connected so publish-time revalidation persists: create an R2 bucket named `madvert-labs-opennext-cache`, uncomment `r2_buckets` in `wrangler.jsonc`, and in `open-next.config.ts` switch to `r2IncrementalCache` from `@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache`.
* Rate limiting uses Upstash Redis when configured; otherwise it is per Worker isolate.
* Server only Node APIs used (`node:crypto`) are covered by the `nodejs_compat` flag. There is no filesystem access at runtime.
* Logs: Worker → **Observability** (enabled in `wrangler.jsonc`).

## QA snapshot

Checked in this build: Cloudflare build (OpenNext) and every page and API exercised in the local Workers runtime (`wrangler dev`), production build of all routes, ESLint and TypeScript clean, no console errors or horizontal overflow on any page at 1440px and 390px in both themes, end to end runs of the growth brief, booking (unconfigured state), challenge and resource gate, theme persistence, menus and reduced motion, and unit checks of slot generation across time zones and daylight saving. Lighthouse (mobile, simulated throttling, local server): inner pages about 95 performance; home about 90 including the first visit intro; accessibility 96 to 100; best practices and SEO 100.

## Not included yet

* Three.js / React Three Fiber scenes. The dimensional look uses CSS and SVG to keep the site fast; a WebGL moment can be added to a single section later.
* Smooth scrolling (Lenis) was left out to keep native scrolling and accessibility.
* A cookie consent banner. Add one before enabling analytics where consent is required.
* Insight/blog pages: the schema exists, the routes do not.
