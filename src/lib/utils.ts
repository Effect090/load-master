import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { CardTier, Position, SkillLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchDate(
  dateStr: string,
  labels?: { today?: string; tomorrow?: string }
): string {
  const date = new Date(dateStr);
  const todayLabel = labels?.today ?? "Aujourd'hui";
  const tomorrowLabel = labels?.tomorrow ?? "Demain";
  if (isToday(date)) return `${todayLabel}, ${format(date, "HH:mm")}`;
  if (isTomorrow(date)) return `${tomorrowLabel}, ${format(date, "HH:mm")}`;
  return format(date, "EEE d MMM, HH:mm");
}

export function formatTimeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function getCardTier(overall: number): CardTier {
  if (overall >= 85) return "elite";
  if (overall >= 75) return "gold";
  if (overall >= 60) return "silver";
  return "bronze";
}

/** Tier style map — `label` is intentionally left as a i18n key reference.
 *  Use t(`tier.${tier}`) in components to get the localized string. */
export const CARD_TIER_STYLES: Record<
  CardTier,
  { bg: string; border: string; text: string; glow: string; labelKey: string }
> = {
  bronze: {
    bg: "from-[#3B1F0A] via-[#2A1508] to-[#3B1F0A]",
    border: "border-[#8B5E3C]",
    text: "text-[#CD853F]",
    glow: "shadow-[0_0_30px_rgba(139,94,60,0.4)]",
    labelKey: "tier.bronze",
  },
  silver: {
    bg: "from-[#1E2430] via-[#141B26] to-[#1E2430]",
    border: "border-[#8899AA]",
    text: "text-[#A8B8C8]",
    glow: "shadow-[0_0_30px_rgba(136,153,170,0.4)]",
    labelKey: "tier.silver",
  },
  gold: {
    bg: "from-[#2A1F08] via-[#1A1305] to-[#2A1F08]",
    border: "border-[#D4A017]",
    text: "text-[#F0B429]",
    glow: "shadow-[0_0_30px_rgba(240,180,41,0.45)]",
    labelKey: "tier.gold",
  },
  elite: {
    bg: "from-[#08101E] via-[#04080F] to-[#08101E]",
    border: "border-[#4FC3F7]",
    text: "text-[#81D4FA]",
    glow: "shadow-[0_0_30px_rgba(79,195,247,0.45)]",
    labelKey: "tier.elite",
  },
};

/** Map Position → i18n key. Use t(POSITION_KEYS[pos]) in components. */
export const POSITION_KEYS: Record<Position, string> = {
  GK: "pos.GK",
  CB: "pos.CB",
  LB: "pos.LB",
  RB: "pos.RB",
  CDM: "pos.CDM",
  CM: "pos.CM",
  CAM: "pos.CAM",
  LW: "pos.LW",
  RW: "pos.RW",
  ST: "pos.ST",
  CF: "pos.CF",
};

/** @deprecated use POSITION_KEYS + t() for localized labels */
export const POSITION_LABELS: Record<Position, string> = {
  GK: "Gardien",
  CB: "Défenseur central",
  LB: "Arrière gauche",
  RB: "Arrière droit",
  CDM: "Milieu défensif",
  CM: "Milieu central",
  CAM: "Milieu offensif",
  LW: "Ailier gauche",
  RW: "Ailier droit",
  ST: "Avant-centre",
  CF: "Attaquant",
};

/** `labelKey` maps to a translation key: t(SKILL_LEVEL_CONFIG[lvl].labelKey) */
export const SKILL_LEVEL_CONFIG: Record<
  SkillLevel,
  { labelKey: string; color: string; bg: string }
> = {
  beginner: {
    labelKey: "skill.beginner",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  intermediate: {
    labelKey: "skill.intermediate",
    color: "text-gold-400",
    bg: "bg-gold-400/10",
  },
  advanced: {
    labelKey: "skill.advanced",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  mixed: {
    labelKey: "skill.mixed",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
};

export const NEIGHBORHOODS = [
  "Ain Chock",
  "Ain Sebaa",
  "Anfa",
  "Ben M'Sick",
  "Bernoussi",
  "Bourgogne",
  "California",
  "CIL",
  "Derb Sultan",
  "Gauthier",
  "Hay Hassani",
  "Hay Mohammadi",
  "Maarif",
  "Racine",
  "Sidi Belyout",
  "Sidi Bernoussi",
  "Sidi Moumen",
  "Sidi Othman",
  "Wifaq",
  "Other",
];

export function getAvatarUrl(avatarUrl: string | null, username: string): string {
  if (avatarUrl) return avatarUrl;
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=0F1525`;
}
