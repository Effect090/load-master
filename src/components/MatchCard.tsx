"use client";

import { useRouter } from "next/navigation";
import { MapPin, Clock, Users, DollarSign, Zap } from "lucide-react";
import { cn, formatMatchDate, SKILL_LEVEL_CONFIG } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Match, Profile } from "@/types";
import { useLang } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n/types";

interface MatchCardProps {
  match: Match & {
    organizer?: Profile;
    participants?: { player?: Profile }[];
  };
  className?: string;
  currentUserId?: string;
}

export function MatchCard({ match, className, currentUserId }: MatchCardProps) {
  const router = useRouter();
  const { t } = useLang();
  const skillConfig = SKILL_LEVEL_CONFIG[match.skill_level];
  const isFull = match.current_players >= match.max_players;
  const isJoined = match.participants?.some((p) => p.player?.id === currentUserId);
  const spotsLeft = match.max_players - match.current_players;

  const spotsLabel = spotsLeft === 1
    ? t("card.spots_left", { n: spotsLeft })
    : t("card.spots_left_plural", { n: spotsLeft });

  const statusBadge = (() => {
    if (match.status === "completed") return { label: t("card.status.completed"), variant: "blue" as const };
    if (match.status === "cancelled") return { label: t("card.status.cancelled"), variant: "red" as const };
    if (isFull) return { label: t("card.status.full"), variant: "gold" as const };
    return { label: spotsLabel, variant: "green" as const };
  })();

  return (
    <div
      onClick={() => router.push(`/matches/${match.id}`)}
      className={cn(
        "bg-cf-surface rounded-2xl border border-cf-border overflow-hidden",
        "cursor-pointer active:scale-[0.99] transition-all duration-200",
        "hover:border-cf-border/80 hover:bg-cf-surface-2",
        className
      )}
    >
      {/* Top accent line */}
      <div
        className={cn(
          "h-0.5 w-full",
          match.status === "completed"
            ? "bg-blue-500/60"
            : isFull
            ? "bg-gold-DEFAULT/60"
            : "bg-green-600/60"
        )}
      />

      <div className="p-4">
        {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-cf-text text-base leading-tight truncate">
              {match.title}
            </h3>
            {match.organizer && (
              <p className="text-xs text-cf-dim mt-0.5">
                {t("card.by")}{" "}
                <span className="text-cf-muted font-medium">
                  @{match.organizer.username}
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant={statusBadge.variant} size="sm">
              {statusBadge.label}
            </Badge>
            {isJoined && (
              <Badge variant="green" size="sm">
                {t("card.joined_badge")}
              </Badge>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2 mb-3">
          <InfoRow
            icon={<Clock className="w-3.5 h-3.5" />}
            value={formatMatchDate(match.date_time, {
              today: t("date.today"),
              tomorrow: t("date.tomorrow"),
            })}
          />
          <InfoRow
            icon={<MapPin className="w-3.5 h-3.5" />}
            value={match.field_name ? `${match.field_name} · ${match.location}` : match.location}
          />
          <div className="flex items-center gap-4">
            <InfoRow
              icon={<Users className="w-3.5 h-3.5" />}
              value={`${match.current_players}/${match.max_players}`}
            />
            <InfoRow
              icon={<Zap className="w-3.5 h-3.5" />}
              value={
                <span className={cn(skillConfig.color)}>
                  {t(skillConfig.labelKey as keyof Translations)}
                </span>
              }
            />
            {match.price_per_player > 0 && (
              <InfoRow
                icon={<DollarSign className="w-3.5 h-3.5" />}
                value={`${match.price_per_player} MAD`}
              />
            )}
          </div>
        </div>

        {/* Players preview */}
        {match.participants && match.participants.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cf-border/50">
            <div className="flex -space-x-2">
              {match.participants.slice(0, 5).map((p, i) =>
                p.player ? (
                  <Avatar
                    key={p.player.id}
                    src={p.player.avatar_url}
                    username={p.player.username}
                    size="xs"
                    className={cn(
                      "border-2 border-cf-surface",
                      `z-[${10 - i}]`
                    )}
                  />
                ) : null
              )}
            </div>
            {match.current_players > 5 && (
              <span className="text-xs text-cf-dim">
                {t("card.more_players", { n: match.current_players - 5 })}
              </span>
            )}
            {/* Player count bar */}
            <div className="flex-1 ml-1">
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isFull ? "bg-gold-DEFAULT" : "bg-green-500"
                  )}
                  style={{
                    width: `${Math.min(
                      100,
                      (match.current_players / match.max_players) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-cf-dim">
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-xs text-cf-muted">{value}</span>
    </div>
  );
}
