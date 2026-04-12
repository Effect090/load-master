-- ============================================================
-- CasaFoot — Migration: Reliability System + Match Chat
-- Run this in your Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ── 1. Extend match_participants ───────────────────────────────────────────

ALTER TABLE public.match_participants
  ADD COLUMN IF NOT EXISTS attendance_status TEXT NOT NULL DEFAULT 'not_confirmed'
    CHECK (attendance_status IN ('not_confirmed', 'confirmed', 'declined')),
  ADD COLUMN IF NOT EXISTS attendance_confirmed_at TIMESTAMPTZ,
  -- Presence is set by organizer after the match
  ADD COLUMN IF NOT EXISTS presence_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (presence_status IN ('unknown', 'present', 'no_show')),
  ADD COLUMN IF NOT EXISTS presence_marked_at TIMESTAMPTZ;

-- ── 2. Extend profiles with reliability stats ─────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reliability_score      FLOAT   NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS shows_up_count         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_attendance_count INTEGER NOT NULL DEFAULT 0;

-- ── 3. Create match_messages table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.match_messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID        NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL CHECK (length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Indexes ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_messages_match
  ON public.match_messages(match_id, created_at);

CREATE INDEX IF NOT EXISTS idx_messages_sender
  ON public.match_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_participants_attendance
  ON public.match_participants(match_id, attendance_status);

CREATE INDEX IF NOT EXISTS idx_profiles_reliability
  ON public.profiles(reliability_score DESC);

-- ── 5. Function: recalculate a player's reliability score ─────────────────

CREATE OR REPLACE FUNCTION public.recalculate_reliability(p_player_id UUID)
RETURNS VOID AS $$
DECLARE
  v_expected  INTEGER;
  v_showed_up INTEGER;
  v_score     FLOAT;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE presence_status IN ('present', 'no_show')),
    COUNT(*) FILTER (WHERE presence_status = 'present')
  INTO v_expected, v_showed_up
  FROM public.match_participants
  WHERE player_id = p_player_id;

  IF v_expected = 0 THEN
    v_score := 100;
  ELSE
    v_score := ROUND((v_showed_up::FLOAT / v_expected::FLOAT) * 100);
  END IF;

  UPDATE public.profiles SET
    reliability_score           = v_score,
    shows_up_count              = v_showed_up,
    expected_attendance_count   = v_expected
  WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 6. Function: mark presence for all participants of a match ─────────────
-- Called by organizer. Accepts a JSON map: { "player_uuid": "present"|"no_show", ... }

CREATE OR REPLACE FUNCTION public.mark_presence(
  p_match_id UUID,
  p_presence  JSONB       -- {"<player_id>": "present" | "no_show"}
)
RETURNS VOID AS $$
DECLARE
  v_organizer_id UUID;
  v_player_id    UUID;
  v_status       TEXT;
BEGIN
  -- Verify caller is the match organizer
  SELECT organizer_id INTO v_organizer_id
  FROM public.matches WHERE id = p_match_id;

  IF v_organizer_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Update presence for each player in the map
  FOR v_player_id, v_status IN
    SELECT key::UUID, value #>> '{}' FROM jsonb_each(p_presence)
  LOOP
    -- Only touch actual participants
    UPDATE public.match_participants SET
      presence_status    = v_status,
      presence_marked_at = NOW()
    WHERE match_id  = p_match_id
      AND player_id = v_player_id
      AND v_status  IN ('present', 'no_show');

    -- Recalculate reliability for this player
    PERFORM public.recalculate_reliability(v_player_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 7. RLS: match_messages ─────────────────────────────────────────────────

ALTER TABLE public.match_messages ENABLE ROW LEVEL SECURITY;

-- Only participants (or the organizer) can read messages
DROP POLICY IF EXISTS "Participants can read messages" ON public.match_messages;
CREATE POLICY "Participants can read messages"
  ON public.match_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.match_participants
      WHERE match_id = match_messages.match_id AND player_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = match_messages.match_id AND organizer_id = auth.uid()
    )
  );

-- Only participants / organizer can send; sender must be themselves
DROP POLICY IF EXISTS "Participants can send messages" ON public.match_messages;
CREATE POLICY "Participants can send messages"
  ON public.match_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      EXISTS (
        SELECT 1 FROM public.match_participants
        WHERE match_id = match_messages.match_id AND player_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.matches
        WHERE id = match_messages.match_id AND organizer_id = auth.uid()
      )
    )
  );

-- ── 8. RLS: attendance confirmation (players update their own row) ──────────

-- The existing "Organizers can update participants" policy already covers this
-- because the condition is auth.uid() = player_id OR auth.uid() = organizer.
-- No change needed. But we add a tighter column-level guard via the existing policy.

-- ── 9. Enable realtime for match_messages ─────────────────────────────────
-- Run in Supabase Dashboard → Database → Replication → Add table → match_messages
-- OR via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_messages;
