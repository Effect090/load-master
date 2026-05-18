"use client";

import * as React from "react";
import type { ProjectResult } from "@/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatNumber } from "@/lib/utils";
import {
  Flame,
  Snowflake,
  Gauge,
  Building2,
} from "lucide-react";

function fkW(w: number): string {
  if (!Number.isFinite(w)) return "—";
  return (w / 1000).toFixed(2);
}

export function ProjectSummaryCards({
  result,
  safetyMargin,
  diversityFactor,
}: {
  result: ProjectResult;
  safetyMargin?: number;
  diversityFactor?: number;
}) {
  const safetyChip =
    safetyMargin != null
      ? `+${Math.round(safetyMargin * 100)}% safety`
      : undefined;

  const recoChip =
    diversityFactor != null && safetyMargin != null
      ? `${Math.round(diversityFactor * 100)}% × +${Math.round(safetyMargin * 100)}%`
      : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={<Flame className="size-4" />}
        label="Total heating"
        value={fkW(result.totalHeatingW)}
        unit="kW"
        sub={`${formatNumber(result.heatingPerM2, 1)} W/m² · raw load`}
        tone="primary"
        hint="Sum of zone heating loads (transmission + ventilation + infiltration), before safety and diversity factors."
      />
      <MetricCard
        icon={<Snowflake className="size-4" />}
        label="Total cooling"
        value={fkW(result.totalCoolingW)}
        unit="kW"
        sub={`${formatNumber(result.coolingPerM2, 1)} W/m² · sensible + latent`}
        tone="info"
        hint="Sum of zone sensible + latent cooling loads (envelope, solar, internal gains, OA), before safety and diversity factors."
      />
      <MetricCard
        icon={<Gauge className="size-4" />}
        label="Recommended heating"
        value={fkW(result.recommendedHeatingW)}
        unit="kW"
        sub="diversity × (1 + safety)"
        tone="primary"
        chip={recoChip}
        hint="Final installed capacity = total × diversity × (1 + safety margin). Use this for equipment sizing."
      />
      <MetricCard
        icon={<Building2 className="size-4" />}
        label="Recommended cooling"
        value={fkW(result.recommendedCoolingW)}
        unit="kW"
        sub="diversity × (1 + safety)"
        tone="info"
        chip={recoChip ?? safetyChip}
        hint="Final installed capacity = total × diversity × (1 + safety margin). Use this for equipment sizing."
      />
    </div>
  );
}
