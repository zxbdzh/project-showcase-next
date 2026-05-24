"use client";

import { TechIconColor } from "@/components/shared/tech-icon";

interface TechStackPillsProps {
  name: string;
  icon: string | null;
}

export function TechStackPills({ name, icon }: TechStackPillsProps) {
  return (
    <span className="tech-pill border-border/60 bg-card inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300">
      {icon && <TechIconColor icon={icon} className="size-4 shrink-0" />}
      {name}
    </span>
  );
}
