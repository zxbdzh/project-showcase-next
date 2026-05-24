"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** 入场延迟(秒) */
  delay?: number;
  /** 初始下移距离(px) */
  y?: number;
  /** 仅触发一次 */
  once?: boolean;
}

/** 滚动进入视口时淡入 + 上移(苹果缓动)。prefers-reduced-motion 时直接显示。 */
export function FadeIn({ children, className, delay = 0, y = 24, once = true }: FadeInProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
