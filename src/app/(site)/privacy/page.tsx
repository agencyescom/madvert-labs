import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "How Madvert Labs collects and uses information submitted through this website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="pb-28 pt-[calc(var(--header-h)+40px)]">
      <div className="container-x max-w-[760px]">
        <Breadcrumbs items={[{ name: "Privacy", path: "/privacy" }]} />
        <h1 className="t-h1 mt-12">Privacy</h1>
        <p className="mt-6 rounded-2xl border border-dashed border-line-strong p-5 text-[14.5px] text-ink-3">
          [LEGAL REVIEW REQUIRED] This page is a plain language summary of what the site does. Replace it with a reviewed privacy policy before launch.
        </p>
        <div className="mt-10 space-y-6 text-[16.5px] leading-relaxed text-ink-2">
          <p>When you send a growth brief, a challenge, a resource request or book a call, we receive the details you enter so we can reply and prepare for the conversation.</p>
          <p>
            We record how you found the site (for example campaign parameters and the page you landed on) so we understand which marketing works. If analytics tools are enabled, they may set
            cookies to measure visits and conversions.
          </p>
          <p>Booking a call creates a calendar event that includes the answers you provide. We only read calendar availability to show open times; no calendar details are shared with visitors.</p>
          <p>To ask what we hold about you or to have it deleted, contact us through the contact page.</p>
        </div>
      </div>
    </section>
  );
}
