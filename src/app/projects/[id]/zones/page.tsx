"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProjectTabs } from "@/components/ProjectTabs";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useProject } from "@/features/projects/useProject";
import { ZONE_TEMPLATES } from "@/features/zones/templates";
import type { Zone } from "@/types";
import { Copy, Plus, Trash2 } from "lucide-react";
import { uid } from "@/lib/utils";
import { useI18n } from "@/components/I18nProvider";
import { computeZoneResult } from "@/lib/calculations";
import { formatPower } from "@/lib/utils";

export default function ZonesPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { project, setProject, notFound } = useProject(id);
  const { t } = useI18n();

  if (notFound) {
    return (
      <AppShell title={t.project.zones}>
        <div className="text-sm text-muted-foreground">Project not found.</div>
      </AppShell>
    );
  }
  if (!project) {
    return (
      <AppShell title={t.project.zones}>
        <div className="text-sm text-muted-foreground">Loading…</div>
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
    if (!confirm("Delete this zone?")) return;
    void setProject({ ...project, zones: project.zones.filter((z) => z.id !== zid) });
  }

  return (
    <AppShell title={project.name}>
      <div className="flex flex-col gap-6">
        <ProjectTabs projectId={project.id} />

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{t.project.zones}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {project.zones.length} zone{project.zones.length !== 1 ? "s" : ""}
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
              <div className="text-sm text-muted-foreground p-6 text-center">
                {t.zones.empty}
              </div>
            ) : (
              <div className="grid gap-3">
                {project.zones.map((z) => {
                  const result = computeZoneResult(z, project.climate, {
                    safetyMargin: project.safetyMargin,
                  });
                  return (
                    <div
                      key={z.id}
                      className="rounded-md border bg-background p-4 flex flex-wrap items-center gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/projects/${project.id}/zones/${z.id}`}
                          className="text-sm font-semibold hover:underline"
                        >
                          {z.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {z.floorArea.toFixed(1)} m² · {z.envelope.length} envelope
                          element{z.envelope.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="default">{formatPower(result.totalHeatingW)}</Badge>
                        <Badge variant="warning">{formatPower(result.totalCoolingW)}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Link href={`/projects/${project.id}/zones/${z.id}`}>
                          <Button size="sm" variant="outline">{t.common.edit}</Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => duplicateZone(z)}
                          title="Duplicate"
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteZone(z.id)}
                          title="Delete"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
