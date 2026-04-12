-- ============================================================
-- CasaFoot Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- Extends auth.users with player-specific data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  position        TEXT CHECK (position IN ('GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST','CF')),
  preferred_foot  TEXT CHECK (preferred_foot IN ('left','right','both')),
  neighborhood    TEXT,
  bio             TEXT CHECK (length(bio) <= 160),

  -- Match stats
  matches_played  INTEGER NOT NULL DEFAULT 0,

  -- Aggregated card stats (40–99 scale)
  stat_pace       FLOAT NOT NULL DEFAULT 50,
  stat_shooting   FLOAT NOT NULL DEFAULT 50,
  stat_passing    FLOAT NOT NULL DEFAULT 50,
  stat_dribbling  FLOAT NOT NULL DEFAULT 50,
  stat_defense    FLOAT NOT NULL DEFAULT 50,
  stat_physical   FLOAT NOT NULL DEFAULT 50,
  stat_fair_play  FLOAT NOT NULL DEFAULT 50,
  overall_rating  FLOAT NOT NULL DEFAULT 50,

  total_ratings_received INTEGER NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 80),
  organizer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location         TEXT NOT NULL,
  field_name       TEXT,
  date_time        TIMESTAMPTZ NOT NULL,
  max_players      INTEGER NOT NULL DEFAULT 10 CHECK (max_players BETWEEN 4 AND 22),
  current_players  INTEGER NOT NULL DEFAULT 0,
  skill_level      TEXT NOT NULL DEFAULT 'mixed'
                     CHECK (skill_level IN ('beginner','intermediate','advanced','mixed')),
  price_per_player DECIMAL(8,2) NOT NULL DEFAULT 0 CHECK (price_per_player >= 0),
  description      TEXT CHECK (length(description) <= 300),
  status           TEXT NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open','full','completed','cancelled')),
  is_rated         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MATCH PARTICIPANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.match_participants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id              UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_participated BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (match_id, player_id)
);

-- ============================================================
-- RATINGS
-- Post-match peer ratings (verified participants only)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  rater_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rated_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 1–5 scale per category
  technique       SMALLINT NOT NULL CHECK (technique BETWEEN 1 AND 5),
  passing_vision  SMALLINT NOT NULL CHECK (passing_vision BETWEEN 1 AND 5),
  defense         SMALLINT NOT NULL CHECK (defense BETWEEN 1 AND 5),
  physical_impact SMALLINT NOT NULL CHECK (physical_impact BETWEEN 1 AND 5),
  fair_play       SMALLINT NOT NULL CHECK (fair_play BETWEEN 1 AND 5),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (match_id, rater_id, rated_id),
  -- No self-rating
  CHECK (rater_id <> rated_id)
);

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_matches_status          ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date_time       ON public.matches(date_time);
CREATE INDEX IF NOT EXISTS idx_matches_organizer       ON public.matches(organizer_id);
CREATE INDEX IF NOT EXISTS idx_participants_match      ON public.match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_participants_player     ON public.match_participants(player_id);
CREATE INDEX IF NOT EXISTS idx_ratings_match           ON public.ratings(match_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated           ON public.ratings(rated_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater           ON public.ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_profiles_overall        ON public.profiles(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower        ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following       ON public.follows(following_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INCREMENT MATCHES PLAYED (called after match completion)
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_matches_played(player_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET matches_played = matches_played + 1
  WHERE id = player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: anyone can read, only owner can write
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Matches: anyone can read; authenticated users can create
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Matches are viewable by everyone" ON public.matches;
CREATE POLICY "Matches are viewable by everyone"
  ON public.matches FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.matches;
CREATE POLICY "Authenticated users can create matches"
  ON public.matches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Organizers can update their matches" ON public.matches;
CREATE POLICY "Organizers can update their matches"
  ON public.matches FOR UPDATE USING (auth.uid() = organizer_id);

-- Match participants: readable by all; insert/delete own rows only
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants viewable by everyone" ON public.match_participants;
CREATE POLICY "Participants viewable by everyone"
  ON public.match_participants FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Players can join matches" ON public.match_participants;
CREATE POLICY "Players can join matches"
  ON public.match_participants FOR INSERT WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players can leave matches" ON public.match_participants;
CREATE POLICY "Players can leave matches"
  ON public.match_participants FOR DELETE USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Organizers can update participants" ON public.match_participants;
CREATE POLICY "Organizers can update participants"
  ON public.match_participants FOR UPDATE
  USING (
    auth.uid() = player_id OR
    auth.uid() = (SELECT organizer_id FROM public.matches WHERE id = match_id)
  );

-- Ratings: rater can insert; aggregate shown (no SELECT on individual rows for non-rater)
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Raters can see their own ratings" ON public.ratings;
CREATE POLICY "Raters can see their own ratings"
  ON public.ratings FOR SELECT USING (auth.uid() = rater_id);

DROP POLICY IF EXISTS "Participants can submit ratings" ON public.ratings;
CREATE POLICY "Participants can submit ratings"
  ON public.ratings FOR INSERT WITH CHECK (
    auth.uid() = rater_id AND
    -- Both rater and rated must be participants
    EXISTS (
      SELECT 1 FROM public.match_participants
      WHERE match_id = ratings.match_id AND player_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.match_participants
      WHERE match_id = ratings.match_id AND player_id = ratings.rated_id
    )
  );

-- Follows: visible to all; insert/delete own rows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);
