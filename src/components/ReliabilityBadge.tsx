"use client";

import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import type { Profile } from "@/types";

type ReliabilityTier = "excellent" | "solid" | "risky" | "new";

export function getReliabilityTier(profile: Pick<Profile, "reliability_score" | "expected_attendance_count" | "shows_up_count">): ReliabilityTier {
  if (profile.expected_attendance_count === 0) return "new";
  if (profile.reliability_score >= 90) return "excellent";
  if (profile.reliability_score >= 75) return "solid";
  return "risky";
}

const TIER_STYLES: Record<ReliabilityTier, { dot: string; text: string; bg: string; border: string }> = {
  excellent: {
    dot:    "bg-green-400",
    text:   "text-green-400",
    bg:     "bg-green-400/10",
    border: "border-green-400/20",
  },
  solid: {
    dot:    "bg-blue-400",
    text:   "text-blue-400",
    bg:     "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  risky: {
    dot:    "bg-orange-400",
    text:   "text-orange-400",
    bg:     "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  new: {
    dot:    "bg-cf-dim",
    text:   "text-cf-dim",
    bg:     "bg-white/5",
    border: "border-cf-border",
  },
};

interface ReliabilityBadgeProps {
  profile: Pick<Profile, "reliability_score" | "expected_attendance_count" | "shows_up_count">;
  size?: "sm" | "md";
  showStats?: boolean;
  className?: string;
}

export function ReliabilityBadge({
  profile,
  size = "md",
  showStats = false,
  className,
}: ReliabilityBadgeProps) {
  const { t } = useLang();
  const tier = getReliabilityTier(profile);
  const style = TIER_STYLES[tier];

  const label =
    tier === "new"
      ? t("reliability.new_player")
      : tier === "excellent"
      ? t("reliability.excellent")
      : tier === "solid"
      ? t("reliability.solid")
      : t("reliability.risky");

  const scoreText =
    tier === "new"
      ? "—"
      : `${Math.round(profile.reliability_score)}%`;

  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold",
          style.bg,
          style.border,
          style.text,
          className
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", style.dot)} />
        {tier === "new" ? label : `${scoreText} · ${label}`}
      </span>
    );
  }

  return (
    <div className={cn("bg-cf-surface border border-cf-border rounded-2xl p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", style.dot)} />
          <span className="text-xs font-bold text-cf-dim uppercase tracking-wider">
            {t("reliability.label")}
          </span>
        </div>
        <span className={cn("text-xl font-black", style.text)}>
          {scoreText}
        </span>
      </div>

      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold",
          style.bg,
          style.border,
          style.text
        )}
      >
        {label}
      </div>

      {showStats && profile.expected_attendance_count > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-cf-border/50">
          <div className="text-center">
            <p className="text-lg font-black text-green-400">{profile.shows_up_count}</p>
            <p className="text-[10px] text-cf-dim font-medium uppercase tracking-wide mt-0.5">
              {t("reliability.shows_up")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-orange-400">
              {profile.expected_attendance_count - profile.shows_up_count}
            </p>
            <p className="text-[10px] text-cf-dim font-medium uppercase tracking-wide mt-0.5">
              {t("reliability.no_shows")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
