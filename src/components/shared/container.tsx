import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 全站统一最大宽度容器(对齐 Apple 风居中节奏)。 */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1120px] px-6 sm:px-8", className)}>{children}</div>
  );
}
