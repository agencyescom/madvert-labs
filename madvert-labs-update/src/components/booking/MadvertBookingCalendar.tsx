"use client";

import { useEffect, useId, useRef, useState } from "react";
import { track } from "@/analytics/track";
import { notifyEvent } from "@/analytics/hooks";
import { booking } from "@/lib/site";

let embedLoaded = false;
function loadEmbedScript() {
  if (embedLoaded || typeof document === "undefined") return;
  embedLoaded = true;
  const s = document.createElement("script");
  s.src = booking.embedScript;
  s.async = true;
  document.body.appendChild(s);
}

const BOOKED = /(booking|appointment|event)[\s_-]*(complete|completed|success|confirmed|booked|created|scheduled)/i;

/**
 * The single Madvert booking calendar. Lazy: the widget iframe only mounts when it nears the viewport.
 * Tracks calendar_open once per page view, and calendar_booking_complete when the widget reports it
 * (best effort: the widget's own confirmation is the source of truth for CRM).
 */
export function MadvertBookingCalendar({ context, eager = false }: { context?: string; eager?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(eager);
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const widgetId = booking.url.split("/").pop() ?? "booking";
  const iframeId = `${widgetId}_${reactId}`;
  const booked = useRef(false);

  useEffect(() => {
    if (show) return;
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  useEffect(() => {
    if (!show) return;
    loadEmbedScript();
    track("calendar_open", { context, page: window.location.pathname });
    notifyEvent("calendar_opened", { context });
    const host = new URL(booking.url).hostname;
    const onMessage = (e: MessageEvent) => {
      if (booked.current) return;
      let origin = "";
      try {
        origin = new URL(e.origin).hostname;
      } catch {
        return;
      }
      if (origin !== host && !/(msgsndr|leadconnectorhq|gohighlevel)\.com$/.test(origin)) return;
      const text = typeof e.data === "string" ? e.data : JSON.stringify(e.data ?? "");
      if (!BOOKED.test(text)) return;
      booked.current = true;
      track("calendar_booking_complete", { context, page: window.location.pathname });
      notifyEvent("calendar_booked", { context });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [show, context]);

  return (
    <div ref={wrap} className="relative w-full">
      {show ? (
        <iframe
          id={iframeId}
          src={booking.url}
          title="Book a Business Strategy Call with Madvert Labs"
          className="block min-h-[960px] w-full rounded-[20px] border-0 bg-white sm:min-h-[820px]"
          style={{ width: "100%", border: "none", overflow: "hidden" }}
          loading="lazy"
        />
      ) : (
        <div className="grid min-h-[820px] place-items-center rounded-[20px] bg-white/70 text-[14px] text-[#475569]" aria-hidden="true">
          Loading available times…
        </div>
      )}
    </div>
  );
}
