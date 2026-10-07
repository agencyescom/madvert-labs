import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Section";
import { MadvertMark } from "@/components/ui/MadvertMark";
import { cmsEnabled } from "@/cms/client";
import { ChallengeForm } from "@/forms/ChallengeForm";
import { pageMetadata } from "@/lib/seo";

const description = "Got a growth problem everyone keeps avoiding? Show Madvert Labs the bottleneck and we will tell you what we would do about it.";

export const metadata: Metadata = pageMetadata({ title: "Challenge Madvert", description, path: "/challenge" });

export default function ChallengePage() {
  const uploadsEnabled = cmsEnabled && Boolean(process.env.SANITY_API_WRITE_TOKEN);
  return (
    <>
      <section className="relative overflow-hidden pb-14 pt-[calc(var(--header-h)+40px)]" aria-labelledby="page-title">
        <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <MadvertMark className="pointer-events-none absolute -right-20 top-24 hidden h-[420px] w-auto text-ink opacity-[0.04] lg:block" />
        <div className="container-x relative">
          <Breadcrumbs items={[{ name: "Challenge Madvert", path: "/challenge" }]} />
          <div className="mt-14 max-w-[900px]">
            <div data-reveal>
              <Eyebrow>Challenge Madvert</Eyebrow>
            </div>
            <h1 id="page-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-display mt-7">
              Got a Growth Problem <span className="t-grad">Everyone Keeps Avoiding?</span>
            </h1>
            <p data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="t-h3 mt-6 text-ink-2">
              Good. Those Are Usually the Interesting Ones.
            </p>
            <div data-reveal style={{ ["--reveal-delay" as string]: 180 }} className="mt-8 space-y-1.5 text-[17px] text-ink-2">
              <p>Show us where the business feels stuck.</p>
              <p>Maybe you know the problem. Maybe you only feel the symptoms.</p>
              <p className="text-ink">We will look at the system and tell you what we think is actually happening.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="pb-28">
        <div className="container-x max-w-[980px]">
          <ChallengeForm uploadsEnabled={uploadsEnabled} />
        </div>
      </section>
    </>
  );
}
