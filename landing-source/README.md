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

In the static export, both booking forms post to the main site's `POST /api/apply`
(`src/app/api/apply/route.ts` at the repo root, GoHighLevel client in `src/integrations/ghl.ts`).
It upserts the GHL contact, saves the mapped custom fields, adds the `patches-partnership-application`
tag, creates (or reuses) the open opportunity in New Application and saves every answer as a contact
note. The page shows the calendar only after that succeeds. Vercel variables used (server-side only):
`GHL_ACCESS_TOKEN`, `GHL_LOCATION_ID`, `GHL_PIPELINE_ID`, `GHL_STAGE_NEW_APPLICATION_ID`.
Everything after booking is handled by the GHL workflow "Patches Partnership Call Workflow".

Custom fields ("Patches Partnership Application" folder). The route reads each field's type and options
from GHL and sends values in that shape (multi-select → list of exact option labels, dropdown/radio →
one exact option, text → plain text). Then it reads the contact back and logs any field left blank.

| Question | GHL custom field |
| --- | --- |
| Which markets do you serve? | Markets Served (`esMyG8WQK1zXHBebaABo`) |
| How many RFQs do you want per month? | Desired RFQ Volume (`RkC8qWzlkZNsFfmMTM5i`) |
| Current monthly revenue | first field in the folder whose name contains "revenue" |
| How are customers currently coming to you? | first field in the folder whose name contains "channel", "lead source" or "acquisition" |
| Manufacture in-house or outsource? | first field in the folder whose name contains "manufactur", "in-house" or "outsourc" |

Search the Vercel logs for `[apply] custom field` to see, per submission, which field each answer
went to and anything GHL could not store (for example a dropdown whose options don't include the answer).

## Optional build-time settings

| Variable | Default |
| --- | --- |
| `NEXT_PUBLIC_GHL_CALENDAR_URL` | `https://api.madvertlabs.com/widget/booking/m2v95rY845IT0tQwdbEL` |
| `NEXT_PUBLIC_GHL_EMBED_SCRIPT` | `https://api.madvertlabs.com/js/form_embed.js` |
| `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GTM_ID` | none: tags load only when set |

No testimonials, results, guarantees or certifications are shown. Sample figures on the page are labelled as demo or illustrative.
