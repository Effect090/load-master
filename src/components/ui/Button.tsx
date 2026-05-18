"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "subtle"
  | "link";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const VARIANTS: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/92 active:bg-primary/95",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  subtle:
    "bg-primary/8 text-primary hover:bg-primary/12 dark:bg-primary/15 dark:hover:bg-primary/22",
  link: "text-primary underline-offset-4 hover:underline",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 rounded-md px-3 text-xs gap-1.5",
  md: "h-9 rounded-md px-4 text-sm",
  lg: "h-11 rounded-lg px-6 text-sm",
  icon: "h-9 w-9 rounded-md",
  "icon-sm": "h-8 w-8 rounded-md",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
        "transition-[background-color,box-shadow,transform,opacity] duration-150 ease-out",
        "active:scale-[0.985]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="inline-block size-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin"
        />
      )}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
