import { Glyph, type IconName } from "@/components/ui/Icon3D";
import { MadvertMark } from "@/components/ui/MadvertMark";

/** Biggest audience vs right audience. */
export function AudienceFit() {
  const big = Array.from({ length: 64 }, (_, i) => ({ x: 70 + (i % 8) * 22 + ((i * 7) % 5), y: 60 + Math.floor(i / 8) * 22 + ((i * 3) % 6) }));
  const fit = Array.from({ length: 14 }, (_, i) => ({ x: 360 + (i % 4) * 24, y: 110 + Math.floor(i / 4) * 24 }));
  return (
    <div className="panel p-6 sm:p-8">
      <svg viewBox="0 0 520 300" className="h-auto w-full" role="img" aria-label="A large unmatched audience compared with a smaller, well matched audience.">
        {big.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="6" fill="var(--node-idle)" opacity={i % 9 === 0 ? 0.9 : 0.45} />
        ))}
        {fit.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="7" fill="#00e5ff" opacity="0.9" />
        ))}
        <text x="70" y="270" fontSize="13" fill="var(--ink-3)">
          Biggest audience
        </text>
        <text x="360" y="270" fontSize="13" fill="var(--accent-text)">
          Right audience
        </text>
      </svg>
    </div>
  );
}

/** Every touchpoint orbiting one brand. */
export function Touchpoints360() {
  const pts: { label: string; icon: IconName }[] = [
    { label: "Website", icon: "webApps" },
    { label: "Social", icon: "mobileApps" },
    { label: "Ads", icon: "paidMedia" },
    { label: "PR", icon: "seo" },
    { label: "Creative", icon: "studios" },
    { label: "Sales deck", icon: "analytics" },
    { label: "Email", icon: "crm" },
    { label: "Events", icon: "strategy" },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]" role="img" aria-label="Eight touchpoints connected to one brand at the centre.">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="200" cy="200" r="150" fill="none" stroke="var(--line-strong)" strokeDasharray="3 6" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5" pathLength={1} strokeDasharray="0.12 0.88" className="origin-center animate-[radar-sweep_14s_linear_infinite]" />
      </svg>
      <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[28px] border border-[rgb(0_200_255/0.4)] bg-surface shadow-[0_0_40px_-10px_rgb(0_200_255/0.6)]">
        <MadvertMark className="h-8 w-auto text-ink" />
      </div>
      {pts.map((p, i) => {
        const a = (i / pts.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <div key={p.label} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${50 + 37.5 * Math.cos(a)}%`, top: `${50 + 37.5 * Math.sin(a)}%` }}>
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-line-strong bg-surface">
              <Glyph name={p.icon} size={22} />
            </span>
            <span className="mt-1.5 block whitespace-nowrap text-[11.5px] text-ink-3">{p.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Paid stream and organic stream merging into one qualified pipeline. */
export function StreamsMerge() {
  return (
    <div className="panel draw-on-reveal p-6 sm:p-8" data-reveal="fade">
      <svg viewBox="0 0 520 260" className="h-auto w-full" role="img" aria-label="A fast paid stream and a steady organic stream merging into one pipeline.">
        <defs>
          <linearGradient id="sm-g" x1="0" x2="1">
            <stop offset="0" stopColor="#00b4ff" />
            <stop offset="1" stopColor="#00e5ff" />
          </linearGradient>
        </defs>
        <path d="M20 50 C 180 50, 220 130, 330 130 L 500 130" fill="none" stroke="var(--line-strong)" strokeWidth="10" strokeLinecap="round" />
        <path d="M20 210 C 180 210, 220 130, 330 130" fill="none" stroke="var(--line-strong)" strokeWidth="10" strokeLinecap="round" />
        <path d="M20 50 C 180 50, 220 130, 330 130 L 500 130" fill="none" stroke="url(#sm-g)" strokeWidth="3" strokeLinecap="round" pathLength={1} />
        <path d="M20 210 C 180 210, 220 130, 330 130" fill="none" stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" pathLength={1} />
        <path d="M330 130 L 500 130" fill="none" stroke="#bff7ff" strokeWidth="3" className="ribbon-flow" />
        <text x="20" y="30" fontSize="13" fill="var(--ink-2)">
          Paid: speed
        </text>
        <text x="20" y="246" fontSize="13" fill="var(--ink-2)">
          Organic: an asset you own
        </text>
        <text x="500" y="110" textAnchor="end" fontSize="13" fontWeight="600" fill="var(--accent-text)">
          Qualified pipeline
        </text>
      </svg>
    </div>
  );
}

/** Why the cheapest lead becomes the most expensive one. */
export function CheapLeads() {
  const rows = ["No answer.", "Wrong location.", "No budget.", "No intent.", "No fit."];
  return (
    <div className="panel p-6 sm:p-8">
      <p className="t-label">This month’s “cheap” leads</p>
      <ul className="mt-5 divide-y divide-[color:var(--line)]">
        {rows.map((r, i) => (
          <li key={r} data-reveal style={{ ["--reveal-delay" as string]: i * 90 }} className="flex items-center justify-between py-3.5">
            <span className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-surface-2" aria-hidden="true" />
              <span className="text-[15px] text-ink-2">Lead #{String(1041 + i)}</span>
            </span>
            <span className="flex items-center gap-2 text-[14px] text-danger">
              <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {r}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A form that does some of the sales team's work. Non functional illustration. */
export function QualifyingForm() {
  const fields = [
    { label: "Budget", value: "Choose a range" },
    { label: "Location", value: "Where are you based?" },
    { label: "Timeline", value: "When do you want to start?" },
    { label: "Requirement", value: "What do you need?" },
    { label: "Business type", value: "Select your industry" },
  ];
  return (
    <div className="panel p-6 sm:p-8" aria-label="Example of a qualifying enquiry form" role="img">
      <p className="t-label">Example qualifying form</p>
      <div className="mt-5 grid gap-3">
        {fields.map((f, i) => (
          <div key={f.label} data-reveal style={{ ["--reveal-delay" as string]: i * 80 }}>
            <p className="text-[12.5px] font-medium text-ink-2">{f.label}</p>
            <div className="mt-1.5 flex items-center justify-between rounded-xl border border-line bg-bg px-4 py-3 text-[14px] text-ink-3">
              {f.value}
              <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Where discovery happens now. */
export function SearchSurfaces() {
  const s: { label: string; icon: IconName }[] = [
    { label: "Google", icon: "seo" },
    { label: "Maps", icon: "tracking" },
    { label: "AI answers", icon: "aiSearch" },
    { label: "Publications", icon: "webApps" },
    { label: "Social discovery", icon: "mobileApps" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {s.map((x, i) => (
        <li key={x.label} data-reveal style={{ ["--reveal-delay" as string]: i * 70 }} className={`panel flex flex-col items-start gap-4 p-5 ${i === 2 ? "border-[rgb(0_200_255/0.4)]" : ""}`}>
          <Glyph name={x.icon} size={30} />
          <span className="font-display text-[15px] font-semibold">{x.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Hundreds of grey contacts; the sweep finds the qualified ones and they turn cyan. */
export function LeadRadar() {
  const PERIOD = 6;
  const dots = Array.from({ length: 140 }, (_, i) => {
    // deterministic pseudo random placement inside the radar circle
    const a = ((i * 137.508) % 360) * (Math.PI / 180);
    const r = 30 + ((i * 53) % 150);
    const x = 200 + r * Math.cos(a);
    const y = 200 + r * Math.sin(a);
    const deg = (((Math.atan2(y - 200, x - 200) * 180) / Math.PI + 90 + 360) % 360);
    return { x, y, q: i % 9 === 0, delay: (deg / 360) * PERIOD };
  });
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px]" role="img" aria-label="A radar of grey contacts; the qualified few are highlighted in cyan.">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="rd-bg" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#00b4ff" stopOpacity="0.12" />
            <stop offset="1" stopColor="#00b4ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rd-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#00e5ff" stopOpacity="0" />
            <stop offset="1" stopColor="#00e5ff" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="url(#rd-bg)" />
        {[60, 110, 160, 190].map((r) => (
          <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="var(--line-strong)" />
        ))}
        <path d="M200 10 V390 M10 200 H390" stroke="var(--line)" />
        <g className="radar-sweep" style={{ animationDuration: `${PERIOD}s` }}>
          <path d="M200 200 L200 10 A190 190 0 0 1 334 66 Z" fill="url(#rd-sweep)" />
          <path d="M200 200 L334 66" stroke="#00e5ff" strokeWidth="1.5" opacity="0.8" />
        </g>
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x.toFixed(1)}
            cy={d.y.toFixed(1)}
            r={d.q ? 4.2 : 2.6}
            fill="var(--node-idle)"
            className={d.q ? "radar-qualify" : undefined}
            style={d.q ? { animationDelay: `${(d.delay + 0.3).toFixed(2)}s` } : undefined}
          />
        ))}
      </svg>
    </div>
  );
}

export function WhatsAppChat() {
  const msgs = [
    { me: false, t: "Hi, I filled in the form about pricing." },
    { me: true, t: "Thanks for reaching out. Which location are you in?" },
    { me: false, t: "City centre" },
    { me: true, t: "Great, we cover that area. Would Thursday or Friday suit a quick call?" },
    { me: false, t: "Thursday works." },
  ];
  return (
    <div className="panel mx-auto max-w-[420px] overflow-hidden" role="img" aria-label="Example WhatsApp conversation that qualifies a lead and books a call.">
      <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25d366]/15 text-[#25d366]">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.7 0-1.3.7-1.9.9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.1.3.6 1 1.3 1.6.9.8 1.7 1 1.9 1.2.2.1.4.1.5-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.1.1.7-.1 1.3z" />
          </svg>
        </span>
        <div>
          <p className="text-[14px] font-semibold">Your Business</p>
          <p className="text-[11.5px] text-ink-3">Typically replies instantly</p>
        </div>
      </div>
      <ol className="space-y-2.5 p-5">
        {msgs.map((m, i) => (
          <li key={i} data-reveal style={{ ["--reveal-delay" as string]: i * 180 }} className={`flex ${m.me ? "justify-end" : ""}`}>
            <span className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13.5px] ${m.me ? "rounded-br-md bg-[#00b4ff]/15 text-ink" : "rounded-bl-md border border-line bg-surface text-ink-2"}`}>{m.t}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PipelineStages() {
  const stages = ["New", "Qualified", "Booked", "Follow Up", "Proposal", "Closed", "Lost"];
  return (
    <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
      {stages.map((s, i) => (
        <li key={s} data-reveal style={{ ["--reveal-delay" as string]: i * 60 }} className={`rounded-2xl border px-4 py-5 ${s === "Closed" ? "border-[rgb(0_200_255/0.45)] bg-accent-soft" : s === "Lost" ? "border-dashed border-line-strong" : "border-line bg-glass"}`}>
          <span className="font-display text-[11px] font-semibold text-ink-3">0{i + 1}</span>
          <p className="mt-2 font-display text-[15px] font-semibold">{s}</p>
        </li>
      ))}
    </ol>
  );
}

export function SpreadsheetVsCrm() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="panel p-5" aria-label="A spreadsheet with missing information">
        <p className="t-label">Spreadsheet</p>
        <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-[var(--line)] text-[11.5px]">
          {["Name", "Phone", "Status", "Ahmed", "?", "called??", "Sara", "05…", "", "J.", "", "follow up"].map((c, i) => (
            <span key={i} className={`bg-bg px-2 py-1.5 ${i < 3 ? "font-semibold text-ink-2" : "text-ink-3"}`}>
              {c || " "}
            </span>
          ))}
        </div>
      </div>
      <div className="panel border-[rgb(0_200_255/0.35)] p-5" aria-label="A CRM record with source, stage, next action and history">
        <p className="t-label">CRM record</p>
        <dl className="mt-4 space-y-2 text-[12.5px]">
          {[
            ["Source", "Google Ads, Search campaign"],
            ["Stage", "Booked"],
            ["Next action", "Call on Thursday"],
            ["Owner", "Sales team"],
            ["History", "6 touchpoints"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-line pb-2 last:border-0">
              <dt className="text-ink-3">{k}</dt>
              <dd className="text-right text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
