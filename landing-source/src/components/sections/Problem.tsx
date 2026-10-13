"use client";

import { motion } from "framer-motion";
import { Building2, Handshake, Phone, UserPlus } from "lucide-react";
import { Reveal, EASE, useSequence } from "../ui/motion";

const OPTIONS = [
  { icon: UserPlus, text: "Building an in-house marketing team." },
  { icon: UserPlus, text: "Hiring another freelancer." },
  { icon: Building2, text: "Paying a traditional agency retainer." },
  { icon: Phone, text: "Depending on referrals, outbound prospecting and inconsistent inbound demand." },
];

export function Problem() {
  return (
    <section aria-labelledby="problem-title" className="section-y relative border-t border-line bg-bg-2">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow">The real bottleneck</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="problem-title" className="display h2 mt-4">
              Your production team shouldn&rsquo;t be waiting for orders while your sales team hunts for leads.
            </h2>
          </Reveal>
          <div className="lead mt-7 max-w-2xl space-y-4">
            <Reveal delay={0.1}>
              <p>
                Most established patch manufacturers don&rsquo;t have a production problem.{" "}
                <strong className="font-semibold text-fg">They have a consistent acquisition problem.</strong>
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p>One month, inquiries are strong. The next, the pipeline slows down. So manufacturers usually choose between:</p>
            </Reveal>
          </div>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {OPTIONS.map((o, i) => (
              <Reveal as="li" key={o.text} delay={0.08 * i} className="card flex items-start gap-3 p-4">
                <o.icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-subtle" aria-hidden />
                <span className="text-[0.92rem] leading-snug text-muted">{o.text}</span>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 lg:pt-10">
          <CapacityGauge />
        </div>
      </div>

      {/* Transition */}
      <div className="container-x mt-20 lg:mt-28">
        <Reveal>
          <p className="eyebrow">
            <Handshake className="h-3.5 w-3.5" aria-hidden /> There&rsquo;s a simpler model
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Reveal className="card p-7 sm:p-9">
            <p className="label-tag">You</p>
            <p className="display mt-4 text-[clamp(2.4rem,5vw,4.2rem)]">
              Quote.
              <br />
              Produce.
              <br />
              Fulfill.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="theme-dark relative overflow-hidden rounded-[1.25rem] border border-line p-7 sm:p-9">
            <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,200,255,0.25),transparent_65%)]" />
            <p className="label-tag !text-accent">Madvert Labs</p>
            <p className="display relative mt-4 text-[clamp(2rem,4.2vw,3.5rem)]">
              Builds the
              <br />
              <span className="text-grad">acquisition infrastructure.</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Conceptual UI: capacity vs demand, then demand rises to meet capacity. */
function CapacityGauge() {
  const { ref, step } = useSequence(2, { interval: 1500, startDelay: 900 });
  const demand = step >= 2 ? 70 : 38;
  return (
    <div ref={ref} className="card relative overflow-hidden p-6 shadow-md sm:p-7">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">Capacity vs. pipeline</p>
        <span className="label-tag">Conceptual view · not real data</span>
      </div>
      <div className="mt-7 space-y-6">
        <Bar label="Production capacity" value={72} tone="neutral" show={step >= 1} />
        <Bar label="Pipeline demand" value={demand} tone="accent" show={step >= 1} />
      </div>
      <motion.div
        className="mt-7 rounded-xl border border-line bg-surface-2 p-4 text-[0.88rem] leading-relaxed"
        animate={{ opacity: step >= 2 ? 1 : 0.55 }}
      >
        {step >= 2 ? (
          <span>
            <strong className="text-fg">With a consistent RFQ pipeline,</strong>{" "}
            <span className="text-muted">demand is planned around the capacity you actually have.</span>
          </span>
        ) : (
          <span className="text-muted">Idle machines and a quiet inbox — the gap most manufacturers live with.</span>
        )}
      </motion.div>
    </div>
  );
}

function Bar({ label, value, tone, show }: { label: string; value: number; tone: "neutral" | "accent"; show: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
        <motion.span key={value} className="font-mono text-xl font-bold" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          {show ? value : 0}%
        </motion.span>
      </div>
      <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-surface-3">
        <motion.div
          className={`h-full rounded-full ${tone === "accent" ? "bg-grad" : "bg-fg/70"}`}
          initial={{ width: 0 }}
          animate={{ width: show ? `${value}%` : 0 }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      </div>
    </div>
  );
}
