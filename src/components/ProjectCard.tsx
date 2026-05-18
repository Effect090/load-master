"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Copy,
  Trash2,
  MapPin,
  Calendar,
  Flame,
  Snowflake,
  ArrowRight,
} from "lucide-react";
import type { Project } from "@/types";
import { computeProjectResult } from "@/lib/calculations";
import { formatDate, formatPower } from "@/lib/utils";
import { BUILDING_TYPE_LABELS } from "@/features/projects/factory";
import { deriveProjectStatus } from "@/features/projects/status";

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
  const status = deriveProjectStatus(project, result);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card interactive className="flex flex-col h-full">
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status={status} />
            </div>
            <CardTitle className="truncate">{project.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                <span className="truncate max-w-[120px]">{project.climate.city}</span>
              </span>
              <Badge variant="muted">
                {BUILDING_TYPE_LABELS[project.buildingType]}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-0.5 -mr-2">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onDuplicate(project)}
              title="Duplicate"
            >
              <Copy className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onDelete(project.id)}
              title="Delete"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            <Stat
              label="Zones"
              value={String(project.zones.length)}
            />
            <Stat
              label="Heating"
              value={formatPower(result.totalHeatingW)}
              icon={<Flame className="size-3" />}
              tone="primary"
            />
            <Stat
              label="Cooling"
              value={formatPower(result.totalCoolingW)}
              icon={<Snowflake className="size-3" />}
              tone="info"
            />
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3" />
            Updated {formatDate(project.updatedAt)}
          </div>

          <div className="mt-auto">
            <Link href={`/projects/${project.id}/setup`} className="block">
              <Button className="w-full group/btn" variant="default">
                Open project
                <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "primary" | "info";
}) {
  const color =
    tone === "primary"
      ? "text-primary"
      : tone === "info"
        ? "text-info"
        : "text-foreground";
  return (
    <div className="rounded-lg border bg-muted/30 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
        {icon && <span className={color}>{icon}</span>}
        {label}
      </div>
      <div className={`text-sm font-semibold tabular-nums ${color} mt-0.5`}>
        {value}
      </div>
    </div>
  );
}
