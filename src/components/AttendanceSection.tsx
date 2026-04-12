"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import type { AttendanceStatus, MatchParticipant, Profile } from "@/types";

interface AttendanceSectionProps {
  matchId: string;
  matchDateTime: string;
  participants: (MatchParticipant & { player: Profile })[];
  currentUserId: string | null;
  isOrganizer: boolean;
  onUpdate?: () => void;
}

/** Returns true if within the 24-hour pre-match confirmation window */
function isConfirmationOpen(matchDateTime: string): boolean {
  const matchMs  = new Date(matchDateTime).getTime();
  const nowMs    = Date.now();
  const diff     = matchMs - nowMs;
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

export function AttendanceSection({
  matchId,
  matchDateTime,
  participants,
  currentUserId,
  isOrganizer,
  onUpdate,
}: AttendanceSectionProps) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  const myParticipant = participants.find((p) => p.player_id === currentUserId);
  const open          = isConfirmationOpen(matchDateTime);

  const confirmed = participants.filter((p) => p.attendance_status === "confirmed");
  const pending   = participants.filter((p) => p.attendance_status === "not_confirmed");
  const declined  = participants.filter((p) => p.attendance_status === "declined");

  async function setAttendance(status: AttendanceStatus) {
    if (!currentUserId || !myParticipant) return;
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("match_participants")
      .update({
        attendance_status:        status,
        attendance_confirmed_at:  status === "confirmed" ? new Date().toISOString() : null,
      })
      .eq("match_id", matchId)
      .eq("player_id", currentUserId);
    setLoading(false);
    onUpdate?.();
  }

  const myStatus = myParticipant?.attendance_status ?? "not_confirmed";

  return (
    <div className="bg-cf-surface border border-cf-border rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-cf-dim uppercase tracking-wider">
          {t("attendance.section_title")}
        </p>
        <span className="text-xs text-cf-dim">
          {t("attendance.players_confirmed", { n: confirmed.length })}
        </span>
      </div>

      {/* Confirmation window hint for non-organizer, non-open window */}
      {!open && myStatus === "not_confirmed" && !isOrganizer && (
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 mb-3">
          <Clock className="w-3.5 h-3.5 text-cf-dim flex-shrink-0" />
          <p className="text-xs text-cf-dim">{t("attendance.window_hint")}</p>
        </div>
      )}

      {/* My attendance CTA (current user is a participant) */}
      {myParticipant && !isOrganizer && (
        <div className="mb-4">
          {myStatus === "confirmed" ? (
            <div className="flex items-center justify-between bg-green-600/10 border border-green-600/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-green-400">
                  {t("attendance.confirmed_state")}
                </span>
              </div>
              {open && (
                <button
                  onClick={() => setAttendance("not_confirmed")}
                  disabled={loading}
                  className="text-xs text-cf-dim hover:text-cf-muted transition-colors"
                >
                  {t("attendance.change_mind")}
                </button>
              )}
            </div>
          ) : myStatus === "declined" ? (
            <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-red-400">
                  {t("attendance.declined_state")}
                </span>
              </div>
              {open && (
                <button
                  onClick={() => setAttendance("confirmed")}
                  disabled={loading}
                  className="text-xs text-cf-dim hover:text-cf-muted transition-colors"
                >
                  {t("attendance.change_mind")}
                </button>
              )}
            </div>
          ) : open ? (
            <div className="flex gap-2">
              <button
                onClick={() => setAttendance("confirmed")}
                disabled={loading}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]",
                  "bg-green-600 text-white hover:bg-green-500 disabled:opacity-60"
                )}
              >
                {loading ? "…" : t("attendance.confirm_cta")}
              </button>
              <button
                onClick={() => setAttendance("declined")}
                disabled={loading}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]",
                  "bg-cf-surface-2 border border-cf-border text-cf-muted hover:text-cf-text disabled:opacity-60"
                )}
              >
                {t("attendance.decline_cta")}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Organizer summary */}
      {isOrganizer && (
        <p className="text-sm text-cf-muted mb-3">
          {t("attendance.organizer_summary", {
            confirmed: confirmed.length,
            pending:   pending.length + declined.length,
          })}
        </p>
      )}

      {/* Player grid */}
      {participants.length > 0 && (
        <div className="space-y-2">
          {confirmed.map((p) => (
            <AttendanceRow key={p.id} participant={p} status="confirmed" />
          ))}
          {declined.map((p) => (
            <AttendanceRow key={p.id} participant={p} status="declined" />
          ))}
          {pending.map((p) => (
            <AttendanceRow key={p.id} participant={p} status="not_confirmed" />
          ))}
        </div>
      )}
    </div>
  );
}

function AttendanceRow({
  participant,
  status,
}: {
  participant: MatchParticipant & { player: Profile };
  status: AttendanceStatus;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        src={participant.player.avatar_url}
        username={participant.player.username}
        size="xs"
      />
      <span className="flex-1 text-sm text-cf-muted truncate">
        {participant.player.full_name ?? participant.player.username}
      </span>
      <span
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
          status === "confirmed"    && "bg-green-600/20",
          status === "declined"     && "bg-red-500/20",
          status === "not_confirmed"&& "bg-white/5"
        )}
      >
        {status === "confirmed"     && <CheckCircle2 className="w-3 h-3 text-green-400" />}
        {status === "declined"      && <XCircle       className="w-3 h-3 text-red-400"   />}
        {status === "not_confirmed" && <Clock         className="w-3 h-3 text-cf-dim"    />}
      </span>
    </div>
  );
}
