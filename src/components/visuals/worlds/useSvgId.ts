import { useId } from "react";

/** useId sanitised for use inside SVG url(#...) references. Unique per rendered instance. */
export function useSvgId(prefix: string) {
  const raw = useId();
  const safe = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  return (name: string) => `${prefix}-${safe}-${name}`;
}
