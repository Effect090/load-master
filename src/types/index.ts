export type Position =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LW"
  | "RW"
  | "ST"
  | "CF";

export type PreferredFoot = "left" | "right" | "both";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "mixed";

export type MatchStatus = "open" | "full" | "completed" | "cancelled";

export type AttendanceStatus = "not_confirmed" | "confirmed" | "declined";
export type PresenceStatus   = "unknown" | "present" | "no_show";

export type CardTier = "bronze" | "silver" | "gold" | "elite";

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  position: Position | null;
  preferred_foot: PreferredFoot | null;
  neighborhood: string | null;
  bio: string | null;
  matches_played: number;
  stat_pace: number;
  stat_shooting: number;
  stat_passing: number;
  stat_dribbling: number;
  stat_defense: number;
  stat_physical: number;
  stat_fair_play: number;
  overall_rating: number;
  total_ratings_received: number;
  // Reliability system
  reliability_score: number;
  shows_up_count: number;
  expected_attendance_count: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  title: string;
  organizer_id: string;
  location: string;
  field_name: string | null;
  date_time: string;
  max_players: number;
  current_players: number;
  skill_level: SkillLevel;
  price_per_player: number;
  description: string | null;
  status: MatchStatus;
  is_rated: boolean;
  created_at: string;
  organizer?: Profile;
  participants?: MatchParticipant[];
}

export interface MatchParticipant {
  id: string;
  match_id: string;
  player_id: string;
  joined_at: string;
  confirmed_participated: boolean;
  attendance_status: AttendanceStatus;
  attendance_confirmed_at: string | null;
  presence_status: PresenceStatus;
  presence_marked_at: string | null;
  player?: Profile;
}

export interface MatchMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
}

export interface Rating {
  id: string;
  match_id: string;
  rater_id: string;
  rated_id: string;
  technique: number;
  passing_vision: number;
  defense: number;
  physical_impact: number;
  fair_play: number;
  created_at: string;
}

export interface RatingInput {
  technique: number;
  passing_vision: number;
  defense: number;
  physical_impact: number;
  fair_play: number;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface PlayerCardStats {
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  fairPlay: number;
  tier: CardTier;
}

export interface MatchWithDetails extends Match {
  organizer: Profile;
  participants: (MatchParticipant & { player: Profile })[];
  participant_count: number;
}
