"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lightweight info tooltip — no external deps. Hover/focus on desktop,
 * click on touch. Used to explain technical terms like safety margin,
 * U-value, ACH, SHGC, sensible vs latent, etc.
 */
export function TooltipInfo({
  label,
  className,
  side = "top",
}: {
  label: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <span
      className={cn("group relative inline-flex align-middle", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="More info"
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className="text-muted-foreground/70 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-full"
      >
        <Info className="size-3.5" />
      </button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 left-1/2 -translate-x-1/2 w-[220px] rounded-md bg-popover text-popover-foreground border shadow-card-lg px-3 py-2 text-[11px] leading-relaxed normal-case tracking-normal font-normal",
          "transition-opacity duration-150",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          open ? "opacity-100" : "opacity-0",
        )}
      >
        {label}
      </span>
    </span>
  );
}
