"use client";

import * as React from "react";
import { Label } from "./Label";
import { TooltipInfo } from "./TooltipInfo";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  /** Optional explanatory tooltip shown next to the label. */
  tooltip?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps a form control with a Label, optional tooltip, hint and error message.
 *
 * If `htmlFor` is omitted, a stable id is generated via `useId()` and
 * injected into the (single) child element so the Label is correctly
 * associated with the control for screen readers. Existing `id` props
 * on the child are preserved.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  tooltip,
  className,
  children,
}: FieldProps) {
  const autoId = React.useId();
  const id = htmlFor ?? autoId;

  const child = React.Children.toArray(children);
  const decorated = child.map((c, i) => {
    if (i !== 0 || !React.isValidElement(c)) return c;
    const existing = (c.props as { id?: string }).id;
    return React.cloneElement(
      c as React.ReactElement<{
        id?: string;
        "aria-invalid"?: boolean;
        "aria-describedby"?: string;
      }>,
      {
        id: existing ?? id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error || hint ? `${id}-desc` : undefined,
      },
    );
  });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1">
        <Label htmlFor={id}>{label}</Label>
        {tooltip && <TooltipInfo label={tooltip} />}
      </div>
      {decorated}
      {hint && !error && (
        <p
          id={`${id}-desc`}
          className="text-[11px] text-muted-foreground"
        >
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-desc`} className="text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
