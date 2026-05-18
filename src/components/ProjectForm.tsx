"use client";

import * as React from "react";
import type { Project } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ClimateForm } from "./ClimateForm";
import { useI18n } from "./I18nProvider";
import { BUILDING_TYPE_LABELS } from "@/features/projects/factory";
import { ArrowRight, Building2, MapPin } from "lucide-react";

export function ProjectForm({
  project,
  onChange,
  onSave,
  saving,
}: {
  project: Project;
  onChange: (p: Project) => void;
  onSave: () => void;
  saving?: boolean;
}) {
  const { t } = useI18n();

  function patch<K extends keyof Project>(key: K, value: Project[K]) {
    onChange({ ...project, [key]: value });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
              <Building2 className="size-4" />
            </span>
            <CardTitle>Project information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label={t.project.name} className="md:col-span-2">
            <Input
              value={project.name}
              onChange={(e) => patch("name", e.target.value)}
              placeholder="My building"
            />
          </Field>

          <Field label={t.project.buildingType}>
            <Select
              value={project.buildingType}
              onChange={(e) =>
                patch("buildingType", e.target.value as Project["buildingType"])
              }
            >
              {(
                Object.keys(BUILDING_TYPE_LABELS) as Array<
                  keyof typeof BUILDING_TYPE_LABELS
                >
              ).map((k) => (
                <option key={k} value={k}>
                  {BUILDING_TYPE_LABELS[k]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label={t.project.safety}
            tooltip="Multiplier applied to raw loads (e.g. 10% = 1.10×). Covers transient effects, equipment startup and design uncertainty. Typical: 5–15%."
          >
            <Input
              type="number"
              step="1"
              min={0}
              max={100}
              value={Math.round(project.safetyMargin * 100)}
              onChange={(e) =>
                patch(
                  "safetyMargin",
                  Math.max(0, Math.min(100, Number(e.target.value))) / 100,
                )
              }
              suffix="%"
            />
          </Field>

          <Field
            label={t.project.diversity}
            tooltip="Project-level diversity factor (0–1). Reflects that not all zones reach peak load simultaneously. Typical: 0.85–1.0."
          >
            <Input
              type="number"
              step="0.05"
              min={0}
              max={1}
              value={project.diversityFactor}
              onChange={(e) =>
                patch(
                  "diversityFactor",
                  Math.max(0, Math.min(1, Number(e.target.value))),
                )
              }
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
              <MapPin className="size-4" />
            </span>
            <CardTitle>Climate &amp; design conditions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ClimateForm
            climate={project.climate}
            onChange={(c) => patch("climate", c)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving} loading={saving} size="lg">
          {saving ? "Saving…" : t.project.saveAndContinue}
          {!saving && <ArrowRight className="size-4" />}
        </Button>
      </div>
    </div>
  );
}

