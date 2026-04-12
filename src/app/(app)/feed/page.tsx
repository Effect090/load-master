"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronRight, Flame, Users, Zap, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile, Match } from "@/types";
import { SKILL_LEVEL_CONFIG, getAvatarUrl, getCardTier, CARD_TIER_STYLES } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { MatchCard } from "@/components/MatchCard";
import { Button } from "@/components/ui/Button";

export default function FeedPage() {
  const router = useRouter();
  const { t } = useLang();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [topPlayers, setTopPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const [profileRes, matchesRes, playersRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase
            .from("matches")
            .select("*, organizer:profiles!matches_organizer_id_fkey(*), participants:match_participants(player:profiles(*))")
            .eq("status", "open")
            .gte("date_time", new Date().toISOString())
            .order("date_time", { ascending: true })
            .limit(4),
          supabase
            .from("profiles")
            .select("*")
            .neq("id", user.id)
            .order("overall_rating", { ascending: false })
            .limit(6),
        ]);

        if (profileRes.data) setProfile(profileRes.data);
        if (matchesRes.data) setUpcomingMatches(matchesRes.data as unknown as Match[]);
        if (playersRes.data) setTopPlayers(playersRes.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Feed load error:", msg);
        setDbError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const tier = profile ? getCardTier(Math.round(profile.overall_rating)) : "bronze";
  const tierStyle = CARD_TIER_STYLES[tier];

  if (loading) return <FeedSkeleton />;

  // Supabase not configured or tables missing — show setup guide
  if (!profile) return <SetupGuide error={dbError} />;

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t("feed.greeting.morning")
    : hour < 18
    ? t("feed.greeting.afternoon")
    : t("feed.greeting.evening");

  return (
    <div className="page-content px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-cf-muted text-sm font-medium">{greeting}</p>
          <h1 className="text-2xl font-black text-white mt-0.5">
            {profile?.full_name?.split(" ")[0] ?? profile?.username ?? "Player"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-cf-surface border border-cf-border flex items-center justify-center text-cf-muted hover:text-cf-text transition-colors">
            <Bell className="w-4.5 h-4.5" />
          </button>
          <Link href="/profile">
            <Avatar
              src={profile?.avatar_url}
              username={profile?.username ?? "u"}
              size="md"
              ring
              ringColor="green"
            />
          </Link>
        </div>
      </div>

      {/* Player card mini banner */}
      <Link href="/profile">
        <div
          className={`relative rounded-2xl border-2 overflow-hidden cursor-pointer active:scale-[0.99] transition-all ${tierStyle.border} ${tierStyle.glow}`}
          style={{
            background:
              tier === "gold"
                ? "linear-gradient(135deg, #2A1F08 0%, #1A1305 100%)"
                : tier === "elite"
                ? "linear-gradient(135deg, #08101E 0%, #040810 100%)"
                : tier === "silver"
                ? "linear-gradient(135deg, #1E2430 0%, #141B26 100%)"
                : "linear-gradient(135deg, #3B1F0A 0%, #2A1508 100%)",
          }}
        >
          {/* Top shimmer */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex items-center gap-4 p-4">
            {/* Overall */}
            <div className="flex flex-col items-center min-w-[56px]">
              <span className={`text-4xl font-black leading-none ${tierStyle.text}`}>
                {Math.round(profile?.overall_rating ?? 50)}
              </span>
              <span className={`text-[10px] font-bold tracking-widest mt-0.5 ${tierStyle.text}`}>
                {profile?.position ?? "N/A"}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-white/10" />

            {/* Stats preview */}
            <div className="flex-1 grid grid-cols-3 gap-x-3 gap-y-1">
              {[
                { label: "PAC", val: profile?.stat_pace },
                { label: "SHO", val: profile?.stat_shooting },
                { label: "PAS", val: profile?.stat_passing },
                { label: "DRI", val: profile?.stat_dribbling },
                { label: "DEF", val: profile?.stat_defense },
                { label: "PHY", val: profile?.stat_physical },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${tierStyle.text}`}>{label}</span>
                  <span className="text-white text-[11px] font-bold">
                    {Math.round(val ?? 50)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tier badge + arrow */}
            <div className="flex flex-col items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierStyle.text} ${tierStyle.border} bg-white/5`}>
                {t(tierStyle.labelKey as keyof Translations)}
              </span>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </div>
        </div>
      </Link>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill
          icon={<Trophy className="w-4 h-4 text-gold-DEFAULT" />}
          label={t("feed.stat.matches")}
          value={profile?.matches_played ?? 0}
        />
        <StatPill
          icon={<Zap className="w-4 h-4 text-green-400" />}
          label={t("feed.stat.rating")}
          value={Math.round(profile?.overall_rating ?? 50)}
        />
        <StatPill
          icon={<Users className="w-4 h-4 text-blue-400" />}
          label={t("feed.stat.evals")}
          value={profile?.total_ratings_received ?? 0}
        />
      </div>

      {/* Open matches */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4.5 h-4.5 text-orange-400" />
            <h2 className="text-base font-bold text-white">{t("feed.open_matches")}</h2>
          </div>
          <Link href="/matches" className="text-xs text-green-400 font-semibold hover:text-green-300 transition-colors flex items-center gap-1">
            {t("feed.see_all")} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingMatches.length === 0 ? (
          <EmptyMatches onCreateClick={() => router.push("/matches/create")} />
        ) : (
          <div className="space-y-3">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} currentUserId={profile?.id} />
            ))}
          </div>
        )}
      </section>

      {/* Top players */}
      {topPlayers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🏅</span>
            <h2 className="text-base font-bold text-white">{t("feed.top_players")}</h2>
          </div>
          <Link href="/matches" className="text-xs text-green-400 font-semibold flex items-center gap-1">
            {t("feed.see_all")} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {topPlayers.map((player) => (
              <TopPlayerChip key={player.id} player={player} />
            ))}
          </div>
        </section>
      )}

      {/* CTA banner */}
      <div
        className="rounded-2xl p-5 overflow-hidden relative border border-green-600/20"
        style={{ background: "linear-gradient(135deg, #0a2a18 0%, #071420 100%)" }}
      >
        <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-4 -mr-4">⚽</div>
        <h3 className="text-lg font-bold text-white mb-1">{t("feed.banner.title")}</h3>
        <p className="text-cf-muted text-sm mb-4">{t("feed.banner.body")}</p>
        <Button variant="primary" size="sm" onClick={() => router.push("/matches/create")}>
          {t("feed.banner.cta")}
        </Button>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-cf-surface border border-cf-border rounded-2xl px-3 py-3 flex flex-col items-center gap-1.5">
      {icon}
      <span className="text-lg font-black text-white">{value}</span>
      <span className="text-[10px] text-cf-dim font-medium tracking-wide uppercase">{label}</span>
    </div>
  );
}

function TopPlayerChip({ player }: { player: Profile }) {
  const router = useRouter();
  const tier = getCardTier(Math.round(player.overall_rating));
  const tierStyle = CARD_TIER_STYLES[tier];

  return (
    <button
      onClick={() => router.push(`/profile/${player.id}`)}
      className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 min-w-[90px] active:scale-95 transition-all ${tierStyle.border} bg-cf-surface hover:bg-cf-surface-2`}
    >
      <Avatar src={player.avatar_url} username={player.username} size="md" />
      <div className="text-center">
        <p className="text-[11px] font-semibold text-white truncate max-w-[76px]">
          {player.full_name?.split(" ")[0] ?? player.username}
        </p>
        <p className={`text-[13px] font-black ${tierStyle.text}`}>
          {Math.round(player.overall_rating)}
        </p>
      </div>
    </button>
  );
}

function EmptyMatches({ onCreateClick }: { onCreateClick: () => void }) {
  const { t } = useLang();
  return (
    <div className="bg-cf-surface border border-cf-border rounded-2xl p-8 flex flex-col items-center text-center">
      <span className="text-5xl mb-3">🌙</span>
      <p className="text-cf-text font-semibold mb-1">{t("feed.empty.title")}</p>
      <p className="text-cf-muted text-sm mb-5">{t("feed.empty.body")}</p>
      <Button variant="primary" size="sm" onClick={onCreateClick}>
        {t("feed.empty.cta")}
      </Button>
    </div>
  );
}

function SetupGuide({ error }: { error?: string | null }) {
  const { t } = useLang();
  const isDbMissing = error?.includes("relation") || error?.includes("does not exist") || error?.includes("42P01");

  return (
    <div className="page-content px-4 pt-12 flex flex-col items-center text-center gap-5">
      <div className="w-20 h-20 rounded-2xl bg-green-600/20 border border-green-600/40 flex items-center justify-center">
        <span className="text-4xl">⚽</span>
      </div>

      {isDbMissing ? (
        <>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">{t("setup.db_missing.title")}</h1>
          </div>
          <div className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-left">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">{t("setup.db_missing.what_to_do")}</p>
            <ol className="space-y-2">
              {(["1","2","3","4"] as const).map((n, i) => (
                <li key={n} className="text-sm text-cf-muted">
                  {i + 1}. {t(`setup.db_missing.steps.${n}` as keyof Translations)}
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">{t("setup.no_profile.title")}</h1>
            <p className="text-cf-muted text-sm leading-relaxed max-w-[280px]">{t("setup.no_profile.body")}</p>
          </div>
          <div className="w-full bg-cf-surface border border-cf-border rounded-2xl p-4 text-left space-y-3">
            <p className="text-xs font-bold text-cf-dim uppercase tracking-wider">{t("setup.no_profile.try")}</p>
            {(["1","2","3"] as const).map((n, i) => (
              <div key={n} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-600/20 border border-green-600/40 flex-shrink-0 flex items-center justify-center text-xs font-bold text-green-400">
                  {i + 1}
                </span>
                <p className="text-sm text-cf-muted leading-relaxed text-left">
                  {t(`setup.no_profile.steps.${n}` as keyof Translations)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {error && (
        <div className="w-full bg-cf-surface border border-cf-border rounded-xl p-3">
          <p className="text-[10px] text-cf-dim font-mono break-all text-left">{error}</p>
        </div>
      )}

      <a href="/login" className="text-sm text-green-400 font-semibold hover:text-green-300 transition-colors">
        {t("setup.back_to_login")}
      </a>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="page-content px-4 pt-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-28 bg-cf-surface rounded-lg mb-2" />
          <div className="h-8 w-36 bg-cf-surface rounded-lg" />
        </div>
        <div className="w-11 h-11 rounded-full bg-cf-surface" />
      </div>
      <div className="h-20 bg-cf-surface rounded-2xl" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 bg-cf-surface rounded-2xl" />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 bg-cf-surface rounded-2xl" />
      ))}
    </div>
  );
}
