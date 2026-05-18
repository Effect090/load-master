"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TooltipInfo } from "./TooltipInfo";

type Tone = "default" | "primary" | "warning" | "success" | "info" | "danger";

const TONE: Record<Tone, { ring: string; text: string; iconBg: string; chip: string }> = {
  default: {
    ring: "border-border",
    text: "text-foreground",
    iconBg: "bg-muted text-muted-foreground",
    chip: "bg-muted text-muted-foreground",
  },
  primary: {
    ring: "border-primary/20",
    text: "text-primary",
    iconBg: "bg-primary/10 text-primary",
    chip: "bg-primary/10 text-primary",
  },
  warning: {
    ring: "border-warning/25",
    text: "text-warning",
    iconBg: "bg-warning/12 text-warning",
    chip: "bg-warning/12 text-warning",
  },
  success: {
    ring: "border-success/25",
    text: "text-success",
    iconBg: "bg-success/12 text-success",
    chip: "bg-success/12 text-success",
  },
  info: {
    ring: "border-info/25",
    text: "text-info",
    iconBg: "bg-info/10 text-info",
    chip: "bg-info/10 text-info",
  },
  danger: {
    ring: "border-destructive/25",
    text: "text-destructive",
    iconBg: "bg-destructive/12 text-destructive",
    chip: "bg-destructive/12 text-destructive",
  },
};

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  /** Secondary line — e.g. "12.3 W/m²" or "diversity × (1 + safety)". */
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  /** Optional info tooltip explaining the metric. */
  hint?: React.ReactNode;
  /** Optional small chip under the value, e.g. "+15% safety". */
  chip?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  sub,
  icon,
  tone = "default",
  hint,
  chip,
  className,
}: MetricCardProps) {
  const t = TONE[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative rounded-xl border bg-card shadow-card surface-soft p-4 sm:p-5",
        "transition-[box-shadow,transform,border-color] duration-200 ease-out-expo",
        "hover:shadow-card-lg",
        t.ring,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-lg",
                t.iconBg,
              )}
              aria-hidden
            >
              {icon}
            </span>
          )}
          <div className="flex items-center gap-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground truncate">
              {label}
            </p>
            {hint && <TooltipInfo label={hint} />}
          </div>
        </div>
        {chip && (
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium tabular-nums",
              t.chip,
            )}
          >
            {chip}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={cn("metric-value text-2xl sm:text-[26px]", t.text)}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {unit}
          </span>
        )}
      </div>

      {sub && (
        <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
          {sub}
        </p>
      )}
    </motion.div>
  );
}
