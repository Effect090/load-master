"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Trophy,
  Users,
  Star,
  UserPlus,
  UserCheck,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile, Match } from "@/types";
import {
  cn,
  POSITION_LABELS,
  getCardTier,
  CARD_TIER_STYLES,
  formatMatchDate,
  SKILL_LEVEL_CONFIG,
} from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PlayerCard } from "@/components/PlayerCard";
import { ReliabilityBadge } from "@/components/ReliabilityBadge";

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"card" | "stats">("card");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    load();
  }, [playerId]);

  async function load() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setCurrentUserId(user.id);

      // Redirect to own profile
      if (user.id === playerId) {
        router.replace("/profile");
        return;
      }

      const [profileRes, followRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", playerId).single(),
        supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", user.id)
          .eq("following_id", playerId)
          .maybeSingle(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      setIsFollowing(!!followRes.data);

      // Fetch match history separately
      const { data: participations } = await supabase
        .from("match_participants")
        .select("match_id")
        .eq("player_id", playerId)
        .limit(8);

      if (participations && participations.length > 0) {
        const matchIds = participations.map((p) => p.match_id);
        const { data: matchData } = await supabase
          .from("matches")
          .select("*, organizer:profiles!matches_organizer_id_fkey(*)")
          .in("id", matchIds)
          .order("date_time", { ascending: false });
        setMatches((matchData as unknown as Match[]) ?? []);
      }
    } catch (err) {
      console.error("Player profile load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow() {
    if (!currentUserId) return;
    setToggling(true);
    const supabase = createClient();

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", playerId);
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, following_id: playerId });
    }

    setIsFollowing((f) => !f);
    setToggling(false);
  }

  if (loading) return <ProfileSkeleton />;
  if (!profile) return <NotFound onBack={() => router.back()} />;

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
        <div className="absolute inset-0 pitch-bg opacity-30" />
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#07090F] to-transparent" />

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full glass-dark border border-cf-border flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>

        {/* Player info */}
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

          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            {profile.position && (
              <Badge variant="green" size="sm">
                {profile.position} ·{" "}
                {POSITION_LABELS[profile.position as keyof typeof POSITION_LABELS] ?? profile.position}
              </Badge>
            )}
            {profile.preferred_foot && (
              <Badge variant="default" size="sm">
                {profile.preferred_foot === "both"
                  ? "Both feet"
                  : `${profile.preferred_foot.charAt(0).toUpperCase() + profile.preferred_foot.slice(1)} foot`}
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

          {/* Reliability */}
          <div className="mt-3">
            <ReliabilityBadge profile={profile} size="sm" />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 w-full">
            <MiniStat
              icon={<Trophy className="w-4 h-4 text-gold-DEFAULT" />}
              label="Matches"
              value={profile.matches_played}
            />
            <MiniStat
              icon={<Star className="w-4 h-4 text-green-400" />}
              label="Overall"
              value={Math.round(profile.overall_rating)}
              accent
              accentClass={tierStyle.text}
            />
            <MiniStat
              icon={<Users className="w-4 h-4 text-blue-400" />}
              label="Ratings"
              value={profile.total_ratings_received}
            />
          </div>

          {/* Follow button */}
          <Button
            variant={isFollowing ? "outline" : "primary"}
            size="md"
            className="mt-4 min-w-[140px]"
            loading={toggling}
            onClick={handleFollow}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-4 h-4" /> Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Follow
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="flex gap-1 p-1 bg-cf-surface rounded-2xl border border-cf-border mb-5">
          {(["card", "stats"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 h-9 rounded-xl text-sm font-semibold capitalize transition-all duration-200",
                tab === t
                  ? "bg-green-600/20 text-green-400 border border-green-600/30"
                  : "text-cf-dim hover:text-cf-muted"
              )}
            >
              {t === "card" ? "Player Card" : "Stats"}
            </button>
          ))}
        </div>

        {tab === "card" && (
          <div className="flex justify-center py-4">
            <PlayerCard profile={profile} size="full" />
          </div>
        )}

        {tab === "stats" && (
          <div className="space-y-3 pb-4">
            <div className="bg-cf-surface border border-cf-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-cf-dim uppercase tracking-wider font-bold">
                    Overall
                  </p>
                  <p className={cn("text-4xl font-black mt-0.5", tierStyle.text)}>
                    {Math.round(profile.overall_rating)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-cf-dim">Tier</p>
                  <p className={cn("text-lg font-bold", tierStyle.text)}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </p>
                </div>
              </div>

              {[
                { label: "Pace", value: Math.round(profile.stat_pace), color: "bg-blue-500" },
                { label: "Shooting", value: Math.round(profile.stat_shooting), color: "bg-orange-500" },
                { label: "Passing", value: Math.round(profile.stat_passing), color: "bg-green-500" },
                { label: "Dribbling", value: Math.round(profile.stat_dribbling), color: "bg-purple-500" },
                { label: "Defense", value: Math.round(profile.stat_defense), color: "bg-red-500" },
                { label: "Physical", value: Math.round(profile.stat_physical), color: "bg-yellow-500" },
                { label: "Fair Play", value: Math.round(profile.stat_fair_play), color: "bg-teal-500" },
              ].map((stat) => {
                const pct = Math.round(((stat.value - 40) / 59) * 100);
                return (
                  <div key={stat.label} className="mb-3">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-cf-muted">{stat.label}</span>
                      <span className="text-sm font-bold text-white">{stat.value}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", stat.color)}
                        style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <ReliabilityBadge profile={profile} showStats />

            <div className="bg-cf-surface border border-cf-border rounded-2xl p-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-400/50 flex-shrink-0" />
              <p className="text-xs text-cf-dim leading-relaxed">
                Stats are community-rated. Only players from shared matches can rate each other.
                Individual ratings are private — only aggregated scores are shown.
              </p>
            </div>

            {/* Recent matches */}
            {matches.length > 0 && (
              <div>
                <p className="text-xs font-bold text-cf-dim uppercase tracking-wider mb-2 px-1">
                  Recent Matches
                </p>
                <div className="space-y-2">
                  {matches.slice(0, 5).map((match) => (
                    <button
                      key={match.id}
                      onClick={() => router.push(`/matches/${match.id}`)}
                      className="w-full bg-cf-surface border border-cf-border rounded-xl p-3 text-left flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{match.title}</p>
                        <p className="text-xs text-cf-dim">{formatMatchDate(match.date_time)}</p>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-bold flex-shrink-0",
                          match.status === "completed"
                            ? "text-blue-400"
                            : "text-green-400"
                        )}
                      >
                        {match.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
      <span className="text-5xl">👤</span>
      <h2 className="text-xl font-bold text-white">Player Not Found</h2>
      <Button variant="outline" onClick={onBack}>
        Go Back
      </Button>
    </div>
  );
}
