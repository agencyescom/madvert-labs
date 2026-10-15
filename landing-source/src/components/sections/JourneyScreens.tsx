"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  Check,
  Clock,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  ShieldCheck,
  SquareKanban,
  Truck,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatedCheck, EASE } from "../ui/motion";
import { asset } from "@/lib/paths";

/**
 * Mini phone screens for each step of the buyer journey. `active` lets each
 * screen play its own micro-interaction when it becomes the current step.
 */

const PATCHES = [
  { name: "Embroidered", img: asset("/patches/embroidered.webp") },
  { name: "PVC", img: asset("/patches/summit.webp") },
  { name: "Chenille", img: asset("/patches/chenille.webp") },
  { name: "Woven", img: asset("/patches/tiger.webp") },
  { name: "Leather", img: null },
  { name: "Printed", img: asset("/patches/eagle.webp") },
  { name: "Not Sure", img: null },
];

function useDelayedFlag(active: boolean, delay: number) {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!active) {
      setOn(false);
      return;
    }
    if (reduce) {
      setOn(true);
      return;
    }
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [active, delay, reduce]);
  return on;
}

function Option({ label, selected, className = "" }: { label: string; selected?: boolean; className?: string }) {
  return (
    <motion.div
      className={`rounded-lg border px-2 py-2 text-center text-[0.68rem] font-semibold transition-colors duration-300 ${
        selected ? "border-brand-blue bg-[rgba(0,180,255,0.12)] text-[#0a1622] dark:text-white" : "border-black/10 text-[#3c4656] dark:border-white/10 dark:text-white/70"
      } ${className}`}
      animate={selected ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      {label}
    </motion.div>
  );
}

function FunnelHeader({ step, title }: { step: number; title: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#5a6577] dark:text-white/50">
        <span>Your Brand</span>
        <span>Step {step} of 6</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <motion.div className="h-full rounded-full bg-grad" initial={{ width: 0 }} animate={{ width: `${(step / 6) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
      </div>
      <p className="mt-3 text-[0.95rem] font-extrabold leading-tight text-[#0a101c] dark:text-white">{title}</p>
    </div>
  );
}

export function JourneyScreen({ index, active }: { index: number; active: boolean }) {
  const a = useDelayedFlag(active, 650);
  const b = useDelayedFlag(active, 1400);

  switch (index) {
    case 0:
      return (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-grad text-[0.6rem] font-extrabold text-navy">YB</span>
            <div className="leading-tight">
              <p className="text-[0.72rem] font-bold text-[#0a101c] dark:text-white">Your Brand</p>
              <p className="text-[0.58rem] text-[#6b7686] dark:text-white/50">Sponsored</p>
            </div>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <Image src={asset("/patches/embroidered.webp")} alt="Embroidered outdoor patch shown in the ad" fill sizes="240px" className="object-cover" />
          </div>
          <p className="text-[0.9rem] font-extrabold leading-tight text-[#0a101c] dark:text-white">Custom Patches for Your Brand</p>
          <p className="text-[0.66rem] text-[#5a6577] dark:text-white/60">Premium quality. Fast turnaround.</p>
          <motion.div
            className="rounded-lg bg-[#1877f2] py-2 text-center text-[0.72rem] font-bold text-white"
            animate={a ? { scale: [1, 0.95, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            Get a Free Quote →
          </motion.div>
        </div>
      );
    case 1:
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.72rem] font-extrabold tracking-tight text-[#0a101c] dark:text-white">YOUR BRAND</span>
            <span className="h-0.5 w-4 rounded bg-current opacity-40" />
          </div>
          <div className="relative h-24 overflow-hidden rounded-lg">
            <Image src={asset("/patches/chenille.webp")} alt="" fill sizes="240px" className="object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <p className="absolute bottom-2 left-2.5 text-[0.82rem] font-extrabold leading-tight text-white">
              Custom patches
              <br />
              for your brand
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center text-[0.56rem] font-semibold text-[#3c4656] dark:text-white/70">
            {[
              [ShieldCheck, "Premium quality"],
              [Clock, "Fast turnaround"],
              [Truck, "U.S. delivery"],
            ].map(([Icon, t]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <div key={t as string} className="rounded-lg border border-black/10 p-1.5 dark:border-white/10">
                  <I className="mx-auto mb-1 h-3.5 w-3.5 text-[#0090d6] dark:text-brand-cyan" aria-hidden />
                  {t as string}
                </div>
              );
            })}
          </div>
          <div className="rounded-lg bg-grad py-2 text-center text-[0.72rem] font-bold text-navy">Start my quote →</div>
          <p className="text-center text-[0.56rem] text-[#6b7686] dark:text-white/45">Your branding · your domain</p>
        </div>
      );
    case 2:
      return (
        <div className="space-y-3">
          <FunnelHeader step={1} title="What type of patch do you need?" />
          <div className="grid grid-cols-3 gap-1.5">
            {PATCHES.slice(0, 6).map((p) => {
              const sel = a && p.name === "Embroidered";
              return (
                <motion.div
                  key={p.name}
                  className={`overflow-hidden rounded-lg border text-center ${sel ? "border-brand-blue ring-2 ring-brand-blue/30" : "border-black/10 dark:border-white/10"}`}
                  animate={sel ? { scale: [1, 1.06, 1] } : {}}
                >
                  <div className="relative aspect-square bg-black/5 dark:bg-white/5">
                    {p.img ? (
                      <Image src={p.img} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <span className="absolute inset-2 rounded-md bg-gradient-to-br from-[#8a5a35] to-[#5c3a20]" />
                    )}
                  </div>
                  <p className="py-1 text-[0.56rem] font-semibold text-[#3c4656] dark:text-white/75">{p.name}</p>
                </motion.div>
              );
            })}
          </div>
          <Option label="Not Sure — help me choose" />
        </div>
      );
    case 3:
      return (
        <div className="space-y-3">
          <FunnelHeader step={2} title="How many patches do you need?" />
          <div className="grid grid-cols-2 gap-1.5">
            {["25–49", "50–99", "100–249", "250–499", "500–999", "1,000+"].map((q) => (
              <Option key={q} label={q} selected={a && q === "500–999"} className="!py-2.5 !text-[0.74rem]" />
            ))}
          </div>
          <p className="text-[0.6rem] text-[#6b7686] dark:text-white/50">Exact quantity: {a ? <b className="text-[#0a101c] dark:text-white">500 pieces</b> : "—"}</p>
        </div>
      );
    case 4:
      return (
        <div className="space-y-3">
          <FunnelHeader step={3} title="Size & backing" />
          <div className="grid grid-cols-2 gap-1.5">
            {["Width", "Height"].map((d) => (
              <div key={d} className="rounded-lg border border-black/10 px-2.5 py-2 dark:border-white/10">
                <p className="text-[0.54rem] font-semibold uppercase tracking-wide text-[#6b7686] dark:text-white/50">{d}</p>
                <p className="text-[0.82rem] font-bold text-[#0a101c] dark:text-white">{a ? "3.5 in" : "—"}</p>
              </div>
            ))}
          </div>
          <p className="text-[0.6rem] font-bold uppercase tracking-wide text-[#5a6577] dark:text-white/55">Backing</p>
          <div className="grid grid-cols-3 gap-1.5">
            {["Iron On", "Velcro", "Sew On", "Adhesive", "Other"].map((o) => (
              <Option key={o} label={o} selected={b && o === "Iron On"} />
            ))}
          </div>
        </div>
      );
    case 5:
      return (
        <div className="space-y-3">
          <FunnelHeader step={4} title="Upload your artwork" />
          <div className="grid place-items-center rounded-xl border-2 border-dashed border-black/15 px-3 py-5 text-center dark:border-white/15">
            <UploadCloud className="h-6 w-6 text-[#0090d6] dark:text-brand-cyan" aria-hidden />
            <p className="mt-1.5 text-[0.66rem] font-semibold text-[#3c4656] dark:text-white/75">Drag &amp; drop your logo</p>
            <p className="text-[0.56rem] text-[#6b7686] dark:text-white/45">AI, PDF, PNG, SVG</p>
          </div>
          <div className="rounded-lg border border-black/10 p-2.5 dark:border-white/10">
            <div className="flex items-center justify-between text-[0.68rem] font-semibold text-[#0a101c] dark:text-white">
              <span>apex-logo.ai</span>
              <span className="text-[#6b7686] dark:text-white/50">2.4 MB</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <motion.div className="h-full rounded-full bg-grad" initial={{ width: "0%" }} animate={{ width: active ? "100%" : "0%" }} transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }} />
            </div>
            <motion.p
              className="mt-1.5 flex items-center gap-1 text-[0.62rem] font-extrabold uppercase tracking-wide text-[#0a8a5a] dark:text-[#3ee0a1]"
              animate={{ opacity: b ? 1 : 0 }}
            >
              Upload complete <AnimatedCheck show={b} className="h-3.5 w-3.5" />
            </motion.p>
          </div>
        </div>
      );
    case 6:
      return (
        <div className="space-y-3">
          <FunnelHeader step={5} title="When do you need them?" />
          <div className="grid gap-1.5">
            {["ASAP", "Within 2 Weeks", "Within 1 Month", "Specific Date"].map((d) => (
              <Option key={d} label={d} selected={a && d === "Specific Date"} className="!py-2.5 !text-left !px-3" />
            ))}
          </div>
          <motion.div className="flex items-center gap-2 rounded-lg border border-brand-blue/60 px-3 py-2 text-[0.72rem] font-bold text-[#0a101c] dark:text-white" animate={{ opacity: b ? 1 : 0, y: b ? 0 : 6 }}>
            <CalendarDays className="h-3.5 w-3.5 text-[#0090d6] dark:text-brand-cyan" aria-hidden /> November 15
          </motion.div>
        </div>
      );
    case 7:
      return (
        <div className="space-y-2.5">
          <FunnelHeader step={6} title="Where should we send your quote?" />
          {[
            ["Name", "John Davis"],
            ["Business", "Apex Apparel Co."],
            ["Email", "john@company.com"],
            ["Phone", "+1 XXX XXX XXXX"],
          ].map(([k, v], i) => (
            <div key={k} className="rounded-lg border border-black/10 px-2.5 py-1.5 dark:border-white/10">
              <p className="text-[0.52rem] font-semibold uppercase tracking-wide text-[#6b7686] dark:text-white/50">{k}</p>
              <motion.p className="text-[0.74rem] font-semibold text-[#0a101c] dark:text-white" animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.25 * i + 0.3 }}>
                {v}
              </motion.p>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-1.5">
            {["Phone", "Email", "WhatsApp"].map((m) => (
              <Option key={m} label={m} selected={b && m === "Phone"} />
            ))}
          </div>
        </div>
      );
    case 8:
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-[#0090d6] dark:text-brand-cyan" aria-hidden />
            <p className="text-[0.82rem] font-extrabold text-[#0a101c] dark:text-white">Agreed criteria check</p>
          </div>
          {["Approved patch type", "Quantity ≥ agreed minimum", "Deadline provided", "Artwork uploaded", "U.S. buyer", "Valid contact"].map((c, i) => (
            <motion.div
              key={c}
              className="flex items-center justify-between rounded-lg border border-black/10 px-2.5 py-1.5 text-[0.68rem] font-semibold text-[#0a101c] dark:border-white/10 dark:text-white"
              initial={false}
              animate={{ opacity: active ? 1 : 0.3 }}
              transition={{ delay: active ? 0.18 * i : 0 }}
            >
              {c}
              <span className="text-[#0a8a5a] dark:text-[#3ee0a1]">
                <AnimatedCheck show={active} delay={0.18 * i + 0.1} className="h-3.5 w-3.5" />
              </span>
            </motion.div>
          ))}
          <motion.div
            className="mt-1 rounded-lg bg-grad py-2 text-center text-[0.72rem] font-extrabold uppercase tracking-wide text-navy"
            initial={false}
            animate={{ opacity: b ? 1 : 0, scale: b ? 1 : 0.9 }}
            transition={{ delay: 0.2 }}
          >
            Accepted qualified RFQ ✓
          </motion.div>
        </div>
      );
    default:
      return (
        <div className="space-y-2">
          <p className="text-center font-mono text-[1.6rem] font-light text-[#0a101c] dark:text-white">9:41</p>
          {[
            [SquareKanban, "CRM", "New RFQ added to pipeline"],
            [Mail, "Email", "New qualified RFQ — 500 patches"],
            [MessageSquare, "SMS", "Apex Apparel Co. · View in CRM"],
            [MessageCircle, "WhatsApp", "Artwork uploaded · Los Angeles"],
            [Bell, "Push", "New qualified RFQ"],
          ].map(([Icon, t, d], i) => {
            const I = Icon as typeof Bell;
            return (
              <motion.div
                key={t as string}
                className="flex items-center gap-2 rounded-xl border border-black/10 bg-white/70 px-2.5 py-1.5 dark:border-white/10 dark:bg-white/[0.06]"
                initial={false}
                animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
                transition={{ delay: active ? 0.2 * i + 0.2 : 0, ease: EASE }}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-grad text-navy">
                  <I className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[0.62rem] font-bold text-[#0a101c] dark:text-white">{t as string}</p>
                  <p className="truncate text-[0.58rem] text-[#5a6577] dark:text-white/55">{d as string}</p>
                </div>
              </motion.div>
            );
          })}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <div className="flex items-center justify-center gap-1 rounded-lg bg-grad py-1.5 text-[0.62rem] font-bold text-navy">
              <Phone className="h-3 w-3" aria-hidden /> Call customer
            </div>
            <div className="flex items-center justify-center gap-1 rounded-lg border border-black/10 py-1.5 text-[0.62rem] font-bold text-[#0a101c] dark:border-white/15 dark:text-white">
              <Check className="h-3 w-3" aria-hidden /> View RFQ
            </div>
          </div>
        </div>
      );
  }
}

/** Phone shell used by the journey on desktop and inside each mobile step card. */
export function PhoneShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-[2.2rem] border border-black/10 bg-[#0b111a] p-2 shadow-lg dark:border-white/10 ${className}`}>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-white dark:bg-[#0e1621]">
        <div className="flex items-center justify-between px-5 pb-1 pt-2.5 text-[0.55rem] font-semibold text-[#0a101c] dark:text-white/80">
          <span>9:41</span>
          <span className="h-4 w-16 rounded-full bg-[#0b111a]" aria-hidden />
          <span>5G</span>
        </div>
        <div className="px-4 pb-5 pt-2">{children}</div>
      </div>
    </div>
  );
}
