import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type BadgeVariant = "default" | "green" | "gold" | "red" | "blue" | "outline";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-cf-surface-2 text-cf-muted border border-cf-border",
  green: "bg-green-600/20 text-green-400 border border-green-600/30",
  gold: "bg-gold-DEFAULT/20 text-gold-DEFAULT border border-gold-DEFAULT/30",
  red: "bg-red-500/20 text-red-400 border border-red-500/30",
  blue: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  outline: "bg-transparent text-cf-muted border border-cf-border",
};

const sizeClasses = {
  sm: "text-[10px] px-2 py-0.5 rounded-lg font-semibold tracking-wide",
  md: "text-xs px-2.5 py-1 rounded-xl font-semibold tracking-wide",
};

export function Badge({
  children,
  variant = "default",
  className,
  size = "md",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
