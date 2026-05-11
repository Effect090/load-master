"use client";

import * as React from "react";
import type { Zone } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { OCCUPANCY_PRESETS } from "@/lib/defaults/internal";
import { useI18n } from "./I18nProvider";

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
          <CardTitle>Zone</CardTitle>
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
              value={zone.floorArea}
              onChange={(e) => patch("floorArea", Number(e.target.value))}
            />
          </Field>
          <Field label={t.zones.height}>
            <Input
              type="number"
              step="0.05"
              value={zone.height}
              onChange={(e) => patch("height", Number(e.target.value))}
            />
          </Field>
          <Field label={t.zones.volume} hint="floor area × height">
            <Input
              type="number"
              value={zone.volume}
              onChange={(e) => patch("volume", Number(e.target.value))}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Internal gains</CardTitle>
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
              {(Object.keys(OCCUPANCY_PRESETS) as Array<keyof typeof OCCUPANCY_PRESETS>).map(
                (k) => (
                  <option key={k} value={k}>
                    {OCCUPANCY_PRESETS[k].label}
                  </option>
                ),
              )}
            </Select>
          </Field>
          <Field label={t.zones.people}>
            <Input
              type="number"
              min={0}
              value={zone.internalGains.peopleCount}
              onChange={(e) => patchInternal("peopleCount", Number(e.target.value))}
            />
          </Field>
          <Field label={t.zones.lightingDensity}>
            <Input
              type="number"
              step="0.1"
              value={zone.internalGains.lightingWPerM2 ?? ""}
              onChange={(e) =>
                patchInternal(
                  "lightingWPerM2",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
            />
          </Field>
          <Field label={t.zones.lightingTotal}>
            <Input
              type="number"
              step="1"
              value={zone.internalGains.lightingTotalW ?? ""}
              onChange={(e) =>
                patchInternal(
                  "lightingTotalW",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
            />
          </Field>
          <Field label={t.zones.equipment} className="md:col-span-2">
            <Input
              type="number"
              step="1"
              value={zone.internalGains.equipmentW}
              onChange={(e) => patchInternal("equipmentW", Number(e.target.value))}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventilation & infiltration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label={t.zones.ventilationFlow}>
            <Input
              type="number"
              step="1"
              value={zone.ventilation.ventilationAirflowM3h}
              onChange={(e) =>
                patchVent("ventilationAirflowM3h", Number(e.target.value))
              }
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
            <Field label={t.zones.ach}>
              <Input
                type="number"
                step="0.1"
                value={zone.ventilation.infiltrationAch ?? 0}
                onChange={(e) =>
                  patchVent("infiltrationAch", Number(e.target.value))
                }
              />
            </Field>
          ) : (
            <Field label={t.zones.infiltrationAirflow}>
              <Input
                type="number"
                step="1"
                value={zone.ventilation.infiltrationAirflowM3h ?? 0}
                onChange={(e) =>
                  patchVent("infiltrationAirflowM3h", Number(e.target.value))
                }
              />
            </Field>
          )}
          <Field label={t.zones.heatRecoverySensible}>
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
          <Field label={t.zones.heatRecoveryLatent}>
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
