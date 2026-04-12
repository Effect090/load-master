"use client";

import { useState } from "react";
import { X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Profile, RatingInput } from "@/types";
import { RATING_CATEGORIES } from "@/lib/rating";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n/types";

interface RatingModalProps {
  matchId: string;
  playersToRate: Profile[];
  currentPlayerId: string;
  onComplete: () => void;
  onClose: () => void;
}

export function RatingModal({
  matchId,
  playersToRate,
  currentPlayerId,
  onComplete,
  onClose,
}: RatingModalProps) {
  const { t } = useLang();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, RatingInput>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const currentPlayer = playersToRate[currentIndex];
  const totalPlayers = playersToRate.length;

  const currentRating: RatingInput = ratings[currentPlayer?.id] ?? {
    technique: 0,
    passing_vision: 0,
    defense: 0,
    physical_impact: 0,
    fair_play: 0,
  };

  const isCurrentComplete = Object.values(currentRating).every((v) => v > 0);

  function setCategory(key: keyof RatingInput, value: number) {
    setRatings((prev) => ({
      ...prev,
      [currentPlayer.id]: { ...currentRating, [key]: value },
    }));
  }

  function handleNext() {
    if (currentIndex < totalPlayers - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  }

  function handleSkip() {
    if (currentIndex < totalPlayers - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  }

  async function handleSubmit() {
    setSaving(true);
    const supabase = createClient();

    try {
      // Submit all completed ratings
      const ratingEntries = Object.entries(ratings).filter(([, r]) =>
        Object.values(r).every((v) => v > 0)
      );

      const bayesian = (n: number, current: number, incoming: number): number => {
        const PRIOR = 3;
        const PRIOR_VAL = 3;
        return (PRIOR * PRIOR_VAL + n * current + incoming) / (PRIOR + n + 1);
      };
      const mapScale = (r: number) => Math.round(40 + (r - 1) * 14.75);

      for (const [ratedId, rating] of ratingEntries) {
        await supabase.from("ratings").upsert({
          match_id: matchId,
          rater_id: currentPlayerId,
          rated_id: ratedId,
          ...rating,
        });

        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "stat_pace,stat_shooting,stat_passing,stat_dribbling,stat_defense,stat_physical,stat_fair_play,overall_rating,total_ratings_received"
          )
          .eq("id", ratedId)
          .single();

        if (profile) {
          const n = profile.total_ratings_received;

          const newPace = mapScale(bayesian(n,
            (profile.stat_pace - 40) / 14.75 + 1,
            rating.physical_impact
          ));
          const newShooting = mapScale(bayesian(n,
            (profile.stat_shooting - 40) / 14.75 + 1,
            rating.technique
          ));
          const newPassing = mapScale(bayesian(n,
            (profile.stat_passing - 40) / 14.75 + 1,
            rating.passing_vision
          ));
          const newDribbling = mapScale(bayesian(n,
            (profile.stat_dribbling - 40) / 14.75 + 1,
            rating.technique - 0.1
          ));
          const newDefense = mapScale(bayesian(n,
            (profile.stat_defense - 40) / 14.75 + 1,
            rating.defense
          ));
          const newPhysical = mapScale(bayesian(n,
            (profile.stat_physical - 40) / 14.75 + 1,
            rating.physical_impact
          ));
          const newFairPlay = mapScale(bayesian(n,
            (profile.stat_fair_play - 40) / 14.75 + 1,
            rating.fair_play
          ));

          const newOverall = Math.round(
            newPace * 0.14 +
              newShooting * 0.18 +
              newPassing * 0.20 +
              newDribbling * 0.16 +
              newDefense * 0.14 +
              newPhysical * 0.10 +
              newFairPlay * 0.08
          );

          await supabase
            .from("profiles")
            .update({
              stat_pace: newPace,
              stat_shooting: newShooting,
              stat_passing: newPassing,
              stat_dribbling: newDribbling,
              stat_defense: newDefense,
              stat_physical: newPhysical,
              stat_fair_play: newFairPlay,
              overall_rating: newOverall,
              total_ratings_received: n + 1,
            })
            .eq("id", ratedId);
        }
      }

      setDone(true);
      setTimeout(onComplete, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="flex flex-col items-center gap-6 py-8 px-6">
          <div className="w-20 h-20 rounded-full bg-green-600/20 border border-green-600/40 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-green-400" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{t("rating.done_title")}</h2>
            <p className="text-cf-muted text-sm">{t("rating.done_body")}</p>
          </div>
        </div>
      </ModalOverlay>
    );
  }

  if (!currentPlayer) return null;

  return (
    <ModalOverlay onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-cf-border/60">
        <div>
          <h2 className="text-lg font-bold text-white">{t("rating.title")}</h2>
          <p className="text-xs text-cf-dim mt-0.5">
            {t("rating.progress", { n: currentIndex + 1, total: totalPlayers })}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-cf-surface-2 border border-cf-border flex items-center justify-center text-cf-muted hover:text-cf-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-cf-border/30 mx-5 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalPlayers) * 100}%` }}
        />
      </div>

      {/* Player being rated */}
      <div className="flex items-center gap-4 px-5 py-4 bg-cf-surface-2/50 mx-5 rounded-2xl mt-4 mb-2">
        <Avatar
          src={currentPlayer.avatar_url}
          username={currentPlayer.username}
          size="lg"
          ring
          ringColor="green"
        />
        <div>
          <p className="font-bold text-white text-lg">
            {currentPlayer.full_name ?? currentPlayer.username}
          </p>
          <p className="text-cf-dim text-sm">@{currentPlayer.username}</p>
          {currentPlayer.position && (
            <span className="text-xs font-medium text-green-400 mt-0.5 inline-block">
              {currentPlayer.position}
            </span>
          )}
        </div>
      </div>

      {/* Rating categories */}
      <div className="px-5 py-2 space-y-5">
        {RATING_CATEGORIES.map((cat) => (
          <div key={cat.key}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{cat.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-cf-text">
                  {t(`rating.cat.${cat.key}.label` as keyof Translations)}
                </p>
                <p className="text-[11px] text-cf-dim">
                  {t(`rating.cat.${cat.key}.desc` as keyof Translations)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setCategory(cat.key, val)}
                  className={cn(
                    "flex-1 h-10 rounded-xl border font-bold text-sm transition-all duration-150 active:scale-95",
                    currentRating[cat.key] === val
                      ? "bg-gold-DEFAULT/20 border-gold-DEFAULT/50 text-gold-DEFAULT shadow-gold-glow"
                      : currentRating[cat.key] >= val
                      ? "bg-gold-DEFAULT/10 border-gold-DEFAULT/20 text-gold-400/70"
                      : "bg-cf-surface border-cf-border text-cf-dim hover:border-cf-border/80"
                  )}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-5 pt-4 pb-5">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleSkip}
          disabled={saving}
        >
          {t("rating.skip")}
        </Button>
        <Button
          variant="primary"
          className="flex-2"
          onClick={handleNext}
          disabled={!isCurrentComplete || saving}
          loading={saving && currentIndex === totalPlayers - 1}
        >
          {currentIndex < totalPlayers - 1 ? t("rating.next") : t("rating.submit")}
        </Button>
      </div>
    </ModalOverlay>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-cf-surface rounded-t-3xl border-t border-cf-border overflow-y-auto max-h-[92vh] animate-slide-up">
        {children}
      </div>
    </>
  );
}
