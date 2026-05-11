"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectTabs } from "@/components/ProjectTabs";
import { useProject } from "@/features/projects/useProject";
import { useI18n } from "@/components/I18nProvider";
import { ExportButtons } from "@/components/ExportButtons";

export default function ProjectSetupPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { project, setProject, loading, notFound } = useProject(id);
  const { t } = useI18n();
  const [saving, setSaving] = React.useState(false);

  if (notFound) {
    return (
      <AppShell title={t.project.setup}>
        <div className="text-sm text-muted-foreground">Project not found.</div>
      </AppShell>
    );
  }
  if (!project) {
    return (
      <AppShell title={t.project.setup}>
        <div className="text-sm text-muted-foreground">{loading ? "Loading…" : ""}</div>
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
      actions={<ExportButtons project={project} onImport={(p) => void setProject({ ...p, id: project.id })} />}
    >
      <div className="flex flex-col gap-6">
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
