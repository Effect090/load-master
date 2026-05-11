"use client";

import * as React from "react";
import type { ZoneResult } from "@/types";
import { formatPower, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadBreakdownPie } from "./LoadBreakdownChart";
import { FormulaBreakdown } from "./FormulaBreakdown";
import { WarningBanner } from "./WarningBanner";

export function ZoneResultsTable({ result }: { result: ZoneResult }) {
  const heatingItems = [
    { name: "Transmission", value: result.heatingTransmissionW },
    { name: "Ventilation", value: result.heatingVentilationW },
    { name: "Infiltration", value: result.heatingInfiltrationW },
  ];
  const coolingItems = [
    { name: "Conduction", value: result.coolingConductionW },
    { name: "Solar", value: result.coolingSolarW },
    { name: "Vent. sensible", value: result.coolingVentilationSensibleW },
    { name: "Inf. sensible", value: result.coolingInfiltrationSensibleW },
    { name: "People sens.", value: result.peopleSensibleW },
    { name: "Lighting", value: result.lightingW },
    { name: "Equipment", value: result.equipmentW },
    { name: "Vent. latent", value: result.coolingVentilationLatentW },
    { name: "Inf. latent", value: result.coolingInfiltrationLatentW },
    { name: "People latent", value: result.peopleLatentW },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>{result.zoneName}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {formatNumber(result.floorArea, 1)} m² ·{" "}
            {formatNumber(result.heatingPerM2, 1)} W/m² heating ·{" "}
            {formatNumber(result.coolingPerM2, 1)} W/m² cooling
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default">{formatPower(result.totalHeatingW)} heat</Badge>
          <Badge variant="warning">{formatPower(result.totalCoolingW)} cool</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <SectionTitle>Heating</SectionTitle>
          <SimpleRows rows={heatingItems} />
          <Total label="Total heating" value={result.totalHeatingW} />
          <Total
            label="Recommended"
            value={result.recommendedHeatingW}
            highlight
          />
          <LoadBreakdownPie data={heatingItems} />
        </div>
        <div className="flex flex-col gap-3">
          <SectionTitle>Cooling</SectionTitle>
          <SimpleRows rows={coolingItems} />
          <Total label="Total sensible" value={result.totalSensibleCoolingW} />
          <Total label="Total latent" value={result.totalLatentCoolingW} />
          <Total label="Total cooling" value={result.totalCoolingW} />
          <Total
            label="Recommended"
            value={result.recommendedCoolingW}
            highlight
          />
          <LoadBreakdownPie data={coolingItems} />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {result.warnings.length > 0 && (
            <WarningBanner warnings={result.warnings} />
          )}
          <FormulaBreakdown breakdown={result.envelopeBreakdown} />
        </div>
      </CardContent>
    </Card>
  );
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    {children}
  </h4>
);

function SimpleRows({ rows }: { rows: { name: string; value: number }[] }) {
  return (
    <div className="rounded-md border divide-y">
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center justify-between px-3 py-1.5 text-sm"
        >
          <span className="text-muted-foreground">{r.name}</span>
          <span className="tabular-nums">{formatPower(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Total({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-md ${
        highlight
          ? "bg-primary/10 text-primary"
          : "bg-muted/40 text-foreground"
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums">
        {formatPower(value)}
      </span>
    </div>
  );
}
