"use client";

import * as React from "react";
import type { Zone } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { OCCUPANCY_PRESETS } from "@/lib/defaults/internal";
import { useI18n } from "./I18nProvider";
import { Layers, Users, Wind } from "lucide-react";

export function ZoneForm({
  zone,
  onChange,
}: {
  zone: Zone;
  onChange: (z: Zone) => void;
}) {
  const { t } = useI18n();

  function patch<K extends keyof Zone>(key: K, value: Zone[K]) {
    const next = { ...zone, [key]: value } as Zone;
    if (key === "floorArea" || key === "height") {
      next.volume = Number(next.floorArea) * Number(next.height);
    }
    onChange(next);
  }

  function patchInternal<K extends keyof Zone["internalGains"]>(
    key: K,
    value: Zone["internalGains"][K],
  ) {
    onChange({
      ...zone,
      internalGains: { ...zone.internalGains, [key]: value },
    });
  }

  function patchVent<K extends keyof Zone["ventilation"]>(
    key: K,
    value: Zone["ventilation"][K],
  ) {
    onChange({ ...zone, ventilation: { ...zone.ventilation, [key]: value } });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
              <Layers className="size-4" />
            </span>
            <CardTitle>Zone geometry</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label={t.common.name} className="md:col-span-2">
            <Input
              value={zone.name}
              onChange={(e) => patch("name", e.target.value)}
            />
          </Field>
          <Field label={t.zones.floorArea}>
            <Input
              type="number"
              step="0.1"
              min={0.1}
              value={zone.floorArea}
              onChange={(e) =>
                patch("floorArea", Math.max(0.1, Number(e.target.value)))
              }
              suffix="m²"
            />
          </Field>
          <Field label={t.zones.height}>
            <Input
              type="number"
              step="0.05"
              min={0.1}
              value={zone.height}
              onChange={(e) =>
                patch("height", Math.max(0.1, Number(e.target.value)))
              }
              suffix="m"
            />
          </Field>
          <Field
            label={t.zones.volume}
            tooltip="Auto-computed from floor area × height. Edit manually for irregular rooms."
          >
            <Input
              type="number"
              value={zone.volume}
              onChange={(e) => patch("volume", Number(e.target.value))}
              suffix="m³"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
              <Users className="size-4" />
            </span>
            <CardTitle>Internal gains</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label={t.zones.occupancy}>
            <Select
              value={zone.internalGains.occupancyType}
              onChange={(e) =>
                patchInternal(
                  "occupancyType",
                  e.target.value as Zone["internalGains"]["occupancyType"],
                )
              }
            >
              {(
                Object.keys(OCCUPANCY_PRESETS) as Array<
                  keyof typeof OCCUPANCY_PRESETS
                >
              ).map((k) => (
                <option key={k} value={k}>
                  {OCCUPANCY_PRESETS[k].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.zones.people}>
            <Input
              type="number"
              min={0}
              value={zone.internalGains.peopleCount}
              onChange={(e) =>
                patchInternal("peopleCount", Number(e.target.value))
              }
            />
          </Field>
          <Field
            label={t.zones.lightingDensity}
            tooltip="Lighting power density in W per m². Typical: 5–10 W/m² for offices, 8–14 for retail."
          >
            <Input
              type="number"
              step="0.1"
              min={0}
              value={zone.internalGains.lightingWPerM2 ?? ""}
              onChange={(e) =>
                patchInternal(
                  "lightingWPerM2",
                  e.target.value === ""
                    ? undefined
                    : Math.max(0, Number(e.target.value)),
                )
              }
              suffix="W/m²"
            />
          </Field>
          <Field
            label={t.zones.lightingTotal}
            tooltip="Use this if you know the total connected lighting load. Overrides W/m² when set."
          >
            <Input
              type="number"
              step="1"
              min={0}
              value={zone.internalGains.lightingTotalW ?? ""}
              onChange={(e) =>
                patchInternal(
                  "lightingTotalW",
                  e.target.value === ""
                    ? undefined
                    : Math.max(0, Number(e.target.value)),
                )
              }
              suffix="W"
            />
          </Field>
          <Field label={t.zones.equipment} className="md:col-span-2">
            <Input
              type="number"
              step="1"
              min={0}
              value={zone.internalGains.equipmentW}
              onChange={(e) =>
                patchInternal(
                  "equipmentW",
                  Math.max(0, Number(e.target.value)),
                )
              }
              suffix="W"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
              <Wind className="size-4" />
            </span>
            <CardTitle>Ventilation &amp; infiltration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field
            label={t.zones.ventilationFlow}
            tooltip="Mechanical (designed) outdoor airflow rate, in m³/h. Use 25–30 m³/h per person as a starting point."
          >
            <Input
              type="number"
              step="1"
              min={0}
              value={zone.ventilation.ventilationAirflowM3h}
              onChange={(e) =>
                patchVent(
                  "ventilationAirflowM3h",
                  Math.max(0, Number(e.target.value)),
                )
              }
              suffix="m³/h"
            />
          </Field>
          <Field label={t.zones.infiltrationMethod}>
            <Select
              value={zone.ventilation.infiltrationMethod}
              onChange={(e) =>
                patchVent(
                  "infiltrationMethod",
                  e.target.value as Zone["ventilation"]["infiltrationMethod"],
                )
              }
            >
              <option value="ach">ACH</option>
              <option value="airflow">Direct airflow</option>
            </Select>
          </Field>
          {zone.ventilation.infiltrationMethod === "ach" ? (
            <Field
              label={t.zones.ach}
              tooltip="Air Changes per Hour — uncontrolled infiltration. Typical: 0.1 (passive), 0.3 (tight), 0.6 (average), 1.2 (leaky)."
            >
              <Input
                type="number"
                step="0.1"
                min={0}
                value={zone.ventilation.infiltrationAch ?? 0}
                onChange={(e) =>
                  patchVent(
                    "infiltrationAch",
                    Math.max(0, Number(e.target.value)),
                  )
                }
                suffix="1/h"
              />
            </Field>
          ) : (
            <Field label={t.zones.infiltrationAirflow}>
              <Input
                type="number"
                step="1"
                min={0}
                value={zone.ventilation.infiltrationAirflowM3h ?? 0}
                onChange={(e) =>
                  patchVent(
                    "infiltrationAirflowM3h",
                    Math.max(0, Number(e.target.value)),
                  )
                }
                suffix="m³/h"
              />
            </Field>
          )}
          <Field
            label={t.zones.heatRecoverySensible}
            tooltip="Sensible heat recovery efficiency (0–1). Typical: 0.65–0.85 for plate exchangers."
          >
            <Input
              type="number"
              step="0.05"
              min={0}
              max={1}
              value={zone.ventilation.heatRecoverySensible ?? 0}
              onChange={(e) =>
                patchVent("heatRecoverySensible", Number(e.target.value))
              }
            />
          </Field>
          <Field
            label={t.zones.heatRecoveryLatent}
            tooltip="Latent (moisture) recovery efficiency (0–1). Only relevant for enthalpy wheels / membrane HRVs."
          >
            <Input
              type="number"
              step="0.05"
              min={0}
              max={1}
              value={zone.ventilation.heatRecoveryLatent ?? 0}
              onChange={(e) =>
                patchVent("heatRecoveryLatent", Number(e.target.value))
              }
            />
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}

