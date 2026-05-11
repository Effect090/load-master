import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "outline"
  | "muted"
  | "warning"
  | "success"
  | "destructive";

const VARIANTS: Record<Variant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  outline: "border bg-transparent text-foreground",
  muted: "bg-muted text-muted-foreground border-transparent",
  warning: "bg-warning/15 text-warning border-warning/30",
  success: "bg-success/15 text-success border-success/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
