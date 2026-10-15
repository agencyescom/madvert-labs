"use client";

import { Award, Globe2, Layers, Megaphone, Workflow } from "lucide-react";
import { Reveal } from "../ui/motion";

const KNOWS = [
  "What patch buyers respond to",
  "How patch RFQ funnels should be structured",
  "Which project details matter before quotation",
  "How quantity changes opportunity value",
  "When artwork should be requested",
  "How different patch types affect customer intent",
  "How fast inquiries should reach sales teams",
  "How different buyer groups respond to different offers",
];

const CARDS = [
  { icon: Award, title: "5+ years in lead generation" },
  { icon: Layers, title: "Custom patch niche experience" },
  { icon: Megaphone, title: "Meta advertising experience" },
  { icon: Workflow, title: "Funnels + CRM + automation" },
  { icon: Globe2, title: "U.S. market acquisition experience" },
];

export function Credibility() {
  return (
    <section aria-labelledby="niche-title" className="section-y relative border-t border-line bg-bg-2">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">Why niche experience matters</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 id="niche-title" className="display h2 mt-4">
                We&rsquo;re not learning the patch market <span className="text-grad">on your budget.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead mt-6">Running ads is only one part of this model. The real system requires understanding:</p>
            </Reveal>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-[1.25rem] border border-line bg-line sm:grid-cols-2 lg:col-span-7">
            {KNOWS.map((k, i) => (
              <Reveal as="li" key={k} delay={0.04 * i} className="flex items-start gap-4 bg-surface p-5">
                <span className="font-mono text-[0.72rem] font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[0.98rem] font-semibold leading-snug">{k}</span>
              </Reveal>
            ))}
          </ol>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {CARDS.map((c, i) => (
            <Reveal as="li" key={c.title} delay={0.06 * i} className={`card card-hover p-5 ${i === CARDS.length - 1 ? "col-span-2 md:col-span-1" : ""}`}>
              <c.icon className="h-6 w-6 text-accent" aria-hidden />
              <p className="mt-4 text-[0.9rem] font-extrabold uppercase leading-tight tracking-[-0.005em]">{c.title}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
