"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, CalendarClock, FileImage, Mail, MapPin, Phone, Ruler, Package, Layers, Shapes } from "lucide-react";
import { Reveal, EASE, AnimatedCheck, useSequence } from "../ui/motion";

/** Build order: identity → quantity → specs → deadline → artwork → contact → notes → qualified. */
const SPEC_ROWS = [
  { k: "Patch Type", v: "Embroidered Patch", icon: Shapes, at: 2 },
  { k: "Quantity", v: "500 Pieces", icon: Package, at: 2 },
  { k: "Size", v: "3.5 Inches", icon: Ruler, at: 3 },
  { k: "Backing", v: "Iron On", icon: Layers, at: 3 },
  { k: "Deadline", v: "November 15", icon: CalendarClock, at: 4 },
];
const TOTAL = 9;

export function QualifiedRFQ() {
  return (
    <section aria-labelledby="rfq-title" className="section-y relative overflow-clip">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow">Not a data list</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="rfq-title" className="display h2 mt-4">
              A real customer <span className="text-grad">asking to be quoted.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead mt-6">
              A Madvert Labs RFQ is designed to arrive with the project information your sales team needs before making first
              contact.
            </p>
          </Reveal>

          {/* The contrast that matters */}
          <Reveal delay={0.15} className="mt-9">
            <p className="label-tag mb-3">A basic form lead looks like this</p>
            <div className="rounded-2xl border border-dashed border-line-strong p-4 opacity-80">
              <div className="grid grid-cols-3 gap-2 text-[0.78rem]">
                {["Name", "Email", "Phone"].map((f) => (
                  <div key={f} className="rounded-lg bg-surface-2 px-3 py-2">
                    <p className="text-subtle">{f}</p>
                    <p className="font-semibold text-muted">Provided</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[0.8rem] text-subtle">No product. No quantity. No deadline. No artwork. Your team starts from zero.</p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="display mt-10 text-[clamp(1.5rem,2.6vw,2.1rem)]">
              That&rsquo;s not just a lead.
              <br />
              <span className="text-grad">That&rsquo;s a quotation opportunity.</span>
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <RFQCard />
        </div>
      </div>
    </section>
  );
}

function Row({ show, children, className = "" }: { show: boolean; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0.12, y: 6, filter: "blur(2px)" }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function RFQCard() {
  const { ref, step } = useSequence(TOTAL, { interval: 520, startDelay: 300, amount: 0.4 });
  const uploading = step === 5;
  const uploaded = step >= 6;
  const qualified = step >= TOTAL;

  return (
    <div ref={ref} className="relative">
      <div aria-hidden className="absolute -inset-10 -z-10 bg-[radial-gradient(ellipse_at_60%_40%,var(--glow),transparent_65%)]" />
      <motion.div
        className="card overflow-hidden shadow-lg"
        animate={qualified ? { boxShadow: "0 0 0 1px var(--accent-line), 0 40px 90px -40px rgba(0,190,255,0.55)" } : {}}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <motion.span
              className={`grid h-7 w-7 place-items-center rounded-lg ${qualified ? "bg-grad text-navy" : "bg-surface-3 text-subtle"}`}
              animate={qualified ? { scale: [1, 1.15, 1] } : {}}
            >
              <BadgeCheck className="h-4 w-4" aria-hidden />
            </motion.span>
            <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.14em]">
              {qualified ? "Qualified RFQ" : "Incoming RFQ"}
            </span>
          </div>
          <AnimatePresence mode="wait">
            {qualified ? (
              <motion.span
                key="hi"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-md border border-[var(--accent-line)] bg-accent-soft px-2.5 py-1 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-accent"
              >
                High intent
              </motion.span>
            ) : (
              <motion.span key="rv" exit={{ opacity: 0 }} className="label-tag">
                Reviewing…
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 sm:p-6">
          {/* Identity */}
          <Row show={step >= 1} className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-grad text-base font-extrabold text-navy">JD</span>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">John Davis</p>
              <p className="text-[0.88rem] text-muted">Apex Apparel Co.</p>
              <p className="mt-0.5 flex items-center gap-1 text-[0.8rem] text-subtle">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> Los Angeles, CA
              </p>
            </div>
            <span className="label-tag ml-auto hidden sm:block">Sample RFQ</span>
          </Row>

          {/* Specs */}
          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SPEC_ROWS.map((r) => (
              <Row key={r.k} show={step >= r.at} className="rounded-xl border border-line bg-surface-2 px-3.5 py-3">
                <dt className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-subtle">
                  <r.icon className="h-3.5 w-3.5" aria-hidden />
                  {r.k}
                </dt>
                <dd className="mt-1 text-[0.95rem] font-bold">{r.v}</dd>
              </Row>
            ))}
            {/* Artwork upload */}
            <Row show={step >= 5} className="col-span-2 rounded-xl border border-line bg-surface-2 px-3.5 py-3 sm:col-span-1">
              <dt className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-subtle">
                <FileImage className="h-3.5 w-3.5" aria-hidden /> Artwork
              </dt>
              <dd className="mt-1">
                {uploaded ? (
                  <span className="flex items-center gap-1.5 text-[0.95rem] font-bold text-ok">
                    Uploaded <AnimatedCheck className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="block">
                    <span className="text-[0.8rem] font-semibold text-muted">apex-logo.ai</span>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <motion.span
                        className="block h-full rounded-full bg-grad"
                        initial={{ width: "0%" }}
                        animate={{ width: uploading ? "100%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </span>
                  </span>
                )}
              </dd>
            </Row>
          </dl>

          {/* Contact */}
          <Row show={step >= 7} className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-line px-3.5 py-3 text-[0.88rem]">
              <Phone className="h-4 w-4 text-subtle" aria-hidden />
              <span className="font-mono text-muted">+1 XXX XXX XXXX</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-line px-3.5 py-3 text-[0.88rem]">
              <Mail className="h-4 w-4 text-subtle" aria-hidden />
              <span className="truncate font-mono text-muted">john@company.com</span>
            </div>
          </Row>

          {/* Notes */}
          <Row show={step >= 8} className="mt-3 rounded-xl border border-line bg-surface-2 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-subtle">Project details</p>
            <p className="mt-1.5 text-[0.92rem] leading-relaxed text-fg">
              &ldquo;Looking for 500 embroidered patches for our apparel line. Artwork attached. Please share pricing and production
              timeline.&rdquo;
            </p>
          </Row>
        </div>

        {/* Qualified footer */}
        <motion.div
          className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6"
          initial={false}
          animate={{
            backgroundColor: qualified ? "rgba(0, 190, 255, 0.10)" : "rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.6 }}
        >
          <span className={`flex items-center gap-2 text-[0.9rem] font-extrabold uppercase tracking-[0.1em] ${qualified ? "text-accent" : "text-subtle"}`}>
            {qualified ? "Qualified RFQ" : "Checking agreed criteria"}
            <AnimatedCheck show={qualified} className="h-5 w-5" />
          </span>
          <span className="text-[0.75rem] text-subtle">Meets criteria agreed before launch</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
