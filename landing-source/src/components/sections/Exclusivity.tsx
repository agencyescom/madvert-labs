"use client";

import { motion } from "framer-motion";
import { ArrowDown, Cpu, Store, SquareKanban } from "lucide-react";
import { Reveal, EASE, useSequence } from "../ui/motion";

const AROUND = ["Your Business", "Your Brand", "Your Product Mix", "Your Qualification Rules", "Your Sales Process"];
const SCOPES = ["Geography", "Patch Category", "Audience", "Campaign Scope"];

export function Exclusivity() {
  return (
    <section aria-labelledby="partnership-title" className="section-y relative border-t border-line bg-bg-2">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow">Not a shared lead marketplace</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="partnership-title" className="display h2 mt-4">
              Your brand.
              <br />
              Your funnel.
              <br />
              Your pipeline.
              <br />
              <span className="text-grad">
                Your RFQ<span className="normal-case">s</span>.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead mt-6">
              We are not building a marketplace where one inquiry is sold to multiple patch manufacturers. The acquisition
              infrastructure is designed around:
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <ul className="mt-5 flex flex-wrap gap-2">
              {AROUND.map((a) => (
                <li key={a} className="chip chip-accent !text-[0.78rem] !normal-case !tracking-normal">
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2} className="card mt-8 p-5">
            <p className="text-[0.95rem] font-bold">For selected partners, campaign exclusivity may be agreed around:</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SCOPES.map((s) => (
                <li key={s} className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-center text-[0.82rem] font-semibold">
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.8rem] text-subtle">
              Any exclusivity arrangement depends on market, geography, production capacity and partnership terms.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-6">
          <FlowDiagram />
        </div>
      </div>
    </section>
  );
}

function FlowDiagram() {
  const { ref, step } = useSequence(5, { interval: 550 });
  const nodes = [
    { icon: Cpu, title: "Madvert Labs acquisition engine", note: "Behind the scenes — never customer-facing", tone: "engine" },
    { icon: Store, title: "One client brand", note: "Your name, your funnel, your domain", tone: "brand" },
    { icon: SquareKanban, title: "The client’s pipeline", note: "Every RFQ lands with you — and only you", tone: "pipe" },
  ];
  return (
    <div ref={ref} className="relative mx-auto max-w-md">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse,var(--glow),transparent_70%)] blur-2xl" />
      {nodes.map((n, i) => {
        const on = step >= i * 2 + 1;
        return (
          <div key={n.title}>
            <motion.div
              className={`relative rounded-2xl border p-5 ${
                n.tone === "brand"
                  ? "border-[var(--accent-line)] bg-surface shadow-lg"
                  : n.tone === "engine"
                    ? "theme-dark border-line"
                    : "border-line bg-surface shadow-md"
              }`}
              initial={false}
              animate={{ opacity: on ? 1 : 0.2, y: on ? 0 : 10 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="flex items-center gap-4">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${n.tone === "brand" ? "bg-grad text-navy" : "bg-surface-2 text-accent"}`}>
                  <n.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-[1.02rem] font-extrabold uppercase tracking-[-0.01em]">{n.title}</p>
                  <p className="text-[0.85rem] text-muted">{n.note}</p>
                </div>
              </div>
            </motion.div>
            {i < nodes.length - 1 && (
              <div className="relative mx-auto flex h-14 w-px justify-center bg-line" aria-hidden>
                <motion.span
                  className="absolute inset-x-0 top-0 bg-grad"
                  initial={{ height: 0 }}
                  animate={{ height: step >= i * 2 + 2 ? "100%" : 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                />
                <ArrowDown className={`absolute -bottom-2 h-4 w-4 transition-colors ${step >= i * 2 + 2 ? "text-accent" : "text-subtle"}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
