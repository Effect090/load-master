"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Thermometer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useI18n } from "@/components/I18nProvider";

type Mode = "signin" | "signup";

function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const authError = searchParams.get("error");

  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t.auth.notConfigured}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>{t.auth.notConfiguredHint}</p>
          <Link href="/" className="text-primary hover:underline">
            {t.nav.back}
          </Link>
        </CardContent>
      </Card>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        setMessage(t.auth.checkEmail);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.auth.errorGeneric;
      const isNetwork =
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("networkerror") ||
        msg.toLowerCase().includes("load failed");
      setMessage(isNetwork ? t.auth.errorNetwork : msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {mode === "signin" ? t.auth.signIn : t.auth.signUp}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t.auth.subtitle}</p>
      </CardHeader>
      <CardContent>
        {authError && (
          <p className="text-sm text-destructive mb-4">{t.auth.errorGeneric}</p>
        )}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={mode === "signin" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("signin")}
          >
            {t.auth.signIn}
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("signup")}
          >
            {t.auth.signUp}
          </Button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label={t.auth.email}>
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label={t.auth.password}>
            <Input
              type="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {message && (
            <p
              className={`text-sm ${
                message === t.auth.checkEmail
                  ? "text-muted-foreground"
                  : "text-destructive"
              }`}
            >
              {message}
            </p>
          )}
          <Button type="submit" disabled={busy} className="w-full">
            {busy
              ? "…"
              : mode === "signin"
                ? t.auth.signIn
                : t.auth.signUp}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          {t.auth.localDataNote}
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b flex items-center px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <Thermometer className="size-5" />
          </div>
          <span className="text-sm font-semibold">{t.appName}</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">{t.auth.loading}</p>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
