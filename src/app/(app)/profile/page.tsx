"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Edit3,
  LogOut,
  MapPin,
  Trophy,
  Zap,
  Users,
  Star,
  ChevronRight,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile, Match } from "@/types";
import { cn, POSITION_LABELS, POSITION_KEYS, getCardTier, CARD_TIER_STYLES, formatMatchDate, SKILL_LEVEL_CONFIG } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import type { Locale, Translations } from "@/lib/i18n/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PlayerCard } from "@/components/PlayerCard";
import { ReliabilityBadge } from "@/components/ReliabilityBadge";

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLang();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myMatches, setMyMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [tab, setTab] = useState<"card" | "stats" | "history">("card");

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) setProfile(profileData);

        // Fetch participations separately for match history
        const { data: participations } = await supabase
          .from("match_participants")
          .select("match_id")
          .eq("player_id", user.id);

        const participatedMatchIds = (participations ?? []).map((p) => p.match_id);

        if (participatedMatchIds.length > 0) {
          const { data: participatedMatches } = await supabase
            .from("matches")
            .select("*, organizer:profiles!matches_organizer_id_fkey(*)")
            .in("id", participatedMatchIds)
            .order("date_time", { ascending: false })
            .limit(10);
          setMyMatches((participatedMatches as unknown as Match[]) ?? []);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) return <ProfileSkeleton />;
  if (!profile) return null;

  const tier = getCardTier(Math.round(profile.overall_rating));
  const tierStyle = CARD_TIER_STYLES[tier];

  return (
    <div className="page-content pb-6">
      {/* Header hero */}
      <div
        className="relative px-4 pt-12 pb-6"
        style={{
          background: "linear-gradient(to bottom, #0a1f14 0%, #07090F 100%)",
        }}
      >
        {/* Decorative pitch lines */}
        <div className="absolute inset-0 pitch-bg opacity-30" />
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#07090F] to-transparent" />

        {/* Settings btn */}
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full glass-dark border border-cf-border flex items-center justify-center text-cf-muted"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Settings dropdown */}
        {showSettings && (
          <div className="absolute top-16 right-4 z-20 bg-cf-surface border border-cf-border rounded-2xl shadow-card-shadow overflow-hidden w-48">
            <button
              onClick={() => router.push("/profile/edit")}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-cf-text hover:bg-cf-surface-2 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-cf-dim" /> {t("profile.settings.edit")}
            </button>
            <div className="h-px bg-cf-border" />
            <div className="h-px bg-cf-border" />
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-cf-dim font-medium">{t("lang.label")}</span>
              <div className="flex gap-1">
                {(["fr-darija", "fr"] as Locale[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-semibold transition-all",
                      locale === l
                        ? "bg-green-600/20 text-green-400 border border-green-600/30"
                        : "text-cf-dim hover:text-cf-muted"
                    )}
                  >
                    {l === "fr-darija" ? "FR · Darija" : "FR"}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-px bg-cf-border" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <LogOut className="w-4 h-4" /> {t("profile.settings.signout")}
            </button>
          </div>
        )}

        {/* Avatar + basic info */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <Avatar
            src={profile.avatar_url}
            username={profile.username}
            size="2xl"
            ring
            ringColor={tier === "gold" || tier === "elite" ? "gold" : "green"}
            className="mb-4"
          />
          <h1 className="text-2xl font-black text-white">
            {profile.full_name ?? profile.username}
          </h1>
          <p className="text-cf-muted text-sm">@{profile.username}</p>

          <div className="flex items-center gap-2 mt-2">
            {profile.position && (
              <Badge variant="green" size="sm">
                {profile.position} · {t(POSITION_KEYS[profile.position as keyof typeof POSITION_KEYS] as keyof Translations)}
              </Badge>
            )}
            {profile.preferred_foot && (
              <Badge variant="default" size="sm">
                {profile.preferred_foot === "both"
                  ? t("profile.foot.both")
                  : profile.preferred_foot === "left"
                  ? t("profile.foot.left")
                  : t("profile.foot.right")}
              </Badge>
            )}
          </div>

          {profile.neighborhood && (
            <div className="flex items-center gap-1 mt-2 text-cf-dim text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.neighborhood}, Casablanca</span>
            </div>
          )}

          {profile.bio && (
            <p className="text-cf-muted text-sm mt-3 max-w-[280px] leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Reliability inline badge */}
          <div className="mt-3">
            <ReliabilityBadge profile={profile} size="sm" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mt-5">
          <MiniStat
            icon={<Trophy className="w-4 h-4 text-gold-DEFAULT" />}
            label={t("profile.stat.matches")}
            value={profile.matches_played}
          />
          <MiniStat
            icon={<Star className="w-4 h-4 text-green-400" />}
            label={t("profile.stat.overall")}
            value={Math.round(profile.overall_rating)}
            accent
            accentClass={tierStyle.text}
          />
          <MiniStat
            icon={<Users className="w-4 h-4 text-blue-400" />}
            label={t("profile.stat.evals")}
            value={profile.total_ratings_received}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="flex gap-1 p-1 bg-cf-surface rounded-2xl border border-cf-border mb-5">
          {(["card", "stats", "history"] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={cn(
                "flex-1 h-9 rounded-xl text-sm font-semibold capitalize transition-all duration-200",
                tab === tabKey
                  ? "bg-green-600/20 text-green-400 border border-green-600/30"
                  : "text-cf-dim hover:text-cf-muted"
              )}
            >
              {tabKey === "card" ? t("profile.tab.card") : tabKey === "stats" ? t("profile.tab.stats") : t("profile.tab.history")}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "card" && (
          <div className="flex justify-center py-4">
            <PlayerCard profile={profile} size="full" />
          </div>
        )}

        {tab === "stats" && <StatsTab profile={profile} />}

        {tab === "history" && (
          <HistoryTab matches={myMatches} onMatchClick={(id) => router.push(`/matches/${id}`)} />
        )}
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  accent,
  accentClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
  accentClass?: string;
}) {
  return (
    <div className="bg-cf-surface/60 border border-cf-border rounded-xl px-2 py-3 flex flex-col items-center gap-1 backdrop-blur-sm">
      {icon}
      <span className={cn("text-xl font-black", accent ? accentClass : "text-white")}>
        {value}
      </span>
      <span className="text-[10px] text-cf-dim font-medium tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}

function StatsTab({ profile }: { profile: Profile }) {
  const { t } = useLang();
  const stats = [
    { label: t("stat.pace"),      value: Math.round(profile.stat_pace),      icon: "⚡", color: "bg-blue-500"   },
    { label: t("stat.shooting"),  value: Math.round(profile.stat_shooting),  icon: "⚽", color: "bg-orange-500" },
    { label: t("stat.passing"),   value: Math.round(profile.stat_passing),   icon: "👁️", color: "bg-green-500"  },
    { label: t("stat.dribbling"), value: Math.round(profile.stat_dribbling), icon: "🔄", color: "bg-purple-500" },
    { label: t("stat.defense"),   value: Math.round(profile.stat_defense),   icon: "🛡️", color: "bg-red-500"    },
    { label: t("stat.physical"),  value: Math.round(profile.stat_physical),  icon: "💪", color: "bg-yellow-500" },
    { label: t("stat.fair_play"), value: Math.round(profile.stat_fair_play), icon: "🤝", color: "bg-teal-500"   },
  ];

  return (
    <div className="space-y-3 pb-4">
      <div className="bg-cf-surface border border-cf-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-cf-dim uppercase tracking-wider font-bold">
              {t("profile.stats.overall_label")}
            </p>
            <p className="text-4xl font-black text-white mt-0.5">
              {Math.round(profile.overall_rating)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-cf-dim">{t("profile.stats.based_on")}</p>
            <p className="text-lg font-bold text-cf-text">{profile.total_ratings_received}</p>
            <p className="text-xs text-cf-dim">{t("profile.stats.ratings_unit")}</p>
          </div>
        </div>

        {profile.total_ratings_received < 3 && (
          <div className="bg-gold-DEFAULT/10 border border-gold-DEFAULT/20 rounded-xl p-3 mb-4">
            <p className="text-xs text-gold-DEFAULT">
              {t("profile.stats.unlock_hint", { n: profile.total_ratings_received })}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {stats.map((stat) => {
            const pct = Math.round(((stat.value - 40) / 59) * 100);
            return (
              <div key={stat.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{stat.icon}</span>
                    <span className="text-sm text-cf-muted font-medium">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", stat.color)}
                    style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reliability */}
      <ReliabilityBadge profile={profile} showStats />

      {/* Position note */}
      {profile.position && (
        <div className="bg-cf-surface border border-cf-border rounded-2xl p-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-400/70" />
          <div>
            <p className="text-sm font-bold text-white">
              {t(POSITION_KEYS[profile.position as keyof typeof POSITION_KEYS] as keyof Translations)}
            </p>
            <p className="text-xs text-cf-dim">{t("profile.stats.community_note")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTab({
  matches,
  onMatchClick,
}: {
  matches: Match[];
  onMatchClick: (id: string) => void;
}) {
  const { t } = useLang();

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center gap-3">
        <span className="text-5xl">📅</span>
        <p className="font-bold text-cf-text">{t("profile.history.empty_title")}</p>
        <p className="text-cf-muted text-sm">{t("profile.history.empty_body")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {matches.map((match) => {
        const statusColor =
          match.status === "completed"
            ? "text-blue-400"
            : match.status === "open"
            ? "text-green-400"
            : "text-cf-dim";
        const skillConfig = SKILL_LEVEL_CONFIG[match.skill_level];

        const statusLabel =
          match.status === "completed" ? t("detail.status.completed")
          : match.status === "open"    ? t("detail.status.open")
          : t("detail.status.cancelled");

        return (
          <button
            key={match.id}
            onClick={() => onMatchClick(match.id)}
            className="w-full bg-cf-surface border border-cf-border rounded-2xl p-4 text-left hover:bg-cf-surface-2 active:scale-[0.99] transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{match.title}</p>
                <p className="text-xs text-cf-dim mt-1">
                  {formatMatchDate(match.date_time, { today: t("date.today"), tomorrow: t("date.tomorrow") })}
                </p>
                <p className="text-xs text-cf-dim">{match.location}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={cn("text-xs font-semibold", statusColor)}>
                  {statusLabel}
                </span>
                <span className={cn("text-[10px] font-medium", skillConfig.color)}>
                  {t(skillConfig.labelKey as keyof Translations)}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-cf-dim" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-80 bg-cf-surface" />
      <div className="px-4 space-y-4 mt-4">
        <div className="h-10 bg-cf-surface rounded-2xl" />
        <div className="h-64 bg-cf-surface rounded-2xl" />
      </div>
    </div>
  );
}
