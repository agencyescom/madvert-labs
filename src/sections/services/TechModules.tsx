import { Glyph, type IconName } from "@/components/ui/Icon3D";

const modules: { key: string; title: string; label: string; icon: IconName; art: "web" | "mobile" | "dash" | "calc" | "portal" | "internal" | "integrations" | "ai" }[] = [
  { key: "web-apps", label: "Web Apps", title: "When a Website Needs to Do More Than Display Information.", icon: "webApps", art: "web" },
  { key: "mobile-apps", label: "Mobile Apps", title: "Put the Useful Part of the Business in Their Pocket.", icon: "mobileApps", art: "mobile" },
  { key: "dashboards", label: "Dashboards", title: "The Numbers Exist. The Problem Is Usually That Nobody Can See Them Together.", icon: "analytics", art: "dash" },
  { key: "calculators", label: "Calculators", title: "Let the Customer Calculate Before the Sales Call.", icon: "systems", art: "calc" },
  { key: "portals", label: "Portals", title: "Customers Should Not Need to Message Your Team for Every Update.", icon: "crm", art: "portal" },
  { key: "internal-tools", label: "Internal Tools", title: "The Best Software May Never Be Seen by a Customer.", icon: "development", art: "internal" },
  { key: "integrations", label: "Integrations", title: "Your Software Should Talk to Each Other.", icon: "systems", art: "integrations" },
  { key: "ai-tools", label: "AI Tools", title: "Some Repetitive Work Is Simply Waiting to Be Automated.", icon: "aiAgents", art: "ai" },
];

function Art({ kind }: { kind: (typeof modules)[number]["art"] }) {
  const line = "var(--line-strong)";
  const soft = "var(--line)";
  const c = "#00e5ff";
  return (
    <svg viewBox="0 0 240 130" className="h-auto w-full" aria-hidden="true">
      {kind === "web" && (
        <>
          <rect x="10" y="10" width="220" height="110" rx="10" fill="none" stroke={line} />
          <rect x="10" y="10" width="220" height="18" rx="10" fill={soft} />
          <rect x="22" y="40" width="54" height="68" rx="6" fill={soft} />
          <rect x="86" y="40" width="132" height="30" rx="6" fill="none" stroke={c} />
          <rect x="86" y="78" width="62" height="30" rx="6" fill={soft} />
          <rect x="156" y="78" width="62" height="30" rx="6" fill={soft} />
        </>
      )}
      {kind === "mobile" && (
        <>
          <rect x="88" y="6" width="64" height="118" rx="12" fill="none" stroke={line} />
          <rect x="98" y="22" width="44" height="26" rx="5" fill="none" stroke={c} />
          <rect x="98" y="56" width="44" height="8" rx="4" fill={soft} />
          <rect x="98" y="70" width="30" height="8" rx="4" fill={soft} />
          <circle cx="120" cy="108" r="5" fill={c} />
        </>
      )}
      {kind === "dash" && (
        <>
          {[20, 90, 160].map((x) => (
            <rect key={x} x={x} y="12" width="60" height="30" rx="6" fill={soft} />
          ))}
          <path d="M20 112 L60 90 L100 98 L140 66 L180 72 L220 48" fill="none" stroke={c} strokeWidth="2" />
          <line x1="20" x2="220" y1="118" y2="118" stroke={line} />
        </>
      )}
      {kind === "calc" && (
        <>
          <rect x="60" y="8" width="120" height="114" rx="12" fill="none" stroke={line} />
          <rect x="72" y="20" width="96" height="24" rx="6" fill="none" stroke={c} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((k) => <rect key={`${r}${k}`} x={72 + k * 34} y={52 + r * 22} width="28" height="16" rx="4" fill={soft} />),
          )}
        </>
      )}
      {kind === "portal" && (
        <>
          <rect x="10" y="10" width="60" height="110" rx="8" fill={soft} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="82" y={14 + i * 36} width="148" height="28" rx="6" fill="none" stroke={i === 0 ? c : line} />
              <circle cx="96" cy={28 + i * 36} r="5" fill={i === 0 ? c : soft} />
            </g>
          ))}
        </>
      )}
      {kind === "internal" && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="20" y={14 + i * 27} width="200" height="20" rx="5" fill={i === 1 ? "rgb(0 200 255 / .12)" : soft} />
              <rect x="190" y={19 + i * 27} width="22" height="10" rx="5" fill={i === 1 ? c : line} />
            </g>
          ))}
        </>
      )}
      {kind === "integrations" && (
        <>
          {[
            [40, 30],
            [40, 100],
            [200, 30],
            [200, 100],
          ].map(([x, y]) => (
            <g key={`${x}${y}`}>
              <path d={`M${x} ${y} C ${x < 120 ? 90 : 150} ${y}, ${x < 120 ? 90 : 150} 65, 120 65`} fill="none" stroke={c} strokeWidth="1.5" />
              <rect x={x - 18} y={y - 12} width="36" height="24" rx="6" fill="var(--surface)" stroke={line} />
            </g>
          ))}
          <circle cx="120" cy="65" r="14" fill="var(--surface)" stroke={c} />
          <circle cx="120" cy="65" r="5" fill={c} />
        </>
      )}
      {kind === "ai" && (
        <>
          <rect x="20" y="14" width="130" height="22" rx="11" fill={soft} />
          <rect x="90" y="46" width="130" height="34" rx="12" fill="none" stroke={c} />
          <rect x="102" y="56" width="90" height="6" rx="3" fill={c} opacity=".6" />
          <rect x="102" y="66" width="60" height="6" rx="3" fill={c} opacity=".35" />
          <rect x="20" y="92" width="200" height="24" rx="12" fill="none" stroke={line} />
        </>
      )}
    </svg>
  );
}

export function TechModules() {
  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {modules.map((m, i) => (
        <li key={m.key} id={m.key} data-reveal style={{ ["--reveal-delay" as string]: (i % 2) * 80 }} className="panel flex flex-col p-7 sm:p-8">
          <div className="rounded-2xl border border-line bg-bg p-4">
            <Art kind={m.art} />
          </div>
          <p className="mt-7 flex items-center gap-3 font-display text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            <Glyph name={m.icon} size={20} />
            {m.label}
          </p>
          <h3 className="t-h3 mt-3">{m.title}</h3>
        </li>
      ))}
    </ul>
  );
}
