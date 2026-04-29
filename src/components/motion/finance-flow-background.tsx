"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  configureMotionDefaults,
  motionDurations,
  motionEases,
  motionStaggers
} from "@/lib/motion";

gsap.registerPlugin(useGSAP);

const marketBars = [34, 52, 42, 68, 48, 76, 58, 88, 54, 70, 46, 62];

export function FinanceFlowBackground() {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      configureMotionDefaults();

      const mm = gsap.matchMedia();
      const select = gsap.utils.selector(scopeRef);

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          reduceMotion: "(prefers-reduced-motion: reduce)"
        },
        (context) => {
          const conditions = context.conditions as {
            isDesktop: boolean;
            reduceMotion: boolean;
          };
          const lines = select("[data-finance-line]") as unknown as SVGPathElement[];
          const pulses = select("[data-finance-pulse]");
          const bars = select("[data-finance-bar]");

          if (!conditions.isDesktop || conditions.reduceMotion) {
            gsap.set([...lines, ...pulses, ...bars], { autoAlpha: 0.42 });
            return;
          }

          for (const line of lines) {
            const length = line.getTotalLength();
            gsap.set(line, {
              strokeDasharray: length,
              strokeDashoffset: length,
              autoAlpha: 0.18
            });
          }

          gsap.to(lines, {
            strokeDashoffset: 0,
            autoAlpha: 0.64,
            duration: motionDurations.ambient,
            ease: motionEases.none,
            repeat: -1,
            repeatDelay: 1.6,
            stagger: 1.1
          });

          gsap.fromTo(
            pulses,
            { x: -70, autoAlpha: 0 },
            {
              x: 720,
              autoAlpha: 0.72,
              duration: 8.8,
              ease: motionEases.none,
              repeat: -1,
              stagger: 1.5
            }
          );

          gsap.to(bars, {
            scaleY: () => gsap.utils.random(0.46, 1.12),
            autoAlpha: () => gsap.utils.random(0.2, 0.52),
            transformOrigin: "center bottom",
            duration: 2.8,
            ease: motionEases.soft,
            repeat: -1,
            yoyo: true,
            stagger: motionStaggers.tight
          });
        }
      );

      return () => mm.revert();
    },
    { scope: scopeRef }
  );

  return (
    <div
      ref={scopeRef}
      aria-hidden="true"
      className="finance-flow-background pointer-events-none absolute inset-0"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 720 720"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="finance-line-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0" />
            <stop offset="42%" stopColor="#c7d2fe" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
          </linearGradient>
          <filter id="finance-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          data-finance-line
          d="M-20 142 C 100 116, 150 190, 245 170 S 405 84, 522 124 S 640 198, 740 154"
          fill="none"
          stroke="url(#finance-line-gradient)"
          strokeWidth="1.35"
          filter="url(#finance-glow)"
        />
        <path
          data-finance-line
          d="M-40 336 C 90 302, 158 360, 262 324 S 420 245, 528 292 S 642 385, 760 322"
          fill="none"
          stroke="url(#finance-line-gradient)"
          strokeWidth="1"
        />
        <path
          data-finance-line
          d="M-20 512 C 76 476, 152 534, 246 496 S 402 426, 540 466 S 642 548, 750 494"
          fill="none"
          stroke="url(#finance-line-gradient)"
          strokeWidth="1.15"
        />

        <g fill="#e0f2fe" filter="url(#finance-glow)">
          <circle data-finance-pulse cx="92" cy="142" r="2.8" />
          <circle data-finance-pulse cx="168" cy="336" r="2.3" />
          <circle data-finance-pulse cx="120" cy="512" r="2.6" />
        </g>

        <g transform="translate(462 562)" fill="#a5b4fc">
          {marketBars.map((height, index) => (
            <rect
              key={`${height}-${index}`}
              data-finance-bar
              x={index * 15}
              y={-height}
              width="4"
              height={height}
              rx="2"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
