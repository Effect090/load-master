"use client";

import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/I18nProvider";

export function UserMenu({ compact }: { compact?: boolean }) {
  const { user, loading, signOut, configured } = useAuth();
  const { t } = useI18n();

  if (!configured) {
    return null;
  }

  if (loading) {
    return (
      <span className="text-xs text-muted-foreground">{t.auth.loading}</span>
    );
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" size={compact ? "sm" : "md"}>
          <LogIn className="size-4" />
          {t.auth.signIn}
        </Button>
      </Link>
    );
  }

  const email = user.email ?? user.id.slice(0, 8);

  return (
    <div className="flex items-center gap-2 min-w-0">
      {!compact && (
        <span
          className="text-xs text-muted-foreground truncate max-w-[140px]"
          title={email}
        >
          {email}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void signOut()}
        title={t.auth.signOut}
      >
        <LogOut className="size-4" />
        {!compact && <span className="hidden sm:inline">{t.auth.signOut}</span>}
      </Button>
    </div>
  );
}

