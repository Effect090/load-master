"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLang } from "@/lib/i18n";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setAuthError(
        error.message === "Invalid login credentials"
          ? t("auth.login.wrong_credentials")
          : error.message
      );
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-16 pb-8 max-w-md mx-auto w-full">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-green-600/20 border border-green-600/40 flex items-center justify-center mb-4 shadow-green-glow">
          <span className="text-3xl">⚽</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">CasaFoot</h1>
        <p className="text-cf-muted text-sm mt-1">{t("auth.app_tagline")}</p>
      </div>

      {/* Form */}
      <div className="flex-1">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">{t("auth.login.title")}</h2>
          <p className="text-cf-muted mt-1 text-sm">{t("auth.login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t("auth.login.email_label")}
            type="email"
            placeholder={t("auth.login.email_placeholder")}
            autoComplete="email"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label={t("auth.login.password_label")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-cf-dim hover:text-cf-muted transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
          />

          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{authError}</p>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
            {t("auth.login.submit")}
          </Button>
        </form>

        <div className="mt-4 p-3 rounded-xl bg-cf-surface border border-cf-border">
          <p className="text-xs text-cf-dim text-center">{t("auth.login.demo_hint")}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-cf-muted text-sm">
          {t("auth.login.no_account")}{" "}
          <Link href="/signup" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
            {t("auth.login.signup_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
