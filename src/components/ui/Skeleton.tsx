import * as React from "react";
import { cn } from "@/lib/utils";

/** Shimmering placeholder used in loading states. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/70 relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent",
        "before:animate-[shimmer_1.6s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}
