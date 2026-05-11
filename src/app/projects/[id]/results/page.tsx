"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProjectTabs } from "@/components/ProjectTabs";
import { ProjectSummaryCards } from "@/components/ProjectSummaryCards";
import { ZoneResultsTable } from "@/components/ZoneResultsTable";
import { ZoneCompareBars, LoadBreakdownPie } from "@/components/LoadBreakdownChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { WarningBanner } from "@/components/WarningBanner";
import { useProject } from "@/features/projects/useProject";
import { computeProjectResult } from "@/lib/calculations";
import { ExportButtons } from "@/components/ExportButtons";
import { useI18n } from "@/components/I18nProvider";

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { project, setProject, notFound } = useProject(id);
  const { t } = useI18n();

  const result = React.useMemo(
    () => (project ? computeProjectResult(project) : null),
    [project],
  );

  const { zoneRows, heatingByZone, coolingByZone } = React.useMemo(() => {
    if (!result) return { zoneRows: [], heatingByZone: [], coolingByZone: [] };
    return {
      zoneRows: result.zones.map((z) => ({
        zone: z.zoneName,
        heating: Math.round(z.totalHeatingW),
        cooling: Math.round(z.totalCoolingW),
      })),
      heatingByZone: result.zones.map((z) => ({
        name: z.zoneName,
        value: Math.round(z.totalHeatingW),
      })),
      coolingByZone: result.zones.map((z) => ({
        name: z.zoneName,
        value: Math.round(z.totalCoolingW),
      })),
    };
  }, [result]);

  if (notFound) {
    return (
      <AppShell title={t.project.results}>
        <div className="text-sm text-muted-foreground">Project not found.</div>
      </AppShell>
    );
  }
  if (!project || !result) {
    return (
      <AppShell title={t.project.results}>
        <div className="text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={project.name}
      actions={
        <ExportButtons
          project={project}
          onImport={(p) => void setProject({ ...p, id: project.id })}
        />
      }
    >
      <div className="flex flex-col gap-6">
        <ProjectTabs projectId={project.id} />
        <WarningBanner warnings={result.warnings} />
        <ProjectSummaryCards result={result} />

        <Card>
          <CardHeader>
            <CardTitle>{t.results.breakdown}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="label mb-2">Heating by zone</p>
              <LoadBreakdownPie data={heatingByZone} />
            </div>
            <div>
              <p className="label mb-2">Cooling by zone</p>
              <LoadBreakdownPie data={coolingByZone} />
            </div>
            <div className="lg:col-span-2">
              <p className="label mb-2">Zone comparison</p>
              <ZoneCompareBars data={zoneRows} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {result.zones.map((z) => (
            <ZoneResultsTable key={z.zoneId} result={z} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
