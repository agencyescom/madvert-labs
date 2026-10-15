"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FAQS } from "@/lib/faqs";
import { Reveal, EASE } from "../ui/motion";



export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-y relative border-t border-line bg-bg-2">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="eyebrow">FAQ</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 id="faq-title" className="display h2 mt-4">
                Straight <span className="text-grad">answers.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead mt-5">The commercial model is simple on purpose. Here&rsquo;s how it works in detail.</p>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-8">
          <ul className="divide-y divide-line overflow-hidden rounded-[1.25rem] border border-line bg-surface">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-7"
                    >
                      <span className="font-mono text-[0.72rem] font-bold text-subtle">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`flex-1 text-[1.02rem] font-bold uppercase tracking-[-0.005em] transition-colors sm:text-[1.08rem] ${isOpen ? "text-fg" : "text-fg/85"}`}>
                        {f.q}
                      </span>
                      <motion.span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${isOpen ? "border-transparent bg-grad text-navy" : "border-line-strong text-subtle"}`}
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                      </motion.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-a-${i}`}
                        role="region"
                        aria-labelledby={`faq-q-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 pb-6 pl-[3.6rem] pr-5 text-[0.98rem] leading-relaxed text-muted sm:pl-[4.1rem] sm:pr-16">
                          {f.a.map((p) => (
                            <p key={p}>{p}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
