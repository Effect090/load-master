"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ProjectCard";
import { Plus, Upload } from "lucide-react";
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
    if (!confirm("Delete this project?")) return;
    await remove(id);
  }

  function onImport(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const result = parseProjectJson(String(reader.result));
      if (!result.ok || !result.project) {
        alert(`Could not import: ${result.error}`);
        return;
      }
      await upsert(result.project);
    };
    reader.readAsText(file);
  }

  return (
    <AppShell
      title={t.nav.dashboard}
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
            <Upload className="size-4" /> Import
          </Button>
          <Button onClick={newProject}>
            <Plus className="size-4" /> {t.nav.newProject}
          </Button>
        </>
      }
    >
      {!loaded ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : projects.length === 0 ? (
        <EmptyState onCreate={newProject} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDuplicate={duplicate}
              onDelete={del}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-lg border bg-card p-10 text-center flex flex-col items-center gap-3">
      <div className="size-10 rounded-md bg-primary/10 text-primary grid place-items-center">
        <Plus className="size-5" />
      </div>
      <h3 className="text-base font-semibold">No projects yet</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Create your first project to start defining zones, envelope and
        ventilation data, and compute heating &amp; cooling loads.
      </p>
      <Button onClick={onCreate} className="mt-2">
        <Plus className="size-4" /> Create project
      </Button>
    </div>
  );
}
