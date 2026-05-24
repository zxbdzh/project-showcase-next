import type { Transition } from "motion/react";

/** Apple 缓动:ease-out expo,统一全站入场与过渡 */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const transitionBase: Transition = {
  duration: 0.8,
  ease: EASE_OUT_EXPO,
};
