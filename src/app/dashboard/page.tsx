"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ProjectCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  AnimatedList,
  AnimatedItem,
} from "@/components/ui/AnimatedSection";
import { Plus, Upload, FolderKanban } from "lucide-react";
import { useProjectsStore } from "@/features/projects/store";
import {
  createEmptyProject,
  duplicateProject,
} from "@/features/projects/factory";
import type { Project } from "@/types";
import { useI18n } from "@/components/I18nProvider";
import { parseProjectJson } from "@/lib/projects/io";

export default function DashboardPage() {
  const router = useRouter();
  const { projects, loaded, upsert, remove } = useProjectsStore();
  const { t } = useI18n();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

  async function newProject() {
    const p = createEmptyProject();
    await upsert(p);
    router.push(`/projects/${p.id}/setup`);
  }

  async function duplicate(p: Project) {
    const copy = duplicateProject(p);
    await upsert(copy);
  }

  async function del(id: string) {
    if (!confirm("Delete this project? This action cannot be undone.")) return;
    await remove(id);
  }

  function onImport(file: File) {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const result = parseProjectJson(String(reader.result));
      if (!result.ok || !result.project) {
        setImportError(result.error ?? "Invalid project file");
        return;
      }
      await upsert(result.project);
    };
    reader.readAsText(file);
  }

  return (
    <AppShell title={t.nav.dashboard}>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Workspace"
          title={t.nav.dashboard}
          description="Manage your HVAC load calculation projects. All data stays local in your browser unless you export or sync."
          actions={
            <>
              <input
                type="file"
                accept="application/json"
                className="hidden"
                ref={fileRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImport(f);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" />
                Import
              </Button>
              <Button onClick={newProject}>
                <Plus className="size-4" />
                {t.nav.newProject}
              </Button>
            </>
          }
        />

        {importError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/8 text-destructive px-4 py-3 text-sm flex items-center justify-between gap-3">
            <span>Could not import: {importError}</span>
            <button
              onClick={() => setImportError(null)}
              className="text-xs underline-offset-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {!loaded ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[230px]" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="size-6" />}
            title="No projects yet"
            description="Create your first HVAC project to start defining zones, envelope and ventilation data, and compute heating & cooling loads."
            action={
              <Button onClick={newProject}>
                <Plus className="size-4" />
                Create project
              </Button>
            }
          />
        ) : (
          <AnimatedList
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            stagger={0.04}
          >
            {projects.map((p) => (
              <AnimatedItem key={p.id}>
                <ProjectCard
                  project={p}
                  onDuplicate={duplicate}
                  onDelete={del}
                />
              </AnimatedItem>
            ))}
          </AnimatedList>
        )}
      </div>
    </AppShell>
  );
}
