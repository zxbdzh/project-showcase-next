import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 命令提示符:`$` / `→` 等,等宽、不可选中,用作终端行前缀 */
export function Prompt({ symbol = "$", className }: { symbol?: string; className?: string }) {
  return (
    <span aria-hidden className={cn("text-muted-foreground/70 font-mono select-none", className)}>
      {symbol}
    </span>
  );
}

/**
 * 注释体小节标题:`// 标题`。作为 eyebrow / 小节标记,强化工程母题。
 * 默认渲染为 <p>,可经 as 改语义标签。
 */
export function CommentHeading({
  children,
  className,
  as: Comp = "p" as ElementType,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Comp className={cn("text-muted-foreground font-mono text-sm tracking-tight", className)}>
      <span className="text-brand select-none">{"// "}</span>
      {children}
    </Comp>
  );
}

/** 键盘按键样式,用于 ⌘K 等快捷键提示 */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "border-border bg-muted text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] leading-none",
        className
      )}
    >
      {children}
    </kbd>
  );
}

type DotTone = "emerald" | "amber" | "red" | "muted";

const dotColor: Record<DotTone, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  muted: "bg-muted-foreground",
};

/** 状态点;ping 仅用于「在线/可参与合作」这类单点状态指示(惯例,克制) */
export function StatusDot({
  tone = "emerald",
  ping = false,
  className,
}: {
  tone?: DotTone;
  ping?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative flex size-2", className)}>
      {ping && (
        <span
          className={cn(
            "absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping",
            dotColor[tone]
          )}
        />
      )}
      <span className={cn("relative inline-flex size-2 rounded-full", dotColor[tone])} />
    </span>
  );
}
