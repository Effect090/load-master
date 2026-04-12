"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { NEIGHBORHOODS, POSITION_LABELS } from "@/lib/utils";
import { Position } from "@/types";
import { useLang } from "@/lib/i18n";

const POSITIONS: Position[] = ["GK","CB","LB","RB","CDM","CM","CAM","LW","RW","ST","CF"];
const POSITION_SHORT_LABELS: Record<Position, string> = POSITION_LABELS as Record<Position, string>;

const step1Schema = z.object({
  full_name: z.string().min(2, "Enter your full name").max(50),
});
const step2Schema = z.object({
  position: z.enum(["GK","CB","LB","RB","CDM","CM","CAM","LW","RW","ST","CF"] as const),
  preferred_foot: z.enum(["left","right","both"] as const),
});
const step3Schema = z.object({
  neighborhood: z.string().min(1, "Pick your area"),
  bio: z.string().max(160).optional(),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

// Step labels resolved at render time inside component

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [step1Data, setStep1Data] = useState<Step1 | null>(null);
  const [step2Data, setStep2Data] = useState<Step2 | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema) });

  async function onStep1(data: Step1) {
    setStep1Data(data);
    setStep(1);
  }

  async function onStep2(data: Step2) {
    setStep2Data(data);
    setStep(2);
  }

  async function onStep3(data: Step3) {
    if (!step1Data || !step2Data) return;
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      setSaveError(t("onboarding.error_session"));
      setSaving(false);
      router.replace("/login");
      return;
    }

    // Use upsert so it works whether the row exists or not
    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      username: user.user_metadata?.username ?? user.email?.split("@")[0] ?? "player",
      full_name: step1Data.full_name,
      position: step2Data.position,
      preferred_foot: step2Data.preferred_foot,
      neighborhood: data.neighborhood,
      bio: data.bio ?? null,
    }, { onConflict: "id" });

    if (upsertError) {
      setSaveError(`Error saving profile: ${upsertError.message}`);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/feed");
    router.refresh();
  }

  const STEPS = [
    t("onboarding.step_labels.identity"),
    t("onboarding.step_labels.position"),
    t("onboarding.step_labels.location"),
  ];

  return (
    <div className="min-h-screen bg-[#07090F] flex flex-col px-6 pt-12 pb-8 max-w-md mx-auto w-full">
      <div className="fixed top-0 inset-x-0 h-64 bg-gradient-to-b from-green-600/8 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">⚽</span>
          <span className="text-xl font-black text-white">CasaFoot</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  i < step
                    ? "bg-green-600 text-white"
                    : i === step
                    ? "bg-green-600/20 border-2 border-green-600/60 text-green-400"
                    : "bg-cf-surface border border-cf-border text-cf-dim"
                )}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block", i === step ? "text-cf-text" : "text-cf-dim")}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn("h-px flex-1 w-8 mx-1", i < step ? "bg-green-600/60" : "bg-cf-border")} />
              )}
            </div>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-white">
          {step === 0 && t("onboarding.step1.title")}
          {step === 1 && t("onboarding.step2.title")}
          {step === 2 && t("onboarding.step3.title")}
        </h1>
        <p className="text-cf-muted text-sm mt-1">
          {step === 0 && t("onboarding.step1.subtitle")}
          {step === 1 && t("onboarding.step2.subtitle")}
          {step === 2 && t("onboarding.step3.subtitle")}
        </p>
      </div>

      {/* Step content */}
      <div className="relative z-10 flex-1">
        {step === 0 && (
          <form onSubmit={form1.handleSubmit(onStep1)} className="flex flex-col gap-4">
            <Input
              label={t("onboarding.step1.name_label")}
              placeholder={t("onboarding.step1.name_placeholder")}
              autoFocus
              error={form1.formState.errors.full_name?.message}
              {...form1.register("full_name")}
            />
            <div className="mt-4">
              <Button type="submit" fullWidth size="lg">
                {t("onboarding.cta_continue")} <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={form2.handleSubmit(onStep2)} className="flex flex-col gap-6">
            {/* Position picker */}
            <div>
              <p className="text-sm font-medium text-cf-muted mb-3">{t("onboarding.step2.position_label")}</p>
              <div className="grid grid-cols-4 gap-2">
                {POSITIONS.map((pos) => {
                  const selected = form2.watch("position") === pos;
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => form2.setValue("position", pos, { shouldValidate: true })}
                      className={cn(
                        "h-12 rounded-xl border font-bold text-sm transition-all duration-150 active:scale-95",
                        selected
                          ? "bg-green-600/20 border-green-600/50 text-green-400 shadow-green-glow"
                          : "bg-cf-surface border-cf-border text-cf-muted hover:border-cf-border/80"
                      )}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>
              {form2.formState.errors.position && (
                <p className="text-xs text-red-400 mt-1">
                  {form2.formState.errors.position.message}
                </p>
              )}
            </div>

            {/* Preferred foot */}
            <div>
              <p className="text-sm font-medium text-cf-muted mb-3">{t("onboarding.step2.foot_label")}</p>
              <div className="flex gap-3">
                {(["left", "right", "both"] as const).map((foot) => {
                  const selected = form2.watch("preferred_foot") === foot;
                  const footLabel = foot === "left"
                    ? t("onboarding.step2.foot_left")
                    : foot === "right"
                    ? t("onboarding.step2.foot_right")
                    : t("onboarding.step2.foot_both");
                  return (
                    <button
                      key={foot}
                      type="button"
                      onClick={() => form2.setValue("preferred_foot", foot, { shouldValidate: true })}
                      className={cn(
                        "flex-1 h-12 rounded-xl border font-semibold text-sm transition-all duration-150 active:scale-95",
                        selected
                          ? "bg-green-600/20 border-green-600/50 text-green-400"
                          : "bg-cf-surface border-cf-border text-cf-muted"
                      )}
                    >
                      {footLabel}
                    </button>
                  );
                })}
              </div>
              {form2.formState.errors.preferred_foot && (
                <p className="text-xs text-red-400 mt-1">
                  {form2.formState.errors.preferred_foot.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(0)}>
                <ChevronLeft className="w-4 h-4" /> {t("onboarding.cta_back")}
              </Button>
              <Button type="submit" size="lg" className="flex-2">
                {t("onboarding.cta_continue")} <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={form3.handleSubmit(onStep3)} className="flex flex-col gap-4">
            <Select
              label={t("onboarding.step3.neighborhood_label")}
              placeholder={t("onboarding.step3.neighborhood_label")}
              options={NEIGHBORHOODS.map((n) => ({ value: n, label: n }))}
              error={form3.formState.errors.neighborhood?.message}
              {...form3.register("neighborhood")}
            />

            <Textarea
              label={t("onboarding.step3.bio_label")}
              placeholder={t("onboarding.step3.bio_placeholder")}
              rows={3}
              hint={t("onboarding.step3.bio_hint")}
              {...form3.register("bio")}
            />

            {saveError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-sm text-red-400">{saveError}</p>
                {saveError.includes("relation") || saveError.includes("does not exist") ? (
                  <p className="text-xs text-red-300/70 mt-1">
                    The database tables are missing. Run <code className="bg-red-500/20 px-1 rounded">supabase/schema.sql</code> in your Supabase SQL Editor.
                  </p>
                ) : null}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4" /> {t("onboarding.cta_back")}
              </Button>
              <Button type="submit" size="lg" loading={saving} className="flex-2">
                {t("onboarding.cta_start")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
