"use client";

import { MotionConfig } from "framer-motion";
import { useEffect } from "react";
import { AnchorScroll } from "./AnchorScroll";
import { BookingProvider } from "./BookingContext";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  // Hydration finished, so Framer Motion is in control of entrance animations.
  // Until this class is set, globals.css forces animated content visible after a short delay —
  // if a script ever fails to load, sections can't stay stuck at opacity 0.
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
  }, []);

  return (
    <ThemeProvider>
      <BookingProvider>
        <MotionConfig reducedMotion="user">
          <AnchorScroll />
          {children}
        </MotionConfig>
      </BookingProvider>
    </ThemeProvider>
  );
}
