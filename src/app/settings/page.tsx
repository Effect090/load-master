"use client";

import * as React from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/features/projects/settings";
import { useI18n } from "@/components/I18nProvider";
import type { Language, Theme } from "@/types";
import {
  Languages,
  Palette,
  Settings as SettingsIcon,
  RotateCcw,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const { settings, update } = useSettingsStore();
  const { t } = useI18n();

  return (
    <AppShell title={t.settings.title}>
      <div className="flex flex-col gap-6 max-w-3xl">
        <PageHeader
          eyebrow="Workspace"
          title={t.settings.title}
          description="Application preferences and default values for new projects. Stored locally in your browser."
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
                <Palette className="size-4" />
              </span>
              <CardTitle>Appearance &amp; language</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label={t.settings.language}>
              <Select
                value={settings.language}
                onChange={(e) =>
                  void update({ language: e.target.value as Language })
                }
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </Select>
            </Field>
            <Field label={t.settings.theme}>
              <Select
                value={settings.theme}
                onChange={(e) =>
                  void update({ theme: e.target.value as Theme })
                }
              >
                <option value="system">{t.settings.themeSystem}</option>
                <option value="light">{t.settings.themeLight}</option>
                <option value="dark">{t.settings.themeDark}</option>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
                <SettingsIcon className="size-4" />
              </span>
              <CardTitle>{t.settings.defaults}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Default indoor heating">
              <Input
                type="number"
                value={settings.defaultIndoorWinter}
                onChange={(e) =>
                  void update({
                    defaultIndoorWinter: Number(e.target.value),
                  })
                }
                suffix="°C"
              />
            </Field>
            <Field label="Default indoor cooling">
              <Input
                type="number"
                value={settings.defaultIndoorSummer}
                onChange={(e) =>
                  void update({
                    defaultIndoorSummer: Number(e.target.value),
                  })
                }
                suffix="°C"
              />
            </Field>
            <Field label="Default indoor RH">
              <Input
                type="number"
                value={settings.defaultIndoorRh}
                onChange={(e) =>
                  void update({ defaultIndoorRh: Number(e.target.value) })
                }
                suffix="%"
              />
            </Field>
            <Field
              label="Default safety margin"
              tooltip="Default multiplier applied to raw loads for new projects. Typical: 5–15%."
            >
              <Input
                type="number"
                value={Math.round(settings.defaultSafetyMargin * 100)}
                onChange={(e) =>
                  void update({
                    defaultSafetyMargin: Number(e.target.value) / 100,
                  })
                }
                suffix="%"
              />
            </Field>
            <Field
              label="Default diversity factor"
              tooltip="Default project-level diversity factor for new projects. Typical: 0.85–1.0."
            >
              <Input
                type="number"
                step="0.05"
                min={0}
                max={1}
                value={settings.defaultDiversity}
                onChange={(e) =>
                  void update({ defaultDiversity: Number(e.target.value) })
                }
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
                <Info className="size-4" />
              </span>
              <CardTitle>About</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <p>
              Load Master uses transparent simplified engineering load
              calculation based on public heat-transfer and psychrometric
              formulas. It is not a certified regulatory calculation method.
            </p>
            <p>
              Source code, calculation engine and presets are open and
              editable. All projects are stored locally in your browser
              (IndexedDB).
            </p>
          </CardContent>
        </Card>

        <div>
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("Reset settings to defaults?")) {
                void update({
                  language: "en",
                  theme: "system",
                  defaultIndoorWinter: 20,
                  defaultIndoorSummer: 26,
                  defaultIndoorRh: 50,
                  defaultSafetyMargin: 0.1,
                  defaultDiversity: 1,
                });
              }
            }}
          >
            <RotateCcw className="size-4" />
            Reset to defaults
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
