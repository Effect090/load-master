"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Building2 } from "lucide-react";
import type { Project, ProjectResult } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BUILDING_TYPE_LABELS } from "@/features/projects/factory";
import {
  deriveProjectStatus,
  calculationCompleteness,
} from "@/features/projects/status";
import { formatDate } from "@/lib/utils";

/**
 * Project header banner — shown on every project sub-page.
 * Displays name, building type, city, status badge, completeness bar.
 */
export function ProjectHeader({
  project,
  result,
  actions,
}: {
  project: Project;
  result?: ProjectResult;
  actions?: React.ReactNode;
}) {
  const status = deriveProjectStatus(project, result);
  const completeness = calculationCompleteness(project);
  const completenessPct = Math.round(completeness * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border bg-card surface-soft p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={status} />
            <Badge variant="muted">
              <Building2 className="size-3" />
              {BUILDING_TYPE_LABELS[project.buildingType]}
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight truncate">
            {project.name || "Untitled project"}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3" />
              {project.climate.city || "Unknown location"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3" />
              Updated {formatDate(project.updatedAt)}
            </span>
            <span className="tabular-nums">
              {project.zones.length} zone{project.zones.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>

      {/* Completeness bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
          <span className="font-medium uppercase tracking-[0.08em]">
            Input completeness
          </span>
          <span className="tabular-nums font-semibold text-foreground">
            {completenessPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completenessPct}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={
              completenessPct >= 80
                ? "h-full bg-success"
                : completenessPct >= 50
                  ? "h-full bg-info"
                  : "h-full bg-warning"
            }
          />
        </div>
      </div>
    </motion.div>
  );
}
