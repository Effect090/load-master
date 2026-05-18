"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectTabs } from "@/components/ProjectTabs";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useProject } from "@/features/projects/useProject";
import { useI18n } from "@/components/I18nProvider";
import { ExportButtons } from "@/components/ExportButtons";
import { computeProjectResult } from "@/lib/calculations";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ProjectSetupPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { project, setProject, loading, notFound } = useProject(id);
  const { t } = useI18n();
  const [saving, setSaving] = React.useState(false);

  const result = React.useMemo(
    () => (project ? computeProjectResult(project) : undefined),
    [project],
  );

  if (notFound) {
    return (
      <AppShell title={t.project.setup}>
        <EmptyState
          icon={<AlertCircle className="size-6" />}
          title="Project not found"
          description="This project may have been deleted or never existed."
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
      <AppShell title={t.project.setup}>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
          <Skeleton className="h-80" />
        </div>
      </AppShell>
    );
  }

  async function save() {
    if (!project) return;
    setSaving(true);
    try {
      await setProject(project);
      router.push(`/projects/${project.id}/zones`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell
      title={project.name || t.project.setup}
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
        <ProjectForm
          project={project}
          onChange={(p) => void setProject(p)}
          onSave={save}
          saving={saving}
        />
      </div>
    </AppShell>
  );
}
