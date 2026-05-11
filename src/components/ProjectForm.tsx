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
          <CardTitle>{t.project.setup}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
                <option key={k} value={k}>{BUILDING_TYPE_LABELS[k]}</option>
              ))}
            </Select>
          </Field>
          <Field label={t.project.safety}>
            <Input
              type="number"
              step="1"
              value={Math.round(project.safetyMargin * 100)}
              onChange={(e) => patch("safetyMargin", Number(e.target.value) / 100)}
            />
          </Field>
          <Field label={t.project.diversity}>
            <Input
              type="number"
              step="0.05"
              min={0}
              max={1}
              value={project.diversityFactor}
              onChange={(e) => patch("diversityFactor", Number(e.target.value))}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Climate</CardTitle>
        </CardHeader>
        <CardContent>
          <ClimateForm
            climate={project.climate}
            onChange={(c) => patch("climate", c)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "…" : t.project.saveAndContinue}
        </Button>
      </div>
    </div>
  );
}
