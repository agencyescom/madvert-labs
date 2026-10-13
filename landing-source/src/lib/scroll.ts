/**
 * Smooth in-page scrolling that survives interruptions.
 *
 * Framer Motion briefly restores window.scrollY (an instant scrollTo) whenever it measures a
 * `height: "auto"` animation, which cancels any native smooth scroll in progress. Anchor links
 * through the long middle of the page would stop short. This re-targets until the section is reached.
 */
export function scrollToSection(id: string, { updateHash = true } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const go = () =>
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - pad, behavior: reduce ? "auto" : "smooth" });
  let tries = 0;
  const check = () => {
    const off = Math.abs(el.getBoundingClientRect().top - pad);
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (off > 6 && !atBottom && tries++ < 8) {
      go();
      window.setTimeout(check, 650);
    }
  };
  go();
  window.setTimeout(check, 900);
  if (updateHash && location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
}
