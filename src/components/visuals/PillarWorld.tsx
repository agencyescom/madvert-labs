import { Glyph, Icon3D, type IconName } from "@/components/ui/Icon3D";

/** A small dimensional "world" for a pillar: main icon on a lit platform, orbiting touchpoints, a ribbon arc. */
export function PillarWorld({
  icon,
  satellites,
  tint = "#00b4ff",
  className = "",
}: {
  icon: IconName;
  satellites: IconName[];
  tint?: string;
  className?: string;
}) {
  const pos = [
    { left: "12%", top: "22%" },
    { left: "80%", top: "16%" },
    { left: "84%", top: "70%" },
    { left: "14%", top: "74%" },
  ];
  return (
    <div className={`relative aspect-[5/4] w-full ${className}`} aria-hidden="true">
      <div
        className="absolute inset-[6%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle at 50% 55%, ${tint}38, transparent 65%)` }}
      />
      {/* isometric platform */}
      <div className="absolute inset-x-[14%] bottom-[10%] top-[38%] [perspective:900px]">
        <div
          className="absolute inset-0 rounded-[28px] border border-line-strong"
          style={{
            transform: "rotateX(62deg)",
            background:
              "linear-gradient(var(--grid-line) 1px, transparent 1px) 0 0/28px 28px, linear-gradient(90deg, var(--grid-line) 1px, transparent 1px) 0 0/28px 28px, radial-gradient(circle at 50% 50%, " +
              tint +
              "22, transparent 70%)",
            boxShadow: `0 0 0 1px ${tint}22, 0 40px 80px -40px ${tint}66`,
          }}
        />
      </div>
      <svg viewBox="0 0 500 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`pw-${icon}`} x1="0" x2="1">
            <stop offset="0" stopColor="#00b4ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#00e5ff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#00b4ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M20 330 C 140 360, 180 250, 250 250 S 380 140, 480 70" fill="none" stroke={`url(#pw-${icon})`} strokeWidth="2" />
        <path d="M20 330 C 140 360, 180 250, 250 250 S 380 140, 480 70" fill="none" stroke="#bff7ff" strokeWidth="2.5" className="ribbon-flow" opacity="0.6" />
        <g stroke="var(--line-strong)" strokeDasharray="2 5" fill="none">
          <path d="M250 200 L 90 100" />
          <path d="M250 200 L 410 80" />
          <path d="M250 200 L 425 290" />
          <path d="M250 200 L 90 300" />
        </g>
      </svg>
      <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 anim-drift">
        <Icon3D name={icon} size="xl" glow />
      </div>
      {satellites.map((s, i) => (
        <div key={s} className="absolute -translate-x-1/2 -translate-y-1/2" style={pos[i]}>
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line-strong bg-surface shadow-[0_14px_30px_-18px_rgb(0_0_0/0.7)]">
            <Glyph name={s} size={26} />
          </span>
        </div>
      ))}
    </div>
  );
}
