"use client";

import * as React from "react";
import type { ProjectResult } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { formatPower, formatNumber } from "@/lib/utils";
import { Flame, Snowflake, Building2, Gauge } from "lucide-react";

export function ProjectSummaryCards({ result }: { result: ProjectResult }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        icon={<Flame className="size-4" />}
        label="Total heating"
        value={formatPower(result.totalHeatingW)}
        sub={`${formatNumber(result.heatingPerM2, 1)} W/m²`}
        color="text-primary"
      />
      <Stat
        icon={<Snowflake className="size-4" />}
        label="Total cooling"
        value={formatPower(result.totalCoolingW)}
        sub={`${formatNumber(result.coolingPerM2, 1)} W/m²`}
        color="text-warning"
      />
      <Stat
        icon={<Gauge className="size-4" />}
        label="Recommended heating"
        value={formatPower(result.recommendedHeatingW)}
        sub="incl. diversity & safety"
      />
      <Stat
        icon={<Building2 className="size-4" />}
        label="Recommended cooling"
        value={formatPower(result.recommendedCoolingW)}
        sub="incl. diversity & safety"
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={color}>{icon}</span>
          {label}
        </div>
        <div className={`text-xl font-semibold tabular-nums ${color ?? ""}`}>
          {value}
        </div>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
