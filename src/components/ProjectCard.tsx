"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Copy, Trash2, MapPin, Calendar } from "lucide-react";
import type { Project } from "@/types";
import { computeProjectResult } from "@/lib/calculations";
import { formatDate, formatPower } from "@/lib/utils";
import { BUILDING_TYPE_LABELS } from "@/features/projects/factory";
import * as React from "react";

export function ProjectCard({
  project,
  onDuplicate,
  onDelete,
}: {
  project: Project;
  onDuplicate: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  const result = React.useMemo(() => computeProjectResult(project), [project]);

  return (
    <Card className="hover:shadow-card-lg transition-shadow flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <div className="min-w-0">
          <CardTitle className="truncate">{project.name}</CardTitle>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            <span className="truncate">{project.climate.city}</span>
            <Badge variant="muted">{BUILDING_TYPE_LABELS[project.buildingType]}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDuplicate(project)}
            title="Duplicate"
          >
            <Copy className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(project.id)}
            title="Delete"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Zones" value={String(project.zones.length)} />
          <Stat label="Heating" value={formatPower(result.totalHeatingW)} accent="primary" />
          <Stat label="Cooling" value={formatPower(result.totalCoolingW)} accent="warning" />
        </div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Calendar className="size-3" />
          Updated {formatDate(project.updatedAt)}
        </div>
        <div className="mt-auto">
          <Link href={`/projects/${project.id}/setup`}>
            <Button className="w-full" variant="default">Open project</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary" | "warning";
}) {
  const color =
    accent === "primary"
      ? "text-primary"
      : accent === "warning"
      ? "text-warning"
      : "text-foreground";
  return (
    <div className="rounded-md border bg-muted/30 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
