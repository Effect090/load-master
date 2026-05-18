"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProjectTabs } from "@/components/ProjectTabs";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ReportPreview } from "@/components/ReportPreview";
import { ExportButtons } from "@/components/ExportButtons";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";
import { useProject } from "@/features/projects/useProject";
import { computeProjectResult } from "@/lib/calculations";
import { useI18n } from "@/components/I18nProvider";

export default function ReportPage() {
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
      <AppShell title={t.project.report}>
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
      <AppShell title={t.project.report}>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-12" />
          <Skeleton className="h-96" />
        </div>
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
        <ProjectHeader project={project} result={result} />
        <ProjectTabs projectId={project.id} />
        <ReportPreview project={project} />
      </div>
    </AppShell>
  );
}
