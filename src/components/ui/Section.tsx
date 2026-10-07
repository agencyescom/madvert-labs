import type { ReactNode } from "react";

export function Eyebrow({ children, className = "", index }: { children: ReactNode; className?: string; index?: string }) {
  return (
    <p className={`t-eyebrow flex items-center gap-3 ${className}`}>
      {index ? <span className="text-ink-3">{index}</span> : null}
      <span aria-hidden="true" className="h-px w-8 bg-[linear-gradient(90deg,var(--accent),var(--cyan))]" />
      <span>{children}</span>
    </p>
  );
}

/** Splits "Sentence one. Sentence two." headlines so the final sentence carries the accent gradient. */
export function AccentHeadline({
  text,
  as: Tag = "h2",
  className = "t-h1",
  accent = "last",
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  accent?: "last" | "none";
}) {
  const parts = text.match(/[^.?!]+[.?!]+["”]?\s*/g) ?? [text];
  if (accent === "none" || parts.length < 2) return <Tag className={className}>{text}</Tag>;
  const head = parts.slice(0, -1).join("");
  const tail = parts[parts.length - 1];
  return (
    <Tag className={className}>
      {head}
      <span className="t-grad">{tail.trim()}</span>
    </Tag>
  );
}

export function SectionIntro({
  eyebrow,
  index,
  title,
  lead,
  align = "left",
  as = "h2",
  className = "",
  titleClassName = "t-h1",
}: {
  eyebrow?: string;
  index?: string;
  title: string;
  lead?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
  titleClassName?: string;
}) {
  const center = align === "center";
  return (
    <div className={`${center ? "mx-auto text-center [&_.t-eyebrow]:justify-center" : ""} max-w-[820px] ${className}`}>
      {eyebrow ? (
        <div data-reveal className="mb-6">
          <Eyebrow index={index}>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <div data-reveal style={{ ["--reveal-delay" as string]: 60 }}>
        <AccentHeadline text={title} as={as} className={titleClassName} />
      </div>
      {lead ? (
        <div data-reveal style={{ ["--reveal-delay" as string]: 140 }} className={`t-lead mt-6 ${center ? "mx-auto" : ""} measure`}>
          {lead}
        </div>
      ) : null}
    </div>
  );
}

export function Placeholder({ label, className = "", children }: { label: string; className?: string; children?: ReactNode }) {
  return (
    <div className={`placeholder-slot grid place-items-center p-6 text-center ${className}`}>
      <div>
        {children}
        <p className="t-label !text-[10.5px]">{label}</p>
      </div>
    </div>
  );
}
