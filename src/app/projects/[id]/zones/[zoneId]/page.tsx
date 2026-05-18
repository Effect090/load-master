"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProjectTabs } from "@/components/ProjectTabs";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ZoneForm } from "@/components/ZoneForm";
import { EnvelopeElementTable } from "@/components/EnvelopeElementTable";
import { ZoneResultsTable } from "@/components/ZoneResultsTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, AlertCircle, Square } from "lucide-react";
import { useProject } from "@/features/projects/useProject";
import {
  computeZoneResult,
  computeProjectResult,
} from "@/lib/calculations";
import type { Zone } from "@/types";
import { useI18n } from "@/components/I18nProvider";

export default function ZoneEditPage() {
  const params = useParams<{ id: string; zoneId: string }>();
  const projectId = params?.id;
  const zoneId = params?.zoneId;
  const { project, setProject, notFound } = useProject(projectId);
  const { t } = useI18n();

  const projectResult = React.useMemo(
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
          <Skeleton className="h-96" />
        </div>
      </AppShell>
    );
  }

  const zone = project.zones.find((z) => z.id === zoneId);
  if (!zone) {
    return (
      <AppShell title={t.project.zones}>
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title="Zone not found"
          action={
            <Link href={`/projects/${project.id}/zones`}>
              <Button>Back to zones</Button>
            </Link>
          }
        />
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
        <ProjectHeader project={project} result={projectResult} />
        <ProjectTabs projectId={project.id} />

        <ZoneForm zone={zone} onChange={update} />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="size-7 rounded-md bg-primary/10 text-primary grid place-items-center">
                <Square className="size-4" />
              </span>
              <CardTitle>{t.zones.envelope}</CardTitle>
            </div>
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
