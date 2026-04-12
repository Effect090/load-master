"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Match, MatchStatus } from "@/types";
import { MatchCard } from "@/components/MatchCard";
import { Input } from "@/components/ui/Input";
import { useLang } from "@/lib/i18n";

type Tab = "open" | "my" | "completed";

export default function MatchesPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("open");

  const TABS: { key: Tab; label: string }[] = [
    { key: "open",      label: t("matches.tab.open")      },
    { key: "my",        label: t("matches.tab.my")        },
    { key: "completed", label: t("matches.tab.completed") },
  ];
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        let query = supabase
          .from("matches")
          .select("*, organizer:profiles!matches_organizer_id_fkey(*), participants:match_participants(player:profiles(*))")
          .order("date_time", { ascending: tab !== "completed" });

        if (tab === "open") {
          query = query.eq("status", "open");
        } else if (tab === "completed") {
          query = query.eq("status", "completed");
        } else if (tab === "my") {
          const { data: participations } = await supabase
            .from("match_participants")
            .select("match_id")
            .eq("player_id", user.id);

          const participatedIds = (participations ?? []).map((p) => p.match_id);
          query = query.or(
            `organizer_id.eq.${user.id}${participatedIds.length ? `,id.in.(${participatedIds.join(",")})` : ""}`
          );
        }

        const { data } = await query.limit(30);
        setMatches((data as unknown as Match[]) ?? []);
      } catch (err) {
        console.error("Matches load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tab]);

  const filtered = search.trim()
    ? matches.filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.location.toLowerCase().includes(search.toLowerCase()) ||
          m.field_name?.toLowerCase().includes(search.toLowerCase())
      )
    : matches;

  return (
    <div className="page-content px-4 pt-6 pb-4">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-black text-white">{t("matches.page_title")}</h1>
        <p className="text-cf-muted text-sm mt-0.5">{t("matches.page_subtitle")}</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder={t("matches.search_placeholder")}
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-cf-surface rounded-2xl border border-cf-border mb-5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 h-9 rounded-xl text-sm font-semibold transition-all duration-200",
              tab === key
                ? "bg-green-600/20 text-green-400 border border-green-600/30"
                : "text-cf-dim hover:text-cf-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Match list */}
      {loading ? (
        <MatchesSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="space-y-3">
          {filtered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              currentUserId={userId ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const { t } = useLang();
  const messages: Record<Tab, { emoji: string; title: string; body: string }> = {
    open: {
      emoji: "🌿",
      title: t("matches.empty.open.title"),
      body:  t("matches.empty.open.body"),
    },
    my: {
      emoji: "📅",
      title: t("matches.empty.my.title"),
      body:  t("matches.empty.my.body"),
    },
    completed: {
      emoji: "🏁",
      title: t("matches.empty.completed.title"),
      body:  t("matches.empty.completed.body"),
    },
  };

  const msg = messages[tab];
  return (
    <div className="flex flex-col items-center text-center py-16 gap-3">
      <span className="text-5xl">{msg.emoji}</span>
      <p className="text-cf-text font-bold text-lg">{msg.title}</p>
      <p className="text-cf-muted text-sm max-w-[240px]">{msg.body}</p>
    </div>
  );
}

function MatchesSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-40 bg-cf-surface rounded-2xl border border-cf-border" />
      ))}
    </div>
  );
}
