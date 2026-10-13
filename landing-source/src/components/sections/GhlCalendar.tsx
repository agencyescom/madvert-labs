"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { BOOKING } from "@/lib/site";

const SCRIPT_ID = "ghl-form-embed";

/** GoHighLevel's embed script resizes the iframe for each booking step. Loaded once per page. */
function ensureEmbedScript() {
  if (document.getElementById(SCRIPT_ID)) return;
  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.src = BOOKING.embedScript;
  s.type = "text/javascript";
  s.async = true;
  document.body.appendChild(s);
}

/**
 * The GHL calendar, embedded the way GHL's own embed code does it: an iframe pointing at the
 * booking widget (id = `<calendarId>_<timestamp>`) plus form_embed.js.
 * Bookings are confirmed by GHL itself; this component never reports a booking as made.
 */
export function GhlCalendar() {
  const calendarId = BOOKING.calendarUrl.split("/").pop() || "booking";
  const [frameId] = useState(() => `${calendarId}_${Date.now()}`);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    ensureEmbedScript();
    track("CalendarViewed");
    const t = window.setTimeout(() => setSlow(true), 12000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-line bg-white">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center bg-surface" aria-hidden>
            <span className="flex items-center gap-2 text-sm font-semibold text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading available times…
            </span>
          </div>
        )}
        <iframe
          id={frameId}
          src={BOOKING.calendarUrl}
          title="Book your discovery call with Madvert Labs"
          onLoad={() => setLoaded(true)}
          className="block h-[1080px] w-full border-0 sm:h-[860px]"
          style={{ width: "100%", border: "none", overflow: "hidden" }}
        />
      </div>
      <p className={`mt-3 text-center text-[0.85rem] ${slow && !loaded ? "font-semibold text-fg" : "text-muted"}`}>
        {slow && !loaded ? "The calendar is taking a while to load. " : "Calendar not showing? "}
        <a
          href={BOOKING.calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-accent underline underline-offset-4"
          onClick={() => track("BookCallCTA", { location: "calendar_fallback" })}
        >
          Open booking calendar <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </p>
    </div>
  );
}
