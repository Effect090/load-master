-- ============================================================
-- CasaFoot Seed Data
-- NOTE: Run AFTER schema.sql
-- These are demo profiles — in production users sign up via auth.
-- For testing, create auth users first in the Supabase dashboard
-- or use the Auth API, then run this to populate their profiles.
-- ============================================================

-- The UUIDs below are placeholders — replace with real auth user UUIDs
-- or use the Supabase dashboard to create users, then update these IDs.

-- Demo users (create these in Supabase Auth first):
-- demo@casafoot.ma / demo1234
-- karim@casafoot.ma / demo1234
-- sara@casafoot.ma / demo1234

-- Sample profiles (update IDs after creating auth users)
INSERT INTO public.profiles (
  id, username, full_name, position, preferred_foot,
  neighborhood, bio,
  matches_played,
  stat_pace, stat_shooting, stat_passing, stat_dribbling,
  stat_defense, stat_physical, stat_fair_play,
  overall_rating, total_ratings_received
) VALUES
-- Demo user 1: Attacking Midfielder
(
  '00000000-0000-0000-0000-000000000001',
  'youssef_am',
  'Youssef El Amrani',
  'CAM',
  'right',
  'Maarif',
  'Addicted to football since 8. CAM or nothing 🎯',
  24,
  76, 82, 85, 88, 58, 74, 90,
  79, 18
),
-- Demo user 2: Striker
(
  '00000000-0000-0000-0000-000000000002',
  'karim_st',
  'Karim Benali',
  'ST',
  'left',
  'Hay Hassani',
  'Goal machine. Ask about my bicycle kick 🦅',
  31,
  88, 91, 72, 84, 45, 86, 82,
  82, 24
),
-- Demo user 3: Goalkeeper
(
  '00000000-0000-0000-0000-000000000003',
  'sara_gk',
  'Sara Mansouri',
  'GK',
  'right',
  'Anfa',
  'Walls don''t score. Neither do you. 🧤',
  19,
  72, 45, 70, 58, 88, 80, 95,
  74, 15
),
-- Demo user 4: Centre-back
(
  '00000000-0000-0000-0000-000000000004',
  'omar_cb',
  'Omar Tahiri',
  'CB',
  'right',
  'Racine',
  'No nonsense defender. Hard but fair. 🛡️',
  42,
  70, 55, 68, 62, 92, 87, 88,
  76, 35
),
-- Demo user 5: CM
(
  '00000000-0000-0000-0000-000000000005',
  'hamza_cm',
  'Hamza Ouali',
  'CM',
  'both',
  'California',
  'Box to box. Always in the right place.',
  28,
  78, 70, 82, 78, 75, 80, 86,
  78, 22
),
-- Demo user 6: Left Wing (elite tier)
(
  '00000000-0000-0000-0000-000000000006',
  'anas_lw',
  'Anas Chraibi',
  'LW',
  'left',
  'Bourgogne',
  'Pace, skill, assist. Repeat. ⚡',
  56,
  95, 82, 79, 93, 55, 90, 80,
  86, 45
),
-- Demo user 7: CDM
(
  '00000000-0000-0000-0000-000000000007',
  'fouad_cdm',
  'Fouad Ait Said',
  'CDM',
  'right',
  'Ben M''Sick',
  'I break up play so others can play.',
  35,
  72, 58, 72, 68, 88, 84, 92,
  77, 28
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  position = EXCLUDED.position,
  preferred_foot = EXCLUDED.preferred_foot,
  neighborhood = EXCLUDED.neighborhood,
  bio = EXCLUDED.bio,
  matches_played = EXCLUDED.matches_played,
  stat_pace = EXCLUDED.stat_pace,
  stat_shooting = EXCLUDED.stat_shooting,
  stat_passing = EXCLUDED.stat_passing,
  stat_dribbling = EXCLUDED.stat_dribbling,
  stat_defense = EXCLUDED.stat_defense,
  stat_physical = EXCLUDED.stat_physical,
  stat_fair_play = EXCLUDED.stat_fair_play,
  overall_rating = EXCLUDED.overall_rating,
  total_ratings_received = EXCLUDED.total_ratings_received;

-- ============================================================
-- SAMPLE MATCHES
-- ============================================================
INSERT INTO public.matches (
  id, title, organizer_id, location, field_name,
  date_time, max_players, current_players, skill_level,
  price_per_player, description, status
) VALUES
(
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Maarif Sunday Clash',
  '00000000-0000-0000-0000-000000000001',
  'Maarif, Casablanca',
  'Complexe Mohammed VI',
  NOW() + INTERVAL '2 days 15 hours',
  10, 6, 'intermediate',
  30, 'Weekly Sunday game. Bring your boots and good energy!',
  'open'
),
(
  'aaaaaaaa-0000-0000-0000-000000000002',
  'Hay Hassani Ballon d''Or',
  '00000000-0000-0000-0000-000000000002',
  'Hay Hassani, Casablanca',
  'Terrain Hay Hassani',
  NOW() + INTERVAL '1 day 18 hours',
  10, 8, 'advanced',
  50, 'High level game. Only advanced players. Come ready.',
  'open'
),
(
  'aaaaaaaa-0000-0000-0000-000000000003',
  'Anfa Friday Night Football',
  '00000000-0000-0000-0000-000000000003',
  'Anfa, Casablanca',
  'Stade El Harti',
  NOW() + INTERVAL '4 days 20 hours',
  14, 4, 'mixed',
  0, 'Free and fun! All levels welcome. Let''s play beautiful football.',
  'open'
),
(
  'aaaaaaaa-0000-0000-0000-000000000004',
  'Racine 11v11 Classic',
  '00000000-0000-0000-0000-000000000004',
  'Racine, Casablanca',
  'Complexe Hay Hassani',
  NOW() - INTERVAL '3 days',
  22, 20, 'intermediate',
  40, 'Full 11v11 game. Epic match.',
  'completed'
),
(
  'aaaaaaaa-0000-0000-0000-000000000005',
  'California Quick 7v7',
  '00000000-0000-0000-0000-000000000005',
  'California, Casablanca',
  NULL,
  NOW() + INTERVAL '6 days 16 hours',
  14, 3, 'beginner',
  20, 'Casual 7v7. Perfect for beginners and those returning to football.',
  'open'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SAMPLE MATCH PARTICIPANTS
-- ============================================================
INSERT INTO public.match_participants (match_id, player_id, confirmed_participated)
VALUES
-- Match 1: Maarif
('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', FALSE), -- organizer
('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', FALSE),
('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', FALSE),
('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', FALSE),
('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', FALSE),
('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', FALSE),
-- Match 2: Hay Hassani
('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', FALSE),
('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', FALSE),
('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', FALSE),
('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', FALSE),
('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', FALSE),
('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', FALSE),
('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', FALSE),
('aaaaaaaa-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', FALSE),
-- Match 3: Anfa
('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', FALSE),
('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', FALSE),
('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', FALSE),
('aaaaaaaa-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', FALSE),
-- Match 4: Racine (completed)
('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', TRUE),
('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', TRUE),
('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', TRUE),
('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', TRUE),
('aaaaaaaa-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', TRUE),
-- Match 5: California
('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', FALSE),
('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000007', FALSE),
('aaaaaaaa-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', FALSE)
ON CONFLICT (match_id, player_id) DO NOTHING;

-- ============================================================
-- SAMPLE FOLLOWS
-- ============================================================
INSERT INTO public.follows (follower_id, following_id) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006'), -- youssef follows anas
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'), -- youssef follows karim
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006'), -- karim follows anas
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006'),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;
