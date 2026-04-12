import { CardTier, PlayerCardStats, RatingInput } from "@/types";
import { getCardTier } from "./utils";

/**
 * Maps a 1–5 rating to a 40–99 football-card scale.
 * 1 → 40, 3 → ~70, 5 → 99
 */
export function mapToCardScale(rating: number): number {
  // Clamp between 1 and 5
  const clamped = Math.max(1, Math.min(5, rating));
  return Math.round(40 + (clamped - 1) * 14.75);
}

/**
 * Rating categories → card stats mapping:
 *   pace       ← physical_impact   (athleticism proxy)
 *   shooting   ← technique         (ball control)
 *   dribbling  ← technique         (same source, slight variance)
 *   passing    ← passing_vision
 *   defense    ← defense
 *   physical   ← physical_impact
 *   fair_play  ← fair_play
 */
export function buildCardStats(
  avgRatings: RatingInput,
  ratingsCount: number
): PlayerCardStats {
  // If no ratings yet, use balanced defaults (50 on card scale)
  if (ratingsCount === 0) {
    return {
      overall: 50,
      pace: 50,
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defense: 50,
      physical: 50,
      fairPlay: 50,
      tier: "bronze",
    };
  }

  const pace = mapToCardScale(avgRatings.physical_impact);
  const shooting = mapToCardScale(avgRatings.technique);
  // Dribbling = technique with small variance to make it distinct
  const dribbling = mapToCardScale(
    Math.max(1, Math.min(5, avgRatings.technique - 0.1))
  );
  const passing = mapToCardScale(avgRatings.passing_vision);
  const defense = mapToCardScale(avgRatings.defense);
  const physical = mapToCardScale(avgRatings.physical_impact);
  const fairPlay = mapToCardScale(avgRatings.fair_play);

  // Overall: position-agnostic weighted average
  const overall = Math.round(
    pace * 0.14 +
      shooting * 0.18 +
      passing * 0.20 +
      dribbling * 0.16 +
      defense * 0.14 +
      physical * 0.10 +
      fairPlay * 0.08
  );

  return {
    overall,
    pace,
    shooting,
    passing,
    dribbling,
    defense,
    physical,
    fairPlay,
    tier: getCardTier(overall),
  };
}

/**
 * Recalculates aggregated profile stats after a new rating is added.
 * Uses a Bayesian-style weighted average to prevent gaming:
 *  - A minimum of 3 ratings are required before stats deviate far from 50
 *  - Each new rating is weighted equally (no single vote dominates)
 */
export function computeNewAggregatedStats(
  currentStats: RatingInput & { total_ratings: number },
  newRating: RatingInput
): RatingInput & { total_ratings: number } {
  const n = currentStats.total_ratings;
  const newN = n + 1;

  // Prior weight: pulls stats toward neutral (3) for low sample sizes
  const PRIOR_WEIGHT = 3;
  const PRIOR_VALUE = 3; // neutral 3/5

  function weightedAvg(current: number, incoming: number): number {
    // Bayesian average: (prior_weight * prior + n * current + incoming) / (prior_weight + newN)
    return (
      (PRIOR_WEIGHT * PRIOR_VALUE + n * current + incoming) /
      (PRIOR_WEIGHT + newN)
    );
  }

  return {
    technique: weightedAvg(currentStats.technique, newRating.technique),
    passing_vision: weightedAvg(
      currentStats.passing_vision,
      newRating.passing_vision
    ),
    defense: weightedAvg(currentStats.defense, newRating.defense),
    physical_impact: weightedAvg(
      currentStats.physical_impact,
      newRating.physical_impact
    ),
    fair_play: weightedAvg(currentStats.fair_play, newRating.fair_play),
    total_ratings: newN,
  };
}

/** Labels are i18n keys — resolve via t(`rating.cat.${key}.label`) in components. */
export const RATING_CATEGORIES: {
  key: keyof RatingInput;
  emoji: string;
}[] = [
  { key: "technique",      emoji: "⚽" },
  { key: "passing_vision", emoji: "👁️" },
  { key: "defense",        emoji: "🛡️" },
  { key: "physical_impact",emoji: "💪" },
  { key: "fair_play",      emoji: "🤝" },
];
