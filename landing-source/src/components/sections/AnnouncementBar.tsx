import { ArrowRight } from "lucide-react";
import { BOOK_HREF } from "@/lib/site";

/** Top-of-page headline strip. Lives inside the fixed header and folds away once the visitor scrolls. */
export function AnnouncementBar() {
  return (
    <a
      href={BOOK_HREF}
      className="group relative flex h-[var(--bar-h)] items-center justify-center overflow-hidden bg-[#05080e] px-4 text-center text-white"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,transparent_20%,rgba(0,200,255,0.22)_45%,rgba(0,229,255,0.28)_50%,transparent_75%)] bg-[length:200%_100%] [animation:ml-bar-shine_6s_linear_infinite]"
      />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-grad" />
      <span className="relative line-clamp-2 text-[0.78rem] font-semibold leading-snug sm:text-[0.86rem]">
        <span className="font-extrabold text-[#5fdcff]">Serving the U.S. Market?</span> Turn Your Patch Business Into a Daily Pipeline of
        Qualified Order Opportunities.
        <span className="ml-2 hidden items-center gap-1 font-bold text-[#5fdcff] underline-offset-4 group-hover:underline md:inline-flex">
          Book a call <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </span>
    </a>
  );
}
