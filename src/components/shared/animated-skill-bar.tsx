"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { TechIconColor } from "@/components/shared/tech-icon";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface AnimatedSkillBarProps {
  name: string;
  level: number;
  icon: string | null;
}

export function AnimatedSkillBar({ name, level, icon }: AnimatedSkillBarProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="flex items-center gap-4">
      <span className="flex w-36 items-center gap-2 text-sm font-medium">
        {icon && <TechIconColor icon={icon} className="size-4 shrink-0" />}
        {name}
      </span>
      <div className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full">
        <motion.div
          className="skill-bar-fill absolute inset-y-0 left-0 rounded-full"
          initial={reduce ? { width: `${level}%` } : { width: "0%" }}
          animate={inView ? { width: `${level}%` } : undefined}
          transition={{ duration: 1, delay: 0.1, ease: EASE_OUT_EXPO }}
        />
      </div>
      <span className="text-muted-foreground w-8 text-right text-xs">{level}%</span>
    </div>
  );
}
