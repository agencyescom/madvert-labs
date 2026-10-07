import { Cta } from "@/components/ui/Button";
import { MadvertMark } from "@/components/ui/MadvertMark";

export default function NotFound() {
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden pt-[var(--header-h)]">
      <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="container-x relative text-center">
        <MadvertMark className="mx-auto h-12 w-auto text-ink" />
        <p className="t-label mt-10">404</p>
        <h1 className="t-h1 mt-4">
          This route leaks. <span className="t-grad">Let us get you back on track.</span>
        </h1>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Cta href="/">Back to Home</Cta>
          <Cta href="/contact" variant="secondary">
            Talk to Us
          </Cta>
        </div>
      </div>
    </section>
  );
}
