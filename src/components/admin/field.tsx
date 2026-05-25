import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** 表单字段容器:标签 + 控件 + 提示/错误。无状态,客户端与服务端皆可用。 */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label?: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="text-sm">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-muted-foreground text-xs">{hint}</p>}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
