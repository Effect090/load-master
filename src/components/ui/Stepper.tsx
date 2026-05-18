"use client";

import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperItem {
  id: string;
  label: string;
  href?: string;
}

/**
 * Horizontal step indicator (Stripe-style). Highlights the current step,
 * checks completed ones, and stays compact on mobile.
 */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: StepperItem[];
  current: string;
  className?: string;
}) {
  const idx = Math.max(
    0,
    steps.findIndex((s) => s.id === current),
  );

  return (
    <ol
      className={cn(
        "flex items-center gap-2 overflow-x-auto py-1 -mx-1 px-1 no-scrollbar",
        className,
      )}
      aria-label="Project steps"
    >
      {steps.map((s, i) => {
        const completed = i < idx;
        const active = i === idx;
        const cls = cn(
          "group inline-flex items-center gap-2 rounded-full border px-3 h-8 text-xs font-medium transition-all duration-200 ease-out-expo",
          active && "border-primary/30 bg-primary/8 text-primary shadow-card",
          completed && "border-success/30 bg-success/10 text-success",
          !active && !completed &&
            "border-border text-muted-foreground hover:bg-accent",
        );
        const indicator = (
          <>
            <span
              className={cn(
                "inline-flex size-5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                active && "bg-primary text-primary-foreground",
                completed && "bg-success text-success-foreground",
                !active && !completed && "bg-muted text-muted-foreground",
              )}
            >
              {completed ? <Check className="size-3" /> : i + 1}
            </span>
            <span className="whitespace-nowrap">{s.label}</span>
          </>
        );
        return (
          <li key={s.id} className="flex items-center gap-2 shrink-0">
            {s.href ? (
              <Link href={s.href} className={cls}>
                {indicator}
              </Link>
            ) : (
              <div className={cls}>{indicator}</div>
            )}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "h-px w-6 sm:w-10 transition-colors",
                  i < idx ? "bg-success/40" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
