# ⚽ CasaFoot

**The social football app for Casablanca, Morocco.**

Find matches, join games, rate players, and build your FIFA-style player card.

---

## Product Overview

CasaFoot helps amateur football players in Casablanca:
- **Discover & create matches** across the city
- **Join games** near their neighborhood
- **Rate each other** after matches (structured, fair, abuse-resistant)
- **Build a player card** with an overall rating and 6 sub-stats (like FIFA)

The main differentiator: after each completed match, verified participants can rate each other across 5 categories. The app generates a beautiful, shareable FIFA-inspired card that evolves with your real-world performance.

---

## Tech Stack

| Layer       | Tech                        |
|-------------|-----------------------------|
| Frontend    | Next.js 14 (App Router)     |
| Styling     | Tailwind CSS (custom tokens)|
| Backend     | Supabase (Auth, DB, Storage)|
| Auth        | Supabase Auth (email/pass)  |
| Language    | TypeScript                  |
| Forms       | React Hook Form + Zod       |
| Animations  | Framer Motion               |

---

## Getting Started

### 1. Clone & Install

```bash
cd d:\Projects\footlink
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the Supabase dashboard, go to **SQL Editor**
3. Run the contents of `supabase/schema.sql` (creates all tables, RLS, triggers)
4. Optionally run `supabase/seed.sql` for sample data

### 3. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase → **Settings → API**.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Signup pages
│   │   ├── login/
│   │   └── signup/
│   ├── (app)/            # Authenticated pages (with BottomNav)
│   │   ├── feed/         # Home feed
│   │   ├── matches/      # Match list, create, detail
│   │   │   ├── [id]/     # Match detail + join/rate
│   │   │   └── create/   # Create match form
│   │   ├── profile/      # Own profile
│   │   │   └── [id]/     # Other player's profile
│   │   └── onboarding/   # First-time profile setup
│   ├── layout.tsx        # Root layout (fonts, meta)
│   └── page.tsx          # Root redirect
├── components/
│   ├── ui/               # Base components (Button, Input, etc.)
│   ├── PlayerCard.tsx    # FIFA-style card (full + compact)
│   ├── MatchCard.tsx     # Match list card
│   ├── BottomNav.tsx     # Mobile navigation bar
│   └── RatingModal.tsx   # Post-match rating sheet
├── lib/
│   ├── supabase/         # Supabase client/server helpers
│   ├── rating.ts         # Rating calculation logic
│   └── utils.ts          # Helpers, design tokens
└── types/
    └── index.ts          # All TypeScript types

supabase/
├── schema.sql            # Full DB schema with RLS
└── seed.sql              # Sample data
```

---

## Features

### Authentication
- Email/password signup & login via Supabase Auth
- Auto profile creation on signup
- 3-step onboarding (name → position → location)
- Protected routes via Next.js middleware

### Player Profile & Card
- Full name, username, avatar
- Position, preferred foot, neighborhood, bio
- **FIFA-style card** with 4 tiers: Bronze (40–59) / Silver (60–74) / Gold (75–84) / Elite (85+)
- 7 stats on card: PAC · SHO · PAS · DRI · DEF · PHY · FP

### Match System
- Create matches: title, location, date/time, player count (slider), skill level, price
- Join / leave matches
- View player list with ratings
- Organizer can mark matches as completed

### Rating System
- Only verified match participants can rate
- No self-rating (enforced at DB level via CHECK constraint)
- 5 categories: Technique · Passing/Vision · Defense · Physical · Fair Play
- 1–5 scale per category
- **Bayesian weighted average** to prevent abuse from small samples
- Individual ratings are **private** — only aggregated stats shown publicly
- Stats update live on the player's card after each rating

### Social Layer
- View other players' profiles and cards
- Follow/unfollow players
- Activity in feed (upcoming matches near you, top players)

---

## Rating Calculation

```
Rating categories → Card stats mapping:
  pace       ← physical_impact
  shooting   ← technique
  dribbling  ← technique (small variance)
  passing    ← passing_vision
  defense    ← defense
  physical   ← physical_impact
  fair_play  ← fair_play

Scale: 1–5 rating → 40–99 card scale
  formula: 40 + (rating - 1) × 14.75

Overall (weighted):
  PAC×14% + SHO×18% + PAS×20% + DRI×16% + DEF×14% + PHY×10% + FP×8%

Bayesian prior (abuse prevention):
  Before 3 ratings, stats stay close to neutral (50)
  Each new rating is weighted equally
  Formula: (3×3 + n×current + incoming) / (3 + n + 1)
```

---

## Design System

| Token         | Value        | Usage                    |
|---------------|--------------|--------------------------|
| `cf-bg`       | `#07090F`    | Main background          |
| `cf-surface`  | `#0F1525`    | Cards, surfaces          |
| `cf-surface-2`| `#151E30`    | Elevated surfaces        |
| `cf-border`   | `#1E2D3D`    | Borders                  |
| `green-600`   | `#16A34A`    | Primary CTA, active nav  |
| `gold-DEFAULT`| `#F0B429`    | Gold tier, ratings       |
| `cf-text`     | `#EFF2F7`    | Primary text             |
| `cf-muted`    | `#8892A4`    | Secondary text           |

Typography: **Outfit** from Google Fonts (300–900 weights)

---

## Roadmap (Post-MVP)

- [ ] Push notifications (new match invites, rating received)
- [ ] Map view of matches (Google Maps / Mapbox)
- [ ] Photo upload for avatars (Supabase Storage)
- [ ] Position-specific weighted stats (GK weights ≠ ST weights)
- [ ] Match invitations (share link)
- [ ] League/tournament system
- [ ] Player comparison
- [ ] Dark/light theme toggle
- [ ] React Native app (using same Supabase backend)

---

## License

MIT — build on top of it freely.

---

*Built with love for Casablanca's football community. ⚽🇲🇦*
