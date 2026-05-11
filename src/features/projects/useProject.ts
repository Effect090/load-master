"use client";

import * as React from "react";
import { useProjectsStore } from "./store";
import type { Project } from "@/types";

export function useProject(id: string | undefined): {
  project: Project | undefined;
  setProject: (p: Project) => Promise<void>;
  loading: boolean;
  notFound: boolean;
} {
  const { projects, loaded, upsert, get } = useProjectsStore();
  const [resolved, setResolved] = React.useState<Project | undefined>(undefined);
  const [resolvedFor, setResolvedFor] = React.useState<string | undefined>();
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    const inMem = projects.find((p) => p.id === id);
    if (inMem) {
      setResolved(inMem);
      setResolvedFor(id);
      setNotFound(false);
      return;
    }
    if (!loaded) return;
    (async () => {
      const p = await get(id);
      if (!p) {
        setNotFound(true);
      } else {
        setResolved(p);
        setResolvedFor(id);
        setNotFound(false);
      }
    })();
  }, [id, loaded, projects, get]);

  const setProject = React.useCallback(
    async (p: Project) => {
      setResolved(p);
      await upsert(p);
    },
    [upsert],
  );

  return {
    project: resolvedFor === id ? resolved : undefined,
    setProject,
    loading: !loaded && !resolved,
    notFound,
  };
}
