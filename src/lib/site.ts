import type { IconName } from "@/components/ui/Icon3D";

export const site = {
  name: "Madvert Labs",
  legalName: "Madvert Labs",
  descriptor: "Digital Marketing and Growth Systems",
  tagline: "Beyond Advertising. We Build Growth Systems.",
  belief: "Growth Is a System. Not a Campaign.",
  promise: "One Growth Partner for Everything Between Attention and Revenue.",
  footerLine: "Bismillah. Build with purpose. Grow with clarity.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://madvertlabs.com").replace(/\/$/, ""),
  founder: {
    name: "Usama Abbas Dahri",
    shortName: "Usama",
    role: "Founder, Madvert Labs",
  },
  primaryCta: { label: "Book a Business Strategy Call", href: "/contact#book" },
  founderCta: { label: "Book a Business Strategy Call with Usama", href: "/contact#book" },
  shortCta: { label: "Book a Strategy Call", href: "/contact#book" },
  auditCta: { label: "Start With a Free Growth Systems Audit", href: "/contact?intent=growth-systems-audit" },
} as const;

export type ServiceSlug =
  | "branding-marketing"
  | "client-acquisition"
  | "conversion"
  | "automation-revenue-systems"
  | "tech-product-development";

export type Pillar = {
  key: string;
  title: string;
  href: string;
  icon: IconName;
  summary: string;
  headline: string;
  cta: string;
  freeValue: { label: string; href: string };
  inMegaMenu: boolean;
};

/** The six pillars. Five are services, Studios has its own route. */
export const pillars: Pillar[] = [
  {
    key: "branding-marketing",
    title: "Branding and Marketing",
    href: "/services/branding-marketing",
    icon: "branding",
    summary: "Shape how the business looks, sounds and shows up everywhere.",
    headline: "Being Good Is Not Enough If You Look Forgettable.",
    cta: "Build a Stronger Brand",
    freeValue: { label: "Get the Brand Perception Checklist", href: "/resources/brand-perception-checklist" },
    inMegaMenu: true,
  },
  {
    key: "client-acquisition",
    title: "Client Acquisition",
    href: "/services/client-acquisition",
    icon: "acquisition",
    summary: "Qualified demand across paid, organic and AI search.",
    headline: "Your Sales Team Does Not Need More Phone Numbers. It Needs More People Worth Calling.",
    cta: "Build Qualified Demand",
    freeValue: { label: "Get the Qualified Lead Generation Playbook", href: "/resources/qualified-lead-generation-playbook" },
    inMegaMenu: true,
  },
  {
    key: "conversion",
    title: "Conversion",
    href: "/services/conversion",
    icon: "conversion",
    summary: "Websites and journeys that turn attention into action.",
    headline: "Traffic Is Expensive. Wasting It Is Optional.",
    cta: "Fix Your Conversion Journey",
    freeValue: { label: "Get the Conversion Leak Checklist", href: "/resources/conversion-leak-checklist" },
    inMegaMenu: true,
  },
  {
    key: "studios",
    title: "Madvert Studios",
    href: "/studios",
    icon: "studios",
    summary: "Creative production that earns the next three seconds.",
    headline: "People Do Not Skip Ads. They Skip Boring Ads.",
    cta: "Enter Madvert Studios",
    freeValue: { label: "Watch the Showreel", href: "/studios#showreel" },
    inMegaMenu: false,
  },
  {
    key: "automation-revenue-systems",
    title: "Automation and Revenue Systems",
    href: "/services/automation-revenue-systems",
    icon: "automation",
    summary: "CRM, AI and follow up that keep every opportunity moving.",
    headline: "Your CRM Should Not Be Your Sales Manager's Memory.",
    cta: "Automate the Revenue Journey",
    freeValue: { label: "Run the Revenue Leakage Audit", href: "/resources/revenue-leakage-audit" },
    inMegaMenu: true,
  },
  {
    key: "tech-product-development",
    title: "Tech and Product Development",
    href: "/services/tech-product-development",
    icon: "development",
    summary: "When growth needs a tool, we design and build the tool.",
    headline: "If Growth Needs a Tool, We Build the Tool.",
    cta: "Build What Growth Needs",
    freeValue: { label: "Request a Tech Opportunity Audit", href: "/contact?intent=tech-opportunity-audit" },
    inMegaMenu: true,
  },
];

export const services = pillars.filter((p) => p.inMegaMenu);

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "What We Do", href: "/services", mega: true },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Madvert Studios", href: "/studios" },
  { label: "Resources", href: "/resources" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const footerNav = [
  { label: "Home", href: "/" },
  { label: "What We Do", href: "/services" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Madvert Studios", href: "/studios" },
  { label: "Madvert Vault", href: "/resources" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Challenge Madvert", href: "/challenge" },
];

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
