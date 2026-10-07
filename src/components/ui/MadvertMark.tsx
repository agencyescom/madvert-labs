/** The Madvert "A" portal with its orb, traced from the client's master icon. Not a redesign. */
export function MadvertMark({
  className = "",
  title,
  orbClassName = "",
}: {
  className?: string;
  title?: string;
  orbClassName?: string;
}) {
  return (
    <svg viewBox="0 0 830 484" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <defs>
        <radialGradient id="mm-orb" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#5ff0ff" />
          <stop offset="0.55" stopColor="#00c8ff" />
          <stop offset="1" stopColor="#008cff" />
        </radialGradient>
      </defs>
      <path d="M323 0h190l317 484H645L416 139 185 484H0z" fill="currentColor" />
      <circle cx="416" cy="364" r="83" fill="url(#mm-orb)" className={orbClassName} />
    </svg>
  );
}
