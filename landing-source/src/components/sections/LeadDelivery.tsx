"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, FileText, Image as ImageIcon, Mail, MessageCircle, MessageSquare, Phone, SquareKanban } from "lucide-react";
import { Reveal, EASE, AnimatedCheck, useSequence } from "../ui/motion";
import { VISUALS, VisualFrame } from "../ui/Visual";

const CHANNELS = [
  { icon: SquareKanban, name: "CRM", note: "New RFQ added to pipeline" },
  { icon: Mail, name: "Email", note: "Instant email notification" },
  { icon: MessageSquare, name: "SMS", note: "Where supported" },
  { icon: MessageCircle, name: "WhatsApp", note: "Where connected" },
  { icon: Bell, name: "Mobile push", note: "Instant push notification" },
];

export function LeadDelivery() {
  const { ref, step } = useSequence(CHANNELS.length + 2, { interval: 420, startDelay: 400 });
  const showCard = step > CHANNELS.length;
  const showActions = step > CHANNELS.length + 1;

  return (
    <section aria-labelledby="speed-title" className="section-y relative overflow-clip border-t border-line bg-bg-2">
      <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <div ref={ref} className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow">Instant lead delivery</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="speed-title" className="display h2 mt-4">
              When the RFQ arrives, <span className="text-grad">your team knows.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead mt-6">Accepted RFQs can be delivered immediately into your sales workflow.</p>
          </Reveal>

          <ul className="mt-8 grid gap-2" aria-label="Delivery channels">
            {CHANNELS.map((c, i) => {
              const on = step > i;
              return (
                <motion.li
                  key={c.name}
                  className="flex items-center gap-3.5 rounded-xl border bg-surface px-4 py-3"
                  animate={{
                    borderColor: on ? "var(--accent-line)" : "var(--line)",
                    opacity: on ? 1 : 0.45,
                  }}
                  transition={{ duration: 0.35 }}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors duration-300 ${on ? "bg-grad text-navy" : "bg-surface-2 text-subtle"}`}>
                    <c.icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.95rem] font-bold leading-tight">{c.name}</p>
                    <p className="text-[0.8rem] text-subtle">{c.note}</p>
                  </div>
                  <span className="text-ok">
                    <AnimatedCheck show={on} className="h-5 w-5" />
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="relative lg:col-span-7">
          <VisualFrame
            asset={VISUALS.speed}
            label="Speed to lead"
            parallax={20}
            sizes="(min-width: 1024px) 58vw, 100vw"
            mobileCrop={{ aspect: "4/5", position: "50% 50%" }}
          />

          {/* Coded notification — the operational moment */}
          <AnimatePresence>
            {showCard && (
              <motion.div
                className="card relative z-10 border-[var(--accent-line)] mx-auto mt-4 w-full max-w-[380px] p-4 shadow-lg lg:absolute lg:-bottom-10 lg:-left-12 lg:mx-0 lg:mt-0"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: EASE }}
                role="status"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-accent">New qualified RFQ</span>
                  <span className="text-[0.66rem] text-subtle">now · example</span>
                </div>
                <p className="mt-2 text-lg font-extrabold leading-tight">500 Embroidered Patches</p>
                <p className="mt-0.5 text-[0.85rem] text-muted">Artwork uploaded · Los Angeles, CA</p>
                <motion.div
                  className="mt-3.5 grid grid-cols-3 gap-1.5"
                  initial={false}
                  animate={{ opacity: showActions ? 1 : 0, y: showActions ? 0 : 6 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="flex items-center justify-center gap-1 rounded-lg bg-grad px-2 py-2 text-[0.7rem] font-bold text-navy">
                    <Phone className="h-3.5 w-3.5" aria-hidden /> Call customer
                  </span>
                  <span className="flex items-center justify-center gap-1 rounded-lg border border-line-strong px-2 py-2 text-[0.7rem] font-bold">
                    <FileText className="h-3.5 w-3.5" aria-hidden /> View RFQ
                  </span>
                  <span className="flex items-center justify-center gap-1 rounded-lg border border-line-strong px-2 py-2 text-[0.7rem] font-bold">
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden /> View artwork
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="container-x mt-20 lg:mt-24">
        <Reveal>
          <p className="display text-center text-[clamp(1.4rem,2.6vw,2.2rem)]">
            Less time searching for information. <span className="text-grad">More time quoting the opportunity.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
