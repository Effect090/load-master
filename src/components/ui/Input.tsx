"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visual state. "valid"=soft success, "warning"=amber, "error"=destructive. */
  state?: "default" | "valid" | "warning" | "error";
  /** Optional unit suffix shown inside the field (e.g. "m²", "W/m²K"). */
  suffix?: React.ReactNode;
}

const STATE_RING: Record<NonNullable<InputProps["state"]>, string> = {
  default:
    "border-input focus-visible:border-ring focus-visible:ring-ring/40",
  valid:
    "border-success/50 focus-visible:border-success focus-visible:ring-success/30",
  warning:
    "border-warning/50 focus-visible:border-warning focus-visible:ring-warning/30",
  error:
    "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/30",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", state = "default", suffix, ...props }, ref) => {
    const base = (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-[box-shadow,border-color,background-color] duration-150",
          "placeholder:text-muted-foreground/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-60",
          STATE_RING[state],
          suffix && "pr-12",
          className,
        )}
        {...props}
      />
    );

    if (!suffix) return base;
    return (
      <div className="relative">
        {base}
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] font-medium text-muted-foreground/80 tabular-nums">
          {suffix}
        </span>
      </div>
    );
  },
);
Input.displayName = "Input";
