"use client";

import * as React from "react";
import type { Project } from "@/types";
import { computeProjectResult } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProjectSummaryCards } from "./ProjectSummaryCards";
import { ZoneCompareBars } from "./LoadBreakdownChart";
import { formatNumber, formatPower } from "@/lib/utils";
import { BUILDING_TYPE_LABELS } from "@/features/projects/factory";
import { useI18n } from "./I18nProvider";

export function ReportPreview({ project }: { project: Project }) {
  const result = React.useMemo(() => computeProjectResult(project), [project]);
  const { t } = useI18n();

  const zoneRows = result.zones.map((z) => ({
    zone: z.zoneName,
    heating: Math.round(z.totalHeatingW),
    cooling: Math.round(z.totalCoolingW),
  }));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {BUILDING_TYPE_LABELS[project.buildingType]} · {project.climate.city}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
          <Info label="Outdoor winter" value={`${project.climate.outdoorWinterDb} °C`} />
          <Info label="Outdoor summer" value={`${project.climate.outdoorSummerDb} °C`} />
          <Info label="Indoor heating" value={`${project.climate.indoorWinterDb} °C`} />
          <Info label="Indoor cooling" value={`${project.climate.indoorSummerDb} °C`} />
          <Info label="Outdoor RH (summer)" value={`${project.climate.outdoorSummerRh} %`} />
          <Info label="Indoor RH (summer)" value={`${project.climate.indoorSummerRh} %`} />
          <Info label="Altitude" value={`${project.climate.altitudeM ?? 0} m`} />
          <Info label="Safety margin" value={`${(project.safetyMargin * 100).toFixed(0)} %`} />
          <Info label="Diversity factor" value={project.diversityFactor.toFixed(2)} />
          <Info label="Total floor area" value={`${formatNumber(result.totalArea, 1)} m²`} />
        </CardContent>
      </Card>

      <ProjectSummaryCards result={result} />

      <Card>
        <CardHeader>
          <CardTitle>Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-xs">
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-2">Zone</th>
                  <th className="px-3 py-2">Area</th>
                  <th className="px-3 py-2">Heating</th>
                  <th className="px-3 py-2">Cooling sens.</th>
                  <th className="px-3 py-2">Cooling lat.</th>
                  <th className="px-3 py-2">Cooling total</th>
                  <th className="px-3 py-2">Reco heat</th>
                  <th className="px-3 py-2">Reco cool</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {result.zones.map((z) => (
                  <tr key={z.zoneId} className="border-t">
                    <td className="px-3 py-2">{z.zoneName}</td>
                    <td className="px-3 py-2">{formatNumber(z.floorArea, 1)} m²</td>
                    <td className="px-3 py-2">{formatPower(z.totalHeatingW)}</td>
                    <td className="px-3 py-2">{formatPower(z.totalSensibleCoolingW)}</td>
                    <td className="px-3 py-2">{formatPower(z.totalLatentCoolingW)}</td>
                    <td className="px-3 py-2">{formatPower(z.totalCoolingW)}</td>
                    <td className="px-3 py-2">{formatPower(z.recommendedHeatingW)}</td>
                    <td className="px-3 py-2">{formatPower(z.recommendedCoolingW)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <ZoneCompareBars data={zoneRows} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.report.method}</CardTitle>
        </CardHeader>
        <CardContent className="prose-sm max-w-none text-sm space-y-2">
          <p>
            <strong>Heating transmission</strong>: Q = U × A × (T<sub>in</sub> − T<sub>out</sub>)
          </p>
          <p>
            <strong>Heating ventilation/infiltration (sensible)</strong>: Q = 0.335 × airflow<sub>m³/h</sub> × ΔT
          </p>
          <p>
            <strong>Cooling conduction</strong>: Q = U × A × (T<sub>out</sub> − T<sub>in</sub>)
          </p>
          <p>
            <strong>Cooling ventilation latent</strong>: Q = 0.83 × airflow<sub>m³/h</sub> × Δw (g/kg)
          </p>
          <p>
            <strong>Solar gain through windows</strong>: Q = A<sub>glass</sub> × SHGC × I × shading
          </p>
          <p>
            <strong>Internal gains</strong>: Lighting + Equipment + People (sensible &amp; latent from presets).
          </p>
          <p className="text-muted-foreground">
            Coefficients 0.335 and 0.83 are derived from ρ<sub>air</sub> ≈ 1.2 kg/m³,
            c<sub>p,air</sub> ≈ 1006 J/(kg·K) and h<sub>fg</sub> ≈ 2 500 000 J/kg.
          </p>
          <p className="italic text-muted-foreground">{t.report.disclaimer}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
