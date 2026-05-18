"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProjectTabs } from "@/components/ProjectTabs";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  AnimatedList,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import { useProject } from "@/features/projects/useProject";
import { ZONE_TEMPLATES } from "@/features/zones/templates";
import type { Zone } from "@/types";
import {
  Copy,
  Plus,
  Trash2,
  Layers,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { uid, formatPower, formatNumber } from "@/lib/utils";
import { useI18n } from "@/components/I18nProvider";
import { computeZoneResult, computeProjectResult } from "@/lib/calculations";

export default function ZonesPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { project, setProject, notFound } = useProject(id);
  const { t } = useI18n();

  const result = React.useMemo(
    () => (project ? computeProjectResult(project) : undefined),
    [project],
  );

  if (notFound) {
    return (
      <AppShell title={t.project.zones}>
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title="Project not found"
          action={
            <Link href="/dashboard">
              <Button>Back to dashboard</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }
  if (!project) {
    return (
      <AppShell title={t.project.zones}>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-12" />
          <Skeleton className="h-64" />
        </div>
      </AppShell>
    );
  }

  function addZoneFromTemplate(templateId: string) {
    const template = ZONE_TEMPLATES.find((tmpl) => tmpl.id === templateId);
    if (!project || !template) return;
    void setProject({ ...project, zones: [...project.zones, template.build()] });
  }

  function duplicateZone(z: Zone) {
    if (!project) return;
    const copy: Zone = {
      ...z,
      id: uid(),
      name: `${z.name} (copy)`,
      envelope: z.envelope.map((e) => ({ ...e, id: uid() })),
    };
    void setProject({ ...project, zones: [...project.zones, copy] });
  }

  function deleteZone(zid: string) {
    if (!project) return;
    if (!confirm("Delete this zone? This action cannot be undone.")) return;
    void setProject({
      ...project,
      zones: project.zones.filter((z) => z.id !== zid),
    });
  }

  return (
    <AppShell title={project.name}>
      <div className="flex flex-col gap-6">
        <ProjectHeader project={project} result={result} />
        <ProjectTabs projectId={project.id} />

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
                  <Layers className="size-4" />
                </span>
                <CardTitle>{t.project.zones}</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {project.zones.length} zone
                {project.zones.length !== 1 ? "s" : ""} · click a zone to edit
                envelope, ventilation and internal gains
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ZONE_TEMPLATES.map((tmpl) => (
                <Button
                  key={tmpl.id}
                  variant={tmpl.id === "blank" ? "default" : "outline"}
                  size="sm"
                  onClick={() => addZoneFromTemplate(tmpl.id)}
                >
                  <Plus className="size-3.5" /> {tmpl.label}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {project.zones.length === 0 ? (
              <EmptyState
                icon={<Layers className="size-6" />}
                title={t.zones.empty}
                description="Pick a template or start from a blank zone. You can add envelope walls, windows, roof, floor, and configure ventilation per zone."
                action={
                  <div className="flex flex-wrap gap-2 justify-center">
                    {ZONE_TEMPLATES.map((tmpl) => (
                      <Button
                        key={tmpl.id}
                        variant={tmpl.id === "blank" ? "default" : "outline"}
                        size="sm"
                        onClick={() => addZoneFromTemplate(tmpl.id)}
                      >
                        <Plus className="size-3.5" /> {tmpl.label}
                      </Button>
                    ))}
                  </div>
                }
              />
            ) : (
              <AnimatedList className="grid gap-3" stagger={0.04}>
                {project.zones.map((z) => {
                  const zr = computeZoneResult(z, project.climate, {
                    safetyMargin: project.safetyMargin,
                  });
                  return (
                    <AnimatedItem key={z.id}>
                      <div className="rounded-lg border bg-background hover:bg-accent/30 transition-colors p-4 flex flex-wrap items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/projects/${project.id}/zones/${z.id}`}
                            className="text-sm font-semibold hover:underline underline-offset-2 inline-flex items-center gap-1.5"
                          >
                            {z.name}
                            <ArrowRight className="size-3.5 text-muted-foreground" />
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatNumber(z.floorArea, 1)} m² ·{" "}
                            {z.envelope.length} envelope element
                            {z.envelope.length !== 1 ? "s" : ""} ·{" "}
                            {z.internalGains.peopleCount} people
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="default" dot>
                            Heat {formatPower(zr.totalHeatingW)}
                          </Badge>
                          <Badge variant="info" dot>
                            Cool {formatPower(zr.totalCoolingW)}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Link href={`/projects/${project.id}/zones/${z.id}`}>
                            <Button size="sm" variant="outline">
                              {t.common.edit}
                            </Button>
                          </Link>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => duplicateZone(z)}
                            title="Duplicate"
                          >
                            <Copy className="size-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => deleteZone(z.id)}
                            title="Delete"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </AnimatedItem>
                  );
                })}
              </AnimatedList>
            )}
          </CardContent>
        </Card>

        {project.zones.length > 0 && (
          <div className="flex justify-end">
            <Link href={`/projects/${project.id}/results`}>
              <Button size="lg">
                View results
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
