"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, animate } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/motion";

/** 进入视口时数字从 0 滚动到目标值;reduced-motion 直接显示终值 */
export function CountUp({
  value,
  suffix = "",
  duration = 1.2,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [reduce, inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      <span className="tabular-nums">{reduce ? value : n}</span>
      {suffix}
    </span>
  );
}
