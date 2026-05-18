"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Native select with a custom chevron rendered via a CSS background SVG.
 * No DOM wrapper, so width / className passed by callers behaves exactly
 * like a vanilla `<select>` — important for dense tables that constrain
 * cell widths (e.g. EnvelopeElementTable).
 *
 * The chevron color uses the muted-foreground token so it adapts to dark mode.
 */
const CHEVRON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.04l3.71-3.81a.75.75 0 111.08 1.04l-4.25 4.36a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, style, children, ...props }, ref) => (
  <select
    ref={ref}
    style={{
      backgroundImage: `url("${CHEVRON}")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 0.55rem center",
      backgroundSize: "1rem 1rem",
      ...style,
    }}
    className={cn(
      "appearance-none flex h-9 w-full rounded-md border border-input bg-background pl-3 pr-8 py-1 text-sm shadow-sm transition-[box-shadow,border-color] duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
