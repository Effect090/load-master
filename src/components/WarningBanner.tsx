"use client";

import * as React from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function WarningBanner({ warnings }: { warnings: string[] }) {
  const [open, setOpen] = React.useState(true);
  if (!warnings.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-warning/30 bg-warning/8 text-foreground overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-warning/12 transition-colors"
      >
        <span className="size-7 rounded-md bg-warning/15 text-warning grid place-items-center shrink-0">
          <AlertTriangle className="size-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {warnings.length} engineering warning
            {warnings.length > 1 ? "s" : ""}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Review these notes before relying on the calculation for sizing.
          </p>
        </div>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-warning/20"
          >
            <ul className="px-4 py-3 text-xs text-foreground/85 list-disc pl-9 space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="leading-relaxed">
                  {w}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
