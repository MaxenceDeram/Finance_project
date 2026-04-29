"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import {
  configureMotionDefaults,
  motionDurations,
  motionEases,
  motionStaggers,
  targetList
} from "@/lib/motion";

gsap.registerPlugin(useGSAP);

type MotionVariant = "auth" | "landing" | "app";

export function MotionScope({
  as: Component = "div",
  variant,
  className,
  children
}: {
  as?: ElementType;
  variant: MotionVariant;
  className?: string;
  children: ReactNode;
}) {
  const scopeRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      configureMotionDefaults();

      const mm = gsap.matchMedia();
      const select = gsap.utils.selector(scopeRef);

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)"
        },
        (context) => {
          const conditions = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };

          if (conditions.reduceMotion) {
            setStaticState(select);
            return;
          }

          if (variant === "auth") {
            animateAuth(select, conditions.isMobile);
            return;
          }

          if (variant === "landing") {
            animateLanding(select, conditions.isMobile);
            return;
          }

          animateApp(select, conditions.isMobile);
        }
      );

      return () => mm.revert();
    },
    {
      dependencies: [variant, pathname],
      revertOnUpdate: true,
      scope: scopeRef
    }
  );

  return (
    <Component
      ref={scopeRef}
      className={cn("motion-scope", className)}
      data-motion-scope={variant}
    >
      {children}
    </Component>
  );
}

function animateAuth(select: gsap.utils.SelectorFunc, isMobile: boolean) {
  const frame = select("[data-motion-auth-frame]");
  const panel = select("[data-motion-auth-panel]");
  const brand = select("[data-motion-brand]");
  const copy = select("[data-motion-copy] > *");
  const cards = select("[data-motion-feature-card]");
  const chips = select("[data-motion-chip]");
  const formCard = select("[data-motion-form-card]");
  const formItems = select("[data-motion-form-card] [data-motion-field]");
  const tl = gsap.timeline({
    defaults: { ease: motionEases.standard, duration: motionDurations.reveal }
  });

  if (targetList(frame)) {
    tl.from(frame, {
      autoAlpha: 0,
      y: isMobile ? 10 : 18,
      scale: 0.988
    });
  }

  if (targetList(panel)) {
    tl.from(
      panel,
      {
        autoAlpha: 0,
        x: -24,
        scale: 0.99,
        duration: motionDurations.slow
      },
      "-=0.44"
    );
  }

  if (targetList(brand)) {
    tl.from(
      brand,
      {
        autoAlpha: 0,
        y: 12,
        stagger: motionStaggers.base
      },
      "-=0.54"
    );
  }

  if (targetList(copy)) {
    tl.from(
      copy,
      {
        autoAlpha: 0,
        y: 18,
        stagger: motionStaggers.base
      },
      "-=0.42"
    );
  }

  if (targetList(cards)) {
    tl.from(
      cards,
      {
        autoAlpha: 0,
        y: 18,
        scale: 0.97,
        stagger: motionStaggers.base
      },
      "-=0.32"
    );
  }

  if (targetList(chips)) {
    tl.from(
      chips,
      {
        autoAlpha: 0,
        y: 12,
        scale: 0.96,
        stagger: motionStaggers.tight
      },
      "-=0.24"
    );
  }

  if (targetList(formCard)) {
    tl.from(
      formCard,
      {
        autoAlpha: 0,
        x: isMobile ? 0 : 24,
        y: isMobile ? 16 : 0,
        scale: 0.99,
        duration: motionDurations.reveal
      },
      "-=0.86"
    );
  }

  if (targetList(formItems)) {
    tl.from(
      formItems,
      {
        autoAlpha: 0,
        y: 14,
        stagger: motionStaggers.base
      },
      "-=0.34"
    );
  }
}

function animateLanding(select: gsap.utils.SelectorFunc, isMobile: boolean) {
  const nav = select("[data-motion-nav]");
  const hero = select("[data-motion-hero] > *");
  const ctas = select("[data-motion-cta]");
  const preview = select("[data-motion-preview]");
  const cards = select("[data-motion-card]");
  const chips = select("[data-motion-chip]");
  const rows = select("[data-motion-row]");
  const metrics = select("[data-motion-metric]");
  const tl = gsap.timeline({
    defaults: { ease: motionEases.standard, duration: motionDurations.reveal }
  });

  if (targetList(nav)) {
    tl.from(nav, {
      autoAlpha: 0,
      y: -12,
      duration: motionDurations.base
    });
  }

  if (targetList(hero)) {
    tl.from(
      hero,
      {
        autoAlpha: 0,
        y: isMobile ? 14 : 22,
        stagger: motionStaggers.relaxed
      },
      "-=0.24"
    );
  }

  if (targetList(ctas)) {
    tl.from(
      ctas,
      {
        autoAlpha: 0,
        y: 12,
        scale: 0.97,
        stagger: motionStaggers.base
      },
      "-=0.44"
    );
  }

  if (targetList(preview)) {
    tl.from(
      preview,
      {
        autoAlpha: 0,
        y: isMobile ? 18 : 30,
        scale: 0.985,
        duration: motionDurations.slow
      },
      "-=0.7"
    );
  }

  if (targetList(metrics)) {
    tl.from(
      metrics,
      {
        autoAlpha: 0,
        y: 16,
        scale: 0.97,
        stagger: motionStaggers.base
      },
      "-=0.34"
    );
  }

  if (targetList(chips)) {
    tl.from(
      chips,
      {
        autoAlpha: 0,
        y: 10,
        scale: 0.97,
        stagger: motionStaggers.tight
      },
      "-=0.38"
    );
  }

  if (targetList(rows)) {
    tl.from(
      rows,
      {
        autoAlpha: 0,
        x: isMobile ? 0 : -10,
        y: isMobile ? 10 : 0,
        stagger: motionStaggers.base
      },
      "-=0.48"
    );
  }

  if (targetList(cards)) {
    tl.from(
      cards,
      {
        autoAlpha: 0,
        y: 18,
        scale: 0.98,
        stagger: motionStaggers.base
      },
      "-=0.28"
    );
  }
}

function animateApp(select: gsap.utils.SelectorFunc, isMobile: boolean) {
  const header = select("[data-motion-app-header]");
  const navItems = select("[data-motion-nav-item]");
  const intro = select("[data-motion-intro] > *");
  const actions = select("[data-motion-action]");
  const panels = select("[data-motion-panel]");
  const cards = select("[data-motion-card]");
  const rows = select("[data-motion-row]");
  const forms = select("[data-motion-form]");
  const fields = select("[data-motion-field]");
  const progressBars = select("[data-motion-progress]");
  const floatingItems = select("[data-motion-float]");
  const tl = gsap.timeline({
    defaults: { ease: motionEases.standard, duration: motionDurations.reveal }
  });

  if (targetList(header)) {
    tl.from(header, {
      autoAlpha: 0,
      y: -10,
      duration: motionDurations.base
    });
  }

  if (targetList(navItems)) {
    tl.from(
      navItems,
      {
        autoAlpha: 0,
        x: isMobile ? 0 : -10,
        y: isMobile ? 8 : 0,
        stagger: motionStaggers.tight
      },
      "-=0.3"
    );
  }

  if (targetList(intro)) {
    tl.from(
      intro,
      {
        autoAlpha: 0,
        y: isMobile ? 12 : 18,
        stagger: motionStaggers.base
      },
      "-=0.18"
    );
  }

  if (targetList(actions)) {
    tl.from(
      actions,
      {
        autoAlpha: 0,
        y: 12,
        scale: 0.97,
        stagger: motionStaggers.tight
      },
      "-=0.38"
    );
  }

  if (targetList(panels)) {
    tl.from(
      panels,
      {
        autoAlpha: 0,
        y: isMobile ? 14 : 22,
        scale: 0.985,
        stagger: motionStaggers.base
      },
      "-=0.28"
    );
  }

  if (targetList(cards)) {
    tl.from(
      cards,
      {
        autoAlpha: 0,
        y: 16,
        scale: 0.975,
        stagger: motionStaggers.tight
      },
      "-=0.42"
    );
  }

  if (targetList(forms)) {
    tl.from(
      forms,
      {
        autoAlpha: 0,
        y: 18,
        scale: 0.99
      },
      "-=0.3"
    );
  }

  if (targetList(fields)) {
    tl.from(
      fields,
      {
        autoAlpha: 0,
        y: 10,
        stagger: motionStaggers.tight
      },
      "-=0.26"
    );
  }

  if (targetList(rows)) {
    tl.from(
      rows,
      {
        autoAlpha: 0,
        x: isMobile ? 0 : -8,
        y: isMobile ? 10 : 0,
        stagger: motionStaggers.tight
      },
      "-=0.36"
    );
  }

  if (targetList(progressBars)) {
    gsap.fromTo(
      progressBars,
      { scaleX: 0 },
      {
        scaleX: 1,
        transformOrigin: "left center",
        duration: motionDurations.slow,
        ease: motionEases.precise,
        stagger: motionStaggers.base,
        delay: 0.45
      }
    );
  }

  if (targetList(floatingItems)) {
    gsap.to(floatingItems, {
      y: -6,
      duration: 4.2,
      ease: motionEases.soft,
      repeat: -1,
      yoyo: true,
      stagger: { each: 0.16, from: "center" }
    });
  }
}

function setStaticState(select: gsap.utils.SelectorFunc) {
  const targets = [
    ...select("[data-motion-auth-frame]"),
    ...select("[data-motion-auth-panel]"),
    ...select("[data-motion-brand]"),
    ...select("[data-motion-copy] > *"),
    ...select("[data-motion-feature-card]"),
    ...select("[data-motion-chip]"),
    ...select("[data-motion-form-card]"),
    ...select("[data-motion-field]"),
    ...select("[data-motion-nav]"),
    ...select("[data-motion-hero] > *"),
    ...select("[data-motion-cta]"),
    ...select("[data-motion-preview]"),
    ...select("[data-motion-card]"),
    ...select("[data-motion-metric]"),
    ...select("[data-motion-row]"),
    ...select("[data-motion-app-header]"),
    ...select("[data-motion-nav-item]"),
    ...select("[data-motion-intro] > *"),
    ...select("[data-motion-action]"),
    ...select("[data-motion-panel]"),
    ...select("[data-motion-form]"),
    ...select("[data-motion-progress]"),
    ...select("[data-motion-float]")
  ];

  if (targets.length > 0) {
    gsap.set(targets, {
      autoAlpha: 1,
      clearProps: "transform,visibility"
    });
  }
}
