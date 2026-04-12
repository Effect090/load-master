"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr as frLocale } from "date-fns/locale";
import { X } from "lucide-react";
import { cn, CARD_TIER_STYLES, getAvatarUrl, POSITION_KEYS, getCardTier } from "@/lib/utils";
import { Profile, CardTier, PlayerCardStats, PreferredFoot } from "@/types";
import { useLang } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n/types";

interface PlayerCardProps {
  profile: Profile;
  size?: "compact" | "full";
  className?: string;
  animated?: boolean;
}

const STAT_LABELS: { key: keyof Omit<PlayerCardStats, "overall" | "tier">; label: string }[] = [
  { key: "pace", label: "PAC" },
  { key: "shooting", label: "SHO" },
  { key: "passing", label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defense", label: "DEF" },
  { key: "physical", label: "PHY" },
];

function StatBar({
  value,
  tierStyle,
  compact,
}: {
  value: number;
  tierStyle: typeof CARD_TIER_STYLES[CardTier];
  compact?: boolean;
}) {
  const pct = Math.round(((value - 40) / 59) * 100);
  const clampedPct = Math.max(0, Math.min(100, pct));

  return (
    <div className={cn("stat-bar", compact ? "h-1" : "h-1.5")}>
      <div
        className={cn(
          "stat-bar-fill",
          compact
            ? "bg-gradient-to-r from-current to-current"
            : "bg-gradient-to-r from-green-500 to-green-400"
        )}
        style={{ width: `${clampedPct}%` }}
      />
    </div>
  );
}

export function PlayerCard({
  profile,
  size = "full",
  className,
  animated = true,
}: PlayerCardProps) {
  const overall = Math.round(profile.overall_rating);
  const tier: CardTier = getCardTier(overall);
  const tierStyle = CARD_TIER_STYLES[tier];

  const stats: PlayerCardStats = {
    overall,
    pace: Math.round(profile.stat_pace),
    shooting: Math.round(profile.stat_shooting),
    passing: Math.round(profile.stat_passing),
    dribbling: Math.round(profile.stat_dribbling),
    defense: Math.round(profile.stat_defense),
    physical: Math.round(profile.stat_physical),
    fairPlay: Math.round(profile.stat_fair_play),
    tier,
  };

  if (size === "compact") {
    return (
      <CompactCard
        profile={profile}
        stats={stats}
        tier={tier}
        tierStyle={tierStyle}
        className={className}
      />
    );
  }

  return (
    <FullCard
      profile={profile}
      stats={stats}
      tier={tier}
      tierStyle={tierStyle}
      className={className}
      animated={animated}
    />
  );
}

function localizedFoot(
  foot: PreferredFoot | null,
  t: (key: keyof Translations) => string
): string {
  if (foot === "left") return t("profile.foot.left");
  if (foot === "right") return t("profile.foot.right");
  if (foot === "both") return t("profile.foot.both");
  return "—";
}

function PlayerCardDetailsSheet({
  profile,
  stats,
  tierStyle,
  onClose,
}: {
  profile: Profile;
  stats: PlayerCardStats;
  tierStyle: (typeof CARD_TIER_STYLES)[CardTier];
  onClose: () => void;
}) {
  const { t } = useLang();

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const posKey = profile.position
    ? (POSITION_KEYS[profile.position] as keyof Translations)
    : null;
  const memberSince = format(new Date(profile.created_at), "d MMMM yyyy", {
    locale: frLocale,
  });

  return (
    <>
      <div
        className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-x-0 bottom-0 z-[55] max-h-[88vh] flex flex-col rounded-t-3xl border-t border-cf-border bg-cf-surface shadow-2xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-cf-border/60 flex-shrink-0">
          <div>
            <p className="text-xs font-medium text-cf-dim uppercase tracking-wider">
              {t("player_card.details.title")}
            </p>
            <h2 className="text-lg font-bold text-white mt-0.5 pr-2">
              {profile.full_name ?? profile.username}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cf-surface-2 border border-cf-border flex items-center justify-center text-cf-muted hover:text-white shrink-0"
            aria-label={t("player_card.details.close_aria")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-8 pt-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                tierStyle.text,
                tierStyle.border,
                "bg-white/5"
              )}
            >
              {t(tierStyle.labelKey as keyof Translations)}
            </span>
            <span className="text-2xl font-black tabular-nums">
              <span className={tierStyle.text}>{stats.overall}</span>
              <span className="text-cf-dim text-sm font-bold ml-1">OVR</span>
            </span>
          </div>

          <DetailRow label={t("player_card.details.username")} value={`@${profile.username}`} />
          {posKey && (
            <DetailRow
              label={t("player_card.details.position")}
              value={t(posKey)}
            />
          )}
          <DetailRow
            label={t("player_card.details.foot")}
            value={localizedFoot(profile.preferred_foot, t)}
          />
          <DetailRow
            label={t("profile.stat.matches")}
            value={String(profile.matches_played)}
          />
          <DetailRow
            label={t("profile.stat.evals")}
            value={`${profile.total_ratings_received} ${t("profile.stats.ratings_unit")}`}
          />
          <DetailRow
            label={t("player_card.details.member_since")}
            value={memberSince}
          />

          <div>
            <p className="text-[11px] font-medium text-cf-dim mb-1">
              {t("player_card.details.bio")}
            </p>
            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
              {profile.bio?.trim() ? profile.bio : t("player_card.details.no_bio")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-cf-dim">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

function FullCard({
  profile,
  stats,
  tier,
  tierStyle,
  className,
  animated,
}: {
  profile: Profile;
  stats: PlayerCardStats;
  tier: CardTier;
  tierStyle: typeof CARD_TIER_STYLES[CardTier];
  className?: string;
  animated?: boolean;
}) {
  const { t } = useLang();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const closeDetails = useCallback(() => setDetailsOpen(false), []);
  const avatarUrl = getAvatarUrl(profile.avatar_url, profile.username);

  return (
    <>
      <div
        className={cn(
          "relative w-[260px] select-none cursor-pointer active:scale-[0.99] transition-transform outline-none focus-within:ring-2 focus-within:ring-green-500/40 rounded-3xl",
          animated && "animate-card-reveal",
          className
        )}
        style={{ aspectRatio: "2.5/3.5" }}
        role="button"
        tabIndex={0}
        onClick={() => setDetailsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setDetailsOpen(true);
          }
        }}
        aria-expanded={detailsOpen}
        aria-haspopup="dialog"
        aria-label={t("player_card.details.open_aria")}
      >
      {/* Card body */}
      <div
        className={cn(
          "w-full h-full rounded-3xl border-2 bg-gradient-to-b overflow-hidden",
          tierStyle.border,
          tierStyle.glow,
          tier === "elite"
            ? "from-[#08101E] via-[#050C18] to-[#08101E]"
            : tier === "gold"
            ? "from-[#2A1F08] via-[#1A1305] to-[#2A1F08]"
            : tier === "silver"
            ? "from-[#1E2430] via-[#141B26] to-[#1E2430]"
            : "from-[#3B1F0A] via-[#2A1508] to-[#3B1F0A]"
        )}
      >
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

        {/* Tier shimmer line */}
        <div
          className={cn(
            "absolute top-0 inset-x-0 h-px opacity-60",
            tier === "gold" || tier === "elite"
              ? "bg-gradient-to-r from-transparent via-gold-400 to-transparent"
              : "bg-gradient-to-r from-transparent via-white/20 to-transparent"
          )}
        />

        <div className="relative flex flex-col h-full p-4">
          {/* Top row: overall + position | tier label */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex flex-col items-center leading-none">
              <span
                className={cn("text-5xl font-black leading-none", tierStyle.text)}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {stats.overall}
              </span>
              <span className={cn("text-xs font-bold mt-0.5 tracking-widest uppercase", tierStyle.text)}>
                {profile.position ?? "N/A"}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  tierStyle.text,
                  tierStyle.border,
                  "bg-white/5"
                )}
              >
                {t(tierStyle.labelKey as keyof Translations)}
              </span>
              <span className="text-[10px] text-white/40 tracking-wide">CASAFOOT</span>
            </div>
          </div>

          {/* Player image */}
          <div className="flex-1 flex items-center justify-center my-1">
            <div
              className={cn(
                "w-28 h-28 rounded-full overflow-hidden border-2",
                tierStyle.border,
                "shadow-lg"
              )}
            >
              <Image
                src={avatarUrl}
                alt={profile.username}
                width={112}
                height={112}
                className="object-cover w-full h-full"
                unoptimized={avatarUrl.includes("dicebear")}
              />
            </div>
          </div>

          {/* Player name */}
          <div className="text-center mb-3">
            <p className="text-white font-bold text-sm tracking-wide uppercase truncate">
              {profile.full_name ?? profile.username}
            </p>
            {profile.neighborhood && (
              <p className="text-white/40 text-[10px] tracking-widest mt-0.5">
                {profile.neighborhood}, Casablanca
              </p>
            )}
          </div>

          {/* Divider */}
          <div
            className={cn(
              "h-px w-full mb-3 opacity-30",
              tier === "gold" || tier === "elite"
                ? "bg-gradient-to-r from-transparent via-gold-400 to-transparent"
                : "bg-gradient-to-r from-transparent via-white/30 to-transparent"
            )}
          />

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-2">
            {STAT_LABELS.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className={cn("text-[9px] font-bold tracking-widest", tierStyle.text)}>
                    {label}
                  </span>
                  <span className="text-white text-[11px] font-bold">
                    {stats[key]}
                  </span>
                </div>
                <StatBar value={stats[key] as number} tierStyle={tierStyle} />
              </div>
            ))}
          </div>

          {/* Fair play indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <span className="text-[9px] text-white/30 tracking-widest">FAIR PLAY</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i <= Math.round(((stats.fairPlay - 40) / 59) * 5)
                      ? tier === "gold" || tier === "elite"
                        ? "bg-gold-DEFAULT"
                        : "bg-green-500"
                      : "bg-white/10"
                  )}
                />
              ))}
            </div>
            <span className={cn("text-[9px] font-bold", tierStyle.text)}>
              {stats.fairPlay}
            </span>
          </div>
        </div>
      </div>
    </div>
      {detailsOpen && (
        <PlayerCardDetailsSheet
          profile={profile}
          stats={stats}
          tierStyle={tierStyle}
          onClose={closeDetails}
        />
      )}
    </>
  );
}

function CompactCard({
  profile,
  stats,
  tier,
  tierStyle,
  className,
}: {
  profile: Profile;
  stats: PlayerCardStats;
  tier: CardTier;
  tierStyle: typeof CARD_TIER_STYLES[CardTier];
  className?: string;
}) {
  const { t } = useLang();
  const avatarUrl = getAvatarUrl(profile.avatar_url, profile.username);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl border-2",
        "bg-gradient-to-r",
        tierStyle.border,
        tier === "gold" || tier === "elite"
          ? "from-[#2A1F08]/80 to-[#1A1305]/80"
          : tier === "silver"
          ? "from-[#1E2430]/80 to-[#141B26]/80"
          : "from-[#3B1F0A]/80 to-[#2A1508]/80",
        className
      )}
    >
      {/* Overall */}
      <div className="flex flex-col items-center min-w-[36px]">
        <span className={cn("text-2xl font-black leading-none", tierStyle.text)}>
          {stats.overall}
        </span>
        <span className={cn("text-[8px] font-bold tracking-wider", tierStyle.text)}>
          {profile.position ?? "?"}
        </span>
      </div>

      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-full overflow-hidden border",
          tierStyle.border
        )}
      >
        <Image
          src={avatarUrl}
          alt={profile.username}
          width={40}
          height={40}
          className="object-cover"
          unoptimized={avatarUrl.includes("dicebear")}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">
          {profile.full_name ?? profile.username}
        </p>
        <p className="text-white/40 text-[10px]">
          {profile.neighborhood ?? "Casablanca"}
        </p>
      </div>

      {/* Tier badge */}
      <span
        className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
          tierStyle.text,
          tierStyle.border,
          "bg-white/5"
        )}
      >
        {t(tierStyle.labelKey as keyof Translations)}
      </span>
    </div>
  );
}
