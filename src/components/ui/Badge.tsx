import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "outline"
  | "muted"
  | "warning"
  | "success"
  | "destructive"
  | "info";

const VARIANTS: Record<Variant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  outline: "border bg-transparent text-foreground",
  muted: "bg-muted text-muted-foreground border-transparent",
  warning: "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning",
  success: "bg-success/12 text-success border-success/25",
  destructive: "bg-destructive/12 text-destructive border-destructive/25",
  info: "bg-info/12 text-info border-info/25",
};

export function Badge({
  className,
  variant = "default",
  dot,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant; dot?: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-tight",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "destructive" && "bg-destructive",
            variant === "info" && "bg-info",
            variant === "default" && "bg-primary",
            (variant === "outline" || variant === "muted") && "bg-muted-foreground",
          )}
        />
      )}
      {children}
    </div>
  );
}
