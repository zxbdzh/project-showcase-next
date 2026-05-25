import { cn } from "@/lib/utils";

/**
 * 工程图纸感细网格底纹,替代浮动光球。绝对定位铺满父容器(父需 relative)。
 * 顶部渐隐遮罩见 globals.css 的 .terminal-grid。
 */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("terminal-grid pointer-events-none absolute inset-0 -z-10", className)}
    />
  );
}
