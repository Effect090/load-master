"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FormEvent,
} from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import type { MatchMessage, Profile } from "@/types";

interface MatchChatProps {
  matchId: string;
  currentUser: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
  isParticipant: boolean;
}

const MAX_LEN = 500;

export function MatchChat({ matchId, currentUser, isParticipant }: MatchChatProps) {
  const { t } = useLang();
  const [messages, setMessages]   = useState<MatchMessage[]>([]);
  const [draft, setDraft]         = useState("");
  const [sending, setSending]     = useState(false);
  const [sendError, setSendError] = useState(false);
  const [loading, setLoading]     = useState(true);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLTextAreaElement>(null);

  // Track seen ids to prevent duplicates between optimistic + realtime
  const seenIds = useRef(new Set<string>());

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Load initial messages
  useEffect(() => {
    if (!isParticipant) { setLoading(false); return; }

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("match_messages")
        .select("*, sender:profiles(id, username, full_name, avatar_url)")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data) {
        const msgs = data as unknown as MatchMessage[];
        msgs.forEach((m) => seenIds.current.add(m.id));
        setMessages(msgs);
      }
      setLoading(false);
    }

    load();
  }, [matchId, isParticipant]);

  // Scroll after messages load
  useEffect(() => {
    if (!loading) scrollToBottom("instant");
  }, [loading, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    if (!isParticipant) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`match-chat-${matchId}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "match_messages",
          filter: `match_id=eq.${matchId}`,
        },
        async (payload) => {
          const newMsg = payload.new as MatchMessage;

          // Skip if we already have this message (optimistic insert)
          if (seenIds.current.has(newMsg.id)) return;
          seenIds.current.add(newMsg.id);

          // Fetch the sender profile
          const { data: senderData } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", newMsg.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...newMsg, sender: senderData ?? undefined },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, isParticipant]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending || content.length > MAX_LEN) return;

    setSending(true);
    setSendError(false);
    setDraft("");

    const optimisticId = `opt-${Date.now()}`;
    const optimistic: MatchMessage = {
      id:         optimisticId,
      match_id:   matchId,
      sender_id:  currentUser.id,
      content,
      created_at: new Date().toISOString(),
      sender: {
        id:        currentUser.id,
        username:  currentUser.username,
        full_name: currentUser.full_name,
        avatar_url: currentUser.avatar_url,
      },
    };

    // Optimistic insert
    seenIds.current.add(optimisticId);
    setMessages((prev) => [...prev, optimistic]);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("match_messages")
      .insert({ match_id: matchId, sender_id: currentUser.id, content })
      .select("*, sender:profiles(id, username, full_name, avatar_url)")
      .single();

    if (error) {
      // Roll back optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      seenIds.current.delete(optimisticId);
      setSendError(true);
    } else {
      // Replace optimistic with real message
      const real = data as unknown as MatchMessage;
      seenIds.current.add(real.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? real : m))
      );
    }

    setSending(false);
    inputRef.current?.focus();
  }

  if (!isParticipant) {
    return (
      <div className="bg-cf-surface border border-cf-border rounded-2xl p-6 text-center">
        <p className="text-sm text-cf-dim">{t("chat.only_participants")}</p>
      </div>
    );
  }

  return (
    <div className="bg-cf-surface border border-cf-border rounded-2xl overflow-hidden flex flex-col">
      {/* Section title */}
      <div className="px-4 py-3 border-b border-cf-border/60 flex-shrink-0">
        <p className="text-xs font-bold text-cf-dim uppercase tracking-wider">
          {t("chat.title")}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-h-72 px-4 py-3 space-y-1">
        {loading && (
          <p className="text-xs text-cf-dim text-center py-4">{t("chat.loading")}</p>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center py-6 text-center gap-2">
            <span className="text-3xl">💬</span>
            <p className="text-sm font-semibold text-cf-muted">{t("chat.empty_title")}</p>
            <p className="text-xs text-cf-dim">{t("chat.empty_hint")}</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn    = msg.sender_id === currentUser.id;
          const prevMsg  = messages[i - 1];
          const grouped  = prevMsg?.sender_id === msg.sender_id;

          return (
            <MessageRow
              key={msg.id}
              message={msg}
              isOwn={isOwn}
              grouped={grouped}
            />
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {sendError && (
        <p className="text-xs text-red-400 text-center py-1 bg-red-500/10">
          {t("chat.error_send")}
        </p>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 px-4 py-3 border-t border-cf-border/60 flex-shrink-0"
      >
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as unknown as FormEvent);
            }
          }}
          placeholder={t("chat.placeholder")}
          rows={1}
          maxLength={MAX_LEN}
          className={cn(
            "flex-1 resize-none bg-cf-surface-2 border border-cf-border rounded-2xl",
            "px-3 py-2.5 text-sm text-cf-text placeholder:text-cf-dim",
            "outline-none focus:border-cf-border/80 transition-colors",
            "max-h-28 overflow-y-auto"
          )}
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
            draft.trim() && !sending
              ? "bg-green-600 text-white hover:bg-green-500 active:scale-95"
              : "bg-cf-surface-2 border border-cf-border text-cf-dim cursor-not-allowed"
          )}
          aria-label={t("chat.send")}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function MessageRow({
  message,
  isOwn,
  grouped,
}: {
  message: MatchMessage;
  isOwn: boolean;
  grouped: boolean;
}) {
  const sender = message.sender;
  const time   = new Date(message.created_at).toLocaleTimeString("fr-MA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isOwn) {
    return (
      <div className={cn("flex flex-col items-end", grouped ? "mt-0.5" : "mt-3")}>
        <div className="max-w-[78%] bg-green-600 rounded-2xl rounded-br-sm px-3 py-2">
          <p className="text-sm text-white leading-relaxed break-words">{message.content}</p>
        </div>
        {!grouped && (
          <span className="text-[10px] text-cf-dim mt-0.5 mr-1">{time}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-end gap-2", grouped ? "mt-0.5 pl-8" : "mt-3")}>
      {!grouped && (
        <Avatar
          src={sender?.avatar_url ?? null}
          username={sender?.username ?? "?"}
          size="xs"
          className="flex-shrink-0 mb-0.5"
        />
      )}
      <div className="max-w-[78%]">
        {!grouped && (
          <p className="text-[10px] text-cf-dim mb-0.5 ml-1">
            {sender?.full_name ?? sender?.username ?? ""}
          </p>
        )}
        <div className="bg-cf-surface-2 border border-cf-border rounded-2xl rounded-bl-sm px-3 py-2">
          <p className="text-sm text-cf-text leading-relaxed break-words">{message.content}</p>
        </div>
        {!grouped && (
          <span className="text-[10px] text-cf-dim mt-0.5 ml-1">{time}</span>
        )}
      </div>
    </div>
  );
}
