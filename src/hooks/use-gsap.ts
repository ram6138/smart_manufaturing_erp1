"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useGsapFadeIn<T extends HTMLElement>(options?: {
  delay?: number;
  duration?: number;
  y?: number;
  stagger?: number;
}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: options?.y ?? 24,
        duration: options?.duration ?? 0.8,
        delay: options?.delay ?? 0.1,
        ease: "power3.out",
      });
    }, ref);

    return () => ctx.revert();
  }, [options?.delay, options?.duration, options?.y]);

  return ref;
}

export function useGsapStagger<T extends HTMLElement>(selector: string, options?: {
  delay?: number;
  duration?: number;
  y?: number;
  stagger?: number;
}) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const elements = containerRef.current?.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        gsap.from(elements, {
          opacity: 0,
          y: options?.y ?? 20,
          duration: options?.duration ?? 0.6,
          delay: options?.delay ?? 0.1,
          stagger: options?.stagger ?? 0.08,
          ease: "power2.out",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [selector, options?.delay, options?.duration, options?.y, options?.stagger]);

  return containerRef;
}
