"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProjectTabs } from "@/components/ProjectTabs";
import { ReportPreview } from "@/components/ReportPreview";
import { ExportButtons } from "@/components/ExportButtons";
import { useProject } from "@/features/projects/useProject";
import { useI18n } from "@/components/I18nProvider";

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { project, setProject, notFound } = useProject(id);
  const { t } = useI18n();

  if (notFound) {
    return (
      <AppShell title={t.project.report}>
        <div className="text-sm text-muted-foreground">Project not found.</div>
      </AppShell>
    );
  }
  if (!project) {
    return (
      <AppShell title={t.project.report}>
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
        <ReportPreview project={project} />
      </div>
    </AppShell>
  );
}
