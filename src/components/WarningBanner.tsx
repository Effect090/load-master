import { AlertTriangle } from "lucide-react";

export function WarningBanner({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 text-foreground p-4">
      <div className="flex items-center gap-2 text-warning">
        <AlertTriangle className="size-4" />
        <p className="text-sm font-semibold">
          {warnings.length} engineering warning{warnings.length > 1 ? "s" : ""}
        </p>
      </div>
      <ul className="mt-2 text-xs text-foreground/80 list-disc pl-5 space-y-1">
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
