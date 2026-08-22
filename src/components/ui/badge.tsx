import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted";
}) {
  const variants: Record<string, string> = {
    default:
      "bg-primary/15 text-primary border-primary/30",
    success:
      "bg-success/15 text-success border-success/30",
    warning:
      "bg-warning/15 text-warning border-warning/30",
    danger:
      "bg-danger/15 text-danger border-danger/30",
    info:
      "bg-info/15 text-info border-info/30",
    muted:
      "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
