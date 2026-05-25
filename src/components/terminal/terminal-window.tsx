import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 终端窗口外壳:红黄绿信号灯 + 标题栏,可选底部工具栏。
 * 母题核心容器;交互逻辑(打字/输入)由使用方组件实现,此处仅负责样式外壳。
 */
export function TerminalWindow({
  title = "~/portfolio — bash",
  children,
  footer,
  className,
  bodyClassName,
}: {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col overflow-hidden rounded-lg border",
        className
      )}
    >
      {/* 标题栏 */}
      <div className="border-border flex items-center gap-1.5 border-b px-4 py-2.5">
        <span className="size-3 rounded-full bg-red-400/80" />
        <span className="size-3 rounded-full bg-amber-400/80" />
        <span className="size-3 rounded-full bg-emerald-400/80" />
        <span className="text-muted-foreground ml-2 truncate font-mono text-xs">{title}</span>
      </div>

      {/* 主体 */}
      <div className={cn("flex-1", bodyClassName)}>{children}</div>

      {/* 可选底部工具栏 */}
      {footer && <div className="border-border border-t px-4 py-2.5">{footer}</div>}
    </div>
  );
}
