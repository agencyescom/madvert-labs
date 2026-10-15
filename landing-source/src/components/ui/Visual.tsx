"use client";

import { AnimatePresence, motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Expand, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EASE } from "./motion";
import { asset } from "@/lib/paths";

export type VisualAsset = { src: string; width: number; height: number; alt: string };

export const VISUALS = {
  ecosystem: { src: asset("/visuals/acquisition-ecosystem.webp"), width: 1586, height: 992, alt: "Acquisition ecosystem: a Meta ad leads to a branded mobile RFQ funnel, the RFQ is qualified, lands in the CRM and alerts the sales team." },
  journey: { src: asset("/visuals/customer-journey.webp"), width: 1672, height: 941, alt: "Six-stage journey: Meta ad, branded landing page, RFQ funnel, qualified RFQ, CRM pipeline and sales team notification." },
  qualified: { src: asset("/visuals/qualified-vs-not.webp"), width: 1448, height: 1086, alt: "Accepted qualified RFQ versus an inquiry that does not meet agreed criteria." },
  speed: { src: asset("/visuals/speed-to-lead.webp"), width: 1586, height: 992, alt: "A qualified RFQ delivered at the same moment to CRM, email, SMS, WhatsApp and mobile push." },
  pricing: { src: asset("/visuals/pricing-light.webp"), width: 1448, height: 1086, alt: "One simple price: $15 per accepted qualified RFQ with ad spend and the complete acquisition system included." },
  comparison: { src: asset("/visuals/model-comparison.webp"), width: 1448, height: 1086, alt: "Comparison of an in-house team, a traditional agency and the Madvert Labs Capacity Partnership." },
  application: { src: asset("/visuals/application-preview.webp"), width: 1448, height: 1086, alt: "The Madvert Labs partnership application on laptop and mobile." },
} satisfies Record<string, VisualAsset>;

/** Full-screen image viewer, used so complex visuals stay readable on phones. */
export function Lightbox({ asset, open, onClose }: { asset: VisualAsset; open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={asset.alt}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#03060b]/92 p-3 backdrop-blur-md sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.div
            className="max-h-full w-full max-w-[1600px] overflow-auto"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-[760px] sm:min-w-0">
              <Image src={asset.src} alt={asset.alt} width={asset.width} height={asset.height} sizes="100vw" className="h-auto w-full rounded-xl" />
            </div>
          </motion.div>
          <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/60 sm:hidden">Scroll sideways to explore · tap outside to close</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function useLightbox() {
  const [open, setOpen] = useState(false);
  return { open, show: useCallback(() => setOpen(true), []), hide: useCallback(() => setOpen(false), []) };
}

export function ExpandButton({ onClick, label = "Expand visual" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/70"
    >
      <Expand className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

/**
 * Dark visual frame with optional window chrome, scroll zoom and parallax.
 * `mobileCrop` shows a readable detail crop below `md` instead of shrinking the full composition.
 */
export function VisualFrame({
  asset,
  label,
  className = "",
  sizes = "(min-width: 1024px) 60vw, 100vw",
  priority = false,
  zoomOnScroll = true,
  parallax = 0,
  mobileCrop,
  expandable = true,
  children,
}: {
  asset: VisualAsset;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  zoomOnScroll?: boolean;
  parallax?: number;
  /** e.g. { aspect: "4/5", position: "50% 40%" } */
  mobileCrop?: { aspect: string; position: string };
  expandable?: boolean;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], zoomOnScroll && !reduce ? [1.06, 1, 1.02] : [1, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [parallax, -parallax]);
  const lb = useLightbox();

  return (
    <motion.div ref={ref} style={{ y }} className={`visual-frame ${className}`}>
      {label && (
        <div className="flex items-center gap-2 px-2 pb-2 pt-1">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </span>
          <span className="ml-2 truncate font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/45">{label}</span>
        </div>
      )}
      <div className="visual-frame-inner">
        {/* Full composition */}
        <div className={mobileCrop ? "hidden md:block" : ""}>
          <motion.div style={{ scale }}>
            <Image
              src={asset.src}
              alt={asset.alt}
              width={asset.width}
              height={asset.height}
              sizes={sizes}
              priority={priority}
              className="h-auto w-full select-none"
              draggable={false}
            />
          </motion.div>
        </div>
        {/* Mobile detail crop */}
        {mobileCrop && (
          <div className="relative md:hidden" style={{ aspectRatio: mobileCrop.aspect }}>
            <Image
              src={asset.src}
              alt={asset.alt}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: mobileCrop.position }}
            />
          </div>
        )}
        {children}
        {expandable && <ExpandButton onClick={lb.show} label={mobileCrop ? "View full visual" : "Expand"} />}
      </div>
      {expandable && <Lightbox asset={asset} open={lb.open} onClose={lb.hide} />}
    </motion.div>
  );
}
