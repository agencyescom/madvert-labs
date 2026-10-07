"use client";

import type { ReactNode } from "react";
import { useActiveStep } from "@/animations/useActiveStep";

/**
 * Scrollytelling layout: a sticky stage beside (desktop) or above (mobile) a column of steps.
 * No scroll hijacking: the page scrolls normally and the stage reacts to the step in view.
 */
export function StickyStory({
  steps,
  stage,
  stageSide = "right",
  className = "",
  stepClassName = "",
}: {
  steps: ReactNode[];
  stage: (active: number) => ReactNode;
  stageSide?: "left" | "right";
  className?: string;
  stepClassName?: string;
}) {
  const { active, bind } = useActiveStep<HTMLLIElement>(steps.length, 0.5);
  return (
    <div className={`relative grid grid-cols-1 lg:grid-cols-12 lg:gap-12 ${className}`}>
      <div
        className={`sticky top-[var(--header-h)] z-10 -mx-[var(--pad-x)] bg-bg/90 px-[var(--pad-x)] pb-4 pt-2 backdrop-blur-md lg:top-[calc(50vh-min(260px,30vh))] lg:mx-0 lg:h-fit lg:bg-transparent lg:p-0 lg:backdrop-blur-none ${
          stageSide === "right" ? "lg:order-2 lg:col-span-6 lg:col-start-7" : "lg:col-span-6"
        }`}
      >
        <div className="mx-auto max-h-[42vh] max-w-[620px] lg:max-h-none">{stage(active)}</div>
      </div>
      <ol className={`relative lg:col-span-5 ${stageSide === "right" ? "lg:order-1" : "lg:col-start-8"}`}>
        {steps.map((s, i) => (
          <li
            key={i}
            ref={bind(i)}
            aria-current={active === i ? "step" : undefined}
            className={`flex min-h-[62vh] items-center py-10 transition-opacity duration-500 lg:min-h-[78vh] ${
              active === i ? "opacity-100" : "opacity-35"
            } ${stepClassName}`}
          >
            <div className="w-full">{s}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
