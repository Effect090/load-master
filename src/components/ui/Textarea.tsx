"use client";

import { cn } from "@/lib/utils";
import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-cf-muted"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full rounded-2xl border bg-cf-surface",
            "px-4 py-3 text-cf-text placeholder:text-cf-dim",
            "text-[16px] resize-none",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-green-600/40 focus:border-green-600/50",
            error
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-cf-border hover:border-cf-border/80",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-cf-dim">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
