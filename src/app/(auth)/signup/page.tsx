"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLang } from "@/lib/i18n";

const schema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be 20 characters or less")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setAuthError(null);
    const supabase = createClient();

    // Check username uniqueness
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username)
      .maybeSingle();

    if (existing) {
      setAuthError("Username already taken. Choose another one.");
      return;
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { username: data.username } },
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (authData.user) {
      // Create profile row (upsert in case trigger already ran)
      await supabase.from("profiles").upsert({
        id: authData.user.id,
        username: data.username,
        full_name: null,
      }, { onConflict: "id" });
    }

    // If no session, Supabase requires email confirmation first.
    // Redirect only once the session is actually active.
    if (!authData.session) {
      setAwaitingConfirmation(true);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  if (awaitingConfirmation) {
    return (
      <div className="flex flex-col min-h-screen px-6 pt-16 pb-8 max-w-md mx-auto w-full items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-600/20 border border-green-600/40 flex items-center justify-center mb-6 shadow-green-glow">
          <Mail className="w-7 h-7 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t("auth.signup.check_inbox_title")}</h2>
        <p className="text-cf-muted text-sm leading-relaxed mb-6">{t("auth.signup.check_inbox_body")}</p>
        <Link href="/login" className="text-green-400 font-semibold hover:text-green-300 transition-colors text-sm">
          {t("auth.signup.go_to_login")}
        </Link>
      </div>
    );
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
          <h2 className="text-2xl font-bold text-white">{t("auth.signup.title")}</h2>
          <p className="text-cf-muted mt-1 text-sm">{t("auth.signup.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t("auth.signup.username_label")}
            type="text"
            placeholder="ton_username"
            autoComplete="username"
            autoCapitalize="none"
            leftIcon={<User className="w-4 h-4" />}
            hint={t("auth.signup.username_hint")}
            error={errors.username?.message}
            {...register("username")}
          />

          <Input
            label={t("auth.signup.email_label")}
            type="email"
            placeholder="toi@exemple.com"
            autoComplete="email"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label={t("auth.signup.password_label")}
            type={showPassword ? "text" : "password"}
            placeholder="Au moins 8 caractères"
            autoComplete="new-password"
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

          <Input
            label={t("auth.signup.confirm_label")}
            type={showPassword ? "text" : "password"}
            placeholder="Répète ton mot de passe"
            autoComplete="new-password"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirm?.message}
            {...register("confirm")}
          />

          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{authError}</p>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
            {t("auth.signup.submit")}
          </Button>
        </form>

        <p className="text-[11px] text-cf-dim text-center mt-4 leading-relaxed">
          By signing up, you agree to play fair and keep the community respectful.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-cf-muted text-sm">
          {t("auth.signup.already_account")}{" "}
          <Link href="/login" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
            {t("auth.signup.login_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
