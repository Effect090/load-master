"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Engineering-style page header. Renders a small eyebrow,
 * a clear title, an optional description, and an actions slot.
 *
 * Used at the top of dashboard / project pages — gives the app
 * a premium SaaS look (Linear / Stripe-ish hierarchy).
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Inline meta items (badges, timestamps) shown under the title. */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex flex-wrap items-start gap-4 justify-between", className)}
    >
      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary/80">
            {eyebrow}
          </span>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
        {meta && (
          <div className="flex flex-wrap items-center gap-2 mt-1">{meta}</div>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
