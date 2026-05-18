import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Centered empty state with optional icon, title, description and CTA.
 * Used for "no projects yet", "no zones", etc.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed bg-card/40 p-10 text-center flex flex-col items-center gap-3",
        className,
      )}
    >
      {icon && (
        <div className="size-12 rounded-xl bg-primary/8 text-primary grid place-items-center ring-1 ring-primary/10">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
