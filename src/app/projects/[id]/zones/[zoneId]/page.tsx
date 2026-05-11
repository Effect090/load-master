"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProjectTabs } from "@/components/ProjectTabs";
import { ZoneForm } from "@/components/ZoneForm";
import { EnvelopeElementTable } from "@/components/EnvelopeElementTable";
import { ZoneResultsTable } from "@/components/ZoneResultsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useProject } from "@/features/projects/useProject";
import { computeZoneResult } from "@/lib/calculations";
import type { Zone } from "@/types";
import { useI18n } from "@/components/I18nProvider";

export default function ZoneEditPage() {
  const params = useParams<{ id: string; zoneId: string }>();
  const projectId = params?.id;
  const zoneId = params?.zoneId;
  const { project, setProject, notFound } = useProject(projectId);
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

  const zone = project.zones.find((z) => z.id === zoneId);
  if (!zone) {
    return (
      <AppShell title={t.project.zones}>
        <div className="text-sm text-muted-foreground">Zone not found.</div>
      </AppShell>
    );
  }

  function update(z: Zone) {
    if (!project) return;
    void setProject({
      ...project,
      zones: project.zones.map((it) => (it.id === z.id ? z : it)),
    });
  }

  const result = computeZoneResult(zone, project.climate, {
    safetyMargin: project.safetyMargin,
  });

  return (
    <AppShell
      title={`${project.name} · ${zone.name}`}
      actions={
        <Link href={`/projects/${project.id}/zones`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4" /> {t.nav.back}
          </Button>
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        <ProjectTabs projectId={project.id} />

        <ZoneForm zone={zone} onChange={update} />

        <Card>
          <CardHeader>
            <CardTitle>{t.zones.envelope}</CardTitle>
          </CardHeader>
          <CardContent>
            <EnvelopeElementTable
              envelope={zone.envelope}
              onChange={(env) => update({ ...zone, envelope: env })}
            />
          </CardContent>
        </Card>

        <ZoneResultsTable result={result} />
      </div>
    </AppShell>
  );
}
