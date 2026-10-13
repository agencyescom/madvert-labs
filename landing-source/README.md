# /custom-patches landing page (source)

Editable source of www.madvertlabs.com/custom-patches, the Patches Partnership funnel.
Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion.

The page is built as a static export and copied into this repo's `public/custom-patches/`,
which the main site serves (`next.config.ts` rewrites `/custom-patches` to its `index.html`).
The main site's TypeScript and lint config ignore this folder.

## Change and publish the page

```bash
cd landing-source
npm install
npm run dev                                                   # http://localhost:3000
npm run build:custom-patches -- --target ../public/custom-patches
```

Commit both `landing-source/` and `public/custom-patches/`, then merge to `main`. Vercel deploys it.
Never hand-edit files under `public/custom-patches/_next/`: always rebuild.

## Where things live

| Path | What |
| --- | --- |
| `src/components/sections/Hero.tsx` | Announcement-bar offset, headline, VSL, main CTA |
| `src/components/sections/AnnouncementBar.tsx` | Top bar text |
| `src/components/sections/BookingSection.tsx` | "Book Your Discovery Call": short form, then GHL calendar (used twice on the page) |
| `src/components/sections/GhlCalendar.tsx` | GoHighLevel calendar embed |
| `src/components/MobileCTA.tsx` | Floating "Book My Discovery Call" button |
| `src/lib/site.ts` | Calendar URL, GHL embed script, video file and duration |
| `src/lib/application.ts` | Discovery form options and validation |
| `public/vsl.mp4`, `public/vsl-poster.webp` | The VSL and its poster frame |

## Form submissions

In the static export, both booking forms post to the main site's `/api/custom-patches/leads`
(`src/app/api/custom-patches/leads/route.ts` at the repo root). That route reports success only after
a CRM/webhook accepts the lead, so set `GOHIGHLEVEL_WEBHOOK_URL` (or another webhook) in Vercel.

## Optional build-time settings

| Variable | Default |
| --- | --- |
| `NEXT_PUBLIC_GHL_CALENDAR_URL` | `https://api.madvertlabs.com/widget/booking/m2v95rY845IT0tQwdbEL` |
| `NEXT_PUBLIC_GHL_EMBED_SCRIPT` | `https://link.msgsndr.com/js/form_embed.js` |
| `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GTM_ID` | none: tags load only when set |

No testimonials, results, guarantees or certifications are shown. Sample figures on the page are labelled as demo or illustrative.
