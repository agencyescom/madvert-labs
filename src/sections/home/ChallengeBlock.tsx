import { Cta } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { MadvertMark } from "@/components/ui/MadvertMark";

export function ChallengeBlock() {
  return (
    <section className="section-tight" aria-labelledby="challenge-title">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[32px] border border-line bg-[#0a0f1c] px-6 py-16 text-white sm:px-12 md:py-24 lg:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_20%,rgb(0_180_255/0.25),transparent_60%)]" aria-hidden="true" />
          <div
            className="absolute inset-0 opacity-70"
            aria-hidden="true"
            style={{
              backgroundImage: "linear-gradient(rgb(255 255 255 / .035) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / .035) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <MadvertMark className="absolute -right-10 bottom-[-12%] hidden h-[70%] w-auto text-white opacity-[0.045] md:block" />
          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7 [--accent-text:#3fd4ff] [--line:rgb(255_255_255/0.1)]">
              <div data-reveal>
                <Eyebrow>Challenge Madvert</Eyebrow>
              </div>
              <h2 id="challenge-title" data-reveal style={{ ["--reveal-delay" as string]: 80 }} className="t-h1 mt-6">
                Got a Growth Problem Everyone Keeps Avoiding?
              </h2>
              <p data-reveal style={{ ["--reveal-delay" as string]: 140 }} className="t-h3 mt-5 bg-[linear-gradient(92deg,#00b4ff,#00e5ff)] bg-clip-text text-transparent">
                Good. Those Are Usually the Interesting Ones.
              </p>
            </div>
            <div className="lg:col-span-5 lg:pt-14">
              <div data-reveal style={{ ["--reveal-delay" as string]: 200 }} className="space-y-2 text-[16.5px] text-white/75">
                <p>Show us where the business feels stuck.</p>
                <p>Maybe you know the problem.</p>
                <p>Maybe you only feel the symptoms.</p>
                <p className="text-white">We will look at the system and tell you what we think is actually happening.</p>
              </div>
              <div data-reveal style={{ ["--reveal-delay" as string]: 260 }} className="mt-9 [--on-accent:#03101d]">
                <Cta href="/challenge" size="lg" track="challenge_madvert_click">
                  Challenge Madvert
                </Cta>
                <p className="mt-4 text-[13.5px] text-white/55">Show us the bottleneck. We will tell you what we would do about it.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
