"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useProjectsStore } from "@/features/projects/store";
import { createEmptyProject } from "@/features/projects/factory";

export default function NewProjectPage() {
  const router = useRouter();
  const upsert = useProjectsStore((s) => s.upsert);

  React.useEffect(() => {
    (async () => {
      const p = createEmptyProject();
      await upsert(p);
      router.replace(`/projects/${p.id}/setup`);
    })();
  }, [router, upsert]);

  return (
    <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
      Creating project…
    </div>
  );
}
