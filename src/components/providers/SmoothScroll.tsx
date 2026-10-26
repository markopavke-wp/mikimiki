"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) return;

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const lenis = new Lenis({
      autoRaf: true,
      // Na telefonu ostavi native touch scroll — pouzdaniji scrub
      smoothWheel: !isCoarse,
      syncTouch: false,
      touchMultiplier: 1.2,
      anchors: true,
    });

    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      window.__lenis = undefined;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
