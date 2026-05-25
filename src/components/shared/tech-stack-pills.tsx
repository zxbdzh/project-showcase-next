"use client";

import { TechIconColor } from "@/components/shared/tech-icon";

interface TechStackPillsProps {
  name: string;
  icon: string | null;
}

export function TechStackPills({ name, icon }: TechStackPillsProps) {
  return (
    <span className="border-border bg-card hover:border-brand inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm transition-colors">
      {icon && <TechIconColor icon={icon} className="size-4 shrink-0" />}
      {name}
    </span>
  );
}
