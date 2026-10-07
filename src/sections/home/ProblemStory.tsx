"use client";

import { StickyStory } from "@/components/story/StickyStory";
import { Cta } from "@/components/ui/Button";

const steps = [
  <div key="0" className="space-y-3">
    <p className="t-h2">Clicks rise.</p>
    <p className="t-h2">Forms come in.</p>
    <p className="t-h2">Notifications light up.</p>
  </div>,
  <div key="1">
    <p className="t-small mb-4 uppercase tracking-[0.2em]">Then</p>
    <p className="t-h1">Are these even qualified?</p>
  </div>,
  <div key="2" className="space-y-4">
    <p className="t-h3">Another month passes.</p>
    <ul className="space-y-2.5 text-[17px] text-ink-2">
      <li>The agency shows CPL.</li>
      <li>The designer shows creatives.</li>
      <li>The SEO team shows rankings.</li>
      <li>The website team says traffic looks fine.</li>
    </ul>
  </div>,
  <div key="3">
    <p className="t-h1">Where is the growth?</p>
  </div>,
  <div key="4">
    <p className="t-h2">
      A campaign can perform perfectly inside a system that is <span className="t-grad">quietly leaking money.</span>
    </p>
    <div className="mt-8">
      <Cta href="/contact?intent=growth-systems-audit" track="free_value_click" trackLabel="find_the_leak">
        Find the Leak
      </Cta>
    </div>
  </div>,
];

export function ProblemStory() {
  return <StickyStory steps={steps} stage={(a) => <ProblemStage step={a} />} />;
}

const GREEN = "var(--success)";

function ProblemStage({ step }: { step: number }) {
  const zoomed = step >= 2;
  const pipeline = step >= 3;
  const repaired = step >= 4;
  return (
    <div className="panel relative overflow-hidden p-2 sm:p-3" data-step={step}>
      <svg viewBox="0 0 640 470" className="problem-stage h-auto w-full" role="img" aria-label={stageLabel(step)}>
        <defs>
          <linearGradient id="ps-green" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={GREEN} stopOpacity="0.35" />
            <stop offset="1" stopColor={GREEN} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ps-cyan" x1="0" x2="1">
            <stop offset="0" stopColor="#00b4ff" />
            <stop offset="1" stopColor="#00e5ff" />
          </linearGradient>
        </defs>

        {/* Dashboard */}
        <g
          className="ps-anim"
          style={{
            transform: zoomed ? "translate(24px, 22px) scale(0.52)" : "translate(110px, 70px) scale(1)",
            transformOrigin: "0 0",
          }}
        >
          <rect width="420" height="290" rx="18" fill="var(--surface)" stroke="var(--line-strong)" />
          <text x="22" y="34" fill="var(--ink-3)" fontSize="12" fontFamily="var(--font-display)" letterSpacing="2">
            CAMPAIGN DASHBOARD
          </text>
          {[
            { k: "Clicks", v: "+38%" },
            { k: "Leads", v: "+24%" },
            { k: "CTR", v: "+12%" },
          ].map((t, i) => (
            <g key={t.k} transform={`translate(${22 + i * 130} 52)`}>
              <rect width="118" height="64" rx="12" fill="var(--bg)" stroke="var(--line)" />
              <text x="14" y="24" fill="var(--ink-3)" fontSize="11">
                {t.k}
              </text>
              <text x="14" y="48" fill={GREEN} fontSize="20" fontWeight="700" fontFamily="var(--font-display)">
                {t.v}
              </text>
              {t.k === "Leads" ? (
                <g className="ps-anim" style={{ opacity: step === 1 ? 1 : 0 }}>
                  <circle cx="100" cy="18" r="11" fill="var(--warning)" />
                  <text x="100" y="23" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1a1205">
                    ?
                  </text>
                </g>
              ) : null}
            </g>
          ))}
          <path d="M22 262 L80 236 L130 244 L190 200 L250 206 L310 160 L370 150 L398 128 L398 270 L22 270Z" fill="url(#ps-green)" />
          <path d="M22 262 L80 236 L130 244 L190 200 L250 206 L310 160 L370 150 L398 128" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinejoin="round" />
          {/* notifications */}
          <g className="ps-anim" style={{ opacity: step === 0 ? 1 : 0 }}>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${300 + i * 34} 18)`}>
                <circle r="10" fill={GREEN} className="anim-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                <text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#03140c">
                  {i + 1}
                </text>
              </g>
            ))}
          </g>
        </g>

        {/* Vendor reports */}
        <g className="ps-anim" style={{ opacity: zoomed ? 1 : 0 }}>
          {["CPL looks good", "Creatives approved", "Rankings up", "Traffic looks fine"].map((label, i) => (
            <g key={label} transform={`translate(${268 + (i % 2) * 178} ${22 + Math.floor(i / 2) * 78})`}>
              <rect width="166" height="64" rx="14" fill="var(--surface)" stroke="var(--line)" />
              <circle cx="24" cy="32" r="10" fill="none" stroke={GREEN} strokeWidth="1.8" />
              <path d="M19.5 32.5l3 3 6-6.5" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" />
              <text x="44" y="37" fontSize="13" fill="var(--ink-2)">
                {label}
              </text>
            </g>
          ))}
        </g>

        {/* Phone */}
        <g className="ps-anim" style={{ opacity: zoomed ? 1 : 0, transform: zoomed ? "translate(536px, 196px)" : "translate(536px, 216px)" }}>
          <rect width="78" height="134" rx="16" fill="var(--surface)" stroke="var(--line-strong)" />
          <rect x="30" y="9" width="18" height="4" rx="2" fill="var(--line-strong)" />
          <g transform="translate(39 64)">
            <path
              d="M-9-11c2-1 4 0 5 2l2 4c1 2 0 3-1 4l-2 1c1 3 4 6 7 7l1-2c1-1 2-2 4-1l4 2c2 1 3 3 2 5l-1 3c-1 1-2 2-4 2-10-1-19-10-20-20 0-2 1-3 2-4z"
              fill={repaired ? "#00e5ff" : "var(--node-idle)"}
              className={repaired ? "anim-pulse" : ""}
            />
          </g>
          <text x="39" y="104" textAnchor="middle" fontSize="11" fill={repaired ? "var(--accent-text)" : "var(--ink-3)"}>
            {repaired ? "Ringing" : "0 calls"}
          </text>
        </g>

        {/* Pipeline */}
        <g className="ps-anim" style={{ opacity: pipeline ? 1 : 0 }}>
          {[
            [36, 170, "Leads"],
            [200, 330, "Follow up"],
            [360, 480, "Sales"],
          ].map(([a, b, label]) => (
            <g key={label as string}>
              <rect x={a as number} y="372" width={(b as number) - (a as number)} height="22" rx="11" fill="var(--surface-2)" stroke="var(--line-strong)" />
              <text x={((a as number) + (b as number)) / 2} y="420" textAnchor="middle" fontSize="12" fill="var(--ink-3)">
                {label}
              </text>
            </g>
          ))}
          <g transform="translate(512 358)">
            <rect width="104" height="50" rx="14" fill={repaired ? "rgb(0 200 255 / 0.12)" : "var(--surface)"} stroke={repaired ? "#00e5ff" : "var(--line-strong)"} className="ps-anim" />
            <text x="52" y="31" textAnchor="middle" fontSize="13" fontWeight="600" fill={repaired ? "var(--accent-text)" : "var(--ink-3)"} fontFamily="var(--font-display)">
              Revenue
            </text>
          </g>
          {/* leaks */}
          {!repaired
            ? [185, 345, 496].map((x, i) => (
                <g key={x}>
                  <path d={`M${x - 10} 372 l4 -6 M${x + 6} 395 l5 6`} stroke="var(--danger)" strokeWidth="1.6" opacity="0.7" />
                  <circle cx={x - 120} cy="383" r="6.5" fill="#7dd3fc" className="ps-leak" style={{ ["--leak-x" as string]: "120px", animationDelay: `${i * 0.7}s` }} />
                </g>
              ))
            : null}
          {/* repair ribbon */}
          <path d="M36 383 L512 383" stroke="url(#ps-cyan)" strokeWidth="5" strokeLinecap="round" pathLength={1} className="ps-repair" style={{ strokeDashoffset: repaired ? 0 : 1 }} />
          {repaired
            ? [0, 1, 2, 3].map((i) => <circle key={i} cx="40" cy="383" r="6" fill="#e0fbff" className="ps-flow" style={{ animationDelay: `${i * 0.55}s` }} />)
            : null}
        </g>
      </svg>
    </div>
  );
}

function stageLabel(step: number) {
  return [
    "A campaign dashboard with clicks, leads and click through rate all rising in green.",
    "The leads figure is marked with a question mark: are these leads qualified?",
    "Every vendor reports success while the sales phone shows zero calls.",
    "A pipeline from leads to revenue appears, with leads leaking out between each stage.",
    "A cyan ribbon repairs the pipeline so leads flow through to revenue and the phone rings.",
  ][step];
}
