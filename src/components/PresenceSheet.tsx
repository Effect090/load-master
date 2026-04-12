"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { MatchParticipant, Profile, PresenceStatus } from "@/types";

interface PresenceSheetProps {
  matchId: string;
  participants: (MatchParticipant & { player: Profile })[];
  currentUserId: string;
  onComplete: () => void;
  onSkip: () => void;
  onClose: () => void;
}

type LocalPresence = Record<string, PresenceStatus>;

export function PresenceSheet({
  matchId,
  participants,
  currentUserId,
  onComplete,
  onSkip,
  onClose,
}: PresenceSheetProps) {
  const { t } = useLang();

  // Default everyone to "present"; organizer can mark no-shows
  const initialPresence: LocalPresence = Object.fromEntries(
    participants.map((p) => [p.player_id, "present" as PresenceStatus])
  );
  const [presence, setPresence] = useState<LocalPresence>(initialPresence);
  const [saving, setSaving]     = useState(false);

  function toggle(playerId: string) {
    setPresence((prev) => ({
      ...prev,
      [playerId]: prev[playerId] === "present" ? "no_show" : "present",
    }));
  }

  async function handleConfirm() {
    setSaving(true);
    const supabase = createClient();

    // Call the server-side function that marks presence + recalculates reliability
    await supabase.rpc("mark_presence", {
      p_match_id: matchId,
      p_presence:  presence,
    });

    setSaving(false);
    onComplete();
  }

  // Sort: other participants first, then current user at the end
  const sorted = [...participants].sort((a) =>
    a.player_id === currentUserId ? 1 : -1
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-cf-surface rounded-t-3xl border-t border-cf-border overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-cf-border/60 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{t("presence.sheet_title")}</h2>
            <p className="text-xs text-cf-dim mt-0.5">{t("presence.sheet_subtitle")}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cf-surface-2 border border-cf-border flex items-center justify-center text-cf-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto py-3">
          {sorted.map((p) => {
            const isPresent = presence[p.player_id] === "present";
            const isSelf    = p.player_id === currentUserId;
            return (
              <button
                key={p.player_id}
                onClick={() => !isSelf && toggle(p.player_id)}
                disabled={isSelf}
                className={cn(
                  "flex items-center gap-3 w-full px-5 py-3 transition-colors",
                  !isSelf && "active:bg-cf-surface-2",
                  isSelf  && "opacity-60 cursor-default"
                )}
              >
                <Avatar
                  src={p.player.avatar_url}
                  username={p.player.username}
                  size="sm"
                />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {p.player.full_name ?? p.player.username}
                    {isSelf && (
                      <span className="text-[10px] text-cf-dim ml-1.5">(toi)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-cf-dim">@{p.player.username}</p>
                </div>

                {/* Toggle pill */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
                    isPresent
                      ? "bg-green-600/15 border-green-600/30 text-green-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}
                >
                  {isPresent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("presence.present")}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      {t("presence.no_show")}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 px-5 pt-3 pb-6 border-t border-cf-border/60 flex-shrink-0">
          <Button fullWidth size="lg" loading={saving} onClick={handleConfirm}>
            {t("presence.confirm_cta")}
          </Button>
          <button
            onClick={onSkip}
            className="text-sm text-cf-dim py-2 hover:text-cf-muted transition-colors"
          >
            {t("presence.skip")}
          </button>
        </div>
      </div>
    </>
  );
}
