"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function DashboardMotion({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { duration: 0.72, ease: "power3.out" }
        });

        tl.from("[data-dashboard-intro] > *", {
          autoAlpha: 0,
          y: 18,
          stagger: 0.08
        })
          .from(
            "[data-dashboard-action]",
            {
              autoAlpha: 0,
              y: 14,
              scale: 0.96
            },
            "-=0.42"
          )
          .from(
            "[data-dashboard-hero]",
            {
              autoAlpha: 0,
              y: 24,
              scale: 0.985,
              duration: 0.86
            },
            "-=0.34"
          )
          .from(
            "[data-dashboard-metric]",
            {
              autoAlpha: 0,
              y: 18,
              scale: 0.96,
              stagger: 0.08
            },
            "-=0.46"
          )
          .from(
            "[data-dashboard-stat]",
            {
              autoAlpha: 0,
              y: 20,
              scale: 0.97,
              stagger: 0.055
            },
            "-=0.36"
          )
          .from(
            "[data-dashboard-panel]",
            {
              autoAlpha: 0,
              y: 18,
              stagger: 0.08
            },
            "-=0.24"
          )
          .from(
            "[data-dashboard-row]",
            {
              autoAlpha: 0,
              x: -12,
              stagger: 0.045
            },
            "-=0.36"
          );

        gsap.fromTo(
          "[data-dashboard-progress]",
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            delay: 0.65
          }
        );

        gsap.to("[data-dashboard-float]", {
          y: -7,
          duration: 3.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.18, from: "center" }
        });
      });

      return () => mm.revert();
    },
    { scope: scopeRef }
  );

  return (
    <div ref={scopeRef} className="dashboard-motion-root space-y-8">
      {children}
    </div>
  );
}
