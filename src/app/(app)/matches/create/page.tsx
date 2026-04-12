"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Users, DollarSign, Zap, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

// Validation messages are set dynamically inside the component via t()
const buildSchema = (msgs: {
  titleMin: string; locationRequired: string; dateRequired: string;
  timeRequired: string; playersType: string; playersMin: string; playersMax: string;
}) =>
  z.object({
    title: z.string().min(3, msgs.titleMin).max(80),
    location: z.string().min(3, msgs.locationRequired).max(120),
    field_name: z.string().max(80).optional(),
    date: z.string().min(1, msgs.dateRequired),
    time: z.string().min(1, msgs.timeRequired),
    max_players: z
      .number({ invalid_type_error: msgs.playersType })
      .min(4, msgs.playersMin)
      .max(22, msgs.playersMax),
    skill_level: z.enum(["beginner", "intermediate", "advanced", "mixed"]),
    price_per_player: z.number().min(0).max(1000).default(0),
    description: z.string().max(300).optional(),
  });

type FormData = z.infer<ReturnType<typeof buildSchema>>;

const CASABLANCA_FIELDS = [
  "Complexe Mohammed VI",
  "Stade El Harti",
  "Terrain Ain Chock",
  "Complexe Hay Hassani",
  "Terrain Ben M'Sick",
  "Terrain Sidi Bernoussi",
  "Autre terrain",
];

export default function CreateMatchPage() {
  const router = useRouter();
  const { t } = useLang();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = buildSchema({
    titleMin: t("create.validation.title_min"),
    locationRequired: t("create.validation.location_required"),
    dateRequired: t("create.validation.date_required"),
    timeRequired: t("create.validation.time_required"),
    playersType: t("create.validation.players_type"),
    playersMin: t("create.validation.players_min"),
    playersMax: t("create.validation.players_max"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      skill_level: "mixed",
      max_players: 10,
      price_per_player: 0,
    },
  });

  const skillLevel = watch("skill_level");
  const maxPlayers = watch("max_players");

  async function onSubmit(data: FormData) {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dateTime = new Date(`${data.date}T${data.time}`).toISOString();

    const { data: match, error: err } = await supabase
      .from("matches")
      .insert({
        title: data.title,
        organizer_id: user.id,
        location: data.location,
        field_name: data.field_name || null,
        date_time: dateTime,
        max_players: data.max_players,
        skill_level: data.skill_level,
        price_per_player: data.price_per_player,
        description: data.description || null,
        status: "open",
        current_players: 1,
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    // Auto-join as organizer
    await supabase.from("match_participants").insert({
      match_id: match.id,
      player_id: user.id,
      confirmed_participated: false,
    });

    router.push(`/matches/${match.id}`);
  }

  // Min date: today, formatted as YYYY-MM-DD
  const minDate = new Date().toISOString().split("T")[0];
  // Min time: now + 30min if today
  const now = new Date();
  const minTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    Math.ceil(now.getMinutes() / 30) * 30 === 60 ? 0 : Math.ceil(now.getMinutes() / 30) * 30
  ).padStart(2, "0")}`;

  return (
    <div className="page-content px-4 pt-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-cf-surface border border-cf-border flex items-center justify-center text-cf-muted hover:text-cf-text transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-white">{t("create.page_title")}</h1>
          <p className="text-xs text-cf-muted">{t("create.page_subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Section: Basic Info */}
        <FormSection icon={<FileText className="w-4 h-4" />} title={t("create.section.info")}>
          <Input
            label={t("create.field.title")}
            placeholder={t("create.field.title_placeholder")}
            error={errors.title?.message}
            {...register("title")}
          />
          <Input
            label={t("create.field.field_name")}
            placeholder={t("create.field.field_name_placeholder")}
            list="field-suggestions"
            error={errors.field_name?.message}
            {...register("field_name")}
          />
          <datalist id="field-suggestions">
            {CASABLANCA_FIELDS.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <Input
            label={t("create.field.location")}
            placeholder={t("create.field.location_placeholder")}
            leftIcon={<MapPin className="w-4 h-4" />}
            error={errors.location?.message}
            {...register("location")}
          />
        </FormSection>

        {/* Section: Date & Time */}
        <FormSection icon={<Clock className="w-4 h-4" />} title={t("create.section.datetime")}>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t("create.field.date")}
              type="date"
              min={minDate}
              error={errors.date?.message}
              {...register("date")}
            />
            <Input
              label={t("create.field.time")}
              type="time"
              error={errors.time?.message}
              {...register("time")}
            />
          </div>
        </FormSection>

        {/* Section: Players */}
        <FormSection icon={<Users className="w-4 h-4" />} title={t("create.section.players")}>
          <div>
            <p className="text-sm font-medium text-cf-muted mb-3">
              {t("create.field.max_players_label")}{" "}
              <span className="text-green-400 font-bold">{maxPlayers}</span>
            </p>
            <input
              type="range"
              min={4}
              max={22}
              step={1}
              className="w-full h-2 rounded-full bg-cf-surface-2 appearance-none cursor-pointer accent-green-500"
              {...register("max_players", { valueAsNumber: true })}
            />
            <div className="flex justify-between text-[10px] text-cf-dim mt-1 px-1">
              <span>4v4</span>
              <span>5v5</span>
              <span>7v7</span>
              <span>11v11</span>
            </div>
            {errors.max_players && (
              <p className="text-xs text-red-400 mt-1">{errors.max_players.message}</p>
            )}
          </div>
        </FormSection>

        {/* Section: Level */}
        <FormSection icon={<Zap className="w-4 h-4" />} title={t("create.section.level")}>
          <div className="grid grid-cols-2 gap-2">
            {(["beginner", "intermediate", "advanced", "mixed"] as const).map((lvl) => {
              const configs = {
                beginner:     { label: t("create.level.beginner.label"),     emoji: "🌱", desc: t("create.level.beginner.desc")     },
                intermediate: { label: t("create.level.intermediate.label"), emoji: "⚡", desc: t("create.level.intermediate.desc") },
                advanced:     { label: t("create.level.advanced.label"),     emoji: "🔥", desc: t("create.level.advanced.desc")     },
                mixed:        { label: t("create.level.mixed.label"),        emoji: "🎯", desc: t("create.level.mixed.desc")        },
              };
              const cfg = configs[lvl];
              const selected = skillLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setValue("skill_level", lvl, { shouldValidate: true })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.98]",
                    selected
                      ? "bg-green-600/20 border-green-600/50"
                      : "bg-cf-surface border-cf-border hover:border-cf-border/80"
                  )}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">{cfg.emoji}</span>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        selected ? "text-green-400" : "text-cf-text"
                      )}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-cf-dim">{cfg.desc}</p>
                </button>
              );
            })}
          </div>
          {errors.skill_level && (
            <p className="text-xs text-red-400">{errors.skill_level.message}</p>
          )}
        </FormSection>

        {/* Section: Price */}
        <FormSection icon={<DollarSign className="w-4 h-4" />} title={t("create.section.price")}>
          <Input
            type="number"
            placeholder={t("create.field.price_placeholder")}
            hint={t("create.field.price_hint")}
            leftIcon={<span className="text-xs font-bold text-cf-dim">MAD</span>}
            error={errors.price_per_player?.message}
            {...register("price_per_player", { valueAsNumber: true })}
          />
        </FormSection>

        {/* Section: Description */}
        <FormSection icon={<FileText className="w-4 h-4" />} title={t("create.section.description")}>
          <Textarea
            placeholder={t("create.field.description_placeholder")}
            rows={3}
            hint={t("create.field.description_hint")}
            {...register("description")}
          />
        </FormSection>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={saving}>
          {t("create.submit")}
        </Button>
      </form>
    </div>
  );
}

function FormSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cf-surface border border-cf-border rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2 pb-1 border-b border-cf-border/50">
        <span className="text-cf-muted">{icon}</span>
        <h3 className="text-sm font-bold text-cf-text">{title}</h3>
      </div>
      {children}
    </div>
  );
}
