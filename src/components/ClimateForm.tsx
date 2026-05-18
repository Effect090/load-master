"use client";

import * as React from "react";
import type { ClimateData, Orientation } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CLIMATE_PRESETS, climateFromPreset } from "@/lib/defaults/climate";
import { useI18n } from "./I18nProvider";

const ORIENTATIONS: Orientation[] = [
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
  "horizontal",
];

export function ClimateForm({
  climate,
  onChange,
}: {
  climate: ClimateData;
  onChange: (c: ClimateData) => void;
}) {
  const { t } = useI18n();

  function patch<K extends keyof ClimateData>(key: K, value: ClimateData[K]) {
    onChange({ ...climate, [key]: value });
  }

  function applyPreset(city: string) {
    const preset = CLIMATE_PRESETS.find((p) => p.city === city);
    if (!preset) return;
    onChange({
      ...climateFromPreset(preset),
      indoorWinterDb: climate.indoorWinterDb,
      indoorSummerDb: climate.indoorSummerDb,
      indoorSummerRh: climate.indoorSummerRh,
      solarIrradiance: { ...climate.solarIrradiance },
    });
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label={t.project.city}>
        <div className="flex gap-2">
          <Input
            value={climate.city}
            onChange={(e) => patch("city", e.target.value)}
            placeholder="Paris, Lyon, Geneva…"
          />
          <Select
            value=""
            onChange={(e) => e.target.value && applyPreset(e.target.value)}
            className="max-w-[170px]"
          >
            <option value="">Preset…</option>
            {CLIMATE_PRESETS.map((p) => (
              <option key={p.city} value={p.city}>
                {p.city}
              </option>
            ))}
          </Select>
        </div>
      </Field>

      <Field label={t.project.altitude}>
        <Input
          type="number"
          value={climate.altitudeM ?? 0}
          onChange={(e) => patch("altitudeM", Number(e.target.value))}
          suffix="m"
        />
      </Field>

      <Field label={t.project.indoorWinter}>
        <Input
          type="number"
          step="0.5"
          value={climate.indoorWinterDb}
          onChange={(e) => patch("indoorWinterDb", Number(e.target.value))}
          suffix="°C"
        />
      </Field>
      <Field label={t.project.outdoorWinter}>
        <Input
          type="number"
          step="0.5"
          value={climate.outdoorWinterDb}
          onChange={(e) => patch("outdoorWinterDb", Number(e.target.value))}
          suffix="°C"
        />
      </Field>

      <Field label={t.project.indoorSummer}>
        <Input
          type="number"
          step="0.5"
          value={climate.indoorSummerDb}
          onChange={(e) => patch("indoorSummerDb", Number(e.target.value))}
          suffix="°C"
        />
      </Field>
      <Field label={t.project.outdoorSummer}>
        <Input
          type="number"
          step="0.5"
          value={climate.outdoorSummerDb}
          onChange={(e) => patch("outdoorSummerDb", Number(e.target.value))}
          suffix="°C"
        />
      </Field>

      <Field label={t.project.indoorRh}>
        <Input
          type="number"
          step="1"
          min={0}
          max={100}
          value={climate.indoorSummerRh}
          onChange={(e) => patch("indoorSummerRh", Number(e.target.value))}
          suffix="%"
        />
      </Field>
      <Field label={t.project.outdoorRh}>
        <Input
          type="number"
          step="1"
          min={0}
          max={100}
          value={climate.outdoorSummerRh}
          onChange={(e) => patch("outdoorSummerRh", Number(e.target.value))}
          suffix="%"
        />
      </Field>

      <div className="md:col-span-2">
        <p className="label mb-3">
          Solar irradiance presets
          <span className="ml-2 normal-case font-normal text-muted-foreground/80">
            W/m² — editable per orientation
          </span>
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {ORIENTATIONS.map((o) => (
            <Field key={o} label={o}>
              <Input
                type="number"
                value={climate.solarIrradiance[o] ?? 0}
                onChange={(e) =>
                  patch("solarIrradiance", {
                    ...climate.solarIrradiance,
                    [o]: Number(e.target.value),
                  })
                }
              />
            </Field>
          ))}
        </div>
      </div>
    </div>
  );
}
