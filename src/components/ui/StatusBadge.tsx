import * as React from "react";
import { Badge } from "./Badge";

export type ProjectStatus =
  | "draft"
  | "calculated"
  | "needs-review"
  | "ready";

const MAP: Record<
  ProjectStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  draft: { label: "Draft", variant: "muted" },
  calculated: { label: "Calculated", variant: "info" },
  "needs-review": { label: "Needs review", variant: "warning" },
  ready: { label: "Ready for export", variant: "success" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const m = MAP[status];
  return (
    <Badge variant={m.variant} dot>
      {m.label}
    </Badge>
  );
}
