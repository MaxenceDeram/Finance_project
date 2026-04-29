import gsap from "gsap";

export const motionDurations = {
  fast: 0.22,
  base: 0.56,
  reveal: 0.72,
  slow: 1.1,
  ambient: 7.5
} as const;

export const motionEases = {
  standard: "power3.out",
  gentle: "power2.out",
  precise: "power4.out",
  soft: "sine.inOut",
  settle: "back.out(1.18)",
  none: "none"
} as const;

export const motionStaggers = {
  tight: 0.035,
  base: 0.065,
  relaxed: 0.095
} as const;

let gsapConfigured = false;

export function configureMotionDefaults() {
  if (gsapConfigured) {
    return;
  }

  gsap.defaults({
    duration: motionDurations.base,
    ease: motionEases.standard,
    overwrite: "auto"
  });

  gsapConfigured = true;
}

export function targetList(targets: Element[] | null | undefined) {
  return targets && targets.length > 0 ? targets : null;
}
