import { TechIconColor } from "@/components/shared/tech-icon";

const TOTAL = 20;

/** 终端风 ASCII 方块直方图;无限循环动画已弃用,入场由父级 Stagger 提供 */
export function SkillBar({
  name,
  level,
  icon,
}: {
  name: string;
  level: number;
  icon: string | null;
}) {
  const filled = Math.round((level / 100) * TOTAL);

  return (
    <div className="flex items-center gap-3 font-mono text-sm">
      <span className="flex w-28 shrink-0 items-center gap-2">
        {icon && <TechIconColor icon={icon} className="size-4 shrink-0" />}
        <span className="truncate">{name}</span>
      </span>
      <span className="flex-1 overflow-hidden tracking-tight whitespace-nowrap" aria-hidden>
        <span className="text-brand">{"█".repeat(filled)}</span>
        <span className="text-muted-foreground/25">{"█".repeat(TOTAL - filled)}</span>
      </span>
      <span className="text-muted-foreground w-8 shrink-0 text-right tabular-nums">{level}</span>
    </div>
  );
}
