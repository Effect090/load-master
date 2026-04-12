"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Zap,
  CheckCircle2,
  LogOut,
  Star,
  Share2,
  Crown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Match, MatchParticipant, Profile } from "@/types";
import {
  cn,
  formatMatchDate,
  SKILL_LEVEL_CONFIG,
  getCardTier,
  CARD_TIER_STYLES,
} from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RatingModal } from "@/components/RatingModal";
import { AttendanceSection } from "@/components/AttendanceSection";
import { PresenceSheet } from "@/components/PresenceSheet";
import { MatchChat } from "@/components/MatchChat";
import { useLang } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n/types";

interface MatchDetails extends Match {
  organizer: Profile;
  participants: (MatchParticipant & { player: Profile })[];
}

export default function MatchDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const { t }    = useLang();
  const matchId  = params.id as string;

  const [match, setMatch]               = useState<MatchDetails | null>(null);
  const [currentUser, setCurrentUser]   = useState<Profile | null>(null);
  const [loading, setLoading]           = useState(true);
  const [joining, setJoining]           = useState(false);
  const [leaving, setLeaving]           = useState(false);
  const [showPresence, setShowPresence] = useState(false);
  const [showRating, setShowRating]     = useState(false);
  const [hasRated, setHasRated]         = useState(false);
  const [actionMsg, setActionMsg]       = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [matchRes, userRes] = await Promise.all([
        supabase
          .from("matches")
          .select(
            "*, organizer:profiles!matches_organizer_id_fkey(*), participants:match_participants(*, player:profiles(*))"
          )
          .eq("id", matchId)
          .single(),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);

      if (matchRes.data) setMatch(matchRes.data as unknown as MatchDetails);
      if (userRes.data)  setCurrentUser(userRes.data);

      if (matchRes.data?.status === "completed") {
        const { data: existingRatings } = await supabase
          .from("ratings")
          .select("id")
          .eq("match_id", matchId)
          .eq("rater_id", user.id)
          .limit(1);
        setHasRated((existingRatings ?? []).length > 0);
      }
    } catch (err) {
      console.error("Match detail load error:", err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => { load(); }, [load]);

  const isParticipant = match?.participants.some((p) => p.player_id === currentUser?.id) ?? false;
  const isOrganizer   = match?.organizer_id === currentUser?.id;
  const isFull        = (match?.current_players ?? 0) >= (match?.max_players ?? 0);
  const canJoin       = !isParticipant && !isFull && match?.status === "open";
  const canLeave      = isParticipant && !isOrganizer && match?.status === "open";
  const canComplete   = isOrganizer && match?.status === "open";
  const canRate       = isParticipant && match?.status === "completed" && !hasRated;
  const isActive      = match?.status === "open";

  const otherParticipants = match?.participants
    .filter((p) => p.player_id !== currentUser?.id)
    .map((p) => p.player) ?? [];

  async function handleJoin() {
    if (!currentUser || !match) return;
    setJoining(true);
    const supabase = createClient();
    await supabase.from("match_participants").insert({
      match_id:   match.id,
      player_id:  currentUser.id,
    });
    await supabase
      .from("matches")
      .update({ current_players: match.current_players + 1 })
      .eq("id", match.id);
    setActionMsg(t("detail.joined_msg"));
    await load();
    setJoining(false);
    setTimeout(() => setActionMsg(null), 3000);
  }

  async function handleLeave() {
    if (!currentUser || !match) return;
    setLeaving(true);
    const supabase = createClient();
    await supabase
      .from("match_participants")
      .delete()
      .eq("match_id", match.id)
      .eq("player_id", currentUser.id);
    await supabase
      .from("matches")
      .update({ current_players: Math.max(0, match.current_players - 1) })
      .eq("id", match.id);
    await load();
    setLeaving(false);
  }

  /** Called after presence sheet completes or is skipped */
  async function completeMatch() {
    if (!match) return;
    const supabase = createClient();

    await supabase
      .from("match_participants")
      .update({ confirmed_participated: true })
      .eq("match_id", match.id);

    await supabase
      .from("matches")
      .update({ status: "completed" })
      .eq("id", match.id);

    const participantIds = match.participants.map((p) => p.player_id);
    for (const pid of participantIds) {
      await supabase.rpc("increment_matches_played", { player_id: pid });
    }

    await load();
    setShowPresence(false);
    setShowRating(true);
  }

  if (loading) return <DetailSkeleton />;
  if (!match)  return <NotFound onBack={() => router.back()} />;

  const skillConfig  = SKILL_LEVEL_CONFIG[match.skill_level];
  const statusVariant =
    match.status === "completed" ? "blue"
    : match.status === "cancelled" ? "red"
    : isFull ? "gold"
    : "green";

  return (
    <div className="page-content pb-36">
      {/* Hero header */}
      <div className="relative">
        <div
          className="h-48 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0a2a18 0%, #071420 50%, #07090F 100%)" }}
        >
          <div className="absolute inset-0 pitch-bg opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] to-transparent" />
          <div className="absolute bottom-4 right-6 text-8xl font-black opacity-10 text-white leading-none select-none">
            {match.max_players}
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full glass-dark border border-cf-border flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full glass-dark border border-cf-border flex items-center justify-center text-white">
          <Share2 className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="px-4 -mt-6 relative z-10 space-y-4">
        {/* Match title card */}
        <div className="bg-cf-surface border border-cf-border rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-xl font-black text-white leading-tight flex-1">{match.title}</h1>
            <Badge variant={statusVariant}>
              {match.status === "completed" ? t("detail.status.completed")
               : match.status === "cancelled" ? t("detail.status.cancelled")
               : isFull ? t("detail.status.full")
               : t("detail.status.open")}
            </Badge>
          </div>

          <div className="space-y-2.5">
            <InfoRow
              icon={<Clock />}
              value={formatMatchDate(match.date_time, {
                today:    t("date.today"),
                tomorrow: t("date.tomorrow"),
              })}
            />
            <InfoRow
              icon={<MapPin />}
              value={match.field_name ? `${match.field_name} · ${match.location}` : match.location}
            />
            <InfoRow
              icon={<Users />}
              value={
                <span>
                  <span className="font-bold text-white">{match.current_players}</span>
                  <span className="text-cf-dim">{t("detail.players_unit", { max: match.max_players })}</span>
                </span>
              }
            />
            <InfoRow
              icon={<Zap />}
              value={
                <span className={skillConfig.color}>
                  {t(skillConfig.labelKey as keyof Translations)}
                </span>
              }
            />
            {match.price_per_player > 0 && (
              <InfoRow
                icon={<DollarSign />}
                value={t("detail.price_per_player", { price: match.price_per_player })}
              />
            )}
          </div>

          {/* Fill bar */}
          <div className="mt-3">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  isFull ? "bg-gold-DEFAULT" : "bg-green-500"
                )}
                style={{ width: `${Math.min(100, (match.current_players / match.max_players) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Organizer */}
        <div className="bg-cf-surface border border-cf-border rounded-2xl p-4">
          <p className="text-xs font-bold text-cf-dim uppercase tracking-wider mb-3">
            {t("detail.organized_by")}
          </p>
          <div className="flex items-center gap-3">
            <Avatar
              src={match.organizer.avatar_url}
              username={match.organizer.username}
              size="md"
            />
            <div className="flex-1">
              <p className="font-bold text-white">
                {match.organizer.full_name ?? match.organizer.username}
              </p>
              <p className="text-xs text-cf-dim">@{match.organizer.username}</p>
            </div>
            <Crown className="w-4 h-4 text-gold-DEFAULT" />
          </div>
        </div>

        {/* Description */}
        {match.description && (
          <div className="bg-cf-surface border border-cf-border rounded-2xl p-4">
            <p className="text-xs font-bold text-cf-dim uppercase tracking-wider mb-2">
              {t("detail.description")}
            </p>
            <p className="text-cf-muted text-sm leading-relaxed">{match.description}</p>
          </div>
        )}

        {/* Players */}
        <div className="bg-cf-surface border border-cf-border rounded-2xl p-4">
          <p className="text-xs font-bold text-cf-dim uppercase tracking-wider mb-3">
            {t("detail.players_section")} ({match.current_players}/{match.max_players})
          </p>
          <div className="space-y-3">
            {match.participants.map((p) => (
              <PlayerRow
                key={p.id}
                player={p.player}
                isOrganizer={p.player_id === match.organizer_id}
                isCurrentUser={p.player_id === currentUser?.id}
              />
            ))}
            {Array.from({ length: Math.max(0, match.max_players - match.current_players) }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-xl border border-dashed border-cf-border/50"
              >
                <div className="w-9 h-9 rounded-full bg-cf-surface-2 border border-dashed border-cf-border flex items-center justify-center">
                  <Users className="w-4 h-4 text-cf-dim" />
                </div>
                <span className="text-cf-dim text-sm">{t("detail.open_slot")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance — only for open matches */}
        {isActive && (isParticipant || isOrganizer) && (
          <AttendanceSection
            matchId={match.id}
            matchDateTime={match.date_time}
            participants={match.participants}
            currentUserId={currentUser?.id ?? null}
            isOrganizer={!!isOrganizer}
            onUpdate={load}
          />
        )}

        {/* Action feedback */}
        {actionMsg && (
          <div className="bg-green-600/20 border border-green-600/30 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-400">{actionMsg}</p>
          </div>
        )}

        {/* Chat — only for participants */}
        {(isParticipant || isOrganizer) && currentUser && (
          <MatchChat
            matchId={match.id}
            currentUser={currentUser}
            isParticipant={isParticipant || !!isOrganizer}
          />
        )}
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-[72px] inset-x-0 z-30 px-4 pb-2 glass-dark border-t border-cf-border/40 pt-3 max-w-lg mx-auto">
        {canJoin && (
          <Button fullWidth size="lg" loading={joining} onClick={handleJoin}>
            {match.price_per_player > 0
              ? t("detail.cta.join", { price: match.price_per_player })
              : t("detail.cta.join_free")}
          </Button>
        )}
        {canLeave && (
          <Button fullWidth size="lg" variant="danger" loading={leaving} onClick={handleLeave}>
            <LogOut className="w-4 h-4" /> {t("detail.cta.leave")}
          </Button>
        )}
        {canComplete && (
          <Button fullWidth size="lg" variant="gold" onClick={() => setShowPresence(true)}>
            <CheckCircle2 className="w-4 h-4" /> {t("detail.cta.complete")}
          </Button>
        )}
        {canRate && (
          <Button fullWidth size="lg" variant="gold" onClick={() => setShowRating(true)}>
            <Star className="w-4 h-4" /> {t("detail.cta.rate")}
          </Button>
        )}
        {isParticipant && match.status === "completed" && hasRated && (
          <div className="flex items-center justify-center gap-2 py-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">{t("detail.already_rated")}</span>
          </div>
        )}
        {isOrganizer && match.status === "open" && (
          <p className="text-center text-xs text-cf-dim pt-1">{t("detail.organizer_hint")}</p>
        )}
      </div>

      {/* Presence sheet */}
      {showPresence && currentUser && (
        <PresenceSheet
          matchId={match.id}
          participants={match.participants}
          currentUserId={currentUser.id}
          onComplete={completeMatch}
          onSkip={completeMatch}
          onClose={() => setShowPresence(false)}
        />
      )}

      {/* Rating modal */}
      {showRating && currentUser && otherParticipants.length > 0 && (
        <RatingModal
          matchId={match.id}
          playersToRate={otherParticipants}
          currentPlayerId={currentUser.id}
          onComplete={() => { setShowRating(false); setHasRated(true); }}
          onClose={() => setShowRating(false)}
        />
      )}
    </div>
  );
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-cf-dim">
      <span className="w-4 h-4 flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      <span className="text-sm text-cf-muted">{value}</span>
    </div>
  );
}

function PlayerRow({
  player,
  isOrganizer,
  isCurrentUser,
}: {
  player: Profile;
  isOrganizer: boolean;
  isCurrentUser: boolean;
}) {
  const router = useRouter();
  const { t }  = useLang();
  const tier      = getCardTier(Math.round(player.overall_rating));
  const tierStyle = CARD_TIER_STYLES[tier];

  return (
    <button
      onClick={() => !isCurrentUser && router.push(`/profile/${player.id}`)}
      className={cn(
        "flex items-center gap-3 w-full text-left rounded-xl p-2 transition-all",
        !isCurrentUser && "hover:bg-cf-surface-2 active:bg-cf-surface-2/80 cursor-pointer",
        isCurrentUser  && "cursor-default"
      )}
    >
      <Avatar src={player.avatar_url} username={player.username} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-white truncate">
            {player.full_name ?? player.username}
          </p>
          {isCurrentUser && (
            <span className="text-[10px] text-cf-dim">{t("detail.you_label")}</span>
          )}
          {isOrganizer && (
            <Crown className="w-3 h-3 text-gold-DEFAULT flex-shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-cf-dim">
          {player.position ?? "—"} · @{player.username}
        </p>
      </div>
      <span className={cn("text-sm font-black", tierStyle.text)}>
        {Math.round(player.overall_rating)}
      </span>
    </button>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-cf-surface" />
      <div className="px-4 -mt-6 space-y-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-cf-surface rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
      <span className="text-5xl">😕</span>
      <h2 className="text-xl font-bold text-white">{t("detail.not_found.title")}</h2>
      <p className="text-cf-muted text-sm text-center">{t("detail.not_found.body")}</p>
      <Button variant="outline" onClick={onBack}>{t("detail.not_found.back")}</Button>
    </div>
  );
}
