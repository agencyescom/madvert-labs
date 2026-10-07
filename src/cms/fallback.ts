/**
 * Local fallback content, used whenever Sanity is not configured or returns nothing.
 *
 * CONTENT PLACEHOLDER RULE: nothing in this file is a real client, testimonial, metric,
 * certification or award. Every proof slot is a clearly bracketed placeholder and every
 * placeholder entry carries `placeholder: true` so it can be styled and noindexed.
 */
import type { CaseStudy, Faq, PortfolioProject, ProofItem, Resource, SiteSettings, TeamMember, Testimonial } from "@/types/content";

/** Real founder photography supplied by the client. */
export const founderPhoto = {
  url: "/images/usama-abbas-dahri-portrait.webp",
  alt: "Usama Abbas Dahri, Founder of Madvert Labs",
  width: 800,
  height: 1000,
};

export const fallbackCaseStudies: CaseStudy[] = [
  {
    slug: "better-leads-not-more-leads",
    title: "They Did Not Need More Leads. They Needed Better Ones.",
    client: "[REAL CLIENT NAME]",
    industry: "[INDUSTRY]",
    market: "[MARKET]",
    categories: ["acquisition", "automation"],
    services: ["Client Acquisition", "Automation and Revenue Systems"],
    summary: "Lead volume looked healthy. The sales team disagreed.",
    problem: "[REAL CASE STUDY: what the client was experiencing and what it was costing them]",
    diagnosis: "[REAL CASE STUDY: what we found beneath the visible symptom]",
    move: "[REAL CASE STUDY: the first strategic decision and why]",
    strategy: "[REAL CASE STUDY: strategy summary]",
    execution: "[REAL CASE STUDY: execution summary]",
    system: "[REAL CASE STUDY: the connected system that was built]",
    result: "[REAL CASE STUDY: outcome in the client's own business terms]",
    learned: "[REAL CASE STUDY: what we learned]",
    metrics: [
      { label: "Qualified lead rate", value: "[REAL CASE STUDY METRIC]" },
      { label: "Cost per qualified lead", value: "[REAL CASE STUDY METRIC]" },
      { label: "Booked calls", value: "[REAL CASE STUDY METRIC]" },
    ],
    placeholder: true,
  },
  {
    slug: "ads-working-follow-up-not",
    title: "The Ads Were Working. The Follow Up Was Not.",
    client: "[REAL CLIENT NAME]",
    industry: "[INDUSTRY]",
    market: "[MARKET]",
    categories: ["automation", "technology"],
    services: ["Automation and Revenue Systems"],
    summary: "Enquiries arrived on time. Replies did not.",
    problem: "[REAL CASE STUDY: what the client was experiencing and what it was costing them]",
    diagnosis: "[REAL CASE STUDY: what we found beneath the visible symptom]",
    move: "[REAL CASE STUDY: the first strategic decision and why]",
    system: "[REAL CASE STUDY: the connected system that was built]",
    result: "[REAL CASE STUDY: outcome in the client's own business terms]",
    metrics: [
      { label: "Median response time", value: "[REAL CASE STUDY METRIC]" },
      { label: "Lead to booking rate", value: "[REAL CASE STUDY METRIC]" },
      { label: "Pipeline visibility", value: "[REAL CASE STUDY METRIC]" },
    ],
    placeholder: true,
  },
  {
    slug: "strong-business-weak-presence",
    title: "The Business Was Strong. The Digital Presence Was Not.",
    client: "[REAL CLIENT NAME]",
    industry: "[INDUSTRY]",
    market: "[MARKET]",
    categories: ["branding", "studios", "seo"],
    services: ["Branding and Marketing", "Madvert Studios", "Client Acquisition"],
    summary: "Excellent in person. Forgettable online.",
    problem: "[REAL CASE STUDY: what the client was experiencing and what it was costing them]",
    diagnosis: "[REAL CASE STUDY: what we found beneath the visible symptom]",
    move: "[REAL CASE STUDY: the first strategic decision and why]",
    creative: "[REAL CASE STUDY: creative direction and production]",
    system: "[REAL CASE STUDY: the connected system that was built]",
    result: "[REAL CASE STUDY: outcome in the client's own business terms]",
    metrics: [
      { label: "Brand search demand", value: "[REAL CASE STUDY METRIC]" },
      { label: "Enquiry quality", value: "[REAL CASE STUDY METRIC]" },
      { label: "Content output", value: "[REAL CASE STUDY METRIC]" },
    ],
    placeholder: true,
  },
];

export const fallbackResources: Resource[] = [
  {
    slug: "qualified-lead-generation-playbook",
    title: "Qualified Lead Generation Playbook",
    kind: "Playbook",
    category: "acquire",
    description: "How to attract fewer time wasters and more people your sales team actually wants to call.",
    outline: [
      "Why cheap leads get expensive",
      "Qualification that starts before the form",
      "Offer, creative and audience alignment",
      "Form design that filters without killing volume",
      "What should happen in the first hour after an enquiry",
    ],
    gating: "email",
    relatedService: "/services/client-acquisition",
    featured: true,
    placeholder: true,
  },
  {
    slug: "seo-and-ai-search-guide",
    title: "SEO and AI Search Guide",
    kind: "Guide",
    category: "search",
    description: "Visibility for how people discover businesses now: Google, Maps, publications and AI answers.",
    outline: [
      "How discovery has changed",
      "Search, Maps and AI answers: what each one reads",
      "Entity consistency and why it matters",
      "Content that answers real questions",
      "Measuring visibility beyond rankings",
    ],
    gating: "email",
    relatedService: "/services/client-acquisition",
    featured: true,
    placeholder: true,
  },
  {
    slug: "brand-perception-checklist",
    title: "Brand Perception Checklist",
    kind: "Checklist",
    category: "brand",
    description: "See your business the way a new customer does in the first ten seconds.",
    outline: [
      "Identity consistency across touchpoints",
      "Website first impression",
      "Social presence and tone",
      "Photography and creative quality",
      "Reviews, PR and third party proof",
    ],
    gating: "open",
    relatedService: "/services/branding-marketing",
    featured: true,
    placeholder: true,
  },
  {
    slug: "conversion-leak-checklist",
    title: "Conversion Leak Checklist",
    kind: "Checklist",
    category: "convert",
    description: "Where your website is quietly losing people, and what to fix first.",
    outline: ["Speed and mobile experience", "Headline clarity", "Proof placement", "Calls to action", "Form friction"],
    gating: "open",
    relatedService: "/services/conversion",
    featured: false,
    placeholder: true,
  },
  {
    slug: "revenue-leakage-audit",
    title: "Revenue Leakage Audit",
    kind: "Audit",
    category: "automate",
    description: "How much revenue is quietly leaking after the lead arrives?",
    outline: [
      "Response speed by channel",
      "Lead routing and ownership",
      "Follow up consistency",
      "Pipeline stage hygiene",
      "Attribution from lead to revenue",
    ],
    gating: "form",
    relatedService: "/services/automation-revenue-systems",
    featured: true,
    placeholder: true,
  },
  {
    slug: "madvert-studios-portfolio",
    title: "Madvert Studios Portfolio",
    kind: "Portfolio",
    category: "brand",
    description: "See the work before you hear the pitch.",
    outline: ["Static and motion ads", "Explainers", "Cinematic production", "Talking head content", "AI commercials"],
    gating: "open",
    externalUrl: "/studios#showreel",
    relatedService: "/studios",
    featured: true,
    placeholder: true,
  },
  {
    slug: "tech-opportunity-audit",
    title: "Tech Opportunity Audit",
    kind: "Audit",
    category: "build",
    description: "What could technology remove from your business this month?",
    outline: ["Manual work inventory", "Tool and data map", "Integration gaps", "Build versus buy", "Where AI genuinely helps"],
    gating: "qualified",
    relatedService: "/services/tech-product-development",
    featured: false,
    placeholder: true,
  },
];

export const fallbackTestimonials: Testimonial[] = [
  { id: "t1", quote: "[REAL CLIENT TESTIMONIAL]", name: "[CLIENT NAME]", role: "[ROLE]", company: "[COMPANY]", placeholder: true },
  { id: "t2", quote: "[REAL CLIENT TESTIMONIAL]", name: "[CLIENT NAME]", role: "[ROLE]", company: "[COMPANY]", placeholder: true },
];

export const fallbackProof: ProofItem[] = [
  { kind: "campaign", label: "[REAL CAMPAIGN SCREENSHOT]", placeholder: true },
  { kind: "crm", label: "[REAL CRM SCREENSHOT]", placeholder: true },
  { kind: "creative", label: "[REAL CREATIVE WORK]", placeholder: true },
  { kind: "certification", label: "[REAL META CERTIFICATION]", placeholder: true },
  { kind: "certification", label: "[REAL GOOGLE CERTIFICATION]", placeholder: true },
  { kind: "video", label: "[REAL CLIENT VIDEO]", placeholder: true },
];

export const fallbackTeam: TeamMember[] = [
  { name: "Usama Abbas Dahri", role: "Founder", photo: founderPhoto },
  { name: "[TEAM MEMBER]", role: "[ROLE]", placeholder: true },
  { name: "[TEAM MEMBER]", role: "[ROLE]", placeholder: true },
  { name: "[TEAM MEMBER]", role: "[ROLE]", placeholder: true },
];

export const fallbackPortfolio: PortfolioProject[] = [
  { slug: "static-1", title: "[REAL STATIC AD]", format: "Static", placeholder: true },
  { slug: "motion-1", title: "[REAL MOTION AD]", format: "Motion", placeholder: true },
  { slug: "explainer-1", title: "[REAL EXPLAINER]", format: "Explainer", placeholder: true },
  { slug: "cinematic-1", title: "[REAL CINEMATIC FILM]", format: "Cinematic", placeholder: true },
  { slug: "talking-1", title: "[REAL TALKING HEAD]", format: "Talking Head", placeholder: true },
  { slug: "ai-1", title: "[REAL AI COMMERCIAL]", format: "AI Commercial", placeholder: true },
];

export const fallbackSettings: SiteSettings = {
  founderPhoto,
  heroImage: founderPhoto,
  clientLogos: [],
  certifications: [],
};

export const fallbackFaqs: Record<string, Faq[]> = {
  home: [
    {
      q: "What does Madvert Labs do?",
      a: "Madvert Labs is a digital marketing and growth systems company. We connect branding, customer acquisition, conversion, creative production, automation and technology into one growth system for established businesses.",
    },
    {
      q: "Who is Madvert Labs for?",
      a: "Businesses that are already moving and want one growth partner instead of several disconnected vendors. We are a good fit when the problem crosses marketing, sales follow up, data and technology.",
    },
    {
      q: "Do you sell fixed packages?",
      a: "No. We diagnose the business problem first, then build what growth actually requires. Some clients need acquisition, some need conversion or automation, many need several connected pieces.",
    },
    {
      q: "How do we start?",
      a: "Book a business strategy call with Usama or send a growth brief. We review the business before the conversation and talk about the problem, not a generic package.",
    },
  ],
  "branding-marketing": [
    {
      q: "What is included in branding and marketing at Madvert?",
      a: "Brand strategy, visual identity, logo systems, brand guidelines, creative direction, social media management, digital PR, influencer marketing and 360 degree campaign execution.",
    },
    {
      q: "Do you only design logos?",
      a: "No. A logo is one piece of the evidence. We build the identity system and then execute it across social, website, photography, publications and campaigns so every touchpoint feels like one company.",
    },
    {
      q: "How do you measure brand work?",
      a: "Through consistency across touchpoints, brand search demand, enquiry quality, content performance and how easily sales conversations move. We agree the measures before work starts.",
    },
  ],
  "client-acquisition": [
    {
      q: "What does client acquisition include?",
      a: "Paid acquisition across Meta and Google, retargeting, SEO, local SEO, content SEO, AEO and AI search visibility, digital PR, and lead qualification built into forms and follow up.",
    },
    {
      q: "Do you optimise for cost per lead?",
      a: "We optimise for qualified opportunities. A lower cost per lead means very little if the sales team cannot use the leads, so we track quality signals through to booked calls and revenue where possible.",
    },
    {
      q: "What is AI search visibility?",
      a: "Making sure your business is understood and cited when people ask tools like ChatGPT, Gemini or Google AI answers for recommendations. It relies on clear entities, consistent information, useful content and third party mentions.",
    },
    {
      q: "Paid or organic: which should we start with?",
      a: "Paid gives you speed. Organic builds an asset you own. Most businesses need both, weighted by how urgently they need demand and how long they can invest.",
    },
  ],
  conversion: [
    {
      q: "What does conversion work include?",
      a: "Website design and development, UI and UX, landing pages, conversion copy, offer development and ongoing conversion rate optimisation.",
    },
    {
      q: "Should we fix conversion before buying more traffic?",
      a: "Usually yes. Improving the journey for traffic you already pay for changes the economics of every future campaign.",
    },
    {
      q: "Do you guarantee conversion rates?",
      a: "No. We identify friction, test improvements and report what changed. Honest measurement is more useful than a promised number.",
    },
  ],
  studios: [
    {
      q: "What does Madvert Studios produce?",
      a: "Static ads, motion ads, explainers, cinematic brand films, talking head content, AI commercials, AI influencer content and real world production with people.",
    },
    {
      q: "Is the creative made for performance?",
      a: "Yes. Every piece is built to stop the scroll, explain the value and earn attention within the first seconds, then tested in market.",
    },
  ],
  "automation-revenue-systems": [
    {
      q: "What is a revenue system?",
      a: "The connected set of CRM, response, qualification, follow up, booking and tracking that moves every enquiry towards a decision and tells you why it stopped if it does.",
    },
    {
      q: "Which tools do you work with?",
      a: "We work with platforms such as GoHighLevel and HubSpot, WhatsApp, calendar and booking tools, and custom integrations through webhooks, Zapier, Make or n8n. The tool follows the process, not the other way round.",
    },
    {
      q: "Will AI agents replace our sales team?",
      a: "No. AI agents respond instantly, qualify consistently and keep follow up moving so your team spends time on the conversations that matter.",
    },
  ],
  "tech-product-development": [
    {
      q: "What can Madvert build?",
      a: "Web apps, mobile apps, dashboards, calculators, client portals, internal tools, integrations and AI tools that remove repetitive work.",
    },
    {
      q: "Why would a marketing company build software?",
      a: "Because some growth problems are not marketing problems. When a tool is the answer, we design and build the tool instead of selling another campaign.",
    },
    {
      q: "How do tech projects start?",
      a: "With a tech opportunity audit: we map the bottleneck, the data and the existing tools, then recommend whether it needs marketing, automation or code.",
    },
  ],
};
